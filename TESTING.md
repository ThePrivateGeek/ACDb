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

## 2. Search
- [ ] Type in search box — results filter live
- [ ] Clear button (x) appears when typing
- [ ] Clear button resets search and shows all items
- [ ] Result count updates as you type
- [ ] "Nothing is true..." message shows for zero results

## 3. Filters
- [ ] Game multi-select — check a game, items filter
- [ ] Category multi-select — check a category, items filter
- [ ] Type multi-select — check a type, items filter
- [ ] Series multi-select — check "Assassin's Creed: Assassins", exactly 17 items show (14 issues + 3 volumes)
- [ ] Series can span types — "Assassin's Creed: Last Descendants" shows 3 novels + 5 Locus comics (8 items)
- [ ] Series dropdown is visible with no filters set, and disappears when a category with no series is selected (e.g. Statue)
- [ ] Owned filter — "Owned Only", "Not Owned", "Wishlist" all work
- [ ] "Missing Stories" — only story publications you have in no edition, each story once: owning Origins Special Edition hides Origins #1–4 and the Origins (Comic) volume; owning The Fall #1–3 hides the Fall & Chain Collected Edition and Subject 4 but shows The Chain; owning nothing of Uprising shows Vols. 1–3 and none of its issues. The count reads "Showing N missing stories"; the choice survives a reload
- [ ] Read filters — "Read" shows only items marked read; "Not Read" shows only unread story publications (164 total with nothing read), never statues or art books
- [ ] Sort — Default, Year asc/desc, Name A-Z/Z-A, Recently Added
- [ ] Filters cascade: selecting a game narrows Category options, selecting a category narrows Type options, selecting a type narrows Series options
- [ ] Clear (x) button on each multi-select resets that filter
- [ ] A filter with a value (search text, a ticked game/category/type/series, a status other than "All Items") has a gold edge and a faint gold tint; untouched filters and Sort stay plain. Holds after a reload, clears with "Clear search and filters" and the logo, and the status dropdown's option list stays dark
- [ ] Type and Series search boxes filter options as you type

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

## 9. Lightbox
- [ ] Image shows full-screen on dark background
- [ ] Navigation arrows work
- [ ] Arrow keys work
- [ ] Touch swipe works
- [ ] Counter shows "1 / 3" etc.
- [ ] Escape closes lightbox
- [ ] Clicking background closes lightbox

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

## 12. Back up / Restore (account menu)
- [ ] **Back up to file** downloads a JSON file with today's date in filename
- [ ] Export includes all collection fields (owned, wishlist, condition, copies, price, date, notes, hasRead, readDate)
- [ ] An item that is only marked read (not owned) is included in the export and restores on import
- [ ] Toast shows "Exported X items"
- [ ] **Restore from file** — select the exported file, data restores
- [ ] Toast shows "Imported X of Y items"
- [ ] Import with invalid file shows error toast
- [ ] Export never contains `updatedAt` (sync bookkeeping stays out of export files)

## 13. URL Hash Routing
- [ ] Opening a card updates the URL hash (e.g., #assassins-creed-ii-black-edition)
- [ ] Pasting a URL with hash opens directly to that item
- [ ] Browser back button closes the modal
- [ ] Closing modal clears the hash
- [ ] Share page redirects into the app: `/s/<slug>.html` loads and lands on `/#<slug>` with the item modal open
- [ ] Old links of renamed items still work: `/#mcfarlane-toys-connor-with-mohawk-action-figure-series-3` opens the Series 2 figure and the address switches to its current slug; `/s/assassins-creed-the-jade-seal` lands on Chang'an Wang
- [ ] After adding items, `python3 tools/build-share-pages.py` was re-run (623+ pages, no warnings)
- [ ] `#games` opens the Games tab; `#games/assassins-creed-valhalla` opens it with Valhalla's dialog; `#games/nope` shows the tab and the address becomes `#games`
- [ ] Old links still work: `#reading/games` becomes `#games`, and `#reading/games/ii` becomes `#games/assassins-creed-ii` with AC II's dialog open
- [ ] Back closes a game dialog (from the Games tab and over Complete Lore) and stays on the view underneath
- [ ] `#characters` opens the Characters tab; `#characters/ezio-auditore-da-firenze` opens Ezio's page; `#characters/nope` shows the list and the address becomes `#characters`

## 14. Admin / Dev Tool
- [ ] `localStorage.setItem('acdb_admin', 'true')` shows "Add Item" button
- [ ] Clicking "Add Item" opens the Code Generator
- [ ] Game dropdown populates with all games
- [ ] Type dropdown populates with all types
- [ ] "New" game toggle shows/hides game input fields
- [ ] Code preview updates live as you type
- [ ] Generated entry starts with `"id"`, set to one more than the highest id in use
- [ ] Read Link field adds a `"read"` line after `"series"`. Pasting an archive.org reader URL from the anthology emits the plain book path, e.g. `07. AC Templars/AC Templars 2016 (3)`
- [ ] New game generates app.js code entries
- [ ] "Copy Code" copies to clipboard with toast
- [ ] Escape closes the dev tool

## 15. Responsive / Mobile
- [ ] Phones: search on top, then **Filters** and the grid/list control; Filters opens the six filters below (closed on load). With filters set, the button shows how many (two games + Owned Only = 3) and turns gold while open; desktop shows the filters as before
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
- [ ] `python3 tools/validate-catalog.py` reports OK (it also runs automatically as the pre-commit hook). It covers unique ids and names, required fields, known games and categories, image mappings and files, read links, share pages, and the old slugs in `js/slug-aliases.js`. For `js/games.js` it checks each game's kind, developer, platforms (known names, in the validator's `PLATFORMS` order), description (a warning past 300 characters), re-releases and URL slug, and each DLC's type; a lore place (`marker`) only on expansions and story DLCs of main, spin-off and handheld games with a year. For `js/characters.js` it checks each character's id (unique, each new one higher), name and URL slug, side, year, games (from `js/games.js`, main, spin-off or handheld only, in release order) and description (a warning past 300 characters), and that every item's `characters` lists existing ids, each once
- [ ] Collection data keyed by item id under `acdb_collection_v2`, each entry with an `updatedAt` edit time once edited; a name-keyed `acdb_collection` from before ids is migrated once on load (unmatched keys are dropped) and kept as a backup until 2027-01-03, after which it is removed from browsers that have `acdb_collection_v2`
- [ ] Export includes `id` and `name`; Import accepts both new exports (by id) and old ones (by name)
- [ ] Shared profiles upload item ids; profiles uploaded before ids (item names) still display. Profiles and the leaderboard are served from D1
- [ ] `node tools/test-sync-merge.mjs` passes (cloud-sync merge rules)
- [ ] Read links still open a book: archive.org returns 200 even for a missing book, so open a few (especially ones with parentheses in the path) and check the reader shows a cover, not an empty item page

## 17. Account & Cloud Sync
Local testing: run `python3 -m http.server 8000` and use `http://localhost:8000` (it talks to the live API; `http://127.0.0.1:8000` has separate storage, so it works as a second device). Only Google accounts listed as test users can sign in while the Google app is in Testing.
- [ ] Signed out: header shows **Sign in ▾** (person icon); its menu leads with **Sign in with Google**, then Back up to file, Restore from file, Privacy; after owning an item, the banner appears; ✕ hides it for good (survives reload)
- [ ] Banner is hidden on profile and leaderboard views
- [ ] Sign in from an open item: Google account chooser → back on the same item, signed in; no `?code=` left in the address bar
- [ ] Cancelling on Google's page shows "Sign-in cancelled"
- [ ] Account button shows the initial with a sync dot (green when synced); menu shows the email and sync status, then Back up to file, Restore from file, Download all account data, Privacy, Sign out, Delete account; Esc, clicking outside, and choosing an item close it
- [ ] Mark an item owned: the dot pulses, then turns green within ~3 seconds
- [ ] Second browser/device signed in to the same account shows the change after switching to its tab (or reloading)
- [ ] Same item edited on two devices: the later edit ends up on both
- [ ] Mark a novel read (with a Finished date) without owning it: it syncs to the second device with both read fields intact
- [ ] First sign-in on a browser whose items differ from the account: the "Combine your collections" dialog shows the counts; each choice behaves as described; "Download a backup" saves an export; Esc doesn't close it
- [ ] Offline (DevTools → Network → Offline): edits still save, the dot turns amber; back online they sync
- [ ] Two tabs open: an edit in one appears in the other; edits made in both at once all survive
- [ ] Not published: header shows **Publish collection**; its window reads "Publish Your Collection" / "Get a public page to show friends, and a spot on the Leaderboard"; after publishing the button leaves the header and **My public profile** appears in the account menu, opening "Your Public Profile"
- [ ] Leaderboard, not published: "Want to be on here? **Join the Leaderboard**" sits above the list and opens the publish window without leaving the leaderboard, which refreshes after publishing ("You're on the board as …")
- [ ] Publish while signed in: the profile is created without a token; the manage window has no Update button and says it updates automatically; owning more items updates the profile and leaderboard
- [ ] Signing in on a browser that shared a profile before sign-in existed links that profile (toast) and it starts updating automatically
- [ ] **Download all account data** downloads `acdb-account-<date>.json`
- [ ] **Sign out**: the grid shows nothing owned; signing in again brings everything back
- [ ] **Delete account**: confirm dialog; afterwards signed out, the collection is still in the browser, and the public profile is gone
- [ ] `privacy.html` opens from the footer and the account menu, and looks right on mobile
- [ ] Fresh private window: no requests to `accounts.google.com` until Sign in is clicked (Network tab; `fonts.googleapis.com` is the site's fonts and was always there)

## 18. Reading Order
- [ ] Reading Order tab in the header opens `#reading` and turns active (Leaderboard likewise for `#leaderboard`; a profile leaves no tab active): grid, toolbar and stats are hidden; tabs read Complete Lore (active), By Series, Oliver Bowden Novels, Non-canon Stories (the games have their own tab, section 20)
- [ ] Complete Lore: 120 entries under 9 era headings (Ancient World … Modern Day), each with a read count; numbering runs on across headings; Forgotten Myths #1 first, Escape Room Puzzle Book last; Trial by Fire #1–5 sit together at 1692
- [ ] Era headings fold: all start open with a chevron and "Collapse all"; clicking a heading folds it (count stays visible) and the button turns to "Expand all"; folding survives marking books read and leaving/returning to the tab (until reload); "Up next" opens a folded section and lands on the book; release-year headings fold the same way; series and Bowden pages have no sections
- [ ] Complete Lore shows the games among the books: 31 compact rows with a gold stripe down the left edge (not dashed; the stripe stays during the flash after a link jumps to a row), a small cover and a gold kind line on top ("Game" or "Story DLC · Black Flag"); in one column (1000 px and below) they are indented so their covers line up with the book covers, in two columns they start flush in their cell (21 games and 10 story DLCs, each with its cover art uncropped, the two Crossover Stories sharing one; no Black Flag Resynced), unnumbered and without a Read switch; the books stay numbered 1–120 and the progress and era counts count books only. Assassin's Creed II sits between Heresy and Renaissance; Odyssey comes before the Odyssey novel. The handheld games sit by their year: Altaïr's Chronicles (1190) before Assassin's Creed, Bloodlines (1191) right after it, Discovery (1491) after Assassin's Creed II. Only main, spin-off and handheld games with a story year get a row (mobile, browser and VR games stay on the Games tab)
- [ ] "Show games" switch (on by default) hides the game rows; the choice survives a reload. With a game filter only that game's rows show (Black Flag: the game, Aveline and Freedom Cry); "Original stories" has none
- [ ] A book you have only in a collected edition says "Owned in <edition>" (owning Origins Special Edition: Origins #1–4 say "Owned in Origins Special Edition")
- [ ] "Only missing" switch (off by default) hides the books you have in any edition, on the orders and series pages; the rest keep their numbers, era sections left empty disappear, "Up next" hides, and an order with nothing missing says "You have every book here, in one edition or another." The choice survives a reload
- [ ] A game row's title or cover opens the game's dialog over the list: the address stays (`#reading/complete`), the list keeps its scroll and folds, and Back, Esc or ✕ close it and put focus back on the row. A DLC row (Wrath of the Druids) opens its game's dialog with the DLC highlighted. Ctrl+click opens `#games/<slug>` in a new tab
- [ ] In a dialog over Complete Lore, "N items in the collection" opens the grid filtered to the game; one Back returns to Complete Lore without the dialog, a second leaves Reading Order. "12 stories in Complete Lore" on Valhalla's already-filtered list just closes the dialog
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
- [ ] Read toggle on a row marks the book read: purple border, "X / 9 read" and the bar update; the item's own modal shows Read too
- [ ] Clicking a cover or title opens the full modal on top of the view; the address stays `#reading`; category/type/game/series aren't filter links there
- [ ] In that modal: "Next: …" swaps to the next book in place; marking Read updates the list underneath; Esc, ✕ and browser back all close it and leave the view
- [ ] Item modal from the grid: books in an order show "Reading order · <order> · N of M · Next: …" (position follows the chosen mode; the last book says "Last book"); Bowden novels show two lines (Complete Lore and Oliver Bowden Novels); clicking an order name opens that tab
- [ ] No reading order line for items outside an order, or in read-only (profile/leaderboard) modals
- [ ] The **Collection** tab returns to the grid with no hash; pasting `/#reading/bowden` opens that tab directly
- [ ] Phone width: rows fit without horizontal scroll, the Read label hides and the switch stays
- [ ] `validate-catalog.py` covers `js/reading-orders.js` (unknown item, non-readable type, duplicate, missing setting, bad date are errors) and `js/games.js` (a main game or spin-off not on the timeline, a duplicate, a bad date, a DLC with a place in the lore but no year, a bad episode date, a remake of an unknown game are errors; the newer games checks are in section 16)

## 19. Design System
The rules are in [DESIGN.md](DESIGN.md) (its section 13 is the definition of done); tokens live at the top of `css/style.css` and component rules use only them. Check at 1600, 1200, 1000, 390 and 360px, signed in and out.
- [ ] No page scrolls sideways at any of those widths (collection, every reading tab, a series page, the Games tab in both orders and with a game dialog open, the Characters tab in both orders, a character's page, leaderboard, a profile, privacy)
- [ ] Tab through the collection, the reading view, the Games tab, the Characters tab and an open item modal: every control (links, buttons, chips, dropdown options, Read/Owned switches, fold headings, game cards) shows the same 2px gold focus ring; fields also turn their border gold
- [ ] In a game dialog, Tab and Shift+Tab cycle through its controls and never leave it; closing returns focus to the card or row that opened it
- [ ] The filter dropdowns work from the keyboard: Tab into the options, Space ticks one
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
The Games tab (`#games`, `js/games-view.js`) lists `js/games.js`. Counts below are for today's data (42 games, 71 DLCs).
- [ ] The header reads Collection · Reading Order · Games · Characters · Leaderboard; Games turns active on `#games` and the others still do on theirs. At 400px and below the second tab reads "Reading". At 390 and 360px the five tabs don't fit: the row swipes sideways (no scrollbar), the current tab is always in view (open Leaderboard, then Collection), and the page itself doesn't scroll sideways
- [ ] Intro: "42 games and 71 DLCs"; chips All 42 · Main games 15 · Spin-offs 3 · Handheld 4 · Mobile 14 · Browser 2 · VR 4 (kinds with no games have no chip). **Main games is selected on load** (15 cards, Assassin's Creed first, Black Flag Resynced last); the rest of this section is with All picked unless it says otherwise. Mobile shows the 14 phone and tablet games; VR shows Escape the Lost Pyramid, The Temple of Anubis, Beyond Medusa's Gate and Nexus VR; Handheld shows Altaïr's Chronicles, Bloodlines, Discovery and Liberation; Browser shows Project Legacy and Freerunners
- [ ] Release (the default order) with All picked: a grid of box-art cards, Assassin's Creed (mobile) first (Gameloft's phone game came out a week before the console game), Black Flag Resynced last with the kind line "Remake"; Liberation reads "Handheld · PS Vita", Bloodlines "Handheld · PSP", Project Legacy "Browser · Facebook" and Freerunners just "Browser", Assassin's Creed II Multiplayer "Mobile · iOS", the Gameloft games "Mobile", the three VR venue games "VR · Location-based" and Nexus VR "VR · Meta Quest"; each card shows "year · Set …" and "N DLCs" / "N items" pills (Valhalla: 12 DLCs, 47 items). All covers are the same height and no title is cut off (1600 to 360px). Two columns on phones
- [ ] Story order: 8 era headings with game counts (Ancient World 4 first), then "Across eras 8" last for the games with no single setting (Project Legacy, Freerunners, AC II Multiplayer, Multiplayer Rearmed, Recollection, Memories, The Tower, Nexus VR); Escape the Lost Pyramid sits under 20th Century (1928); High Middle Ages runs Assassin's Creed (mobile), Altaïr's Chronicles, Assassin's Creed, Bloodlines; Rebellion's three campaigns stay on its card, not rows of their own; years read "431 BCE"; Ancient World runs Beyond Medusa's Gate (445 BCE), Odyssey, Those Who Are Treasured, Origins, The Temple of Anubis, The Hidden Ones, The Curse of the Pharaohs; Valhalla is followed by Wrath of the Druids, The Siege of Paris, A Fated Encounter and The Last Chapter; Black Flag Resynced sits right after Black Flag ("Remake of …"). Long DLC names on the cards cut off rather than widening them at 360px
- [ ] The order choice survives a reload; the chip and search don't (a reload is back on Main games)
- [ ] Search ignores case and accents: with All picked, "ragnarok" finds Valhalla only, "chronicles" the three Chronicles, Altaïr's Chronicles and Arno's Chronicles; "(mobile)" the five Gameloft games (on Main games, "chronicles" finds only Unity and "(mobile)" nothing); typing keeps focus in the box and gives it the gold edge; "xyz" shows "No games match your search." and **Clear search and filters**, which picks All and brings all 42 back (keeping the order)
- [ ] A card or a DLC row opens the game dialog; the address becomes `#games/<slug>`. Ctrl+click opens it in a new tab instead
- [ ] Valhalla's dialog: box art left; "Main game"; Developer Ubisoft Montreal, Set 872–878, Released 10 Nov 2020, its platforms; the description; "12 stories in Complete Lore →" and "47 items in the collection →"; DLCs 12, as Expansions (3), Story missions (4), Game modes (4) and Discovery Tour (1), four with "Own place in the lore". Odyssey: Expansions 2, Story missions 4, Game modes 1 (Story Creator Mode), Discovery Tour 1; long names like "Discovery Tour by Assassin's Creed: Ancient Greece" wrap inside the dialog at 360px
- [ ] Altaïr's Chronicles (`#games/assassins-creed-altairs-chronicles`, accents folded in the address): seven platforms on one line, no Complete Lore or collection link (no items yet), no DLC section. Freerunners: Released 2021. Rebellion: Behaviour Interactive, 21 Nov 2018, DLCs 3 as Story missions (Norway, Caribbean and Naples Campaigns, free updates). Pirates' platforms read PC · iOS · Android · Windows Phone. Black Flag's Freedom Cry says "Also sold standalone (2014)"
- [ ] AC II shows "Also released as: The Ezio Collection (2016)"; Assassin's Creed has no DLC section and no "Also released as"; DLCs without cover art (Shadows' free updates, the edition missions, modes and Discovery Tours) show the controller icon; AC II's three Templar lairs say "Edition bonus level"; AC III's Benedict Arnold Missions say "PS3 and PC only"; The Tyranny of King Washington keeps its episode dates
- [ ] Black Flag Resynced's "Remake of" switches the dialog to Black Flag and the address follows
- [ ] Esc, ✕, a click outside and Back close the dialog: the address goes back to `#games`, focus returns to the card, and the page doesn't jump. A click inside the dialog doesn't close it
- [ ] Focus starts on ✕ when the dialog opens (the ring never outlines the whole dialog), and Tab stays inside it
- [ ] "N stories in Complete Lore" opens the order filtered to the game (Origins: `#reading/complete/origins`), and Back returns to the open dialog; "N items in the collection" opens the grid filtered to the game
- [ ] Share copies `https://acdb.theprivategeek.com/#games/<slug>` with "Link copied!" (the native share sheet on phones); the pasted link opens that game
- [ ] Changing the address from one game to another while a dialog is open switches the dialog in place; Esc still returns focus to the first card
- [ ] Phone: the dialog stacks with a 200px cover on top, and ✕ and Share stay in reach while it scrolls
- [ ] Signed in: the header, the account menu and the sync banner behave as on the other tabs (the banner only shows on the collection)
- [ ] A dev-tool edit with the Games tab open updates the item counts on the cards

## 21. Characters
The Characters tab (`#characters`, `js/characters-view.js`) lists `js/characters.js`. Counts below are for today's data (102 characters, 456 tagged items).
- [ ] Characters turns active in the header on `#characters` and on a character's page
- [ ] Intro "102 characters so far"; chips All 102 · Assassins 58 · Templars 21 · Isu 2 · Others 21, with All picked on load
- [ ] Characters from the books, comics and film (23 of them) show where they come from on their card instead of a games pill ("Comics: Assassins, Uprising" on Charlotte de la Cruz, "Film: Assassin's Creed (2016)" on Aguilar), and their page has a Stories line and no Games section. Characters in games with stories too (Galina Voronina, Otso Berg) show the Stories line on their page only. Searching "uprising" or "last descendants" finds them by their stories. Nine have no portrait and show the gold emblem (Darius Gift, Tomo, Simon Hathaway, Owen Meyers, Javier Mondragón, Pierrette Arnaud, Simeon Price, Geirmund Hel-hide, Niamh of Argyll)
- [ ] Every card and page shows a head-and-shoulders portrait (no stretched or squashed faces; Altaïr and Connor hooded); a character without an `image` would show the gold emblem instead (remove one locally to check). The sources line ends "Character art © Ubisoft", and the footer says game cover art and character art are © Ubisoft
- [ ] A–Z (the default): Achilles Davenport first, Yasuke last; accents don't change the order (Adéwalé after Achilles, Niccolò before Ratonhnhaké:ton). Each card: the gold side line ("Assassin", "Templar · Historical figure", "Assassin · Historical figure" for Yasuke, or "Historical figure" for Leonardo, Caterina, Blackbeard, Washington, Cleopatra and Oda Nobunaga; nothing for Sofia, Kassandra, Alexios and Sigurd), the name, "Born 1459 · Renaissance" (Minerva and Juno: just "Ancient World"; Achilles "Born c. 1710"), "Also known as Connor, Connor Kenway" on Ratonhnhaké:ton, three lines of description, and "N games" / "N items" pills (Ezio: 4 games, 62 items; Lucrezia: 1 game, no items pill). Three columns at 1200px, one at 390px
- [ ] Story order: Ancient World 9 (Juno and Minerva first, Aquilus last; Kassandra reads "Born 458 BCE · Ancient World"), Early Middle Ages 8 (Li E first), High Middle Ages 7 (Abbas Sofian, Al Mualim and Altaïr in 1189, then Malik, Maria and Robert de Sablé in 1191, and Numa Al'Khamsin last), Renaissance 32 (Ezio, Giovanni and Maria Auditore da Firenze in 1459 first), Colonial Era 9 (Tom Stoddard first), Age of Revolution 4, Industrial Age 9 (Jack the Ripper last), 20th Century 6 (Lydia Frye first), Modern Day 18 (Desmond, Layla and the modern-day team). The order survives a reload; the chip and the search don't
- [ ] Search ignores case and accents: "connor" finds Ratonhnhaké:ton, "altair" Altaïr, "blackbeard" Edward Thatch, "alexander" Rodrigo Borgia, "amunet" Aya, "jayadeep" Henry Green, "el cakr" Numa Al'Khamsin (and Jonathan Hawk, whose stories include the El Cakr volume), "maria" María; typing keeps focus in the box with the gold edge; "zzz" shows "No characters match your search." and **Clear search and filters**, which picks All and brings back all 102 (keeping the order)
- [ ] Templars shows 21; Isu shows Juno and Minerva
- [ ] A card opens the page (`#characters/<slug>`; Ctrl+click opens a new tab): "Characters › Name" breadcrumb, the name as the title, a header card with the side badge, Born, Era and Also known as, the description and "0 / 62 owned 0%" (Ezio); Games 4 as rows with covers (Main game / Handheld kind lines); In the collection 62 item cards; links to the characters before and after it in A–Z order, by name (Achilles has only "Adéwalé →"). Focus moves to the page title
- [ ] Characters with no items (Lucrezia, Caterina, Giovanni, Sofia, Washington, Minerva, Oda Nobunaga) say "No items of <name> in the catalogue yet."
- [ ] The breadcrumb or Back returns to the list where it was scrolled, with focus on the card that opened the page; the page fades in and out (no fade with reduced motion, and no card lift)
- [ ] An item card on a page opens the item modal over it (the address stays `#characters/<slug>`); ticking Owned updates the card and the "owned" bar; Back, Esc or ✕ closes the modal and the page stays. In that modal, the link to the same character just closes it
- [ ] A game row opens the game's dialog over the character's page (the address stays `#characters/<slug>`); a click outside, Esc, ✕ or Back closes it back to the page, scrolled where it was, with focus on the row, and one more Back leaves the page (no stale entry). "N stories in Complete Lore" opens the order, and Back returns to the page; Ctrl+click on a row opens the Games tab in a new tab
- [ ] 360px: nothing scrolls sideways on the list or a page; long names (Claudia Auditore da Firenze) wrap
- [ ] Signed in: the header, the account menu and the sync banner behave as on the other tabs; owning an item on another device updates the page after sync
- [ ] Tab reaches the search, the order buttons, the chips and every card with the gold ring; Enter opens a card

---

## Quick Test (for item additions only)
- [ ] Page loads without errors
- [ ] `python3 tools/validate-catalog.py` reports OK
- [ ] New item appears in grid
- [ ] New item's image displays
- [ ] Filters show updated counts
- [ ] Footer item count is correct
