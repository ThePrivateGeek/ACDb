/* ============================================
   ACDb - Stats Dashboard & Celebration
   ============================================ */

(function () {
    'use strict';

    window.ACDB = window.ACDB || {};
    const A = window.ACDB;

    function updateStats() {
        const dom = A.dom;
        const total = AC_DATABASE.length;
        let owned = 0;
        let totalValue = 0;
        AC_DATABASE.forEach(item => {
            const data = A.getItemData(item.id);
            if (data.owned) {
                owned++;
                if (data.pricePaid) totalValue += parseFloat(data.pricePaid) || 0;
            }
        });
        const percent = total > 0 ? Math.round((owned / total) * 100) : 0;

        dom.totalItems.textContent = total;
        dom.ownedItems.textContent = owned;
        dom.completionPercent.textContent = percent + '%';

        // Update dashboard if open
        if (dom.statsDashboard.classList.contains('open')) {
            renderStatsDashboard(AC_DATABASE);
        }
    }

    function shortenGameName(name) {
        return A.SHORT_GAME_NAMES[name] || name;
    }

    function renderStatsDashboard(filtered) {
        const dom = A.dom;
        const items = filtered || A.getFilteredItems();

        // By Game
        const byGame = {};
        const ownedByGame = {};
        items.forEach(item => {
            byGame[item.game] = (byGame[item.game] || 0) + 1;
            const data = A.getItemData(item.id);
            if (data.owned) ownedByGame[item.game] = (ownedByGame[item.game] || 0) + 1;
        });
        renderBars(dom.statsByGame, byGame, ownedByGame, shortenGameName);

        // By Category
        const byCat = {};
        const ownedByCat = {};
        items.forEach(item => {
            byCat[item.category] = (byCat[item.category] || 0) + 1;
            const data = A.getItemData(item.id);
            if (data.owned) ownedByCat[item.category] = (ownedByCat[item.category] || 0) + 1;
        });
        renderBars(dom.statsByCategory, byCat, ownedByCat);

        // By Condition (owned items only) — simple count list + total copies
        const byCondition = {};
        let ownedCount = 0;
        let totalCopies = 0;
        items.forEach(item => {
            const data = A.getItemData(item.id);
            if (data.owned) {
                ownedCount++;
                totalCopies += parseInt(data.copies) || 1;
                if (data.condition) {
                    const label = A.formatCondition(data.condition);
                    byCondition[label] = (byCondition[label] || 0) + 1;
                }
            }
        });
        dom.statsByCondition.innerHTML = '';

        // Total copies summary
        if (ownedCount > 0) {
            const summary = document.createElement('div');
            summary.className = 'stats-bar-row';
            summary.innerHTML = `
                <span class="stats-bar-label" style="color:var(--accent)">Total Physical Items</span>
                <span class="stats-bar-value" style="color:var(--accent)">${totalCopies}</span>
            `;
            dom.statsByCondition.appendChild(summary);
        }

        const conditionEntries = Object.entries(byCondition).sort((a, b) => b[1] - a[1]);
        if (conditionEntries.length === 0 && ownedCount === 0) {
            dom.statsByCondition.innerHTML = '<span class="stats-bar-value" style="text-align:left">No condition data yet</span>';
        } else {
            conditionEntries.forEach(([label, count]) => {
                const row = document.createElement('div');
                row.className = 'stats-bar-row';
                row.innerHTML = `
                    <span class="stats-bar-label">${label}</span>
                    <span class="stats-bar-value">${count}</span>
                `;
                dom.statsByCondition.appendChild(row);
            });
        }
    }

    function renderBars(container, totals, owned, labelFn) {
        container.innerHTML = '';
        const statsSortMode = A.getStatsSortMode();
        const sorted = Object.entries(totals).sort((a, b) => {
            if (owned) {
                if (statsSortMode === 'count') {
                    const countA = owned[a[0]] || 0;
                    const countB = owned[b[0]] || 0;
                    return countB - countA || b[1] - a[1];
                }
                const pctA = (owned[a[0]] || 0) / a[1];
                const pctB = (owned[b[0]] || 0) / b[1];
                return pctB - pctA || b[1] - a[1];
            }
            return b[1] - a[1];
        });

        sorted.forEach(([label, total]) => {
            const ownedCount = owned ? (owned[label] || 0) : total;
            const pct = owned ? Math.round((ownedCount / total) * 100) : 100;

            const row = document.createElement('div');
            row.className = 'stats-bar-row';
            row.innerHTML = `
                <span class="stats-bar-label" title="${label}">${labelFn ? labelFn(label) : label}</span>
                <div class="stats-bar-track">
                    <div class="stats-bar-fill green" style="width:${pct}%"></div>
                </div>
                <span class="stats-bar-value">${owned ? ownedCount + '/' + total + ' <span class="stats-bar-pct' + (pct === 100 ? ' complete' : '') + '">' + pct + '%</span>' : total}</span>
                ${owned && pct === 100 ? '<span class="stats-complete-badge">&#10003;</span>' : ''}
            `;
            container.appendChild(row);
        });
    }

    function checkCompletionCelebration() {
        const currentItemId = A.getCurrentItemId();
        if (currentItemId === null) return;
        const item = AC_DATABASE.find(i => i.id === currentItemId);
        if (!item) return;
        const data = A.getItemData(currentItemId);
        if (!data.owned) return;

        // Check if this item's game is now 100%
        const gameItems = AC_DATABASE.filter(i => i.game === item.game);
        const gameOwned = gameItems.filter(i => A.getItemData(i.id).owned).length;
        if (gameOwned === gameItems.length) {
            A.launchConfetti();
            A.showCelebration(`${A.SHORT_GAME_NAMES[item.game] || item.game} — 100% complete!`);
            return;
        }

        // Check if this item's category is now 100%
        const catItems = AC_DATABASE.filter(i => i.category === item.category);
        const catOwned = catItems.filter(i => A.getItemData(i.id).owned).length;
        if (catOwned === catItems.length) {
            A.launchConfetti();
            A.showCelebration(`${item.category} — 100% complete!`);
        }
    }

    // Expose on namespace
    A.updateStats = updateStats;
    A.renderStatsDashboard = renderStatsDashboard;
    A.checkCompletionCelebration = checkCompletionCelebration;

})();
