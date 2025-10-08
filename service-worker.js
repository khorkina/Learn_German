const CACHE_VERSION = 'v6-2025-10-07'; // ⚠️ меняй при каждом релизе
const STATIC_CACHE = `learn-german-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `learn-german-runtime-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  './', './index.html',
  './styles/tokens.css', './styles/main.css', './styles/pages.css',
  './scripts/db.js', './scripts/main.js',
  './pages/levels.html', './pages/daily-lesson.html', './pages/library.html',
  './pages/exercises.html', './pages/progress.html',
  './pages/about.html', './pages/privacy.html', './pages/contact.html',
  './scripts/levels.js', './scripts/lesson.js', './scripts/library.js',
  './scripts/exercises.js', './scripts/progress.js'
];

// ✅ автообновление воркера
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache =>
      cache.addAll(STATIC_ASSETS.map(u => new Request(u, { cache: 'reload' })))
    )
  );
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
  self.clients.claim();
});

// 🔎 Helper: нормализуем список статических URL под текущий scope (важно для GitHub Pages)
const staticURLs = new Set(
  STATIC_ASSETS.map(u => new URL(u, self.registration.scope).href)
);

// 📄 Контент JSON (манифест/уроки) — network first
const isContentJSON = (url) => {
  try {
    const u = new URL(url);
    // было startsWith('/content/'): ломается на GitHub Pages.
    return u.pathname.includes('/content/') && u.pathname.endsWith('.json');
  } catch { return false; }
};

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Только GET к своему origin обрабатываем кэшем
  if (req.method !== 'GET' || url.origin !== location.origin) return;

  // 🔸 0) Если это медиапоток c Range — всегда напрямую в сеть (никакого кэша!)
  if (req.headers.has('range')) {
    event.respondWith(fetch(req)); // пусть сервер отдаёт 206 Partial Content
    return;
  }

  // 🔎 помощники
  const isMediaFile = (u) => {
    try {
      const p = new URL(u).pathname.toLowerCase();
      return p.endsWith('.mp3') || p.endsWith('.ogg') || p.endsWith('.wav');
    } catch { return false; }
  };

  // 1) JSON-контент — Network First (как было)
  if (isContentJSON(req.url)) {
    event.respondWith((async () => {
      try {
        const net = await fetch(req, { cache: 'no-store' });
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(req, net.clone());
        return net;
      } catch {
        const cached = await caches.match(req);
        return cached || new Response('Not found', { status: 404 });
      }
    })());
    return;
  }

  // 🔸 1.5) Аудио/медиа — Network First, БЕЗ кэширования (или только полные 200)
  if (isMediaFile(req.url)) {
    event.respondWith((async () => {
      try {
        const net = await fetch(req, { cache: 'no-store' });
        // Не кэшируем потоковые ответы/Range; оставим как есть
        // (Если очень нужно кэшировать, то только когда net.status === 200)
        return net;
      } catch {
        // В офлайне — попробуем кеш, если вдруг там есть полный файл
        const cached = await caches.match(req);
        return cached || new Response('', { status: 503, statusText: 'Offline' });
      }
    })());
    return;
  }

  // 2) Статические ассеты из списка — SWR в STATIC_CACHE (как было)
  if (staticURLs.has(req.url)) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      const updatePromise = (async () => {
        try {
          const net = await fetch(req);
          if (net && net.ok) {
            const cache = await caches.open(STATIC_CACHE);
            await cache.put(req, net.clone());
          }
        } catch { /* офлайн — ничего */ }
      })();
      return cached || updatePromise.then(() => caches.match(req)) || fetch(req);
    })());
    return;
  }

  // 3) Остальные локальные GET — SWR в RUNTIME_CACHE (как было)
  event.respondWith((async () => {
    const cached = await caches.match(req);
    const updatePromise = (async () => {
      try {
        const net = await fetch(req);
        if (net && net.ok) {
          const cache = await caches.open(RUNTIME_CACHE);
          await cache.put(req, net.clone());
        }
      } catch { /* офлайн */ }
    })();
    return cached || updatePromise.then(() => caches.match(req)) || fetch(req);
  })());
});
