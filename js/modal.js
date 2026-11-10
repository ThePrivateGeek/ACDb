/* ============================================
   ACDb - Modal, Gallery & Lightbox
   ============================================ */

(function () {
    'use strict';

    window.ACDB = window.ACDB || {};
    const A = window.ACDB;

    // Local gallery state
    let galleryImages = [];
    let galleryIndex = 0;
    let currentItemId = null;
    let isReadOnlyOpen = false;
    // Full modal opened on top of a view (the reading order): collection
    // controls work as usual, but the view and its hash stay underneath.
    let isOverView = false;

    // ---- Focus (DESIGN.md section 6, Dialogs) ----
    // The window takes focus when it opens, keeps Tab inside while it is
    // open and hands focus back to what opened it. An edit made in the
    // window can redraw the card or reading row it was opened from, so that
    // is found again by its item id.
    let opener = null;
    let openerSelector = '';
    let releaseFocus = null;

    const isOnScreen = el => !!el && el.isConnected && el.getClientRects().length > 0;

    // The reading order whose "Next" link has focus. Following it shows the
    // next book in the same window, and focus stays on that order's Next
    // link, so Enter walks the order.
    function focusedNextOrder() {
        const link = document.activeElement;
        if (!link || !link.matches('#modalReadingOrder [data-next]')) return null;
        return link.closest('.modal-reading-line').querySelector('[data-order]').dataset.order;
    }

    // `from` is what opened the window (else whatever has focus). A window
    // that is already open keeps its first opener. `fromAddress` is an
    // item opened by its address: with nothing focused before it (a shared
    // link, a reload) focus is left alone, like a page opened from a pasted
    // link, so no ring shows on arrival; the first Tab still lands inside.
    function takeFocus(from, nextOrder, fromAddress) {
        const modal = document.getElementById('itemModal');
        if (!releaseFocus) {
            const el = from || document.activeElement;
            opener = el && el !== document.body && !modal.contains(el) ? el : null;
            // A card, or a reading row's cover or title (both carry the id)
            const kind = opener && opener.classList[0] ? '.' + CSS.escape(opener.classList[0]) : '';
            openerSelector = !opener ? ''
                : opener.matches('.item-card[data-id]') ? `${kind}[data-id="${opener.dataset.id}"]`
                : opener.matches('[data-open]') ? `${kind}[data-open="${opener.dataset.open}"]`
                : '';
            releaseFocus = A.trapFocus(modal);
        }
        const orderLink = nextOrder && document.querySelector(`#modalReadingOrder [data-order="${CSS.escape(nextOrder)}"]`);
        const next = orderLink && orderLink.closest('.modal-reading-line').querySelector('[data-next]');
        if (fromAddress && !opener && !next && !modal.contains(document.activeElement)) return;
        (next || A.dom.modalClose).focus({ preventScroll: true });
    }

    // With no opener (a shared link) focus is left to the browser. So it is
    // with `leaveFocus`: the address moved to another view, which places
    // focus itself (on its page title).
    function returnFocus(leaveFocus) {
        if (!releaseFocus) return;
        releaseFocus();
        releaseFocus = null;
        const target = leaveFocus ? null
            : isOnScreen(opener) ? opener
            : openerSelector ? [...document.querySelectorAll(openerSelector)].find(isOnScreen)
            : null;
        if (target) target.focus({ preventScroll: true });
        opener = null;
        openerSelector = '';
    }

    function setModalLink(el, hash) {
        if (hash) el.href = hash;
        else el.removeAttribute('href');
    }

    function populateItemInfo(item) {
        const dom = A.dom;
        dom.modalBadge.textContent = item.category;
        if (item.type && item.type !== item.category) {
            dom.modalBadgeType.textContent = item.type;
            dom.modalBadgeType.style.display = '';
        } else {
            dom.modalBadgeType.style.display = 'none';
        }
        dom.modalTitle.textContent = item.name;
        dom.modalGame.textContent = item.game;
        dom.modalYear.textContent = item.year;
        dom.modalId.textContent = '#' + item.id;
        dom.modalDescription.textContent = item.description;
        dom.modalContents.textContent = item.contents || 'N/A';

        // Series line (comics, graphic novels, manga) — shows how many
        // entries the series has so the link doubles as a "collect them all"
        // hint. Hidden entirely for items that aren't part of a series.
        dom.modalSeriesRow.hidden = !item.series;
        if (item.series) {
            const total = AC_DATABASE.filter(i => i.series === item.series).length;
            dom.modalSeries.textContent = item.series;
            dom.modalSeriesCount.textContent = `${total} ${total === 1 ? 'entry' : 'entries'}`;
        }

        // Characters the item shows or tells the story of (js/characters.js),
        // each a link to their page on the Characters tab
        const characters = (item.characters || []).map(A.findCharacterById).filter(Boolean);
        document.getElementById('modalCharactersRow').hidden = characters.length === 0;
        document.getElementById('modalCharactersLabel').textContent = characters.length === 1 ? 'Character' : 'Characters';
        document.getElementById('modalCharacters').innerHTML = characters
            .map(c => `<a class="modal-reading-name" href="#characters/${A.characterSlug(c)}" data-character-id="${c.id}">${A.escapeHTML(c.name)}</a>`)
            .join('');

        // Free scan on the Internet Archive, when one exists for this publication
        // (or another edition/translation of the same story). Shown in read-only
        // mode too — it's not a collection control.
        const readUrl = A.readUrl(item.read);
        dom.modalReadLink.hidden = !readUrl;
        if (readUrl) dom.modalReadLink.href = readUrl;
        else dom.modalReadLink.removeAttribute('href');
        // `readLang` flags a scan in another language than the entry itself
        // (e.g. "fr" for the French Blade of Shao Jun scans).
        dom.modalReadLabel.textContent = 'Read on Internet Archive' +
            (item.readLang ? ` (${item.readLang.charAt(0).toUpperCase()}${item.readLang.slice(1)})` : '');

        // Category/type/game/series act as filter shortcuts, except when the
        // browse grid is hidden behind another view (profile, reading order).
        const gridHidden = isReadOnlyOpen || isOverView;
        [dom.modalBadge, dom.modalBadgeType, dom.modalGame, dom.modalSeries].forEach(el => {
            el.classList.toggle('filter-link', !gridHidden);
            if (gridHidden) el.removeAttribute('title');
            else el.title = 'Show all "' + el.textContent + '" items';
        });

        // With no grid to filter, the game links to its page and the series to
        // its reading page instead. "General" and the movie aren't games, and
        // the Hachette collection isn't in any order, so they stay plain text.
        const game = isOverView ? GAMES.find(g => g.name === item.game) : null;
        setModalLink(dom.modalGame, game ? '#games/' + A.gameUrlSlug(game) : null);
        setModalLink(dom.modalSeries, isOverView && item.series ? A.seriesHashFor(item.series) : null);

        A.fillModalReadingOrder(item, isReadOnlyOpen);
    }

    function populateGallery(item) {
        // item.image is always an array (produced by tools/build-images.py)
        galleryIndex = 0;
        galleryImages = Array.isArray(item.image) ? [...item.image] : [];
        renderGalleryImage();
    }

    function openModal(id, fromHash, from) {
        const item = AC_DATABASE.find(i => i.id === id);
        if (!item) return;

        // Defensive: openModal always shows the full modal. Clear any stale
        // read-only state so re-entry from any caller is safe.
        isReadOnlyOpen = false;
        isOverView = false;
        const collectionSection = document.getElementById('modalCollectionSection');
        if (collectionSection) collectionSection.style.display = '';

        if (!fromHash) A.setHash(item);
        currentItemId = id;
        const dom = A.dom;
        const nextOrder = focusedNextOrder();

        populateGallery(item);
        populateItemInfo(item);
        populateCollectionControls(id);

        dom.modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        takeFocus(from, nextOrder, fromHash);
    }

    // Fill the "My Collection" controls from the saved data (no save).
    function populateCollectionControls(id) {
        const data = A.getItemData(id);
        const dom = A.dom;
        dom.modalOwned.checked = data.owned;
        dom.modalWishlist.checked = data.wishlist;
        dom.modalHasBox.checked = data.hasBox;
        dom.modalCondition.value = data.condition || '';
        dom.modalCopies.value = data.copies || 0;
        dom.modalPricePaid.value = data.pricePaid || '';
        dom.modalAcquiredDate.value = data.acquiredDate || '';
        dom.modalNotes.value = data.notes || '';
        // Reading is tracked separately from ownership and only for story
        // publications (A.isReadable).
        const item = AC_DATABASE.find(i => i.id === id);
        dom.modalReadingSection.hidden = !(item && A.isReadable(item));
        dom.modalHasRead.checked = !!data.hasRead;
        dom.modalReadDate.value = data.readDate || '';
        // Collected editions say up front that they credit their parts.
        const collects = item && item.collects ? item.collects.length : 0;
        dom.modalReadingCollects.hidden = collects === 0;
        if (collects) {
            dom.modalReadingCollects.textContent = `Marking this as read also marks the ${collects} ${collectedNoun(item)} it collects as read.`;
        }
    }

    // Cloud sync pulled new values: update the open item's controls if it
    // was one of them.
    function refreshModalControls(changedIds) {
        if (currentItemId === null || isReadOnlyOpen) return;
        if (!A.dom.modalOverlay.classList.contains('active')) return;
        if (changedIds.includes(currentItemId)) populateCollectionControls(currentItemId);
    }

    // Full modal on top of the current view, without touching its hash. Same
    // history handling as the read-only modal: back closes it.
    function openModalOverView(id, from) {
        const item = AC_DATABASE.find(i => i.id === id);
        if (!item) return;

        isReadOnlyOpen = false;
        isOverView = true;
        const collectionSection = document.getElementById('modalCollectionSection');
        if (collectionSection) collectionSection.style.display = '';

        currentItemId = id;
        populateGallery(item);
        populateItemInfo(item);
        populateCollectionControls(id);

        A.pushReadOnlyHistoryState();
        A.dom.modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        takeFocus(from);
    }

    // Show another item in the open over-view modal (reading order "Next").
    function switchModalItem(id) {
        const item = AC_DATABASE.find(i => i.id === id);
        if (!item || !isOverView) return;
        currentItemId = id;
        const nextOrder = focusedNextOrder();
        populateGallery(item);
        populateItemInfo(item);
        populateCollectionControls(id);
        // Desktop scrolls the details pane, phones the whole modal.
        document.querySelector('#itemModal .modal-details').scrollTop = 0;
        document.getElementById('itemModal').scrollTop = 0;
        takeFocus(null, nextOrder);
    }

    function openReadOnlyModal(id, from) {
        const item = AC_DATABASE.find(i => i.id === id);
        if (!item) return;

        const dom = A.dom;
        currentItemId = id;
        isReadOnlyOpen = true;

        populateGallery(item);
        populateItemInfo(item);

        // Hide the collection section — no controls in read-only mode
        const collectionSection = document.getElementById('modalCollectionSection');
        if (collectionSection) collectionSection.style.display = 'none';

        // Push a duplicate history entry so browser back closes this modal
        // instead of navigating away from the current view (profile / leaderboard).
        A.pushReadOnlyHistoryState();

        // Show modal WITHOUT changing the visible hash (keep profile hash intact)
        dom.modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        takeFocus(from);
    }

    function closeModal(options) {
        const skipClearHash = !!(options && options.skipClearHash);
        const skipHistoryPop = !!(options && options.skipHistoryPop);
        // Set by handleHash when a link in the window led to another view
        const leaveFocus = !!(options && options.leaveFocus);
        const dom = A.dom;
        dom.modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('itemModal').classList.remove('landscape');
        returnFocus(leaveFocus);
        currentItemId = null;
        galleryImages = [];
        galleryIndex = 0;

        // Restore the collection section for the next normal open
        const collectionSection = document.getElementById('modalCollectionSection');
        if (collectionSection) collectionSection.style.display = '';

        // Pop the duplicate history entry pushed by openReadOnlyModal (if any).
        // skipHistoryPop is set when closeModal is invoked from handleHash's
        // back-button branch — the browser already popped the entry for us.
        if (!skipHistoryPop) {
            A.popReadOnlyHistoryState();
        }

        // Skip clearHash when closing a read-only open (preserve profile hash)
        // or when the caller already handled the hash (back-button flow in handleHash).
        if (!isReadOnlyOpen && !isOverView && !skipClearHash) {
            A.clearHash();
        }
        isReadOnlyOpen = false;
        isOverView = false;
    }

    // ---- Gallery ----
    function renderGalleryImage(direction) {
        const dom = A.dom;
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
        const dom = A.dom;
        const count = galleryImages.length;
        const hasMultiple = count > 1;

        dom.galleryPrev.classList.toggle('visible', hasMultiple);
        dom.galleryNext.classList.toggle('visible', hasMultiple);

        if (hasMultiple) {
            dom.galleryCounter.textContent = `${galleryIndex + 1} / ${count}`;
            dom.galleryCounter.classList.add('visible');
        } else {
            dom.galleryCounter.classList.remove('visible');
        }

        if (hasMultiple) {
            // The dots are redrawn on every change: a dot that had focus
            // hands it to the dot of the image now showing
            const hadFocus = dom.galleryDots.contains(document.activeElement);
            dom.galleryDots.classList.add('visible');
            dom.galleryDots.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const dot = document.createElement('button');
                dot.className = 'gallery-dot' + (i === galleryIndex ? ' active' : '');
                dot.setAttribute('aria-label', `Image ${i + 1} of ${count}`);
                if (i === galleryIndex) dot.setAttribute('aria-current', 'true');
                dot.addEventListener('click', () => galleryGoTo(i));
                dom.galleryDots.appendChild(dot);
            }
            if (hadFocus) dom.galleryDots.children[galleryIndex].focus({ preventScroll: true });
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
            // A dialog over the item window: it takes focus and Tab while
            // it is open, and hands both back when it closes
            this.returnTo = document.activeElement;
            document.getElementById('lightboxClose').focus();
            this.release = A.trapFocus(this.overlay);
            // Push a history entry so browser back closes the lightbox
            // without closing the modal underneath.
            A.pushLightboxHistoryState();
        },
        close(options) {
            const skipHistoryPop = !!(options && options.skipHistoryPop);
            this.overlay.classList.remove('active');
            if (this.release) {
                this.release();
                this.release = null;
                const modal = document.getElementById('itemModal');
                const back = modal.contains(this.returnTo) ? this.returnTo : A.dom.modalClose;
                back.focus({ preventScroll: true });
            }
            // skipHistoryPop is set when close() is invoked from handleHash's
            // back-button branch — the browser already popped the entry.
            if (!skipHistoryPop) {
                A.popLightboxHistoryState();
            }
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
        if (isReadOnlyOpen) return;
        const dom = A.dom;
        const data = {
            owned: dom.modalOwned.checked,
            wishlist: dom.modalWishlist.checked,
            hasBox: dom.modalHasBox.checked,
            condition: dom.modalCondition.value,
            copies: parseInt(dom.modalCopies.value) || 0,
            pricePaid: dom.modalPricePaid.value,
            acquiredDate: dom.modalAcquiredDate.value,
            notes: dom.modalNotes.value,
            hasRead: dom.modalHasRead.checked,
            readDate: dom.modalHasRead.checked ? dom.modalReadDate.value : ''
        };
        const before = A.getItemData(currentItemId);
        // Nothing new (a Copies change after typing already saved the number)
        if (Object.keys(data).every(key => data[key] === before[key])) return;
        A.setItemData(currentItemId, data);
        const changed = [currentItemId];
        // Reading a collected edition means reading what it collects.
        if (data.hasRead && !before.hasRead) changed.push(...creditCollectedParts(currentItemId, data.readDate));
        A.refreshItems(changed);
        if (data.owned && !before.owned) A.checkCompletionCelebration();
    }

    // Marks the parts of a collected edition (its "collects" list) as read.
    // Only ever adds: parts already read keep their own date, and unmarking
    // the collection leaves the parts alone. Returns the ids it marked.
    function creditCollectedParts(id, readDate) {
        const item = AC_DATABASE.find(i => i.id === id);
        if (!item || !item.collects) return [];
        const marked = [];
        item.collects.forEach(partId => {
            const part = A.getItemData(partId);
            if (part.hasRead) return;
            A.setItemData(partId, { ...part, hasRead: true, readDate: part.readDate || readDate || '' });
            marked.push(partId);
        });
        if (marked.length > 0) A.showToast(`Also marked ${marked.length} of the ${collectedNoun(item)} it collects as read`, 'success');
        return marked;
    }

    // "issues", "volumes", "novel" or "comics", for the hint and the toast.
    function collectedNoun(item) {
        const parts = item.collects.map(id => AC_DATABASE.find(i => i.id === id)).filter(Boolean);
        if (parts.every(p => /Issue #\d/.test(p.name))) return 'issues';
        if (parts.every(p => p.type === 'Novel')) return parts.length === 1 ? 'novel' : 'novels';
        if (parts.every(p => !/Issue #\d/.test(p.name))) return 'volumes';
        return 'comics';
    }

    // Opened over the page of the character it links to, the link just
    // closes the modal (like the reading order line); otherwise it navigates.
    document.getElementById('modalCharacters').addEventListener('click', (e) => {
        const link = e.target.closest('[data-character-id]');
        if (!link || !isOverView) return;
        if (A.isCharacterPageOpen(A.findCharacterById(Number(link.dataset.characterId)))) {
            e.preventDefault();
            closeModal();
        }
    });

    // Opened over the page of the game or series it links to, the link just
    // closes the modal, like the character and reading order links.
    ['modalGame', 'modalSeries'].forEach(id => {
        document.getElementById(id).addEventListener('click', (e) => {
            if (isOverView && e.currentTarget.getAttribute('href') === window.location.hash) {
                e.preventDefault();
                closeModal();
            }
        });
    });

    // Expose on namespace
    A.openModal = openModal;
    A.openReadOnlyModal = openReadOnlyModal;
    A.openModalOverView = openModalOverView;
    A.switchModalItem = switchModalItem;
    A.isModalOverView = () => isOverView;
    A.closeModal = closeModal;
    A.renderGalleryImage = renderGalleryImage;
    A.galleryPrev = galleryPrev;
    A.galleryNext = galleryNext;
    A.galleryGoTo = galleryGoTo;
    A.lightbox = lightbox;
    A.saveModalData = saveModalData;
    A.refreshModalControls = refreshModalControls;
    A.getCurrentItemId = () => currentItemId;
    A.setCurrentItemId = (id) => { currentItemId = id; };
    A.getGalleryImages = () => galleryImages;
    A.setGalleryImages = (imgs) => { galleryImages = imgs; };
    A.getGalleryIndex = () => galleryIndex;
    A.setGalleryIndex = (idx) => { galleryIndex = idx; };

})();
