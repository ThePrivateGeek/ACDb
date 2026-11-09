#!/usr/bin/env python3
"""
build-item-pages.py — write the static pages search engines can read.

The app's addresses (/#<slug>, #games/…, #characters/…) never reach a server,
and the share pages in s/ are noindex redirects, so without these pages a
crawler sees only the homepage. This tool writes, from js/database.js:

    item/<slug>.html        one page per item: photo, facts, description,
                            contents, characters, related items and a
                            button into the app (/item/<slug>)
    item/<old-slug>.html    for every old slug in js/slug-aliases.js: a
                            noindex page that sends visitors and crawlers
                            to the item's current page
    items/index.html        every category and game, with counts (/items/)
    items/<slug>.html       one list page per category and per game
    sitemap.xml             every address above except the old slugs, plus
                            the homepage and the privacy page

Run from anywhere:
    python3 tools/build-item-pages.py            write what changed
    python3 tools/build-item-pages.py --check    write nothing; exit 1 when a
                                                 page is missing, out of date
                                                 or no longer belongs

Re-run after adding, renaming or removing items, or changing an item's text
or main photo. tools/validate-catalog.py runs --check before every commit.
Never edit the generated files by hand: the next run rewrites them.

Standard library only (no Pillow): a photo's width and height come from its
WebP header. The catalog is read with build-share-pages.py's parsers, so
every tool reads it the same way.
"""

import html
import importlib.util
import json
import re
import struct
import sys
import unicodedata
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP_JS = ROOT / "js" / "app.js"
CHARACTERS_JS = ROOT / "js" / "characters.js"
ISSUE_FORM = ROOT / ".github" / "ISSUE_TEMPLATE" / "missing-item.yml"
ITEM_DIR = "item"
LIST_DIR = "items"
SITEMAP = "sitemap.xml"

SITE = "https://acdb.theprivategeek.com"
SITE_OG_IMAGE = "images/acdb-og-v4.jpg"
DESCRIPTION_MAX = 155        # search snippets cut off around here
DESCRIPTION_PAD_BELOW = 110  # shorter descriptions get the facts and contents added
RELATED_COUNT = 6

_spec = importlib.util.spec_from_file_location("share_pages", ROOT / "tools" / "build-share-pages.py")
share_pages = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(share_pages)
fail = share_pages.fail
slugify = share_pages.slugify

# List page names. A category in the catalog without a plural stops the run,
# so a new category can't ship with a half-made page.
CATEGORY_PLURALS = {
    "Collector's Edition": "Collector's editions", "Special Edition": "Special editions",
    "Steelbook": "Steelbooks", "Statue": "Statues", "Figurine": "Figurines",
    "Action Figure": "Action figures", "Replica/Prop": "Replicas and props",
    "Art & Reference": "Art and reference books", "Comic Book": "Comic books", "Novel": "Novels",
    "Board & Card Games": "Board and card games", "Puzzles": "Puzzles", "Music": "Music",
    "Drinkware": "Drinkware", "Home Decor": "Home decor",
    "Jewelry & Accessories": "Jewelry and accessories", "Tech & Gadgets": "Tech and gadgets",
}
# Categories whose plural isn't a countable noun ("9 official music"):
# their introduction counts "items" instead
UNCOUNTABLE = {"Music", "Drinkware", "Home Decor", "Jewelry & Accessories", "Tech & Gadgets"}
# The two game values that aren't games: (short title, page heading)
GAME_TITLES = {
    "General": ("General merchandise", "Assassin's Creed general merchandise"),
    "Assassin's Creed (Movie)": ("The 2016 film", "Assassin's Creed (2016 film) collectibles"),
}


# ---- Reading the site's data ----

def url_slug(name):
    """Mirror of ACDB.gameUrlSlug() and the character slug: accents folded, then slugify."""
    return slugify("".join(c for c in unicodedata.normalize("NFD", name) if not unicodedata.combining(c)))


def load_characters():
    """Character id -> name, from js/characters.js (the array body is plain JSON)."""
    text = CHARACTERS_JS.read_text(encoding="utf-8")
    start = text.find("[", text.find("const CHARACTERS ="))
    end = text.rfind("]")
    try:
        return {c["id"]: c["name"] for c in json.loads(text[start:end + 1])}
    except (json.JSONDecodeError, KeyError, TypeError) as e:
        fail(f"js/characters.js did not parse: {e}")


def load_game_order():
    """The game values in release order: the keys of SHORT_GAME_NAMES in js/app.js."""
    m = re.search(r"const SHORT_GAME_NAMES = \{(.*?)\};", APP_JS.read_text(encoding="utf-8"), re.S)
    if not m:
        fail("could not find SHORT_GAME_NAMES in js/app.js")
    return re.findall(r'^\s*' + share_pages.STR + r'\s*:', m.group(1), re.M)


def load_category_order():
    """The categories in the order the "Suggest a missing item" form lists them."""
    m = re.search(r"^\s*id: category\s*$(.*?)^\s*validations:", ISSUE_FORM.read_text(encoding="utf-8"), re.S | re.M)
    if not m:
        fail(f"could not find the category list in {ISSUE_FORM.relative_to(ROOT)}")
    values = [v.strip().strip("'\"") for v in re.findall(r"^\s*- (.+)$", m.group(1), re.M)]
    return [v for v in values if v != "Not sure"]


def webp_size(path):
    """Width and height of a WebP file, read from its header (no Pillow).

    Checked against Pillow on every image in the repo on 9 Nov 2026."""
    with open(path, "rb") as f:
        head = f.read(30)
    if len(head) < 30 or head[:4] != b"RIFF" or head[8:12] != b"WEBP":
        fail(f"{path}: not a WebP file")
    kind = head[12:16]
    if kind == b"VP8 ":
        w, h = struct.unpack("<HH", head[26:30])
        return w & 0x3FFF, h & 0x3FFF
    if kind == b"VP8L":
        bits = struct.unpack("<I", head[21:25])[0]
        return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
    if kind == b"VP8X":
        return 1 + int.from_bytes(head[24:27], "little"), 1 + int.from_bytes(head[27:30], "little")
    fail(f"{path}: unknown WebP kind {kind!r}")


# ---- Text helpers ----

def esc(s):
    """Escaped for text and attribute values, whitespace collapsed."""
    return html.escape(" ".join(str(s).split()), quote=True)


def src(rel_path):
    """A site path (images/…) as an address from the site root."""
    return "/" + urllib.parse.quote(rel_path)


def sentence(s):
    s = " ".join(s.split())
    return s if not s or s[-1] in ".!?…" else s + "."


def meta_description(item, game_title):
    """The description, padded with the facts and contents when short, cut
    at a word at or under DESCRIPTION_MAX characters."""
    text = sentence(item.get("description") or "")
    if len(text) < DESCRIPTION_PAD_BELOW:
        text = " ".join(filter(None, [text, f"{item['type']} · {game_title} · {item['year']}.", sentence(item["contents"])]))
    if len(text) <= DESCRIPTION_MAX:
        return text
    cut = text[:DESCRIPTION_MAX].rsplit(" ", 1)[0].rstrip(",;:·-–— ")
    return cut + "…"


def game_title(game):
    """Short name for breadcrumbs, links and meta lines."""
    return GAME_TITLES.get(game, (game,))[0]


def json_ld(data):
    # Data, not a script, so the CSP doesn't apply; "</" can't end the block
    return json.dumps(data, ensure_ascii=False, indent=4).replace("</", "<\\/")


def breadcrumb_ld(crumbs):
    """crumbs: [(name, absolute url)], the page itself last."""
    return json_ld({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": n, "name": name, "item": url}
            for n, (name, url) in enumerate(crumbs, 1)
        ],
    })


# ---- The page frame ----

CSP = ("default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; object-src 'none'; "
       "base-uri 'none'; form-action 'none'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; "
       "font-src https://fonts.gstatic.com; img-src 'self' data:; "
       "connect-src 'self' https://cloudflareinsights.com https://static.cloudflareinsights.com")
FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath "
           "d='M50 5 L30 55 L5 95 L25 95 L50 55 L75 95 L95 95 L70 55 Z' fill='%23c9a84c'/%3E%3C/svg%3E")

HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#12121a">
    <meta http-equiv="Content-Security-Policy" content="{csp}">
    <title>{title} | ACDb</title>
    <meta name="description" content="{description}">
    <link rel="canonical" href="{url}">

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="ACDb">
    <meta property="og:locale" content="en_GB">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:url" content="{url}">
    <meta property="og:image" content="{image}">{image_size}

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">
    <meta name="twitter:image" content="{image}">

    <link rel="icon" type="image/svg+xml" href="{favicon}">
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/pages.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Raleway:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

{ld}</head>
<body>
    <div class="ambient-bg"></div>
    <div class="scanlines"></div>

    <header class="main-header">
        <div class="header-inner">
            <a href="/" class="logo-area">
                <div class="ac-symbol">
                    <svg viewBox="0 0 100 100" class="ac-logo-svg" aria-hidden="true">
                        <path d="M50 5 L30 55 L5 95 L25 95 L50 55 L75 95 L95 95 L70 55 Z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="logo-text">
                    <span class="logo-title">ACDb</span>
                    <span class="logo-subtitle">Assassin's Creed Collector's Database</span>
                </div>
            </a>
            <a href="/" class="btn btn-sm btn-quiet">Open the database</a>
        </div>
    </header>

    <main class="static-page">
        <div class="page-head">
{crumbs}            <h1 class="page-title">{title}</h1>
        </div>
"""

# The two legal lines are copied from the footer of index.html; change them
# there and here together.
FOOT = """    </main>

    <footer class="main-footer">
        <div class="footer-inner">
            <p class="footer-brand">ACDb · Assassin's Creed Collector's Database</p>
            <nav class="footer-links" aria-label="Footer">
                <a class="link" href="/items/">Browse all items</a>
                <a class="link" href="/">Open the database</a>
                <a class="link" href="/privacy.html">Privacy</a>
            </nav>
            <p class="footer-legal">This is a fan-made collection tracker, not affiliated with or endorsed by Ubisoft. Assassin's Creed and all related names, logos, and trademarks are property of Ubisoft Entertainment. Product images are the property of their respective manufacturers and retailers (e.g. PureArts, Ravenforge), used for identification and reference only; no copyright or affiliation is claimed. Game cover art and character art are &copy; Ubisoft, shown for identification only. <a href="mailto:info@theprivategeek.com">Contact us</a> to request removal of any image.</p>
            <p class="footer-legal">Your collection is saved in your browser. Sign in with Google to also keep it in your account and see it on any device. Shared profiles are public. Anonymous visitor analytics by Cloudflare (no cookies).</p>
        </div>
    </footer>

    <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "4bdfedeff50c4784a6bde51fd26c2c99"}'></script>
</body>
</html>
"""


def page(path, title, description, crumbs, body, image=None, image_size=None):
    """A whole page. path: its address from the site root ("/item/x");
    crumbs: [(name, path)] from /items/ down, the page itself last (none
    for /items/, the top); body: the HTML after the page head, indented
    for <main>."""
    nav = ld = ""
    if crumbs:
        links = [f'                    <li><a href="{href}">{esc(name)}</a></li>' for name, href in crumbs[:-1]]
        links.append(f'                    <li aria-current="page">{esc(crumbs[-1][0])}</li>')
        nav = ('            <nav aria-label="Breadcrumb">\n                <ol class="crumbs">\n'
               + "\n".join(links) + '\n                </ol>\n            </nav>\n')
        ld = ('    <script type="application/ld+json">\n'
              + "\n".join("    " + line for line in breadcrumb_ld([(n, SITE + p) for n, p in crumbs]).splitlines())
              + '\n    </script>\n')
    size = ""
    if image_size:
        size = (f'\n    <meta property="og:image:width" content="{image_size[0]}">'
                f'\n    <meta property="og:image:height" content="{image_size[1]}">')
    return HEAD.format(
        csp=CSP,
        title=esc(title),
        description=esc(description),
        url=SITE + path,
        image=SITE + src(image or SITE_OG_IMAGE),
        image_size=size,
        favicon=FAVICON,
        ld=ld,
        crumbs=nav,
    ) + body + FOOT


# ---- Item pages ----

def related_items(item, items):
    """Up to RELATED_COUNT items of the same game: the same category when it
    has enough, the three before and three after this one in catalog order
    (wrapping round), so adding an item changes only its neighbours."""
    pool = [i for i in items if i["game"] == item["game"] and i["category"] == item["category"]]
    if len(pool) - 1 < RELATED_COUNT:
        pool = [i for i in items if i["game"] == item["game"]]
    if len(pool) - 1 <= RELATED_COUNT:
        return [i for i in pool if i is not item]
    at = pool.index(item)
    half = RELATED_COUNT // 2
    return [pool[(at + k) % len(pool)] for k in list(range(-half, 0)) + list(range(1, half + 1))]


def list_row(href, name, meta):
    return (f'            <li><a class="link" href="{href}">{esc(name)}</a>'
            f' <span class="static-list-meta">{esc(meta)}</span></li>')


def item_page(item, ctx):
    slug = slugify(item["name"])
    game, category = item["game"], item["category"]
    gtitle = game_title(game)
    image = ctx["images"].get(item["name"])
    size = None
    if image and (ROOT / image).is_file():
        size = webp_size(ROOT / image)
    else:
        ctx["no_image"].append(item["name"])
        image = None

    facts = [
        ("Game", f'<a class="link" href="/{LIST_DIR}/{url_slug(game)}">{esc(gtitle)}</a>'),
        ("Year", esc(item["year"])),
        ("Category", f'<a class="link" href="/{LIST_DIR}/{slugify(category)}">{esc(category)}</a>'),
    ]
    if item["type"] != category:
        facts.append(("Type", esc(item["type"])))
    if item.get("series"):
        facts.append(("Series", esc(item["series"])))
    facts.append(("ACDb id", f'<span class="badge badge-plain item-id">#{item["id"]}</span>'))

    body = ['        <div class="item-page">']
    if image:
        body.append(f'            <img class="item-page-photo" src="{src(image)}" alt="{esc(item["name"])}" '
                    f'width="{size[0]}" height="{size[1]}" fetchpriority="high">')
    body.append('            <div class="item-page-body">')
    body.append('                <dl class="modal-meta">')
    for label, value in facts:
        body.append(f'                    <dt class="modal-meta-label">{label}</dt>')
        body.append(f'                    <dd class="modal-meta-value">{value}</dd>')
    body.append('                </dl>')
    if item.get("description", "").strip():
        body.append(f'                <p class="static-text">{esc(item["description"])}</p>')
    body.append('                <h2 class="section-head">Contents</h2>')
    body.append(f'                <p class="static-text">{esc(item["contents"])}</p>')
    names = [ctx["characters"][c] for c in item.get("characters", []) if c in ctx["characters"]]
    if names:
        body.append('                <h2 class="section-head">Characters</h2>')
        body.append('                <ul class="static-list">')
        for name in names:
            body.append(f'                    <li><a class="link" href="/#characters/{url_slug(name)}">{esc(name)}</a></li>')
        body.append('                </ul>')
    body.append(f'                <p class="static-actions"><a class="btn btn-primary" href="/#{slug}">Track it in your collection</a></p>')
    body.append('            </div>')
    body.append('        </div>')

    related = related_items(item, ctx["items"])
    if related:
        if game == "General":
            heading = "More general merchandise"
        else:
            heading = f"More from {gtitle[0].lower() + gtitle[1:] if game in GAME_TITLES else gtitle}"
        body.append('')
        body.append(f'        <h2 class="section-head">{esc(heading)}</h2>')
        body.append('        <ul class="static-list static-list-cols">')
        for other in related:
            body.append(list_row(f"/{ITEM_DIR}/{slugify(other['name'])}", other["name"],
                                 f"{other['year']} · {other['type']}"))
        body.append('        </ul>')

    crumbs = [("Items", f"/{LIST_DIR}/"),
              (CATEGORY_PLURALS[category], f"/{LIST_DIR}/{slugify(category)}"),
              (item["name"], f"/{ITEM_DIR}/{slug}")]
    return page(crumbs[-1][1], item["name"], meta_description(item, gtitle), crumbs,
                "\n".join(body) + "\n", image, size)


ALIAS_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="{csp}">
    <title>{name} | ACDb</title>
    <meta name="robots" content="noindex">
    <link rel="canonical" href="{url}">
    <meta http-equiv="refresh" content="0; url={path}">
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/pages.css">
</head>
<body>
    <main class="static-page">
        <p>This item has a new address: <a class="link" href="{path}">{name}</a></p>
    </main>
</body>
</html>
"""


def alias_page(item):
    path = f"/{ITEM_DIR}/{slugify(item['name'])}"
    return ALIAS_PAGE.format(csp=CSP, name=esc(item["name"]), url=SITE + path, path=path)


# ---- List pages ----

def year_span(group):
    years = sorted({i["year"] for i in group})
    return f"from {years[0]}" if len(years) == 1 else f"from {years[0]} to {years[-1]}"


def grouped_list(groups):
    """groups: [(heading or None, [(href, name, meta)])]."""
    out = []
    for heading, rows in groups:
        if heading is not None:
            out.append(f'        <h2 class="section-head"><span>{esc(heading)}</span>'
                       f'<span class="section-head-count">{len(rows)}</span></h2>')
        out.append('        <ul class="static-list static-list-cols">')
        out.extend(list_row(*row) for row in rows)
        out.append('        </ul>')
    return "\n".join(out) + "\n"


def by_year_and_name(group):
    return sorted(group, key=lambda i: (i["year"], i["name"].lower()))


def category_page(category, group, ctx):
    plural = CATEGORY_PLURALS[category]
    noun = "items" if category in UNCOUNTABLE else plural.lower()
    path = f"/{LIST_DIR}/{slugify(category)}"
    h1 = f"Assassin's Creed {plural.lower()}"
    intro = (f"{len(group)} official {noun}, {year_span(group)}. Each has its own page with a photo and details; "
             "open the database to track the ones you own.")
    types = sorted({i["type"] for i in group}, key=str.lower)
    groups = []
    for kind in types:
        rows = [(f"/{ITEM_DIR}/{slugify(i['name'])}", i["name"], f"{i['year']} · {game_title(i['game'])}")
                for i in by_year_and_name([i for i in group if i["type"] == kind])]
        groups.append((kind if len(types) > 1 else None, rows))
    body = f'        <p class="static-intro">{esc(intro)}</p>\n\n' + grouped_list(groups)
    crumbs = [("Items", f"/{LIST_DIR}/"), (plural, path)]
    return page(path, h1, f"{h1}: {intro}", crumbs, body)


def game_page(game, group, ctx):
    short, h1 = GAME_TITLES.get(game, (game, f"{game} collectibles"))
    path = f"/{LIST_DIR}/{url_slug(game)}"
    intro = (f"{len(group)} official collectibles, {year_span(group)}. Each has its own page with a photo and "
             "details; open the database to track the ones you own.")
    groups = []
    for category in ctx["categories"]:
        members = [i for i in group if i["category"] == category]
        if members:
            groups.append((CATEGORY_PLURALS[category],
                           [(f"/{ITEM_DIR}/{slugify(i['name'])}", i["name"], f"{i['year']} · {i['type']}")
                            for i in by_year_and_name(members)]))
    body = f'        <p class="static-intro">{esc(intro)}</p>\n\n' + grouped_list(groups)
    crumbs = [("Items", f"/{LIST_DIR}/"), (short, path)]
    return page(path, h1, f"{h1}: {intro}", crumbs, body)


def index_page(by_category, by_game, ctx):
    items = ctx["items"]
    h1 = "Every Assassin's Creed collectible"
    intro = (f"{len(items)} official Assassin's Creed collectibles, {year_span(items)}: statues, figurines, "
             "collector's editions, art books, novels, comics and more. Pick a category or a game; each item "
             "has its own page with a photo and details, and the database tracks the ones you own.")
    count = lambda n: f"{n} item" if n == 1 else f"{n} items"
    groups = [
        ("By category", [(f"/{LIST_DIR}/{slugify(c)}", CATEGORY_PLURALS[c], count(len(g))) for c, g in by_category]),
        ("By game", [(f"/{LIST_DIR}/{url_slug(g)}", game_title(g), count(len(group))) for g, group in by_game]),
    ]
    body = f'        <p class="static-intro">{esc(intro)}</p>\n\n' + grouped_list(groups)
    return page(f"/{LIST_DIR}/", h1, intro, [], body)


# ---- Everything ----

def render_all():
    """{path relative to the repo root: page text} for every file this tool
    owns. Reads the catalog; touches no file."""
    items = share_pages.load_database()
    ctx = {
        "items": items,
        "images": share_pages.load_base_images(),
        "characters": load_characters(),
        "categories": load_category_order(),
        "no_image": [],
    }
    games = load_game_order()

    slugs = {}
    for item in items:
        slug = slugify(item["name"])
        if not slug:
            fail(f"empty slug for item {item['name']!r}")
        if slug in slugs:
            fail(f"slug collision: {slugs[slug]!r} and {item['name']!r} both map to '{slug}'")
        slugs[slug] = item["name"]
        if item["category"] not in CATEGORY_PLURALS:
            fail(f"category {item['category']!r} has no plural: add it to CATEGORY_PLURALS in tools/build-item-pages.py")
        if item["category"] not in ctx["categories"]:
            fail(f"category {item['category']!r} isn't in {ISSUE_FORM.relative_to(ROOT)}")
        if item["game"] not in games:
            fail(f"game {item['game']!r} isn't in SHORT_GAME_NAMES (js/app.js)")

    by_category = [(c, [i for i in items if i["category"] == c]) for c in ctx["categories"]]
    by_category = [(c, g) for c, g in by_category if g]
    by_game = [(g, [i for i in items if i["game"] == g]) for g in games]
    by_game = [(g, group) for g, group in by_game if group]

    list_slugs = {}
    for name, slug in [(c, slugify(c)) for c, _ in by_category] + [(g, url_slug(g)) for g, _ in by_game]:
        if slug == "index" or slug in list_slugs:
            fail(f"list page slug '{slug}' of {name!r} is taken ({list_slugs.get(slug, 'the index page')!r})")
        list_slugs[slug] = name

    pages = {}
    for item in items:
        pages[f"{ITEM_DIR}/{slugify(item['name'])}.html"] = item_page(item, ctx)
    by_id = {item["id"]: item for item in items}
    for old_slug, item_id in share_pages.load_slug_aliases().items():
        if old_slug in slugs:
            fail(f"js/slug-aliases.js: '{old_slug}' is the slug of a current item ({slugs[old_slug]!r})")
        if item_id not in by_id:
            fail(f"js/slug-aliases.js: '{old_slug}' points at id {item_id}, which matches no item")
        pages[f"{ITEM_DIR}/{old_slug}.html"] = alias_page(by_id[item_id])

    pages[f"{LIST_DIR}/index.html"] = index_page(by_category, by_game, ctx)
    for category, group in by_category:
        pages[f"{LIST_DIR}/{slugify(category)}.html"] = category_page(category, group, ctx)
    for game, group in by_game:
        pages[f"{LIST_DIR}/{url_slug(game)}.html"] = game_page(game, group, ctx)

    addresses = ["/", "/privacy.html", f"/{LIST_DIR}/"]
    addresses += [f"/{LIST_DIR}/{slugify(c)}" for c, _ in by_category]
    addresses += [f"/{LIST_DIR}/{url_slug(g)}" for g, _ in by_game]
    addresses += [f"/{ITEM_DIR}/{slugify(i['name'])}" for i in items]
    pages[SITEMAP] = ('<?xml version="1.0" encoding="UTF-8"?>\n'
                      '<!-- Written by tools/build-item-pages.py: edit the tool, not this file -->\n'
                      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                      + "".join(f"    <url><loc>{html.escape(SITE + a)}</loc></url>\n" for a in addresses)
                      + "</urlset>\n")
    return pages, ctx["no_image"]


def owned_files():
    """Every file now in the folders this tool owns."""
    found = []
    for folder in (ITEM_DIR, LIST_DIR):
        if (ROOT / folder).is_dir():
            found += [p.relative_to(ROOT).as_posix() for p in (ROOT / folder).rglob("*") if p.is_file()]
    return sorted(found)


def read(rel):
    # Universal newlines: a checkout with CRLF endings still matches
    return (ROOT / rel).read_text(encoding="utf-8")


def check(pages=None):
    """(missing, out of date, files in item/ or items/ that don't belong)."""
    if pages is None:
        pages, _ = render_all()
    missing = sorted(rel for rel in pages if not (ROOT / rel).is_file())
    stale = sorted(rel for rel in pages if (ROOT / rel).is_file() and read(rel) != pages[rel])
    strays = [rel for rel in owned_files() if rel not in pages]
    return missing, stale, strays


def main():
    pages, no_image = render_all()
    if "--check" in sys.argv[1:]:
        missing, stale, strays = check(pages)
        for label, files in (("missing", missing), ("out of date", stale), ("doesn't belong", strays)):
            for rel in files:
                print(f"  {label}: {rel}")
        if missing or stale or strays:
            print(f"build-item-pages: {len(missing)} missing, {len(stale)} out of date, {len(strays)} that don't "
                  "belong: run python3 tools/build-item-pages.py")
            return 1
        print(f"build-item-pages: all {len(pages)} files are up to date.")
        return 0

    written = 0
    for rel, text in pages.items():
        target = ROOT / rel
        if not target.is_file() or read(rel) != text:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(text, encoding="utf-8", newline="\n")
            written += 1
    removed, kept = [], []
    for rel in owned_files():
        if rel not in pages:
            if rel.endswith(".html"):
                (ROOT / rel).unlink()
                removed.append(rel)
            else:
                kept.append(rel)

    items = sum(1 for rel in pages if rel.startswith(ITEM_DIR + "/"))
    lists = sum(1 for rel in pages if rel.startswith(LIST_DIR + "/"))
    print(f"{items} pages in {ITEM_DIR}/ (old slugs included), {lists} in {LIST_DIR}/ and {SITEMAP}: "
          f"{written} written, {len(removed)} removed.")
    for rel in removed:
        print(f"  removed: {rel}")
    for rel in kept:
        print(f"  not a page, left alone: {rel} (delete it by hand)", file=sys.stderr)
    if no_image:
        print(f"\nWARNING: {len(no_image)} item(s) have no image; their pages show none:", file=sys.stderr)
        for name in no_image:
            print(f"  - {name}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    # Windows sends piped output (Git Bash, the pre-commit hook) as cp1252,
    # which can't print names like "Tantō"
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    sys.exit(main())
