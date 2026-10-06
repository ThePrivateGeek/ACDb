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
