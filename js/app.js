/* ============================================
   ACDb - Application Logic
   ============================================ */

// ---- Shared Namespace ----
window.ACDB = window.ACDB || {};

(function () {
    'use strict';

    // ---- State ----
    const STORAGE_KEY = 'acdb_collection';
    const FILTERS_KEY = 'acdb_filters';
    const API_URL = 'https://api.acdb.workers.dev';
    const SHARE_TOKEN_KEY = 'acdb_share_token';
    const SHARE_NAME_KEY = 'acdb_share_name';
    const isAdmin = localStorage.getItem('acdb_admin') === 'true';
    let collection = loadCollection();
    let selectedGames = new Set();
    let selectedCategories = new Set();
    let selectedTypes = new Set();
    let statsSortMode = 'percent'; // 'percent' or 'count'
    // currentItemId, galleryImages, galleryIndex — owned by modal.js

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
        "Assassin's Creed (Movie)": "Movie",
        "General": "General"
    };

    // ---- TEMPORARY: Migration from numeric IDs to name-based keys ----
    // Added: 2026-04-11 | Safe to remove after: 2026-04-18
    // To remove: delete this entire IIFE block (from here to the closing })();)
    // Also remove localStorage.getItem('acdb_migrated') check — no longer needed
    // Must run BEFORE reassigning IDs, while array indices still match old numeric keys
    (function migrateCollection() {
        if (localStorage.getItem('acdb_migrated')) return;
        const keys = Object.keys(collection);
        if (keys.length === 0) { localStorage.setItem('acdb_migrated', '1'); return; }

        // Check if keys are numeric (old format)
        const isNumeric = keys.some(k => /^\d+$/.test(k));
        if (!isNumeric) { localStorage.setItem('acdb_migrated', '1'); return; }

        // Map numeric IDs to names using current array order
        const migrated = {};
        keys.forEach(k => {
            const idx = parseInt(k);
            if (idx >= 0 && idx < AC_DATABASE.length) {
                migrated[AC_DATABASE[idx].name] = collection[k];
            }
        });

        collection = migrated;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
        localStorage.setItem('acdb_migrated', '1');
    })();

    // ---- Assign stable IDs (name-based) to each database item ----
    AC_DATABASE.forEach((item) => {
        item.id = item.name;
    });

    // ---- DOM References ----
    const dom = {
        totalItems: document.getElementById('totalItems'),
        ownedItems: document.getElementById('ownedItems'),
        completionPercent: document.getElementById('completionPercent'),
        searchInput: document.getElementById('searchInput'),
        clearSearch: document.getElementById('clearSearch'),
        filterGame: document.getElementById('filterGame'),
        filterCategory: document.getElementById('filterCategory'),
        filterType: document.getElementById('filterType'),
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
        resultsCount: document.getElementById('resultsCount'),
        statsDashboard: document.getElementById('statsDashboard'),
        statsToggle: document.getElementById('statsToggle'),
        statsPanel: document.getElementById('statsPanel'),
        statsByGame: document.getElementById('statsByGame'),
        statsByCategory: document.getElementById('statsByCategory'),
        statsByCondition: document.getElementById('statsByCondition'),
        // Dev Tool
        addItemBtn: document.getElementById('addItemBtn'),
        devToolOverlay: document.getElementById('devToolOverlay'),
        devToolClose: document.getElementById('devToolClose'),
    };

    // ---- Collection Persistence ----
    function loadCollection() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch {
            return {};
        }
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
            notes: ''
        };
    }

    function setItemData(id, data) {
        collection[id] = data;
        saveCollection();
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

    function populateCategoryFilter() {
        const catOptionsContainer = dom.filterCategory.querySelector('.multi-select-options');
        catOptionsContainer.innerHTML = '';

        // Only show categories from items matching current game selection
        const gameFilters = getSelectedValues(dom.filterGame);
        const relevantItems = gameFilters.size > 0
            ? AC_DATABASE.filter(i => gameFilters.has(i.game))
            : AC_DATABASE;

        const categories = [...new Set(relevantItems.map(i => i.category))].sort();

        // Remove selected categories that no longer exist in the filtered set
        selectedCategories.forEach(c => { if (!categories.includes(c)) selectedCategories.delete(c); });

        categories.forEach(cat => {
            const count = relevantItems.filter(i => i.category === cat).length;
            const label = document.createElement('label');
            label.className = 'multi-select-option';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = cat;
            const check = document.createElement('span');
            check.className = 'multi-select-check';
            const text = document.createElement('span');
            text.className = 'multi-select-text';
            text.textContent = `${cat} (${count})`;
            label.appendChild(cb);
            label.appendChild(check);
            label.appendChild(text);
            catOptionsContainer.appendChild(label);
        });
        setMultiSelectValues(dom.filterCategory, selectedCategories);
    }

    function populateTypeFilter() {
        const typeOptionsContainer = dom.filterType.querySelector('.multi-select-options');
        typeOptionsContainer.innerHTML = '';

        // Only show types from items matching current game + category selection
        const gameFilters = getSelectedValues(dom.filterGame);
        const catFilters = getSelectedValues(dom.filterCategory);
        let relevantItems = AC_DATABASE;
        if (gameFilters.size > 0) relevantItems = relevantItems.filter(i => gameFilters.has(i.game));
        if (catFilters.size > 0) relevantItems = relevantItems.filter(i => catFilters.has(i.category));

        const types = [...new Set(relevantItems.map(i => i.type).filter(Boolean))].sort();

        // Remove selected types that no longer exist in the filtered set
        selectedTypes.forEach(t => { if (!types.includes(t)) selectedTypes.delete(t); });

        types.forEach(type => {
            const count = relevantItems.filter(i => i.type === type).length;
            const label = document.createElement('label');
            label.className = 'multi-select-option';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = type;
            const check = document.createElement('span');
            check.className = 'multi-select-check';
            const text = document.createElement('span');
            text.className = 'multi-select-text';
            text.textContent = `${type} (${count})`;
            label.appendChild(cb);
            label.appendChild(check);
            label.appendChild(text);
            typeOptionsContainer.appendChild(label);
        });
        setMultiSelectValues(dom.filterType, selectedTypes);
    }

    function syncTimelineToSelectedGames() {
        document.querySelectorAll('.timeline-btn').forEach(btn => {
            if (btn.dataset.game === '') {
                btn.classList.toggle('active', selectedGames.size === 0);
            } else {
                btn.classList.toggle('active', selectedGames.has(btn.dataset.game));
            }
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
        const gameOrder = [
            "Assassin's Creed",
            "Assassin's Creed II",
            "Assassin's Creed Brotherhood",
            "Assassin's Creed Revelations",
            "Assassin's Creed III",
            "Assassin's Creed III: Liberation",
            "Assassin's Creed IV: Black Flag",
            "Assassin's Creed Rogue",
            "Assassin's Creed Unity",
            "Assassin's Creed Chronicles: China",
            "Assassin's Creed Chronicles: India",
            "Assassin's Creed Chronicles: Russia",
            "Assassin's Creed Syndicate",
            "Assassin's Creed Origins",
            "Assassin's Creed Odyssey",
            "Assassin's Creed Valhalla",
            "Assassin's Creed Mirage",
            "Assassin's Creed Shadows",
            "Assassin's Creed (Movie)",
            "General"
        ];

        const games = [...new Set(AC_DATABASE.map(i => i.game))];

        const sortedGames = gameOrder.filter(g => games.includes(g));
        // Add any games not in our predefined order
        games.forEach(g => { if (!sortedGames.includes(g)) sortedGames.push(g); });

        sortedGames.forEach(game => {
            const count = AC_DATABASE.filter(i => i.game === game).length;
            const label = document.createElement('label');
            label.className = 'multi-select-option';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = game;
            const check = document.createElement('span');
            check.className = 'multi-select-check';
            const text = document.createElement('span');
            text.className = 'multi-select-text';
            text.textContent = `${game} (${count})`;
            label.appendChild(cb);
            label.appendChild(check);
            label.appendChild(text);
            gameOptionsContainer.appendChild(label);
        });
        setMultiSelectValues(dom.filterGame, selectedGames);

        populateCategoryFilter();
        populateTypeFilter();

        // Timeline buttons
        const allBtn = document.createElement('button');
        allBtn.className = 'timeline-btn active';
        allBtn.textContent = 'All';
        allBtn.dataset.game = '';
        timelineInner.appendChild(allBtn);

        sortedGames.forEach(game => {
            const btn = document.createElement('button');
            btn.className = 'timeline-btn';
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
        const ownedFilter = dom.filterOwned.value;

        const sortValue = dom.sortBy.value;

        let results = AC_DATABASE.filter(item => {
            // Search
            if (search) {
                const haystack = `${item.name} ${item.game} ${item.description} ${item.contents} ${item.type}`.toLowerCase();
                if (!haystack.includes(search)) return false;
            }
            // Game (empty set = all)
            if (gameFilters.size > 0 && !gameFilters.has(item.game)) return false;
            // Category (empty set = all)
            if (categoryFilters.size > 0 && !categoryFilters.has(item.category)) return false;
            // Type (empty set = all)
            if (typeFilters.size > 0 && !typeFilters.has(item.type)) return false;
            // Owned status
            if (ownedFilter) {
                const data = getItemData(item.id);
                if (ownedFilter === 'owned' && !data.owned) return false;
                if (ownedFilter === 'unowned' && data.owned) return false;
                if (ownedFilter === 'wishlist' && !data.wishlist) return false;
            }
            return true;
        });

        // Sort
        if (sortValue === 'year-asc') results.sort((a, b) => a.year - b.year);
        else if (sortValue === 'year-desc') results.sort((a, b) => b.year - a.year);
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
            ? `<span class="card-condition condition-${data.condition}">${formatCondition(data.condition)}</span>`
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

        card.innerHTML = `
            <div class="card-image">
                ${imageHTML}
                <div class="card-badges">
                    ${data.owned ? '<span class="badge badge-owned">Owned</span>' : ''}
                    ${data.wishlist && !data.owned ? '<span class="badge badge-wishlist">Wishlist</span>' : ''}
                </div>
                <div class="card-owned-indicator">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
            </div>
            <div class="card-body">
                <div class="card-game">${escapeHTML(item.game)}</div>
                <div class="card-title">${escapeHTML(item.name)}</div>
                <div class="card-description">${escapeHTML(item.description)}</div>
                <div class="card-footer">
                    <span class="card-year">${item.year}</span>
                    <span class="card-type">${escapeHTML(item.type)}</span>
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
                setMultiSelectValues(dom.filterCategory, selectedCategories);
            }
            if (filters.types && filters.types.length > 0) {
                selectedTypes = new Set(filters.types);
                setMultiSelectValues(dom.filterType, selectedTypes);
            }
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
    const getOwnedItemNames = ACDB.getOwnedItemNames;
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

    function handleHash() {
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

        // Filters
        // URL hash routing (back button support)
        window.addEventListener('popstate', () => {
            if (!suppressHashChange) handleHash();
        });

        // Back to top
        const backToTop = document.getElementById('backToTop');
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
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

        // Stats sort toggle (% vs #)
        document.querySelectorAll('.stats-sort-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                statsSortMode = btn.dataset.sort;
                document.querySelectorAll('.stats-sort-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderStatsDashboard();
            });
        });

        // Multi-select clear buttons
        dom.filterGame.querySelector('.multi-select-clear').addEventListener('click', (e) => {
            e.stopPropagation();
            selectedGames.clear();
            clearMultiSelect(dom.filterGame);
            syncTimelineToSelectedGames();
            populateCategoryFilter();
            populateTypeFilter();
            renderItems();
        });
        dom.filterCategory.querySelector('.multi-select-clear').addEventListener('click', (e) => {
            e.stopPropagation();
            selectedCategories.clear();
            clearMultiSelect(dom.filterCategory);
            populateTypeFilter();
            renderItems();
        });
        dom.filterType.querySelector('.multi-select-clear').addEventListener('click', (e) => {
            e.stopPropagation();
            selectedTypes.clear();
            clearMultiSelect(dom.filterType);
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
            populateCategoryFilter();
            populateTypeFilter();
            renderItems();
        });

        dom.filterCategory.querySelector('.multi-select-options').addEventListener('change', () => {
            selectedCategories = getSelectedValues(dom.filterCategory);
            updateMultiSelectLabel(dom.filterCategory);
            populateTypeFilter();
            renderItems();
        });

        dom.filterType.querySelector('.multi-select-options').addEventListener('change', () => {
            selectedTypes = getSelectedValues(dom.filterType);
            updateMultiSelectLabel(dom.filterType);
            renderItems();
        });

        // Type search within dropdown
        const typeSearch = document.getElementById('typeSearch');
        typeSearch.addEventListener('input', () => {
            const query = typeSearch.value.toLowerCase();
            dom.filterType.querySelectorAll('.multi-select-option').forEach(opt => {
                const text = opt.querySelector('.multi-select-text').textContent.toLowerCase();
                opt.style.display = text.includes(query) ? '' : 'none';
            });
        });
        // Prevent dropdown from closing when clicking search
        typeSearch.addEventListener('click', (e) => e.stopPropagation());

        dom.filterOwned.addEventListener('change', renderItems);
        dom.sortBy.addEventListener('change', renderItems);

        // View toggle
        dom.viewGrid.addEventListener('click', () => {
            dom.viewGrid.classList.add('active');
            dom.viewList.classList.remove('active');
            dom.itemsContainer.classList.remove('list-view');
        });

        dom.viewList.addEventListener('click', () => {
            dom.viewList.classList.add('active');
            dom.viewGrid.classList.remove('active');
            dom.itemsContainer.classList.add('list-view');
        });

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
            populateCategoryFilter();
            populateTypeFilter();
            renderItems();
        });

        // Modal
        dom.modalClose.addEventListener('click', closeModal);
        dom.modalOverlay.addEventListener('click', (e) => {
            if (e.target === dom.modalOverlay) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
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

        // Stat block clicks
        document.getElementById('statTotal').addEventListener('click', () => {
            showMainContent();
            clearHash();
            dom.searchInput.value = '';
            dom.clearSearch.classList.remove('visible');
            selectedGames.clear();
            selectedCategories.clear();
            selectedTypes.clear();
            clearMultiSelect(dom.filterGame);
            clearMultiSelect(dom.filterCategory);
            clearMultiSelect(dom.filterType);
            dom.filterOwned.value = '';
            dom.sortBy.value = '';
            syncTimelineToSelectedGames();
            populateCategoryFilter();
            populateTypeFilter();
            renderItems();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        document.getElementById('statOwned').addEventListener('click', () => {
            showMainContent();
            clearHash();
            dom.filterOwned.value = 'owned';
            renderItems();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        document.getElementById('statCompletion').addEventListener('click', () => {
            showMainContent();
            clearHash();
            dom.filterOwned.value = 'owned';
            renderItems();
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
            dom.searchInput.value = '';
            dom.clearSearch.classList.remove('visible');
            selectedGames.clear();
            selectedCategories.clear();
            selectedTypes.clear();
            clearMultiSelect(dom.filterGame);
            clearMultiSelect(dom.filterCategory);
            clearMultiSelect(dom.filterType);
            dom.filterOwned.value = '';
            dom.sortBy.value = '';
            syncTimelineToSelectedGames();
            populateCategoryFilter();
            populateTypeFilter();
            showMainContent();
            clearHash();
            renderItems();
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
            navigator.clipboard.writeText(urlInput.value).then(() => showToast('Link copied!'));
        });

        document.getElementById('shareManageCancel').addEventListener('click', closeShareModal);
        document.getElementById('shareManageCopyUrl').addEventListener('click', () => {
            const urlInput = document.getElementById('shareManageUrl');
            navigator.clipboard.writeText(urlInput.value).then(() => showToast('Link copied!'));
        });
        document.getElementById('shareUpdateBtn').addEventListener('click', () => {
            const owned = getOwnedItemNames();
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

        // Profile & Leaderboard back buttons
        document.getElementById('profileBackBtn').addEventListener('click', () => {
            if (ACDB.getProfileFromLeaderboard()) {
                document.getElementById('profileView').style.display = 'none';
                window.location.hash = 'leaderboard';
            } else {
                showMainContent();
                clearHash();
            }
        });
        document.getElementById('leaderboardBackBtn').addEventListener('click', () => {
            showMainContent();
            clearHash();
        });

        // Dev Tool
        dom.addItemBtn.addEventListener('click', openDevTool);
        dom.devToolClose.addEventListener('click', closeDevTool);
        dom.devToolOverlay.addEventListener('click', (e) => {
            if (e.target === dom.devToolOverlay) closeDevTool();
        });

        // Dev Tool — live code generation on any input change
        const devFields = ['devName', 'devGame', 'devYear', 'devCategory', 'devType',
            'devDescription', 'devContents', 'devImagePath', 'devNewGameName', 'devNewGameShort'];
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
            navigator.clipboard.writeText(code).then(() => showToast('Code copied to clipboard!'));
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
        // Hide admin-only buttons for public visitors
        if (!isAdmin) {
            dom.addItemBtn.style.display = 'none';
        }

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
    A.getStatsSortMode = () => statsSortMode;
    A.setStatsSortMode = (m) => { statsSortMode = m; };

    // Functions still in app.js
    A.loadCollection = loadCollection;
    A.saveCollection = saveCollection;
    A.getItemData = getItemData;
    A.setItemData = setItemData;
    A.renderItems = renderItems;
    A.createCard = createCard;
    A.getFilteredItems = getFilteredItems;
    A.initFilters = initFilters;
    A.populateCategoryFilter = populateCategoryFilter;
    A.populateTypeFilter = populateTypeFilter;
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

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
