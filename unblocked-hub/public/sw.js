// public/sw.js
// -------------------------------------------------------------
// Simple “Cache‑first, then network” Service Worker
// -------------------------------------------------------------
const CACHE_NAME = 'unblocked-hub-v1';
const OFFLINE_FALLBACK = '/index.html';

// Files we want to pre‑cache on install.
const PRECACHE_URLS = [
  '/',                // index.html (served as /)
  '/style.css',       // optional, if you have a separate stylesheet
  '/register-sw.js',  // registration script (tiny)
  // Add any other static assets you want offline, e.g.:
  // '/icon-192.png',
  // '/icon-512.png',
];

// -------------------------------------------------------------
// Install – cache core assets
// -------------------------------------------------------------
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting(); // Activate immediately
});

// -------------------------------------------------------------
// Activate – delete old caches
// -------------------------------------------------------------
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(name => {
          if (!currentCaches.includes(name)) {
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// -------------------------------------------------------------
// Fetch – Cache‑first strategy with network fallback
// -------------------------------------------------------------
self.addEventListener('fetch', event => {
  // Only GET requests are handled.
  if (event.request.method !== 'GET') return;

  // Skip cross‑origin requests (CDNs, fonts, etc.) unless you want them cached.
  if (new URL(event.request.url).origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      // Not cached – fetch from network, then cache it.
      return fetch(event.request).then(networkResp => {
        // Only cache successful (200) responses.
        if (!networkResp || networkResp.status !== 200) return networkResp;

        const clone = networkResp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return networkResp;
      }).catch(() => {
        // If both cache and network fail, show the offline fallback page.
        return caches.match(OFFLINE_FALLBACK);
      });
    })
  );
});