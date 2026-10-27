/* ============================================
   ACDb - Games View
   ============================================

   The Games tab (#games): every game in js/games.js as a card, in release
   order (a grid) or story order (a timeline under era headings, with the
   DLCs that have their own place in the lore), with search and kind chips.
   #games/<slug> opens a game (the game dialog). */

(function () {
    'use strict';

    window.ACDB = window.ACDB || {};
    const A = window.ACDB;

    // Release or story order; a per-viewer preference like the reading mode.
    // The kind chip and the search last for the visit only.
    const MODE_KEY = 'acdb_games_mode';
    const MODES = ['release', 'story'];
    // The tab opens on the main games; "All" and the other kinds are a chip away
    const DEFAULT_KIND = 'main';

    const KIND_LABELS = {
        'main': 'Main game',
        'spin-off': 'Spin-off',
        'handheld': 'Handheld',
        'mobile': 'Mobile',
        'browser': 'Browser',
        'vr': 'VR'
    };
    const KIND_CHIPS = {
        'main': 'Main games',
        'spin-off': 'Spin-offs',
        'handheld': 'Handheld',
        'mobile': 'Mobile',
        'browser': 'Browser',
        'vr': 'VR'
    };

    // The game dialog groups DLCs by type, in this order
    const DLC_GROUPS = [
        ['expansion', 'Expansions'],
        ['story', 'Story missions'],
        ['mode', 'Game modes'],
        ['discovery-tour', 'Discovery Tour']
    ];
    const SITE_URL = 'https://acdb.theprivategeek.com/';

    const SEARCH_ICON ='<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>';
    const CLEAR_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

    const SOURCES_HTML = `<p class="reading-sources">Every released game with its DLCs; cosmetic packs, multiplayer map and character packs and seasonal events are left out. Settings from the <a href="https://assassinscreed.fandom.com/wiki/User_blog:Kulurak/Chronological_order_of_Assassin%27s_Creed_franchise" target="_blank" rel="noopener noreferrer">Assassin's Creed Wiki</a>; release dates, developers and platforms from Ubisoft, the platform stores and the press. Games are placed by their main historical story; the modern-day story is left out. Cover art &copy; Ubisoft.</p>`;

    const view = document.getElementById('gamesView');
    const content = document.getElementById('gamesContent');
    const overlay = document.getElementById('gameOverlay');
    const frame = document.getElementById('gameModal');
    const coverEl = document.getElementById('gameModalCover');
    const detailsEl = document.getElementById('gameModalDetails');
    const shareBtn = document.getElementById('gameModalShare');
    const closeBtn = document.getElementById('gameModalClose');

    let currentKind = DEFAULT_KIND;    // '' for all kinds
    let searchText = '';

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

    function isVisible() {
        return view.style.display !== 'none';
    }

    // ---- Wording ----
    // "Main game", "Remake", or "Handheld · PS Vita" for a non-main game
    // that came out on one platform (not "Browser · Browser")
    function kindLine(game) {
        if (game.remakeOf) return 'Remake';
        const label = KIND_LABELS[game.kind] || '';
        const only = game.platforms.length === 1 ? game.platforms[0] : null;
        return game.kind !== 'main' && only && only !== label ? `${label} · ${only}` : label;
    }

    // "Set" reads oddly before text like "After the main story"
    function setText(setting) {
        return /^\d|^c\. /.test(setting) ? `Set ${setting}` : setting;
    }

    function count(n, one, many) {
        return `${n} ${n === 1 ? one : many}`;
    }

    function shortName(name) {
        return (A.SHORT_GAME_NAMES && A.SHORT_GAME_NAMES[name]) || name;
    }

    function itemCount(name) {
        return AC_DATABASE.filter(item => item.game === name).length;
    }

    // ---- Filtering ----
    // Search ignores case and accents ("ragnarok" finds Dawn of Ragnarök)
    function fold(text) {
        return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    }

    function shownGames() {
        const query = fold(searchText.trim());
        return GAMES.filter(game => {
            if (currentKind && game.kind !== currentKind) return false;
            if (!query) return true;
            return fold(game.name).includes(query) || game.dlcs.some(dlc => fold(dlc.name).includes(query));
        });
    }

    // ---- Page ----
    function render() {
        const esc = A.escapeHTML;
        const mode = getMode();
        const dlcCount = GAMES.reduce((n, g) => n + g.dlcs.length, 0);
        const kinds = Object.keys(KIND_CHIPS)
            .map(kind => ({ kind, count: GAMES.filter(g => g.kind === kind).length }))
            .filter(k => k.count > 0);
        if (currentKind && !kinds.some(k => k.kind === currentKind)) currentKind = '';
        const chip = (kind, label, n) => {
            const on = kind === currentKind;
            return `<button class="chip${on ? ' active' : ''}" data-games-kind="${kind}" aria-pressed="${on}">${esc(label)} <span class="chip-count">${n}</span></button>`;
        };
        content.innerHTML = `
            <p class="reading-description">Every Assassin's Creed game with its DLCs: ${count(GAMES.length, 'game', 'games')} and ${count(dlcCount, 'DLC', 'DLCs')}. Cosmetic packs, multiplayer map and character packs and seasonal events are left out.</p>
            <div class="games-toolbar">
                <div class="search-box games-search">
                    ${SEARCH_ICON}
                    <label class="sr-only" for="gamesSearch">Search games</label>
                    <input type="search" id="gamesSearch" placeholder="Search games…" autocomplete="off" value="${esc(searchText)}"${searchText ? ' class="is-set"' : ''}>
                    <button type="button" class="icon-btn icon-btn-sm icon-btn-bare clear-search${searchText ? ' visible' : ''}" data-games-clear-search aria-label="Clear search">${CLEAR_ICON}</button>
                </div>
                <div class="seg" role="group" aria-label="Order">
                    ${MODES.map(m => `<button class="seg-btn${m === mode ? ' active' : ''}" data-games-mode="${m}" aria-pressed="${m === mode}">${m === 'release' ? 'Release' : 'Story order'}</button>`).join('')}
                </div>
            </div>
            <div class="chip-row games-kinds" role="group" aria-label="Kind">
                ${chip('', 'All', GAMES.length)}
                ${kinds.map(k => chip(k.kind, KIND_CHIPS[k.kind], k.count)).join('')}
            </div>
            <div class="games-results">${resultsHTML()}</div>
            ${SOURCES_HTML}
        `;
    }

    // Only the list re-renders while typing, so the search keeps its caret
    function renderResults() {
        const results = content.querySelector('.games-results');
        if (results) results.innerHTML = resultsHTML();
    }

    function resultsHTML() {
        const games = shownGames();
        if (games.length === 0) {
            return `
                <div class="games-empty">
                    <p>No games match your search.</p>
                    <button class="btn btn-secondary btn-sm" data-games-clear>Clear search and filters</button>
                </div>`;
        }
        return getMode() === 'story' ? timelineHTML(games) : gridHTML(games);
    }

    function coverHTML(image, cls) {
        const esc = A.escapeHTML;
        return image
            ? `<span class="${cls}"><img src="${esc(image)}" alt="" loading="lazy"></span>`
            : `<span class="${cls} game-nocover">${A.GAME_ICON}</span>`;
    }

    // ---- Release order: a grid of cards ----
    function gridHTML(games) {
        const esc = A.escapeHTML;
        const tiles = games.map(game => {
            const slug = A.gameUrlSlug(game);
            const items = itemCount(game.name);
            const pills = [
                game.dlcs.length ? count(game.dlcs.length, 'DLC', 'DLCs') : '',
                items ? count(items, 'item', 'items') : ''
            ].filter(Boolean).map(text => `<span class="badge badge-plain">${text}</span>`).join('');
            return `
                <li>
                    <a class="game-tile" href="#games/${slug}" data-game-slug="${slug}">
                        ${coverHTML(game.image, 'game-tile-cover')}
                        <span class="game-tile-body">
                            <span class="game-kind">${esc(kindLine(game))}</span>
                            <h3 class="game-tile-title">${esc(game.name)}</h3>
                            <span class="game-tile-meta">${game.released.slice(0, 4)} · ${esc(setText(game.setting))}</span>
                            ${pills ? `<span class="game-tile-foot">${pills}</span>` : ''}
                        </span>
                    </a>
                </li>`;
        }).join('');
        return `<ul class="games-grid">${tiles}</ul>`;
    }

    // ---- Story order: a timeline under era headings ----
    // Games by start year (then release date); a DLC with its own place in
    // the lore ("marker") sits at its own year. Games without a year (some
    // mobile, browser and VR games span eras) come last.
    function timelineRows(games) {
        const rows = [];
        games.forEach(game => {
            rows.push({ game, year: game.year, released: game.released });
            game.dlcs.forEach(dlc => {
                if (dlc.marker) rows.push({ game, dlc, year: dlc.year, released: dlc.released });
            });
        });
        const key = y => (y == null ? Infinity : y);
        return rows.sort((a, b) =>
            key(a.year) - key(b.year)
            || (a.dlc ? 1 : 0) - (b.dlc ? 1 : 0)
            || a.released.localeCompare(b.released));
    }

    function timelineHTML(games) {
        const esc = A.escapeHTML;
        const sections = [];
        timelineRows(games).forEach(row => {
            const heading = row.year == null ? 'Across eras' : A.eraOf(row.year);
            let section = sections[sections.length - 1];
            if (!section || section.heading !== heading) {
                section = { heading, rows: [], games: 0 };
                sections.push(section);
            }
            section.rows.push(row.dlc ? dlcRowHTML(row) : gameRowHTML(row.game));
            if (!row.dlc) section.games++;
        });
        return sections.map(sec => `
            <h3 class="section-head reading-section"><span>${esc(sec.heading)}</span><span class="section-head-count">${sec.games}</span></h3>
            <ol class="games-tl-list">${sec.rows.join('')}</ol>`).join('');
    }

    function gameRowHTML(game) {
        const esc = A.escapeHTML;
        const slug = A.gameUrlSlug(game);
        const items = itemCount(game.name);
        const lore = A.loreLinkFor(game.name);
        const shown = game.dlcs.slice(0, 3).map(dlc => `<span class="badge badge-plain">${esc(dlc.name)}</span>`);
        if (game.dlcs.length > 3) shown.push(`<span class="badge badge-plain">+${game.dlcs.length - 3} more</span>`);
        const counts = [
            lore ? `<span><b>${lore.count}</b> ${lore.count === 1 ? 'story' : 'stories'}</span>` : '',
            items ? `<span><b>${items}</b> ${items === 1 ? 'item' : 'items'}</span>` : ''
        ].join('');
        return `
            <li class="games-tl-row">
                <span class="games-tl-year">${game.year == null ? '' : A.yearLabel(game.year)}</span>
                <span class="games-tl-dot" aria-hidden="true"></span>
                <a class="games-tl-card" href="#games/${slug}" data-game-slug="${slug}">
                    ${coverHTML(game.image, 'games-tl-cover')}
                    <span class="games-tl-body">
                        <span class="game-kind">${esc(kindLine(game))}</span>
                        <h4 class="games-tl-title">${esc(game.name)}</h4>
                        <span class="games-tl-meta"><span>${esc(setText(game.setting))}</span><span>Released ${A.formatReleased(game)}</span></span>
                        ${game.remakeOf ? `<span class="games-tl-note">Remake of ${esc(game.remakeOf)}</span>` : ''}
                        ${shown.length ? `<span class="games-tl-dlcs">${shown.join('')}</span>` : ''}
                    </span>
                    ${counts ? `<span class="games-tl-counts">${counts}</span>` : ''}
                </a>
            </li>`;
    }

    function dlcRowHTML({ game, dlc }) {
        const esc = A.escapeHTML;
        const slug = A.gameUrlSlug(game);
        return `
            <li class="games-tl-row">
                <span class="games-tl-year">${A.yearLabel(dlc.year)}</span>
                <span class="games-tl-dot games-tl-dot-dlc" aria-hidden="true"></span>
                <a class="games-tl-dlc" href="#games/${slug}" data-game-slug="${slug}" data-dlc="${esc(dlc.name)}">
                    ${coverHTML(dlc.image, 'game-dlc-cover')}
                    <span class="games-tl-body">
                        <span class="game-kind">Story DLC · ${esc(shortName(game.name))}</span>
                        <span class="games-tl-dlc-name">${esc(dlc.name)}</span>
                        <span class="games-tl-meta"><span>${esc(setText(dlc.setting))}</span><span>Released ${A.formatReleased(dlc)}</span></span>
                    </span>
                </a>
            </li>`;
    }

    // Re-rendering resets the chip row's scroll: restore it, then make sure
    // the active chip is visible (as the reading view does)
    function restoreChipRow(scrollLeft) {
        const row = content.querySelector('.games-kinds');
        if (!row) return;
        row.scrollLeft = scrollLeft;
        const active = row.querySelector('.chip.active');
        if (!active) return;
        if (active.offsetLeft < row.scrollLeft) {
            row.scrollLeft = active.offsetLeft;
        } else if (active.offsetLeft + active.offsetWidth > row.scrollLeft + row.clientWidth) {
            row.scrollLeft = active.offsetLeft + active.offsetWidth - row.clientWidth;
        }
    }

    function updatePressed(selector, isOn) {
        content.querySelectorAll(selector).forEach(btn => {
            const on = isOn(btn);
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-pressed', String(on));
        });
    }

    // ---- Game dialog ----
    // Styled like the item modal, but it meets DESIGN.md's dialog floor:
    // role="dialog", focus moves in (to Close, the first control, so a ring
    // never outlines the whole dialog) and is trapped, and returns on close.
    // From the Games view it has an address (#games/<slug>); over another
    // view (a game row in Complete Lore) it pushes a duplicate history entry
    // like the item modal over a view, so back closes it.
    let dialogGame = null;
    let dialogOverView = false;
    let opener = null;            // the element that opened the dialog
    let openerSelector = '';      // finds it again after a re-render
    let releaseTrap = null;

    function isGameDialogOpen() {
        return overlay.classList.contains('active');
    }

    function isShown(el) {
        return !!el && el !== document.body && el.isConnected && el.getClientRects().length > 0;
    }

    function selectorFor(el) {
        const parts = ['gameSlug', 'gameDialog', 'dlc']
            .filter(key => el.dataset[key] !== undefined)
            .map(key => `[data-${key.replace(/[A-Z]/g, c => '-' + c.toLowerCase())}="${CSS.escape(el.dataset[key])}"]`);
        return parts.length ? el.tagName.toLowerCase() + parts.join('') : '';
    }

    function metaRow(label, valueHTML) {
        return `<span class="modal-meta-label">${label}</span><span class="modal-meta-value">${valueHTML}</span>`;
    }

    function dlcHTML(dlc) {
        const esc = A.escapeHTML;
        const episodes = dlc.episodes
            ? `<span class="game-dlc-episodes">${dlc.episodes.map(ep => `<span class="game-dlc-episode">${esc(ep.name)} <span class="game-dlc-date">${A.formatReleased(ep)}</span></span>`).join(' · ')}</span>`
            : '';
        return `
            <li class="game-dlc" data-dlc="${esc(dlc.name)}">
                <span class="game-dlc-cover">${dlc.image ? `<img src="${esc(dlc.image)}" alt="" loading="lazy">` : A.GAME_ICON}</span>
                <span class="game-dlc-body">
                    <span class="game-dlc-name">${esc(dlc.name)}</span>
                    <span class="reading-meta">
                        <span>${esc(setText(dlc.setting))}</span>
                        <span>Released ${A.formatReleased(dlc)}</span>
                        ${dlc.note ? `<span>${esc(dlc.note)}</span>` : ''}
                        ${dlc.marker ? '<span class="reading-game-label">Own place in the lore</span>' : ''}
                    </span>
                    ${episodes}
                </span>
            </li>`;
    }

    function detailsHTML(game) {
        const esc = A.escapeHTML;
        const lore = A.loreLinkFor(game.name);
        const items = itemCount(game.name);
        const original = game.remakeOf ? GAMES.find(g => g.name === game.remakeOf) : null;
        const meta = [
            metaRow('Developer', esc(game.developer)),
            metaRow('Set', esc(game.setting)),
            metaRow('Released', A.formatReleased(game)),
            metaRow('Platforms', esc(game.platforms.join(' · '))),
            game.rereleases ? metaRow('Also released as', game.rereleases.map(r => `${esc(r.name)} (${r.released.slice(0, 4)})`).join(', ')) : '',
            original ? metaRow('Remake of', `<button class="link" data-game-switch="${A.gameUrlSlug(original)}">${esc(original.name)}</button>`) : ''
        ].join('');
        const links = [
            lore ? `<a class="link" href="${lore.hash}" data-game-leave>${count(lore.count, 'story', 'stories')} in Complete Lore &rarr;</a>` : '',
            items ? `<button class="link" data-game-catalog="${esc(game.name)}">${count(items, 'item', 'items')} in the collection &rarr;</button>` : ''
        ].join('');
        const groups = DLC_GROUPS
            .map(([type, label]) => ({ label, dlcs: game.dlcs.filter(dlc => dlc.type === type) }))
            .filter(group => group.dlcs.length > 0)
            .map(group => `
                <div class="game-dlc-group">
                    <span class="label">${group.label}</span>
                    <ul class="game-dlc-list">${group.dlcs.map(dlcHTML).join('')}</ul>
                </div>`).join('');
        return `
            <div class="modal-badges-row"><span class="badge badge-accent modal-badge">${game.remakeOf ? 'Remake' : esc(KIND_LABELS[game.kind] || '')}</span></div>
            <h2 class="modal-title" id="gameModalTitle">${esc(game.name)}</h2>
            <div class="modal-meta">${meta}</div>
            <p class="modal-description">${esc(game.description)}</p>
            ${links ? `<div class="game-modal-links">${links}</div>` : ''}
            ${game.dlcs.length ? `
                <h3 class="section-head game-modal-dlcs"><span>DLCs</span><span class="section-head-count">${game.dlcs.length}</span></h3>
                ${groups}` : ''}`;
    }

    function fill(game) {
        const esc = A.escapeHTML;
        dialogGame = game;
        coverEl.innerHTML = game.image
            ? `<img src="${esc(game.image)}" alt="${esc(game.name)} cover">`
            : `<span class="game-modal-nocover game-nocover">${A.GAME_ICON}</span>`;
        detailsEl.innerHTML = detailsHTML(game);
        // Desktop scrolls the details pane, phones the whole dialog
        frame.scrollTop = 0;
        detailsEl.scrollTop = 0;
    }

    // Bring a DLC's row into view and highlight it (the dialog must be open)
    function flashDlc(name) {
        const row = name && detailsEl.querySelector(`[data-dlc="${CSS.escape(name)}"]`);
        if (!row) return;
        row.scrollIntoView({ behavior: A.scrollBehavior(), block: 'center' });
        row.classList.remove('flash');
        void row.offsetWidth;   // restart the highlight animation
        row.classList.add('flash');
    }

    // fromHash: the address already names the game (a pasted link, back).
    // overView: opened over another view, which stays as it is underneath.
    // dlc: a DLC to highlight. opener: what to give focus back to.
    function openGameDialog(game, { fromHash = false, overView = false, dlc = null, opener: from = null } = {}) {
        if (!game) return;
        // Already open (the address changed to another game): refill in place
        if (isGameDialogOpen()) {
            fill(game);
            closeBtn.focus();
            flashDlc(dlc);
            return;
        }
        dialogOverView = overView;
        const candidate = from || document.activeElement;
        opener = isShown(candidate) ? candidate : null;
        openerSelector = opener ? selectorFor(opener) : '';
        if (overView) A.pushGameDialogState();
        else if (!fromHash) A.setGamesHash(A.gameUrlSlug(game));
        fill(game);
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
        releaseTrap = A.trapFocus(frame);
        flashDlc(dlc);
    }

    // silent: the address has already moved on (back, a route change or a
    // link out of the dialog), so history isn't touched and focus is only
    // returned if the opener is still on screen.
    function closeGameDialog({ silent = false } = {}) {
        if (!isGameDialogOpen()) return;
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        if (releaseTrap) releaseTrap();
        releaseTrap = null;
        if (!silent) {
            if (dialogOverView) A.popGameDialogState();
            else if (isVisible()) A.setGamesHash(null);
        }
        A.clearGameDialogState();
        const back = isShown(opener) ? opener
            : (openerSelector ? document.querySelector(openerSelector) : null);
        if (isShown(back)) {
            back.focus();
        } else if (!silent && isVisible()) {
            const title = view.querySelector('.page-title');
            title.tabIndex = -1;
            title.focus();
        }
        dialogGame = null;
        dialogOverView = false;
        opener = null;
        openerSelector = '';
    }

    // "Remake of": show the original in the same dialog
    function switchGame(game) {
        if (!game) return;
        fill(game);
        closeBtn.focus();   // the button that had focus was just replaced
        if (!dialogOverView && isVisible()) history.replaceState(null, '', '#games/' + A.gameUrlSlug(game));
    }

    // A link out of the dialog: over a view, the duplicate history entry
    // becomes the destination (no stale entry for back to land on);
    // otherwise the destination is pushed. Then route there.
    function leaveDialogTo(address, route) {
        if (dialogOverView && A.isGameDialogPushed()) {
            A.clearGameDialogState();
            history.replaceState(null, '', address);
        } else {
            history.pushState(null, '', address);
        }
        closeGameDialog({ silent: true });
        route();
    }

    function plainClick(e) {
        return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
    }

    closeBtn.addEventListener('click', () => closeGameDialog());
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeGameDialog();
    });

    if (A.canWebShare) {
        shareBtn.title = 'Share this game';
        shareBtn.setAttribute('aria-label', 'Share this game');
    }
    shareBtn.addEventListener('click', () => {
        if (!dialogGame) return;
        A.shareLink({ title: dialogGame.name, text: dialogGame.description, url: SITE_URL + '#games/' + A.gameUrlSlug(dialogGame) });
    });

    detailsEl.addEventListener('click', (e) => {
        const switchBtn = e.target.closest('[data-game-switch]');
        if (switchBtn) {
            switchGame(A.findGameBySlug(switchBtn.dataset.gameSwitch));
            return;
        }
        const leave = e.target.closest('[data-game-leave]');
        if (leave && plainClick(e)) {
            e.preventDefault();
            // Already showing that game's stories underneath: just close
            if (dialogOverView && leave.hash === window.location.hash) closeGameDialog();
            else leaveDialogTo(leave.getAttribute('href'), A.handleHash);
            return;
        }
        const catalog = e.target.closest('[data-game-catalog]');
        if (catalog) {
            const name = catalog.dataset.gameCatalog;
            leaveDialogTo(window.location.pathname + window.location.search, () => {
                A.showMainContent();
                A.applyExclusiveFilter('game', name);
            });
        }
    });

    // ---- View ----
    // `slug` opens that game; an already visible view keeps its scroll
    // (back from a game, or another game's address).
    function showGames(slug) {
        const wasVisible = isVisible();
        const chipScroll = wasVisible ? (content.querySelector('.games-kinds')?.scrollLeft || 0) : 0;
        A.hideMainContent('games');
        document.getElementById('profileView').style.display = 'none';
        document.getElementById('leaderboardView').style.display = 'none';
        document.getElementById('readingView').style.display = 'none';
        view.style.display = '';
        render();
        restoreChipRow(chipScroll);
        if (!wasVisible) window.scrollTo(0, 0);
        const game = slug ? A.findGameBySlug(slug) : null;
        if (game) {
            openGameDialog(game, { fromHash: true });
        } else if (slug) {
            // An unknown game: show the list
            closeGameDialog({ silent: true });
            history.replaceState(null, '', '#games');
        }
    }

    // The collection changed (item counts on the cards)
    function refreshGamesView() {
        if (isVisible()) renderResults();
    }

    content.addEventListener('input', (e) => {
        if (e.target.id !== 'gamesSearch') return;
        searchText = e.target.value;
        e.target.classList.toggle('is-set', searchText.trim() !== '');
        content.querySelector('[data-games-clear-search]').classList.toggle('visible', searchText !== '');
        renderResults();
    });

    content.addEventListener('click', (e) => {
        // A card or DLC row opens the game's dialog; a modified click still
        // opens the address in a new tab
        const card = e.target.closest('a[data-game-slug]');
        if (card) {
            if (!plainClick(e)) return;
            e.preventDefault();
            openGameDialog(A.findGameBySlug(card.dataset.gameSlug), { opener: card, dlc: card.dataset.dlc || null });
            return;
        }
        const modeBtn = e.target.closest('[data-games-mode]');
        if (modeBtn) {
            setMode(modeBtn.dataset.gamesMode);
            updatePressed('[data-games-mode]', btn => btn.dataset.gamesMode === getMode());
            renderResults();
            return;
        }
        const kindBtn = e.target.closest('[data-games-kind]');
        if (kindBtn) {
            currentKind = kindBtn.dataset.gamesKind;
            updatePressed('[data-games-kind]', btn => btn.dataset.gamesKind === currentKind);
            renderResults();
            return;
        }
        if (e.target.closest('[data-games-clear-search]')) {
            searchText = '';
            rerender();
            document.getElementById('gamesSearch').focus();
            return;
        }
        if (e.target.closest('[data-games-clear]')) {
            searchText = '';
            currentKind = '';
            rerender();
            document.getElementById('gamesSearch').focus();
        }
    });

    function rerender() {
        const chipScroll = content.querySelector('.games-kinds')?.scrollLeft || 0;
        render();
        restoreChipRow(chipScroll);
    }

    // Expose on namespace
    A.showGames = showGames;
    A.refreshGamesView = refreshGamesView;
    A.openGameDialog = openGameDialog;
    A.closeGameDialog = closeGameDialog;
    A.isGameDialogOpen = isGameDialogOpen;

})();
