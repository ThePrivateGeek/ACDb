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

    let currentOrderId = null;
    let currentGame = null;   // game filter (orders with "games": true), or null for all

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

    // ---- View ----
    // `param` is the hash after "reading/": "<order>" or "<order>/<game>".
    function showReadingOrder(param) {
        A.hideMainContent('reading');
        document.getElementById('profileView').style.display = 'none';
        document.getElementById('leaderboardView').style.display = 'none';
        view.style.display = '';
        const [orderId, slug] = (param || '').split('/');
        const order = getOrder(orderId);
        currentOrderId = order.id;
        const match = order.games && slug ? gamesIn(order).find(g => gameSlug(g.game) === slug) : null;
        currentGame = match ? match.game : null;
        render();
        window.scrollTo(0, 0);
    }

    function isVisible() {
        return view.style.display !== 'none';
    }

    // The collection changed (an edit here, in the modal, or from sync).
    function refreshReadingView() {
        if (isVisible()) render();
    }

    function render() {
        const chipScroll = content.querySelector('.reading-games')?.scrollLeft || 0;
        const order = getOrder(currentOrderId);
        const mode = getMode();
        const entries = sortedEntries(order, mode)
            .filter(e => !currentGame || A.findItemByRef(e.item)?.game === currentGame);
        const esc = A.escapeHTML;
        const readCount = entries.filter(e => A.getItemData(e.item).hasRead).length;
        const pct = Math.round((readCount / entries.length) * 100);

        const tabs = READING_ORDERS.length > 1
            ? `<nav class="reading-tabs">${READING_ORDERS.map(o =>
                `<a href="#reading/${o.id}" class="reading-tab${o.id === order.id ? ' active' : ''}">${esc(o.name)}</a>`).join('')}</nav>`
            : '';

        const gameChips = order.games
            ? `<div class="reading-games" role="group" aria-label="Read with a game">
                <button class="reading-game${!currentGame ? ' active' : ''}" data-game="" aria-pressed="${!currentGame}">All <span>${order.entries.length}</span></button>
                ${gamesIn(order).map(g => `<button class="reading-game${g.game === currentGame ? ' active' : ''}" data-game="${esc(g.game)}" aria-pressed="${g.game === currentGame}" title="${esc(g.game === 'General' ? 'Original stories not tied to one game' : g.game)}">${esc(gameLabel(g.game))} <span>${g.count}</span></button>`).join('')}
            </div>`
            : '';

        const rowHTML = (entry, idx) => {
            const item = A.findItemByRef(entry.item);
            if (!item) return '';
            const data = A.getItemData(item.id);
            const thumb = Array.isArray(item.image) && item.image.length > 0 ? item.image[0] : null;
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
                        <div class="toggle-switch">
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
        const list = sections.map(sec => `
            ${sec.heading ? `<h4 class="reading-section"><span>${esc(sec.heading)}</span><span class="reading-section-count">${sec.read}/${sec.rows.length}</span></h4>` : ''}
            <ol class="reading-list" start="${sec.start}">${sec.rows.join('')}</ol>`).join('');

        // Shortcut to the first unread book in the current mode.
        const nextEntry = entries.find(e => !A.getItemData(e.item).hasRead);
        const nextItem = nextEntry && A.findItemByRef(nextEntry.item);
        const upNext = nextItem && readCount > 0
            ? `<button class="reading-up-next" data-jump="${nextItem.id}">Up next: ${esc(shortTitle(nextItem))}</button>`
            : '';

        content.innerHTML = `
            ${tabs}
            <div class="reading-intro">
                <h3 class="reading-name">${esc(order.name)}</h3>
                <p class="reading-description">${esc(order.description)}</p>
            </div>
            ${gameChips}
            <div class="reading-bar">
                <div class="reading-modes" role="group" aria-label="Reading order">
                    ${MODES.map(m => `<button class="reading-mode${m === mode ? ' active' : ''}" data-mode="${m}" aria-pressed="${m === mode}">${m === 'chronological' ? 'Chronological' : 'Release'}</button>`).join('')}
                </div>
                <div class="reading-progress">
                    <span class="reading-progress-text">${readCount} / ${entries.length} read</span>
                    <div class="stats-bar-track"><div class="stats-bar-fill" style="width:${pct}%"></div></div>
                </div>
            </div>
            ${upNext}
            ${list}
            <p class="reading-sources">Chronology from the <a href="https://assassinscreed.fandom.com/wiki/User_blog:Kulurak/Chronological_order_of_Assassin%27s_Creed_franchise" target="_blank" rel="noopener noreferrer">Assassin's Creed Wiki</a>, checked against each book's article. Books are placed by their main story; frame stories are left out.</p>
        `;

        // Re-rendering resets the chip row's scroll: restore it, then make
        // sure the active chip is visible (e.g. after a deep link).
        const chipRow = content.querySelector('.reading-games');
        if (chipRow) {
            chipRow.scrollLeft = chipScroll;
            const active = chipRow.querySelector('.reading-game.active');
            if (active.offsetLeft < chipRow.scrollLeft) {
                chipRow.scrollLeft = active.offsetLeft;
            } else if (active.offsetLeft + active.offsetWidth > chipRow.scrollLeft + chipRow.clientWidth) {
                chipRow.scrollLeft = active.offsetLeft + active.offsetWidth - chipRow.clientWidth;
            }
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
        const jumpBtn = e.target.closest('[data-jump]');
        if (jumpBtn) {
            const row = content.querySelector(`[data-entry="${jumpBtn.dataset.jump}"]`);
            if (row) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                row.classList.remove('flash');
                void row.offsetWidth;   // restart the highlight animation
                row.classList.add('flash');
            }
            return;
        }
        const openBtn = e.target.closest('[data-open]');
        if (openBtn) A.openModalOverView(Number(openBtn.dataset.open));
    });

    content.addEventListener('change', (e) => {
        const toggle = e.target.closest('[data-read]');
        if (!toggle) return;
        const id = Number(toggle.dataset.read);
        const data = A.getItemData(id);
        A.setItemData(id, { ...data, hasRead: toggle.checked, readDate: toggle.checked ? (data.readDate || '') : '' });
        A.renderItems();   // also re-renders this view
    });

    document.getElementById('readingBackBtn').addEventListener('click', () => {
        A.showMainContent();
        A.clearHash();
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
