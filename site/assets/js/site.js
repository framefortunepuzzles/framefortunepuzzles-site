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
