/* ============================================
   ACDb - Application Logic
   ============================================ */

// ---- Shared Namespace ----
window.ACDB = window.ACDB || {};

(function () {
    'use strict';

    // ---- State ----
    // Collections are keyed by each item's permanent numeric `id` (database.js).
    // The previous name-keyed collection under LEGACY_STORAGE_KEY is migrated
    // once (see migrateLegacyCollection) and kept as a backup until
    // LEGACY_BACKUP_EXPIRES, after which it is deleted from browsers that have
    // already migrated. Keep the migration itself until at least 2027-10-03 so
    // visitors returning after a long absence still get their collection.
    const STORAGE_KEY = 'acdb_collection_v2';
    const LEGACY_STORAGE_KEY = 'acdb_collection';
    const LEGACY_BACKUP_EXPIRES = Date.parse('2027-01-03');
    const FILTERS_KEY = 'acdb_filters';
    const API_URL = 'https://api.acdb.workers.dev';
    const SHARE_TOKEN_KEY = 'acdb_share_token';
    const SHARE_NAME_KEY = 'acdb_share_name';
    const isAdmin = localStorage.getItem('acdb_admin') === 'true';

    let collection = loadCollection();

    // Drop the name-keyed backup once its grace period is over, but only where
    // the id-keyed collection already exists (i.e. the migration has run).
    try {
        if (Date.now() >= LEGACY_BACKUP_EXPIRES && localStorage.getItem(STORAGE_KEY) !== null) {
            localStorage.removeItem(LEGACY_STORAGE_KEY);
        }
    } catch { /* storage unavailable */ }
    let selectedGames = new Set();
    let selectedCategories = new Set();
    let selectedTypes = new Set();
    let selectedSeries = new Set();
    let statsSortMode = 'percent'; // 'percent', 'count', or 'timeline'
    let lastBarSortMode = 'percent'; // last non-timeline mode — used for non-game panels
    // currentItemId, galleryImages, galleryIndex — owned by modal.js

    // The selected-* Sets are reassigned (restoreFilters, change handlers),
    // so look them up by kind on demand instead of caching references.
    function selectionSetFor(kind) {
        switch (kind) {
            case 'game': return selectedGames;
            case 'category': return selectedCategories;
            case 'type': return selectedTypes;
            case 'series': return selectedSeries;
            default: throw new Error(`Unknown filter kind: ${kind}`);
        }
    }

    function clearAllSelections() {
        ['game', 'category', 'type', 'series'].forEach(kind => selectionSetFor(kind).clear());
    }

    // The top N entries by year (highest first) get a "NEW" sticker, matching
    // the default "Year (Newest First)" sort. Ties broken by DB position so
    // more-recently-added items win when years match (ids grow with each
    // addition, so a higher id means added later).
    const NEW_BADGE_COUNT = 4;
    const NEW_ITEM_IDS = new Set(
        [...AC_DATABASE]
            .sort((a, b) => (b.year - a.year) || (b.id - a.id))
            .slice(0, NEW_BADGE_COUNT)
            .map(item => item.id)
    );

    // Short game names (shared between timeline and stats)
    const SHORT_GAME_NAMES = {
        "Assassin's Creed": "AC1",
        "Assassin's Creed II": "AC2",
        "Assassin's Creed Brotherhood": "Brotherhood",
        "Assassin's Creed Revelations": "Revelations",
        "Assassin's Creed III": "AC3",
        "Assassin's Creed III: Liberation": "Liberation",
        "Assassin's Creed IV: Black Flag": "Black Flag",
        "Assassin's Creed Rogue": "Rogue",
        "Assassin's Creed Unity": "Unity",
        "Assassin's Creed Chronicles: China": "China",
        "Assassin's Creed Chronicles: India": "India",
        "Assassin's Creed Chronicles: Russia": "Russia",
        "Assassin's Creed Syndicate": "Syndicate",
        "Assassin's Creed Origins": "Origins",
        "Assassin's Creed Odyssey": "Odyssey",
        "Assassin's Creed Valhalla": "Valhalla",
        "Assassin's Creed Mirage": "Mirage",
        "Assassin's Creed Shadows": "Shadows",
        "Assassin's Creed Black Flag Resynced": "Resynced",
        "Assassin's Creed (Movie)": "Movie",
        "General": "General"
    };

    // Chronological order — derived from SHORT_GAME_NAMES key order
    const GAME_ORDER = Object.keys(SHORT_GAME_NAMES);

    // ---- Item IDs ----
    // Every entry carries a permanent numeric `id` in database.js: never
    // changed, never reused. Names can now be edited freely without touching
    // anyone's collection. Flag a broken catalog loudly instead of silently
    // mixing up collection data.
    (function checkItemIds() {
        const seen = new Set();
        AC_DATABASE.forEach(item => {
            if (!Number.isInteger(item.id) || item.id <= 0) console.error('ACDb: item without a valid id:', item.name);
            else if (seen.has(item.id)) console.error('ACDb: duplicate item id', item.id, item.name);
            seen.add(item.id);
        });
    })();

    const ITEMS_BY_ID = new Map(AC_DATABASE.map(item => [item.id, item]));

    // Resolve a stored reference to an item. Accepts a numeric id (number or
    // numeric string) or, for data saved before ids existed, an item name.
    function findItemByRef(ref) {
        if (typeof ref === 'number' || (typeof ref === 'string' && /^\d+$/.test(ref))) {
            return ITEMS_BY_ID.get(Number(ref)) || null;
        }
        return AC_DATABASE.find(i => i.name === ref) || null;
    }

    // One-time migration of the name-keyed collection to id keys. Runs only
    // while the v2 key doesn't exist yet. Entries that don't match a current
    // item name are dropped, including numeric keys left from before the
    // April 2026 name migration: their positions have shifted since, so
    // mapping them would attach data to the wrong items.
    function migrateLegacyCollection() {
        let legacy;
        try {
            legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || '{}');
        } catch {
            return {};
        }
        const migrated = {};
        Object.entries(legacy).forEach(([key, data]) => {
            const item = /^\d+$/.test(key) ? null : AC_DATABASE.find(i => i.name === key);
            if (item) migrated[item.id] = data;
        });
        return migrated;
    }

    // ---- DOM References ----
    const dom = {
        totalItems: document.getElementById('totalItems'),
        ownedItems: document.getElementById('ownedItems'),
        completionPercent: document.getElementById('completionPercent'),
        progressFill: document.getElementById('progressFill'),
        searchInput: document.getElementById('searchInput'),
        clearSearch: document.getElementById('clearSearch'),
        filterGame: document.getElementById('filterGame'),
        filterCategory: document.getElementById('filterCategory'),
        filterType: document.getElementById('filterType'),
        filterSeries: document.getElementById('filterSeries'),
        filterOwned: document.getElementById('filterOwned'),
        sortBy: document.getElementById('sortBy'),
        viewGrid: document.getElementById('viewGrid'),
        viewList: document.getElementById('viewList'),
        gameTimeline: document.getElementById('gameTimeline'),
        itemsContainer: document.getElementById('itemsContainer'),
        noResults: document.getElementById('noResults'),
        modalOverlay: document.getElementById('modalOverlay'),
        modalClose: document.getElementById('modalClose'),
        modalImage: document.getElementById('modalImage'),
        modalBadge: document.getElementById('modalBadge'),
        modalBadgeType: document.getElementById('modalBadgeType'),
        modalTitle: document.getElementById('modalTitle'),
        modalGame: document.getElementById('modalGame'),
        modalYear: document.getElementById('modalYear'),
        modalDescription: document.getElementById('modalDescription'),
        modalContents: document.getElementById('modalContents'),
        modalSeriesRow: document.getElementById('modalSeriesRow'),
        modalSeries: document.getElementById('modalSeries'),
        modalSeriesCount: document.getElementById('modalSeriesCount'),
        modalReadLink: document.getElementById('modalReadLink'),
        modalReadLabel: document.getElementById('modalReadLabel'),
        modalOwned: document.getElementById('modalOwned'),
        modalWishlist: document.getElementById('modalWishlist'),
        modalHasBox: document.getElementById('modalHasBox'),
        modalCondition: document.getElementById('modalCondition'),
        modalCopies: document.getElementById('modalCopies'),
        modalNotes: document.getElementById('modalNotes'),
        copiesMinus: document.getElementById('copiesMinus'),
        copiesPlus: document.getElementById('copiesPlus'),
        galleryPrev: document.getElementById('galleryPrev'),
        galleryNext: document.getElementById('galleryNext'),
        galleryCounter: document.getElementById('galleryCounter'),
        galleryDots: document.getElementById('galleryDots'),
        // Export/Import
        exportBtn: document.getElementById('exportBtn'),
        importBtn: document.getElementById('importBtn'),
        importFile: document.getElementById('importFile'),
        modalPricePaid: document.getElementById('modalPricePaid'),
        modalAcquiredDate: document.getElementById('modalAcquiredDate'),
        modalReadingSection: document.getElementById('modalReadingSection'),
        modalHasRead: document.getElementById('modalHasRead'),
        modalReadDate: document.getElementById('modalReadDate'),
        modalReadingCollects: document.getElementById('modalReadingCollects'),
        resultsCount: document.getElementById('resultsCount'),
        statsDashboard: document.getElementById('statsDashboard'),
        statsToggle: document.getElementById('statsToggle'),
        statsPanel: document.getElementById('statsPanel'),
        statsByGame: document.getElementById('statsByGame'),
        statsByCategory: document.getElementById('statsByCategory'),
        statsByCondition: document.getElementById('statsByCondition'),
        statsReading: document.getElementById('statsReading'),
        // Dev Tool
        addItemBtn: document.getElementById('addItemBtn'),
        devToolOverlay: document.getElementById('devToolOverlay'),
        devToolClose: document.getElementById('devToolClose'),
    };

    // ---- Collection Persistence ----
    function loadCollection() {
        let data;
        try {
            data = localStorage.getItem(STORAGE_KEY);
        } catch {
            return {};
        }
        if (data !== null) {
            try {
                return JSON.parse(data);
            } catch {
                return {};
            }
        }
        // First load with id keys: migrate the name-keyed collection once.
        const migrated = migrateLegacyCollection();
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        } catch { /* storage unavailable: keep working in memory */ }
        return migrated;
    }

    function saveCollection() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
    }

    function getItemData(id) {
        return collection[id] || {
            owned: false,
            wishlist: false,
            hasBox: false,
            condition: '',
            copies: 0,
            pricePaid: '',
            acquiredDate: '',
            notes: '',
            hasRead: false,
            readDate: ''
        };
    }

    // Every edit goes through here. `updatedAt` lets cloud sync (sync.js)
    // keep the newest edit per item; export lists its fields explicitly, so
    // the timestamp never ends up in export files.
    function setItemData(id, data) {
        collection[id] = { ...data, updatedAt: ACDB.syncNow() };
        saveCollection();
        ACDB.onLocalChange(id);
    }

    // ---- Multi-Select Helpers ----
    function getSelectedValues(multiSelectEl) {
        const checked = multiSelectEl.querySelectorAll('.multi-select-option input:checked');
        return new Set([...checked].map(cb => cb.value));
    }

    function updateMultiSelectLabel(multiSelectEl) {
        const placeholder = multiSelectEl.dataset.placeholder;
        const selected = getSelectedValues(multiSelectEl);
        const label = multiSelectEl.querySelector('.multi-select-label');

        if (selected.size === 0) {
            label.textContent = placeholder;
            multiSelectEl.classList.remove('has-selection');
        } else if (selected.size === 1) {
            label.textContent = [...selected][0];
            multiSelectEl.classList.add('has-selection');
        } else {
            const noun = placeholder.replace('All ', '');
            label.textContent = `${selected.size} ${noun}`;
            multiSelectEl.classList.add('has-selection');
        }
        // Full text on hover — the label may be ellipsised in the toolbar
        label.title = label.textContent;
        sortMultiSelectOptions(multiSelectEl);
    }

    function sortMultiSelectOptions(multiSelectEl) {
        const container = multiSelectEl.querySelector('.multi-select-options');
        const options = [...container.querySelectorAll('.multi-select-option')];

        // Tag each option with its original index if not already done
        options.forEach((opt, i) => {
            if (!opt.dataset.origIndex) opt.dataset.origIndex = i;
        });

        // Remove existing separator
        const existing = container.querySelector('.multi-select-separator');
        if (existing) existing.remove();

        options.sort((a, b) => {
            const aChecked = a.querySelector('input').checked;
            const bChecked = b.querySelector('input').checked;
            if (aChecked !== bChecked) return aChecked ? -1 : 1;
            // Within each group, restore original insertion order
            return parseInt(a.dataset.origIndex) - parseInt(b.dataset.origIndex);
        });
        options.forEach(opt => container.appendChild(opt));

        // Add separator between checked and unchecked
        const checkedCount = options.filter(o => o.querySelector('input').checked).length;
        if (checkedCount > 0 && checkedCount < options.length) {
            const sep = document.createElement('div');
            sep.className = 'multi-select-separator';
            options[checkedCount - 1].after(sep);
        }
    }

    function setMultiSelectValues(multiSelectEl, valuesSet) {
        multiSelectEl.querySelectorAll('.multi-select-option input').forEach(cb => {
            cb.checked = valuesSet.has(cb.value);
        });
        updateMultiSelectLabel(multiSelectEl);
    }

    function clearMultiSelect(multiSelectEl) {
        multiSelectEl.querySelectorAll('.multi-select-option input').forEach(cb => {
            cb.checked = false;
        });
        updateMultiSelectLabel(multiSelectEl);
    }

    // Build one "☐ Value (count)" row for a multi-select dropdown.
    function createMultiSelectOption(value, count) {
        const label = document.createElement('label');
        label.className = 'multi-select-option';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = value;
        const check = document.createElement('span');
        check.className = 'multi-select-check';
        const text = document.createElement('span');
        text.className = 'multi-select-text';
        text.textContent = `${value} (${count})`;
        label.appendChild(cb);
        label.appendChild(check);
        label.appendChild(text);
        return label;
    }

    // Filters cascade top-down: game → category → type → series. Each level
    // only offers values present in the items matching the levels above it.
    // `level` names the filter being populated; items are narrowed by every
    // filter *before* it in CASCADE_ORDER.
    const CASCADE_ORDER = ['game', 'category', 'type', 'series'];
    const CASCADE_CONTROLS = {
        game: dom.filterGame,
        category: dom.filterCategory,
        type: dom.filterType,
        series: dom.filterSeries,
    };

    function getItemsUpstreamOf(level) {
        let items = AC_DATABASE;
        for (const key of CASCADE_ORDER) {
            if (key === level) break;
            const selected = getSelectedValues(CASCADE_CONTROLS[key]);
            if (selected.size > 0) items = items.filter(i => selected.has(i[key]));
        }
        return items;
    }

    // Rebuild a cascading multi-select from the items upstream of it, prune
    // selections that are no longer offered, and re-apply what remains.
    function populateCascadeFilter(level, selectedSet) {
        const multiSelectEl = CASCADE_CONTROLS[level];
        const optionsContainer = multiSelectEl.querySelector('.multi-select-options');
        optionsContainer.innerHTML = '';

        const relevantItems = getItemsUpstreamOf(level);
        const values = [...new Set(relevantItems.map(i => i[level]).filter(Boolean))].sort();

        selectedSet.forEach(v => { if (!values.includes(v)) selectedSet.delete(v); });

        values.forEach(value => {
            const count = relevantItems.filter(i => i[level] === value).length;
            optionsContainer.appendChild(createMultiSelectOption(value, count));
        });
        setMultiSelectValues(multiSelectEl, selectedSet);
        return values;
    }

    function populateCategoryFilter() {
        populateCascadeFilter('category', selectedCategories);
    }

    function populateTypeFilter() {
        populateCascadeFilter('type', selectedTypes);
    }

    // Only part of the catalogue belongs to a series (comics, graphic novels,
    // manga). The control disappears when nothing upstream has one, so it
    // never shows an empty dropdown for, say, statues.
    function populateSeriesFilter() {
        const seriesNames = populateCascadeFilter('series', selectedSeries);
        dom.filterSeries.hidden = seriesNames.length === 0;
    }

    // Re-run every cascading dropdown below the game filter.
    function populateDependentFilters() {
        populateCategoryFilter();
        populateTypeFilter();
        populateSeriesFilter();
    }

    function syncTimelineToSelectedGames() {
        document.querySelectorAll('.timeline-btn').forEach(btn => {
            if (btn.dataset.game === '') {
                btn.classList.toggle('active', selectedGames.size === 0);
            } else {
                btn.classList.toggle('active', selectedGames.has(btn.dataset.game));
            }
            btn.setAttribute('aria-pressed', String(btn.classList.contains('active')));
        });
    }

    // ---- Populate Filters ----
    function initFilters() {
        // Clear existing options
        const gameOptionsContainer = dom.filterGame.querySelector('.multi-select-options');
        gameOptionsContainer.innerHTML = '';
        const catOptionsContainer = dom.filterCategory.querySelector('.multi-select-options');
        catOptionsContainer.innerHTML = '';
        const timelineInner = dom.gameTimeline.querySelector('.timeline-inner');
        timelineInner.innerHTML = '';

        // Games - sorted chronologically
        const games = [...new Set(AC_DATABASE.map(i => i.game))];

        const sortedGames = GAME_ORDER.filter(g => games.includes(g));
        // Add any games not in our predefined order
        games.forEach(g => { if (!sortedGames.includes(g)) sortedGames.push(g); });

        sortedGames.forEach(game => {
            const count = AC_DATABASE.filter(i => i.game === game).length;
            gameOptionsContainer.appendChild(createMultiSelectOption(game, count));
        });
        setMultiSelectValues(dom.filterGame, selectedGames);

        populateDependentFilters();

        // Timeline buttons
        const allBtn = document.createElement('button');
        allBtn.className = 'chip timeline-btn active';
        allBtn.setAttribute('aria-pressed', 'true');
        allBtn.textContent = 'All';
        allBtn.dataset.game = '';
        timelineInner.appendChild(allBtn);

        sortedGames.forEach(game => {
            const btn = document.createElement('button');
            btn.className = 'chip timeline-btn';
            btn.setAttribute('aria-pressed', 'false');
            // Short display names
            btn.textContent = SHORT_GAME_NAMES[game] || game;
            btn.dataset.game = game;

            // Count items per game
            const count = AC_DATABASE.filter(i => i.game === game).length;
            btn.title = `${game} (${count} items)`;

            timelineInner.appendChild(btn);
        });
    }

    // ---- Render Items ----
    function getFilteredItems() {
        const search = dom.searchInput.value.toLowerCase().trim();
        const gameFilters = getSelectedValues(dom.filterGame);
        const categoryFilters = getSelectedValues(dom.filterCategory);
        const typeFilters = getSelectedValues(dom.filterType);
        const seriesFilters = getSelectedValues(dom.filterSeries);
        const ownedFilter = dom.filterOwned.value;

        const sortValue = dom.sortBy.value;

        let results = AC_DATABASE.filter(item => {
            // Search — AND-match each whitespace-separated token across all fields
            if (search) {
                const haystack = `${item.name} ${item.game} ${item.year} ${item.category} ${item.description} ${item.contents} ${item.type} ${item.series || ''}`.toLowerCase();
                const tokens = search.split(/\s+/);
                if (!tokens.every(t => haystack.includes(t))) return false;
            }
            // Game (empty set = all)
            if (gameFilters.size > 0 && !gameFilters.has(item.game)) return false;
            // Category (empty set = all)
            if (categoryFilters.size > 0 && !categoryFilters.has(item.category)) return false;
            // Type (empty set = all)
            if (typeFilters.size > 0 && !typeFilters.has(item.type)) return false;
            // Series (empty set = all; items without a series never match a selection)
            if (seriesFilters.size > 0 && !seriesFilters.has(item.series)) return false;
            // Owned / read status. Both read filters only ever show story
            // publications, the only items with a read status.
            if (ownedFilter) {
                const data = getItemData(item.id);
                if (ownedFilter === 'owned' && !data.owned) return false;
                if (ownedFilter === 'unowned' && data.owned) return false;
                if (ownedFilter === 'wishlist' && !data.wishlist) return false;
                if (ownedFilter === 'read' && !(ACDB.isReadable(item) && data.hasRead)) return false;
                if (ownedFilter === 'unread' && !(ACDB.isReadable(item) && !data.hasRead)) return false;
            }
            return true;
        });

        // Sort
        if (sortValue === 'year-asc') results.sort((a, b) => a.year - b.year);
        else if (sortValue === 'year-desc') results.sort((a, b) => (b.year - a.year) || (AC_DATABASE.indexOf(b) - AC_DATABASE.indexOf(a)));
        else if (sortValue === 'name-asc') results.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortValue === 'name-desc') results.sort((a, b) => b.name.localeCompare(a.name));
        else if (sortValue === 'recent') results.sort((a, b) => AC_DATABASE.indexOf(b) - AC_DATABASE.indexOf(a));

        return results;
    }

    function renderItems() {
        const items = getFilteredItems();
        dom.itemsContainer.innerHTML = '';

        if (items.length === 0) {
            dom.noResults.style.display = 'block';
            dom.resultsCount.textContent = '';
        } else {
            dom.noResults.style.display = 'none';
            const total = AC_DATABASE.length;
            if (items.length === total) {
                dom.resultsCount.textContent = `Showing all ${total} items`;
            } else {
                const filteredOwned = items.filter(item => getItemData(item.id).owned).length;
                const ownedFilter = dom.filterOwned.value;
                if (ownedFilter === 'owned') {
                    dom.resultsCount.textContent = `Showing ${items.length} owned items`;
                } else if (ownedFilter === 'unowned') {
                    dom.resultsCount.textContent = `Showing ${items.length} unowned items`;
                } else if (ownedFilter === 'read') {
                    dom.resultsCount.textContent = `Showing ${items.length} read items`;
                } else if (ownedFilter === 'unread') {
                    dom.resultsCount.textContent = `Showing ${items.length} unread items`;
                } else {
                    dom.resultsCount.textContent = filteredOwned > 0
                        ? `Showing ${items.length} of ${total} items · ${filteredOwned} owned`
                        : `Showing ${items.length} of ${total} items`;
                }
            }
        }

        const fragment = document.createDocumentFragment();
        items.forEach(item => {
            fragment.appendChild(createCard(item));
        });
        dom.itemsContainer.appendChild(fragment);

        updateStats();
        saveFilters();
        ACDB.renderSyncBanner();
        ACDB.refreshReadingView();
    }

    function createCard(item) {
        const data = getItemData(item.id);
        const card = document.createElement('a');
        card.className = 'item-card';
        card.href = '#' + getItemSlug(item);
        if (data.owned) card.classList.add('owned');
        if (data.wishlist && !data.owned) card.classList.add('wishlist');
        card.dataset.id = item.id;

        const conditionHTML = data.condition
            ? `<span class="badge card-condition condition-${data.condition}">${formatCondition(data.condition)}</span>`
            : '';

        const thumbPath = Array.isArray(item.image) && item.image.length > 0 ? item.image[0] : null;
        const imageHTML = thumbPath
            ? `<img src="${escapeHTML(thumbPath)}" alt="${escapeHTML(item.name)}" loading="lazy">
               <svg viewBox="0 0 100 100" class="placeholder-icon" style="display:none;">
                   <path d="M50 5 L30 55 L5 95 L25 95 L50 55 L75 95 L95 95 L70 55 Z" fill="currentColor"/>
               </svg>`
            : `<svg viewBox="0 0 100 100" class="placeholder-icon">
                   <path d="M50 5 L30 55 L5 95 L25 95 L50 55 L75 95 L95 95 L70 55 Z" fill="currentColor"/>
               </svg>`;

        const newBadgeHTML = NEW_ITEM_IDS.has(item.id)
            ? '<span class="badge-new">NEW</span>'
            : '';

        card.innerHTML = `
            ${newBadgeHTML}
            <div class="card-image">
                ${imageHTML}
                <div class="card-badges">
                    ${data.owned ? '<span class="badge badge-owned">Owned</span>' : ''}
                    ${data.wishlist && !data.owned ? '<span class="badge badge-wishlist">Wishlist</span>' : ''}
                    ${data.hasRead && ACDB.isReadable(item) ? '<span class="badge badge-read">Read</span>' : ''}
                </div>
            </div>
            <div class="card-body">
                <div class="card-game">${escapeHTML(item.game)}</div>
                <div class="card-title">${escapeHTML(item.name)}</div>
                <div class="card-description">${escapeHTML(item.description)}</div>
                <div class="card-footer">
                    <span class="card-year">${item.year}</span>
                    <span class="badge badge-plain card-type">${escapeHTML(item.type)}</span>
                    ${conditionHTML}
                </div>
            </div>
        `;

        // Handle broken images — show placeholder SVG
        const cardImg = card.querySelector('.card-image img');
        if (cardImg) {
            cardImg.addEventListener('error', function () {
                this.style.display = 'none';
                this.nextElementSibling.style.display = 'flex';
            });
        }

        card.addEventListener('click', (e) => {
            // Let Ctrl+click / middle-click open in new tab naturally
            if (e.ctrlKey || e.metaKey || e.button === 1) return;
            e.preventDefault();
            if (card.closest('#profileItemsGrid')) {
                ACDB.openReadOnlyModal(item.id);
            } else {
                openModal(item.id);
            }
        });
        return card;
    }

    // formatCondition — moved to utils.js
    const formatCondition = ACDB.formatCondition;

    // ---- Stats ----
    // updateStats — moved to stats.js
    const updateStats = ACDB.updateStats;

    // ---- Modal, Gallery, Lightbox — moved to modal.js ----
    const openModal = ACDB.openModal;
    const closeModal = ACDB.closeModal;
    const saveModalData = ACDB.saveModalData;
    const galleryPrev = ACDB.galleryPrev;
    const galleryNext = ACDB.galleryNext;
    const lightbox = ACDB.lightbox;

    // ---- Dev Tool — moved to devtool.js ----
    const openDevTool = ACDB.openDevTool;
    const closeDevTool = ACDB.closeDevTool;
    const generateCode = ACDB.generateCode;


    // ---- Filter Persistence ----
    function saveFilters() {
        const filters = {
            search: dom.searchInput.value,
            games: [...selectedGames],
            categories: [...selectedCategories],
            types: [...selectedTypes],
            series: [...selectedSeries],
            owned: dom.filterOwned.value,
            sort: dom.sortBy.value
        };
        localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
    }

    function restoreFilters() {
        try {
            const data = localStorage.getItem(FILTERS_KEY);
            if (!data) return;
            const filters = JSON.parse(data);

            if (filters.search) {
                dom.searchInput.value = filters.search;
                dom.clearSearch.classList.toggle('visible', filters.search.length > 0);
            }
            if (filters.games && filters.games.length > 0) {
                selectedGames = new Set(filters.games);
                setMultiSelectValues(dom.filterGame, selectedGames);
                syncTimelineToSelectedGames();
            }
            if (filters.categories && filters.categories.length > 0) {
                selectedCategories = new Set(filters.categories);
            }
            populateCategoryFilter();
            if (filters.types && filters.types.length > 0) {
                selectedTypes = new Set(filters.types);
            }
            populateTypeFilter();
            if (filters.series && filters.series.length > 0) {
                selectedSeries = new Set(filters.series);
            }
            populateSeriesFilter();
            if (filters.owned) dom.filterOwned.value = filters.owned;
            if (filters.sort) dom.sortBy.value = filters.sort;
        } catch { /* ignore corrupt data */ }
    }

    // ---- Stats Dashboard — moved to stats.js ----
    const renderStatsDashboard = ACDB.renderStatsDashboard;

    // ---- Collection Export / Import — moved to collection.js ----
    const exportCollection = ACDB.exportCollection;
    const importCollection = ACDB.importCollection;

    // checkCompletionCelebration — moved to stats.js
    const checkCompletionCelebration = ACDB.checkCompletionCelebration;

    // showToast — moved to utils.js
    const showToast = ACDB.showToast;

    // ---- Sharing, Profile, Leaderboard — moved to sharing.js ----
    const getOwnedItemIds = ACDB.getOwnedItemIds;
    const isShared = ACDB.isShared;
    const updateShareButton = ACDB.updateShareButton;
    const openShareModal = ACDB.openShareModal;
    const closeShareModal = ACDB.closeShareModal;
    const showMainContent = ACDB.showMainContent;
    const hideMainContent = ACDB.hideMainContent;
    const showProfile = ACDB.showProfile;
    const showLeaderboard = ACDB.showLeaderboard;

    // ---- URL Hash Routing ----
    // slugify — moved to utils.js
    const slugify = ACDB.slugify;

    function getItemSlug(item) {
        return slugify(item.name);
    }

    function findItemBySlug(slug) {
        return AC_DATABASE.find(i => slugify(i.name) === slug);
    }

    let suppressHashChange = false;
    let readOnlyHashPushed = false;
    let readOnlyPushedHash = '';
    let lightboxHashPushed = false;
    let lightboxPushedHash = '';
    let suppressNextPopstate = false;

    function setHash(item) {
        suppressHashChange = true;
        history.pushState(null, '', '#' + getItemSlug(item));
        suppressHashChange = false;
    }

    function clearHash() {
        suppressHashChange = true;
        history.pushState(null, '', window.location.pathname + window.location.search);
        suppressHashChange = false;
    }

    // Push a duplicate history entry when the read-only modal opens, so that
    // pressing the browser back button pops this duplicate (closing the modal)
    // instead of navigating away from the current view.
    function pushReadOnlyHistoryState() {
        readOnlyPushedHash = window.location.hash;
        history.pushState(null, '', window.location.href);
        readOnlyHashPushed = true;
    }

    // Pop the duplicate history entry when the read-only modal closes via
    // X/Esc/overlay, so the history stack stays clean and a subsequent back
    // takes the user up a level as expected.
    function popReadOnlyHistoryState() {
        if (!readOnlyHashPushed) return;
        readOnlyHashPushed = false;
        suppressNextPopstate = true;
        history.back();
    }

    // Same pattern for the lightbox (one layer above the modal). Back button
    // should close the lightbox without closing the modal underneath it.
    function pushLightboxHistoryState() {
        lightboxPushedHash = window.location.hash;
        history.pushState(null, '', window.location.href);
        lightboxHashPushed = true;
    }

    function popLightboxHistoryState() {
        if (!lightboxHashPushed) return;
        lightboxHashPushed = false;
        suppressNextPopstate = true;
        history.back();
    }

    function handleHash() {
        // Lightbox comes first — it sits on top of the modal and must close
        // first on back-button (matching existing Esc-key priority order).
        if (lightboxHashPushed && lightbox.overlay.classList.contains('active')) {
            const hashUnchanged = window.location.hash === lightboxPushedHash;
            lightboxHashPushed = false;
            lightbox.close({ skipHistoryPop: true });
            if (hashUnchanged) return;
        }

        // If a read-only modal pushed a history entry and we just popped it
        // (back button or URL-bar change), close the modal. If the hash is
        // unchanged (back button), return early; otherwise fall through to
        // route the new hash.
        if (readOnlyHashPushed && dom.modalOverlay.classList.contains('active')) {
            const hashUnchanged = window.location.hash === readOnlyPushedHash;
            readOnlyHashPushed = false;
            closeModal({ skipClearHash: true, skipHistoryPop: true });
            if (hashUnchanged) return;
        }

        const hash = window.location.hash.slice(1);
        if (!hash) {
            // Hash cleared (back button) — close modal if open, show main content.
            // Use skipClearHash so closeModal doesn't re-push history state.
            if (dom.modalOverlay.classList.contains('active')) {
                closeModal({ skipClearHash: true });
            }
            showMainContent();
            return;
        }

        // Profile view
        if (hash.startsWith('profile/')) {
            const name = hash.replace('profile/', '');
            const fromLB = document.getElementById('leaderboardView').style.display !== 'none';
            showProfile(name, fromLB);
            return;
        }

        // Leaderboard view
        if (hash === 'leaderboard') {
            showLeaderboard();
            return;
        }

        // Reading order view (#reading shows the first order)
        if (hash === 'reading' || hash.startsWith('reading/')) {
            if (dom.modalOverlay.classList.contains('active')) closeModal({ skipClearHash: true });
            ACDB.showReadingOrder(hash.slice('reading/'.length) || null);
            return;
        }

        // Item modal
        showMainContent();
        const item = findItemBySlug(hash);
        if (item) openModal(item.id, true);
    }

    // ---- Utilities (moved to utils.js) ----
    const escapeHTML = ACDB.escapeHTML;
    const debounce = ACDB.debounce;

    // ---- Event Listeners ----
    function initEvents() {
        // Search
        dom.searchInput.addEventListener('input', debounce(() => {
            dom.clearSearch.classList.toggle('visible', dom.searchInput.value.length > 0);
            renderItems();
        }, 200));

        dom.clearSearch.addEventListener('click', () => {
            dom.searchInput.value = '';
            dom.clearSearch.classList.remove('visible');
            renderItems();
            dom.searchInput.focus();
        });

        // Another tab saved the collection. Both tabs save the whole object,
        // so two saves close together can each miss the other's latest edit:
        // merge per item, keeping the newer `updatedAt`, and save again if this
        // tab held something newer. An empty collection is a deliberate reset
        // (signing out), so it is taken as is.
        window.addEventListener('storage', (e) => {
            if (e.key !== STORAGE_KEY) return;
            const stored = loadCollection();
            let keptOwn = false;
            if (Object.keys(stored).length > 0) {
                Object.entries(collection).forEach(([id, mine]) => {
                    const theirs = stored[id];
                    if (!theirs || (mine.updatedAt || 0) > (theirs.updatedAt || 0)) {
                        stored[id] = mine;
                        keptOwn = true;
                    }
                });
            }
            collection = stored;
            if (keptOwn) saveCollection();
            renderItems();
        });

        // Filters
        // URL hash routing (back button support)
        window.addEventListener('popstate', () => {
            if (suppressNextPopstate) {
                suppressNextPopstate = false;
                return;
            }
            if (!suppressHashChange) handleHash();
        });

        // Back to top
        const backToTop = document.getElementById('backToTop');
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: ACDB.scrollBehavior() });
        });

        // Lightbox
        lightbox.init();

        // Stats dashboard toggle
        dom.statsToggle.addEventListener('click', () => {
            dom.statsDashboard.classList.toggle('open');
            const isOpen = dom.statsDashboard.classList.contains('open');
            document.getElementById('statsSortToggle').style.display = isOpen ? 'flex' : 'none';
            if (isOpen) renderStatsDashboard();
        });

        // Put every filter back to its default (search, dropdowns, owned, sort).
        function resetAllFilters() {
            dom.searchInput.value = '';
            dom.clearSearch.classList.remove('visible');
            clearAllSelections();
            clearMultiSelect(dom.filterGame);
            dom.filterOwned.value = '';
            dom.sortBy.value = '';
            syncTimelineToSelectedGames();
            populateDependentFilters();
        }

        // Click-to-filter (dashboard bars + modal badges) — replaces all
        // filters with the clicked game/category/type/series
        function applyExclusiveFilter(kind, value) {
            dom.searchInput.value = '';
            dom.clearSearch.classList.remove('visible');
            clearAllSelections();
            dom.filterOwned.value = '';
            selectionSetFor(kind).add(value);
            setMultiSelectValues(dom.filterGame, selectedGames);
            syncTimelineToSelectedGames();
            populateDependentFilters();
            renderItems();
            window.scrollTo({ top: 0, behavior: ACDB.scrollBehavior() });
        }
        ACDB.applyExclusiveFilter = applyExclusiveFilter;   // series pages in the reading view
        dom.statsByGame.addEventListener('click', (e) => {
            const row = e.target.closest('.stats-bar-row.clickable');
            if (row) applyExclusiveFilter('game', row.dataset.label);
        });
        dom.statsByCategory.addEventListener('click', (e) => {
            const row = e.target.closest('.stats-bar-row.clickable');
            if (row) applyExclusiveFilter('category', row.dataset.label);
        });
        dom.statsReading.addEventListener('click', (e) => {
            const row = e.target.closest('.stats-bar-row.clickable');
            if (row) applyExclusiveFilter('series', row.dataset.label);
        });

        // Stats sort toggle (% vs #)
        document.querySelectorAll('.stats-sort-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                statsSortMode = btn.dataset.sort;
                if (statsSortMode !== 'timeline') lastBarSortMode = statsSortMode;
                document.querySelectorAll('.stats-sort-btn').forEach(b => {
                    b.classList.toggle('active', b === btn);
                    b.setAttribute('aria-pressed', String(b === btn));
                });
                renderStatsDashboard();
            });
        });

        // Multi-select clear buttons
        dom.filterGame.querySelector('.multi-select-clear').addEventListener('click', (e) => {
            e.stopPropagation();
            selectedGames.clear();
            clearMultiSelect(dom.filterGame);
            syncTimelineToSelectedGames();
            populateDependentFilters();
            renderItems();
        });
        dom.filterCategory.querySelector('.multi-select-clear').addEventListener('click', (e) => {
            e.stopPropagation();
            selectedCategories.clear();
            clearMultiSelect(dom.filterCategory);
            populateTypeFilter();
            populateSeriesFilter();
            renderItems();
        });
        dom.filterType.querySelector('.multi-select-clear').addEventListener('click', (e) => {
            e.stopPropagation();
            selectedTypes.clear();
            clearMultiSelect(dom.filterType);
            populateSeriesFilter();
            renderItems();
        });
        dom.filterSeries.querySelector('.multi-select-clear').addEventListener('click', (e) => {
            e.stopPropagation();
            selectedSeries.clear();
            clearMultiSelect(dom.filterSeries);
            renderItems();
        });

        // Multi-select open/close
        document.querySelectorAll('.multi-select-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const ms = btn.closest('.multi-select');
                const wasOpen = ms.classList.contains('open');
                document.querySelectorAll('.multi-select.open').forEach(el => {
                    el.classList.remove('open');
                    const search = el.querySelector('.multi-select-search');
                    if (search) {
                        search.value = '';
                        el.querySelectorAll('.multi-select-option').forEach(opt => opt.style.display = '');
                    }
                });
                if (!wasOpen) {
                    ms.classList.add('open');
                    const search = ms.querySelector('.multi-select-search');
                    if (search) setTimeout(() => search.focus(), 50);
                }
            });
        });

        // Close multi-selects on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.multi-select')) {
                document.querySelectorAll('.multi-select.open').forEach(el => {
                    el.classList.remove('open');
                    const search = el.querySelector('.multi-select-search');
                    if (search) {
                        search.value = '';
                        el.querySelectorAll('.multi-select-option').forEach(opt => opt.style.display = '');
                    }
                });
            }
        });

        // Multi-select change handlers
        dom.filterGame.querySelector('.multi-select-options').addEventListener('change', () => {
            selectedGames = getSelectedValues(dom.filterGame);
            updateMultiSelectLabel(dom.filterGame);
            syncTimelineToSelectedGames();
            populateDependentFilters();
            renderItems();
        });

        dom.filterCategory.querySelector('.multi-select-options').addEventListener('change', () => {
            selectedCategories = getSelectedValues(dom.filterCategory);
            updateMultiSelectLabel(dom.filterCategory);
            populateTypeFilter();
            populateSeriesFilter();
            renderItems();
        });

        dom.filterType.querySelector('.multi-select-options').addEventListener('change', () => {
            selectedTypes = getSelectedValues(dom.filterType);
            updateMultiSelectLabel(dom.filterType);
            populateSeriesFilter();
            renderItems();
        });

        dom.filterSeries.querySelector('.multi-select-options').addEventListener('change', () => {
            selectedSeries = getSelectedValues(dom.filterSeries);
            updateMultiSelectLabel(dom.filterSeries);
            renderItems();
        });

        // Search box inside a dropdown (types, series) — narrows the visible
        // options as you type without closing the dropdown.
        document.querySelectorAll('.multi-select-search').forEach(searchEl => {
            const multiSelectEl = searchEl.closest('.multi-select');
            searchEl.addEventListener('input', () => {
                const query = searchEl.value.toLowerCase();
                multiSelectEl.querySelectorAll('.multi-select-option').forEach(opt => {
                    const text = opt.querySelector('.multi-select-text').textContent.toLowerCase();
                    opt.style.display = text.includes(query) ? '' : 'none';
                });
            });
            searchEl.addEventListener('click', (e) => e.stopPropagation());
        });

        dom.filterOwned.addEventListener('change', renderItems);
        dom.sortBy.addEventListener('change', renderItems);

        // View toggle
        function setLayout(list) {
            dom.viewList.classList.toggle('active', list);
            dom.viewGrid.classList.toggle('active', !list);
            dom.viewList.setAttribute('aria-pressed', String(list));
            dom.viewGrid.setAttribute('aria-pressed', String(!list));
            dom.itemsContainer.classList.toggle('list-view', list);
        }
        dom.viewGrid.addEventListener('click', () => setLayout(false));
        dom.viewList.addEventListener('click', () => setLayout(true));

        // Timeline — toggle game in multi-select
        dom.gameTimeline.addEventListener('click', (e) => {
            const btn = e.target.closest('.timeline-btn');
            if (!btn) return;

            const game = btn.dataset.game;
            if (game === '') {
                // "All" button: clear selections
                selectedGames.clear();
                clearMultiSelect(dom.filterGame);
            } else {
                if (selectedGames.has(game)) {
                    selectedGames.delete(game);
                } else {
                    selectedGames.add(game);
                }
                setMultiSelectValues(dom.filterGame, selectedGames);
            }
            syncTimelineToSelectedGames();
            populateDependentFilters();
            renderItems();
        });

        // Modal
        dom.modalClose.addEventListener('click', closeModal);
        dom.modalOverlay.addEventListener('click', (e) => {
            if (e.target === dom.modalOverlay) closeModal();
        });

        // Modal badge click-to-filter — close the card, then filter by the
        // clicked value. The filter-link class is absent in read-only mode
        // (profile/leaderboard), where the browse grid isn't visible.
        function applyModalFilter(kind, el) {
            if (!el.classList.contains('filter-link')) return;
            closeModal();
            applyExclusiveFilter(kind, el.textContent);
        }
        dom.modalBadge.addEventListener('click', () => applyModalFilter('category', dom.modalBadge));
        dom.modalBadgeType.addEventListener('click', () => applyModalFilter('type', dom.modalBadgeType));
        dom.modalGame.addEventListener('click', () => applyModalFilter('game', dom.modalGame));
        dom.modalSeries.addEventListener('click', () => applyModalFilter('series', dom.modalSeries));

        // Share link — points at the static /s/<slug> page (generated by
        // tools/build-share-pages.py) so pasted links unfurl with item-specific
        // Open Graph tags; the page itself redirects into the app at /#<slug>.
        // On touch devices with the Web Share API the button opens the native
        // share sheet; everywhere else it copies the link to the clipboard.
        const shareBtn = document.getElementById('modalCopyLink');
        const canWebShare = typeof navigator.share === 'function'
            && window.matchMedia('(pointer: coarse)').matches;
        if (canWebShare) {
            shareBtn.title = 'Share this item';
            shareBtn.setAttribute('aria-label', 'Share this item');
        }
        shareBtn.addEventListener('click', () => {
            const item = AC_DATABASE.find(i => i.id === ACDB.getCurrentItemId());
            if (!item) return;
            const url = 'https://acdb.theprivategeek.com/s/' + slugify(item.name);
            const copyLink = () => navigator.clipboard.writeText(url).then(() => showToast('Link copied!', 'success'));
            if (canWebShare) {
                navigator.share({ title: item.name, text: item.description, url })
                    .catch(err => {
                        // AbortError = user dismissed the sheet; anything else
                        // (unsupported target, permission) falls back to copy.
                        if (!err || err.name !== 'AbortError') copyLink();
                    });
            } else {
                copyLink();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // The merge dialog needs an answer; leave everything as is.
                if (document.getElementById('mergeModalOverlay').classList.contains('active')) return;
                if (ACDB.isAccountMenuOpen()) {
                    ACDB.closeAccountMenu();
                    return;
                }
                if (lightbox.overlay.classList.contains('active')) {
                    lightbox.close();
                    return;
                }
                const openDropdown = document.querySelector('.multi-select.open');
                if (openDropdown) {
                    openDropdown.classList.remove('open');
                } else if (document.getElementById('shareModalOverlay').classList.contains('active')) {
                    closeShareModal();
                } else if (dom.devToolOverlay.classList.contains('active')) {
                    closeDevTool();
                } else if (dom.modalOverlay.classList.contains('active')) {
                    closeModal();
                }
            }
            if (lightbox.overlay.classList.contains('active')) {
                if (e.key === 'ArrowLeft' && ACDB.getGalleryImages().length > 1) lightbox.prev();
                if (e.key === 'ArrowRight' && ACDB.getGalleryImages().length > 1) lightbox.next();
                return;
            }
            if (!dom.modalOverlay.classList.contains('active')) return;
            if (e.key === 'ArrowLeft' && ACDB.getGalleryImages().length > 1) galleryPrev();
            if (e.key === 'ArrowRight' && ACDB.getGalleryImages().length > 1) galleryNext();
        });

        // Gallery navigation
        dom.galleryPrev.addEventListener('click', (e) => { e.stopPropagation(); galleryPrev(); });
        dom.galleryNext.addEventListener('click', (e) => { e.stopPropagation(); galleryNext(); });

        // Gallery touch swipe
        let touchStartX = 0;
        dom.modalImage.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        dom.modalImage.addEventListener('touchend', (e) => {
            if (ACDB.getGalleryImages().length <= 1) return;
            const diff = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(diff) > 50) {
                if (diff < 0) galleryNext();
                else galleryPrev();
            }
        });

        // Modal collection controls - auto-save on change
        const autoSaveControls = [dom.modalOwned, dom.modalWishlist, dom.modalHasBox, dom.modalCondition, dom.modalPricePaid, dom.modalAcquiredDate];
        autoSaveControls.forEach(el => {
            el.addEventListener('change', saveModalData);
        });

        dom.modalCopies.addEventListener('change', saveModalData);
        dom.modalCopies.addEventListener('input', saveModalData);

        dom.modalNotes.addEventListener('input', debounce(saveModalData, 500));

        // Reading status: a finished date implies "read", and un-marking an
        // item as read clears its date. Independent of ownership on purpose,
        // so un-owning an item never touches it.
        dom.modalHasRead.addEventListener('change', () => {
            if (!dom.modalHasRead.checked) dom.modalReadDate.value = '';
            saveModalData();
        });
        dom.modalReadDate.addEventListener('change', () => {
            if (dom.modalReadDate.value) dom.modalHasRead.checked = true;
            saveModalData();
        });

        // Copies +/- buttons
        dom.copiesMinus.addEventListener('click', () => {
            let val = parseInt(dom.modalCopies.value) || 0;
            if (val > 0) {
                dom.modalCopies.value = val - 1;
                if (val - 1 === 0) {
                    dom.modalOwned.checked = false;
                    dom.modalHasBox.checked = false;
                    dom.modalCondition.value = '';
                    dom.modalPricePaid.value = '';
                    dom.modalAcquiredDate.value = '';
                    dom.modalNotes.value = '';
                }
                saveModalData();
            }
        });

        dom.copiesPlus.addEventListener('click', () => {
            let val = parseInt(dom.modalCopies.value) || 0;
            if (val < 99) {
                dom.modalCopies.value = val + 1;
                if (!dom.modalOwned.checked) {
                    dom.modalOwned.checked = true;
                }
                saveModalData();
            }
        });

        // Progress meter — show owned items
        document.getElementById('statOwned').addEventListener('click', () => {
            showMainContent();
            clearHash();
            dom.filterOwned.value = 'owned';
            renderItems();
            window.scrollTo({ top: 0, behavior: ACDB.scrollBehavior() });
        });

        // Collection tab — back to the grid with filters kept (the logo resets them)
        document.getElementById('navCollection').addEventListener('click', (e) => {
            e.preventDefault();
            showMainContent();
            clearHash();
            window.scrollTo({ top: 0, behavior: ACDB.scrollBehavior() });
        });

        // Export / Import
        dom.exportBtn.addEventListener('click', exportCollection);
        dom.importBtn.addEventListener('click', () => dom.importFile.click());
        dom.importFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                importCollection(e.target.files[0]);
                e.target.value = ''; // reset so same file can be re-imported
            }
        });

        // Logo — reset all filters
        document.getElementById('logoLink').addEventListener('click', (e) => {
            e.preventDefault();
            resetAllFilters();
            showMainContent();
            clearHash();
            renderItems();
            window.scrollTo({ top: 0, behavior: ACDB.scrollBehavior() });
        });

        // Share Collection
        document.getElementById('shareBtn').addEventListener('click', openShareModal);
        document.getElementById('shareModalClose').addEventListener('click', closeShareModal);
        document.getElementById('shareCancel').addEventListener('click', closeShareModal);
        document.getElementById('shareModalOverlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('shareModalOverlay')) closeShareModal();
        });
        document.getElementById('shareSubmit').addEventListener('click', ACDB.performShare);
        document.getElementById('shareDone').addEventListener('click', closeShareModal);
        document.getElementById('shareCopyUrl').addEventListener('click', () => {
            const urlInput = document.getElementById('shareUrl');
            navigator.clipboard.writeText(urlInput.value).then(() => showToast('Link copied!', 'success'));
        });

        document.getElementById('shareManageCancel').addEventListener('click', closeShareModal);
        document.getElementById('shareManageCopyUrl').addEventListener('click', () => {
            const urlInput = document.getElementById('shareManageUrl');
            navigator.clipboard.writeText(urlInput.value).then(() => showToast('Link copied!', 'success'));
        });
        document.getElementById('shareUpdateBtn').addEventListener('click', () => {
            const owned = getOwnedItemIds();
            ACDB.performUpdate(owned);
        });
        document.getElementById('shareDeleteBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete your shared profile? This cannot be undone.')) {
                ACDB.deleteProfile();
            }
        });

        // Name availability check with debounce
        document.getElementById('shareDisplayName').addEventListener('input', (e) => {
            clearTimeout(ACDB.nameCheckTimer);
            ACDB.nameCheckTimer = setTimeout(() => ACDB.checkNameAvailability(e.target.value.trim()), 400);
        });

        // Profile back button
        document.getElementById('profileBackBtn').addEventListener('click', (e) => {
            e.preventDefault();
            if (ACDB.getProfileFromLeaderboard()) {
                document.getElementById('profileView').style.display = 'none';
                window.location.hash = 'leaderboard';
            } else {
                showMainContent();
                clearHash();
            }
        });
        // Dev Tool
        dom.addItemBtn.addEventListener('click', openDevTool);
        dom.devToolClose.addEventListener('click', closeDevTool);
        dom.devToolOverlay.addEventListener('click', (e) => {
            if (e.target === dom.devToolOverlay) closeDevTool();
        });

        // Dev Tool — live code generation on any input change
        const devFields = ['devName', 'devGame', 'devYear', 'devCategory', 'devType', 'devSeries',
            'devDescription', 'devContents', 'devRead', 'devImagePath', 'devNewGameName', 'devNewGameShort'];
        devFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', generateCode);
            if (el && el.tagName === 'SELECT') el.addEventListener('change', generateCode);
        });

        // New Game toggle
        document.getElementById('devNewGame').addEventListener('change', (e) => {
            const isNew = e.target.checked;
            document.getElementById('devGame').style.display = isNew ? 'none' : '';
            document.getElementById('devNewGameFields').style.display = isNew ? '' : 'none';
            generateCode();
        });

        // Copy Code button
        document.getElementById('devCopyCode').addEventListener('click', () => {
            const code = document.getElementById('devCodeOutput').value;
            if (!code) return;
            navigator.clipboard.writeText(code).then(() => showToast('Code copied to clipboard!', 'success'));
        });

        // Collection field interdependencies
        dom.modalOwned.addEventListener('change', () => {
            if (dom.modalOwned.checked && parseInt(dom.modalCopies.value) === 0) {
                dom.modalCopies.value = 1;
            }
            if (!dom.modalOwned.checked) {
                dom.modalCopies.value = 0;
                dom.modalHasBox.checked = false;
                dom.modalCondition.value = '';
                dom.modalPricePaid.value = '';
                dom.modalAcquiredDate.value = '';
                dom.modalNotes.value = '';
            }
            saveModalData();
        });

        dom.modalCondition.addEventListener('change', () => {
            if (dom.modalCondition.value && !dom.modalOwned.checked) {
                dom.modalOwned.checked = true;
                if (parseInt(dom.modalCopies.value) === 0) {
                    dom.modalCopies.value = 1;
                }
                saveModalData();
            }
        });

        dom.modalHasBox.addEventListener('change', () => {
            if (dom.modalHasBox.checked && !dom.modalOwned.checked) {
                dom.modalOwned.checked = true;
                if (parseInt(dom.modalCopies.value) === 0) {
                    dom.modalCopies.value = 1;
                }
                saveModalData();
            }
        });

        // Copies +/- already handled above; add ownership trigger for manual input
        dom.modalCopies.addEventListener('change', () => {
            const val = parseInt(dom.modalCopies.value) || 0;
            if (val > 0 && !dom.modalOwned.checked) {
                dom.modalOwned.checked = true;
                saveModalData();
            }
            if (val === 0 && dom.modalOwned.checked) {
                dom.modalOwned.checked = false;
                dom.modalHasBox.checked = false;
                dom.modalCondition.value = '';
                dom.modalPricePaid.value = '';
                dom.modalAcquiredDate.value = '';
                dom.modalNotes.value = '';
                saveModalData();
            }
        });
    }

    // ---- Initialize ----
    function init() {
        // Coming back from Google's sign-in page: restore the address before
        // anything reads the hash.
        ACDB.consumeAuthRedirect();

        // Hide admin-only buttons for public visitors
        if (!isAdmin) {
            dom.addItemBtn.style.display = 'none';
        }

        // The toolbar sticks just under the header, whose height changes with
        // the layout (tabs wrap to their own row on narrower screens).
        const header = document.querySelector('.main-header');
        new ResizeObserver(() => {
            document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
        }).observe(header);

        initFilters();
        initEvents();
        restoreFilters();
        renderItems();

        // Footer item count
        const footerCount = document.getElementById('footerItemCount');
        if (footerCount) footerCount.textContent = AC_DATABASE.length;

        // Share button state
        updateShareButton();

        // Open item from URL hash if present
        handleHash();

        // Account button, sign-in banner, and cloud sync when signed in
        ACDB.initAuth();
    }

    // ---- Expose shared API for multi-file modules ----
    const A = window.ACDB;

    // Constants
    A.STORAGE_KEY = STORAGE_KEY;
    A.FILTERS_KEY = FILTERS_KEY;
    A.API_URL = API_URL;
    A.SHARE_TOKEN_KEY = SHARE_TOKEN_KEY;
    A.SHARE_NAME_KEY = SHARE_NAME_KEY;
    A.SHORT_GAME_NAMES = SHORT_GAME_NAMES;
    A.GAME_ORDER = GAME_ORDER;
    A.isAdmin = isAdmin;

    // ---- Expose shared state & functions for other modules ----
    A.dom = dom;
    A.getCollection = () => collection;
    A.setCollection = (c) => { collection = c; };
    A.getSelectedGames = () => selectedGames;
    A.setSelectedGames = (s) => { selectedGames = s; };
    A.getSelectedCategories = () => selectedCategories;
    A.setSelectedCategories = (s) => { selectedCategories = s; };
    A.getSelectedTypes = () => selectedTypes;
    A.setSelectedTypes = (s) => { selectedTypes = s; };
    A.getSelectedSeries = () => selectedSeries;
    A.setSelectedSeries = (s) => { selectedSeries = s; };
    A.getStatsSortMode = () => statsSortMode;
    A.setStatsSortMode = (m) => { statsSortMode = m; };
    A.getLastBarSortMode = () => lastBarSortMode;

    // Functions still in app.js
    A.loadCollection = loadCollection;
    A.saveCollection = saveCollection;
    A.getItemData = getItemData;
    A.setItemData = setItemData;
    A.findItemByRef = findItemByRef;
    A.renderItems = renderItems;
    A.createCard = createCard;
    A.getFilteredItems = getFilteredItems;
    A.initFilters = initFilters;
    A.populateCategoryFilter = populateCategoryFilter;
    A.populateTypeFilter = populateTypeFilter;
    A.populateSeriesFilter = populateSeriesFilter;
    A.populateDependentFilters = populateDependentFilters;
    A.getSelectedValues = getSelectedValues;
    A.updateMultiSelectLabel = updateMultiSelectLabel;
    A.setMultiSelectValues = setMultiSelectValues;
    A.clearMultiSelect = clearMultiSelect;
    A.syncTimelineToSelectedGames = syncTimelineToSelectedGames;
    A.saveFilters = saveFilters;
    A.restoreFilters = restoreFilters;
    A.setHash = setHash;
    A.clearHash = clearHash;
    A.handleHash = handleHash;
    A.pushReadOnlyHistoryState = pushReadOnlyHistoryState;
    A.popReadOnlyHistoryState = popReadOnlyHistoryState;
    A.pushLightboxHistoryState = pushLightboxHistoryState;
    A.popLightboxHistoryState = popLightboxHistoryState;

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
