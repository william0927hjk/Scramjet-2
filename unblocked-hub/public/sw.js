// public/sw.js
// This file requires the Scramjet service-worker asset supplied by the installed
// Scramjet package. The server exposes that package under /scramjet/.

importScripts('/scramjet/scramjet.sw.js');

const scramjet = new ScramjetServiceWorker();

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
  if (scramjet.route(event)) {
    event.respondWith(scramjet.fetch(event));
  }
});
