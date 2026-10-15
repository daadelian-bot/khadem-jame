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
    role: "user",
    accessPermissions: null,
    isPrimaryAdmin: false,
    accessCustom: false,
    accessLoaded: false,
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
    const m=raw.match(/^(13|14)\d{2}[/](\d{1,2})[/](\d{1,2})$/);
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
  function jalaliPartsFromDate(date) {
    const parts = new Intl.DateTimeFormat("en-u-ca-persian", { year:"numeric", month:"numeric", day:"numeric", timeZone:"UTC" }).formatToParts(date);
    const p = Object.fromEntries(parts.filter(x => x.type !== "literal").map(x => [x.type, Number(x.value)]));
    return { year:p.year, month:p.month, day:p.day };
  }
  function jalaliDateInputSelector() {
    return "input[data-jalali-date], input[name=\"birth_date\"], input[name=\"membership_date\"], input[name$=\"_date\"], input[name$=\"_at\"], input[name=\"date\"], input[name=\"period_month\"]";
  }
  function installJalaliDatePicker() {
    if (window.__kjJalaliPickerBound) return;
    window.__kjJalaliPickerBound = true;
    let activeInput = null, anchor = new Date();
    const picker = document.createElement("div");
    picker.id = "kj-jalali-picker"; picker.className = "kj-jalali-picker"; picker.hidden = true;
    picker.setAttribute("role", "dialog"); picker.setAttribute("aria-label", "انتخاب تاریخ هجری شمسی");
    document.body.appendChild(picker);
    const utcDay = d => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const shiftDay = (d, n) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + n));
    const isoOf = d => String(d.getUTCFullYear()) + "-" + String(d.getUTCMonth()+1).padStart(2,"0") + "-" + String(d.getUTCDate()).padStart(2,"0");
    const dateFromInput = input => {
      const raw = String(input.value || "").trim().replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replaceAll("-","/");
      const iso = jalaliToGregorian(raw);
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(iso))) { const p=iso.split("-").map(Number); const d=new Date(Date.UTC(p[0],p[1]-1,p[2])); if(!Number.isNaN(d.getTime())) return d; }
      const gm = raw.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
      if (gm) { const d=new Date(Date.UTC(Number(gm[1]),Number(gm[2])-1,Number(gm[3]))); if(!Number.isNaN(d.getTime())) return d; }
      return utcDay(new Date());
    };
    const render = () => {
      const current = jalaliPartsFromDate(anchor);
      let first = utcDay(anchor);
      for(let i=0;i<40;i++){ const prev=shiftDay(first,-1), p=jalaliPartsFromDate(prev); if(p.year!==current.year||p.month!==current.month) break; first=prev; }
      const offset=(first.getUTCDay()+1)%7, gridStart=shiftDay(first,-offset);
      const monthNames=["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
      const week=["ش","ی","د","س","چ","پ","ج"];
      const selected = activeInput ? jalaliPartsFromDate(dateFromInput(activeInput)) : null;
      let cells="";
      for(let i=0;i<42;i++){ const d=shiftDay(gridStart,i), p=jalaliPartsFromDate(d), same=p.year===current.year&&p.month===current.month, chosen=selected&&p.year===selected.year&&p.month===selected.month&&p.day===selected.day, today=(()=>{const t=jalaliPartsFromDate(utcDay(new Date()));return p.year===t.year&&p.month===t.month&&p.day===t.day;})();
        cells += '<button type="button" class="kj-jalali-day'+(same?"":" is-outside")+(chosen?" is-selected":"")+(today?" is-today":"")+'" data-iso="'+isoOf(d)+'" data-jy="'+p.year+'" data-jm="'+p.month+'" data-jd="'+p.day+'" aria-label="'+fa(p.year+"/"+String(p.month).padStart(2,"0")+"/"+String(p.day).padStart(2,"0"))+'">'+fa(p.day)+'</button>';
      }
      picker.innerHTML = '<div class="kj-jalali-calendar-head"><button type="button" data-move="-1" aria-label="ماه قبل">‹</button><strong>'+monthNames[current.month-1]+' '+fa(current.year)+'</strong><button type="button" data-move="1" aria-label="ماه بعد">›</button></div><div class="kj-jalali-week">'+week.map(x=>'<span>'+x+'</span>').join("")+'</div><div class="kj-jalali-days">'+cells+'</div><div class="kj-jalali-calendar-foot"><button type="button" data-today="1">امروز</button><button type="button" data-close="1">بستن</button></div>';
    };
    const place = () => {
      if(!activeInput || picker.hidden) return;
      const r=activeInput.getBoundingClientRect(), width=Math.min(320,window.innerWidth-20);
      picker.style.width=width+"px";
      const left=Math.max(10,Math.min(r.left,window.innerWidth-width-10));
      const top=(r.bottom+picker.offsetHeight+8<=window.innerHeight)?r.bottom+6:Math.max(10,r.top-picker.offsetHeight-6);
      picker.style.left=left+"px"; picker.style.top=top+"px";
    };
    const open = input => {
      if(!input || !input.matches(jalaliDateInputSelector()) || input.disabled || input.readOnly) return;
      activeInput=input;
      if(/^\d{4}-\d{2}-\d{2}$/.test(String(input.value||"").trim())) input.value=jalaliInputDate(input.value);
      anchor=dateFromInput(input); picker.hidden=false; render(); place();
      input.setAttribute("aria-haspopup","dialog"); input.setAttribute("aria-expanded","true");
    };
    const close = () => { if(activeInput) activeInput.setAttribute("aria-expanded","false"); picker.hidden=true; activeInput=null; };
    document.addEventListener("click", e => {
      const input=e.target.closest && e.target.closest(jalaliDateInputSelector());
      if(input){ open(input); return; }
      if(picker.contains(e.target)){
        const move=e.target.closest("[data-move]");
        if(move){ anchor=shiftDay(anchor,Number(move.dataset.move)*35); render(); place(); return; }
        const day=e.target.closest("[data-iso]");
        if(day && activeInput){ const iso=day.dataset.iso; activeInput.value=jalaliInputDate(iso); activeInput.dispatchEvent(new Event("change",{bubbles:true})); activeInput.dispatchEvent(new Event("input",{bubbles:true})); close(); return; }
        if(e.target.closest("[data-today]")){ if(activeInput){activeInput.value=jalaliInputDate(new Date().toISOString().slice(0,10));activeInput.dispatchEvent(new Event("change",{bubbles:true}));activeInput.dispatchEvent(new Event("input",{bubbles:true}));} close(); return; }
        if(e.target.closest("[data-close]")){close();return;}
        return;
      }
      close();
    }, true);
    document.addEventListener("focusin", e => { if(e.target.matches && e.target.matches(jalaliDateInputSelector())) open(e.target); });
    document.addEventListener("keydown", e => { if(e.key==="Escape"&&!picker.hidden) close(); });
    window.addEventListener("resize", place); window.addEventListener("scroll", place, true);
  }
  installJalaliDatePicker();
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
      // در خطای موقت، داده قبلی همان بخش حفظ شود تا شکست یک درخواست اطلاعات موجود را پاک نکند.
      return Array.isArray(state[stateKey]) ? state[stateKey] : [];
    }
  }
  async function loadData() {
    if (state.loading) return;
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
    const dataModule = {
      khadems:"khadems",
      services:"services", nonattendance:"nonattendance",
      meetings:"meetings", meetingInvitees:"meetings", meetingAttendance:"meetings",
      deployments:"deployments", vehicles:"deployments", drivers:"deployments",
      finance:"finance", tuitionDues:"finance", financeInstallments:"finance", tuitionPayments:"finance",
      fund:"fund", donors:"donors",
      equipmentIssues:"equipment", equipmentPayments:"equipment", equipmentReceipts:"equipment",
      equipmentReceiptItems:"equipment", equipmentCommitteePayments:"equipment",
      profiles:"users", roles:"users", permissions:"users", rolePermissions:"users",
      audit:"audit", systemSettings:"settings", appSettings:"settings"
    };
    await Promise.all(tables.map(async ([key, table]) => {
      const module = dataModule[key];
      if (module && !canAccess(module)) { state[key] = []; delete state.errors[key]; return; }
      state[key] = await loadTable(table, key);
    }));
    state.loading = false;
    state.loaded = true;
    render();
    const failed = Object.values(state.errors).filter(Boolean).length;
    if (failed) toast("دریافت بعضی اطلاعات ناموفق بود؛ داده‌های قبلی آن بخش حفظ شدند و خطا در همان بخش نمایش داده شده است.", "error");
    else toast("همه اطلاعات قابل‌دسترسی سامانه به‌روزرسانی شد.", "success");
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
    state.role = "user";
    state.isPrimaryAdmin = false;
    state.accessPermissions = null;
    state.accessCustom = false;
    state.accessLoaded = false;
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
          <p class="kj-small" style="text-align:center;margin-top:12px"><a href="./forgot-password.html" style="color:#173b58;font-weight:bold;text-decoration:none">فراموشی رمز عبور؟ بازیابی از طریق ایمیل</a></p>
          <p class="kj-small" style="text-align:center;margin-top:8px"><a href="./create-account.html?v=20261016-43" style="color:#173b58;font-weight:bold;text-decoration:none">حساب کاربری ندارید؟ ایجاد حساب جدید</a></p>
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
  function canAccess(tab) {
    // تا زمان دریافت نقش و مجوزهای واقعی، دسترسی را پیش‌فرض باز نکن.
    if (state.isPrimaryAdmin) return true;
    if (tab === "dashboard" || tab === "changePassword") return true;
    if (!state.accessLoaded) return false;
    // Fail closed: users/managers without an explicitly saved permission profile
    // must not inherit unrestricted access by default.
    if (!state.accessCustom) return false;
    return state.accessPermissions?.[tab] === true;
  }
  function shell() {
    const app = ensureRoot();
    const user = (() => { try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch (_) { return null; } })();
    const groups = [
      ["میزکار مدیریتی", [["dashboard","🏠 داشبورد"]]],
      ["مدیریت خادمین", [["khadems","👤 بانک خادمین"]]],
      ["خدمت و عملیات", [["serviceRegister","📝 ثبت خدمت"],["services","🕌 سوابق خدمت رسمی"],["friday","🌙 سوابق خدمت شب‌های جمعه"],["nonattendance","🧾 ثبت و پیگیری عدم حضور"],["deployments","🚐 مأموریت‌های خدمت"]]],
      ["جلسات و حضور و غیاب", [["meetings","👥 جلسات و حضور و غیاب"]]],
      ["امور مالی و پشتیبانی", [["finance","💰 امور مالی و شهریه"],["fund","🏦 خزانه و صندوق"],["donors","🤝 نیکوکاران و خیرین"],["equipment","👕 البسه، تجهیزات و ناوگان"]]],
      ["گزارش‌ها و کنترل", [["reports","📊 گزارش‌ها و تحلیل"],["audit","📁 سوابق فعالیت و ممیزی"]]],
      ["مدیریت سامانه", [["users","🧩 کاربران و دسترسی‌ها"],["settings","⚙️ تنظیمات سامانه"],["changePassword","🔐 تغییر رمز عبور"]]]
    ];
    for (let i = groups.length - 1; i >= 0; i--) {
      groups[i][1] = groups[i][1].filter(([id]) => canAccess(id));
      if (!groups[i][1].length) groups.splice(i, 1);
    }
    app.innerHTML = `
      <div class="kj-shell" dir="rtl">
        <header class="kj-top">
          <div class="kj-brand">🕌 سامانه جامع مدیریت خادمین<small>مرکز مدیریت و عملیات</small></div>
          <div class="kj-actions"><span class="kj-user-title">${String(user?.email || "").trim().toLowerCase() === "da.adelian@gmail.com" ? "مدیر مجموعه" : "کاربر سامانه"}</span><div class="kj-action-buttons"><button type="button" class="kj-secondary kj-mobile-menu-toggle" id="kj-mobile-menu-toggle" aria-expanded="false">☰ منو</button><button class="kj-secondary" id="kj-refresh" ${state.loading ? "disabled" : ""}>${state.loading ? "در حال به‌روزرسانی…" : "به‌روزرسانی اطلاعات"}</button><button class="kj-secondary" id="kj-signout">خروج ←</button></div></div>
        </header>
        <div class="kj-layout">
          <aside class="kj-sidebar" aria-label="منوی سامانه">
            <input class="kj-side-search" id="kj-menu-search" type="search" placeholder="جست‌وجوی منو و زیرمنو…" aria-label="جست‌وجوی منو و زیرمنو">
            <nav class="kj-nav" aria-label="منوی اصلی">
              ${groups.map(([title,items],i)=>`<section class="kj-menu-group ${items.some(([id])=>id===state.tab) ? "open" : ""}">
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
  function khademByCode(code) {
    const wanted = String(code ?? "").trim();
    return state.khadems.find(k => String(khademCode(k)).trim() === wanted) || null;
  }
  function selectedKhademRecord() {
    const selected = String(state.selectedKhadem ?? "");
    if (selected.startsWith("code:")) return khademByCode(selected.slice(5));
    return state.khadems.find(k => String(khademId(k)) === selected) ||
      state.khadems.find(k => String(khademCode(k)) === selected) || null;
  }
  function khademIdentityText(k) {
    if (!k) return "";
    const code = khademCode(k), name = nameOf(k);
    return [code ? "کد " + fa(code) : "", name].filter(Boolean).join(" — ");
  }
  function khademForDisplay(key, value) {
    const v = String(value ?? "").trim();
    if (!v) return null;
    if (["khadem_code","personnel_code","khadem_number","khadem_no"].includes(key)) return khademByCode(v);
    if (["khadem_id","personnel_id","person_id"].includes(key)) {
      return state.khadems.find(k => String(khademId(k)) === v) || khademByCode(v) || null;
    }
    if (["khadem_name","full_name","fullName"].includes(key)) {
      return state.khadems.find(k => nameOf(k).trim() === v) || null;
    }
    return null;
  }
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
      service_date:"تاریخ شروع خدمت", service_end_date:"تاریخ پایان خدمت", departure_date:"تاریخ حرکت از مبدأ", arrival_date:"تاریخ حضور در مقصد", shrine_name:"حرم محل خدمت", shrine:"حرم محل خدمت", holy_site:"حرم محل خدمت", destination:"مقصد / حرم", service_title:"عنوان خدمت", group_name:"گروه / کاروان", date:"تاریخ", service_type:"نوع خدمت", service_kind:"نوع خدمت", category:"دسته‌بندی",
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
    const identity = khademForDisplay(key, value);
    // در ستون‌های بانک خادم، هر فیلد فقط مقدار خودش را نشان دهد؛ کد عددی و نام فقط نام باشد.
    if (["khadem_code","personnel_code","khadem_number","khadem_no"].includes(key)) {
      // ستون کد خادم فقط مقدار عددی ثبت‌شده را نمایش می‌دهد؛ هرگز نام یا شناسه متنی را جایگزین نکن.
      const digits = String(value).replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[^0-9]/g, "");
      return digits ? fa(digits) : "—";
    }
    if (["full_name","khadem_name","fullName"].includes(key)) {
      // ستون نام و نام خانوادگی فقط متن نام را نشان می‌دهد، نه کد/شناسه خادم.
      let name = identity ? nameOf(identity) : String(value);
      name = name.replace(/(?:کد\s*)?[۰-۹0-9]+\s*[—–-]\s*/g, "").replace(/\s*[—–-]\s*(?:کد\s*)?[۰-۹0-9]+/g, "").trim();
      return name && !/^[۰-۹0-9]+$/.test(name) ? translateValue(name) : "—";
    }
    if (identity) return khademIdentityText(identity);
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
    const order = ["khadem_code","personnel_code","code","full_name","name","father_name","triple_name","tri_name","national_code","national_id","phone","mobile","birth_date","membership_date","created_at","updated_at","occupation","job","blood_type","medical_history","address","residence","referrer_name","introducer_name","referred_by","referrer","referrer_full_name","introducer","friday_service_count","shab_jome_count","main_service_count","total_service_days","status","active","is_active","primary_responsibility","responsibility","emergency_contact_name_2","emergency_contact_2_name","emergency_name_2","emergency_contact_phone_2","emergency_contact_2_phone","emergency_phone_2","emergency_contact2_phone","extra_data"];
    const rank = key => { const i=order.indexOf(key); return i<0?999:i; };
    const labels = {referrer_name:"نام معرف",introducer_name:"نام معرف",referred_by:"نام معرف",referrer:"نام معرف",referrer_full_name:"نام معرف",introducer:"نام معرف",triple_name:"نام ثلاثی",tri_name:"نام ثلاثی",friday_service_count:"تعداد خدمت شب جمعه",shab_jome_count:"تعداد خدمت شب جمعه",main_service_count:"تعداد خدمات اصلی",total_service_days:"مجموع روزهای خدمت"};
    const hidden = new Set(["emergency_contact_name","emergency_contact_1_name","emergency_name","emergency_contact_phone","emergency_contact_1_phone","emergency_phone"]);
    const entries = Object.entries(row).filter(([k,v]) => !omit.includes(k) && !hidden.has(k) && k!=="emergency_contact_name_2" && k!=="emergency_contact_2_name" && k!=="emergency_name_2" && k!=="emergency_contact_phone_2" && k!=="emergency_contact_2_phone" && k!=="emergency_phone_2" && k!=="emergency_contact2_phone" && v !== null && v !== "").sort(([a],[b]) => rank(a)-rank(b));
    return `<div class="kj-profile-grid">${entries.map(([k,v]) => {
      if (k === "extra_data") { let extra=v; if(typeof extra==="string"){try{extra=JSON.parse(extra)}catch(_){extra={}}} if(!extra||typeof extra!=="object"||Array.isArray(extra))extra={}; const omitExtra=new Set(["referrer_name","introducer_name","referred_by","referrer","referrer_full_name","introducer","emergency_contact_name_2","emergency_contact_2_name","emergency_name_2","emergency_contact_phone_2","emergency_contact_2_phone","emergency_phone_2","emergency_contact2_phone"]); const items=Object.entries(extra).filter(([key,x])=>!omitExtra.has(key)&&x!==null&&x!=="").map(([key,value])=>`<div class="kj-field"><b>${esc(fieldLabel(key))}</b><span>${esc(formatValue(key,value))}</span></div>`).join(""); return `<div class="kj-field kj-extra-data"><b>اطلاعات تکمیلی</b><div class="kj-profile-grid">${items || "<span>اطلاعاتی ثبت نشده است</span>"}</div></div>`; }
      return `<div class="kj-field"><b>${esc(labels[k]||fieldLabel(k))}</b><span>${esc(formatValue(k,v))}</span></div>`;
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


  function dashboardAnalytics() {
    const monthCounts = new Map();
    const typeCounts = new Map();
    const statusCounts = new Map([["فعال",0],["غیرفعال",0],["نامشخص",0]]);
    state.services.forEach(row => {
      const raw = String(val(row, ["service_date","date","created_at"]) || "").trim();
      let month = "";
      const normalized = raw.replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replaceAll("-", "/");
      const m = normalized.match(/((?:13|14)\d{2}|20\d{2})\/(\d{1,2})/);
      if (m) month = m[1] + "/" + String(m[2]).padStart(2,"0");
      else if (raw) {
        const converted = String(jalaliInputDate(raw) || "").replaceAll("-", "/");
        const cm = converted.match(/((?:13|14)\d{2})\/(\d{1,2})/);
        if (cm) month = cm[1] + "/" + String(cm[2]).padStart(2,"0");
      }
      if (month) monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
      const type = String(val(row, ["service_type","service_name","program_type","type","title"]) || "ثبت‌نشده").trim();
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    });
    state.khadems.forEach(k => {
      const status = activeLabel(k);
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });
    const months = [...monthCounts.entries()].sort((a,b)=>a[0].localeCompare(b[0])).slice(-6);
    const maxMonth = Math.max(1, ...months.map(x=>x[1]));
    const monthHtml = months.length ? months.map(([label,count]) =>
      '<div class="kj-chart-column" title="' + esc(label) + ': ' + fa(count) + ' خدمت">' +
      '<span class="kj-chart-value">' + fa(count) + '</span>' +
      '<div class="kj-chart-bar-track"><div class="kj-chart-bar" style="height:' + Math.max(5, count/maxMonth*100) + '%"></div></div>' +
      '<span class="kj-chart-label">' + fa(label.slice(2)) + '</span></div>').join("") :
      '<div class="kj-chart-empty">برای رسم روند ماهانه، تاریخ معتبر در سوابق خدمت ثبت نشده است.</div>';
    const topTypes = [...typeCounts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);
    const maxType = Math.max(1, ...topTypes.map(x=>x[1]));
    const typeHtml = topTypes.length ? topTypes.map(([label,count]) =>
      '<div class="kj-horizontal-row"><div class="kj-horizontal-label" title="' + esc(label) + '">' + esc(label) +
      '</div><div class="kj-horizontal-track"><span style="width:' + Math.max(2,count/maxType*100) + '%"></span></div><b>' + fa(count) + '</b></div>').join("") :
      '<div class="kj-chart-empty">هنوز سابقه خدمتی برای تحلیل نوع خدمت ثبت نشده است.</div>';
    const statusColors = {"فعال":"active","غیرفعال":"inactive","نامشخص":"unknown"};
    const statusTotal = [...statusCounts.values()].reduce((a,b)=>a+b,0);
    const statusHtml = [...statusCounts.entries()].map(([label,count]) =>
      '<div class="kj-status-row"><span class="kj-status-dot ' + statusColors[label] + '"></span><span>' + label +
      '</span><strong>' + fa(count) + '</strong><div class="kj-status-track"><span class="' + statusColors[label] +
      '" style="width:' + (statusTotal?count/statusTotal*100:0) + '%"></span></div></div>').join("");
    return '<section class="kj-analytics-section">' +
      '<div class="kj-section-heading"><div><span class="kj-section-eyebrow">تحلیل عملکرد</span><h2 class="kj-section-title">نمایش گرافیکی شاخص‌ها</h2></div><span class="kj-data-note">بر پایه داده‌های دریافت‌شده</span></div>' +
      '<div class="kj-analytics-grid">' +
      '<article class="kj-card kj-chart-card"><div class="kj-chart-head"><div><span class="kj-chart-eyebrow">روند زمانی</span><h3>سوابق خدمت در ماه‌های اخیر</h3></div><span class="kj-chart-icon">↗</span></div><div class="kj-chart-columns">' + monthHtml + '</div><p class="kj-chart-foot">فقط ماه‌هایی نمایش داده می‌شوند که تاریخ قابل تشخیص دارند.</p></article>' +
      '<article class="kj-card kj-chart-card"><div class="kj-chart-head"><div><span class="kj-chart-eyebrow">ترکیب فعالیت</span><h3>پرتکرارترین انواع خدمت</h3></div><span class="kj-chart-icon">▤</span></div><div class="kj-horizontal-chart">' + typeHtml + '</div><p class="kj-chart-foot">حداکثر پنج نوع خدمت پرتکرار از اطلاعات موجود.</p></article>' +
      '<article class="kj-card kj-chart-card kj-status-chart"><div class="kj-chart-head"><div><span class="kj-chart-eyebrow">وضعیت بانک خادمین</span><h3>توزیع وضعیت خادمین</h3></div><span class="kj-chart-icon">◉</span></div><div class="kj-status-list">' + statusHtml + '</div><p class="kj-chart-foot">وضعیت‌های نامشخص جداگانه نشان داده می‌شوند و فعال فرض نمی‌شوند.</p></article>' +
      '</div></section>';
  }

  function dashboard() {
    const activeKhadems = state.khadems.filter(k => !/غیرفعال|متوقف|حذف/i.test(String(val(k,["status","state","membership_status"])||""))).length;
    const serviceRows = state.services;
    const serviceCount = serviceRows.length;
    const meetingCount = state.meetings.length;
    const financeRows = [...state.finance, ...state.tuitionDues, ...state.financeInstallments];
    const financeTotal = state.finance.reduce((sum,r)=>sum+num(val(r,["amount","total_amount","amount_toman"])),0);
    const monthLabel = new Intl.DateTimeFormat("fa-IR-u-ca-persian",{month:"long",year:"numeric"}).format(new Date());
    const recentServices = [...serviceRows].sort((a,b)=>String(val(b,["service_date","date","created_at"])).localeCompare(String(val(a,["service_date","date","created_at"])))).slice(0,6);
    const recentMeetings = [...state.meetings].sort((a,b)=>String(val(b,["meeting_date","date","created_at"])).localeCompare(String(val(a,["meeting_date","date","created_at"])))).slice(0,4);
    const statCards = [
      {label:"خادمین ثبت‌شده",value:state.khadems.length,meta:"پرونده‌های موجود",icon:"♙",tab:"khadems",tone:"blue"},
      {label:"سوابق خدمت",value:serviceCount,meta:"تمام سوابق قابل مشاهده",icon:"✦",tab:"services",tone:"teal"},
      {label:"جلسات مجموعه",value:meetingCount,meta:"جلسات ثبت‌شده",icon:"▦",tab:"meetings",tone:"violet"},
      {label:"مأموریت‌ها",value:state.deployments.length,meta:"سوابق اعزام و مأموریت",icon:"↗",tab:"deployments",tone:"amber"},
      {label:"تراکنش‌های مالی",value:financeRows.length,meta:"تراکنش‌ها و اقساط ثبت‌شده",icon:"◈",tab:"finance",tone:"green"},
      {label:"نیکوکاران",value:state.donors.length,meta:"پرونده‌های ثبت‌شده",icon:"♡",tab:"donors",tone:"rose"}
    ];
    const modules = [
      ["khadems","♙","بانک خادمین","پرونده‌ها، اطلاعات و جست‌وجوی خدام","مدیریت افراد"],
      ["serviceRegister","＋","ثبت خدمت","ثبت و پیگیری فعالیت‌های خدمتی","عملیات روزانه"],
      ["services","✦","سوابق خدمت","خدمات رسمی و گزارش فعالیت‌ها","عملیات روزانه"],
      ["friday","☾","شب‌های جمعه","سوابق و برنامه‌های شب جمعه","عملیات روزانه"],
      ["meetings","▦","جلسات و حضور","جلسات، دعوت‌شدگان و حضور","هماهنگی"],
      ["deployments","↗","مأموریت‌ها","مدیریت مأموریت‌ها و اعزام‌ها","هماهنگی"],
      ["finance","◈","امور مالی","تراکنش‌ها و اقساط","مالی"],
      ["fund","▤","صندوق مجموعه","دریافت‌ها و گردش صندوق","مالی"],
      ["equipment","▣","تجهیزات و البسه","تحویل تجهیزات و پرداخت‌ها","پشتیبانی"],
      ["reports","▥","گزارش‌ساز مدیریتی","خلاصه داده‌های ثبت‌شده","تحلیل"],
      ["users","♧","کاربران و دسترسی‌ها","حساب‌ها و نقش‌های قابل مشاهده","مدیریت سامانه"],
      ["settings","⚙","تنظیمات سامانه","تنظیمات و وضعیت اتصال","مدیریت سامانه"]
    ];
    const errorItems = Object.entries(state.errors).filter(([,e])=>e);
    return `
      <div class="kj-workspace-head">
        <div class="kj-breadcrumb"><span>میزکار</span><span>›</span><b>داشبورد مدیریتی</b></div>
        <div class="kj-workspace-tools"><span class="kj-date-chip">◷ ${esc(monthLabel)}</span><button type="button" class="kj-secondary" id="kj-dashboard-refresh">↻ به‌روزرسانی داده‌ها</button></div>
      </div>
      <section class="kj-hero kj-hero-enterprise kj-hero-premium">
        <div class="kj-hero-copy">
          <div class="kj-hero-kicker"><span class="kj-live-dot"></span> میزکار مدیریتی · سامانه عملیاتی</div>
          <h1>سلام، به میزکار مجموعه خوش آمدید</h1>
          <p class="kj-hero-subtitle">مجموعه خدام عتبات مقدسه السیدة زینب سلام الله علیها</p>
          <p>نمایی یکپارچه برای پایش وضعیت خادمین، برنامه‌های خدمت، هماهنگی جلسات و امور مالی؛ اطلاعات هر بخش بر اساس داده‌های قابل دسترس حساب شما نمایش داده می‌شود.</p>
          <div class="kj-hero-actions"><button class="kj-primary" data-quick-tab="khadems">＋ ثبت و مدیریت خادمین</button><button class="kj-hero-ghost" data-quick-tab="reports">مشاهده گزارش‌های مدیریتی ←</button></div>
        </div>
        <div class="kj-hero-emblem" aria-hidden="true"><span>🕌</span><small>خدمت صادقانه · نظم سازمانی</small><div class="kj-hero-orbit"></div></div>
        <div class="kj-hero-foot"><span>● اطلاعات متصل به سامانه</span><span>نمایش ${state.loaded?"داده‌های دریافت‌شده":"در انتظار دریافت داده‌ها"}</span></div>
      </section>
      ${state.loading ? `<div class="kj-card kj-loading-card"><span class="kj-spinner"></span> در حال همگام‌سازی اطلاعات سامانه…</div>` : ""}
      ${errorItems.length ? `<div class="kj-error kj-dashboard-error"><b>بعضی از داده‌ها دریافت نشده‌اند</b><p>آمار هر بخش فقط بر اساس داده‌های دریافت‌شده محاسبه شده است. خطاهای زیر را بررسی کنید.</p>${errorItems.map(([k,e])=>`<div>• ${esc(fieldLabel(k))}: ${esc(e)}</div>`).join("")}</div>` : ""}
      <div class="kj-section-heading kj-premium-section"><div><span class="kj-section-eyebrow">نمای کلی · ${esc(monthLabel)}</span><h2 class="kj-section-title">شاخص‌های کلیدی مجموعه</h2><p>مرور سریع وضعیت داده‌های ثبت‌شده در سامانه</p></div><span class="kj-data-note">به‌روزرسانی از پایگاه داده</span></div>
      <div class="kj-grid kj-stats-grid kj-premium-stats">${statCards.map((x,i)=>`<button type="button" class="kj-card kj-stat-card kj-stat-card-${i+1} kj-premium-stat ${x.tone}" data-quick-tab="${x.tab}"><div class="kj-stat-top"><span class="kj-stat-icon">${x.icon}</span><span class="kj-stat-label">${x.label}</span><span class="kj-stat-arrow">↗</span></div><div class="kj-stat">${fa(x.value)}</div><div class="kj-stat-foot">${x.meta}</div></button>`).join("")}</div>
      <div class="kj-analytics-layout">
        <section class="kj-card kj-analytics-main"><div class="kj-card-heading"><div><span class="kj-section-eyebrow">تحلیل داده‌ها</span><h3>مرکز تحلیل و گزارش</h3></div><button type="button" class="kj-text-action" data-quick-tab="reports">همه گزارش‌ها ←</button></div>${dashboardAnalytics()}</section>
        <aside class="kj-card kj-insight-panel"><div class="kj-card-heading"><div><span class="kj-section-eyebrow">نمای سریع</span><h3>وضعیت سامانه</h3></div><span class="kj-heading-icon">◉</span></div>
          <div class="kj-insight-row"><span class="kj-insight-icon">♙</span><div><b>خادمین فعال/قابل استفاده</b><small>بر اساس وضعیت ثبت‌شده</small></div><strong>${fa(activeKhadems)}</strong></div>
          <div class="kj-insight-row"><span class="kj-insight-icon">▦</span><div><b>جلسات ثبت‌شده</b><small>مجموع جلسات قابل مشاهده</small></div><strong>${fa(meetingCount)}</strong></div>
          <div class="kj-insight-row"><span class="kj-insight-icon">◈</span><div><b>جمع مبالغ تراکنش‌ها</b><small>بر مبنای فیلدهای مبلغ موجود</small></div><strong class="kj-insight-money">${esc(money(financeTotal))}</strong></div>
          <div class="kj-insight-foot">این ارقام خلاصه داده‌های موجودند و به‌تنهایی تأییدکننده صحت یا تکمیل همه سوابق نیستند.</div>
        </aside>
      </div>
      <div class="kj-section-heading kj-premium-section"><div><span class="kj-section-eyebrow">مسیرهای کاری</span><h2 class="kj-section-title">مرکز دسترسی به بخش‌ها</h2><p>ماژول‌ها بر اساس گردش کار مجموعه دسته‌بندی شده‌اند.</p></div></div>
      <div class="kj-module-groups">
        ${["مدیریت افراد","عملیات روزانه","هماهنگی","مالی","پشتیبانی","تحلیل","مدیریت سامانه"].map(group=>{const list=modules.filter(m=>m[4]===group);return list.length?`<section class="kj-module-group"><div class="kj-module-group-head"><h3>${group}</h3><span>${fa(list.length)} بخش</span></div><div class="kj-module-grid">${list.map(([tab,icon,title,desc])=>`<button type="button" class="kj-module-card" data-quick-tab="${tab}"><span class="kj-module-icon">${icon}</span><span class="kj-module-copy"><b>${title}</b><small>${desc}</small></span><span class="kj-module-arrow">←</span></button>`).join("")}</div></section>`:"";}).join("")}
      </div>
      <div class="kj-activity-layout">
        <section class="kj-card kj-activity-card"><div class="kj-card-heading"><div><span class="kj-section-eyebrow">سوابق اخیر</span><h3>آخرین خدمات ثبت‌شده</h3></div><button type="button" class="kj-text-action" data-quick-tab="services">مشاهده همه ←</button></div>
          ${state.errors.services||state.errors.service_records?errBox("services"):recentServices.length?tableHtml(recentServices.map(r=>({...r,khadem_name:nameOf(state.khadems.find(k=>String(khademId(k))===String(r.khadem_id))||{}),service_date:val(r,["service_date","date","created_at"])})),[{key:"khadem_name",label:"نام خادم"},{key:"service_date",label:"تاریخ خدمت"},{key:"service_type",label:"نوع خدمت"},{key:"responsibility",label:"مسئولیت"}],"سابقه‌ای ثبت نشده است."):`<div class="kj-empty">هنوز سابقه‌ای برای نمایش ثبت نشده است.</div>`}
        </section>
        <section class="kj-card kj-activity-card"><div class="kj-card-heading"><div><span class="kj-section-eyebrow">هماهنگی مجموعه</span><h3>جلسات اخیر</h3></div><button type="button" class="kj-text-action" data-quick-tab="meetings">مشاهده همه ←</button></div>
          ${state.errors.meetings?errBox("meetings"):recentMeetings.length?`<div class="kj-recent-list">${recentMeetings.map(m=>`<div class="kj-recent-item"><span class="kj-recent-mark">▦</span><div><b>${esc(val(m,["title","meeting_title","name"])||"جلسه مجموعه")}</b><small>${esc(dateText(val(m,["meeting_date","date","created_at"])))}</small></div><span class="kj-recent-arrow">←</span></div>`).join("")}</div>`:`<div class="kj-empty">جلسه‌ای برای نمایش ثبت نشده است.</div>`}
        </section>
      </div>
      <section class="kj-card kj-guide-card kj-premium-guide"><span class="kj-guide-icon">ⓘ</span><div><h3>درباره آمار این داشبورد</h3><p>شاخص‌ها از داده‌های قابل مشاهده در پایگاه داده محاسبه می‌شوند؛ بخش‌های دارای خطای دسترسی یا بارگذاری، جداگانه مشخص می‌شوند و با عدد صفرِ واقعی اشتباه گرفته نمی‌شوند.</p></div></section>`;
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

  function nextKhademCode() {
    const codes = state.khadems.map(k => {
      const raw = String(khademCode(k) ?? "").replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
      const digits = raw.replace(/[^0-9]/g, "");
      return digits ? Number(digits) : 0;
    }).filter(Number.isFinite);
    return Math.max(999, ...codes) + 1;
  }

  function khademRegistrationForm() {
    const skills = ["کمک‌های اولیه و امداد","امور پزشکی","آشپزی","پذیرایی و توزیع غذا","نظافت و خدمات عمومی","مدیریت موکب","برنامه‌ریزی و امور اجرایی","امور اداری و بایگانی","حسابداری و امور مالی","رایانه و فناوری اطلاعات","طراحی گرافیک","عکاسی و فیلم‌برداری","تدوین فیلم","روابط عمومی و رسانه","ترجمه عربی","ترجمه انگلیسی","رانندگی","تعمیرات برق","تعمیرات فنی","تأسیسات و لوله‌کشی","نجاری","انبارداری و تدارکات","راهنمایی زائران","امور فرهنگی و تبلیغی","مداحی و اجرای مراسم","صوت و تجهیزات مراسم","خیاطی","سایر مهارت‌ها"];
    const fields = [
      ["khadem_code","کد خادم (صدور خودکار)","text"],["full_name","نام و نام خانوادگی *","text"],["referrer_name","معرف خادم","text"],["father_name","نام پدر","text"],["national_code","کد ملی","text"],
      ["birth_date","تاریخ تولد","text"],["membership_date","تاریخ عضویت","text"],["phone","شماره تلفن خادم","tel"],["occupation","شغل","text"],
      ["primary_responsibility","مسئولیت اصلی","text"],["address","نشانی محل سکونت","text"],
      ["emergency_contact_name","تماس اضطراری ۱ — نام","text"],["emergency_contact_phone","تماس اضطراری ۱ — شماره تلفن","tel"],
      ["emergency_contact_name_2","تماس اضطراری ۲ — نام","text"],["emergency_contact_phone_2","تماس اضطراری ۲ — شماره تلفن","tel"]
    ];
    return `<form id="kj-registration-form" class="kj-card" style="margin:14px 0" novalidate>
      <h2 class="kj-section-title">فرم ثبت خادم جدید</h2>
      <div class="kj-registration-grid">${fields.map(([name,label,type])=>`<label class="kj-field ${name==="khadem_code"?"kj-code-field":name==="full_name"?"kj-name-field":""}"><b>${label}</b><input name="${name}" type="${type}" ${name==="full_name"?"required":""} ${name==="khadem_code"?'readonly inputmode="numeric" aria-readonly="true"':""} value="${name==="khadem_code"?fa(nextKhademCode()):""}" autocomplete="off" placeholder="${name==="full_name"?"نام و نام خانوادگی را وارد کنید":""}"></label>`).join("")}</div>
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
    // کد در لحظه ثبت دوباره از آخرین کد موجود محاسبه می‌شود؛ مقدار فرم صرفاً نمایشی است.
    const generatedCode = String(nextKhademCode());
    put(["khadem_code","personnel_code","code"],generatedCode);
    put(["father_name"],String(fd.get("father_name")||"").trim());
    put(["national_code","national_id"],String(fd.get("national_code")||"").trim());
    put(["birth_date"],jalaliToGregorian(String(fd.get("birth_date")||"").trim()));
    put(["membership_date"],jalaliToGregorian(String(fd.get("membership_date")||"").trim()));
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
    // اگر کد خادم در رکورد وجود دارد، همان مرجع قطعی است؛ شناسه داخلی فقط وقتی کد نیست بررسی می‌شود.
    if (rowCodes.length) return rowCodes.some(x => codes.includes(x));
    if (rowIds.length) return rowIds.some(x => ids.includes(x));
    const rowName = val(row, ["khadem_name", "person_name", "full_name"]);
    return Boolean(rowName && nameOf(khadem).trim().toLocaleLowerCase("fa") === String(rowName).trim().toLocaleLowerCase("fa"));
  }
  function relatedRows(list, khadem) { return list.filter(row => transactionBelongs(row, khadem)); }
  function relatedSection(title, tableKey, rows, columns, emptyText) {
    return `<h3 class="kj-section-title">${esc(title)}</h3>${errBox(tableKey)}${tableHtml(rows, columns, state.errors[tableKey] ? "به دلیل خطای دریافت، خالی بودن سوابق قابل تأیید نیست." : emptyText)}`;
  }
  function khademEditForm(k) {
    const skillOptions = ["کمک‌های اولیه و امداد","امور پزشکی","آشپزی","پذیرایی و توزیع غذا","نظافت و خدمات عمومی","مدیریت موکب","برنامه‌ریزی و امور اجرایی","امور اداری و بایگانی","حسابداری و امور مالی","رایانه و فناوری اطلاعات","طراحی گرافیک","عکاسی و فیلم‌برداری","تدوین فیلم","روابط عمومی و رسانه","ترجمه عربی","ترجمه انگلیسی","رانندگی","تعمیرات برق","تعمیرات فنی","تأسیسات و لوله‌کشی","نجاری","انبارداری و تدارکات","مدیریت جمعیت و راهنمایی زائران","امور فرهنگی و تبلیغی","مداحی و اجرای مراسم","صوت و تجهیزات مراسم","خیاطی","سایر مهارت‌ها"];
    const rawSkills = val(k,["skills","skill_list","abilities","special_skills"]);
    let currentSkills = [];
    if (Array.isArray(rawSkills)) currentSkills = rawSkills.map(x=>String(x).trim()).filter(Boolean);
    else if (rawSkills && typeof rawSkills === "object") currentSkills = Object.values(rawSkills).map(x=>String(x).trim()).filter(Boolean);
    else if (String(rawSkills || "").trim()) currentSkills = String(rawSkills).split(/[,،;؛\\n]+/).map(x=>x.trim()).filter(Boolean);
    const fields = [
      ["full_name","نام و نام خانوادگی","text",nameOf(k)],
      ["referrer_name","معرف خادم","text",val(k,["referrer_name","introducer_name","referred_by","referrer","referrer_full_name","introducer"]) || val(k?.extra_data||{},["referrer_name","introducer_name","referred_by","referrer"])],
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
      ["emergency_contact_name","نام تماس اضطراری ۱","text",val(k,["emergency_contact_name","emergency_contact_1_name","emergency_name"])],
      ["emergency_contact_phone","تلفن تماس اضطراری ۱","tel",val(k,["emergency_contact_phone","emergency_contact_1_phone","emergency_phone","emergency_phone_1"])],
      ["emergency_contact_name_2","نام تماس اضطراری ۲","text",val(k,["emergency_contact_name_2","emergency_contact_2_name","emergency_name_2"]) || val(k?.extra_data||{},["emergency_contact_name_2","emergency_contact_2_name","emergency_name_2"])],
      ["emergency_contact_phone_2","تلفن تماس اضطراری ۲","tel",val(k,["emergency_contact_phone_2","emergency_contact_2_phone","emergency_phone_2","emergency_contact2_phone"]) || val(k?.extra_data||{},["emergency_contact_phone_2","emergency_contact_2_phone","emergency_phone_2","emergency_contact2_phone"])],
      ["notes","توضیحات","text",val(k,["notes","description"])],
      ["active","وضعیت فعالیت (فعال/غیرفعال)","select",val(k,["is_active","active","status"])]
    ];
    return '<form id="kj-profile-edit-form" novalidate><div class="kj-profile-grid">' +
      fields.map(([name,label,type,value]) => '<label class="kj-field"><b>'+esc(label)+'</b>'+(type==="select"?'<select name="'+name+'"><option value="">انتخاب وضعیت</option><option value="true" '+([true,"true","active","فعال","1"].includes(value)?"selected":"")+'>فعال</option><option value="false" '+([false,"false","inactive","غیرفعال","0"].includes(value)?"selected":"")+'>غیرفعال</option></select>':'<input name="'+name+'" type="'+type+'" value="'+esc(value)+'" autocomplete="off" dir="auto" style="box-sizing:border-box;width:100%;max-width:100%;min-width:0;display:block">')+'</label>').join("") +
      '<fieldset class="kj-edit-skills" style="grid-column:1/-1;min-width:0;border:1px solid #ddd6ce;border-radius:12px;padding:12px;margin:8px 0"><legend>مهارت‌ها و توانمندی‌ها — برای انتخاب یا حذف، گزینه‌ها را علامت بزنید</legend><div class="kj-skill-list" style="display:flex;flex-wrap:wrap;gap:8px">'+skillOptions.map(s=>'<label class="kj-pill" style="display:inline-flex;align-items:center;gap:6px;max-width:100%;white-space:normal;overflow-wrap:anywhere"><input type="checkbox" name="profile_skills" value="'+esc(s)+'" '+(currentSkills.includes(s)?"checked":"")+'>'+esc(s)+'</label>').join("")+'</div><label class="kj-field" style="margin-top:10px"><b>مهارت‌های دیگر (اختیاری؛ با ویرگول جدا کنید)</b><input name="custom_skills" type="text" dir="auto" value="'+esc(currentSkills.filter(s=>!skillOptions.includes(s)).join("، "))+'" style="box-sizing:border-box;width:100%;max-width:100%;min-width:0"></label></fieldset>' +
      '</div><div id="kj-profile-edit-message" class="kj-muted" role="status" aria-live="polite"></div><div class="kj-toolbar"><button class="kj-primary" id="kj-save-profile" type="submit">ذخیره تغییرات</button><button class="kj-secondary" type="button" id="kj-cancel-profile-edit">انصراف</button></div></form>';
  }
  async function saveKhademProfile(form) {
    const k = selectedKhademRecord();
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
    put(["emergency_contact_name","emergency_contact_1_name","emergency_name"], fd.get("emergency_contact_name"));
    put(["emergency_contact_phone","emergency_contact_1_phone","emergency_phone","emergency_phone_1"], fd.get("emergency_contact_phone"));
    put(["emergency_contact_name_2","emergency_contact_2_name","emergency_name_2"], fd.get("emergency_contact_name_2"));
    put(["emergency_contact_phone_2","emergency_contact_2_phone","emergency_phone_2","emergency_contact2_phone"], fd.get("emergency_contact_phone_2"));
    put(["notes","description"], fd.get("notes"));
    const selectedSkills = fd.getAll("profile_skills").map(x=>String(x).trim()).filter(Boolean);
    const customSkills = String(fd.get("custom_skills") || "").split(/[,،;؛\\n]+/).map(x=>x.trim()).filter(Boolean);
    const allSkills = [...new Set([...selectedSkills, ...customSkills])];
    const skillsKey = ["skills","skill_list","abilities","special_skills"].find(x=>known.has(x));
    if (skillsKey) {
      const existingSkills = k[skillsKey];
      payload[skillsKey] = Array.isArray(existingSkills) ? allSkills : (existingSkills && typeof existingSkills === "object" ? allSkills : allSkills.join("، "));
    }
    const extraKey = known.has("extra_data") ? "extra_data" : null;
    let existingExtra = k.extra_data; if (typeof existingExtra === "string") { try { existingExtra = JSON.parse(existingExtra); } catch (_) { existingExtra = {}; } } const extra = extraKey && existingExtra && typeof existingExtra === "object" && !Array.isArray(existingExtra) ? {...existingExtra} : {};
    const setExtraFallback = (aliases, formKey) => {
      const value = String(fd.get(formKey) || "").trim();
      if (!aliases.some(x => known.has(x)) && extraKey) {
        if (value) extra[formKey] = value;
        else delete extra[formKey];
      }
    };
    put(["referrer_name","introducer_name","referred_by","referrer","referrer_full_name","introducer"], fd.get("referrer_name"));
    if (extraKey) {
      const setExtraValue = (key, value) => { const text = String(value || "").trim(); if (text) extra[key] = text; else delete extra[key]; };
      setExtraValue("referrer_name", fd.get("referrer_name"));
      setExtraValue("emergency_contact_name_2", fd.get("emergency_contact_name_2"));
      setExtraValue("emergency_contact_phone_2", fd.get("emergency_contact_phone_2"));
      if (Object.keys(extra).length || Object.keys(existingExtra || {}).length) payload.extra_data = extra;
    }
    const activeValue = String(fd.get("active") || "").toLowerCase();
    if (activeValue) { if (known.has("is_active")) payload.is_active = activeValue === "true"; else if (known.has("active")) payload.active = activeValue === "true"; else if (known.has("status")) payload.status = activeValue === "true" ? "active" : "inactive"; }
    if (!Object.keys(payload).length) { if(message) message.textContent = "ستون‌های قابل ویرایش در ساختار فعلی پیدا نشد."; return; }
    const id = khademId(k);
    const filter = id ? "id=eq."+encodeURIComponent(id) : (khademCode(k) ? "khadem_code=eq."+encodeURIComponent(khademCode(k)) : "");
    if (!filter) { if(message) message.textContent = "شناسه خادم برای ذخیره تغییرات در دسترس نیست."; return; }
    if (button) { button.disabled = true; button.textContent = "در حال ذخیره…"; }
    if (message) message.textContent = "در حال ذخیره تغییرات…";
    try {
      const savedRows = await request("/rest/v1/khadems?"+filter, {method:"PATCH", body:payload, headers:{"Prefer":"return=representation"}});
      if (!Array.isArray(savedRows) || savedRows.length === 0) throw new Error("پایگاه داده هیچ ردیفی را به‌روزرسانی نکرد؛ شناسه خادم یا مجوز ویرایش را بررسی کنید.");
      state.profileEditOpen = false;
      const access = await request("/functions/v1/manage-user-permissions", { method: "POST", body: { action: "my_permissions" } });
      state.role = access.role || approvedProfile.role || "user";
      state.accessPermissions = access.permissions && typeof access.permissions === "object" ? access.permissions : null;
      state.accessCustom = !!state.accessPermissions;
      if (!canAccess(state.tab)) state.tab = "dashboard";
      if (!canAccess(state.tab)) state.tab = "dashboard";
      await loadData();
      state.selectedKhadem = "code:" + String(khademCode(k));
      render();
      toast("تغییرات پرونده خادم ذخیره شد.","success");
    } catch (error) {
      if (message) message.textContent = "ذخیره انجام نشد: "+(error.message || "خطای نامشخص")+"؛ ممکن است مجوز ویرایش پایگاه داده فعال نباشد.";
      if (button) { button.disabled = false; button.textContent = "ذخیره تغییرات"; }
    }
  }

  function khademProfile() {
    const k = selectedKhademRecord();
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
      <div class="kj-card"><div class="kj-toolbar" style="justify-content:space-between"><h3 class="kj-section-title" style="margin:0">پرونده خادم: ${esc(khademIdentityText(k))}</h3><button type="button" class="kj-primary" id="kj-edit-profile">${state.profileEditOpen?"بستن ویرایش":"✏️ ویرایش مشخصات خادم"}</button></div><div class="kj-profile-details">${state.profileEditOpen ? khademEditForm(k) : fields}</div></div>
      <div class="kj-card" style="margin-top:14px"><details class="kj-profile-subsection">
        <summary class="kj-section-title">☎️ تماس‌ها و شماره‌های ضروری</summary>
        ${tableHtml([{contact_type:"شماره تماس اصلی",contact_name:"خود خادم",contact_phone:val(k,["phone","mobile","phone_number"])},{contact_type:"تماس اضطراری ۱",contact_name:val(k,["emergency_contact_name","emergency_contact_1_name"]),contact_phone:val(k,["emergency_contact_phone","emergency_contact_1_phone","emergency_phone"])},{contact_type:"تماس اضطراری ۲",contact_name:val(k,["emergency_contact_name_2","emergency_contact_2_name","emergency_name_2"]) || val(k?.extra_data||{},["emergency_contact_name_2","emergency_contact_2_name","emergency_name_2"]),contact_phone:val(k,["emergency_contact_phone_2","emergency_contact_2_phone","emergency_phone_2","emergency_contact2_phone"]) || val(k?.extra_data||{},["emergency_contact_phone_2","emergency_contact_2_phone","emergency_phone_2","emergency_contact2_phone"])}],[{key:"contact_type",label:"نوع تماس"},{key:"contact_name",label:"نام مخاطب"},{key:"contact_phone",label:"شماره تلفن"}],"شماره تماسی برای نمایش ثبت نشده است.")}
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
      const linked = (rowCode ? khademByCode(rowCode) : null) ||
        (rowId ? state.khadems.find(k => String(khademId(k)) === String(rowId)) : null) ||
        (rowName ? state.khadems.find(k => nameOf(k).trim().toLocaleLowerCase("fa") === String(rowName).trim().toLocaleLowerCase("fa")) : null);
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

  function serviceRegisterPage() {
    const q=String($("#kj-service-khadem-search")?.value||"").trim().toLocaleLowerCase("fa");
    const matches=state.khadems.filter(k=>(String(khademCode(k)||"")+" "+nameOf(k)).toLocaleLowerCase("fa").includes(q));
    const people=matches.map(k=>`<label class="kj-service-participant"><input type="checkbox" name="service_participants" value="${esc(khademCode(k))}"><span><b>${esc(nameOf(k))}</b><small>کد خادم: ${esc(fa(khademCode(k)||"—"))}</small></span></label>`).join("")||empty("خادمی با این نام یا کد پیدا نشد.");
    return `<h1 class="kj-page-title">ثبت خدمت</h1>${errBox("services")}
    <section class="kj-card kj-official-service-card"><h2 class="kj-section-title">ثبت خدمت جدید</h2>
    <p class="kj-muted">اطلاعات برنامه را وارد کنید و همه خادمین شرکت‌کننده را انتخاب کنید؛ برای هر خادم یک سابقه خدمت ثبت می‌شود.</p>
    <form id="kj-official-service-form"><label>نوع ثبت خدمت<select name="service_kind" required><option value="official">ثبت خدمت رسمی</option><option value="friday">ثبت خدمت شب جمعه</option></select></label><div class="kj-official-service-grid">
    <label>عنوان / نوع خدمت<input name="service_title" required placeholder="مثلاً خدمت رسمی اربعین"></label>
    <label>حرم محل خدمت<input name="shrine_name" required placeholder="مثلاً حرم امام حسین (ع)"></label>
    <label>تاریخ حرکت از مبدأ<input name="departure_date" required placeholder="۱۴۰۵/۰۴/۲۲"></label>
    <label>تاریخ حضور در مقصد<input name="arrival_date" required placeholder="۱۴۰۵/۰۴/۲۳"></label>
    <label>تاریخ شروع خدمت<input name="service_date" required placeholder="۱۴۰۵/۰۴/۲۵"></label>
    <label>تاریخ پایان خدمت<input name="service_end_date" required placeholder="۱۴۰۵/۰۴/۳۰"></label>
    <label>مسئولیت خادمین<input name="responsibility" required placeholder="مثلاً خادم سالن یا آشپزخانه"></label>
    <label>نام گروه / کاروان<input name="group_name" placeholder="اختیاری"></label></div>
    <label class="kj-service-notes-label">توضیحات تکمیلی<textarea name="notes" rows="3" placeholder="مسیر، محل اسکان یا هماهنگی‌ها"></textarea></label>
    <div class="kj-service-participants-heading"><h3>انتخاب خادمین شرکت‌کننده</h3><span id="kj-service-selected-count" class="kj-service-count">۰ خادم انتخاب شده</span></div>
    <input id="kj-service-khadem-search" type="search" placeholder="جست‌وجوی کد یا نام خادم" autocomplete="off">
    <div class="kj-service-participant-list" id="kj-service-participant-list">${people}</div>
    <div class="kj-service-form-actions"><button type="submit" class="kj-primary" id="kj-save-official-service">ثبت خدمت و خادمین</button><span id="kj-official-service-message" class="kj-muted" role="status"></span></div></form></section>`;
  }

  function isFridayService(r) {
    const classification = [r.service_kind, r.category, r.service_type, r.type].filter(Boolean).join(" ").toLocaleLowerCase("fa");
    const title = [r.service_title, r.title, r.service_name].filter(Boolean).join(" ").toLocaleLowerCase("fa");
    const details = [r.description, r.notes, r.note].filter(Boolean).join(" ").toLocaleLowerCase("fa");
    return /شب\s*جمعه|friday/i.test(classification) || /شب\s*جمعه|friday/i.test(title) || /نوع ثبت:\s*ثبت خدمت شب جمعه/i.test(details);
  }

  function serviceHistoryDate(row) {
    const raw = String(val(row, ["service_date", "date", "created_at"]) || "").trim();
    return raw ? raw.slice(0, 10) : "بدون تاریخ";
  }
  function responsibilityFromNotes(value) {
    const match = String(value || "").match(/مسئولیت:\s*([^\r\n]+)/);
    return match ? match[1].trim() : "";
  }
  function serviceHistoryRows(kind) {
    return state.services.filter(r => kind === "friday" ? isFridayService(r) : !isFridayService(r)).map(r => {
      const linkedKhadem = state.khadems.find(k => String(khademId(k)) === String(r.khadem_id) || (r.khadem_code != null && String(khademCode(k)) === String(r.khadem_code))) || {};
      return { ...r, khadem_name: val(r, ["khadem_name", "full_name", "person_name"]) || nameOf(linkedKhadem), khadem_code: val(r, ["khadem_code", "personnel_code", "code"]) || khademCode(linkedKhadem), service_date: val(r, ["service_date", "date", "created_at"]), service_title: val(r, ["service_title", "title", "service_name", "service_type"]) || "خدمت ثبت‌شده", shrine_name: val(r, ["shrine_name", "shrine", "holy_site", "destination", "service_location"]), responsibility: val(r, ["responsibility", "role", "service_role"]) || responsibilityFromNotes(val(r, ["notes", "description", "note"])), notes: val(r, ["notes", "description", "note"]) };
    });
  }
  function serviceHistoryPage(kind) {
    const rows = serviceHistoryRows(kind), groups = new Map();
    rows.forEach(row => { const date = serviceHistoryDate(row); if (!groups.has(date)) groups.set(date, []); groups.get(date).push(row); });
    const dates = [...groups.keys()].sort((a,b) => b.localeCompare(a));
    const title = kind === "friday" ? "سوابق خدمت شب‌های جمعه" : "سوابق خدمت رسمی";
    const list = dates.length ? '<div class="kj-card kj-service-history-dates" role="list">' + dates.map(date => '<button type="button" class="kj-service-history-date" data-service-kind="' + esc(kind) + '" data-service-date="' + esc(date) + '"><span>' + esc(date === "بدون تاریخ" ? date : jalaliInputDate(date)) + '</span><span aria-hidden="true">←</span></button>').join("") + '</div>' : empty(state.errors.services ? "دریافت سوابق خدمت ناموفق بود." : "هنوز سابقه خدمتی ثبت نشده است.");
    return '<h1 class="kj-page-title">' + title + '</h1>' + errBox("services") + list;
  }
  function officialServicesPage() { return serviceHistoryPage("official"); }
  function fridayPage() { return serviceHistoryPage("friday"); }
  function openServiceHistoryDate(kind, date) {
    const normalizeDate = value => {
      const raw = String(value || "").trim().replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replaceAll("/", "-");
      if (raw === "بدون تاریخ") return raw;
      return raw.slice(0, 10);
    };
    const rows = serviceHistoryRows(kind).filter(row => normalizeDate(serviceHistoryDate(row)) === normalizeDate(date));
    if (!rows.length) {
      modal(kind === "friday" ? "جزئیات خدمت شب‌های جمعه" : "جزئیات خدمت رسمی", '<div class="kj-empty">جزئیات این تاریخ پیدا نشد. لطفاً صفحه را تازه‌سازی کنید و دوباره تلاش کنید.</div>');
      return;
    }
    const title = kind === "friday" ? "جزئیات خدمت شب‌های جمعه" : "جزئیات خدمت رسمی";
    const titles = [...new Set(rows.map(r => r.service_title).filter(Boolean))], shrines = [...new Set(rows.map(r => r.shrine_name).filter(Boolean))];
    const participants = rows.map((r,i) => "<tr><td>" + fa(i+1) + "</td><td>" + esc(r.khadem_name || "بدون نام") + "</td><td>" + esc(r.khadem_code || "—") + "</td><td>" + esc(r.responsibility || "ثبت نشده") + "</td></tr>").join("");
    const detailLines = [...new Set(rows.map(r => String(r.notes || "").split("\\n").filter(line => line && !/^(نوع ثبت|عنوان خدمت|حرم محل خدمت|حرکت از مبدأ|حضور در مقصد|شروع خدمت|پایان خدمت|مسئولیت):/.test(line)).join("؛ ")).filter(Boolean))];
    const body = '<div class="kj-service-history-summary"><p><b>تاریخ خدمت:</b> ' + esc(date === "بدون تاریخ" ? date : jalaliInputDate(date)) + "</p>" + (titles.length ? "<p><b>عنوان خدمت:</b> " + esc(titles.join("، ")) + "</p>" : "") + (shrines.length ? "<p><b>محل خدمت:</b> " + esc(shrines.join("، ")) + "</p>" : "") + (detailLines.length ? "<p><b>توضیحات:</b> " + esc(detailLines.join("؛ ")) + "</p>" : "") + "<p><b>تعداد خادمین:</b> " + fa(rows.length) + " نفر</p></div><div class=\"kj-table-wrap\"><table><thead><tr><th>ردیف</th><th>نام خادم</th><th>کد خادم</th><th>مسئولیت</th></tr></thead><tbody>" + participants + "</tbody></table></div>";
    modal(title, body);
  }
  function bindOfficialServiceForm() {
    const form=$("#kj-official-service-form"); if(!form)return;
    const search=$("#kj-service-khadem-search"), list=$("#kj-service-participant-list");
    const count=()=>{const n=$('input[name="service_participants"]:checked',form).length;const el=$("#kj-service-selected-count");if(el)el.textContent=fa(n)+" خادم انتخاب شده";};
    search?.addEventListener("input",()=>{const q=String(search.value||"").trim().toLocaleLowerCase("fa");$$(".kj-service-participant",list).forEach(el=>el.hidden=Boolean(q&&!el.textContent.toLocaleLowerCase("fa").includes(q)));});
    list?.addEventListener("change",count);
    form.addEventListener("submit",e=>{e.preventDefault();saveOfficialService(form);}); count();
  }

  async function saveOfficialService(form) {
    const msg=$("#kj-official-service-message"),btn=$("#kj-save-official-service"),fd=new FormData(form);
    const codes=fd.getAll("service_participants").map(v=>String(v).trim()).filter(Boolean),get=k=>String(fd.get(k)||"").trim();
    if(!codes.length){if(msg)msg.textContent="حداقل یک خادم را انتخاب کنید.";return;}
    const kind=get("service_kind")==="friday"?"friday":"official";
    const dateFields=[["departure_date","تاریخ حرکت از مبدأ"],["arrival_date","تاریخ حضور در مقصد"],["service_date","تاریخ شروع خدمت"],["service_end_date","تاریخ پایان خدمت"]];
    const normalizedDates={};
    for(const [key,label] of dateFields){
      const raw=get(key).replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replaceAll("-","/");
      const iso=jalaliToGregorian(raw);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(String(iso))){if(msg)msg.textContent=label+" را با قالب سال/ماه/روز وارد کنید؛ نمونه: ۱۴۰۵/۰۷/۱۲. تاریخ واردشده معتبر نیست.";return;}
      const parts=iso.split("-").map(Number), check=new Date(Date.UTC(parts[0],parts[1]-1,parts[2]));
      if(check.getUTCFullYear()!==parts[0]||check.getUTCMonth()!==parts[1]-1||check.getUTCDate()!==parts[2]){if(msg)msg.textContent=label+" معتبر نیست؛ تاریخ را بررسی کنید.";return;}
      normalizedDates[key]=iso;
    }
    const f={kind,service_title:get("service_title"),shrine_name:get("shrine_name"),departure_date:normalizedDates.departure_date,arrival_date:normalizedDates.arrival_date,service_date:normalizedDates.service_date,service_end_date:normalizedDates.service_end_date,responsibility:get("responsibility"),group_name:get("group_name"),notes:get("notes")};
    const people=codes.map(code=>state.khadems.find(k=>String(khademCode(k))===code)).filter(Boolean);
    if(people.length!==codes.length){if(msg)msg.textContent="یکی از خادمین انتخاب‌شده پیدا نشد؛ اطلاعات را تازه‌سازی کنید.";return;}
    const known=new Set(Object.keys(state.services[0]||{})),infer=known.size>0;
    const aliases={service_title:["service_title","title","service_name","program_name"],shrine_name:["shrine_name","shrine","holy_site","destination","service_location"],departure_date:["departure_date","move_date","departure_at"],arrival_date:["arrival_date","arrived_at","arrival_at"],service_date:["service_date","date","start_date"],service_end_date:["service_end_date","end_date","finish_date"],responsibility:["responsibility","role","service_role"],group_name:["group_name","caravan_name","team_name"]};
    const details=["نوع ثبت: "+(f.kind==="friday"?"ثبت خدمت شب جمعه":"ثبت خدمت رسمی"),"عنوان خدمت: "+f.service_title,"حرم محل خدمت: "+f.shrine_name,"حرکت از مبدأ: "+f.departure_date,"حضور در مقصد: "+f.arrival_date,"شروع خدمت: "+f.service_date,"پایان خدمت: "+f.service_end_date,"مسئولیت: "+f.responsibility,f.group_name?"گروه/کاروان: "+f.group_name:"",f.notes?"توضیحات: "+f.notes:""].filter(Boolean).join("\n");
    const payloads=people.map(k=>{
      const p={},put=(key,v)=>{if(!v)return;const col=infer?aliases[key].find(x=>known.has(x)):aliases[key][0];if(col)p[col]=v;};
      const codeCol=infer?["khadem_code","personnel_code","code"].find(x=>known.has(x)):"khadem_code";
      const nameCol=infer?["khadem_name","full_name","person_name"].find(x=>known.has(x)):null;
      const idCol=infer?["khadem_id","person_id","personnel_id"].find(x=>known.has(x)):null;
      if(codeCol)p[codeCol]=khademCode(k);if(nameCol)p[nameCol]=nameOf(k);if(idCol&&khademId(k))p[idCol]=khademId(k);
      const typeCol=infer?["service_kind","category","service_type","type"].find(x=>known.has(x)):"service_type";if(typeCol)p[typeCol]=f.kind==="friday"?"شب جمعه":"خدمت رسمی";
      if(infer) Object.keys(aliases).filter(key=>key!=="service_title").forEach(key=>put(key,f[key]));
      const titleCol=infer?["service_title","title","service_name","program_name"].find(x=>known.has(x)&&x!==typeCol):null;if(titleCol)p[titleCol]=f.service_title;
      if(!infer){ if(f.service_date)p.service_date=f.service_date; if(f.responsibility)p.responsibility=f.responsibility; }
      else { if(f.service_date)p.service_date=f.service_date; if(f.responsibility)p.responsibility=f.responsibility; }
      const notesCol=infer?["notes","description","details"].find(x=>known.has(x)):"notes";
      if(notesCol)p[notesCol]=details;else if(infer){const extra= ["extra_data","metadata","details_json"].find(x=>known.has(x));if(extra)p[extra]=f;}
      return p;
    });
    if(btn){btn.disabled=true;btn.textContent="در حال ثبت…";}if(msg)msg.textContent="در حال ثبت خدمت برای "+fa(people.length)+" خادم…";
    try{
      const result=await request("/rest/v1/service_records",{method:"POST",headers:{"Prefer":"return=representation"},body:payloads});
      if(!Array.isArray(result)||result.length!==payloads.length)throw new Error("تأیید کامل ثبت از پایگاه داده دریافت نشد.");
      await loadData();state.tab=kind==="friday"?"friday":"services";render();toast((kind==="friday"?"خدمت شب جمعه":"خدمت رسمی")+" برای "+fa(result.length)+" خادم ثبت شد.","success");
    }catch(e){if(msg)msg.textContent="ثبت انجام نشد: "+(e.message||"خطای نامشخص")+"؛ ساختار پایگاه داده تغییر داده نشده است.";if(btn){btn.disabled=false;btn.textContent="ثبت خدمت و خادمین";}}
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
    return `<h1 class="kj-page-title">کاربران و دسترسی‌ها</h1>
      <p class="kj-muted">مدیریت تأیید ثبت‌نام و تعیین نقش از پنل امن مدیر اصلی انجام می‌شود؛ سرور مجوز مدیر را پیش از هر عملیات بررسی می‌کند.</p>
      <div class="kj-card" style="margin-bottom:14px">
        <h2 class="kj-section-title">دسترسی اختصاصی هر مدیر و کاربر</h2>
        <p>برای هر حساب می‌توانید منوهای قابل مشاهده و قابل ورود را جداگانه تنظیم کنید؛ این تنظیمات به همان حساب اختصاص دارد.</p>
        <a class="kj-primary" href="./admin-permissions.html" style="display:inline-flex;align-items:center;justify-content:center;text-decoration:none">مدیریت جزئی دسترسی‌ها ←</a>
      </div>
      <div class="kj-card" style="margin-bottom:14px">
        <h2 class="kj-section-title">تأیید ثبت‌نام و تعیین نقش کاربران</h2>
        <p>در این بخش می‌توانید درخواست‌های ثبت‌نام را بررسی کنید، حساب را تأیید یا رد کنید و برای کاربران تأییدشده نقش «کاربر» یا «مدیر» تعیین کنید. نقش «مدیر اصلی» از این پنل قابل تغییر نیست.</p>
        <a class="kj-primary" href="./admin-users.html" style="display:inline-flex;align-items:center;justify-content:center;text-decoration:none">باز کردن پنل امن مدیریت کاربران ←</a>
      </div>
      <div class="kj-card">${errBox("profiles")}${genericPage("profiles","حساب‌های قابل مشاهده",state.profiles,[{key:"display_name",label:"نام نمایشی"},{key:"full_name",label:"نام کامل"},{key:"role",label:"نقش"},{key:"is_active",label:"فعال"}])}</div>
      <div class="kj-card" style="margin-top:14px">${errBox("roles")}${genericPage("roles","نقش‌های تعریف‌شده",state.roles,[{key:"role_key",label:"شناسه نقش"},{key:"title",label:"عنوان"},{key:"is_system",label:"نقش سیستمی"}])}</div>
      <div class="kj-card" style="margin-top:14px">${errBox("permissions")}${genericPage("permissions","مجوزهای تعریف‌شده",state.permissions,[{key:"permission_key",label:"شناسه مجوز"},{key:"title",label:"عنوان مجوز"}])}</div>
      <div class="kj-card" style="margin-top:14px">${errBox("rolePermissions")}${genericPage("rolePermissions","ارتباط نقش و مجوز",state.rolePermissions,[{key:"role_id",label:"شناسه نقش"},{key:"permission_id",label:"شناسه مجوز"}])}</div>`;
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

  function changePasswordPage() {
    return `<h1 class="kj-page-title">تغییر رمز عبور</h1><p class="kj-muted">رمز عبور حساب فعلی را تغییر دهید. این گزینه فقط در زیرمنوی «مدیریت سامانه» قرار دارد.</p><div class="kj-card" style="max-width:620px"><form id="kj-change-password-form" autocomplete="off"><div class="kj-field"><label for="kj-new-password">رمز عبور جدید</label><input id="kj-new-password" name="password" type="password" minlength="8" autocomplete="new-password" required placeholder="حداقل ۸ نویسه"></div><div class="kj-field"><label for="kj-confirm-password">تکرار رمز عبور جدید</label><input id="kj-confirm-password" name="password_confirm" type="password" minlength="8" autocomplete="new-password" required placeholder="رمز جدید را دوباره وارد کنید"></div><p id="kj-change-password-message" class="kj-small" role="status" aria-live="polite"></p><button class="kj-primary" id="kj-change-password-submit" type="submit">ذخیره رمز جدید</button></form></div>`;
  }
  async function savePasswordChange(form) {
    const password = String(form.elements.password?.value || "");
    const confirm = String(form.elements.password_confirm?.value || "");
    const message = $("#kj-change-password-message");
    const button = $("#kj-change-password-submit");
    if (password.length < 8) { if (message) message.textContent = "رمز عبور باید حداقل ۸ نویسه داشته باشد."; return; }
    if (password !== confirm) { if (message) message.textContent = "رمز عبور و تکرار آن یکسان نیستند."; return; }
    if (!token() || token() === "demo") { if (message) message.textContent = "نشست ورود معتبر نیست؛ دوباره وارد سامانه شوید."; return; }
    if (button) { button.disabled = true; button.textContent = "در حال ذخیره…"; }
    if (message) message.textContent = "در حال تغییر رمز عبور…";
    try {
      await request("/auth/v1/user", { method: "PUT", body: { password } });
      form.reset();
      if (message) message.textContent = "رمز عبور با موفقیت تغییر کرد."; 
      toast("رمز عبور با موفقیت تغییر کرد.", "success");
    } catch (e) {
      if (message) message.textContent = "تغییر رمز انجام نشد: " + (e?.message || "خطای نامشخص");
      toast("تغییر رمز عبور انجام نشد.", "error");
    } finally {
      if (button) { button.disabled = false; button.textContent = "ذخیره رمز جدید"; }
    }
  }
  function render() {
    if (!token()) { loginPage(); return; }
    if (!canAccess(state.tab)) {
      state.tab = "dashboard";
      state.selectedKhadem = null;
    }
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
      serviceRegister: serviceRegisterPage,
      services: officialServicesPage,
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
      settings: settingsPage,
      changePassword: changePasswordPage,
    };
    main.innerHTML = (views[state.tab] || dashboard)();
    if(state.tab==="serviceRegister") bindOfficialServiceForm();
    if (state.tab === "changePassword") $("#kj-change-password-form")?.addEventListener("submit", e => { e.preventDefault(); savePasswordChange(e.currentTarget); });
    $$("[data-quick-tab]", main).forEach(button => button.addEventListener("click", () => {
      state.tab = button.dataset.quickTab; state.selectedKhadem = null;
      render();
      window.scrollTo({top:0,behavior:"smooth"});
    }));
    if (state.tab === "services" || state.tab === "friday") {
      main.addEventListener("click", event => {
        const button = event.target.closest(".kj-service-history-date");
        if (!button || !main.contains(button)) return;
        event.preventDefault();
        event.stopPropagation();
        const kind = button.dataset.serviceKind || (state.tab === "friday" ? "friday" : "official");
        openServiceHistoryDate(kind, button.dataset.serviceDate || "");
      });
      const mountAbsencePanel = () => {
        if ((state.tab === "services" || state.tab === "friday") && window.KhademEquipmentFinance && typeof window.KhademEquipmentFinance.appendNonattendanceToServicePage === "function") {
          window.KhademEquipmentFinance.appendNonattendanceToServicePage(state.tab);
        }
      };
      if (window.KhademEquipmentFinance && typeof window.KhademEquipmentFinance.appendNonattendanceToServicePage === "function") {
        window.setTimeout(mountAbsencePanel, 0);
      } else if (!document.querySelector("script[data-kj-absence-loader]")) {
        const script = document.createElement("script");
        script.src = "./equipment-finance.js?v=20261016-42";
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
    if (["nonattendance","meetings","deployments","finance","fund","donors"].includes(state.tab)) {
      const key = ({nonattendance:"nonattendance",meetings:"meetings",deployments:"deployments",finance:"finance",fund:"fund",donors:"donors"})[state.tab];
      const rows = state[key];
      attachRowDetails(main, rows, "جزئیات رکورد");
    }
    $("#kj-settings-refresh")?.addEventListener("click", loadData);
    $("#kj-dashboard-refresh")?.addEventListener("click", loadData);
  }
  function bindKhademButtons() {
    const main = $("#kj-main");
    if (!main) return;
    const q = state.search.trim().toLowerCase();
    const rows = state.khadems.filter(k => Number(String(khademCode(k)).replace(/[^0-9]/g,"")) >= 1000 && (!q || [nameOf(k),khademCode(k),val(k,["phone","mobile"]),val(k,["national_code"])].join(" ").toLowerCase().includes(q))).sort((a,b)=>Number(String(khademCode(a)).replace(/[^0-9]/g,""))-Number(String(khademCode(b)).replace(/[^0-9]/g,"")));
    $$("[data-row]", main).forEach(b => b.addEventListener("click", () => {
      const k = rows[Number(b.dataset.row)];
      if (!k) return;
      state.selectedKhadem = "code:" + String(khademCode(k));
      render();
    }));
  }

  async function startApp() {
    const allowedTabs = new Set(["dashboard","khadems","serviceRegister","services","friday","nonattendance","deployments","meetings","finance","fund","donors","equipment","reports","audit","users","settings","changePassword"]);
    const requestedTab = window.location.hash.replace(/^#/, "");
    if (allowedTabs.has(requestedTab)) state.tab = requestedTab;
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
      const access = await request("/functions/v1/manage-user-permissions", { method: "POST", body: { action: "my_permissions" } });
      if (!access || !access.role) throw new Error("بررسی نقش و دسترسی حساب ناموفق بود.");
      state.role = access.role;
      state.accessPermissions = access.permissions && typeof access.permissions === "object" ? access.permissions : null;
      state.accessCustom = !!state.accessPermissions;
      // حساب ثبت‌نامی تا تأیید مدیر اصلی اجازه دریافت هیچ داده‌ای از سامانه را ندارد.
      const profileRows = await request("/rest/v1/profiles?select=is_active,role&id=eq." + encodeURIComponent(authUser.id) + "&limit=1");
      const approvedProfile = Array.isArray(profileRows) ? profileRows[0] : null;
      if (!approvedProfile || approvedProfile.is_active !== true) {
        loginPage("درخواست حساب شما ثبت شده اما هنوز توسط مدیر اصلی تأیید نشده است. پس از تأیید، با همین ایمیل و رمز دوباره وارد شوید.");
        return;
      }
      // مجوزها در فراخوانی my_permissions بالا دریافت شده‌اند؛ از تعریف دوباره const access جلوگیری شود.
      // مدیر اصلی فقط با ایمیل تعیین‌شده در کنترل‌های سمت سرور شناسایی می‌شود.
      state.isPrimaryAdmin = String(authUser.email || "").trim().toLowerCase() === "da.adelian@gmail.com";
      state.accessLoaded = true;
      if (!canAccess(state.tab)) {
        state.tab = "dashboard";
        state.selectedKhadem = null;
        history.replaceState(null, "", window.location.pathname + window.location.search + "#dashboard");
      }
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
