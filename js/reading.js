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
    function shortTitle(item) {
        return item.name
            .replace(/^Assassin's Creed:?\s+/, '')
            .replace(/\s+\((Novel|Comic)\)$/, '');
    }

    function formatReleased(date) {
        return new Date(date + 'T00:00:00Z').toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
        });
    }

    // ---- View ----
    function showReadingOrder(orderId) {
        A.hideMainContent();
        document.getElementById('profileView').style.display = 'none';
        document.getElementById('leaderboardView').style.display = 'none';
        view.style.display = '';
        currentOrderId = getOrder(orderId).id;
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
        const order = getOrder(currentOrderId);
        const mode = getMode();
        const entries = sortedEntries(order, mode);
        const esc = A.escapeHTML;
        const readCount = entries.filter(e => A.getItemData(e.item).hasRead).length;
        const pct = Math.round((readCount / entries.length) * 100);

        const tabs = READING_ORDERS.length > 1
            ? `<nav class="reading-tabs">${READING_ORDERS.map(o =>
                `<a href="#reading/${o.id}" class="reading-tab${o.id === order.id ? ' active' : ''}">${esc(o.name)}</a>`).join('')}</nav>`
            : '';

        const rows = entries.map((entry, idx) => {
            const item = A.findItemByRef(entry.item);
            if (!item) return '';
            const data = A.getItemData(item.id);
            const thumb = Array.isArray(item.image) && item.image.length > 0 ? item.image[0] : null;
            return `
                <li class="reading-entry${data.hasRead ? ' read' : ''}">
                    <span class="reading-num">${idx + 1}</span>
                    <button class="reading-cover" data-open="${item.id}" aria-label="Open ${esc(item.name)}">
                        ${thumb ? `<img src="${esc(thumb)}" alt="" loading="lazy">` : ''}
                    </button>
                    <div class="reading-info">
                        <button class="reading-title" data-open="${item.id}" title="${esc(item.name)}">${esc(shortTitle(item))}</button>
                        <div class="reading-meta">
                            <span class="reading-setting${mode === 'chronological' ? ' primary' : ''}">Set ${esc(entry.setting)}</span>
                            <span class="reading-released${mode === 'release' ? ' primary' : ''}">Released ${formatReleased(entry.released)}</span>
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
        }).join('');

        content.innerHTML = `
            ${tabs}
            <div class="reading-intro">
                <h3 class="reading-name">${esc(order.name)}</h3>
                <p class="reading-description">${esc(order.description)}</p>
            </div>
            <div class="reading-bar">
                <div class="reading-modes" role="group" aria-label="Reading order">
                    ${MODES.map(m => `<button class="reading-mode${m === mode ? ' active' : ''}" data-mode="${m}" aria-pressed="${m === mode}">${m === 'chronological' ? 'Chronological' : 'Release'}</button>`).join('')}
                </div>
                <div class="reading-progress">
                    <span class="reading-progress-text">${readCount} / ${entries.length} read</span>
                    <div class="stats-bar-track"><div class="stats-bar-fill" style="width:${pct}%"></div></div>
                </div>
            </div>
            <ol class="reading-list">${rows}</ol>
            <p class="reading-sources">Chronology from the <a href="https://assassinscreed.fandom.com/wiki/User_blog:Kulurak/Chronological_order_of_Assassin%27s_Creed_franchise" target="_blank" rel="noopener noreferrer">Assassin's Creed Wiki</a>, checked against each book's article. Books are placed by their main story; frame stories are left out.</p>
        `;
    }

    content.addEventListener('click', (e) => {
        const modeBtn = e.target.closest('[data-mode]');
        if (modeBtn) {
            setMode(modeBtn.dataset.mode);
            render();
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
