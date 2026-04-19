#!/usr/bin/env python3
"""
build-images.py — regenerate js/images.js with gallery arrays.

For every entry in js/images.js, scan the images/ folder for sibling files
matching the base image's stem (foo.jpg, foo_01.jpg, foo_02.jpg, ...) and
emit an array containing the base plus any siblings that actually exist.

Run from anywhere:
    python tools/build-images.py

The script PRESERVES:
    - The pre-amble comments and `const AC_IMAGES = {` line
    - Section header comments (// -- Foo --)
    - Blank lines between sections
    - The trailing `};` and the `(function applyImages() { ... })();` IIFE

The script REWRITES each mapping entry to the "always array" form:
    "Some Item": ["images/folder/foo.jpg"],
    "Gallery Item": [
        "images/folder/bar.jpg",
        "images/folder/bar_01.jpg",
        "images/folder/bar_02.jpg",
    ],

It re-runs idempotently — reading an array-form file produces the same output.

It warns (but does not crash) about two kinds of drift between images.js and disk:
    1. Missing: a base image referenced in images.js that doesn't exist on disk.
    2. Orphan: an image file under images/<subdir>/ that isn't referenced by any
       entry. Top-level images/ files (e.g. acdb-og.jpg, README screenshots) are
       ignored — orphan scanning only recurses into subdirectories. The check is
       case-sensitive, matching GitHub Pages, so a foo.JPG on disk that images.js
       spells foo.jpg will be flagged.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMAGES_JS = ROOT / "js" / "images.js"
IMAGES_DIR = ROOT / "images"

# --- Line patterns inside the AC_IMAGES object ---
# Key/value strings use no escaped quotes in practice, but the regex handles them.
STR = r'"((?:[^"\\]|\\.)*)"'

RE_OBJECT_OPEN = re.compile(r'^\s*const\s+AC_IMAGES\s*=\s*\{\s*$')
RE_OBJECT_CLOSE = re.compile(r'^\s*\};\s*$')

RE_ENTRY_STRING = re.compile(r'^(\s*)' + STR + r'\s*:\s*' + STR + r'\s*,?\s*$')
RE_ENTRY_INLINE_ARRAY = re.compile(r'^(\s*)' + STR + r'\s*:\s*\[(.*)\]\s*,?\s*$')
RE_ENTRY_MULTI_START = re.compile(r'^(\s*)' + STR + r'\s*:\s*\[\s*$')
RE_MULTI_END = re.compile(r'^\s*\]\s*,?\s*$')
RE_STRING_ANYWHERE = re.compile(STR)


def fail(msg):
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def first_string_in(s):
    m = RE_STRING_ANYWHERE.search(s)
    return m.group(1) if m else None


def detect_line_ending(text):
    return "\r\n" if "\r\n" in text else "\n"


def parse(text):
    """Split the file into (pre_lines, items, post_lines).

    `items` is an ordered list; each item is one of:
        {"kind": "blank"}
        {"kind": "comment", "line": str}
        {"kind": "entry", "indent": str, "key": str, "base": str}
    """
    lines = text.splitlines()
    pre, items, post = [], [], []
    state = "pre"

    i = 0
    while i < len(lines):
        line = lines[i]

        if state == "pre":
            pre.append(line)
            if RE_OBJECT_OPEN.match(line):
                state = "inside"
            i += 1
            continue

        if state == "inside":
            if RE_OBJECT_CLOSE.match(line):
                post.append(line)
                state = "post"
                i += 1
                continue

            if line.strip() == "":
                items.append({"kind": "blank"})
                i += 1
                continue

            if line.lstrip().startswith("//"):
                items.append({"kind": "comment", "line": line})
                i += 1
                continue

            m = RE_ENTRY_STRING.match(line)
            if m:
                indent, key, base = m.groups()
                items.append({"kind": "entry", "indent": indent, "key": key, "base": base.strip()})
                i += 1
                continue

            m = RE_ENTRY_INLINE_ARRAY.match(line)
            if m:
                indent, key, inner = m.groups()
                base = first_string_in(inner)
                if base is None:
                    fail(f"Inline array is empty at line {i + 1}:\n    {line}")
                items.append({"kind": "entry", "indent": indent, "key": key, "base": base.strip()})
                i += 1
                continue

            m = RE_ENTRY_MULTI_START.match(line)
            if m:
                indent, key = m.groups()
                base = None
                j = i + 1
                while j < len(lines) and not RE_MULTI_END.match(lines[j]):
                    if base is None:
                        found = first_string_in(lines[j])
                        if found is not None:
                            base = found.strip()
                    j += 1
                if j >= len(lines):
                    fail(f"Unterminated multi-line array starting at line {i + 1}")
                if base is None:
                    fail(f"Multi-line array at line {i + 1} contained no strings")
                items.append({"kind": "entry", "indent": indent, "key": key, "base": base})
                i = j + 1
                continue

            fail(
                f"Unrecognized line {i + 1} inside AC_IMAGES object — aborting to avoid data loss.\n"
                f"    {line}"
            )

        if state == "post":
            post.append(line)
            i += 1

    if state != "post":
        fail("Could not find closing '};' for AC_IMAGES object")

    return pre, items, post


def build_gallery(base_rel):
    """Given a relative path like 'images/foo/bar.jpg', return the gallery list:
    the base followed by any bar_01.jpg, bar_02.jpg, ... siblings that exist
    (stops at the first missing index, matching the old probe behavior).
    Paths are returned with forward slashes, rooted at the repo.
    """
    base_abs = (ROOT / base_rel).resolve() if (ROOT / base_rel).exists() else (ROOT / base_rel)
    stem = base_abs.stem
    ext = base_abs.suffix
    folder = base_abs.parent

    gallery = [base_rel]  # keep the exact string that was in the file
    base_exists = (ROOT / base_rel).is_file()

    idx = 1
    while True:
        sibling = folder / f"{stem}_{idx:02d}{ext}"
        if not sibling.is_file():
            break
        rel = sibling.relative_to(ROOT).as_posix()
        gallery.append(rel)
        idx += 1

    return gallery, base_exists


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}


def find_orphans(claimed):
    """Return sorted list of image files under images/<subdir>/ that aren't
    in the `claimed` set. Top-level files in images/ are skipped (they are
    project assets like the OG image or README screenshots, not item images).
    """
    orphans = []
    for sub in sorted(IMAGES_DIR.iterdir()):
        if not sub.is_dir():
            continue
        for path in sorted(sub.rglob("*")):
            if not path.is_file():
                continue
            if path.suffix.lower() not in IMAGE_EXTENSIONS:
                continue
            rel = path.relative_to(ROOT).as_posix()
            if rel not in claimed:
                orphans.append(rel)
    return orphans


def format_entry(indent, key, paths):
    key_json = json.dumps(key, ensure_ascii=False)
    if len(paths) == 1:
        path_json = json.dumps(paths[0], ensure_ascii=False)
        return f"{indent}{key_json}: [{path_json}],"
    inner = indent + "    "
    out = [f"{indent}{key_json}: ["]
    for p in paths:
        out.append(f"{inner}{json.dumps(p, ensure_ascii=False)},")
    out.append(f"{indent}],")
    return "\n".join(out)


def main():
    if not IMAGES_JS.is_file():
        fail(f"Not found: {IMAGES_JS}")
    if not IMAGES_DIR.is_dir():
        fail(f"Not found: {IMAGES_DIR}")

    original = IMAGES_JS.read_text(encoding="utf-8")
    line_ending = detect_line_ending(original)

    pre, items, post = parse(original)

    out_lines = list(pre)
    missing = []
    claimed = set()
    entry_count = 0
    multi_count = 0

    for item in items:
        if item["kind"] == "blank":
            out_lines.append("")
        elif item["kind"] == "comment":
            out_lines.append(item["line"])
        else:
            entry_count += 1
            gallery, base_exists = build_gallery(item["base"])
            if not base_exists:
                missing.append(item["base"])
            if len(gallery) > 1:
                multi_count += 1
            claimed.update(gallery)
            out_lines.append(format_entry(item["indent"], item["key"], gallery))

    out_lines.extend(post)

    new_text = line_ending.join(out_lines)
    if original.endswith(line_ending) and not new_text.endswith(line_ending):
        new_text += line_ending

    if new_text == original:
        print(f"No changes. {entry_count} entries checked ({multi_count} multi-image).")
    else:
        IMAGES_JS.write_bytes(new_text.encode("utf-8"))
        rel = IMAGES_JS.relative_to(ROOT).as_posix()
        print(f"Updated {rel}: {entry_count} entries ({multi_count} multi-image).")

    if missing:
        print(
            f"\nWARNING: {len(missing)} base image(s) referenced but not found on disk:",
            file=sys.stderr,
        )
        for p in missing:
            print(f"  - {p}", file=sys.stderr)

    orphans = find_orphans(claimed)
    if orphans:
        print(
            f"\nWARNING: {len(orphans)} image file(s) on disk not referenced by any entry:",
            file=sys.stderr,
        )
        for p in orphans:
            print(f"  - {p}", file=sys.stderr)


if __name__ == "__main__":
    main()
