// Frame & Fortune Puzzles: fill every page from books.json, then check for em dashes.
// Run from the repo root before every push:   node tools/build.js
// No installs needed. Netlify does not run this: it only publishes the files this writes.
//
// Pages mark the parts this script owns like this:
//   <!-- build:buy-pdf snooker-volume-1 -->  ...generated...  <!-- /build -->
// Everything between the two markers is rewritten. Everything outside is left alone.
//
// Blocks:
//   shelf                  every book that has a cover, in books.json order (newest first)
//   featured               the 3D book for the first live book with a cover (homepage hero)
//   featured-actions       play and see-the-book buttons for that same book
//   mockup ID [hero]       3D book built from the real cover and spine images
//   buy-paperback ID       Amazon button (data-amazon, rel sponsored)
//   buy-pdf ID             Payhip and Etsy buttons for the write-on PDF
//   buy-game ID            Payhip and Etsy buttons for the playable game
//   preview ID [strip]     inside pages that open larger when tapped
//   tablet ID              a preview page shown in a tablet frame
//   phone ID               the free game screenshot shown in a phone frame
//   jsonld ID              structured data for Google

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE = path.join(ROOT, "site");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "books.json"), "utf8"));
const FALLBACK = data.fallbackLink;
const books = data.books;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const img = (b) => `/assets/img/books/${b.id}`;
const hasFile = (p) => fs.existsSync(path.join(SITE, p));
const hasCover = (b) => hasFile(`${img(b)}/cover-400.webp`);
const fullTitle = (b) => `${b.title} Volume ${b.volume}`;
const link = (url) => url || FALLBACK;

function book(id) {
  const b = books.find((x) => x.id === id);
  if (!b) throw new Error(`books.json has no book with id "${id}"`);
  return b;
}

function picture(b, base, widths, sizes, alt, w, h, eager) {
  const set = (ext) => widths.map((x) => `${base}-${x}.${ext} ${x}w`).join(", ");
  const load = eager ? `fetchpriority="high"` : `loading="lazy" decoding="async"`;
  return `<picture><source type="image/webp" srcset="${set("webp")}" sizes="${sizes}">` +
    `<img src="${base}-${widths[0]}.jpg" srcset="${set("jpg")}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}" ${load}></picture>`;
}

const blocks = {
  mockup(b, opt) {
    const hero = opt === "hero";
    const spine = `${img(b)}/spine`;
    const sizes = hero ? "(max-width: 820px) 62vw, 360px" : "(max-width: 820px) 46vw, 220px";
    return `<span class="book3d${hero ? " book3d-hero" : ""}">` +
      `<span class="book3d-inner">` +
      `<span class="book3d-spine" style="background-image:url(${spine}.jpg);background-image:image-set(url(${spine}.webp) type('image/webp'),url(${spine}.jpg) type('image/jpeg'))"></span>` +
      `<span class="book3d-cover">${picture(b, `${img(b)}/cover`, [400, 760], sizes, `Front cover of ${fullTitle(b)} by David Walker`, 400, 518, hero)}</span>` +
      `</span></span>`;
  },

  featured() {
    const b = books.find((x) => x.status === "live" && hasCover(x));
    if (!b) return "";
    return `<a class="featured-book" href="${b.page}" aria-label="See ${esc(fullTitle(b))}">${blocks.mockup(b, "hero")}</a>`;
  },

  "featured-actions"() {
    const b = books.find((x) => x.status === "live" && hasCover(x));
    if (!b) return "";
    return `<a class="btn btn-gold" href="${b.play}">Play the free ${esc(b.subject.toLowerCase())} game</a>\n` +
      `<a class="btn btn-line" href="${b.page}">See the ${esc(b.subject.toLowerCase())} book</a>`;
  },

  shelf() {
    return books.filter(hasCover).map((b) => {
      const live = b.status === "live";
      return `<article class="shelf-card">
  <a class="shelf-cover" href="${b.page}" tabindex="-1" aria-hidden="true">${blocks.mockup(b)}</a>
  <div class="shelf-body">
    <p class="eyebrow">${esc(b.subject)} <span aria-hidden="true">&middot;</span> Volume ${b.volume}${live ? "" : ` <span class="badge">Coming soon</span>`}</p>
    <h3><a href="${b.page}">${esc(b.title)}</a></h3>
    <p>${esc(b.blurb)}</p>
    <p class="shelf-formats">Paperback, write-on PDF and playable game</p>
    <div class="actions">
      <a class="btn btn-felt" href="${b.page}">See the book</a>
      ${live ? `<a class="btn btn-plain" href="${b.play}">Play the free sample</a>` : ""}
    </div>
  </div>
</article>`;
    }).join("\n");
  },

  "buy-paperback"(b) {
    if (!b.amazonAsin) return `<a class="btn btn-felt" href="${FALLBACK}">Visit our Etsy shop</a>`;
    return `<a class="btn btn-felt" data-amazon rel="sponsored noopener" href="https://www.amazon.co.uk/dp/${esc(b.amazonAsin)}">Buy on Amazon</a>`;
  },

  "buy-pdf"(b) {
    return `<a class="btn btn-felt" href="${esc(link(b.payhipPdf))}">Buy direct on Payhip</a>\n` +
      `<a class="btn btn-plain" href="${esc(link(b.etsyPdf))}">Buy on Etsy</a>`;
  },

  "buy-game"(b) {
    return `<a class="btn btn-felt" href="${esc(link(b.payhipGame))}">Buy direct on Payhip</a>\n` +
      `<a class="btn btn-plain" href="${esc(link(b.etsyGame))}">Buy on Etsy</a>`;
  },

  preview(b, opt) {
    const items = (b.previewPages || []).map((p) => {
      const base = `${img(b)}/page-${p.n}`;
      const sizes = opt === "strip" ? "(max-width: 820px) 62vw, 240px" : "(max-width: 600px) 46vw, (max-width: 1000px) 30vw, 300px";
      return `<li><a class="page-thumb" href="${base}-1200.jpg" data-webp="${base}-1200.webp" data-caption="${esc(p.label)}">` +
        picture(b, base, [600, 1200], sizes, `Page ${p.n}: ${p.label}`, 600, 776, false) +
        `<span class="page-cap">${esc(p.label)}</span></a></li>`;
    }).join("\n");
    return `<ul class="pages${opt === "strip" ? " pages-strip" : ""}" role="list">\n${items}\n</ul>`;
  },

  tablet(b) {
    const p = (b.previewPages || [])[0];
    if (!p) return "";
    return `<span class="device device-tablet">${picture(b, `${img(b)}/page-${p.n}`, [600], "220px", `A write-on page from ${fullTitle(b)} on a tablet`, 600, 776, false)}</span>`;
  },

  phone(b) {
    if (!hasFile(`${img(b)}/game-390.webp`)) return "";
    return `<span class="device device-phone">${picture(b, `${img(b)}/game`, [390], "180px", `The ${b.subject.toLowerCase()} puzzle game playing on a phone`, 390, 780, false)}</span>`;
  },

  jsonld(b) {
    const ld = {
      "@context": "https://schema.org", "@type": "Book", name: `${b.title}: Volume ${b.volume}`,
      author: { "@type": "Person", name: "David Walker" }, bookFormat: "https://schema.org/Paperback",
      numberOfPages: b.pages, isPartOf: { "@type": "BookSeries", name: b.title },
      url: `https://framefortunepuzzles.com${b.page}`,
      image: `https://framefortunepuzzles.com${img(b)}/cover-760.jpg`,
    };
    if (b.amazonAsin) ld.sameAs = `https://www.amazon.co.uk/dp/${b.amazonAsin}`;
    return `<script type="application/ld+json">\n${JSON.stringify(ld)}\n</script>`;
  },
};

const MARK = /<!-- build:([a-z-]+)(?: ([a-z0-9-]+))?(?: ([a-z]+))? -->[\s\S]*?<!-- \/build -->/g;

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (f.name === ".git" || f.name === "node_modules") continue;
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

let changed = 0;
for (const file of walk(SITE).filter((f) => f.endsWith(".html"))) {
  const before = fs.readFileSync(file, "utf8");
  const after = before.replace(MARK, (m, name, id, opt) => {
    if (!blocks[name]) throw new Error(`${path.relative(ROOT, file)}: unknown block "${name}"`);
    const html = blocks[name](id ? book(id) : null, opt);
    return `<!-- build:${name}${id ? " " + id : ""}${opt ? " " + opt : ""} -->${html}<!-- /build -->`;
  });
  if (after !== before) { fs.writeFileSync(file, after); changed++; console.log("updated", path.relative(ROOT, file)); }
}
console.log(`${changed} page(s) updated from books.json`);

// Em dash check: every text file in the repo, including the template and this script's output.
const TEXT = /\.(html|css|js|json|md|toml|txt|xml|py|svg)$/i;
// (built from pieces so this file does not flag itself)
const DASH = new RegExp([String.fromCharCode(0x2014), "&" + "mdash;", "&" + "#8212;", "&" + "#x2014;"].join("|"), "i");
const bad = [];
for (const file of walk(ROOT).filter((f) => TEXT.test(f))) {
  fs.readFileSync(file, "utf8").split("\n").forEach((line, i) => {
    if (DASH.test(line)) bad.push(`${path.relative(ROOT, file)}:${i + 1}`);
  });
}
if (bad.length) {
  console.error("Em dash found. Fix these before pushing:\n  " + bad.join("\n  "));
  process.exit(1);
}
console.log("Em dash check passed");
