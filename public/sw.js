// Service worker minimale per gospel-dono: solo "guscio" (pagine viste + icone), rete sempre prima.
// MAI in cache: /api/* e nulla di dinamico. Il contenuto del giorno deve rimanere fresco.
const CACHE = 'gospel-dono-shell-v1';
const SHELL = ['/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  const isNav = req.mode === 'navigate';
  if (!isNav && !SHELL.includes(url.pathname)) return;  // solo navigazioni di pagina e icone
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) { const c = res.clone(); caches.open(CACHE).then((k) => k.put(req, c)); }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
