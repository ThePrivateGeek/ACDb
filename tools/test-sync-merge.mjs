// Tests for the cloud-sync merge rules in js/sync.js (the part most likely to
// lose collection data if it goes wrong).
//
//   node tools/test-sync-merge.mjs
//
// Loads js/sync.js into a sandbox with a stub window/localStorage/document and
// exercises ACDB.syncInternals. Prints "N passed" and exits non-zero on failure.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const source = readFileSync(fileURLToPath(new URL('../js/sync.js', import.meta.url)), 'utf8');
const storage = new Map();
const sandbox = {
    localStorage: {
        getItem: k => (storage.has(k) ? storage.get(k) : null),
        setItem: (k, v) => storage.set(k, String(v)),
        removeItem: k => storage.delete(k),
    },
    document: { addEventListener() {} },
    navigator: { onLine: true },
    console,
};
sandbox.window = sandbox;
sandbox.window.addEventListener = () => {};
vm.createContext(sandbox);
vm.runInContext(source, sandbox);
const S = sandbox.ACDB.syncInternals;

let passed = 0;
let failed = 0;
function check(condition, label, detail) {
    if (condition) passed++;
    else {
        failed++;
        console.log('FAIL:', label, detail === undefined ? '' : JSON.stringify(detail));
    }
}

const NOW = 1_800_000_000_000;
const owned = (updatedAt, extra = {}) => ({ owned: true, wishlist: false, hasBox: false, condition: '', copies: 1, pricePaid: '', acquiredDate: '', notes: '', ...extra, ...(updatedAt === undefined ? {} : { updatedAt }) });
const blank = (updatedAt) => ({ owned: false, wishlist: false, hasBox: false, condition: '', copies: 0, pricePaid: '', acquiredDate: '', notes: '', ...(updatedAt === undefined ? {} : { updatedAt }) });
const remote = (id, data, updatedAt) => ({ id, data: S.normalize(data), updatedAt });

// ---- normalize / sameData / isEmpty ----
check(S.sameData({ owned: true, copies: '1' }, { owned: true, copies: 1 }), 'sameData coerces copies');
check(S.sameData({ pricePaid: 12.5 }, { pricePaid: '12.5' }), 'sameData coerces price');
check(!S.sameData(owned(), blank()), 'sameData detects difference');
check(S.sameData(owned(5), owned(9)), 'sameData ignores updatedAt');
check(S.isEmpty(blank()) && S.isEmpty({}) && !S.isEmpty({ wishlist: true }), 'isEmpty');
check(!S.sameData(blank(), { ...blank(), hasRead: true }), 'sameData detects read status');
check(!S.sameData({ hasRead: true }, { hasRead: true, readDate: '2026-10-06' }), 'sameData detects read date');
check(!S.isEmpty({ hasRead: true }), 'read-only item is not empty');
{
    const n = S.normalize({ hasRead: 1, readDate: '2026-10-06' });
    check(n.hasRead === true && n.readDate === '2026-10-06', 'normalize keeps read fields', n);
}
{
    // Values the Worker would refuse become blank, so markup from a crafted
    // backup file never reaches storage.
    const n = S.normalize({ condition: '<img src=x onerror=alert(1)>', copies: '-3', pricePaid: '1'.repeat(21), acquiredDate: 'yesterday', notes: 42, readDate: '2026-1-6' });
    check(n.condition === '' && n.copies === 0 && n.pricePaid === '' && n.acquiredDate === '' && n.notes === '' && n.readDate === '', 'normalize blanks invalid values', n);
    check(S.normalize({ condition: 'Mint' }).condition === '' && S.normalize({ condition: 'near-mint' }).condition === 'near-mint', 'normalize keeps only known conditions');
    check(S.normalize({ copies: 5000 }).copies === 999 && S.normalize({ copies: '2' }).copies === 2, 'normalize clamps copies');
    check(S.normalize({ notes: 'x'.repeat(6000) }).notes.length === 5000, 'normalize trims long notes');
}
{
    // normalize's output must pass the Worker's sanitizeItemData unchanged,
    // or a device keeps values its other devices never get.
    const workerSource = readFileSync(fileURLToPath(new URL('../worker/acdb-worker.js', import.meta.url)), 'utf8');
    const rules = workerSource.match(/const MAX_NOTES_LENGTH[\s\S]*?\nfunction sanitizeItemData[\s\S]*?\n}\r?\n/);
    check(rules, 'found sanitizeItemData in the Worker');
    if (rules) {
        const sanitize = vm.runInNewContext(rules[0] + '; sanitizeItemData');
        const samples = [
            {}, owned(1), { ...owned(1), condition: 'mint', copies: 3, pricePaid: '19.99', acquiredDate: '2026-01-02', notes: 'Signed', hasRead: true, readDate: '2026-02-03' },
            { owned: 'yes', copies: '7', pricePaid: 12.5, condition: 'MINT', notes: 'y'.repeat(9000), acquiredDate: '2026-13-01x' },
            { copies: 2.7, pricePaid: null, hasBox: 1, readDate: 20260101 },
        ];
        samples.forEach((sample, i) => {
            const n = S.normalize(sample);
            check(JSON.stringify(sanitize(n)) === JSON.stringify(n), `Worker keeps normalized sample ${i}`, { n, worker: sanitize(n) });
        });
    }
}
{
    // Read but not owned (e.g. read on the Internet Archive) still syncs up.
    const r = S.mergeFirstSync({ 9: { ...blank(50), hasRead: true } }, [], 'newest', NOW);
    check(r.toPush.includes('9') && r.merged[9].hasRead, 'read-only device item pushed', r.merged[9]);
}

// ---- mergeFirstSync ----
{
    const r = S.mergeFirstSync({ 1: owned(100) }, [], 'newest', NOW);
    check(r.toPush.includes('1') && r.merged[1].owned, 'device-only item kept and pushed', r);
}
{
    const r = S.mergeFirstSync({ 1: owned() }, [], 'newest', NOW);
    check(r.merged[1].updatedAt === S.LEGACY_STAMP && r.toPush.includes('1'), 'untimestamped device-only item pushed with the legacy stamp', r.merged[1]);
}
{
    const r = S.mergeFirstSync({ 1: blank(50) }, [], 'newest', NOW);
    check(!r.toPush.includes('1'), 'empty device-only item not pushed', r);
}
{
    const r = S.mergeFirstSync({}, [remote(2, owned(), 100)], 'newest', NOW);
    check(r.merged[2].owned && r.toPush.length === 0, 'account-only item kept, not pushed', r);
}
{
    const r = S.mergeFirstSync({ 3: owned(200, { notes: 'device' }) }, [remote(3, owned(0, { notes: 'account' }), 100)], 'newest', NOW);
    check(r.merged[3].notes === 'device' && r.toPush.includes('3') && r.merged[3].updatedAt === 200, 'newest: newer device edit wins', r.merged[3]);
}
{
    const r = S.mergeFirstSync({ 3: owned(100, { notes: 'device' }) }, [remote(3, owned(0, { notes: 'account' }), 200)], 'newest', NOW);
    check(r.merged[3].notes === 'account' && !r.toPush.includes('3'), 'newest: newer account edit wins', r.merged[3]);
}
{
    // Both from before sync existed: tie → the side that owns it wins.
    const r = S.mergeFirstSync({ 4: owned() }, [remote(4, blank(), S.LEGACY_STAMP)], 'newest', NOW);
    check(r.merged[4].owned && r.toPush.includes('4') && r.merged[4].updatedAt > S.LEGACY_STAMP, 'newest tie: owned device copy wins and is restamped to beat the server', r.merged[4]);
}
{
    const r = S.mergeFirstSync({ 4: blank() }, [remote(4, owned(), S.LEGACY_STAMP)], 'newest', NOW);
    check(r.merged[4].owned && !r.toPush.includes('4'), 'newest tie: owned account copy wins', r.merged[4]);
}
{
    const r = S.mergeFirstSync({ 4: owned(undefined, { notes: 'a' }) }, [remote(4, owned(0, { notes: 'b' }), S.LEGACY_STAMP)], 'newest', NOW);
    check(r.merged[4].notes === 'b', 'newest tie, both owned: account wins', r.merged[4]);
}
{
    const r = S.mergeFirstSync({ 5: owned(100, { notes: 'device' }) }, [remote(5, owned(0, { notes: 'account' }), 900)], 'device', NOW);
    check(r.merged[5].notes === 'device' && r.toPush.includes('5') && r.merged[5].updatedAt === NOW, 'device: device wins, restamped to now', r.merged[5]);
}
{
    const r = S.mergeFirstSync({ 5: owned(NOW + 50, { notes: 'device' }) }, [remote(5, owned(0, { notes: 'account' }), NOW + 100)], 'device', NOW);
    check(r.merged[5].updatedAt === NOW + 101, 'device: restamp beats an account stamp later than now', r.merged[5]);
}
{
    const r = S.mergeFirstSync({ 5: owned(900, { notes: 'device' }) }, [remote(5, owned(0, { notes: 'account' }), 100)], 'account', NOW);
    check(r.merged[5].notes === 'account' && !r.toPush.includes('5'), 'account: account wins even when older', r.merged[5]);
}
{
    const r = S.mergeFirstSync({ 6: owned(100) }, [remote(6, owned(), 50)], 'newest', NOW);
    check(r.toPush.length === 0 && r.stats.conflicts === 0, 'identical data: no conflict, not pushed', r);
}
{
    const local = { 1: owned(10), 2: owned(10, { notes: 'x' }), 3: blank(10) };
    const items = [remote(2, owned(), 20), remote(4, owned(), 20)];
    const r = S.mergeFirstSync(local, items, 'newest', NOW);
    check(Object.keys(r.merged).sort().join() === '1,2,3,4', 'merged has the union of ids', Object.keys(r.merged));
    check(r.stats.conflicts === 1 && r.stats.fromDevice === 1 && r.stats.fromAccount === 1, 'stats', r.stats);
}

// ---- countConflicts ----
check(S.countConflicts({ 1: owned(1), 2: owned(1) }, [remote(1, owned(), 5), remote(2, blank(), 5), remote(3, owned(), 5)]) === 1, 'countConflicts counts only differing shared ids');
check(S.countConflicts({ 1: blank(1) }, []) === 0, 'countConflicts ignores device-only items');

// ---- applyRemote ----
{
    const local = { 1: owned(500) };
    const synced = { 1: 300 };
    const r = S.applyRemote(local, synced, [{ id: 1, data: blank(), updatedAt: 400 }]);
    check(local[1].owned && r.changedIds.length === 0, 'applyRemote: older remote ignored');
    check(synced[1] === 400 && S.unsentIds(local, synced).includes('1'), 'applyRemote: older remote confirms up to its time, local edit still unsent');
}
{
    const local = { 1: owned(500) };
    const synced = { 1: 300 };
    const r = S.applyRemote(local, synced, [{ id: 1, data: blank(), updatedAt: 600 }]);
    check(!local[1].owned && local[1].updatedAt === 600 && r.changedIds[0] === 1, 'applyRemote: newer remote beats an unsent local edit');
    check(S.unsentIds(local, synced).length === 0, 'applyRemote: nothing left to send after newer remote');
}
{
    const local = { 1: owned(500) };
    const synced = {};
    const r = S.applyRemote(local, synced, [{ id: 1, data: owned(), updatedAt: 500 }]);
    check(r.changedIds.length === 0 && synced[1] === 500, 'applyRemote: echo of our own push confirms it');
}
{
    const local = { 7: owned() };   // untimestamped
    const r = S.applyRemote(local, {}, [{ id: 7, data: blank(), updatedAt: 2 }]);
    check(!local[7].owned && r.changedIds.length === 1, 'applyRemote: any real edit beats an untimestamped entry');
}
{
    const local = {};
    S.applyRemote(local, {}, [{ id: 8, data: { owned: true, junk: 1 }, updatedAt: 9 }]);
    check(local[8].owned && !('junk' in local[8]) && local[8].updatedAt === 9, 'applyRemote: new item added, normalized');
}
{
    const synced = { 1: 900 };
    S.applyRemote({}, synced, [{ id: 1, data: owned(), updatedAt: 500 }]);
    check(synced[1] === 900, 'applyRemote: never lowers a confirmed time');
}

// ---- unsentIds ----
check(S.unsentIds({ 1: owned(5), 2: owned(9), 3: owned() }, { 1: 5, 2: 3, 3: 1 }).join() === '2', 'unsentIds: only edits newer than confirmed');
check(S.unsentIds({ 1: owned(5) }, {}).join() === '1', 'unsentIds: never-confirmed edit is unsent');

// ---- Played games (the GAME codec) ----
{
    const G = S.GAME;
    const played = (updatedAt, extra = {}) => ({ played: true, playedDate: '', ...extra, ...(updatedAt === undefined ? {} : { updatedAt }) });
    const unplayed = (updatedAt) => ({ played: false, playedDate: '', ...(updatedAt === undefined ? {} : { updatedAt }) });
    const n = S.normalizeGame({ played: 1, playedDate: '2026-11-04', junk: '<b>', updatedAt: 5 });
    check(n.played === true && n.playedDate === '2026-11-04' && Object.keys(n).join() === 'played,playedDate', 'normalizeGame keeps only its two fields', n);
    check(S.normalizeGame({ playedDate: '4 Nov 2026' }).playedDate === '' && S.normalizeGame(undefined).played === false, 'normalizeGame blanks a bad date and missing data');
    check(S.isEmpty(unplayed(), G) && !S.isEmpty(played(), G), 'isEmpty with the game codec');
    check(!S.sameData(played(), played(1, { playedDate: '2026-01-01' }), G), 'sameData sees a played date');

    // normalizeGame's output must pass the Worker's sanitizeGameData unchanged
    const workerSource = readFileSync(fileURLToPath(new URL('../worker/acdb-worker.js', import.meta.url)), 'utf8');
    const rules = workerSource.match(/const DATE_FORMAT = .*\r?\n/);
    const fn = workerSource.match(/\nfunction sanitizeGameData[\s\S]*?\n}\r?\n/);
    check(rules && fn, 'found sanitizeGameData in the Worker');
    if (rules && fn) {
        const sanitize = vm.runInNewContext(rules[0] + fn[0] + '; sanitizeGameData');
        [{}, played(), played(1, { playedDate: '2026-11-04' }), { played: 'yes', playedDate: 20261104 }, { played: true, playedDate: '2026-1-4' }].forEach((sample, i) => {
            const g = S.normalizeGame(sample);
            check(JSON.stringify(sanitize(g)) === JSON.stringify(g), `Worker keeps normalized game sample ${i}`, { g, worker: sanitize(g) });
        });
    }

    let r = S.mergeFirstSync({ 5: played(100), 6: unplayed(100) }, [], 'newest', NOW, G);
    check(r.toPush.join() === '5' && r.merged[5].played, 'game: a device-only played game is pushed, an unplayed one is not', r);
    r = S.mergeFirstSync({ 5: played(300) }, [{ id: 5, data: unplayed(), updatedAt: 200 }], 'newest', NOW, G);
    check(r.merged[5].played && r.toPush.includes('5'), 'game: newer device edit wins', r.merged[5]);
    r = S.mergeFirstSync({ 5: unplayed(100) }, [{ id: 5, data: played(), updatedAt: 200 }], 'newest', NOW, G);
    check(r.merged[5].played && !r.toPush.includes('5'), 'game: newer account edit wins', r.merged[5]);
    r = S.mergeFirstSync({ 5: played(200) }, [{ id: 5, data: unplayed(), updatedAt: 200 }], 'newest', NOW, G);
    check(r.merged[5].played && r.toPush.includes('5') && r.merged[5].updatedAt === 201, 'game tie: played device copy wins and is restamped', r.merged[5]);
    r = S.mergeFirstSync({ 5: unplayed(200) }, [{ id: 5, data: played(), updatedAt: 200 }], 'newest', NOW, G);
    check(r.merged[5].played && !r.toPush.includes('5'), 'game tie: played account copy wins', r.merged[5]);
    r = S.mergeFirstSync({ 5: unplayed(100) }, [{ id: 5, data: played(), updatedAt: 900 }], 'device', NOW, G);
    check(!r.merged[5].played && r.merged[5].updatedAt === NOW, 'game device strategy: device wins, restamped to now', r.merged[5]);
    check(Object.keys(r.merged[5]).sort().join() === 'played,playedDate,updatedAt', 'game merge stores only game fields', r.merged[5]);

    const local = {};
    const synced = {};
    S.applyRemote(local, synced, [{ id: 8, data: { played: true, owned: true }, updatedAt: 9 }], G);
    check(local[8].played && !('owned' in local[8]) && synced[8] === 9, 'applyRemote with the game codec stores game fields only', local[8]);
    check(S.countConflicts({ 1: played(1), 2: unplayed(1) }, [{ id: 1, data: played(), updatedAt: 5 }, { id: 2, data: played(), updatedAt: 5 }], G) === 1, 'countConflicts with the game codec');
}

// ---- mergeFirstSync bookkeeping ----
{
    const local = { 1: owned(10), 2: owned(10, { notes: 'x' }), 3: blank(10), 5: owned(300, { notes: 'mine' }) };
    const items = [remote(2, owned(), 20), remote(4, owned(), 20), remote(5, owned(), 200)];
    const r = S.mergeFirstSync(local, items, 'newest', NOW);
    const unsent = S.unsentIds(r.merged, r.synced).sort().join();
    check(unsent === [...r.toPush].sort().join() && unsent === '1,5', 'after a first merge, exactly toPush is unsent', { unsent, toPush: r.toPush });
}

console.log(`${passed} passed${failed ? `, ${failed} failed` : ''}`);
if (failed) process.exitCode = 1;
