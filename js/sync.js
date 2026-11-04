/* ============================================
   ACDb - Cloud Sync
   ============================================ */

// The browser's LocalStorage copy stays the primary one; when the visitor is
// signed in (auth.js) this module keeps it in step with their account.
// Every saved item carries `updatedAt`, and per item the newest edit wins.
//
// Sync remembers, per item, the edit time the server has confirmed
// (`synced`). Anything in the collection newer than that is unsent, so there
// is no separate queue that two open tabs could overwrite: if their
// bookkeeping races, the worst case is an item being sent twice, which the
// server ignores. Unsent edits are pushed in batches; other devices' edits
// are pulled on start, when the tab becomes visible again, when the
// connection returns, and after each push.
//
// Played games and DLCs (js/game-progress.js) sync the same way, in the same
// requests: their own map, `gamesSynced` and `gamesCursor`, with the GAME
// codec in place of ITEM. A Worker from before games ignores them, so game
// edits count as sent only when the server says `gamesSaved`.

(function () {
    'use strict';

    window.ACDB = window.ACDB || {};
    const A = window.ACDB;

    const SYNC_KEY = 'acdb_sync';
    const BACKUP_KEY = 'acdb_presync_backup';
    const PUSH_DELAY = 2500;
    const PUSH_MAX_WAIT = 15000;
    const PUSH_CHUNK = 200;            // the Worker's per-request limit
    const PULL_THROTTLE = 30000;
    const RETRY_DELAYS = [5000, 30000, 120000, 300000];
    const KEEPALIVE_LIMIT = 60000;     // keepalive request bodies are capped at 64 KB

    // Edits saved before sync existed have no `updatedAt`. They count as this
    // (very old) time, so any real edit beats them, and two of them tie.
    const LEGACY_STAMP = 1;

    const FIELDS = ['owned', 'wishlist', 'hasBox', 'condition', 'copies', 'pricePaid', 'acquiredDate', 'notes', 'hasRead', 'readDate'];
    const CONDITIONS = ['mint', 'near-mint', 'excellent', 'good', 'fair', 'poor'];
    const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;
    const MAX_PRICE_LENGTH = 20;
    const MAX_NOTES_LENGTH = 5000;     // also the notes box's maxlength

    // ---- Pure helpers (exercised by tools/test-sync-merge.mjs) ----

    // The one shape of a saved item. Loose input (strings from old backups,
    // numbers for prices) is coerced; anything the Worker's sanitizeItemData
    // would refuse becomes blank (long notes are trimmed to fit), so this
    // device keeps exactly what its other devices receive, and a crafted
    // backup file can't store markup.
    function normalize(d) {
        d = d || {};
        const copies = parseInt(d.copies, 10);
        const price = d.pricePaid == null ? '' : String(d.pricePaid);
        return {
            owned: !!d.owned,
            wishlist: !!d.wishlist,
            hasBox: !!d.hasBox,
            condition: CONDITIONS.includes(d.condition) ? d.condition : '',
            copies: copies > 0 ? Math.min(copies, 999) : 0,
            pricePaid: price.length <= MAX_PRICE_LENGTH ? price : '',
            acquiredDate: DATE_FORMAT.test(d.acquiredDate) ? d.acquiredDate : '',
            notes: typeof d.notes === 'string' ? d.notes.slice(0, MAX_NOTES_LENGTH) : '',
            hasRead: !!d.hasRead,
            readDate: DATE_FORMAT.test(d.readDate) ? d.readDate : ''
        };
    }

    // A played game or DLC, coerced like an item (the Worker's sanitizeGameData).
    const GAME_FIELDS = ['played', 'playedDate'];
    function normalizeGame(d) {
        d = d || {};
        return {
            played: !!d.played,
            playedDate: DATE_FORMAT.test(d.playedDate) ? d.playedDate : ''
        };
    }

    // What the merge rules need to know about each kind of entry. `wins`
    // breaks a first-sync tie: the side that owns the item (or has played
    // the game) keeps it.
    const ITEM = { normalize, fields: FIELDS, wins: d => !!d.owned };
    const GAME = { normalize: normalizeGame, fields: GAME_FIELDS, wins: d => !!d.played };

    function sameData(a, b, codec = ITEM) {
        const x = codec.normalize(a);
        const y = codec.normalize(b);
        return codec.fields.every(f => x[f] === y[f]);
    }

    function isEmpty(d, codec = ITEM) {
        return sameData(d, {}, codec);
    }

    function stampOf(d) {
        return d && Number.isFinite(d.updatedAt) && d.updatedAt > 0 ? d.updatedAt : LEGACY_STAMP;
    }

    // Ids whose local edit is newer than what the server has confirmed.
    function unsentIds(local, synced) {
        return Object.keys(local).filter(id => stampOf(local[id]) > (synced[id] || 0));
    }

    // Ongoing sync: a remote item replaces the local one only when strictly
    // newer (a newer remote edit also beats an unsent local one: the other
    // device's later change stands). Every remote item counts as confirmed up
    // to its time. Mutates `local` and `synced`.
    function applyRemote(local, synced, remoteItems, codec = ITEM) {
        const changedIds = [];
        remoteItems.forEach(({ id, data, updatedAt }) => {
            if (!(synced[id] >= updatedAt)) synced[id] = updatedAt;
            const mine = local[id];
            if (mine && stampOf(mine) >= updatedAt) return;
            local[id] = { ...codec.normalize(data), updatedAt };
            changedIds.push(Number(id));
        });
        return { changedIds };
    }

    // Items both sides hold with different values.
    function countConflicts(local, remoteItems, codec = ITEM) {
        return remoteItems.filter(r => local[r.id] && !sameData(local[r.id], r.data, codec)).length;
    }

    function countNonEmpty(items, codec = ITEM) {
        return items.filter(d => !isEmpty(d, codec)).length;
    }

    // First sign-in on this device. Items found on only one side are always
    // kept. For an item both sides hold with different values, `strategy`
    // decides:
    //   newest   the later edit wins; on a tie (typically two edits from
    //            before sync existed) the side that owns it (codec.wins)
    //            wins, else the account
    //   device   this device's copy wins
    //   account  the account's copy wins
    // A device copy that wins is restamped above the account's when needed,
    // because the Worker only accepts strictly newer edits. Returns the merged
    // collection, the ids to push, and `synced` for everything else.
    function mergeFirstSync(local, remoteItems, strategy, now, codec = ITEM) {
        const merged = {};
        const synced = {};
        const toPush = [];
        const stats = { fromDevice: 0, fromAccount: 0, conflicts: 0 };
        const remote = new Map(remoteItems.map(r => [String(r.id), r]));

        remote.forEach((r, id) => {
            merged[id] = { ...codec.normalize(r.data), updatedAt: r.updatedAt };
            synced[id] = r.updatedAt;
        });

        Object.keys(local).forEach(id => {
            const mine = local[id];
            const theirs = remote.get(id);
            if (!theirs) {
                merged[id] = { ...codec.normalize(mine), updatedAt: stampOf(mine) };
                if (isEmpty(mine, codec)) {
                    synced[id] = merged[id].updatedAt;     // nothing worth sending
                } else {
                    toPush.push(id);
                    stats.fromDevice++;
                }
                return;
            }
            if (sameData(mine, theirs.data, codec)) return;

            stats.conflicts++;
            const localStamp = stampOf(mine);
            let useLocal;
            if (strategy === 'device') useLocal = true;
            else if (strategy === 'account') useLocal = false;
            else if (localStamp !== theirs.updatedAt) useLocal = localStamp > theirs.updatedAt;
            else useLocal = codec.wins(mine) && !codec.wins(theirs.data);

            if (useLocal) {
                const updatedAt = strategy === 'device' ? Math.max(now, theirs.updatedAt + 1)
                    : Math.max(localStamp, theirs.updatedAt + 1);
                merged[id] = { ...codec.normalize(mine), updatedAt };
                toPush.push(id);
                stats.fromDevice++;
            } else {
                stats.fromAccount++;
            }
        });

        return { merged, synced, toPush, stats };
    }

    // ---- Persisted state ----
    // Re-read before every change; see the note at the top about open tabs.

    // A state saved before games existed gets gamesCursor 0, so that device's
    // first pull fetches every played game in the account.
    function defaultState() {
        return { owner: null, cursor: 0, synced: {}, gamesCursor: 0, gamesSynced: {}, clockOffset: 0, lastSyncAt: 0 };
    }

    function loadState() {
        try {
            const saved = JSON.parse(localStorage.getItem(SYNC_KEY));
            if (saved && typeof saved === 'object') return { ...defaultState(), ...saved };
        } catch { /* fall through */ }
        return defaultState();
    }

    let state = loadState();

    function mutateState(fn) {
        state = loadState();
        fn(state);
        try {
            localStorage.setItem(SYNC_KEY, JSON.stringify(state));
        } catch { /* storage full or blocked: keep going in memory */ }
    }

    // Whether the server keeps played games: a Worker from before them answers
    // a push without `gamesSaved` and a pull without `games`. Assumed until an
    // answer says otherwise, and checked again on every pull, so a Worker
    // deployed during the visit is picked up.
    let gamesSupported = true;

    function pendingIds() {
        const current = loadState();
        if (!current.owner) return [];
        return unsentIds(A.getCollection(), current.synced);
    }

    function pendingGameIds() {
        const current = loadState();
        if (!current.owner) return [];
        return unsentIds(A.getGamesProgress(), current.gamesSynced);
    }

    // Every unsent edit, games included even while the server can't take
    // them: the account menu and the sign-out warning count these.
    function pendingCount() {
        return pendingIds().length + pendingGameIds().length;
    }

    // The unsent edits a push can send now; what decides whether to push again.
    function pushableCount() {
        return pendingIds().length + (gamesSupported ? pendingGameIds().length : 0);
    }

    function noteServerTime(serverTime) {
        if (!Number.isFinite(serverTime)) return;
        const offset = serverTime - Date.now();
        if (Math.abs(offset - state.clockOffset) > 1000) mutateState(s => { s.clockOffset = offset; });
    }

    // Edit time corrected for this device's clock skew against the server.
    function syncNow() {
        return Date.now() + (state.clockOffset || 0);
    }

    // ---- Status ----
    let status = 'idle';   // idle | syncing | synced | pending | error

    function setStatus(next) {
        status = next;
        if (A.renderSyncStatus) A.renderSyncStatus(status, { pending: pendingCount() });
    }

    // ---- Engine ----
    let ready = false;        // this device's first merge with the account is done
    let pushTimer = null;
    let firstQueuedAt = 0;
    let retryTimer = null;
    let retryIndex = 0;
    let pushing = null;
    let lastPullAt = 0;

    function httpError(res) {
        const err = new Error('HTTP ' + res.status);
        err.status = res.status;
        return err;
    }

    function clearTimers() {
        clearTimeout(pushTimer);
        clearTimeout(retryTimer);
        pushTimer = retryTimer = null;
        firstQueuedAt = 0;
    }

    function handleSyncError(err) {
        if (err && err.status === 401) {          // auth.js has already signed us out
            ready = false;
            clearTimers();
            setStatus('idle');
            return;
        }
        if (err && (err.status === 400 || err.status === 413)) {
            // The server will never accept this batch as it is; retrying won't help.
            console.error('ACDb sync rejected:', err);
            setStatus('error');
            return;
        }
        // Offline, rate-limited or a server hiccup: back off and retry.
        setStatus(navigator.onLine === false ? 'pending' : 'error');
        clearTimeout(retryTimer);
        const delay = RETRY_DELAYS[Math.min(retryIndex, RETRY_DELAYS.length - 1)];
        retryIndex++;
        retryTimer = setTimeout(() => { retryTimer = null; push(); }, delay);
    }

    // Called by app.js after every saved edit.
    function onLocalChange() {
        if (!ready) {
            if (A.isSignedIn && A.isSignedIn()) setStatus('pending');
            return;
        }
        schedulePush();
    }

    function schedulePush() {
        const now = Date.now();
        if (!firstQueuedAt) firstQueuedAt = now;
        clearTimeout(pushTimer);
        const wait = Math.max(0, Math.min(PUSH_DELAY, firstQueuedAt + PUSH_MAX_WAIT - now));
        pushTimer = setTimeout(push, wait);
        setStatus('syncing');
    }

    function buildChanges(limit) {
        const collection = A.getCollection();
        return pendingIds().slice(0, limit).map(id => ({
            id: Number(id),
            data: normalize(collection[id]),
            updatedAt: stampOf(collection[id])
        }));
    }

    function buildGameChanges(limit) {
        if (!gamesSupported) return [];
        const games = A.getGamesProgress();
        return pendingGameIds().slice(0, limit).map(id => ({
            id: Number(id),
            data: normalizeGame(games[id]),
            updatedAt: stampOf(games[id])
        }));
    }

    // A push without games looks exactly like one from before games existed.
    function pushBody(changes, games) {
        return JSON.stringify(games.length ? { changes, games } : { changes });
    }

    // Push everything unsent (in chunks), then pull. Concurrent calls share
    // one run; edits made meanwhile trigger another run afterwards.
    function push() {
        clearTimeout(pushTimer);
        pushTimer = null;
        firstQueuedAt = 0;
        if (!ready) return Promise.resolve();
        if (pushing) return pushing;

        pushing = (async () => {
            try {
                setStatus('syncing');
                for (;;) {
                    const changes = buildChanges(PUSH_CHUNK);
                    const games = buildGameChanges(PUSH_CHUNK);
                    if (changes.length === 0 && games.length === 0) break;
                    const res = await A.authFetch('/collection', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: pushBody(changes, games)
                    });
                    if (!res.ok) throw httpError(res);
                    const body = await res.json();
                    noteServerTime(body.serverTime);
                    // A Worker from before games answers 200 but drops them:
                    // they stay unsent until one that keeps them.
                    const gamesSaved = games.length > 0 && body.gamesSaved === true;
                    if (games.length > 0 && !gamesSaved) gamesSupported = false;
                    // Confirmed up to what was sent; a newer edit made while
                    // the request was out is still unsent.
                    mutateState(s => {
                        changes.forEach(c => {
                            if (!(s.synced[c.id] >= c.updatedAt)) s.synced[c.id] = c.updatedAt;
                        });
                        if (gamesSaved) games.forEach(c => {
                            if (!(s.gamesSynced[c.id] >= c.updatedAt)) s.gamesSynced[c.id] = c.updatedAt;
                        });
                    });
                    if (changes.length < PUSH_CHUNK && games.length < PUSH_CHUNK) break;
                }
                await pull();
                retryIndex = 0;
                setStatus(pushableCount() ? 'syncing' : 'synced');
            } catch (err) {
                handleSyncError(err);
            } finally {
                pushing = null;
            }
            if (ready && pushableCount() && !retryTimer && !pushTimer) schedulePush();
        })();
        return pushing;
    }

    async function pull() {
        const current = loadState();
        const res = await A.authFetch('/collection?since=' + encodeURIComponent(current.cursor || 0)
            + '&gamesSince=' + encodeURIComponent(current.gamesCursor || 0));
        if (!res.ok) throw httpError(res);
        const body = await res.json();
        noteServerTime(body.serverTime);
        lastPullAt = Date.now();

        const collection = A.getCollection();
        const games = A.getGamesProgress();
        // No `games` in the answer: a Worker from before games. The games
        // cursor stays put, so the first pull from a newer one gets them all.
        gamesSupported = Array.isArray(body.games);
        let changedIds = [];
        let changedGames = [];
        mutateState(s => {
            changedIds = applyRemote(collection, s.synced, body.items).changedIds;
            s.cursor = body.cursor;
            if (gamesSupported) {
                changedGames = applyRemote(games, s.gamesSynced, body.games, GAME).changedIds;
                s.gamesCursor = body.cursor;
            }
            s.lastSyncAt = Date.now();
        });
        if (changedIds.length) {
            A.saveCollection();
            A.renderItems();
            if (A.refreshModalControls) A.refreshModalControls(changedIds);
        }
        if (changedGames.length) {
            A.saveGamesProgress();
            A.refreshGameProgressViews();
        }
    }

    function pullSoon() {
        if (!ready || pushing || Date.now() - lastPullAt < PULL_THROTTLE) return;
        // push() pulls afterwards and also sends anything still unsent.
        push();
    }

    // Best-effort send when the tab is hidden or closed. Nothing is marked as
    // confirmed; the next visit re-sends it (the Worker ignores edits it
    // already has).
    function flushOnHide() {
        if (!ready || !A.getSessionToken) return;
        const session = A.getSessionToken();
        if (!session) return;
        const changes = buildChanges(PUSH_CHUNK);
        const games = buildGameChanges(PUSH_CHUNK);
        const body = pushBody(changes, games);
        if ((!changes.length && !games.length) || body.length > KEEPALIVE_LIMIT) return;
        try {
            fetch(A.API_URL + '/collection', {
                method: 'PUT',
                keepalive: true,
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session },
                body
            }).catch(() => {});
        } catch { /* ignore */ }
    }

    // ---- First sign-in on this device ----

    function saveBackup(collection, games) {
        try {
            localStorage.setItem(BACKUP_KEY, JSON.stringify({ savedAt: new Date().toISOString(), collection, games }));
        } catch { /* best effort */ }
    }

    // Still signed in to `account`? Signing out (here or in another tab)
    // while the first sync waits must not pull the account's data back in.
    function signedInAs(account) {
        const current = A.isSignedIn() ? A.getAccount() : null;
        return !!current && current.id === account.id;
    }

    async function firstSync(account) {
        setStatus('syncing');
        const res = await A.authFetch('/collection?since=0&gamesSince=0');
        if (!res.ok) throw httpError(res);
        const body = await res.json();
        if (!signedInAs(account)) return null;
        noteServerTime(body.serverTime);

        const local = A.getCollection();
        const localGames = A.getGamesProgress();
        const now = syncNow();
        const previousOwner = loadState().owner;
        gamesSupported = Array.isArray(body.games);
        const remoteGames = gamesSupported ? body.games : [];
        let result;
        // Played games merged like the items; null keeps this device's as
        // they are, all unsent (a Worker from before games)
        let gamesResult = null;
        let replacedOtherAccount = false;

        if (previousOwner && previousOwner !== account.id) {
            // This device still holds another account's data (its session
            // expired without a sign-out). Never mix it into this account.
            saveBackup(local, localGames);
            result = mergeFirstSync({}, body.items, 'account', now);
            gamesResult = mergeFirstSync({}, remoteGames, 'account', now, GAME);
            replacedOtherAccount = true;
        } else {
            const localCount = countNonEmpty(Object.values(local));
            const remoteCount = countNonEmpty(body.items.map(r => r.data));
            const conflicts = countConflicts(local, body.items);
            // The dialog is about the collection. Played games follow the
            // choice made there, or the most recent change when only games
            // differ: a played tick is small, and the latest one is a fair guess.
            let strategy = 'newest';
            if (conflicts > 0) {
                strategy = await askMergeStrategy({ localCount, remoteCount, conflicts });
                if (!signedInAs(account)) return null;
            }
            if (localCount > 0 || countNonEmpty(Object.values(localGames), GAME) > 0) saveBackup(local, localGames);
            result = mergeFirstSync(local, body.items, strategy, now);
            if (gamesSupported) gamesResult = mergeFirstSync(localGames, remoteGames, strategy, now, GAME);
        }

        A.setCollection(result.merged);
        A.saveCollection();
        if (gamesResult) {
            A.replaceGamesProgress(gamesResult.merged);
            A.saveGamesProgress();
        }
        mutateState(s => {
            s.owner = account.id;
            s.cursor = body.cursor;
            s.synced = result.synced;
            s.gamesCursor = gamesSupported ? body.cursor : 0;
            s.gamesSynced = gamesResult ? gamesResult.synced : {};
            s.lastSyncAt = Date.now();
        });
        ready = true;
        A.renderItems();
        await push();
        return { ...result.stats, replacedOtherAccount };
    }

    // ---- Merge dialog ----

    function askMergeStrategy({ localCount, remoteCount, conflicts }) {
        const overlay = document.getElementById('mergeModalOverlay');
        document.getElementById('mergeLocalCount').textContent = localCount;
        document.getElementById('mergeRemoteCount').textContent = remoteCount;
        document.getElementById('mergeConflictCount').textContent = conflicts;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        return new Promise(resolve => {
            const buttons = overlay.querySelectorAll('[data-strategy]');
            const choose = (e) => {
                buttons.forEach(b => b.removeEventListener('click', choose));
                overlay.classList.remove('active');
                document.body.style.overflow = '';
                resolve(e.currentTarget.dataset.strategy);
            };
            buttons.forEach(b => b.addEventListener('click', choose));
        });
    }

    // ---- Public API ----

    // Start syncing for the signed-in account. Resolves with merge stats on a
    // device's first sync, or null.
    async function startSync() {
        const account = A.getAccount && A.getAccount();
        if (!account) return null;
        clearTimers();
        retryIndex = 0;
        gamesSupported = true;
        try {
            if (loadState().owner === account.id) {
                ready = true;
                await push();
                return null;
            }
            ready = false;
            return await firstSync(account);
        } catch (err) {
            handleSyncError(err);
            if (err && err.status === 401) return null;
            // First sync failed (offline?): try again shortly.
            if (!ready) {
                clearTimeout(retryTimer);
                retryTimer = setTimeout(() => { retryTimer = null; startSync(); }, RETRY_DELAYS[0]);
            }
            return null;
        }
    }

    // Push whatever is unsent; resolves with how many edits are still unsent.
    async function flushSync({ timeoutMs = 5000 } = {}) {
        if (ready && pendingCount()) {
            await Promise.race([push(), new Promise(r => setTimeout(r, timeoutMs))]);
        }
        return pendingCount();
    }

    // Session gone but this device's data still belongs to the account: edits
    // stay unsent until the same account signs in again.
    function stopSync() {
        ready = false;
        clearTimers();
        setStatus('idle');
    }

    // Signed out or account deleted: forget everything sync-related.
    function resetSync() {
        stopSync();
        state = defaultState();
        try {
            localStorage.removeItem(SYNC_KEY);
            localStorage.removeItem(BACKUP_KEY);
        } catch { /* ignore */ }
    }

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') pullSoon();
        else flushOnHide();
    });
    window.addEventListener('pagehide', flushOnHide);
    window.addEventListener('online', () => { if (ready) push(); });

    // Expose on namespace
    A.syncNow = syncNow;
    A.onLocalChange = onLocalChange;
    A.startSync = startSync;
    A.flushSync = flushSync;
    A.stopSync = stopSync;
    A.resetSync = resetSync;
    A.getSyncStatus = () => status;
    A.getPendingCount = pendingCount;
    // Whose collection this device holds: the account id once a first sync
    // has merged it, else null (or another account's id, see firstSync).
    A.getSyncOwner = () => loadState().owner;
    A.ITEM_FIELDS = FIELDS;
    A.normalizeItemData = normalize;
    A.sameItemData = (a, b) => sameData(a, b);
    A.GAME_FIELDS = GAME_FIELDS;
    A.normalizeGameData = normalizeGame;
    A.sameGameData = (a, b) => sameData(a, b, GAME);
    A.syncInternals = { normalize, normalizeGame, sameData, isEmpty, unsentIds, applyRemote, countConflicts, mergeFirstSync, ITEM, GAME, LEGACY_STAMP };

})();
