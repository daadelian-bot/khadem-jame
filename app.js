/* =========================================================
   فایل شماره ۱۳۱ — سامانه جامع مدیریت خادمین
   بازسازی کامل رابط برنامه (Front-end)
   Responsive / cross-platform UI; PWA installation also requires index.html manifest and service worker.
   Backend: Supabase REST API
   نکته: این نسخه داده یا ساختار پایگاه داده را تغییر نمی‌دهد.
   ========================================================= */
(function () {
  "use strict";

  const SUPABASE_URL = "https://fxxtyfurdzpzfvweoppo.supabase.co";
  const SUPABASE_KEY = "sb_publishable_HA3Z2cmNMddMTmpFoLmerA_k-YtEId7";
  const TOKEN_KEY = "kj_access_token";
  const USER_KEY = "kj_user";
  const TIMEOUT_MS = 20000;

  const state = {
    tab: "dashboard",
    khadems: [],
    services: [],
    meetings: [],
    deployments: [],
    finance: [],
    fund: [],
    donors: [],
    selectedKhadem: null,
    search: "",
    loading: false,
    errors: {},
    loaded: false
  };

  const menu = [
    ["dashboard", "🏠 داشبورد"],
    ["khadems", "👤 بانک خادمین"],
    ["services", "🕌 خدمات"],
    ["friday", "🌙 پایش شب جمعه"],
    ["meetings", "📅 جلسات"],
    ["deployments", "🚐 مأموریت‌ها"],
    ["finance", "💰 امور مالی"],
    ["fund", "🏦 صندوق"],
    ["donors", "🤝 خیرین"],
    ["reports", "📊 گزارش‌ها"],
    ["settings", "⚙️ تنظیمات"]
  ];

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function fa(value) {
    return String(value ?? "").replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
  }
  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  function num(value) {
    if (typeof value === "number") return value;
    const s = String(value ?? "").replace(/[,\u066C\u066B\s]/g, "").replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }
  function money(value) {
    if (value === null || value === undefined || value === "") return "—";
    return fa(num(value).toLocaleString("en-US")) + " تومان";
  }
  function dateText(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return esc(value);
    try {
      return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        year: "numeric", month: "2-digit", day: "2-digit"
      }).format(d);
    } catch (_) {
      return fa(d.toLocaleDateString());
    }
  }
  function toast(message, type = "info") {
    let el = $("#kj-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "kj-toast";
      el.style.cssText = "position:fixed;z-index:99999;bottom:18px;left:16px;right:16px;max-width:520px;margin:auto;padding:13px 16px;border-radius:12px;color:white;text-align:center;box-shadow:0 8px 30px #0003;font-family:inherit;line-height:1.8";
      document.body.appendChild(el);
    }
    el.style.background = type === "error" ? "#b42318" : type === "success" ? "#18794e" : "#333";
    el.textContent = message;
    clearTimeout(window.__kjToastTimer);
    window.__kjToastTimer = setTimeout(() => el.remove(), 5000);
  }
  function token() {
    return localStorage.getItem(TOKEN_KEY) || "";
  }
  function headers(extra = {}) {
    const h = { apikey: SUPABASE_KEY, Accept: "application/json", ...extra };
    const t = token();
    if (t && t !== "demo") h.Authorization = "Bearer " + t;
    return h;
  }
  async function request(path, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let response;
    try {
      response = await fetch(SUPABASE_URL + path, {
        method: options.method || "GET",
        headers: headers(options.body !== undefined ? { "Content-Type": "application/json", ...(options.headers || {}) } : (options.headers || {})),
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
        credentials: "omit",
        cache: "no-store"
      });
    } catch (e) {
      if (e && e.name === "AbortError") throw new Error("زمان اتصال به پایگاه داده تمام شد.");
      throw new Error("ارتباط با Supabase برقرار نشد. اینترنت و تنظیمات اتصال را بررسی کنید.");
    } finally {
      clearTimeout(timer);
    }
    const raw = await response.text();
    let data = null;
    try { data = raw ? JSON.parse(raw) : null; } catch (_) { data = raw; }
    if (!response.ok) {
      const message = data && (data.message || data.msg || data.error_description || data.error) || raw || ("HTTP " + response.status);
      throw new Error(String(message));
    }
    return data;
  }
  function apiTable(table, query = "select=*") {
    return request("/rest/v1/" + encodeURIComponent(table) + "?" + query);
  }
  async function loadTable(table) {
    try {
      const rows = await apiTable(table, "select=*&limit=1000");
      state.errors[table] = "";
      return Array.isArray(rows) ? rows : [];
    } catch (e) {
      state.errors[table] = e.message || "خطا در دریافت اطلاعات";
      console.warn("KJ: failed to load table", table, e);
      return [];
    }
  }
  async function loadData() {
    state.loading = true;
    state.errors = {};
    render();
    const tables = [
      ["khadems", "khadems"],
      ["services", "service_records"],
      ["meetings", "meetings"],
      ["deployments", "deployments"],
      ["finance", "finance_transactions"],
      ["fund", "fund_transactions"],
      ["donors", "donors"]
    ];
    await Promise.all(tables.map(async ([key, table]) => { state[key] = await loadTable(table); }));
    state.loading = false;
    state.loaded = true;
    render();
    const failed = Object.values(state.errors).filter(Boolean).length;
    if (failed) toast("دریافت بعضی اطلاعات ناموفق بود؛ خطا در همان بخش نمایش داده شده است.", "error");
  }

  async function login() {
    const email = ($("#kj-email")?.value || "").trim();
    const password = $("#kj-password")?.value || "";
    if (!email || !password) {
      toast("ایمیل و رمز عبور را وارد کنید.", "error");
      return;
    }
    const button = $("#kj-login-btn");
    if (button) { button.disabled = true; button.textContent = "در حال ورود…"; }
    try {
      const result = await request("/auth/v1/token?grant_type=password", {
        method: "POST", body: { email, password }
      });
      if (!result || !result.access_token) throw new Error("توکن ورود از سرور دریافت نشد.");
      localStorage.setItem(TOKEN_KEY, result.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user || { email }));
      toast("ورود موفق بود.", "success");
      await startApp();
    } catch (e) {
      toast("ورود ناموفق بود: " + (e.message || "خطای ناشناخته"), "error");
      if (button) { button.disabled = false; button.textContent = "ورود به سامانه"; }
    }
  }
  function signout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    state.selectedKhadem = null;
    loginPage();
  }
  function loginPage(message = "") {
    const app = ensureRoot();
    app.innerHTML = `
      <div class="kj-login-wrap" dir="rtl">
        <form class="kj-login-card" id="kj-login-form">
          <img src="logo.png" alt="لوگوی مجموعه" class="kj-logo" onerror="this.style.display='none'">
          <h1>سامانه جامع مدیریت خادمین</h1>
          <p class="kj-muted">مجموعه السیدة زینب سلام الله علیها</p>
          ${message ? `<div class="kj-alert">${esc(message)}</div>` : ""}
          <label for="kj-email">ایمیل</label>
          <input id="kj-email" type="email" autocomplete="username" inputmode="email" required placeholder="ایمیل حساب کاربری">
          <label for="kj-password">رمز عبور</label>
          <input id="kj-password" type="password" autocomplete="current-password" required placeholder="رمز عبور">
          <button id="kj-login-btn" class="kj-primary" type="submit">ورود به سامانه</button>
          <p class="kj-small">برای ورود، حساب کاربری معتبر Supabase لازم است.</p>
        </form>
      </div>`;
    $("#kj-login-form").addEventListener("submit", e => { e.preventDefault(); login(); });
  }
  function ensureRoot() {
    let app = $("#app");
    if (!app) {
      app = document.createElement("div");
      app.id = "app";
      document.body.appendChild(app);
    }
    return app;
  }
  function injectStyles() {
    if ($("#kj-style")) return;
    const style = document.createElement("style");
    style.id = "kj-style";
    style.textContent = `
      :root{color-scheme:light;--kj-maroon:#781f32;--kj-gold:#bd9855;--kj-bg:#f5f3f0;--kj-ink:#292522;--kj-muted:#77716b;--kj-border:#e8e1d9}
      *{box-sizing:border-box}body{margin:0;background:var(--kj-bg);color:var(--kj-ink);font-family:Tahoma,Arial,sans-serif;font-size:14px;line-height:1.8}
      button,input,select,textarea{font:inherit}button{cursor:pointer}.kj-login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:18px;background:var(--kj-bg)}
      .kj-login-card{width:100%;max-width:430px;background:#fff;border:1px solid var(--kj-border);border-radius:20px;padding:26px;box-shadow:0 10px 38px #34251b12}
      .kj-logo{width:86px;height:86px;object-fit:contain;display:block;margin:0 auto 12px}.kj-login-card h1{text-align:center;font-size:21px;margin:0}.kj-login-card>p{text-align:center}
      label{display:block;font-weight:bold;margin:12px 0 5px}.kj-login-card input,.kj-search,.kj-input{width:100%;border:1px solid #d8d0c8;border-radius:10px;padding:12px;background:white;outline-color:var(--kj-gold)}
      .kj-primary,.kj-button{border:0;border-radius:10px;padding:11px 15px;background:var(--kj-maroon);color:white;font-weight:bold}.kj-login-card .kj-primary{width:100%;margin-top:18px}
      .kj-small{font-size:12px;color:var(--kj-muted)}.kj-muted{color:var(--kj-muted)}.kj-alert,.kj-error{background:#fff0ee;border:1px solid #f1c7c1;color:#9c2418;padding:10px;border-radius:10px;margin:12px 0;overflow-wrap:anywhere}
      .kj-top{background:var(--kj-maroon);color:white;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.kj-brand{font-weight:bold;font-size:18px}.kj-top small{display:block;color:#f1dfe2;font-weight:normal}
      .kj-shell{max-width:1500px;margin:auto}.kj-nav{display:flex;gap:7px;overflow-x:auto;padding:10px;background:white;border-bottom:1px solid var(--kj-border);position:sticky;top:0;z-index:20}
      .kj-nav button{white-space:nowrap;border:1px solid var(--kj-border);border-radius:10px;padding:8px 12px;background:#fff;color:#554c47}.kj-nav button.active{background:#f4e8e9;color:var(--kj-maroon);border-color:#d6b4b9;font-weight:bold}
      .kj-main{padding:16px;min-height:65vh}.kj-page-title{margin:0 0 14px;font-size:21px}.kj-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:16px}
      .kj-card{background:white;border:1px solid var(--kj-border);border-radius:14px;padding:15px;min-width:0}.kj-stat{font-size:25px;font-weight:bold;color:var(--kj-maroon);margin-top:5px}.kj-toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:13px}.kj-toolbar .kj-search{flex:1;min-width:190px}
      .kj-table-wrap{overflow:auto;background:white;border:1px solid var(--kj-border);border-radius:12px}table{border-collapse:collapse;width:100%;min-width:650px}th,td{text-align:right;padding:11px;border-bottom:1px solid #eee7e0;vertical-align:top}th{background:#faf7f3;color:#5b443c;white-space:nowrap}tr:last-child td{border-bottom:0}
      .kj-link{border:0;background:transparent;color:var(--kj-maroon);font-weight:bold;padding:3px;text-align:right}.kj-pill{display:inline-block;background:#f4e8e9;color:var(--kj-maroon);border-radius:30px;padding:2px 9px;font-size:12px}
      .kj-empty{padding:22px;text-align:center;color:var(--kj-muted)}.kj-actions{display:flex;gap:8px;flex-wrap:wrap}.kj-secondary{border:1px solid var(--kj-border);background:#fff;color:#514741;border-radius:9px;padding:8px 12px}
      .kj-profile-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}.kj-field{padding:10px;border:1px solid #eee7e0;border-radius:10px;overflow-wrap:anywhere}.kj-field b{display:block;color:#796d65;font-size:12px;margin-bottom:3px}
      .kj-section-title{font-size:16px;margin:20px 0 10px}.kj-footer{text-align:center;color:#93877e;padding:18px;font-size:12px}
      /* چندسکویی: موبایل، تبلت، دسکتاپ و حالت نصب‌شده */
      html{min-height:100%;-webkit-text-size-adjust:100%;text-size-adjust:100%}
      body{min-height:100vh;min-height:100dvh;padding-bottom:env(safe-area-inset-bottom)}
      button,input,select,textarea{font-size:16px;touch-action:manipulation}
      button{min-height:42px}
      .kj-shell{width:100%;padding-bottom:env(safe-area-inset-bottom)}
      .kj-top{padding-top:max(12px,env(safe-area-inset-top))}
      .kj-nav{overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;scrollbar-width:thin}
      .kj-table-wrap{-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}
      .kj-card,.kj-login-card{overflow-wrap:anywhere}
      @media(min-width:1000px){.kj-main{padding:22px}.kj-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.kj-profile-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(min-width:1450px){.kj-main{padding:28px}.kj-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
      @media(max-width:800px){.kj-nav{position:sticky;top:0}.kj-main{padding:12px}.kj-profile-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:600px){.kj-top{padding:12px}.kj-brand{font-size:15px}.kj-main{padding:10px}.kj-page-title{font-size:18px}.kj-card{padding:12px}.kj-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.kj-stat{font-size:21px}.kj-nav{top:0}.kj-profile-grid{grid-template-columns:1fr}.kj-login-card{padding:20px}.kj-toolbar{align-items:stretch}.kj-toolbar .kj-search{min-width:100%}}
      @media(max-width:360px){.kj-grid{grid-template-columns:1fr}.kj-actions{width:100%}.kj-actions button{flex:1}}
      @media(hover:none){.kj-link{padding:8px;min-height:42px}}
    `;
    document.head.appendChild(style);
  }

  function shell() {
    const app = ensureRoot();
    const user = (() => { try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch (_) { return null; } })();
    app.innerHTML = `
      <div class="kj-shell" dir="rtl">
        <header class="kj-top">
          <div class="kj-brand">سامانه جامع مدیریت خادمین<small>مجموعه السیدة زینب سلام الله علیها</small></div>
          <div class="kj-actions"><span class="kj-small" style="color:#fff">${esc(user?.email || user?.user_metadata?.name || "کاربر سامانه")}</span><button class="kj-secondary" id="kj-refresh">به‌روزرسانی</button><button class="kj-secondary" id="kj-signout">خروج</button></div>
        </header>
        <nav class="kj-nav" aria-label="منوی اصلی">${menu.map(([id,title]) => `<button data-tab="${id}" class="${state.tab === id ? "active" : ""}">${title}</button>`).join("")}</nav>
        <main id="kj-main" class="kj-main"></main>
        <footer class="kj-footer">سامانه مدیریت خادمین · رابط فارسی</footer>
      </div>`;
    $$(".kj-nav button").forEach(b => b.addEventListener("click", () => {
      state.tab = b.dataset.tab; state.selectedKhadem = null; render();
    }));
    $("#kj-refresh").addEventListener("click", loadData);
    $("#kj-signout").addEventListener("click", signout);
  }

  function val(obj, keys) {
    for (const key of keys) if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== "") return obj[key];
    return "";
  }
  function nameOf(k) {
    return val(k, ["full_name", "name", "khadem_name", "first_name"]) ||
      [val(k, ["first_name"]), val(k, ["last_name", "family", "family_name"])].filter(Boolean).join(" ") ||
      "بدون نام";
  }
  function khademCode(k) { return val(k, ["khadem_code", "code", "personnel_code", "number", "id"]); }
  function khademId(k) { return val(k, ["id", "khadem_id"]); }
  function fieldLabel(key) {
    const labels = {
      id:"شناسه", khadem_code:"کد خادم", code:"کد", full_name:"نام و نام خانوادگی", name:"نام",
      first_name:"نام", last_name:"نام خانوادگی", family:"نام خانوادگی", father_name:"نام پدر",
      national_code:"کد ملی", phone:"تلفن همراه", mobile:"تلفن همراه", email:"ایمیل",
      birth_date:"تاریخ تولد", address:"نشانی", status:"وضعیت", active:"فعال",
      skills:"مهارت‌ها", education_level:"سطح تحصیلات", marital_status:"وضعیت تأهل",
      emergency_contact_name:"نام تماس اضطراری", emergency_contact_phone:"تلفن تماس اضطراری",
      emergency_contact_name_2:"نام تماس اضطراری دوم", emergency_contact_name_3:"نام تماس اضطراری سوم",
      emergency_contact_phone_2:"تلفن تماس اضطراری دوم", emergency_contact_phone_3:"تلفن تماس اضطراری سوم",
      created_at:"تاریخ ثبت", updated_at:"آخرین به‌روزرسانی", notes:"توضیحات",
      service_date:"تاریخ خدمت", date:"تاریخ", service_type:"نوع خدمت", category:"دسته‌بندی",
      amount:"مبلغ", paid_amount:"مبلغ پرداخت‌شده", balance:"مانده", debt:"بدهی",
      transaction_type:"نوع تراکنش", type:"نوع", description:"شرح", title:"عنوان",
      meeting_date:"تاریخ جلسه", meeting_title:"عنوان جلسه", deployment_date:"تاریخ مأموریت",
      role:"نقش", responsibility:"مسئولیت", education:"تحصیلات"
    };
    return labels[key] || key.replaceAll("_", " ");
  }
  function formatValue(key, value) {
    if (value === null || value === undefined || value === "") return "—";
    if (/(date|_at)$/.test(key) || key === "birth_date") return dateText(value);
    if (/(amount|balance|debt|salary|cost|price|paid)/i.test(key) && (typeof value === "number" || /^-?[\d,.]+$/.test(String(value)))) return money(value);
    if (typeof value === "boolean") return value ? "بله" : "خیر";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  }
  function dataFields(row, omit = []) {
    if (!row) return "";
    return `<div class="kj-profile-grid">${Object.entries(row).filter(([k,v]) => !omit.includes(k) && v !== null && v !== "").map(([k,v]) => `<div class="kj-field"><b>${esc(fieldLabel(k))}</b><span>${esc(formatValue(k,v))}</span></div>`).join("")}</div>`;
  }
  function errBox(key) {
    const e = state.errors[key];
    return e ? `<div class="kj-error"><b>خطا در دریافت اطلاعات:</b> ${esc(e)}<p class="kj-small">این خطا به معنی خالی بودن سوابق نیست. اتصال و مجوز دسترسی را بررسی کنید.</p></div>` : "";
  }
  function empty(text) { return `<div class="kj-empty">${esc(text)}</div>`; }
  function tableHtml(rows, columns, emptyText = "موردی برای نمایش وجود ندارد") {
    if (!rows.length) return empty(emptyText);
    return `<div class="kj-table-wrap"><table><thead><tr>${columns.map(c => `<th>${esc(c.label)}</th>`).join("")}<th>جزئیات</th></tr></thead><tbody>${rows.map((row,i) => `<tr>${columns.map(c => `<td>${esc(formatValue(c.key, row[c.key]))}</td>`).join("")}<td><button class="kj-link" data-row="${i}">نمایش</button></td></tr>`).join("")}</tbody></table></div>`;
  }
  function attachRowDetails(container, rows, title = "جزئیات") {
    $$("[data-row]", container).forEach(button => button.addEventListener("click", () => {
      const row = rows[Number(button.dataset.row)];
      if (!row) return;
      modal(title, dataFields(row));
    }));
  }
  function modal(title, body) {
    const old = $("#kj-modal"); if (old) old.remove();
    const el = document.createElement("div");
    el.id = "kj-modal";
    el.style.cssText = "position:fixed;inset:0;background:#211b19aa;z-index:9999;display:flex;align-items:center;justify-content:center;padding:14px";
    el.innerHTML = `<div style="width:min(900px,100%);max-height:90vh;overflow:auto;background:white;border-radius:16px;padding:18px" dir="rtl"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h3>${esc(title)}</h3><button class="kj-secondary" id="kj-modal-close">بستن</button></div>${body}</div>`;
    document.body.appendChild(el);
    $("#kj-modal-close").onclick = () => el.remove();
    el.addEventListener("click", e => { if (e.target === el) el.remove(); });
  }

  function dashboard() {
    const stats = [
      ["تعداد خادمین", state.khadems.length, "👤"],
      ["سوابق خدمت", state.services.length, "🕌"],
      ["جلسات", state.meetings.length, "📅"],
      ["مأموریت‌ها", state.deployments.length, "🚐"],
      ["تراکنش‌های مالی", state.finance.length, "💰"],
      ["خیرین", state.donors.length, "🤝"]
    ];
    return `<h1 class="kj-page-title">داشبورد</h1>
      ${state.loading ? `<div class="kj-card">در حال دریافت اطلاعات از پایگاه داده…</div>` : ""}
      <div class="kj-grid">${stats.map(([label,value,icon]) => `<div class="kj-card"><div>${icon} ${label}</div><div class="kj-stat">${fa(value)}</div></div>`).join("")}</div>
      ${Object.entries(state.errors).filter(([,e])=>e).map(([k,e])=>`<div class="kj-error"><b>${esc(fieldLabel(k))}:</b> ${esc(e)}</div>`).join("")}
      <div class="kj-card"><h3 style="margin-top:0">راهنمای سریع</h3><p>برای دیدن مشخصات خادم، «بانک خادمین» را باز کرده و گزینهٔ نمایش را انتخاب کنید. سوابق مالی و خدمت در پروندهٔ همان خادم نمایش داده می‌شود.</p><p class="kj-small">آمار بالا از داده‌هایی محاسبه می‌شود که با موفقیت از سرور دریافت شده‌اند. در صورت خطای دسترسی، پیام خطا جداگانه نمایش داده می‌شود.</p></div>`;
  }

  function khademList() {
    const q = state.search.trim().toLowerCase();
    const rows = state.khadems.filter(k => !q || [nameOf(k), khademCode(k), val(k,["phone","mobile"]), val(k,["national_code"])].join(" ").toLowerCase().includes(q));
    const columns = [
      {key:"khadem_code",label:"کد خادم"},
      {key:"full_name",label:"نام و نام خانوادگی"},
      {key:"phone",label:"تلفن"},
      {key:"status",label:"وضعیت"}
    ];
    const htmlRows = rows.map(k => ({
      ...k,
      khadem_code: khademCode(k),
      full_name: nameOf(k),
      phone: val(k,["phone","mobile","phone_number"]),
      status: val(k,["status","active"]) || "—"
    }));
    return `<h1 class="kj-page-title">بانک خادمین</h1>${errBox("khadems")}
      <div class="kj-toolbar"><input class="kj-search" id="kj-khadem-search" placeholder="جست‌وجو بر اساس نام، کد یا تلفن…" value="${esc(state.search)}"><span class="kj-pill">تعداد: ${fa(rows.length)}</span></div>
      ${tableHtml(htmlRows, columns, state.errors.khadems ? "دریافت فهرست خادمین ناموفق بود." : "خادمی ثبت نشده است.")}`;
  }
  function transactionBelongs(row, khadem) {
    const ids = [khademId(khadem), khadem?.khadem_id, khadem?.id].filter(v => v !== undefined && v !== null).map(String);
    const codes = [khademCode(khadem)].filter(v => v !== undefined && v !== null).map(String);
    const rowIds = [row.khadem_id, row.person_id, row.personnel_id].filter(v => v !== undefined && v !== null).map(String);
    const rowCodes = [row.khadem_code, row.personnel_code, row.code].filter(v => v !== undefined && v !== null).map(String);
    return rowIds.some(x => ids.includes(x)) || rowCodes.some(x => codes.includes(x));
  }
  function relatedRows(list, khadem) { return list.filter(row => transactionBelongs(row, khadem)); }
  function relatedSection(title, tableKey, rows, columns, emptyText) {
    return `<h3 class="kj-section-title">${esc(title)}</h3>${errBox(tableKey)}${tableHtml(rows, columns, state.errors[tableKey] ? "به دلیل خطای دریافت، خالی بودن سوابق قابل تأیید نیست." : emptyText)}`;
  }
  function khademProfile() {
    const k = state.khadems.find(x => String(khademId(x)) === String(state.selectedKhadem) || String(khademCode(x)) === String(state.selectedKhadem));
    if (!k) return `<h1 class="kj-page-title">پرونده خادم</h1>${empty("خادم انتخاب نشده است.")}<button class="kj-secondary" id="kj-back">بازگشت</button>`;
    const services = relatedRows(state.services, k);
    const finances = relatedRows(state.finance, k);
    const fields = dataFields(k, ["id"]);
    const serviceCols = [
      {key:"service_date",label:"تاریخ خدمت"},
      {key:"service_type",label:"نوع خدمت"},
      {key:"category",label:"دسته‌بندی"},
      {key:"notes",label:"توضیحات"}
    ];
    const financeCols = [
      {key:"transaction_type",label:"نوع تراکنش"},
      {key:"category",label:"دسته‌بندی"},
      {key:"amount",label:"مبلغ"},
      {key:"paid_amount",label:"مبلغ پرداخت‌شده"},
      {key:"date",label:"تاریخ"},
      {key:"notes",label:"توضیحات"}
    ];
    const normalize = (row, keys) => Object.fromEntries(keys.map(key => [key, val(row,[key, ...(key==="date"?["transaction_date","created_at"]:key==="service_date"?["date","created_at"]:key==="notes"?["description","note"]:[])])]));
    const financeRows = finances.map(r => ({...r, ...normalize(r, ["transaction_type","category","amount","paid_amount","date","notes"])}));
    const serviceRows = services.map(r => ({...r, ...normalize(r, ["service_date","service_type","category","notes"])}));
    return `<div class="kj-toolbar"><button class="kj-secondary" id="kj-back">← بازگشت به فهرست</button></div>
      <h1 class="kj-page-title">پروندهٔ ${esc(nameOf(k))}</h1>
      <div class="kj-card"><h3 class="kj-section-title" style="margin-top:0">مشخصات خادم</h3>${fields}</div>
      <div class="kj-card" style="margin-top:14px"><div class="kj-grid" style="margin:0"><div><div class="kj-muted">کد خادم</div><b>${esc(khademCode(k) || "—")}</b></div><div><div class="kj-muted">تعداد سوابق خدمت</div><b>${fa(services.length)}</b></div><div><div class="kj-muted">تعداد تراکنش‌های مالی</div><b>${fa(finances.length)}</b></div></div></div>
      <div class="kj-card" style="margin-top:14px">${relatedSection("سوابق خدمت","services",serviceRows,serviceCols,"هنوز سابقه خدمتی برای این خادم ثبت نشده است.")}</div>
      <div class="kj-card" style="margin-top:14px">${relatedSection("سوابق مالی خادم","finance",financeRows,financeCols,"هنوز سابقه مالی ثبت نشده است.")}</div>`;
  }
  function genericPage(key, title, rows, preferredColumns) {
    const cols = preferredColumns || (rows.length ? Object.keys(rows[0]).filter(k => !["id","updated_at","created_at"].includes(k)).slice(0,5).map(k=>({key:k,label:fieldLabel(k)})) : []);
    return `<h1 class="kj-page-title">${esc(title)}</h1>${errBox(key)}${cols.length ? tableHtml(rows, cols, state.errors[key] ? "دریافت اطلاعات ناموفق بود." : "هنوز موردی ثبت نشده است.") : (state.errors[key] ? "" : empty("هنوز موردی ثبت نشده است."))}`;
  }
  function financePage() {
    const columns = [
      {key:"transaction_type",label:"نوع تراکنش"},
      {key:"khadem_code",label:"کد خادم"},
      {key:"category",label:"دسته‌بندی"},
      {key:"amount",label:"مبلغ"},
      {key:"paid_amount",label:"پرداخت‌شده"},
      {key:"date",label:"تاریخ"},
      {key:"notes",label:"توضیحات"}
    ];
    const rows = state.finance.map(r => ({
      ...r,
      transaction_type: val(r,["transaction_type","type","kind"]),
      khadem_code: val(r,["khadem_code","personnel_code"]) || (r.khadem_id ? nameOf(state.khadems.find(k=>String(khademId(k))===String(r.khadem_id)) || {}) : ""),
      category: val(r,["category","account_category"]),
      amount: val(r,["amount","total_amount"]),
      paid_amount: val(r,["paid_amount","amount_paid"]),
      date: val(r,["date","transaction_date","created_at"]),
      notes: val(r,["notes","description","note"])
    }));
    return genericPage("finance","امور مالی",rows,columns);
  }
  function fridayPage() {
    const rows = state.services.filter(r => /جمعه|friday|night/i.test([r.service_type,r.category,r.title,r.notes,r.service_name].join(" ")));
    return `<h1 class="kj-page-title">پایش خدمت شب جمعه</h1><div class="kj-card"><p>این صفحه سوابقی را که نوع یا توضیحات آن‌ها به شب جمعه اشاره دارد، از میان سوابق خدمت نمایش می‌دهد.</p><p class="kj-small">محاسبهٔ قطعی مهلت ۴۵ روزه به نام و تاریخ استاندارد خدمت در پایگاه داده وابسته است؛ این نسخه هیچ داده‌ای را برای تکمیل این گزارش تغییر نمی‌دهد.</p></div>${errBox("services")}${tableHtml(rows,[{key:"khadem_code",label:"کد خادم"},{key:"service_date",label:"تاریخ خدمت"},{key:"service_type",label:"نوع خدمت"},{key:"notes",label:"توضیحات"}],state.errors.services ? "دریافت سوابق خدمت ناموفق بود." : "سابقه‌ای با نشانهٔ شب جمعه پیدا نشد.")}`;
  }
  function reportsPage() {
    return `<h1 class="kj-page-title">گزارش‌ها</h1><div class="kj-grid">${[
      ["خادمین",state.khadems.length],["خدمات",state.services.length],["جلسات",state.meetings.length],
      ["مأموریت‌ها",state.deployments.length],["تراکنش‌های مالی",state.finance.length],["خیرین",state.donors.length]
    ].map(([label,count])=>`<div class="kj-card">${esc(label)}<div class="kj-stat">${fa(count)}</div></div>`).join("")}</div><p class="kj-small">این گزارش بر اساس داده‌های دریافت‌شده تهیه شده است؛ خطاهای دریافت در داشبورد و بخش مربوطه مشخص می‌شوند.</p>`;
  }
  function settingsPage() {
    return `<h1 class="kj-page-title">تنظیمات</h1><div class="kj-card"><h3>اتصال سامانه</h3><p>نشانی Supabase: <code>${esc(SUPABASE_URL)}</code></p><p>وضعیت: ${state.loaded ? `<span class="kj-pill">تلاش برای دریافت اطلاعات انجام شده</span>` : `<span class="kj-pill">در انتظار دریافت اطلاعات</span>`}</p><p class="kj-small">این صفحه فقط وضعیت کلی اتصال را نشان می‌دهد. تنظیمات امنیتی و پایگاه داده از این بخش تغییر نمی‌کنند.</p><button class="kj-primary" id="kj-settings-refresh">دریافت دوباره اطلاعات</button></div>`;
  }

  function render() {
    if (!token()) { loginPage(); return; }
    shell();
    const main = $("#kj-main");
    if (!main) return;
    if (state.selectedKhadem !== null && state.tab === "khadems") {
      main.innerHTML = khademProfile();
      $("#kj-back")?.addEventListener("click", () => { state.selectedKhadem = null; render(); });
      return;
    }
    const views = {
      dashboard,
      khadems: khademList,
      services: () => genericPage("services","سوابق خدمت",state.services,[
        {key:"khadem_code",label:"کد خادم"},{key:"service_date",label:"تاریخ خدمت"},
        {key:"service_type",label:"نوع خدمت"},{key:"category",label:"دسته‌بندی"},{key:"notes",label:"توضیحات"}
      ]),
      friday: fridayPage,
      meetings: () => genericPage("meetings","جلسات",state.meetings),
      deployments: () => genericPage("deployments","مأموریت‌ها",state.deployments),
      finance: financePage,
      fund: () => genericPage("fund","صندوق",state.fund),
      donors: () => genericPage("donors","خیرین",state.donors),
      reports: reportsPage,
      settings: settingsPage
    };
    main.innerHTML = (views[state.tab] || dashboard)();
    if (state.tab === "khadems") {
      $("#kj-khadem-search")?.addEventListener("input", e => {
        const pos = e.target.selectionStart;
        state.search = e.target.value;
        const main = $("#kj-main");
        main.innerHTML = khademList();
        const input = $("#kj-khadem-search");
        input?.focus(); input?.setSelectionRange(pos,pos);
        bindKhademButtons();
      });
      bindKhademButtons();
    }
    if (["services","meetings","deployments","finance","fund","donors"].includes(state.tab)) {
      const key = ({services:"services",meetings:"meetings",deployments:"deployments",finance:"finance",fund:"fund",donors:"donors"})[state.tab];
      const rows = state[key];
      attachRowDetails(main, rows, "جزئیات رکورد");
    }
    $("#kj-settings-refresh")?.addEventListener("click", loadData);
  }
  function bindKhademButtons() {
    const main = $("#kj-main");
    if (!main) return;
    const q = state.search.trim().toLowerCase();
    const rows = state.khadems.filter(k => !q || [nameOf(k),khademCode(k),val(k,["phone","mobile"]),val(k,["national_code"])].join(" ").toLowerCase().includes(q));
    $$("[data-row]", main).forEach(b => b.addEventListener("click", () => {
      const k = rows[Number(b.dataset.row)];
      if (!k) return;
      state.selectedKhadem = khademId(k) || khademCode(k);
      render();
    }));
  }

  async function startApp() {
    injectStyles();
    if (!token()) { loginPage(); return; }
    try {
      const app = ensureRoot();
      app.innerHTML = `<div dir="rtl" style="padding:40px;text-align:center">در حال آماده‌سازی سامانه…</div>`;
      await loadData();
    } catch (e) {
      console.error(e);
      toast(e.message || "خطا در راه‌اندازی سامانه", "error");
      render();
    }
  }

  injectStyles();
  window.KJ = {
    start: startApp,
    refresh: loadData,
    render,
    signout,
    state
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApp, { once: true });
  } else {
    startApp();
  }
})(); 
