# ACDb: notes for Claude Code sessions

ACDb (Assassin's Creed Collector's Database) is a fan-made, solo-maintained static site at https://acdb.theprivategeek.com (GitHub Pages, custom domain). Visitors track the collectibles they own, read and wish for. It is free forever, with no ads, donations, affiliate links or paid perks.

## Before you start

- **Any UI, page, component or user-facing text: read [DESIGN.md](DESIGN.md) first and follow it.** It is the design book: colour meanings, tokens, components with markup to copy, layout widths, wording, the accessibility floor and the definition of done. If you add or change a component, update DESIGN.md in the same change.
- [README.md](README.md) has the feature list, project structure and changelog. [TESTING.md](TESTING.md) is the manual test checklist (there is no automated test suite).

## Working with the owner

- **Never commit.** No `git commit`, and no merges, tags or amends that create commits. Make the change, verify it, leave it uncommitted, and finish with the list of changed files and a suggested commit message. Push or merge only when asked, as a fast-forward. Branches are fine.
- **Ask before changing behaviour or data** that wasn't requested. When a choice is genuinely the owner's, recommend one option rather than listing many.
- When most of a batch job works but a handful of inputs fail, offer "redo those few by hand" alongside any code fix.
- Show results honestly: say what you verified and how (widths, signed in or out, real data or test data).

## Hard constraints

- **No build step, no bundler, no npm dependencies, no frameworks.** Vanilla JS and plain CSS.
- **Script load order matters:** `index.html` loads `js/*.js` as plain `<script>` tags, with `app.js` last. Each module is an IIFE that hangs its API on `window.ACDB` (`const A = window.ACDB`).
- **Content Security Policy** (a `<meta>` tag in `index.html` and `privacy.html`):
  - Scripts, images and API calls are limited to the site itself, `api.acdb.workers.dev` and Cloudflare's analytics beacon.
  - Fonts come only from Google Fonts.
  - Anything new from outside needs a CSP change and the owner's OK.
- **The Cloudflare Worker is not deployed from the repo.** `worker/acdb-worker.js` is the source, but the owner pastes it into the Cloudflare dashboard by hand, and D1 schema changes are run in the D1 console. After any Worker change, tell the owner it needs deploying. Production may lag the file. Keep the Worker a single file with no npm dependencies. The runbook is in `worker/README.md`.
- **Privacy promise** (`privacy.html`): no ads, no advertising trackers, no analytics cookies (Cloudflare Web Analytics only). Collections live in localStorage (`acdb_collection_v2`), plus D1 when the visitor is signed in. New stored or sent data must be added to `privacy.html`.

## Catalog data (`js/database.js`, `js/images.js`)

- **Ids are permanent.**
  - Each entry has a numeric `"id"` as its first field.
  - A new entry takes max id + 1.
  - Never change, reuse or renumber an id, even after deleting an item: collections, exports and profiles point at ids.
- **Check for duplicates first.**
  - Collectibles go by several names. Before adding, grep for distinctive keywords, the game name plus "Collector"/"Edition", and the manufacturer plus the character.
  - Update the existing entry rather than adding a second one.
- **Where entries go:**
  - In `database.js`, append at the end of `AC_DATABASE`.
  - In `images.js`, insert in the right labelled section (Collector's Editions, Comics, Statues, Novels…) next to similar items, not at the end.
- **Field values must match:**
  - `game` values must match `SHORT_GAME_NAMES` in `js/app.js`.
  - Categories must match the dev tool list in `index.html`.
  - If the category list changes, update the dropdown in `.github/ISSUE_TEMPLATE/missing-item.yml` too.
- **Renaming an item** keeps the collection safe, but you must:
  - update its `images.js` key;
  - add old slug → id in `js/slug-aliases.js` (never remove alias entries);
  - rerun `build-share-pages.py`.
- **Images:**
  - Images are WebP, in `images/<subdir>/`.
  - Gallery images are `name_01.webp`, `name_02.webp`, and so on.
  - If you're given a jpg or png, convert it first with `python3 tools/convert-to-webp.py`.
- **Read links:**
  - `read` holds an Internet Archive book *path*, not a URL; `readUrl()` builds the link.
  - Parentheses must be encoded as `%28` and `%29`.
  - An HTTP 200 doesn't prove the book exists.
  - Don't suggest Amazon, Audible, Goodreads or Libby/OverDrive as link sources.
- **Reading orders** (`js/reading-orders.js`):
  - Place each book by its main historical story (ignore frame stories).
  - `released` is the earliest worldwide release.
  - Verify settings and dates from two independent sources.
- **Games** (`js/games.js`) are not catalog items and must never become items.

### Tools (run from the repo root, always with `python3`; `python` here is Python 2.7)

| Command | When |
|---|---|
| `python3 tools/validate-catalog.py` | After any data change. It also runs as the pre-commit hook (`git config core.hooksPath .githooks`). Fix reported entries; don't skip the hook. |
| `python3 tools/build-share-pages.py` | After adding, renaming or removing items (writes `s/<slug>.html` share pages) |
| `python3 tools/build-images.py` | After adding or removing gallery images (`_NN.webp`) |
| `python3 tools/flag-large-images.py` | Sanity check after adding images |
| `python3 tools/make-portrait.py <image> <slug> --box L,T,W` | A character portrait: crops a 3:4 box and writes `images/characters/<slug>.webp` (300x400); then set the character's `image` |
| `node tools/test-sync-merge.mjs` | After touching the sync merge rules in `js/sync.js` |

## Environment

- **OS and shells:** Windows 11. PowerShell is the owner's shell; Git Bash is also available.
- **Line endings:** checked-out files are CRLF (`core.autocrlf=true`). Keep each file's existing line endings. Git Bash `sed -i` silently converts files to LF, so prefer the Edit tool, or Python with `newline=''`.
- **Local preview:** `python3 -m http.server 8765` in the repo root, then open http://localhost:8765/.
- **Headless checks:** Chrome at `C:\Program Files\Google\Chrome\Application\chrome.exe` with `--headless=new --remote-debugging-port=…`, driven over CDP from Node.
  - Mock `api.acdb.workers.dev` with `Fetch.enable` so nothing reaches production.
  - Add a unique `?n=` query to each navigation (a hash-only navigation fires no load event).
  - Focus checks need `Emulation.setFocusEmulationEnabled` and real Tab key events.
  - Kill a harness Chrome by its debugging port, never `taskkill /IM node.exe`.

## Verifying and documenting a change

- **Check the UI** at 1600, 1200, 1000, 390 and 360 px, signed in and signed out, with no sideways scrolling. Follow the definition of done in DESIGN.md section 13.
- **Update the docs** in the same change:
  - the relevant `TESTING.md` section;
  - the README feature list, for anything visitors will notice;
  - the README project structure, for new files.
- **Releases** (only when the owner asks):
  - bump the version in the footer of `index.html`;
  - add a README changelog entry with the date as "9 Oct 2026";
  - the owner creates the `vX.Y` git tag.

## Leave alone

- `SEO.local.md` is gitignored and holds account details. Never commit it. Read it before suggesting SEO changes.
- `google58d2ee80e35e0a28.html` is Search Console verification and must stay.
- Don't suggest rewriting git history for repo size unless the repo nears about 800 MB.
