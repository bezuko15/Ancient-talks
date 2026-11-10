/* Ancient Talk service worker. Generated from tools/sw_template.js by tools/upgrades2.py.
   Bump SW_VERSION in tools/upgrades2.py whenever core files change. */
const VERSION = "v29-20261110";
const CORE_CACHE = "at-core-" + VERSION;
const PAGE_CACHE = "at-pages";      // pages/files visited (stale-while-revalidate)
const BOOK_CACHE = "at-books";      // books saved with "Save this book for offline"
const FONT_CACHE = "at-fonts";
const CORE = ["./", "index.html", "library.html", "authors.html", "about.html", "start.html", "daily.html", "shorts.html", "timeline.html", "topics.html", "glossary.html", "support.html", "watch.html", "guides.html", "offline.html", "404.html", "manifest.webmanifest", "css/style.css", "js/books.js", "js/config.js", "js/daily-data.js", "js/daily.js", "js/extras.js", "js/feasts.js", "js/glossary-data.js", "js/main.js", "js/plans-data.js", "js/prayers.js", "js/reader.js", "js/shorts.js", "js/site.js", "js/whats-new-data.js", "js/whats-new.js", "js/upgrades.js", "js/upgrades3.js", "img/emblem.png", "img/favicon.png", "img/apple-touch-icon.png", "img/icon-192.png", "img/icon-512.png", "my-library.html", "plans.html", "search.html", "css/upgrades3.css", "search/docs.json", "fonts/atkinson-Regular.woff2", "fonts/atkinson-Bold.woff2", "prayers.html", "css/upgrades4.css", "css/pwa.css", "js/pwa.js", "img/icon-maskable-512.png", "css/date.css", "js/date.js", "films.html", "icons.html", "ask.html", "map.html", "css/features.css", "js/icons-data.js", "js/icons.js", "js/map.js", "img/icons/christ-pantocrator.jpg", "img/icons/athanasius.jpg", "img/icons/anthony.jpg", "img/icons/chrysostom.jpg", "css/tour.css", "js/tour.js", "css/glossary-pop.css", "js/glossary-pop.js"];
const FONT_CSS = ["https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Source+Sans+3:wght@400;600&display=swap",
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=EB+Garamond:ital@0;1&family=Source+Sans+3:wght@400;600&display=swap"];
const OFFLINE = new URL("offline.html", self.registration.scope).href;

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CORE_CACHE);
    await c.addAll(CORE.map(u => new Request(u, { cache: "reload" })));
    const f = await caches.open(FONT_CACHE);   // best effort; font files are cached on first use
    await Promise.all(FONT_CSS.map(u => fetch(u).then(r => r.ok && f.put(u, r)).catch(() => {})));
    self.skipWaiting();
  })());
});
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) {
      if (k.startsWith("at-core-") && k !== CORE_CACHE) await caches.delete(k);
      if (k === PAGE_CACHE) await caches.delete(k); // drop stale HTML/JS left by v16–v18
    }
    await self.clients.claim();
  })());
});
function store(req, cacheName, res) {
  if (res && (res.ok || res.type === "opaque")) { const copy = res.clone(); caches.open(cacheName).then(c => c.put(req, copy)); }
  return res;
}
function networkFirst(req, cacheName) {
  return fetch(req).then(res => store(req, cacheName, res)).catch(() => caches.match(req).then(hit => hit || (req.mode === "navigate" ? caches.match(OFFLINE) : Response.error())));
}
function swr(req, cacheName, event) {
  return caches.match(req).then(hit => {
    const net = fetch(req).then(res => store(req, cacheName, res));
    if (hit) { event.waitUntil(net.catch(() => {})); return hit; }
    return net.catch(() => req.mode === "navigate" ? caches.match(OFFLINE) : Response.error());
  });
}
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") { e.respondWith(swr(req, FONT_CACHE, e)); return; }
  if (url.origin !== self.location.origin) return;           // analytics, YouTube etc. go straight to network
  const fresh = req.mode === "navigate" || /\.(js|css)$/.test(url.pathname);
  const cacheName = url.pathname.indexOf("/books/") > -1 && !fresh ? BOOK_CACHE : PAGE_CACHE;
  e.respondWith(fresh ? networkFirst(req, cacheName) : swr(req, cacheName, e));
});
