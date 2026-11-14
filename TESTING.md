# ACDb Testing Checklist

Run through this checklist before pushing significant changes (new features, refactors, filter/modal changes).
For simple item additions or image updates, skip to the "Data" section only.

---

## 1. Page Load
- [ ] Page loads without console errors (F12 > Console)
- [ ] Header shows the Collection / Reading Order / Leaderboard tabs (Collection active) and the progress meter (owned / total, %, bar)
- [ ] Click the progress meter — grid filters to owned items
- [ ] Header layout: tabs inline above 1180px; own full-width row below it; on a phone the rows are logo + meter, action buttons, tabs; no sideways scroll at 360px
- [ ] Item count matches footer count
- [ ] Timeline bar shows all games
- [ ] Cards render in the grid
- [ ] "Showing all X items" text appears above grid
- [ ] Top collectors: on the same line, at the right, "TOP COLLECTORS", the leaderboard's first three (medal, gold name, item count) and "All N collectors →". A name opens that profile ("Collection › Name" breadcrumb); the link opens the leaderboard. At 1180px and below the line sits under the count; on a phone it is one line that swipes sideways (no scrollbar) and the page doesn't. The grid doesn't jump when the names arrive
- [ ] Top collectors from the keyboard: Tab reaches the three names and the link after the toolbar; on a phone the line follows the focus and each gold ring shows whole
- [ ] Top collectors stay while searching or filtering and in list view; they are not on the other tabs, a profile or the leaderboard. One `/leaderboard` request per page load (DevTools → Network), and none when the page opens on another tab until the collection is shown
- [ ] With the Worker blocked (DevTools → Network → block `api.acdb.workers.dev`), the top collectors line is simply missing: no error, no empty gap on wide screens
- [ ] View source: one `application/ld+json` block that parses as JSON; no `keywords` tag; the three descriptions (description, `og:description`, `twitter:description`) match
- [ ] With JavaScript off (DevTools → Run command → Disable JavaScript), a paragraph under the header says what the site is
- [ ] The console shows no Content Security Policy message
- [ ] The scripts download together: in DevTools → Network (filter JS, "Disable cache" on, throttling "Fast 4G"), the `js/` files all start at the same moment, not one after another, and the console has no "preloaded but not used" warning
- [ ] The toolbar sticks right under the header while scrolling at 1600, 1200 and 1000 px, and still does after the window is narrowed from 1600 to 1200 px without a reload (the header changes height); on a phone it scrolls away with the page

## 2. Search
- [ ] Type in search box — results filter live
- [ ] Clear button (x) appears when typing
- [ ] Clear button resets search and shows all items
- [ ] Result count updates as you type
- [ ] "Nothing is true..." message shows for zero results
- [ ] Search also matches the characters an item shows, by any of their names: "connor" finds all 30 items tagged Ratonhnhaké:ton (33 results), "eagle bearer" 7, "blackbeard" 7; accents and apostrophes don't matter ("altair" finds Altaïr's items)

## 3. Filters
- [ ] Game multi-select — check a game, items filter
- [ ] Category multi-select — check a category, items filter
- [ ] Type multi-select — check a type, items filter
- [ ] Series multi-select — check "Assassin's Creed: Assassins", exactly 17 items show (14 issues + 3 volumes)
- [ ] Series can span types — "Assassin's Creed: Last Descendants" shows 3 novels + 5 Locus comics (8 items)
- [ ] Series dropdown is visible with no filters set, and disappears when a category with no series is selected (e.g. Statue)
- [ ] Characters dropdown ("All Characters", after Series): the 126 characters with items, A–Z with counts (Abbas Sofian (1) first). Opening it puts focus in its search; "connor" finds Ratonhnhaké:ton (30), "altair" Altaïr. Ezio shows 62 items and the label "Ezio Auditore da Firenze"; adding Adéwalé reads "2 Characters" and shows the 65 items with either. Picking Valhalla as the game leaves only Valhalla's 13 characters and drops picks not among them. It counts in the phone Filters badge, survives a reload, and "Clear search and filters" and the logo reset it
- [ ] A character's page with items has "Show in the collection →" (Kassandra: the grid with her 7 items, the Characters filter set to her); Back returns to her page. A character with no items (Lucrezia) has no link
- [ ] Owned filter — "Owned Only", "Not Owned", "Wishlist" all work
- [ ] "Missing Stories" — only story publications you have in no edition, each story once: owning Origins Special Edition hides Origins #1–4 and the Origins (Comic) volume; owning The Fall #1–3 hides the Fall & Chain Collected Edition and Subject 4 but shows The Chain; owning nothing of Uprising shows Vols. 1–3 and none of its issues. The count reads "Showing N missing stories"; the choice survives a reload
- [ ] Read filters — "Read" shows only items marked read; "Not Read" shows only unread story publications (164 total with nothing read), never statues or art books
- [ ] Sort — Default, Year asc/desc, Name A-Z/Z-A, Recently Added
- [ ] Filters cascade: selecting a game narrows Category options, selecting a category narrows Type options, selecting a type narrows Series options
- [ ] Clear (x) button on each multi-select resets that filter
- [ ] A filter with a value (search text, a ticked game/category/type/series/character, a status other than "All Items") has a gold edge and a faint gold tint; untouched filters and Sort stay plain. Holds after a reload, clears with "Clear search and filters" and the logo, and the status dropdown's option list stays dark
- [ ] Type, Series and Characters search boxes filter options as you type, ignoring accents and apostrophes
- [ ] Toolbar: at 1600px the search, all the filters, Sort and the grid/list control fit on one row; at 1520px and below the search shares its row with the grid/list control and the filters get the row below (at 1000px Sort wraps onto a third)

## 4. Filter Persistence
- [ ] Set some filters, refresh the page — filters are restored
- [ ] Click logo — all filters reset, page scrolls to top
- [ ] Open Reading Order, then the Collection tab — back on the grid with filters kept

## 5. Multi-Select Behaviour
- [ ] Selected items float to the top of dropdown
- [ ] Separator line appears between selected and unselected
- [ ] Unselected items return to original order (chronological for games, alphabetical for categories/types)
- [ ] Escape closes open dropdown
- [ ] Clicking outside closes dropdown

## 6. Timeline
- [ ] Click a game button — filters to that game
- [ ] Click multiple games — multi-select (toggle)
- [ ] Click "All" — resets game filter
- [ ] Timeline syncs with game multi-select dropdown

## 7. Cards
- [ ] Grid view shows image, game, title, description, year, type
- [ ] Each card shows its item id (e.g. `#14` for the Assassin's Creed III Freedom Edition) in a grey pill at the right end of the gold game line; a long game name ("Assassin's Creed IV: Black Flag") wraps in full with the pill on its first line
- [ ] List view works (toggle button). On wide screens each row ends with the year then the id pill, and both line up in straight columns down the list whatever the type, condition or Owned/Wishlist/Read badges (which sit between the title and the year). On phones the id stays at the end of the game line (clear of the NEW sticker)
- [ ] Cards with images display correctly (top crop)
- [ ] Card images and reading-order covers load the small copy from `images/thumbs/` when `js/thumbs.js` lists the image (DevTools → Network, filter "thumbs"); the item window and lightbox load the full image. If a copy is missing (block its URL in DevTools), the card loads the full image instead of the placeholder
- [ ] Cards without images show AC logo placeholder
- [ ] Owned badge shows on owned items
- [ ] Wishlist badge shows on wishlist items; Read badge on read books
- [ ] Clicking a card opens the modal
- [ ] Ctrl+click / right-click "Open in new tab" works
- [ ] URL updates with item slug when card is clicked

## 8. Item Modal
- [ ] Title, game, year, category badge, type badge display correctly
- [ ] The Game line ends with the item id pill after the year (`#14` for the Freedom Edition), also in the read-only modal on a profile; with a long game name on a phone it wraps onto the next line rather than overflowing
- [ ] Type badge hidden when type equals category
- [ ] Series line (name + entry count) shows for comic/manga items and is absent for items without a series
- [ ] Description and contents show
- [ ] "Read on Internet Archive" button shows under Contents for linked comics (e.g. "Assassin's Creed Vol. 1: Desmond"), opens the book in a new tab, and is absent for items without a `read` URL (e.g. any statue). Also shows in the read-only modal
- [ ] Gallery image loads
- [ ] Gallery navigation (arrows, dots) works for multi-image items
- [ ] Swipe works on mobile / touch simulation
- [ ] Clicking image opens lightbox
- [ ] Clicking category badge / type badge / game / series closes the modal and filters the grid by that value (replaces existing filters)
- [ ] Badges are NOT clickable in read-only modal (shared profile / leaderboard)
- [ ] Character line: an item that shows a character has "Character" (one) or "Characters" (several) with gold links after the series line. The Reflections trade paperback (#302) lists six; the PureArts Animus Ezio 1/4 statue lists Ezio; the Pre-Order Art Book (#3) has no line. A link opens that character's page (also from the read-only modal on a profile)
- [ ] Share icon button (badges row): desktop copies `https://acdb.theprivategeek.com/s/<slug>` with toast; mobile/touch opens the native share sheet (also in read-only modal)
- [ ] Keyboard: Tab to a card and press Enter: the item opens with the gold ring on Close. Tab and Shift+Tab go round the window's own controls and never reach the page behind (Shift+Tab from Close lands on the last control). Esc, ✕ and Back close it and the ring is back on the card. The same from a reading row's title, a card on a character's or game's page, and a card on a profile
- [ ] An edit that redraws the list keeps that working: with **Owned Only** set, change an owned item's Condition and close: focus is on that item's card. When the card has gone (untick Owned under Owned Only), closing shows no error
- [ ] Opened from its address (paste `/#assassins-creed-limited-edition`, or reload with an item open): no ring anywhere; the first Tab lands on Close, and Tab stays in the window
- [ ] "Next: …" from the keyboard (an item in a reading order, from the grid and over the Reading Order tab): Enter shows the next book and the ring stays on Next, so Enter again walks on; closing returns to the card or row it was first opened from
- [ ] A link in the window that leads to another view puts focus on that view's title: from an item opened over a character's page, Enter on its game link shows the game's page with the ring on its title; from an item in the grid, Enter on a character link does the same on the character's page
- [ ] Gallery dots: Tab reaches them, Enter or Space on a dot shows that image and the ring stays on the dot now gold. To a screen reader the dots are named "Image 2 of 3" and the copies buttons "One copy fewer" and "One more copy"
- [ ] A screen reader announces the window as a dialog named after the item, and the lightbox as "Image viewer"

## 9. Lightbox
- [ ] Image shows full-screen on dark background
- [ ] Navigation arrows work
- [ ] Arrow keys work
- [ ] Touch swipe works
- [ ] Counter shows "1 / 3" etc.
- [ ] Escape closes lightbox
- [ ] Clicking background closes lightbox
- [ ] Keyboard: with the lightbox open, Tab goes round its Close, Previous and Next buttons only (just Close for a single image); Esc closes it, leaves the item window open, and Tab is back among the item window's controls

## 10. Collection Controls
- [ ] Toggle Owned on — copies auto-set to 1
- [ ] Toggle Owned off — copies, condition, has box, price, date, notes all reset
- [ ] Set condition — owned auto-toggles on, copies set to 1
- [ ] Toggle Has Box — owned auto-toggles on
- [ ] Increase copies — owned auto-toggles on
- [ ] Decrease copies to 0 — everything resets
- [ ] Price paid field saves
- [ ] Acquired date field saves
- [ ] Notes field saves (with debounce)
- [ ] All changes persist after closing modal and reopening
- [ ] Each change updates just that item's card behind the modal (badges, condition, green border), the header's owned count and the "· N owned" line, with no visible redraw of the grid; on a phone (or DevTools CPU 4x slowdown) ticking Owned feels instant. With a status filter set (Owned, Not owned, Wishlist, Read, Missing Stories) the list redraws, so a card that no longer matches drops out
- [ ] One click is one save: DevTools → Application → Local Storage, `acdb_collection_v2` changes once per click (typing in Copies saves as you type)
- [ ] Reading section shows for novels, comic books, graphic novels, manga, gamebooks; hidden for everything else (statues, art books, magazines)
- [ ] Setting a Finished date auto-toggles Read on; toggling Read off clears the date
- [ ] Toggling Owned off leaves Read and Finished untouched
- [ ] Card shows a purple "Read" badge for read items
- [ ] Collected editions (e.g. Trial by Fire TPB) show "Marking this as read also marks the 5 issues it collects as read." under the Read switch; single issues show no hint
- [ ] Marking a collected edition read marks its unread parts read (with the collection's Finished date, if any) and toasts how many; parts already read keep their own date; unmarking the collection leaves the parts read

## 11. Collection Insights Dashboard
- [ ] "Collection Insights" toggle opens/closes the panel
- [ ] Sort control (% / # / Timeline segmented buttons) switches between percentage, count and game order
- [ ] By Game — bars show owned/total with percentage, sorted correctly
- [ ] By Category — same as above
- [ ] Condition Breakdown — shows counts, Total Physical Items at top
- [ ] Reading Progress — "Stories Read X/164" at top, then one bar per series plus "Standalone"; clicking a series filters to it (Standalone is not clickable)
- [ ] 100% completion — the percentage gets a check and turns green (owned panels) or purple (Reading Progress); bars stay gold
- [ ] Confetti fires when completing a game/category (mark last unowned item)
- [ ] Celebration toast appears center-screen
- [ ] A second row of three panels sits under the four: Spending, Spent by category, Collected by year. Three columns above 1024px, two at 1000px, one on phones; nothing scrolls sideways
- [ ] Spending: with no prices, "Add a price paid to an item to see your spending." and no currency control; Spent by category says "No prices yet"
- [ ] Spending: Total spent, Items with a price ("7 / 8": priced of owned), Average per item and Most expensive match a hand count; the name opens the item card, Back closes it, and a long name cuts off with an ellipsis at 360px
- [ ] An item with 3 copies and a price of 50 adds 50; a price of 0 counts as a price (and pulls the average down); an item that isn't owned adds nothing, even with a price
- [ ] Prices of 0.10 and 0.20 total 0.30
- [ ] With Insights open, changing a price or an acquired date in an item card updates the panels at once; switching Owned off removes the item from every figure
- [ ] Currency dropdown: "No symbol" first, then the nine currencies A–Z by name (British pound (£) … US dollar ($)). Each changes every amount: "£1,100.29", "CA$1,100.29", "DKK 1,100.29", "NOK 1,100.29" and "SEK 1,100.29" (a code, with a space; the dropdown reads "Norwegian krone (NOK)"), "¥1,100.29" for the yuan and "¥1,100" for the yen (no decimals, tooltips included); No symbol shows bare numbers. The pick survives a reload (`acdb_currency` in Local Storage; No symbol removes it); nothing is sent to the server (Network tab); with storage blocked the panels still draw. At 360px the dropdown fits beside its label
- [ ] Spent by category: largest first, a gold bar against the largest, whole amounts with the exact one on hover; a row filters the collection to that category and gives the Category filter its gold edge, by mouse and by keyboard (Tab reaches each row with the gold ring after the currency dropdown and the Most expensive link; Enter and Space work, and focus stays on the row)
- [ ] Collected by year: newest first, with how many items were acquired and what they cost; owned items without a date are under "No date" last; with no dates at all, "No acquired dates yet". Year rows aren't clickable
- [ ] The % / # / Timeline control leaves the three spending panels as they are

## 12. Back up / Restore (account menu)
- [ ] **Back up to file** downloads a JSON file with today's date in filename
- [ ] Export includes all collection fields (owned, wishlist, condition, copies, price, date, notes, hasRead, readDate)
- [ ] An item that is only marked read (not owned) is included in the export and restores on import
- [ ] Toast shows "Exported X items"
- [ ] **Restore from file** — select the exported file, data restores
- [ ] Toast shows "Imported X of Y items"
- [ ] Import with invalid file shows error toast
- [ ] **Restore from file** also takes the file from **Download all account data** (entries under `items`)
- [ ] Restoring a backup made before reading tracking (no `hasRead`/`readDate`) keeps the books you've marked read; items the file doesn't change keep their edit time
- [ ] A file with junk entries (`null`, unknown ids or names) imports the rest; an invalid value (a `condition` of `<img src=x onerror=alert(1)>`, a 9000-character note) is stored blank or trimmed and runs nothing
- [ ] Signed in: a file that changes items asks first ("This file changes N items in your account…"); Cancel changes nothing; a file that changes nothing doesn't ask
- [ ] Export never contains `updatedAt` (sync bookkeeping stays out of export files)
- [ ] The file is `{"items": [...], "games": [...]}`: `games` lists every played game and DLC with its id, name (and its game's name for a DLC), `played` and `playedDate`; the toast says "Exported 12 items and 3 games" ("… and N games" left out with none played)
- [ ] Restoring it brings the played games back (clear them first: sign out, or `ACDB.clearGamesProgress()` in the console); the toast adds "and 3 of 3 games"; signed in, the confirm counts both ("changes 2 items and 1 game"). A game id the site doesn't know is skipped. A backup from before games (a plain list of items) still restores, and leaves the played games alone
- [ ] **Export as spreadsheet…** opens a dialog with focus on its Close button; Tab and Shift+Tab stay inside it; Esc, Cancel, the close button and a click outside close it, and focus returns to the account button
- [ ] The format is guessed the first time (commas in an English browser, semicolons where the browser writes 1,5) and remembered after a download, across a reload
- [ ] The file is named `acdb-collection-<date>.csv` and has one row per item with any data (the rule Back up to file uses), 17 columns; the toast says "Exported 112 items as a spreadsheet"
- [ ] The commas file in Google Sheets and your Excel's format in Excel (double-click): every column in place, "Altaïr" and "Tantō" intact, prices are numbers that add up (the Price paid sum matches Total spent in Insights when only owned items have prices), dates are dates
- [ ] A note with commas, quotes and a line break stays in one cell; a note of `=1+1` shows as text, not 2
- [ ] Read and Finished reading are `yes`/`no` and a date for books, empty for statues and other items
- [ ] With an empty collection the menu entry toasts "Nothing to export yet…" and opens nothing
- [ ] **Print inventory** opens the print dialog on a list of the items you own: dark on white, a small photo per item, the heading with today's date and the totals ("120 items · 169 copies · €12,192.99 paid for the 89 items with a price"), sorted by game in release order then by name, the header row on every page, no row split across pages, in A4 and Letter; Save as PDF gives a file you could send to an insurer
- [ ] Notes never appear in the printout; an item with a very long name wraps inside its cell and the table never runs off the paper
- [ ] With nothing owned, Print inventory toasts "Nothing to print yet…" and no print dialog opens
- [ ] Ctrl+P on the collection, a game's page and the privacy page prints what it did before (the printout's rules apply only while the inventory prints)
- [ ] On a phone (Chrome on Android or Safari on iPhone), Print inventory opens the system print sheet with the same list

## 13. URL Hash Routing
- [ ] Opening a card updates the URL hash (e.g., #assassins-creed-ii-black-edition)
- [ ] Pasting a URL with hash opens directly to that item
- [ ] Browser back button closes the modal
- [ ] Closing modal clears the hash
- [ ] Share page redirects into the app: `/s/<slug>.html` loads and lands on `/#<slug>` with the item modal open
- [ ] Old links of renamed items still work: `/#mcfarlane-toys-connor-with-mohawk-action-figure-series-3` opens the Series 2 figure and the address switches to its current slug; `/s/assassins-creed-the-jade-seal` lands on Chang'an Wang
- [ ] After adding items, `python3 tools/build-share-pages.py` was re-run (623+ pages, no warnings)
- [ ] `#games` opens the Games tab; `#games/assassins-creed-valhalla` opens Valhalla's page; `#games/nope` shows the tab and the address becomes `#games`
- [ ] Old links still work: `#reading/games` becomes `#games`, and `#reading/games/ii` becomes `#games/assassins-creed-ii`, AC II's page
- [ ] Back from a game's page returns to where you came from, scrolled where you were, with focus on the link you followed: the Games list, Complete Lore, a character's page
- [ ] `#characters` opens the Characters tab; `#characters/ezio-auditore-da-firenze` opens Ezio's page; `#characters/nope` shows the list and the address becomes `#characters`

## 14. Category list
The catalogue's categories are the Category options of the "Suggest a missing item" form (`.github/ISSUE_TEMPLATE/missing-item.yml`); `tools/validate-catalog.py` reads them from there.
- [ ] `python3 tools/validate-catalog.py` passes: every item's category is one of the form's 17 ("Not sure" is not a category)
- [ ] Taking a category out of the form (try Music, then put it back) makes the validator report each item that uses it
- [ ] The site has no "Add Item" button or code generator (retired 2 Nov 2026), even with an old `acdb_admin` flag in localStorage

## 15. Responsive / Mobile
- [ ] Phones: search on top, then **Filters** and the grid/list control; Filters opens the seven filters below (closed on load). With filters set, the button shows how many (two games + Owned Only = 3) and turns gold while open; desktop shows the filters as before
- [ ] Filters stack vertically on mobile once opened
- [ ] Cards switch to single column on small screens
- [ ] Modal switches to single column layout below 1024px
- [ ] Scrolling a long item modal keeps the share and close buttons in view (desktop and phone)
- [ ] Timeline scrolls horizontally
- [ ] On phones the account menu opens centred under the button row and stays on screen at 360px
- [ ] Back to Top button appears on scroll, works on tap

## 16. Data Integrity
- [ ] Total item count in footer matches database
- [ ] Search for "zzzz": the emblem, "Nothing is true, everything is permitted... but no items match your search." (italic, centred) and a **Clear search and filters** button that clears the search, dropdowns, timeline and status filter (the sort stays) and shows everything again
- [ ] Below that, "Can't find an item? Suggest it on GitHub or by email." (upright, not italic). **on GitHub** opens the "Suggest a missing item" form in a new tab with the title and *Item name* filled with "zzzz"; **by email** opens a mail draft with the subject "Missing item: zzzz" and the field list in the body
- [ ] With no search text, a filter that matches nothing (e.g. Wishlist with an empty wishlist) shows the empty state *without* the suggest line
- [ ] Footer **Suggest a missing item** opens the same form, empty
- [ ] Leaderboard and profile dates read like "9 Oct 2026", as in the reading view
- [ ] `python3 tools/validate-catalog.py` reports OK (it also runs automatically as the pre-commit hook). It covers unique ids and names, required fields, known games and categories, image mappings and files, read links, share pages, and the old slugs in `js/slug-aliases.js`. For `js/games.js` it checks that every game and DLC has a positive id as its first key, unique across games and DLCs (one sequence; a new one takes the highest + 1 wherever it goes), and at or below the Worker's `MAX_GAME_ID` (a warning within 25 of it); each game's kind, developer, platforms (known names, in the validator's `PLATFORMS` order), description (a warning past 300 characters), re-releases and URL slug, and each DLC's type; a lore place (`marker`) only on expansions and story DLCs of main, spin-off and handheld games with a year. For `js/characters.js` it checks each character's id (unique, each new one higher), name and URL slug, side, year, games (from `js/games.js`, main, spin-off or handheld only, in release order) and description (a warning past 300 characters), and that every item's `characters` lists existing ids, each once. It fails when a card image is new or replaced and `python3 tools/build-thumbs.py` hasn't been run since, and when a new or replaced image is bigger than 1600x2400 (`python3 tools/convert-to-webp.py` shrinks it; committed images are left alone)
- [ ] Collection data keyed by item id under `acdb_collection_v2`, each entry with an `updatedAt` edit time once edited; a name-keyed `acdb_collection` from before ids is migrated once on load (unmatched keys are dropped) and kept as a backup until 2027-01-03, after which it is removed from browsers that have `acdb_collection_v2`
- [ ] Saved entries are normalized on load the way the Worker stores them (an unknown `condition` becomes blank, the edit time is kept); a saved collection that isn't valid JSON is copied to `acdb_collection_unreadable` and the site starts with an empty one
- [ ] Storage blocked (DevTools → Application → Storage, or a browser set to block site data): the site still loads, an item link (`#<slug>`) opens the item, and the first edit shows "Couldn't save in this browser…" once
- [ ] No CSP errors in the console on `index.html` and `privacy.html` (`script-src` has no `'unsafe-inline'`); on the live site the Cloudflare beacon still loads
- [ ] Export includes `id` and `name`; Import accepts both new exports (by id) and old ones (by name)
- [ ] Shared profiles upload item ids; profiles uploaded before ids (item names) still display. Profiles and the leaderboard are served from D1
- [ ] Played games keyed by game or DLC id under `acdb_games_v1` (`{"45": {"played": true, "playedDate": "2026-11-01", "updatedAt": …}}`)
- [ ] `node tools/test-sync-merge.mjs` passes (cloud-sync merge rules for items and for played games, and that the Worker's `sanitizeItemData` and `sanitizeGameData` keep the client's normalized values unchanged)
- [ ] `node tools/test-spending.mjs` passes (the Insights spending sums: what counts as a price, sums in whole cents, one price per item whatever the copies, owned items only, the most expensive on a tie, years and undated items, and the money format)
- [ ] `node tools/test-export.mjs` passes (the spreadsheet export: quoting, the formula guard, both formats, prices as plain numbers, the read columns, accents and CRLF line ends)
- [ ] `node tools/test-worker.mjs` passes (runs the Worker against a local copy of the D1 schema: request bodies must be JSON and not oversized; owned items count each id once and only ids up to `CATALOG_MAX_ID`; write and read rate limits; the top-100 leaderboard and its one-minute memory; played games (pushed with `games`, pulled with `gamesSince` on their own cursor, sanitized, limited to ids 1–1000 and 200 a push, kept out of `items`, in the account export, removed with the account, and a push of only games leaves a linked profile's date alone); and that sync, sign-in, profiles, export and account delete still work)
- [ ] After a Worker deploy, `curl.exe -sI https://api.acdb.workers.dev/leaderboard` shows `acdb-worker:` with the `WORKER_VERSION` in `worker/acdb-worker.js`
- [ ] `python3 tools/build-item-pages.py --check` exits 0 (the validator runs the same check and fails when an item or list page, or `sitemap.xml`, is missing, out of date or left over). After an item edit it names only the pages that show the change; a second run of the builder writes nothing
- [ ] Every `src` and `href` starting with `/` in `item/` and `items/` points at a file (an address without an extension is its `.html`), and every `<loc>` in `sitemap.xml` has its file
- [ ] Read links still open a book: archive.org returns 200 even for a missing book, so open a few (especially ones with parentheses in the path) and check the reader shows a cover, not an empty item page

## 17. Account & Cloud Sync
Local testing: run `python3 tools/serve.py` and use `http://localhost:8000` (it talks to the live API; `http://127.0.0.1:8000` has separate storage, so it works as a second device). Only Google accounts listed as test users can sign in while the Google app is in Testing.
- [ ] Signed out: header shows **Sign in ▾** (person icon); its menu leads with **Sign in with Google**, then Back up to file, Restore from file, Export as spreadsheet…, Print inventory, Privacy; after owning an item, the banner appears; ✕ hides it for good (survives reload)
- [ ] Banner is hidden on profile and leaderboard views
- [ ] Sign in from an open item: Google account chooser → back on the same item, signed in; no `?code=` left in the address bar
- [ ] Cancelling on Google's page shows "Sign-in cancelled"
- [ ] Account button shows the initial with a sync dot (green when synced); menu shows the email and sync status, then Back up to file, Restore from file, Export as spreadsheet…, Print inventory, Download all account data, Privacy, Sign out, Delete account; Esc, clicking outside, and choosing an item close it
- [ ] Mark an item owned: the dot pulses, then turns green within ~3 seconds
- [ ] Second browser/device signed in to the same account shows the change after switching to its tab (or reloading)
- [ ] Same item edited on two devices: the later edit ends up on both
- [ ] Mark a novel read (with a Finished date) without owning it: it syncs to the second device with both read fields intact
- [ ] Mark a game and one of its DLCs played (with a Finished date) on one device: within seconds the other device shows them on the game's page, the Games tab and Complete Lore (switch to its tab, or wait for the next sync). Unmark one: that syncs too. **Download all account data** lists them under `games`
- [ ] First sign-in on a browser with played games the account doesn't have: they're kept and sent up; games the account has come down. When only played games differ (no item conflicts), the dialog doesn't open and the most recent change wins; when it does open for items, the choice applies to the games too
- [ ] Signing out clears the played games from the browser along with the collection (`acdb_games_v1` is `{}`); signing back in brings them back
- [ ] Before the Worker is deployed (an old Worker, or block the response's `gamesSaved` in DevTools overrides): items still sync, a game tick stays in the browser, isn't re-sent in a loop (Network shows no repeating `PUT /collection`), and counts in the sign-out warning; once the new Worker answers, the next sync sends it
- [ ] First sign-in on a browser whose items differ from the account: the "Combine your collections" dialog shows the counts; each choice behaves as described; "Download a backup" saves an export; Esc doesn't close it; Tab goes round its three choices and the backup link only, also when it opens over an item (sign in from an open item); after the choice the item is still open, the page behind it doesn't scroll, and Tab is back among the item's controls
- [ ] Offline (DevTools → Network → Offline): edits still save, the dot turns amber; back online they sync
- [ ] Two tabs open: an edit in one appears in the other; edits made in both at once all survive
- [ ] Not published: header shows **Publish collection**; its window reads "Publish Your Collection" / "Get a public page to show friends, and a spot on the Leaderboard"; after publishing the button leaves the header and **My public profile** appears in the account menu, opening "Your Public Profile"
- [ ] Publish window, signed out: under the counts it says "Without signing in, only this browser can update or delete your profile, and clearing its data takes that away. **Sign in with Google** first to manage it from any device." (the link starts sign-in); signed in, the line is absent. A profile published signed out says in its manage window "Sign in with Google to keep your profile up to date automatically and manage it from any device."
- [ ] Publish window from the keyboard: it opens with the cursor in Display Name and Tab stays inside; Esc puts the ring back on **Publish collection** (or **Join the Leaderboard**). After publishing the ring is on **Copy**; **Done** puts it on the account button. **My public profile** opens with the ring on Close, and closing puts it on the account button
- [ ] Leaderboard, not published: "Want to be on here? **Join the Leaderboard**" sits above the list and opens the publish window without leaving the leaderboard, which refreshes after publishing ("You're on the board as …")
- [ ] Publish while signed in: the profile is created without a token; the manage window has no Update button and says it updates automatically; owning more items updates the profile and leaderboard
- [ ] The leaderboard lists the top 100; when your profile is published but not among them, the line above the list reads "The board shows the top 100. Your profile: <name>" (linked). No percentage on the leaderboard or a profile goes above 100%, and a profile shows each item once
- [ ] The line above the leaderboard opens with the number of collectors once the list has loaded: "10 collectors so far. Want to be on here?" (or "… You're on the board as <name>", or "… The board shows the top 100. …"); "1 collector so far." for one. The number counts every profile, not only the 100 shown (the Worker's `total`; with a Worker older than 2026-11-14 and a full board, the number is left out here and the collection's link reads "See the leaderboard →")
- [ ] Publish window: when the name check fails (offline, or the Worker answers with an error), it says "Could not check. Try again." rather than "Already taken"; a profile that fails to load for any reason other than 404 says "Error loading profile"
- [ ] Signing in on a browser that shared a profile before sign-in existed links that profile (toast) and it starts updating automatically
- [ ] **Download all account data** downloads `acdb-account-<date>.json`
- [ ] **Sign out**: the grid shows nothing owned; signing in again brings everything back
- [ ] Sign out before the first sync has finished (sign in on a browser with a collection while DevTools blocks `api.acdb.workers.dev`): the collection stays, the toast says it "hadn't synced yet, so it's still here", and nothing is pulled in afterwards
- [ ] **Delete account**: confirm dialog; afterwards signed out, the collection is still in the browser, and the public profile is gone
- [ ] `privacy.html` opens from the footer and the account menu, and looks right on mobile. It names the backup by its menu label (**Back up to file**, not "Export") and says what happens to a profile published without signing in when the browser's data is cleared
- [ ] Fresh private window: no requests to `accounts.google.com` until Sign in is clicked (Network tab; `fonts.googleapis.com` is the site's fonts and was always there)

## 18. Reading Order
- [ ] Reading Order tab in the header opens `#reading` and turns active (Leaderboard likewise for `#leaderboard`; a profile leaves no tab active): grid, toolbar and stats are hidden; tabs read Complete Lore (active), By Series, Oliver Bowden Novels, Non-canon Stories (the games have their own tab, section 20)
- [ ] Complete Lore: 120 entries under 9 era headings (Ancient World … Modern Day), each with a read count; numbering runs on across headings; Forgotten Myths #1 first, Escape Room Puzzle Book last; Trial by Fire #1–5 sit together at 1692
- [ ] Era headings fold: all start open with a chevron and "Collapse all"; clicking a heading folds it (count stays visible) and the button turns to "Expand all"; folding survives marking books read and leaving/returning to the tab (until reload); "Up next" opens a folded section and lands on the book; release-year headings fold the same way; series and Bowden pages have no sections
- [ ] Complete Lore shows the games among the books: 32 compact rows with a gold stripe down the left edge (not dashed; the stripe stays during the flash after a link jumps to a row), a 48 px cover (40 px on phones, a book cover's width but shorter) and a gold kind line on top ("Game" or "Story DLC · Black Flag"); in one column (1000 px and below) they are indented so their covers line up with the book covers, in two columns they start flush in their cell (21 games and 11 story DLCs, each with its cover art uncropped, the two Crossover Stories sharing one; no Black Flag Resynced), unnumbered, with a **Played** switch where a book has Read; the books stay numbered 1–120 and the progress and era counts count books only. Assassin's Creed II sits between Heresy and Renaissance; Odyssey comes before the Odyssey novel. The handheld games sit by their year: Altaïr's Chronicles (1190) before Assassin's Creed, Bloodlines (1191) right after it, Discovery (1491) after Assassin's Creed II. Only main, spin-off and handheld games with a story year get a row (mobile, browser and VR games stay on the Games tab)
- [ ] A game row's Played switch marks the game (or the story DLC) played: the row gets a purple edge (the gold stripe stays), the game's page and card follow, and the books' progress and era counts don't change. Space toggles it from the keyboard and focus stays on it; at 390 and 360px the switch stays on the right of the row (its "Played" label hides, like Read)
- [ ] "Show games" switch (on by default) hides the game rows; the choice survives a reload. With a game filter only that game's rows show (Black Flag: the game, Aveline and Freedom Cry); "Original stories" has none
- [ ] A book you have only in a collected edition says "Owned in <edition>" (owning Origins Special Edition: Origins #1–4 say "Owned in Origins Special Edition")
- [ ] "Only missing" switch (off by default) hides the books you have in any edition, on the orders and series pages; the rest keep their numbers, era sections left empty disappear, "Up next" hides, and an order with nothing missing says "You have every book here, in one edition or another." The choice survives a reload
- [ ] A game row's title or cover goes to the game's page (`#games/<slug>`); Back returns to Complete Lore at the same spot, with the same folds open and focus on the row. A DLC row (Wrath of the Druids) opens its game's page at the DLC, highlighted. Ctrl+click opens a new tab
- [ ] From a game's page reached from Complete Lore, "N stories in Complete Lore" opens the order filtered to that game; Back returns to the game's page, and Back again to where you were in the list
- [ ] Release mode on Complete Lore groups by release year; dates known only to the month show as "Nov 2009"
- [ ] After marking something read, "Up next: …" appears and jumps to (and briefly highlights) the first unread book
- [ ] Game filter on Complete Lore: chips "All 120", then games in timeline order (AC1 first), "Original stories 62" last. Picking Valhalla shows its 12 entries numbered 1–12 with "x / 12 read"; the address becomes `#reading/complete/valhalla` without adding a back-button step; All resets to `#reading/complete`
- [ ] Pasting `/#reading/complete/black-flag` opens the filter directly; an unknown game shows everything; opening a book and pressing back keeps the filter; other tabs have no chips
- [ ] Desktop: the page is as wide as the main grid; the chips wrap (no sideways scrolling) and the list shows two numbered columns from about 1150px wide, one below
- [ ] Phone width: the chip row scrolls sideways, the active chip is scrolled into view, and toggling a Read switch doesn't reset the row
- [ ] Oliver Bowden Novels (`#reading/bowden`) lists 9 books, Desert Oath first, with no headings; Release puts Renaissance first and Desert Oath last; the mode choice survives a reload
- [ ] Non-canon Stories (`#reading/non-canon`) lists 14 entries; Awakening Vol. 2 follows Awakening #6
- [ ] By Series (`#reading/series`): "All series 24" in story order (Forgotten Myths first; Visionaries, Yan Leisheng, Awakening last as "Non-canon"); each row has a cover, types, era or era range ("Ancient World – Industrial Age" for Bowden), "read / total" and a bar; finished series get a purple border and a purple ✓ count
- [ ] Read a book in a series without finishing it: the series also appears under "Continue reading" at the top
- [ ] A series row opens `#reading/series/<slug>` (Uprising: 12 issues starting at #5, as in Complete Lore) with a "By Series › Uprising" breadcrumb and a header card (first cover, "12 comic books · 20th Century – Modern Day · placed as in Complete Lore", read progress, "Up next" once something is read, "See the whole series in the collection"), the usual modes and Read switches; the page fades in (not with reduced motion); browser back returns to the list
- [ ] The bottom of a series page links to the series before and after it in the list's order (Uprising: ← The Fall, Conspiracies →); Bowden's neighbours link to `#reading/bowden`; the first and last series have one link
- [ ] Bowden's row opens `#reading/bowden`; pasting `#reading/series/oliver-bowden-novels` lands there too; an unknown series slug shows the list
- [ ] "See the whole series in the collection" opens the grid filtered to that series (Uprising: 15 items, collected editions included)
- [ ] A series with reprint editions shows "Collected in" under the meta line, and each name opens that edition's card over the page (Awakening: "Awakening, Vol. 1"; The Fall: four editions, wrapping cleanly at 360 px). The list, numbering and progress don't count them; a series with none (Yan Leisheng) has no such line
- [ ] Read toggle on a row marks the book read: purple border, "X / 9 read" and the bar update; the item's own modal shows Read too
- [ ] Clicking a cover or title opens the full modal on top of the view; the address stays `#reading`; category/type aren't filter links there, the game is a gold link to its page (plain text for "General" and the movie), and the series name is a gold link to its series page (Tab reaches both; on the page they link to they just close the modal; Bowden's series goes to `#reading/bowden`). The same goes for the modal over a character's or game's page, except that a Hachette Official Collection item's series stays plain text (no page)
- [ ] In that modal: "Next: …" swaps to the next book in place; marking Read updates the list underneath; Esc, ✕ and browser back all close it and leave the view
- [ ] Item modal from the grid: books in an order show "Reading order · <order> · N of M · Next: …" (position follows the chosen mode; the last book says "Last book"); Bowden novels show two lines (Complete Lore and Oliver Bowden Novels); clicking an order name opens that tab
- [ ] No reading order line for items outside an order, or in read-only (profile/leaderboard) modals
- [ ] The **Collection** tab returns to the grid with no hash; pasting `/#reading/bowden` opens that tab directly
- [ ] Phone width: rows fit without horizontal scroll, the Read label hides and the switch stays
- [ ] `validate-catalog.py` covers `js/reading-orders.js` (unknown item, non-readable type, duplicate, missing setting, bad date are errors) and `js/games.js` (a main game or spin-off not on the timeline, a duplicate, a bad date, a DLC with a place in the lore but no year, a bad episode date, a remake of an unknown game are errors; the newer games checks are in section 16)

## 19. Design System
The rules are in [DESIGN.md](DESIGN.md) (its section 13 is the definition of done); tokens live at the top of `css/style.css` and component rules use only them. Check at 1600, 1200, 1000, 390 and 360px, signed in and out.
- [ ] No page scrolls sideways at any of those widths (collection, every reading tab, a series page, the Games tab in both orders, a game's page, the Characters tab in both orders, a character's page, leaderboard, a profile, privacy, an item page and a list page in `item/` and `items/`)
- [ ] Tab through the collection, the reading view, the Games tab, the Characters tab and an open item modal: every control (links, buttons, chips, dropdown options, Read/Owned/Played switches, the DLC ticks, fold headings, game cards, the Insights currency dropdown and Spent by category rows) shows the same 2px gold focus ring; fields also turn their border gold
- [ ] Following a link to a game's or character's page from the site moves focus to the page title; Back puts focus back on the link you followed. A page opened from a pasted link leaves focus alone (no ring on the title)
- [ ] The filter dropdowns work from the keyboard: Tab into the options, Space ticks one. A screen reader names the two selects "Filter by status" and "Sort by", and the dropdown search boxes "Search types", "Search series" and "Search characters"
- [ ] Numbers use lining figures everywhere ("AC1", "Issue #1" and years sit on the baseline)
- [ ] With reduced motion on (Windows: Settings > Accessibility > Visual effects > Animation effects off): no logo pulse, no card lift or slide-in (item cards and game cards), no gallery slide, no confetti, and Back to Top / "Up next" / a highlighted DLC in a game dialog jump instead of scrolling smoothly
- [ ] Muted text (meta lines, release dates, footer) is readable; only the "no items match" line keeps the original `#666` (on purpose)
- [ ] Fonts: after a hard refresh (Ctrl+F5) headings are still Cinzel and text Raleway once the page settles (fonts load with `display=swap`, so a brief fallback flash is expected)
- [ ] Colour meanings: every progress bar is gold (header meter, Insights, reading view, series rows); a finished row shows a green (owned) or purple (read) check and count; the Owned switch turns green, Wishlist blue, Read purple (modal and reading list), Has Original Box gold
- [ ] Buttons: Publish is green in the header, on the leaderboard and in its dialog; dialogs put Cancel and the main action on the right and Delete on the left; header buttons are 32px with readable text
- [ ] One "pick one" style per job: underline tabs (header, reading orders), segmented controls (Chronological/Release, Release/Story order on Games, Insights sort, grid/list), chips (game timeline, reading game filter, Games kinds)
- [ ] One search box: the collection search and the Games search look the same (icon, gold edge while there is text, a clear button that shows with text)
- [ ] Toasts: "Link copied!" shows a green check, a failure (e.g. switch off the network and publish) a red alert and stays longer; a screen reader announces them
- [ ] Owned cards have a green edge and the OWNED badge (no check circle); list view rows are compact with a 64px thumbnail, the badges between the type and the year (under the title on phones); the `#id` pill is grey in JetBrains Mono, never gold
- [ ] Leaderboard: one card per collector at every width (medal or rank, gold name, "Updated 9 Oct 2026", item count, % and a gold progress bar), in one column at every width (centred at about 760px on wide screens, the title lined up with the cards); clicking anywhere on a card opens the profile and Tab rings the whole card; "Loading", "No collectors yet" and errors show as plain text across the list; on a 390px phone the title fits on one line and nothing scrolls sideways
- [ ] Profile: "Collection › Name" breadcrumb (or "Leaderboard › Name" when opened from the leaderboard); the first link goes back there

## 20. Games
The Games tab (`#games`, `js/games-view.js`) lists `js/games.js`. Counts below are for today's data (42 games, 72 DLCs).
- [ ] The header reads Collection · Reading Order · Games · Characters · Leaderboard; Games turns active on `#games` and the others still do on theirs. At 400px and below the second tab reads "Reading". At 390 and 360px the five tabs don't fit: the row swipes sideways (no scrollbar), the current tab is always in view (open Leaderboard, then Collection), and the page itself doesn't scroll sideways
- [ ] Intro: "42 games and 72 DLCs"; chips All 42 · Main games 15 · Spin-offs 3 · Handheld 4 · Mobile 14 · Browser 2 · VR 4 (kinds with no games have no chip). **Main games is selected on load** (15 cards, Assassin's Creed first, Black Flag Resynced last); the rest of this section is with All picked unless it says otherwise. Mobile shows the 14 phone and tablet games; VR shows Escape the Lost Pyramid, The Temple of Anubis, Beyond Medusa's Gate and Nexus VR; Handheld shows Altaïr's Chronicles, Bloodlines, Discovery and Liberation; Browser shows Project Legacy and Freerunners
- [ ] Release (the default order) with All picked: a grid of box-art cards, Assassin's Creed (mobile) first (Gameloft's phone game came out a week before the console game), Black Flag Resynced last with the kind line "Remake"; Liberation reads "Handheld · PS Vita", Bloodlines "Handheld · PSP", Project Legacy "Browser · Facebook" and Freerunners just "Browser", Assassin's Creed II Multiplayer "Mobile · iOS", the Gameloft games "Mobile", the three VR venue games "VR · Location-based" and Nexus VR "VR · Meta Quest"; each card shows "year · Set …" and "N DLCs" / "N items" pills (Valhalla: 13 DLCs, 48 items). All covers are the same height and no title is cut off (1600 to 360px). Two columns on phones
- [ ] Story order: 8 era headings with game counts (Ancient World 4 first), then "Across eras 8" last for the games with no single setting (Project Legacy, Freerunners, AC II Multiplayer, Multiplayer Rearmed, Recollection, Memories, The Tower, Nexus VR); Escape the Lost Pyramid sits under 20th Century (1928); High Middle Ages runs Assassin's Creed (mobile), Altaïr's Chronicles, Assassin's Creed, Bloodlines; Rebellion's three campaigns stay on its card, not rows of their own; years read "431 BCE"; Ancient World runs Beyond Medusa's Gate (445 BCE), Odyssey, Those Who Are Treasured, Origins, The Temple of Anubis, The Hidden Ones, The Curse of the Pharaohs; Valhalla is followed by Wrath of the Druids, Shared History: The Raven and the Cuckoo, The Siege of Paris, A Fated Encounter and The Last Chapter; Black Flag Resynced sits right after Black Flag ("Remake of …"). Long DLC names on the cards cut off rather than widening them at 360px
- [ ] The order choice survives a reload; the chip and search don't (a reload is back on Main games)
- [ ] Search ignores case and accents: with All picked, "ragnarok" finds Valhalla only, "chronicles" the three Chronicles, Altaïr's Chronicles and Arno's Chronicles; "(mobile)" the five Gameloft games (on Main games, "chronicles" finds only Unity and "(mobile)" nothing); typing keeps focus in the box and gives it the gold edge; "xyz" shows "No games match your search." and **Clear search and filters**, which picks All and brings all 42 back (keeping the order)
- [ ] A card goes to the game's page (`#games/<slug>`), at the top, with focus on its title; a story-order DLC row goes there scrolled to the DLC, highlighted. Ctrl+click opens a new tab instead. The page fades in (no fade with reduced motion), and nothing scrolls smoothly on the way in or back
- [ ] Valhalla's page: "Games › Assassin's Creed Valhalla" breadcrumb and the title; a header card with the box art (left; above the facts on phones), "Main game", Developer Ubisoft Montreal, Set 872–878, Released 10 Nov 2020, its platforms, the description, "13 stories in Complete Lore →", "Show in the collection →", Copy link and "0 / 48 owned 0%"; Characters 20 as rows with portraits, A–Z from Alfred the Great, each a link to the character's page; DLCs 13, as Expansions (3), Story missions (5), Game modes (4) and Discovery Tour (1), five with "Own place in the lore". The DLCs are cards: the cover across the top, then the Played tick beside the name and the facts one to a line (setting, release date, the note, "Own place in the lore" in gold); 180 px columns (8 at 1600, 5 at 1200, 4 at 1000) and two columns on phones, each group starting a new row under its label; a release date stays on one line above 768 px. Odyssey: Expansions 2, Story missions 4, Game modes 1 (Story Creator Mode), Discovery Tour 1; its two episodic expansions list their episodes one to a line; long names like "Discovery Tour by Assassin's Creed: Ancient Greece" wrap at 360px. Then In the collection 48 item cards, and links to the games before and after it in release order, by name ("← Beyond Medusa's Gate", "Assassin's Creed: Freerunners →"; Assassin's Creed (mobile) has only a next link)
- [ ] Altaïr's Chronicles (`#games/assassins-creed-altairs-chronicles`, accents folded in the address): seven platforms on one line, Characters 2, no Complete Lore or collection link and no owned bar (no items yet: "No items of … in the catalogue yet."), no DLC section. Assassin's Creed (mobile): no Characters section either. Freerunners: Released 2021. Rebellion: Behaviour Interactive, 21 Nov 2018, DLCs 3 as Story missions (Norway, Caribbean and Naples Campaigns, free updates). Pirates' platforms read PC · iOS · Android · Windows Phone. Black Flag's Freedom Cry says "Also sold standalone (2014)"
- [ ] AC II shows "Also released as: The Ezio Collection (2016)"; Assassin's Creed has no DLC section and no "Also released as"; DLCs without cover art of their own (Shadows' free updates, Valhalla's River Raids, Mastery Challenge and Tombs of the Fallen, some edition missions) show their game's box art, blurred and darkened, under the gold controller icon (Shadows' page: 5 of its 7 cards; the story DLCs with their own place in the lore all have covers today, so the timeline and Complete Lore show none); Rogue, Rebellion and Identity have no DLC art at all and show their own cover that way; AC II's three Templar lairs say "Edition bonus level"; AC III's Benedict Arnold Missions say "PS3 and PC only"; The Tyranny of King Washington keeps its episode dates
- [ ] Black Flag Resynced's "Remake of" links to Black Flag's page, and Black Flag's "Remade as" links back
- [ ] Played on a game's page: under the links, a purple **Played** switch, then (only while played) a **Finished** date, then "0 / 13 DLCs played" on a game with DLCs (Assassin's Creed has none, so no count). Ticking it shows the date; picking a date saves it; unticking clears the date; focus stays on the switch (Space works). Each DLC card has a round Played tick beside its name, under the cover (an empty ring; ticked, filled purple with a dark tick), at every width; ticking it gives the card a purple edge, and the count follows. Tab reaches each tick with the gold ring and Space ticks it; focus stays on it after the page redraws. All of it survives a reload
- [ ] A played game's card has a purple edge (purple on hover too, not gold) and a purple "Played" badge first in its pills; in story order its card shows the badge above the counts, and a played story DLC row (Wrath of the Druids) its own badge. Unplayed cards look as before
- [ ] Above the cards, "N / M played" with a gold bar (at most 420px wide) counts the games shown: Main games "1 / 15 played", All "1 / 42", a search for "valhalla" "1 / 1"; the empty state has no bar
- [ ] The breadcrumb or Back returns to the list where it was scrolled, with the same chip and order, and focus on the card that opened the page
- [ ] A character row opens that character's page; Back returns to the game's page with focus on the row
- [ ] "N stories in Complete Lore" opens the order filtered to the game (Origins: `#reading/complete/origins`), and Back returns to the page; "Show in the collection" opens the grid filtered to the game, and Back returns to the page
- [ ] Share copies `https://acdb.theprivategeek.com/#games/<slug>` with "Link copied!" (the native share sheet on phones); the pasted link opens that game
- [ ] An item card on a page opens the item modal over it (the address stays `#games/<slug>`); ticking Owned updates the card and the owned bar; Back, Esc or ✕ closes the modal and the page stays
- [ ] Phone: a 96px cover sits above the facts, which run full width; a cast of more than six shows six rows and "Show all N characters" (Black Flag: 18), which shows the rest and moves focus to the seventh (it stays open when the page refreshes after a change to the collection); above 768px the whole cast always shows, with no button
- [ ] Signed in: the header, the account menu and the sync banner behave as on the other tabs (the banner only shows on the collection)

## 21. Characters
The Characters tab (`#characters`, `js/characters-view.js`) lists `js/characters.js`. Counts below are for today's data (210 characters, 491 tagged items).
- [ ] Characters turns active in the header on `#characters` and on a character's page
- [ ] Intro "210 characters so far"; chips All 210 · Assassins 88 · Templars 39 · Isu 9 · Others 74, with All picked on load
- [ ] Characters from the books, comics and film (33 of them) show where they come from on their card instead of a games pill ("Comics: Assassins, Uprising" on Charlotte de la Cruz, "Film: Assassin's Creed (2016)" on Aguilar), and their page has a Stories line and no Games section. Characters in games with stories too (Galina Voronina, Otso Berg) show the Stories line on their page only. Searching "uprising" or "last descendants" finds them by their stories; "soar of eagles" finds Roshan and Fuladh. Eleven have no portrait and show the gold emblem (Ethan Frye, Darius Gift, Tomo, Simon Hathaway, Owen Meyers, Javier Mondragón, Pierrette Arnaud, Simeon Price, Geirmund Hel-hide, Niamh of Argyll, Sef Ibn-La'Ahad)
- [ ] Every card and page shows a head-and-shoulders portrait (no stretched or squashed faces; Altaïr and Connor hooded); a character without an `image` would show the gold emblem instead (remove one locally to check). The sources line ends "Character art © Ubisoft", and the footer says game cover art and character art are © Ubisoft
- [ ] A–Z (the default): Achilles Davenport first, Yasuke last; accents don't change the order (Adéwalé after Achilles, Niccolò before Ratonhnhaké:ton). Each card: the gold side line ("Assassin", "Templar · Historical figure", "Assassin · Historical figure" for Yasuke and Giovanni Borgia, or "Historical figure" for Leonardo, Caterina, Blackbeard, Washington, Cleopatra and Oda Nobunaga; nothing for Sofia, Kassandra, Alexios and Sigurd), the name, "Born 1459 · Renaissance" (Minerva and Juno: just "Ancient World"; Achilles "Born c. 1710"), "Also known as Connor, Connor Kenway" on Ratonhnhaké:ton, three lines of description, and "N games" / "N items" pills (Ezio: 4 games, 62 items; Lucrezia: 1 game, no items pill). Three columns at 1200px, one at 390px
- [ ] Story order: Ancient World 35 (the nine Isu first, A–Z from Aita; Leonidas in 480 BCE, the Odyssey cast in 431 BCE, Darius in 429 and Pythagoras in 422; Bayek and Khemu in 49 BCE, Brutus and Cassius in 47 BCE, Aquilus last; Kassandra reads "Born 458 BCE · Ancient World"), Early Middle Ages 25 (Li E first, then Eivor, Sigurd and Styrbjorn in 855; Basim and the Mirage cast from 861; Niamh of Argyll last), High Middle Ages 12 (Abbas Sofian, Al Mualim and Altaïr in 1189, then Malik, Maria and Robert de Sablé in 1191, Sef in 1197, Darim in 1227, Maffeo and Niccolò Polo in 1257, Jacques de Molay in 1307 and Numa Al'Khamsin last), Renaissance 36 (Ezio, Giovanni and Maria Auditore da Firenze in 1459 first), Colonial Era 29 (Tom Stoddard first, William Johnson last), Age of Revolution 16 (Napoleon Bonaparte last), Industrial Age 25 (Arbaaz Mir, Ethan Frye and Pyara Kaur in 1841 first, Jack the Ripper last), 20th Century 9 (Lydia Frye first; Callum and Joseph Lynch in 1986 last), Modern Day 23 (Desmond, Layla and the modern-day team; Alan Rikkin with the 2012 group, Sofia Rikkin, Victoria Bibeau, Arend Schut-Cunningham and Kiyoshi Takakura with 2016). The order survives a reload; the chip and the search don't
- [ ] Search ignores case, accents and apostrophes: "connor" finds Ratonhnhaké:ton, "obrien" and "o'brien" Liam O'Brien, "mutazz" Abu 'Abdallah, "altair" Altaïr, "blackbeard" Edward Thatch, "alexander" Rodrigo Borgia, "amunet" Aya, "jayadeep" Henry Green, "banu musa" all three brothers, "el cakr" Numa Al'Khamsin (and Jonathan Hawk, whose stories include the El Cakr volume), "maria" María, "cult of kosmos" the Cultist of Kosmos; typing keeps focus in the box with the gold edge; "zzz" shows "No characters match your search." and **Clear search and filters**, which picks All and brings back all 210 (keeping the order)
- [ ] Templars shows 39; Isu shows nine (Aita, Aletheia, Hades, Hermes Trismegistus, Juno, Jupiter, Minerva, Persephone, Poseidon); "zeus" and "tinia" find Jupiter, "kore" Persephone; Juno and Aita list each other as wife and husband, and so do Persephone and Hades; Khemu shows "Bayek of Siwa (father), Aya (mother)", Cleopatra "Ptolemy XIII (brother)"; Kassandra "Myrrine (mother), Nikolaos (stepfather), Leonidas (grandfather)" and Alexios and Pythagoras no Family row; Sigurd "Styrbjorn (father), Randvi (wife), Eivor Varinsdottir (foster sister)", Eivor "Styrbjorn (adoptive father), …"; Ivarr, Ubba and Halfdan list each other as brothers; Callum "Joseph Lynch (father), Aguilar de Nerha (ancestor)", Charlotte de la Cruz "Tom Stoddard (ancestor), Ignacio Cardona (ancestor)", Alan Rikkin "Sofia Rikkin (daughter)"; Altaïr "Maria Thorpe (wife), Darim Ibn-La'Ahad (son), Sef Ibn-La'Ahad (son), Desmond Miles (descendant)", Darim "Altaïr Ibn-La'Ahad (father), Maria Thorpe (mother), Sef Ibn-La'Ahad (brother)", Niccolò Polo "Maffeo Polo (brother)" and Maffeo "Niccolò Polo (brother)", Naoe "Tsuyu (mother)"
- [ ] Game chips under the faction chips: "All games 210" picked on load, then one chip per game with characters in release order with short names (AC1 9, Altaïr's Chronicles 2, AC2 26, Bloodlines 2, Discovery 2, Brotherhood 17 … Mirage 10, Shadows 4, Resynced 13; hovering AC2 shows "Assassin's Creed II"), and "Books, comics & film 33" last. Each chip shows exactly its count of cards (Mirage: Basim, Roshan and the eight Mirage characters); Books, comics & film shows the 33 characters in no game, none with a games pill
- [ ] Game and faction chips combine (AC3 + Templars: Haytham, Charles Lee, Birch, Johnson, Hickey, Pitcairn, Church, Vidic, Daniel Cross), and so do the search (Black Flag + "edward": Edward Kenway and Edward Thatch) and Story order (Black Flag: Ancient World 1, Colonial Era 14, Age of Revolution 1, Modern Day 2). Isu + Mirage says "No characters match your filters."; with text in the search it says "…your search."; **Clear search and filters** resets the search, the faction and the game
- [ ] The picked game stays picked when the order changes and after opening a card and coming back (focus returns to the card); a reload goes back to All games. At 390 and 360px the game row scrolls sideways inside itself (the page doesn't), and after a page and back the picked chip (e.g. Books, comics & film) is scrolled into view
- [ ] A card opens the page (`#characters/<slug>`; Ctrl+click opens a new tab): "Characters › Name" breadcrumb, the name as the title, a header card with the side badge, Born, Era and Also known as, the description and "0 / 62 owned 0%" (Ezio); Games 4 as rows with covers (Main game / Handheld kind lines); In the collection 62 item cards; links to the characters before and after it in A–Z order, by name (Achilles has only "Adéwalé →"). Focus moves to the page title. At 360px the badge "Templar · Historical figure" (Laureano Torres y Ayala) wraps onto two lines inside the card
- [ ] Characters with no items (Lucrezia, Caterina, Giovanni, Sofia, Washington, Minerva, Oda Nobunaga) say "No items of <name> in the catalogue yet."
- [ ] The breadcrumb or Back returns to the list where it was scrolled, with focus on the card that opened the page; the page fades in and out (no fade with reduced motion, and no card lift)
- [ ] Family rows: Henry Green shows "Family: Arbaaz Mir (father), Pyara Kaur (mother)", Arbaaz "Pyara Kaur (wife), Henry Green (son)", Ethan Frye "Jacob Frye (son), Evie Frye (daughter)", Jacob "Ethan Frye (father), Evie Frye (twin sister), Lydia Frye (granddaughter)", the Disraelis each other; names are gold links with the relation in grey, commas between; a link opens that page at the top with focus on its title, and Back returns. Ezio lists seven (his parents, Federico, Claudia, Mario, Sofia and Desmond as his descendant); Desmond lists William Miles, the six ancestors he relives and Sef Ibn-La'Ahad. Characters without relatives here (Leonardo, Kassandra) have no Family row. At 360px each relative wraps whole, with no sideways scroll. Searching "the ghost" finds Henry Green; "underworld" finds Henry, Ethan, Abberline, Arbaaz and Pyara; "brahman" Arbaaz and Pyara
- [ ] An item card on a page opens the item modal over it (the address stays `#characters/<slug>`); ticking Owned updates the card and the "owned" bar; Back, Esc or ✕ closes the modal and the page stays. In that modal, the link to the same character just closes it
- [ ] A game row goes to the game's page; Back returns to the character's page, scrolled where it was, with focus on the row. Ctrl+click on a row opens it in a new tab
- [ ] 360px: nothing scrolls sideways on the list or a page; long names (Claudia Auditore da Firenze) wrap
- [ ] Signed in: the header, the account menu and the sync banner behave as on the other tabs; owning an item on another device updates the page after sync
- [ ] Tab reaches the search, the order buttons, the faction chips, the game chips and every card with the gold ring; Enter picks a chip (focus stays on it) or opens a card

## 22. Static pages (item/, items/)
The pages search engines read: one per item at `/item/<slug>`, and list pages under `/items/`. `tools/build-item-pages.py` writes them and `sitemap.xml`; never edit them by hand. Preview with `python3 tools/serve.py` (plain `http.server` answers `/item/<slug>` with 404).
- [ ] `/items/` lists 17 categories and 21 games with counts; each category count and each game count adds up to the catalog size
- [ ] An item page (a portrait photo, a landscape one, the 110-character "The World of Assassin's Creed Valhalla…" name, Assassin's Creed: Renaissance with its series and character, Naoe's bust with its 23-character description) shows the photo without a jump while it loads, the facts (Game and Category link to their list pages, Type only when it differs from the category, Series when there is one, the id pill), the description, Contents, Characters (links into the app's character pages) and up to six related items
- [ ] **Track it in your collection** opens the app with that item's card open
- [ ] The breadcrumb leads to the category page and from there to `/items/`; the logo and **Open the database** go to the app
- [ ] The General list (146 items), Chronicles: India (2) and Art and reference books (grouped under their types) read well at 1600 and 390 px; rows read left to right, two columns on a desktop, one on a phone
- [ ] 1600, 1200, 1000, 390 and 360 px: nothing scrolls sideways on an item page, `/items/` or the General list
- [ ] Tab through an item page: logo, Open the database, breadcrumb, Game, Category, the characters, Track it, the related items, the footer links, all with the gold ring
- [ ] No console messages and no CSP violations (the structured data block is data, not a script); the photo's width and height match the file
- [ ] An old slug (`/item/ubicollectibles-bayek-figurine`) moves straight to the current page (`/item/ubicollectibles-bayek-statue`)
- [ ] With JavaScript off, the homepage's paragraph links to `/items/`, and every item is reachable from there
- [ ] The footer of the app and of the privacy page starts with **Browse all items**
- [ ] View source on an item page: one `<h1>`, a canonical link to its own address, `og:image` with its width and height, and a breadcrumb `BreadcrumbList`

---

## Quick Test (for item additions only)
- [ ] Page loads without errors
- [ ] `python3 tools/validate-catalog.py` reports OK
- [ ] New item appears in grid
- [ ] New item's image displays (after `python3 tools/convert-to-webp.py` and `python3 tools/build-thumbs.py`)
- [ ] `python3 tools/build-share-pages.py` and `python3 tools/build-item-pages.py` were run; the new item has its page at `/item/<slug>` and is on its category and game lists
- [ ] Filters show updated counts
- [ ] Footer item count is correct
