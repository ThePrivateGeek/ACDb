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

    // Expose on namespace
    A.escapeHTML = escapeHTML;
    A.debounce = debounce;
    A.formatCondition = formatCondition;
    A.slugify = slugify;
    A.showToast = showToast;
    A.showCelebration = showCelebration;
    A.launchConfetti = launchConfetti;
    A.readUrl = readUrl;
    A.readPathFromUrl = readPathFromUrl;

})();
