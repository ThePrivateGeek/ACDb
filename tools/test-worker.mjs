// Tests for the Cloudflare Worker (worker/acdb-worker.js): request checks,
// the leaderboard rules, rate limits, and that sync, sign-in and profiles
// still work.
//
//   node tools/test-worker.mjs [path/to/worker.js]
//
// Runs the Worker's fetch handler in Node against an in-memory SQLite database
// built from every file in worker/migrations/, in name order, as D1 has them
// (a small stand-in for D1 over node:sqlite, so
// it needs Node 22.13 or later). Nothing is sent anywhere. Each fresh import
// of the Worker stands for a new Worker instance with empty memory.
// Prints "N passed" and exits non-zero on failure.

import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const workerPath = resolve(process.argv[2] || join(ROOT, 'worker', 'acdb-worker.js'));
const migrations = join(ROOT, 'worker', 'migrations');
const schema = readdirSync(migrations).filter(f => f.endsWith('.sql')).sort()
    .map(f => readFileSync(join(migrations, f), 'utf8')).join('\n');
const catalogIds = [...readFileSync(join(ROOT, 'js', 'database.js'), 'utf8').matchAll(/"id":\s*(\d+)/g)].map(m => m[1]);
const dir = mkdtempSync(join(tmpdir(), 'acdb-worker-'));
const modFile = join(dir, 'worker.mjs');
writeFileSync(modFile, readFileSync(workerPath));
let instance = 0;
// A fresh import = a fresh Worker instance (its in-memory state starts empty)
const freshWorker = async () => (await import(pathToFileURL(modFile).href + '?i=' + (++instance))).default;

function makeD1() {
    const db = new DatabaseSync(':memory:');
    db.exec(schema);
    const stats = { writes: 0, statements: 0 };
    const total = () => db.prepare('SELECT total_changes() AS t').get().t;
    function exec(sql, params) {
        const before = total();
        const rows = db.prepare(sql).all(...params).map(r => ({ ...r }));
        const changes = total() - before;
        stats.writes += changes;
        stats.statements++;
        return { results: rows, meta: { changes } };
    }
    const bound = (sql, params) => ({
        _sql: sql, _params: params,
        bind: (...p) => bound(sql, p),
        first: async () => exec(sql, params).results[0] ?? null,
        all: async () => exec(sql, params),
        run: async () => exec(sql, params)
    });
    return {
        db, stats,
        prepare: sql => bound(sql, []),
        batch: async stmts => {
            db.exec('BEGIN');
            try {
                const out = stmts.map(s => exec(s._sql, s._params));
                db.exec('COMMIT');
                return out;
            } catch (e) { db.exec('ROLLBACK'); throw e; }
        }
    };
}

const realNow = Date.now;
let clockOffset = 0;
Date.now = () => realNow() + clockOffset;

let passed = 0, failed = 0;
const failures = [];
function check(name, ok, detail = '') {
    if (ok) passed++;
    else { failed++; failures.push(name + (detail ? ` -- ${detail}` : '')); }
}

const API = 'https://api.acdb.workers.dev';
function req(path, { method = 'GET', body, type = 'application/json', headers = {}, ip = '1.1.1.1', raw } = {}) {
    const h = { Origin: 'https://acdb.theprivategeek.com', 'CF-Connecting-IP': ip, ...headers };
    if ((body !== undefined || raw !== undefined) && type) h['Content-Type'] = type;
    const init = { method, headers: h };
    if (raw !== undefined) { init.body = raw; init.duplex = 'half'; }
    else if (body !== undefined) init.body = typeof body === 'string' ? body : JSON.stringify(body);
    return new Request(API + path, init);
}
async function call(worker, env, r) {
    const res = await worker.fetch(r, env);
    let data = null;
    const text = await res.text();
    try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, data, headers: res.headers };
}
const sha = t => createHash('sha256').update(t).digest('hex');
function addSession(env, sub, token) {
    const now = Date.now();
    env.DB.db.prepare('INSERT INTO users (sub, email, created_at, last_seen_at) VALUES (?, ?, ?, ?)').run(sub, sub + '@x.test', now, now);
    env.DB.db.prepare('INSERT INTO sessions (token_hash, sub, created_at, expires_at) VALUES (?, ?, ?, ?)').run(sha(token), sub, now, now + 1e10);
}
const profileRow = (env, name) => env.DB.db.prepare('SELECT * FROM profiles WHERE name_lower = ?').get(name.toLowerCase());
const count = (env, sql) => env.DB.db.prepare(sql).get().n;
const change = (id, data, updatedAt = Date.now()) => ({ id, data: { owned: true, ...data }, updatedAt });

// ---------------------------------------------------------------- headers
{
    const w = await freshWorker(); const env = { DB: makeD1() };
    for (const [label, r] of [['GET leaderboard', req('/leaderboard')], ['OPTIONS', req('/share', { method: 'OPTIONS' })], ['404', req('/nope')]]) {
        const res = await call(w, env, r);
        check(`version header on ${label}`, /^\d{4}-\d{2}-\d{2}/.test(res.headers.get('ACDb-Worker') || ''), res.headers.get('ACDb-Worker'));
    }
    const pre = await call(w, env, req('/share', { method: 'OPTIONS', headers: { Origin: 'https://evil.example' } }));
    check('preflight from another site is not approved for it', pre.headers.get('Access-Control-Allow-Origin') !== 'https://evil.example');
}

// ---------------------------------------------------------------- content type and size
{
    const w = await freshWorker(); const env = { DB: makeD1() };
    const good = { displayName: 'Collector1', ownedItems: ['1', '2'] };
    let r = await call(w, env, req('/share', { method: 'POST', body: good, type: 'text/plain' }));
    check('text/plain POST /share is refused (415)', r.status === 415, `${r.status} ${JSON.stringify(r.data)}`);
    r = await call(w, env, req('/share', { method: 'POST', body: good, type: null }));
    check('POST /share without a Content-Type is refused (415)', r.status === 415, `${r.status}`);
    check('refused requests created no profile', count(env, 'SELECT COUNT(*) n FROM profiles') === 0);
    check('refused requests wrote no rate-limit row', count(env, 'SELECT COUNT(*) n FROM rate_limits') === 0);
    check('refused request answers with CORS headers', r.headers.get('Access-Control-Allow-Origin') === 'https://acdb.theprivategeek.com');
    r = await call(w, env, req('/share', { method: 'POST', body: good, type: 'application/json; charset=utf-8' }));
    check('application/json with charset is accepted', r.status === 200 && r.data.success, `${r.status} ${JSON.stringify(r.data)}`);

    r = await call(w, env, req('/share', { method: 'POST', body: { displayName: 'Collector2', ownedItems: ['1'], pad: 'x'.repeat(70 * 1024) } }));
    check('70 KB body to /share is refused (413)', r.status === 413, `${r.status}`);
    const big = new TextEncoder().encode(JSON.stringify({ displayName: 'Collector3', ownedItems: ['1'], pad: 'x'.repeat(200 * 1024) }));
    const stream = new ReadableStream({ start(c) { for (let i = 0; i < big.length; i += 16384) c.enqueue(big.slice(i, i + 16384)); c.close(); } });
    r = await call(w, env, req('/share', { method: 'POST', raw: stream }));
    check('streamed (no length) 200 KB body is refused (413)', r.status === 413, `${r.status}`);
    check('oversized bodies created no profile', !profileRow(env, 'Collector2') && !profileRow(env, 'Collector3'));
    r = await call(w, env, req('/share', { method: 'POST', body: '{not json' }));
    check('malformed JSON is 400', r.status === 400, `${r.status}`);

    // Largest realistic push: 200 changes with 5000-character notes, ASCII and accented
    addSession(env, 'sub-big', 'tok-big');
    for (const ch of ['a', 'é', '\u0001']) {
        const changes = Array.from({ length: 200 }, (_, i) => change(i + 1, { notes: ch.repeat(5000), pricePaid: ch.repeat(20) }));
        const body = JSON.stringify({ changes });
        r = await call(w, env, req('/collection', { method: 'PUT', body, headers: { Authorization: 'Bearer tok-big' } }));
        check(`push of 200 changes with 5000x${JSON.stringify(ch)} notes (${(Buffer.byteLength(body) / 1e6).toFixed(2)} MB) is accepted`, r.status === 200, `${r.status} ${JSON.stringify(r.data).slice(0, 80)}`);
    }
}

// ---------------------------------------------------------------- owned items: duplicates, ceiling, format
{
    const w = await freshWorker(); const env = { DB: makeD1() };
    let ip = 0;
    const share = (name, ownedItems) => call(w, env, req('/share', { method: 'POST', body: { displayName: name, ownedItems }, ip: '10.0.0.' + (++ip) }));
    let r = await share('Dupes_User', ['1', '1', '2', '2', '3', '3', '3']);
    let row = profileRow(env, 'Dupes_User');
    check('duplicates are counted once', r.status === 200 && row && row.owned_count === 3, row && row.owned_count);
    check('duplicates are stored once', row && row.owned_items === '["1","2","3"]', row && row.owned_items);

    r = await share('Spammer01', Array.from({ length: 2000 }, () => '5'));
    row = profileRow(env, 'Spammer01');
    check('2000 copies of one id count as 1', row && row.owned_count === 1, row && row.owned_count);

    r = await share('Ceiling_User', ['1', '799', '800', '801', '99999', '100000']);
    row = profileRow(env, 'Ceiling_User');
    check('ids above the catalog ceiling are stored but not counted', row && row.owned_count === 3 && JSON.parse(row.owned_items).length === 6, row && `${row.owned_count} ${row.owned_items}`);

    r = await share('Complete1', catalogIds);
    row = profileRow(env, 'Complete1');
    check(`a full real collection (${catalogIds.length} ids) counts in full`, row && row.owned_count === catalogIds.length, row && row.owned_count);

    const bad = [['an item name', ['Altair Statue']], ['"0"', ['0']], ['"01"', ['01']], ['"-1"', ['-1']], ['"1.0"', ['1.0']], ['" 1"', [' 1']],
        ['"100001"', ['100001']], ['a number', [5]], ['null', [null]], ['empty string', ['']], ['not an array', '1,2'], ['2001 entries', Array.from({ length: 2001 }, (_, i) => String(i + 1))]];
    for (const [label, items] of bad) {
        const name = 'Bad_' + label.replace(/[^a-z0-9]/gi, '').slice(0, 15).padEnd(5, 'x');
        r = await share(name, items);
        check(`ownedItems with ${label} is 400`, r.status === 400 && !profileRow(env, name), `${r.status} ${JSON.stringify(r.data)}`);
    }

    // /update
    const token = (await share('Updater1', ['1'])).data.token;
    r = await call(w, env, req('/update', { method: 'PUT', body: { ownedItems: ['4', '4', '5', '900'] }, headers: { Authorization: token }, ip: '10.1.0.1' }));
    row = profileRow(env, 'Updater1');
    check('/update counts duplicates once and skips ids above the ceiling', r.status === 200 && r.data.ownedCount === 2 && row.owned_count === 2 && row.owned_items === '["4","5","900"]', `${r.status} ${JSON.stringify(r.data)} ${row.owned_items}`);
    r = await call(w, env, req('/update', { method: 'PUT', body: { ownedItems: ['x'] }, headers: { Authorization: token }, ip: '10.1.0.1' }));
    check('/update with junk is 400', r.status === 400);
    r = await call(w, env, req('/update', { method: 'PUT', body: { ownedItems: ['1'] }, headers: { Authorization: 'nope' }, ip: '10.1.0.1' }));
    check('/update with an unknown token is 404', r.status === 404);
    r = await call(w, env, req('/update', { method: 'PUT', body: { ownedItems: ['1'] }, type: 'text/plain', headers: { Authorization: token }, ip: '10.1.0.1' }));
    check('/update as text/plain is 415', r.status === 415);
}

// ---------------------------------------------------------------- write rate limit
{
    const env = { DB: makeD1() };
    let w = await freshWorker();
    const share = (worker, n, ip = '9.9.9.9') => call(worker, env, req('/share', { method: 'POST', body: { displayName: 'RateUser' + String(n).padStart(3, '0'), ownedItems: ['1'] }, ip }));
    for (let i = 1; i <= 9; i++) await share(w, i);
    for (let i = 0; i < 5; i++) await call(w, env, req('/share', { method: 'POST', body: { displayName: 'x', ownedItems: ['1'] }, ip: '9.9.9.9' }));
    let r = await share(w, 10);
    check('invalid requests do not use up the rate limit (10th valid one succeeds)', r.status === 200, `${r.status}`);
    r = await share(w, 11);
    check('11th write in the hour is 429', r.status === 429, `${r.status}`);
    const before = { ...env.DB.stats };
    for (let i = 12; i <= 30; i++) await share(w, i);
    check('further over-limit requests on the same instance send no D1 query', env.DB.stats.statements === before.statements, `${env.DB.stats.statements - before.statements} statements`);
    check('D1 count stays at the limit', count(env, "SELECT count n FROM rate_limits WHERE key = 'write:9.9.9.9'") === 10);
    w = await freshWorker();
    const b2 = { ...env.DB.stats };
    r = await share(w, 31);
    check('a new instance asks D1 once, gets 429 and writes nothing', r.status === 429 && env.DB.stats.writes === b2.writes && env.DB.stats.statements === b2.statements + 1, `${r.status} writes+${env.DB.stats.writes - b2.writes} stmts+${env.DB.stats.statements - b2.statements}`);
    r = await share(w, 32, '9.9.9.8');
    check('another IP is not affected', r.status === 200);
    clockOffset += 3600 * 1000;
    r = await share(w, 33);
    check('the next hour is allowed again', r.status === 200, `${r.status}`);
    clockOffset = 0;
}

// ---------------------------------------------------------------- read limit
{
    const env = { DB: makeD1() };
    const w = await freshWorker();
    const writes = env.DB.stats.writes;
    let lastOk = 0, firstBlocked = 0;
    for (let i = 1; i <= 605; i++) {
        const r = await call(w, env, req(i % 2 ? '/check-name/someone' : '/profile/someone', { ip: '7.7.7.7' }));
        if (r.status !== 429) lastOk = i; else if (!firstBlocked) firstBlocked = i;
    }
    check('reads are limited to 600 per IP per hour', lastOk === 600 && firstBlocked === 601, `lastOk ${lastOk} firstBlocked ${firstBlocked}`);
    check('the read limit writes nothing to D1', env.DB.stats.writes === writes);
    let r = await call(w, env, req('/check-name/someone', { ip: '7.7.7.6' }));
    check('another IP can still read', r.status === 200 && r.data.available === true);
    r = await call(w, env, req('/leaderboard', { ip: '7.7.7.7' }));
    check('the leaderboard is not read-limited', r.status === 200);
}

// ---------------------------------------------------------------- leaderboard
{
    const env = { DB: makeD1() };
    const w = await freshWorker();
    const ins = env.DB.db.prepare('INSERT INTO profiles (name_lower, display_name, legacy_token_hash, owned_items, owned_count, last_updated) VALUES (?, ?, ?, ?, ?, ?)');
    for (let i = 0; i < 130; i++) ins.run(`user${String(i).padStart(3, '0')}`, `User${String(i).padStart(3, '0')}`, 'h' + i, '[]', i % 50, Date.now());
    let r = await call(w, env, req('/leaderboard'));
    const p = r.data.profiles || [];
    const sorted = p.every((x, i) => i === 0 || p[i - 1].ownedCount > x.ownedCount || (p[i - 1].ownedCount === x.ownedCount && p[i - 1].displayName.toLowerCase() < x.displayName.toLowerCase()));
    check('leaderboard returns the top 100, by count then name', p.length === 100 && sorted && p[0].ownedCount === 49, `${p.length} sorted=${sorted}`);
    check('leaderboard keeps its browser cache header', r.headers.get('Cache-Control') === 'public, max-age=60');
    let s = env.DB.stats.statements;
    r = await call(w, env, req('/leaderboard'));
    check('a second view within a minute does not query D1', env.DB.stats.statements === s && r.data.profiles.length === 100);
    r = await call(w, env, req('/share', { method: 'POST', body: { displayName: 'NewTop_1', ownedItems: catalogIds.slice(0, 60) } }));
    r = await call(w, env, req('/leaderboard'));
    check('publishing a profile refreshes this instance\'s leaderboard', r.data.profiles[0].displayName === 'NewTop_1', r.data.profiles[0].displayName);
    s = env.DB.stats.statements;
    clockOffset += 61 * 1000;
    r = await call(w, env, req('/leaderboard'));
    check('after a minute the leaderboard is read again', env.DB.stats.statements === s + 1);
    clockOffset = 0;
}

// ---------------------------------------------------------------- linked profiles and sync
{
    const env = { DB: makeD1() };
    const w = await freshWorker();
    addSession(env, 'sub-a', 'tok-a');
    const auth = { Authorization: 'Bearer tok-a' };
    let r = await call(w, env, req('/collection', { method: 'PUT', body: { changes: [change(1), change(2), change(3), change(801), change(99999)] }, headers: auth }));
    check('sync still accepts ids above the catalog ceiling (nothing gets stuck)', r.status === 200, `${r.status} ${JSON.stringify(r.data)}`);
    r = await call(w, env, req('/share', { method: 'POST', body: { displayName: 'LinkedOne' }, headers: auth }));
    let row = profileRow(env, 'LinkedOne');
    check('linked profile counts only catalog ids', r.status === 200 && row && row.sub === 'sub-a' && row.owned_count === 3, row && row.owned_count);
    await call(w, env, req('/leaderboard'));
    r = await call(w, env, req('/collection', { method: 'PUT', body: { changes: [change(4)] }, headers: auth }));
    row = profileRow(env, 'LinkedOne');
    r = await call(w, env, req('/leaderboard'));
    check('a push updates the count and this instance\'s leaderboard', row.owned_count === 4 && r.data.profiles[0].ownedCount === 4, `${row.owned_count} ${JSON.stringify(r.data.profiles[0])}`);
    r = await call(w, env, req('/profile/linkedone'));
    check('linked profile page loads', r.status === 200 && r.data.ownedCount === 4 && r.data.ownedItems.includes('1'));
    r = await call(w, env, req('/collection?since=0', { headers: auth }));
    check('GET /collection returns the synced rows', r.status === 200 && r.data.items.length === 6 && r.data.full === true);
    r = await call(w, env, req('/collection', { method: 'PUT', body: { changes: [change(5)] }, type: 'text/plain', headers: auth }));
    check('push as text/plain is 415', r.status === 415);
    r = await call(w, env, req('/collection', { method: 'PUT', body: { changes: [{ id: 0, data: {}, updatedAt: 1 }] }, headers: auth }));
    check('push with an invalid change is still 400', r.status === 400);

    // claim a token profile
    addSession(env, 'sub-b', 'tok-b');
    await call(w, env, req('/collection', { method: 'PUT', body: { changes: [change(10), change(11), change(950)] }, headers: { Authorization: 'Bearer tok-b' } }));
    const legacy = (await call(w, env, req('/share', { method: 'POST', body: { displayName: 'ClaimMe1', ownedItems: ['1', '2', '3', '4', '5'] }, ip: '5.5.5.5' }))).data.token;
    r = await call(w, env, req('/profile/claim', { method: 'POST', body: { legacyToken: legacy }, headers: { Authorization: 'Bearer tok-b' } }));
    row = profileRow(env, 'ClaimMe1');
    check('claiming a profile recounts from the collection, catalog ids only', r.status === 200 && row.sub === 'sub-b' && row.owned_count === 2 && row.owned_items === null, row && row.owned_count);

    r = await call(w, env, req('/me', { headers: auth }));
    check('/me works', r.status === 200 && r.data.account.id === 'sub-a' && r.data.share.displayName === 'LinkedOne');
    r = await call(w, env, req('/account/export', { headers: auth }));
    check('/account/export works', r.status === 200 && r.data.items.length === 6 && r.data.profile.displayName === 'LinkedOne');
    r = await call(w, env, req('/profile', { method: 'DELETE', headers: auth }));
    r = await call(w, env, req('/leaderboard'));
    check('deleting a linked profile refreshes this instance\'s leaderboard', !r.data.profiles.some(x => x.displayName === 'LinkedOne'));
    r = await call(w, env, req('/auth/logout', { method: 'POST', headers: auth }));
    check('logout without a body works', r.status === 200 && count(env, "SELECT COUNT(*) n FROM sessions WHERE sub = 'sub-a'") === 0);
    r = await call(w, env, req('/account', { method: 'DELETE', headers: { Authorization: 'Bearer tok-b' } }));
    check('account delete works', r.status === 200 && count(env, "SELECT COUNT(*) n FROM users WHERE sub = 'sub-b'") === 0 && !profileRow(env, 'ClaimMe1'));

    // token profile delete
    const t2 = (await call(w, env, req('/share', { method: 'POST', body: { displayName: 'DeleteMe1', ownedItems: ['1'] }, ip: '5.5.5.6' }))).data.token;
    r = await call(w, env, req('/profile', { method: 'DELETE', headers: { Authorization: t2 } }));
    check('token profile delete works', r.status === 200 && !profileRow(env, 'DeleteMe1'));
}

// ---------------------------------------------------------------- played games
{
    const env = { DB: makeD1() };
    const w = await freshWorker();
    addSession(env, 'sub-g', 'tok-g');
    const auth = { Authorization: 'Bearer tok-g' };
    const put = body => call(w, env, req('/collection', { method: 'PUT', body, headers: auth }));
    const get = query => call(w, env, req('/collection' + query, { headers: auth }));
    const game = (id, data, updatedAt = Date.now()) => ({ id, data: { played: true, ...data }, updatedAt });
    const gameRow = id => env.DB.db.prepare("SELECT * FROM game_progress WHERE sub = 'sub-g' AND game_id = ?").get(id);
    const seqOf = () => env.DB.db.prepare("SELECT seq FROM users WHERE sub = 'sub-g'").get().seq;

    let r = await get('?since=0&gamesSince=0');
    check('a new account pulls an empty games list', r.status === 200 && Array.isArray(r.data.games) && r.data.games.length === 0, JSON.stringify(r.data));
    const before = seqOf();
    r = await put({ changes: [], games: [game(5, { playedDate: '2026-11-04' }, 1000), game(7, {}, 1000)] });
    check('a games-only push is saved and says so', r.status === 200 && r.data.gamesSaved === true && seqOf() === before + 1, `${r.status} ${JSON.stringify(r.data)}`);
    let row = gameRow(5);
    check('the game row holds its data and stamp', row && JSON.parse(row.data).played === true && JSON.parse(row.data).playedDate === '2026-11-04' && row.updated_at === 1000 && row.seq === before + 1, JSON.stringify(row));
    check('games never land in items', count(env, "SELECT COUNT(*) n FROM items WHERE sub = 'sub-g'") === 0);

    r = await get('?since=0&gamesSince=0');
    check('a pull with gamesSince returns the games', r.data.games.length === 2 && r.data.games.some(g => g.id === 5 && g.data.played && g.updatedAt === 1000), JSON.stringify(r.data.games));
    r = await get('?since=0');
    check('a pull without gamesSince has no games key (old pages)', r.status === 200 && !('games' in r.data));
    r = await get(`?since=${seqOf()}&gamesSince=${seqOf()}`);
    check('a pull at the current cursor returns no games', r.data.games.length === 0);
    r = await get(`?since=${seqOf()}&gamesSince=0`);
    check('the games cursor is separate from the item cursor', r.data.items.length === 0 && r.data.games.length === 2);
    r = await get('?since=0&gamesSince=99999');
    check('a games cursor past the account resets to 0', r.data.games.length === 2);

    r = await put({ changes: [], games: [game(5, { played: false }, 900)] });
    check('an older game edit does not overwrite a newer one', r.status === 200 && JSON.parse(gameRow(5).data).played === true);
    r = await put({ changes: [], games: [game(5, { played: false }, 2000)] });
    check('a newer game edit wins', JSON.parse(gameRow(5).data).played === false && gameRow(5).updated_at === 2000);
    r = await put({ changes: [], games: [{ id: 9, data: { played: 'yes', playedDate: '4 Nov', junk: '<b>' }, updatedAt: 3000 }] });
    check('game fields are sanitized', r.status === 200 && gameRow(9).data === '{"played":false,"playedDate":""}', gameRow(9) && gameRow(9).data);
    r = await put({ changes: [], games: [game(11, {}, 10), game(11, { played: false }, 20)] });
    check('the newest of two edits to one game in a push wins', JSON.parse(gameRow(11).data).played === false);

    const rows = count(env, 'SELECT COUNT(*) n FROM game_progress');
    const bad = [['id 0', [game(0)]], ['id 1001', [game(1001)]], ['a fractional id', [game(1.5)]], ['a string id', [{ ...game(1), id: '1' }]],
        ['an array as data', [{ id: 1, data: [], updatedAt: 1 }]], ['no updatedAt', [{ id: 1, data: {} }]], ['201 entries', Array.from({ length: 201 }, (_, i) => game(i + 1))]];
    for (const [label, games] of bad) {
        r = await put({ changes: [], games });
        check(`a game push with ${label} is 400`, r.status === 400, `${r.status}`);
    }
    r = await put({ changes: [], games: 'all' });
    check('games that are not an array is 400', r.status === 400);
    r = await put({ changes: [change(1)], games: [game(0)] });
    check('a bad game entry rejects the whole push, items too', r.status === 400 && count(env, "SELECT COUNT(*) n FROM items WHERE sub = 'sub-g'") === 0);
    check('rejected pushes wrote no game rows', count(env, 'SELECT COUNT(*) n FROM game_progress') === rows);
    r = await put({ changes: [], games: [game(1000)] });
    check('id 1000 (MAX_GAME_ID) is accepted', r.status === 200 && gameRow(1000));

    r = await put({ changes: [change(3)], games: [game(12)] });
    const itemSeq = env.DB.db.prepare("SELECT seq FROM items WHERE sub = 'sub-g' AND item_id = 3").get().seq;
    check('a push with items and games stores both under one seq', r.status === 200 && r.data.gamesSaved && itemSeq === gameRow(12).seq, `${itemSeq} ${gameRow(12).seq}`);
    r = await put({ changes: [change(4)] });
    check('a push without games does not claim gamesSaved', r.status === 200 && !('gamesSaved' in r.data));

    // A linked profile follows items only
    await call(w, env, req('/share', { method: 'POST', body: { displayName: 'GamerOne' }, headers: auth }));
    env.DB.db.prepare("UPDATE profiles SET last_updated = 1 WHERE name_lower = 'gamerone'").run();
    await put({ changes: [], games: [game(13)] });
    check('a games-only push leaves the profile\'s update date alone', profileRow(env, 'GamerOne').last_updated === 1);
    await put({ changes: [change(5)] });
    check('an item push still updates the profile', profileRow(env, 'GamerOne').last_updated > 1 && profileRow(env, 'GamerOne').owned_count === 3, JSON.stringify(profileRow(env, 'GamerOne')));

    r = await call(w, env, req('/account/export', { headers: auth }));
    const exported = r.data.games || [];
    check('/account/export lists the games', r.status === 200 && exported.length === count(env, "SELECT COUNT(*) n FROM game_progress WHERE sub = 'sub-g'")
        && exported.some(g => g.id === 9 && g.played === false && g.playedDate === '' && /^\d{4}-/.test(g.updatedAt)), JSON.stringify(exported.slice(0, 3)));

    r = await call(w, env, req('/account', { method: 'DELETE', headers: auth }));
    check('account delete removes the game rows', r.status === 200 && count(env, "SELECT COUNT(*) n FROM game_progress WHERE sub = 'sub-g'") === 0);
}

// ---------------------------------------------------------------- sign-in
{
    const env = { DB: makeD1() };
    const w = await freshWorker();
    let r = await call(w, env, req('/auth/google', { method: 'POST', body: {} }));
    check('/auth/google without config is 503', r.status === 503);
    env.GOOGLE_CLIENT_ID = 'id'; env.GOOGLE_CLIENT_SECRET = 'secret';
    r = await call(w, env, req('/auth/google', { method: 'POST', body: {} }));
    check('/auth/google with an invalid request is 400 and writes no rate-limit row', r.status === 400 && count(env, 'SELECT COUNT(*) n FROM rate_limits') === 0, `${r.status}`);
    r = await call(w, env, req('/auth/google', { method: 'POST', body: {}, type: 'text/plain' }));
    check('/auth/google as text/plain is 415', r.status === 415);
}

rmSync(dir, { recursive: true, force: true });
for (const f of failures) console.log('FAIL ' + f);
console.log(failed ? `${passed} passed, ${failed} failed` : `${passed} passed`);
process.exit(failed ? 1 : 0);
