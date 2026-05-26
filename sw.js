const CACHE_NAME = 'samyak-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './luka.png',
  './raaz_profile.png',
  'https://fonts.googleapis.com/css2?family=Martel:wght@400;700;900&family=Mukta:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Noto+Serif+Devanagari:wght@400;600;700;900&family=Poppins:wght@300;400;500;600;700&family=Rozha+One&family=Yatra+One&family=Outfit:wght@300;400;500;600;700;800;900&display=swap'
];

// Install Event - cache assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching vital assets');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event - clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - network first falling back to cache
self.addEventListener('fetch', (e) => {
  // Exclude non-GET requests and external URLs
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Clone response and cache it dynamically
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(() => {
        // Fallback to cache on network failure
        return caches.match(e.request);
      })
  );
});
