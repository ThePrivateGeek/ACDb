/* ============================================
   ACDb - Characters View
   ============================================

   The Characters tab (#characters): every character in js/characters.js
   as a card, A to Z or in story order (under era headings), with search
   and faction chips. #characters/<slug> is a character's page: who they
   are, the games they appear in and their items in the collection. */

(function () {
    'use strict';

    window.ACDB = window.ACDB || {};
    const A = window.ACDB;

    // A to Z or story order; a per-viewer preference like the Games tab's.
    // The faction chip and the search last for the visit only.
    const MODE_KEY = 'acdb_characters_mode';
    const MODES = ['az', 'story'];
    const MODE_LABELS = { 'az': 'A–Z', 'story': 'Story order' };

    const GROUP_LABELS = {
        'assassin': 'Assassin',
        'templar': 'Templar',
        'isu': 'Isu'
    };
    const GROUP_CHIPS = {
        'assassin': 'Assassins',
        'templar': 'Templars',
        'isu': 'Isu',
        'other': 'Others'
    };

    const SEARCH_ICON = '<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>';
    const CLEAR_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

    const SOURCES_HTML = `<p class="reading-sources">Characters who appear in person in the main, spin-off and handheld games, and the heroes of the novels, comics and the 2016 film. Facts from the <a href="https://assassinscreed.fandom.com/" target="_blank" rel="noopener noreferrer">Assassin's Creed Wiki</a>, checked against Wikipedia and Ubisoft; descriptions written for ACDb and kept free of spoilers. A character's items are the ones that show them or tell their story. Character art &copy; Ubisoft.</p>`;

    const view = document.getElementById('charactersView');
    const content = document.getElementById('charactersContent');

    let currentGroup = '';         // '' for all groups
    let searchText = '';
    let currentSlug = null;        // the open character page; null shows the list
    let listScroll = 0;            // the list's scroll, for the way back from a page

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

    // ---- Data ----
    // Search and A to Z ignore case and accents ("altair" finds Altaïr)
    function fold(text) {
        return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    }

    // #characters/<slug>, accents folded like a game's address
    function characterSlug(character) {
        return A.slugify(fold(character.name));
    }

    function findCharacterBySlug(slug) {
        return CHARACTERS.find(c => characterSlug(c) === slug) || null;
    }

    function findCharacterById(id) {
        return CHARACTERS.find(c => c.id === id) || null;
    }

    // Item ids by character id, from the items' "characters" field. The
    // catalog is static, so this is built once.
    let itemsCache = null;
    function itemsOf(character) {
        if (!itemsCache) {
            itemsCache = new Map();
            AC_DATABASE.forEach(item => {
                (item.characters || []).forEach(id => {
                    if (!itemsCache.has(id)) itemsCache.set(id, []);
                    itemsCache.get(id).push(item);
                });
            });
        }
        return itemsCache.get(character.id) || [];
    }

    function gamesOf(character) {
        return character.games.map(name => GAMES.find(g => g.name === name)).filter(Boolean);
    }

    function byName(a, b) {
        return fold(a.name).localeCompare(fold(b.name), 'en');
    }

    // ---- Wording ----
    // "Assassin", "Templar · Historical figure", "Historical figure" for an
    // unaffiliated real person, and nothing for anyone else
    function kindLine(character) {
        return [GROUP_LABELS[character.group], character.historical ? 'Historical figure' : '']
            .filter(Boolean).join(' · ');
    }

    // "Born 1459 · Renaissance", or the era alone when the birth year isn't known
    function bornLine(character) {
        const era = A.eraOf(character.year);
        return character.born ? `Born ${character.born} · ${era}` : era;
    }

    function count(n, one, many) {
        return `${n} ${n === 1 ? one : many}`;
    }

    // ---- Filtering ----
    function shownCharacters() {
        const query = fold(searchText.trim());
        return CHARACTERS.filter(c => {
            if (currentGroup && c.group !== currentGroup) return false;
            if (!query) return true;
            return [c.name, ...(c.aka || []), c.stories || ''].some(text => fold(text).includes(query));
        });
    }

    // ---- List ----
    function listHTML() {
        const esc = A.escapeHTML;
        const mode = getMode();
        const groups = Object.keys(GROUP_CHIPS)
            .map(group => ({ group, count: CHARACTERS.filter(c => c.group === group).length }))
            .filter(g => g.count > 0);
        if (currentGroup && !groups.some(g => g.group === currentGroup)) currentGroup = '';
        const chip = (group, label, n) => {
            const on = group === currentGroup;
            return `<button class="chip${on ? ' active' : ''}" data-characters-group="${group}" aria-pressed="${on}">${esc(label)} <span class="chip-count">${n}</span></button>`;
        };
        return `
            <div class="page-head">
                <h2 class="page-title">Characters</h2>
            </div>
            <p class="reading-description">Who's who in Assassin's Creed: ${count(CHARACTERS.length, 'character', 'characters')} so far, from the games, novels, comics and the film, each with where they appear and their items in the collection. More are on the way.</p>
            <div class="games-toolbar">
                <div class="search-box games-search">
                    ${SEARCH_ICON}
                    <label class="sr-only" for="charactersSearch">Search characters</label>
                    <input type="search" id="charactersSearch" placeholder="Search characters…" autocomplete="off" value="${esc(searchText)}"${searchText ? ' class="is-set"' : ''}>
                    <button type="button" class="icon-btn icon-btn-sm icon-btn-bare clear-search${searchText ? ' visible' : ''}" data-characters-clear-search aria-label="Clear search">${CLEAR_ICON}</button>
                </div>
                <div class="seg" role="group" aria-label="Order">
                    ${MODES.map(m => `<button class="seg-btn${m === mode ? ' active' : ''}" data-characters-mode="${m}" aria-pressed="${m === mode}">${MODE_LABELS[m]}</button>`).join('')}
                </div>
            </div>
            <div class="chip-row characters-groups" role="group" aria-label="Faction">
                ${chip('', 'All', CHARACTERS.length)}
                ${groups.map(g => chip(g.group, GROUP_CHIPS[g.group], g.count)).join('')}
            </div>
            <div class="characters-results">${resultsHTML()}</div>
            ${SOURCES_HTML}`;
    }

    // Only the list re-renders while typing, so the search keeps its caret
    function renderResults() {
        const results = content.querySelector('.characters-results');
        if (results) results.innerHTML = resultsHTML();
    }

    function resultsHTML() {
        const shown = shownCharacters();
        if (shown.length === 0) {
            return `
                <div class="games-empty">
                    <p>No characters match your search.</p>
                    <button class="btn btn-secondary btn-sm" data-characters-clear>Clear search and filters</button>
                </div>`;
        }
        if (getMode() === 'az') return `<ul class="character-grid">${shown.sort(byName).map(cardHTML).join('')}</ul>`;
        // Story order: by year (birth, or when they're first known), under era headings
        const sections = [];
        shown.sort((a, b) => a.year - b.year || byName(a, b)).forEach(c => {
            const heading = A.eraOf(c.year);
            let section = sections[sections.length - 1];
            if (!section || section.heading !== heading) {
                section = { heading, cards: [] };
                sections.push(section);
            }
            section.cards.push(cardHTML(c));
        });
        return sections.map(sec => `
            <h3 class="section-head reading-section"><span>${A.escapeHTML(sec.heading)}</span><span class="section-head-count">${sec.cards.length}</span></h3>
            <ul class="character-grid">${sec.cards.join('')}</ul>`).join('');
    }

    // Head-and-shoulders portrait (300x400 WebP), or the emblem on a gold
    // tint until the character has one, like an item card without a photo.
    // Next to a visible name, so the alt text stays empty.
    const EMBLEM = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d="M50 5 L30 55 L5 95 L25 95 L50 55 L75 95 L95 95 L70 55 Z" fill="currentColor"/></svg>';

    function portraitHTML(character, cls, lazy) {
        return character.image
            ? `<span class="character-portrait ${cls}"><img src="${A.escapeHTML(character.image)}" alt=""${lazy ? ' loading="lazy"' : ''}></span>`
            : `<span class="character-portrait character-portrait-none ${cls}">${EMBLEM}</span>`;
    }

    function cardHTML(character) {
        const esc = A.escapeHTML;
        const slug = characterSlug(character);
        const kind = kindLine(character);
        const games = character.games.length;
        const items = itemsOf(character).length;
        const pills = [
            games ? count(games, 'game', 'games') : '',
            items ? count(items, 'item', 'items') : ''
        ].filter(Boolean).map(text => `<span class="badge badge-plain">${text}</span>`).join('');
        return `
            <li>
                <a class="character-card" href="#characters/${slug}" data-character-slug="${slug}">
                    <span class="character-card-top">
                        ${portraitHTML(character, 'character-card-portrait', true)}
                        <span class="character-card-id">
                            ${kind ? `<span class="game-kind">${esc(kind)}</span>` : ''}
                            <h3 class="character-card-name">${esc(character.name)}</h3>
                            <span class="character-card-meta">${esc(bornLine(character))}</span>
                            ${character.aka ? `<span class="character-card-meta">Also known as ${esc(character.aka.join(', '))}</span>` : ''}
                            ${character.stories && !games ? `<span class="character-card-meta">${esc(character.stories)}</span>` : ''}
                        </span>
                    </span>
                    <span class="character-card-text">${esc(character.description)}</span>
                    ${pills ? `<span class="game-tile-foot">${pills}</span>` : ''}
                </a>
            </li>`;
    }

    // ---- A character's page ----
    function metaRow(label, valueHTML) {
        return `<span class="modal-meta-label">${label}</span><span class="modal-meta-value">${valueHTML}</span>`;
    }

    function gameRowHTML(game) {
        const esc = A.escapeHTML;
        const slug = A.gameUrlSlug(game);
        return `
            <li>
                <a class="character-game" href="#games/${slug}" data-game-dialog="${esc(game.name)}">
                    <span class="game-dlc-cover">${game.image ? `<img src="${esc(game.image)}" alt="" loading="lazy">` : A.GAME_ICON}</span>
                    <span class="game-dlc-body">
                        <span class="game-kind">${esc(A.gameKindLine(game))}</span>
                        <span class="game-dlc-name">${esc(game.name)}</span>
                        <span class="reading-meta"><span>Released ${game.released.slice(0, 4)}</span></span>
                    </span>
                </a>
            </li>`;
    }

    function pageHTML(character) {
        const esc = A.escapeHTML;
        const kind = kindLine(character);
        const games = gamesOf(character);
        const items = itemsOf(character);
        const owned = items.filter(item => A.getItemData(item.id).owned).length;
        const pct = items.length ? Math.round(owned / items.length * 100) : 0;
        const meta = [
            character.born ? metaRow('Born', esc(character.born)) : '',
            metaRow('Era', esc(A.eraOf(character.year))),
            character.aka ? metaRow('Also known as', esc(character.aka.join(', '))) : '',
            character.stories ? metaRow('Stories', esc(character.stories)) : ''
        ].join('');
        const progress = items.length ? `
            <div class="character-progress">
                <span class="progress" aria-hidden="true"><span class="progress-fill" style="width:${Math.min(pct, 100)}%"></span></span>
                <span class="progress-count">${owned} / ${items.length}</span>
                <span class="character-progress-label">owned</span>
                <span class="progress-count">${pct}%</span>
            </div>` : '';
        const az = [...CHARACTERS].sort(byName);
        const at = az.indexOf(character);
        const prev = az[at - 1];
        const next = az[at + 1];
        return `
            <div class="page-head">
                <nav aria-label="Breadcrumb">
                    <ol class="crumbs">
                        <li><a href="#characters">Characters</a></li>
                        <li aria-current="page">${esc(character.name)}</li>
                    </ol>
                </nav>
                <h2 class="page-title">${esc(character.name)}</h2>
            </div>
            <div class="character-head">
                ${portraitHTML(character, 'character-head-portrait', false)}
                <div class="character-head-facts">
                    ${kind ? `<div class="modal-badges-row"><span class="badge badge-accent modal-badge">${esc(kind)}</span></div>` : ''}
                    <div class="modal-meta">${meta}</div>
                </div>
                <p class="character-description">${esc(character.description)}</p>
                ${progress}
            </div>
            ${games.length ? `
                <h3 class="section-head reading-section"><span>Games</span><span class="section-head-count">${games.length}</span></h3>
                <ul class="character-games">${games.map(gameRowHTML).join('')}</ul>` : ''}
            <h3 class="section-head reading-section"><span>In the collection</span><span class="section-head-count">${items.length}</span></h3>
            ${items.length
                ? '<div class="items-grid character-items"></div>'
                : `<p class="character-none">No items of ${esc(character.name)} in the catalogue yet.</p>`}
            <nav class="series-pager" aria-label="Other characters">
                ${prev ? `<a class="link link-quiet" href="#characters/${characterSlug(prev)}"><span aria-hidden="true">&larr;</span> ${esc(prev.name)}</a>` : '<span></span>'}
                ${next ? `<a class="link link-quiet" href="#characters/${characterSlug(next)}">${esc(next.name)} <span aria-hidden="true">&rarr;</span></a>` : ''}
            </nav>`;
    }

    // `enter` fades the page in, when moving between the list and a page
    function render(enter = false) {
        const character = currentSlug ? findCharacterBySlug(currentSlug) : null;
        content.innerHTML = `<div${enter ? ' class="characters-page-enter"' : ''}>${character ? pageHTML(character) : listHTML()}</div>`;
        const grid = content.querySelector('.character-items');
        if (grid) {
            // The collection's own cards, newest catalogue entries last
            const fragment = document.createDocumentFragment();
            itemsOf(character).forEach(item => fragment.appendChild(A.createItemCard(item)));
            grid.appendChild(fragment);
        }
    }

    // Re-rendering resets the chip row's scroll: restore it, then make sure
    // the active chip is visible (as the Games tab does)
    function restoreChipRow(scrollLeft) {
        const row = content.querySelector('.characters-groups');
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
    // `slug` opens that character's page; without one, the list. Coming
    // back from a page, the list returns to where it was, with focus on the
    // card that opened the page.
    function showCharacters(slug) {
        const wasVisible = isVisible();
        const prevSlug = wasVisible ? currentSlug : null;
        const focusWasHere = view.contains(document.activeElement) || document.activeElement === document.body;
        let character = slug ? findCharacterBySlug(slug) : null;
        if (slug && !character) {
            // An unknown character: show the list
            history.replaceState(null, '', '#characters');
            slug = null;
        }
        A.hideMainContent('characters');
        document.getElementById('profileView').style.display = 'none';
        document.getElementById('leaderboardView').style.display = 'none';
        document.getElementById('readingView').style.display = 'none';
        document.getElementById('gamesView').style.display = 'none';
        view.style.display = '';
        if (wasVisible && !prevSlug && slug) listScroll = window.scrollY;
        currentSlug = slug;
        const changed = wasVisible && prevSlug !== slug;
        const chipScroll = content.querySelector('.characters-groups')?.scrollLeft || 0;
        render(changed);
        restoreChipRow(chipScroll);
        if (slug) {
            if (prevSlug !== slug) window.scrollTo(0, 0);
        } else if (prevSlug) {
            window.scrollTo(0, listScroll);
        } else if (!wasVisible) {
            window.scrollTo(0, 0);
        }
        if (!changed || !focusWasHere) return;
        // The link that was clicked is gone: move focus to what replaced it
        const card = !slug && content.querySelector(`[data-character-slug="${CSS.escape(prevSlug)}"]`);
        const target = card || content.querySelector('.page-title');
        if (!card) target.tabIndex = -1;
        target.focus({ preventScroll: true });
    }

    // The collection changed (owned counts and the item cards)
    function refreshCharactersView() {
        if (!isVisible()) return;
        if (currentSlug) {
            render();
        } else {
            renderResults();
        }
    }

    content.addEventListener('input', (e) => {
        if (e.target.id !== 'charactersSearch') return;
        searchText = e.target.value;
        e.target.classList.toggle('is-set', searchText.trim() !== '');
        content.querySelector('[data-characters-clear-search]').classList.toggle('visible', searchText !== '');
        renderResults();
    });

    content.addEventListener('click', (e) => {
        // A game row opens the game's dialog over the page (closing it
        // returns here, as from Complete Lore); a modified click still
        // opens the Games tab in a new tab
        const gameLink = e.target.closest('[data-game-dialog]');
        if (gameLink && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            A.openGameDialog(GAMES.find(g => g.name === gameLink.dataset.gameDialog), { overView: true, opener: gameLink });
            return;
        }
        const modeBtn = e.target.closest('[data-characters-mode]');
        if (modeBtn) {
            setMode(modeBtn.dataset.charactersMode);
            updatePressed('[data-characters-mode]', btn => btn.dataset.charactersMode === getMode());
            renderResults();
            return;
        }
        const groupBtn = e.target.closest('[data-characters-group]');
        if (groupBtn) {
            currentGroup = groupBtn.dataset.charactersGroup;
            updatePressed('[data-characters-group]', btn => btn.dataset.charactersGroup === currentGroup);
            renderResults();
            return;
        }
        if (e.target.closest('[data-characters-clear-search]')) {
            searchText = '';
            rerender();
            document.getElementById('charactersSearch').focus();
            return;
        }
        if (e.target.closest('[data-characters-clear]')) {
            searchText = '';
            currentGroup = '';
            rerender();
            document.getElementById('charactersSearch').focus();
        }
    });

    function rerender() {
        const chipScroll = content.querySelector('.characters-groups')?.scrollLeft || 0;
        render();
        restoreChipRow(chipScroll);
    }

    // Expose on namespace
    A.showCharacters = showCharacters;
    A.refreshCharactersView = refreshCharactersView;
    A.characterSlug = characterSlug;
    A.findCharacterById = findCharacterById;
    A.isCharacterPageOpen = (character) => isVisible() && currentSlug === characterSlug(character);

})();
