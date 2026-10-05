// PDFXpert Offline Progressive Web App Service Worker
const CACHE_NAME = 'pdfxpert-core-v1';
const OFFLINE_FALLBACK = '/index.html';

const ASSETS_TO_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  '/ai-catalog.json',
  '/llms.txt'
];

// Install Event - Precache core app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_PRECACHE);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate Event - Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event - Stale-While-Revalidate & Cache-First for Offline Support
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignore non-GET requests or browser extension requests
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Handle CDN / Fonts / Scripts caching
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache (Stale-While-Revalidate)
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
          }
        }).catch(() => {/* Offline */});

        return cachedResponse;
      }

      // If not in cache, fetch from network and store in cache
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_FALLBACK);
        }
      });
    })
  );
});
