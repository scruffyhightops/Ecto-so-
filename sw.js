const CACHE_NAME = 'ecto-os-v0-4-2';
const APP_SHELL = [
  './','./index.html','./manifest.json',
  './icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png',
  './sounds/button.mp3','./sounds/pke-scan.mp3','./sounds/warning.mp3','./sounds/containment-alert.mp3',
  './sounds/pack-connect.mp3','./sounds/pack-disconnect.mp3','./sounds/trap-deploy.mp3','./sounds/radio-chirp.mp3',
  './sounds/ecto-scan.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isHtml = event.request.mode === 'navigate' ||
                 url.pathname.endsWith('/index.html') ||
                 url.pathname.endsWith('/');
  const isAudio = url.pathname.toLowerCase().endsWith('.mp3');

  if (isHtml) {
    // Always prefer the live shell online; fall back to the new cache offline.
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  if (isAudio) {
    // Audio is explicitly refreshed from the network first, then cached for offline use.
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match('./index.html')))
  );
});
