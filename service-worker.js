
/* فایل شماره ۱۳۸ — پوستهٔ آفلاین سامانه خادمین
   داده‌های سامانه و درخواست‌های Supabase در Cache Storage ذخیره نمی‌شوند. */
"use strict";

const CACHE_NAME = "khadem-jame-shell-v138";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./app.js",
  "./styles.css",
  "./logo.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(
            key =>
              key.startsWith("khadem-jame-shell-") &&
              key !== CACHE_NAME
          )
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // فقط درخواست‌های مربوط به همین سایت
  if (url.origin !== self.location.origin) return;

  // اطلاعات و درخواست‌های Supabase را ذخیره نکن
  if (
    /\/(rest|auth|storage)\/v1\//.test(url.pathname) ||
    url.pathname.includes("/functions/v1/")
  ) {
    return;
  }

  // بازکردن صفحه: ابتدا شبکه، سپس نسخهٔ ذخیره‌شده
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME).then(cache =>
              cache.put("./index.html", copy)
            );
          }

          return response;
        })
        .catch(() => caches.match("./index.html"))
    );

    return;
  }

  // سایر فایل‌ها: ابتدا حافظهٔ موقت، سپس شبکه
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (
          response &&
          response.ok &&
          response.type === "basic"
        ) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache =>
            cache.put(request, copy)
          );
        }

        return response;
      });
    })
  );
});
