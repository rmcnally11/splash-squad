#!/usr/bin/env python3
"""Write circular family-photo portraits for Mallory, Luke, and Connor."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
FAMILY = ROOT / "public/art/family.jpg"
ART = ROOT / "public/art"

# Tight face boxes on the 900x1198 family portrait.
FACES = {
    "mallory": (150, 360, 335, 555),
    "luke": (350, 185, 630, 530),
    "connor": (310, 555, 570, 860),
}
PORTRAITS = {
    "mallory": ART / "portrait-mallory.png",
    "luke": ART / "portrait-luke.png",
    "connor": ART / "portrait-connor.png",
}


def portrait(src: Image.Image, size: int = 256) -> Image.Image:
    src = src.convert("RGB").resize((size, size), Image.Resampling.LANCZOS)
    src = ImageEnhance.Color(src).enhance(1.08)
    src = ImageEnhance.Contrast(src).enhance(1.04)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((2, 2, size - 3, size - 3), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(0.6))
    rgba = src.convert("RGBA")
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(rgba, (0, 0), mask)
    ring = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(ring)
    draw.ellipse((2, 2, size - 3, size - 3), outline=(20, 17, 13, 255), width=7)
    draw.ellipse((8, 8, size - 9, size - 9), outline=(243, 210, 122, 220), width=3)
    return Image.alpha_composite(out, ring)


def main() -> None:
    family = Image.open(FAMILY).convert("RGB")
    for name, box in FACES.items():
        img = portrait(family.crop(box))
        img.save(PORTRAITS[name], optimize=True)
        print(f"{name} {PORTRAITS[name].name} {img.size}")


if __name__ == "__main__":
    main()
