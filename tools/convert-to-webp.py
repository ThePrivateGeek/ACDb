#!/usr/bin/env python3
"""
convert-to-webp.py — batch-convert images/<subdir>/*.{jpg,png} to WebP.

For every JPG/PNG under images/<subdir>/, writes a sibling .webp file.
Top-level images/ files (acdb-og.jpg, README screenshots) are deliberately
skipped — see tools/flag-large-images.py and the audit notes.

New images are at most MAX_WIDTH x MAX_HEIGHT (1600 x 2400): conversions are
shrunk to fit, and so is any new or replaced .webp under images/ that is
bigger (a WebP saved straight from a shop's site, say). "New" means its
content isn't in the last commit; committed images are never touched, since
re-saving them would add a second copy of each to the git history.
tools/validate-catalog.py fails on a new image that is too big.

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
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
IMAGES_DIR = REPO_ROOT / "images"
SOURCE_EXTENSIONS = {".jpg", ".jpeg", ".png"}

# The item window shows an image at most about 800 px wide and the zoom view
# at up to 95% of the screen, so 1600 px is sharp in both; a few product shots
# are very tall, hence the height limit. Pillow is imported where it's used,
# so the validator can import this file without it.
MAX_WIDTH = 1600
MAX_HEIGHT = 2400


def fit(img):
    """Shrink to fit MAX_WIDTH x MAX_HEIGHT, keeping the shape; never enlarges."""
    from PIL import Image

    scale = min(MAX_WIDTH / img.width, MAX_HEIGHT / img.height)
    if scale >= 1:
        return img
    size = (max(1, round(img.width * scale)), max(1, round(img.height * scale)))
    return img.resize(size, Image.Resampling.LANCZOS)


def git(*args, stdin=None):
    return subprocess.run(["git", *args], cwd=REPO_ROOT, input=stdin, capture_output=True, check=True).stdout.decode("utf-8")


def uncommitted_images():
    """Files under images/ (not images/thumbs/) whose content isn't in the last
    commit: new, replaced or edited. A renamed or copied committed image
    doesn't count. None when git can't tell (no git, or no commit yet)."""
    try:
        status = git("status", "--porcelain", "-z", "--untracked-files=all", "--", "images")
        committed = {line.split()[2] for line in git("ls-tree", "-r", "HEAD", "--", "images").splitlines()}
    except (OSError, subprocess.CalledProcessError):
        return None
    paths = []
    entries = iter(status.split("\0"))
    for entry in entries:
        if not entry:
            continue
        code, path = entry[:2], entry[3:]
        if code[0] in "RC":
            next(entries, None)  # the old name follows a rename or copy
        if "D" in code or path.startswith("images/thumbs/") or not (REPO_ROOT / path).is_file():
            continue
        paths.append(path)
    if not paths:
        return []
    hashes = git("hash-object", "--stdin-paths", stdin="\n".join(paths).encode("utf-8")).split()
    return [p for p, h in zip(paths, hashes) if h not in committed]


def oversized_new_webps():
    """[(path, width, height)] for new .webp images bigger than the limit."""
    from PIL import Image

    found = []
    for rel in uncommitted_images() or []:
        if not rel.lower().endswith(".webp"):
            continue
        with Image.open(REPO_ROOT / rel) as img:
            if img.width > MAX_WIDTH or img.height > MAX_HEIGHT:
                found.append((REPO_ROOT / rel, img.width, img.height))
    return found


def shrink_one(path: Path, quality: int) -> tuple[str, int, int]:
    """Shrink a .webp in place to fit the limit. Returns (status, before, after)."""
    from PIL import Image, ImageOps

    before = path.stat().st_size
    try:
        with Image.open(path) as img:
            if getattr(img, "is_animated", False):
                return ("error:animated WebP, shrink it by hand", before, before)
            icc = img.info.get("icc_profile")
            small = fit(ImageOps.exif_transpose(img))
            small.load()
        extra = {"icc_profile": icc} if icc else {}
        small.save(path, "WEBP", quality=quality, method=6, **extra)
    except Exception as exc:  # noqa: BLE001
        return (f"error:{exc}", before, before)
    return ("shrunk", before, path.stat().st_size)


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

    from PIL import Image, ImageOps

    try:
        with Image.open(src) as img:
            img = fit(ImageOps.exif_transpose(img))
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

    from PIL import features

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
        big = oversized_new_webps()
        print(f"[dry-run] Would shrink {len(big)} new .webp file(s) to fit {MAX_WIDTH}x{MAX_HEIGHT}:")
        for path, w, h in big:
            print(f"  {w}x{h}  {path.relative_to(REPO_ROOT).as_posix()}")
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

    if targets:
        print()
        print(f"Converted: {converted}   Skipped: {skipped}   Errors: {errors}")
        if args.delete_originals:
            print(f"Deleted originals: {deleted}")
        if converted or skipped:
            saved = src_total - dst_total
            pct = (saved / src_total * 100) if src_total else 0
            print(f"Size: {human_size(src_total)} -> {human_size(dst_total)}  ({pct:.1f}% smaller, saved {human_size(saved)})")

    # New .webp files (saved as WebP to begin with) that are too big
    big = oversized_new_webps()
    for path, w, h in big:
        rel = path.relative_to(REPO_ROOT).as_posix()
        status, before, after = shrink_one(path, args.quality)
        if status == "shrunk":
            print(f"Shrunk {rel}: {w}x{h} -> fits {MAX_WIDTH}x{MAX_HEIGHT}, {human_size(before)} -> {human_size(after)}")
        else:
            errors += 1
            print(f"{rel}  ERROR: {status[6:]}", file=sys.stderr)

    if not targets and not big:
        if uncommitted_images() is None:
            print("No JPG/PNG to convert. (Git isn't available, so new .webp files weren't checked for size.)")
        else:
            print(f"Nothing to do: no JPG/PNG to convert and no new image bigger than {MAX_WIDTH}x{MAX_HEIGHT}.")
    return 0 if errors == 0 else 1


if __name__ == "__main__":
    # Windows sends piped output (Git Bash, the pre-commit hook) as cp1252,
    # which can't print names like "Tantō"
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    sys.exit(main())
