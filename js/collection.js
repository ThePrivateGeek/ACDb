/* ============================================
   ACDb - Collection Export / Import
   ============================================ */

(function () {
    'use strict';

    window.ACDB = window.ACDB || {};
    const A = window.ACDB;

    // Back up to file writes {items, games}: the collection's entries and
    // the played games and DLCs. Each game entry carries its name (and its
    // game's, for a DLC) so the file reads well; the id is what restores it.
    function exportCollection() {
        const items = [];
        AC_DATABASE.forEach(item => {
            const data = A.getItemData(item.id);
            if (data.owned || data.wishlist || data.hasBox || data.condition || data.copies > 0 || data.notes || data.pricePaid || data.acquiredDate || data.hasRead) {
                items.push({
                    id: item.id,
                    name: item.name,
                    game: item.game,
                    owned: data.owned || false,
                    wishlist: data.wishlist || false,
                    hasBox: data.hasBox || false,
                    condition: data.condition || '',
                    copies: data.copies || 0,
                    pricePaid: data.pricePaid || '',
                    acquiredDate: data.acquiredDate || '',
                    notes: data.notes || '',
                    hasRead: data.hasRead || false,
                    readDate: data.readDate || ''
                });
            }
        });
        const games = [];
        GAMES.forEach(game => [game, ...game.dlcs].forEach(entry => {
            const data = A.getGameProgress(entry.id);
            if (!data.played) return;
            games.push({
                id: entry.id,
                name: entry.name,
                ...(entry === game ? {} : { game: game.name }),
                played: true,
                playedDate: data.playedDate
            });
        }));

        const json = JSON.stringify({ items, games }, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'acdb-collection-' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
        A.showToast(`Exported ${countText(items.length, 'item', 'items')}${games.length ? ` and ${countText(games.length, 'game', 'games')}` : ''}`, 'success');
    }

    function countText(n, one, many) {
        return `${n} ${n === 1 ? one : many}`;
    }

    // Back up to file writes {items, games}; older backups are a plain list
    // of item entries. Download all account data has the same `items` and
    // `games`. Returns { items, games } or null.
    function importEntries(text) {
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch {
            return null;
        }
        if (Array.isArray(parsed)) return { items: parsed, games: [] };
        if (parsed && Array.isArray(parsed.items)) {
            return { items: parsed.items, games: Array.isArray(parsed.games) ? parsed.games : [] };
        }
        return null;
    }

    // Works out every change before saving any, so a bad entry can't leave a
    // half-done import. Values are normalized like synced ones (sync.js).
    // A field the file doesn't have (backups from before reading tracking
    // lack hasRead and readDate) keeps its current value, and items the file
    // doesn't change keep their edit time, so they don't override newer
    // edits from other devices.
    function planImport(entries) {
        const changes = {};
        let matched = 0;
        entries.forEach(entry => {
            if (!entry || typeof entry !== 'object') return;
            // Match by permanent id; exports made before ids existed
            // only carry the name, so fall back to that.
            const item = (entry.id !== undefined && A.findItemByRef(entry.id)) || A.findItemByRef(entry.name);
            if (!item) return;
            matched++;
            const current = A.normalizeItemData(A.getItemData(item.id));
            const given = {};
            A.ITEM_FIELDS.forEach(field => {
                if (field in entry) given[field] = entry[field];
            });
            const data = A.normalizeItemData({ ...current, ...given });
            if (A.sameItemData(data, current)) delete changes[item.id];
            else changes[item.id] = data;
        });
        return { changes, matched };
    }

    // The same for played games and DLCs, matched by their permanent id.
    function planGamesImport(entries) {
        const changes = {};
        let matched = 0;
        entries.forEach(entry => {
            if (!entry || typeof entry !== 'object' || !A.findGameEntry(entry.id)) return;
            matched++;
            const current = A.getGameProgress(entry.id);
            const given = {};
            A.GAME_FIELDS.forEach(field => {
                if (field in entry) given[field] = entry[field];
            });
            const data = A.normalizeGameData({ ...current, ...given });
            if (A.sameGameData(data, current)) delete changes[entry.id];
            else changes[entry.id] = data;
        });
        return { changes, matched };
    }

    function importCollection(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const entries = importEntries(e.target.result);
            if (!entries) {
                A.showToast('Import failed — invalid file', 'error');
                return;
            }
            const { changes, matched } = planImport(entries.items);
            const games = planGamesImport(entries.games);
            const changed = Object.keys(changes).length;
            const gamesChanged = Object.keys(games.changes).length;
            const what = [
                changed ? countText(changed, 'item', 'items') : '',
                gamesChanged ? countText(gamesChanged, 'game', 'games') : ''
            ].filter(Boolean).join(' and ');
            if (what && A.isSignedIn() && !confirm(`This file changes ${what} in your account, on every device you're signed in on.

Import it?`)) {
                return;
            }
            if (changed > 0) A.setItemsData(changes);
            if (gamesChanged > 0) A.setGameProgressBatch(games.changes);
            A.renderItems();
            const gamesText = entries.games.length ? ` and ${games.matched} of ${countText(entries.games.length, 'game', 'games')}` : '';
            A.showToast(`Imported ${matched} of ${entries.items.length} items${gamesText}`, 'success');
        };
        reader.onerror = function () {
            A.showToast("Import failed — couldn't read the file", 'error');
        };
        reader.readAsText(file);
    }

    // Expose on namespace
    A.exportCollection = exportCollection;
    A.importCollection = importCollection;

})();
