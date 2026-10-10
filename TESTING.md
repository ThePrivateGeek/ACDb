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
- [ ] Read filters — "Read" shows only items marked read; "Not Read" shows only unread story publications (164 total with nothing read), never statues or art books
- [ ] Sort — Default, Year asc/desc, Name A-Z/Z-A, Recently Added
- [ ] Filters cascade: selecting a game narrows Category options, selecting a category narrows Type options, selecting a type narrows Series options
- [ ] Clear (x) button on each multi-select resets that filter
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
- [ ] List view works (toggle button)
- [ ] Cards with images display correctly (top crop)
- [ ] Cards without images show AC logo placeholder
- [ ] Owned badge shows on owned items
- [ ] Wishlist badge shows on wishlist items
- [ ] Clicking a card opens the modal
- [ ] Ctrl+click / right-click "Open in new tab" works
- [ ] URL updates with item slug when card is clicked

## 8. Item Modal
- [ ] Title, game, year, category badge, type badge display correctly
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
- [ ] Sort toggle (% / #) switches between percentage and count sorting
- [ ] By Game — bars show owned/total with percentage, sorted correctly
- [ ] By Category — same as above
- [ ] Condition Breakdown — shows counts, Total Physical Items at top
- [ ] Reading Progress — "Stories Read X/164" at top, then one bar per series plus "Standalone"; clicking a series filters to it (Standalone is not clickable)
- [ ] 100% completion — percentage turns green, checkmark appears
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
- [ ] After adding items, `python3 tools/build-share-pages.py` was re-run (623+ pages, no warnings)

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
- [ ] Filters stack vertically on mobile
- [ ] Cards switch to single column on small screens
- [ ] Modal switches to single column layout below 1024px
- [ ] Timeline scrolls horizontally
- [ ] On phones the account menu opens centred under the button row and stays on screen at 360px
- [ ] Back to Top button appears on scroll, works on tap

## 16. Data Integrity
- [ ] Total item count in footer matches database
- [ ] `python3 tools/validate-catalog.py` reports OK (it also runs automatically as the pre-commit hook). It covers unique ids and names, required fields, known games and categories, image mappings and files, read links, and share pages
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
- [ ] Leaderboard, not published: "Want to be on here? **Join the Leaderboard**" sits above the table and opens the publish window without leaving the leaderboard, which refreshes after publishing ("You're on the board as …")
- [ ] Publish while signed in: the profile is created without a token; the manage window has no Update button and says it updates automatically; owning more items updates the profile and leaderboard
- [ ] Signing in on a browser that shared a profile before sign-in existed links that profile (toast) and it starts updating automatically
- [ ] **Download all account data** downloads `acdb-account-<date>.json`
- [ ] **Sign out**: the grid shows nothing owned; signing in again brings everything back
- [ ] **Delete account**: confirm dialog; afterwards signed out, the collection is still in the browser, and the public profile is gone
- [ ] `privacy.html` opens from the footer and the account menu, and looks right on mobile
- [ ] Fresh private window: no requests to `accounts.google.com` until Sign in is clicked (Network tab; `fonts.googleapis.com` is the site's fonts and was always there)

## 18. Reading Order
- [ ] Reading Order tab in the header opens `#reading` and turns active (Leaderboard likewise for `#leaderboard`; a profile leaves no tab active): grid, toolbar and stats are hidden; tabs read Complete Lore (active), By Series, Oliver Bowden Novels, Non-canon Stories
- [ ] Complete Lore: 120 entries under 9 era headings (Ancient World … Modern Day), each with a read count; numbering runs on across headings; Forgotten Myths #1 first, Escape Room Puzzle Book last; Trial by Fire #1–5 sit together at 1692
- [ ] Era headings fold: all start open with a chevron and "Collapse all"; clicking a heading folds it (count stays visible) and the button turns to "Expand all"; folding survives marking books read and leaving/returning to the tab (until reload); "Up next" opens a folded section and lands on the book; release-year headings fold the same way; series and Bowden pages have no sections
- [ ] Release mode on Complete Lore groups by release year; dates known only to the month show as "Nov 2009"
- [ ] After marking something read, "Up next: …" appears and jumps to (and briefly highlights) the first unread book
- [ ] Game filter on Complete Lore: chips "All 120", then games in timeline order (AC1 first), "Original stories 62" last. Picking Valhalla shows its 12 entries numbered 1–12 with "x / 12 read"; the address becomes `#reading/complete/valhalla` without adding a back-button step; All resets to `#reading/complete`
- [ ] Pasting `/#reading/complete/black-flag` opens the filter directly; an unknown game shows everything; opening a book and pressing back keeps the filter; other tabs have no chips
- [ ] Desktop: the page is as wide as the main grid; the chips wrap (no sideways scrolling) and the list shows two numbered columns from about 1150px wide, one below
- [ ] Phone width: the chip row scrolls sideways, the active chip is scrolled into view, and toggling a Read switch doesn't reset the row
- [ ] Oliver Bowden Novels (`#reading/bowden`) lists 9 books, Desert Oath first, with no headings; Release puts Renaissance first and Desert Oath last; the mode choice survives a reload
- [ ] Non-canon Stories (`#reading/non-canon`) lists 14 entries; Awakening Vol. 2 follows Awakening #6
- [ ] By Series (`#reading/series`): "All series 24" in story order (Forgotten Myths first; Visionaries, Yan Leisheng, Awakening last as "Non-canon"); each row has a cover, types, era or era range ("Ancient World – Industrial Age" for Bowden), "read / total" and a bar; finished series get a purple border and ✓
- [ ] Read a book in a series without finishing it: the series also appears under "Continue reading" at the top
- [ ] A series row opens `#reading/series/<slug>` (Uprising: 12 issues starting at #5, as in Complete Lore) with "← All series", the count and types, and the usual modes, Read switches and "Up next"; browser back returns to the list
- [ ] Bowden's row opens `#reading/bowden`; pasting `#reading/series/oliver-bowden-novels` lands there too; an unknown series slug shows the list
- [ ] "See the whole series in the collection" opens the grid filtered to that series (Uprising: 15 items, collected editions included)
- [ ] Read toggle on a row marks the book read: purple border, "X / 9 read" and the bar update; the item's own modal shows Read too
- [ ] Clicking a cover or title opens the full modal on top of the view; the address stays `#reading`; category/type/game/series aren't filter links there
- [ ] In that modal: "Next: …" swaps to the next book in place; marking Read updates the list underneath; Esc, ✕ and browser back all close it and leave the view
- [ ] Item modal from the grid: books in an order show "Reading order · <order> · N of M · Next: …" (position follows the chosen mode; the last book says "Last book"); Bowden novels show two lines (Complete Lore and Oliver Bowden Novels); clicking an order name opens that tab
- [ ] No reading order line for items outside an order, or in read-only (profile/leaderboard) modals
- [ ] The **Collection** tab returns to the grid with no hash; pasting `/#reading/bowden` opens that tab directly
- [ ] Phone width: rows fit without horizontal scroll, the Read label hides and the switch stays
- [ ] `validate-catalog.py` covers `js/reading-orders.js` (unknown item, non-readable type, duplicate, missing setting, bad date are errors)

---

## Quick Test (for item additions only)
- [ ] Page loads without errors
- [ ] `python3 tools/validate-catalog.py` reports OK
- [ ] New item appears in grid
- [ ] New item's image displays
- [ ] Filters show updated counts
- [ ] Footer item count is correct
