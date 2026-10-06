/* ============================================
   ACDb - Accounts (optional Google sign-in)
   ============================================ */

// Sign-in uses Google's OAuth 2.0 authorization code flow with PKCE as a
// plain page redirect: no Google script is loaded until the visitor clicks
// "Sign in". Google sends the browser back to the site with a one-time code,
// which the Worker exchanges for an ACDb session token (kept in LocalStorage
// and sent as a Bearer token). Syncing itself lives in sync.js.

(function () {
    'use strict';

    window.ACDB = window.ACDB || {};
    const A = window.ACDB;

    const GOOGLE_CLIENT_ID = '245537309826-6d8449qs9pp9mpl9bbppihsu41ausdub.apps.googleusercontent.com';
    const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

    const SESSION_KEY = 'acdb_session';
    const ACCOUNT_KEY = 'acdb_account';                  // {id, email, shareName}
    const REASON_KEY = 'acdb_signed_out_reason';         // 'expired' after the server rejected the session
    const BANNER_KEY = 'acdb_sync_banner_dismissed';
    const OAUTH_KEY = 'acdb_oauth';                      // sessionStorage, during the redirect

    const GOOGLE_G = '<svg class="google-g" viewBox="0 0 48 48" aria-hidden="true">'
        + '<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>'
        + '<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>'
        + '<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>'
        + '<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>'
        + '</svg>';

    // ---- Storage helpers (LocalStorage can be blocked or full) ----
    const store = {
        get(key) {
            try { return localStorage.getItem(key); } catch { return null; }
        },
        set(key, value) {
            try { localStorage.setItem(key, value); } catch { /* ignore */ }
        },
        remove(key) {
            try { localStorage.removeItem(key); } catch { /* ignore */ }
        }
    };

    function storageWorks() {
        try {
            localStorage.setItem('acdb_storage_test', '1');
            localStorage.removeItem('acdb_storage_test');
            return true;
        } catch {
            return false;
        }
    }

    // Hidden where it can't work: storage blocked, or no WebCrypto (very old
    // browsers, or pages not served over https/localhost).
    function isSyncEnabled() {
        return storageWorks() && !!(window.crypto && crypto.subtle && window.TextEncoder);
    }

    function getSessionToken() {
        return store.get(SESSION_KEY);
    }

    function isSignedIn() {
        return !!getSessionToken() && !!getAccount();
    }

    function getAccount() {
        try {
            const account = JSON.parse(store.get(ACCOUNT_KEY));
            return account && account.id ? account : null;
        } catch {
            return null;
        }
    }

    function saveAccount(account) {
        store.set(ACCOUNT_KEY, JSON.stringify(account));
    }

    function setShareName(shareName) {
        const account = getAccount();
        if (!account) return;
        account.shareName = shareName || null;
        saveAccount(account);
    }

    function clearSignedInState() {
        store.remove(SESSION_KEY);
        store.remove(ACCOUNT_KEY);
        store.remove(REASON_KEY);
    }

    // ---- API calls with the session ----
    async function authFetch(path, options = {}) {
        const session = getSessionToken();
        if (!session) {
            const err = new Error('Not signed in');
            err.status = 401;
            throw err;
        }
        const headers = { ...(options.headers || {}), 'Authorization': 'Bearer ' + session };
        const res = await fetch(A.API_URL + path, { ...options, headers });
        if (res.status === 401) handleSessionExpired();
        return res;
    }

    // ---- PKCE helpers ----
    function base64Url(bytes) {
        let binary = '';
        new Uint8Array(bytes).forEach(b => { binary += String.fromCharCode(b); });
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    function randomBase64Url(byteCount) {
        const bytes = new Uint8Array(byteCount);
        crypto.getRandomValues(bytes);
        return base64Url(bytes);
    }

    function redirectUri() {
        return location.origin + '/';
    }

    // ---- Sign-in ----
    async function beginSignIn() {
        const verifier = randomBase64Url(32);
        const challenge = base64Url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
        const state = randomBase64Url(16);
        try {
            sessionStorage.setItem(OAUTH_KEY, JSON.stringify({ state, verifier, returnHash: location.hash }));
        } catch {
            A.showToast('Sign-in needs browser storage, which is blocked here.');
            return;
        }
        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: redirectUri(),
            response_type: 'code',
            scope: 'openid email',
            state,
            code_challenge: challenge,
            code_challenge_method: 'S256',
            prompt: 'select_account'
        });
        location.assign(GOOGLE_AUTH_URL + '?' + params.toString());
    }

    let pendingCode = null;        // {code, verifier} from Google's redirect
    let redirectMessage = null;    // toast to show once the page is up

    // Runs first thing in init(), before hash routing: takes ?code=/?error=
    // off the address bar and puts back the hash the visitor left from.
    function consumeAuthRedirect() {
        const params = new URLSearchParams(location.search);
        if (!params.has('code') && !params.has('error')) return;

        let saved = null;
        try {
            saved = JSON.parse(sessionStorage.getItem(OAUTH_KEY));
            sessionStorage.removeItem(OAUTH_KEY);
        } catch { /* treated as a failed sign-in below */ }

        history.replaceState(null, '', location.pathname + ((saved && saved.returnHash) || ''));

        if (params.has('error')) {
            redirectMessage = params.get('error') === 'access_denied' ? 'Sign-in cancelled' : 'Sign-in failed. Please try again.';
            return;
        }
        if (!saved || params.get('state') !== saved.state) {
            redirectMessage = 'Sign-in failed. Please try again.';
            return;
        }
        pendingCode = { code: params.get('code'), verifier: saved.verifier };
    }

    async function completeSignIn() {
        const { code, verifier } = pendingCode;
        pendingCode = null;
        setButtonBusy(true);
        try {
            const res = await fetch(A.API_URL + '/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, codeVerifier: verifier, redirectUri: redirectUri() })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.session) {
                A.showToast(data.error || 'Sign-in failed. Please try again.');
                return;
            }
            store.set(SESSION_KEY, data.session);
            saveAccount({ id: data.account.id, email: data.account.email, shareName: data.share ? data.share.displayName : null });
            store.remove(REASON_KEY);
        } catch {
            A.showToast('Network error. Sign-in failed.');
            return;
        } finally {
            setButtonBusy(false);
        }

        renderAccountUI();
        A.updateShareButton();
        const stats = await A.startSync();
        const email = getAccount() ? getAccount().email : '';
        if (stats && stats.replacedOtherAccount) {
            A.showToast(`Loaded ${email}'s collection.`);
        } else {
            A.showToast(`Signed in as ${email}. Your collection is synced.`);
        }
        if (A.claimLegacyProfile) A.claimLegacyProfile();
    }

    // The server no longer accepts the session (expired or revoked). Keep
    // the collection and its unsent edits: signing in again picks them up.
    let expiredNoticeShown = false;
    function handleSessionExpired() {
        if (!getSessionToken()) return;
        store.remove(SESSION_KEY);
        store.remove(ACCOUNT_KEY);
        store.set(REASON_KEY, 'expired');
        A.stopSync();
        renderAccountUI();
        A.updateShareButton();
        if (!expiredNoticeShown) {
            expiredNoticeShown = true;
            A.showToast("You've been signed out. Sign in again to keep syncing.");
        }
    }

    // ---- Sign-out / account ----
    async function signOut() {
        closeAccountMenu();
        const unsent = await A.flushSync({ timeoutMs: 5000 });
        if (unsent > 0 && !confirm(`${unsent} change${unsent === 1 ? '' : 's'} haven't reached your account yet (you seem to be offline).\n\nSign out anyway and lose ${unsent === 1 ? 'it' : 'them'}?`)) {
            return;
        }
        try {
            await authFetch('/auth/logout', { method: 'POST' });
        } catch { /* the session expires on its own */ }

        // Signing out clears this browser's copy: it's safe in the account,
        // and the next person on a shared computer shouldn't see it.
        clearSignedInState();
        A.resetSync();
        store.remove('acdb_collection');   // pre-id backup (see app.js), already in the account
        A.setCollection({});
        A.saveCollection();
        A.renderItems();
        A.updateShareButton();
        renderAccountUI();
        A.showToast('Signed out. Your collection is safe in your account.');
    }

    async function deleteAccount() {
        closeAccountMenu();
        const account = getAccount();
        if (!account) return;
        const profileNote = account.shareName ? ` and your public profile "${account.shareName}"` : '';
        if (!confirm(`Delete your ACDb account?\n\nYour collection${profileNote} will be removed from ACDb's servers for good. This browser keeps its copy of your collection.`)) {
            return;
        }
        try {
            const res = await authFetch('/account', { method: 'DELETE' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
        } catch {
            A.showToast("Couldn't delete the account. Try again.");
            return;
        }
        clearSignedInState();
        A.resetSync();
        A.updateShareButton();
        renderAccountUI();
        A.showToast('Account deleted. Your collection is still in this browser.');
    }

    async function downloadAccountData() {
        closeAccountMenu();
        try {
            const res = await authFetch('/account/export');
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const blob = await res.blob();
            const match = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') || '');
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = match ? match[1] : 'acdb-account.json';
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            A.showToast("Couldn't download your data. Try again.");
        }
    }

    // ---- UI ----
    function el(id) {
        return document.getElementById(id);
    }

    function setButtonBusy(busy) {
        const btn = el('accountBtn');
        if (btn) btn.disabled = busy;
    }

    function isAccountMenuOpen() {
        const menu = el('accountMenu');
        return !!menu && !menu.hidden;
    }

    function closeAccountMenu() {
        const menu = el('accountMenu');
        if (!menu || menu.hidden) return;
        menu.hidden = true;
        el('accountBtn').setAttribute('aria-expanded', 'false');
    }

    function toggleAccountMenu() {
        const menu = el('accountMenu');
        const open = menu.hidden;
        menu.hidden = !open;
        el('accountBtn').setAttribute('aria-expanded', String(open));
        if (open) A.renderSyncStatus(A.getSyncStatus(), { pending: A.getPendingCount() });
    }

    function renderAccountUI() {
        const control = el('accountControl');
        if (!control) return;
        if (!isSyncEnabled()) {
            control.hidden = true;
            renderSyncBanner();
            return;
        }
        control.hidden = false;
        const btn = el('accountBtn');
        const account = isSignedIn() ? getAccount() : null;
        if (account) {
            const initial = A.escapeHTML((account.email || '?').charAt(0).toUpperCase());
            btn.innerHTML = `<span class="account-avatar">${initial}<span class="sync-dot" id="syncDot"></span></span><span>Account</span>`;
            btn.title = `Signed in as ${account.email}`;
            btn.setAttribute('aria-haspopup', 'menu');
            el('accountMenuEmail').textContent = account.email;
        } else {
            btn.innerHTML = `${GOOGLE_G}<span>Sign in</span>`;
            btn.title = 'Sign in with Google to see your collection on any device';
            btn.removeAttribute('aria-haspopup');
            closeAccountMenu();
        }
        renderSyncBanner();
        renderSyncStatus(A.getSyncStatus ? A.getSyncStatus() : 'idle', {});
    }

    function renderSyncStatus(status, info) {
        const dot = el('syncDot');
        if (dot) dot.className = 'sync-dot is-' + status;
        const text = el('accountMenuStatus');
        if (!text) return;
        const pending = info && Number.isFinite(info.pending) ? info.pending : 0;
        const plural = pending === 1 ? 'change' : 'changes';
        text.textContent = {
            synced: 'All changes saved to your account',
            syncing: 'Saving…',
            pending: pending ? `Offline: ${pending} ${plural} will sync when you're back online` : "Offline: changes will sync when you're back online",
            error: "Couldn't reach ACDb. Retrying…",
            idle: 'Connecting…'
        }[status] || '';
    }

    function ownedCount() {
        const collection = A.getCollection ? A.getCollection() : {};
        return Object.values(collection).filter(d => d && d.owned).length;
    }

    // Shown to signed-out visitors once they own something (until dismissed),
    // and always after the server ended a session.
    function renderSyncBanner() {
        const banner = el('syncBanner');
        if (!banner) return;
        const mainVisible = document.querySelector('.main-content').style.display !== 'none';
        const expired = store.get(REASON_KEY) === 'expired';
        const show = isSyncEnabled() && !isSignedIn() && mainVisible
            && (expired || (ownedCount() > 0 && store.get(BANNER_KEY) !== '1'));
        banner.hidden = !show;
        if (!show) return;
        el('syncBannerText').textContent = expired
            ? "You've been signed out of ACDb. Sign in again to keep your collection in sync."
            : 'Your collection is saved in this browser only. Sign in with Google to see it on any device.';
        el('syncBannerClose').hidden = expired;
    }

    function initAuth() {
        const btn = el('accountBtn');
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isSignedIn()) toggleAccountMenu();
            else beginSignIn();
        });
        el('syncBannerSignIn').addEventListener('click', beginSignIn);
        el('shareSignInLink').addEventListener('click', (e) => {
            e.preventDefault();
            beginSignIn();
        });
        el('syncBannerClose').addEventListener('click', () => {
            store.set(BANNER_KEY, '1');
            renderSyncBanner();
        });
        el('accountExport').addEventListener('click', downloadAccountData);
        el('accountSignOut').addEventListener('click', signOut);
        el('accountDelete').addEventListener('click', deleteAccount);
        el('mergeBackupLink').addEventListener('click', (e) => {
            e.preventDefault();
            A.exportCollection();
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#accountControl')) closeAccountMenu();
        });

        // Another tab signed in or out.
        window.addEventListener('storage', (e) => {
            if (e.key !== SESSION_KEY && e.key !== ACCOUNT_KEY) return;
            renderAccountUI();
            A.updateShareButton();
            if (isSignedIn()) A.startSync();
            else A.stopSync();
        });

        renderAccountUI();
        if (redirectMessage) A.showToast(redirectMessage);
        if (!isSyncEnabled()) return;
        if (pendingCode) completeSignIn();
        else if (isSignedIn()) A.startSync();
    }

    // Expose on namespace
    A.isSyncEnabled = isSyncEnabled;
    A.isSignedIn = isSignedIn;
    A.getAccount = getAccount;
    A.setShareName = setShareName;
    A.getSessionToken = getSessionToken;
    A.authFetch = authFetch;
    A.beginSignIn = beginSignIn;
    A.consumeAuthRedirect = consumeAuthRedirect;
    A.handleSessionExpired = handleSessionExpired;
    A.renderAccountUI = renderAccountUI;
    A.renderSyncStatus = renderSyncStatus;
    A.renderSyncBanner = renderSyncBanner;
    A.isAccountMenuOpen = isAccountMenuOpen;
    A.closeAccountMenu = closeAccountMenu;
    A.initAuth = initAuth;

})();
