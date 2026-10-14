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
    nonattendance: [],
    meetings: [],
    deployments: [],
    finance: [],
    tuitionDues: [],
    financeInstallments: [],
    fund: [],
    donors: [],
    meetingInvitees: [],
    meetingAttendance: [],
    vehicles: [],
    drivers: [],
    equipmentIssues: [],
    equipmentPayments: [],
    equipmentReceipts: [],
    equipmentReceiptItems: [],
    equipmentCommitteePayments: [],
    profiles: [],
    roles: [],
    permissions: [],
    rolePermissions: [],
    audit: [],
    systemSettings: [],
    appSettings: [],
    tuitionPayments: [],
    selectedKhadem: null,
    search: "",
    loading: false,
    errors: {},
    loaded: false
  };

  const menu = [
    ["dashboard", "🏠 داشبورد"],
    ["khadems", "👤 بانک خادمین"],
    ["services", "🕌 ثبت خدمت رسمی"],
    ["friday", "🌙 پایش خدمت شب جمعه"],
    ["nonattendance", "🧾 ثبت و پیگیری عدم حضور"],
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
      const error = new Error(String(message));
      error.status = response.status;
      throw error;
    }
    return data;
  }
  function apiTable(table, query = "select=*") {
    return request("/rest/v1/" + encodeURIComponent(table) + "?" + query);
  }
  async function loadTable(table, stateKey = table) {
    try {
      const rows = await apiTable(table, "select=*&limit=1000");
      state.errors[stateKey] = "";
      state.errors[table] = "";
      return Array.isArray(rows) ? rows : [];
    } catch (e) {
      const message = e.message || "خطا در دریافت اطلاعات";
      state.errors[stateKey] = message;
      state.errors[table] = message;
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
      ["nonattendance", "khadem_service_nonattendance"],
      ["meetings", "meetings"],
      ["deployments", "deployments"],
      ["finance", "finance_transactions"],
      ["tuitionDues", "tuition_dues"],
      ["financeInstallments", "finance_installments"],
      ["fund", "fund_transactions"],
      ["donors", "donors"],
      ["meetingInvitees", "meeting_invitees"],
      ["meetingAttendance", "meeting_attendance"],
      ["vehicles", "vehicles"],
      ["drivers", "drivers"],
      ["equipmentIssues", "khadem_equipment_issues"],
      ["equipmentPayments", "khadem_equipment_payments"],
      ["equipmentReceipts", "equipment_committee_receipts"],
      ["equipmentReceiptItems", "equipment_committee_receipt_items"],
      ["equipmentCommitteePayments", "equipment_committee_payments"],
      ["profiles", "profiles"],
      ["roles", "app_roles"],
      ["permissions", "permissions"],
      ["rolePermissions", "role_permissions"],
      ["audit", "audit_logs"],
      ["systemSettings", "system_settings"],
      ["appSettings", "app_settings"],
      ["tuitionPayments", "tuition_payments"]
    ];
    await Promise.all(tables.map(async ([key, table]) => { state[key] = await loadTable(table, key); }));
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
          <p class="kj-small" style="text-align:center;margin-top:12px"><a href="./forgot-password.html" style="color:#781f32;font-weight:bold;text-decoration:none">فراموشی رمز عبور؟ بازیابی از طریق ایمیل</a></p>
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

    style.textContent += `
      :root{color-scheme:light;--kj-maroon:#137c68;--kj-gold:#74b8a6;--kj-bg:#f2f6fa;--kj-ink:#244b45;--kj-muted:#718580;--kj-border:#e5ece9}
      body{background:var(--kj-bg);color:var(--kj-ink)}
      .kj-shell{max-width:none;min-height:100vh;background:var(--kj-bg)}
      .kj-top{background:#fff;color:var(--kj-ink);border-bottom:1px solid var(--kj-border);padding:12px 22px;box-shadow:0 3px 14px #244b4508}
      .kj-brand{font-size:18px;color:var(--kj-ink)}.kj-top small{color:var(--kj-muted)}
      .kj-top .kj-small{color:var(--kj-ink)!important}
      .kj-top .kj-secondary{background:#e5f5ef;color:#137c68;border-color:#d2ece3}
      .kj-layout{display:grid;grid-template-columns:260px minmax(0,1fr);gap:18px;max-width:1600px;margin:0 auto;padding:18px}
      .kj-sidebar{background:#fff;border:1px solid var(--kj-border);border-radius:18px;padding:14px;height:max-content;position:sticky;top:84px;max-height:calc(100vh - 100px);overflow:auto}
      .kj-side-search{width:100%;border:1px solid var(--kj-border);border-radius:12px;padding:11px;background:#fff;margin-bottom:12px}
      .kj-menu-group{border-top:1px solid #f0f3f2;padding-top:8px;margin-top:7px}
      .kj-group-toggle{width:100%;display:flex;justify-content:space-between;align-items:center;gap:8px;text-align:right;border:0;background:transparent;color:#137c68;font-size:12px;font-weight:bold;padding:10px 7px;min-height:40px}
      .kj-group-toggle:after{content:'＋';font-size:16px;color:var(--kj-muted);font-weight:normal}
      .kj-menu-group.open .kj-group-toggle:after{content:'−'}
      .kj-group-items{display:none}.kj-menu-group.open .kj-group-items{display:grid;gap:4px}.kj-menu-hidden{display:none!important}
      .kj-nav{display:flex;flex-direction:column;gap:4px;overflow:visible;padding:0;background:transparent;border:0;position:static}
      .kj-nav button{width:100%;white-space:normal;text-align:right;display:flex;align-items:center;gap:9px;border:1px solid transparent;border-radius:12px;padding:10px 12px;background:#fff;color:#536b66;min-height:44px}
      .kj-nav button.active{background:#e5f5ef;color:#137c68;border-color:transparent;font-weight:bold}
      .kj-nav button:hover{background:#f1f8f5}
      .kj-main{padding:0;min-height:65vh}
      .kj-page-title{color:#244b45}
      .kj-card{border-color:var(--kj-border);border-radius:16px;box-shadow:0 5px 18px #244b4506}
      .kj-stat{color:#137c68}
      .kj-pill{background:#e5f5ef;color:#137c68}
      .kj-link{color:#137c68}
      .kj-primary,.kj-button{background:#137c68}
      .kj-table-wrap{border-color:var(--kj-border);border-radius:14px}
      th{background:#f3f8f6;color:#355f56}
      .kj-footer{color:#81928d}
      .kj-side-foot{font-size:11px;color:var(--kj-muted);padding:14px 7px 3px;border-top:1px solid #f0f3f2;margin-top:12px;line-height:1.8}
      .kj-content-wrap{min-width:0}
      @media(max-width:850px){.kj-layout{grid-template-columns:1fr;padding:10px;gap:10px}.kj-sidebar{position:static;max-height:none;padding:10px}.kj-top{padding:10px 12px}.kj-brand{font-size:15px}.kj-nav{display:block}.kj-menu-group.open .kj-group-items{grid-template-columns:repeat(2,minmax(0,1fr))}.kj-group-items button{font-size:13px;padding:8px}.kj-side-foot{display:none}}
      @media(max-width:420px){.kj-menu-group.open .kj-group-items{grid-template-columns:1fr}.kj-top .kj-actions{gap:5px}.kj-top .kj-actions button{padding:7px 9px}}
    `;
  }

  function shell() {
    const app = ensureRoot();
    const user = (() => { try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch (_) { return null; } })();
    const groups = [
      ["نمای کلی و عملیات", [["dashboard","🏠 داشبورد"],["reports","📊 گزارش‌ها"]]],
      ["خادمین و عملیات خدمت", [["khadems","👤 بانک خادمین"],["services","📋 خدمت و سوابق خدمت"],["friday","🌙 پایش خدمت شب جمعه"],["nonattendance","🧾 عدم حضور"],["meetings","👥 جلسات و حضور و غیاب"],["deployments","🚐 مأموریت خدمت"]]],
      ["مالی و پشتیبانی", [["finance","💰 امور مالی"],["fund","🏦 خزانه"],["donors","🤝 نیکوکاران و خیرین"],["equipment","👕 وسایل و تجهیزات"]]],
      ["ارتباطات و گزارش‌ها", [["reports","📊 گزارش‌ها"],["audit","📁 سوابق فعالیت"]]],
      ["مدیریت سامانه", [["users","🧩 کاربران و دسترسی‌ها"],["settings","⚙️ مدیریت سامانه و تنظیمات"]]]
    ];
    app.innerHTML = `
      <div class="kj-shell" dir="rtl">
        <header class="kj-top">
          <div class="kj-brand">🕌 سامانه جامع مدیریت خادمین<small>مرکز مدیریت و عملیات</small></div>
          <div class="kj-actions"><span class="kj-small">${esc(user?.email || user?.user_metadata?.name || "کاربر سامانه")}</span><button class="kj-secondary" id="kj-refresh">به‌روزرسانی اطلاعات</button><button class="kj-secondary" id="kj-signout">خروج ←</button></div>
        </header>
        <div class="kj-layout">
          <aside class="kj-sidebar" aria-label="منوی سامانه">
            <input class="kj-side-search" id="kj-menu-search" type="search" placeholder="جست‌وجوی منو و زیرمنو…" aria-label="جست‌وجوی منو و زیرمنو">
            <nav class="kj-nav" aria-label="منوی اصلی">
              ${groups.map(([title,items],i)=>`<section class="kj-menu-group ${i===0?"open":""}">
                <button type="button" class="kj-group-toggle" aria-expanded="${i===0?"true":"false"}">${title}</button>
                <div class="kj-group-items">${items.map(([id,label])=>`<button type="button" data-tab="${id}" data-label="${label.replace(/^[^ ]+ /,"")}" class="${state.tab===id?"active":""}">${label}</button>`).join("")}</div>
              </section>`).join("")}
            </nav>
            <div class="kj-side-foot">اتصال به پایگاه داده پس از تأیید حساب کاربری انجام می‌شود. خطاهای دسترسی در همان بخش نمایش داده می‌شوند.</div>
          </aside>
          <div class="kj-content-wrap"><main id="kj-main" class="kj-main"></main><footer class="kj-footer">سامانه جامع مدیریت خادمین · رابط فارسی راست‌چین</footer></div>
        </div>
      </div>`;
    $$(".kj-group-toggle").forEach(b => b.addEventListener("click", () => {
      const group=b.closest(".kj-menu-group");const open=!group.classList.contains("open");
      group.classList.toggle("open",open);b.setAttribute("aria-expanded",open?"true":"false");
    }));
    $$(".kj-nav [data-tab]").forEach(b => b.addEventListener("click", () => {
      state.tab = b.dataset.tab; state.selectedKhadem = null;
      $$(".kj-nav [data-tab]").forEach(n=>n.classList.toggle("active",n===b));
      const group=b.closest(".kj-menu-group");if(group){group.classList.add("open");group.querySelector(".kj-group-toggle")?.setAttribute("aria-expanded","true");}
      render();
    }));
    $("#kj-menu-search").addEventListener("input", e => {
      const q=e.target.value.trim().toLocaleLowerCase("fa");
      $$(".kj-nav [data-tab]").forEach(b=>b.classList.toggle("kj-menu-hidden",!!q&&!b.textContent.toLocaleLowerCase("fa").includes(q)));
      $$(".kj-menu-group").forEach(g=>{
        const any=[...g.querySelectorAll("[data-tab]")].some(b=>!b.classList.contains("kj-menu-hidden"));
        g.style.display=any?"":"none";
        if(q&&any){g.classList.add("open");g.querySelector(".kj-group-toggle")?.setAttribute("aria-expanded","true");}
        else if(!q){const open=g===document.querySelector(".kj-menu-group");g.classList.toggle("open",open);g.querySelector(".kj-group-toggle")?.setAttribute("aria-expanded",open?"true":"false");}
      });
    });
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
      national_code:"کد ملی", national_id:"کد ملی", phone:"تلفن همراه", mobile:"تلفن همراه", email:"ایمیل",
      triple_name:"نام سه‌گانه", tri_name:"نام سه‌گانه", membership_date:"تاریخ عضویت",
      birth_date:"تاریخ تولد", address:"نشانی", residence:"محل سکونت", status:"وضعیت", active:"فعال", is_active:"وضعیت فعالیت",
      primary_responsibility:"مسئولیت اصلی", job:"شغل", occupation:"شغل", blood_type:"گروه خونی", medical_history:"سوابق پزشکی",
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
    const tuitionDues = relatedRows(state.tuitionDues, k);
    const installments = relatedRows(state.financeInstallments, k);
    const fields = dataFields(k, ["id"]);
    const serviceCols = [
      {key:"service_date",label:"تاریخ خدمت"},
      {key:"responsibility",label:"مسئولیت خدمت"},
      {key:"service_type",label:"عنوان خدمت"},
      {key:"description",label:"شرح خدمت"}
    ];
    const financeCols = [
      {key:"transaction_type",label:"نوع تراکنش"},
      {key:"category",label:"دسته‌بندی"},
      {key:"title",label:"عنوان"},
      {key:"amount",label:"مبلغ ثبت‌شده"},
      {key:"paid_amount",label:"مبلغ پرداخت‌شده"},
      {key:"balance",label:"مانده / بدهی"},
      {key:"transaction_date",label:"تاریخ تراکنش"},
      {key:"description",label:"شرح"}
    ];
    const normalize = (row, keys) => Object.fromEntries(keys.map(key => [key, val(row,
      key==="service_date" ? [key,"date","created_at"] :
      key==="description" ? [key,"notes","note"] :
      key==="amount" ? [key,"total_amount","amount_toman","total_amount_toman"] :
      key==="paid_amount" ? [key,"amount_paid","paid_toman","paid_amount_toman"] :
      key==="balance" ? [key,"remaining_amount","remaining_toman","debt","balance_toman"] :
      [key]
    )]));
    const financeTransactionRows = finances.map(r => ({...r, ...normalize(r, ["transaction_type","category","title","amount","paid_amount","balance","transaction_date","description"])}));
    const tuitionRows = tuitionDues.map(r => ({
      ...r, transaction_type: "شهریه", category: "شهریه ماهانه",
      title: "شهریه " + dateText(r.period_month), amount: r.amount_toman,
      paid_amount: r.paid_toman, balance: Math.max(0, num(r.amount_toman) - num(r.paid_toman)),
      transaction_date: r.period_month, description: val(r, ["notes"]) || r.status
    }));
    const installmentRows = installments.map(r => ({
      ...r, transaction_type: "قسط", category: "اقساط",
      title: "قسط شماره " + fa(r.installment_number), amount: r.amount,
      paid_amount: r.paid_amount, balance: Math.max(0, num(r.amount) - num(r.paid_amount)),
      transaction_date: r.due_date, description: val(r, ["notes"]) || r.status
    }));
    const financeRows = [...financeTransactionRows, ...tuitionRows, ...installmentRows];
    const financeLoadError = state.errors.finance_transactions || state.errors.tuition_dues || state.errors.finance_installments;
    const serviceRows = services.map(r => ({...r, ...normalize(r, ["service_date","responsibility","service_type","description"])}));
    return `<div class="kj-toolbar"><button class="kj-secondary" id="kj-back">← بازگشت به فهرست</button></div>
      <h1 class="kj-page-title">پروندهٔ ${esc(nameOf(k))}</h1>
      <div class="kj-card"><h3 class="kj-section-title" style="margin-top:0">مشخصات خادم</h3>${fields}</div>
      <div class="kj-card" style="margin-top:14px"><div class="kj-grid" style="margin:0"><div><div class="kj-muted">کد خادم</div><b>${esc(khademCode(k) || "—")}</b></div><div><div class="kj-muted">تعداد سوابق خدمت</div><b>${fa(services.length)}</b></div><div><div class="kj-muted">تعداد تراکنش‌های مالی</div><b>${fa(financeRows.length)}</b></div></div></div>
      <div class="kj-card" style="margin-top:14px">${relatedSection("سوابق خدمت","service_records",serviceRows,serviceCols,"هنوز سابقه خدمتی برای این خادم ثبت نشده است.")}</div>
      <div class="kj-card" style="margin-top:14px"><h3 class="kj-section-title">سوابق مالی خادم</h3>${errBox("finance_transactions")}${errBox("tuition_dues")}${errBox("finance_installments")}${financeLoadError ? empty("به دلیل خطای دریافت، خالی بودن سوابق مالی قابل تأیید نیست.") : tableHtml(financeRows,financeCols,"هنوز سابقه مالی ثبت نشده است")}</div>`;
  }
  function genericPage(key, title, rows, preferredColumns) {
    const cols = preferredColumns || (rows.length ? Object.keys(rows[0]).filter(k => !["id","updated_at","created_at"].includes(k)).slice(0,5).map(k=>({key:k,label:fieldLabel(k)})) : []);
    return `<h1 class="kj-page-title">${esc(title)}</h1>${errBox(key)}${cols.length ? tableHtml(rows, cols, state.errors[key] ? "دریافت اطلاعات ناموفق بود." : "هنوز موردی ثبت نشده است.") : (state.errors[key] ? "" : empty("هنوز موردی ثبت نشده است."))}`;
  }
  function meetingsPage() {
    const rows = state.meetings.map(m => {
      const invited = state.meetingInvitees.filter(i => String(i.meeting_id) === String(m.id));
      const attendance = state.meetingAttendance.filter(i => String(i.meeting_id) === String(m.id));
      const statusOf = i => i.attendance_status || i.status || i.invite_status;
      return {...m, invitee_count: invited.length || val(m,["invite_count"]), present_count: invited.filter(i=>statusOf(i)==="present").length+attendance.filter(i=>i.status==="present").length, absent_count: invited.filter(i=>statusOf(i)==="absent").length+attendance.filter(i=>i.status==="absent").length};
    });
    return `<h1 class="kj-page-title">جلسات و حضور و غیاب</h1>${errBox("meetings")}${errBox("meetingInvitees")}${errBox("meetingAttendance")}${tableHtml(rows,[{key:"title",label:"عنوان جلسه"},{key:"meeting_date",label:"تاریخ جلسه"},{key:"meeting_type",label:"نوع جلسه"},{key:"invitee_count",label:"مدعوین"},{key:"present_count",label:"حاضر"},{key:"absent_count",label:"غایب"},{key:"status",label:"وضعیت"}],"جلسه‌ای برای نمایش وجود ندارد.")}<h3 class="kj-section-title">مدعوین و حضور ثبت‌شده</h3>${genericPage("meetingInvitees","فهرست مدعوین",state.meetingInvitees,[{key:"meeting_id",label:"شناسه جلسه"},{key:"khadem_code",label:"کد خادم"},{key:"khadem_name",label:"نام خادم"},{key:"attendance_status",label:"وضعیت حضور"},{key:"invite_status",label:"وضعیت دعوت"}])}<h3 class="kj-section-title">ثبت‌های حضور</h3>${genericPage("meetingAttendance","حضور و غیاب",state.meetingAttendance,[{key:"meeting_id",label:"شناسه جلسه"},{key:"khadem_id",label:"شناسه خادم"},{key:"status",label:"وضعیت"},{key:"reason",label:"توضیحات"}])}`;
  }
  function equipmentPage() {
    return `<h1 class="kj-page-title">وسایل و تجهیزات</h1><p class="kj-muted">این بخش فقط سوابق موجود را می‌خواند؛ هیچ تحویل یا پرداختی ثبت یا ویرایش نمی‌شود.</p><div class="kj-card">${errBox("vehicles")}${genericPage("vehicles","وسایل نقلیه",state.vehicles,[{key:"vehicle_type",label:"نوع وسیله"},{key:"model",label:"مدل"},{key:"plate_number",label:"پلاک"},{key:"capacity",label:"ظرفیت"},{key:"driver_name",label:"راننده"},{key:"status",label:"وضعیت"}])}</div><div class="kj-card" style="margin-top:14px">${errBox("drivers")}${genericPage("drivers","رانندگان",state.drivers,[{key:"full_name",label:"نام راننده"},{key:"phone",label:"تلفن"},{key:"status",label:"وضعیت"}])}</div><div class="kj-card" style="margin-top:14px">${errBox("equipmentIssues")}${genericPage("equipmentIssues","تحویل وسایل به خادمین",state.equipmentIssues,[{key:"khadem_id",label:"شناسه خادم"},{key:"item_key",label:"قلم وسیله"},{key:"quantity",label:"تعداد"},{key:"total_amount_toman",label:"مبلغ کل"},{key:"issue_status",label:"وضعیت تحویل"},{key:"issue_date",label:"تاریخ"}])}</div><div class="kj-card" style="margin-top:14px">${errBox("equipmentPayments")}${genericPage("equipmentPayments","پرداخت‌های وسایل",state.equipmentPayments,[{key:"issue_id",label:"شناسه تحویل"},{key:"amount_toman",label:"مبلغ پرداخت"},{key:"paid_date",label:"تاریخ پرداخت"},{key:"payment_method",label:"روش پرداخت"}])}</div><div class="kj-card" style="margin-top:14px">${errBox("equipmentReceipts")}${genericPage("equipmentReceipts","دریافت وسایل از هیئت",state.equipmentReceipts,[{key:"received_date",label:"تاریخ دریافت"},{key:"received_from",label:"دریافت از"},{key:"reference_no",label:"شماره رسید"},{key:"notes",label:"توضیحات"}])}</div><div class="kj-card" style="margin-top:14px">${errBox("equipmentReceiptItems")}${genericPage("equipmentReceiptItems","اقلام دریافتی",state.equipmentReceiptItems,[{key:"receipt_id",label:"شناسه رسید"},{key:"item_key",label:"قلم وسیله"},{key:"quantity",label:"تعداد"},{key:"unit_cost_toman",label:"قیمت واحد"},{key:"total_cost_toman",label:"مبلغ کل"}])}</div><div class="kj-card" style="margin-top:14px">${errBox("equipmentCommitteePayments")}${genericPage("equipmentCommitteePayments","پرداخت به هیئت",state.equipmentCommitteePayments,[{key:"receipt_id",label:"شناسه رسید"},{key:"amount_toman",label:"مبلغ"},{key:"paid_date",label:"تاریخ"},{key:"payment_method",label:"روش پرداخت"}])}</div>`;
  }
  function usersPage() {
    return `<h1 class="kj-page-title">کاربران و دسترسی‌ها</h1><p class="kj-muted">اطلاعات فقط طبق مجوز واقعی حساب واردشده نمایش داده می‌شود.</p><div class="kj-card">${errBox("profiles")}${genericPage("profiles","حساب‌های قابل مشاهده",state.profiles,[{key:"display_name",label:"نام نمایشی"},{key:"full_name",label:"نام کامل"},{key:"role",label:"نقش"},{key:"is_active",label:"فعال"}])}</div><div class="kj-card" style="margin-top:14px">${errBox("roles")}${genericPage("roles","نقش‌های تعریف‌شده",state.roles,[{key:"role_key",label:"شناسه نقش"},{key:"title",label:"عنوان"},{key:"is_system",label:"نقش سیستمی"}])}</div><div class="kj-card" style="margin-top:14px">${errBox("permissions")}${genericPage("permissions","مجوزهای تعریف‌شده",state.permissions,[{key:"permission_key",label:"شناسه مجوز"},{key:"title",label:"عنوان مجوز"}])}</div><div class="kj-card" style="margin-top:14px">${errBox("rolePermissions")}${genericPage("rolePermissions","ارتباط نقش و مجوز",state.rolePermissions,[{key:"role_id",label:"شناسه نقش"},{key:"permission_id",label:"شناسه مجوز"}])}</div>`;
  }
  function auditPage() {
    return `<h1 class="kj-page-title">سوابق فعالیت</h1><p class="kj-muted">رویدادهای قابل مشاهده از جدول audit_logs؛ خالی بودن این جدول به معنی ثبت شدن تمام فعالیت‌ها نیست.</p>${errBox("audit")}${genericPage("audit","گزارش رویدادها",state.audit,[{key:"created_at",label:"زمان"},{key:"actor_user_id",label:"شناسه کاربر"},{key:"action",label:"عملیات"},{key:"module_key",label:"بخش"},{key:"record_id",label:"شناسه رکورد"}])}
  }
  function financePage() {
    const columns = [
      {key:"transaction_type",label:"نوع تراکنش"},
      {key:"khadem_code",label:"کد خادم"},
      {key:"category",label:"دسته‌بندی"},
      {key:"title",label:"عنوان"},
      {key:"amount",label:"مبلغ ثبت‌شده"},
      {key:"transaction_date",label:"تاریخ تراکنش"},
      {key:"description",label:"شرح"}
    ];
    const rows = state.finance.map(r => ({
      ...r,
      transaction_type: val(r,["transaction_type","type","kind"]),
      khadem_code: val(r,["khadem_code","personnel_code"]) || (r.khadem_id ? nameOf(state.khadems.find(k=>String(khademId(k))===String(r.khadem_id)) || {}) : ""),
      category: val(r,["category","account_category"]),
      title: val(r,["title","description"]),
      amount: val(r,["amount","total_amount"]),
      transaction_date: val(r,["transaction_date","date","created_at"]),
      description: val(r,["description","notes","note"])
    }));
    return genericPage("finance","امور مالی",rows,columns);
  }
  function nonattendancePage() {
    const rows = state.nonattendance.map(r => {
      const k = state.khadems.find(x => String(khademId(x)) === String(r.khadem_id));
      return {
        ...r,
        khadem_code: k ? khademCode(k) : "",
        khadem_name: k ? nameOf(k) : "",
        planned_service_date: r.planned_service_date,
        service_kind: r.service_kind,
        reason_code: r.reason_code,
        resolution_status: r.resolution_status,
        cost_total_toman: r.cost_total_toman,
        cost_paid_toman: r.cost_paid_toman,
        refund_amount_toman: r.refund_amount_toman
      };
    });
    return genericPage("nonattendance","ثبت و پیگیری عدم حضور",rows,[
      {key:"khadem_code",label:"کد خادم"},
      {key:"khadem_name",label:"نام خادم"},
      {key:"service_kind",label:"نوع خدمت"},
      {key:"planned_service_date",label:"تاریخ خدمت"},
      {key:"reason_code",label:"علت عدم حضور"},
      {key:"resolution_status",label:"وضعیت پیگیری"},
      {key:"cost_total_toman",label:"هزینه کل"},
      {key:"cost_paid_toman",label:"مبلغ پرداخت‌شده"}
    ]);
  }

  function fridayPage() {
    const rows = state.services.filter(r =>
      /جمعه|friday|night/i.test([r.service_type,r.category,r.title,r.description,r.notes,r.service_name,r.responsibility].join(" "))
    ).map(r => {
      const linkedKhadem = state.khadems.find(k =>
        String(khademId(k)) === String(r.khadem_id) ||
        (r.khadem_code !== undefined && r.khadem_code !== null && String(khademCode(k)) === String(r.khadem_code))
      );
      return {
        ...r,
        khadem_code: val(r, ["khadem_code", "personnel_code"]) || khademCode(linkedKhadem || {}),
        service_date: val(r, ["service_date", "date", "created_at"]),
        description: val(r, ["description", "notes", "note"])
      };
    });
    return `<h1 class="kj-page-title">پایش خدمت شب جمعه</h1><div class="kj-card"><p>این صفحه سوابقی را که نوع یا توضیحات آن‌ها به شب جمعه اشاره دارد، از میان سوابق خدمت نمایش می‌دهد.</p><p class="kj-small">محاسبهٔ قطعی مهلت ۴۵ روزه به نام و تاریخ استاندارد خدمت در پایگاه داده وابسته است؛ این نسخه هیچ داده‌ای را برای تکمیل این گزارش تغییر نمی‌دهد.</p></div>${errBox("services")}${tableHtml(rows,[{key:"khadem_code",label:"کد خادم"},{key:"service_date",label:"تاریخ خدمت"},{key:"service_type",label:"نوع خدمت"},{key:"description",label:"توضیحات"}],state.errors.services ? "دریافت سوابق خدمت ناموفق بود." : "سابقه‌ای با نشانهٔ شب جمعه پیدا نشد.")}`;
  }
  function reportsPage() {
    return `<h1 class="kj-page-title">گزارش‌ها</h1><div class="kj-grid">${[
      ["خادمین",state.khadems.length],["خدمات",state.services.length],["جلسات",state.meetings.length],
      ["مأموریت‌ها",state.deployments.length],["تراکنش‌های مالی",state.finance.length],["خیرین",state.donors.length]
    ].map(([label,count])=>`<div class="kj-card">${esc(label)}<div class="kj-stat">${fa(count)}</div></div>`).join("")}</div><p class="kj-small">این گزارش بر اساس داده‌های دریافت‌شده تهیه شده است؛ خطاهای دریافت در داشبورد و بخش مربوطه مشخص می‌شوند.</p>`;
  }
  function settingsPage() {
    const safeRows = rows => rows.map(r => {
      const key = val(r,["key","setting_key","name","config_key","id"]);
      const label = val(r,["title","description","label","notes"]);
      const sensitive = Object.keys(r).some(k=>/secret|password|token|private|service.?role|api.?key/i.test(k));
      return {key:String(key||"—"),description:String(label||"تنظیم ثبت‌شده"),status:sensitive?"مقدار حساس پنهان است":"ثبت‌شده"};
    });
    return `<h1 class="kj-page-title">مدیریت سامانه و تنظیمات</h1><p class="kj-muted">این صفحه فقط تنظیمات قابل مشاهده را می‌خواند؛ هیچ مقداری را تغییر نمی‌دهد و مقادیر حساس را نمایش نمی‌دهد.</p><div class="kj-card">${errBox("systemSettings")}${genericPage("systemSettings","تنظیمات عمومی",safeRows(state.systemSettings),[{key:"key",label:"کلید تنظیم"},{key:"description",label:"شرح"},{key:"status",label:"وضعیت"}])}</div><div class="kj-card" style="margin-top:14px">${errBox("appSettings")}${genericPage("appSettings","تنظیمات برنامه",safeRows(state.appSettings),[{key:"key",label:"کلید تنظیم"},{key:"description",label:"شرح"},{key:"status",label:"وضعیت"}])}</div><div class="kj-card" style="margin-top:14px"><h3>اتصال سامانه</h3><p>نشانی پروژه: <code>${esc(SUPABASE_URL)}</code></p><p class="kj-small">تلاش برای دریافت اطلاعات: ${state.loaded ? "انجام شده" : "در انتظار"}؛ موفقیت هر جدول در پیام همان بخش مشخص می‌شود.</p><button class="kj-primary" id="kj-settings-refresh">دریافت دوباره اطلاعات</button></div>`;
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
      services: () => genericPage("services","ثبت خدمت رسمی",state.services,[
        {key:"khadem_code",label:"کد خادم"},{key:"service_date",label:"تاریخ خدمت"},
        {key:"responsibility",label:"مسئولیت خدمت"},{key:"notes",label:"توضیحات"}
      ]),
      friday: fridayPage,
      nonattendance: nonattendancePage,
      meetings: meetingsPage,
      deployments: () => genericPage("deployments","مأموریت‌ها",state.deployments),
      equipment: equipmentPage,
      users: usersPage,
      audit: auditPage,
      finance: financePage,
      fund: () => genericPage("fund","صندوق",state.fund),
      donors: () => genericPage("donors","خیرین",state.donors),
      reports: reportsPage,
      settings: settingsPage
    };
    main.innerHTML = (views[state.tab] || dashboard)();
    if (state.tab === "services" || state.tab === "friday") {
      const mountAbsencePanel = () => {
        if ((state.tab === "services" || state.tab === "friday") && window.KhademEquipmentFinance && typeof window.KhademEquipmentFinance.appendNonattendanceToServicePage === "function") {
          window.KhademEquipmentFinance.appendNonattendanceToServicePage(state.tab);
        }
      };
      if (window.KhademEquipmentFinance && typeof window.KhademEquipmentFinance.appendNonattendanceToServicePage === "function") {
        window.setTimeout(mountAbsencePanel, 0);
      } else if (!document.querySelector("script[data-kj-absence-loader]")) {
        const script = document.createElement("script");
        script.src = "./equipment-finance.js?v=157";
        script.dataset.kjAbsenceLoader = "1";
        script.onload = () => window.setTimeout(mountAbsencePanel, 0);
        document.head.appendChild(script);
      }
    }
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
    if (["services","nonattendance","meetings","deployments","finance","fund","donors"].includes(state.tab)) {
      const key = ({services:"services",nonattendance:"nonattendance",meetings:"meetings",deployments:"deployments",finance:"finance",fund:"fund",donors:"donors"})[state.tab];
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
    const app = ensureRoot();
    app.innerHTML = `<div dir="rtl" style="padding:40px;text-align:center">در حال بررسی اعتبار ورود…</div>`;
    try {
      // قبل از دریافت یا نمایش داده‌های سامانه، اعتبار توکن را با Supabase بررسی کن.
      const authUser = await request("/auth/v1/user");
      if (!authUser || !authUser.id) {
        const error = new Error("پاسخ معتبر از سرویس احراز هویت دریافت نشد.");
        error.status = 401;
        throw error;
      }
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      await loadData();
    } catch (e) {
      console.error("KJ: startup/auth verification failed", e);
      if (e && (e.status === 401 || e.status === 403)) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        loginPage("نشست ورود معتبر نیست یا منقضی شده است؛ لطفاً دوباره وارد شوید.");
        return;
      }
      // در خطای شبکه/سرور توکن را پاک نکن؛ ولی داده‌های محافظت‌شده را هم بارگذاری نکن.
      loginPage("اعتبار ورود فعلاً بررسی نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.");
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
