/* Frame & Fortune Puzzles: site script
   AMAZON ASSOCIATES TAG
   Once Amazon approves you, put your tracking ID between the quotes below
   (it looks like  yourname-21 ) and push. Every Amazon button on the site
   picks it up automatically. Leave it empty until then. */
var AMAZON_TAG = "";

(function () {
  if (!AMAZON_TAG) return;
  var links = document.querySelectorAll('a[data-amazon]');
  for (var i = 0; i < links.length; i++) {
    try {
      var url = new URL(links[i].href);
      url.searchParams.set("tag", AMAZON_TAG);
      links[i].href = url.toString();
    } catch (e) { /* leave the link as it is */ }
  }
})();

/* Year in the footer */
(function () {
  var y = document.querySelectorAll('[data-year]');
  for (var i = 0; i < y.length; i++) y[i].textContent = new Date().getFullYear();
})();

/* Inside pages: tap a page to see it larger. Without JavaScript the link
   simply opens the full-size image. */
(function () {
  var thumbs = document.querySelectorAll('.page-thumb');
  if (!thumbs.length || typeof HTMLDialogElement !== 'function') return;

  var box = document.createElement('dialog');
  box.className = 'lightbox';
  box.setAttribute('aria-label', 'Page preview');
  box.innerHTML =
    '<figure><picture><source type="image/webp"><img alt=""></picture><figcaption></figcaption></figure>' +
    '<button class="lb-btn lb-close" type="button" aria-label="Close">&times;</button>' +
    '<button class="lb-btn lb-prev" type="button" aria-label="Previous page">&lsaquo;</button>' +
    '<button class="lb-btn lb-next" type="button" aria-label="Next page">&rsaquo;</button>';
  document.body.appendChild(box);

  var source = box.querySelector('source'), img = box.querySelector('img'), cap = box.querySelector('figcaption');
  var list = [], current = 0;

  function show(i) {
    current = (i + list.length) % list.length;
    var a = list[current];
    source.srcset = a.getAttribute('data-webp');
    img.src = a.href;
    img.alt = a.querySelector('img').alt;
    cap.textContent = a.getAttribute('data-caption');
  }

  for (var i = 0; i < thumbs.length; i++) {
    thumbs[i].addEventListener('click', function (e) {
      e.preventDefault();
      list = Array.prototype.slice.call(this.closest('.pages').querySelectorAll('.page-thumb'));
      show(list.indexOf(this));
      box.showModal();
    });
  }
  box.querySelector('.lb-close').addEventListener('click', function () { box.close(); });
  box.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
  box.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
})();
