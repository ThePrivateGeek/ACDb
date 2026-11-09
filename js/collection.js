/* ============================================
   ACDb - Collection Export / Import
   ============================================ */

(function () {
    'use strict';

    window.ACDB = window.ACDB || {};
    const A = window.ACDB;

    // An item is in Back up to file and the spreadsheet when it has any data
    function hasAnyData(data) {
        return !!(data.owned || data.wishlist || data.hasBox || data.condition || data.copies > 0 || data.notes || data.pricePaid || data.acquiredDate || data.hasRead);
    }

    // "2026-11-09", for file names
    function fileDate() {
        return new Date().toISOString().slice(0, 10);
    }

    // Saves text as a file through a temporary download link
    function downloadText(filename, type, text) {
        const blob = new Blob([text], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ---- Spreadsheet export ----
    // Two formats, because Excel reads a CSV by the computer's regional
    // settings: 'comma' (cells split by commas, 1234.56) for Google Sheets
    // and English Excel, 'semicolon' (cells split by semicolons, 1234,56)
    // for Excel where numbers are written 1 234,56.
    const CSV_FORMATS = {
        comma: { delimiter: ',', decimal: '.' },
        semicolon: { delimiter: ';', decimal: ',' }
    };
    const CSV_COLUMNS = ['ID', 'Name', 'Game', 'Year', 'Category', 'Type', 'Series', 'Owned', 'Wishlist',
        'Copies', 'Condition', 'Original box', 'Price paid', 'Acquired', 'Read', 'Finished reading', 'Notes'];

    // One cell. Text that a spreadsheet would run as a formula (it starts
    // with = + - @, a tab or a return) gets a leading apostrophe, and a cell
    // holding the delimiter, a quote or a line break is quoted. Numbers pass
    // through untouched.
    function csvCell(value, delimiter) {
        if (typeof value === 'number') return String(value);
        let text = value == null ? '' : String(value);
        if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
        return text.includes(delimiter) || /["\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
    }

    // A price as a plain number in the file's decimal style, so the column
    // adds up; anything that isn't a price (priceCents) stays as text.
    function csvPrice(pricePaid, decimal) {
        const cents = A.priceCents(pricePaid);
        if (cents === null) return pricePaid || '';
        return { number: String(cents / 100).replace('.', decimal) };
    }

    const yesNo = flag => (flag ? 'yes' : 'no');

    // The whole file as text: a header row, then one row per item that has
    // any data (the rule Back up to file uses), in catalog order. Lines end
    // in CRLF, as the CSV format and Excel expect.
    function buildCSV(items, getData, format) {
        const { delimiter, decimal } = CSV_FORMATS[format] || CSV_FORMATS.comma;
        const rows = [CSV_COLUMNS];
        items.forEach(item => {
            const data = getData(item.id);
            if (!hasAnyData(data)) return;
            const readable = A.isReadable(item);
            rows.push([
                item.id, item.name, item.game, item.year, item.category, item.type, item.series || '',
                yesNo(data.owned), yesNo(data.wishlist), data.copies || 0,
                A.formatCondition(data.condition || ''), yesNo(data.hasBox),
                csvPrice(data.pricePaid, decimal), data.acquiredDate || '',
                readable ? yesNo(data.hasRead) : '', readable ? data.readDate || '' : '',
                data.notes || ''
            ]);
        });
        return rows.map(row => row.map(cell =>
            (cell && cell.number !== undefined ? cell.number : csvCell(cell, delimiter))
        ).join(delimiter)).join('\r\n') + '\r\n';
    }

    // The spreadsheet format last used: a view preference kept in this
    // browser only. The first guess follows how the browser writes numbers.
    const CSV_FORMAT_KEY = 'acdb_csv_format';

    function getCsvFormat() {
        const saved = A.store.get(CSV_FORMAT_KEY);
        if (Object.prototype.hasOwnProperty.call(CSV_FORMATS, saved)) return saved;
        return new Intl.NumberFormat().format(1.5).includes(',') ? 'semicolon' : 'comma';
    }

    function countWithData() {
        return AC_DATABASE.filter(item => hasAnyData(A.getItemData(item.id))).length;
    }

    // Account menu → Export as spreadsheet… opens a dialog for the format.
    // The menu has closed by the time it opens, so focus goes back to the
    // account button on close.
    let releaseExportFocus = null;

    function isExportModalOpen() {
        return document.getElementById('exportModalOverlay').classList.contains('active');
    }

    function openExportModal() {
        if (countWithData() === 0) {
            A.showToast('Nothing to export yet. Mark some items as owned first.');
            return;
        }
        document.getElementById('exportFormat').value = getCsvFormat();
        document.getElementById('exportModalOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
        document.getElementById('exportModalClose').focus();
        releaseExportFocus = A.trapFocus(document.getElementById('exportModal'));
    }

    function closeExportModal() {
        if (!isExportModalOpen()) return;
        document.getElementById('exportModalOverlay').classList.remove('active');
        document.body.style.overflow = '';
        if (releaseExportFocus) releaseExportFocus();
        releaseExportFocus = null;
        document.getElementById('accountBtn').focus();
    }

    // The byte order mark at the start tells Excel the file is UTF-8, so
    // accents survive ("Altaïr")
    function downloadCSV() {
        const format = document.getElementById('exportFormat').value;
        A.store.set(CSV_FORMAT_KEY, format);
        const count = countWithData();
        downloadText(`acdb-collection-${fileDate()}.csv`, 'text/csv;charset=utf-8',
            '﻿' + buildCSV(AC_DATABASE, A.getItemData, format));
        closeExportModal();
        A.showToast(`Exported ${countText(count, 'item', 'items')} as a spreadsheet`, 'success');
    }

    // ---- Printed inventory ----
    // Account menu → Print inventory: the owned items on paper, by game in
    // release order, then by name, with the cards' small photos and a totals
    // line. Notes stay off paper. The list is built into #printInventory
    // just before printing and emptied after; the print rules in style.css
    // show it only while <body> has .printing-inventory, so printing any
    // other page is unchanged.
    const PHOTO_WAIT_MS = 10000;
    const PREPARING_TOAST_MS = 500;
    let preparingPrint = false;

    // A stored day ("2026-10-09") as "9 Oct 2026", read as local midnight
    // so it doesn't show the day before west of Greenwich
    const formatDay = day => A.formatDate(day + 'T00:00:00');

    function clearPrintout() {
        document.body.classList.remove('printing-inventory');
        document.getElementById('printInventory').innerHTML = '';
    }

    function inventoryHTML(items) {
        const esc = A.escapeHTML;
        let copies = 0;
        let priced = 0;
        let paidCents = 0;
        const rows = items.map(item => {
            const data = A.getItemData(item.id);
            copies += data.copies || 1;
            const cents = A.priceCents(data.pricePaid);
            if (cents !== null) {
                priced++;
                paidCents += cents;
            }
            const photo = Array.isArray(item.image) && item.image.length > 0 ? item.image[0] : null;
            return `<tr>
                <td>${photo ? `<img ${A.thumbSrcAttrs(photo)} alt="">` : ''}</td>
                <td><span class="print-name">${esc(item.name)}</span><span class="print-sub">${esc(`${item.game} · ${item.year} · ${item.category}`)}</span></td>
                <td>${esc(A.formatCondition(data.condition || ''))}</td>
                <td>${data.hasBox ? 'Yes' : ''}</td>
                <td class="print-figure">${data.copies || 1}</td>
                <td class="print-figure">${cents === null ? '' : esc(A.formatAmount(cents))}</td>
                <td class="print-figure">${data.acquiredDate ? esc(formatDay(data.acquiredDate)) : ''}</td>
            </tr>`;
        }).join('');
        const summary = [countText(items.length, 'item', 'items'), countText(copies, 'copy', 'copies')];
        if (priced > 0) summary.push(`${A.formatAmount(paidCents)} paid for the ${countText(priced, 'item', 'items')} with a price`);
        return `
            <h1 class="print-title">My Assassin's Creed collection</h1>
            <p class="print-meta">Printed ${esc(A.formatDate(new Date()))} · acdb.theprivategeek.com</p>
            <p class="print-summary">${esc(summary.join(' · '))}</p>
            <table class="print-table">
                <thead><tr>
                    <th class="print-col-photo">Photo</th>
                    <th>Item</th>
                    <th class="print-col-condition">Condition</th>
                    <th class="print-col-box">Box</th>
                    <th class="print-figure print-col-copies">Copies</th>
                    <th class="print-figure print-col-paid">Paid</th>
                    <th class="print-figure print-col-acquired">Acquired</th>
                </tr></thead>
                <tbody>${rows}</tbody>
            </table>`;
    }

    // Settles when the photo has loaded or failed for good: a missing small
    // copy falls back to the full image first (loadFullImage)
    function photoReady(img) {
        return new Promise(resolve => {
            if (img.complete && img.naturalWidth > 0) {
                resolve();
                return;
            }
            img.addEventListener('load', resolve);
            img.addEventListener('error', () => {
                if (!A.loadFullImage(img)) resolve();
            });
        });
    }

    async function printInventory() {
        if (preparingPrint) return;
        clearPrintout();   // in case a browser fired no afterprint last time
        const order = A.GAME_ORDER;
        const rank = game => (order.includes(game) ? order.indexOf(game) : order.length);
        const items = AC_DATABASE.filter(item => A.getItemData(item.id).owned)
            .sort((a, b) => rank(a.game) - rank(b.game) || a.name.localeCompare(b.name));
        if (items.length === 0) {
            A.showToast('Nothing to print yet. Mark some items as owned first.');
            return;
        }
        preparingPrint = true;
        const section = document.getElementById('printInventory');
        section.innerHTML = inventoryHTML(items);

        // Wait for the photos, at most PHOTO_WAIT_MS; then print what arrived
        const photos = Promise.all([...section.querySelectorAll('img')].map(photoReady));
        const toastTimer = setTimeout(() => A.showToast('Preparing your inventory…'), PREPARING_TOAST_MS);
        await Promise.race([photos, new Promise(resolve => setTimeout(resolve, PHOTO_WAIT_MS))]);
        clearTimeout(toastTimer);
        preparingPrint = false;

        document.body.classList.add('printing-inventory');
        window.addEventListener('afterprint', clearPrintout, { once: true });
        window.print();
    }

    // Back up to file writes {items, games}: the collection's entries and
    // the played games and DLCs. Each game entry carries its name (and its
    // game's, for a DLC) so the file reads well; the id is what restores it.
    function exportCollection() {
        const items = [];
        AC_DATABASE.forEach(item => {
            const data = A.getItemData(item.id);
            if (hasAnyData(data)) {
                items.push({
                    id: item.id,
                    name: item.name,
                    game: item.game,
                    owned: data.owned || false,
                    wishlist: data.wishlist || false,
                    hasBox: data.hasBox || false,
                    condition: data.condition || '',
                    copies: data.copies || 0,
                    pricePaid: data.pricePaid || '',
                    acquiredDate: data.acquiredDate || '',
                    notes: data.notes || '',
                    hasRead: data.hasRead || false,
                    readDate: data.readDate || ''
                });
            }
        });
        const games = [];
        GAMES.forEach(game => [game, ...game.dlcs].forEach(entry => {
            const data = A.getGameProgress(entry.id);
            if (!data.played) return;
            games.push({
                id: entry.id,
                name: entry.name,
                ...(entry === game ? {} : { game: game.name }),
                played: true,
                playedDate: data.playedDate
            });
        }));

        downloadText(`acdb-collection-${fileDate()}.json`, 'application/json', JSON.stringify({ items, games }, null, 2));
        A.showToast(`Exported ${countText(items.length, 'item', 'items')}${games.length ? ` and ${countText(games.length, 'game', 'games')}` : ''}`, 'success');
    }

    function countText(n, one, many) {
        return `${n} ${n === 1 ? one : many}`;
    }

    // Back up to file writes {items, games}; older backups are a plain list
    // of item entries. Download all account data has the same `items` and
    // `games`. Returns { items, games } or null.
    function importEntries(text) {
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch {
            return null;
        }
        if (Array.isArray(parsed)) return { items: parsed, games: [] };
        if (parsed && Array.isArray(parsed.items)) {
            return { items: parsed.items, games: Array.isArray(parsed.games) ? parsed.games : [] };
        }
        return null;
    }

    // Works out every change before saving any, so a bad entry can't leave a
    // half-done import. Values are normalized like synced ones (sync.js).
    // A field the file doesn't have (backups from before reading tracking
    // lack hasRead and readDate) keeps its current value, and items the file
    // doesn't change keep their edit time, so they don't override newer
    // edits from other devices.
    function planImport(entries) {
        const changes = {};
        let matched = 0;
        entries.forEach(entry => {
            if (!entry || typeof entry !== 'object') return;
            // Match by permanent id; exports made before ids existed
            // only carry the name, so fall back to that.
            const item = (entry.id !== undefined && A.findItemByRef(entry.id)) || A.findItemByRef(entry.name);
            if (!item) return;
            matched++;
            const current = A.normalizeItemData(A.getItemData(item.id));
            const given = {};
            A.ITEM_FIELDS.forEach(field => {
                if (field in entry) given[field] = entry[field];
            });
            const data = A.normalizeItemData({ ...current, ...given });
            if (A.sameItemData(data, current)) delete changes[item.id];
            else changes[item.id] = data;
        });
        return { changes, matched };
    }

    // The same for played games and DLCs, matched by their permanent id.
    function planGamesImport(entries) {
        const changes = {};
        let matched = 0;
        entries.forEach(entry => {
            if (!entry || typeof entry !== 'object' || !A.findGameEntry(entry.id)) return;
            matched++;
            const current = A.getGameProgress(entry.id);
            const given = {};
            A.GAME_FIELDS.forEach(field => {
                if (field in entry) given[field] = entry[field];
            });
            const data = A.normalizeGameData({ ...current, ...given });
            if (A.sameGameData(data, current)) delete changes[entry.id];
            else changes[entry.id] = data;
        });
        return { changes, matched };
    }

    function importCollection(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const entries = importEntries(e.target.result);
            if (!entries) {
                A.showToast('Import failed — invalid file', 'error');
                return;
            }
            const { changes, matched } = planImport(entries.items);
            const games = planGamesImport(entries.games);
            const changed = Object.keys(changes).length;
            const gamesChanged = Object.keys(games.changes).length;
            const what = [
                changed ? countText(changed, 'item', 'items') : '',
                gamesChanged ? countText(gamesChanged, 'game', 'games') : ''
            ].filter(Boolean).join(' and ');
            if (what && A.isSignedIn() && !confirm(`This file changes ${what} in your account, on every device you're signed in on.

Import it?`)) {
                return;
            }
            if (changed > 0) A.setItemsData(changes);
            if (gamesChanged > 0) A.setGameProgressBatch(games.changes);
            A.renderItems();
            const gamesText = entries.games.length ? ` and ${games.matched} of ${countText(entries.games.length, 'game', 'games')}` : '';
            A.showToast(`Imported ${matched} of ${entries.items.length} items${gamesText}`, 'success');
        };
        reader.onerror = function () {
            A.showToast("Import failed — couldn't read the file", 'error');
        };
        reader.readAsText(file);
    }

    // Expose on namespace
    A.exportCollection = exportCollection;
    A.importCollection = importCollection;
    A.openExportModal = openExportModal;
    A.closeExportModal = closeExportModal;
    A.isExportModalOpen = isExportModalOpen;
    A.downloadCSV = downloadCSV;
    A.printInventory = printInventory;
    A.collectionInternals = { csvCell, buildCSV };   // tools/test-export.mjs

})();
