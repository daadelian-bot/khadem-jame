/* سامانه جامع مدیریت خادمین — ذخیره‌سازی محلی آفلاین
 * IndexedDB برای کش داده‌های قبلاً دریافت‌شده، تصاویر و صف عملیات.
 * این ماژول به‌تنهایی مجوز دسترسی ایجاد نمی‌کند؛ کنترل دسترسی برنامه/سرور همچنان لازم است.
 */
(function () {
  "use strict";
  const DB_NAME = "khadem-jame-offline";
  const DB_VERSION = 1;
  const STORE_SNAPSHOTS = "snapshots";
  const STORE_PHOTOS = "photos";
  const STORE_OUTBOX = "outbox";
  const STORE_META = "meta";
  let dbPromise = null;

  function currentUserId() {
    try {
      const raw = localStorage.getItem("kj_user") || localStorage.getItem("khadem_session");
      const parsed = raw ? JSON.parse(raw) : null;
      const user = parsed && parsed.user ? parsed.user : parsed;
      return user && (user.id || user.email) ? String(user.id || user.email).toLowerCase() : "";
    } catch (_) { return ""; }
  }
  function scopedKey(key, userId) {
    const uid = userId || currentUserId();
    if (!uid) throw new Error("برای ذخیره آفلاین، حساب کاربری معتبر لازم است.");
    return uid + "::" + String(key);
  }
  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) { reject(new Error("ذخیره‌سازی آفلاین در این مرورگر پشتیبانی نمی‌شود.")); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_SNAPSHOTS)) db.createObjectStore(STORE_SNAPSHOTS, { keyPath: "key" });
        if (!db.objectStoreNames.contains(STORE_PHOTOS)) db.createObjectStore(STORE_PHOTOS, { keyPath: "key" });
        if (!db.objectStoreNames.contains(STORE_OUTBOX)) db.createObjectStore(STORE_OUTBOX, { keyPath: "id", autoIncrement: true });
        if (!db.objectStoreNames.contains(STORE_META)) db.createObjectStore(STORE_META, { keyPath: "key" });
      };
      req.onsuccess = () => {
        const db = req.result;
        db.onversionchange = () => { db.close(); dbPromise = null; };
        resolve(db);
      };
      req.onerror = () => reject(req.error || new Error("باز کردن پایگاه داده محلی ناموفق بود."));
      req.onblocked = () => reject(new Error("پایگاه داده محلی توسط یک زبانه دیگر قفل شده است."));
    }).catch(err => { dbPromise = null; throw err; });
    return dbPromise;
  }
  async function transact(storeName, mode, callback) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      let result;
      try { result = callback(store); } catch (err) { reject(err); return; }
      tx.oncomplete = () => resolve(result && result.result !== undefined ? result.result : result);
      tx.onerror = () => reject(tx.error || new Error("عملیات پایگاه داده محلی ناموفق بود."));
      tx.onabort = () => reject(tx.error || new Error("عملیات پایگاه داده محلی لغو شد."));
    });
  }
  async function get(storeName, key) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const req = db.transaction(storeName, "readonly").objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error || new Error("خواندن اطلاعات محلی ناموفق بود."));
    });
  }
  async function saveSnapshot(table, rows) {
    const key = scopedKey("table:" + table);
    const record = { key, userId: currentUserId(), table: String(table), rows: Array.isArray(rows) ? rows : [], savedAt: Date.now() };
    await transact(STORE_SNAPSHOTS, "readwrite", store => store.put(record));
    notify();
    return record.savedAt;
  }
  async function getSnapshot(table) {
    const record = await get(STORE_SNAPSHOTS, scopedKey("table:" + table));
    return record && Array.isArray(record.rows) ? record : null;
  }
  async function savePhoto(path, blob) {
    if (!(blob instanceof Blob) || !blob.size) return false;
    const key = scopedKey("photo:" + path);
    await transact(STORE_PHOTOS, "readwrite", store => store.put({ key, userId: currentUserId(), path: String(path), blob, savedAt: Date.now() }));
    return true;
  }
  async function getPhoto(path) {
    const record = await get(STORE_PHOTOS, scopedKey("photo:" + path));
    return record && record.blob instanceof Blob ? record.blob : null;
  }
  async function saveMeta(name, value) {
    const key = scopedKey("meta:" + name);
    await transact(STORE_META, "readwrite", store => store.put({ key, userId: currentUserId(), value, savedAt: Date.now() }));
  }
  async function getMeta(name) {
    const record = await get(STORE_META, scopedKey("meta:" + name));
    return record ? record.value : null;
  }
  async function enqueue(operation) {
    const userId = currentUserId();
    if (!userId) throw new Error("برای صف آفلاین، حساب کاربری معتبر لازم است.");
    const record = { userId, operation, createdAt: Date.now(), attempts: 0, status: "pending" };
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE_OUTBOX, "readwrite").objectStore(STORE_OUTBOX).add(record);
      req.onsuccess = () => { notify(); resolve(req.result); };
      req.onerror = () => reject(req.error || new Error("ثبت عملیات در صف آفلاین ناموفق بود."));
    });
  }
  async function listOutbox() {
    const uid = currentUserId();
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE_OUTBOX, "readonly").objectStore(STORE_OUTBOX).getAll();
      req.onsuccess = () => resolve((req.result || []).filter(row => row.userId === uid).sort((a,b) => a.createdAt - b.createdAt));
      req.onerror = () => reject(req.error || new Error("خواندن صف آفلاین ناموفق بود."));
    });
  }
  async function updateOutbox(id, patch) {
    const row = await get(STORE_OUTBOX, id);
    if (!row || row.userId !== currentUserId()) return false;
    await transact(STORE_OUTBOX, "readwrite", store => store.put({ ...row, ...patch, id }));
    notify();
    return true;
  }
  async function removeOutbox(id) {
    const row = await get(STORE_OUTBOX, id);
    if (!row || row.userId !== currentUserId()) return false;
    await transact(STORE_OUTBOX, "readwrite", store => store.delete(id));
    notify();
    return true;
  }
  async function clearCurrentUserData() {
    const uid = currentUserId();
    if (!uid) return;
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_SNAPSHOTS, STORE_PHOTOS, STORE_OUTBOX, STORE_META], "readwrite");
      for (const name of [STORE_SNAPSHOTS, STORE_PHOTOS, STORE_OUTBOX, STORE_META]) {
        const req = tx.objectStore(name).openCursor();
        req.onsuccess = () => {
          const cursor = req.result;
          if (!cursor) return;
          if (cursor.value && cursor.value.userId === uid) cursor.delete();
          cursor.continue();
        };
      }
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error("پاک‌سازی داده‌های محلی ناموفق بود."));
    });
    notify();
  }
  async function applyOptimisticMutation(table, query, method, body) {
    const verb = String(method || "").toUpperCase();
    const existing = await getSnapshot(table);
    const rows = existing && Array.isArray(existing.rows) ? existing.rows.slice() : [];
    if (verb === "POST") {
      const incoming = Array.isArray(body) ? body : [body];
      if (!incoming.length || incoming.some(row => !row || !row.id)) throw new Error("ثبت آفلاین فقط برای رکوردهای دارای شناسه یکتای محلی پشتیبانی می‌شود.");
      const byId = new Map(rows.map((row, index) => [String(row.id), index]));
      for (const row of incoming) {
        const key = String(row.id);
        if (byId.has(key)) rows[byId.get(key)] = { ...rows[byId.get(key)], ...row };
        else { byId.set(key, rows.length); rows.push(row); }
      }
      await saveSnapshot(table, rows);
      return incoming;
    }
    if (verb === "PATCH" || verb === "DELETE") {
      const params = new URLSearchParams(String(query || "").replace(/^\?/, ""));
      const idFilter = params.get("id") || "";
      if (!idFilter.startsWith("eq.")) throw new Error("برای تغییر آفلاین، رکورد باید با شناسه یکتای مشخص هدف‌گیری شده باشد.");
      const id = idFilter.slice(3);
      const index = rows.findIndex(row => String(row.id) === String(id));
      if (index < 0) throw new Error("رکورد موردنظر در داده‌های ذخیره‌شده این دستگاه وجود ندارد؛ برای جلوگیری از تغییر اشتباه، اینترنت لازم است.");
      const previous = rows[index];
      if (verb === "PATCH") {
        if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("ساختار تغییر آفلاین معتبر نیست.");
        rows[index] = { ...previous, ...body };
        await saveSnapshot(table, rows);
        return [rows[index]];
      }
      rows.splice(index, 1);
      await saveSnapshot(table, rows);
      return [previous];
    }
    throw new Error("این نوع عملیات در حالت آفلاین پشتیبانی نمی‌شود.");
  }
  function notify() {
    try { window.dispatchEvent(new CustomEvent("kj-offline-store-change")); } catch (_) {}
  }
  async function persistStorage() {
    try { return navigator.storage && navigator.storage.persist ? await navigator.storage.persist() : false; }
    catch (_) { return false; }
  }
  window.KJOfflineStore = {
    saveSnapshot, getSnapshot, savePhoto, getPhoto, saveMeta, getMeta,
    enqueue, listOutbox, updateOutbox, removeOutbox, applyOptimisticMutation, clearCurrentUserData, persistStorage,
    currentUserId, isSupported: () => "indexedDB" in window
  };
})();