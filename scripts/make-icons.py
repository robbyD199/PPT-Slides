"""Renders the ribbon/add-in icons (stacked slides; magnifier) as PNGs into assets/.
Run: python scripts/make-icons.py  (needs Pillow)."""
import os
import sys
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAVY = (11, 61, 110, 255)
BLUE = (5, 111, 170, 255)
LIGHT = (192, 219, 234, 255)
WHITE = (255, 255, 255, 255)


def rr(d, box, r, fill, outline=None, width=1):
    d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def library_icon(size):
    s = 8  # supersampling
    W = size * s
    im = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    u = W / 32.0
    r = max(1, int(2.2 * u))
    rr(d, (2 * u, 5 * u, 22 * u, 18 * u), r, LIGHT)
    rr(d, (6 * u, 9 * u, 26 * u, 22 * u), r, BLUE)
    rr(d, (10 * u, 13 * u, 30 * u, 27 * u), r, NAVY)
    # title bar + content lines on the front slide
    d.rectangle((13 * u, 16.5 * u, 23 * u, 18 * u), fill=WHITE)
    d.rectangle((13 * u, 20.5 * u, 27 * u, 21.5 * u), fill=LIGHT)
    d.rectangle((13 * u, 23 * u, 24 * u, 24 * u), fill=LIGHT)
    return im.resize((size, size), Image.LANCZOS)


def search_icon(size):
    s = 8
    W = size * s
    im = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    u = W / 32.0
    r = max(1, int(2.2 * u))
    rr(d, (2 * u, 4 * u, 24 * u, 20 * u), r, LIGHT)
    d.rectangle((5 * u, 7.5 * u, 15 * u, 9 * u), fill=NAVY)
    d.rectangle((5 * u, 11.5 * u, 19 * u, 12.5 * u), fill=BLUE)
    # magnifier
    cx, cy, rad = 19 * u, 19 * u, 6.5 * u
    d.ellipse((cx - rad, cy - rad, cx + rad, cy + rad), fill=WHITE, outline=NAVY, width=int(2.6 * u))
    d.line((cx + rad * 0.68, cy + rad * 0.68, 29.5 * u, 29.5 * u), fill=NAVY, width=int(3.4 * u))
    return im.resize((size, size), Image.LANCZOS)


def main():
    out = os.path.join(ROOT, "assets")
    os.makedirs(out, exist_ok=True)
    for sz in (16, 32, 64, 80, 128):
        library_icon(sz).save(os.path.join(out, f"icon-{sz}.png"))
    for sz in (16, 32, 80):
        search_icon(sz).save(os.path.join(out, f"search-{sz}.png"))
    logo = library_icon(256)
    logo.save(os.path.join(out, "logo-filled.png"))
    print("icons written to", out)


if __name__ == "__main__":
    sys.exit(main())
