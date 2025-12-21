// Service Worker for PWA
const CACHE_NAME = 'tmovie-v1';
const STATIC_CACHE = 'tmovie-static-v1';
const DYNAMIC_CACHE = 'tmovie-dynamic-v1';

// Files to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // API requests - network first, then cache
    if (url.pathname.includes('/api/') || url.hostname.includes('phimapi.com')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clonedResponse = response.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(request, clonedResponse);
                    });
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Static assets - cache first, then network
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then((response) => {
                // Don't cache non-successful responses
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                const clonedResponse = response.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => {
                    cache.put(request, clonedResponse);
                });

                return response;
            });
        })
    );
});

// Handle push notifications
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'TMovie';
    const options = {
        body: data.body || 'Có phim mới cập nhật!',
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/',
        },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});
