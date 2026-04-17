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

    function openModal(id, fromHash) {
        const item = AC_DATABASE.find(i => i.id === id);
        if (!item) return;

        if (!fromHash) A.setHash(item);
        currentItemId = id;
        const data = A.getItemData(id);
        const dom = A.dom;

        // Build gallery images
        galleryImages = [];
        galleryIndex = 0;

        if (item.image) {
            galleryImages.push(item.image);
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
        const dom = A.dom;
        dom.modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('itemModal').classList.remove('landscape');
        currentItemId = null;
        galleryImages = [];
        galleryIndex = 0;
        A.clearHash();
    }

    // ---- Gallery ----
    function probeAdditionalImages(basePath) {
        const dotIdx = basePath.lastIndexOf('.');
        if (dotIdx === -1) return;

        const stem = basePath.substring(0, dotIdx);
        const ext = basePath.substring(dotIdx);

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
                updateGalleryUI();
            };
            img.src = testPath;
        }

        tryNext();
    }

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
