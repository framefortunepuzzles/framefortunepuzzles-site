# framefortunepuzzles.com

Static website for Frame & Fortune Puzzles. No build step: Netlify publishes the `site` folder every time you push to GitHub.

## What is where

```
netlify.toml              Netlify settings (publish folder, redirects, headers)
_templates/book-page.html Starting point for every new book page (not published)
site/
  index.html              Homepage (logo, the books shelf, three ways to play)
  snooker/volume-1/       Snooker Volume 1 book page with buy buttons
  play/snooker-volume-1/  The free sample game, as its own page
  privacy/                Privacy page
  404.html                Page not found
  sitemap.xml, robots.txt For Google
  assets/css/site.css     All styling (green and gold)
  assets/js/site.js       Amazon Associates tag goes here (one line)
  assets/img/, fonts/     Logo sizes, icons, self-hosted fonts
```

Addresses follow one pattern: `/[sport]/volume-[n]/` for a book and `/play/[sport]-volume-[n]/` for its free game.

## Adding a new book (Claude does this in the book's chat)

1. Copy `_templates/book-page.html` to `site/[sport]/volume-[n]/index.html` and fill every `[PLACEHOLDER]`.
2. Put the sample game at `site/play/[sport]-volume-[n]/index.html` (same site bar as the snooker game).
3. In `site/index.html`, copy the BOOK ROW block, paste it at the top of the shelf, and edit it.
4. Add the new addresses to `site/sitemap.xml`.
5. Push. Netlify updates the live site in about a minute.

## Amazon Associates

Once approved, open `site/assets/js/site.js`, put your tracking ID in `AMAZON_TAG = ""`, and push. Every button marked `data-amazon` picks it up. The required disclosure line is already in every page footer.
