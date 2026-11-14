// Milo Service Worker for PWA installability & offline shell caching
const CACHE_NAME = 'milo-v1.4.0';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/legal',
  '/legal.html',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/og-image.png',
  '/css/style.css',
  '/js/config.js',
  '/js/avatar.js',
  '/js/auth.js',
  '/js/chat.js',
  '/js/pwa.js',
  '/js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.log('SW cache err:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Only handle GET requests for same origin or CDN
  if (event.request.method !== 'GET') return;
  
  // Never cache Supabase API calls or analytics
  const url = new URL(event.request.url);
  if (url.hostname.includes('supabase.co') || url.hostname.includes('google') || url.hostname.includes('challenges.cloudflare.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
