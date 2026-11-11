/* ============================================
   ACDb - Games View
   ============================================

   The Games tab (#games): every game in js/games.js as a card, in release
   order (a grid) or story order (a timeline under era headings, with the
   DLCs that have their own place in the lore), with search and kind chips.
   #games/<slug> is a game's page: its facts, characters, DLCs and items in
   the collection. Visitors mark games and DLCs as played on a game's page
   (js/game-progress.js keeps it); the list shows it on the cards. */

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

    // A game's page groups its DLCs by type, in this order
    const DLC_GROUPS = [
        ['expansion', 'Expansions'],
        ['story', 'Story missions'],
        ['mode', 'Game modes'],
        ['discovery-tour', 'Discovery Tour']
    ];
    const SITE_URL = 'https://acdb.theprivategeek.com/';
    // On phones a long cast shows its first rows and a "Show all" button,
    // so the DLCs and items aren't a long scroll away
    const CAST_FOLD = 6;

    const SEARCH_ICON ='<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>';
    const CLEAR_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    const SHARE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';

    const SOURCES_HTML = `<p class="reading-sources">Every released game with its DLCs; cosmetic packs, multiplayer map and character packs and seasonal events are left out. Settings from the <a href="https://assassinscreed.fandom.com/wiki/User_blog:Kulurak/Chronological_order_of_Assassin%27s_Creed_franchise" target="_blank" rel="noopener noreferrer">Assassin's Creed Wiki</a>; release dates, developers and platforms from Ubisoft, the platform stores and the press. Games are placed by their main historical story; the modern-day story is left out. Cover art &copy; Ubisoft.</p>`;

    const view = document.getElementById('gamesView');
    const content = document.getElementById('gamesContent');

    let currentKind = DEFAULT_KIND;    // '' for all kinds
    let searchText = '';
    let currentSlug = null;            // the open game page; null shows the list
    let listScroll = 0;                // the list's scroll, for the way back from a page
    let pendingDlc = null;             // a DLC to highlight when its game's page opens
    let castShownFor = null;           // the game whose whole cast is shown (phones)

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

    // A played game or DLC on a card or row (they're links, so no switch)
    const PLAYED_BADGE = '<span class="badge badge-read">Played</span>';

    const CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

    // A DLC's Played tick, in front of its cover: the list reads as a checklist
    function playedCheckHTML(id, name) {
        const esc = A.escapeHTML;
        return `
            <span class="list-check list-check-read">
                <input type="checkbox" data-played="${id}" aria-label="Played: ${esc(name)}"${A.isPlayed(id) ? ' checked' : ''}>
                <span class="list-check-mark">${CHECK_ICON}</span>
            </span>`;
    }

    function shortName(name) {
        return (A.SHORT_GAME_NAMES && A.SHORT_GAME_NAMES[name]) || name;
    }

    function itemsOf(name) {
        return AC_DATABASE.filter(item => item.game === name);
    }

    function itemCount(name) {
        return itemsOf(name).length;
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

    // ---- List ----
    function listHTML() {
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
        return `
            <div class="page-head">
                <h2 class="page-title">Games</h2>
            </div>
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
        return playedHTML(games) + (getMode() === 'story' ? timelineHTML(games) : gridHTML(games));
    }

    // How many of the games shown (the kind chip and search apply) are played
    function playedHTML(games) {
        const played = games.filter(game => A.isPlayed(game.id)).length;
        const pct = Math.round(played / games.length * 100);
        return `
            <div class="reading-progress games-progress">
                <span class="progress-count reading-progress-text">${played} / ${games.length} played</span>
                <span class="progress" aria-hidden="true"><span class="progress-fill" style="width:${Math.min(pct, 100)}%"></span></span>
            </div>`;
    }

    function coverHTML(image, cls, lazy = true) {
        const esc = A.escapeHTML;
        return image
            ? `<span class="${cls}"><img src="${esc(image)}" alt=""${lazy ? ' loading="lazy"' : ''}></span>`
            : `<span class="${cls} game-nocover">${A.GAME_ICON}</span>`;
    }

    // ---- Release order: a grid of cards ----
    function gridHTML(games) {
        const esc = A.escapeHTML;
        const tiles = games.map(game => {
            const slug = A.gameUrlSlug(game);
            const items = itemCount(game.name);
            const played = A.isPlayed(game.id);
            const pills = (played ? PLAYED_BADGE : '') + [
                game.dlcs.length ? count(game.dlcs.length, 'DLC', 'DLCs') : '',
                items ? count(items, 'item', 'items') : ''
            ].filter(Boolean).map(text => `<span class="badge badge-plain">${text}</span>`).join('');
            return `
                <li>
                    <a class="game-tile${played ? ' played' : ''}" href="#games/${slug}" data-game-slug="${slug}">
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
        const played = A.isPlayed(game.id);
        const counts = [
            played ? PLAYED_BADGE : '',
            lore ? `<span><b>${lore.count}</b> ${lore.count === 1 ? 'story' : 'stories'}</span>` : '',
            items ? `<span><b>${items}</b> ${items === 1 ? 'item' : 'items'}</span>` : ''
        ].join('');
        return `
            <li class="games-tl-row">
                <span class="games-tl-year">${game.year == null ? '' : A.yearLabel(game.year)}</span>
                <span class="games-tl-dot" aria-hidden="true"></span>
                <a class="games-tl-card${played ? ' played' : ''}" href="#games/${slug}" data-game-slug="${slug}">
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
        const played = A.isPlayed(dlc.id);
        return `
            <li class="games-tl-row">
                <span class="games-tl-year">${A.yearLabel(dlc.year)}</span>
                <span class="games-tl-dot games-tl-dot-dlc" aria-hidden="true"></span>
                <a class="games-tl-dlc${played ? ' played' : ''}" href="#games/${slug}" data-game-slug="${slug}" data-dlc="${esc(dlc.name)}">
                    ${A.dlcCoverHTML(dlc.image, game.image, 'game-dlc-cover')}
                    <span class="games-tl-body">
                        <span class="game-kind">Story DLC · ${esc(shortName(game.name))}</span>
                        <span class="games-tl-dlc-name">${esc(dlc.name)}</span>
                        <span class="games-tl-meta"><span>${esc(setText(dlc.setting))}</span><span>Released ${A.formatReleased(dlc)}</span></span>
                    </span>
                    ${played ? PLAYED_BADGE : ''}
                </a>
            </li>`;
    }

    // ---- A game's page ----
    function metaRow(label, valueHTML) {
        return `<span class="modal-meta-label">${label}</span><span class="modal-meta-value">${valueHTML}</span>`;
    }

    function gameLinkHTML(game) {
        return `<a class="modal-reading-name" href="#games/${A.gameUrlSlug(game)}">${A.escapeHTML(game.name)}</a>`;
    }

    // A DLC card on its game's page: cover on top, then the Played tick
    // beside the name and facts (a DLC without a cover shows the game's art)
    function dlcHTML(dlc, game) {
        const esc = A.escapeHTML;
        const episodes = dlc.episodes
            ? `<span class="game-dlc-episodes">${dlc.episodes.map(ep => `<span class="game-dlc-episode">${esc(ep.name)} <span class="game-dlc-date">${A.formatReleased(ep)}</span></span>`).join('')}</span>`
            : '';
        const played = A.isPlayed(dlc.id);
        return `
            <li class="game-dlc${played ? ' played' : ''}" data-dlc="${esc(dlc.name)}">
                ${playedCheckHTML(dlc.id, dlc.name)}
                ${A.dlcCoverHTML(dlc.image, game.image, 'game-dlc-cover')}
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

    function pageHTML(game) {
        const esc = A.escapeHTML;
        const lore = A.loreLinkFor(game.name);
        const items = itemsOf(game.name);
        const owned = items.filter(item => A.getItemData(item.id).owned).length;
        const pct = items.length ? Math.round(owned / items.length * 100) : 0;
        const original = game.remakeOf ? GAMES.find(g => g.name === game.remakeOf) : null;
        const remakes = GAMES.filter(g => g.remakeOf === game.name);
        const cast = A.charactersOfGame(game.name);
        const folded = cast.length > CAST_FOLD && castShownFor !== game.name;
        const meta = [
            metaRow('Developer', esc(game.developer)),
            metaRow('Set', esc(game.setting)),
            metaRow('Released', A.formatReleased(game)),
            metaRow('Platforms', esc(game.platforms.join(' · '))),
            game.rereleases ? metaRow('Also released as', game.rereleases.map(r => `${esc(r.name)} (${r.released.slice(0, 4)})`).join(', ')) : '',
            original ? metaRow('Remake of', gameLinkHTML(original)) : '',
            remakes.length ? metaRow('Remade as', remakes.map(gameLinkHTML).join(', ')) : ''
        ].join('');
        const links = [
            lore ? `<a class="link" href="${lore.hash}">${count(lore.count, 'story', 'stories')} in Complete Lore &rarr;</a>` : '',
            items.length ? `<button class="link" data-game-catalog="${esc(game.name)}">Show in the collection &rarr;</button>` : '',
            `<button class="btn btn-quiet btn-sm" data-game-share>${SHARE_ICON}${A.canWebShare ? 'Share this game' : 'Copy link'}</button>`
        ].join('');
        // Played, with the date they finished it, and how many DLCs
        const played = A.getGameProgress(game.id);
        const dlcsPlayed = game.dlcs.filter(dlc => A.isPlayed(dlc.id)).length;
        const playedRow = `
            <div class="game-played">
                <label class="toggle-label">Played
                    <span class="toggle-switch toggle-read"><input type="checkbox" data-played="${game.id}" aria-label="Played: ${esc(game.name)}"${played.played ? ' checked' : ''}><span class="toggle-slider"></span></span>
                </label>
                <span class="game-played-date"${played.played ? '' : ' hidden'}>
                    <label for="gamePlayedDate">Finished</label>
                    <input type="date" id="gamePlayedDate" class="modal-date-input" data-played-date="${game.id}" value="${esc(played.playedDate)}">
                </span>
                ${game.dlcs.length ? `<span class="game-played-dlcs"><span class="progress-count">${dlcsPlayed} / ${game.dlcs.length}</span> DLCs played</span>` : ''}
            </div>`;
        const progress = items.length ? `
            <div class="character-progress">
                <span class="progress" aria-hidden="true"><span class="progress-fill" style="width:${Math.min(pct, 100)}%"></span></span>
                <span class="progress-count">${owned} / ${items.length}</span>
                <span class="character-progress-label">owned</span>
                <span class="progress-count">${pct}%</span>
            </div>` : '';
        const groups = DLC_GROUPS
            .map(([type, label]) => ({ label, dlcs: game.dlcs.filter(dlc => dlc.type === type) }))
            .filter(group => group.dlcs.length > 0)
            .map(group => `
                <div class="game-dlc-group">
                    <span class="label">${group.label}</span>
                    <ul class="game-dlc-list">${group.dlcs.map(dlc => dlcHTML(dlc, game)).join('')}</ul>
                </div>`).join('');
        const at = GAMES.indexOf(game);
        const prev = GAMES[at - 1];
        const next = GAMES[at + 1];
        return `
            <div class="page-head">
                <nav aria-label="Breadcrumb">
                    <ol class="crumbs">
                        <li><a href="#games">Games</a></li>
                        <li aria-current="page">${esc(game.name)}</li>
                    </ol>
                </nav>
                <h2 class="page-title">${esc(game.name)}</h2>
            </div>
            <div class="character-head game-head">
                ${coverHTML(game.image, 'game-head-cover', false)}
                <div class="character-head-facts">
                    <div class="modal-badges-row"><span class="badge badge-accent modal-badge">${esc(game.remakeOf ? 'Remake' : KIND_LABELS[game.kind] || '')}</span></div>
                    <div class="modal-meta">${meta}</div>
                </div>
                <p class="character-description">${esc(game.description)}</p>
                <div class="head-card-links">${links}</div>
                ${playedRow}
                ${progress}
            </div>
            ${cast.length ? `
                <h3 class="section-head reading-section"><span>Characters</span><span class="section-head-count">${cast.length}</span></h3>
                <ul class="character-games game-cast${folded ? ' is-folded' : ''}">${cast.map(A.characterRowHTML).join('')}</ul>
                ${folded ? `<button class="btn btn-quiet btn-sm game-cast-more" data-game-cast-more>Show all ${cast.length} characters</button>` : ''}` : ''}
            ${game.dlcs.length ? `
                <h3 class="section-head reading-section"><span>DLCs</span><span class="section-head-count">${game.dlcs.length}</span></h3>
                <div class="game-dlcs">${groups}</div>` : ''}
            <h3 class="section-head reading-section"><span>In the collection</span><span class="section-head-count">${items.length}</span></h3>
            ${items.length
                ? '<div class="items-grid game-items"></div>'
                : `<p class="character-none">No items of ${esc(game.name)} in the catalogue yet.</p>`}
            <nav class="series-pager" aria-label="Other games">
                ${prev ? `<a class="link link-quiet" href="#games/${A.gameUrlSlug(prev)}"><span aria-hidden="true">&larr;</span> ${esc(prev.name)}</a>` : '<span></span>'}
                ${next ? `<a class="link link-quiet" href="#games/${A.gameUrlSlug(next)}">${esc(next.name)} <span aria-hidden="true">&rarr;</span></a>` : ''}
            </nav>`;
    }

    // `enter` fades the page in, when moving between the list and a page
    function render(enter = false) {
        const game = currentSlug ? A.findGameBySlug(currentSlug) : null;
        content.innerHTML = `<div${enter ? ' class="characters-page-enter"' : ''}>${game ? pageHTML(game) : listHTML()}</div>`;
        const grid = content.querySelector('.game-items');
        if (grid) {
            // The collection's own cards, newest catalogue entries last
            const fragment = document.createDocumentFragment();
            itemsOf(game.name).forEach(item => fragment.appendChild(A.createItemCard(item)));
            grid.appendChild(fragment);
        }
    }

    // Arriving at a game's page for a DLC: start at the DLC's row (no
    // scrolling down the new page) and highlight it
    function flashDlc(name) {
        const row = name && content.querySelector(`.game-dlc[data-dlc="${CSS.escape(name)}"]`);
        if (!row) return false;
        row.scrollIntoView({ behavior: 'instant', block: 'center' });
        row.classList.remove('flash');
        void row.offsetWidth;   // restart the highlight animation
        row.classList.add('flash');
        return true;
    }

    // A DLC row (story timeline, Complete Lore) goes to its game's page:
    // the link navigates as usual, and the page then highlights the DLC
    function highlightDlcOnArrival(name) {
        pendingDlc = name || null;
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

    function isShown(el) {
        return !!el && el !== document.body && el.isConnected && el.getClientRects().length > 0;
    }

    // ---- View ----
    // `slug` opens that game's page; without one, the list. Coming back
    // from a page, the list returns to where it was, with focus on the card
    // that opened the page.
    function showGames(slug) {
        const wasVisible = isVisible();
        const prevSlug = wasVisible ? currentSlug : null;
        // Focus follows a link from this view or another one (now hidden);
        // on a fresh load (focus on the body) it stays where it is
        const active = document.activeElement;
        const focusWasHere = view.contains(active) || (!!active && active !== document.body && !isShown(active));
        const chipScroll = wasVisible ? (content.querySelector('.games-kinds')?.scrollLeft || 0) : 0;
        if (slug && !A.findGameBySlug(slug)) {
            // An unknown game: show the list
            history.replaceState(null, '', '#games');
            slug = null;
        }
        A.hideMainContent('games');
        document.getElementById('profileView').style.display = 'none';
        document.getElementById('leaderboardView').style.display = 'none';
        document.getElementById('readingView').style.display = 'none';
        document.getElementById('charactersView').style.display = 'none';
        view.style.display = '';
        if (wasVisible && !prevSlug && slug) listScroll = window.scrollY;
        currentSlug = slug;
        const changed = prevSlug !== slug;
        render(wasVisible && changed);
        restoreChipRow(chipScroll);
        const dlc = pendingDlc;
        pendingDlc = null;
        if (slug) {
            if (changed) window.scrollTo({ top: 0, behavior: 'instant' });
        } else if (prevSlug) {
            window.scrollTo({ top: listScroll, behavior: 'instant' });
        } else if (!wasVisible) {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
        if (slug && dlc) flashDlc(dlc);
        if (!changed || !focusWasHere) return;
        // The link that was followed is gone: move focus to what replaced it
        const card = !slug && prevSlug && content.querySelector(`[data-game-slug="${CSS.escape(prevSlug)}"]`);
        const target = card || content.querySelector('.page-title');
        if (!card) target.tabIndex = -1;
        target.focus({ preventScroll: true });
    }

    // The collection changed (item counts, the owned bar and item cards)
    function refreshGamesView() {
        if (!isVisible()) return;
        if (currentSlug) {
            render();
        } else {
            renderResults();
        }
    }

    function plainClick(e) {
        return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
    }

    content.addEventListener('input', (e) => {
        if (e.target.id !== 'gamesSearch') return;
        searchText = e.target.value;
        e.target.classList.toggle('is-set', searchText.trim() !== '');
        content.querySelector('[data-games-clear-search]').classList.toggle('visible', searchText !== '');
        renderResults();
    });

    content.addEventListener('click', (e) => {
        // A card is a plain link to the game's page; a story DLC row also
        // highlights its DLC there
        const card = e.target.closest('a[data-game-slug]');
        if (card) {
            if (plainClick(e)) highlightDlcOnArrival(card.dataset.dlc);
            return;
        }
        const catalog = e.target.closest('[data-game-catalog]');
        if (catalog) {
            const name = catalog.dataset.gameCatalog;
            history.pushState(null, '', window.location.pathname + window.location.search);
            A.showMainContent();
            A.applyExclusiveFilter('game', name);
            return;
        }
        const more = e.target.closest('[data-game-cast-more]');
        if (more) {
            const cast = content.querySelector('.game-cast');
            castShownFor = A.findGameBySlug(currentSlug)?.name || null;
            cast.classList.remove('is-folded');
            more.remove();
            cast.querySelectorAll('a')[CAST_FOLD]?.focus();
            return;
        }
        if (e.target.closest('[data-game-share]')) {
            const game = A.findGameBySlug(currentSlug);
            if (game) A.shareLink({ title: game.name, text: game.description, url: SITE_URL + '#games/' + A.gameUrlSlug(game) });
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

    // Played switches (the game and its DLCs) and the finished date
    content.addEventListener('change', (e) => {
        const toggle = e.target.closest('[data-played]');
        if (toggle) {
            const id = Number(toggle.dataset.played);
            const current = A.getGameProgress(id);
            // Switching off forgets the date; switching on keeps one already set
            A.setGameProgress(id, { played: toggle.checked, playedDate: toggle.checked ? current.playedDate : '' });
            return;
        }
        const date = e.target.closest('[data-played-date]');
        if (date) {
            const id = Number(date.dataset.playedDate);
            if (!A.isPlayed(id)) return;
            A.setGameProgress(id, { played: true, playedDate: date.value });
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
    A.highlightDlcOnArrival = highlightDlcOnArrival;   // DLC rows in Complete Lore
    A.gameKindLine = kindLine;   // the game rows on a character's page

})();
