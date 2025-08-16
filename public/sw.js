const CACHE_NAME = 'istqb-ace-it-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Network-first to avoid stale assets
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
}); 