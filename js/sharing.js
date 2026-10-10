/* ============================================
   ACDb - Sharing, Profile & Leaderboard
   ============================================ */

(function () {
    'use strict';

    window.ACDB = window.ACDB || {};
    const A = window.ACDB;

    let nameCheckTimer = null;
    let profileFromLeaderboard = false;

    // Shared profiles store owned items as permanent ids (sent as strings, which
    // the Worker accepts unchanged). Profiles uploaded before ids existed hold
    // item names; showProfile resolves both via A.findItemByRef.
    function getOwnedItemIds() {
        return AC_DATABASE.filter(item => {
            const data = A.getItemData(item.id);
            return data.owned;
        }).map(item => String(item.id));
    }

    // Two kinds of public profile: one linked to the signed-in account (it
    // follows the synced collection on its own), or the older kind owned by
    // an edit token in this browser and updated by hand.
    function hasLinkedProfile() {
        const account = A.isSignedIn() ? A.getAccount() : null;
        return !!(account && account.shareName);
    }

    function getShareName() {
        if (A.isSignedIn()) return (A.getAccount() || {}).shareName || null;
        return localStorage.getItem(A.SHARE_TOKEN_KEY) ? localStorage.getItem(A.SHARE_NAME_KEY) : null;
    }

    function isShared() {
        return !!getShareName();
    }

    // "Publish collection" sits in the header until the collection is
    // published; after that the profile is managed from the account menu.
    // An open leaderboard is redrawn so its invitation and rows stay current.
    function updateShareButton() {
        const shared = isShared();
        document.getElementById('shareBtn').hidden = shared;
        document.getElementById('accountProfile').hidden = !shared;
        if (document.getElementById('leaderboardView').style.display !== 'none') showLeaderboard();
    }

    function openShareModal() {
        const overlay = document.getElementById('shareModalOverlay');
        const formSection = document.getElementById('shareFormSection');
        const manageSection = document.getElementById('shareManageSection');
        const successSection = document.getElementById('shareSuccessSection');
        const nameInput = document.getElementById('shareDisplayName');
        const submitBtn = document.getElementById('shareSubmit');

        // Calculate preview stats
        const owned = getOwnedItemIds();
        const pct = Math.round((owned.length / AC_DATABASE.length) * 100) + '%';

        if (!isShared() && owned.length === 0) {
            A.showToast('Mark some items as owned before publishing!');
            return;
        }

        const linked = hasLinkedProfile();
        const title = document.getElementById('shareModalTitle');
        const subtitle = document.getElementById('shareModalSubtitle');

        if (isShared()) {
            // Manage mode — show update + delete options
            title.textContent = 'Your Public Profile';
            subtitle.textContent = linked
                ? 'Your profile updates automatically as your collection changes'
                : 'Your public page and your spot on the Leaderboard';
            formSection.style.display = 'none';
            successSection.style.display = 'none';
            manageSection.style.display = '';
            const name = getShareName();
            document.getElementById('shareUpdateBtn').hidden = linked;
            document.getElementById('shareAutoNote').hidden = !linked;
            document.getElementById('shareSignInHint').hidden = linked || !A.isSyncEnabled();
            document.getElementById('shareManageName').textContent = name;
            document.getElementById('shareManageOwned').textContent = owned.length;
            document.getElementById('shareManagePct').textContent = pct;
            document.getElementById('shareManageUrl').value = `https://acdb.theprivategeek.com/#profile/${name.toLowerCase()}`;
            document.getElementById('shareUpdateBtn').disabled = false;
            document.getElementById('shareUpdateBtn').textContent = 'Update Profile';
            document.getElementById('shareDeleteBtn').disabled = false;
            document.getElementById('shareDeleteBtn').textContent = 'Delete Profile';
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            return;
        }

        // Publish mode — show form
        title.textContent = 'Publish Your Collection';
        subtitle.textContent = A.isSignedIn()
            ? 'Get a public page to show friends, and a spot on the Leaderboard. It updates automatically as your collection changes.'
            : 'Get a public page to show friends, and a spot on the Leaderboard';
        document.getElementById('sharePreviewOwned').textContent = owned.length;
        document.getElementById('sharePreviewPct').textContent = pct;
        formSection.style.display = '';
        manageSection.style.display = 'none';
        successSection.style.display = 'none';
        nameInput.value = '';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Publish';
        document.getElementById('shareNameStatus').textContent = '';

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        nameInput.focus();
    }

    function closeShareModal() {
        document.getElementById('shareModalOverlay').classList.remove('active');
        document.body.style.overflow = '';
    }

    async function checkNameAvailability(name) {
        const status = document.getElementById('shareNameStatus');
        const submitBtn = document.getElementById('shareSubmit');

        if (name.length < 5) {
            status.textContent = name.length > 0 ? 'Minimum 5 characters' : '';
            status.style.color = 'var(--text-3)';
            submitBtn.disabled = true;
            return;
        }
        if (!/^[a-zA-Z0-9_-]{5,25}$/.test(name)) {
            status.textContent = 'Only letters, numbers, hyphens, underscores';
            status.style.color = 'var(--danger-solid)';
            submitBtn.disabled = true;
            return;
        }

        status.textContent = 'Checking...';
        status.style.color = 'var(--text-3)';

        try {
            const res = await fetch(`${A.API_URL}/check-name/${encodeURIComponent(name)}`);
            const data = await res.json();
            if (data.available) {
                status.textContent = 'Available!';
                status.style.color = 'var(--owned)';
                submitBtn.disabled = false;
            } else {
                status.textContent = 'Already taken';
                status.style.color = 'var(--danger-solid)';
                submitBtn.disabled = true;
            }
        } catch {
            status.textContent = 'Could not check. Try again.';
            status.style.color = 'var(--danger-solid)';
            submitBtn.disabled = true;
        }
    }

    async function performShare() {
        const nameInput = document.getElementById('shareDisplayName');
        const submitBtn = document.getElementById('shareSubmit');
        const displayName = nameInput.value.trim();

        if (!displayName || displayName.length < 5) {
            A.showToast('Please enter a valid display name', 'error');
            return;
        }

        const owned = getOwnedItemIds();

        submitBtn.disabled = true;
        submitBtn.textContent = 'Publishing...';

        try {
            // Signed in: the profile is linked to the account and the Worker
            // reads its items from the synced collection.
            const signedIn = A.isSignedIn();
            const request = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signedIn ? { displayName } : { displayName, ownedItems: owned })
            };
            const res = signedIn ? await A.authFetch('/share', request) : await fetch(`${A.API_URL}/share`, request);
            const data = await res.json();

            if (data.success) {
                if (signedIn) {
                    A.setShareName(data.displayName);
                } else {
                    localStorage.setItem(A.SHARE_TOKEN_KEY, data.token);
                    localStorage.setItem(A.SHARE_NAME_KEY, data.displayName);
                }

                // Show success
                document.getElementById('shareFormSection').style.display = 'none';
                document.getElementById('shareSuccessSection').style.display = '';
                document.getElementById('shareUrl').value = data.shareUrl;
                updateShareButton();
                A.showToast('Collection published!', 'success');
            } else {
                A.showToast(data.error || 'Publishing failed', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Publish';
            }
        } catch (err) {
            A.showToast('Error: ' + (err.message || 'Network error'), 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publish';
        }
    }

    async function performUpdate(owned) {
        const token = localStorage.getItem(A.SHARE_TOKEN_KEY);
        if (!token) return;

        const updateBtn = document.getElementById('shareUpdateBtn');
        updateBtn.disabled = true;
        updateBtn.textContent = 'Updating...';

        try {
            const res = await fetch(`${A.API_URL}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ ownedItems: owned })
            });
            const data = await res.json();

            if (data.success) {
                closeShareModal();
                A.showToast(`Profile updated: ${data.ownedCount} items.`, 'success');
            } else {
                A.showToast(data.error || 'Update failed', 'error');
                updateBtn.disabled = false;
                updateBtn.textContent = 'Update Profile';
            }
        } catch {
            A.showToast('Network error. Try again.', 'error');
            updateBtn.disabled = false;
            updateBtn.textContent = 'Update Profile';
        }
    }

    async function deleteProfile() {
        const linked = hasLinkedProfile();
        const token = localStorage.getItem(A.SHARE_TOKEN_KEY);
        if (!linked && !token) return;

        const deleteBtn = document.getElementById('shareDeleteBtn');
        deleteBtn.disabled = true;
        deleteBtn.textContent = 'Deleting...';

        try {
            const res = linked
                ? await A.authFetch('/profile', { method: 'DELETE' })
                : await fetch(`${A.API_URL}/profile`, { method: 'DELETE', headers: { 'Authorization': token } });
            const data = await res.json();

            if (data.success) {
                if (linked) {
                    A.setShareName(null);
                } else {
                    localStorage.removeItem(A.SHARE_TOKEN_KEY);
                    localStorage.removeItem(A.SHARE_NAME_KEY);
                }
                updateShareButton();
                closeShareModal();
                A.showToast('Profile deleted.', 'success');
            } else {
                A.showToast(data.error || 'Delete failed', 'error');
                deleteBtn.disabled = false;
                deleteBtn.textContent = 'Delete Profile';
            }
        } catch {
            A.showToast('Network error. Try again.', 'error');
            deleteBtn.disabled = false;
            deleteBtn.textContent = 'Delete Profile';
        }
    }

    // ---- Profile View ----
    // Highlight the header tab for the visible view (null: none, e.g. a profile).
    function setActiveNav(view) {
        document.querySelectorAll('.main-nav-link').forEach(link => {
            const active = link.dataset.view === view;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
    }

    function showMainContent() {
        setActiveNav('collection');
        document.querySelector('.toolbar').style.display = '';
        document.querySelector('.game-timeline').style.display = '';
        document.querySelector('.stats-dashboard').style.display = '';
        document.querySelector('.main-content').style.display = '';
        document.getElementById('profileView').style.display = 'none';
        document.getElementById('leaderboardView').style.display = 'none';
        document.getElementById('readingView').style.display = 'none';
        A.renderSyncBanner();
    }

    function hideMainContent(view = null) {
        setActiveNav(view);
        document.querySelector('.toolbar').style.display = 'none';
        document.querySelector('.game-timeline').style.display = 'none';
        document.querySelector('.stats-dashboard').style.display = 'none';
        document.querySelector('.main-content').style.display = 'none';
        A.renderSyncBanner();
    }

    async function showProfile(name, fromLeaderboard = false) {
        hideMainContent();
        document.getElementById('leaderboardView').style.display = 'none';
        document.getElementById('readingView').style.display = 'none';
        profileFromLeaderboard = fromLeaderboard;
        // The breadcrumb names where the visitor came from, like the old back button
        const backLink = document.getElementById('profileBackBtn');
        backLink.textContent = fromLeaderboard ? 'Leaderboard' : 'Collection';
        backLink.href = fromLeaderboard ? '#leaderboard' : './';
        const profileView = document.getElementById('profileView');
        profileView.style.display = '';
        document.getElementById('profileName').textContent = 'Loading...';
        document.getElementById('profileCrumbName').textContent = name;
        document.getElementById('profileOwned').textContent = '';
        document.getElementById('profilePct').textContent = '';
        document.getElementById('profileUpdated').textContent = '';
        document.getElementById('profileItemsGrid').innerHTML = '';

        try {
            const res = await fetch(`${A.API_URL}/profile/${encodeURIComponent(name)}`);
            if (!res.ok) {
                document.getElementById('profileName').textContent = 'Profile not found';
                return;
            }
            const data = await res.json();
            const pct = Math.round((data.ownedCount / AC_DATABASE.length) * 100);
            const updated = new Date(data.lastUpdated).toLocaleDateString();

            document.getElementById('profileName').textContent = data.displayName;
            document.getElementById('profileCrumbName').textContent = data.displayName;
            document.getElementById('profileOwned').textContent = `${data.ownedCount} items owned`;
            document.getElementById('profilePct').textContent = `${pct}% complete`;
            document.getElementById('profileUpdated').textContent = `Updated ${updated}`;

            // Render owned items as cards
            const grid = document.getElementById('profileItemsGrid');
            const fragment = document.createDocumentFragment();
            data.ownedItems.forEach(ref => {
                const item = A.findItemByRef(ref);
                if (item) {
                    const card = A.createCard(item);
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
        hideMainContent('leaderboard');
        document.getElementById('profileView').style.display = 'none';
        document.getElementById('readingView').style.display = 'none';
        const leaderboardView = document.getElementById('leaderboardView');
        leaderboardView.style.display = '';
        document.getElementById('leaderboardBody').innerHTML = '<tr><td colspan="5" class="leaderboard-loading">Loading leaderboard...</td></tr>';

        const ctaEl = document.getElementById('leaderboardCta');
        if (isShared()) {
            const name = getShareName();
            ctaEl.innerHTML = `You're on the board as <a class="link" href="#profile/${name.toLowerCase()}">${A.escapeHTML(name)}</a>`;
        } else {
            ctaEl.innerHTML = '<span>Want to be on here?</span><button class="btn btn-sm btn-publish" id="leaderboardShareLink">Join the Leaderboard</button>';
            document.getElementById('leaderboardShareLink').addEventListener('click', openShareModal);
        }

        try {
            const res = await fetch(`${A.API_URL}/leaderboard`);
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
                    <td class="rank-col"><span class="medal ${rankClass}">${rank}</span></td>
                    <td class="name-col"><a href="#profile/${profile.displayName.toLowerCase()}">${A.escapeHTML(profile.displayName)}</a></td>
                    <td class="count-col">${profile.ownedCount}<span class="lb-unit"> items</span></td>
                    <td class="pct-col">${pct}%</td>
                    <td class="date-col"><span class="lb-unit">Updated </span>${updated}</td>
                `;
                tbody.appendChild(tr);
            });

        } catch {
            document.getElementById('leaderboardBody').innerHTML = '<tr><td colspan="5" class="leaderboard-loading">Error loading leaderboard</td></tr>';
        }
    }

    // After signing in: link this browser's token-owned profile (if any) to
    // the account, so it follows the synced collection from now on.
    async function claimLegacyProfile() {
        const legacyToken = localStorage.getItem(A.SHARE_TOKEN_KEY);
        if (!legacyToken || !A.isSignedIn()) return;
        const legacyName = localStorage.getItem(A.SHARE_NAME_KEY);
        try {
            const res = await A.authFetch('/profile/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ legacyToken })
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success) {
                localStorage.removeItem(A.SHARE_TOKEN_KEY);
                localStorage.removeItem(A.SHARE_NAME_KEY);
                A.setShareName(data.displayName);
                A.showToast(`Your public profile ${data.displayName} now updates automatically.`, 'success');
            } else if (res.status === 404) {
                // The profile was deleted elsewhere; the token is useless now.
                localStorage.removeItem(A.SHARE_TOKEN_KEY);
                localStorage.removeItem(A.SHARE_NAME_KEY);
            } else if (data.code === 'has_profile') {
                // Keep the token so that profile can still be managed when signed out.
                A.setShareName(data.displayName);
                A.showToast(`This account already shares as ${data.displayName}. ${legacyName} wasn't changed.`);
            }
        } catch { /* try again on the next sign-in */ }
        updateShareButton();
    }

    // Expose on namespace
    A.claimLegacyProfile = claimLegacyProfile;
    A.getShareName = getShareName;
    A.getOwnedItemIds = getOwnedItemIds;
    A.isShared = isShared;
    A.updateShareButton = updateShareButton;
    A.openShareModal = openShareModal;
    A.closeShareModal = closeShareModal;
    A.checkNameAvailability = checkNameAvailability;
    A.performShare = performShare;
    A.performUpdate = performUpdate;
    A.deleteProfile = deleteProfile;
    A.showMainContent = showMainContent;
    A.hideMainContent = hideMainContent;
    A.showProfile = showProfile;
    A.showLeaderboard = showLeaderboard;
    A.nameCheckTimer = nameCheckTimer;
    A.getProfileFromLeaderboard = () => profileFromLeaderboard;

})();
