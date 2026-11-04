/* ============================================
   ACDb - Played Games
   ============================================

   Which games and DLCs (by their js/games.js ids) the visitor has played,
   and when they finished each. Kept in this browser like the collection
   (acdb_games_v1), and in the account when signed in: js/sync.js sends and
   fetches it with the collection. Values are normalized the way sync.js and
   the Worker do (ACDB.normalizeGameData). */

(function () {
    'use strict';

    window.ACDB = window.ACDB || {};
    const A = window.ACDB;

    const STORAGE_KEY = 'acdb_games_v1';

    // id -> { game, dlc }, dlc null for a game
    const ENTRIES = new Map();
    GAMES.forEach(game => {
        ENTRIES.set(game.id, { game, dlc: null });
        game.dlcs.forEach(dlc => ENTRIES.set(dlc.id, { game, dlc }));
    });

    // Missing or unreadable: start empty. Unlike the collection nothing is
    // set aside, since it is small and also in the account or a backup file.
    function load() {
        let parsed = null;
        try {
            parsed = JSON.parse(A.store.get(STORAGE_KEY) || '{}');
        } catch { /* handled below */ }
        const clean = {};
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return clean;
        Object.entries(parsed).forEach(([id, data]) => {
            if (!/^[1-9]\d*$/.test(id) || !data || typeof data !== 'object') return;
            clean[id] = A.normalizeGameData(data);
            if (Number.isFinite(data.updatedAt)) clean[id].updatedAt = data.updatedAt;
        });
        return clean;
    }

    let progress = load();

    // A failed save keeps the edit in memory, where sync can still send it;
    // say so once.
    let saveFailureShown = false;

    function save() {
        if (A.store.set(STORAGE_KEY, JSON.stringify(progress)) || saveFailureShown) return;
        saveFailureShown = true;
        A.showToast("Couldn't save in this browser. Use Back up to file to keep your changes.", 'error');
    }

    function getGameProgress(id) {
        return A.normalizeGameData(progress[id]);
    }

    function isPlayed(id) {
        return !!(progress[id] && progress[id].played);
    }

    // Every edit goes through here. `updatedAt` lets sync keep the newest
    // edit per game, as for collection items.
    function setGameProgress(id, data) {
        progress[id] = { ...A.normalizeGameData(data), updatedAt: A.syncNow() };
        save();
        A.onLocalChange();
        refreshViews();
    }

    // Many edits at once (restoring a backup): one save and one sync nudge.
    // `changes` maps id -> data.
    function setGameProgressBatch(changes) {
        const updatedAt = A.syncNow();
        Object.entries(changes).forEach(([id, data]) => {
            progress[id] = { ...A.normalizeGameData(data), updatedAt };
        });
        save();
        A.onLocalChange();
        refreshViews();
    }

    // Signing out: the account has it, and the next person on a shared
    // computer shouldn't see it.
    function clearGamesProgress() {
        progress = {};
        save();
        refreshViews();
    }

    // The views that show played state re-render. A Played switch or date
    // that had focus gets it back, so a keyboard user stays where they were.
    function refreshViews() {
        const active = document.activeElement;
        const attr = active && active.dataset
            ? ['played', 'playedDate'].find(key => key in active.dataset)
            : null;
        const selector = attr && `[data-${attr === 'played' ? 'played' : 'played-date'}="${CSS.escape(active.dataset[attr])}"]`;
        A.refreshGamesView();
        A.refreshReadingView();
        if (!selector || active.isConnected) return;
        const again = [...document.querySelectorAll(selector)].find(el => el.getClientRects().length > 0);
        if (again) again.focus({ preventScroll: true });
    }

    // Another tab saved. Both tabs save the whole object, so merge per id,
    // keeping the newer `updatedAt`, and save again if this tab held something
    // newer. An empty object is a deliberate reset (signing out).
    window.addEventListener('storage', (e) => {
        if (e.key !== STORAGE_KEY) return;
        const stored = load();
        let keptOwn = false;
        if (Object.keys(stored).length > 0) {
            Object.entries(progress).forEach(([id, mine]) => {
                const theirs = stored[id];
                if (!theirs || (mine.updatedAt || 0) > (theirs.updatedAt || 0)) {
                    stored[id] = mine;
                    keptOwn = true;
                }
            });
        }
        progress = stored;
        if (keptOwn) save();
        refreshViews();
    });

    // Expose on namespace
    A.getGameProgress = getGameProgress;
    A.isPlayed = isPlayed;
    A.setGameProgress = setGameProgress;
    A.setGameProgressBatch = setGameProgressBatch;
    A.clearGamesProgress = clearGamesProgress;
    A.findGameEntry = id => ENTRIES.get(Number(id)) || null;
    A.refreshGameProgressViews = refreshViews;
    // For sync.js, like getCollection / setCollection / saveCollection
    A.getGamesProgress = () => progress;
    A.replaceGamesProgress = (map) => { progress = map; };
    A.saveGamesProgress = save;

})();
