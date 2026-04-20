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
        dom.modalDescription.textContent = item.description;
        dom.modalContents.textContent = item.contents || 'N/A';
    }

    function populateGallery(item) {
        // item.image is always an array (produced by tools/build-images.py)
        galleryIndex = 0;
        galleryImages = Array.isArray(item.image) ? [...item.image] : [];
        renderGalleryImage();
    }

    function openModal(id, fromHash) {
        const item = AC_DATABASE.find(i => i.id === id);
        if (!item) return;

        // Defensive: openModal always shows the full modal. Clear any stale
        // read-only state so re-entry from any caller is safe.
        isReadOnlyOpen = false;
        const collectionSection = document.getElementById('modalCollectionSection');
        if (collectionSection) collectionSection.style.display = '';

        if (!fromHash) A.setHash(item);
        currentItemId = id;
        const data = A.getItemData(id);
        const dom = A.dom;

        populateGallery(item);
        populateItemInfo(item);

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

    function openReadOnlyModal(id) {
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
    }

    function closeModal(options) {
        const skipClearHash = !!(options && options.skipClearHash);
        const skipHistoryPop = !!(options && options.skipHistoryPop);
        const dom = A.dom;
        dom.modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('itemModal').classList.remove('landscape');
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
        if (!isReadOnlyOpen && !skipClearHash) {
            A.clearHash();
        }
        isReadOnlyOpen = false;
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
            // Push a history entry so browser back closes the lightbox
            // without closing the modal underneath.
            A.pushLightboxHistoryState();
        },
        close(options) {
            const skipHistoryPop = !!(options && options.skipHistoryPop);
            this.overlay.classList.remove('active');
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
            notes: dom.modalNotes.value
        };
        const wasOwned = A.getItemData(currentItemId).owned;
        A.setItemData(currentItemId, data);
        A.renderItems();
        if (data.owned && !wasOwned) A.checkCompletionCelebration();
    }

    // Expose on namespace
    A.openModal = openModal;
    A.openReadOnlyModal = openReadOnlyModal;
    A.closeModal = closeModal;
    A.renderGalleryImage = renderGalleryImage;
    A.galleryPrev = galleryPrev;
    A.galleryNext = galleryNext;
    A.galleryGoTo = galleryGoTo;
    A.lightbox = lightbox;
    A.saveModalData = saveModalData;
    A.getCurrentItemId = () => currentItemId;
    A.setCurrentItemId = (id) => { currentItemId = id; };
    A.getGalleryImages = () => galleryImages;
    A.setGalleryImages = (imgs) => { galleryImages = imgs; };
    A.getGalleryIndex = () => galleryIndex;
    A.setGalleryIndex = (idx) => { galleryIndex = idx; };

})();
