// PenguinSoundEffectPlayer Service Worker
// v0.6.2 — cache updated

const CACHE_NAME = 'psep-v0.6';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    // Delete old caches first, then add new
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname.includes('fonts.')) {
    e.respondWith(
      caches.open(CACHE_NAME).then(c =>
        c.match(e.request).then(cached =>
          cached || fetch(e.request).then(res => { c.put(e.request, res.clone()); return res; })
        )
      )
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
  );
});
