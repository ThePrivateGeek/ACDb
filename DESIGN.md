# ACDb Design Book

The rules every page, feature and piece of text on ACDb follows, so the site keeps one design language. **Read this before you add or change any UI, page or user-facing text.** If you need something this book doesn't cover, see [Changing the system](#14-changing-the-system). Don't invent a one-off style.

The values live in the design tokens at the top of [`css/style.css`](css/style.css), followed by the shared components. This book explains what they mean and when to use each one. If the book and the CSS disagree, the CSS is what ships: fix whichever one is wrong in the same change.

Contents: [1. Principles](#1-principles) · [2. Colour](#2-colour) · [3. Type](#3-type) · [4. Space, shape, depth, motion](#4-space-shape-depth-motion) · [5. Layout and widths](#5-layout-and-widths) · [6. Components](#6-components) · [7. Patterns](#7-patterns) · [8. Building a new view](#8-building-a-new-view) · [9. Words](#9-words) · [10. Accessibility floor](#10-accessibility-floor) · [11. Allowed exceptions](#11-allowed-exceptions) · [12. Known gaps](#12-known-gaps-dont-copy-these) · [13. Definition of done](#13-definition-of-done) · [14. Changing the system](#14-changing-the-system) · [15. Decision log](#15-decision-log)

---

## 1. Principles

1. **The dark, Animus-inspired theme is the only theme.** There is no light mode. Content sits on dark surfaces with thin lines, never on bright fills.
2. **Each colour has one meaning.** Gold means "you can act here, this is selected, or this is progress". Green, purple and blue mark the state of one item: owned, read and wishlist. Red means danger. Don't use any of them for decoration.
3. **Reuse before you add.** Each new screen is built from the components in section 6. If two features need the same thing, it becomes a shared component.
4. **Tokens, not literals.** New CSS uses `var(--…)` for colour, size, space, radius, shadow and motion. A raw hex value or pixel size in new code is a bug, unless it's in [section 11](#11-allowed-exceptions).
5. **Quiet by default.** One gold primary action per view or dialog at most. Everything else is secondary, quiet, or a link.
6. **Every width works.** The layout holds at 1600, 1200, 1000, 390 and 360 px, signed in and signed out, with nothing scrolling sideways.
7. **Everyone can use it.** Keyboard, screen readers and reduced motion work everywhere (see [section 10](#10-accessibility-floor)).
8. **No build step and no new dependencies.** Plain CSS and vanilla JS. Fonts come from Google Fonts; nothing else loads from outside the site (the CSP blocks it anyway).

## 2. Colour

### Roles

| Role | Tokens | Use for | Never for |
|---|---|---|---|
| Page and surfaces | `--surface-page` (body), `--surface-bar` (header, toolbar, menus, footer, inputs in bars), `--surface-card`, `--surface-card-hover`, `--surface-overlay` (dialogs) | Backgrounds, from the darkest to the lightest | Text |
| Lines | `--line` (default border and divider, empty progress track), `--line-strong` (quiet button edge, stronger divider), `--line-control` (switch track edge) | Borders and dividers | Fills behind text |
| Text | `--text` (main), `--text-2` (secondary, 7.2:1 on cards), `--text-3` (meta and labels, 5.3:1 on cards) | All text | Anything lighter or darker than these three |
| **Gold**, interaction and progress | `--gold`, `--gold-strong` (hover), `--gold-deep` (resting borders, card hover edge), `--gold-tint` / `--gold-tint-2` (selected or secondary backgrounds), `--surface-set` (`--gold-tint` mixed into `--surface-page`, opaque, behind a toolbar filter with a value), `--gold-glow` | Primary and secondary buttons, links, the active tab, segment or chip, the focus ring, **every progress bar**, page titles, section heads, names you can click | Status ("owned", "read"), decoration with no meaning |
| **Green**, owned (and publishing) | `--owned`, `--owned-text`, `--owned-solid`, `--owned-tint`, `--owned-edge` | Owned badge, owned card edge, Owned switch, "complete" check when owned, Publish buttons, the success toast icon | Progress fills, generic "OK" or confirm buttons |
| **Purple**, read | `--read`, `--read-text`, `--read-solid`, `--read-edge` | Read badge, Read switch, read row edge, "complete" check on reading progress | Anything not about reading |
| **Blue**, wishlist | `--wish`, `--wish-text`, `--wish-solid`, `--wish-edge` | Wishlist badge, card edge and switch | Links, info messages |
| **Red**, danger | `--danger`, `--danger-text`, `--danger-solid` | Delete or destructive buttons, error toasts, the NEW sticker | Emphasis, prices, warnings that aren't destructive |
| Condition | `--cond-mint` … `--cond-poor` | Only the condition badges (`.condition-*`) | Anything else |

### Which variant of a status colour

- `-solid`: a filled background with **white** text (badges). Passes 4.5:1.
- `-text`: status-coloured **text or icons** on cards.
- The bare token (`--owned`, `--read`, `--wish`): a switch fill when on, or a hover edge.
- `-edge`: a resting card or row border that marks the state.
- `-tint`: a very faint background (only green has one, for Publish).

### Rules

- **Progress is always gold**, including the header meter, Insights bars, reading progress and leaderboard bars. A finished set doesn't turn its bar green. Instead, put a green (owned) or purple (read) check and count next to it (`.done-owned`, `.done-read`).
- An item can be owned and read at once. The card edge shows owned (green) or wishlist (blue); read shows as a badge.
- Don't put text on gold except the primary button's dark label (`color: var(--surface-page)`).

## 3. Type

| Token | Font | Use |
|---|---|---|
| `--font-display` | **Cinzel** | Page titles (`.page-title`), section heads (`.section-head`), dialog titles, card titles, the series name, the celebration message, the footer brand. Never for body text or buttons. |
| `--font-body` | **Raleway** with lining numerals (set on `body`) | Everything else: text, buttons, labels, inputs |
| `--font-data` | **JetBrains Mono** | Counts, fractions and percentages that line up (`12 / 674`, `61%`, `.chip-count`, `.section-head-count`, `.progress-count`, profile stats, leaderboard figures). Add `font-variant-numeric: tabular-nums` where numbers stack in a column. |

Fonts load from Google Fonts with `display=swap` (in `index.html` and `privacy.html`). Keep `swap`: with `optional`, uncached visits showed Segoe UI or Georgia for a whole page view.

### Scale

| Token | Size | Typical use |
|---|---|---|
| `--fs-label` | 11 px | Uppercase labels (`.label`, form labels, badges), chip counts |
| `--fs-xs` | 12 px | Meta lines ("Updated 9 Oct 2026"), hints, footer legal text |
| `--fs-sm` | 13 px | Small buttons, chips, segments, section heads, breadcrumbs, list meta |
| `--fs-md` | 14 px | Buttons, tabs, toasts, secondary body text |
| `--fs-base` | 16 px | Body text, row titles |
| `--fs-lg` | 18 px | Reading numbers, success lines in dialogs |
| `--fs-xl` | 22 px | Dialog titles, series name, page title on phones (≤ 600 px) |
| `--fs-2xl` | 28 px | Page titles |

- Uppercase is only for small labels and section heads, always with `letter-spacing: var(--tracking-label)`.
- Body line-height is 1.6. Headings use 1.15–1.3.
- Long text runs at most about 75ch wide (see `.reading-description`).
- Page titles use `text-wrap: balance`. A title must fit on one line on a 390 px phone; shorten it or rely on the ≤ 600 px size.

## 4. Space, shape, depth, motion

**Spacing** follows a 4 px grid: `--s1` 4 · `--s2` 8 · `--s3` 12 · `--s4` 16 · `--s5` 24 · `--s6` 32 · `--s7` 48.
- Gaps between related controls: `--s2`. Card padding: `--s3`/`--s4` (rows), `--s4`/`--s5` (header cards).
- Gaps between stacked list cards: `--s2`. Space before a new section: `--s5`.

**Control heights:** `--h-md` 38 px (default button, input), `--h-sm` 32 px (`.btn-sm`). Chips and segments are 30 px. Icon buttons are 36 px, or 28 px for `.icon-btn-sm`.

**Radii** (pick by what the thing is):

| Token | Use |
|---|---|
| `--r-sm` 4 px | Badges, book covers, small thumbnails |
| `--r-md` 8 px | Buttons, inputs, segments, toasts, **list rows** (reading entries, leaderboard cards) |
| `--r-lg` 12 px | **Content cards** (item cards, series header card, game cards) |
| `--r-xl` 16 px | Dialogs |
| `--r-pill` | Chips, progress bars, switches |
| `50%` | Icon buttons, medals |

**Depth:** `--shadow-pop` for things floating over the page (menus, toasts, Back to Top), `--shadow-modal` for dialogs, `--glow-card` for the item card hover. Cards at rest have no shadow; a border separates them.

**Motion:**
- Use `transition: var(--transition)`. It covers colour, background, border, shadow, opacity and transform with the right durations. Never use `transition: all`.
- Durations: `--t-fast` 120 ms (colour), `--t` 200 ms (most things), `--t-slow` 320 ms (toasts, dialogs). Easing: `--ease`.
- Hover lifts are subtle: a grid card moves −3 px, a list row +3 px sideways. Nothing bounces. View changes fade (200 ms); they don't slide.
- Reduced motion is handled once, globally (`prefers-reduced-motion` in `style.css`). A JS scroll must use `behavior: ACDB.scrollBehavior()`, never a hard-coded `'smooth'`. A new looping or decorative animation must also stop under reduced motion; add it to that block if the global rule doesn't cover it. A new hover lift goes in that block's `transform: none !important` list (`.item-card:hover`, `.game-tile:hover`); the `!important` is needed because the hover rules come later in the file.

## 5. Layout and widths

### Page containers

| Kind of page | Width | Padding | Examples |
|---|---|---|---|
| Wide content (grids, multi-column lists) | `max-width: 1600px; margin: 0 auto` | `1.5rem 2rem 4rem` (`1rem` on phones) | Collection (`.main-content`), Reading Order, a profile |
| **One-column reading width** | 760 px of content, centred | Same | Leaderboard (`#leaderboardView`), Privacy (`.legal-page`) |

On a single-column page, put the **whole view** (title, intro line and list) in the centred column, so the title lines up with the content. Don't centre only the list.

### Grids

- For responsive columns, use `grid-template-columns: repeat(auto-fill, minmax(min(Npx, 100%), 1fr))`. The `min(…, 100%)` stops a phone from scrolling sideways. Current values: item grid 280 px (240 px on phones), reading rows 520 px, games grid 200 px (150 px on phones, two columns).
- Multi-column lists read left to right, then down, like the main grid.
- Inside a grid or flex row, any text that can be long needs `min-width: 0` on its column, then `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` (or a line clamp) so long names never push the layout wider.

### Breakpoints (all `max-width`)

| Width | What changes |
|---|---|
| 1520 px | Header drops the logo subtitle and tightens the nav |
| 1180 px | Header nav moves to its own full-width row |
| 1024 px | Item modal stacks to one column |
| **768 px** | **The phone layout**: header rows, filters behind the "Filters (n)" button, one-column forms, `1rem` page padding, smaller list rows |
| 600 px | Page titles drop to `--fs-xl`; leaderboard cards tighten |
| 480 px, 400 px | Logo and header squeeze for very small phones |

The one `min-width` query, `min-width: 769px` for the list view's single-line row, is the 768 px breakpoint seen from above, not a new one. Reuse these breakpoints. Don't add a new one for one component unless nothing else works; if you must, note why in a comment.

### Checking a layout

Check at **1600, 1200, 1000, 390 and 360 px**, signed in and signed out. `document.documentElement.scrollWidth - innerWidth` must be 0 at every width.

## 6. Components

All of these live at the top of `style.css`, from "Components: buttons and links" down to "Components: page header and breadcrumb", except where another location is given. Copy the markup below; don't restyle the class in a view.

### Buttons: `.btn`

Use them in this order of strength, from top to bottom. **At most one primary per view or dialog.**

| Class | Look | Use for |
|---|---|---|
| `btn btn-primary` | Gold fill, dark text | The one main action ("Done", the recommended choice) |
| `btn btn-secondary` | Gold tint and gold edge | Supporting actions ("Copy", "Clear search and filters", "Join the Leaderboard") |
| `btn btn-quiet` | Grey outline | Cancel, alternatives, tools |
| `btn btn-danger` | Red outline, red fill on hover | Delete or remove. In `.form-actions` it sits on the far left. |
| `btn btn-publish` / `btn btn-publish-fill` | Green tint / green fill | **Only** for publishing the collection (header "Publish collection", Publish/Update Profile) |
| `+ btn-sm` | 32 px | Inside bars, cards and tight rows |
| `+ btn-block` | Full width | Stacked choices in a dialog |

```html
<button class="btn btn-secondary btn-sm"><svg …aria-hidden="true"></svg>Clear search and filters</button>
```

- A `<button>` does something; an `<a class="btn …">` goes somewhere. Never use `<div onclick>`.
- An icon inside a button is 16 px (14 px in `.btn-sm`) and comes before the text.
- To disable, use the `disabled` attribute (it shows at 50 % opacity). Don't fake it with a class.

### Links: `.link`, `.link-quiet`

- `.link` is gold text and underlines on hover, for actions inside sentences and footers ("Sign in with Google", "Suggest a missing item").
- `.link-quiet` is grey and turns gold on hover, for low-importance links.
- A link that opens another site gets `target="_blank" rel="noopener"`.

### Icon buttons: `.icon-btn`

A round 36 px button with one 18 px icon, used for close, share, previous/next and Back to Top. **It always has an `aria-label`**, and a `title` when the meaning isn't obvious.
- `icon-btn-sm` is 28 px.
- `icon-btn-bare` has no background or border, for use inside a busy surface.
- A dialog's close button is `class="icon-btn modal-close"`.

### Pick-one controls

| Need | Component | Markup |
|---|---|---|
| Move to another view or page | **Tabs** `.tabs` > `a.tab` | `<nav class="tabs" aria-label="…"><a class="tab active" aria-current="page" href="#…">…</a>…</nav>` |
| Change how *this* view is shown (grid or list, chronological or release, sort) | **Segmented control** `.seg` > `button.seg-btn` | `<div class="seg" role="group" aria-label="…"><button class="seg-btn active" aria-pressed="true">…</button>…</div>` |
| Narrow a list (filter by game) | **Chips** `button.chip` (+ `.chip-count`) | `<button class="chip active" aria-pressed="true">All <span class="chip-count">120</span></button>` |

- Tabs are links with real `href`s (hash routes), so Back works. The header nav is the larger version of the same idea (`.main-nav-link`, with `aria-current="page"` set by `setActiveNav()`). It has four links: Collection, Reading Order, Games, Leaderboard. At 400 px and below "Reading Order" shows as "Reading" (the ` Order` part is a `.nav-long` span, hidden there), and its `aria-label` keeps the full name. A fifth link needs the same kind of check at 360 px.
- Segments and chips are buttons. Keep `.active` **and** `aria-pressed` in step whenever the state changes.
- Put a row of chips in a **chip row**, `<div class="chip-row" role="group" aria-label="…">`. It wraps on wide screens; on phones it becomes one row that scrolls sideways inside itself (like the game timeline), and the page doesn't. A view that re-renders the row keeps its sideways scroll and brings the active chip into view (`restoreChipRow` in `js/reading.js`).
- Multi-select filters use the existing `.multi-select` dropdown in the toolbar. Don't build a second dropdown.

### Status and progress

- **Badges** (`.badge`) show the state of one item and are never interactive:
  - `badge-owned`, `badge-wishlist` and `badge-read` (solid status colour, white uppercase text);
  - `badge-accent` (gold tint);
  - `badge-plain` (neutral, normal case, for the item type);
  - `badge condition-*` for condition.
- **Progress bar:**
  ```html
  <span class="progress"><span class="progress-fill" style="width:61%"></span></span>
  ```
  - It's 6 px tall (`progress-thin` is 4 px) and always gold.
  - Clamp the width to 100 %.
  - Put the figure beside it in `.progress-count` (JetBrains Mono).
  - If the bar repeats numbers already given as text, give it `aria-hidden="true"`.
- **Complete:** append `<span class="done-owned">✓ 12</span>` or `done-read`. Don't recolour the bar.

### Switches (item modal and reading rows)

```html
<label class="toggle-label">Owned
  <span class="toggle-switch toggle-owned"><input type="checkbox"><span class="toggle-slider"></span></span>
</label>
```
- The real checkbox covers the switch, so it's clickable and focusable, and its focus ring shows on the slider.
- Colour variant by meaning: `toggle-owned` (green), `toggle-wish` (blue), `toggle-read` (purple). With no variant it's gold, for a setting that isn't an item state.

### Headings and labels

- **Page title:** `.page-title` (Cinzel, gold, `--fs-2xl`). Exactly one per view, inside `.page-head`.
- **Section head:** `<h4 class="section-head"><span>Title</span><span class="section-head-count">3/9</span></h4>`. Cinzel overline, gold, with a line under it and an optional count on the right.
- **Label:** `.label` is the small uppercase grey label for meta, form fields and table headers. Form labels inside `.form-row` get this look automatically.

### Page head and breadcrumb

```html
<div class="page-head">
  <nav aria-label="Breadcrumb">
    <ol class="crumbs">
      <li><a href="#leaderboard">Leaderboard</a></li>
      <li aria-current="page">MasyafMentor</li>
    </ol>
  </nav>
  <h2 class="page-title">MasyafMentor</h2>
</div>
```
- `page-head-tight` gives a smaller gap below, for when tabs follow straight after.
- A sub-page (a profile, a series page) gets a breadcrumb back to its parent instead of a "Back" button. The breadcrumb names where the visitor came from.

### Cards and rows

A card is `background: var(--surface-card); border: 1px solid var(--line)`. On hover it gets `border-color: var(--gold-deep); background: var(--surface-card-hover)`.

| Kind | Radius | Examples |
|---|---|---|
| Content card with an image | `--r-lg` | `.item-card`, `.game-tile` (Games grid), `.games-tl-card` (Games timeline), `.series-head` (header card) |
| List row | `--r-md` | `.reading-entry`, `.lb-card` |

- If the whole card goes to one place, make the **whole card one `<a>`** (`.lb-card`, `.item-card`) so it's one Tab stop with one focus ring. Don't nest other buttons or links inside it.
- A card that also holds its own controls (a reading row with a Read switch) is a plain container. Its title is the link or button.
- A state edge goes on the border: `.owned` uses `--owned-edge` and `.read` uses `--read-edge`.
- The item card's game line is a row that ends in the item's permanent id: `<div class="card-game-row"><div class="card-game">…</div><span class="badge badge-plain item-id">#14</span></div>`. The pill is a plain badge in `--font-data`, never gold (it isn't interactive). A long game name wraps and the pill lines up with its first line. In list view (above 768 px) a row reads thumb · game · title · type · condition · status badges · year · id, and the id pill has a fixed width (`6ch`, room for "#999"), so every row ends with its year and id at the same x. Phone rows stack and keep the id on the game line. The item modal shows the same pill at the end of its Game line, after the year.
- A game marker in a list of books is a dashed gold-tint row (`.reading-entry-game`). It is not a book: it gets no number and no switch. It opens the game dialog over the list.
- **Game cards** (`.game-tile`, the Games tab in release order): the whole card is one `<a href="#games/<slug>">` with box art (3:4, cut to fit, so art of another shape is saved as a 300x400 image shown whole over a blurred copy of itself, as `js/games.js` describes; the controller icon on `--gold-tint-2` when there is no cover), the kind line (`.game-kind`, gold uppercase like an item card's game line), the title (Cinzel, up to three lines: names all start "Assassin's Creed") and plain-badge counts. A plain click opens the game dialog instead of navigating; a modified click opens a new tab.
- **Story timeline** (`.games-tl-list`, the Games tab in story order): under era section heads, each row is a year (`--font-data`, gold) on a rail with a dot, then a game card (`.games-tl-card`: cover, kind line, title, setting and release date, the first three DLC names as plain badges that cut off when long, and story and item counts). A DLC with its own place in the lore gets a dashed gold-tint row (`.games-tl-dlc`), like a game marker in Complete Lore. Copy the markup from `timelineHTML()` in `js/games-view.js`.

### Dialogs

```html
<div class="modal-overlay" id="xOverlay">
  <div class="modal share-modal" role="dialog" aria-modal="true" aria-labelledby="xTitle">
    <button class="icon-btn modal-close" aria-label="Close">…</button>
    <div class="share-modal-content">
      <h2 class="add-modal-title" id="xTitle">Title</h2>
      <p class="add-modal-subtitle">One line of context.</p>
      … .form-row fields …
      <div class="form-actions">
        <button class="btn btn-quiet">Cancel</button>
        <button class="btn btn-primary">Do it</button>
      </div>
    </div>
  </div>
</div>
```
- Open a dialog by adding `.active` to the overlay.
- **The game dialog (`#gameOverlay` in `index.html`, `js/games-view.js`) is the model for new dialogs.** It has everything the accessibility floor asks for:
  - `role="dialog" aria-modal="true" aria-labelledby="<title id>"` and `tabindex="-1"` on the frame;
  - on open, focus moves to the first control (its Close button: focusing the frame would outline the whole dialog with the focus ring), and `const release = ACDB.trapFocus(frame)` keeps Tab and Shift+Tab inside;
  - on close, `release()`, then focus goes back to the element that opened it (or, after a re-render, the same card found again), and the page title when neither is on screen;
  - it is in the Esc chain below.
  A dialog with an address (`#games/<slug>`) pushes it on open and pushes the view's address on close, like the item modal. Opened over another view, it pushes a duplicate history entry instead, so Back closes it (`ACDB.pushGameDialogState`), and a link out of it replaces that entry with the destination, so Back doesn't land on a stale copy.
- Esc is handled in one place, the `keydown` listener in `initEvents()` in `js/app.js`, in priority order (account menu, lightbox, dropdown, then dialogs). **Add a new dialog there**; don't add a second Esc listener.
- Esc, the overlay and the close button all close it, **unless a choice is required** (the first sign-in merge dialog has no close button and ignores Esc and overlay clicks).
- Sizes: `.share-modal` is 480 px, for small dialogs. The item modal and the game dialog (`.modal.game-modal`) are 980 px; the item modal grows to 1300 px for a landscape image. The dev tool is 1100 px.
- A share button uses `ACDB.shareLink({ title, text, url })`: the native share sheet on touch devices (`ACDB.canWebShare`, which also decides its label, "Share this …"), otherwise copy and "Link copied!".
- In a long scrolling dialog, keep close (and share) reachable with the sticky `.modal-actions` bar.
- Actions go bottom right in `.form-actions`, with the primary last and danger on the far left.

### Forms

- Each field goes in `.form-row`: the label above, then the input, then an optional `.form-hint`.
- `.form-row-group` puts two fields side by side; they stack below 768 px.
- Inputs are `--h-md` tall on `--surface-page` with a `--line` border. They turn gold on focus.
- Every input has a `<label for>`; a placeholder doesn't count as a label.
- Live validation messages (such as name availability) go in a `.form-hint` with a reserved `min-height`, so the dialog doesn't jump.
- Date inputs stay native: the browser shows them in the visitor's locale order.
- **Search box** (`.search-box`, the collection search and any list's search): a field with a search icon and a clear button that shows while there is text. The input gets `.is-set` while it has text, like any filter with a value (section 7). Size and place it with the view's own class (`.search-container` in the collection toolbar).
  ```html
  <div class="search-box">
    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
    <label class="sr-only" for="fooSearch">Search …</label>
    <input type="search" id="fooSearch" placeholder="Search …" autocomplete="off">
    <button class="icon-btn icon-btn-sm icon-btn-bare clear-search" aria-label="Clear search">…</button>
  </div>
  ```

### Toasts and the celebration

- `ACDB.showToast(message, 'success' | 'error')` shows a short message at the bottom of the screen. It is announced through a polite live region. Use it after an action finishes ("Link copied", "Collection restored") or fails.
- A new error message also says what to do next ("Couldn't publish. Check your connection and try again.").
- Don't use toasts for information the visitor must act on; use a dialog or inline text.
- `ACDB.showCelebration()` and the confetti are only for completing a set.

### Empty state (collection search)

`.no-results` shows the faded icon, the italic grey line **"Nothing is true, everything is permitted... but no items match your search."** and a `btn btn-secondary` "Clear search and filters".
- When there is search text, a "Suggest a missing item" line follows, pre-filled with the search text.
- The grey `#666` and the wording were the owner's choice; don't change them.
- Other lists use the plain-text pattern in [section 7](#7-patterns), not this one.

### Icons

- Icons are inline SVG, `viewBox="0 0 24 24"`, `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`. They take their colour from the text.
- No icon fonts or libraries.
- A decorative icon gets `aria-hidden="true"`. An icon-only control gets an `aria-label` on the control.
- The Assassin emblem (`M50 5 L30 55 L5 95 L25 95 L50 55 L75 95 L95 95 L70 55 Z`, viewBox 0 0 100 100) is the brand mark: logo, favicon, footer watermark and Back to Top.

## 7. Patterns

- **Loading, empty and error in a list:** one plain line of `--text-2` text, centred and spanning the whole list (`.leaderboard-loading` is the model): "Loading leaderboard...", "No collectors yet. Be the first!", "Error loading leaderboard". No spinners or skeletons. In a `<ol>` or `<ul>`, the message is an `<li>`.
- **Counts:** "12 / 674" or "3/9" in JetBrains Mono; "61%" as a whole number (`Math.round`).
- **Dates:** always `ACDB.formatDate(value)`, giving **"9 Oct 2026"**. Never `toLocaleDateString()` with no arguments, and never US order. A release date that may be known only to the month or year (reading orders, games) uses `ACDB.formatReleased(entry)`, which reads `releasedPrecision` and shows "26 Nov 2009", "Nov 2009" or "2009".
- **Up next:** a reading order or series page with progress shows a `btn btn-sm btn-secondary` "Up next: <title>" button that jumps to the next unread book and flashes its row (`.flash`).
- **Previous / next:** a series page ends with links to the previous and next series, using the series names.
- **Item names in a list** open the item modal over the current view (`ACDB.openModalOverView`), so closing it returns the visitor where they were.
- **Filters:**
  - Collection filters persist (`saveFilters`). The logo resets everything.
  - "Clear search and filters" keeps the sort order.
  - A filter with a value (search text, a ticked multi-select, a status other than "All Items") gets a `--gold-deep` edge on `--surface-set`: `.has-selection` on a `.multi-select`, `.is-set` on the search box and `.filter-select`, toggled in `updateFilterCount()`. Sort is not a filter and never gets it. Focus and an open dropdown still show the bright `--gold` edge.
  - On phones the filters fold behind "Filters (n)", where n is the number of active filters.
- **Sign-in is optional everywhere.** Every feature must work signed out, from this browser's own copy of the collection. Signed-in-only extras say so with a `.link` to sign in, never a wall.
- **Anything public** (profiles, the leaderboard) shows the display name and counts only.

## 8. Building a new view

1. **Markup:** add a top-level `<div id="fooView" style="display:none;">` next to the other views in `index.html`, starting with `.page-head` and a `.page-title` (`<h2>`).
2. **Container:** give it the wide container (copy the `#readingView` rule) or the 760 px one (copy `#leaderboardView`). See [section 5](#5-layout-and-widths).
3. **Route:** add a hash route in `handleHash()` in `js/app.js` (for example `#foo` or `#foo/<id>`), *before* the item-slug fallback.
4. **Show and hide:**
   - Showing the view: call `ACDB.hideMainContent('foo')` (which also sets the header nav state), hide the other views and show yours.
   - Add your view to `showMainContent()` and to the other `show…` functions, so it hides when someone navigates away.
   - If it's a top-level section, add a `.main-nav-link` with `data-view="foo"` to the header nav.
5. **Rendering:**
   - Build HTML with template strings and **pass every piece of data through `ACDB.escapeHTML`** (reading.js aliases it as `esc`).
   - Put inline styles only on dynamic values (bar widths).
   - Show and hide parts with the `hidden` attribute or `style.display = ''`. Never set `display: block` on something whose CSS uses grid or flex.
6. **Code:**
   - New code lives in its own file wrapped in an IIFE (`(function () { 'use strict'; const A = window.ACDB; … })()`) and exports through `A.foo = foo` at the bottom.
   - The file gets a `<script>` tag in `index.html` before `app.js` (load order matters).
   - New CSS goes in its own `/* ---- Foo View ---- */` block in `style.css`, near related views, using tokens only.
7. **Docs:**
   - Add a section to `TESTING.md` and a feature bullet to the README.
   - If the view is public, add it to `sitemap.xml` only when it has its own URL that isn't a hash route.

## 9. Words

- **British English** (colour, favourite, catalogue text as written).
- **Plain and short.** Use the words collectors use: owned, wishlist, read, collected edition, reading order.
- **Sentence case** for new buttons, headings and labels ("Publish collection", "Clear search and filters", "Combine your collections"). Some older strings are in Title Case ("Delete Profile"). Leave them unless you're reworking that screen.
- **Buttons say what happens:** a verb plus an object ("Copy", "Publish", "Download a backup…"). Avoid "OK", "Submit" and "Yes".
- **Exclamation marks only for good news:** success toasts ("Link copied!", "Collection published!"), celebrations and invitations ("Be the first!"). Never in errors, labels or headings.
- **Proper names:**
  - Write *Assassin's Creed* with a straight apostrophe in data (slugs depend on it).
  - Game names must match the `game` values in `database.js` and `SHORT_GAME_NAMES` in `app.js`.
  - The brand is **ACDb** (capital D, small b), or "Assassin's Creed Collector's Database" in full.
- **Fan site:**
  - Never imply Ubisoft endorsement.
  - No ads, donations, affiliate or "where to buy" links, or paid perks. ACDb stays free and informational.
  - Outbound read and listen links don't go to Amazon, Audible, Goodreads or Libby/OverDrive.
- **Privacy:** the site promises no ads and no advertising trackers, and no cookies for analytics (Cloudflare Web Analytics). New features must keep that promise, and anything new that's stored or sent goes in `privacy.html`.

## 10. Accessibility floor

None of these are optional for new UI:

- **Focus:**
  - The global `:focus-visible` ring (`--focus`, 2 px gold, 2 px offset) shows on every control. Never write `outline: none` or `outline: 0`.
  - If a control clips its outline, use `outline-offset: -2px` (like `.tab`), or show the ring on a sibling (like the switch).
- **Keyboard:**
  - Everything you can click works with Tab, Enter and Space.
  - Dialogs close with Esc unless a choice is required.
  - Use real `<button>` and `<a href>` elements.
- **Contrast:**
  - Text uses `--text`, `--text-2` or `--text-3` (all ≥ 4.5:1 on cards). Status text uses the `-text` tokens; filled status backgrounds use the `-solid` tokens with white text.
  - The only exception is the empty-state line ([section 11](#11-allowed-exceptions)).
- **Screen readers:**
  - Icon-only controls need an `aria-label`.
  - Bare numbers need words: add `<span class="sr-only"> items owned,</span>` after the figure.
  - Decorative bars and icons get `aria-hidden="true"`.
  - Lists are `<ol>` or `<ul>`, and breadcrumbs are `<nav aria-label="Breadcrumb"><ol>`.
  - Toggles keep `aria-pressed` or `aria-current` up to date.
- **Announcements:** status messages go through `showToast` (a polite live region). Don't add more live regions without a reason.
- **Motion:** respect `prefers-reduced-motion` (see [section 4](#4-space-shape-depth-motion)).
- **Images:**
  - Item images use `alt` with the item name.
  - Covers next to a visible title use `alt=""`.
  - Images below the first screen get `loading="lazy"`.
- **Numbers:** lining figures are set site-wide (`font-variant-numeric: lining-nums` on `body`, and form controls inherit it). Don't override it.

## 11. Allowed exceptions

These keep literal values on purpose. Don't "fix" them, and don't copy them elsewhere:

- The **logo**, the **header meter's numbers**, the **Google sign-in button** (Google's brand colours), the **lightbox**.
- The **NEW sticker** (`.badge-new`): a red gradient, rotated and poking outside the card.
- **Leaderboard medals** (`.medal.gold/.silver/.bronze`): metal colours.
- The **empty-state line**: `#666`, italic, 1.1rem. The owner chose to keep the original look (3.4:1 contrast).
- The **footer emblem watermark**: gold at 5 % opacity.
- `#fff` as text on `-solid` status fills and on hover of `.btn-danger`.

## 12. Known gaps (don't copy these)

Older code that doesn't meet this book yet. Fix it when you're working on that screen anyway; don't spread it:

- The item, share and dev-tool dialogs lack `role="dialog" aria-modal="true" aria-labelledby` (the merge dialog has them), and they don't trap focus or return it to the opener on close. The game dialog does all of this and is the one to copy (section 6, Dialogs).
- A header-nav click while a dialog is open over a view (the item modal or the game dialog over a reading order) leaves its duplicate history entry behind, so Back takes one extra step.
- Some per-view rules still use literal `rem` values for padding and margin instead of `--s*` tokens. New rules use tokens.
- Views switch with `style.display` (from before the `[hidden]` rule). New parts use `hidden`.
- The toolbar wraps onto two lines at about 1280 px.
- Some older button and dialog titles are in Title Case.

## 13. Definition of done

Before handing over any UI change:

- [ ] Built from the components and tokens above. No new hex values, pixel sizes or `transition: all` outside [section 11](#11-allowed-exceptions).
- [ ] Checked at 1600, 1200, 1000, 390 and 360 px, signed in **and** signed out. Nothing scrolls sideways; long names cut off cleanly.
- [ ] Tab reaches every control with the gold ring; Enter, Space and Esc work.
- [ ] Reduced motion: nothing slides, pulses or scrolls smoothly.
- [ ] Loading, empty and error states exist and follow [section 7](#7-patterns).
- [ ] Dates use `formatDate`; counts use JetBrains Mono.
- [ ] Wording follows [section 9](#9-words).
- [ ] No console errors.
- [ ] `TESTING.md` updated (the feature's section, plus section 19 if the design system changed). The README feature list updated if visitors will notice.
- [ ] If you added or changed a component, this book is updated in the same change.

## 14. Changing the system

When nothing here fits:

1. Check again whether an existing component with a modifier class would do (`btn-sm`, `progress-thin`, `page-head-tight`, `icon-btn-bare` are all modifiers).
2. If it's genuinely new, add a token or component **at the top of `style.css`** with the other components (not inside a view block), with a one-line comment saying what it's for.
3. Document it here, in the right section, with markup to copy and when to use it.
4. A change to colour meanings, fonts, the dark theme or the overall look is the **owner's decision**. Propose it with a before-and-after; don't just ship it.

## 15. Decision log

Owner decisions this book rests on, so they aren't reopened:

- **10 Oct 2026, design system (v3.0):**
  - One design language across the site, keeping the dark background, gold accent, Cinzel headings, green = owned, purple = read.
  - Progress bars gold everywhere.
  - Publish buttons green.
  - Phone filters behind a "Filters (n)" button.
  - "Clear search and filters" in the empty state (keeps the sort; the logo resets everything).
  - Series pages: a breadcrumb "By Series › X", a header card, previous/next series links and a 200 ms fade.
  - Dates "9 Oct 2026" everywhere.
  - Sticky share and close buttons in the item modal.
- **10 Oct 2026:**
  - Google Fonts load with `display=swap`.
  - The empty state keeps its original wording, italic style and `#666` grey; it gets no heading.
  - Date inputs stay native.
- **18 Oct 2026, leaderboard:** one card per collector at every width (medal or rank, name, update date, count, % and a gold bar), in one centred 760 px column like the Privacy page, with the whole card as one link.
- **23 Oct 2026, Games tab:**
  - A top-level Games tab (`#games`) for every released game and its DLCs, replacing the Games sub-tab of Reading Order.
  - Release order is a grid of box-art cards like the collection; story order is a timeline under era headings, with the DLCs that have their own place in the lore as dashed rows.
  - A card opens a game dialog styled like the item modal (box art left, facts, description, links and DLCs grouped by type right). Game rows in Complete Lore open the same dialog over the list.
  - Left out: cosmetic packs, multiplayer map and character packs, seasonal festivals. Mobile, browser and VR games stay off Complete Lore unless decided otherwise. A "Played" switch may come later.
