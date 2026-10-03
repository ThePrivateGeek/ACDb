#!/usr/bin/env python3
"""
validate-catalog.py - check js/database.js and js/images.js for mistakes
before they ship.

Runs automatically from the pre-commit hook in .githooks/ (enable once per
clone with `git config core.hooksPath .githooks`). Can also be run by hand:

    python3 tools/validate-catalog.py

Errors block the commit; warnings are printed but don't. Exit code 1 when
there are errors.

Checks:
  ids        every entry has a positive whole-number id, ids are unique, and
             each new entry's id is higher than all before it (append rule)
  names      present and unique; no two names produce the same URL slug
  fields     required fields present with the right type
  values     game is on the timeline (SHORT_GAME_NAMES in js/app.js), category
             is one the dev tool offers (index.html), year is plausible
  images     every item has a mapping in js/images.js, every mapped file
             exists, and no mapping points at an item that doesn't exist
  read       archive paths are plain (unencoded) and readLang only appears
             with read
  series     no two series names that differ only in case or punctuation
  share      every item has its s/<slug>.html share page
"""
from __future__ import annotations

import datetime
import importlib.util
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP_JS = ROOT / "js" / "app.js"
IMAGES_JS = ROOT / "js" / "images.js"
INDEX_HTML = ROOT / "index.html"
SHARE_DIR = ROOT / "s"

# Reuse the share-page builder's database parser and slug logic so all the
# tools agree on how database.js is read and how slugs are made.
_spec = importlib.util.spec_from_file_location("share_pages", ROOT / "tools" / "build-share-pages.py")
share_pages = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(share_pages)

REQUIRED = {
    "id": int,
    "name": str,
    "game": str,
    "year": int,
    "category": str,
    "description": str,
    "contents": str,
    "type": str,
}
OPTIONAL = {"series": str, "read": str, "readLang": str}
FIRST_YEAR = 2005  # Assassin's Creed was announced in 2005; nothing licensed predates it

STR = r'"((?:[^"\\]|\\.)*)"'


def load_game_names():
    text = APP_JS.read_text(encoding="utf-8")
    m = re.search(r"const SHORT_GAME_NAMES = \{(.*?)\};", text, re.S)
    if not m:
        raise SystemExit("validate-catalog: could not find SHORT_GAME_NAMES in js/app.js")
    return set(re.findall(r'^\s*' + STR + r'\s*:', m.group(1), re.M))


def load_categories():
    text = INDEX_HTML.read_text(encoding="utf-8")
    m = re.search(r'<select id="devCategory">(.*?)</select>', text, re.S)
    if not m:
        raise SystemExit("validate-catalog: could not find the devCategory list in index.html")
    values = re.findall(r'<option value="([^"]+)"', m.group(1))
    return {v.replace("&amp;", "&") for v in values}


def load_image_mappings():
    """Item name -> every image path mapped to it, in order."""
    mappings = {}
    key = None
    for line in IMAGES_JS.read_text(encoding="utf-8").splitlines():
        m = re.match(r'^\s*' + STR + r'\s*:\s*\[(.*)$', line)
        if m:
            key = m.group(1)
            mappings[key] = re.findall(STR, m.group(2))
            if "]" in m.group(2):
                key = None
            continue
        if key is not None:
            mappings[key].extend(re.findall(STR, line))
            if "]" in line:
                key = None
    return mappings


def series_key(name):
    return re.sub(r"[^a-z0-9]+", "", name.lower())


def main():
    errors, warnings = [], []
    items = share_pages.load_database()
    games = load_game_names()
    categories = load_categories()
    images = load_image_mappings()
    max_year = datetime.date.today().year + 3

    seen_ids, seen_names, seen_slugs = {}, {}, {}
    highest_id = 0
    series_spellings = {}

    for pos, item in enumerate(items, 1):
        label = f'entry {pos} ("{item.get("name", "?")}")'

        for field, kind in REQUIRED.items():
            if field not in item:
                errors.append(f"{label}: missing \"{field}\"")
            elif not isinstance(item[field], kind) or isinstance(item[field], bool):
                errors.append(f"{label}: \"{field}\" should be {kind.__name__}, got {item[field]!r}")
            elif kind is str and field != "description" and not item[field].strip():
                errors.append(f"{label}: \"{field}\" is empty")
        for field, kind in OPTIONAL.items():
            if field in item and (not isinstance(item[field], kind) or not item[field].strip()):
                errors.append(f"{label}: \"{field}\" should be a non-empty {kind.__name__}")
        for field in item:
            if field not in REQUIRED and field not in OPTIONAL:
                warnings.append(f"{label}: unknown field \"{field}\"")

        # ids
        iid = item.get("id")
        if isinstance(iid, int) and not isinstance(iid, bool):
            if iid <= 0:
                errors.append(f"{label}: id must be positive, got {iid}")
            elif iid in seen_ids:
                errors.append(f"{label}: id {iid} is already used by \"{seen_ids[iid]}\"")
            else:
                if iid <= highest_id:
                    warnings.append(f"{label}: id {iid} is lower than an earlier entry's id {highest_id}; "
                                    "new entries go at the end with the next id")
                highest_id = max(highest_id, iid)
            seen_ids.setdefault(iid, item.get("name"))

        # names and slugs
        name = item.get("name")
        if isinstance(name, str) and name.strip():
            if name in seen_names:
                errors.append(f"{label}: duplicate name (also entry {seen_names[name]})")
            seen_names.setdefault(name, pos)
            slug = share_pages.slugify(name)
            if slug in seen_slugs and seen_slugs[slug] != name:
                errors.append(f"{label}: URL slug \"{slug}\" collides with \"{seen_slugs[slug]}\"")
            seen_slugs.setdefault(slug, name)

        # known values
        if isinstance(item.get("game"), str) and item["game"] not in games:
            errors.append(f"{label}: game \"{item['game']}\" is not in SHORT_GAME_NAMES (js/app.js)")
        if isinstance(item.get("category"), str) and item["category"] not in categories:
            errors.append(f"{label}: category \"{item['category']}\" is not one of the dev tool's categories")
        year = item.get("year")
        if isinstance(year, int) and not (FIRST_YEAR <= year <= max_year):
            errors.append(f"{label}: year {year} is outside {FIRST_YEAR}-{max_year}")

        # read links
        read = item.get("read")
        if isinstance(read, str) and not re.match(r"^https?://", read):
            if re.search(r"%[0-9A-Fa-f]{2}", read):
                errors.append(f"{label}: read path looks URL-encoded; store it plain, e.g. \"07. AC Templars/AC Templars 2016 (3)\"")
            if read.startswith("/") or read.endswith("/") or "_jp2" in read:
                errors.append(f"{label}: read path should be the book path without slashes at the ends or \"_jp2\"")
        if "readLang" in item:
            if "read" not in item:
                errors.append(f"{label}: readLang without read")
            if isinstance(item["readLang"], str) and not re.fullmatch(r"[a-z]{2}", item["readLang"]):
                errors.append(f"{label}: readLang should be a two-letter lowercase code like \"fr\"")

        # series spellings
        if isinstance(item.get("series"), str):
            series_spellings.setdefault(series_key(item["series"]), set()).add(item["series"])

        # images
        if isinstance(name, str):
            paths = images.get(name)
            if not paths:
                errors.append(f"{label}: no image mapping in js/images.js")
            else:
                for p in paths:
                    if not (ROOT / p).is_file():
                        errors.append(f"{label}: image file not found: {p}")

        # share page
        if isinstance(name, str) and not (SHARE_DIR / f"{share_pages.slugify(name)}.html").is_file():
            warnings.append(f"{label}: no share page; run python3 tools/build-share-pages.py")

    for key in images:
        if key not in seen_names:
            errors.append(f"js/images.js: mapping for \"{key}\" matches no item name")

    for spellings in series_spellings.values():
        if len(spellings) > 1:
            warnings.append("series spelled more than one way: " + " / ".join(f'"{s}"' for s in sorted(spellings)))

    for w in warnings:
        print(f"warning: {w}")
    for e in errors:
        print(f"ERROR: {e}")
    status = f"{len(items)} items checked: {len(errors)} error(s), {len(warnings)} warning(s)."
    print(("validate-catalog: " + status) if errors or warnings else f"validate-catalog: OK. {status}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
