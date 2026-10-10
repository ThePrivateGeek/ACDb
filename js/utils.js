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

    // Expose on namespace
    A.escapeHTML = escapeHTML;
    A.debounce = debounce;
    A.formatCondition = formatCondition;
    A.slugify = slugify;
    A.scrollBehavior = scrollBehavior;
    A.showToast = showToast;
    A.showCelebration = showCelebration;
    A.launchConfetti = launchConfetti;
    A.readUrl = readUrl;
    A.readPathFromUrl = readPathFromUrl;
    A.isReadable = isReadable;

})();
