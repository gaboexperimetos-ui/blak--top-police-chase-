/* Service Worker: cachea TODOS los archivos para jugar sin conexión tras la primera carga. */
'use strict';
const CACHE = 'btp-offline-v3';
const ASSETS = [
  './', './index.html', './styles.css', './sw.js',
  './vendor/three.min.js', './vendor/THREE-LICENSE.txt',
  './src/core.js', './src/audio.js', './src/models.js', './src/city.js',
  './src/physics.js', './src/ai.js', './src/garage.js', './src/missions.js',
  './src/ui.js', './src/game.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.allSettled(ASSETS.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
