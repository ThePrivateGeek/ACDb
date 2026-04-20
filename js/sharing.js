/* ============================================
   ACDb - Sharing, Profile & Leaderboard
   ============================================ */

(function () {
    'use strict';

    window.ACDB = window.ACDB || {};
    const A = window.ACDB;

    let nameCheckTimer = null;
    let profileFromLeaderboard = false;

    function getOwnedItemNames() {
        return AC_DATABASE.filter(item => {
            const data = A.getItemData(item.id);
            return data.owned;
        }).map(item => item.name);
    }

    function isShared() {
        return !!localStorage.getItem(A.SHARE_TOKEN_KEY);
    }

    function updateShareButton() {
        const text = document.getElementById('shareBtnText');
        if (isShared()) {
            text.textContent = 'Update';
            document.getElementById('shareBtn').title = 'Update your shared collection';
        } else {
            text.textContent = 'Share';
            document.getElementById('shareBtn').title = 'Share your collection with the community';
        }
    }

    function openShareModal() {
        const overlay = document.getElementById('shareModalOverlay');
        const formSection = document.getElementById('shareFormSection');
        const manageSection = document.getElementById('shareManageSection');
        const successSection = document.getElementById('shareSuccessSection');
        const nameInput = document.getElementById('shareDisplayName');
        const submitBtn = document.getElementById('shareSubmit');

        // Calculate preview stats
        const owned = getOwnedItemNames();
        const pct = Math.round((owned.length / AC_DATABASE.length) * 100) + '%';

        if (!isShared() && owned.length === 0) {
            A.showToast('Mark some items as owned before sharing!');
            return;
        }

        if (isShared()) {
            // Manage mode — show update + delete options
            formSection.style.display = 'none';
            successSection.style.display = 'none';
            manageSection.style.display = '';
            const name = localStorage.getItem(A.SHARE_NAME_KEY);
            document.getElementById('shareManageName').textContent = name;
            document.getElementById('shareManageOwned').textContent = owned.length;
            document.getElementById('shareManagePct').textContent = pct;
            document.getElementById('shareManageUrl').value = `https://acdb.theprivategeek.com/#profile/${name.toLowerCase()}`;
            document.getElementById('shareUpdateBtn').disabled = false;
            document.getElementById('shareUpdateBtn').textContent = 'Update Collection';
            document.getElementById('shareDeleteBtn').disabled = false;
            document.getElementById('shareDeleteBtn').textContent = 'Delete Profile';
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            return;
        }

        // Share mode — show form
        document.getElementById('sharePreviewOwned').textContent = owned.length;
        document.getElementById('sharePreviewPct').textContent = pct;
        formSection.style.display = '';
        manageSection.style.display = 'none';
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
            const res = await fetch(`${A.API_URL}/check-name/${encodeURIComponent(name)}`);
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

        if (!displayName || displayName.length < 5) {
            A.showToast('Please enter a valid display name');
            return;
        }

        const owned = getOwnedItemNames();

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sharing...';

        try {
            const res = await fetch(`${A.API_URL}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName, ownedItems: owned })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem(A.SHARE_TOKEN_KEY, data.token);
                localStorage.setItem(A.SHARE_NAME_KEY, data.displayName);

                // Show success
                document.getElementById('shareFormSection').style.display = 'none';
                document.getElementById('shareSuccessSection').style.display = '';
                document.getElementById('shareUrl').value = data.shareUrl;
                updateShareButton();
                A.showToast('Collection shared successfully!');
            } else {
                A.showToast(data.error || 'Share failed');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Share Collection';
            }
        } catch (err) {
            A.showToast('Error: ' + (err.message || 'Network error'));
            submitBtn.disabled = false;
            submitBtn.textContent = 'Share Collection';
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
                A.showToast(`Collection updated! ${data.ownedCount} items shared.`);
            } else {
                A.showToast(data.error || 'Update failed');
                updateBtn.disabled = false;
                updateBtn.textContent = 'Update Collection';
            }
        } catch {
            A.showToast('Network error. Try again.');
            updateBtn.disabled = false;
            updateBtn.textContent = 'Update Collection';
        }
    }

    async function deleteProfile() {
        const token = localStorage.getItem(A.SHARE_TOKEN_KEY);
        if (!token) return;

        const deleteBtn = document.getElementById('shareDeleteBtn');
        deleteBtn.disabled = true;
        deleteBtn.textContent = 'Deleting...';

        try {
            const res = await fetch(`${A.API_URL}/profile`, {
                method: 'DELETE',
                headers: { 'Authorization': token }
            });
            const data = await res.json();

            if (data.success) {
                localStorage.removeItem(A.SHARE_TOKEN_KEY);
                localStorage.removeItem(A.SHARE_NAME_KEY);
                updateShareButton();
                closeShareModal();
                A.showToast('Profile deleted.');
            } else {
                A.showToast(data.error || 'Delete failed');
                deleteBtn.disabled = false;
                deleteBtn.textContent = 'Delete Profile';
            }
        } catch {
            A.showToast('Network error. Try again.');
            deleteBtn.disabled = false;
            deleteBtn.textContent = 'Delete Profile';
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

    async function showProfile(name, fromLeaderboard = false) {
        hideMainContent();
        document.getElementById('leaderboardView').style.display = 'none';
        profileFromLeaderboard = fromLeaderboard;
        const backBtn = document.getElementById('profileBackBtn');
        backBtn.textContent = fromLeaderboard ? 'Back to Leaderboard' : 'Back to Database';
        const profileView = document.getElementById('profileView');
        profileView.style.display = '';
        document.getElementById('profileName').textContent = 'Loading...';
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
            document.getElementById('profileOwned').textContent = `${data.ownedCount} items owned`;
            document.getElementById('profilePct').textContent = `${pct}% complete`;
            document.getElementById('profileUpdated').textContent = `Updated ${updated}`;

            // Render owned items as cards
            const grid = document.getElementById('profileItemsGrid');
            const fragment = document.createDocumentFragment();
            data.ownedItems.forEach(itemName => {
                const item = AC_DATABASE.find(i => i.name === itemName);
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
        hideMainContent();
        document.getElementById('profileView').style.display = 'none';
        const leaderboardView = document.getElementById('leaderboardView');
        leaderboardView.style.display = '';
        document.getElementById('leaderboardBody').innerHTML = '<tr><td colspan="5" class="leaderboard-loading">Loading leaderboard...</td></tr>';

        const ctaEl = document.getElementById('leaderboardCta');
        if (isShared()) {
            const name = localStorage.getItem(A.SHARE_NAME_KEY);
            ctaEl.innerHTML = `You're on the board as <a href="#profile/${name.toLowerCase()}">${name}</a>`;
        } else {
            ctaEl.innerHTML = 'Want to join? <a href="#" id="leaderboardShareLink">Share your collection</a> to appear on the leaderboard!';
            document.getElementById('leaderboardShareLink').addEventListener('click', (e) => {
                e.preventDefault();
                showMainContent();
                A.clearHash();
                openShareModal();
            });
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
                    <td class="rank-col ${rankClass}">${rank}</td>
                    <td class="name-col"><a href="#profile/${profile.displayName.toLowerCase()}">${A.escapeHTML(profile.displayName)}</a></td>
                    <td class="count-col">${profile.ownedCount}</td>
                    <td class="pct-col">${pct}%</td>
                    <td class="date-col">${updated}</td>
                `;
                tbody.appendChild(tr);
            });

        } catch {
            document.getElementById('leaderboardBody').innerHTML = '<tr><td colspan="5" class="leaderboard-loading">Error loading leaderboard</td></tr>';
        }
    }

    // Expose on namespace
    A.getOwnedItemNames = getOwnedItemNames;
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
