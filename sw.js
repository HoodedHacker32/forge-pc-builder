/* Forge · Service worker — offline-first caching */
const CACHE = 'forge-v9';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css?v=9',
  './js/data.js?v=9',
  './js/art.js?v=9',
  './js/compat.js?v=9',
  './js/app.js?v=9',
  './img/hex-tile.svg',
  './manifest.webmanifest',
  './icons/icon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// The HTML document is never versioned by a `?v=` query string, so it must never be
// served cache-first — a stale cached index.html paired with a fresh app.js is exactly
// the kind of drift that breaks the whole page (missing elements the new JS expects).
// Navigation requests always go network-first; only the hashed/versioned static assets
// are safe to serve cache-first.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html').then((cached) => cached || caches.match('./')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
