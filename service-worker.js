/* سامانه جامع خادمین — پوستهٔ آفلاین نسخهٔ ۱۶۲ */
const CACHE_NAME = 'khadem-jame-shell-v162';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './logo.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('khadem-jame-shell-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache Supabase authentication, database, storage, or Edge Function responses.
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/auth/v1/') || url.pathname.includes('/storage/v1/') || url.pathname.includes('/functions/v1/')) return;

  // Network-first navigation guarantees users receive the deployed HTML whenever online.
  if (request.mode === 'navigate') {
    const scopePath = new URL(self.registration.scope).pathname;
    const isAppEntry = (url.pathname === scopePath || url.pathname === scopePath + 'index.html') && !url.search;
    event.respondWith(
      fetch(request, { cache: 'no-store' }).then(response => {
        // Cache only the main app entry. Never store recovery/invitation URLs or other pages as index.html.
        if (isAppEntry && response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
        }
        return response;
      }).catch(() => {
        if (isAppEntry) return caches.match('./index.html');
        return Response.error();
      })
    );
    return;
  }
  const isAppShell = APP_SHELL.some(path => new URL(path, self.location.href).pathname === url.pathname);
  if (!isAppShell) return;
  event.respondWith(
    fetch(request, { cache: 'no-store' }).then(response => {
      if (response && response.ok && response.type === 'basic') {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    }).catch(() => caches.match(request).then(cached => cached || Response.error()))
  );
});
