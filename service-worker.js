// service-worker.js
const CACHE_VERSION = 'v3-2025-10-06'; // <-- увеличивай при правках
const STATIC_CACHE = `learn-german-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `learn-german-runtime-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/', '/index.html',
  '/styles/tokens.css', '/styles/main.css', '/styles/pages.css',
  '/scripts/db.js', '/scripts/main.js',
  '/pages/levels.html', '/pages/daily-lesson.html', '/pages/library.html',
  '/pages/exercises.html', '/pages/progress.html', '/pages/about.html',
  '/pages/privacy.html', '/pages/contact.html',
  '/scripts/levels.js', '/scripts/lesson.js', '/scripts/library.js',
  '/scripts/exercises.js', '/scripts/progress.js'
  // Не кладём сюда контент JSON — их обновляем сетью
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache =>
      cache.addAll(STATIC_ASSETS.map(u => new Request(u, { cache: 'reload' })))
    )
  );
  // сразу активироваться
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        if (![STATIC_CACHE, RUNTIME_CACHE].includes(k)) return caches.delete(k);
      }))
    )
  );
  // сразу взять контроль над клиентами
  self.clients.claim();
});

// Хелпер: проверка на контент JSON (манифест/уроки)
const isContentJSON = (url) => {
  try {
    const u = new URL(url);
    return u.pathname.startsWith('/content/') && u.pathname.endsWith('.json');
  } catch { return false; }
};

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) Для JSON контента — Network First (чтобы видеть новые уроки сразу)
  if (isContentJSON(req.url)) {
    event.respondWith((async () => {
      try {
        const net = await fetch(req, { cache: 'no-store' });
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(req, net.clone());
        return net;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        // Последний шанс: 404, если и в кэше нет
        return new Response('Not found', { status: 404 });
      }
    })());
    return;
  }

  // 2) Для статических файлов — Stale-While-Revalidate
  if (req.method === 'GET' && (url.origin === location.origin)) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      const fetchPromise = (async () => {
        try {
          const net = await fetch(req);
          const cache = await caches.open(STATIC_CACHE);
          cache.put(req, net.clone());
          return net;
        } catch { /* offline */ }
      })();
      return cached || fetchPromise || fetch(req);
    })());
    return;
  }

  // 3) Всё остальное — напрямую в сеть
  // (или добавь нужную стратегию под API)
});
