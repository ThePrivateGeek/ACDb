/* ============================================
   ACDb - Collection Export / Import
   ============================================ */

(function () {
    'use strict';

    window.ACDB = window.ACDB || {};
    const A = window.ACDB;

    function exportCollection() {
        const exportData = [];
        AC_DATABASE.forEach(item => {
            const data = A.getItemData(item.id);
            if (data.owned || data.wishlist || data.hasBox || data.condition || data.copies > 0 || data.notes || data.pricePaid || data.acquiredDate || data.hasRead) {
                exportData.push({
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

        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'acdb-collection-' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
        A.showToast(`Exported ${exportData.length} items`, 'success');
    }

    // Back up to file writes a list of entries; Download all account data
    // has the same entries under `items`.
    function importEntries(text) {
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch {
            return null;
        }
        if (Array.isArray(parsed)) return parsed;
        if (parsed && Array.isArray(parsed.items)) return parsed.items;
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

    function importCollection(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const entries = importEntries(e.target.result);
            if (!entries) {
                A.showToast('Import failed — invalid file', 'error');
                return;
            }
            const { changes, matched } = planImport(entries);
            const changed = Object.keys(changes).length;
            if (changed > 0 && A.isSignedIn() && !confirm(`This file changes ${changed} item${changed === 1 ? '' : 's'} in your account, on every device you're signed in on.\n\nImport it?`)) {
                return;
            }
            if (changed > 0) A.setItemsData(changes);
            A.renderItems();
            A.showToast(`Imported ${matched} of ${entries.length} items`, 'success');
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
