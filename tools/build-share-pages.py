#!/usr/bin/env python3
"""
build-share-pages.py — generate static share pages under s/ for link previews.

Slack/Discord/etc. never see the SPA's #item-slug fragment (fragments are not
sent to servers) and their crawlers don't run JavaScript, so every pasted link
unfurls with the site-wide Open Graph tags from index.html. This script gives
each item a tiny real page at /s/<slug> carrying item-specific og: tags plus a
client-side redirect into the app at /#<slug>.

Run from anywhere:
    python3 tools/build-share-pages.py

For every entry in js/database.js it writes s/<slug>.html where <slug> matches
ACDB.slugify() in js/utils.js. The og:image is the item's base image from
js/images.js (falling back to the site-wide OG image for items without one).
Pages carry <meta name="robots" content="noindex"> so search engines don't
index the redirect stubs; unfurl bots ignore that tag and read the og: tags.

Re-run after adding items (same workflow as build-images.py). Stale pages in
s/ whose slug no longer matches any item are deleted, and slug collisions
between two item names abort the run.
"""

import html
import json
import re
import sys
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATABASE_JS = ROOT / "js" / "database.js"
IMAGES_JS = ROOT / "js" / "images.js"
OUT_DIR = ROOT / "s"

SITE = "https://acdb.theprivategeek.com"
FALLBACK_IMAGE = "images/acdb-og-v2.jpg"

STR = r'"((?:[^"\\]|\\.)*)"'
RE_IMG_ENTRY_INLINE = re.compile(r'^\s*' + STR + r'\s*:\s*\[(.*)\]\s*,?\s*$')
RE_IMG_ENTRY_MULTI = re.compile(r'^\s*' + STR + r'\s*:\s*\[\s*$')
RE_STRING_ANYWHERE = re.compile(STR)


def fail(msg):
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def slugify(name):
    """Mirror of ACDB.slugify() in js/utils.js — must stay in sync."""
    s = name.lower()
    s = s.replace("'", "")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def load_database():
    """Parse the AC_DATABASE array out of js/database.js."""
    text = DATABASE_JS.read_text(encoding="utf-8")
    start = text.find("[")
    end = text.rfind("]")
    if start == -1 or end == -1:
        fail("Could not locate AC_DATABASE array brackets in database.js")
    body = text[start:end + 1]
    # The file ends entries with '},' including the last one; JSON forbids the
    # trailing comma. Strings never span lines, so a comma followed by only
    # whitespace-with-newline and a closer is always structural.
    body = re.sub(r",(\s*\n\s*[\]\}])", r"\1", body)
    try:
        return json.loads(body)
    except json.JSONDecodeError as e:
        fail(f"database.js did not parse as JSON: {e}")


def load_base_images():
    """Map item name -> base image path from js/images.js."""
    images = {}
    lines = IMAGES_JS.read_text(encoding="utf-8").splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        m = RE_IMG_ENTRY_INLINE.match(line)
        if m:
            key, inner = m.group(1), m.group(2)
            first = RE_STRING_ANYWHERE.search(inner)
            if first:
                images[key] = first.group(1)
            i += 1
            continue
        m = RE_IMG_ENTRY_MULTI.match(line)
        if m:
            key = m.group(1)
            j = i + 1
            while j < len(lines) and "]" not in lines[j]:
                first = RE_STRING_ANYWHERE.search(lines[j])
                if first and key not in images:
                    images[key] = first.group(1)
                j += 1
            i = j + 1
            continue
        i += 1
    return images


PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | ACDb</title>
    <meta name="robots" content="noindex">
    <meta name="description" content="{description}">

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="ACDb">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:url" content="{page_url}">
    <meta property="og:image" content="{image_url}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">
    <meta name="twitter:image" content="{image_url}">

    <script>location.replace("/#{slug}");</script>
    <style>
        body {{ margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
               background: #0f0f12; color: #b8b8b8; font-family: Georgia, serif; }}
        a {{ color: #c9a84c; }}
    </style>
</head>
<body>
    <p><a href="/#{slug}">View {title} on ACDb</a></p>
</body>
</html>
"""


def esc(s):
    return html.escape(" ".join(s.split()), quote=True)


def image_url(rel_path):
    return SITE + "/" + urllib.parse.quote(rel_path)


def main():
    if not DATABASE_JS.is_file():
        fail(f"Not found: {DATABASE_JS}")
    if not IMAGES_JS.is_file():
        fail(f"Not found: {IMAGES_JS}")
    if not (ROOT / FALLBACK_IMAGE).is_file():
        fail(f"Fallback OG image missing: {FALLBACK_IMAGE}")

    items = load_database()
    base_images = load_base_images()

    slugs = {}
    for item in items:
        slug = slugify(item["name"])
        if not slug:
            fail(f"Empty slug for item: {item['name']!r}")
        if slug in slugs:
            fail(f"Slug collision: {slugs[slug]!r} and {item['name']!r} both map to '{slug}'")
        slugs[slug] = item["name"]

    OUT_DIR.mkdir(exist_ok=True)

    no_image = []
    written = 0
    expected = set()
    for item in items:
        slug = slugify(item["name"])
        expected.add(f"{slug}.html")
        image = base_images.get(item["name"])
        if not image:
            no_image.append(item["name"])
            image = FALLBACK_IMAGE

        description = item.get("description") or f"{item['game']} ({item['year']}) collectible on ACDb."
        page = PAGE_TEMPLATE.format(
            title=esc(item["name"]),
            description=esc(description),
            page_url=f"{SITE}/s/{slug}",
            image_url=image_url(image),
            slug=slug,
        )
        target = OUT_DIR / f"{slug}.html"
        if not target.is_file() or target.read_text(encoding="utf-8") != page:
            target.write_text(page, encoding="utf-8", newline="\n")
            written += 1

    stale = sorted(p.name for p in OUT_DIR.glob("*.html") if p.name not in expected)
    for name in stale:
        (OUT_DIR / name).unlink()

    print(f"{len(items)} share pages in s/ ({written} written/updated, {len(stale)} stale removed).")
    if stale:
        for name in stale:
            print(f"  removed: {name}")
    if no_image:
        print(f"\nWARNING: {len(no_image)} item(s) have no image; using site-wide OG image:", file=sys.stderr)
        for name in no_image:
            print(f"  - {name}", file=sys.stderr)


if __name__ == "__main__":
    main()
