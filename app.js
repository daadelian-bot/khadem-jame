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
    profileEditOpen: false,
    registrationOpen: false,
    search: "",
    birthdayMonth: null,
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
  function jalaliToGregorian(value) {
    const raw=String(value??"").trim().replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d));
    const m=raw.match(/^(13|14)(\d{2})[/-](\d{1,2})[/-](\d{1,2})$/);
    if(!m) return value;
    let jy=Number(raw.split(/[/-]/)[0]), jm=Number(raw.split(/[/-]/)[1]), jd=Number(raw.split(/[/-]/)[2]);
    if(jm<1||jm>12||jd<1||jd>31) return value;
    jy += 1595; let days=-355668+365*jy+Math.floor(jy/33)*8+Math.floor((jy%33+3)/4)+jd;
    days += jm<7?(jm-1)*31:(jm-7)*30+186;
    let gy=400*Math.floor(days/146097); days%=146097;
    if(days>36524){gy+=100*Math.floor(--days/36524);days%=36524;if(days>=365)days++;}
    gy+=4*Math.floor(days/1461);days%=1461;
    if(days>365){gy+=Math.floor((days-1)/365);days=(days-1)%365;}
    let gd=days+1; const leap=(gy%4===0&&gy%100!==0)||gy%400===0; const md=[0,31,leap?29:28,31,30,31,30,31,31,30,31,30,31]; let gm=1;
    while(gm<=12&&gd>md[gm]){gd-=md[gm];gm++;}
    return `${gy}-${String(gm).padStart(2,"0")}-${String(gd).padStart(2,"0")}`;
  }
  function jalaliInputDate(value) {
    if (!value) return "";
    const raw=String(value).trim();
    const jm=raw.match(/^(13|14)\d{2}[/-](\d{1,2})[/-](\d{1,2})$/);
    if (jm) return jm[1]+"/"+jm[2].padStart(2,"0")+"/"+jm[3].padStart(2,"0");
    const dt=new Date(raw);
    if (Number.isNaN(dt.getTime())) return raw;
    const parts=new Intl.DateTimeFormat("en-u-ca-persian",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:"UTC"}).formatToParts(dt);
    const p=Object.fromEntries(parts.filter(x=>x.type!=="literal").map(x=>[x.type,x.value]));
    return p.year+"/"+p.month+"/"+p.day;
  }
  function jalaliToGregorianText(value) {
    const raw=String(value||"").trim().replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replaceAll("-","/");
    const m=raw.match(/^(13|14)\d{2}\\/(\d{1,2})\\/(\d{1,2})$/);
    if (!m) return raw;
    let jy=Number(m[1]), jm=Number(m[2]), jd=Number(m[3]);
    if (jm<1||jm>12||jd<1||jd>31) return raw;
    jy += 1595;
    let days = -355668 + 365*jy + Math.floor(jy/33)*8 + Math.floor(((jy%33)+3)/4) + jd + (jm<7?(jm-1)*31:(jm-7)*30+186);
    let gy = 400*Math.floor(days/146097); days%=146097;
    if(days>36524){gy+=100*Math.floor(--days/36524);days%=36524;if(days>=365)days++;}
    gy += 4*Math.floor(days/1461); days%=1461;
    if(days>365){gy+=Math.floor((days-1)/365);days=(days-1)%365;}
    let gd=days+1;
    const leap=(gy%4===0&&gy%100!==0)||gy%400===0;
    const monthDays=[0,31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
    let gm=1; while(gm<=12&&gd>monthDays[gm]){gd-=monthDays[gm];gm++;}
    return String(gy)+"-"+String(gm).padStart(2,"0")+"-"+String(gd).padStart(2,"0");
  }
  function dateText(value) {
    if (!value) return "—";
    const raw = String(value).trim();
    const jalali = raw.match(/^(13|14)\d{2}[/-](\d{1,2})[/-](\d{1,2})$/);
    if (jalali) return fa(raw.replaceAll("-","/").split("/").map((part,i)=>i===0?part:part.padStart(2,"0")).join("/"));
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
      .kj-table-wrap{overflow:auto;background:white;border:1px solid var(--kj-border);border-radius:12px}table{border-collapse:collapse;width:100%;min-width:650px}th,td{text-align:right;padding:8px 9px;border:1px solid #e6ddd4;vertical-align:top}th{background:#faf7f3;color:#5b443c;white-space:nowrap;font-weight:700}td{white-space:normal}tr:last-child td{border-bottom:1px solid #e6ddd4}.kj-khadem-table table{min-width:1080px}.kj-khadem-table th,.kj-khadem-table td{padding:7px 8px}.kj-profile-details{display:block}.kj-profile-details .kj-profile-grid{display:flex;flex-direction:column;gap:0}.kj-profile-details .kj-field{display:grid;grid-template-columns:minmax(150px,230px) minmax(0,1fr);gap:12px;border:0;border-bottom:1px solid #e6ddd4;border-radius:0;padding:8px 4px}.kj-profile-details .kj-field b{margin:0;font-size:13px}
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
      .kj-hero{background:#e6f7f1;border:1px solid #d3eee5;border-radius:20px;padding:26px;margin-bottom:20px}
      .kj-hero-kicker{font-size:12px;color:#74a99b;font-weight:700;margin-bottom:8px}
      .kj-hero h1{font-size:25px;color:#244b45;margin:0 0 8px}
      .kj-hero p{max-width:780px;color:#718580;line-height:2;margin:0}
      .kj-hero-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}
      .kj-section-title{font-size:17px;color:#244b45;margin:18px 0 12px}
      .kj-stats-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
      .kj-shortcuts-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px}
      .kj-shortcut-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
      .kj-shortcut-card{display:flex;flex-direction:column;align-items:flex-start;text-align:right;gap:8px;min-height:165px;padding:17px;background:#fff;border:1px solid var(--kj-border);border-radius:16px;box-shadow:0 5px 18px #244b4506;color:var(--kj-ink)}
      .kj-shortcut-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:#e5f5ef;font-size:19px}
      .kj-shortcut-card strong{font-size:13px}.kj-shortcut-card small{font-size:11px;color:var(--kj-muted);line-height:1.7}
      .kj-shortcut-card b{margin-top:auto;color:#137c68;font-size:13px}
      .kj-shortcut-card:hover{border-color:#b4dfd3;background:#fcfffd}
      @media(max-width:1000px){.kj-shortcut-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(max-width:700px){.kj-hero{padding:18px}.kj-hero h1{font-size:20px}.kj-stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.kj-shortcut-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.kj-shortcuts-head{align-items:flex-start;flex-direction:column}}
      @media(max-width:390px){.kj-shortcut-grid{grid-template-columns:1fr}.kj-hero-actions button{width:100%}}
      .kj-content-wrap{min-width:0}
      @media(max-width:850px){.kj-layout{grid-template-columns:1fr;padding:10px;gap:10px}.kj-sidebar{position:static;max-height:none;padding:10px}.kj-top{padding:10px 12px}.kj-brand{font-size:15px}.kj-nav{display:block}.kj-menu-group.open .kj-group-items{grid-template-columns:repeat(2,minmax(0,1fr))}.kj-group-items button{font-size:13px;padding:8px}.kj-side-foot{display:none}}
      @media(max-width:420px){.kj-menu-group.open .kj-group-items{grid-template-columns:1fr}.kj-top .kj-actions{gap:5px}.kj-top .kj-actions button{padding:7px 9px}}
    `;

    /* بازطراحی بصری سازمانی v2: هویت بصری تازه و متمایز */
    style.textContent += `
      :root{--kj-green-deep:#103f35;--kj-green:#167a63;--kj-green-light:#e7f5ef;--kj-canvas:#f4f7f6;--kj-line:#e0e9e5;--kj-text:#203a34}
      body{background:var(--kj-canvas);color:var(--kj-text);font-family:Tahoma,"Segoe UI",Arial,sans-serif}
      .kj-shell{background:var(--kj-canvas)}
      .kj-top{background:linear-gradient(110deg,#103f35 0%,#176c58 60%,#23876c 100%);color:#fff;border:0;padding:16px 26px;box-shadow:0 6px 22px #103f351f}
      .kj-brand,.kj-top .kj-small{color:#fff!important}
      .kj-brand{font-size:19px;letter-spacing:-.25px}
      .kj-top small{color:#d2eee4!important;margin-top:5px}
      .kj-top .kj-secondary{background:#ffffff18;color:#fff;border:1px solid #ffffff45;border-radius:11px}
      .kj-top .kj-secondary:hover{background:#ffffff28}
      .kj-layout{grid-template-columns:270px minmax(0,1fr);gap:22px;max-width:1720px;padding:22px}
      .kj-sidebar{background:#123f36;color:#e8f5f0;border:1px solid #1b5b4e;border-radius:20px;padding:14px;top:18px;max-height:calc(100vh - 36px);box-shadow:0 10px 30px #123f3614}
      .kj-side-search{background:#1b5146;color:#fff;border:1px solid #397265;border-radius:12px}
      .kj-side-search::placeholder{color:#b7d5cc}
      .kj-menu-group{border-top:1px solid #ffffff16}
      .kj-group-toggle{color:#b9d9cf}
      .kj-group-toggle:after{color:#b9d9cf}
      .kj-nav button{background:transparent;color:#d4e8e1;border:1px solid transparent;border-radius:11px;padding:10px 11px}
      .kj-nav button:hover{background:#ffffff0e;color:#fff}
      .kj-nav button.active{background:#e1f4eb;color:#115543;border-color:#e1f4eb;box-shadow:inset -3px 0 #6ac6a6}
      .kj-side-foot{color:#b5d4ca;border-color:#ffffff1c}
      .kj-content-wrap{min-width:0}
      .kj-main{padding:0}
      .kj-hero{position:relative;overflow:hidden;background:linear-gradient(115deg,#e7f6ef 0%,#f8fcfa 72%);border:1px solid #d7ebe2;border-radius:22px;padding:30px;margin-bottom:22px;box-shadow:0 8px 28px #214c3e08}
      .kj-hero:after{content:"";position:absolute;left:-45px;bottom:-100px;width:250px;height:250px;border:34px solid #cceade66;border-radius:50%;pointer-events:none}
      .kj-hero-kicker{color:#167a63;text-transform:none;font-size:12px;letter-spacing:.2px}
      .kj-hero h1{font-size:28px;color:#103f35;line-height:1.7}
      .kj-hero p{color:#547168;max-width:760px}
      .kj-primary,.kj-button{background:linear-gradient(110deg,#126c57,#1b8a6c);border-radius:11px;box-shadow:0 4px 10px #167a6320}
      .kj-secondary{border-color:#dce8e3;border-radius:11px;color:#285348}
      .kj-card{border:1px solid var(--kj-line);border-radius:17px;box-shadow:0 6px 22px #1c493b08;background:#fff}
      .kj-stat{color:#167a63}
      .kj-pill{background:#e4f5ed;color:#14684f}
      .kj-table-wrap{border-color:var(--kj-line);border-radius:15px;box-shadow:0 5px 18px #1c493b05}
      th{background:#f0f7f3;color:#365f52}
      td{border-bottom-color:#edf2ef}
      .kj-page-title{color:#153f35;font-size:24px;margin-bottom:18px}
      .kj-section-title{color:#153f35;font-size:17px}
      .kj-shortcut-card{border-color:#e0ebe6;border-radius:17px;box-shadow:0 6px 20px #1c493b07;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}
      .kj-shortcut-card:hover{transform:translateY(-2px);border-color:#9ed6c2;box-shadow:0 10px 24px #1c493b12}
      .kj-shortcut-icon{background:#e5f5ee;color:#14694f}
      .kj-shortcut-card b{color:#167a63}
      .kj-footer{padding:22px;color:#718b81}
      .kj-error{border-radius:13px}
      .kj-mobile-menu-toggle{display:none}
      @media(max-width:850px){
        .kj-layout{grid-template-columns:1fr;padding:12px;gap:12px}
        .kj-sidebar{display:none;position:static;max-height:none;border-radius:16px}
        .kj-sidebar.kj-mobile-open{display:block}
        .kj-mobile-menu-toggle{display:inline-flex;align-items:center;gap:6px}
        .kj-nav button.active{box-shadow:inset -3px 0 #6ac6a6}
        .kj-hero{padding:22px}
        .kj-hero h1{font-size:22px}
      }
      @media(max-width:520px){
        .kj-top{padding:13px 15px}
        .kj-layout{padding:9px}
        .kj-hero{padding:18px;border-radius:17px}
        .kj-hero h1{font-size:20px}
      }
      /* داشبورد سازمانی فارسی: سلسله‌مراتب بصری، فضای تنفس و کارت‌های خوانا */
      .kj-hero-enterprise{display:flex;align-items:center;justify-content:space-between;gap:24px;min-height:250px;padding:32px 36px;background:radial-gradient(circle at 12% 15%,#d4efe4 0,transparent 33%),linear-gradient(115deg,#f8fcfa 0%,#e7f5ee 100%);border-color:#d5e9df}
      .kj-hero-copy{position:relative;z-index:1;max-width:820px}.kj-hero-kicker{display:flex;align-items:center;gap:9px;color:#287c64;font-weight:700;margin-bottom:12px}
      .kj-live-dot{width:8px;height:8px;border-radius:50%;background:#20a477;box-shadow:0 0 0 4px #20a47720}
      .kj-hero-enterprise h1{font-size:30px;letter-spacing:-.5px;margin-bottom:2px}.kj-hero-subtitle{font-size:15px!important;color:#287c64!important;font-weight:700;margin:0 0 10px!important}
      .kj-hero-enterprise p:not(.kj-hero-subtitle){max-width:700px}.kj-hero-emblem{flex:0 0 190px;min-height:160px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;border:1px solid #cde6da;border-radius:24px;background:#ffffff85;color:#17664f}
      .kj-hero-emblem span{font-size:64px;filter:drop-shadow(0 8px 10px #165b441c)}.kj-hero-emblem small{font-size:11px;font-weight:700;color:#4f8272}
      .kj-section-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin:24px 0 12px}.kj-section-heading .kj-section-title{margin:2px 0 0}
      .kj-section-eyebrow{font-size:11px;font-weight:700;color:#7a9389;letter-spacing:.2px}.kj-data-note{font-size:11px;color:#82948d;background:#fff;border:1px solid #e2ebe6;border-radius:20px;padding:5px 10px}
      .kj-stats-grid{gap:14px}.kj-stat-card{position:relative;overflow:hidden;padding:18px 19px;min-height:142px;transition:transform .18s ease,box-shadow .18s ease}
      .kj-stat-card:after{content:"";position:absolute;left:-24px;bottom:-42px;width:95px;height:95px;border-radius:50%;background:#e6f4ed;opacity:.8}
      .kj-stat-top{display:flex;align-items:center;gap:10px;position:relative;z-index:1}.kj-stat-icon{display:grid;place-items:center;width:40px;height:40px;flex:0 0 40px;border-radius:13px;background:#e6f5ee;font-size:19px}
      .kj-stat-label{font-size:12px;color:#5f7770;font-weight:700}.kj-stat-card .kj-stat{font-size:31px;line-height:1.4;margin:9px 0 2px;position:relative;z-index:1}
      .kj-stat-foot{font-size:10px;color:#94a49e;position:relative;z-index:1}.kj-stat-card:hover{transform:translateY(-2px);box-shadow:0 10px 26px #1c493b12}
      .kj-shortcuts-head{margin-top:27px}.kj-shortcut-grid{gap:14px}.kj-shortcut-card{min-height:175px;padding:18px;position:relative;overflow:hidden}
      .kj-shortcut-card strong{font-size:14px;color:#24483e}.kj-shortcut-card small{font-size:12px}.kj-shortcut-card b{display:flex;align-items:center;justify-content:space-between;width:100%;border-top:1px solid #edf2ef;padding-top:10px;font-size:11px}
      .kj-shortcut-icon{width:42px;height:42px;border-radius:14px}.kj-recent-card{margin-top:22px!important;padding:20px}.kj-card-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
      .kj-card-heading h3{margin:2px 0 0;font-size:17px;color:#23483d}.kj-heading-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:#f0f7f3;font-size:20px}
      .kj-guide-card{display:flex;align-items:flex-start;gap:13px;margin-top:14px!important;background:#f8fbf9;border-style:dashed;box-shadow:none}.kj-guide-card h3{margin:0 0 5px;color:#285548;font-size:14px}.kj-guide-card p{margin:4px 0}.kj-guide-icon{display:grid;place-items:center;flex:0 0 32px;height:32px;border-radius:10px;background:#e5f4ed;color:#26795f;font-weight:bold}
      .kj-loading-card{display:flex;align-items:center;gap:12px;margin-bottom:14px;color:#58766b}.kj-spinner{width:18px;height:18px;border:2px solid #cce4d8;border-top-color:#167a63;border-radius:50%;animation:kj-spin .8s linear infinite}
      @keyframes kj-spin{to{transform:rotate(360deg)}}
      .kj-login-wrap{background:radial-gradient(ellipse at 50% 0%,#e1f2e9 0%,#f3f7f5 52%,#edf2ef 100%)}
      .kj-login-card{border-radius:24px;border-color:#deebe4;box-shadow:0 24px 70px #143e3015;padding:32px}
      .kj-login-card h1{color:#103f35;line-height:1.7}.kj-login-card .kj-muted{color:#688279}
      .kj-login-card input{border-color:#dce8e2;border-radius:12px;padding:13px 14px}.kj-login-card input:focus{border-color:#4eaa89;box-shadow:0 0 0 4px #4eaa891c}
      .kj-login-card .kj-primary{min-height:48px;border-radius:12px;box-shadow:0 6px 15px #167a6326}
      @media(max-width:850px){.kj-hero-enterprise{padding:22px;gap:12px}.kj-hero-emblem{flex-basis:130px;min-height:130px}.kj-hero-emblem span{font-size:48px}}
      @media(max-width:650px){.kj-hero-enterprise{display:block}.kj-hero-emblem{display:none}.kj-hero-enterprise h1{font-size:23px}.kj-section-heading{align-items:flex-start;flex-direction:column}.kj-data-note{display:none}.kj-stat-card{min-height:125px;padding:13px}.kj-stat-card .kj-stat{font-size:25px}.kj-stat-icon{width:34px;height:34px;flex-basis:34px}.kj-shortcut-card{min-height:158px;padding:14px}}
    `;
    /* رفع نمایش نیمه‌کاره صفحات زیرمنو: ناحیه محتوا باید تمام فضای قابل استفاده را بگیرد */
    style.textContent += `
      .kj-shell{width:100%!important;max-width:none!important;min-height:100vh;min-height:100dvh}
      .kj-layout{width:100%!important;max-width:none!important;grid-template-columns:270px minmax(0,1fr)!important;align-items:start}
      .kj-content-wrap{display:block;width:100%;max-width:none;min-width:0}
      #kj-main.kj-main{display:block;width:100%;max-width:none;min-width:0;min-height:calc(100vh - 160px);padding:0}
      #kj-main>.kj-page-title{width:100%;margin:0 0 20px;padding:0 0 14px}
      #kj-main>.kj-card,#kj-main>.kj-table-wrap,#kj-main>.kj-grid,#kj-main>.kj-profile-grid{width:100%;max-width:none}
      #kj-main>.kj-card{margin-bottom:16px}
      #kj-main .kj-table-wrap{max-width:100%}
      #kj-main .kj-grid{width:100%}
      @media(max-width:850px){
        .kj-layout{grid-template-columns:minmax(0,1fr)!important}
        .kj-content-wrap{width:100%;min-width:0}
        #kj-main.kj-main{min-height:calc(100dvh - 130px);width:100%;padding:0}
      }
    `;
    /* اصلاح نهایی اندازه کادر داخلی: محتوای هر زیرمنو باید کل فضای باقی‌مانده را پر کند */
    style.textContent += `
      html,body,#app{width:100%;max-width:100%;margin:0}
      .kj-shell{width:100%!important;max-width:none!important;margin:0!important;min-height:100vh;min-height:100dvh}
      .kj-layout{display:grid!important;width:100%!important;max-width:none!important;margin:0!important;grid-template-columns:278px minmax(0,1fr)!important;gap:20px;padding:20px!important;align-items:stretch}
      .kj-content-wrap{width:100%!important;max-width:none!important;min-width:0!important;flex:1 1 auto}
      #kj-main.kj-main{display:block!important;width:100%!important;max-width:none!important;min-width:0!important;min-height:calc(100vh - 150px);padding:0!important;margin:0!important}
      #kj-main>*{max-width:none!important;box-sizing:border-box}
      #kj-main>.kj-page-title{width:100%!important}
      #kj-main .kj-card,#kj-main .kj-table-wrap,#kj-main .kj-grid,#kj-main .kj-profile-grid{max-width:100%!important}
      #kj-main .kj-table-wrap{width:100%!important;overflow-x:auto}
      #kj-main form,#kj-main .kj-toolbar{max-width:100%!important}
      .kj-footer{width:100%;max-width:none}
      @media(max-width:850px){
        .kj-layout{grid-template-columns:minmax(0,1fr)!important;width:100%!important;padding:10px!important;gap:10px!important}
        .kj-sidebar{width:100%;max-width:100%}
        .kj-content-wrap,#kj-main.kj-main{width:100%!important;max-width:none!important;min-width:0!important}
        #kj-main.kj-main{min-height:calc(100dvh - 120px)}
      }
    `;

    /* هویت بصری ممتاز v10 — بازطراحی محسوس با سرمه‌ای عمیق، طلایی گرم و سطوح روشن */
    style.textContent += `
      :root{--kj-green-deep:#10283f;--kj-green:#173b58;--kj-green-light:#edf3f8;--kj-canvas:#f3f5f8;--kj-line:#e0e5ed;--kj-text:#1c3045;--kj-gold:#c6a66a}
      body{background:var(--kj-canvas);color:var(--kj-text);font-family:Tahoma,"Segoe UI",Arial,sans-serif}
      .kj-shell,.kj-shell *{letter-spacing:0}
      .kj-shell{background:linear-gradient(180deg,#f6f7fa 0%,#eef2f6 100%)}
      .kj-top{background:linear-gradient(112deg,#0c2035 0%,#173b58 64%,#24516b 100%);padding:17px 28px;box-shadow:0 8px 28px #10283f25;border-bottom:1px solid #c6a66a}
      .kj-brand{font-size:19px;font-weight:800;color:#fff!important}
      .kj-brand:before{content:"";display:inline-block;width:4px;height:30px;background:linear-gradient(#e6d3a2,#b58b43);border-radius:5px;vertical-align:middle;margin-left:12px}
      .kj-top small{color:#d8e3eb!important;font-size:11px}
      .kj-top .kj-small{color:#eef4f8!important}
      .kj-top .kj-secondary{background:#ffffff12;border:1px solid #ffffff38;color:#fff;border-radius:10px;box-shadow:none}
      .kj-top .kj-secondary:hover{background:#ffffff22}
      .kj-layout{max-width:1800px;grid-template-columns:278px minmax(0,1fr);gap:24px;padding:24px}
      .kj-sidebar{background:linear-gradient(180deg,#10283f 0%,#163951 100%);border:1px solid #24465e;border-radius:18px;padding:14px;box-shadow:0 12px 30px #122c4318;top:18px}
      .kj-side-search{background:#193a53;border-color:#34556b;color:#fff;border-radius:10px}
      .kj-side-search::placeholder{color:#b4c5d2}
      .kj-menu-group{border-color:#ffffff16}
      .kj-group-toggle{color:#bfcfda;font-size:11px;letter-spacing:.15px}
      .kj-group-toggle:after{color:#c6a66a}
      .kj-nav button{color:#dce6ed;border-radius:10px;padding:10px 12px;background:transparent;border:1px solid transparent;transition:background .16s ease,color .16s ease}
      .kj-nav button:hover{background:#ffffff10;color:#fff}
      .kj-nav button.active{background:#f8f5ee;color:#173b58;border-color:#c6a66a;box-shadow:inset -3px 0 #c6a66a;font-weight:800}
      .kj-side-foot{color:#b7c8d4;border-color:#ffffff20}
      .kj-hero{border-radius:20px}
      .kj-hero-enterprise{min-height:255px;padding:34px 38px;background:radial-gradient(circle at 8% 10%,#e7d9b84a 0,transparent 29%),linear-gradient(115deg,#fff 0%,#eef3f7 68%,#e5edf3 100%);border:1px solid #dbe3eb;box-shadow:0 12px 32px #18344d0b}
      .kj-hero:after{border-color:#c6a66a20}
      .kj-hero-kicker{color:#99783d}
      .kj-live-dot{background:#2d9679;box-shadow:0 0 0 4px #2d96791d}
      .kj-hero-enterprise h1{font-size:30px;color:#10283f;font-weight:800;line-height:1.7}
      .kj-hero-subtitle{color:#8c6d34!important}
      .kj-hero p:not(.kj-hero-subtitle){color:#627589}
      .kj-hero-emblem{background:#ffffffbd;border:1px solid #d8c79f;border-radius:20px;color:#173b58;box-shadow:0 8px 24px #10283f0b}
      .kj-hero-emblem span{filter:none}
      .kj-hero-emblem small{color:#8c6d34}
      .kj-primary,.kj-button{background:linear-gradient(115deg,#173b58,#245975);border:1px solid #173b58;border-radius:10px;box-shadow:0 5px 13px #173b5825}
      .kj-primary:hover,.kj-button:hover{filter:brightness(1.08)}
      .kj-secondary{border:1px solid #d8e0e8;background:#fff;color:#28465e;border-radius:10px}
      .kj-main .kj-page-title{color:#10283f;font-weight:800;font-size:24px;padding-bottom:12px;border-bottom:1px solid #dce3eb}
      .kj-section-title{color:#173b58;font-weight:800}
      .kj-section-eyebrow{color:#9a7a40}
      .kj-card{border:1px solid #e0e6ed;border-radius:15px;box-shadow:0 7px 24px #1c344b08}
      .kj-stat-card{min-height:145px;padding:20px;border-top:3px solid #c6a66a}
      .kj-stat-card:after{background:#edf2f7}
      .kj-stat-icon,.kj-shortcut-icon{background:#edf2f7;color:#244e6a}
      .kj-stat-label{color:#65798a}
      .kj-stat-card .kj-stat{color:#173b58;font-size:32px}
      .kj-stat-foot{color:#8b9aa7}
      .kj-shortcut-card{border-color:#e0e6ed;border-radius:15px;box-shadow:0 7px 22px #1c344b08}
      .kj-shortcut-card:hover{background:#fff;border-color:#c6a66a;box-shadow:0 12px 26px #1c344b12}
      .kj-shortcut-card strong{color:#173b58}
      .kj-shortcut-card b{color:#8b6c35;border-color:#edf0f4}
      .kj-pill{background:#edf2f7;color:#244e6a}
      .kj-link{color:#245975}
      .kj-table-wrap{border-radius:14px;border-color:#dfe6ed;box-shadow:0 6px 20px #1c344b06}
      th{background:#edf2f7;color:#27475e;border-bottom:1px solid #dfe6ed}
      td{border-bottom-color:#edf0f4}
      tbody tr:hover{background:#f8fafc}
      .kj-field{border-color:#e6ebf0;background:#fbfcfd}
      .kj-field b{color:#718294}
      .kj-recent-card{border-top:3px solid #c6a66a}
      .kj-heading-icon{background:#edf2f7}
      .kj-guide-card{background:#f8fafc;border-color:#d9e3eb}
      .kj-guide-icon{background:#eaf1f6;color:#244e6a}
      .kj-footer{color:#8190a0}
      .kj-login-wrap{background:radial-gradient(ellipse at 50% 0%,#e5edf4 0%,#f3f5f8 55%,#e9eef3 100%)}
      .kj-login-card{border:1px solid #dce4ec;border-radius:22px;box-shadow:0 24px 70px #10283f18}
      .kj-login-card h1{color:#10283f;font-weight:800}
      .kj-login-card .kj-muted{color:#8c6d34}
      .kj-login-card input{border-color:#d9e2eb}
      .kj-login-card input:focus{border-color:#9e824a;box-shadow:0 0 0 4px #c6a66a25}
      .kj-login-card .kj-primary{background:linear-gradient(115deg,#10283f,#245975);border:0}
      .kj-alert,.kj-error{border-radius:12px}
      @media(max-width:850px){
        .kj-layout{padding:12px;gap:12px}
        .kj-sidebar{background:linear-gradient(180deg,#10283f,#163951)}
        .kj-hero-enterprise{padding:23px}
        .kj-hero-enterprise h1{font-size:24px}
        .kj-top{padding:13px 15px}
      }
      @media(max-width:600px){
        .kj-hero-enterprise{padding:18px}
        .kj-hero-enterprise h1{font-size:21px}
        .kj-main .kj-page-title{font-size:20px}
        .kj-stat-card{border-top-width:2px}
        .kj-stat-card .kj-stat{font-size:25px}
      }
      @media(prefers-reduced-motion:reduce){.kj-shortcut-card,.kj-nav button,.kj-stat-card{transition:none!important}}
    `;
  }

  function shell() {
    const app = ensureRoot();
    const user = (() => { try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch (_) { return null; } })();
    const groups = [
      ["میزکار مدیریتی", [["dashboard","🏠 داشبورد"]]],
      ["مدیریت خادمین", [["khadems","👤 بانک خادمین"]]],
      ["خدمت و عملیات", [["services","🕌 خدمت و سوابق خدمت"],["friday","🌙 پایش خدمت شب جمعه"],["nonattendance","🧾 عدم حضور و پیگیری"],["deployments","🚐 مأموریت‌های خدمت"]]],
      ["جلسات و حضور و غیاب", [["meetings","👥 جلسات و حضور و غیاب"]]],
      ["امور مالی و پشتیبانی", [["finance","💰 امور مالی و شهریه"],["fund","🏦 خزانه و صندوق"],["donors","🤝 نیکوکاران و خیرین"],["equipment","👕 البسه، تجهیزات و ناوگان"]]],
      ["گزارش‌ها و کنترل", [["reports","📊 گزارش‌ها و تحلیل"],["audit","📁 سوابق فعالیت و ممیزی"]]],
      ["مدیریت سامانه", [["users","🧩 کاربران و دسترسی‌ها"],["settings","⚙️ تنظیمات سامانه"]]]
    ];
    app.innerHTML = `
      <div class="kj-shell" dir="rtl">
        <header class="kj-top">
          <div class="kj-brand">🕌 سامانه جامع مدیریت خادمین<small>مرکز مدیریت و عملیات</small></div>
          <div class="kj-actions"><button type="button" class="kj-secondary kj-mobile-menu-toggle" id="kj-mobile-menu-toggle" aria-expanded="false">☰ منو</button><span class="kj-small">${esc(user?.email || user?.user_metadata?.name || "کاربر سامانه")}</span><button class="kj-secondary" id="kj-refresh">به‌روزرسانی اطلاعات</button><button class="kj-secondary" id="kj-signout">خروج ←</button></div>
        </header>
        <div class="kj-layout">
          <aside class="kj-sidebar" aria-label="منوی سامانه">
            <input class="kj-side-search" id="kj-menu-search" type="search" placeholder="جست‌وجوی منو و زیرمنو…" aria-label="جست‌وجوی منو و زیرمنو">
            <nav class="kj-nav" aria-label="منوی اصلی">
              ${groups.map(([title,items],i)=>`<section class="kj-menu-group open">
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
      const nextTab = b.dataset.tab;
      if (!nextTab) return;
      state.tab = nextTab;
      state.selectedKhadem = null;
      $$(".kj-nav [data-tab]").forEach(n => {
        n.classList.toggle("active", n === b);
        if (n === b) n.setAttribute("aria-current", "page");
        else n.removeAttribute("aria-current");
      });
      const group = b.closest(".kj-menu-group");
      if (group) {
        group.classList.add("open");
        group.querySelector(".kj-group-toggle")?.setAttribute("aria-expanded", "true");
      }
      if (window.location.hash !== "#" + nextTab) {
        history.replaceState(null, "", window.location.pathname + window.location.search + "#" + nextTab);
      }
      // در موبایل منو بسته شود تا صفحه انتخاب‌شده از ابتدای ناحیه محتوا دیده شود.
      render();
      if (window.matchMedia("(max-width: 850px)").matches) {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
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
    $("#kj-mobile-menu-toggle").addEventListener("click", () => {
      const sidebar = $(".kj-sidebar");
      if (!sidebar) return;
      const open = !sidebar.classList.contains("kj-mobile-open");
      sidebar.classList.toggle("kj-mobile-open", open);
      $("#kj-mobile-menu-toggle").setAttribute("aria-expanded", open ? "true" : "false");
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
  function activeLabel(k) { const v=val(k,["is_active","active","status"]); if(v===true||["true","1","active","فعال","enabled"].includes(String(v).toLowerCase())) return "فعال"; if(v===false||["false","0","inactive","غیرفعال","disabled"].includes(String(v).toLowerCase())) return "غیرفعال"; return "نامشخص"; }
  function khademId(k) { return val(k, ["id", "khadem_id"]); }
  function fieldLabel(key) {
    const labels = {
      id:"شناسه داخلی", khadem_id:"شناسه خادم", person_id:"شناسه شخص", personnel_id:"شناسه پرسنلی",
      khadem_code:"کد خادم", personnel_code:"کد خادم", code:"کد", full_name:"نام و نام خانوادگی", name:"نام",
      first_name:"نام", last_name:"نام خانوادگی", family:"نام خانوادگی", family_name:"نام خانوادگی", father_name:"نام پدر",
      national_code:"کد ملی", national_id:"کد ملی", phone:"تلفن همراه", mobile:"تلفن همراه", phone_number:"شماره تماس", email:"ایمیل",
      triple_name:"نام سه‌گانه", tri_name:"نام سه‌گانه", membership_date:"تاریخ عضویت",
      birth_date:"تاریخ تولد", address:"نشانی", residence:"محل سکونت", status:"وضعیت", active:"فعال", is_active:"وضعیت فعالیت",
      primary_responsibility:"مسئولیت اصلی", job:"شغل", occupation:"شغل", blood_type:"گروه خونی", medical_history:"سوابق پزشکی",
      skills:"مهارت‌ها", education_level:"سطح تحصیلات", marital_status:"وضعیت تأهل", education:"تحصیلات",
      emergency_contact_name:"نام تماس اضطراری", emergency_contact_phone:"تلفن تماس اضطراری",
      emergency_contact_name_2:"نام تماس اضطراری دوم", emergency_contact_name_3:"نام تماس اضطراری سوم",
      emergency_contact_phone_2:"تلفن تماس اضطراری دوم", emergency_contact_phone_3:"تلفن تماس اضطراری سوم",
      created_at:"تاریخ ثبت", updated_at:"آخرین به‌روزرسانی", notes:"توضیحات", description:"شرح", title:"عنوان",
      service_date:"تاریخ خدمت", date:"تاریخ", service_type:"نوع خدمت", service_kind:"نوع خدمت", category:"دسته‌بندی",
      amount:"مبلغ", amount_toman:"مبلغ (تومان)", total_amount:"مبلغ کل", total_amount_toman:"مبلغ کل",
      paid_amount:"مبلغ پرداخت‌شده", paid_toman:"مبلغ پرداخت‌شده", balance:"مانده", debt:"بدهی",
      remaining_amount:"مانده بدهی", remaining_toman:"مانده بدهی", cost_total_toman:"هزینه کل", cost_paid_toman:"هزینه پرداخت‌شده",
      transaction_type:"نوع تراکنش", type:"نوع", paid_date:"تاریخ پرداخت", transaction_date:"تاریخ تراکنش",
      meeting_date:"تاریخ جلسه", meeting_title:"عنوان جلسه", meeting_type:"نوع جلسه", meeting_id:"شناسه جلسه",
      deployment_date:"تاریخ مأموریت", responsibility:"مسئولیت", role:"نقش", reason:"توضیحات",
      reason_code:"علت", resolution_status:"وضعیت پیگیری", invitee_count:"تعداد مدعوین", present_count:"تعداد حاضران", absent_count:"تعداد غایبان",
      service_count:"تعداد سوابق خدمت", main_service_count:"تعداد خدمات اصلی", friday_service_count:"تعداد خدمات شب جمعه",
      service_days:"روزهای خدمت", total_service_days:"مجموع روزهای خدمت", extra_data:"اطلاعات تکمیلی",
      tuition_exempt:"معافیت از شهریه", period_month:"دوره شهریه", due_date:"تاریخ سررسید", payment_date:"تاریخ پرداخت",
      installment_number:"شماره قسط", item_key:"شرح قلم", quantity:"تعداد", unit_cost_toman:"قیمت واحد", total_cost_toman:"مبلغ کل",
      vehicle_type:"نوع وسیله نقلیه", model:"مدل", plate_number:"شماره پلاک", capacity:"ظرفیت", driver_name:"نام راننده",
      issue_status:"وضعیت تحویل", issue_date:"تاریخ تحویل", received_date:"تاریخ دریافت", received_from:"دریافت از",
      reference_no:"شماره مرجع", payment_method:"روش پرداخت", display_name:"نام نمایشی", role_key:"شناسه نقش",
      is_system:"نقش سیستمی", permission_key:"شناسه مجوز", permission_id:"شناسه مجوز", role_id:"شناسه نقش",
      actor_user_id:"شناسه کاربر", action:"عملیات", module_key:"بخش", record_id:"شناسه رکورد",
      key:"کلید تنظیم", setting_key:"کلید تنظیم", label:"عنوان", config_key:"کلید پیکربندی",
      tuition_due:"بدهی شهریه", amount_paid:"مبلغ پرداخت‌شده", refund_amount_toman:"مبلغ بازپرداخت",
      issue_id:"شناسه تحویل", receipt_id:"شناسه رسید", amount_toman:"مبلغ (تومان)", paid_date:"تاریخ پرداخت",
      due_date:"سررسید", period_month:"دوره", attendance_status:"وضعیت حضور", invite_status:"وضعیت دعوت",
      service_name:"عنوان خدمت", service_status:"وضعیت خدمت", service_days_count:"تعداد روزهای خدمت",
      total_service_count:"مجموع سوابق خدمت", friday_service_days:"روزهای خدمت شب جمعه", main_service_days:"روزهای خدمت اصلی"
    };
    const extraLabels = {
      income:"درآمد", expense:"هزینه", expenses:"هزینه‌ها", revenue:"درآمد", deposit:"واریز", withdrawal:"برداشت",
      debit:"بدهکار", credit:"بستانکار", amount_due:"مبلغ بدهی", due_amount:"مبلغ سررسید", total_paid:"مجموع پرداختی",
      payer_name:"نام پرداخت‌کننده", recipient_name:"نام دریافت‌کننده", donor_name:"نام نیکوکار", fund_name:"عنوان صندوق",
      fund_type:"نوع صندوق", source:"منبع", destination:"مقصد", receipt_number:"شماره رسید", invoice_number:"شماره فاکتور",
      transaction_id:"شناسه تراکنش", user_id:"شناسه کاربر", username:"نام کاربری", last_sign_in_at:"آخرین ورود",
      permission_name:"نام مجوز", role_name:"نام نقش", module_name:"نام بخش", event_type:"نوع رویداد",
      error_message:"شرح خطا", message:"پیام", details:"جزئیات", metadata:"اطلاعات تکمیلی",
      count:"تعداد", total:"مجموع", average:"میانگین", start_date:"تاریخ شروع", end_date:"تاریخ پایان",
      reason_for_absence:"علت عدم حضور", absence_reason:"علت عدم حضور", exemption_reason:"علت معافیت",
      tuition_status:"وضعیت شهریه", payment_status:"وضعیت پرداخت", transaction_status:"وضعیت تراکنش",
      created_by:"ثبت‌کننده", updated_by:"آخرین ویرایش‌کننده", table_name:"نام جدول", field_name:"نام فیلد",
      amount_toman:"مبلغ (تومان)", total_amount_toman:"مبلغ کل", paid_toman:"مبلغ پرداخت‌شده",
      remaining_toman:"مانده بدهی", refund_amount_toman:"مبلغ بازپرداخت", vehicle_type:"نوع وسیله نقلیه",
      attendance_id:"شناسه حضور", deployment_id:"شناسه مأموریت", service_record_id:"شناسه سابقه خدمت"
    };
    return labels[key] || extraLabels[key] || "اطلاعات تکمیلی";
  }
  function translateValue(value) {
    const translations = {
      active:"فعال", inactive:"غیرفعال", pending:"در انتظار پرداخت", paid:"پرداخت‌شده", unpaid:"پرداخت‌نشده",
      present:"حاضر", absent:"غایب", excused:"با عذر", invited:"دعوت‌شده", confirmed:"تأییدشده",
      cancelled:"لغوشده", canceled:"لغوشده", completed:"تکمیل‌شده", rejected:"ردشده", approved:"تأییدشده",
      yes:"بله", no:"خیر", true:"بله", false:"خیر", null:"ثبت‌نشده",
      main:"اصلی", friday:"شب جمعه", service:"خدمت", tuition:"شهریه", installment:"قسط",
      cash:"نقدی", transfer:"انتقال بانکی", card:"کارت‌به‌کارت", other:"سایر", personal:"شخصی",
      car:"خودرو", personal_car:"اتومبیل شخصی", committee_vehicle:"خودروی مجموعه",
      deferred:"معوق", due:"سررسیدشده", open:"باز", closed:"بسته", refunded:"بازپرداخت‌شده",
      male:"مرد", single:"مجرد", married:"متأهل", employee:"کارمند",
      income:"درآمد", incoming:"دریافتی", inflow:"ورودی", revenue:"درآمد", deposit:"واریز",
      expense:"هزینه", expenses:"هزینه‌ها", outgoing:"پرداختی", outflow:"خروجی", debit:"بدهکاری", credit:"بستانکاری", withdrawal:"برداشت",
      donation:"کمک مالی", donation_income:"درآمد کمک‌های مالی", tuition_payment:"پرداخت شهریه",
      tuition_due:"بدهی شهریه", equipment:"تجهیزات", clothing:"البسه", uniform:"لباس فرم",
      fuel:"سوخت", transport:"حمل‌ونقل", salary:"حقوق", fee:"کارمزد", refund:"بازپرداخت",
      cash_payment:"پرداخت نقدی", online_payment:"پرداخت اینترنتی", bank_transfer:"انتقال بانکی",
      draft:"پیش‌نویس", submitted:"ارسال‌شده", processing:"در حال پردازش", failed:"ناموفق",
      success:"موفق", successful:"موفق", enabled:"فعال", disabled:"غیرفعال", unknown:"نامشخص",
      service_record:"سابقه خدمت", meeting:"جلسه", deployment:"مأموریت", fund:"صندوق",
      donor:"نیکوکار", charity:"خیریه", vehicle:"وسیله نقلیه", driver:"راننده",
      service_fee:"هزینه خدمت", membership_fee:"حق عضویت", monthly_tuition:"شهریه ماهانه",
      miscellaneous:"متفرقه", miscellaneous_income:"سایر درآمدها", miscellaneous_expense:"سایر هزینه‌ها",
      operating_expense:"هزینه جاری", equipment_purchase:"خرید تجهیزات", clothing_purchase:"خرید البسه",
      transportation_expense:"هزینه حمل‌ونقل", medical_expense:"هزینه درمان",
      pending_approval:"در انتظار تأیید", needs_review:"نیازمند بررسی", archived:"بایگانی‌شده"
    };
    const raw = String(value);
    const key = raw.trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(translations,key)) return translations[key];
    if (/^[a-z][a-z0-9_ -]*$/i.test(raw) && /[a-z]/i.test(raw)) return "سایر اطلاعات";
    return raw.replaceAll("_"," ");
  }
  function formatValue(key, value) {
    if (value === null || value === undefined || value === "") return "—";
    if (/(date|_at|_date|_month)$/.test(key) || key === "birth_date") return dateText(value);
    if (/(amount|balance|debt|salary|cost|price|paid|refund)/i.test(key) && (typeof value === "number" || /^-?[\d,.]+$/.test(String(value)))) return money(value);
    if (typeof value === "boolean") return value ? "بله" : "خیر";
    if (typeof value === "object") {
      const localize = item => {
        if (Array.isArray(item)) return item.map(localize);
        if (item && typeof item === "object") return Object.fromEntries(Object.entries(item).map(([k,v]) => [fieldLabel(k), localize(v)]));
        return typeof item === "string" ? translateValue(item) : item;
      };
      return JSON.stringify(localize(value), null, 2);
    }
    return translateValue(value);
  }
  function dataFields(row, omit = []) {
    if (!row) return "";
    return `<div class="kj-profile-grid">${Object.entries(row).filter(([k,v]) => !omit.includes(k) && v !== null && v !== "").map(([k,v]) => {
      if (k === "extra_data" && v && typeof v === "object") { const items=Object.entries(v).filter(([,x])=>x!==null&&x!=="").map(([key,value])=>`<div class="kj-field"><b>${esc(fieldLabel(key))}</b><span>${esc(formatValue(key,value))}</span></div>`).join(""); return `<div class="kj-field kj-extra-data"><b>اطلاعات تکمیلی</b><div class="kj-profile-grid">${items || "<span>اطلاعاتی ثبت نشده است</span>"}</div></div>`; }
      return `<div class="kj-field"><b>${esc(fieldLabel(k))}</b><span>${esc(formatValue(k,v))}</span></div>`;
    }).join("")}</div>`;
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
      ["سوابق خدمت", state.services.length, "📋"],
      ["جلسات", state.meetings.length, "👥"],
      ["مأموریت‌ها", state.deployments.length, "🚐"],
      ["تراکنش‌های مالی", state.finance.length + state.tuitionDues.length, "💰"],
      ["خیرین", state.donors.length, "🤝"]
    ];
    const shortcuts = [
      ["khadems","👤","بانک خادمین","پرونده‌ها و اطلاعات خدام"],
      ["services","📋","خدمت رسمی","ثبت و پیگیری سوابق خدمت"],
      ["friday","🌙","خدمت شب‌های جمعه","برنامه و سوابق پایش خدمت"],
      ["meetings","👥","جلسات","جلسات و وضعیت حضور"],
      ["deployments","🚐","مأموریت خدمت","مأموریت‌ها و مسیرها"],
      ["finance","💰","امور مالی","پرداخت‌ها و سوابق ثبت‌شده"],
      ["fund","🏦","خزانه","گردش صندوق و دریافت‌ها"],
      ["donors","🤝","نیکوکاران","فهرست حمایت‌ها"],
      ["equipment","👕","وسایل و تجهیزات","تحویل و پرداخت‌های ثبت‌شده"],
      ["reports","📊","گزارش‌ساز","خلاصه اطلاعات قابل مشاهده"],
      ["users","🧩","کاربران و دسترسی‌ها","نقش‌ها و مجوزهای قابل مشاهده"],
      ["settings","⚙️","مدیریت سامانه","تنظیمات قابل مشاهده"]
    ];
    const latest = [...state.services].sort((a,b)=>String(val(b,["service_date","date","created_at"])).localeCompare(String(val(a,["service_date","date","created_at"])))).slice(0,5);
    return `<section class="kj-hero kj-hero-enterprise">
        <div class="kj-hero-copy"><div class="kj-hero-kicker"><span class="kj-live-dot"></span> میزکار مدیریتی مجموعه</div>
          <h1>سامانه جامع مدیریت خادمین</h1><p class="kj-hero-subtitle">مجموعه السیدة زینب سلام الله علیها</p>
          <p>نمایی یکپارچه برای مدیریت خادمین، سوابق خدمت، جلسات، مأموریت‌ها و امور مالی؛ اطلاعات این میزکار بر اساس دسترسی حساب کاربری شما نمایش داده می‌شود.</p>
          <div class="kj-hero-actions"><button class="kj-primary" data-quick-tab="khadems">👤 ورود به بانک خادمین</button><button class="kj-secondary" data-quick-tab="reports">▦ مشاهده گزارش‌ها</button></div>
        </div><div class="kj-hero-emblem" aria-hidden="true"><span>🕌</span><small>خدمت · نظم · امانت‌داری</small></div>
      </section>
      ${state.loading ? `<div class="kj-card kj-loading-card"><span class="kj-spinner"></span> در حال همگام‌سازی اطلاعات سامانه…</div>` : ""}
      ${Object.entries(state.errors).filter(([,e])=>e).length ? `<div class="kj-error"><b>برخی اطلاعات بارگذاری نشدند.</b><p>پیام هر بخش را جداگانه بررسی کنید؛ خطای دسترسی با خالی بودن اطلاعات یکسان نیست.</p>${Object.entries(state.errors).filter(([,e])=>e).map(([k,e])=>`<div>${esc(fieldLabel(k))}: ${esc(e)}</div>`).join("")}</div>` : ""}
      <div class="kj-section-heading"><div><span class="kj-section-eyebrow">خلاصه مدیریتی</span><h2 class="kj-section-title">نمای کلی مجموعه</h2></div><span class="kj-data-note">آمار بر اساس اطلاعات دریافت‌شده</span></div>
      <div class="kj-grid kj-stats-grid">${stats.map(([label,value,icon],i) => `<div class="kj-card kj-stat-card kj-stat-card-${i+1}"><div class="kj-stat-top"><span class="kj-stat-icon">${icon}</span><span class="kj-stat-label">${label}</span></div><div class="kj-stat">${fa(value)}</div><div class="kj-stat-foot">اطلاعات قابل مشاهده در سامانه</div></div>`).join("")}</div>
      <div class="kj-section-heading kj-shortcuts-head"><div><span class="kj-section-eyebrow">میانبرهای پرکاربرد</span><h2 class="kj-section-title">دسترسی سریع به بخش‌ها</h2></div><span class="kj-small">برای ورود، کارت موردنظر را انتخاب کنید.</span></div>
      <div class="kj-shortcut-grid">${shortcuts.map(([tab,icon,title,desc])=>`<button type="button" class="kj-shortcut-card" data-quick-tab="${tab}"><span class="kj-shortcut-icon">${icon}</span><strong>${title}</strong><small>${desc}</small><b>باز کردن بخش <span aria-hidden="true">←</span></b></button>`).join("")}</div>
      <section class="kj-card kj-recent-card"><div class="kj-card-heading"><div><span class="kj-section-eyebrow">آخرین رویدادها</span><h3>پیگیری آخرین خدمات</h3></div><span class="kj-heading-icon">⌛</span></div>${state.errors.services||state.errors.service_records?errBox("services"):latest.length?tableHtml(latest.map(r=>({...r,khadem_name:nameOf(state.khadems.find(k=>String(khademId(k))===String(r.khadem_id))||{}),service_date:val(r,["service_date","date","created_at"])})),[{key:"khadem_name",label:"نام خادم"},{key:"service_date",label:"تاریخ خدمت"},{key:"service_type",label:"نوع خدمت"},{key:"responsibility",label:"مسئولیت"}],"سابقه‌ای ثبت نشده است."):"سابقه‌ای برای نمایش نیست."}</section>
      <section class="kj-card kj-guide-card"><span class="kj-guide-icon">ⓘ</span><div><h3>راهنمای میزکار</h3><p>از منوی کناری یا کارت‌های دسترسی سریع برای رفتن به بخش‌های مختلف استفاده کنید. منوها گروه‌بندی شده‌اند و امکان جست‌وجوی بخش‌ها وجود دارد.</p><p class="kj-small">در این نسخه، اطلاعات برای مشاهده ارائه می‌شود؛ ثبت و ویرایش تا بررسی مجوزهای هر بخش غیرفعال است.</p></div></section>`;
  }

  function khademList() {
    const q = state.search.trim().toLowerCase();
    const rows = state.khadems.filter(k => { const code=Number(String(khademCode(k)).replace(/[^0-9]/g,"")); return code>=1000 && (!q || [nameOf(k), khademCode(k), val(k,["phone","mobile"]), val(k,["national_code"])].join(" ").toLowerCase().includes(q)); }).sort((a,b)=>Number(String(khademCode(a)).replace(/[^0-9]/g,""))-Number(String(khademCode(b)).replace(/[^0-9]/g,"")));
    const columns = [
      {key:"khadem_code",label:"کد خادم"},{key:"full_name",label:"نام و نام خانوادگی"},{key:"triple_name",label:"نام ثلاثی"},
      {key:"national_code",label:"کد ملی"},{key:"birth_date",label:"تاریخ تولد"},{key:"membership_date",label:"تاریخ عضویت"},
      {key:"occupation",label:"شغل"},{key:"phone",label:"شماره تلفن"},{key:"residence",label:"محل سکونت"},{key:"referrer_name",label:"معرف"},{key:"active_label",label:"وضعیت"}
    ];
    const htmlRows = rows.map(k => ({...k, khadem_code:khademCode(k), full_name:nameOf(k),
      triple_name:val(k,["triple_name","tri_name","full_name_triple"]), national_code:val(k,["national_code","national_id"]),
      birth_date:val(k,["birth_date"]), membership_date:val(k,["membership_date"]), occupation:val(k,["occupation","job"]),
      phone:val(k,["phone","mobile","phone_number"]), residence:val(k,["residence","address","home_address"]), referrer_name:val(k,["referrer_name","introducer_name","referred_by","referrer"]) || val(k?.extra_data||{},["referrer_name","introducer_name","referred_by","referrer"]), active_label:activeLabel(k)}));
    const table = tableHtml(htmlRows, columns, state.errors.khadems ? "دریافت فهرست خادمین ناموفق بود." : "خادمی با کد ۱۰۰۰ به بالا ثبت نشده است.");
    const currentJalaliMonth = Number(new Intl.DateTimeFormat("fa-IR-u-ca-persian",{month:"numeric"}).format(new Date()).replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
    if (!state.birthdayMonth) state.birthdayMonth = currentJalaliMonth;
    const birthdayRows = rows.filter(k => { const raw=String(val(k,["birth_date"])||"").trim(); let month=0; const jm=raw.match(/^(?:13|14)\d{2}[/-](\d{1,2})[/-]\d{1,2}$/); if(jm) month=Number(jm[1]); else { const d=new Date(raw); if(!Number.isNaN(d.getTime())) month=Number(new Intl.DateTimeFormat("fa-IR-u-ca-persian",{month:"numeric"}).format(d).replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d))); } return month===Number(state.birthdayMonth); }).map(k=>({full_name:nameOf(k),birth_date:val(k,["birth_date"])}));
    const monthOptions = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"].map((m,i)=>`<option value="${i+1}" ${Number(state.birthdayMonth)===i+1?"selected":""}>${m}</option>`).join("");
    const birthdays = `<section class="kj-card" style="margin:14px 0"><h2 class="kj-section-title" style="margin-top:0">🎂 متولدین ماه انتخابی</h2><label class="kj-field"><b>انتخاب ماه</b><select id="kj-birthday-month">${monthOptions}</select></label><p class="kj-muted">فهرست خادمین متولد ماه انتخاب‌شده بر اساس تقویم هجری شمسی</p>${tableHtml(birthdayRows,[{key:"full_name",label:"نام خادم"},{key:"birth_date",label:"تاریخ تولد"}],"در این ماه تولدی ثبت نشده است.")}</section>`;
    return `<h1 class="kj-page-title">بانک خادمین</h1>${errBox("khadems")}
      <div class="kj-toolbar"><input class="kj-search" id="kj-khadem-search" placeholder="جست‌وجو بر اساس نام، کد، کد ملی یا تلفن…" value="${esc(state.search)}"><span class="kj-pill">تعداد: ${fa(rows.length)}</span><button type="button" class="kj-primary" id="kj-open-registration">＋ ثبت خادم جدید</button></div>
      ${state.registrationOpen ? khademRegistrationForm() : ""}<div class="kj-khadem-table">${table}</div>${birthdays}`;
  }

  function khademRegistrationForm() {
    const skills = ["کمک‌های اولیه و امداد","امور پزشکی","آشپزی","پذیرایی و توزیع غذا","نظافت و خدمات عمومی","مدیریت موکب","برنامه‌ریزی و امور اجرایی","امور اداری و بایگانی","حسابداری و امور مالی","رایانه و فناوری اطلاعات","طراحی گرافیک","عکاسی و فیلم‌برداری","تدوین فیلم","روابط عمومی و رسانه","ترجمه عربی","ترجمه انگلیسی","رانندگی","تعمیرات برق","تعمیرات فنی","تأسیسات و لوله‌کشی","نجاری","انبارداری و تدارکات","راهنمایی زائران","امور فرهنگی و تبلیغی","مداحی و اجرای مراسم","صوت و تجهیزات مراسم","خیاطی","سایر مهارت‌ها"];
    const fields = [
      ["full_name","نام و نام خانوادگی *","text"],["khadem_code","کد خادم","text"],["referrer_name","معرف خادم","text"],["father_name","نام پدر","text"],["national_code","کد ملی","text"],
      ["birth_date","تاریخ تولد","text"],["membership_date","تاریخ عضویت","text"],["phone","شماره تلفن خادم","tel"],["occupation","شغل","text"],
      ["primary_responsibility","مسئولیت اصلی","text"],["address","نشانی محل سکونت","text"],
      ["emergency_contact_name","تماس اضطراری ۱ — نام","text"],["emergency_contact_phone","تماس اضطراری ۱ — شماره تلفن","tel"],
      ["emergency_contact_name_2","تماس اضطراری ۲ — نام","text"],["emergency_contact_phone_2","تماس اضطراری ۲ — شماره تلفن","tel"]
    ];
    return `<form id="kj-registration-form" class="kj-card" style="margin:14px 0" novalidate>
      <h2 class="kj-section-title">فرم ثبت خادم جدید</h2>
      <div class="kj-profile-grid">${fields.map(([name,label,type])=>`<label class="kj-field"><b>${label}</b><input name="${name}" type="${type}" ${name==="full_name"?"required":""} autocomplete="off"></label>`).join("")}</div>
      <fieldset style="border:1px solid #ddd6ce;border-radius:12px;padding:12px;margin:14px 0"><legend>مهارت‌ها و توانمندی‌ها</legend><div class="kj-skill-list">${skills.map(s=>`<label class="kj-pill" style="display:inline-flex;align-items:center;gap:6px;margin:4px"><input type="checkbox" name="skills" value="${esc(s)}">${esc(s)}</label>`).join("")}</div></fieldset>
      <label class="kj-field"><b>توضیحات</b><textarea name="notes" rows="3"></textarea></label>
      <div id="kj-registration-message" class="kj-muted" role="status" aria-live="polite"></div>
      <div class="kj-toolbar"><button class="kj-primary" type="submit" id="kj-save-registration">ثبت اطلاعات خادم</button><button class="kj-secondary" type="button" id="kj-cancel-registration">انصراف</button></div>
    </form>`;
  }
  function bindKhademRegistrationControls() {
    $("#kj-open-registration")?.addEventListener("click", () => { state.registrationOpen = !state.registrationOpen; render(); });
    $("#kj-cancel-registration")?.addEventListener("click", () => { state.registrationOpen = false; render(); });
    $("#kj-registration-form")?.addEventListener("submit", e => { e.preventDefault(); saveKhademFromForm(e.currentTarget); });
  }
  async function saveKhademFromForm(form) {
    const message = $("#kj-registration-message"), button = $("#kj-save-registration"), fd = new FormData(form);
    const fullName = String(fd.get("full_name") || "").trim();
    if (!fullName) { if(message) message.textContent = "لطفاً نام و نام خانوادگی خادم را وارد کنید."; return; }
    const known = new Set(Object.keys(state.khadems[0] || {})), canInfer = known.size > 0, payload = {};
    const put = (keys,value) => { if(value===undefined||value===null||value==="") return; const key=keys.find(x=>canInfer?known.has(x):x===keys[0]); if(key) payload[key]=value; };
    put(["full_name","name","khadem_name"],fullName);
    if (!["full_name","name","khadem_name"].some(x=>Object.prototype.hasOwnProperty.call(payload,x))) {
      const parts=fullName.split(/\s+/); put(["first_name"],parts.shift()||fullName); put(["last_name","family_name","family"],parts.join(" "));
    }
    put(["khadem_code","personnel_code","code"],String(fd.get("khadem_code")||"").trim());
    put(["father_name"],String(fd.get("father_name")||"").trim());
    put(["national_code","national_id"],String(fd.get("national_code")||"").trim());
    put(["birth_date"],String(fd.get("birth_date")||"").trim());
    put(["membership_date"],String(fd.get("membership_date")||"").trim());
    put(["phone","mobile","phone_number"],String(fd.get("phone")||"").trim());
    put(["occupation","job"],String(fd.get("occupation")||"").trim());
    put(["primary_responsibility"],String(fd.get("primary_responsibility")||"").trim());
    put(["referrer_name","introducer_name","referred_by","referrer"],String(fd.get("referrer_name")||"").trim());
    if (String(fd.get("referrer_name")||"").trim() && canInfer && !["referrer_name","introducer_name","referred_by","referrer"].some(x=>known.has(x)) && known.has("extra_data")) { const existing=state.khadems[0].extra_data; payload.extra_data={...(existing&&typeof existing==="object"?existing:{}),referrer_name:String(fd.get("referrer_name")).trim()}; }
    put(["address","residence"],String(fd.get("address")||"").trim());
    put(["emergency_contact_name"],String(fd.get("emergency_contact_name")||"").trim());
    put(["emergency_contact_phone"],String(fd.get("emergency_contact_phone")||"").trim());
    put(["emergency_contact_name_2"],String(fd.get("emergency_contact_name_2")||"").trim());
    put(["emergency_contact_phone_2"],String(fd.get("emergency_contact_phone_2")||"").trim());
    const selectedSkills=fd.getAll("skills"); const skillSample=state.khadems[0]?.skills; put(["skills"],Array.isArray(skillSample)?selectedSkills:selectedSkills.join("، ")); put(["notes"],String(fd.get("notes")||"").trim());
    if(!Object.keys(payload).length){if(message)message.textContent="ستون‌های لازم از اطلاعات فعلی قابل تشخیص نیست؛ هیچ اطلاعاتی ارسال نشد.";return;}
    if(button){button.disabled=true;button.textContent="در حال ثبت…";} if(message)message.textContent="در حال بررسی مجوز و ثبت اطلاعات…";
    try {
      const result=await request("/rest/v1/khadems",{method:"POST",headers:{"Prefer":"return=representation"},body:payload});
      if(!Array.isArray(result)||!result.length)throw new Error("سرور ثبت را تأیید نکرد؛ فهرست را تازه‌سازی و بررسی کنید.");
      state.registrationOpen=false;state.search="";await loadData();toast("اطلاعات خادم با موفقیت ثبت شد.","success");
    } catch(e) {
      if(message)message.textContent="ثبت انجام نشد: "+(e.message||"خطای نامشخص")+"؛ احتمال دارد مجوز ثبت یا نام ستون‌ها متفاوت باشد. اطلاعات قبلی تغییر نکرده است.";
      if(button){button.disabled=false;button.textContent="ثبت اطلاعات خادم";}
    }
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
  function khademEditForm(k) {
    const fields = [
      ["full_name","نام و نام خانوادگی","text",nameOf(k)],
      ["referrer_name","معرف خادم","text",val(k,["referrer_name","introducer_name","referred_by","referrer"])],
      ["khadem_code","کد خادم","text",khademCode(k)],
      ["triple_name","نام ثلاثی","text",val(k,["triple_name","tri_name","full_name_triple"])],
      ["father_name","نام پدر","text",val(k,["father_name"])],
      ["national_code","کد ملی","text",val(k,["national_code","national_id"])],
      ["birth_date","تاریخ تولد (هجری شمسی)","text",dateText(val(k,["birth_date"]))],
      ["membership_date","تاریخ عضویت (هجری شمسی)","text",dateText(val(k,["membership_date"]))],
      ["occupation","شغل","text",val(k,["occupation","job"])],
      ["phone","شماره تلفن","tel",val(k,["phone","mobile","phone_number"])],
      ["residence","محل سکونت","text",val(k,["residence","address","home_address"])],
      ["primary_responsibility","مسئولیت اصلی","text",val(k,["primary_responsibility","responsibility"])],
      ["emergency_contact_name","نام تماس اضطراری ۱","text",val(k,["emergency_contact_name","emergency_contact_1_name"])],
      ["emergency_contact_phone","تلفن تماس اضطراری ۱","tel",val(k,["emergency_contact_phone","emergency_contact_1_phone"])],
      ["emergency_contact_name_2","نام تماس اضطراری ۲","text",val(k,["emergency_contact_name_2","emergency_contact_2_name"])],
      ["emergency_contact_phone_2","تلفن تماس اضطراری ۲","tel",val(k,["emergency_contact_phone_2","emergency_contact_2_phone"])],
      ["notes","توضیحات","text",val(k,["notes","description"])],
      ["active","وضعیت فعالیت (فعال/غیرفعال)","select",val(k,["is_active","active","status"])]
    ];
    return '<form id="kj-profile-edit-form" novalidate><div class="kj-profile-grid">' +
      fields.map(([name,label,type,value]) => '<label class="kj-field"><b>'+esc(label)+'</b>'+(type==="select"?'<select name="'+name+'"><option value="">انتخاب وضعیت</option><option value="true" '+([true,"true","active","فعال","1"].includes(value)?"selected":"")+'>فعال</option><option value="false" '+([false,"false","inactive","غیرفعال","0"].includes(value)?"selected":"")+'>غیرفعال</option></select>':'<input name="'+name+'" type="'+type+'" value="'+esc(value)+'" autocomplete="off">')+'</label>').join("") +
      '</div><div id="kj-profile-edit-message" class="kj-muted" role="status" aria-live="polite"></div><div class="kj-toolbar"><button class="kj-primary" id="kj-save-profile" type="submit">ذخیره تغییرات</button><button class="kj-secondary" type="button" id="kj-cancel-profile-edit">انصراف</button></div></form>';
  }
  async function saveKhademProfile(form) {
    const k = state.khadems.find(x => String(khademId(x)) === String(state.selectedKhadem)) || state.khadems.find(x => String(khademCode(x)) === String(state.selectedKhadem));
    const message = $("#kj-profile-edit-message"), button = $("#kj-save-profile");
    if (!k) { if(message) message.textContent = "پرونده خادم پیدا نشد."; return; }
    const fd = new FormData(form), known = new Set(Object.keys(k)), payload = {};
    const put = (aliases, value) => {
      const key = aliases.find(x => known.has(x));
      if (key) payload[key] = String(value ?? "").trim() || null;
    };
    const fullName = String(fd.get("full_name") || "").trim();
    if (known.has("full_name")) put(["full_name"], fullName);
    else if (known.has("name")) put(["name"], fullName);
    else if (known.has("khadem_name")) put(["khadem_name"], fullName);
    else {
      const parts = fullName.split(/\s+/).filter(Boolean);
      put(["first_name"], parts.shift() || "");
      put(["last_name","family_name","family"], parts.join(" "));
    }
    put(["khadem_code","personnel_code","code"], fd.get("khadem_code"));
    put(["triple_name","tri_name","full_name_triple"], fd.get("triple_name"));
    put(["father_name"], fd.get("father_name"));
    put(["national_code","national_id"], fd.get("national_code"));
    put(["birth_date"], jalaliToGregorian(fd.get("birth_date")));
    put(["membership_date"], jalaliToGregorian(fd.get("membership_date")));
    put(["occupation","job"], fd.get("occupation"));
    put(["phone","mobile","phone_number"], fd.get("phone"));
    put(["residence","address","home_address"], fd.get("residence"));
    put(["primary_responsibility","responsibility"], fd.get("primary_responsibility"));
    put(["emergency_contact_name","emergency_contact_1_name"], fd.get("emergency_contact_name"));
    put(["emergency_contact_phone","emergency_contact_1_phone"], fd.get("emergency_contact_phone"));
    put(["emergency_contact_name_2","emergency_contact_2_name"], fd.get("emergency_contact_name_2"));
    put(["emergency_contact_phone_2","emergency_contact_2_phone"], fd.get("emergency_contact_phone_2"));
    put(["notes","description"], fd.get("notes"));
    put(["referrer_name","introducer_name","referred_by","referrer"], fd.get("referrer_name"));
    if (String(fd.get("referrer_name")||"").trim() && !["referrer_name","introducer_name","referred_by","referrer"].some(x=>known.has(x)) && known.has("extra_data")) { const extra=k.extra_data&&typeof k.extra_data==="object"?k.extra_data:{}; payload.extra_data={...extra,referrer_name:String(fd.get("referrer_name")).trim()}; }
    const activeValue = String(fd.get("active") || "").toLowerCase();
    if (activeValue) { if (known.has("is_active")) payload.is_active = activeValue === "true"; else if (known.has("active")) payload.active = activeValue === "true"; else if (known.has("status")) payload.status = activeValue === "true" ? "active" : "inactive"; }
    if (!Object.keys(payload).length) { if(message) message.textContent = "ستون‌های قابل ویرایش در ساختار فعلی پیدا نشد."; return; }
    const id = khademId(k);
    const filter = id ? "id=eq."+encodeURIComponent(id) : (khademCode(k) ? "khadem_code=eq."+encodeURIComponent(khademCode(k)) : "");
    if (!filter) { if(message) message.textContent = "شناسه خادم برای ذخیره تغییرات در دسترس نیست."; return; }
    if (button) { button.disabled = true; button.textContent = "در حال ذخیره…"; }
    if (message) message.textContent = "در حال ذخیره تغییرات…";
    try {
      await request("/rest/v1/khadems?"+filter, {method:"PATCH", body:payload, headers:{"Prefer":"return=representation"}});
      state.profileEditOpen = false;
      await loadData();
      state.selectedKhadem = khademId(k) || khademCode(k);
      render();
      toast("تغییرات پرونده خادم ذخیره شد.","success");
    } catch (error) {
      if (message) message.textContent = "ذخیره انجام نشد: "+(error.message || "خطای نامشخص")+"؛ ممکن است مجوز ویرایش پایگاه داده فعال نباشد.";
      if (button) { button.disabled = false; button.textContent = "ذخیره تغییرات"; }
    }
  }

  function khademProfile() {
    const k = state.khadems.find(x => String(khademId(x)) === String(state.selectedKhadem)) || state.khadems.find(x => String(khademCode(x)) === String(state.selectedKhadem));
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
    const installmentRows = installments.map(r => ({
      ...r, transaction_type: "قسط", category: "اقساط",
      title: "قسط شماره " + fa(r.installment_number), amount: r.amount,
      paid_amount: r.paid_amount, balance: Math.max(0, num(r.amount) - num(r.paid_amount)),
      transaction_date: r.due_date, description: val(r, ["notes"]) || r.status
    }));
    const financeRows = [...financeTransactionRows, ...installmentRows];
    const financeLoadError = state.errors.finance_transactions || state.errors.tuition_dues || state.errors.finance_installments;
    const tuitionByYear = {};
    tuitionDues.forEach(r => {
      const rawPeriod = String(val(r,["period_month","payment_date","due_date"]) || "");
      let yearMonth = rawPeriod.match(/^(\d{4})[-/](\d{1,2})/);
      if (!yearMonth) {
        const d = new Date(rawPeriod);
        if (!Number.isNaN(d.getTime())) yearMonth = [rawPeriod,String(d.getFullYear()),String(d.getMonth()+1)];
      }
      if (!yearMonth) return;
      const year = yearMonth[1], month = Number(yearMonth[2]);
      if (month < 1 || month > 12) return;
      if (!tuitionByYear[year]) tuitionByYear[year] = {year, first_due:0, first_paid:0, first_balance:0, second_due:0, second_paid:0, second_balance:0};
      const half = month <= 6 ? "first" : "second";
      tuitionByYear[year][half+"_due"] += num(val(r,["amount_toman","amount","total_amount_toman"]));
      tuitionByYear[year][half+"_paid"] += num(val(r,["paid_toman","amount_paid","paid_amount"]));
      tuitionByYear[year][half+"_balance"] += Math.max(0,num(val(r,["amount_toman","amount","total_amount_toman"]))-num(val(r,["paid_toman","amount_paid","paid_amount"])));
    });
    const tuitionHalfRows = Object.values(tuitionByYear).sort((a,b)=>String(b.year).localeCompare(String(a.year))).map(r=>({
      year:r.year, first_paid:r.first_paid, first_balance:r.first_balance, second_paid:r.second_paid, second_balance:r.second_balance
    }));
    const tuitionHalfSummary = tuitionHalfRows.length
      ? '<h4 class="kj-section-title">خلاصه پرداخت شهریه در دو دوره شش‌ماهه</h4>'+tableHtml(tuitionHalfRows,[
        {key:"year",label:"سال"},{key:"first_paid",label:"پرداخت ۶ ماه اول"},{key:"first_balance",label:"مانده ۶ ماه اول"},
        {key:"second_paid",label:"پرداخت ۶ ماه دوم"},{key:"second_balance",label:"مانده ۶ ماه دوم"}
      ],"اطلاعات شهریه ثبت نشده است")
      : '<p class="kj-muted">برای نمایش جمع پرداخت شهریه در دو دوره شش‌ماهه، سوابق شهریه باید دارای تاریخ دوره و مبلغ پرداخت باشند.</p>';
    const serviceRows = services.map(r => ({...r, ...normalize(r, ["service_date","responsibility","service_type","description"])}));
    return `<div class="kj-toolbar"><button class="kj-secondary" id="kj-back">← بازگشت به فهرست</button></div>
      <h1 class="kj-page-title">پروندهٔ ${esc(nameOf(k))}</h1>
      <div class="kj-card"><div class="kj-toolbar" style="justify-content:space-between"><h3 class="kj-section-title" style="margin:0">مشخصات خادم</h3><button type="button" class="kj-primary" id="kj-edit-profile">${state.profileEditOpen?"بستن ویرایش":"✏️ ویرایش مشخصات خادم"}</button></div><div class="kj-profile-details">${state.profileEditOpen ? khademEditForm(k) : fields}</div></div>
      <div class="kj-card" style="margin-top:14px"><details class="kj-profile-subsection">
        <summary class="kj-section-title">☎️ تماس‌ها و شماره‌های ضروری</summary>
        ${tableHtml([{contact_type:"شماره تماس اصلی",contact_name:"خود خادم",contact_phone:val(k,["phone","mobile","phone_number"])},{contact_type:"تماس اضطراری ۱",contact_name:val(k,["emergency_contact_name","emergency_contact_1_name"]),contact_phone:val(k,["emergency_contact_phone","emergency_contact_1_phone","emergency_phone"])},{contact_type:"تماس اضطراری ۲",contact_name:val(k,["emergency_contact_name_2","emergency_contact_2_name"]),contact_phone:val(k,["emergency_contact_phone_2","emergency_contact_2_phone"])}],[{key:"contact_type",label:"نوع تماس"},{key:"contact_name",label:"نام مخاطب"},{key:"contact_phone",label:"شماره تلفن"}],"شماره تماسی برای نمایش ثبت نشده است.")}
        <p class="kj-muted">این بخش اطلاعات تماس موجود در پرونده را نمایش می‌دهد.</p>
      </details></div>
      <div class="kj-card" style="margin-top:14px"><details class="kj-profile-subsection">
        <summary class="kj-section-title">🧰 مهارت‌ها و توانمندی‌ها</summary>
        ${(() => { const raw=val(k,["skills","skill_list","abilities","special_skills"]); let current=[]; if(Array.isArray(raw)) current=raw; else if(raw && typeof raw==="object") current=Object.values(raw); else if(String(raw||"").trim()) current=String(raw).split(/[,،;؛\n]+/).map(x=>x.trim()).filter(Boolean); const options=["کمک‌های اولیه و امداد","امور پزشکی","آشپزی","پذیرایی و توزیع غذا","نظافت و خدمات عمومی","مدیریت موکب","برنامه‌ریزی و امور اجرایی","امور اداری و بایگانی","حسابداری و امور مالی","رایانه و فناوری اطلاعات","طراحی گرافیک","عکاسی و فیلم‌برداری","تدوین فیلم","روابط عمومی و رسانه","ترجمه عربی","ترجمه انگلیسی","رانندگی","تعمیرات برق","تعمیرات فنی","تأسیسات و لوله‌کشی","نجاری","انبارداری و تدارکات","مدیریت جمعیت و راهنمایی زائران","امور فرهنگی و تبلیغی","مداحی و اجرای مراسم","صوت و تجهیزات مراسم","خیاطی","سایر مهارت‌ها"]; return '<div><b>مهارت‌های ثبت‌شده:</b> ' + (current.length ? current.map(x=>'<span class="kj-pill">' + esc(x) + '</span>').join(" ") : "مهارتی در پرونده ثبت نشده است.") + '</div><p class="kj-muted">فهرست پیشنهادی مهارت‌هایی که می‌توان برای خادم ثبت کرد:</p><div class="kj-skill-list">' + options.map(x=>'<span class="kj-pill">' + esc(x) + '</span>').join(" ") + '</div><p class="kj-muted">در نسخه فعلی این بخش نمایشی است؛ برای ذخیره یا ویرایش مهارت‌ها باید قابلیت ثبت با مجوز پایگاه داده فعال شود.</p>'; })()}
      </details></div>
      <div class="kj-card" style="margin-top:14px"><div class="kj-grid" style="margin:0"><div><div class="kj-muted">کد خادم</div><b>${esc(khademCode(k) || "—")}</b></div><div><div class="kj-muted">تعداد سوابق خدمت</div><b>${fa(services.length)}</b></div><div><div class="kj-muted">تعداد تراکنش‌های مالی</div><b>${fa(financeRows.length)}</b></div></div></div>
      <div class="kj-card" style="margin-top:14px">${relatedSection("سوابق خدمت","service_records",serviceRows,serviceCols,"هنوز سابقه خدمتی برای این خادم ثبت نشده است.")}</div>
      <div class="kj-card" style="margin-top:14px"><h3 class="kj-section-title">سوابق مالی خادم</h3>${errBox("finance_transactions")}${errBox("tuition_dues")}${errBox("finance_installments")}${financeLoadError ? empty("به دلیل خطای دریافت، خالی بودن سوابق مالی قابل تأیید نیست.") : tuitionHalfSummary + tableHtml(financeRows,financeCols,"هنوز سابقه مالی ثبت نشده است")}</div>`;
  }
  function genericPage(key, title, rows, preferredColumns) {
    // کد خادم مرجع اصلی اتصال رکوردها به پرونده خادم است؛ شناسه داخلی فقط برای تطبیق کمکی استفاده می‌شود.
    const enrichedRows = rows.map(row => {
      const rowId = val(row, ["khadem_id", "person_id", "personnel_id"]);
      const rowCode = val(row, ["khadem_code", "personnel_code", "code"]);
      const rowName = val(row, ["khadem_name", "full_name", "person_name"]);
      const linked = state.khadems.find(k =>
        (rowCode && String(khademCode(k)) === String(rowCode)) ||
        (rowId && String(khademId(k)) === String(rowId)) ||
        (rowName && nameOf(k).trim().toLocaleLowerCase("fa") === String(rowName).trim().toLocaleLowerCase("fa"))
      );
      const hasKhademRef = Boolean(rowId || rowCode || rowName || linked);
      return hasKhademRef ? {
        ...row,
        khadem_code: rowCode || (linked ? khademCode(linked) : ""),
        khadem_name: rowName || (linked ? nameOf(linked) : "")
      } : row;
    });
    let cols = preferredColumns || (enrichedRows.length ? Object.keys(enrichedRows[0]).filter(k => !["id","updated_at","created_at"].includes(k)).slice(0,5).map(k=>({key:k,label:fieldLabel(k)})) : []);
    const hasKhademRef = enrichedRows.some(row => row.khadem_code || row.khadem_name || row.khadem_id || row.person_id || row.personnel_id || row.khadem_name);
    if (hasKhademRef) {
      const codeCol = {key:"khadem_code",label:"کد خادم"};
      const nameCol = {key:"khadem_name",label:"نام خادم"};
      cols = [codeCol, nameCol, ...cols.filter(c => !["khadem_code","khadem_name"].includes(c.key))];
    }
    return `<h1 class="kj-page-title">${esc(title)}</h1>${errBox(key)}${cols.length ? tableHtml(enrichedRows, cols, state.errors[key] ? "دریافت اطلاعات ناموفق بود." : "هنوز موردی ثبت نشده است.") : (state.errors[key] ? "" : empty("هنوز موردی ثبت نشده است."))}`;
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
    return `<h1 class="kj-page-title">سوابق فعالیت</h1><p class="kj-muted">رویدادهای قابل مشاهده از جدول audit_logs؛ خالی بودن این جدول به معنی ثبت شدن تمام فعالیت‌ها نیست.</p>${errBox("audit")}${genericPage("audit","گزارش رویدادها",state.audit,[{key:"created_at",label:"زمان"},{key:"actor_user_id",label:"شناسه کاربر"},{key:"action",label:"عملیات"},{key:"module_key",label:"بخش"},{key:"record_id",label:"شناسه رکورد"}])}`;
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
      khadem_code: val(r,["khadem_code","personnel_code"]) || khademCode(state.khadems.find(k=>String(khademId(k))===String(r.khadem_id)) || {}),
      category: val(r,["category","account_category"]),
      title: val(r,["title","description"]),
      amount: val(r,["amount","total_amount"]),
      transaction_date: val(r,["transaction_date","date","created_at"]),
      description: val(r,["description","notes","note"])
    }));
    return genericPage("finance","امور مالی",rows,columns)
      + '<h2 class="kj-section-title">اقساط</h2>' + errBox("financeInstallments")
      + genericPage("financeInstallments","اقساط ثبت‌شده",state.financeInstallments,[{key:"khadem_id",label:"شناسه خادم"},{key:"installment_number",label:"شماره قسط"},{key:"due_date",label:"سررسید"},{key:"status",label:"وضعیت"},{key:"notes",label:"یادداشت"}]);
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
      $("#kj-back")?.addEventListener("click", () => { state.selectedKhadem = null; state.profileEditOpen = false; render(); });
      $("#kj-edit-profile")?.addEventListener("click", () => { state.profileEditOpen = !state.profileEditOpen; render(); });
      $("#kj-profile-edit-form")?.addEventListener("submit", e => { e.preventDefault(); saveKhademProfile(e.currentTarget); });
      $("#kj-cancel-profile-edit")?.addEventListener("click", () => { state.profileEditOpen = false; render(); });
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
    $$("[data-quick-tab]", main).forEach(button => button.addEventListener("click", () => {
      state.tab = button.dataset.quickTab; state.selectedKhadem = null;
      render();
      window.scrollTo({top:0,behavior:"smooth"});
    }));
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
      bindKhademRegistrationControls();
      $("#kj-khadem-search")?.addEventListener("input", e => {
        const pos = e.target.selectionStart;
        state.search = e.target.value;
        const main = $("#kj-main");
        main.innerHTML = khademList();
        bindKhademRegistrationControls();
        const input = $("#kj-khadem-search");
        input?.focus(); input?.setSelectionRange(pos,pos);
        bindKhademButtons();
      });
      bindKhademButtons();
      $("#kj-birthday-month")?.addEventListener("change", e => { state.birthdayMonth = Number(e.target.value); const main=$("#kj-main"); if(main){main.innerHTML=khademList(); bindKhademRegistrationControls(); bindKhademButtons(); $("#kj-birthday-month")?.addEventListener("change", ev=>{state.birthdayMonth=Number(ev.target.value);render();});} });
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
    const rows = state.khadems.filter(k => Number(String(khademCode(k)).replace(/[^0-9]/g,"")) >= 1000 && (!q || [nameOf(k),khademCode(k),val(k,["phone","mobile"]),val(k,["national_code"])].join(" ").toLowerCase().includes(q))).sort((a,b)=>Number(String(khademCode(a)).replace(/[^0-9]/g,""))-Number(String(khademCode(b)).replace(/[^0-9]/g,"")));
    $$("[data-row]", main).forEach(b => b.addEventListener("click", () => {
      const k = rows[Number(b.dataset.row)];
      if (!k) return;
      state.selectedKhadem = khademId(k) || khademCode(k);
      render();
    }));
  }

  async function startApp() {
    const allowedTabs = new Set(["dashboard","khadems","services","friday","nonattendance","deployments","meetings","finance","fund","donors","equipment","reports","audit","users","settings"]);
    const requestedTab = window.location.hash.replace(/^#/, "");
    if (allowedTabs.has(requestedTab)) state.tab = requestedTab;
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
      loginPage("بررسی نشست انجام نشد: " + (e && e.message ? e.message : "خطای ناشناخته") + " اگر فرم ورود نمایش داده می‌شود، ایمیل و رمز حساب معتبر را وارد کنید.");
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
