// --- DEV GUARD: désactive le SW en développement sur localhost:8080 pour éviter les soucis de HMR/WebSocket ---
const DEV_DISABLE = (() => {
  try {
    const { hostname, port } = self.location;
    return (hostname === 'localhost' || hostname === '127.0.0.1') && port === '8080';
  } catch (_) {
    return false;
  }
})();

if (DEV_DISABLE) {
  // Forcer une désinscription propre et recharger les clients
  self.addEventListener('install', (event) => {
    self.skipWaiting();
  });
  self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      try { await self.registration.unregister(); } catch (_) {}
      try {
        const clientsArr = await self.clients.matchAll({ type: 'window' });
        clientsArr.forEach((client) => client.navigate(client.url));
      } catch (_) {}
    })());
  });
  // Ne pas intercepter fetch en dev pour laisser passer le HMR
} else {

const CACHE_NAME = 'mindful-journey-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/placeholder.svg',
  // Cache les fichiers statiques générés par Vite
  '/assets/',
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache.filter(url => url !== '/assets/'));
      })
      .catch(err => console.log('Cache failed', err))
  );
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie de cache : Network First avec fallback vers le cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la réponse est valide, la mettre en cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // En cas d'échec réseau, essayer de récupérer depuis le cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Page de fallback pour les routes non mises en cache
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Gestion des notifications push (pour extension future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/placeholder.svg',
      badge: '/placeholder.svg',
      vibrate: [200, 100, 200],
      data: data
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

} // fin else DEV_DISABLE
