/* Mecatron Sim — Service Worker */
const CACHE = 'mecatron-sim-v4';

// Ressources locales mises en cache à l'installation
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
  './icon-maskable-512.png'
];

// CDN externes : mis en cache à la volée (Three.js, polices)
const RUNTIME_HOSTS = [
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CORE).catch(err => {
        console.warn('[SW] Certaines ressources non mises en cache', err);
      }))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // CDN → stale-while-revalidate (fonctionne hors-ligne après 1re visite)
  if (RUNTIME_HOSTS.includes(url.hostname)) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(req).then(cached => {
          const net = fetch(req).then(res => {
            if (res && res.status === 200) cache.put(req, res.clone());
            return res;
          }).catch(() => cached);
          return cached || net;
        })
      )
    );
    return;
  }

  // Même origine → cache d'abord, réseau en secours
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(res => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req, copy));
          }
          return res;
        }).catch(() => caches.match('./index.html'));
      })
    );
  }
});
