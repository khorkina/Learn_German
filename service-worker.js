const CACHE_NAME = 'learn-german-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/tokens.css',
  '/styles/main.css',
  '/styles/pages.css',
  '/scripts/db.js',
  '/scripts/main.js',
  '/pages/levels.html',
  '/pages/daily-lesson.html',
  '/pages/library.html',
  '/pages/exercises.html',
  '/pages/progress.html',
  '/pages/about.html',
  '/pages/privacy.html',
  '/pages/contact.html',
  '/scripts/levels.js',
  '/scripts/lesson.js',
  '/scripts/library.js',
  '/scripts/exercises.js',
  '/scripts/progress.js',
  '/content/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})));
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
