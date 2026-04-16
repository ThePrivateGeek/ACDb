/* ============================================
   ACDb - Application Logic
   ============================================ */

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
    let currentItemId = null;

    // Gallery state
    let galleryImages = [];
    let galleryIndex = 0;

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
            dom.resultsCount.textContent = items.length === total
                ? `Showing all ${total} items`
                : `Showing ${items.length} of ${total} items`;
        }

        const fragment = document.createDocumentFragment();
        items.forEach(item => {
            fragment.appendChild(createCard(item));
        });
        dom.itemsContainer.appendChild(fragment);

        updateStats(items);
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

        const imageHTML = item.image
            ? `<img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" loading="lazy">
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
            openModal(item.id);
        });
        return card;
    }

    function formatCondition(condition) {
        const map = {
            'mint': 'Mint',
            'near-mint': 'Near Mint',
            'excellent': 'Excellent',
            'good': 'Good',
            'fair': 'Fair',
            'poor': 'Poor'
        };
        return map[condition] || condition;
    }

    // ---- Stats ----
    function updateStats(filtered) {
        const items = filtered || getFilteredItems();
        const total = items.length;
        let owned = 0;
        let totalValue = 0;
        items.forEach(item => {
            const data = getItemData(item.id);
            if (data.owned) {
                owned++;
                if (data.pricePaid) totalValue += parseFloat(data.pricePaid) || 0;
            }
        });
        const percent = total > 0 ? Math.round((owned / total) * 100) : 0;

        dom.totalItems.textContent = total;
        dom.ownedItems.textContent = owned;
        dom.completionPercent.textContent = percent + '%';

        // Update dashboard if open
        if (dom.statsDashboard.classList.contains('open')) {
            renderStatsDashboard(items);
        }
    }

    // ---- Modal ----
    function openModal(id, fromHash) {
        const item = AC_DATABASE.find(i => i.id === id);
        if (!item) return;

        if (!fromHash) setHash(item);
        currentItemId = id;
        const data = getItemData(id);

        // Build gallery images
        galleryImages = [];
        galleryIndex = 0;

        if (item.image) {
            galleryImages.push(item.image);
            // Probe for additional images: base_01.ext, base_02.ext, ...
            probeAdditionalImages(item.image);
        }

        renderGalleryImage();

        dom.modalBadge.textContent = item.category;
        const badgeType = document.getElementById('modalBadgeType');
        if (item.type && item.type !== item.category) {
            badgeType.textContent = item.type;
            badgeType.style.display = '';
        } else {
            badgeType.style.display = 'none';
        }
        dom.modalTitle.textContent = item.name;
        dom.modalGame.textContent = item.game;
        dom.modalYear.textContent = item.year;
        dom.modalDescription.textContent = item.description;
        dom.modalContents.textContent = item.contents || 'N/A';

        // Collection controls
        dom.modalOwned.checked = data.owned;
        dom.modalWishlist.checked = data.wishlist;
        dom.modalHasBox.checked = data.hasBox;
        dom.modalCondition.value = data.condition || '';
        dom.modalCopies.value = data.copies || 0;
        dom.modalPricePaid.value = data.pricePaid || '';
        dom.modalAcquiredDate.value = data.acquiredDate || '';
        dom.modalNotes.value = data.notes || '';

        dom.modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        dom.modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('itemModal').classList.remove('landscape');
        currentItemId = null;
        galleryImages = [];
        galleryIndex = 0;
        clearHash();
    }

    // ---- Gallery ----
    function probeAdditionalImages(basePath) {
        // basePath: "images/collectors-editions/ac1-limited-edition.jpg"
        // Probe for: ac1-limited-edition_01.jpg, _02.jpg, ... up to _20
        const dotIdx = basePath.lastIndexOf('.');
        if (dotIdx === -1) return;

        const stem = basePath.substring(0, dotIdx);    // everything before .ext
        const ext = basePath.substring(dotIdx);         // .jpg / .png

        let index = 1;
        const MAX = 20;

        function tryNext() {
            if (index > MAX) {
                updateGalleryUI();
                return;
            }
            const suffix = String(index).padStart(2, '0');
            const testPath = `${stem}_${suffix}${ext}`;
            const img = new Image();
            img.onload = function () {
                galleryImages.push(testPath);
                index++;
                updateGalleryUI();
                tryNext();
            };
            img.onerror = function () {
                // No more images — stop probing
                updateGalleryUI();
            };
            img.src = testPath;
        }

        tryNext();
    }

    function renderGalleryImage(direction) {
        const modal = document.getElementById('itemModal');

        if (galleryImages.length === 0) {
            dom.modalImage.innerHTML = '<svg viewBox="0 0 100 100" class="placeholder-icon"><path d="M50 5 L30 55 L5 95 L25 95 L50 55 L75 95 L95 95 L70 55 Z" fill="currentColor"/></svg>';
            modal.classList.remove('landscape');
        } else {
            const src = galleryImages[galleryIndex];
            const img = document.createElement('img');
            img.alt = 'Image ' + (galleryIndex + 1);
            if (direction === 'right') img.classList.add('slide-right');
            img.style.opacity = '0';
            img.onload = function () {
                modal.classList.toggle('landscape', img.naturalWidth > img.naturalHeight);
                requestAnimationFrame(() => { img.style.opacity = ''; });
            };
            img.src = src;
            img.onerror = function () {
                dom.modalImage.innerHTML = '<svg viewBox="0 0 100 100" class="placeholder-icon"><path d="M50 5 L30 55 L5 95 L25 95 L50 55 L75 95 L95 95 L70 55 Z" fill="currentColor"/></svg>';
            };
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                openLightbox();
            });
            dom.modalImage.innerHTML = '';
            dom.modalImage.appendChild(img);
        }

        updateGalleryUI();
    }

    function updateGalleryUI() {
        const count = galleryImages.length;
        const hasMultiple = count > 1;

        // Prev / Next arrows
        dom.galleryPrev.classList.toggle('visible', hasMultiple);
        dom.galleryNext.classList.toggle('visible', hasMultiple);

        // Counter "2 / 5"
        if (hasMultiple) {
            dom.galleryCounter.textContent = `${galleryIndex + 1} / ${count}`;
            dom.galleryCounter.classList.add('visible');
        } else {
            dom.galleryCounter.classList.remove('visible');
        }

        // Dots
        if (hasMultiple) {
            dom.galleryDots.classList.add('visible');
            dom.galleryDots.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const dot = document.createElement('button');
                dot.className = 'gallery-dot' + (i === galleryIndex ? ' active' : '');
                dot.addEventListener('click', () => galleryGoTo(i));
                dom.galleryDots.appendChild(dot);
            }
        } else {
            dom.galleryDots.classList.remove('visible');
            dom.galleryDots.innerHTML = '';
        }
    }

    function galleryGoTo(idx, direction) {
        if (idx < 0) idx = galleryImages.length - 1;
        if (idx >= galleryImages.length) idx = 0;
        const dir = direction || (idx > galleryIndex ? 'left' : 'right');
        galleryIndex = idx;
        renderGalleryImage(dir);
    }

    function galleryPrev() { galleryGoTo(galleryIndex - 1, 'right'); }
    function galleryNext() { galleryGoTo(galleryIndex + 1, 'left'); }

    // ---- Lightbox ----
    const lightbox = {
        overlay: null,
        image: null,
        counter: null,
        init() {
            this.overlay = document.getElementById('lightboxOverlay');
            this.image = document.getElementById('lightboxImage');
            this.counter = document.getElementById('lightboxCounter');

            document.getElementById('lightboxClose').addEventListener('click', () => this.close());
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay || e.target === this.overlay.querySelector('.lightbox-image-container')) this.close();
            });
            document.getElementById('lightboxPrev').addEventListener('click', (e) => { e.stopPropagation(); this.prev(); });
            document.getElementById('lightboxNext').addEventListener('click', (e) => { e.stopPropagation(); this.next(); });

            // Touch swipe in lightbox
            let lbTouchX = 0;
            this.overlay.addEventListener('touchstart', (e) => { lbTouchX = e.changedTouches[0].screenX; }, { passive: true });
            this.overlay.addEventListener('touchend', (e) => {
                if (galleryImages.length <= 1) return;
                const diff = e.changedTouches[0].screenX - lbTouchX;
                if (Math.abs(diff) > 50) {
                    if (diff < 0) this.next();
                    else this.prev();
                }
            });
        },
        open() {
            this.render();
            this.overlay.classList.add('active');
        },
        close() {
            this.overlay.classList.remove('active');
        },
        render() {
            this.image.src = galleryImages[galleryIndex];
            this.image.alt = 'Image ' + (galleryIndex + 1);
            const hasMultiple = galleryImages.length > 1;
            document.getElementById('lightboxPrev').style.display = hasMultiple ? '' : 'none';
            document.getElementById('lightboxNext').style.display = hasMultiple ? '' : 'none';
            this.counter.textContent = hasMultiple ? `${galleryIndex + 1} / ${galleryImages.length}` : '';
        },
        prev() {
            galleryGoTo(galleryIndex - 1, 'right');
            this.render();
        },
        next() {
            galleryGoTo(galleryIndex + 1, 'left');
            this.render();
        }
    };

    function openLightbox() {
        if (galleryImages.length === 0) return;
        lightbox.open();
    }

    function saveModalData() {
        if (currentItemId === null) return;
        const data = {
            owned: dom.modalOwned.checked,
            wishlist: dom.modalWishlist.checked,
            hasBox: dom.modalHasBox.checked,
            condition: dom.modalCondition.value,
            copies: parseInt(dom.modalCopies.value) || 0,
            pricePaid: dom.modalPricePaid.value,
            acquiredDate: dom.modalAcquiredDate.value,
            notes: dom.modalNotes.value
        };
        const wasOwned = getItemData(currentItemId).owned;
        setItemData(currentItemId, data);
        renderItems();
        if (data.owned && !wasOwned) checkCompletionCelebration();
    }

    // ---- Dev Tool (Code Generator) ----
    function openDevTool() {
        // Populate game dropdown
        const gameSelect = document.getElementById('devGame');
        gameSelect.innerHTML = '<option value="">Select game...</option>';
        getAllGameNames().forEach(g => {
            const opt = document.createElement('option');
            opt.value = g;
            opt.textContent = g;
            gameSelect.appendChild(opt);
        });

        // Populate type dropdown
        const typeSelect = document.getElementById('devType');
        typeSelect.innerHTML = '<option value="">Select type...</option>';
        const types = [...new Set(AC_DATABASE.map(i => i.type).filter(Boolean))].sort();
        types.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            typeSelect.appendChild(opt);
        });

        // Clear form
        document.getElementById('devName').value = '';
        document.getElementById('devGame').value = '';
        document.getElementById('devGame').style.display = '';
        document.getElementById('devYear').value = '';
        document.getElementById('devCategory').value = '';
        document.getElementById('devType').value = '';
        document.getElementById('devDescription').value = '';
        document.getElementById('devContents').value = '';
        document.getElementById('devImagePath').value = '';
        document.getElementById('devNewGame').checked = false;
        document.getElementById('devNewGameFields').style.display = 'none';
        document.getElementById('devNewGameName').value = '';
        document.getElementById('devNewGameShort').value = '';
        document.getElementById('devCodeOutput').value = '';

        dom.devToolOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.getElementById('devName').focus();
    }

    function closeDevTool() {
        dom.devToolOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function getAllGameNames() {
        const gameOrder = [
            "Assassin's Creed", "Assassin's Creed II", "Assassin's Creed Brotherhood",
            "Assassin's Creed Revelations", "Assassin's Creed III", "Assassin's Creed III: Liberation",
            "Assassin's Creed IV: Black Flag", "Assassin's Creed Rogue", "Assassin's Creed Unity",
            "Assassin's Creed Chronicles: China", "Assassin's Creed Chronicles: India",
            "Assassin's Creed Chronicles: Russia", "Assassin's Creed Syndicate",
            "Assassin's Creed Origins", "Assassin's Creed Odyssey",
            "Assassin's Creed Valhalla", "Assassin's Creed Mirage", "Assassin's Creed Shadows",
            "Assassin's Creed (Movie)", "General"
        ];
        return gameOrder;
    }

    function generateCode() {
        const name = document.getElementById('devName').value.trim();
        const isNewGame = document.getElementById('devNewGame').checked;
        const newGameName = document.getElementById('devNewGameName').value.trim();
        const newGameShort = document.getElementById('devNewGameShort').value.trim();
        const game = isNewGame ? newGameName : document.getElementById('devGame').value;
        const year = document.getElementById('devYear').value;
        const category = document.getElementById('devCategory').value;
        const type = document.getElementById('devType').value;
        const description = document.getElementById('devDescription').value.trim();
        const contents = document.getElementById('devContents').value.trim();
        const imagePath = document.getElementById('devImagePath').value.trim();

        let code = '';

        // database.js entry
        code += '// database.js — add before the closing ];\n';
        code += '  {\n';
        code += `    "name": ${JSON.stringify(name || 'Item Name')},\n`;
        code += `    "game": ${JSON.stringify(game || 'Game Name')},\n`;
        code += `    "year": ${year || 2025},\n`;
        code += `    "category": ${JSON.stringify(category || 'Category')},\n`;
        code += `    "description": ${JSON.stringify(description)},\n`;
        code += `    "contents": ${JSON.stringify(contents)},\n`;
        code += `    "type": ${JSON.stringify(type || category || 'Type')}\n`;
        code += '  },';

        // images.js entry
        if (imagePath) {
            code += '\n\n// images.js — add before the closing };\n';
            code += `    ${JSON.stringify(name || 'Item Name')}: ${JSON.stringify(imagePath)},`;
        }

        // New game code
        if (isNewGame && newGameName) {
            code += '\n\n// app.js — add to SHORT_GAME_NAMES object\n';
            code += `    ${JSON.stringify(newGameName)}: ${JSON.stringify(newGameShort || newGameName)},`;
            code += '\n\n// app.js — add to gameOrder array in initFilters()\n';
            code += `    ${JSON.stringify(newGameName)},`;
            code += '\n\n// app.js — add to getAllGameNames() in dev tool\n';
            code += `    ${JSON.stringify(newGameName)},`;
        }

        document.getElementById('devCodeOutput').value = code;
    }



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

    // ---- Stats Dashboard ----
    function shortenGameName(name) {
        return SHORT_GAME_NAMES[name] || name;
    }

    function renderStatsDashboard(filtered) {
        const items = filtered || getFilteredItems();

        // By Game
        const byGame = {};
        const ownedByGame = {};
        items.forEach(item => {
            byGame[item.game] = (byGame[item.game] || 0) + 1;
            const data = getItemData(item.id);
            if (data.owned) ownedByGame[item.game] = (ownedByGame[item.game] || 0) + 1;
        });
        renderBars(dom.statsByGame, byGame, ownedByGame, shortenGameName);

        // By Category
        const byCat = {};
        const ownedByCat = {};
        items.forEach(item => {
            byCat[item.category] = (byCat[item.category] || 0) + 1;
            const data = getItemData(item.id);
            if (data.owned) ownedByCat[item.category] = (ownedByCat[item.category] || 0) + 1;
        });
        renderBars(dom.statsByCategory, byCat, ownedByCat);

        // By Condition (owned items only) — simple count list + total copies
        const byCondition = {};
        let ownedCount = 0;
        let totalCopies = 0;
        items.forEach(item => {
            const data = getItemData(item.id);
            if (data.owned) {
                ownedCount++;
                totalCopies += parseInt(data.copies) || 1;
                if (data.condition) {
                    const label = formatCondition(data.condition);
                    byCondition[label] = (byCondition[label] || 0) + 1;
                }
            }
        });
        dom.statsByCondition.innerHTML = '';

        // Total copies summary
        if (ownedCount > 0) {
            const summary = document.createElement('div');
            summary.className = 'stats-bar-row';
            summary.innerHTML = `
                <span class="stats-bar-label" style="color:var(--accent)">Total Physical Items</span>
                <span class="stats-bar-value" style="color:var(--accent)">${totalCopies}</span>
            `;
            dom.statsByCondition.appendChild(summary);
        }

        const conditionEntries = Object.entries(byCondition).sort((a, b) => b[1] - a[1]);
        if (conditionEntries.length === 0 && ownedCount === 0) {
            dom.statsByCondition.innerHTML = '<span class="stats-bar-value" style="text-align:left">No condition data yet</span>';
        } else {
            conditionEntries.forEach(([label, count]) => {
                const row = document.createElement('div');
                row.className = 'stats-bar-row';
                row.innerHTML = `
                    <span class="stats-bar-label">${label}</span>
                    <span class="stats-bar-value">${count}</span>
                `;
                dom.statsByCondition.appendChild(row);
            });
        }
    }

    function renderBars(container, totals, owned, labelFn) {
        container.innerHTML = '';
        const sorted = Object.entries(totals).sort((a, b) => {
            if (owned) {
                if (statsSortMode === 'count') {
                    // Sort by owned count (desc), then by total (desc)
                    const countA = owned[a[0]] || 0;
                    const countB = owned[b[0]] || 0;
                    return countB - countA || b[1] - a[1];
                }
                // Sort by completion percentage (desc), then by total (desc)
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
            row.className = 'stats-bar-row';
            row.innerHTML = `
                <span class="stats-bar-label" title="${label}">${labelFn ? labelFn(label) : label}</span>
                <div class="stats-bar-track">
                    <div class="stats-bar-fill green" style="width:${pct}%"></div>
                </div>
                <span class="stats-bar-value">${owned ? ownedCount + '/' + total + ' <span class="stats-bar-pct' + (pct === 100 ? ' complete' : '') + '">' + pct + '%</span>' : total}</span>
                ${owned && pct === 100 ? '<span class="stats-complete-badge">&#10003;</span>' : ''}
            `;
            container.appendChild(row);
        });
    }

    // ---- Collection Export / Import ----
    function exportCollection() {
        const exportData = [];
        AC_DATABASE.forEach(item => {
            const data = getItemData(item.id);
            if (data.owned || data.wishlist || data.hasBox || data.condition || data.copies > 0 || data.notes || data.pricePaid || data.acquiredDate) {
                exportData.push({
                    name: item.name,
                    game: item.game,
                    owned: data.owned || false,
                    wishlist: data.wishlist || false,
                    hasBox: data.hasBox || false,
                    condition: data.condition || '',
                    copies: data.copies || 0,
                    pricePaid: data.pricePaid || '',
                    acquiredDate: data.acquiredDate || '',
                    notes: data.notes || ''
                });
            }
        });

        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'acdb-collection-' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
        showToast(`Exported ${exportData.length} items`);
    }

    function importCollection(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const importData = JSON.parse(e.target.result);
                if (!Array.isArray(importData)) throw new Error('Invalid format');

                let matched = 0;
                importData.forEach(entry => {
                    // Match by name
                    const item = AC_DATABASE.find(i => i.name === entry.name);
                    if (item) {
                        const data = {
                            owned: entry.owned || false,
                            wishlist: entry.wishlist || false,
                            hasBox: entry.hasBox || false,
                            condition: entry.condition || '',
                            copies: entry.copies || 0,
                            pricePaid: entry.pricePaid || '',
                            acquiredDate: entry.acquiredDate || '',
                            notes: entry.notes || ''
                        };
                        setItemData(item.id, data);
                        matched++;
                    }
                });

                renderItems();
                showToast(`Imported ${matched} of ${importData.length} items`);
            } catch (err) {
                showToast('Import failed — invalid file');
            }
        };
        reader.readAsText(file);
    }

    function launchConfetti() {
        const colors = ['#c9a84c', '#d4b85a', '#27ae60', '#2ecc71', '#fff'];
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);

        for (let i = 0; i < 60; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDelay = Math.random() * 0.5 + 's';
            piece.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
            piece.style.width = (4 + Math.random() * 6) + 'px';
            piece.style.height = (4 + Math.random() * 6) + 'px';
            container.appendChild(piece);
        }

        setTimeout(() => container.remove(), 3500);
    }

    function checkCompletionCelebration() {
        if (currentItemId === null) return;
        const item = AC_DATABASE.find(i => i.id === currentItemId);
        if (!item) return;
        const data = getItemData(currentItemId);
        if (!data.owned) return;

        // Check if this item's game is now 100%
        const gameItems = AC_DATABASE.filter(i => i.game === item.game);
        const gameOwned = gameItems.filter(i => getItemData(i.id).owned).length;
        if (gameOwned === gameItems.length) {
            launchConfetti();
            showCelebration(`${SHORT_GAME_NAMES[item.game] || item.game} — 100% complete!`);
            return;
        }

        // Check if this item's category is now 100%
        const catItems = AC_DATABASE.filter(i => i.category === item.category);
        const catOwned = catItems.filter(i => getItemData(i.id).owned).length;
        if (catOwned === catItems.length) {
            launchConfetti();
            showCelebration(`${item.category} — 100% complete!`);
        }
    }

    function showCelebration(message) {
        let el = document.getElementById('acdb-celebration');
        if (!el) {
            el = document.createElement('div');
            el.id = 'acdb-celebration';
            document.body.appendChild(el);
        }
        el.textContent = message;
        el.classList.add('visible');
        setTimeout(() => { el.classList.remove('visible'); }, 3000);
    }

    function showToast(message) {
        let toast = document.getElementById('acdb-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'acdb-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('visible');
        setTimeout(() => { toast.classList.remove('visible'); }, 2000);
    }

    // ---- Sharing & Leaderboard ----
    function getOwnedItemNames() {
        return AC_DATABASE.filter(item => {
            const data = getItemData(item.id);
            return data.owned;
        }).map(item => item.name);
    }

    function isShared() {
        return !!localStorage.getItem(SHARE_TOKEN_KEY);
    }

    function updateShareButton() {
        const text = document.getElementById('shareBtnText');
        if (isShared()) {
            text.textContent = 'Update';
            document.getElementById('shareBtn').title = 'Update your shared collection';
        }
    }

    function openShareModal() {
        const overlay = document.getElementById('shareModalOverlay');
        const formSection = document.getElementById('shareFormSection');
        const successSection = document.getElementById('shareSuccessSection');
        const nameInput = document.getElementById('shareDisplayName');
        const submitBtn = document.getElementById('shareSubmit');

        // Calculate preview stats
        const owned = getOwnedItemNames();
        document.getElementById('sharePreviewOwned').textContent = owned.length;
        document.getElementById('sharePreviewPct').textContent = Math.round((owned.length / AC_DATABASE.length) * 100) + '%';

        if (isShared()) {
            // Update mode — skip name, go straight to update
            performUpdate(owned);
            return;
        }

        // Share mode — show form
        formSection.style.display = '';
        successSection.style.display = 'none';
        nameInput.value = '';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Share Collection';
        document.getElementById('shareNameStatus').textContent = '';

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        nameInput.focus();
    }

    function closeShareModal() {
        document.getElementById('shareModalOverlay').classList.remove('active');
        document.body.style.overflow = '';
    }

    let nameCheckTimer = null;
    async function checkNameAvailability(name) {
        const status = document.getElementById('shareNameStatus');
        const submitBtn = document.getElementById('shareSubmit');

        if (name.length < 5) {
            status.textContent = name.length > 0 ? 'Minimum 5 characters' : '';
            status.style.color = 'var(--text-muted)';
            submitBtn.disabled = true;
            return;
        }
        if (!/^[a-zA-Z0-9_-]{5,25}$/.test(name)) {
            status.textContent = 'Only letters, numbers, hyphens, underscores';
            status.style.color = 'var(--red)';
            submitBtn.disabled = true;
            return;
        }

        status.textContent = 'Checking...';
        status.style.color = 'var(--text-muted)';

        try {
            const res = await fetch(`${API_URL}/check-name/${encodeURIComponent(name)}`);
            const data = await res.json();
            if (data.available) {
                status.textContent = 'Available!';
                status.style.color = 'var(--owned-green)';
                submitBtn.disabled = false;
            } else {
                status.textContent = 'Already taken';
                status.style.color = 'var(--red)';
                submitBtn.disabled = true;
            }
        } catch {
            status.textContent = 'Could not check. Try again.';
            status.style.color = 'var(--red)';
            submitBtn.disabled = true;
        }
    }

    async function performShare() {
        const nameInput = document.getElementById('shareDisplayName');
        const submitBtn = document.getElementById('shareSubmit');
        const displayName = nameInput.value.trim();
        const owned = getOwnedItemNames();

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sharing...';

        try {
            const res = await fetch(`${API_URL}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName, ownedItems: owned })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem(SHARE_TOKEN_KEY, data.token);
                localStorage.setItem(SHARE_NAME_KEY, data.displayName);

                // Show success
                document.getElementById('shareFormSection').style.display = 'none';
                document.getElementById('shareSuccessSection').style.display = '';
                document.getElementById('shareUrl').value = data.shareUrl;
                updateShareButton();
            } else {
                showToast(data.error || 'Share failed');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Share Collection';
            }
        } catch {
            showToast('Network error. Try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Share Collection';
        }
    }

    async function performUpdate(owned) {
        const token = localStorage.getItem(SHARE_TOKEN_KEY);
        if (!token) return;

        showToast('Updating...');
        try {
            const res = await fetch(`${API_URL}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ ownedItems: owned })
            });
            const data = await res.json();

            if (data.success) {
                showToast(`Collection updated! ${data.ownedCount} items shared.`);
            } else {
                showToast(data.error || 'Update failed');
            }
        } catch {
            showToast('Network error. Try again.');
        }
    }

    // ---- Profile View ----
    function showMainContent() {
        document.querySelector('.toolbar').style.display = '';
        document.querySelector('.game-timeline').style.display = '';
        document.querySelector('.stats-dashboard').style.display = '';
        document.querySelector('.main-content').style.display = '';
        document.getElementById('profileView').style.display = 'none';
        document.getElementById('leaderboardView').style.display = 'none';
    }

    function hideMainContent() {
        document.querySelector('.toolbar').style.display = 'none';
        document.querySelector('.game-timeline').style.display = 'none';
        document.querySelector('.stats-dashboard').style.display = 'none';
        document.querySelector('.main-content').style.display = 'none';
    }

    async function showProfile(name) {
        hideMainContent();
        const profileView = document.getElementById('profileView');
        profileView.style.display = '';
        document.getElementById('profileName').textContent = 'Loading...';
        document.getElementById('profileOwned').textContent = '';
        document.getElementById('profilePct').textContent = '';
        document.getElementById('profileUpdated').textContent = '';
        document.getElementById('profileItemsGrid').innerHTML = '';

        try {
            const res = await fetch(`${API_URL}/profile/${encodeURIComponent(name)}`);
            if (!res.ok) {
                document.getElementById('profileName').textContent = 'Profile not found';
                return;
            }
            const data = await res.json();
            const pct = Math.round((data.ownedCount / AC_DATABASE.length) * 100);
            const updated = new Date(data.lastUpdated).toLocaleDateString();

            document.getElementById('profileName').textContent = data.displayName;
            document.getElementById('profileOwned').textContent = `${data.ownedCount} items owned`;
            document.getElementById('profilePct').textContent = `${pct}% complete`;
            document.getElementById('profileUpdated').textContent = `Updated ${updated}`;

            // Render owned items as cards
            const grid = document.getElementById('profileItemsGrid');
            const fragment = document.createDocumentFragment();
            data.ownedItems.forEach(itemName => {
                const item = AC_DATABASE.find(i => i.name === itemName);
                if (item) {
                    const card = createCard(item);
                    // Remove click handler for profile view cards
                    card.style.pointerEvents = 'none';
                    card.style.cursor = 'default';
                    fragment.appendChild(card);
                }
            });
            grid.appendChild(fragment);
        } catch {
            document.getElementById('profileName').textContent = 'Error loading profile';
        }
    }

    // ---- Leaderboard View ----
    async function showLeaderboard() {
        hideMainContent();
        const leaderboardView = document.getElementById('leaderboardView');
        leaderboardView.style.display = '';
        document.getElementById('leaderboardBody').innerHTML = '<tr><td colspan="5" class="leaderboard-loading">Loading leaderboard...</td></tr>';

        const ctaEl = document.getElementById('leaderboardCta');
        if (isShared()) {
            const name = localStorage.getItem(SHARE_NAME_KEY);
            ctaEl.innerHTML = `You're on the board as <a href="#profile/${name.toLowerCase()}">${name}</a>`;
        } else {
            ctaEl.innerHTML = 'Want to join? <a id="leaderboardShareLink">Share your collection</a> to appear on the leaderboard!';
        }

        try {
            const res = await fetch(`${API_URL}/leaderboard`);
            const data = await res.json();
            const tbody = document.getElementById('leaderboardBody');
            tbody.innerHTML = '';

            if (data.profiles.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="leaderboard-loading">No collectors yet. Be the first!</td></tr>';
                return;
            }

            data.profiles.forEach((profile, idx) => {
                const rank = idx + 1;
                const pct = Math.round((profile.ownedCount / AC_DATABASE.length) * 100);
                const updated = new Date(profile.lastUpdated).toLocaleDateString();
                const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="rank-col ${rankClass}">${rank}</td>
                    <td class="name-col"><a href="#profile/${profile.displayName.toLowerCase()}">${escapeHTML(profile.displayName)}</a></td>
                    <td class="count-col">${profile.ownedCount}</td>
                    <td class="pct-col">${pct}%</td>
                    <td class="date-col">${updated}</td>
                `;
                tbody.appendChild(tr);
            });

            // Wire up the share link in CTA if not shared
            if (!isShared()) {
                const shareLink = document.getElementById('leaderboardShareLink');
                if (shareLink) {
                    shareLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        showMainContent();
                        clearHash();
                        openShareModal();
                    });
                }
            }
        } catch {
            document.getElementById('leaderboardBody').innerHTML = '<tr><td colspan="5" class="leaderboard-loading">Error loading leaderboard</td></tr>';
        }
    }

    // ---- URL Hash Routing ----
    function slugify(str) {
        return str.toLowerCase()
            .replace(/['']/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }

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
            // Hash cleared (back button) — close modal if open, show main content
            if (dom.modalOverlay.classList.contains('active')) {
                dom.modalOverlay.classList.remove('active');
                document.body.style.overflow = '';
                document.getElementById('itemModal').classList.remove('landscape');
                currentItemId = null;
                galleryImages = [];
                galleryIndex = 0;
            }
            showMainContent();
            return;
        }

        // Profile view
        if (hash.startsWith('profile/')) {
            const name = hash.replace('profile/', '');
            showProfile(name);
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

    // ---- Utilities ----
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function debounce(fn, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

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
                if (e.key === 'ArrowLeft' && galleryImages.length > 1) lightbox.prev();
                if (e.key === 'ArrowRight' && galleryImages.length > 1) lightbox.next();
                return;
            }
            if (!dom.modalOverlay.classList.contains('active')) return;
            if (e.key === 'ArrowLeft' && galleryImages.length > 1) galleryPrev();
            if (e.key === 'ArrowRight' && galleryImages.length > 1) galleryNext();
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
            if (galleryImages.length <= 1) return;
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

        // Add Item modal
        // Stat block clicks
        document.getElementById('statTotal').addEventListener('click', () => {
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
            dom.filterOwned.value = 'owned';
            renderItems();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        document.getElementById('statCompletion').addEventListener('click', () => {
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
        document.getElementById('shareSubmit').addEventListener('click', performShare);
        document.getElementById('shareDone').addEventListener('click', closeShareModal);
        document.getElementById('shareCopyUrl').addEventListener('click', () => {
            const urlInput = document.getElementById('shareUrl');
            navigator.clipboard.writeText(urlInput.value).then(() => showToast('Link copied!'));
        });

        // Name availability check with debounce
        document.getElementById('shareDisplayName').addEventListener('input', (e) => {
            clearTimeout(nameCheckTimer);
            nameCheckTimer = setTimeout(() => checkNameAvailability(e.target.value.trim()), 400);
        });

        // Profile & Leaderboard back buttons
        document.getElementById('profileBackBtn').addEventListener('click', () => {
            showMainContent();
            clearHash();
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

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
