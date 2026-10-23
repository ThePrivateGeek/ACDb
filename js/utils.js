/* ============================================
   ACDb - Utility Functions
   ============================================ */

(function () {
    'use strict';

    window.ACDB = window.ACDB || {};
    const A = window.ACDB;

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

    // "9 Oct 2026", the format the reading view uses
    function formatDate(value) {
        return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function slugify(str) {
        return str.toLowerCase()
            .replace(/['']/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    // ---- "Read" links ----
    // Most entries' `read` field is a book path inside one Internet Archive
    // collection, stored unencoded exactly as the archive names the file
    // (e.g. "07. AC Templars/AC Templars 2016 (3)"). A value starting with
    // http(s):// is a complete link to some other source and is used as-is.
    const ARCHIVE_ITEM_URL = 'https://archive.org/details/assassins-creed-graphic-novels-and-comics-anthology/';

    function encodeArchivePath(path) {
        // encodeURIComponent leaves ( ) unescaped, but archive.org shows an
        // empty item page instead of the book unless they're %28 / %29.
        return path.split('/')
            .map(seg => encodeURIComponent(seg).replace(/\(/g, '%28').replace(/\)/g, '%29'))
            .join('/');
    }

    function readUrl(read) {
        if (!read) return null;
        if (/^https?:\/\//i.test(read)) return read;
        return ARCHIVE_ITEM_URL + encodeArchivePath(read) + '/mode/2up';
    }

    // Inverse of readUrl, for the dev tool: turns a reader URL copied from
    // the address bar back into a book path. Other input is returned trimmed.
    // While reading, the address grows a page and view mode
    // (".../page/n4/mode/2up"), so both are dropped along with any query.
    function readPathFromUrl(input) {
        const value = input.trim();
        if (!value.startsWith(ARCHIVE_ITEM_URL)) return value;
        const path = value.slice(ARCHIVE_ITEM_URL.length)
            .replace(/[?#].*$/, '')
            .replace(/\/mode\/[^/]*$/, '')
            .replace(/\/page\/[^/]*$/, '')
            .replace(/\/$/, '');
        try {
            return decodeURIComponent(path);
        } catch (e) {
            return path;
        }
    }

    // 'smooth', or 'auto' for visitors who asked for reduced motion (CSS
    // can't reach scrolls started from script).
    function scrollBehavior() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    }

    // kind: 'success' (green check), 'error' (red alert) or omitted (no icon).
    // The element is a polite live region in index.html, so screen readers
    // read the message.
    const TOAST_ICONS = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v5"/><path d="M12 16.5h.01"/></svg>'
    };
    let toastTimer = null;

    function showToast(message, kind) {
        let toast = document.getElementById('acdb-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'acdb-toast';
            toast.setAttribute('role', 'status');
            document.body.appendChild(toast);
        }
        const text = document.createElement('span');
        text.textContent = message;
        toast.innerHTML = TOAST_ICONS[kind] || '';
        toast.appendChild(text);
        toast.className = 'visible' + (kind ? ' toast-' + kind : '');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toast.classList.remove('visible'); }, kind === 'error' ? 4000 : 2500);
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

    // Story publications whose read status can be tracked. Art books, guides
    // and magazines are reference material, not lore to read through, so they
    // are left out on purpose.
    const READABLE_TYPES = new Set(['Novel', 'Comic Book', 'Graphic Novel', 'Manga', 'Gamebook']);

    function isReadable(item) {
        return READABLE_TYPES.has(item.type);
    }

    // ---- Dates and eras (reading orders and games) ----
    // Shows only what's known: "26 Nov 2009", "Nov 2009" or "2009".
    function formatReleased(entry) {
        if (entry.releasedPrecision === 'year') return entry.released.slice(0, 4);
        const parts = entry.releasedPrecision === 'month'
            ? { month: 'short', year: 'numeric' }
            : { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(entry.released + 'T00:00:00Z').toLocaleDateString('en-GB', { ...parts, timeZone: 'UTC' });
    }

    // The era heading for a story's start year (READING_ERAS in js/reading-orders.js)
    function eraOf(year) {
        const era = READING_ERAS.find(e => e.until === null || year < e.until);
        return era ? era.name : '';
    }

    // "431 BCE" or "1191"
    function yearLabel(year) {
        return year < 0 ? `${-year} BCE` : String(year);
    }

    // ---- Games (js/games.js) ----
    // The controller icon shown for a game or DLC without a cover
    const GAME_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M7.5 7h9a5 5 0 0 1 4.9 6l-.8 3.6a2.4 2.4 0 0 1-4.1 1.1L14.4 16H9.6l-2.1 1.7a2.4 2.4 0 0 1-4.1-1.1L2.6 13A5 5 0 0 1 7.5 7Zm-.5 3v1.5H5.5V13H7v1.5h1.5V13H10v-1.5H8.5V10H7Zm8.75 1.25a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm2-2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/></svg>';

    // A game's address on the Games tab: #games/<slug>, e.g. "assassins-creed-ii".
    // Accents are folded first ("altairs", not slugify's "alta-rs"); item
    // slugs keep slugify as is, since their share pages are already out there.
    function gameUrlSlug(game) {
        return slugify(game.name.normalize('NFD').replace(/[̀-ͯ]/g, ''));
    }

    function findGameBySlug(slug) {
        return GAMES.find(game => gameUrlSlug(game) === slug) || null;
    }

    // ---- Dialogs ----
    // Keeps Tab and Shift+Tab inside an open dialog. The dialog frame itself
    // (tabindex="-1") isn't in the cycle, so focus on it, or anywhere
    // outside the list, wraps to the first or last control. Returns a
    // function that releases the trap.
    const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function trapFocus(container) {
        function onKeydown(e) {
            if (e.key !== 'Tab') return;
            const controls = [...container.querySelectorAll(FOCUSABLE)]
                .filter(el => el.getClientRects().length > 0);
            if (controls.length === 0) {
                e.preventDefault();
                container.focus();
                return;
            }
            const first = controls[0];
            const last = controls[controls.length - 1];
            const at = controls.indexOf(document.activeElement);
            if (at === -1) {
                e.preventDefault();
                (e.shiftKey ? last : first).focus();
            } else if (e.shiftKey && at === 0) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && at === controls.length - 1) {
                e.preventDefault();
                first.focus();
            }
        }
        document.addEventListener('keydown', onKeydown);
        return () => document.removeEventListener('keydown', onKeydown);
    }

    // ---- Share links ----
    // Touch devices with the Web Share API get the native share sheet;
    // everywhere else the link is copied to the clipboard.
    const canWebShare = typeof navigator.share === 'function'
        && window.matchMedia('(pointer: coarse)').matches;

    function shareLink({ title, text, url }) {
        const copyLink = () => navigator.clipboard.writeText(url).then(() => showToast('Link copied!', 'success'));
        if (canWebShare) {
            navigator.share({ title, text, url })
                .catch(err => {
                    // AbortError = the sheet was dismissed; anything else
                    // (unsupported target, permission) falls back to copy.
                    if (!err || err.name !== 'AbortError') copyLink();
                });
        } else {
            copyLink();
        }
    }

    // Expose on namespace
    A.escapeHTML = escapeHTML;
    A.debounce = debounce;
    A.formatCondition = formatCondition;
    A.slugify = slugify;
    A.formatDate = formatDate;
    A.scrollBehavior = scrollBehavior;
    A.showToast = showToast;
    A.showCelebration = showCelebration;
    A.launchConfetti = launchConfetti;
    A.readUrl = readUrl;
    A.readPathFromUrl = readPathFromUrl;
    A.isReadable = isReadable;
    A.formatReleased = formatReleased;
    A.eraOf = eraOf;
    A.yearLabel = yearLabel;
    A.GAME_ICON = GAME_ICON;
    A.gameUrlSlug = gameUrlSlug;
    A.findGameBySlug = findGameBySlug;
    A.trapFocus = trapFocus;
    A.canWebShare = canWebShare;
    A.shareLink = shareLink;

})();
