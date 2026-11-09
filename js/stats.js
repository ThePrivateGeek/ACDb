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
        AC_DATABASE.forEach(item => {
            if (A.getItemData(item.id).owned) owned++;
        });
        const percent = total > 0 ? Math.round((owned / total) * 100) : 0;

        dom.totalItems.textContent = total;
        dom.ownedItems.textContent = owned;
        dom.completionPercent.textContent = percent + '%';
        dom.progressFill.style.width = (total > 0 ? (owned / total) * 100 : 0) + '%';

        // Update dashboard if open
        if (dom.statsDashboard.classList.contains('open')) {
            renderStatsDashboard();
        }
    }

    function shortenGameName(name) {
        return A.SHORT_GAME_NAMES[name] || name;
    }

    // ---- Spending ----
    // A price as whole cents, or null when the field holds no usable price.
    // "0" is a price (a gift). Blank, text and negative numbers are not:
    // a backup file or a synced row can carry anything up to 20 characters.
    function priceCents(value) {
        const text = value == null ? '' : String(value).trim();
        const cents = Math.round(Number(text) * 100);
        return text !== '' && Number.isSafeInteger(cents) && cents >= 0 ? cents : null;
    }

    // Everything the Spending panels show, in one pass over the catalog.
    // Only owned items count, and a price counts once whatever the copies.
    // Sums are in cents, so 0.10 + 0.20 is 0.30.
    function spendingSummary(items, getData) {
        const summary = { owned: 0, priced: 0, totalCents: 0, top: null, byCategory: {}, byYear: {}, undated: 0 };
        items.forEach(item => {
            const data = getData(item.id);
            if (!data.owned) return;
            summary.owned++;
            const cents = priceCents(data.pricePaid);
            if (cents !== null) {
                summary.priced++;
                summary.totalCents += cents;
                summary.byCategory[item.category] = (summary.byCategory[item.category] || 0) + cents;
                // On a tie the earlier catalog item stays
                if (!summary.top || cents > summary.top.cents) summary.top = { item, cents };
            }
            const year = /^\d{4}-/.test(data.acquiredDate || '') ? data.acquiredDate.slice(0, 4) : '';
            if (!year) {
                summary.undated++;
                return;
            }
            const row = summary.byYear[year] || (summary.byYear[year] = { count: 0, cents: 0 });
            row.count++;
            row.cents += cents || 0;
        });
        return summary;
    }

    // "€1,240.50", or "€1,241" in a bar row. The symbol goes in front of a
    // plain number: Intl's own currency style prints "US$" for dollars. A
    // symbol of letters gets a space: "NOK 1,240.50".
    const MONEY = new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const MONEY_WHOLE = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });

    function formatMoney(cents, symbol, whole) {
        const number = (whole ? MONEY_WHOLE : MONEY).format(cents / 100);
        return symbol + (/\p{L}$/u.test(symbol) ? ' ' : '') + number;
    }

    // The symbol shown before amounts. A view preference kept in this
    // browser only: it is never synced or sent, and nothing is converted.
    // A–Z by name, as the Currency dropdown lists them. A `whole` currency
    // has no smaller unit in use, so its amounts show no decimals.
    const CURRENCY_KEY = 'acdb_currency';
    const CURRENCIES = {
        gbp: { name: 'British pound', symbol: '£' },
        cad: { name: 'Canadian dollar', symbol: 'CA$' },
        cny: { name: 'Chinese yuan', symbol: '¥' },
        dkk: { name: 'Danish krone', symbol: 'DKK' },
        eur: { name: 'Euro', symbol: '€' },
        jpy: { name: 'Japanese yen', symbol: '¥', whole: true },
        nok: { name: 'Norwegian krone', symbol: 'NOK' },
        sek: { name: 'Swedish krona', symbol: 'SEK' },
        usd: { name: 'US dollar', symbol: '$' },
    };
    const NO_CURRENCY = { name: 'No symbol', symbol: '' };

    function isCurrency(code) {
        return Object.prototype.hasOwnProperty.call(CURRENCIES, code);
    }

    function getCurrency() {
        const code = A.store.get(CURRENCY_KEY);
        return isCurrency(code) ? code : '';
    }

    function setCurrency(code) {
        if (isCurrency(code)) A.store.set(CURRENCY_KEY, code);
        else A.store.remove(CURRENCY_KEY);
    }

    // "No symbol", then "British pound (£)" … "US dollar ($)"
    function fillCurrencyOptions(select) {
        if (select.options.length) return;
        select.innerHTML = `<option value="">${NO_CURRENCY.name}</option>`
            + Object.entries(CURRENCIES).map(([code, c]) =>
                `<option value="${code}">${A.escapeHTML(`${c.name} (${c.symbol})`)}</option>`).join('');
    }

    // Rows of plain amounts, unlike renderBars' "owned of total": a gold bar
    // sized against the largest in the list (`share`, 0 to 1) and the figure
    // beside it (`valueHTML`, already escaped; `valueTitle` for the exact
    // amount). The bar is aria-hidden: the figure says the same. A row with
    // `filter` is a button that filters the collection to its label (app.js).
    function renderValueBars(container, rows) {
        const esc = A.escapeHTML;
        container.innerHTML = rows.map(row => {
            const open = row.filter
                ? `<button type="button" class="stats-bar-row clickable" data-label="${esc(row.label)}">`
                : '<div class="stats-bar-row">';
            const pct = Math.min(100, Math.round(row.share * 100));
            const valueTitle = row.valueTitle ? ` title="${esc(row.valueTitle)}"` : '';
            return `${open}
                <span class="stats-bar-label" title="${esc(row.label)}">${esc(row.label)}</span>
                <span class="progress stats-bar-track" aria-hidden="true"><span class="progress-fill" style="width:${pct}%"></span></span>
                <span class="stats-bar-value"${valueTitle}>${row.valueHTML}</span>
            ${row.filter ? '</button>' : '</div>'}`;
        }).join('');
    }

    // Spending, Spent by category and Collected by year. They don't follow
    // the % / # / Timeline control: categories go largest first, years
    // newest first.
    const NO_DATE_LABEL = 'No date';

    function renderSpending() {
        const dom = A.dom;
        const esc = A.escapeHTML;
        const s = spendingSummary(AC_DATABASE, A.getItemData);
        const code = getCurrency();
        const currency = CURRENCIES[code] || NO_CURRENCY;
        // The exact amount; `whole` rounds it for a bar row
        const exact = cents => formatMoney(cents, currency.symbol, currency.whole);
        const money = (cents, whole) => esc(formatMoney(cents, currency.symbol, whole || currency.whole));

        dom.statsCurrencyRow.hidden = s.priced === 0;
        fillCurrencyOptions(dom.statsCurrency);
        dom.statsCurrency.value = code;

        if (s.priced === 0) {
            dom.statsSpending.innerHTML = '<p class="stats-empty">Add a price paid to an item to see your spending.</p>';
            dom.statsSpendByCategory.innerHTML = '<p class="stats-empty">No prices yet</p>';
        } else {
            const top = s.top.item;
            dom.statsSpending.innerHTML = `
                <div class="stats-bar-row stats-summary">
                    <span class="stats-bar-label">Total spent</span>
                    <span class="stats-bar-value">${money(s.totalCents)}</span>
                </div>
                <div class="stats-bar-row">
                    <span class="stats-bar-label">Items with a price</span>
                    <span class="stats-bar-value">${s.priced} / ${s.owned}</span>
                </div>
                <div class="stats-bar-row" title="Average over the items that have a price">
                    <span class="stats-bar-label">Average per item</span>
                    <span class="stats-bar-value">${money(Math.round(s.totalCents / s.priced))}</span>
                </div>
                <div class="stats-bar-row">
                    <span class="stats-bar-label">Most expensive</span>
                    <a class="link stats-bar-item" href="#${esc(A.getItemSlug(top))}" title="${esc(top.name)}">${esc(top.name)}</a>
                    <span class="stats-bar-value">${money(s.top.cents)}</span>
                </div>
            `;

            const categories = Object.entries(s.byCategory).sort((a, b) => b[1] - a[1]);
            const largest = categories[0][1] || 1;
            renderValueBars(dom.statsSpendByCategory, categories.map(([category, cents]) => ({
                label: category,
                share: cents / largest,
                valueHTML: money(cents, true),
                valueTitle: exact(cents),
                filter: true,
            })));
        }

        const years = Object.keys(s.byYear).sort((a, b) => b.localeCompare(a))
            .map(year => ({ label: year, ...s.byYear[year] }));
        if (s.undated > 0) years.push({ label: NO_DATE_LABEL, count: s.undated, cents: 0 });
        if (years.length === 0 || (years.length === 1 && years[0].label === NO_DATE_LABEL)) {
            dom.statsByYear.innerHTML = '<p class="stats-empty">No acquired dates yet</p>';
            return;
        }
        const mostItems = Math.max(...years.map(y => y.count));
        renderValueBars(dom.statsByYear, years.map(y => {
            const items = `${y.count}<span class="sr-only"> ${y.count === 1 ? 'item' : 'items'}${y.cents ? ',' : ''}</span>`;
            const spent = y.cents ? ` <span class="stats-bar-pct">${money(y.cents, true)}<span class="sr-only"> spent</span></span>` : '';
            return {
                label: y.label,
                share: y.count / mostItems,
                valueHTML: items + spent,
                valueTitle: y.cents ? exact(y.cents) : '',
            };
        }));
    }

    function renderStatsDashboard() {
        const dom = A.dom;
        const items = AC_DATABASE;

        // By Game
        const byGame = {};
        const ownedByGame = {};
        items.forEach(item => {
            byGame[item.game] = (byGame[item.game] || 0) + 1;
            const data = A.getItemData(item.id);
            if (data.owned) ownedByGame[item.game] = (ownedByGame[item.game] || 0) + 1;
        });
        renderBars(dom.statsByGame, byGame, ownedByGame, shortenGameName, true, true);

        // By Category
        const byCat = {};
        const ownedByCat = {};
        items.forEach(item => {
            byCat[item.category] = (byCat[item.category] || 0) + 1;
            const data = A.getItemData(item.id);
            if (data.owned) ownedByCat[item.category] = (ownedByCat[item.category] || 0) + 1;
        });
        renderBars(dom.statsByCategory, byCat, ownedByCat, null, true);

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
        renderReadingProgress(dom.statsReading);

        dom.statsByCondition.innerHTML = '';

        // Total copies summary
        if (ownedCount > 0) {
            const summary = document.createElement('div');
            summary.className = 'stats-bar-row stats-summary';
            summary.innerHTML = `
                <span class="stats-bar-label">Total Physical Items</span>
                <span class="stats-bar-value">${totalCopies}</span>
            `;
            dom.statsByCondition.appendChild(summary);
        }

        const conditionEntries = Object.entries(byCondition).sort((a, b) => b[1] - a[1]);
        if (conditionEntries.length === 0 && ownedCount === 0) {
            dom.statsByCondition.innerHTML = '<p class="stats-empty">No condition data yet</p>';
        } else {
            conditionEntries.forEach(([label, count]) => {
                const row = document.createElement('div');
                row.className = 'stats-bar-row';
                row.innerHTML = `
                    <span class="stats-bar-label">${A.escapeHTML(label)}</span>
                    <span class="stats-bar-value">${count}</span>
                `;
                dom.statsByCondition.appendChild(row);
            });
        }

        renderSpending();
    }

    // Nearly every series starts with the franchise name, which leaves no
    // room for the part that tells them apart. The row's title keeps it.
    function shortenSeriesName(name) {
        return name.replace(/^Assassin's Creed:?\s+/, '').replace(/^\((.+)\)$/, '$1') || name;
    }

    // Read progress per series, plus one row for the stories outside any
    // series. Only story publications count (A.isReadable).
    const STANDALONE_LABEL = 'Standalone';

    function renderReadingProgress(container) {
        const totals = {};
        const read = {};
        let readCount = 0;
        let readableCount = 0;
        AC_DATABASE.forEach(item => {
            if (!A.isReadable(item)) return;
            const key = item.series || STANDALONE_LABEL;
            totals[key] = (totals[key] || 0) + 1;
            readableCount++;
            if (A.getItemData(item.id).hasRead) {
                read[key] = (read[key] || 0) + 1;
                readCount++;
            }
        });
        renderBars(container, totals, read, shortenSeriesName, true, false, 'read');

        // Standalone isn't a series, so there's nothing to filter by.
        const standaloneRow = [...container.children].find(r => r.dataset.label === STANDALONE_LABEL);
        if (standaloneRow) standaloneRow.classList.remove('clickable');

        const summary = document.createElement('div');
        summary.className = 'stats-bar-row stats-summary';
        summary.innerHTML = `
            <span class="stats-bar-label">Stories Read</span>
            <span class="stats-bar-value">${readCount}/${readableCount}</span>
        `;
        container.prepend(summary);
    }

    // Bars are gold (progress); a finished row gets the status colour of
    // what it counts: `done` is 'owned' or 'read'.
    function renderBars(container, totals, owned, labelFn, clickable, gameOrdered, done = 'owned') {
        container.innerHTML = '';
        const statsSortMode = A.getStatsSortMode();
        // Timeline only applies to game-ordered panels; others fall back to the last non-timeline mode.
        const effectiveMode = (statsSortMode === 'timeline' && !gameOrdered)
            ? A.getLastBarSortMode()
            : statsSortMode;
        const sorted = Object.entries(totals).sort((a, b) => {
            if (effectiveMode === 'timeline') {
                const order = A.GAME_ORDER;
                const ia = order.indexOf(a[0]);
                const ib = order.indexOf(b[0]);
                const safeA = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
                const safeB = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
                return safeA - safeB || b[1] - a[1];
            }
            if (owned) {
                if (effectiveMode === 'count') {
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
            row.className = 'stats-bar-row' + (clickable ? ' clickable' : '');
            if (clickable) row.dataset.label = label;
            row.innerHTML = `
                <span class="stats-bar-label" title="${label}">${labelFn ? labelFn(label) : label}</span>
                <span class="progress stats-bar-track"><span class="progress-fill" style="width:${pct}%"></span></span>
                <span class="stats-bar-value">${owned ? ownedCount + '/' + total + ' <span class="stats-bar-pct' + (pct === 100 ? ' done-' + done : '') + '">' + (pct === 100 ? '&#10003; ' : '') + pct + '%</span>' : total}</span>
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
    A.getCurrency = getCurrency;
    A.setCurrency = setCurrency;
    // For the spreadsheet export and the printed inventory (collection.js)
    A.priceCents = priceCents;
    // An amount with the visitor's currency symbol: "€1,240.50", "¥1,500"
    A.formatAmount = cents => {
        const currency = CURRENCIES[getCurrency()] || NO_CURRENCY;
        return formatMoney(cents, currency.symbol, currency.whole);
    };
    A.statsInternals = { priceCents, spendingSummary, formatMoney };   // tools/test-spending.mjs

})();
