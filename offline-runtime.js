/* سامانه جامع خادمین — لایهٔ آفلاین امن و فقط‌خواندنی
 * این فایل هنگام ساخت APK پیش از اسکریپت‌های اصلی تزریق می‌شود.
 * ورود اولیه و هر عملیات نوشتن همچنان به اینترنت و Supabase نیاز دارد.
 * فقط پاسخ‌های موفق GET از REST ذخیره می‌شوند و کلید کش به نشست فعلی وابسته است.
 */
(function () {
  "use strict";

  var DB_NAME = "khadem-jame-offline-v1";
  var STORE = "responses";
  var MAX_BODY = 2 * 1024 * 1024;
  var originalFetch = window.fetch.bind(window);
  var dbPromise;
  var offlineCacheUsed = false;

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!("indexedDB" in window)) return reject(new Error("IndexedDB unavailable"));
      var request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = function () {
        var db = request.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "key" });
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error || new Error("IndexedDB open failed")); };
    });
    return dbPromise;
  }

  function digest(value) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)).then(function (buf) {
        return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
      });
    }
    // The raw token is never stored by this runtime. Without Web Crypto, skip session-specific caching.
    return Promise.reject(new Error("Web Crypto unavailable"));
  }

  function cacheKey(url, auth) {
    return digest(auth || "anonymous").then(function (sessionHash) { return sessionHash + "|" + url; });
  }

  function readCache(key) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readonly");
        var req = tx.objectStore(STORE).get(key);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function writeCache(record) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(record);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
        tx.onabort = function () { reject(tx.error || new Error("Cache write aborted")); };
      });
    });
  }

  function shouldCache(input, init) {
    var req;
    try { req = input instanceof Request ? input : new Request(input, init); } catch (_) { return null; }
    if (req.method !== "GET") return null;
    var url = new URL(req.url);
    if (url.origin !== "https://fxxtyfurdzpzfvweoppo.supabase.co") return null;
    if (!url.pathname.startsWith("/rest/v1/")) return null;
    var auth = req.headers.get("Authorization") || (init && init.headers && init.headers.Authorization) || "";
    return { request: req, url: req.url, auth: auth };
  }

  function responseFrom(record) {
    return new Response(record.body, {
      status: 200,
      headers: { "Content-Type": record.contentType || "application/json", "X-Khadem-Offline-Cache": "hit" }
    });
  }

  window.fetch = function (input, init) {
    var meta = shouldCache(input, init);
    if (!meta) return originalFetch(input, init);

    return cacheKey(meta.url, meta.auth).then(function (key) {
      return originalFetch(input, init).then(function (response) {
        if (!response || !response.ok) return response;
        return response.clone().text().then(function (body) {
          if (body.length <= MAX_BODY) {
            writeCache({
              key: key,
              url: meta.url,
              body: body,
              contentType: response.headers.get("Content-Type") || "application/json",
              savedAt: Date.now()
            }).catch(function () {});
          }
          return response;
        });
      }).catch(function (networkError) {
        return readCache(key).then(function (record) {
          if (record) {
            offlineCacheUsed = true;
            window.dispatchEvent(new CustomEvent("khadem-offline-cache-hit", { detail: { url: meta.url, savedAt: record.savedAt } }));
            return responseFrom(record);
          }
          throw networkError;
        });
      });
    }).catch(function () {
      // If hashing or local storage is unavailable, preserve normal network semantics.
      return originalFetch(input, init);
    });
  };

  function banner() {
    var id = "kj-offline-status";
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.setAttribute("role", "status");
      el.style.cssText = "position:sticky;top:0;z-index:100000;padding:8px 12px;text-align:center;font:14px/1.7 sans-serif;display:none";
      if (document.body) document.body.insertBefore(el, document.body.firstChild);
    }
    if (!el || !document.body) return;
    if (navigator.onLine && !offlineCacheUsed) {
      el.style.display = "none";
      el.textContent = "";
    } else {
      el.style.display = "block";
      el.style.background = "#fff1d6";
      el.style.color = "#7a3e00";
      el.textContent = localStorage.getItem("kj_access_token")
        ? "حالت آفلاین: فقط داده‌های دریافت‌شده در اتصال قبلی قابل مشاهده‌اند؛ ورود مجدد و ثبت تغییرات به اینترنت نیاز دارد."
        : "حالت آفلاین: برای ورود امن، ابتدا یک‌بار با اینترنت وارد سامانه شوید. اطلاعات محرمانه بدون ورود ذخیره یا نمایش داده نمی‌شود.";
    }
  }

  function init() {
    banner();
    window.addEventListener("online", function () { offlineCacheUsed = false; banner(); });
    window.addEventListener("offline", banner);
    window.addEventListener("khadem-offline-cache-hit", banner);
    // DOM updates from the app can replace the body contents; reinsert the status banner if needed.
    var observer = new MutationObserver(function () {
      if (!document.getElementById("kj-offline-status")) banner();
    });
    if (document.documentElement) observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();