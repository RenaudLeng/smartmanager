const CACHE_NAME = 'smartmanager-v2';
const urlsToCache = [
  '/',
  '/dashboard',
  '/pos',
  '/stock',
  '/rapports',
  '/manifest.json',
  '/icon-72x72.png',
  '/icon-96x96.png',
  '/icon-128x128.png',
  '/icon-144x144.png',
  '/icon-152x152.png',
  '/icon-192x192.png',
  '/icon-384x384.png',
  '/icon-512x512.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('🎯 Service Worker: Installation en cours...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation terminée');
        return self.skipWaiting();
      })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activation terminée');
      return self.clients.claim();
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Gérer les requêtes d'icônes
  if (url.pathname.includes('icon-') && url.pathname.endsWith('.png')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            console.log('🎯 Service Worker: Icône servie depuis le cache:', url.pathname);
            return response;
          }
          
          // Si l'icône n'est pas dans le cache, essayer de la récupérer
          console.log('🔄 Service Worker: Récupération de l\'icône:', url.pathname);
          return fetch(event.request).then((response) => {
            if (response.ok) {
              // Mettre en cache l'icône pour les futures requêtes
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          }).catch(() => {
            // En cas d'erreur, servir une icône par défaut
            console.log('❌ Service Worker: Icône par défaut servie');
            return caches.match('/icon-128x128.png');
          });
        })
    );
  }
  
  // Gérer les autres requêtes
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        // Pour les requêtes réseau, mettre en cache les réponses
        return fetch(event.request).then((response) => {
          if (response.ok && event.request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
  );
});

// Gestion des messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🎯 Service Worker SmartManager initialisé');
