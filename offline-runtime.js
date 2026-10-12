/* سامانه جامع خادمین — لایهٔ آفلاین امن و فقط‌خواندنی
 * فقط پاسخ‌های موفق GET از REST ذخیره می‌شوند؛ هیچ عملیات نوشتن صف‌بندی یا جعل موفقیت نمی‌شود.
 * این فایل برای APK قبل از اسکریپت‌های اصلی تزریق می‌شود. ورود اولیه به اینترنت نیاز دارد.
 */
(function () {
  "use strict";

  var DB_NAME = "khadem-jame-offline-v1";
  var STORE = "responses";
  var MAX_BODY_CHARS = 2 * 1024 * 1024;
  var originalFetch = window.fetch.bind(window);
  var dbPromise;

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!("indexedDB" in window)) return reject(new Error("IndexedDB unavailable"));
      var request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = function () {
        if (!request.result.objectStoreNames.contains(STORE)) {
          request.result.createObjectStore(STORE, { keyPath: "key" });
        }
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error || new Error("IndexedDB open failed")); };
    });
    return dbPromise;
  }

  function sessionPartition(auth) {
    var match = /^Bearer\s+(.+)$/i.exec(auth || "");
    if (match) {
      var parts = match[1].split(".");
      if (parts.length === 3) {
        try {
          var payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          payload += "=".repeat((4 - payload.length % 4) % 4);
          var claims = JSON.parse(atob(payload));
          if (claims && typeof claims.sub === "string" && claims.sub) return "user:" + claims.sub;
        } catch (_) {}
      }
    }
    return auth || "anonymous";
  }

  function digest(value) {
    if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
      return Promise.reject(new Error("Web Crypto unavailable"));
    }
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) {
        return b.toString(16).padStart(2, "0");
      }).join("");
    });
  }

  function cacheKey(url, auth) {
    return digest(sessionPartition(auth)).then(function (partition) { return partition + "|" + url; });
  }

  function readCache(key) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var req = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { reject(req.error || new Error("Cache read failed")); };
      });
    });
  }

  function writeCache(record) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(record);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error || new Error("Cache write failed")); };
        tx.onabort = function () { reject(tx.error || new Error("Cache write aborted")); };
      });
    });
  }

  function requestMetadata(input, init) {
    var req;
    try { req = input instanceof Request ? new Request(input, init) : new Request(input, init); }
    catch (_) { return null; }
    if (req.method !== "GET") return null;
    var url = new URL(req.url);
    if (url.origin !== "https://fxxtyfurdzpzfvweoppo.supabase.co") return null;
    if (!url.pathname.startsWith("/rest/v1/")) return null;
    return { url: req.url, auth: req.headers.get("Authorization") || "" };
  }

  function responseFrom(record) {
    return new Response(record.body, {
      status: 200,
      headers: {
        "Content-Type": record.contentType || "application/json",
        "X-Khadem-Offline-Cache": "hit"
      }
    });
  }

  window.fetch = function (input, init) {
    var meta = requestMetadata(input, init);
    if (!meta) return originalFetch(input, init);

    return cacheKey(meta.url, meta.auth).then(function (key) {
      return originalFetch(input, init).then(function (response) {
        if (!response || !response.ok) return response;
        return response.clone().text().then(function (body) {
          if (body.length <= MAX_BODY_CHARS) {
            writeCache({
              key: key,
              body: body,
              contentType: response.headers.get("Content-Type") || "application/json",
              savedAt: Date.now()
            }).catch(function () {});
          }
          return response;
        });
      }).catch(function (networkError) {
        return readCache(key).then(function (record) {
          if (!record) throw networkError;
          window.dispatchEvent(new CustomEvent("khadem-offline-cache-hit", {
            detail: { url: meta.url, savedAt: record.savedAt }
          }));
          return responseFrom(record);
        });
      });
    }).catch(function () {
      // Storage or crypto unavailable: keep ordinary network behavior, never invent cached success.
      return originalFetch(input, init);
    });
  };

  function savedSessionExists() {
    try {
      if (localStorage.getItem("kj_access_token")) return true;
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (!key || !/-auth-token$/i.test(key)) continue;
        try {
          var value = JSON.parse(localStorage.getItem(key) || "null");
          if (value && (value.access_token || (value.currentSession && value.currentSession.access_token))) return true;
        } catch (_) {}
      }
    } catch (_) {}
    return false;
  }

  function banner() {
    if (!document.body) return;
    var id = "kj-offline-status";
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.setAttribute("role", "status");
      el.style.cssText = "position:sticky;top:0;z-index:100000;padding:8px 12px;text-align:center;font:14px/1.7 sans-serif;display:none";
      document.body.insertBefore(el, document.body.firstChild);
    }
    if (navigator.onLine) {
      el.style.display = "none";
      el.textContent = "";
      return;
    }
    el.style.display = "block";
    el.style.background = "#fff1d6";
    el.style.color = "#7a3e00";
    el.textContent = savedSessionExists()
      ? "حالت آفلاین: فقط آخرین اطلاعاتی که قبلاً با همین حساب دریافت شده‌اند ممکن است نمایش داده شوند؛ ورود مجدد و ثبت تغییرات به اینترنت نیاز دارد."
      : "حالت آفلاین: برای ورود امن ابتدا با اینترنت وارد سامانه شوید و بخش‌های لازم را باز کنید. ورود اولیه و دریافت اطلاعات جدید بدون اینترنت ممکن نیست.";
  }

  function init() {
    banner();
    window.addEventListener("online", banner);
    window.addEventListener("offline", banner);
    window.addEventListener("khadem-offline-cache-hit", banner);
    var observer = new MutationObserver(function () {
      if (!document.getElementById("kj-offline-status")) banner();
    });
    if (document.documentElement) observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();