#!/usr/bin/env python3
"""
make-portrait.py - turn a character image into the Characters tab's portrait.

Crops a 3:4 head-and-shoulders box from the source image, scales it to
300x400 and saves it as images/characters/<slug>.webp, the file a
character's "image" field in js/characters.js points at.

    python3 tools/make-portrait.py <source image> <slug>
    python3 tools/make-portrait.py <source image> <slug> --box LEFT,TOP,WIDTH
    python3 tools/make-portrait.py <source image> <slug> --box 120,40,520 --force

--box gives the crop in source pixels: its left and top edge and its width
(the height is width x 4/3). Without it, the largest 3:4 box at the top
centre is used, which suits a database portrait or a render that is
already roughly head and shoulders; for a full-body render, give a box.
The slug is the character's page address: #characters/<slug>.

Transparency is kept (the card shows its dark portrait background through
it). A crop narrower than 300px is scaled up and a warning is printed:
look for a bigger source.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "images" / "characters"
SIZE = (300, 400)


def main() -> int:
    parser = argparse.ArgumentParser(description="Make a 300x400 WebP character portrait.")
    parser.add_argument("source", type=Path, help="the source image (any format Pillow reads)")
    parser.add_argument("slug", help="the character's slug, e.g. ezio-auditore-da-firenze")
    parser.add_argument("--box", help="crop as LEFT,TOP,WIDTH in source pixels (height = width x 4/3)")
    parser.add_argument("--quality", type=int, default=85, help="WebP quality (default 85)")
    parser.add_argument("--force", action="store_true", help="overwrite an existing portrait")
    args = parser.parse_args()

    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", args.slug):
        print(f"make-portrait: {args.slug!r} isn't a slug (lowercase letters, digits and hyphens)")
        return 1
    out = OUT_DIR / f"{args.slug}.webp"
    if out.exists() and not args.force:
        print(f"make-portrait: {out.relative_to(ROOT)} exists; add --force to replace it")
        return 1

    with Image.open(args.source) as img:
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGBA" if "A" in img.getbands() or "transparency" in img.info else "RGB")
        w, h = img.size
        if args.box:
            try:
                left, top, width = (int(v) for v in args.box.split(","))
            except ValueError:
                print("make-portrait: --box should be LEFT,TOP,WIDTH, e.g. 120,40,520")
                return 1
        else:
            width = min(w, h * 3 // 4)
            left, top = (w - width) // 2, 0
        height = width * 4 // 3
        if left < 0 or top < 0 or width <= 0 or left + width > w or top + height > h:
            print(f"make-portrait: the box {left},{top} {width}x{height} doesn't fit in the {w}x{h} image")
            return 1
        portrait = img.crop((left, top, left + width, top + height)).resize(SIZE, Image.LANCZOS)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    portrait.save(out, "WEBP", quality=args.quality, method=6)
    note = f" (scaled up from {width}px wide: look for a bigger source)" if width < SIZE[0] else ""
    print(f"make-portrait: wrote {out.relative_to(ROOT).as_posix()}, {out.stat().st_size // 1024} KB{note}")
    print(f'  in js/characters.js: "image": "images/characters/{args.slug}.webp"')
    return 0


if __name__ == "__main__":
    sys.exit(main())
