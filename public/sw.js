/* Mecatron Sim — Service Worker */
const CACHE = 'mecatron-sim-v6';

/* On ne met PAS './index.html' dans le cache : selon la configuration
   du serveur, sa récupération peut passer par une redirection, et une
   réponse portant ce drapeau ne peut pas être servie à une navigation
   (Safari : "Response served by service worker has redirections"). */
const CORE = [
  './',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
  './icon-maskable-512.png',
  './favicon.png'
];

const RUNTIME_HOSTS = [
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

/* Recopie une réponse en supprimant tout drapeau de redirection. */
async function clean(res) {
  if (!res || !res.redirected) return res;
  const body = await res.blob();
  return new Response(body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers
  });
}

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(
        CORE.map(u =>
          fetch(new Request(u, { cache: 'reload' }))
            .then(r => (r && r.ok) ? clean(r).then(cr => c.put(u, cr)) : null)
            .catch(() => null)
        )
      ))
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

  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (!/^https?:$/.test(url.protocol)) return;

  /* ── JAMAIS DE CACHE SUR LA LICENCE ── */
  if (url.pathname.includes('/api/') || url.pathname.endsWith('bv-license.js')) {
    return;
  }

  /* ── NAVIGATIONS : réseau d'abord, cache en secours ── */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          clean(copy).then(cr => {
            if (cr && cr.ok) caches.open(CACHE).then(c => c.put('./', cr));
          }).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./'))
    );
    return;
  }

  /* ── CDN : stale-while-revalidate ── */
  if (RUNTIME_HOSTS.includes(url.hostname)) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(req).then(cached => {
          const net = fetch(req).then(res => {
            if (res && res.status === 200) {
              clean(res.clone()).then(cr => { if (cr) cache.put(req, cr); }).catch(() => {});
            }
            return res;
          }).catch(() => cached);
          return cached || net;
        })
      )
    );
    return;
  }

  /* ── Même origine : cache d'abord ── */
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(res => {
          if (res && res.status === 200 && res.type === 'basic') {
            clean(res.clone()).then(cr => {
              if (cr) caches.open(CACHE).then(c => c.put(req, cr));
            }).catch(() => {});
          }
          return res;
        }).catch(() => caches.match('./'));
      })
    );
  }
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
