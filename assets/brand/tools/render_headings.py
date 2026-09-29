#!/usr/bin/env python3
"""Render FINCH README section headings in the brand banner style.

Usage: python3 assets/brand/tools/render_headings.py   (requires Pillow)
Input: assets/brand/headings/headings.json · Output: assets/brand/headings/<slug>.png
Fonts: Liberation Sans (metric-compatible, open license) if available, else DejaVu Sans.
"""
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[3]
BRAND = ROOT / "assets" / "brand"
OUT = BRAND / "headings"
W, H = 1600, 200
GRADIENT = [(5, 63, 43), (14, 67, 49), (31, 122, 85)]
WHITE, MINT, MINT_SOFT = (255, 255, 255), (167, 227, 193), (111, 207, 151)


def font(bold: bool, size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        f"/usr/share/fonts/truetype/liberation/LiberationSans-{'Bold' if bold else 'Regular'}.ttf",
        f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if bold else ''}.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def background() -> Image.Image:
    img = Image.new("RGB", (W, H))
    px = img.load()
    for x in range(W):
        for y in range(H):
            t = x / W * 0.8 + y / H * 0.2
            a, b, u = (GRADIENT[0], GRADIENT[1], t / 0.5) if t < 0.5 else (GRADIENT[1], GRADIENT[2], (t - 0.5) / 0.5)
            px[x, y] = tuple(int(a[i] + (b[i] - a[i]) * u) for i in range(3))
    img = img.convert("RGBA")
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse((1150, -300, 1900, 450), fill=(111, 207, 151, 60))
    return Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(90)))


def bird() -> Image.Image:
    """White bird mark cut from the dark primary logo (the wordmark is dropped)."""
    logo = Image.open(BRAND / "finch-logo-primary-dark.png").convert("RGBA")
    px = logo.load()
    for y in range(logo.height):
        for x in range(logo.width):
            r, g, b, _ = px[x, y]
            alpha = max(0, min(255, int(((r + g + b) / 3 - 70) / 175 * 255)))
            px[x, y] = (255, 255, 255, alpha)
    logo = logo.crop(logo.getbbox())
    return logo.crop((0, 0, logo.width, int(logo.height * 0.66))).crop(
        logo.crop((0, 0, logo.width, int(logo.height * 0.66))).getbbox()
    )


def render(mark: Image.Image, slug: str, title: str, subtitle: str, eyebrow: str) -> None:
    img = background()
    h = 128
    m = mark.resize((int(mark.width * h / mark.height), h), Image.LANCZOS)
    img.alpha_composite(m, (64, (H - h) // 2))
    d = ImageDraw.Draw(img)
    x = 64 + m.width + 56
    d.line((x - 28, 50, x - 28, 150), fill=(111, 207, 151, 160), width=2)
    d.text((x, 40), eyebrow.upper(), font=font(True, 20), fill=MINT_SOFT)
    title_font = font(True, 56)
    while d.textlength(title, font=title_font) > W - x - 60 and title_font.size > 36:
        title_font = font(True, title_font.size - 2)
    d.text((x, 66), title, font=title_font, fill=WHITE)
    d.text((x, 136), subtitle, font=font(False, 28), fill=MINT)
    img.convert("RGB").save(OUT / f"{slug}.png", optimize=True)


def main() -> None:
    spec = json.loads((OUT / "headings.json").read_text(encoding="utf-8"))
    mark = bird()
    for slug, title, subtitle in spec["public"]:
        render(mark, slug, title, subtitle, "FINCH")
    for i, (slug, title, subtitle) in enumerate(spec["developers"]):
        render(mark, slug, title, subtitle, "FINCH · developers" if i == 0 else f"FINCH · developers · {i:02d}")
    print(f"rendered {len(spec['public']) + len(spec['developers'])} headings into {OUT}")


if __name__ == "__main__":
    main()
