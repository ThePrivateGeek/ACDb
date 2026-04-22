#!/usr/bin/env python3
"""
flag-large-images.py — list image files under images/ larger than a threshold.

Walks the images/ directory recursively and prints any file whose size
exceeds the threshold (default 1 MB). Results are sorted largest-first.

Run from anywhere:
    python3 tools/flag-large-images.py
    python3 tools/flag-large-images.py --threshold-mb 2
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
IMAGES_DIR = REPO_ROOT / "images"


def human_size(num_bytes: int) -> str:
    mb = num_bytes / (1024 * 1024)
    if mb >= 1:
        return f"{mb:.2f} MB"
    kb = num_bytes / 1024
    return f"{kb:.1f} KB"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--threshold-mb",
        type=float,
        default=1.0,
        help="Flag files larger than this many megabytes (default: 1.0).",
    )
    args = parser.parse_args()

    if not IMAGES_DIR.is_dir():
        print(f"error: images directory not found at {IMAGES_DIR}", file=sys.stderr)
        return 1

    threshold_bytes = int(args.threshold_mb * 1024 * 1024)
    flagged: list[tuple[int, Path]] = []

    for path in IMAGES_DIR.rglob("*"):
        if not path.is_file():
            continue
        size = path.stat().st_size
        if size > threshold_bytes:
            flagged.append((size, path))

    if not flagged:
        print(f"No images larger than {args.threshold_mb} MB.")
        return 0

    flagged.sort(reverse=True)
    print(f"Found {len(flagged)} image(s) larger than {args.threshold_mb} MB:\n")
    width = max(len(human_size(size)) for size, _ in flagged)
    for size, path in flagged:
        rel = path.relative_to(REPO_ROOT).as_posix()
        print(f"  {human_size(size):>{width}}  {rel}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
