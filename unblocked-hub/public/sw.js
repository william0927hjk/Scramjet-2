// public/sw.js
// Scramjet v2 service worker bootstrap.
// The server serves scramjet's built assets at /scramjet/ from node_modules.

importScripts('/scramjet/scramjet.sw.js');

const scramjet = new ScramjetServiceWorker();

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  if (scramjet.route(e)) {
    e.respondWith(scramjet.fetch(e));
  }
});
