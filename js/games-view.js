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

    const SEARCH_ICON = '<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>';
    const CLEAR_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

    const SOURCES_HTML = `<p class="reading-sources">Every released game with its DLCs; cosmetic packs, multiplayer map and character packs and seasonal events are left out. Settings from the <a href="https://assassinscreed.fandom.com/wiki/User_blog:Kulurak/Chronological_order_of_Assassin%27s_Creed_franchise" target="_blank" rel="noopener noreferrer">Assassin's Creed Wiki</a>; release dates, developers and platforms from Ubisoft, the platform stores and the press. Games are placed by their main historical story; the modern-day story is left out. Cover art &copy; Ubisoft.</p>`;

    const view = document.getElementById('gamesView');
    const content = document.getElementById('gamesContent');

    let currentKind = '';    // '' for all kinds
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
    // that came out on one platform
    function kindLine(game) {
        if (game.remakeOf) return 'Remake';
        const label = KIND_LABELS[game.kind] || '';
        return game.kind !== 'main' && game.platforms.length === 1 ? `${label} · ${game.platforms[0]}` : label;
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
        if (game && A.openGameDialog) A.openGameDialog(game, { fromHash: true });
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
    A.gameKindLine = kindLine;

})();
