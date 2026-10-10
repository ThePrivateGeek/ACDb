/* ============================================
   ACDb - Reading Order View
   ============================================ */

(function () {
    'use strict';

    window.ACDB = window.ACDB || {};
    const A = window.ACDB;

    // Chronological or release order; a per-viewer preference, so it lives in
    // localStorage like the filters.
    const MODE_KEY = 'acdb_reading_mode';
    const MODES = ['chronological', 'release'];

    const view = document.getElementById('readingView');
    const content = document.getElementById('readingContent');
    const modalRow = document.getElementById('modalReadingOrder');

    // The "By Series" tab sits among the orders' tabs (#reading/series lists
    // the series, #reading/series/<slug> opens one).
    const SERIES_TAB = { id: 'series', name: 'By Series' };

    let currentOrderId = null;   // a READING_ORDERS id, or SERIES_TAB.id
    let currentGame = null;      // game filter (orders with "games": true), or null for all
    let currentSeries = null;    // slug of the open series page; null shows the list

    // Open era/year sections per view (order, mode and game filter). All
    // start open; folding is kept while the page is open so re-renders
    // (Read switches, sync) don't undo it.
    const openSections = new Map();
    let sectionKey = null;       // the rendered view's key into openSections

    function getMode() {
        try {
            const mode = localStorage.getItem(MODE_KEY);
            return MODES.includes(mode) ? mode : MODES[0];
        } catch {
            return MODES[0];
        }
    }

    function setMode(mode) {
        try { localStorage.setItem(MODE_KEY, mode); } catch { /* storage unavailable */ }
    }

    function getOrder(id) {
        return READING_ORDERS.find(o => o.id === id) || READING_ORDERS[0];
    }

    // Entries in the order the given mode reads them. The list itself is the
    // chronological order; release order sorts a copy by date.
    function sortedEntries(order, mode) {
        if (mode === 'release') return [...order.entries].sort((a, b) => a.released.localeCompare(b.released));
        return order.entries;
    }

    // "Assassin's Creed: Brotherhood (Novel)" -> "Brotherhood"
    // Names that only make sense with the franchise prefix ("Assassin's
    // Creed Vol. 1: Desmond", "Assassin's Creed (comic)") stay whole.
    function shortTitle(item) {
        const short = item.name
            .replace(/^Assassin's Creed(:| -)?\s+/, '')
            .replace(/\s+\((Novel|Comic)\)$/, '');
        return /^(Vol\.|\()/.test(short) ? item.name : short;
    }

    function eraOf(year) {
        const era = READING_ERAS.find(e => e.until === null || year < e.until);
        return era ? era.name : '';
    }

    // Shows only what's known: "26 Nov 2009", "Nov 2009" or "2009".
    function formatReleased(entry) {
        if (entry.releasedPrecision === 'year') return entry.released.slice(0, 4);
        const parts = entry.releasedPrecision === 'month'
            ? { month: 'short', year: 'numeric' }
            : { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(entry.released + 'T00:00:00Z').toLocaleDateString('en-GB', { ...parts, timeZone: 'UTC' });
    }

    // ---- Game filter ----
    // "General" items aren't tied to one game: they're the original stories.
    function gameLabel(game) {
        return game === 'General' ? 'Original stories' : (A.SHORT_GAME_NAMES[game] || game);
    }

    function gameSlug(game) {
        return A.slugify(gameLabel(game));
    }

    // Games present in an order, in timeline order with General last.
    function gamesIn(order) {
        const counts = new Map();
        order.entries.forEach(e => {
            const item = A.findItemByRef(e.item);
            if (item) counts.set(item.game, (counts.get(item.game) || 0) + 1);
        });
        const rank = g => g === 'General' ? Infinity : (A.GAME_ORDER.indexOf(g) + 1 || A.GAME_ORDER.length);
        return [...counts.keys()].sort((a, b) => rank(a) - rank(b)).map(game => ({ game, count: counts.get(game) }));
    }

    function readingHash() {
        return '#reading/' + currentOrderId + (currentGame ? '/' + gameSlug(currentGame) : '');
    }

    // ---- Series ----
    // Every series with a book in the orders gets its own page. Its books are
    // the orders' entries for that series, in the orders' story order (each
    // book once, Complete Lore first), so a series reads exactly as it does
    // in Complete Lore; collected editions stay out, as they do there. A
    // curated order named after a series (Oliver Bowden Novels) is that
    // series' page. The catalog and orders are static, so this is built once.
    const TYPE_NAMES = {
        'Novel': ['novel', 'novels'],
        'Comic Book': ['comic book', 'comic books'],
        'Graphic Novel': ['graphic novel', 'graphic novels'],
        'Manga': ['manga', 'manga'],
        'Gamebook': ['gamebook', 'gamebooks']
    };
    const NON_CANON_ORDER = 'non-canon';
    let seriesCache = null;

    // "Assassin's Creed: Uprising" -> "Uprising",
    // "Assassin's Creed (Les Deux Royaumes)" -> "Les Deux Royaumes"
    function seriesLabel(name) {
        return name.replace(/^Assassin's Creed(:| -)?\s*/, '').replace(/^\((.*)\)$/, '$1');
    }

    // "Renaissance", or "Ancient World – Industrial Age" for a series that
    // moves through history. Entries without a year don't count.
    function eraSpan(entries) {
        const years = entries.map(e => e.year).filter(y => y != null);
        if (years.length === 0) return '';
        const first = eraOf(years[0]);
        const last = eraOf(years[years.length - 1]);
        return first === last ? first : `${first} – ${last}`;
    }

    function allSeries() {
        if (seriesCache) return seriesCache;
        const seen = new Set();
        const bySeries = new Map();
        READING_ORDERS.forEach(order => order.entries.forEach(entry => {
            if (seen.has(entry.item)) return;
            seen.add(entry.item);
            const item = A.findItemByRef(entry.item);
            if (!item || !item.series) return;
            if (!bySeries.has(item.series)) bySeries.set(item.series, { entries: [], nonCanon: true });
            const series = bySeries.get(item.series);
            series.entries.push(entry);
            if (order.id !== NON_CANON_ORDER) series.nonCanon = false;
        }));
        seriesCache = [...bySeries].map(([name, { entries, nonCanon }]) => {
            const label = seriesLabel(name);
            const types = [...new Set(entries.map(e => A.findItemByRef(e.item).type))];
            return {
                name,
                label,
                slug: A.slugify(label),
                entries,
                types,
                nonCanon,
                eras: eraSpan(entries),
                curated: READING_ORDERS.find(o => o.name === name) || null
            };
        });
        return seriesCache;
    }

    function findSeries(slug) {
        return allSeries().find(s => s.slug === slug) || null;
    }

    function seriesHash(series) {
        return series.curated ? '#reading/' + series.curated.id : '#reading/' + SERIES_TAB.id + '/' + series.slug;
    }

    // "12 comic books", "1 novel", "4 comic books and graphic novels"
    function countPhrase(count, types) {
        const words = types.map(t => (TYPE_NAMES[t] || [t.toLowerCase(), t.toLowerCase()])[count === 1 ? 0 : 1]);
        const list = words.length > 1 ? words.slice(0, -1).join(', ') + ' and ' + words[words.length - 1] : words[0];
        return `${count} ${list}`;
    }

    // A series page is drawn like an order: same list, modes and progress,
    // under its own header card (seriesHeaderHTML).
    function seriesAsOrder(series) {
        return {
            name: series.label,
            entries: series.entries,
            series
        };
    }

    // ---- View ----
    // `param` is the hash after "reading/": "<order>", "<order>/<game>",
    // "series" or "series/<slug>".
    function showReadingOrder(param) {
        A.hideMainContent('reading');
        document.getElementById('profileView').style.display = 'none';
        document.getElementById('leaderboardView').style.display = 'none';
        view.style.display = '';
        const [orderId, slug] = (param || '').split('/');
        currentGame = null;
        currentSeries = null;
        if (orderId === SERIES_TAB.id) {
            const series = slug ? findSeries(slug) : null;
            if (series && series.curated) {
                // One page per series: the curated order is canonical.
                history.replaceState(null, '', seriesHash(series));
                currentOrderId = series.curated.id;
            } else {
                currentOrderId = SERIES_TAB.id;
                currentSeries = series ? series.slug : null;
            }
        } else {
            const order = getOrder(orderId);
            currentOrderId = order.id;
            const match = order.games && slug ? gamesIn(order).find(g => gameSlug(g.game) === slug) : null;
            currentGame = match ? match.game : null;
        }
        render(currentOrderId === SERIES_TAB.id);
        window.scrollTo(0, 0);
    }

    function isVisible() {
        return view.style.display !== 'none';
    }

    // The collection changed (an edit here, in the modal, or from sync).
    function refreshReadingView() {
        if (isVisible()) render();
    }

    // `enter` fades the page in: moving between the series list and series
    // pages. Re-renders (Read switches, sync, filters) don't animate.
    function render(enter = false) {
        const chipScroll = content.querySelector('.reading-games')?.scrollLeft || 0;
        const showList = currentOrderId === SERIES_TAB.id && !currentSeries;
        const page = showList ? seriesListHTML() : orderHTML(currentOrder());
        content.innerHTML = tabsHTML() + `<div class="reading-page${enter ? ' reading-page-enter' : ''}">${page}</div>`;
        restoreChipRow(chipScroll);
        updateFoldAll();
    }

    function currentOrder() {
        return currentOrderId === SERIES_TAB.id
            ? seriesAsOrder(findSeries(currentSeries))
            : getOrder(currentOrderId);
    }

    // Complete Lore, By Series, then the other curated orders.
    function tabsHTML() {
        const tabs = [READING_ORDERS[0], SERIES_TAB, ...READING_ORDERS.slice(1)];
        return `<nav class="tabs reading-tabs" aria-label="Reading orders">${tabs.map(t =>
            `<a href="#reading/${t.id}" class="tab${t.id === currentOrderId ? ' active" aria-current="page' : ''}">${A.escapeHTML(t.name)}</a>`).join('')}</nav>`;
    }

    function readCountOf(entries) {
        return entries.filter(e => A.getItemData(e.item).hasRead).length;
    }

    function coverOf(item) {
        return Array.isArray(item.image) && item.image.length > 0 ? item.image[0] : null;
    }

    const SOURCES_HTML = `<p class="reading-sources">Chronology from the <a href="https://assassinscreed.fandom.com/wiki/User_blog:Kulurak/Chronological_order_of_Assassin%27s_Creed_franchise" target="_blank" rel="noopener noreferrer">Assassin's Creed Wiki</a>, checked against each book's article. Books are placed by their main story; frame stories are left out.</p>`;

    function orderHTML(order) {
        const mode = getMode();
        const entries = sortedEntries(order, mode)
            .filter(e => !currentGame || A.findItemByRef(e.item)?.game === currentGame);
        const esc = A.escapeHTML;
        const readCount = readCountOf(entries);
        const pct = Math.round((readCount / entries.length) * 100);

        const gameChips = order.games
            ? `<div class="reading-games" role="group" aria-label="Read with a game">
                <button class="chip reading-game${!currentGame ? ' active' : ''}" data-game="" aria-pressed="${!currentGame}">All <span class="chip-count">${order.entries.length}</span></button>
                ${gamesIn(order).map(g => `<button class="chip reading-game${g.game === currentGame ? ' active' : ''}" data-game="${esc(g.game)}" aria-pressed="${g.game === currentGame}" title="${esc(g.game === 'General' ? 'Original stories not tied to one game' : g.game)}">${esc(gameLabel(g.game))} <span class="chip-count">${g.count}</span></button>`).join('')}
            </div>`
            : '';

        const rowHTML = (entry, idx) => {
            const item = A.findItemByRef(entry.item);
            if (!item) return '';
            const data = A.getItemData(item.id);
            const thumb = coverOf(item);
            return `
                <li class="reading-entry${data.hasRead ? ' read' : ''}" data-entry="${item.id}">
                    <span class="reading-num">${idx + 1}</span>
                    <button class="reading-cover" data-open="${item.id}" aria-label="Open ${esc(item.name)}">
                        ${thumb ? `<img src="${esc(thumb)}" alt="" loading="lazy">` : ''}
                    </button>
                    <div class="reading-info">
                        <button class="reading-title" data-open="${item.id}" title="${esc(item.name)}">${esc(shortTitle(item))}</button>
                        <div class="reading-meta">
                            <span class="reading-setting${mode === 'chronological' ? ' primary' : ''}">Set ${esc(entry.setting)}</span>
                            <span class="reading-released${mode === 'release' ? ' primary' : ''}">Released ${formatReleased(entry)}</span>
                            ${data.owned ? '<span class="reading-owned">Owned</span>' : ''}
                        </div>
                    </div>
                    <label class="reading-toggle">
                        <span class="reading-toggle-text">Read</span>
                        <div class="toggle-switch toggle-read">
                            <input type="checkbox" data-read="${item.id}"${data.hasRead ? ' checked' : ''}>
                            <span class="toggle-slider"></span>
                        </div>
                    </label>
                </li>`;
        };

        // Long orders get headings: eras in chronological mode, release
        // years in release mode. Numbering runs on across sections.
        const sections = [];
        entries.forEach((entry, idx) => {
            const heading = !order.eras ? ''
                : mode === 'chronological' ? eraOf(entry.year) : entry.released.slice(0, 4);
            let section = sections[sections.length - 1];
            if (!section || section.heading !== heading) {
                section = { heading, start: idx + 1, rows: [], read: 0 };
                sections.push(section);
            }
            section.rows.push(rowHTML(entry, idx));
            if (A.getItemData(entry.item).hasRead) section.read++;
        });
        // Shortcut to the first unread book in the current mode.
        const nextIndex = entries.findIndex(e => !A.getItemData(e.item).hasRead);
        const nextItem = nextIndex >= 0 && A.findItemByRef(entries[nextIndex].item);
        const upNext = nextItem && readCount > 0
            ? `<button class="btn btn-sm btn-secondary reading-up-next" data-jump="${nextItem.id}">Up next: ${esc(shortTitle(nextItem))}</button>`
            : '';
        const progress = `
                <div class="reading-progress">
                    <span class="progress-count reading-progress-text">${readCount} / ${entries.length} read</span>
                    <span class="progress"><span class="progress-fill" style="width:${pct}%"></span></span>
                </div>`;

        // Headed sections fold; see openSections.
        const foldable = sections.length > 0 && sections[0].heading !== '';
        sectionKey = foldable ? `${order.id}/${mode}/${currentGame || ''}` : null;
        if (foldable && !openSections.has(sectionKey)) {
            openSections.set(sectionKey, new Set(sections.map(sec => sec.heading)));
        }
        const open = foldable ? openSections.get(sectionKey) : null;
        const list = sections.map(sec => {
            const ol = `<ol class="reading-list" start="${sec.start}">${sec.rows.join('')}</ol>`;
            if (!foldable) return ol;
            return `
                <details class="reading-fold" data-section="${esc(sec.heading)}"${open.has(sec.heading) ? ' open' : ''}>
                    <summary><h4 class="section-head reading-section"><span>${esc(sec.heading)}</span><span class="section-head-count">${sec.read}/${sec.rows.length}</span></h4></summary>
                    ${ol}
                </details>`;
        }).join('');
        const foldAll = foldable && sections.length > 1 ? '<button class="link link-quiet reading-fold-all" data-fold-all></button>' : '';

        const modes = `
                <div class="seg reading-modes" role="group" aria-label="Reading order">
                    ${MODES.map(m => `<button class="seg-btn reading-mode${m === mode ? ' active' : ''}" data-mode="${m}" aria-pressed="${m === mode}">${m === 'chronological' ? 'Chronological' : 'Release'}</button>`).join('')}
                </div>`;

        // A series page opens under a breadcrumb, with a header card (first
        // cover, what it is, progress, Up next, the whole series in the
        // collection) and links to the series before and after it.
        if (order.series) {
            return `
                ${seriesHeaderHTML(order.series, progress, upNext)}
                <div class="reading-bar">${modes}</div>
                ${list}
                ${seriesPagerHTML(order.series)}
                ${SOURCES_HTML}
            `;
        }

        return `
            <div class="reading-intro">
                <h3 class="reading-name sr-only">${esc(order.name)}</h3>
                <p class="reading-description">${esc(order.description)}</p>
            </div>
            ${gameChips}
            <div class="reading-bar">${modes}${progress}</div>
            ${upNext || foldAll ? `<div class="reading-list-tools">${upNext}${foldAll}</div>` : ''}
            ${list}
            ${SOURCES_HTML}
        `;
    }

    function seriesHeaderHTML(series, progress, upNext) {
        const esc = A.escapeHTML;
        const thumb = coverOf(A.findItemByRef(series.entries[0].item));
        const where = series.nonCanon ? 'outside the main continuity' : 'placed as in Complete Lore';
        const meta = [countPhrase(series.entries.length, series.types), series.nonCanon ? 'Non-canon' : series.eras, where]
            .filter(Boolean).map(esc).join(' · ');
        return `
            <nav aria-label="Breadcrumb">
                <ol class="crumbs reading-crumbs">
                    <li><a href="#reading/series">By Series</a></li>
                    <li aria-current="page">${esc(series.label)}</li>
                </ol>
            </nav>
            <div class="series-head">
                <span class="series-head-cover">${thumb ? `<img src="${esc(thumb)}" alt="">` : ''}</span>
                <div class="series-head-body">
                    <h3 class="series-head-title">${esc(series.label)}</h3>
                    <p class="series-head-meta">${meta}</p>
                    ${progress}
                    <div class="series-head-actions">
                        ${upNext}
                        <button class="link reading-series-link" data-series-filter="${esc(series.name)}">See the whole series in the collection &rarr;</button>
                    </div>
                </div>
            </div>`;
    }

    // The series before and after this one, in the list's story order
    function seriesPagerHTML(series) {
        const esc = A.escapeHTML;
        const all = allSeries();
        const at = all.findIndex(s => s.slug === series.slug);
        const prev = all[at - 1];
        const next = all[at + 1];
        return `
            <nav class="series-pager" aria-label="Other series">
                ${prev ? `<a class="link link-quiet" href="${seriesHash(prev)}"><span aria-hidden="true">&larr;</span> ${esc(prev.label)}</a>` : '<span></span>'}
                ${next ? `<a class="link link-quiet" href="${seriesHash(next)}">${esc(next.label)} <span aria-hidden="true">&rarr;</span></a>` : ''}
            </nav>`;
    }

    // "Collapse all" once every section is open, "Expand all" otherwise.
    function updateFoldAll() {
        const button = content.querySelector('[data-fold-all]');
        if (!button) return;
        const allOpen = [...content.querySelectorAll('.reading-fold')].every(fold => fold.open);
        button.textContent = allOpen ? 'Collapse all' : 'Expand all';
        button.dataset.foldAll = allOpen ? 'collapse' : 'expand';
    }

    // Series in story order (by where each one starts), non-canon last.
    // Series under way are repeated at the top under "Continue reading".
    function seriesListHTML() {
        const esc = A.escapeHTML;
        const all = allSeries();
        const rowHTML = (series) => {
            const read = readCountOf(series.entries);
            const total = series.entries.length;
            const done = read === total;
            const thumb = coverOf(A.findItemByRef(series.entries[0].item));
            const kinds = series.types.map(t => (TYPE_NAMES[t] || [t, t])[1]).join(', ');
            const when = series.nonCanon ? 'Non-canon' : series.eras;
            return `
                <li>
                    <a class="series-row${done ? ' done' : ''}" href="${seriesHash(series)}" title="${esc(series.name)}">
                        <span class="series-cover">${thumb ? `<img src="${esc(thumb)}" alt="" loading="lazy">` : ''}</span>
                        <span class="series-info">
                            <span class="series-name">${esc(series.label)}</span>
                            <span class="series-meta">${esc(kinds.charAt(0).toUpperCase() + kinds.slice(1))}${when ? ` · ${esc(when)}` : ''}</span>
                        </span>
                        <span class="series-progress">
                            <span class="progress-count${done ? ' done-read' : ''}">${done ? '<span aria-label="Finished">&#10003;</span> ' : ''}${read} / ${total}</span>
                            <span class="progress"><span class="progress-fill" style="width:${Math.round((read / total) * 100)}%"></span></span>
                        </span>
                    </a>
                </li>`;
        };
        const underway = all.filter(s => {
            const read = readCountOf(s.entries);
            return read > 0 && read < s.entries.length;
        });
        const section = (title, list) => `
            <h4 class="section-head reading-section"><span>${title}</span><span class="section-head-count">${list.length}</span></h4>
            <ul class="series-list">${list.map(rowHTML).join('')}</ul>`;
        return `
            <div class="reading-intro">
                <h3 class="reading-name sr-only">${esc(SERIES_TAB.name)}</h3>
                <p class="reading-description">Read one series at a time. Every series in the reading orders, in story order, with its books placed as in Complete Lore.</p>
            </div>
            ${underway.length ? section('Continue reading', underway) : ''}
            ${section('All series', all)}
            ${SOURCES_HTML}
        `;
    }

    // Re-rendering resets the chip row's scroll: restore it, then make sure
    // the active chip is visible (e.g. after a deep link).
    function restoreChipRow(scrollLeft) {
        const chipRow = content.querySelector('.reading-games');
        if (!chipRow) return;
        chipRow.scrollLeft = scrollLeft;
        const active = chipRow.querySelector('.reading-game.active');
        if (active.offsetLeft < chipRow.scrollLeft) {
            chipRow.scrollLeft = active.offsetLeft;
        } else if (active.offsetLeft + active.offsetWidth > chipRow.scrollLeft + chipRow.clientWidth) {
            chipRow.scrollLeft = active.offsetLeft + active.offsetWidth - chipRow.clientWidth;
        }
    }

    content.addEventListener('click', (e) => {
        const modeBtn = e.target.closest('[data-mode]');
        if (modeBtn) {
            setMode(modeBtn.dataset.mode);
            render();
            return;
        }
        const gameBtn = e.target.closest('[data-game]');
        if (gameBtn) {
            currentGame = gameBtn.dataset.game || null;
            // Replace, not push: switching filters shouldn't fill the back button.
            history.replaceState(null, '', readingHash());
            render();
            return;
        }
        const seriesLink = e.target.closest('[data-series-filter]');
        if (seriesLink) {
            A.showMainContent();
            A.clearHash();
            A.applyExclusiveFilter('series', seriesLink.dataset.seriesFilter);
            return;
        }
        const foldAllBtn = e.target.closest('[data-fold-all]');
        if (foldAllBtn) {
            const expand = foldAllBtn.dataset.foldAll === 'expand';
            content.querySelectorAll('.reading-fold').forEach(fold => { fold.open = expand; });
            return;   // each fold's toggle event updates openSections and the label
        }
        const jumpBtn = e.target.closest('[data-jump]');
        if (jumpBtn) {
            const row = content.querySelector(`[data-entry="${jumpBtn.dataset.jump}"]`);
            if (row) {
                const fold = row.closest('.reading-fold');
                if (fold) fold.open = true;
                row.scrollIntoView({ behavior: ACDB.scrollBehavior(), block: 'center' });
                row.classList.remove('flash');
                void row.offsetWidth;   // restart the highlight animation
                row.classList.add('flash');
            }
            return;
        }
        const openBtn = e.target.closest('[data-open]');
        if (openBtn) A.openModalOverView(Number(openBtn.dataset.open));
    });

    // A section opened or closed (by its heading, "Collapse all" or a jump).
    // Toggle events don't bubble, so this listens in the capture phase.
    content.addEventListener('toggle', (e) => {
        const fold = e.target;
        if (!fold.classList || !fold.classList.contains('reading-fold') || !sectionKey) return;
        const open = openSections.get(sectionKey);
        if (fold.open) open.add(fold.dataset.section);
        else open.delete(fold.dataset.section);
        updateFoldAll();
    }, true);

    content.addEventListener('change', (e) => {
        const toggle = e.target.closest('[data-read]');
        if (!toggle) return;
        const id = Number(toggle.dataset.read);
        const data = A.getItemData(id);
        A.setItemData(id, { ...data, hasRead: toggle.checked, readDate: toggle.checked ? (data.readDate || '') : '' });
        A.renderItems();   // also re-renders this view
    });

    // ---- Item modal: "Reading order" line ----
    // One line per order containing the item, with its position in the
    // viewer's chosen mode and a link to the next book. Hidden in read-only
    // mode (profiles, leaderboard), where leaving the view isn't wanted.
    function fillModalReadingOrder(item, readOnly) {
        const orders = readOnly ? [] : READING_ORDERS.filter(o => o.entries.some(e => e.item === item.id));
        modalRow.hidden = orders.length === 0;
        if (orders.length === 0) {
            modalRow.innerHTML = '';
            return;
        }
        const mode = getMode();
        const esc = A.escapeHTML;
        modalRow.innerHTML = orders.map(order => {
            const entries = sortedEntries(order, mode);
            const idx = entries.findIndex(e => e.item === item.id);
            const next = entries[idx + 1] && A.findItemByRef(entries[idx + 1].item);
            const nextHTML = next
                ? `<a class="modal-reading-next" href="#${A.slugify(next.name)}" data-next="${next.id}">Next: ${esc(shortTitle(next))}</a>`
                : '<span class="modal-reading-last">Last book</span>';
            return `
                <span class="modal-reading-line">
                    <span class="modal-series-label">Reading order</span>
                    <a class="modal-reading-name" href="#reading/${order.id}" data-order="${order.id}">${esc(order.name)}</a>
                    <span class="modal-series-count" title="Position in ${mode} order">${idx + 1} of ${entries.length}</span>
                    ${nextHTML}
                </span>`;
        }).join('');
    }

    // Opened over the reading view, the modal stays on top of it: "Next"
    // swaps the book in place, and the order link just closes the modal.
    // Otherwise the links navigate like any other hash link.
    modalRow.addEventListener('click', (e) => {
        if (!A.isModalOverView()) return;
        const next = e.target.closest('[data-next]');
        if (next) {
            e.preventDefault();
            A.switchModalItem(Number(next.dataset.next));
            return;
        }
        const orderLink = e.target.closest('[data-order]');
        if (orderLink && orderLink.dataset.order === currentOrderId) {
            e.preventDefault();
            A.closeModal();
        }
    });

    // Expose on namespace
    A.showReadingOrder = showReadingOrder;
    A.refreshReadingView = refreshReadingView;
    A.fillModalReadingOrder = fillModalReadingOrder;

})();
