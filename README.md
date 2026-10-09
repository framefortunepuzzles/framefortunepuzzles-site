# framefortunepuzzles.com

Static website for Frame & Fortune Puzzles. Netlify has no build step: it publishes the `site` folder exactly as it is in GitHub every time `main` changes. Anything generated is generated on a computer first and committed.

## What is where

```
books.json                Every book and every buy link. The single source of truth.
netlify.toml              Netlify settings (publish folder, redirects, headers)
tools/build.js            Fills the pages from books.json and checks for em dashes
tools/make-images.py      Makes a book's web images from its print PDFs
_templates/book-page.html Starting point for every new book page (not published)
site/
  index.html              Homepage (featured book, look inside, the shelf, three ways to play)
  snooker/volume-1/       Snooker Volume 1 book page with buy buttons
  play/snooker-volume-1/  The free sample game, as its own page
  privacy/                Privacy page
  404.html                Page not found
  sitemap.xml, robots.txt For Google
  assets/css/site.css     All styling (green baize and gold)
  assets/js/site.js       Amazon Associates tag (one line), footer year, page enlarger
  assets/img/books/[id]/  Covers, spine, inside pages, game screenshot, share image
  assets/img/, fonts/     Logo sizes, icons, self-hosted fonts
```

Addresses follow one pattern: `/[sport]/volume-[n]/` for a book and `/play/[sport]-volume-[n]/` for its free game. A book's id in books.json is `[sport]-volume-[n]`, matching both.

## Before every push

```
node tools/build.js
```

It rewrites every part of a page between `<!-- build:... -->` and `<!-- /build -->` from books.json (buy buttons, the homepage shelf, the 3D books, the inside pages, structured data). It leaves everything else alone. It then stops with a list of files and lines if it finds an em dash anywhere. Commit the pages it changes along with books.json.

## Changing a link

Edit the link in `books.json`, run `node tools/build.js`, commit and push. Every button that uses it updates. Any link left empty falls back to the Etsy shop (`fallbackLink`).

## Adding a new book (Claude does this in the book's chat)

1. Add the book to the top of `books.json` (newest first) with its links, `category` ("sports" or "word puzzles") and `status` ("live" or "coming soon").
2. Make its images: `python tools/make-images.py [id] COVER-WRAP.pdf WRITE-ON.pdf 3 5 15 38 56 67` (the numbers are the inside pages to show; list them in `previewPages` with a label). A book only appears on the shelf once its cover exists.
3. Put the sample game at `site/play/[id]/index.html` (same site bar as the snooker game). Screenshot it at phone width (390 by 780) and save it as `game-390.webp` and `game-390.jpg` in the book's image folder.
4. Copy `_templates/book-page.html` to `site/[sport]/volume-[n]/index.html`, replace `[book-id]` and fill every other `[PLACEHOLDER]`.
5. Add the new addresses to `site/sitemap.xml`.
6. Run `node tools/build.js`, then push.

Images are only ever the books' own covers and pages, or screenshots of our own game. The 3D book is drawn in CSS around the real cover image, so cover text is never redrawn.

## Amazon Associates

Once approved, open `site/assets/js/site.js`, put your tracking ID in `AMAZON_TAG = ""`, and push. Every button marked `data-amazon` picks it up. The required disclosure line is in every page footer.
