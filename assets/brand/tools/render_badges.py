#!/usr/bin/env python3
"""Render FINCH README badges: dark-green label, mint value with dark-green text.

Usage: python3 assets/brand/tools/render_badges.py   (requires Pillow)
Input: assets/brand/badges/badges.json · Output: assets/brand/badges/<slug>.png
Rendered at 2x (40 px high); READMEs display them at height 20.
Shields.io chooses badge text colour automatically and renders white text on the brand mint
(about 1.9:1), so these badges are drawn locally and every pair is checked against WCAG AA.
"""
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "assets" / "brand" / "badges"
SCALE, HEIGHT, PAD, RADIUS = 2, 20, 7, 3
LABEL_BG, LABEL_FG = (14, 67, 49), (255, 255, 255)  # green.900 / white
VALUE_BG, VALUE_FG = (111, 207, 151), (5, 63, 43)  # green.300 / green.950


def luminance(rgb: tuple[int, int, int]) -> float:
    def channel(c: int) -> float:
        s = c / 255
        return s / 12.92 if s <= 0.04045 else ((s + 0.055) / 1.055) ** 2.4

    r, g, b = (channel(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    hi, lo = sorted((luminance(a), luminance(b)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def font(bold: bool) -> ImageFont.FreeTypeFont:
    size = 11 * SCALE
    for path in (
        f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if bold else ''}.ttf",
        f"/usr/share/fonts/truetype/liberation/LiberationSans-{'Bold' if bold else 'Regular'}.ttf",
    ):
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    raise SystemExit("no TrueType font found (install fonts-dejavu or fonts-liberation)")


def render(slug: str, label: str, value: str) -> None:
    fl, fv = font(True), font(False)
    pad, h = PAD * SCALE, HEIGHT * SCALE
    lw = int(fl.getlength(label)) + 2 * pad
    vw = int(fv.getlength(value)) + 2 * pad
    img = Image.new("RGBA", (lw + vw, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, lw + vw - 1, h - 1), RADIUS * SCALE, fill=VALUE_BG)
    d.rounded_rectangle((0, 0, lw + RADIUS * SCALE, h - 1), RADIUS * SCALE, fill=LABEL_BG)
    d.rectangle((lw, 0, lw + RADIUS * SCALE, h - 1), fill=VALUE_BG)
    d.text((pad, h / 2), label, font=fl, fill=LABEL_FG, anchor="lm")
    d.text((lw + pad, h / 2), value, font=fv, fill=VALUE_FG, anchor="lm")
    img.save(OUT / f"{slug}.png", optimize=True)


def main() -> None:
    for fg, bg in ((LABEL_FG, LABEL_BG), (VALUE_FG, VALUE_BG)):
        ratio = contrast(fg, bg)
        if ratio < 4.5:
            raise SystemExit(f"contrast {ratio:.2f}:1 is below WCAG AA for {fg} on {bg}")
    spec = json.loads((OUT / "badges.json").read_text(encoding="utf-8"))
    for slug, label, value in spec["badges"]:
        render(slug, label, value)
    print(
        f"rendered {len(spec['badges'])} badges into {OUT} "
        f"(label {contrast(LABEL_FG, LABEL_BG):.2f}:1, value {contrast(VALUE_FG, VALUE_BG):.2f}:1)"
    )


if __name__ == "__main__":
    main()
