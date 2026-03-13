// ============================================================
// SERVICE WORKER - Roses Bienestar
// Versión: 1.0.0
// Cambia CACHE_VERSION cada vez que actualices archivos
// ============================================================

const CACHE_VERSION = 'roses-v1';
const CACHE_NAME = `roses-bienestar-${CACHE_VERSION}`;

// ── Todos los archivos que se cachean al instalar ────────────
const ASSETS_TO_CACHE = [
  // Páginas principales
  '/roses.github.io/',
  '/roses.github.io/index.html',
  '/roses.github.io/catalog.html',
  '/roses.github.io/cart.html',
  '/roses.github.io/contact.html',

  // Panel CRM / Admin
  '/roses.github.io/crm/admin.html',

  // CSS
  '/roses.github.io/assets/css/main.css',
  '/roses.github.io/assets/css/catalog.css',
  '/roses.github.io/assets/css/cart.css',
  '/roses.github.io/assets/css/checkout.css',
  '/roses.github.io/assets/css/contact.css',
  '/roses.github.io/assets/css/globals.css',
  '/roses.github.io/assets/css/index.css',
  '/roses.github.io/crm/css/admin.css',
  '/roses.github.io/crm/css/page.css',

  // JS
  '/roses.github.io/assets/js/animations.js',
  '/roses.github.io/assets/js/cart.js',
  '/roses.github.io/assets/js/contact.js',
  '/roses.github.io/assets/js/nav.js',
  '/roses.github.io/assets/js/products.js',
  '/roses.github.io/assets/js/toast.js',
  '/roses.github.io/crm/js/admin.js',
  '/roses.github.io/crm/js/page.js',

  // Imágenes / íconos (agrega aquí las tuyas)
  // '/roses.github.io/assets/img/logo.png',
  // '/roses.github.io/assets/img/hero.jpg',
];

// ── INSTALL: precachea todos los assets ─────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando…');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando archivos…');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Algunos archivos no se cachearon:', err);
      });
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: elimina cachés viejas ─────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando…');
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Eliminando caché antigua:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ── FETCH: estrategia Cache-First con fallback a red ────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type === 'opaque'
          ) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('/roses.github.io/index.html');
          }
        });
    })
  );
});
