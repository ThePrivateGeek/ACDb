#!/usr/bin/env python3
"""
convert-to-webp.py — batch-convert images/<subdir>/*.{jpg,png} to WebP.

For every JPG/PNG under images/<subdir>/, writes a sibling .webp file.
Top-level images/ files (acdb-og.jpg, README screenshots) are deliberately
skipped — see tools/flag-large-images.py and the audit notes.

By default originals are NOT deleted; verify the converted site first, then
re-run with --delete-originals to prune the .jpg/.png sources.

Run from anywhere:
    python3 tools/convert-to-webp.py
    python3 tools/convert-to-webp.py --quality 82
    python3 tools/convert-to-webp.py --dry-run
    python3 tools/convert-to-webp.py --force              # re-encode existing .webp
    python3 tools/convert-to-webp.py --delete-originals   # remove .jpg/.png after .webp exists
    python3 tools/convert-to-webp.py --cleanup            # ONLY delete originals; do not convert
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageOps, features

REPO_ROOT = Path(__file__).resolve().parent.parent
IMAGES_DIR = REPO_ROOT / "images"
SOURCE_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def human_size(num_bytes: int) -> str:
    mb = num_bytes / (1024 * 1024)
    if mb >= 1:
        return f"{mb:.2f} MB"
    kb = num_bytes / 1024
    return f"{kb:.1f} KB"


def convert_one(src: Path, quality: int, force: bool) -> tuple[str, int, int]:
    """Convert a single file. Returns (status, src_bytes, dst_bytes).

    status is one of: "converted", "skipped", "error:<msg>".
    """
    dst = src.with_suffix(".webp")
    src_bytes = src.stat().st_size

    if dst.exists() and not force and dst.stat().st_mtime >= src.stat().st_mtime:
        return ("skipped", src_bytes, dst.stat().st_size)

    try:
        with Image.open(src) as img:
            img = ImageOps.exif_transpose(img)
            has_alpha = img.mode in ("RGBA", "LA") or (
                img.mode == "P" and "transparency" in img.info
            )
            if has_alpha:
                img = img.convert("RGBA")
            else:
                img = img.convert("RGB")
            img.save(dst, "WEBP", quality=quality, method=6)
    except Exception as exc:  # noqa: BLE001
        return (f"error:{exc}", src_bytes, 0)

    return ("converted", src_bytes, dst.stat().st_size)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--quality", type=int, default=85, help="WebP quality 0-100 (default 85).")
    parser.add_argument("--dry-run", action="store_true", help="List targets without writing.")
    parser.add_argument("--force", action="store_true", help="Re-encode even if .webp is up-to-date.")
    parser.add_argument(
        "--delete-originals",
        action="store_true",
        help="Delete the source .jpg/.png after the .webp exists and is non-empty. Never deletes on error.",
    )
    parser.add_argument(
        "--cleanup",
        action="store_true",
        help="Skip encoding entirely; only delete .jpg/.png sources whose .webp sibling already exists.",
    )
    args = parser.parse_args()

    if not features.check("webp"):
        print("error: Pillow build lacks WebP support.", file=sys.stderr)
        return 1
    if not IMAGES_DIR.is_dir():
        print(f"error: images directory not found at {IMAGES_DIR}", file=sys.stderr)
        return 1

    targets: list[Path] = []
    for sub in sorted(IMAGES_DIR.iterdir()):
        if not sub.is_dir():
            continue
        for path in sorted(sub.rglob("*")):
            if path.is_file() and path.suffix.lower() in SOURCE_EXTENSIONS:
                targets.append(path)

    if not targets:
        print("No source images found under images/<subdir>/.")
        return 0

    if args.cleanup:
        deletable = [s for s in targets
                     if (d := s.with_suffix(".webp")).exists() and d.stat().st_size > 0]
        orphans = len(targets) - len(deletable)

        if args.dry_run:
            total = sum(p.stat().st_size for p in deletable)
            print(f"[dry-run] Would delete {len(deletable)} original(s), total {human_size(total)}:")
            for p in deletable:
                rel = p.relative_to(REPO_ROOT).as_posix()
                print(f"  {human_size(p.stat().st_size):>9}  {rel}")
            if orphans:
                print(f"({orphans} source(s) have no .webp sibling — left alone.)")
            return 0

        deleted = 0
        for i, src in enumerate(deletable, 1):
            rel = src.relative_to(REPO_ROOT).as_posix()
            try:
                src.unlink()
                deleted += 1
                print(f"[{i}/{len(deletable)}] deleted {rel}")
            except OSError as exc:
                print(f"[{i}/{len(deletable)}] could not delete {rel}: {exc}", file=sys.stderr)

        print()
        print(f"Deleted: {deleted}   No .webp sibling (left alone): {orphans}")
        return 0

    if args.dry_run:
        total = sum(p.stat().st_size for p in targets)
        suffix = " and delete originals after" if args.delete_originals else ""
        print(f"[dry-run] Would convert {len(targets)} file(s){suffix}, total {human_size(total)}:")
        for p in targets:
            rel = p.relative_to(REPO_ROOT).as_posix()
            print(f"  {human_size(p.stat().st_size):>9}  {rel}")
        return 0

    converted = skipped = errors = deleted = 0
    src_total = dst_total = 0
    for i, src in enumerate(targets, 1):
        rel = src.relative_to(REPO_ROOT).as_posix()
        status, s_bytes, d_bytes = convert_one(src, args.quality, args.force)
        src_total += s_bytes
        dst_total += d_bytes
        if status == "converted":
            converted += 1
            saved_pct = (1 - d_bytes / s_bytes) * 100 if s_bytes else 0
            print(f"[{i}/{len(targets)}] {rel}  {human_size(s_bytes)} -> {human_size(d_bytes)}  ({saved_pct:+.0f}%)")
        elif status == "skipped":
            skipped += 1
        else:
            errors += 1
            print(f"[{i}/{len(targets)}] {rel}  ERROR: {status[6:]}", file=sys.stderr)

        if args.delete_originals and status in ("converted", "skipped"):
            dst = src.with_suffix(".webp")
            if dst.exists() and dst.stat().st_size > 0:
                try:
                    src.unlink()
                    deleted += 1
                except OSError as exc:
                    print(f"[{i}/{len(targets)}] {rel}  WARN: could not delete original: {exc}", file=sys.stderr)

    print()
    print(f"Converted: {converted}   Skipped: {skipped}   Errors: {errors}")
    if args.delete_originals:
        print(f"Deleted originals: {deleted}")
    if converted or skipped:
        saved = src_total - dst_total
        pct = (saved / src_total * 100) if src_total else 0
        print(f"Size: {human_size(src_total)} -> {human_size(dst_total)}  ({pct:.1f}% smaller, saved {human_size(saved)})")
    return 0 if errors == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
