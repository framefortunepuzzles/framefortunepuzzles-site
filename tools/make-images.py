"""Make the web images for one book from its print files.

Needs Python with PyMuPDF and Pillow:  pip install pymupdf pillow

Usage (from the repo root):
  python tools/make-images.py BOOK_ID COVER_WRAP.pdf WRITE_ON.pdf PAGE PAGE PAGE ...

Example:
  python tools/make-images.py snooker-volume-1 SNOOKER-V1-02-COVER-WRAP-KDP.pdf SNOOKER-V1-03-WRITEON-PDF-Scribe-Etsy-Payhip.pdf 3 5 15 38 56 67

Writes to site/assets/img/books/BOOK_ID/:
  cover-400/760 (.webp and .jpg)  front cover, cut from the KDP wrap
  spine (.webp and .jpg)          the spine strip, for the 3D mockup
  page-N-600/1200 (.webp and .jpg) inside pages from the write-on PDF
  og (.jpg)                        1200 x 630 share image
Cover text is never redrawn: every image is a straight crop or render of your own files.
"""
import io
import os
import sys

import pymupdf
from PIL import Image, ImageDraw, ImageFilter

BLEED = 9  # 0.125 inch in PDF points
TRIM_W, TRIM_H = 612, 792  # 8.5 x 11 inches


def render(page, clip, dpi):
    pix = page.get_pixmap(dpi=dpi, clip=clip)
    return Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")


def save(img, out, name, width=None, quality=80):
    if width and img.width > width:
        img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    img.save(os.path.join(out, name + ".webp"), "WEBP", quality=quality, method=6)
    img.save(os.path.join(out, name + ".jpg"), "JPEG", quality=quality + 4, optimize=True, progressive=True)
    return img


def og_image(cover, out):
    w, h = 1200, 630
    bg = Image.new("RGB", (w, h), "#0a2817")
    glow = Image.new("L", (w, h), 0)
    ImageDraw.Draw(glow).ellipse((w // 2 - 520, -260, w // 2 + 520, h - 40), fill=120)
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    bg = Image.composite(Image.new("RGB", (w, h), "#1d5c37"), bg, glow)
    ch = 560
    c = cover.resize((round(cover.width * ch / cover.height), ch), Image.LANCZOS)
    shadow = Image.new("L", (w, h), 0)
    x, y = (w - c.width) // 2, (h - ch) // 2
    ImageDraw.Draw(shadow).rectangle((x + 10, y + 18, x + c.width + 10, y + ch + 18), fill=170)
    bg = Image.composite(Image.new("RGB", (w, h), "black"), bg, shadow.filter(ImageFilter.GaussianBlur(18)))
    bg.paste(c, (x, y))
    bg.save(os.path.join(out, "og.jpg"), "JPEG", quality=84, optimize=True, progressive=True)


def main():
    book_id, wrap_pdf, writeon_pdf, *pages = sys.argv[1:]
    out = os.path.join("site", "assets", "img", "books", book_id)
    os.makedirs(out, exist_ok=True)

    wrap = pymupdf.open(wrap_pdf)[0]
    right = wrap.rect.width - BLEED
    front = pymupdf.Rect(right - TRIM_W, BLEED, right, BLEED + TRIM_H)
    spine = pymupdf.Rect(BLEED + TRIM_W, BLEED, right - TRIM_W, BLEED + TRIM_H)

    cover = render(wrap, front, 300)
    for wdt in (400, 760):
        save(cover, out, f"cover-{wdt}", wdt, quality=72)
    sp = render(wrap, spine, 150)
    save(sp, out, "spine", quality=75)
    og_image(cover, out)

    book = pymupdf.open(writeon_pdf)
    for n in pages:
        img = render(book[int(n) - 1], None, 150)
        for wdt in (600, 1200):
            save(img, out, f"page-{n}-{wdt}", wdt, quality=78)

    print("Wrote", len(os.listdir(out)), "files to", out)
    print("Spine width in points:", round(spine.width, 2))


if __name__ == "__main__":
    main()
