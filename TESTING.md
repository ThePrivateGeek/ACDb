# ACDb Testing Checklist

Run through this checklist before pushing significant changes (new features, refactors, filter/modal changes).
For simple item additions or image updates, skip to the "Data" section only.

---

## 1. Page Load
- [ ] Page loads without console errors (F12 > Console)
- [ ] All stats show in header (Total, Owned, Complete %)
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
- [ ] Sort — Default, Year asc/desc, Name A-Z/Z-A, Recently Added
- [ ] Filters cascade: selecting a game narrows Category options, selecting a category narrows Type options, selecting a type narrows Series options
- [ ] Clear (x) button on each multi-select resets that filter
- [ ] Type and Series search boxes filter options as you type

## 4. Filter Persistence
- [ ] Set some filters, refresh the page — filters are restored
- [ ] Click logo — all filters reset, page scrolls to top
- [ ] Click "Total Items" stat — all filters reset

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

## 11. Collection Insights Dashboard
- [ ] "Collection Insights" toggle opens/closes the panel
- [ ] Sort toggle (% / #) switches between percentage and count sorting
- [ ] By Game — bars show owned/total with percentage, sorted correctly
- [ ] By Category — same as above
- [ ] Condition Breakdown — shows counts, Total Physical Items at top
- [ ] 100% completion — percentage turns green, checkmark appears
- [ ] Confetti fires when completing a game/category (mark last unowned item)
- [ ] Celebration toast appears center-screen

## 12. Export / Import
- [ ] Export downloads a JSON file with today's date in filename
- [ ] Export includes all collection fields (owned, wishlist, condition, copies, price, date, notes)
- [ ] Toast shows "Exported X items"
- [ ] Import — select the exported file, data restores
- [ ] Toast shows "Imported X of Y items"
- [ ] Import with invalid file shows error toast

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
- [ ] Export/Import buttons show icons only on mobile
- [ ] Back to Top button appears on scroll, works on tap

## 16. Data Integrity
- [ ] Total item count in footer matches database
- [ ] No duplicate item names: `grep '"name":' js/database.js | sort | uniq -d` (should be empty)
- [ ] All image mappings match item names: run the check script in README or manually verify
- [ ] Every entry has a unique numeric `id` and none is duplicated (the browser console logs an error otherwise)
- [ ] Collection data keyed by item id under `acdb_collection_v2`; a name-keyed `acdb_collection` from before ids is migrated once on load (unmatched keys are dropped) and kept as a backup until 2027-01-03, after which it is removed from browsers that have `acdb_collection_v2`
- [ ] Export includes `id` and `name`; Import accepts both new exports (by id) and old ones (by name)
- [ ] Shared profiles upload item ids; profiles uploaded before ids (item names) still display
- [ ] Read links still open a book: archive.org returns 200 even for a missing book, so open a few (especially ones with parentheses in the path) and check the reader shows a cover, not an empty item page

---

## Quick Test (for item additions only)
- [ ] Page loads without errors
- [ ] New item appears in grid
- [ ] New item's image displays
- [ ] Filters show updated counts
- [ ] Footer item count is correct
