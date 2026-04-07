/* ============================================
   ACDb - Application Logic
   ============================================ */

(function () {
    'use strict';

    // ---- State ----
    const STORAGE_KEY = 'acdb_collection';
    const CUSTOM_ITEMS_KEY = 'acdb_custom_items';
    const CUSTOM_GAMES_KEY = 'acdb_custom_games';
    const isAdmin = localStorage.getItem('acdb_admin') === 'true';
    let collection = loadCollection();
    let currentView = 'grid';
    let activeGameFilter = '';
    let currentItemId = null;

    // Gallery state
    let galleryImages = [];
    let galleryIndex = 0;

    // ---- Load custom items and merge into database ----
    function loadCustomItems() {
        try {
            const data = localStorage.getItem(CUSTOM_ITEMS_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    function saveCustomItems(items) {
        localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(items));
    }

    function loadCustomGames() {
        try {
            const data = localStorage.getItem(CUSTOM_GAMES_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    function saveCustomGames(games) {
        localStorage.setItem(CUSTOM_GAMES_KEY, JSON.stringify(games));
    }

    // Merge custom items into AC_DATABASE
    const customItems = loadCustomItems();
    customItems.forEach(item => {
        // Set image property directly (images.js already ran)
        if (item.imagePath) {
            item.image = item.imagePath;
            AC_IMAGES[item.name] = item.imagePath;
        }
        AC_DATABASE.push(item);
    });

    // ---- Assign unique IDs to each database item ----
    AC_DATABASE.forEach((item, i) => {
        item.id = i;
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
        // Add Item modal
        addItemBtn: document.getElementById('addItemBtn'),
        addModalOverlay: document.getElementById('addModalOverlay'),
        addModalClose: document.getElementById('addModalClose'),
        addItemCancel: document.getElementById('addItemCancel'),
        addItemSave: document.getElementById('addItemSave'),
        addName: document.getElementById('addName'),
        addGame: document.getElementById('addGame'),
        addYear: document.getElementById('addYear'),
        addCategory: document.getElementById('addCategory'),
        addDescription: document.getElementById('addDescription'),
        addContents: document.getElementById('addContents'),
        addImagePath: document.getElementById('addImagePath'),
        addGameToggle: document.getElementById('addGameToggle'),
        addGameRow: document.getElementById('addGameRow'),
        addGameInput: document.getElementById('addGameInput'),
        addGameConfirm: document.getElementById('addGameConfirm'),
        addGameCancel: document.getElementById('addGameCancel'),
        // Manage modal
        exportBtn: document.getElementById('exportBtn'),
        importBtn: document.getElementById('importBtn'),
        importFile: document.getElementById('importFile'),
        manageBtn: document.getElementById('manageBtn'),
        manageModalOverlay: document.getElementById('manageModalOverlay'),
        manageModalClose: document.getElementById('manageModalClose'),
        manageItemsList: document.getElementById('manageItemsList'),
        manageGamesList: document.getElementById('manageGamesList'),
        manageItemsTab: document.getElementById('manageItemsTab'),
        manageGamesTab: document.getElementById('manageGamesTab'),
        manageItemsEmpty: document.getElementById('manageItemsEmpty'),
        manageGamesEmpty: document.getElementById('manageGamesEmpty'),
        manageAddGameInput: document.getElementById('manageAddGameInput'),
        manageAddGameBtn: document.getElementById('manageAddGameBtn'),
        manageConfirmOverlay: document.getElementById('manageConfirmOverlay'),
        manageConfirmMsg: document.getElementById('manageConfirmMsg'),
        manageConfirmYes: document.getElementById('manageConfirmYes'),
        manageConfirmNo: document.getElementById('manageConfirmNo'),
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
            notes: ''
        };
    }

    function setItemData(id, data) {
        collection[id] = data;
        saveCollection();
    }

    // ---- Populate Filters ----
    function initFilters() {
        // Clear existing options (keep first "All" option)
        while (dom.filterGame.options.length > 1) dom.filterGame.remove(1);
        while (dom.filterCategory.options.length > 1) dom.filterCategory.remove(1);
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

        // Include custom games
        const customGamesList = loadCustomGames();
        customGamesList.forEach(g => { if (!gameOrder.includes(g)) gameOrder.push(g); });

        const games = [...new Set(AC_DATABASE.map(i => i.game))];
        // Also include custom games even if no items exist yet
        customGamesList.forEach(g => { if (!games.includes(g)) games.push(g); });

        const sortedGames = gameOrder.filter(g => games.includes(g));
        // Add any games not in our predefined order
        games.forEach(g => { if (!sortedGames.includes(g)) sortedGames.push(g); });

        sortedGames.forEach(game => {
            const count = AC_DATABASE.filter(i => i.game === game).length;
            const opt = document.createElement('option');
            opt.value = game;
            opt.textContent = `${game} (${count})`;
            dom.filterGame.appendChild(opt);
        });

        // Categories (with item counts)
        const categories = [...new Set(AC_DATABASE.map(i => i.category))].sort();
        categories.forEach(cat => {
            const count = AC_DATABASE.filter(i => i.category === cat).length;
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = `${cat} (${count})`;
            dom.filterCategory.appendChild(opt);
        });

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
            const shortNames = {
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
            btn.textContent = shortNames[game] || game;
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
        const gameFilter = dom.filterGame.value || activeGameFilter;
        const categoryFilter = dom.filterCategory.value;
        const ownedFilter = dom.filterOwned.value;

        const sortValue = dom.sortBy.value;

        let results = AC_DATABASE.filter(item => {
            // Search
            if (search) {
                const haystack = `${item.name} ${item.game} ${item.description} ${item.contents} ${item.edition_type}`.toLowerCase();
                if (!haystack.includes(search)) return false;
            }
            // Game
            if (gameFilter && item.game !== gameFilter) return false;
            // Category
            if (categoryFilter && item.category !== categoryFilter) return false;
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

        return results;
    }

    function renderItems() {
        const items = getFilteredItems();
        dom.itemsContainer.innerHTML = '';

        if (items.length === 0) {
            dom.noResults.style.display = 'block';
        } else {
            dom.noResults.style.display = 'none';
        }

        const fragment = document.createDocumentFragment();
        items.forEach(item => {
            fragment.appendChild(createCard(item));
        });
        dom.itemsContainer.appendChild(fragment);

        updateStats();
    }

    function createCard(item) {
        const data = getItemData(item.id);
        const card = document.createElement('div');
        card.className = 'item-card';
        if (data.owned) card.classList.add('owned');
        if (data.wishlist && !data.owned) card.classList.add('wishlist');
        card.dataset.id = item.id;

        const conditionHTML = data.condition
            ? `<span class="card-condition condition-${data.condition}">${formatCondition(data.condition)}</span>`
            : '';

        const imageHTML = item.image
            ? `<img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
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
                    <span class="card-type">${escapeHTML(item.edition_type)}</span>
                    ${conditionHTML}
                </div>
            </div>
        `;

        card.addEventListener('click', () => openModal(item.id));
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
    function updateStats() {
        const total = AC_DATABASE.length;
        let owned = 0;
        Object.values(collection).forEach(data => {
            if (data.owned) owned++;
        });
        const percent = total > 0 ? Math.round((owned / total) * 100) : 0;

        dom.totalItems.textContent = total;
        dom.ownedItems.textContent = owned;
        dom.completionPercent.textContent = percent + '%';
    }

    // ---- Modal ----
    function openModal(id) {
        const item = AC_DATABASE.find(i => i.id === id);
        if (!item) return;

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

    function renderGalleryImage() {
        const modal = document.getElementById('itemModal');

        if (galleryImages.length === 0) {
            dom.modalImage.innerHTML = '<svg viewBox="0 0 100 100" class="placeholder-icon"><path d="M50 5 L30 55 L5 95 L25 95 L50 55 L75 95 L95 95 L70 55 Z" fill="currentColor"/></svg>';
            modal.classList.remove('landscape');
        } else {
            const src = galleryImages[galleryIndex];
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'Image ' + (galleryIndex + 1);
            img.onload = function () {
                modal.classList.toggle('landscape', img.naturalWidth > img.naturalHeight);
            };
            img.onerror = function () {
                dom.modalImage.innerHTML = '<svg viewBox="0 0 100 100" class="placeholder-icon"><path d="M50 5 L30 55 L5 95 L25 95 L50 55 L75 95 L95 95 L70 55 Z" fill="currentColor"/></svg>';
            };
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

    function galleryGoTo(idx) {
        if (idx < 0) idx = galleryImages.length - 1;
        if (idx >= galleryImages.length) idx = 0;
        galleryIndex = idx;
        renderGalleryImage();
    }

    function galleryPrev() { galleryGoTo(galleryIndex - 1); }
    function galleryNext() { galleryGoTo(galleryIndex + 1); }

    function saveModalData() {
        if (currentItemId === null) return;
        const data = {
            owned: dom.modalOwned.checked,
            wishlist: dom.modalWishlist.checked,
            hasBox: dom.modalHasBox.checked,
            condition: dom.modalCondition.value,
            copies: parseInt(dom.modalCopies.value) || 0,
            notes: dom.modalNotes.value
        };
        setItemData(currentItemId, data);
        renderItems();
    }

    // ---- Add / Edit Item ----
    let editingCustomIndex = null; // when non-null, Add Item modal is in edit mode

    function openAddModal(editIndex) {
        editingCustomIndex = (editIndex !== undefined) ? editIndex : null;

        dom.addGameRow.style.display = 'none';
        dom.addGameInput.value = '';
        populateAddGameSelect();

        const titleEl = document.querySelector('.add-modal-title');
        const subtitleEl = document.querySelector('.add-modal-subtitle');

        if (editingCustomIndex !== null) {
            // Edit mode — pre-fill form
            const items = loadCustomItems();
            const item = items[editingCustomIndex];
            dom.addName.value = item.name || '';
            dom.addGame.value = item.game || '';
            dom.addYear.value = item.year || '';
            dom.addCategory.value = item.category || '';
            dom.addDescription.value = item.description || '';
            dom.addContents.value = item.contents || '';
            dom.addImagePath.value = item.imagePath || '';
            titleEl.textContent = 'Edit Item';
            subtitleEl.textContent = 'Modify your custom collectible';
            dom.addItemSave.textContent = 'Save Changes';
        } else {
            // Add mode — reset form
            dom.addName.value = '';
            dom.addGame.value = '';
            dom.addYear.value = '';
            dom.addCategory.value = '';
            dom.addDescription.value = '';
            dom.addContents.value = '';
            dom.addImagePath.value = '';
            titleEl.textContent = 'Add New Item';
            subtitleEl.textContent = 'Add a custom collectible to your database';
            dom.addItemSave.textContent = 'Add Item';
        }

        dom.addModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        dom.addName.focus();
    }

    function closeAddModal() {
        dom.addModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        editingCustomIndex = null;
    }

    function populateAddGameSelect() {
        const select = dom.addGame;
        const currentVal = select.value;
        while (select.options.length > 1) select.remove(1);

        const allGames = getAllGameNames();
        allGames.forEach(game => {
            const opt = document.createElement('option');
            opt.value = game;
            opt.textContent = game;
            select.appendChild(opt);
        });

        if (currentVal) select.value = currentVal;
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
        const custom = loadCustomGames();
        custom.forEach(g => { if (!gameOrder.includes(g)) gameOrder.push(g); });
        return gameOrder;
    }

    function addNewGame() {
        const name = dom.addGameInput.value.trim();
        if (!name) return;

        const games = loadCustomGames();
        if (!games.includes(name)) {
            games.push(name);
            saveCustomGames(games);
        }

        populateAddGameSelect();
        initFilters();

        dom.addGame.value = name;
        dom.addGameRow.style.display = 'none';
        dom.addGameInput.value = '';
    }

    function saveItemFromForm() {
        const name = dom.addName.value.trim();
        const game = dom.addGame.value;
        const year = parseInt(dom.addYear.value);
        const category = dom.addCategory.value;

        if (!name || !game || !year || !category) {
            [dom.addName, dom.addGame, dom.addYear, dom.addCategory].forEach(el => {
                if (!el.value.trim()) {
                    el.style.borderColor = 'var(--red)';
                    setTimeout(() => { el.style.borderColor = ''; }, 2000);
                }
            });
            return;
        }

        const itemData = {
            name: name,
            game: game,
            year: year,
            category: category,
            edition_type: category,
            description: dom.addDescription.value.trim(),
            contents: dom.addContents.value.trim(),
            imagePath: dom.addImagePath.value.trim() || '',
            _custom: true
        };

        if (editingCustomIndex !== null) {
            // ---- Edit existing custom item ----
            const items = loadCustomItems();
            const oldName = items[editingCustomIndex].name;
            items[editingCustomIndex] = itemData;
            saveCustomItems(items);

            // Update live AC_DATABASE entry
            const liveItem = AC_DATABASE.find(i => i._custom && i.name === oldName);
            if (liveItem) {
                Object.assign(liveItem, itemData);
                if (itemData.imagePath) {
                    liveItem.image = itemData.imagePath;
                    AC_IMAGES[itemData.name] = itemData.imagePath;
                } else {
                    delete liveItem.image;
                }
                // If name changed, migrate collection data
                if (oldName !== itemData.name) {
                    delete AC_IMAGES[oldName];
                }
            }
        } else {
            // ---- Add new custom item ----
            const items = loadCustomItems();
            items.push(itemData);
            saveCustomItems(items);

            if (itemData.imagePath) {
                itemData.image = itemData.imagePath;
                AC_IMAGES[itemData.name] = itemData.imagePath;
            }
            itemData.id = AC_DATABASE.length;
            AC_DATABASE.push(itemData);
        }

        initFilters();
        renderItems();
        closeAddModal();
    }

    // ---- Manage Modal ----
    let confirmCallback = null;

    function openManageModal() {
        dom.manageModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        switchManageTab('items');
    }

    function closeManageModal() {
        dom.manageModalOverlay.classList.remove('active');
        dom.manageConfirmOverlay.classList.remove('active');
        document.body.style.overflow = '';
        confirmCallback = null;
    }

    function switchManageTab(tab) {
        document.querySelectorAll('.manage-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        dom.manageItemsTab.classList.toggle('active', tab === 'items');
        dom.manageGamesTab.classList.toggle('active', tab === 'games');

        if (tab === 'items') renderManageItems();
        else renderManageGames();
    }

    function showConfirm(message, onConfirm) {
        dom.manageConfirmMsg.textContent = message;
        dom.manageConfirmOverlay.classList.add('active');
        confirmCallback = onConfirm;
    }

    // ---- Manage: Custom Items ----
    function renderManageItems() {
        const items = loadCustomItems();
        dom.manageItemsList.innerHTML = '';
        dom.manageItemsEmpty.style.display = items.length ? 'none' : 'block';

        items.forEach((item, idx) => {
            const row = document.createElement('div');
            row.className = 'manage-list-item';

            row.innerHTML = `
                <div class="manage-item-info">
                    <span class="manage-item-name">${escapeHTML(item.name)}</span>
                    <span class="manage-item-meta">${escapeHTML(item.game)} &middot; ${item.year} &middot; ${escapeHTML(item.category)}</span>
                </div>
                <div class="manage-item-actions">
                    <button class="manage-action-btn export-btn" data-idx="${idx}" title="Copy as code">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                    <button class="manage-action-btn edit-btn" data-idx="${idx}" title="Edit item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="manage-action-btn delete-btn" data-idx="${idx}" title="Delete item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            `;

            // Export button
            row.querySelector('.export-btn').addEventListener('click', () => {
                copyItemAsCode(item);
            });

            // Edit button
            row.querySelector('.edit-btn').addEventListener('click', () => {
                closeManageModal();
                openAddModal(idx);
            });

            // Delete button
            row.querySelector('.delete-btn').addEventListener('click', () => {
                showConfirm(`Delete "${item.name}"? This cannot be undone.`, () => deleteCustomItem(idx));
            });

            dom.manageItemsList.appendChild(row);
        });

        // Export All button (only if items exist)
        if (items.length > 0) {
            const exportAllRow = document.createElement('div');
            exportAllRow.className = 'manage-export-all';
            exportAllRow.innerHTML = `<button class="btn-export-all" id="exportAllItems">Copy All as Code</button>`;
            dom.manageItemsList.appendChild(exportAllRow);
            document.getElementById('exportAllItems').addEventListener('click', () => {
                copyAllItemsAsCode(items);
            });
        }
    }

    function deleteCustomItem(idx) {
        const items = loadCustomItems();
        const deleted = items[idx];
        items.splice(idx, 1);
        saveCustomItems(items);

        // Build name-to-collection map before removing from live database
        const collectionByName = {};
        AC_DATABASE.forEach(item => {
            const data = collection[item.id];
            if (data) collectionByName[item.name] = data;
        });
        delete collectionByName[deleted.name];

        // Remove from live database
        const liveIdx = AC_DATABASE.findIndex(i => i._custom && i.name === deleted.name);
        if (liveIdx !== -1) AC_DATABASE.splice(liveIdx, 1);

        // Re-assign IDs and remap collection
        collection = {};
        AC_DATABASE.forEach((item, i) => {
            item.id = i;
            if (collectionByName[item.name]) {
                collection[i] = collectionByName[item.name];
            }
        });
        saveCollection();

        // Clean up image mapping
        delete AC_IMAGES[deleted.name];

        initFilters();
        renderItems();
        renderManageItems();
        dom.manageConfirmOverlay.classList.remove('active');
    }

    // ---- Manage: Custom Games ----
    function renderManageGames() {
        const games = loadCustomGames();
        dom.manageGamesList.innerHTML = '';
        dom.manageGamesEmpty.style.display = games.length ? 'none' : 'block';

        games.forEach((gameName, idx) => {
            const itemCount = AC_DATABASE.filter(i => i.game === gameName).length;
            const row = document.createElement('div');
            row.className = 'manage-list-item';

            row.innerHTML = `
                <div class="manage-item-info">
                    <span class="manage-item-name">${escapeHTML(gameName)}</span>
                    <span class="manage-item-meta">${itemCount} item${itemCount !== 1 ? 's' : ''} using this game</span>
                </div>
                <div class="manage-item-actions">
                    <button class="manage-action-btn edit-btn" title="Rename game">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="manage-action-btn delete-btn" title="Delete game">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            `;

            // Rename
            row.querySelector('.edit-btn').addEventListener('click', () => {
                startGameRename(row, gameName, idx);
            });

            // Delete
            row.querySelector('.delete-btn').addEventListener('click', () => {
                const msg = itemCount > 0
                    ? `Delete "${gameName}"? ${itemCount} item${itemCount !== 1 ? 's' : ''} will be reassigned to "General".`
                    : `Delete "${gameName}"?`;
                showConfirm(msg, () => deleteCustomGame(idx, gameName));
            });

            dom.manageGamesList.appendChild(row);
        });
    }

    function startGameRename(row, oldName, idx) {
        const infoEl = row.querySelector('.manage-item-info');
        const actionsEl = row.querySelector('.manage-item-actions');
        actionsEl.style.display = 'none';

        infoEl.innerHTML = `
            <div class="manage-edit-inline">
                <input type="text" value="${escapeHTML(oldName)}">
                <button class="save-btn">Save</button>
                <button class="cancel-edit-btn">Cancel</button>
            </div>
        `;

        const input = infoEl.querySelector('input');
        const saveBtn = infoEl.querySelector('.save-btn');
        const cancelBtn = infoEl.querySelector('.cancel-edit-btn');

        input.focus();
        input.select();

        function doSave() {
            const newName = input.value.trim();
            if (!newName || newName === oldName) { doCancel(); return; }
            renameCustomGame(idx, oldName, newName);
        }

        function doCancel() {
            renderManageGames(); // re-render to restore original state
        }

        saveBtn.addEventListener('click', doSave);
        cancelBtn.addEventListener('click', doCancel);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') doSave();
            if (e.key === 'Escape') doCancel();
        });
    }

    function renameCustomGame(idx, oldName, newName) {
        // Update custom games list
        const games = loadCustomGames();
        games[idx] = newName;
        saveCustomGames(games);

        // Update all custom items that reference this game
        const items = loadCustomItems();
        items.forEach(item => {
            if (item.game === oldName) item.game = newName;
        });
        saveCustomItems(items);

        // Update live database
        AC_DATABASE.forEach(item => {
            if (item._custom && item.game === oldName) item.game = newName;
        });

        initFilters();
        renderItems();
        renderManageGames();
    }

    function deleteCustomGame(idx, gameName) {
        const games = loadCustomGames();
        games.splice(idx, 1);
        saveCustomGames(games);

        // Reassign items using this game to "General"
        const items = loadCustomItems();
        items.forEach(item => {
            if (item.game === gameName) item.game = 'General';
        });
        saveCustomItems(items);

        // Update live database
        AC_DATABASE.forEach(item => {
            if (item._custom && item.game === gameName) item.game = 'General';
        });

        initFilters();
        renderItems();
        renderManageGames();
        dom.manageConfirmOverlay.classList.remove('active');
    }

    function addGameFromManage() {
        const name = dom.manageAddGameInput.value.trim();
        if (!name) return;

        const games = loadCustomGames();
        if (games.includes(name)) {
            dom.manageAddGameInput.style.borderColor = 'var(--red)';
            setTimeout(() => { dom.manageAddGameInput.style.borderColor = ''; }, 2000);
            return;
        }

        games.push(name);
        saveCustomGames(games);
        dom.manageAddGameInput.value = '';

        initFilters();
        renderManageGames();
    }

    // ---- Collection Export / Import ----
    function exportCollection() {
        const exportData = [];
        AC_DATABASE.forEach(item => {
            const data = getItemData(item.id);
            if (data.owned || data.wishlist || data.hasBox || data.condition || data.copies > 0 || data.notes) {
                exportData.push({
                    name: item.name,
                    game: item.game,
                    owned: data.owned || false,
                    wishlist: data.wishlist || false,
                    hasBox: data.hasBox || false,
                    condition: data.condition || '',
                    copies: data.copies || 0,
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

    // ---- Export ----
    function itemToDbCode(item) {
        const lines = [
            `  {`,
            `    "name": ${JSON.stringify(item.name)},`,
            `    "game": ${JSON.stringify(item.game)},`,
            `    "year": ${item.year},`,
            `    "category": ${JSON.stringify(item.category)},`,
            `    "description": ${JSON.stringify(item.description || '')},`,
            `    "contents": ${JSON.stringify(item.contents || '')},`,
            `    "edition_type": ${JSON.stringify(item.edition_type || item.category)}`,
            `  }`
        ];
        return lines.join('\n');
    }

    function itemToImageCode(item) {
        if (!item.imagePath) return null;
        return `    ${JSON.stringify(item.name)}:${' '.repeat(Math.max(1, 60 - item.name.length))}${JSON.stringify(item.imagePath)},`;
    }

    function copyItemAsCode(item) {
        let code = '// database.js entry:\n' + itemToDbCode(item) + ',\n';
        const imgLine = itemToImageCode(item);
        if (imgLine) {
            code += '\n// images.js entry:\n' + imgLine + '\n';
        }
        navigator.clipboard.writeText(code).then(() => {
            showToast('Copied to clipboard!');
        });
    }

    function copyAllItemsAsCode(items) {
        let dbEntries = items.map(itemToDbCode).join(',\n');
        let code = '// database.js entries:\n' + dbEntries + '\n';

        const imgLines = items.map(itemToImageCode).filter(Boolean);
        if (imgLines.length > 0) {
            code += '\n// images.js entries:\n' + imgLines.join('\n') + '\n';
        }
        navigator.clipboard.writeText(code).then(() => {
            showToast('All items copied to clipboard!');
        });
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
        dom.filterGame.addEventListener('change', () => {
            // Sync timeline
            activeGameFilter = '';
            document.querySelectorAll('.timeline-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.game === dom.filterGame.value);
            });
            renderItems();
        });

        dom.filterCategory.addEventListener('change', renderItems);
        dom.filterOwned.addEventListener('change', renderItems);
        dom.sortBy.addEventListener('change', renderItems);

        // View toggle
        dom.viewGrid.addEventListener('click', () => {
            currentView = 'grid';
            dom.viewGrid.classList.add('active');
            dom.viewList.classList.remove('active');
            dom.itemsContainer.classList.remove('list-view');
        });

        dom.viewList.addEventListener('click', () => {
            currentView = 'list';
            dom.viewList.classList.add('active');
            dom.viewGrid.classList.remove('active');
            dom.itemsContainer.classList.add('list-view');
        });

        // Timeline
        dom.gameTimeline.addEventListener('click', (e) => {
            const btn = e.target.closest('.timeline-btn');
            if (!btn) return;

            document.querySelectorAll('.timeline-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeGameFilter = btn.dataset.game;
            dom.filterGame.value = btn.dataset.game;
            renderItems();
        });

        // Modal
        dom.modalClose.addEventListener('click', closeModal);
        dom.modalOverlay.addEventListener('click', (e) => {
            if (e.target === dom.modalOverlay) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (dom.manageConfirmOverlay.classList.contains('active')) {
                    dom.manageConfirmOverlay.classList.remove('active');
                    confirmCallback = null;
                } else if (dom.manageModalOverlay.classList.contains('active')) {
                    closeManageModal();
                } else if (dom.addModalOverlay.classList.contains('active')) {
                    closeAddModal();
                } else if (dom.modalOverlay.classList.contains('active')) {
                    closeModal();
                }
            }
            if (!dom.modalOverlay.classList.contains('active')) return;
            if (e.key === 'ArrowLeft' && galleryImages.length > 1) galleryPrev();
            if (e.key === 'ArrowRight' && galleryImages.length > 1) galleryNext();
        });

        // Gallery navigation
        dom.galleryPrev.addEventListener('click', (e) => { e.stopPropagation(); galleryPrev(); });
        dom.galleryNext.addEventListener('click', (e) => { e.stopPropagation(); galleryNext(); });

        // Modal collection controls - auto-save on change
        const autoSaveControls = [dom.modalOwned, dom.modalWishlist, dom.modalHasBox, dom.modalCondition];
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
                saveModalData();
            }
        });

        dom.copiesPlus.addEventListener('click', () => {
            let val = parseInt(dom.modalCopies.value) || 0;
            if (val < 99) {
                dom.modalCopies.value = val + 1;
                saveModalData();
            }
        });

        // Add Item modal
        // Stat block clicks
        document.getElementById('statTotal').addEventListener('click', () => {
            dom.searchInput.value = '';
            dom.clearSearch.classList.remove('visible');
            dom.filterGame.value = '';
            dom.filterCategory.value = '';
            dom.filterOwned.value = '';
            dom.sortBy.value = '';
            activeGameFilter = '';
            document.querySelectorAll('.timeline-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.timeline-btn[data-game=""]').classList.add('active');
            renderItems();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        document.getElementById('statOwned').addEventListener('click', () => {
            dom.filterOwned.value = 'owned';
            renderItems();
            window.scrollTo({ top: dom.itemsContainer.offsetTop - 100, behavior: 'smooth' });
        });
        document.getElementById('statCompletion').addEventListener('click', () => {
            dom.filterOwned.value = 'owned';
            renderItems();
            window.scrollTo({ top: dom.itemsContainer.offsetTop - 100, behavior: 'smooth' });
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
            dom.filterGame.value = '';
            dom.filterCategory.value = '';
            dom.filterOwned.value = '';
            dom.sortBy.value = '';
            activeGameFilter = '';
            document.querySelectorAll('.timeline-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.timeline-btn[data-game=""]').classList.add('active');
            renderItems();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        dom.addItemBtn.addEventListener('click', () => openAddModal());
        dom.addModalClose.addEventListener('click', closeAddModal);
        dom.addItemCancel.addEventListener('click', closeAddModal);
        dom.addModalOverlay.addEventListener('click', (e) => {
            if (e.target === dom.addModalOverlay) closeAddModal();
        });
        dom.addItemSave.addEventListener('click', saveItemFromForm);

        // Add Game inline controls (in Add Item form)
        dom.addGameToggle.addEventListener('click', () => {
            dom.addGameRow.style.display = 'flex';
            dom.addGameInput.focus();
        });
        dom.addGameConfirm.addEventListener('click', addNewGame);
        dom.addGameCancel.addEventListener('click', () => {
            dom.addGameRow.style.display = 'none';
            dom.addGameInput.value = '';
        });
        dom.addGameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addNewGame();
            if (e.key === 'Escape') {
                dom.addGameRow.style.display = 'none';
                dom.addGameInput.value = '';
            }
        });

        // Allow Enter in the add form to submit
        dom.addImagePath.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveItemFromForm();
        });

        // ---- Manage Modal events ----
        dom.manageBtn.addEventListener('click', openManageModal);
        dom.manageModalClose.addEventListener('click', closeManageModal);
        dom.manageModalOverlay.addEventListener('click', (e) => {
            if (e.target === dom.manageModalOverlay) closeManageModal();
        });

        // Tab switching
        document.querySelectorAll('.manage-tab').forEach(tab => {
            tab.addEventListener('click', () => switchManageTab(tab.dataset.tab));
        });

        // Add game from manage modal
        dom.manageAddGameBtn.addEventListener('click', addGameFromManage);
        dom.manageAddGameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addGameFromManage();
        });

        // Confirm dialog
        dom.manageConfirmYes.addEventListener('click', () => {
            if (confirmCallback) confirmCallback();
        });
        dom.manageConfirmNo.addEventListener('click', () => {
            dom.manageConfirmOverlay.classList.remove('active');
            confirmCallback = null;
        });

        // When marking as owned, auto-set copies to 1 if currently 0
        dom.modalOwned.addEventListener('change', () => {
            if (dom.modalOwned.checked && parseInt(dom.modalCopies.value) === 0) {
                dom.modalCopies.value = 1;
            }
            if (!dom.modalOwned.checked) {
                dom.modalCopies.value = 0;
            }
        });
    }

    // ---- Initialize ----
    function init() {
        // Hide admin-only buttons for public visitors
        if (!isAdmin) {
            dom.addItemBtn.style.display = 'none';
            dom.manageBtn.style.display = 'none';
        }

        initFilters();
        initEvents();
        renderItems();
        updateStats();
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
