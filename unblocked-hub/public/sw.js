// public/sw.js
// Scramjet v2 requires its own SW bundle to be imported here.
// The bundle is served by the server from node_modules at /scramjet/

importScripts('/scramjet/scramjet.sw.js');

// Boot the Scramjet service worker
const scramjet = new ScramjetServiceWorker();

self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', e  => e.waitUntil(self.clients.claim()));

// Hand all fetch events to Scramjet
self.addEventListener('fetch', e => {
  // Let Scramjet decide if it should handle this request.
  // If the URL is not proxied, it returns undefined and the browser
  // handles it normally.
  if (scramjet.route(e)) {
    e.respondWith(scramjet.fetch(e));
  }
});
