#!/usr/bin/env python3
"""
rewrite-images-js-to-webp.py — flip .jpg/.jpeg/.png path strings in js/images.js
to .webp after the batch conversion.

Only rewrites string literals whose value starts with "images/" — keys and any
other strings are left alone. Root-level images/ files (acdb-og.jpg, README
screenshots) are never referenced from images.js, so they are unaffected.

Run once, after tools/convert-to-webp.py has produced the .webp files:
    python3 tools/rewrite-images-js-to-webp.py
    python3 tools/rewrite-images-js-to-webp.py --dry-run
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
IMAGES_JS = REPO_ROOT / "js" / "images.js"

PATH_RE = re.compile(r'"(images/[^"]+?)\.(jpg|jpeg|png)"', re.IGNORECASE)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="Preview without writing.")
    args = parser.parse_args()

    if not IMAGES_JS.is_file():
        print(f"error: {IMAGES_JS} not found", file=sys.stderr)
        return 1

    original = IMAGES_JS.read_text(encoding="utf-8")
    missing: list[str] = []

    def replace(match: re.Match) -> str:
        rel_stem = match.group(1)
        new_path = f"{rel_stem}.webp"
        if not (REPO_ROOT / new_path).is_file():
            missing.append(new_path)
        return f'"{new_path}"'

    new_text, count = PATH_RE.subn(replace, original)

    print(f"Matched {count} path string(s).")
    if missing:
        print(f"\nWARNING: {len(missing)} rewritten path(s) not found on disk:", file=sys.stderr)
        for p in missing[:20]:
            print(f"  - {p}", file=sys.stderr)
        if len(missing) > 20:
            print(f"  ... and {len(missing) - 20} more", file=sys.stderr)

    if args.dry_run:
        print("[dry-run] No file written.")
        return 0

    if new_text == original:
        print("No changes.")
        return 0

    IMAGES_JS.write_bytes(new_text.encode("utf-8"))
    print(f"Updated {IMAGES_JS.relative_to(REPO_ROOT).as_posix()}.")
    return 0 if not missing else 1


if __name__ == "__main__":
    sys.exit(main())
