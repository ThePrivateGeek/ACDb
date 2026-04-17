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
            if (data.owned || data.wishlist || data.hasBox || data.condition || data.copies > 0 || data.notes || data.pricePaid || data.acquiredDate) {
                exportData.push({
                    name: item.name,
                    game: item.game,
                    owned: data.owned || false,
                    wishlist: data.wishlist || false,
                    hasBox: data.hasBox || false,
                    condition: data.condition || '',
                    copies: data.copies || 0,
                    pricePaid: data.pricePaid || '',
                    acquiredDate: data.acquiredDate || '',
                    notes: data.notes || ''
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
        A.showToast(`Exported ${exportData.length} items`);
    }

    function importCollection(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const importData = JSON.parse(e.target.result);
                if (!Array.isArray(importData)) throw new Error('Invalid format');

                let matched = 0;
                importData.forEach(entry => {
                    const item = AC_DATABASE.find(i => i.name === entry.name);
                    if (item) {
                        const data = {
                            owned: entry.owned || false,
                            wishlist: entry.wishlist || false,
                            hasBox: entry.hasBox || false,
                            condition: entry.condition || '',
                            copies: entry.copies || 0,
                            pricePaid: entry.pricePaid || '',
                            acquiredDate: entry.acquiredDate || '',
                            notes: entry.notes || ''
                        };
                        A.setItemData(item.id, data);
                        matched++;
                    }
                });

                A.renderItems();
                A.showToast(`Imported ${matched} of ${importData.length} items`);
            } catch (err) {
                A.showToast('Import failed — invalid file');
            }
        };
        reader.readAsText(file);
    }

    // Expose on namespace
    A.exportCollection = exportCollection;
    A.importCollection = importCollection;

})();
