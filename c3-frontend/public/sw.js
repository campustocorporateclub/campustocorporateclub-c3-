// Campus to Corporate Club (C3) - Service Worker (Lightweight PWA & Web Push)
const CACHE_VERSION = 'c3-portal-v3';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/icons/icon-192.png?v=2',
  '/icons/icon-512.png?v=2',
  '/icons/icon-maskable-512.png?v=2',
  '/icons/apple-touch-icon.png?v=2',
  '/favicon.ico?v=2',
];

// Install: Pre-cache offline fallback and core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

// Explicit skipWaiting on user message (avoids breaking active client with mismatched chunks)
self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'SKIP_WAITING' || event.data === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

// Activate: Delete outdated caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_VERSION) {
            return caches.delete(cacheName);
          }
          return null;
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Helper: fetch with timeout so slow/dead connections don't hang for 10-30s
function fetchWithTimeout(request, timeoutMs = 2500) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Network timeout'));
    }, timeoutMs);

    fetch(request)
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Fetch: Route requests by type
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle HTTP/HTTPS GET requests
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 1. NEVER cache backend API calls, cross-origin backend servers, or Render
  if (
    url.pathname.startsWith('/api') ||
    url.hostname.includes('onrender.com') ||
    url.port === '5000'
  ) {
    return;
  }

  // 2. Navigation requests (HTML pages): Network-first with fast 2.5s timeout and offline.html fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetchWithTimeout(req, 2500).catch(async () => {
        const cache = await caches.open(CACHE_VERSION);
        const cachedOffline = await cache.match(OFFLINE_URL);
        return (
          cachedOffline ||
          new Response(
            '<!doctype html><html><body><h1>You are offline</h1><p>Please turn on the internet and reload.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          )
        );
      })
    );
    return;
  }

  // 3. Static assets: Cache-First or Stale-While-Revalidate without heavy background loops
  const isStatic =
    (url.origin === self.location.origin &&
      (url.pathname.startsWith('/assets/') ||
        url.pathname.startsWith('/icons/') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.jpeg') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.woff2') ||
        url.pathname.endsWith('.woff') ||
        url.pathname.endsWith('.ttf') ||
        url.pathname === '/manifest.webmanifest' ||
        url.pathname === '/favicon.ico' ||
        url.pathname === OFFLINE_URL)) ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('fontshare.com');

  if (isStatic) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(req)
          .then((networkResponse) => {
            if (
              networkResponse &&
              (networkResponse.status === 200 || networkResponse.type === 'opaque')
            ) {
              const resClone = networkResponse.clone();
              caches.open(CACHE_VERSION).then((cache) => {
                cache.put(req, resClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);
      })
    );
  }
});

/* ==========================================================================
   Web Push Notification Event Handlers
   ========================================================================== */

self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'Campus to Corporate Club',
    body: 'New update from C3 Club!',
    icon: '/icons/icon-192.png?v=2',
    badge: '/icons/icon-192.png?v=2',
    data: { url: '/dashboard' },
  };

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch {
      notificationData.body = event.data.text();
    }
  }

  const title = notificationData.title || 'Campus to Corporate Club';
  const options = {
    body: notificationData.body,
    icon: notificationData.icon || '/icons/icon-192.png?v=2',
    badge: notificationData.badge || '/icons/icon-192.png?v=2',
    vibrate: [200, 100, 200, 100, 200],
    tag: notificationData.tag || 'c3-notification',
    renotify: true,
    data: notificationData.data || { url: '/dashboard' },
    actions: [{ action: 'view', title: 'Open C3 Portal' }],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) {
            return client.navigate(targetUrl);
          }
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
