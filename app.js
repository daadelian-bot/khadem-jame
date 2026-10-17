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
  const REFRESH_TOKEN_KEY = "kj_refresh_token";
  const USER_KEY = "kj_user";
  const RELEASE_VERSION = "2026.10.17.18";
  const RELEASE_SEEN_KEY = "kj_release_seen_version";
  const TIMEOUT_MS = 20000;

  const state = {
    tab: "dashboard",
    role: "user",
    accessPermissions: null,
    isPrimaryAdmin: false,
    accessCustom: false,
    accessFull: false,
    accessLoaded: false,
    khadems: [],
    services: [],
    nonattendance: [],
    meetings: [],
    deployments: [],
    finance: [],
    financePricing: [],
    financeAccounts: [],
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
    presenceProfiles: [],
    presenceRows: [],
    presenceExpanded: false,
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
    showKhademPhotos: false,
    birthdayMonth: null,
    loading: false,
    errors: {},
    loaded: false,
    offlineMode: false,
    offlineSnapshots: {},
    offlinePendingCount: 0,
    offlineReviewCount: 0,
    syncingOfflineOutbox: false
  };

  let financeView = "overview";
  let financeSearch = "";
  let financeTypeFilter = "all";
  let financeCategoryFilter = "all";
  let financeStatusFilter = "all";

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

  // Refresh tokens are kept locally and are never exposed in the UI or sent to non-auth endpoints.
  let refreshInFlight = null;
  let sessionExpiredMessage = "";
  async function refreshSession() {
    if (refreshInFlight) return refreshInFlight;
    refreshInFlight = (async function () {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || "";
      if (!refreshToken) {
        const error = new Error("نشست ورود منقضی شده است؛ برای ادامه یک‌بار دوباره وارد سامانه شوید.");
        error.status = 401;
        throw error;
      }
      const response = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=refresh_token", {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
        credentials: "omit",
        cache: "no-store"
      });
      const raw = await response.text();
      let result = null;
      try { result = raw ? JSON.parse(raw) : null; } catch (_) {}
      if (!response.ok || !result || !result.access_token) {
        const message = result && (result.message || result.msg || result.error_description || result.error) || raw || "تمدید نشست ناموفق بود.";
        const error = new Error(String(message));
        error.status = response.status === 400 ? 401 : (response.status || 401);
        throw error;
      }
      localStorage.setItem(TOKEN_KEY, result.access_token);
      if (result.refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, result.refresh_token);
      if (result.user) localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      return result.access_token;
    })();
    try { return await refreshInFlight; }
    finally { refreshInFlight = null; }
  }

  // Release notes must never block entry to the main application.
  // Full release history remains available from the separate release-notes page.
  async function showReleaseIntroIfNeeded() {
    try { localStorage.setItem(RELEASE_SEEN_KEY, RELEASE_VERSION); } catch (_) {}
    return;
  }

  function headers(extra = {}) {
    const h = { apikey: SUPABASE_KEY, Accept: "application/json", ...extra };
    const t = token();
    if (t && t !== "demo") h.Authorization = "Bearer " + t;
    return h;
  }
  const OFFLINE_MUTATION_MODULES = {
    khadems: "khadems",
    service_records: "services",
    khadem_service_nonattendance: "nonattendance",
    meetings: "meetings",
    meeting_invitees: "meetings",
    meeting_attendance: "meetings",
    deployments: "deployments",
    vehicles: "deployments",
    drivers: "deployments",
    deployment_participants: "deployments",
    deployment_costs: "deployments",
    donors: "donors",
    khadem_equipment_issues: "equipment",
    khadem_equipment_payments: "equipment",
    equipment_committee_receipts: "equipment",
    equipment_committee_receipt_items: "equipment",
    equipment_committee_payments: "equipment",
    finance_transactions: "finance"
  };
  function offlineMutationDescriptor(path) {
    const match = String(path || "").match(/^\/rest\/v1\/([^/?]+)(?:\?([^#]*))?$/);
    if (!match) return null;
    const table = decodeURIComponent(match[1]);
    if (!Object.prototype.hasOwnProperty.call(OFFLINE_MUTATION_MODULES, table)) return null;
    return { table, query: match[2] || "", module: OFFLINE_MUTATION_MODULES[table] };
  }
  function canQueueOfflineMutation(path, options) {
    if (!window.KJOfflineStore || !state.accessLoaded || !canAccess(offlineMutationDescriptor(path)?.module || "__none__")) return false;
    const descriptor = offlineMutationDescriptor(path);
    if (!descriptor) return false;
    const method = String(options.method || "GET").toUpperCase();
    if (!["POST", "PATCH", "DELETE"].includes(method)) return false;
    // عملیات مالی فقط ثبت پیش‌نویس ساده را می‌پذیرد؛ RPC، قطعی‌سازی و پرداخت‌ها هرگز صف نمی‌شوند.
    if (descriptor.table === "finance_transactions") {
      if (method !== "POST") return false;
      const rows = Array.isArray(options.body) ? options.body : [options.body];
      if (!rows.length || rows.some(row => !row || row.status !== "draft" || row.receipt_image_path)) return false;
    }
    if (method === "POST" && descriptor.table === "khadems") {
      const rows = Array.isArray(options.body) ? options.body : [options.body];
      if (rows.some(row => row && (row.photo_path || row.photo_url))) return false;
    }
    if (method === "PATCH" || method === "DELETE") {
      const params = new URLSearchParams(descriptor.query);
      const id = params.get("id") || "";
      if (!id.startsWith("eq.") || !/^[0-9a-f-]{36}$/i.test(id.slice(3))) return false;
    }
    return true;
  }
  async function queueOfflineMutation(path, options) {
    if (!canQueueOfflineMutation(path, options)) {
      throw new Error("این عملیات در حالت آفلاین پشتیبانی نمی‌شود یا مجوز کافی ندارد؛ برای انجام آن به اینترنت وصل شوید.");
    }
    const descriptor = offlineMutationDescriptor(path);
    const method = String(options.method || "GET").toUpperCase();
    let body = options.body === undefined ? undefined : JSON.parse(JSON.stringify(options.body));
    if (method === "POST") {
      const rows = Array.isArray(body) ? body : [body];
      for (const row of rows) {
        if (!row || typeof row !== "object" || Array.isArray(row)) throw new Error("ساختار رکورد برای ذخیره آفلاین معتبر نیست.");
        if (!row.id) {
          if (!window.crypto || typeof window.crypto.randomUUID !== "function") throw new Error("تولید شناسه امن برای ثبت آفلاین در این مرورگر پشتیبانی نمی‌شود.");
          row.id = window.crypto.randomUUID();
        }
      }
      body = Array.isArray(body) ? rows : rows[0];
    }
    const query = descriptor.query;
    const operation = {
      path: String(path), method, body,
      headers: { ...(options.headers || {}) },
      table: descriptor.table, createdAt: Date.now()
    };
    // حفظ زمان نسخه پایه برای هشدار تعارض در به‌روزرسانی‌ها.
    if (method === "PATCH") {
      try {
        const id = new URLSearchParams(query).get("id").slice(3);
        const cached = await window.KJOfflineStore.getSnapshot(descriptor.table);
        const row = cached && cached.rows.find(item => String(item.id) === id);
        if (row && row.updated_at) operation.baseUpdatedAt = row.updated_at;
      } catch (_) {}
    }
    const queueId = await window.KJOfflineStore.enqueue(operation);
    let result;
    try {
      result = await window.KJOfflineStore.applyOptimisticMutation(descriptor.table, query, method, body);
    } catch (err) {
      await window.KJOfflineStore.removeOutbox(queueId);
      throw err;
    }
    state.offlineMode = true;
    try { const outbox = await window.KJOfflineStore.listOutbox(); state.offlinePendingCount = outbox.filter(row => row.status === "pending").length; state.offlineReviewCount = outbox.length - state.offlinePendingCount; } catch (_) {}
    toast("اینترنت در دسترس نیست؛ تغییر در صف محلی ذخیره شد و پس از اتصال برای پایگاه داده ارسال می‌شود.", "info");
    return result;
  }
  async function syncOfflineOutbox() {
    if (!navigator.onLine || !token() || !state.accessLoaded || !window.KJOfflineStore || state.syncingOfflineOutbox) return 0;
    state.syncingOfflineOutbox = true;
    let synced = 0;
    try {
      const items = await window.KJOfflineStore.listOutbox();
      for (const item of items) {
        if (!item || item.status !== "pending" || !item.operation) continue;
        const op = item.operation;
        const descriptor = offlineMutationDescriptor(op.path);
        if (!descriptor || !canAccess(descriptor.module)) {
          await window.KJOfflineStore.updateOutbox(item.id, { status: "blocked", lastError: "مجوز فعلی این عملیات را اجازه نمی‌دهد." });
          continue;
        }
        try {
          let syncPath = op.path;
          const syncHeaders = { ...(op.headers || {}) };
          if (op.method === "POST") {
            syncPath += (syncPath.includes("?") ? "&" : "?") + "on_conflict=id";
            syncHeaders.Prefer = "resolution=ignore-duplicates,return=representation";
          }
          if (op.method === "PATCH") {
            const params = new URLSearchParams(descriptor.query);
            const idFilter = params.get("id") || "";
            const id = idFilter.startsWith("eq.") ? idFilter.slice(3) : "";
            if (id) {
              const current = await request("/rest/v1/" + encodeURIComponent(descriptor.table) + "?select=*&id=eq." + encodeURIComponent(id) + "&limit=1", { __skipOfflineQueue: true });
              if (Array.isArray(current) && current[0]) {
                const alreadyApplied = Object.entries(op.body || {}).every(([key, value]) => JSON.stringify(current[0][key]) === JSON.stringify(value));
                if (alreadyApplied) {
                  await window.KJOfflineStore.removeOutbox(item.id);
                  synced++;
                  continue;
                }
                if (op.baseUpdatedAt && current[0].updated_at && String(current[0].updated_at) !== String(op.baseUpdatedAt)) {
                  await window.KJOfflineStore.updateOutbox(item.id, { status: "needs_review", lastError: "این رکورد پس از دریافت آفلاین توسط کاربر دیگری تغییر کرده است." });
                  continue;
                }
              }
            }
          }
          await request(syncPath, { method: op.method, body: op.body, headers: syncHeaders, __skipOfflineQueue: true });
          await window.KJOfflineStore.removeOutbox(item.id);
          synced++;
        } catch (err) {
          const status = err && err.status;
          const nextStatus = status === 401 || status === 403 ? "blocked" : status >= 400 && status < 500 ? "needs_review" : "pending";
          await window.KJOfflineStore.updateOutbox(item.id, {
            status: nextStatus, attempts: Number(item.attempts || 0) + 1,
            lastError: String(err && err.message || "ارسال عملیات ناموفق بود.")
          });
          if (!status || status === 401 || status === 403) break;
        }
      }
      try { state.offlinePendingCount = (await window.KJOfflineStore.listOutbox()).length; } catch (_) {}
      if (synced) {
        state.offlineMode = false;
        toast("همگام‌سازی انجام شد؛ " + fa(synced) + " تغییر به پایگاه داده ارسال شد.", "success");
      }
      if (state.offlinePendingCount > 0 && synced === 0) {
        toast("برخی تغییرات هنوز در صف هستند؛ ممکن است نیاز به بررسی مجوز یا تعارض اطلاعات داشته باشند.", "info");
      }
    } catch (err) {
      console.warn("KJ: offline outbox sync failed", err);
    } finally {
      state.syncingOfflineOutbox = false;
    }
    return synced;
  }
  async function request(path, options = {}) {
    const method = String(options.method || "GET").toUpperCase();
    if (method !== "GET" && !options.__skipOfflineQueue && !navigator.onLine) {
      return queueOfflineMutation(path, options);
    }
    const controller = new AbortController();
    // Keep the timeout active until the response body has been read as well as fetched.
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let response;
    let raw;
    try {
      response = await fetch(SUPABASE_URL + path, {
        method: options.method || "GET",
        headers: headers(options.body !== undefined ? { "Content-Type": "application/json", ...(options.headers || {}) } : (options.headers || {})),
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
        credentials: "omit",
        cache: "no-store"
      });
      raw = await response.text();
    } catch (e) {
      if (!options.__skipOfflineQueue && method !== "GET") {
        try { return await queueOfflineMutation(path, options); }
        catch (queueError) {
          if (queueError && queueError.message) throw queueError;
        }
      }
      if (e && e.name === "AbortError") throw new Error("مهلت اتصال یا دریافت پاسخ از پایگاه داده تمام شد. اینترنت را بررسی کنید و دوباره تلاش کنید.");
      throw new Error("ارتباط با Supabase برقرار نشد. اینترنت و تنظیمات اتصال را بررسی کنید.");
    } finally {
      clearTimeout(timer);
    }
    let data = null;
    try { data = raw ? JSON.parse(raw) : null; } catch (_) { data = raw; }
    if (!response.ok) {
      const message = data && (data.message || data.msg || data.error_description || data.error) || raw || ("HTTP " + response.status);
      // Retry only explicit JWT-expiry failures; never retry arbitrary writes or permission denials.
      const isExpiredJwt = response.status === 401 && /jwt expired|expired jwt|token expired/i.test(String(message));
      const isAuthEndpoint = String(path).startsWith("/auth/v1/token");
      if (isExpiredJwt && !options.__authRetry && !isAuthEndpoint) {
        if (!localStorage.getItem(REFRESH_TOKEN_KEY)) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          sessionExpiredMessage = "نشست ورود منقضی شده است؛ لطفاً دوباره وارد سامانه شوید.";
          const error = new Error(sessionExpiredMessage);
          error.status = 401;
          throw error;
        }
        try {
          await refreshSession();
          return request(path, { ...options, __authRetry: true });
        } catch (refreshError) {
          if (refreshError && refreshError.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            sessionExpiredMessage = "نشست ورود تمدید نشد؛ لطفاً دوباره وارد سامانه شوید.";
          }
          throw refreshError;
        }
      }
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
      if (window.KJOfflineStore && Array.isArray(rows)) {
        try { await window.KJOfflineStore.saveSnapshot(table, rows); } catch (cacheError) { console.warn("KJ: offline snapshot save failed", table, cacheError); }
      }
      return Array.isArray(rows) ? rows : [];
    } catch (e) {
      // پاسخ‌های ردشده به دلیل مجوز/نشست را از کش قدیمی جایگزین نکن.
      if (e && (e.status === 401 || e.status === 403)) {
        state.errors[stateKey] = e.message || "دسترسی به این بخش مجاز نیست.";
        state.errors[table] = state.errors[stateKey];
        return [];
      }
      if (window.KJOfflineStore) {
        try {
          const cached = await window.KJOfflineStore.getSnapshot(table);
          if (cached && Array.isArray(cached.rows)) {
            state.errors[stateKey] = "";
            state.errors[table] = "";
            state.offlineMode = true;
            state.offlineSnapshots = state.offlineSnapshots || {};
            state.offlineSnapshots[table] = cached.savedAt;
            return cached.rows;
          }
        } catch (cacheError) { console.warn("KJ: offline snapshot read failed", table, cacheError); }
      }
      const message = e.message || "خطا در دریافت اطلاعات";
      state.errors[stateKey] = message;
      state.errors[table] = message;
      console.warn("KJ: failed to load table", table, e);
      return Array.isArray(state[stateKey]) ? state[stateKey] : [];
    }
  }
  async function loadData() {
    if (state.loading) return;
    state.loading = true;
    state.offlineMode = !navigator.onLine;
    state.offlineSnapshots = {};
    state.errors = {};
    try {
    const tables = [
      ["khadems", "khadems"], ["services", "service_records"],
      ["nonattendance", "khadem_service_nonattendance"], ["meetings", "meetings"],
      ["deployments", "deployments"], ["finance", "finance_transactions"],
      ["financePricing", "finance_pricing"], ["financeAccounts", "finance_accounts"], ["tuitionDues", "tuition_dues"],
      ["financeInstallments", "finance_installments"], ["fund", "fund_transactions"],
      ["donors", "donors"], ["meetingInvitees", "meeting_invitees"],
      ["meetingAttendance", "meeting_attendance"], ["vehicles", "vehicles"],
      ["drivers", "drivers"], ["equipmentIssues", "khadem_equipment_issues"],
      ["equipmentPayments", "khadem_equipment_payments"], ["equipmentReceipts", "equipment_committee_receipts"],
      ["equipmentReceiptItems", "equipment_committee_receipt_items"], ["equipmentCommitteePayments", "equipment_committee_payments"],
      ["profiles", "profiles"], ["roles", "app_roles"], ["permissions", "permissions"],
      ["rolePermissions", "role_permissions"], ["audit", "audit_logs"],
      ["systemSettings", "system_settings"], ["appSettings", "app_settings"],
      ["tuitionPayments", "tuition_payments"]
    ];
    const dataModule = {
      khadems:"khadems", services:"services", nonattendance:"nonattendance",
      meetings:"meetings", meetingInvitees:"meetings", meetingAttendance:"meetings",
      deployments:"deployments", vehicles:"deployments", drivers:"deployments",
      finance:"finance", financePricing:"finance", financeAccounts:"finance", tuitionDues:"finance", financeInstallments:"finance", tuitionPayments:"finance",
      fund:"fund", donors:"donors", equipmentIssues:"equipment", equipmentPayments:"equipment",
      equipmentReceipts:"equipment", equipmentReceiptItems:"equipment", equipmentCommitteePayments:"equipment",
      profiles:"users", roles:"users", permissions:"users", rolePermissions:"users",
      audit:"audit", systemSettings:"settings", appSettings:"settings"
    };
    const allowedTables = tables.filter(([key]) => {
      const module = dataModule[key];
      if (module && !canAccess(module)) {
        state[key] = [];
        delete state.errors[key];
        return false;
      }
      return true;
    });
      // کل مراحل آغاز همگام‌سازی، از ساخت فهرست جدول‌ها تا رندر، زیر try/finally است.
      // بنابراین هیچ خطای پیش از اولین درخواست نمی‌تواند نشانگر را برای همیشه قفل کند.
      render();
      // بانک خادمین جداگانه بارگذاری می‌شود؛ خطای جدول‌های جانبی نباید صفحه را معطل کند.
      if (allowedTables.some(([key]) => key === "khadems")) {
        // درخواست اصلی بانک هم مهلت مستقل دارد؛ اگر fetch در مرورگر/شبکه معطل ماند،
        // رابط کاربری و دکمه‌ها نباید برای همیشه در وضعیت بارگذاری قفل شوند.
        const khademRequest = loadTable("khadems", "khadems");
        const khademTimeout = new Promise(resolve => setTimeout(() => {
          state.errors.khadems = state.errors.khadems || "پاسخ بانک خادمین در زمان مقرر دریافت نشد. اتصال اینترنت یا دسترسی پایگاه داده را بررسی و دوباره تلاش کنید.";
          resolve(Array.isArray(state.khadems) ? state.khadems : []);
        }, TIMEOUT_MS + 2000));
        state.khadems = await Promise.race([khademRequest, khademTimeout]);
        state.loaded = true;
        state.loading = false;
        render();
      }
      const otherTables = allowedTables.filter(([key]) => key !== "khadems");
      const otherLoads = Promise.all(otherTables.map(async ([key, table]) => {
        state[key] = await loadTable(table, key);
      }));
      // انتظار اصلی رابط کاربری حداکثر تا مهلت مشخص ادامه دارد؛ تکمیل درخواست‌های جانبی
      // پس از آن نیز داده را ذخیره و رابط را دوباره ترسیم می‌کند.
      let timeoutHandle;
      const timedOut = new Promise(resolve => {
        timeoutHandle = setTimeout(() => resolve("timeout"), TIMEOUT_MS + 1500);
      });
      const result = await Promise.race([otherLoads.then(() => "complete"), timedOut]);
      clearTimeout(timeoutHandle);
      state.loaded = true;
      if (result === "timeout") {
        state.errors.sync = "بعضی جدول‌ها دیر پاسخ می‌دهند؛ بانک خادمین و دکمه‌های صفحه باید همچنان قابل استفاده باشند.";
        render();
        otherLoads.then(() => {
          delete state.errors.sync;
          state.loaded = true;
          render();
        }).catch(() => {});
      }
    } catch (e) {
      state.errors.khadems = state.errors.khadems || (e?.message || "دریافت اطلاعات بانک خادمین ناموفق بود.");
    } finally {
      // آزادسازی قفل در هر مسیر، حتی اگر بازترسیم صفحه خطا بدهد.
      state.loading = false;
      try { render(); } catch (renderError) { console.error("KJ: render after sync failed", renderError); }
      if (navigator.onLine && state.accessLoaded) void cacheKhademPhotosForOffline();
      const failed = Object.values(state.errors).filter(Boolean).length;
      if (failed) toast("دریافت بعضی اطلاعات ناموفق بود؛ خطای همان بخش را بررسی کنید.", "error");
      else if (state.offlineMode) toast("حالت آفلاین: اطلاعات ذخیره‌شده نمایش داده می‌شود؛ تغییرات پشتیبانی‌شده در صف همگام‌سازی باقی می‌مانند.", "info");
      else toast("اطلاعات قابل‌دسترسی سامانه به‌روزرسانی شد.", "success");
    }
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
      if (result.refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, result.refresh_token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user || { email }));
      toast("ورود موفق بود.", "success");
      await startApp();
    } catch (e) {
      toast("ورود ناموفق بود: " + (e.message || "خطای ناشناخته"), "error");
      if (button) { button.disabled = false; button.textContent = "ورود به سامانه"; }
    }
  }
  function signout() {
    stopPresenceMonitoring(true);
    // خروج امن، داده‌های آفلاین حساب جاری را نیز از دستگاه پاک می‌کند.
    if (window.KJOfflineStore) {
      try { void window.KJOfflineStore.clearCurrentUserData().catch(err => console.warn("KJ: local cache cleanup failed", err)); } catch (_) {}
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    state.selectedKhadem = null;
    state.role = "user";
    state.isPrimaryAdmin = false;
    state.accessPermissions = null;
    state.accessCustom = false;
    state.accessFull = false;
    state.accessLoaded = false;
    loginPage();
  }
  function loginPage(message = "") {
    const app = ensureRoot();
    app.innerHTML = `
      <div class="kj-login-wrap" dir="rtl">
        <form class="kj-login-card" id="kj-login-form">
          <img src="logo.png" alt="لوگوی مجموعه" class="kj-logo" width="86" height="86" decoding="async" fetchpriority="high" onerror="this.style.display='none'">
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
    if (tab === "chat") return state.accessLoaded && (!state.accessCustom || state.accessPermissions?.chat !== false);
    if (tab === "dashboard" || tab === "changePassword" || tab === "updateCheck") return true;
    if (!state.accessLoaded) return false;
    // Fail closed: users/managers without an explicitly saved permission profile
    // must not inherit unrestricted access by default.
    if (!state.accessCustom) return false;
    return state.accessPermissions?.[tab] === true;
  }
  function canPerform(moduleKey, action) {
    if (state.isPrimaryAdmin || state.accessFull) return true;
    if (!state.accessLoaded || !state.accessCustom) return false;
    const permissionModule = moduleKey === "friday" ? "services" : (moduleKey === "serviceRegister" && action !== "create" ? "services" : moduleKey);
    return state.accessPermissions?.[permissionModule + "." + action] === true;
  }
  function applyCrudVisibility(root) {
    if (!root) return;
    const moduleByTab = { friday:"services", serviceRegister:"serviceRegister" };
    const moduleKey = moduleByTab[state.tab] || state.tab;
    if (["dashboard","updateCheck","changePassword"].includes(moduleKey)) return;
    root.querySelectorAll("button").forEach(button => {
      const label = String(button.innerText || button.textContent || "").replace(/\s+/g," ").trim();
      if (!label) return;
      const form = button.closest("form");
      const formId = String(form?.id || "");
      const id = String(button.id || "");
      const createAction = /ثبت|افزودن|ایجاد/.test(label) || /import|registration|create/i.test(id);
      const updateAction = /ویرایش|ذخیره تغییرات|به.?روزرسانی/.test(label) || /edit|update/i.test(id);
      const deleteAction = /حذف (?:خادم|رکورد|تراکنش|جلسه|خدمت|مورد|اطلاعات)|^حذف$/.test(label) || /delete|remove/i.test(id);
      const genericSave = /^(ذخیره|ذخیره اطلاعات|تأیید|تایید|ثبت تغییرات)$/.test(label);
      if (createAction && !canPerform(moduleKey,"create")) button.hidden = true;
      if (updateAction && !canPerform(moduleKey,"update")) button.hidden = true;
      if (deleteAction && !canPerform(moduleKey,"delete")) button.hidden = true;
      if (genericSave && !canPerform(moduleKey,"create") && !canPerform(moduleKey,"update")) button.hidden = true;
      if (formId.toLowerCase().includes("registration") && !canPerform(moduleKey,"create")) button.hidden = true;
      if ((formId.toLowerCase().includes("edit") || formId.toLowerCase().includes("profile")) && !canPerform(moduleKey,"update")) button.hidden = true;
    });
  }
  const PRESENCE_ONLINE_WINDOW_MS = 2 * 60 * 1000;
  let presenceHeartbeatTimer = null;
  let presencePollTimer = null;
  let presenceVisibilityHandler = null;
  let presenceRefreshInFlight = false;

  function isPresenceOnline(row, now = Date.now()) {
    const seen = Date.parse(row?.last_seen_at || "");
    return Number.isFinite(seen) && now - seen >= -30000 && now - seen <= PRESENCE_ONLINE_WINDOW_MS;
  }
  function presencePersonName(profile) {
    return profile?.display_name || profile?.full_name || profile?.username || profile?.email || "کاربر بدون نام";
  }
  function adminPresencePanelHtml() {
    if (!state.isPrimaryAdmin) return "";
    const now = Date.now();
    const profiles = Array.isArray(state.presenceProfiles) ? state.presenceProfiles : [];
    const presenceByUser = new Map((state.presenceRows || []).map(row => [String(row.user_id), row]));
    const onlineCount = profiles.filter(profile => profile.is_active === true && isPresenceOnline(presenceByUser.get(String(profile.id)), now)).length;
    const offlineCount = Math.max(0, profiles.length - onlineCount);
    const cards = profiles.map(profile => {
      const presence = presenceByUser.get(String(profile.id));
      const online = profile.is_active === true && isPresenceOnline(presence, now);
      const name = esc(presencePersonName(profile));
      const email = esc(profile.email || "ایمیل ثبت نشده");
      const lastSeen = presence?.last_seen_at
        ? esc(new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(presence.last_seen_at)))
        : "هنوز ثبت نشده";
      const dot = online ? "#1eaa70" : "#9aa7b5";
      const status = online ? "آنلاین" : "آفلاین";
      return '<article style="display:flex;align-items:flex-start;gap:10px;min-width:0;padding:12px;border:1px solid #e3eaf0;border-radius:12px;background:#fff;box-shadow:0 2px 8px #173b5808">' +
        '<span aria-hidden="true" style="flex:0 0 10px;width:10px;height:10px;margin-top:5px;border-radius:50%;background:' + dot + ';box-shadow:0 0 0 4px ' + (online ? '#e2f7ed' : '#edf1f5') + '"></span>' +
        '<div style="flex:1;min-width:0"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap"><strong style="font-size:13px;color:#173b58;overflow-wrap:anywhere">' + name + '</strong><span style="font-size:11px;font-weight:700;color:' + (online ? '#16734a' : '#778392') + ';background:' + (online ? '#e7f8ef' : '#f0f3f6') + ';border-radius:20px;padding:4px 8px">' + status + '</span></div>' +
        '<div style="margin-top:5px;color:#718093;font-size:11px;overflow-wrap:anywhere;direction:ltr;text-align:right">' + email + '</div>' +
        '<div style="display:flex;gap:6px;align-items:flex-start;margin-top:9px;padding-top:8px;border-top:1px solid #edf1f5;color:#596b7e;font-size:11px"><span aria-hidden="true">🕒</span><span>آخرین حضور: <b style="font-weight:600;color:#34495e">' + lastSeen + '</b></span></div></div></article>';
    }).join("");
    return '<section id="kj-admin-presence-panel" style="flex:' + (state.presenceExpanded ? '1 1 100%;width:100%;' : '0 1 auto;max-width:100%;') + 'min-width:0;align-self:flex-start;margin-top:8px;padding:' + (state.presenceExpanded ? '10px 12px' : '5px 9px') + ';border:1px solid ' + (state.presenceExpanded ? '#dfe7ee' : '#d4e0e9') + ';border-right:3px solid #c6a66a;border-radius:12px;background:' + (state.presenceExpanded ? 'linear-gradient(135deg,#fff 0%,#f8fafc 100%)' : '#ffffff12') + ';box-shadow:0 3px 12px #10283f0a">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">' +
      '<button type="button" id="kj-admin-presence-toggle" aria-expanded="' + (state.presenceExpanded ? 'true' : 'false') + '" aria-controls="kj-admin-presence-list" style="display:flex;flex:1 1 auto;min-width:0;align-items:center;gap:8px;border:0;background:transparent;padding:2px 0;color:' + (state.presenceExpanded ? '#173b58' : '#fff') + ';text-align:right;font:inherit;cursor:pointer">' +
      '<span style="display:grid;place-items:center;flex:0 0 29px;width:29px;height:29px;border-radius:9px;background:' + (state.presenceExpanded ? '#eaf0f6' : '#ffffff1c') + ';font-size:15px">👥</span>' +
      '<span style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><strong style="font-size:12px;line-height:1.5">وضعیت کاربران</strong>' +
      (state.presenceExpanded ? '<small style="display:block;color:#718093;font-size:10px;font-weight:400">آخرین حضور و وضعیت اتصال کاربران</small>' : '<span style="font-size:10px;font-weight:700;color:#d8f8e8;background:#16734a;border-radius:20px;padding:2px 7px">آنلاین ' + fa(onlineCount) + '</span>') +
      '</span><span aria-hidden="true" style="margin-right:auto;font-size:13px;color:' + (state.presenceExpanded ? '#718093' : '#fff') + '">' + (state.presenceExpanded ? '▲' : '⌄') + '</span></button>' +
      (state.presenceExpanded ? '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><span style="padding:5px 8px;border:1px solid #e0e8ef;border-radius:8px;background:#fff;color:#40556a;font-size:11px">کل <b>' + fa(profiles.length) + '</b></span><span style="padding:5px 8px;border:1px solid #cceedd;border-radius:8px;background:#effaf4;color:#16734a;font-size:11px">آنلاین <b>' + fa(onlineCount) + '</b></span><span style="padding:5px 8px;border:1px solid #e2e7ed;border-radius:8px;background:#f4f6f8;color:#66788a;font-size:11px">آفلاین <b>' + fa(offlineCount) + '</b></span><button type="button" id="kj-presence-refresh" class="kj-secondary" style="padding:5px 8px;font-size:10px">↻ تازه‌سازی</button></div>' : '') +
      '</div>' +
      '<div id="kj-admin-presence-list" ' + (state.presenceExpanded ? '' : 'hidden') + ' style="margin-top:10px;padding-top:10px;border-top:1px solid #e5ebf0"><div style="margin-bottom:8px;color:#718093;font-size:10px">به‌روزرسانی خودکار هر ۳۰ ثانیه · نمایش تاریخ و ساعت آخرین حضور</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:8px;align-items:stretch">' +
      (cards || '<div style="padding:15px;text-align:center;color:#718093;font-size:12px;border:1px dashed #dce4eb;border-radius:10px;background:#fff">در حال دریافت فهرست کاربران…</div>') +
      '</div></div></section>';
  }
  function renderAdminPresencePanel() {
    const panel = $("#kj-admin-presence-panel");
    if (!panel || !state.isPrimaryAdmin) return;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = adminPresencePanelHtml();
    const replacement = wrapper.firstElementChild;
    if (replacement) {
      panel.replaceWith(replacement);
      $("#kj-presence-refresh")?.addEventListener("click", () => void refreshPresenceDirectory());
      $("#kj-admin-presence-toggle")?.addEventListener("click", () => { state.presenceExpanded = !state.presenceExpanded; renderAdminPresencePanel(); });
    }
  }
  async function refreshPresenceDirectory() {
    if (!state.isPrimaryAdmin || !token() || !navigator.onLine || presenceRefreshInFlight) return;
    presenceRefreshInFlight = true;
    try {
      const [profiles, rows] = await Promise.all([
        request("/rest/v1/profiles?select=id,full_name,email,username,display_name,is_active,role&order=full_name.asc&limit=1000"),
        request("/rest/v1/user_presence?select=user_id,last_seen_at&limit=1000")
      ]);
      state.presenceProfiles = Array.isArray(profiles) ? profiles : [];
      state.presenceRows = Array.isArray(rows) ? rows : [];
      renderAdminPresencePanel();
    } catch (error) {
      console.warn("KJ: failed to refresh admin presence directory", error);
    } finally {
      presenceRefreshInFlight = false;
    }
  }
  function publishPresence(userId) {
    if (!userId || !token() || !navigator.onLine) return;
    const now = new Date().toISOString();
    void request("/rest/v1/user_presence?on_conflict=user_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: { user_id: userId, last_seen_at: now, updated_at: now }
    }).catch(error => console.warn("KJ: presence heartbeat could not be saved", error));
  }
  function stopPresenceMonitoring(removeCurrent = false) {
    if (presenceHeartbeatTimer) clearInterval(presenceHeartbeatTimer);
    if (presencePollTimer) clearInterval(presencePollTimer);
    presenceHeartbeatTimer = null;
    presencePollTimer = null;
    if (presenceVisibilityHandler) document.removeEventListener("visibilitychange", presenceVisibilityHandler);
    presenceVisibilityHandler = null;
    if (removeCurrent && navigator.onLine && token()) {
      let user = null;
      try { user = JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch (_) {}
      if (user?.id) void request("/rest/v1/user_presence?user_id=eq." + encodeURIComponent(user.id), { method: "DELETE" }).catch(() => {});
    }
  }
  function startPresenceMonitoring(authUser) {
    stopPresenceMonitoring(false);
    if (!authUser?.id || !token()) return;
    publishPresence(authUser.id);
    presenceHeartbeatTimer = window.setInterval(() => publishPresence(authUser.id), 45000);
    presenceVisibilityHandler = () => {
      if (document.visibilityState === "visible") publishPresence(authUser.id);
    };
    document.addEventListener("visibilitychange", presenceVisibilityHandler);
    if (state.isPrimaryAdmin) {
      void refreshPresenceDirectory();
      presencePollTimer = window.setInterval(() => void refreshPresenceDirectory(), 30000);
    }
  }

  function shell() {
    const app = ensureRoot();
    const user = (() => { try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch (_) { return null; } })();
    const groups = [
      ["میزکار مدیریتی", [["dashboard","🏠 داشبورد"]]],
      ["ارتباطات مجموعه", [["chat","💬 گفت‌وگوی آنلاین"]]],
      ["مدیریت خادمین", [["khadems","👤 بانک خادمین"]]],
      ["خدمت و عملیات", [["serviceRegister","📝 ثبت خدمت"],["services","🕌 سوابق خدمت رسمی"],["friday","🌙 سوابق خدمت شب‌های جمعه"],["nonattendance","🧾 ثبت و پیگیری عدم حضور"],["deployments","🚐 مأموریت‌های خدمت"]]],
      ["جلسات و حضور و غیاب", [["meetings","👥 جلسات و حضور و غیاب"]]],
      ["امور مالی و پشتیبانی", [["finance","💰 امور مالی و شهریه"],["fund","🏦 خزانه و صندوق"],["donors","🤝 نیکوکاران و خیرین"],["equipment","👕 البسه، تجهیزات و ناوگان"]]],
      ["گزارش‌ها و کنترل", [["reports","📊 گزارش‌ها و تحلیل"],["audit","📁 سوابق فعالیت و ممیزی"]]],
      ["مدیریت سامانه", [["users","🧩 کاربران و دسترسی‌ها"],["settings","⚙️ تنظیمات سامانه"],["updateCheck","🔄 بررسی به‌روزرسانی"],...(state.isPrimaryAdmin ? [["developerConsole","🧠 توسعه هوشمند"]] : []),["changePassword","🔐 تغییر رمز عبور"]]]
    ];
    for (let i = groups.length - 1; i >= 0; i--) {
      groups[i][1] = groups[i][1].filter(([id]) => canAccess(id));
      if (!groups[i][1].length) groups.splice(i, 1);
    }
    app.innerHTML = `
      <div class="kj-shell" dir="rtl">
        <header class="kj-top">
          <div class="kj-brand">🕌 سامانه جامع مدیریت خادمین<small>مرکز مدیریت و عملیات</small><div class="kj-header-clock" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:12px;margin-top:5px;color:var(--kj-muted)"><span id="kj-header-jalali-date"></span><b id="kj-header-digital-clock" style="font-size:14px;font-variant-numeric:tabular-nums;color:var(--kj-gold)"></b></div></div>
          <div class="kj-actions"><div class="kj-action-buttons"><button type="button" class="kj-secondary kj-mobile-menu-toggle" id="kj-mobile-menu-toggle" aria-expanded="false">☰ منو</button><button class="kj-secondary" id="kj-refresh" ${state.loading ? "disabled" : ""}>${state.loading ? "در حال به‌روزرسانی…" : "به‌روزرسانی اطلاعات"}</button><span class="kj-user-title">${String(user?.email || "").trim().toLowerCase() === "da.adelian@gmail.com" ? "مدیر مجموعه" : "کاربر سامانه"}</span><button class="kj-secondary" id="kj-signout">خروج ←</button></div></div>

                  ${adminPresencePanelHtml()}
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
    const refreshHeaderClock = () => {
      const now = new Date();
      const dateEl = $("#kj-header-jalali-date");
      const timeEl = $("#kj-header-digital-clock");
      try {
        if (dateEl) dateEl.textContent = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(now);
        if (timeEl) timeEl.textContent = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(now);
      } catch (_) {
        if (dateEl) dateEl.textContent = now.toLocaleDateString("fa-IR");
        if (timeEl) timeEl.textContent = now.toLocaleTimeString("fa-IR");
      }
    };
    refreshHeaderClock();
    $("#kj-admin-presence-toggle")?.addEventListener("click", () => { state.presenceExpanded = !state.presenceExpanded; renderAdminPresencePanel(); });
    $("#kj-presence-refresh")?.addEventListener("click", () => void refreshPresenceDirectory());
    if (!window.__kjHeaderClockTimer) window.__kjHeaderClockTimer = window.setInterval(refreshHeaderClock, 1000);
    $$(".kj-group-toggle").forEach(b => b.addEventListener("click", () => {
      const group=b.closest(".kj-menu-group");const open=!group.classList.contains("open");
      group.classList.toggle("open",open);b.setAttribute("aria-expanded",open?"true":"false");
    }));
    $$(".kj-nav [data-tab]").forEach(b => b.addEventListener("click", () => {
      const nextTab = b.dataset.tab;
      if (!nextTab) return;
      if (nextTab === "developerConsole") { window.location.href = "./developer-console.html?v=20261017-4"; return; }
      if (!canAccess(nextTab)) { toast("دسترسی این بخش برای حساب شما فعال نیست. از مدیر اصلی بخواهید مجوز آن را در بخش «کاربران و دسترسی‌ها» تنظیم کند.", "error"); return; }
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
    return val(k, ["full_name", "name", "khadem_name"]) ||
      [val(k, ["first_name"]), val(k, ["last_name", "family", "family_name"])].filter(Boolean).join(" ") ||
      val(k,["first_name"]) || "بدون نام";
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
  function khademPhotoPath(k){
    let extra=k?.extra_data;
    if(typeof extra==="string"){try{extra=JSON.parse(extra);}catch(_){extra={};}}
    const raw=String(val(k,["photo_path","photo_url","profile_photo_path","image_path","image_url","avatar_url","photo"])||val(extra,["photo_path","photo_url","profile_photo_path","image_path","image_url","avatar_url","photo"])||"").trim();
    if(!raw)return "";
    if(raw.startsWith("http://")||raw.startsWith("https://")){
      try{
        const u=new URL(raw);
        const marker="/storage/v1/object/sign/khadem-photos/";
        const publicMarker="/storage/v1/object/public/khadem-photos/";
        const i=u.pathname.indexOf(marker),j=u.pathname.indexOf(publicMarker);
        const offset=i>=0?i+marker.length:(j>=0?j+publicMarker.length:-1);
        if(offset>=0)return decodeURIComponent(u.pathname.slice(offset));
      }catch(_){}
    }
    return raw;
  }
  function normalizeSignedStorageUrl(value){const u=String(value||"");return u.startsWith("http")?u:(u.startsWith("/storage/v1/")?SUPABASE_URL+u:SUPABASE_URL+"/storage/v1"+(u.startsWith("/")?u:"/"+u));}
  async function loadKhademPhotoInto(img,path){
    if(!img||!path)return;
    const photoKey=String(path).trim();
    const store=window.KJOfflineStore;
    const showBlob=blob=>{
      if(!blob||!img.isConnected)return false;
      try{
        if(img.dataset.kjObjectUrl)URL.revokeObjectURL(img.dataset.kjObjectUrl);
        const objectUrl=URL.createObjectURL(blob);
        img.dataset.kjObjectUrl=objectUrl;img.src=objectUrl;img.style.display="block";
        return true;
      }catch(_){return false;}
    };
    const cacheLoadedImage=async()=>{
      if(!store||!img.src||img.src.startsWith("blob:"))return;
      try{
        const response=await fetch(img.src,{method:"GET",credentials:"omit",cache:"no-store"});
        if(response.ok){const blob=await response.blob();if(blob.size<=5*1024*1024)await store.savePhoto(photoKey,blob);}
      }catch(cacheError){console.warn("KJ: photo offline cache failed",cacheError);}
    };
    if(!navigator.onLine&&store){
      try{const cached=await store.getPhoto(photoKey);if(showBlob(cached))return;}catch(cacheError){console.warn("KJ: cached photo unavailable",cacheError);}
      img.style.display="none";img.dataset.photoError="این عکس قبلاً روی این دستگاه ذخیره نشده است؛ برای دریافت آن به اینترنت وصل شوید.";return;
    }
    try{
      const raw=photoKey;
      if(raw.startsWith("http://")||raw.startsWith("https://")){
        img.onload=()=>{void cacheLoadedImage();};img.src=raw;img.style.display="block";return;
      }
      const signed=await request("/storage/v1/object/sign/khadem-photos/"+financeReceiptPath(raw),{method:"POST",body:{expiresIn:3600}});
      const url=String(signed?.signedURL||signed?.signedUrl||"");
      if(!url)throw new Error("لینک تصویر دریافت نشد.");
      img.onload=()=>{void cacheLoadedImage();};
      img.src=normalizeSignedStorageUrl(url);img.style.display="block";
    }catch(e){
      if(store){try{const cached=await store.getPhoto(photoKey);if(showBlob(cached))return;}catch(_){}}
      console.warn("KJ: khadem photo unavailable",e);img.style.display="none";img.dataset.photoError=String(e?.message||"بارگذاری عکس ناموفق بود");
    }
  }
  async function cacheKhademPhotosForOffline() {
    const store = window.KJOfflineStore;
    if (!navigator.onLine || !store || !state.accessLoaded || !canAccess("khadems")) return;
    const photos = (state.khadems || []).map(row => ({
      path: String(val(row, ["photo_path", "photo_url"]) || "").trim()
    })).filter(item => item.path);
    if (!photos.length) return;
    let next = 0, cachedCount = 0;
    async function worker() {
      while (next < photos.length) {
        const item = photos[next++];
        try {
          if (await store.getPhoto(item.path)) continue;
          if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            if (estimate.quota && estimate.usage / estimate.quota > 0.85) return;
          }
          let url = item.path;
          if (!/^https?:\/\//i.test(url)) {
            const signed = await request("/storage/v1/object/sign/khadem-photos/" + financeReceiptPath(url), { method: "POST", body: { expiresIn: 3600 } });
            const signedUrl = String(signed?.signedURL || signed?.signedUrl || "");
            if (!signedUrl) continue;
            url = normalizeSignedStorageUrl(signedUrl);
          }
          const response = await fetch(url, { method: "GET", credentials: "omit", cache: "no-store" });
          if (!response.ok) continue;
          const blob = await response.blob();
          if (!blob.size || blob.size > 5 * 1024 * 1024) continue;
          await store.savePhoto(item.path, blob);
          cachedCount++;
        } catch (err) { console.warn("KJ: background photo cache skipped", err); }
      }
    }
    await Promise.all(Array.from({ length: Math.min(2, photos.length) }, () => worker()));
    if (cachedCount) toast("عکس " + fa(cachedCount) + " خادم برای مشاهده آفلاین ذخیره شد.", "success");
  }
  async function uploadKhademPhoto(file,k){
    if(!file||!file.size)return null;
    const ext=String(file.name||"").split(".").pop().toLowerCase();
    const mimeByExt={jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp"};
    const mime=["image/jpeg","image/png","image/webp"].includes(file.type)?file.type:(mimeByExt[ext]||"");
    if(!mime)throw new Error("فرمت عکس مجاز نیست؛ لطفاً JPG، PNG یا WEBP انتخاب کنید.");
    if(file.size>5*1024*1024)throw new Error("حجم عکس نباید بیشتر از ۵ مگابایت باشد.");
    const id=khademId(k)||khademCode(k)||("new-"+Date.now());
    const extension=({"image/jpeg":"jpg","image/png":"png","image/webp":"webp"})[mime];
    const random=(window.crypto&&window.crypto.randomUUID)?window.crypto.randomUUID():Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);
    const path="khadems/"+String(id).replace(/[^a-zA-Z0-9_-]/g,"_")+"/"+Date.now()+"-"+random+"."+extension;
    const response=await fetch(SUPABASE_URL+"/storage/v1/object/khadem-photos/"+financeReceiptPath(path),{method:"POST",headers:headers({"Content-Type":mime,"x-upsert":"false"}),body:file,credentials:"omit",cache:"no-store"});
    const raw=await response.text();let data=null;try{data=raw?JSON.parse(raw):null;}catch(_){data=raw;}
    if(!response.ok)throw new Error(String(data&&(data.message||data.error||data.error_description)||raw||("HTTP "+response.status)));
    return path;
  }
  function bindPhotoPreview(inputSelector,imgSelector){
    const input=$(inputSelector),img=$(imgSelector);if(!input||!img)return;
    input.addEventListener("change",()=>{const file=input.files&&input.files[0];if(!file){img.removeAttribute("src");img.style.display="none";return;}if(!["image/jpeg","image/png","image/webp"].includes(file.type)){toast("فرمت عکس باید JPG، PNG یا WEBP باشد.","error");input.value="";img.style.display="none";return;}if(file.size>5*1024*1024){toast("حجم عکس نباید بیشتر از ۵ مگابایت باشد.","error");input.value="";img.style.display="none";return;}img.src=URL.createObjectURL(file);img.style.display="block";});
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
      national_code:"کد ملی", national_id:"کد ملی", phone:"شماره موبایل", mobile:"شماره موبایل", phone_number:"شماره موبایل", email:"ایمیل",
      triple_name:"نام ثلاثی", tri_name:"نام ثلاثی", full_name_triple:"نام ثلاثی", membership_date:"تاریخ شروع عضویت",
      birth_date:"تاریخ تولد", address:"آدرس", home_address:"آدرس", residence:"آدرس", status:"وضعیت", active:"فعال", is_active:"وضعیت فعالیت",
      primary_responsibility:"مسئولیت اصلی", job:"شغل", occupation:"شغل", blood_type:"گروه خونی", medical_history:"سوابق پزشکی",
      skills:"مهارت‌ها", education_level:"مدرک تحصیلی", marital_status:"وضعیت تأهل", education:"مدرک تحصیلی",
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
    const order = ["full_name","name","khadem_name","first_name","last_name","family","family_name","triple_name","tri_name","full_name_triple","father_name","birth_date","national_code","national_id","occupation","job","membership_date","education_level","education","phone","mobile","phone_number","address","residence","home_address","blood_type","khadem_code","personnel_code","code","created_at","updated_at","medical_history","referrer_name","introducer_name","referred_by","referrer","referrer_full_name","introducer","friday_service_count","shab_jome_count","main_service_count","total_service_days","status","active","is_active","primary_responsibility","responsibility","emergency_contact_name_2","emergency_contact_2_name","emergency_name_2","emergency_contact_phone_2","emergency_contact_2_phone","emergency_phone_2","emergency_contact2_phone","extra_data"];
    const requestedOrder = ["full_name","name","khadem_name","first_name","last_name","family","family_name","triple_name","tri_name","full_name_triple","father_name","birth_date","national_code","national_id","occupation","job","membership_date","education_level","education","phone","mobile","phone_number","address","residence","home_address","blood_type"];
    const rank = key => { const i=requestedOrder.indexOf(key); return i<0?999+(order.indexOf(key)<0?999:order.indexOf(key)):i; };
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
    return `<div class="kj-table-wrap"><table><thead><tr>${columns.map(c => `<th>${esc(c.label)}</th>`).join("")}<th>جزئیات</th></tr></thead><tbody>${rows.map((row,i) => `<tr>${columns.map(c => `<td>${esc(formatValue(c.key, row[c.key]))}</td>`).join("")}<td><button class="kj-link" data-row="${i}" data-record-key="${esc(row.__recordKey||"")}">نمایش</button></td></tr>`).join("")}</tbody></table></div>`;
  }
  function showRecordExportChooser(row,title,type) {
    // در خروجی پرونده خادم، رکورد انتخاب‌شده مرجع نهایی است؛ مسیر عکس از همان رکورد خوانده شود.
    const exportRecord=(state.tab==="khadems"&&state.selectedKhadem!==null)?(selectedKhademRecord()||row):row;
    const excluded=new Set(["id","created_at","updated_at","extra_data","receipt_image_path","created_by","created_by_email"]);
    const photoPath=khademPhotoPath(exportRecord)||((state.tab==="khadems"&&state.selectedKhadem!==null)?khademPhotoPath(selectedKhademRecord()):"");
    const pairs=Object.entries(exportRecord||{}).filter(([key,value])=>!excluded.has(key)&&!["photo_path","photo_url"].includes(key)&&value!==null&&value!==undefined&&value!==""&&!/password|token|secret|api.?key|service.?role|internal.?id/i.test(key)).map(([key,value])=>({key,label:fieldLabel(key),value:key==="receipt_image_path"?"سند پیوست شده":formatValue(key,value)})).filter(p=>p.label&&!["شناسه داخلی","شناسه خادم","شناسه شخص","شناسه پرسنلی","شناسه سند","شناسه حساب"].includes(p.label));
    if(photoPath)pairs.unshift({key:"__khadem_photo__",label:"عکس خادم",value:photoPath});
    const labelOrder={"نام و نام خانوادگی":1,"نام":1,"نام خانوادگی":1,"نام خادم":1,"نام ثلاثی":2,"نام سه‌گانه":2,"نام پدر":3,"تاریخ تولد":4,"کد ملی":5,"شغل":6,"تاریخ شروع عضویت":7,"تاریخ عضویت":7,"مدرک تحصیلی":8,"سطح تحصیلات":8,"تحصیلات":8,"شماره موبایل":9,"تلفن همراه":9,"شماره تماس":9,"آدرس":10,"نشانی":10,"محل سکونت":10,"گروه خونی":11};
    const keyOrder=["full_name","name","khadem_name","first_name","last_name","family","family_name","triple_name","tri_name","full_name_triple","father_name","birth_date","national_code","national_id","occupation","job","membership_date","education_level","education","phone","mobile","phone_number","address","residence","home_address","blood_type"];
    const rankExport=p=>{if(p.key==="__khadem_photo__")return 0;const byLabel=labelOrder[p.label];if(byLabel)return byLabel;const keyRank=keyOrder.indexOf(p.key);return keyRank>=0?keyRank+1:1000;};
    const seen=new Set(), fields=pairs.filter(p=>!seen.has(p.label)&&seen.add(p.label)).sort((a,b)=>rankExport(a)-rankExport(b));
    const opts=fields.map((p,i)=>'<label style="display:inline-flex;gap:6px;padding:7px;border:1px solid #ddd;border-radius:8px;margin:3px"><input type="checkbox" data-record-export-col="'+i+'" checked> '+esc(p.label)+'</label>').join("");
    modal("انتخاب جزئیات خروجی",'<p class="kj-muted">اطلاعات قابل‌نمایش این پرونده را انتخاب کنید. شناسه‌های فنی و مسیر داخلی فایل صادر نمی‌شوند.</p><div style="display:flex;flex-wrap:wrap">'+opts+'</div><button type="button" class="kj-primary" id="kj-record-export-confirm">تهیه خروجی</button>');
    $("#kj-record-export-confirm")?.addEventListener("click",async(event)=>{
      const confirmButton=event.currentTarget; confirmButton.disabled=true; confirmButton.textContent="در حال آماده‌سازی…"; toast("در حال آماده‌سازی خروجی پرونده؛ لطفاً صبر کنید.","info");
      const chosen=Array.from(document.querySelectorAll("#kj-modal [data-record-export-col]:checked")).map(x=>Number(x.dataset.recordExportCol));
      if(!chosen.length){toast("حداقل یک مورد را انتخاب کنید.","error");return;}
      const selected=chosen.map(i=>fields[i]);
      let photoUrl="",photoDataUrl="",photoMime="image/jpeg";
      const photoField=selected.find(p=>p.key==="__khadem_photo__");
      if(photoField){
        try{
          const raw=String(photoField.value||"");
          if(raw.startsWith("http://")||raw.startsWith("https://"))photoUrl=raw;
          else{
            const signed=await request("/storage/v1/object/sign/khadem-photos/"+financeReceiptPath(raw),{method:"POST",body:{expiresIn:3600}});
            photoUrl=normalizeSignedStorageUrl(signed?.signedURL||signed?.signedUrl||"");
          }
          if(!photoUrl)throw new Error("لینک عکس دریافت نشد.");
          const imageResponse=await fetch(photoUrl,{cache:"no-store"});
          if(!imageResponse.ok)throw new Error("دریافت فایل تصویر ناموفق بود (HTTP "+imageResponse.status+").");
          const imageBlob=await imageResponse.blob();
          if(!String(imageBlob.type||"").startsWith("image/"))throw new Error("فایل ذخیره‌شده تصویر قابل‌شناسایی نیست.");
          photoMime=imageBlob.type||"image/jpeg";
          photoDataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||""));reader.onerror=()=>reject(new Error("خواندن فایل تصویر ناموفق بود."));reader.readAsDataURL(imageBlob);});
          if(!photoDataUrl.startsWith("data:image/"))throw new Error("تبدیل تصویر برای فایل خروجی ناموفق بود.");
        }catch(e){toast("عکس خادم برای خروجی بارگذاری نشد: "+(e.message||"خطای نامشخص"),"error");return;}
      }
      const html="<!doctype html><html lang=\"fa\" dir=\"rtl\"><meta charset=\"utf-8\"><title>"+esc(title)+"</title><style>body{font-family:Tahoma;direction:rtl;padding:18px}h1{font-size:18px}.profile-photo{display:block;margin:0 auto 16px;max-width:150px;max-height:180px;object-fit:contain;border:1px solid #ddd;padding:4px}table{width:100%;border-collapse:collapse;table-layout:auto}td,th{border:1px solid #999;padding:8px;text-align:center;vertical-align:middle;min-width:90px}th{background:#eee;font-weight:bold}td{word-break:break-word}img{display:block;margin:auto;max-width:130px;max-height:150px;object-fit:contain}@media print{body{padding:4px}table{font-size:10px}td,th{padding:4px;min-width:65px}}</style><h1>"+esc(title)+"</h1>"+(photoDataUrl?'<img class=\"profile-photo\" src="'+photoDataUrl+'" alt=\"عکس خادم\">':"")+"<table><thead><tr>"+selected.filter(p=>p.key!=="__khadem_photo__").map(p=>"<th>"+esc(p.label)+"</th>").join("")+"</tr></thead><tbody><tr>"+selected.filter(p=>p.key!=="__khadem_photo__").map(p=>"<td>"+esc(p.value).replace(/undefined/g,"")+"</td>").join("")+"</tr></tbody></table></html>";
      if(type==="pdf"){const w=pdfWindow;if(!w){toast("پنجره خروجی مسدود است؛ اجازه بازشو را برای این سایت فعال کنید.","error");return;}w.document.open();w.document.write(html);w.document.close();w.onload=()=>w.print();}
      else if(type==="excel" && photoField && photoDataUrl){
        try{
          let ExcelJS=window.ExcelJS;
          if(!ExcelJS){
            await new Promise((resolve,reject)=>{
              const script=document.createElement("script");
              script.src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js";
              script.onload=()=>window.ExcelJS?resolve():reject(new Error("کتابخانه ساخت فایل اکسل بارگذاری نشد."));
              script.onerror=()=>reject(new Error("بارگذاری کتابخانه اکسل ناموفق بود؛ اتصال اینترنت را بررسی کنید."));
              document.head.appendChild(script);
            });
            ExcelJS=window.ExcelJS;
          }
          const workbook=new ExcelJS.Workbook();
          workbook.creator="سامانه جامع مدیریت خادمین";
          const worksheet=workbook.addWorksheet("پرونده خادم",{views:[{rightToLeft:true}]});
          worksheet.addRow(selected.map(p=>p.label));
          worksheet.addRow(selected.map(p=>p.key==="__khadem_photo__"?"":String(p.value??"")));
          worksheet.getRow(1).height=30;
          worksheet.getRow(2).height=100;
          selected.forEach((p,i)=>{
            const col=worksheet.getColumn(i+1);
            col.width=p.key==="__khadem_photo__"?18:Math.max(16,Math.min(30,String(p.label||"").length+6));
            worksheet.getCell(1,i+1).font={bold:true,color:{argb:"FF000000"}};
            worksheet.getCell(1,i+1).alignment={horizontal:"center",vertical:"middle",wrapText:true};
            worksheet.getCell(2,i+1).alignment={horizontal:"center",vertical:"middle",wrapText:true};
            worksheet.getCell(1,i+1).border={top:{style:"thin"},left:{style:"thin"},bottom:{style:"thin"},right:{style:"thin"}};
            worksheet.getCell(2,i+1).border={top:{style:"thin"},left:{style:"thin"},bottom:{style:"thin"},right:{style:"thin"}};
          });
          const excelImageData=await new Promise((resolve,reject)=>{
            const image=new Image();
            image.onload=()=>{try{const canvas=document.createElement("canvas");canvas.width=image.naturalWidth||image.width;canvas.height=image.naturalHeight||image.height;const ctx=canvas.getContext("2d");if(!ctx)throw new Error("آماده‌سازی تصویر برای اکسل ناموفق بود.");ctx.drawImage(image,0,0);resolve(canvas.toDataURL("image/png"));}catch(err){reject(err);}};
            image.onerror=()=>reject(new Error("بازخوانی تصویر برای جاسازی در اکسل ناموفق بود."));
            image.src=photoDataUrl;
          });
          const base64=excelImageData.split(",")[1]||"";
          const imageId=workbook.addImage({base64,extension:"png"});
          worksheet.addImage(imageId,{tl:{col:selected.findIndex(p=>p.key==="__khadem_photo__"),row:1},ext:{width:95,height:95},editAs:"oneCell"});
          const buffer=await workbook.xlsx.writeBuffer();
          const blob=new Blob([buffer],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
          const url=URL.createObjectURL(blob),a=document.createElement("a");
          a.href=url;a.download=title.replace(/[<>]/g,"-")+".xlsx";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
        }catch(e){toast("ساخت اکسل دارای عکس ناموفق بود: "+(e.message||"خطای نامشخص"),"error");return;}
      }
      else {const blob=new Blob(["\uFEFF",html],{type:type==="excel"?"application/vnd.ms-excel;charset=utf-8":"application/msword;charset=utf-8"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=title.replace(/[<>]/g,"-")+(type==="excel"?".xls":".doc");document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
      $("#kj-modal")?.remove();
    });
  }
  function addRecordExportActions(row,title) {
    const modalRoot=$("#kj-modal"); if(!modalRoot||!row)return;
    const actions=document.createElement("div"); actions.className="kj-global-export-toolbar"; actions.innerHTML='<span>خروجی جزئیات:</span><button type="button" data-record-export="pdf">PDF / چاپ</button><button type="button" data-record-export="word">Word</button><button type="button" data-record-export="excel">Excel</button>';
    modalRoot.querySelector("h3")?.parentElement?.insertAdjacentElement("afterend",actions);
    actions.addEventListener("click",e=>{const b=e.target.closest("[data-record-export]");if(b)showRecordExportChooser(row,title,b.dataset.recordExport);});
  }
  function attachRowDetails(container, rows, title = "جزئیات") {
    $$("[data-row]", container).forEach(button => button.addEventListener("click", () => {
      const row = rows[Number(button.dataset.row)];
      if (!row) return;
      modal(title, dataFields(row));
      addRecordExportActions(row,title);
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
      ["nonattendance","▤","عدم حضور","ثبت، پیگیری و مشاهده سوابق عدم حضور","عملیات روزانه"],
      ["meetings","▦","جلسات و حضور","جلسات، دعوت‌شدگان و حضور","هماهنگی"],
      ["deployments","↗","مأموریت‌ها","مدیریت مأموریت‌ها و اعزام‌ها","هماهنگی"],
      ["finance","◈","امور مالی","تراکنش‌ها و اقساط","مالی"],
      ["fund","▤","صندوق مجموعه","دریافت‌ها و گردش صندوق","مالی"],
      ["donors","♡","نیکوکاران و خیرین","پرونده‌های خیرین و کمک‌ها","مالی"],
      ["equipment","▣","تجهیزات و البسه","تحویل تجهیزات و پرداخت‌ها","پشتیبانی"],
      ["reports","▥","گزارش‌ساز مدیریتی","خلاصه داده‌های ثبت‌شده و جدول‌ها","تحلیل"],
      ["audit","▧","سوابق فعالیت و ممیزی","ردیابی فعالیت‌ها و سوابق مدیریتی","تحلیل"],
      ["users","♧","کاربران و دسترسی‌ها","حساب‌ها و نقش‌های قابل مشاهده","مدیریت سامانه"],
      ["settings","⚙","تنظیمات سامانه","تنظیمات و وضعیت اتصال","مدیریت سامانه"],
      ["changePassword","🔐","تغییر رمز عبور","مدیریت امن رمز حساب کاربری","مدیریت سامانه"]
    ];
    const visibleStatCards = statCards.filter(x => canAccess(x.tab));
    const visibleModules = modules.filter(([tab]) => canAccess(tab));
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
          <div class="kj-hero-actions">${canAccess("khadems") ? '<button class="kj-primary" data-quick-tab="khadems">＋ ثبت و مدیریت خادمین</button>' : ""}${canAccess("reports") ? '<button class="kj-hero-ghost" data-quick-tab="reports">مشاهده گزارش‌های مدیریتی ←</button>' : ""}</div>
        </div>
        <div class="kj-hero-emblem" aria-hidden="true"><span>🕌</span><small>خدمت صادقانه · نظم سازمانی</small><div class="kj-hero-orbit"></div></div>
        <div class="kj-hero-foot"><span>● اطلاعات متصل به سامانه</span><span>نمایش ${state.loaded?"داده‌های دریافت‌شده":"در انتظار دریافت داده‌ها"}</span></div>
      </section>
      ${state.loading ? `<div class="kj-card kj-loading-card"><span class="kj-spinner"></span> در حال همگام‌سازی اطلاعات سامانه…</div>` : ""}
      ${errorItems.length ? `<div class="kj-error kj-dashboard-error"><b>بعضی از داده‌ها دریافت نشده‌اند</b><p>آمار هر بخش فقط بر اساس داده‌های دریافت‌شده محاسبه شده است. خطاهای زیر را بررسی کنید.</p>${errorItems.map(([k,e])=>`<div>• ${esc(fieldLabel(k))}: ${esc(e)}</div>`).join("")}</div>` : ""}
      <div class="kj-dashboard-panel-grid" aria-label="پنجره‌های اصلی داشبورد">
        <section class="kj-dashboard-panel kj-panel-indicators" data-dashboard-panel="indicators">
          <button type="button" class="kj-dashboard-panel-head" data-dashboard-panel-toggle="indicators" aria-expanded="false">
            <span class="kj-dashboard-panel-symbol">▦</span><span class="kj-dashboard-panel-title"><b>شاخص‌های کلیدی مجموعه</b><small>آمار اصلی و تعداد رکوردهای ثبت‌شده</small></span><span class="kj-dashboard-panel-count">${fa(visibleStatCards.length)} شاخص</span><span class="kj-dashboard-panel-chevron" aria-hidden="true">⌄</span>
          </button>
          <div class="kj-dashboard-panel-summary"><span><b>${fa(state.khadems.length)}</b><small>خادم ثبت‌شده</small></span><span><b>${fa(serviceCount)}</b><small>سابقه خدمت</small></span><span><b>${fa(meetingCount)}</b><small>جلسه</small></span></div>
          <div class="kj-dashboard-panel-body" data-dashboard-panel-body="indicators" hidden>
            <div class="kj-section-heading kj-premium-section"><div><span class="kj-section-eyebrow">نمای کلی · ${esc(monthLabel)}</span><h2 class="kj-section-title">همه شاخص‌های کلیدی</h2><p>برای ورود به هر بخش، کارت مربوط را انتخاب کنید.</p></div><span class="kj-data-note">داده‌های قابل دسترس</span></div>
            <div class="kj-grid kj-stats-grid kj-premium-stats">${visibleStatCards.map((x,i)=>`<button type="button" class="kj-card kj-stat-card kj-stat-card-${i+1} kj-premium-stat ${x.tone}" data-quick-tab="${x.tab}"><div class="kj-stat-top"><span class="kj-stat-icon">${x.icon}</span><span class="kj-stat-label">${x.label}</span><span class="kj-stat-arrow">↗</span></div><div class="kj-stat">${fa(x.value)}</div><div class="kj-stat-foot">${x.meta}</div></button>`).join("")}</div>
          </div>
        </section>
        <section class="kj-dashboard-panel kj-panel-status" data-dashboard-panel="status">
          <button type="button" class="kj-dashboard-panel-head" data-dashboard-panel-toggle="status" aria-expanded="false">
            <span class="kj-dashboard-panel-symbol">◉</span><span class="kj-dashboard-panel-title"><b>وضعیت سامانه</b><small>خلاصه وضعیت، منوها و ماژول‌های قابل دسترس</small></span><span class="kj-dashboard-panel-count">${fa(visibleModules.length)} ماژول</span><span class="kj-dashboard-panel-chevron" aria-hidden="true">⌄</span>
          </button>
          <div class="kj-dashboard-panel-summary"><span><b>${fa(activeKhadems)}</b><small>خادم فعال/قابل استفاده</small></span><span><b>${fa(state.deployments.length)}</b><small>مأموریت</small></span><span><b>${fa(errorItems.length)}</b><small>خطای دریافت</small></span></div>
          <div class="kj-dashboard-panel-body" data-dashboard-panel-body="status" hidden>
            <aside class="kj-card kj-insight-panel kj-dashboard-status-details"><div class="kj-card-heading"><div><span class="kj-section-eyebrow">نمای سریع</span><h3>اطلاعات وضعیت سامانه</h3></div><span class="kj-heading-icon">◉</span></div>
              <div class="kj-insight-row"><span class="kj-insight-icon">♙</span><div><b>خادمین فعال/قابل استفاده</b><small>بر اساس وضعیت ثبت‌شده</small></div><strong>${fa(activeKhadems)}</strong></div>
              ${canAccess("meetings") ? `<div class="kj-insight-row"><span class="kj-insight-icon">▦</span><div><b>جلسات ثبت‌شده</b><small>مجموع جلسات قابل مشاهده</small></div><strong>${fa(meetingCount)}</strong></div>` : ""}
              ${canAccess("finance") ? `<div class="kj-insight-row"><span class="kj-insight-icon">◈</span><div><b>جمع مبالغ تراکنش‌ها</b><small>بر مبنای فیلدهای مبلغ موجود</small></div><strong class="kj-insight-money">${esc(money(financeTotal))}</strong></div>` : ""}
              <div class="kj-insight-foot">این ارقام خلاصه داده‌های موجودند و به‌تنهایی تأییدکننده صحت یا تکمیل همه سوابق نیستند.</div>
              <div class="kj-dashboard-module-status"><b>منوها و ماژول‌های سامانه</b><small>برای ورود به هر ماژول، آیتم مربوط را انتخاب کنید.</small></div>
            </aside>
            <div class="kj-module-groups">
              ${["مدیریت افراد","عملیات روزانه","هماهنگی","مالی","پشتیبانی","تحلیل","مدیریت سامانه"].map(group=>{const list=visibleModules.filter(m=>m[4]===group);return list.length?`<section class="kj-module-group"><div class="kj-module-group-head"><h3>${group}</h3><span>${fa(list.length)} بخش</span></div><div class="kj-module-grid">${list.map(([tab,icon,title,desc])=>`<button type="button" class="kj-module-card" data-quick-tab="${tab}"><span class="kj-module-icon">${icon}</span><span class="kj-module-copy"><b>${title}</b><small>${desc}</small></span><span class="kj-module-arrow">←</span></button>`).join("")}</div></section>`:"";}).join("")}
            </div>
          </div>
        </section>
        <section class="kj-dashboard-panel kj-panel-reports ${canAccess("reports") ? "" : "kj-dashboard-panel-forbidden"}" data-dashboard-panel="reports">
          <button type="button" class="kj-dashboard-panel-head" data-dashboard-panel-toggle="reports" aria-expanded="false">
            <span class="kj-dashboard-panel-symbol">▥</span><span class="kj-dashboard-panel-title"><b>مرکز تحلیل و گزارش</b><small>نمودارها، جدول‌ها و گزارش فعالیت ماژول‌ها</small></span><span class="kj-dashboard-panel-count">تحلیل و گزارش</span><span class="kj-dashboard-panel-chevron" aria-hidden="true">⌄</span>
          </button>
          <div class="kj-dashboard-panel-summary"><span><b>${fa(serviceCount)}</b><small>سوابق خدمت</small></span><span><b>${fa(meetingCount)}</b><small>جلسات ثبت‌شده</small></span><span><b>${fa(financeRows.length)}</b><small>ردیف مالی/اقساط</small></span></div>
          <div class="kj-dashboard-panel-body" data-dashboard-panel-body="reports" hidden>
            <div class="kj-card kj-analytics-main"><div class="kj-card-heading"><div><span class="kj-section-eyebrow">تحلیل داده‌ها</span><h3>تحلیل آماری مجموعه</h3></div><button type="button" class="kj-text-action" data-quick-tab="reports">همه گزارش‌ها ←</button></div>${dashboardAnalytics()}</div>
            <div class="kj-activity-layout">
              <section class="kj-card kj-activity-card"><div class="kj-card-heading"><div><span class="kj-section-eyebrow">سوابق اخیر</span><h3>آخرین خدمات ثبت‌شده</h3></div><button type="button" class="kj-text-action" data-quick-tab="services">مشاهده همه ←</button></div>
                ${state.errors.services||state.errors.service_records?errBox("services"):recentServices.length?tableHtml(recentServices.map(r=>({...r,khadem_name:nameOf(state.khadems.find(k=>String(khademId(k))===String(r.khadem_id))||{}),service_date:val(r,["service_date","date","created_at"])})),[{key:"khadem_name",label:"نام خادم"},{key:"service_date",label:"تاریخ خدمت"},{key:"service_type",label:"نوع خدمت"},{key:"responsibility",label:"مسئولیت"}],"سابقه‌ای ثبت نشده است."):`<div class="kj-empty">هنوز سابقه‌ای برای نمایش ثبت نشده است.</div>`}
              </section>
              <section class="kj-card kj-activity-card"><div class="kj-card-heading"><div><span class="kj-section-eyebrow">هماهنگی مجموعه</span><h3>جلسات اخیر</h3></div><button type="button" class="kj-text-action" data-quick-tab="meetings">مشاهده همه ←</button></div>
                ${state.errors.meetings?errBox("meetings"):recentMeetings.length?`<div class="kj-recent-list">${recentMeetings.map(m=>`<button type="button" class="kj-recent-item" data-quick-tab="meetings"><span class="kj-recent-mark">▦</span><span class="kj-recent-copy"><b>${esc(val(m,["title","meeting_title","name"])||"جلسه مجموعه")}</b><small>${esc(dateText(val(m,["meeting_date","date","created_at"])))}</small></span><span class="kj-recent-arrow">←</span></button>`).join("")}</div>`:`<div class="kj-empty">جلسه‌ای برای نمایش ثبت نشده است.</div>`}
              </section>
            </div>
          </div>
        </section>
      </div>
      <section class="kj-card kj-guide-card kj-premium-guide"><span class="kj-guide-icon">ⓘ</span><div><h3>درباره آمار این داشبورد</h3><p>شاخص‌ها از داده‌های قابل مشاهده در پایگاه داده محاسبه می‌شوند؛ بخش‌های دارای خطای دسترسی یا بارگذاری، جداگانه مشخص می‌شوند و با عدد صفرِ واقعی اشتباه گرفته نمی‌شوند.</p></div></section>`;
  }


  function bindDashboardExpanders(main) {
    if (!main || state.tab !== "dashboard" || main.dataset.dashboardPanelsBound === "1") return;
    main.dataset.dashboardPanelsBound = "1";
    main.addEventListener("click", event => {
      const toggle = event.target.closest("[data-dashboard-panel-toggle]");
      if (!toggle || !main.contains(toggle)) return;
      event.preventDefault();
      const key = toggle.dataset.dashboardPanelToggle;
      const body = main.querySelector('[data-dashboard-panel-body="' + key + '"]');
      const panel = toggle.closest("[data-dashboard-panel]");
      if (!body || !panel) return;
      const opening = body.hidden;
      body.hidden = !opening;
      toggle.setAttribute("aria-expanded", opening ? "true" : "false");
      panel.classList.toggle("is-expanded", opening);
      const chevron = toggle.querySelector(".kj-dashboard-panel-chevron");
      if (chevron) chevron.textContent = opening ? "⌃" : "⌄";
      if (opening) {
        window.setTimeout(() => {
          const rect = panel.getBoundingClientRect();
          if (rect.top < 12) panel.scrollIntoView({behavior:"smooth",block:"start"});
        }, 40);
      }
    });
  }

  function khademCodeNumber(k){
    const raw=String(khademCode(k)??"").replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d));
    const digits=raw.replace(/[^0-9]/g,"");
    return digits?Number(digits):0;
  }

  let khademImportDraft=null;
  // نام فیلدهای اصلی بانک خادمین ثابت است؛ فایل ورودی فقط به این فیلدها نگاشت می‌شود.
  const khademImportFields=[
    ["khadem_code","کد خادم"],["full_name","نام و نام خانوادگی"],["tri_name","نام ثلاثی"],
    ["father_name","نام پدر"],["national_id","کد ملی"],["birth_date","تاریخ تولد"],
    ["membership_date","تاریخ عضویت"],["phone","شماره تلفن"],["occupation","شغل"],
    ["responsibility","مسئولیت اصلی"],["residence","محل سکونت"],["blood_type","گروه خونی"],
    ["medical_history","سوابق پزشکی"],["status","وضعیت خادم"],["is_active","فعال بودن"],
    ["photo_url","عکس خادم (نشانی عکس)"],["photo_path","مسیر ذخیره عکس خادم"],
    ["description","شرح"],["notes","توضیحات"],["emergency_contact_name","نام تماس اضطراری"],
    ["emergency_contact_phone","شماره تماس اضطراری"],["tuition_exempt","معاف از شهریه"],
    ["tuition_exempt_note","توضیح معافیت شهریه"],["tuition_exempt_from","شروع معافیت شهریه"],
    ["tuition_exempt_until","پایان معافیت شهریه"]
  ];
  const importAliases={
    khadem_code:["کد خادم","کد","کد پرسنلی","شماره خادم","khadem code","personnel code","code"],
    full_name:["نام و نام خانوادگی","نام کامل","نام خادم","نام و فامیل","نام و فامیل خادم","full name","fullname","name"],
    tri_name:["نام ثلاثی","نام سه گانه","نام سه‌گانه","triple name"],
    father_name:["نام پدر","father name"],national_id:["کد ملی","شماره ملی","کد شناسایی","national code","national id"],
    birth_date:["تاریخ تولد","تولد","birth date"],membership_date:["تاریخ عضویت","تاریخ شروع عضویت","membership date","join date"],
    phone:["شماره تلفن","تلفن","موبایل","شماره موبایل","تلفن همراه","phone","mobile","phone number"],
    occupation:["شغل","حرفه","occupation","job"],responsibility:["مسئولیت اصلی","مسئولیت","سمت","responsibility"],
    residence:["محل سکونت","نشانی","آدرس","محل زندگی","address","residence"],
    blood_type:["گروه خونی","blood type"],medical_history:["سوابق پزشکی","بیماری","medical history"],
    status:["وضعیت","وضعیت خادم","status"],is_active:["فعال","فعال بودن","وضعیت فعالیت","active"],
    photo_url:["عکس","عکس خادم","عکس خدام","تصویر","تصویر خادم","photo","photo url","image","image url"],
    photo_path:["مسیر عکس","مسیر ذخیره عکس","photo path","image path"],
    description:["شرح","شرح حال","description"],notes:["توضیحات","یادداشت","یادداشت‌ها","notes"],
    emergency_contact_name:["نام تماس اضطراری","نام فرد اضطراری","emergency contact name"],
    emergency_contact_phone:["شماره تماس اضطراری","تلفن اضطراری","emergency contact phone"],
    tuition_exempt:["معاف از شهریه","معافیت شهریه","tuition exempt"],
    tuition_exempt_note:["توضیح معافیت شهریه","دلیل معافیت","tuition exempt note"],
    tuition_exempt_from:["شروع معافیت","شروع معافیت شهریه","tuition exempt from"],
    tuition_exempt_until:["پایان معافیت","پایان معافیت شهریه","tuition exempt until"]
  };
  function importNormalize(v){return String(v??"").trim().toLocaleLowerCase("fa").replace(/[يى]/g,"ی").replace(/ك/g,"ک").replace(/[\u064B-\u065F\u0670\u0640]/g,"").replace(/[\s_\-./\\()（）:：]+/g,"");}
  function importCanonicalHeader(header){
    const n=importNormalize(header);
    for(const [key,aliases] of Object.entries(importAliases)){
      if(importNormalize(key)===n||aliases.some(a=>importNormalize(a)===n))return key;
    }
    return "";
  }
  async function loadImportLibrary(url,name){
    if(window[name])return window[name];
    await new Promise((resolve,reject)=>{const script=document.createElement("script");script.src=url;script.onload=resolve;script.onerror=()=>reject(new Error("کتابخانه خواندن فایل بارگذاری نشد؛ اتصال اینترنت را بررسی کنید."));document.head.appendChild(script);});
    if(!window[name])throw new Error("کتابخانه فایل آماده نشد.");return window[name];
  }
  function importWordRows(html){
    const doc=new DOMParser().parseFromString(html,"text/html"),table=doc.querySelector("table");
    if(table)return [...table.querySelectorAll("tr")].map(tr=>[...tr.querySelectorAll("th,td")].map(td=>td.textContent.trim()));
    return [...doc.querySelectorAll("p")].map(p=>p.textContent.trim()).filter(Boolean).map(line=>line.split(/\t+|\s{2,}/));
  }
  async function readKhademImportFile(file){
    const ext=(file.name.split(".").pop()||"").toLowerCase();let sheets=[];
    if(["xlsx","xls","csv"].includes(ext)){
      const XLSX=await loadImportLibrary("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js","XLSX");
      const wb=XLSX.read(await file.arrayBuffer(),{type:"array",cellDates:true});
      sheets=wb.SheetNames.map(name=>({name,rows:XLSX.utils.sheet_to_json(wb.Sheets[name],{header:1,defval:"",raw:false}).filter(r=>r.some(v=>String(v??"").trim()!==""))}));
    }else if(ext==="docx"){
      const mammoth=await loadImportLibrary("https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js","mammoth");
      const result=await mammoth.convertToHtml({arrayBuffer:await file.arrayBuffer()});sheets=[{name:"سند Word",rows:importWordRows(result.value)}];
    }else throw new Error("نوع فایل پشتیبانی نمی‌شود. فایل xlsx، xls، csv یا docx انتخاب کنید؛ فایل قدیمی doc را ابتدا به docx تبدیل کنید.");
    const rawRecords=[];
    for(const sh of sheets){
      if(!sh.rows.length)continue;
      const hi=sh.rows.findIndex(r=>r.filter(v=>String(v??"").trim()!=="").length>=2);if(hi<0)continue;
      const headers=sh.rows[hi].map((v,i)=>String(v??"").trim()||("ستون "+(i+1)));
      for(const cells of sh.rows.slice(hi+1)){
        if(!cells.some(v=>String(v??"").trim()!==""))continue;
        const raw={};headers.forEach((h,i)=>{if(cells[i]!==undefined&&cells[i]!==null&&String(cells[i]).trim()!=="")raw[h]=String(cells[i]).trim();});
        if(Object.keys(raw).length)rawRecords.push({sheet:sh.name,raw});
      }
    }
    if(!rawRecords.length)throw new Error("ردیف داده‌ای پیدا نشد؛ ردیف عنوان ستون‌ها و ردیف‌های اطلاعات را بررسی کنید.");
    return {headers:[...new Set(rawRecords.flatMap(r=>Object.keys(r.raw)))],rawRecords};
  }
  function importMappedValue(target,value){
    const raw=String(value??"").trim();
    if(["is_active","tuition_exempt"].includes(target))return ["بله","فعال","true","1","yes","آری"].includes(raw.toLowerCase());
    if(target==="khadem_code")return raw.replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[٬،,\\s]/g,"");
    if(["birth_date","membership_date","tuition_exempt_from","tuition_exempt_until"].includes(target))return jalaliToGregorianText(raw);
    return raw;
  }
  function showKhademImportMapping(){
    const d=khademImportDraft;if(!d)return;
    const options='<option value="">— وارد نشود —</option>'+khademImportFields.map(([key,label])=>'<option value="'+esc(key)+'">'+esc(label)+'</option>').join("");
    const rows=d.headers.map((header,i)=>{
      const guess=importCanonicalHeader(header);
      const sample=d.rawRecords.find(r=>r.raw[header]!==undefined)?.raw[header]||"—";
      return '<tr><td><b>'+esc(header)+'</b><br><small>نمونه: '+esc(sample).slice(0,160)+'</small></td><td><select class="kj-import-map-select" data-import-header="'+esc(header)+'">'+options+'</select></td></tr>';
    }).join("");
    modal("تطبیق ستون‌های فایل با بانک خادمین",'<p class="kj-muted">نام فیلدهای اصلی سامانه ثابت است و تغییر نمی‌کند. برای هر ستون فایل، فیلد مقصد را انتخاب کنید. پیشنهاد اولیه بر اساس نام ستون است و قبل از ادامه قابل اصلاح است.</p><p><b>فایل:</b> '+esc(d.fileName)+' — تعداد ستون‌ها: '+fa(d.headers.length)+' — ردیف‌های اطلاعات: '+fa(d.rawRecords.length)+'</p><div class="kj-table-wrap"><table><thead><tr><th>عنوان ستون در فایل ورودی</th><th>فیلد ثابت سامانه</th></tr></thead><tbody>'+rows+'</tbody></table></div><p class="kj-small">ستون‌هایی مانند «عکس» یا «عکس خدام» را به «عکس خادم (نشانی عکس)» وصل کنید، مشروط بر اینکه مقدار ستون نشانی اینترنتی یا مسیر ذخیره عکس باشد. تصویر جاسازی‌شده داخل سلول Excel از این مسیر وارد نمی‌شود.</p><div id="kj-import-map-message" class="kj-muted" role="status"></div><div class="kj-toolbar"><button type="button" class="kj-primary" id="kj-import-map-continue">تأیید تطبیق و پیش‌نمایش اطلاعات</button><button type="button" class="kj-secondary" id="kj-import-map-cancel">انصراف</button></div>');
    d.headers.forEach(header=>{const el=$('#kj-modal [data-import-header="'+CSS.escape(header)+'"]');if(el)el.value=importCanonicalHeader(header)||"";});
    $("#kj-import-map-cancel")?.addEventListener("click",()=>{khademImportDraft=null;$("#kj-modal")?.remove();});
    $("#kj-import-map-continue")?.addEventListener("click",()=>{
      const mapping={};d.headers.forEach(header=>{const el=$('#kj-modal [data-import-header="'+CSS.escape(header)+'"]');mapping[header]=el?.value||"";});
      const selected=Object.entries(mapping).filter(([,v])=>v);
      const targets=selected.map(([,v])=>v);
      if(new Set(targets).size!==targets.length){const m=$("#kj-import-map-message");if(m)m.textContent="یک فیلد سامانه به بیش از یک ستون فایل وصل شده است؛ هر فیلد سامانه را فقط یک‌بار انتخاب کنید.";return;}
      if(!selected.length){const m=$("#kj-import-map-message");if(m)m.textContent="حداقل یک ستون فایل را به فیلد سامانه وصل کنید.";return;}
      d.mapping=mapping;
      d.records=d.rawRecords.map(item=>{
        const payload={};
        for(const [header,value] of Object.entries(item.raw)){const target=mapping[header];if(!target)continue;
          payload[target]=importMappedValue(target,value);
        }
        return {sheet:item.sheet,raw:item.raw,payload,duplicate:null,choice:"file"};
      });
      d.records.forEach(r=>r.duplicate=findImportDuplicate(r.payload));
      showKhademImportPreview();
    });
  }
  function openKhademImport(){
    modal("ورودی فایل Excel یا Word",'<p class="kj-muted">فایل Excel یا جدول Word را انتخاب کنید. پیش از ذخیره، عنوان ستون‌های فایل با فیلدهای ثابت سامانه تطبیق داده می‌شود و سپس پیش‌نمایش برای تأیید نهایی نمایش داده خواهد شد.</p><label class="kj-field"><b>انتخاب فایل</b><input id="kj-import-file" type="file" accept=".xlsx,.xls,.csv,.docx"></label><p class="kj-small">پشتیبانی از xlsx، xls، csv و docx؛ فایل اصلی تا تأیید نهایی تغییر نمی‌کند.</p><div id="kj-import-message" class="kj-muted" role="status"></div><div class="kj-toolbar"><button type="button" class="kj-primary" id="kj-import-read">خواندن و تطبیق ستون‌ها</button></div>');
    $("#kj-import-read")?.addEventListener("click",async()=>{const b=$("#kj-import-read"),f=$("#kj-import-file")?.files?.[0],m=$("#kj-import-message");if(!f){if(m)m.textContent="ابتدا فایل را انتخاب کنید.";return;}b.disabled=true;b.textContent="در حال خواندن…";try{const parsed=await readKhademImportFile(f);khademImportDraft={fileName:f.name,headers:parsed.headers,rawRecords:parsed.rawRecords,records:[],mapping:{}};showKhademImportMapping();}catch(e){if(m)m.textContent="خواندن فایل ناموفق بود: "+(e.message||"خطای نامشخص");b.disabled=false;b.textContent="خواندن و تطبیق ستون‌ها";}});
  }
  function importIdentity(v){return importNormalize(v).replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[^a-z0-9\u0600-\u06ff]/g,"");}
  function findImportDuplicate(p){
    const code=importIdentity(val(p,["khadem_code","personnel_code","code"])),national=importIdentity(val(p,["national_id","national_code"]));
    const name=importIdentity(val(p,["full_name","name","khadem_name"])||[p.first_name,p.last_name].filter(Boolean).join(" "));
    return state.khadems.find(k=>{const ec=importIdentity(khademCode(k)),en=importIdentity(val(k,["national_id","national_code"])),em=importIdentity(nameOf(k));return !!((code&&ec&&code===ec)||(national&&en&&national===en)||(name&&em&&name===em));})||null;
  }
  function openKhademImport(){
    modal("ورودی فایل Excel یا Word",'<p class="kj-muted">فایل Excel یا جدول Word را انتخاب کنید. همه برگه‌های Excel خوانده می‌شوند و پیش از ذخیره، تکراری‌ها برای تصمیم‌گیری نمایش داده می‌شوند.</p><label class="kj-field"><b>انتخاب فایل</b><input id="kj-import-file" type="file" accept=".xlsx,.xls,.csv,.docx"></label><p class="kj-small">پشتیبانی از xlsx، xls، csv و docx؛ فایل اصلی تا تأیید نهایی تغییر نمی‌کند.</p><div id="kj-import-message" class="kj-muted" role="status"></div><div class="kj-toolbar"><button type="button" class="kj-primary" id="kj-import-read">خواندن و بررسی فایل</button></div>');
    $("#kj-import-read")?.addEventListener("click",async()=>{const b=$("#kj-import-read"),f=$("#kj-import-file")?.files?.[0],m=$("#kj-import-message");if(!f){if(m)m.textContent="ابتدا فایل را انتخاب کنید.";return;}b.disabled=true;b.textContent="در حال خواندن…";try{const records=await readKhademImportFile(f);records.forEach(r=>r.duplicate=findImportDuplicate(r.payload));khademImportDraft={fileName:f.name,records};showKhademImportPreview();}catch(e){if(m)m.textContent="خواندن فایل ناموفق بود: "+(e.message||"خطای نامشخص");b.disabled=false;b.textContent="خواندن و بررسی فایل";}});
  }
  function showKhademImportPreview(){
    const d=khademImportDraft;if(!d)return;const dup=d.records.filter(r=>r.duplicate),fresh=d.records.length-dup.length;
    const rows=d.records.slice(0,12).map((r,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(val(r.payload,["khadem_code","personnel_code","code"])||"—")+'</td><td>'+esc(val(r.payload,["full_name","name","khadem_name"])||[r.payload.first_name,r.payload.last_name].filter(Boolean).join(" ")||"—")+'</td><td>'+(r.duplicate?"تکراری — "+esc(nameOf(r.duplicate)):"جدید")+'</td></tr>').join("");
    const conflicts=dup.map((r,i)=>'<tr><td>'+esc(nameOf(r.duplicate))+'<br><small>کد سامانه: '+esc(khademCode(r.duplicate)||"—")+' | کد فایل: '+esc(val(r.payload,["khadem_code","personnel_code","code"])||"—")+'</small></td><td><label><input type="radio" name="kj-import-choice-'+i+'" value="file" checked> اولویت فایل</label><br><label><input type="radio" name="kj-import-choice-'+i+'" value="system"> اولویت سامانه</label><br><label><input type="radio" name="kj-import-choice-'+i+'" value="skip"> رد این مورد</label></td></tr>').join("");
    modal("بررسی و تأیید ورود اطلاعات",'<p><b>فایل:</b> '+esc(d.fileName)+'</p><div class="kj-toolbar"><span class="kj-pill">کل ردیف‌ها: '+fa(d.records.length)+'</span><span class="kj-pill">خادم جدید: '+fa(fresh)+'</span><span class="kj-pill">تکراری: '+fa(dup.length)+'</span></div><p class="kj-muted">پیش‌نمایش '+fa(Math.min(12,d.records.length))+' ردیف نخست:</p><div class="kj-table-wrap"><table><thead><tr><th>ردیف</th><th>کد فایل</th><th>نام خادم</th><th>وضعیت</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+(dup.length?'<h3 class="kj-section-title">تعیین تکلیف موارد تکراری</h3><p class="kj-muted">تصمیم کلی بگیرید یا برای هر خادم جداگانه انتخاب کنید. اولویت فایل فقط مقادیر غیرخالی را جایگزین می‌کند.</p><div class="kj-toolbar"><button type="button" class="kj-secondary" id="kj-import-all-file">اولویت فایل برای همه</button><button type="button" class="kj-secondary" id="kj-import-all-system">اولویت سامانه برای همه</button><button type="button" class="kj-secondary" id="kj-import-all-skip">رد همه تکراری‌ها</button></div><div class="kj-table-wrap"><table><thead><tr><th>خادم تکراری</th><th>تصمیم</th></tr></thead><tbody>'+conflicts+'</tbody></table></div>':'<p class="kj-muted">تکراری شناسایی نشد.</p>')+'<div id="kj-import-result" class="kj-muted" role="status"></div><div class="kj-toolbar"><button type="button" class="kj-primary" id="kj-import-commit">تأیید و وارد کردن '+fa(d.records.length)+' ردیف</button><button type="button" class="kj-secondary" id="kj-import-cancel">انصراف</button></div>');
    const setAll=v=>dup.forEach((r,i)=>{const el=$('input[name="kj-import-choice-'+i+'"][value="'+v+'"]');if(el)el.checked=true;});
    $("#kj-import-all-file")?.addEventListener("click",()=>setAll("file"));$("#kj-import-all-system")?.addEventListener("click",()=>setAll("system"));$("#kj-import-all-skip")?.addEventListener("click",()=>setAll("skip"));
    $("#kj-import-cancel")?.addEventListener("click",()=>{khademImportDraft=null;$("#kj-modal")?.remove();});$("#kj-import-commit")?.addEventListener("click",commitKhademImport);
  }
  function importMergeRecord(incoming,existing){
    const merged={};for(const [k,v] of Object.entries(incoming||{})){if(["id","created_at","updated_at","created_by","created_by_email"].includes(k))continue;
      if(k==="extra_data"){let old=existing?.extra_data;if(typeof old==="string"){try{old=JSON.parse(old);}catch(_){old={};}}merged.extra_data={...(old&&typeof old==="object"?old:{}),...(v&&typeof v==="object"?v:{})};}
      else if(v!==null&&v!==undefined&&String(v).trim()!=="")merged[k]=v;
    }return merged;
  }
  async function commitKhademImport(){
    const d=khademImportDraft,b=$("#kj-import-commit"),m=$("#kj-import-result");if(!d||!b)return;
    const dup=d.records.filter(r=>r.duplicate);dup.forEach((r,i)=>r.choice=$('input[name="kj-import-choice-'+i+'"]:checked')?.value||"file");
    b.disabled=true;b.textContent="در حال ذخیره‌سازی…";let inserted=0,updated=0,skipped=0,failed=0;const errors=[];
    for(let i=0;i<d.records.length;i++){const r=d.records[i];try{
      if(r.duplicate){if(r.choice==="skip"||r.choice==="system"){skipped++;continue;}
        const idKey=["id","khadem_id","personnel_id"].find(k=>r.duplicate[k]!==undefined&&r.duplicate[k]!==null);if(!idKey)throw new Error("شناسه یکتای خادم پیدا نشد.");
        const payload=importMergeRecord(r.payload,r.duplicate),filter=encodeURIComponent(idKey)+"=eq."+encodeURIComponent(String(r.duplicate[idKey]));
        const saved=await request("/rest/v1/khadems?"+filter,{method:"PATCH",headers:{"Prefer":"return=representation"},body:payload});
        if(!Array.isArray(saved)||!saved.length)throw new Error("به‌روزرسانی انجام نشد؛ مجوز ویرایش را بررسی کنید.");updated++;
      }else{
        const payload={...r.payload};if(!["full_name","name","khadem_name","first_name"].some(k=>String(payload[k]??"").trim()))throw new Error("نام خادم در این ردیف پیدا نشد.");
        if(!["khadem_code","personnel_code","code"].some(k=>String(payload[k]??"").trim())){const key=["khadem_code","personnel_code","code"].find(k=>!Object.keys(state.khadems[0]||{}).length||Object.prototype.hasOwnProperty.call(state.khadems[0],k))||"khadem_code";payload[key]=String(nextKhademCode());}
        const saved=await request("/rest/v1/khadems",{method:"POST",headers:{"Prefer":"return=representation"},body:payload});if(!Array.isArray(saved)||!saved.length)throw new Error("ثبت ردیف جدید تأیید نشد.");state.khadems.push(saved[0]);inserted++;
      }
    }catch(e){failed++;errors.push("ردیف "+(i+1)+": "+(e.message||"خطا"));if(errors.length>=8)break;}
      if(m)m.textContent="ذخیره در حال انجام است… جدید: "+inserted+"، به‌روزرسانی: "+updated+"، ردشده: "+skipped+"، خطا: "+failed;
    }
    await loadData();khademImportDraft=null;$("#kj-modal")?.remove();toast("ورود فایل پایان یافت؛ جدید: "+inserted+"، به‌روزرسانی: "+updated+"، ردشده: "+skipped+"، خطا: "+failed+(errors.length?" — "+errors[0]:""),failed?"error":"success");render();
  }

  function khademList() {
    const q = state.search.trim().toLowerCase();
    const rows = state.khadems.filter(k => !q || [nameOf(k), khademCode(k), val(k,["phone","mobile"]), val(k,["national_id","national_code"])].join(" ").toLowerCase().includes(q)).sort((a,b)=>khademCodeNumber(a)-khademCodeNumber(b));
    const columns = [
      {key:"khadem_code",label:"کد خادم"},{key:"full_name",label:"نام و نام خانوادگی"},{key:"triple_name",label:"نام ثلاثی"},
      {key:"national_code",label:"کد ملی"},{key:"birth_date",label:"تاریخ تولد"},{key:"membership_date",label:"تاریخ عضویت"},
      {key:"occupation",label:"شغل"},{key:"phone",label:"شماره تلفن"},{key:"residence",label:"محل سکونت"},{key:"referrer_name",label:"معرف"},{key:"active_label",label:"وضعیت"}
    ];
    const htmlRows = rows.map(k => ({...k, khadem_code:khademCode(k), full_name:nameOf(k),
      triple_name:val(k,["triple_name","tri_name","full_name_triple"]), national_code:val(k,["national_code","national_id"]),
      birth_date:val(k,["birth_date"]), membership_date:val(k,["membership_date"]), occupation:val(k,["occupation","job"]),
      phone:val(k,["phone","mobile","phone_number"]), residence:val(k,["residence","address","home_address"]), referrer_name:val(k,["referrer_name","introducer_name","referred_by","referrer"]) || val(k?.extra_data||{},["referrer_name","introducer_name","referred_by","referrer"]), active_label:activeLabel(k)}));
    const emptyTableMessage = state.errors.khadems ? "دریافت فهرست خادمین ناموفق بود: "+state.errors.khadems : (state.loading ? "در حال دریافت اطلاعات بانک خادمین…" : "هنوز خادمی در بانک خادمین ثبت نشده است.");
    const table = state.showKhademPhotos
      ? (htmlRows.length ? '<div class="kj-table-wrap"><table><thead><tr><th>عکس خادم</th>'+columns.map(c => '<th>'+esc(c.label)+'</th>').join("")+'<th>جزئیات</th></tr></thead><tbody>'+htmlRows.map((row,i) => { const original=rows[i]; return '<tr><td style="min-width:74px;text-align:center"><img data-khadem-photo-path="'+esc(khademPhotoPath(original))+'" alt="عکس '+esc(nameOf(original))+'" style="display:none;width:56px;height:64px;object-fit:cover;border-radius:8px;border:1px solid #d9c7a4"><span data-khadem-photo-empty style="color:#888">—</span></td>'+columns.map(c => '<td>'+esc(formatValue(c.key,row[c.key]))+'</td>').join("")+'<td><button class="kj-link" data-row="'+i+'">نمایش</button></td></tr>'; }).join("")+'</tbody></table></div>' : empty(emptyTableMessage))
      : tableHtml(htmlRows, columns, emptyTableMessage);
    const currentJalaliMonth = Number(new Intl.DateTimeFormat("fa-IR-u-ca-persian",{month:"numeric"}).format(new Date()).replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
    if (!state.birthdayMonth) state.birthdayMonth = currentJalaliMonth;
    const birthdayRows = rows.filter(k => { const raw=String(val(k,["birth_date"])||"").trim(); let month=0; const jm=raw.match(/^(?:13|14)\d{2}[/-](\d{1,2})[/-]\d{1,2}$/); if(jm) month=Number(jm[1]); else { const d=new Date(raw); if(!Number.isNaN(d.getTime())) month=Number(new Intl.DateTimeFormat("fa-IR-u-ca-persian",{month:"numeric"}).format(d).replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d))); } return month===Number(state.birthdayMonth); }).map(k=>({full_name:nameOf(k),birth_date:val(k,["birth_date"]),__recordKey:khademId(k)!==null&&khademId(k)!==undefined&&String(khademId(k))!==""?"id:"+String(khademId(k)):"code:"+String(khademCode(k))}));
    const monthOptions = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"].map((m,i)=>`<option value="${i+1}" ${Number(state.birthdayMonth)===i+1?"selected":""}>${m}</option>`).join("");
    const birthdays = `<section class="kj-card kj-birthday-list" style="margin:14px 0"><h2 class="kj-section-title" style="margin-top:0">🎂 متولدین ماه انتخابی</h2><label class="kj-field"><b>انتخاب ماه</b><select id="kj-birthday-month">${monthOptions}</select></label><p class="kj-muted">فهرست خادمین متولد ماه انتخاب‌شده بر اساس تقویم هجری شمسی</p>${tableHtml(birthdayRows,[{key:"full_name",label:"نام خادم"},{key:"birth_date",label:"تاریخ تولد"}],"در این ماه تولدی ثبت نشده است.")}</section>`;
    return `<h1 class="kj-page-title">بانک خادمین</h1>${errBox("khadems")}
      <div class="kj-toolbar"><input class="kj-search" id="kj-khadem-search" placeholder="جست‌وجو بر اساس نام، کد، کد ملی یا تلفن…" value="${esc(state.search)}"><label class="kj-primary" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin:0"><input type="checkbox" id="kj-show-khadem-photos" style="width:16px;height:16px;accent-color:#fff" ${state.showKhademPhotos?"checked":""}> نمایش عکس خادمین</label><span class="kj-pill">تعداد: ${fa(rows.length)}</span>${canPerform("khadems","create")?'<button type="button" class="kj-primary" id="kj-open-registration">＋ ثبت خادم جدید</button><button type="button" class="kj-primary" id="kj-open-import">ثبت فایل</button>':""}</div>
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
      <label class="kj-field" style="max-width:420px"><b>عکس خادم (اختیاری)</b><input id="kj-registration-photo" name="photo_file" type="file" accept="image/jpeg,image/png,image/webp"><img id="kj-registration-photo-preview" alt="پیش‌نمایش عکس خادم" style="display:none;max-width:160px;max-height:180px;object-fit:cover;border-radius:12px;margin-top:8px"></label><div class="kj-registration-grid">${fields.map(([name,label,type])=>`<label class="kj-field ${name==="khadem_code"?"kj-code-field":name==="full_name"?"kj-name-field":""}"><b>${label}</b><input name="${name}" type="${type}" ${name==="full_name"?"required":""} ${name==="khadem_code"?'readonly inputmode="numeric" aria-readonly="true"':""} value="${name==="khadem_code"?fa(nextKhademCode()):""}" autocomplete="off" placeholder="${name==="full_name"?"نام و نام خانوادگی را وارد کنید":""}"></label>`).join("")}</div>
      <fieldset style="border:1px solid #ddd6ce;border-radius:12px;padding:12px;margin:14px 0"><legend>مهارت‌ها و توانمندی‌ها</legend><div class="kj-skill-list">${skills.map(s=>`<label class="kj-pill" style="display:inline-flex;align-items:center;gap:6px;margin:4px"><input type="checkbox" name="skills" value="${esc(s)}">${esc(s)}</label>`).join("")}</div></fieldset>
      <label class="kj-field"><b>توضیحات</b><textarea name="notes" rows="3"></textarea></label>
      <div id="kj-registration-message" class="kj-muted" role="status" aria-live="polite"></div>
      <div class="kj-toolbar"><button class="kj-primary" type="submit" id="kj-save-registration">ثبت اطلاعات خادم</button><button class="kj-secondary" type="button" id="kj-cancel-registration">انصراف</button></div>
    </form>`;
  }
  function bindKhademRegistrationControls() {
    $("#kj-open-registration")?.addEventListener("click", () => { state.registrationOpen = !state.registrationOpen; render(); });
    $("#kj-open-import")?.addEventListener("click", openKhademImport);
    $("#kj-cancel-registration")?.addEventListener("click", () => { state.registrationOpen = false; render(); });
    $("#kj-registration-form")?.addEventListener("submit", e => { e.preventDefault(); saveKhademFromForm(e.currentTarget); });
    bindPhotoPreview("#kj-registration-photo","#kj-registration-photo-preview");
  }
  async function saveKhademFromForm(form) {
    if (!canPerform("khadems","create")) { const m=$("#kj-registration-message"); if(m)m.textContent="مجوز ثبت اطلاعات بانک خادمین برای این حساب فعال نیست."; return; }
    const message = $("#kj-registration-message"), button = $("#kj-save-registration"), fd = new FormData(form);
    const fullName = String(fd.get("full_name") || "").trim();
    if (!fullName) { if(message) message.textContent = "لطفاً نام و نام خانوادگی خادم را وارد کنید."; return; }
    const known = new Set(Object.keys(state.khadems[0] || {})), canInfer = known.size > 0, payload = {};
    let uploadedPhotoPath=null;
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
    const photoFile=fd.get("photo_file");
    if(!Object.keys(payload).length){if(message)message.textContent="ستون‌های لازم از اطلاعات فعلی قابل تشخیص نیست؛ هیچ اطلاعاتی ارسال نشد.";return;}
    if(button){button.disabled=true;button.textContent="در حال ثبت…";} if(message)message.textContent="در حال بررسی مجوز و ثبت اطلاعات…";
    try {
      if(photoFile instanceof File && photoFile.size){if(message)message.textContent="در حال بارگذاری عکس خادم…";uploadedPhotoPath=await uploadKhademPhoto(photoFile,{khadem_code:generatedCode});if(known.has("photo_path"))payload.photo_path=uploadedPhotoPath;else if(known.has("photo_url"))payload.photo_url=uploadedPhotoPath;else throw new Error("ستون ذخیره مسیر عکس در بانک خادمین پیدا نشد.");}
      const result=await request("/rest/v1/khadems",{method:"POST",headers:{"Prefer":"return=representation"},body:payload});
      if(!Array.isArray(result)||!result.length)throw new Error("سرور ثبت را تأیید نکرد؛ فهرست را تازه‌سازی و بررسی کنید.");
      state.registrationOpen=false;state.search="";await loadData();toast("اطلاعات خادم با موفقیت ثبت شد.","success");
    } catch(e) {
      if(uploadedPhotoPath){try{await request("/storage/v1/object/khadem-photos/"+financeReceiptPath(uploadedPhotoPath),{method:"DELETE"});}catch(_){}}
      if(message)message.textContent="ثبت انجام نشد: "+(e.message||"خطای نامشخص")+"؛ احتمال دارد مجوز ثبت عکس یا اطلاعات خادم کافی نباشد. اطلاعات قبلی تغییر نکرده است.";
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
    return '<form id="kj-profile-edit-form" novalidate><label class="kj-field" style="max-width:420px"><b>ثبت یا تغییر عکس خادم (اختیاری)</b><input id="kj-profile-photo-input" name="photo_file" type="file" accept="image/jpeg,image/png,image/webp"><img id="kj-profile-photo-preview" alt="پیش‌نمایش عکس خادم" style="display:none;max-width:160px;max-height:180px;object-fit:cover;border-radius:12px;margin-top:8px"></label><div class="kj-profile-grid">' +
      fields.map(([name,label,type,value]) => '<label class="kj-field"><b>'+esc(label)+'</b>'+(type==="select"?'<select name="'+name+'"><option value="">انتخاب وضعیت</option><option value="true" '+([true,"true","active","فعال","1"].includes(value)?"selected":"")+'>فعال</option><option value="false" '+([false,"false","inactive","غیرفعال","0"].includes(value)?"selected":"")+'>غیرفعال</option></select>':'<input name="'+name+'" type="'+type+'" value="'+esc(value)+'" autocomplete="off" dir="auto" style="box-sizing:border-box;width:100%;max-width:100%;min-width:0;display:block">')+'</label>').join("") +
      '<fieldset class="kj-edit-skills" style="grid-column:1/-1;min-width:0;border:1px solid #ddd6ce;border-radius:12px;padding:12px;margin:8px 0"><legend>مهارت‌ها و توانمندی‌ها — برای انتخاب یا حذف، گزینه‌ها را علامت بزنید</legend><div class="kj-skill-list" style="display:flex;flex-wrap:wrap;gap:8px">'+skillOptions.map(s=>'<label class="kj-pill" style="display:inline-flex;align-items:center;gap:6px;max-width:100%;white-space:normal;overflow-wrap:anywhere"><input type="checkbox" name="profile_skills" value="'+esc(s)+'" '+(currentSkills.includes(s)?"checked":"")+'>'+esc(s)+'</label>').join("")+'</div><label class="kj-field" style="margin-top:10px"><b>مهارت‌های دیگر (اختیاری؛ با ویرگول جدا کنید)</b><input name="custom_skills" type="text" dir="auto" value="'+esc(currentSkills.filter(s=>!skillOptions.includes(s)).join("، "))+'" style="box-sizing:border-box;width:100%;max-width:100%;min-width:0"></label></fieldset>' +
      '</div><div id="kj-profile-edit-message" class="kj-muted" role="status" aria-live="polite"></div><div class="kj-toolbar"><button class="kj-primary" id="kj-save-profile" type="submit">ذخیره تغییرات</button><button class="kj-secondary" type="button" id="kj-cancel-profile-edit">انصراف</button></div></form>';
  }
  async function saveKhademProfile(form) {
    if (!canPerform("khadems","update")) { const m=$("#kj-profile-edit-message"); if(m)m.textContent="مجوز ویرایش اطلاعات بانک خادمین برای این حساب فعال نیست."; return; }
    const k = selectedKhademRecord();
    const message = $("#kj-profile-edit-message"), button = $("#kj-save-profile");
    if (!k) { if(message) message.textContent = "پرونده خادم پیدا نشد."; return; }
    const fd = new FormData(form), known = new Set(Object.keys(k)), payload = {};
    let uploadedPhotoPath=null; const photoFile=fd.get("photo_file");
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
      if(photoFile instanceof File && photoFile.size){if(message)message.textContent="در حال بارگذاری عکس خادم…";uploadedPhotoPath=await uploadKhademPhoto(photoFile,k);if(known.has("photo_path"))payload.photo_path=uploadedPhotoPath;else if(known.has("photo_url"))payload.photo_url=uploadedPhotoPath;else throw new Error("ستون ذخیره مسیر عکس در بانک خادمین پیدا نشد.");}
      const savedRows = await request("/rest/v1/khadems?"+filter, {method:"PATCH", body:payload, headers:{"Prefer":"return=representation"}});
      if (!Array.isArray(savedRows) || savedRows.length === 0) throw new Error("پایگاه داده هیچ ردیفی را به‌روزرسانی نکرد؛ شناسه خادم یا مجوز ویرایش را بررسی کنید.");
      state.profileEditOpen = false;
      const access = await request("/functions/v1/manage-user-permissions", { method: "POST", body: { action: "my_permissions" } });
      state.role = access.role || approvedProfile.role || "user";
      state.accessPermissions = access.permissions && typeof access.permissions === "object" ? access.permissions : null;
      state.accessCustom = !!state.accessPermissions;
      // به پاسخ رسمی سرور احترام بگذار: حساب‌های بدون محدودیت اختصاصی full_access=true دارند؛
      // اگر مدیر اصلی محدودیت سفارشی ثبت کرده باشد، accessFull=false می‌ماند و محدودیت‌ها اجرا می‌شوند.
      state.accessFull = access.full_access === true && !state.accessCustom;
      if (!canAccess(state.tab)) state.tab = "dashboard";
      if (!canAccess(state.tab)) state.tab = "dashboard";
      await loadData();
      state.selectedKhadem = "code:" + String(khademCode(k));
      render();
      toast("تغییرات پرونده خادم ذخیره شد.","success");
    } catch (error) {
      if(uploadedPhotoPath){try{await request("/storage/v1/object/khadem-photos/"+financeReceiptPath(uploadedPhotoPath),{method:"DELETE"});}catch(_){}}
      if (message) message.textContent = "ذخیره انجام نشد: "+(error.message || "خطای نامشخص")+"؛ ممکن است مجوز ویرایش اطلاعات یا عکس خادم فعال نباشد.";
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
    const equipmentIssues = relatedRows(state.equipmentIssues, k);
    const equipmentRows = equipmentIssues.map(issue=>{const paid=state.equipmentPayments.filter(p=>String(p.issue_id)===String(issue.id)).reduce((sum,p)=>sum+num(p.amount_toman),0);const total=num(issue.total_amount_toman)||num(issue.quantity)*num(issue.unit_price_toman);return {...issue,item_label:({vest:"جلیقه",white_cap:"کلاه سفید",cream_cap:"کلاه کرم",fringe:"ریشه (پر)",service_shirt:"پیراهن خدمت"})[issue.item_key]||issue.item_key,quantity_display:issue.quantity,unit_price_display:money(num(issue.unit_price_toman)),total_display:money(total),paid_display:money(paid),balance_display:money(Math.max(0,total-paid)),status_display:issue.issue_status==="delivered"?"تحویل‌شده":issue.issue_status==="pending"?"در انتظار تحویل":"عودت‌شده"};});
    const fields = dataFields(k, ["id"]);
    const serviceCols = [
      {key:"service_date",label:"تاریخ خدمت"},
      {key:"responsibility",label:"مسئولیت خدمت"},
      {key:"service_type",label:"عنوان خدمت"},
      {key:"description",label:"شرح خدمت"}
    ];
    const financeCols = [
      {key:"transaction_type",label:"نوع رکورد"},
      {key:"category",label:"دسته‌بندی"},
      {key:"title",label:"عنوان"},
      {key:"amount_display",label:"مبلغ / اصل بدهی"},
      {key:"paid_display",label:"پرداخت‌شده"},
      {key:"balance_display",label:"مانده / بدهی"},
      {key:"transaction_date",label:"تاریخ"},
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
    // دفتر عمومی مبالغ را به ریال نگه می‌دارد؛ پرونده خادم آن‌ها را بدون تغییر داده اصلی به تومان نمایش می‌دهد.
    const financeTransactionRows = finances.map(r => ({
      ...r,
      transaction_type: val(r,["transaction_type","type","kind"]) || "تراکنش",
      category: val(r,["category","account_category"]) || "بدون دسته‌بندی",
      title: val(r,["title","description"]) || val(r,["category"]) || "تراکنش مالی",
      amount_display: money(Math.round(num(val(r,["amount","total_amount"]))/10)),
      paid_display: "—",
      balance_display: "—",
      transaction_date: val(r,["transaction_date","date","created_at"]),
      description: val(r,["description","notes","note"]) || ""
    }));
    const installmentRows = installments.map(r => ({
      ...r, transaction_type: "قسط", category: "اقساط",
      title: "قسط شماره " + fa(r.installment_number),
      amount_display: money(num(r.amount)),
      paid_display: money(num(r.paid_amount)),
      balance_display: money(Math.max(0, num(r.amount) - num(r.paid_amount))),
      transaction_date: r.due_date, description: val(r, ["notes"]) || r.status || ""
    }));
    const tuitionDueRows = tuitionDues.map(r => ({
      ...r, transaction_type: "شهریه", category: "شهریه",
      title: "شهریه دوره " + dateText(val(r,["period_month","due_date"]) || ""),
      amount_display: money(num(val(r,["amount_toman","amount","total_amount_toman"]))),
      paid_display: money(num(val(r,["paid_toman","amount_paid","paid_amount"]))),
      balance_display: money(Math.max(0, num(val(r,["amount_toman","amount","total_amount_toman"])) - num(val(r,["paid_toman","amount_paid","paid_amount"])))),
      transaction_date: val(r,["period_month","due_date","created_at"]),
      description: val(r,["notes"]) || val(r,["status"]) || ""
    }));
    const financeRows = [...financeTransactionRows, ...tuitionDueRows, ...installmentRows];
    const postedProfileFinances = finances.filter(r => String(val(r,["status"]) || "posted").toLowerCase() === "posted");
    const profileIncomeToman = postedProfileFinances.filter(r => ["income","receipt","دریافت","درآمد"].includes(String(val(r,["transaction_type","type","kind"]) || "").toLowerCase())).reduce((sum,r)=>sum+num(val(r,["amount","total_amount"]))/10,0);
    const profileExpenseToman = postedProfileFinances.filter(r => ["expense","payment","پرداخت","هزینه"].includes(String(val(r,["transaction_type","type","kind"]) || "").toLowerCase())).reduce((sum,r)=>sum+num(val(r,["amount","total_amount"]))/10,0);
    const profileTuitionBalance = tuitionDues.reduce((sum,r)=>sum+Math.max(0,num(val(r,["amount_toman","amount","total_amount_toman"]))-num(val(r,["paid_toman","amount_paid","paid_amount"]))),0);
    const profileInstallmentBalance = installments.reduce((sum,r)=>sum+Math.max(0,num(r.amount)-num(r.paid_amount)),0);
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
      if (!tuitionByYear[year]) tuitionByYear[year] = {year, first_due:0, first_paid:0, first_balance:0, second_due:0, second_paid:0, second_balance:0, annual_paid:0, annual_balance:0};
      const periodType=String(r.period_type||"");
      if(!["first_half","second_half","annual"].includes(periodType))return; // سوابق قدیمی بدون نوع دوره، با شهریه شش‌ماهه/سالانه مخلوط نشوند.
      const amount=num(val(r,["amount_toman","amount","total_amount_toman"])),paid=num(val(r,["paid_toman","amount_paid","paid_amount"])),balance=Math.max(0,amount-paid);
      if(periodType==="annual"){tuitionByYear[year].annual_due+=amount;tuitionByYear[year].annual_paid+=paid;tuitionByYear[year].annual_balance+=balance;}
      else {const half=periodType==="first_half"?"first":periodType==="second_half"?"second":month<=6?"first":"second";tuitionByYear[year][half+"_due"]+=amount;tuitionByYear[year][half+"_paid"]+=paid;tuitionByYear[year][half+"_balance"]+=balance;}
    });
    const tuitionHalfRows = Object.values(tuitionByYear).sort((a,b)=>String(b.year).localeCompare(String(a.year))).map(r=>({
      year:r.year, first_due:r.first_due, first_paid:r.first_paid, first_balance:r.first_balance, second_due:r.second_due, second_paid:r.second_paid, second_balance:r.second_balance, annual_due:r.annual_due||0, annual_paid:r.annual_paid||0, annual_balance:r.annual_balance||0
    }));
    const tuitionHalfSummary = tuitionHalfRows.length
      ? '<h4 class="kj-section-title">خلاصه پرداخت شهریه در دو دوره شش‌ماهه</h4>'+tableHtml(tuitionHalfRows,[
        {key:"year",label:"سال"},{key:"first_due",label:"شهریه ۶ ماه اول"},{key:"first_paid",label:"پرداخت ۶ ماه اول"},{key:"first_balance",label:"مانده ۶ ماه اول"},
        {key:"second_due",label:"شهریه ۶ ماه دوم"},{key:"second_paid",label:"پرداخت ۶ ماه دوم"},{key:"second_balance",label:"مانده ۶ ماه دوم"},{key:"annual_due",label:"شهریه سالانه"},{key:"annual_paid",label:"پرداخت سالانه"},{key:"annual_balance",label:"مانده سالانه"}
      ],"اطلاعات شهریه ثبت نشده است")
      : '<p class="kj-muted">برای نمایش جمع پرداخت شهریه در دو دوره شش‌ماهه، سوابق شهریه باید دارای تاریخ دوره و مبلغ پرداخت باشند.</p>';
    const serviceRows = services.map(r => ({...r, ...normalize(r, ["service_date","responsibility","service_type","description"])}));
    return `<div class="kj-toolbar"><button class="kj-secondary" id="kj-back">← بازگشت به فهرست</button></div>
      <div class="kj-card" style="display:flex;justify-content:center;align-items:center;margin:10px 0 16px;padding:18px"><img id="kj-profile-photo" alt="عکس ${esc(nameOf(k))}" data-photo-path="${esc(khademPhotoPath(k))}" style="display:none;width:150px;height:180px;object-fit:cover;border-radius:14px;border:2px solid #d9c7a4;background:#f5f5f5"></div><h1 class="kj-page-title">پروندهٔ ${esc(nameOf(k))}</h1>
      <div class="kj-card"><div class="kj-toolbar" style="justify-content:space-between"><h3 class="kj-section-title" style="margin:0">پرونده خادم: ${esc(khademIdentityText(k))}</h3>${canPerform("khadems","update")?'<button type="button" class="kj-primary" id="kj-edit-profile">'+(state.profileEditOpen?"بستن ویرایش":"✏️ ویرایش مشخصات خادم")+'</button>':""}</div><div class="kj-profile-details">${state.profileEditOpen ? khademEditForm(k) : fields}</div></div>
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
      <div class="kj-card kj-khadem-finance-card" style="margin-top:14px"><div class="kj-card-heading"><div><span class="kj-section-eyebrow">پرونده مالی متصل</span><h3 class="kj-section-title">خلاصه امور مالی خادم</h3></div><button type="button" class="kj-text-action" data-quick-tab="finance">مشاهده دفتر مالی ←</button></div>${errBox("finance_transactions")}${errBox("tuition_dues")}${errBox("finance_installments")}${financeLoadError ? empty("به دلیل خطای دریافت، خالی بودن سوابق مالی قابل تأیید نیست.") : `<div class="kj-finance-profile-summary"><div><span>دریافت‌های قطعی‌شده</span><b>${esc(money(Math.round(profileIncomeToman)))}</b></div><div><span>پرداخت‌های قطعی‌شده</span><b>${esc(money(Math.round(profileExpenseToman)))}</b></div><div><span>مانده شهریه</span><b>${esc(money(profileTuitionBalance))}</b></div><div><span>مانده اقساط</span><b>${esc(money(profileInstallmentBalance))}</b></div></div>` + tuitionHalfSummary + tableHtml(financeRows,financeCols,"هنوز سابقه مالی ثبت نشده است") + '<h4 class="kj-section-title">سوابق البسه و تجهیزات خادم</h4>' + tableHtml(equipmentRows,[{key:"item_label",label:"قلم لباس / تجهیزات"},{key:"quantity_display",label:"تعداد"},{key:"unit_price_display",label:"قیمت واحد هنگام ثبت"},{key:"total_display",label:"مبلغ کل"},{key:"paid_display",label:"پرداخت خادم"},{key:"balance_display",label:"مانده بدهی"},{key:"status_display",label:"وضعیت"}],"برای این خادم سابقه البسه و تجهیزات ثبت نشده است")}</div>`;
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
        <a class="kj-primary" href="./admin-permissions.html?v=20261017-appwide-crud3" style="display:inline-flex;align-items:center;justify-content:center;text-decoration:none">مدیریت جزئی دسترسی‌ها ←</a>
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
    if(financeView==="new-tuition") financeView="tuition";
    const rows = state.finance.map((r,index) => {
      const k=state.khadems.find(x=>String(khademId(x))===String(r.khadem_id));
      return {...r,_index:index,
        transaction_type:val(r,["transaction_type","type","kind"]),
        khadem_code:val(r,["khadem_code","personnel_code"])||(k?khademCode(k):""),
        khadem_name:val(r,["khadem_name","full_name"])||(k?nameOf(k):""),
        category:val(r,["category","account_category"])||"بدون دسته‌بندی",
        title:val(r,["title","description"])||val(r,["category"])||"تراکنش مالی",
        amount_toman:num(val(r,["amount","total_amount"]))/10,
        transaction_date:val(r,["transaction_date","date","created_at"]),
        description:val(r,["description","notes","note"])||"",
        status:val(r,["status"])||"نامشخص"};
    });
    const posted=rows.filter(r=>String(r.status).toLowerCase()==="posted");
    const income=posted.filter(r=>["income","receipt","دریافت","درآمد"].includes(String(r.transaction_type).toLowerCase())).reduce((s,r)=>s+r.amount_toman,0);
    const expense=posted.filter(r=>["expense","payment","پرداخت","هزینه"].includes(String(r.transaction_type).toLowerCase())).reduce((s,r)=>s+r.amount_toman,0);
    const categories=[...new Set(rows.map(r=>r.category))].sort((a,b)=>a.localeCompare(b,"fa"));
    const filtered=rows.filter(r=>{
      const q=financeSearch.trim().toLocaleLowerCase("fa");
      const hay=[r.title,r.category,r.transaction_type,r.khadem_code,r.khadem_name,r.reference_no,r.tracking_number,r.description].join(" ").toLocaleLowerCase("fa");
      return (!q||hay.includes(q))&&(financeTypeFilter==="all"||String(r.transaction_type).toLowerCase()===financeTypeFilter)&&(financeCategoryFilter==="all"||r.category===financeCategoryFilter)&&(financeStatusFilter==="all"||String(r.status).toLowerCase()===financeStatusFilter);
    }).sort((a,b)=>String(b.transaction_date||"").localeCompare(String(a.transaction_date||"")));
    const toman=v=>money(Math.round(v));
    const tabs=[["overview","نمای کلی"],["new-income","＋ ثبت دریافت"],["new-expense","－ ثبت پرداخت"],["transactions","دفتر تراکنش‌ها"],["tuition","شهریه و اقساط"],["new-tuition-payment","ثبت پرداخت شهریه"],["membership-allocation","سهم هیئت و صندوق"],["installments","اقساط"],["accounts","حساب‌ها"],["pricing","تعرفه‌ها و قیمت‌ها"],["reports","گزارش‌ها"]];
    const nav='<div class="kj-finance-nav" role="tablist">'+tabs.map(([id,label])=>'<button type="button" role="tab" aria-selected="'+(financeView===id)+'" class="'+(financeView===id?'active':'')+'" data-finance-view="'+id+'">'+label+'</button>').join("")+'</div>';
    const typeLabel=v=>({income:"دریافت",expense:"پرداخت",transfer:"انتقال",receipt:"دریافت",payment:"پرداخت"})[String(v).toLowerCase()]||v||"نامشخص";
    const table=data=>data.length?'<div class="kj-table-wrap kj-finance-table-wrap"><table class="kj-finance-table"><thead><tr><th>تاریخ</th><th>نوع</th><th>عنوان</th><th>دسته‌بندی</th><th>خادم</th><th>مبلغ (تومان)</th><th>وضعیت</th><th>جزئیات</th></tr></thead><tbody>'+data.map(r=>'<tr><td>'+esc(dateText(r.transaction_date))+'</td><td>'+esc(typeLabel(r.transaction_type))+'</td><td><b>'+esc(r.title)+'</b><small class="kj-finance-cell-sub">'+esc(r.party||r.description||"")+'</small></td><td>'+esc(r.category)+'</td><td>'+(r.khadem_code?esc(r.khadem_code+" — "+r.khadem_name):"—")+'</td><td class="kj-finance-amount">'+esc(toman(r.amount_toman))+'</td><td>'+esc(({posted:"قطعی‌شده",draft:"پیش‌نویس",pending:"در انتظار بررسی",void:"باطل‌شده"})[String(r.status).toLowerCase()]||r.status)+'</td><td><button type="button" class="kj-link" data-finance-detail="'+r._index+'">جزئیات</button>'+'<button type="button" class="kj-link" data-finance-edit="'+esc(r.id)+'">ویرایش</button>'+(r.receipt_image_path?'<button type="button" class="kj-link" data-finance-receipt="'+esc(r.receipt_image_path)+'">مشاهده سند</button>':"")+(String(r.status).toLowerCase()==="draft"?'<button type="button" class="kj-link" data-finance-post="'+esc(r.id)+'">قطعی‌سازی</button><button type="button" class="kj-link" data-finance-void="'+esc(r.id)+'">ابطال</button>':"")+'</td></tr>').join("")+'</tbody></table></div>':empty(state.errors.finance_transactions?"دریافت اطلاعات مالی ناموفق بود؛ خالی بودن سوابق قابل تأیید نیست.":"تراکنشی برای نمایش پیدا نشد.");
    const pricingConfig=state.financePricing[0]||{};
    const annualTuition=Number.isFinite(Number(pricingConfig.annual_tuition_toman))?Number(pricingConfig.annual_tuition_toman):2000000;
    const itemPrices=Object.assign({vest:0,white_cap:0,cream_cap:0,fringe:0,service_shirt:0},pricingConfig.item_prices||{});
    const currentJalaliYear=jalaliPartsFromDate(new Date()).year;
    const membershipRules=Object.assign({new_member_fee_toman:2400000,new_monthly_committee_toman:200000,old_first_half_monthly_toman:100000,old_second_half_monthly_toman:200000,classification_start_date:"2026-03-21",planning_year:currentJalaliYear},pricingConfig.membership_fee_rules||{});
    const planningYear=Number(membershipRules.planning_year)||currentJalaliYear;
    const oldAnnualFee=6*Number(membershipRules.old_first_half_monthly_toman)+6*Number(membershipRules.old_second_half_monthly_toman);
    const khademOptions='<option value="">بدون اتصال به خادم</option>'+state.khadems.map(k=>'<option value="'+esc(khademId(k))+'">'+esc(khademCode(k)+' — '+nameOf(k))+'</option>').join("");
    const accountOptions='<option value="">بدون تعیین حساب</option>'+state.financeAccounts.filter(a=>a.is_active!==false).map(a=>'<option value="'+esc(a.id)+'">'+esc((a.account_code||"")+" — "+(a.account_name||""))+'</option>').join("");
    const entryForm=(kind)=>'<section class="kj-card kj-finance-panel kj-finance-form-panel"><h2>ثبت '+(kind==="income"?"دریافت مالی":"پرداخت / هزینه")+'</h2><p class="kj-muted">اطلاعات ابتدا به‌صورت پیش‌نویس ذخیره می‌شود و تا زمان بررسی، در جمع اسناد قطعی محاسبه نخواهد شد.</p><form id="kj-finance-entry-form" data-entry-type="'+kind+'"><div class="kj-finance-form-grid"><label>عنوان سند *<input name="title" required maxlength="180" placeholder="'+(kind==="income"?"مثلاً دریافت کمک یا حق عضویت":"مثلاً خرید اقلام یا هزینه مأموریت")+'"></label><label>تاریخ *<input name="transaction_date" type="text" inputmode="none" data-jalali-date autocomplete="off" placeholder="۱۴۰۵/۰۷/۲۴" value="'+jalaliInputDate(new Date().toISOString().slice(0,10))+'" required></label><label>مبلغ (تومان) *<input name="amount_toman" type="number" min="1" step="1" inputmode="numeric" required placeholder="مبلغ به تومان"></label><label>دسته‌بندی *<select name="category" required><option value="">انتخاب کنید</option>'+["شهریه","کمک و نذورات","حق عضویت","البسه و تجهیزات","هزینه سفر و مأموریت","هزینه مراسم","پشتیبانی و اداری","سایر"].map(c=>'<option>'+c+'</option>').join("")+'</select></label><label>ارتباط با خادم<select name="khadem_id">'+khademOptions+'</select></label><label>حساب / صندوق<select name="account_id">'+accountOptions+'</select></label><label>طرف حساب<input name="party" maxlength="180" placeholder="نام پرداخت‌کننده یا دریافت‌کننده"></label><label>روش پرداخت<select name="payment_method"><option value="cash">نقدی</option><option value="card">کارت‌به‌کارت / کارت‌خوان</option><option value="bank_transfer">انتقال بانکی</option><option value="check">چک</option><option value="other">سایر</option></select></label><label>شماره پیگیری<input name="reference_no" maxlength="100" placeholder="اختیاری"></label><label>شماره رسید / سند<input name="tracking_number" maxlength="100" placeholder="اختیاری"></label><label class="kj-finance-form-wide">تصویر سند دریافت / پرداخت<input name="receipt_file" type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.heic,.heif,image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,application/pdf"><small>اختیاری؛ تصویر JPG، PNG، WEBP، GIF، HEIC/HEIF یا PDF، حداکثر ۸ مگابایت. فایل در فضای خصوصی نگهداری می‌شود.</small></label><label class="kj-finance-form-wide">شرح و توضیحات<textarea name="description" rows="3" maxlength="2000" placeholder="جزئیات تکمیلی، علت هزینه یا توضیح دریافت"></textarea></label></div><div class="kj-finance-form-actions"><button class="kj-primary" type="submit">ذخیره پیش‌نویس</button><button class="kj-secondary" type="reset">پاک‌کردن فرم</button></div><p class="kj-small" role="status" id="kj-finance-form-status"></p></form></section>';
    const tuitionPaymentForm='<section class="kj-card kj-finance-panel kj-finance-form-panel"><h2>ثبت پرداخت شهریه</h2><p class="kj-muted">نوع خادم از تاریخ عضویت تشخیص داده می‌شود. خادم جدید فقط مبلغ ورودی سالانه را ثبت می‌کند؛ خادم قدیمی می‌تواند شهریه سالانه یا نیم‌سال اول/دوم را با تعرفه همان دوره پرداخت کند.</p><form id="kj-tuition-payment-form"><div class="kj-finance-form-grid"><label>خادم *<select name="khadem_id" required><option value="">انتخاب خادم</option>'+state.khadems.map(k=>'<option value="'+esc(khademId(k))+'">'+esc(khademCode(k)+' — '+nameOf(k))+'</option>').join("")+'</select></label><label>دوره پرداخت شهریه *<select name="period_type" required><option value="first_half">شش‌ماهه اول سال</option><option value="second_half">شش‌ماهه دوم سال</option><option value="annual">سالیانه (کل سال)</option></select></label><label>سال هجری شمسی *<select name="period_year" required>'+Array.from({length:61},(_,i)=>1390+i).reverse().map(y=>'<option value="'+y+'" '+(y===jalaliPartsFromDate(new Date()).year?'selected':'')+'>'+fa(y)+'</option>').join("")+'</select></label><label>مبلغ شهریه دوره (تومان) *<input name="amount_toman" type="number" min="1" step="1" inputmode="numeric" required value="'+esc(Math.round(annualTuition/2))+'"></label><label>تاریخ پرداخت *<input name="paid_date" type="text" inputmode="none" data-jalali-date autocomplete="off" placeholder="۱۴۰۵/۰۷/۲۴" value="'+jalaliInputDate(new Date().toISOString().slice(0,10))+'" required></label><label>روش پرداخت<select name="payment_method"><option value="cash">نقدی</option><option value="card">کارت‌به‌کارت / کارت‌خوان</option><option value="bank_transfer">انتقال بانکی</option><option value="check">چک</option><option value="other">سایر</option></select></label><label>شماره پیگیری<input name="reference_no" maxlength="100" placeholder="اختیاری"></label><label class="kj-finance-form-wide">تصویر رسید پرداخت<input name="receipt_file" type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.heic,.heif,image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,application/pdf"><small>اختیاری؛ تصویر JPG، PNG، WEBP، GIF، HEIC/HEIF یا PDF، حداکثر ۸ مگابایت.</small></label><label class="kj-finance-form-wide">توضیحات<textarea name="notes" rows="2" maxlength="1000"></textarea></label></div><div class="kj-finance-form-actions"><button class="kj-primary" type="submit">ثبت پرداخت شهریه</button></div><p class="kj-small" role="status" id="kj-tuition-payment-status"></p></form></section>';
    const installmentForm='<section class="kj-card kj-finance-panel kj-finance-form-panel"><h2>ثبت قسط</h2><p class="kj-muted">قسط باید به یک سند مالی موجود متصل شود. مبلغ‌ها در این فرم به تومان وارد می‌شوند.</p><form id="kj-installment-entry-form"><div class="kj-finance-form-grid"><label>سند مالی مرتبط *<select name="transaction_id" required><option value="">انتخاب سند</option>'+state.finance.map(r=>'<option value="'+esc(r.id)+'">'+esc((r.transaction_date||"")+" — "+(r.title||"سند مالی")+" — "+money(Math.round(num(r.amount)/10))+" تومان")+'</option>').join("")+'</select></label><label>خادم مرتبط<select name="khadem_id">'+khademOptions+'</select></label><label>شماره قسط *<input name="installment_number" type="number" min="1" step="1" required></label><label>مبلغ قسط (تومان) *<input name="amount" type="number" min="1" step="1" required inputmode="numeric"></label><label>تاریخ سررسید *<input name="due_date" type="text" inputmode="none" data-jalali-date autocomplete="off" placeholder="۱۴۰۵/۰۷/۲۴" required></label><label class="kj-finance-form-wide">توضیحات<textarea name="notes" rows="2" maxlength="1000"></textarea></label></div><div class="kj-finance-form-actions"><button class="kj-primary" type="submit">ثبت قسط</button></div><p class="kj-small" role="status" id="kj-installment-form-status"></p></form></section>';
    const accountsForm='<section class="kj-card kj-finance-panel kj-finance-form-panel"><h2>تعریف حساب یا صندوق</h2><form id="kj-finance-account-form"><div class="kj-finance-form-grid"><label>کد حساب *<input name="account_code" required maxlength="40" placeholder="مثلاً CASH-01"></label><label>نام حساب *<input name="account_name" required maxlength="120" placeholder="صندوق نقدی مجموعه"></label><label>نوع حساب<select name="account_type"><option value="cash">صندوق نقدی</option><option value="bank">حساب بانکی</option><option value="receivable">مطالبات</option><option value="payable">بدهی‌ها</option><option value="other">سایر</option></select></label><label>وضعیت<select name="is_active"><option value="true">فعال</option><option value="false">غیرفعال</option></select></label><label class="kj-finance-form-wide">توضیحات<textarea name="notes" rows="2" maxlength="1000"></textarea></label></div><div class="kj-finance-form-actions"><button class="kj-primary" type="submit">ذخیره حساب</button></div><p class="kj-small" role="status" id="kj-account-form-status"></p></form></section>';
    const filters='<form class="kj-finance-filters" id="kj-finance-filter-form"><label>جست‌وجو<input id="kj-finance-search" type="search" value="'+esc(financeSearch)+'" placeholder="عنوان، کد خادم، دسته‌بندی…"></label><label>نوع<select id="kj-finance-type"><option value="all">همه انواع</option><option value="income" '+(financeTypeFilter==="income"?"selected":"") +'>دریافت</option><option value="expense" '+(financeTypeFilter==="expense"?"selected":"") +'>پرداخت</option><option value="transfer" '+(financeTypeFilter==="transfer"?"selected":"") +'>انتقال</option></select></label><label>دسته‌بندی<select id="kj-finance-category"><option value="all">همه دسته‌ها</option>'+categories.map(c=>'<option value="'+esc(c)+'" '+(financeCategoryFilter===c?"selected":"")+'>'+esc(c)+'</option>').join("")+'</select></label><label>وضعیت<select id="kj-finance-status"><option value="all">همه وضعیت‌ها</option><option value="posted" '+(financeStatusFilter==="posted"?"selected":"") +'>قطعی‌شده</option><option value="draft" '+(financeStatusFilter==="draft"?"selected":"") +'>پیش‌نویس</option><option value="pending" '+(financeStatusFilter==="pending"?"selected":"") +'>در انتظار</option><option value="void" '+(financeStatusFilter==="void"?"selected":"") +'>باطل‌شده</option></select></label><div class="kj-finance-filter-actions"><button type="submit" class="kj-primary">اعمال فیلتر</button><button type="button" class="kj-secondary" id="kj-finance-clear">پاک‌کردن</button><button type="button" class="kj-secondary" id="kj-finance-export">خروجی CSV</button></div></form>';
    const totals=categories.map(category=>({category,total:rows.filter(r=>r.category===category).reduce((s,r)=>s+r.amount_toman,0)})).sort((a,b)=>b.total-a.total).slice(0,6);
    const max=Math.max(1,...totals.map(x=>x.total));
    const chart='<div class="kj-finance-category-list">'+totals.map(c=>'<div class="kj-finance-category-row"><div><span>'+esc(c.category)+'</span><b>'+esc(toman(c.total))+'</b></div><div class="kj-finance-bar"><span style="width:'+Math.max(2,Math.min(100,c.total/max*100))+'%"></span></div></div>').join("")+'</div>';
    let body="";
    if(financeView==="new-income" || financeView==="new-expense"){
      body=entryForm(financeView==="new-income"?"income":"expense");
    }else if(financeView==="new-tuition-payment"){
      body=tuitionPaymentForm+'<section class="kj-card kj-finance-panel"><h3>پرداخت‌های ثبت‌شده شهریه</h3>'+genericPage("tuitionPayments","دفتر پرداخت شهریه",state.tuitionPayments,[{key:"tuition_due_id",label:"شناسه بدهی"},{key:"khadem_id",label:"شناسه خادم"},{key:"amount_toman",label:"مبلغ (تومان)"},{key:"paid_date",label:"تاریخ پرداخت"},{key:"finance_transaction_id",label:"سند مالی"},{key:"notes",label:"توضیحات"}])+'</section>';
    }else if(financeView==="installments"){
      body=installmentForm+'<section class="kj-card kj-finance-panel"><h3>اقساط ثبت‌شده</h3>'+errBox("finance_installments")+genericPage("financeInstallments","دفتر اقساط",state.financeInstallments,[{key:"transaction_id",label:"سند مالی"},{key:"khadem_id",label:"شناسه خادم"},{key:"installment_number",label:"شماره قسط"},{key:"amount",label:"مبلغ (تومان)"},{key:"paid_amount",label:"پرداخت‌شده"},{key:"due_date",label:"سررسید"},{key:"status",label:"وضعیت"}])+'</section>';
    }else if(financeView==="pricing"){
      body='<section class="kj-card kj-finance-panel kj-finance-form-panel"><h2>تعرفه‌های مالی جاری</h2><p class="kj-muted">قیمت‌ها و قواعد زیر مبنای محاسبات جدید هستند؛ سوابق مالی گذشته تغییر نمی‌کنند. نوع خادم از تاریخ عضویت ثبت‌شده در بانک خادمین تشخیص داده می‌شود.</p><form id="kj-finance-pricing-form"><h3 class="kj-section-title">قواعد شهریه خادمین</h3><div class="kj-finance-form-grid"><label>سال مالی شمسی<input name="planning_year" type="number" min="1300" max="1500" step="1" required value="'+esc(planningYear)+'"></label><label>تاریخ آغاز عضویت خادم جدید (شمسی)<input name="classification_start_date" type="text" data-jalali-date inputmode="none" autocomplete="off" required value="'+esc(jalaliInputDate(membershipRules.classification_start_date||"2026-03-21"))+'"><small>تاریخ عضویت از این روز به بعد، خادم جدید محسوب می‌شود.</small></label><label>مبلغ دریافتی از خادم جدید هنگام عضویت (تومان)<input name="new_member_fee_toman" type="number" min="1" step="1" required value="'+esc(membershipRules.new_member_fee_toman)+'"></label><label>سهم ماهانه هیئت از خادم جدید (تومان)<input name="new_monthly_committee_toman" type="number" min="0" step="1" required value="'+esc(membershipRules.new_monthly_committee_toman)+'"></label><label>شهریه ماهانه خادم قدیمی در ۶ ماه اول (تومان)<input name="old_first_half_monthly_toman" type="number" min="0" step="1" required value="'+esc(membershipRules.old_first_half_monthly_toman)+'"></label><label>شهریه ماهانه خادم قدیمی در ۶ ماه دوم (تومان)<input name="old_second_half_monthly_toman" type="number" min="0" step="1" required value="'+esc(membershipRules.old_second_half_monthly_toman)+'"></label><label>شهریه سالانه خادم قدیمی (محاسبه خودکار)<input type="text" readonly value="'+esc(money(oldAnnualFee))+'"></label><label>مجموع سهم هیئت برای خادم قدیمی (سالانه)<input type="text" readonly value="'+esc(money(oldAnnualFee))+'"></label></div><h3 class="kj-section-title">قیمت البسه و تجهیزات</h3><div class="kj-finance-form-grid"><label>جلیقه (تومان)<input name="vest" type="number" min="0" step="1" value="'+esc(itemPrices.vest)+'"></label><label>کلاه سفید (تومان)<input name="white_cap" type="number" min="0" step="1" value="'+esc(itemPrices.white_cap)+'"></label><label>کلاه کرم (تومان)<input name="cream_cap" type="number" min="0" step="1" value="'+esc(itemPrices.cream_cap)+'"></label><label>ریشه (پر) (تومان)<input name="fringe" type="number" min="0" step="1" value="'+esc(itemPrices.fringe)+'"></label><label>پیراهن خدمت (تومان)<input name="service_shirt" type="number" min="0" step="1" value="'+esc(itemPrices.service_shirt)+'"><small>تا مشخص شدن قیمت، صفر باقی بماند.</small></label></div><div class="kj-finance-form-actions"><button class="kj-primary" type="submit">ذخیره تعرفه‌ها و قواعد</button></div><p class="kj-small" id="kj-finance-pricing-status" role="status"></p></form></section>';
    }else if(financeView==="membership-allocation"){
      const rows=state.khadems.map(k=>{
        const membershipDate=String(k.membership_date||"").slice(0,10);
        if(!membershipDate)return {k,date:"",type:"تاریخ عضویت ثبت نشده",fee:0,committee:0,fund:0,months:0,missing:true};
        const isNew=membershipDate>=String(membershipRules.classification_start_date||"2026-03-21");
        const parts=jalaliPartsFromDate(new Date(membershipDate+"T12:00:00Z"));
        const months=isNew&&parts.year===planningYear?Math.max(0,12-parts.month):0;
        const monthNames=["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
        const dueMonths=isNew&&parts.year===planningYear?monthNames.slice(parts.month):[];
        const fee=isNew?Number(membershipRules.new_member_fee_toman):oldAnnualFee;
        const committee=isNew?months*Number(membershipRules.new_monthly_committee_toman):oldAnnualFee;
        const fund=isNew?Math.max(0,fee-committee):0;
        return {k,date:membershipDate,type:isNew?"خادم جدید":"خادم قدیمی",fee,committee,fund,months,dueMonths,missing:false};
      }).sort((a,b)=>(a.missing?2:a.type==="خادم جدید"?0:1)-(b.missing?2:b.type==="خادم جدید"?0:1)||nameOf(a.k).localeCompare(nameOf(b.k),"fa"));
      const valid=rows.filter(r=>!r.missing);
      const totalFee=valid.reduce((s,r)=>s+r.fee,0),totalCommittee=valid.reduce((s,r)=>s+r.committee,0),totalFund=valid.reduce((s,r)=>s+r.fund,0);
      const newCount=valid.filter(r=>r.type==="خادم جدید").length,oldCount=valid.filter(r=>r.type==="خادم قدیمی").length,missingCount=rows.filter(r=>r.missing).length;
      const allocationTable=rows.length?'<div class="kj-table-wrap kj-finance-table-wrap"><table class="kj-finance-table"><thead><tr><th>کد خادم</th><th>نام خادم</th><th>تاریخ عضویت</th><th>نوع خادم</th><th>مبلغ ورودی طبق تعرفه</th><th>ماه‌های پرداخت سهم هیئت</th><th>سهم هیئت</th><th>سهم صندوق مجموعه</th></tr></thead><tbody>'+rows.map(r=>'<tr><td>'+esc(khademCode(r.k)||"—")+'</td><td>'+esc(nameOf(r.k))+'</td><td>'+esc(r.date?dateText(r.date):"—")+'</td><td>'+esc(r.type)+'</td><td>'+esc(r.missing?"—":money(r.fee))+'</td><td>'+esc(r.missing?"—":r.type==="خادم قدیمی"?"فروردین تا شهریور: "+money(Number(membershipRules.old_first_half_monthly_toman))+" ماهانه؛ مهر تا اسفند: "+money(Number(membershipRules.old_second_half_monthly_toman))+" ماهانه":(r.dueMonths&&r.dueMonths.length?r.dueMonths.join("، "):"بدون ماه باقی‌مانده"))+'</td><td>'+esc(r.missing?"—":money(r.committee))+'</td><td>'+esc(r.missing?"—":money(r.fund))+'</td></tr>').join("")+'</tbody></table></div>':empty("هنوز خادمی در بانک ثبت نشده است.");
      body='<section class="kj-card kj-finance-panel"><h2>برنامه سهم هیئت و صندوق مجموعه</h2><p class="kj-muted">سال مالی '+esc(fa(planningYear))+'؛ نوع خادم بر اساس تاریخ عضویت و تاریخ شروع خادم جدید تعیین شده است. این گزارش برآورد سهم‌ها طبق تعرفه است و به‌تنهایی رسید وصول یا سند واریز واقعی ایجاد نمی‌کند.</p><div class="kj-finance-metrics"><div class="kj-finance-metric"><span>خادمین جدید</span><strong>'+esc(fa(newCount))+'</strong></div><div class="kj-finance-metric"><span>خادمین قدیمی</span><strong>'+esc(fa(oldCount))+'</strong></div><div class="kj-finance-metric"><span>مجموع مبالغ ورودی طبق تعرفه</span><strong>'+esc(money(totalFee))+'</strong></div><div class="kj-finance-metric"><span>سهم برنامه‌ریزی‌شده هیئت</span><strong>'+esc(money(totalCommittee))+'</strong></div><div class="kj-finance-metric"><span>سهم برنامه‌ریزی‌شده صندوق</span><strong>'+esc(money(totalFund))+'</strong></div></div>'+(missingCount?'<p class="kj-alert">برای '+esc(fa(missingCount))+' خادم تاریخ عضویت ثبت نشده است؛ تا ثبت تاریخ، نوع و سهم مالی او محاسبه نمی‌شود.</p>':'')+'<div class="kj-finance-notice"><b>قاعده محاسبه:</b> خادم قدیمی: ۶×شهریه ماهانه نیمه اول + ۶×شهریه ماهانه نیمه دوم، تماماً سهم هیئت. خادم جدید: مبلغ ورودی ۲٬۴۰۰٬۰۰۰ تومان؛ سهم هیئت از ماه پس از عضویت تا اسفند، هر ماه ۲۰۰٬۰۰۰ تومان؛ باقیمانده سهم صندوق مجموعه است.</div>'+allocationTable+'</section>';
    }else if(financeView==="accounts"){
      body=accountsForm+'<section class="kj-card kj-finance-panel"><h3>حساب‌ها و صندوق‌های تعریف‌شده</h3>'+ (state.financeAccounts.length?'<div class="kj-table-wrap"><table class="kj-table"><thead><tr><th>کد</th><th>نام حساب</th><th>نوع</th><th>وضعیت</th><th>توضیحات</th></tr></thead><tbody>'+state.financeAccounts.map(a=>'<tr><td>'+esc(a.account_code||"—")+'</td><td>'+esc(a.account_name||"—")+'</td><td>'+esc(a.account_type||"—")+'</td><td>'+(a.is_active===false?"غیرفعال":"فعال")+'</td><td>'+esc(a.notes||"")+'</td></tr>').join("")+'</tbody></table></div>':empty(state.errors.financeAccounts?"دریافت حساب‌ها ناموفق بود؛ خالی بودن فهرست قابل تأیید نیست.":"هنوز حسابی تعریف نشده است."))+'</section>';
    }else if(financeView==="overview"){
      const recent=[...rows].sort((a,b)=>String(b.transaction_date||"").localeCompare(String(a.transaction_date||""))).slice(0,5);
      body='<div class="kj-finance-hero"><div><span class="kj-finance-eyebrow">FINANCE WORKSPACE · میزکار مالی</span><h2>مرکز کنترل امور مالی</h2><p>نمای یکپارچه دفتر مالی، شهریه و تعهدات ثبت‌شده</p></div><div class="kj-finance-hero-mark">﷼</div></div><div class="kj-finance-notice"><b>واحد پول:</b> مبالغ دفتر عمومی در پایگاه داده به ریال ذخیره می‌شوند؛ برای نمایش تومان بر ۱۰ تقسیم شده‌اند. داده اصلی تغییر نمی‌کند.</div><div class="kj-finance-metrics"><div class="kj-finance-metric positive"><span>دریافت قطعی‌شده</span><strong>'+esc(toman(income))+'</strong><small>اسناد قطعی</small></div><div class="kj-finance-metric negative"><span>پرداخت قطعی‌شده</span><strong>'+esc(toman(expense))+'</strong><small>اسناد قطعی</small></div><div class="kj-finance-metric"><span>خالص گردش</span><strong>'+esc(toman(income-expense))+'</strong><small>دریافت منهای پرداخت</small></div><div class="kj-finance-metric"><span>تعداد اسناد</span><strong>'+fa(rows.length)+'</strong><small>همه وضعیت‌ها</small></div></div><div class="kj-finance-two-col"><section class="kj-card kj-finance-panel"><h3>گردش بر اساس دسته‌بندی</h3>'+chart+'</section><section class="kj-card kj-finance-panel"><h3>میانبرهای مالی</h3><div class="kj-finance-shortcuts"><button type="button" data-finance-view="transactions">دفتر تراکنش‌ها<small>جست‌وجو و خروجی</small></button><button type="button" data-finance-view="tuition">شهریه و اقساط<small>سررسیدها و تعهدات</small></button>'+(canAccess("fund")?'<button type="button" data-quick-tab="fund">صندوق و خزانه</button>':"")+(canAccess("equipment")?'<button type="button" data-quick-tab="equipment">البسه و تجهیزات</button>':"")+'</div></section></div><section class="kj-card kj-finance-panel"><h3>آخرین تراکنش‌ها</h3>'+table(recent)+'</section>';
    }else if(financeView==="transactions"){
      body='<section class="kj-card kj-finance-panel"><div class="kj-finance-panel-head"><div><h2>دفتر تراکنش‌ها</h2><p>جست‌وجو، فیلتر چندگانه و خروجی CSV برای Excel</p></div><span>'+fa(filtered.length)+' سند</span></div>'+filters+table(filtered)+'</section>';
    }else if(financeView==="tuition"){
      body='<section class="kj-card kj-finance-panel"><h2>شهریه خادمین</h2><p class="kj-muted">مبنای خادم قدیمی: شش‌ماهه اول '+esc(money(6*Number(membershipRules.old_first_half_monthly_toman)))+' و شش‌ماهه دوم '+esc(money(6*Number(membershipRules.old_second_half_monthly_toman)))+'. خادم جدید هنگام عضویت '+esc(money(membershipRules.new_member_fee_toman))+' پرداخت می‌کند. مبلغ ثبت جدید بر اساس تاریخ عضویت کنترل می‌شود؛ سوابق قدیمی دست‌نخورده می‌مانند.</p>'+errBox("tuition_dues")+genericPage("tuitionDues","سررسیدهای شهریه",state.tuitionDues.map(r=>({...r,period_type_label:({first_half:"شش‌ماهه اول",second_half:"شش‌ماهه دوم",annual:"سالیانه"})[r.period_type]||"سابقه قدیمی"})),[{key:"khadem_id",label:"شناسه خادم"},{key:"period_year",label:"سال"},{key:"period_type_label",label:"نوع دوره"},{key:"period_month",label:"تاریخ شروع دوره"},{key:"amount_toman",label:"مبلغ دوره (تومان)"},{key:"paid_toman",label:"پرداخت‌شده (تومان)"},{key:"status",label:"وضعیت"}])+'<h3 class="kj-section-title">دفتر پرداخت‌های شهریه</h3>'+errBox("tuition_payments")+genericPage("tuitionPayments","پرداخت‌های ثبت‌شده",state.tuitionPayments,[{key:"khadem_id",label:"شناسه خادم"},{key:"tuition_due_id",label:"شناسه دوره شهریه"},{key:"paid_date",label:"تاریخ پرداخت"},{key:"amount_toman",label:"مبلغ پرداخت (تومان)"},{key:"finance_transaction_id",label:"سند مالی مرتبط"},{key:"notes",label:"توضیحات"}])+'<h3 class="kj-section-title">اقساط ثبت‌شده</h3>'+errBox("finance_installments")+genericPage("financeInstallments","اقساط",state.financeInstallments,[{key:"khadem_id",label:"شناسه خادم"},{key:"installment_number",label:"شماره قسط"},{key:"amount",label:"مبلغ قسط"},{key:"paid_amount",label:"پرداخت‌شده"},{key:"due_date",label:"سررسید"},{key:"status",label:"وضعیت"}])+'</section>';
    }else{
      body='<section class="kj-card kj-finance-panel"><h2>گزارش و تحلیل مالی</h2><div class="kj-finance-report-grid"><div><span>تعداد اسناد</span><b>'+fa(rows.length)+'</b></div><div><span>دریافت قطعی‌شده</span><b>'+esc(toman(income))+'</b></div><div><span>پرداخت قطعی‌شده</span><b>'+esc(toman(expense))+'</b></div><div><span>خالص گردش</span><b>'+esc(toman(income-expense))+'</b></div><div><span>سررسیدهای شهریه</span><b>'+fa(state.tuitionDues.length)+'</b></div><div><span>اقساط</span><b>'+fa(state.financeInstallments.length)+'</b></div></div><h3>تحلیل دسته‌بندی‌ها</h3>'+chart+'<div class="kj-finance-notice">ترازنامه، تطبیق بانکی، سند دوطرفه و گردش حساب تفصیلی در مرحله بعد پس از تکمیل ساختار حساب‌ها و قواعد ممیزی فعال می‌شوند.</div><button type="button" class="kj-secondary" id="kj-finance-export">خروجی CSV تراکنش‌ها</button></section>';
    }
    return '<div class="kj-finance-workspace"><div class="kj-finance-page-heading"><div><span class="kj-muted">مدیریت مالی مجموعه</span><h1 class="kj-page-title">امور مالی و حسابداری</h1></div><span class="kj-finance-secure">🔒 کنترل دسترسی سامانه</span></div>'+nav+errBox("finance_transactions")+body+'</div>';
  }
  function openFinanceTransactionEditor(row){
    const currentDate=jalaliInputDate(String(row.transaction_date||row.created_at||"").slice(0,10));
    const currentAmount=Math.round(num(row.amount)/10);
    const kOptions='<option value="">بدون اتصال به خادم</option>'+state.khadems.map(k=>'<option value="'+esc(khademId(k))+'" '+(String(khademId(k))===String(row.khadem_id)?"selected":"")+'>'+esc(khademCode(k)+' — '+nameOf(k))+'</option>').join("");
    const aOptions='<option value="">بدون تعیین حساب</option>'+state.financeAccounts.map(a=>'<option value="'+esc(a.id)+'" '+(String(a.id)===String(row.account_id)?"selected":"")+'>'+esc((a.account_code||"")+" — "+(a.account_name||""))+'</option>').join("");
    const types=[["income","دریافت"],["expense","پرداخت"],["transfer","انتقال"]];
    const categories=["شهریه","کمک و نذورات","حق عضویت","البسه و تجهیزات","هزینه سفر و مأموریت","هزینه مراسم","پشتیبانی و اداری","سایر"];
    modal("ویرایش تراکنش مالی",'<form id="kj-finance-edit-form" data-id="'+esc(row.id)+'"><div class="kj-finance-form-grid"><label>عنوان *<input name="title" required maxlength="180" value="'+esc(row.title||"")+'"></label><label>تاریخ *<input name="transaction_date" data-jalali-date autocomplete="off" required value="'+esc(currentDate)+'"></label><label>مبلغ (تومان) *<input name="amount_toman" type="number" min="1" step="1" required value="'+esc(currentAmount)+'"></label><label>نوع تراکنش *<select name="transaction_type">'+types.map(([v,l])=>'<option value="'+v+'" '+(String(row.transaction_type||"income")===v?"selected":"")+'>'+l+'</option>').join("")+'</select></label><label>دسته‌بندی *<select name="category">'+categories.map(c=>'<option '+(String(row.category||"")===c?"selected":"")+'>'+c+'</option>').join("")+'</select></label><label>خادم<select name="khadem_id">'+kOptions+'</select></label><label>حساب / صندوق<select name="account_id">'+aOptions+'</select></label><label>طرف حساب<input name="party" maxlength="180" value="'+esc(row.party||"")+'"></label><label>روش پرداخت<select name="payment_method">'+[["cash","نقدی"],["card","کارت‌به‌کارت / کارت‌خوان"],["bank_transfer","انتقال بانکی"],["check","چک"],["other","سایر"]].map(([v,l])=>'<option value="'+v+'" '+(String(row.payment_method||"cash")===v?"selected":"")+'>'+l+'</option>').join("")+'</select></label><label>شماره پیگیری<input name="reference_no" maxlength="100" value="'+esc(row.reference_no||"")+'"></label><label>شماره رسید / سند<input name="tracking_number" maxlength="100" value="'+esc(row.tracking_number||"")+'"></label><label class="kj-finance-form-wide">شرح و توضیحات<textarea name="description" rows="3" maxlength="2000">'+esc(row.description||row.notes||"")+'</textarea></label></div><p class="kj-muted">وضعیت قطعی یا پیش‌نویس تغییر نمی‌کند. تغییرات با ثبت سابقه ممیزی ذخیره می‌شوند.</p><div class="kj-finance-form-actions"><button type="submit" class="kj-primary">ذخیره تغییرات</button><button type="button" class="kj-secondary" id="kj-finance-edit-cancel">انصراف</button></div><p class="kj-small" id="kj-finance-edit-status" role="status"></p></form>');
    $("#kj-finance-edit-cancel")?.addEventListener("click",()=>$("#kj-modal")?.remove());
    $("#kj-finance-edit-form")?.addEventListener("submit",async e=>{
      e.preventDefault();const form=e.currentTarget,fd=new FormData(form),button=form.querySelector('[type="submit"]'),status=$("#kj-finance-edit-status"),amount=Number(fd.get("amount_toman"));
      if(!Number.isFinite(amount)||amount<=0){if(status)status.textContent="مبلغ معتبر وارد کنید.";return;}
      try{
        if(button){button.disabled=true;button.textContent="در حال ذخیره…";}
        await request("/rest/v1/rpc/update_finance_transaction_audited",{method:"POST",body:{p_id:row.id,p_transaction_date:jalaliToGregorianText(String(fd.get("transaction_date")||"")),p_title:String(fd.get("title")||"").trim(),p_transaction_type:String(fd.get("transaction_type")||"income"),p_amount_toman:amount,p_category:String(fd.get("category")||""),p_khadem_id:String(fd.get("khadem_id")||"")||null,p_account_id:String(fd.get("account_id")||"")||null,p_party:String(fd.get("party")||"").trim()||null,p_payment_method:String(fd.get("payment_method")||"cash"),p_reference_no:String(fd.get("reference_no")||"").trim()||null,p_tracking_number:String(fd.get("tracking_number")||"").trim()||null,p_description:String(fd.get("description")||"").trim()||null}});
        $("#kj-modal")?.remove();toast("تراکنش ویرایش شد و سابقه تغییرات ثبت شد.","success");await refreshFinanceAfterSave("transactions");
      }catch(err){if(status)status.textContent="ویرایش انجام نشد: "+(err?.message||"خطای نامشخص");if(button){button.disabled=false;button.textContent="ذخیره تغییرات";}}
    });
  }
  async function saveFinancePricing(form){
    const fd=new FormData(form),status=$("#kj-finance-pricing-status"),button=form.querySelector('[type="submit"]');
    const itemPrices={};
    ["vest","white_cap","cream_cap","fringe","service_shirt"].forEach(k=>itemPrices[k]=Number(fd.get(k)));
    const rules={
      new_member_fee_toman:Number(fd.get("new_member_fee_toman")),
      new_monthly_committee_toman:Number(fd.get("new_monthly_committee_toman")),
      old_first_half_monthly_toman:Number(fd.get("old_first_half_monthly_toman")),
      old_second_half_monthly_toman:Number(fd.get("old_second_half_monthly_toman")),
      classification_start_date:jalaliToGregorianText(String(fd.get("classification_start_date")||"")),
      planning_year:Number(fd.get("planning_year"))
    };
    const oldAnnual=6*rules.old_first_half_monthly_toman+6*rules.old_second_half_monthly_toman;
    const annual=oldAnnual;
    if(!Number.isInteger(rules.planning_year)||rules.planning_year<1300||rules.planning_year>1500||!/^\d{4}-\d{2}-\d{2}$/.test(rules.classification_start_date)||!Number.isFinite(rules.new_member_fee_toman)||rules.new_member_fee_toman<=0||!Number.isFinite(rules.new_monthly_committee_toman)||rules.new_monthly_committee_toman<0||!Number.isFinite(rules.old_first_half_monthly_toman)||rules.old_first_half_monthly_toman<0||!Number.isFinite(rules.old_second_half_monthly_toman)||rules.old_second_half_monthly_toman<0||rules.new_member_fee_toman<11*rules.new_monthly_committee_toman||Object.values(itemPrices).some(v=>!Number.isFinite(v)||v<0)){
      if(status)status.textContent="سال مالی، تاریخ آغاز خادم جدید و تعرفه‌ها را بررسی کنید. مبلغ ورودی خادم جدید باید حداقل سهم هیئت برای ۱۱ ماه باشد.";return;
    }
    const user=(()=>{try{return JSON.parse(localStorage.getItem(USER_KEY)||"null");}catch(_){return null;}})();
    try{
      if(button){button.disabled=true;button.textContent="در حال ذخیره…";}
      await request("/rest/v1/finance_pricing?on_conflict=id",{method:"POST",headers:{"Prefer":"resolution=merge-duplicates,return=representation"},body:{id:1,annual_tuition_toman:annual,item_prices:itemPrices,membership_fee_rules:rules,updated_by:user?.id||null,updated_at:new Date().toISOString()}});
      toast("تعرفه‌ها و قواعد سهم هیئت و صندوق ذخیره شد؛ سوابق گذشته تغییر نکردند.","success");await refreshFinanceAfterSave("pricing");
    }catch(err){if(status)status.textContent="ذخیره تعرفه‌ها انجام نشد: "+(err?.message||"خطای نامشخص");toast("ذخیره تعرفه‌ها ناموفق بود؛ مجوز finance.manage را بررسی کنید.","error");}
    finally{if(button){button.disabled=false;button.textContent="ذخیره تعرفه‌ها و قواعد";}}
  }
  async function setFinanceStatus(id,status){
    if(!id||!["posted","void"].includes(status))return;
    const promptText=status==="posted"?"این پیش‌نویس پس از قطعی‌سازی در جمع دریافت‌ها و پرداخت‌های قطعی محاسبه می‌شود. ادامه می‌دهید؟":"پیش‌نویس باطل شود؟ این عمل سند را حذف نمی‌کند.";
    if(!window.confirm(promptText))return;
    try{
      await request("/rest/v1/finance_transactions?id=eq."+encodeURIComponent(id),{method:"PATCH",headers:{"Prefer":"return=representation"},body:{status}});
      toast(status==="posted"?"سند مالی قطعی شد.":"پیش‌نویس باطل شد.","success");
      await refreshFinanceAfterSave("transactions");
    }catch(err){toast("تغییر وضعیت انجام نشد؛ مجوز مالی و دسترسی پایگاه داده را بررسی کنید.","error");}
  }
  function financeFormStatus(formId,message){const el=$("#"+formId);if(el)el.textContent=message;}
  async function refreshFinanceAfterSave(view){
    await loadData();
    financeView=view;
    render();
  }
  function financeReceiptPath(path){return String(path||"").split("/").map(encodeURIComponent).join("/");}
  async function uploadFinanceReceipt(file){
    if(!file||!file.size)return null;
    const extension=String(file.name||"").split(".").pop().toLowerCase();
    const typeByExtension={"jpg":"image/jpeg","jpeg":"image/jpeg","png":"image/png","webp":"image/webp","gif":"image/gif","heic":"image/heic","heif":"image/heif","pdf":"application/pdf"};
    const allowed=["image/jpeg","image/png","image/webp","image/gif","image/heic","image/heif","application/pdf"];
    const mime=allowed.includes(file.type)?file.type:(typeByExtension[extension]||file.type||"");
    if(!allowed.includes(mime))throw new Error("فرمت فایل مجاز نیست؛ JPG، PNG، WEBP، GIF، HEIC/HEIF یا PDF انتخاب کنید.");
    if(file.size>8*1024*1024)throw new Error("حجم فایل سند نباید بیشتر از ۸ مگابایت باشد.");
    const ext=({"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif","image/heic":"heic","image/heif":"heif","application/pdf":"pdf"})[mime];
    const random=(window.crypto&&window.crypto.randomUUID)?window.crypto.randomUUID():Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);
    const path="finance/"+Date.now()+"-"+random+"."+ext;
    const response=await fetch(SUPABASE_URL+"/storage/v1/object/khadem-receipts/"+financeReceiptPath(path),{method:"POST",headers:headers({"Content-Type":mime,"x-upsert":"false"}),body:file,credentials:"omit",cache:"no-store"});
    const raw=await response.text();let data=null;try{data=raw?JSON.parse(raw):null;}catch(_){data=raw;}
    if(!response.ok)throw new Error(String(data&&(data.message||data.error||data.error_description)||raw||("HTTP "+response.status)));
    return path;
  }
  async function removeFinanceReceipt(path){
    if(!path)return;
    try{await fetch(SUPABASE_URL+"/storage/v1/object/khadem-receipts/"+financeReceiptPath(path),{method:"DELETE",headers:headers(),credentials:"omit",cache:"no-store"});}catch(_){}
  }
  async function openFinanceReceipt(path){
    if(!path)return;
    const win=window.open("about:blank","_blank");
    if(!win){toast("مرورگر اجازه باز کردن پنجره جدید را نداد؛ مجوز بازشدن پنجره‌ها را بررسی کنید.","error");return;}
    try{
      const data=await request("/storage/v1/object/sign/khadem-receipts/"+financeReceiptPath(path),{method:"POST",body:{expiresIn:300}});
      const signed=String(data?.signedURL||data?.signedUrl||"");
      if(!signed)throw new Error("لینک امن فایل دریافت نشد.");
      win.location.href=signed.startsWith("http")?signed:(signed.startsWith("/storage/v1/")?SUPABASE_URL+signed:SUPABASE_URL+"/storage/v1"+(signed.startsWith("/")?signed:"/"+signed));
    }catch(err){win.close();toast("نمایش سند ناموفق بود؛ دسترسی مالی یا فایل را بررسی کنید.","error");}
  }
  async function saveFinanceEntry(form){
    const fd=new FormData(form), type=form.dataset.entryType, amountToman=Number(fd.get("amount_toman"));
    const status=$("#kj-finance-form-status"), button=form.querySelector('[type="submit"]');
    const receiptFile=fd.get("receipt_file"); let uploadedPath=null;
    if(!Number.isFinite(amountToman)||amountToman<=0){if(status)status.textContent="مبلغ معتبر و بزرگ‌تر از صفر وارد کنید.";return;}
    const user=(()=>{try{return JSON.parse(localStorage.getItem(USER_KEY)||"null");}catch(_){return null;}})();
    const khadem=state.khadems.find(k=>String(khademId(k))===String(fd.get("khadem_id")));
    const payload={title:String(fd.get("title")||"").trim(),transaction_date:jalaliToGregorianText(String(fd.get("transaction_date")||"")),transaction_type:type,amount:Math.round(amountToman*10),category:String(fd.get("category")||""),khadem_id:fd.get("khadem_id")||null,khadem_code:khadem?khademCode(khadem):null,khadem_name:khadem?nameOf(khadem):null,account_id:fd.get("account_id")||null,party:String(fd.get("party")||"").trim()||null,payment_method:String(fd.get("payment_method")||"cash"),reference_no:String(fd.get("reference_no")||"").trim()||null,tracking_number:String(fd.get("tracking_number")||"").trim()||null,description:String(fd.get("description")||"").trim()||null,notes:String(fd.get("description")||"").trim()||null,status:"draft",created_by:user?.id||null,created_by_email:user?.email||null};
    if(!payload.title||!payload.transaction_date||!payload.category){if(status)status.textContent="عنوان، تاریخ و دسته‌بندی الزامی است.";return;}
    try{if(button){button.disabled=true;button.textContent="در حال ذخیره…";}if(status)status.textContent="در حال ثبت پیش‌نویس در پایگاه داده…";
      if(receiptFile instanceof File && receiptFile.size){if(status)status.textContent="در حال بارگذاری تصویر سند…";uploadedPath=await uploadFinanceReceipt(receiptFile);payload.receipt_image_path=uploadedPath;}
      await request("/rest/v1/finance_transactions",{method:"POST",headers:{"Prefer":"return=representation"},body:payload});
      toast(uploadedPath?"پیش‌نویس مالی همراه تصویر سند ثبت شد.":"پیش‌نویس مالی ثبت شد؛ هنوز سند قطعی نیست.","success");await refreshFinanceAfterSave("transactions");
    }catch(err){if(uploadedPath)await removeFinanceReceipt(uploadedPath);if(status)status.textContent="ثبت انجام نشد: "+(err?.message||"خطای نامشخص");toast("ثبت سند مالی ناموفق بود: "+(err?.message||"خطای نامشخص"),"error");}
    finally{if(button){button.disabled=false;button.textContent="ذخیره پیش‌نویس";}}
  }
  async function saveTuitionPayment(form){
    const fd=new FormData(form),amount=Number(fd.get("amount_toman")),status=$("#kj-tuition-payment-status"),button=form.querySelector('[type="submit"]');
    const receiptFile=fd.get("receipt_file"); let uploadedPath=null;
    if(!fd.get("khadem_id")||!fd.get("period_year")||!fd.get("period_type")||!Number.isFinite(amount)||amount<=0||!fd.get("paid_date")){if(status)status.textContent="خادم، دوره، سال، مبلغ و تاریخ پرداخت را کامل کنید.";return;}
    try{
      if(button){button.disabled=true;button.textContent="در حال ثبت…";}
      if(receiptFile instanceof File && receiptFile.size){if(status)status.textContent="در حال بارگذاری تصویر رسید…";uploadedPath=await uploadFinanceReceipt(receiptFile);}
      if(status)status.textContent="در حال ثبت امن پرداخت و به‌روزرسانی مانده بدهی…";
      const year=Number(fd.get("period_year")),periodType=String(fd.get("period_type"));const periodStart=jalaliToGregorianText(year+"/"+(periodType==="second_half"?"07":"01")+"/01");if(!/^\d{4}-\d{2}-\d{2}$/.test(periodStart))throw new Error("تبدیل تاریخ شروع دوره شهریه ناموفق بود.");await request("/rest/v1/rpc/register_tuition_period_payment",{method:"POST",body:{p_khadem_id:String(fd.get("khadem_id")),p_period_year:year,p_period_type:periodType,p_period_start:periodStart,p_amount_toman:amount,p_paid_date:jalaliToGregorianText(String(fd.get("paid_date")||"")),p_payment_method:String(fd.get("payment_method")||"cash"),p_reference_no:String(fd.get("reference_no")||"").trim()||null,p_notes:String(fd.get("notes")||"").trim()||null,p_receipt_image_path:uploadedPath}});
      toast(uploadedPath?"پرداخت شهریه همراه تصویر رسید ثبت شد.":"پرداخت شهریه و سند مالی با موفقیت ثبت شد.","success");
      await refreshFinanceAfterSave("new-tuition-payment");
    }catch(err){if(uploadedPath)await removeFinanceReceipt(uploadedPath);if(status)status.textContent="ثبت انجام نشد: "+(err?.message||"خطای نامشخص");toast("پرداخت شهریه ثبت نشد؛ مانده بدهی، مجوز مالی و اطلاعات را بررسی کنید.","error");}
    finally{if(button){button.disabled=false;button.textContent="ثبت پرداخت و صدور رسید مالی";}}
  }
  async function saveFinanceInstallment(form){
    const fd=new FormData(form),amount=Number(fd.get("amount")),number=Number(fd.get("installment_number"));
    const status=$("#kj-installment-form-status"),button=form.querySelector('[type="submit"]');
    if(!fd.get("transaction_id")||!Number.isInteger(number)||number<1||!Number.isFinite(amount)||amount<=0||!fd.get("due_date")){if(status)status.textContent="سند مرتبط، شماره قسط، مبلغ و سررسید را کامل کنید.";return;}
    try{if(button){button.disabled=true;button.textContent="در حال ثبت…";}if(status)status.textContent="در حال ثبت قسط…";
      await request("/rest/v1/finance_installments",{method:"POST",headers:{"Prefer":"return=representation"},body:{transaction_id:String(fd.get("transaction_id")),khadem_id:fd.get("khadem_id")||null,installment_number:number,amount:amount,paid_amount:0,due_date:jalaliToGregorianText(String(fd.get("due_date")||"")),status:"pending",notes:String(fd.get("notes")||"").trim()||null}});
      toast("قسط ثبت شد.","success");await refreshFinanceAfterSave("installments");
    }catch(err){if(status)status.textContent="ثبت انجام نشد: "+(err?.message||"خطای نامشخص");toast("ثبت قسط ناموفق بود؛ شماره قسط تکراری یا مجوز ناکافی را بررسی کنید.","error");}
    finally{if(button){button.disabled=false;button.textContent="ثبت قسط";}}
  }
  async function saveFinanceAccount(form){
    const fd=new FormData(form),status=$("#kj-account-form-status"),button=form.querySelector('[type="submit"]');
    const code=String(fd.get("account_code")||"").trim(),name=String(fd.get("account_name")||"").trim();
    if(!code||!name){if(status)status.textContent="کد و نام حساب الزامی است.";return;}
    try{if(button){button.disabled=true;button.textContent="در حال ذخیره…";}if(status)status.textContent="در حال ذخیره حساب…";
      await request("/rest/v1/finance_accounts",{method:"POST",headers:{"Prefer":"return=representation"},body:{account_code:code,account_name:name,account_type:String(fd.get("account_type")||"other"),is_active:String(fd.get("is_active"))!=="false",notes:String(fd.get("notes")||"").trim()||null}});
      toast("حساب مالی ثبت شد.","success");await refreshFinanceAfterSave("accounts");
    }catch(err){if(status)status.textContent="ثبت انجام نشد: "+(err?.message||"خطای نامشخص");toast("ثبت حساب ناموفق بود؛ کد تکراری یا مجوز مالی را بررسی کنید.","error");}
    finally{if(button){button.disabled=false;button.textContent="ذخیره حساب";}}
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
  function installGlobalExportToolbar(main) {
    if (!main || main.querySelector(".kj-global-export-toolbar")) return;
    const bar=document.createElement("div");
    bar.className="kj-global-export-toolbar";
    bar.innerHTML='<span>خروجی این بخش:</span><button type="button" data-kj-export="pdf">PDF / چاپ</button><button type="button" data-kj-export="word">Word</button><button type="button" data-kj-export="excel">Excel</button>';
    bar.addEventListener("click",event=>{
      const button=event.target.closest("[data-kj-export]"); if(!button)return;
      const type=button.dataset.kjExport, title=(main.querySelector("h1,h2")?.textContent||"گزارش سامانه").trim();
      // PDF popup must be opened during the original user click, before any async photo requests.
      const pdfWindow=type==="pdf"?window.open("about:blank","_blank"):null;
      if(state.tab==="khadems"&&state.selectedKhadem!==null){const record=selectedKhademRecord();if(record){showRecordExportChooser(record,title,type);return;}}
      const table=main.querySelector("table"); if(!table){toast("در این بخش جدول یا پرونده‌ای برای خروجی وجود ندارد.","error");return;}
      const cell=el=>String(el?.innerText||el?.textContent||"").trim();
      let cols=[...table.querySelectorAll("thead th")].map(cell).filter(x=>x&&x!=="جزئیات");
      let rows=[...table.querySelectorAll("tbody tr")].map(tr=>[...tr.querySelectorAll("td")].slice(0,cols.length).map(cell));
      let bankRecords=[],bankPhotoCol=-1;
      if(state.tab==="khadems" && state.selectedKhadem===null && state.khadems.length){
        const keys=[...new Set(state.khadems.flatMap(k=>Object.keys(k||{})))].filter(k=>!["id","created_at","updated_at","extra_data","full_name","name","khadem_name","first_name","last_name","family","family_name"].includes(k)&&!/password|token|secret|api.?key|service.?role|internal.?id/i.test(k));
        const records=state.khadems.slice().sort((a,b)=>khademCodeNumber(a)-khademCodeNumber(b));
        const priority=["triple_name","tri_name","full_name_triple","father_name","birth_date","national_code","national_id","occupation","job","membership_date","education_level","education","phone","mobile","phone_number","address","residence","home_address","blood_type"];
        const originalKeyOrder=new Map(keys.map((key,index)=>[key,index]));
        keys.sort((a,b)=>{const ai=priority.indexOf(a),bi=priority.indexOf(b);return (ai<0?1000+originalKeyOrder.get(a):ai)-(bi<0?1000+originalKeyOrder.get(b):bi);});
        const pairs=keys.map(key=>({key,label:fieldLabel(key)})).filter(p=>p.label&&!["شناسه داخلی","شناسه خادم","شناسه شخص","شناسه پرسنلی"].includes(p.label));
        const seen=new Set(); const usablePairs=pairs.filter(p=>!seen.has(p.label)&&seen.add(p.label));
        bankRecords=records;
        bankPhotoCol=0;
        cols=["عکس خادم","نام و نام خانوادگی",...usablePairs.map(p=>p.label)];
        rows=records.map(k=>[khademPhotoPath(k),nameOf(k),...usablePairs.map(p=>formatValue(p.key,k[p.key]))]);
      }
      const opts=cols.map((c,i)=>'<label style="display:inline-flex;gap:6px;padding:7px;border:1px solid #ddd;border-radius:8px;margin:3px"><input type="checkbox" data-export-col="'+i+'" checked> '+esc(c)+'</label>').join("");
      modal("انتخاب جزئیات خروجی",'<p class="kj-muted">فقط اطلاعات ثبت‌شده خروجی می‌شود؛ شناسه‌ها و کدهای فنی سامانه حذف می‌شوند. ستون‌های دلخواه را انتخاب کنید.</p><div style="display:flex;flex-wrap:wrap"> '+opts+'</div><button type="button" class="kj-primary" id="kj-export-confirm">تهیه خروجی</button>');
      $("#kj-export-confirm")?.addEventListener("click",async(event)=>{
        const confirmButton=event.currentTarget; confirmButton.disabled=true; confirmButton.textContent="در حال آماده‌سازی…"; toast("در حال آماده‌سازی خروجی؛ لطفاً صبر کنید.","info");
        const chosen=Array.from(document.querySelectorAll("#kj-modal [data-export-col]:checked")).map(x=>Number(x.dataset.exportCol));
        if(!chosen.length){toast("حداقل یک ستون را انتخاب کنید.","error");return;}
        const photoData=new Map();
        const photoIncluded=bankPhotoCol>=0&&chosen.includes(bankPhotoCol);
        if(photoIncluded){
          for(let ri=0;ri<bankRecords.length;ri++){
            const path=khademPhotoPath(bankRecords[ri]);if(!path)continue;
            try{
              let url=path;
              if(!/^https?:\/\//i.test(url)){const signed=await request("/storage/v1/object/sign/khadem-photos/"+financeReceiptPath(url),{method:"POST",body:{expiresIn:3600}});url=normalizeSignedStorageUrl(signed?.signedURL||signed?.signedUrl||"");}
              const response=await fetch(url,{cache:"no-store"});if(!response.ok)throw new Error("HTTP "+response.status);
              const blob=await response.blob();const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||""));reader.onerror=()=>reject(new Error("خواندن عکس ناموفق بود"));reader.readAsDataURL(blob);});
              if(data.startsWith("data:image/"))photoData.set(ri,data);
            }catch(err){console.warn("KJ: bank export photo unavailable",khademCode(bankRecords[ri]),err);}
          }
        }
        const head=chosen.map(i=>"<th>"+esc(cols[i])+"</th>").join("");
        const body=rows.map((row,ri)=>"<tr>"+chosen.map(i=>{if(photoIncluded&&i===bankPhotoCol){const src=photoData.get(ri)||"";return "<td>"+(src?'<img src="'+src+'" alt="عکس خادم" style="max-width:64px;max-height:64px;object-fit:contain">':"")+"</td>";}return "<td>"+esc(row[i]??"")+"</td>";}).join("")+"</tr>").join("");
        const html="<!doctype html><html lang=\"fa\" dir=\"rtl\"><meta charset=\"utf-8\"><title>"+esc(title)+"</title><style>body{font-family:Tahoma;direction:rtl;padding:18px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #aaa;padding:6px;text-align:right}th{background:#eee}</style><h1>"+esc(title)+"</h1><p>تعداد رکوردها: "+fa(rows.length)+"</p><table><thead><tr>"+head+"</tr></thead><tbody>"+body+"</tbody></table></html>";
        if(type==="pdf"){const w=window.open("","_blank");if(!w){toast("پنجره خروجی مسدود است؛ اجازه بازشو را فعال کنید.","error");return;}w.document.open();w.document.write(html);w.document.close();w.onload=()=>w.print();}
        else if(type==="excel"&&state.tab==="khadems"&&state.selectedKhadem===null){
          try{
            let ExcelJS=window.ExcelJS;
            if(!ExcelJS){await new Promise((resolve,reject)=>{const script=document.createElement("script");script.src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js";script.onload=()=>window.ExcelJS?resolve():reject(new Error("کتابخانه اکسل بارگذاری نشد."));script.onerror=()=>reject(new Error("بارگذاری کتابخانه اکسل ناموفق بود."));document.head.appendChild(script);});ExcelJS=window.ExcelJS;}
            const workbook=new ExcelJS.Workbook();workbook.creator="سامانه جامع مدیریت خادمین";const sheet=workbook.addWorksheet("بانک خادمین",{views:[{rightToLeft:true}]});
            sheet.addRow(chosen.map(i=>cols[i]));rows.forEach(row=>sheet.addRow(chosen.map(i=>i===bankPhotoCol?"":String(row[i]??""))));sheet.getRow(1).height=30;
            chosen.forEach((idx,ci)=>{sheet.getColumn(ci+1).width=idx===bankPhotoCol?16:Math.max(16,Math.min(32,String(cols[idx]).length+6));sheet.getCell(1,ci+1).font={bold:true};sheet.getCell(1,ci+1).alignment={horizontal:"center",vertical:"middle",wrapText:true};});
            for(let ri=0;ri<rows.length;ri++){sheet.getRow(ri+2).height=photoIncluded?64:24;chosen.forEach((idx,ci)=>{const cell=sheet.getCell(ri+2,ci+1);cell.alignment={horizontal:"center",vertical:"middle",wrapText:true};cell.border={top:{style:"thin"},left:{style:"thin"},bottom:{style:"thin"},right:{style:"thin"}};});const ci=chosen.indexOf(bankPhotoCol),data=photoData.get(ri);if(ci>=0&&data){const base64=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{try{const canvas=document.createElement("canvas");canvas.width=img.naturalWidth||img.width;canvas.height=img.naturalHeight||img.height;const ctx=canvas.getContext("2d");if(!ctx)throw new Error("آماده‌سازی عکس ناموفق بود.");ctx.drawImage(img,0,0);resolve(canvas.toDataURL("image/png").split(",")[1]);}catch(err){reject(err);}};img.onerror=()=>reject(new Error("تبدیل عکس ناموفق بود."));img.src=data;});const id=workbook.addImage({base64,extension:"png"});sheet.addImage(id,{tl:{col:ci,row:ri+1},ext:{width:58,height:58},editAs:"oneCell"});}}
            const buffer=await workbook.xlsx.writeBuffer();const blob=new Blob([buffer],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=title.replace(/[<>]/g,"-")+".xlsx";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);
          }catch(err){toast("ساخت فایل اکسل دارای عکس ناموفق بود: "+(err?.message||"خطای نامشخص"),"error");return;}
        }
        else {const blob=new Blob(["\uFEFF",html],{type:type==="excel"?"application/vnd.ms-excel;charset=utf-8":"application/msword;charset=utf-8"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=(title.replace(/[<>]/g,"-"))+(type==="excel"?".xls":".doc");document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
        $("#kj-modal")?.remove();
      });
    });
    main.prepend(bar);
  }
  function offlineNotice() {
    const pending = Number(state.offlinePendingCount || 0);
    const review = Number(state.offlineReviewCount || 0);
    if (!state.offlineMode && !pending && !review) return "";
    return '<div role="status" aria-live="polite" style="margin:0 0 14px;padding:12px 14px;border:1px solid #d7a84b;border-right:4px solid #c18b2c;border-radius:12px;background:#fff8e7;color:#654b16;line-height:1.9;font-size:13px"><strong>' +
      (state.offlineMode ? 'حالت آفلاین' : 'همگام‌سازی اطلاعات') +
      '</strong> — اطلاعات ذخیره‌شده روی این دستگاه قابل مشاهده است.' +
      (pending ? ' تعداد تغییرات در صف ارسال: <strong>' + fa(pending) + '</strong>.' : '') +
      (review ? ' عملیات نیازمند بررسی: <strong>' + fa(review) + '</strong>.' : '') +
      ' تغییرات پشتیبانی‌شده پس از اتصال اینترنت ارسال می‌شوند. عملیات حساس مانند پرداخت شهریه، تغییر رمز، مدیریت دسترسی و بارگذاری عکس جدید همچنان به اینترنت نیاز دارند.</div>';
  }

  function updateCheckPage() {
    return `<div class="kj-page-heading"><div><h1 class="kj-page-title">بررسی به‌روزرسانی سامانه</h1><p class="kj-muted">نسخه منتشرشده را بررسی کنید و در صورت آماده بودن نسخه جدید، آن را اعمال کنید.</p></div></div>
      <section class="kj-card" style="max-width:760px">
        <h2 class="kj-section-title">مدیریت نسخه برنامه</h2>
        <p>بررسی، دریافت و اعمال نسخه جدید از طریق سرویس‌ورکر انجام می‌شود. هنگام اعمال نسخه، صفحه یک‌بار بارگذاری مجدد خواهد شد.</p>
        <div class="kj-toolbar"><button type="button" class="kj-primary" id="kj-update-check-page">بررسی به‌روزرسانی</button></div>
        <div id="kj-update-status-page" class="kj-notice" role="status" aria-live="polite" hidden></div>
      </section>`;
  }

  function bindUpdateCheckPage(root) {
    const button = root.querySelector("#kj-update-check-page");
    const status = root.querySelector("#kj-update-status-page");
    if (!button || !status) return;
    if (!("serviceWorker" in navigator)) {
      button.disabled = true;
      status.hidden = false;
      status.textContent = "مرورگر فعلی از بررسی خودکار به‌روزرسانی پشتیبانی نمی‌کند.";
      return;
    }
    let registration = null;
    let updateReady = false;
    let applying = false;
    const controllerAtStart = navigator.serviceWorker.controller;
    const showStatus = message => { status.textContent = message; status.hidden = false; };
    const markReady = () => {
      updateReady = true;
      button.disabled = false;
      button.textContent = "اعمال نسخه جدید";
      showStatus("نسخه جدید آماده است. ابتدا تغییرات ثبت‌نشده را ذخیره کنید، سپس «اعمال نسخه جدید» را بزنید.");
    };
    const watchRegistration = reg => {
      registration = reg;
      if (registration.waiting) markReady();
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        showStatus("نسخه جدید پیدا شد؛ فایل‌ها در حال دریافت هستند…");
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && (navigator.serviceWorker.controller || controllerAtStart)) markReady();
          else if (worker.state === "redundant" && !updateReady) showStatus("دریافت نسخه جدید کامل نشد؛ دوباره بررسی کنید.");
        });
      });
    };
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (applying) {
        showStatus("نسخه جدید فعال شد؛ در حال بارگذاری مجدد…");
        window.location.reload();
      } else if (controllerAtStart && !updateReady) markReady();
    });
    button.addEventListener("click", async () => {
      if (updateReady) {
        applying = true;
        button.disabled = true;
        showStatus("در حال اعمال نسخه جدید…");
        try {
          const worker = registration && (registration.waiting || registration.installing);
          if (worker && worker.state !== "activated") {
            worker.postMessage({ type: "SKIP_WAITING" });
            await new Promise(resolve => {
              let done = false;
              const finish = () => { if (!done) { done = true; resolve(); } };
              navigator.serviceWorker.addEventListener("controllerchange", finish, { once: true });
              window.setTimeout(finish, 5000);
            });
          }
          window.location.reload();
        } catch (_) {
          applying = false;
          button.disabled = false;
          showStatus("اعمال نسخه جدید ناموفق بود؛ دوباره تلاش کنید.");
        }
        return;
      }
      button.disabled = true;
      showStatus("در حال بررسی نسخه منتشرشده…");
      try {
        if (!registration) {
          registration = await navigator.serviceWorker.getRegistration();
          if (!registration) registration = await navigator.serviceWorker.register("./service-worker.js");
          watchRegistration(registration);
        }
        await registration.update();
        if (registration.waiting || updateReady) markReady();
        else if (registration.installing) {
          const worker = registration.installing;
          await new Promise(resolve => {
            let done = false;
            const finish = () => { if (!done) { done = true; resolve(); } };
            worker.addEventListener("statechange", () => {
              if (["installed","activated","redundant"].includes(worker.state)) finish();
            });
            window.setTimeout(finish, 15000);
          });
          if (registration.waiting || updateReady) markReady();
          else showStatus("نسخه جدیدی شناسایی نشد. اگر تغییرات تازه منتشر شده‌اند، چند ثانیه بعد دوباره بررسی کنید.");
        } else showStatus("سامانه به‌روز است؛ اگر نسخه‌ای همین حالا منتشر شده، چند ثانیه بعد دوباره بررسی کنید.");
      } catch (_) {
        showStatus("بررسی به‌روزرسانی ناموفق بود؛ اتصال اینترنت را بررسی و دوباره تلاش کنید.");
      } finally {
        if (!updateReady) button.disabled = false;
      }
    });
    navigator.serviceWorker.getRegistration().then(reg => { if (reg) watchRegistration(reg); }).catch(() => {});
  }

  function render() {
    if (!token()) { const message = sessionExpiredMessage; sessionExpiredMessage = ""; loginPage(message); return; }
    if (!canAccess(state.tab)) {
      state.tab = "dashboard";
      state.selectedKhadem = null;
    }
    shell();
    const main = $("#kj-main");
    if (!main) return;
    main.classList.toggle("kj-dashboard-view", state.tab === "dashboard");
    if (state.selectedKhadem !== null && state.tab === "khadems") {
      main.innerHTML = offlineNotice() + khademProfile();
      applyCrudVisibility(main);
      installGlobalExportToolbar(main);
      $("#kj-back")?.addEventListener("click", () => { state.selectedKhadem = null; state.profileEditOpen = false; render(); });
      $("#kj-edit-profile")?.addEventListener("click", () => { state.profileEditOpen = !state.profileEditOpen; render(); });
      $("#kj-profile-edit-form")?.addEventListener("submit", e => { e.preventDefault(); saveKhademProfile(e.currentTarget); });
      bindPhotoPreview("#kj-profile-photo-input","#kj-profile-photo-preview");
      const profilePhoto=$("#kj-profile-photo"); if(profilePhoto)loadKhademPhotoInto(profilePhoto,profilePhoto.dataset.photoPath);
      $("#kj-cancel-profile-edit")?.addEventListener("click", () => { state.profileEditOpen = false; render(); });
      return;
    }
    const views = {
      dashboard,
      chat: () => '<iframe title="ارتباطات خادمین" src="./chat.html?embedded=1&v=20261017-chat7" allow="microphone; autoplay" style="width:100%;height:calc(100dvh - 260px);min-height:640px;border:0;border-radius:18px;display:block;background:#fbfaf6"></iframe>',
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
      updateCheck: updateCheckPage,
      changePassword: changePasswordPage,
    };
    main.innerHTML = offlineNotice() + (views[state.tab] || dashboard)();
    applyCrudVisibility(main);
    installGlobalExportToolbar(main);
    if (state.tab === "updateCheck") bindUpdateCheckPage(main);
    if (state.tab === "dashboard") bindDashboardExpanders(main);
    if (state.tab === "finance") {
      $$("[data-finance-view]", main).forEach(button => button.addEventListener("click", () => { financeView=button.dataset.financeView; render(); }));
      $("#kj-finance-filter-form")?.addEventListener("submit", event => { event.preventDefault(); financeSearch=$("#kj-finance-search")?.value||""; financeTypeFilter=$("#kj-finance-type")?.value||"all"; financeCategoryFilter=$("#kj-finance-category")?.value||"all"; financeStatusFilter=$("#kj-finance-status")?.value||"all"; render(); });
      $("#kj-finance-clear")?.addEventListener("click", () => { financeSearch=""; financeTypeFilter="all"; financeCategoryFilter="all"; financeStatusFilter="all"; render(); });
      $$("[data-finance-detail]", main).forEach(button => button.addEventListener("click", () => { const index=Number(button.dataset.financeDetail); const row=Number.isInteger(index)?state.finance[index]:null; if(row){modal("جزئیات تراکنش مالی",dataFields(row)+'<div class="kj-finance-form-actions"><button type="button" class="kj-primary" id="kj-finance-detail-edit">ویرایش تراکنش</button></div>');$("#kj-finance-detail-edit")?.addEventListener("click",()=>{$("#kj-modal")?.remove();openFinanceTransactionEditor(row);});addRecordExportActions(row,"جزئیات تراکنش مالی");} else {toast("اطلاعات این تراکنش در فهرست فعلی پیدا نشد؛ فهرست را تازه‌سازی کنید.","error");} }));
      $$("[data-finance-edit]", main).forEach(button=>button.addEventListener("click",()=>{const row=state.finance.find(r=>String(r.id)===String(button.dataset.financeEdit));if(row)openFinanceTransactionEditor(row);}));
      $("#kj-finance-pricing-form")?.addEventListener("submit",e=>{e.preventDefault();saveFinancePricing(e.currentTarget);});
      $$("[data-finance-receipt]", main).forEach(button=>button.addEventListener("click",()=>openFinanceReceipt(button.dataset.financeReceipt)));
      $$("[data-finance-post]", main).forEach(button=>button.addEventListener("click",()=>setFinanceStatus(button.dataset.financePost,"posted")));
      $$("[data-finance-void]", main).forEach(button=>button.addEventListener("click",()=>setFinanceStatus(button.dataset.financeVoid,"void")));
      $("#kj-finance-entry-form")?.addEventListener("submit",e=>{e.preventDefault();saveFinanceEntry(e.currentTarget);});
      $("#kj-tuition-payment-form")?.addEventListener("submit",e=>{e.preventDefault();saveTuitionPayment(e.currentTarget);});
      const tuitionForm=$("#kj-tuition-payment-form");
      const updateTuitionAmount=()=>{
        if(!tuitionForm)return;
        const selectedId=tuitionForm.querySelector('[name="khadem_id"]')?.value;
        const khadem=state.khadems.find(k=>String(khademId(k))===String(selectedId));
        const config=state.financePricing[0]||{};
        const rules=Object.assign({new_member_fee_toman:2400000,new_monthly_committee_toman:200000,old_first_half_monthly_toman:100000,old_second_half_monthly_toman:200000,classification_start_date:"2026-03-21"},config.membership_fee_rules||{});
        const date=String(khadem?.membership_date||"").slice(0,10);
        const period=tuitionForm.querySelector('[name="period_type"]');
        const amount=tuitionForm.querySelector('[name="amount_toman"]');
        if(!period||!amount)return;
        const first=period.querySelector('option[value="first_half"]'),second=period.querySelector('option[value="second_half"]');
        if(!date){amount.value="";const msg=$("#kj-tuition-payment-status");if(msg)msg.textContent="برای تعیین نوع خادم، ابتدا تاریخ عضویت را در بانک خادمین ثبت کنید.";return;}
        const isNew=date>=String(rules.classification_start_date);
        if(isNew){if(first)first.disabled=true;if(second)second.disabled=true;period.value="annual";}
        else {if(first)first.disabled=false;if(second)second.disabled=false;}
        const annualOld=6*Number(rules.old_first_half_monthly_toman)+6*Number(rules.old_second_half_monthly_toman);
        amount.value=isNew?Number(rules.new_member_fee_toman):period.value==="annual"?annualOld:period.value==="first_half"?6*Number(rules.old_first_half_monthly_toman):6*Number(rules.old_second_half_monthly_toman);
        const msg=$("#kj-tuition-payment-status");if(msg)msg.textContent="";
      };
      tuitionForm?.querySelector('[name="period_type"]')?.addEventListener("change",updateTuitionAmount);
      tuitionForm?.querySelector('[name="khadem_id"]')?.addEventListener("change",updateTuitionAmount);
      updateTuitionAmount();
      $("#kj-installment-entry-form")?.addEventListener("submit",e=>{e.preventDefault();saveFinanceInstallment(e.currentTarget);});
      $("#kj-finance-account-form")?.addEventListener("submit",e=>{e.preventDefault();saveFinanceAccount(e.currentTarget);});
      $("#kj-finance-export")?.addEventListener("click", () => {
        const records=state.finance.filter(row => { const q=financeSearch.trim().toLocaleLowerCase("fa"); const hay=[row.title,row.category,row.transaction_type,row.khadem_code,row.khadem_name,row.reference_no,row.tracking_number,row.description].join(" ").toLocaleLowerCase("fa"); return (!q||hay.includes(q))&&(financeTypeFilter==="all"||String(row.transaction_type).toLowerCase()===financeTypeFilter)&&(financeCategoryFilter==="all"||String(row.category||"بدون دسته‌بندی")===financeCategoryFilter)&&(financeStatusFilter==="all"||String(row.status).toLowerCase()===financeStatusFilter); });
        const columns=[["transaction_date","تاریخ"],["transaction_type","نوع"],["title","عنوان"],["category","دسته‌بندی"],["khadem_code","کد خادم"],["khadem_name","نام خادم"],["amount","مبلغ ریال"],["status","وضعیت"],["reference_no","شماره پیگیری"],["description","شرح"]];
        const csv="\uFEFF"+[columns.map(c=>c[1]).join(","),...records.map(row=>columns.map(c=>'"'+String(row[c[0]]??"").replace(/"/g,'""')+'"').join(","))].join("\r\n");
        const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}); const url=URL.createObjectURL(blob); const link=document.createElement("a"); link.href=url; link.download="finance-transactions.csv"; link.click(); URL.revokeObjectURL(url);
      });
    }
    if(state.tab==="serviceRegister") bindOfficialServiceForm();
    if (state.tab === "changePassword") $("#kj-change-password-form")?.addEventListener("submit", e => { e.preventDefault(); savePasswordChange(e.currentTarget); });
    $$("[data-quick-tab]", main).forEach(button => button.addEventListener("click", () => {
      const requestedTab = button.dataset.quickTab;
      if (!canAccess(requestedTab)) { toast("دسترسی این بخش برای حساب شما فعال نیست. از مدیر اصلی بخواهید مجوز آن را در بخش «کاربران و دسترسی‌ها» تنظیم کند.", "error"); return; }
      state.tab = requestedTab; state.selectedKhadem = null;
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
        script.src = "./equipment-finance.js?v=20261017-02";
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
        installGlobalExportToolbar(main);
        bindKhademRegistrationControls();
        const input = $("#kj-khadem-search");
        input?.focus(); input?.setSelectionRange(pos,pos);
        bindKhademButtons();
      });
      $("#kj-khadem-search")?.addEventListener("input", e => {
        const pos = e.target.selectionStart;
        state.search = e.target.value;
        const main = $("#kj-main");
        main.innerHTML = khademList();
        installGlobalExportToolbar(main);
        bindKhademRegistrationControls();
        const input = $("#kj-khadem-search");
        input?.focus(); input?.setSelectionRange(pos,pos);
        bindKhademButtons();
      });

      bindKhademButtons();
      $("#kj-birthday-month")?.addEventListener("change", e => { state.birthdayMonth = Number(e.target.value); const main=$("#kj-main"); if(main){main.innerHTML=khademList(); installGlobalExportToolbar(main); bindKhademRegistrationControls(); bindKhademButtons(); $("#kj-birthday-month")?.addEventListener("change", ev=>{state.birthdayMonth=Number(ev.target.value);render();});} });
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
    const rows = state.khadems.filter(k => (!q || [nameOf(k),khademCode(k),val(k,["phone","mobile"]),val(k,["national_id","national_code"])].join(" ").toLowerCase().includes(q))).sort((a,b)=>Number(String(khademCode(a)).replace(/[^0-9]/g,""))-Number(String(khademCode(b)).replace(/[^0-9]/g,"")));
    const photoToggle=$("#kj-show-khadem-photos");
    if(photoToggle && !photoToggle.dataset.bound){
      photoToggle.dataset.bound="1";
      photoToggle.addEventListener("change", e => {
        state.showKhademPhotos = !!e.target.checked;
        const root=$("#kj-main");
        root.innerHTML=khademList();
        installGlobalExportToolbar(root);
        bindKhademRegistrationControls();
        bindKhademButtons();
        $("#kj-khadem-search")?.addEventListener("input", ev => {
          const pos=ev.target.selectionStart;state.search=ev.target.value;
          const container=$("#kj-main");container.innerHTML=khademList();installGlobalExportToolbar(container);bindKhademRegistrationControls();
          const input=$("#kj-khadem-search");input?.focus();input?.setSelectionRange(pos,pos);bindKhademButtons();
        });
        $("#kj-birthday-month")?.addEventListener("change",ev=>{state.birthdayMonth=Number(ev.target.value);render();});
      });
    }
    if(state.tab==="khadems" && state.showKhademPhotos){
      $$("img[data-khadem-photo-path]",main).forEach(img=>{
        const path=img.dataset.khademPhotoPath;
        const placeholder=img.parentElement?.querySelector("[data-khadem-photo-empty]");
        if(!path){if(placeholder)placeholder.textContent="بدون عکس";return;}
        img.onerror=()=>{img.style.display="none";if(placeholder){placeholder.textContent="خطا در نمایش عکس";placeholder.style.display="inline";}};
        loadKhademPhotoInto(img,path).then(()=>{
          if(placeholder)placeholder.style.display=img.style.display==="block"?"none":"inline";
          if(img.style.display!=="block"&&placeholder)placeholder.textContent=img.dataset.photoError||"خطا در نمایش عکس";
        });
      });
    }
    if(!main.dataset.khademRowClickBound){
      main.dataset.khademRowClickBound="1";
      main.addEventListener("click",event=>{
        const button=event.target.closest("[data-row]");
        if(!button||!main.contains(button)||state.tab!=="khadems")return;
        if(button.closest(".kj-birthday-list")&&button.dataset.recordKey){
          const key=button.dataset.recordKey;
          const record=key.startsWith("id:")?state.khadems.find(x=>String(khademId(x))===key.slice(3)):khademByCode(key.slice(5));
          if(record){state.selectedKhadem="code:"+String(khademCode(record));render();}
          return;
        }
        const search=state.search.trim().toLowerCase();
        const currentRows=state.khadems.filter(k=>(!search||[nameOf(k),khademCode(k),val(k,["phone","mobile"]),val(k,["national_id","national_code"])].join(" ").toLowerCase().includes(search))).sort((a,b)=>Number(String(khademCode(a)).replace(/[^0-9]/g,""))-Number(String(khademCode(b)).replace(/[^0-9]/g,"")));
        const k=currentRows[Number(button.dataset.row)];
        if(!k)return;
        state.selectedKhadem="code:"+String(khademCode(k));
        render();
      });
    }
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
      // پس از تأیید هویت، نقش و وضعیت تأیید حساب مستقل‌اند؛ آن‌ها را هم‌زمان بررسی کن
      // تا دو رفت‌وبرگشت شبکه‌ای متوالی زمان ورود را بی‌جهت طولانی نکند.
      const [access, profileRows] = await Promise.all([
        request("/functions/v1/manage-user-permissions", { method: "POST", body: { action: "my_permissions" } }),
        request("/rest/v1/profiles?select=is_active,role&id=eq." + encodeURIComponent(authUser.id) + "&limit=1")
      ]);
      if (!access || !access.role) throw new Error("بررسی نقش و دسترسی حساب ناموفق بود.");
      state.role = access.role;
      state.accessPermissions = access.permissions && typeof access.permissions === "object" ? access.permissions : null;
      state.accessCustom = !!state.accessPermissions;
      // وضعیت دسترسی کامل را از پاسخ رسمی سرور بخوان؛ پروفایل سفارشی همچنان محدودکننده است.
      state.accessFull = access.full_access === true && !state.accessCustom;
      // حساب ثبت‌نامی تا تأیید مدیر اصلی اجازه دریافت هیچ داده‌ای از سامانه را ندارد.
      const approvedProfile = Array.isArray(profileRows) ? profileRows[0] : null;
      if (!approvedProfile || approvedProfile.is_active !== true) {
        loginPage("درخواست حساب شما ثبت شده اما هنوز توسط مدیر اصلی تأیید نشده است. پس از تأیید، با همین ایمیل و رمز دوباره وارد شوید.");
        return;
      }
      // مجوزها در فراخوانی my_permissions بالا دریافت شده‌اند؛ از تعریف دوباره const access جلوگیری شود.
      // مدیر اصلی فقط با ایمیل تعیین‌شده در کنترل‌های سمت سرور شناسایی می‌شود.
      state.isPrimaryAdmin = String(authUser.email || "").trim().toLowerCase() === "da.adelian@gmail.com";
      state.accessLoaded = true;
      state.offlineMode = false;
      startPresenceMonitoring(authUser);
      if (window.KJOfflineStore) {
        try {
          await window.KJOfflineStore.saveMeta("auth-state", {
            user: authUser, role: state.role, accessPermissions: state.accessPermissions,
            isPrimaryAdmin: state.isPrimaryAdmin, accessCustom: state.accessCustom,
            accessFull: state.accessFull, verifiedAt: Date.now()
          });
          await window.KJOfflineStore.persistStorage();
        } catch (cacheError) { console.warn("KJ: auth state cache failed", cacheError); }
      }
      if (!canAccess(state.tab)) {
        state.tab = "dashboard";
        state.selectedKhadem = null;
        history.replaceState(null, "", window.location.pathname + window.location.search + "#dashboard");
      }
      // معرفی هر نسخهٔ جدید فقط یک بار برای همین مرورگر و حسابِ واردشده نمایش داده می‌شود.
      await showReleaseIntroIfNeeded();
      // رابط سامانه را فوراً نمایش بده؛ دریافت جدول‌های متعدد در پس‌زمینه ادامه پیدا می‌کند.
      // loadData ابتدا وضعیت بارگذاری را رندر می‌کند و پس از پایان، اطلاعات را جایگزین می‌کند.
      void (async function () { await syncOfflineOutbox(); await loadData(); })();
    } catch (e) {
      console.error("KJ: startup/auth verification failed", e);
      if (e && (e.status === 401 || e.status === 403)) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        loginPage("نشست ورود معتبر نیست یا منقضی شده است؛ لطفاً دوباره وارد شوید.");
        return;
      }
      // فقط هنگام خطای شبکه، و فقط تا ۱۲ ساعت از آخرین تأیید آنلاین، نشست محلی قابل استفاده است.
      // خطای 401/403 هرگز با مجوز ذخیره‌شده دور زده نمی‌شود.
      if ((!e || !e.status) && token() && window.KJOfflineStore) {
        try {
          const cachedAuth = await window.KJOfflineStore.getMeta("auth-state");
          const age = cachedAuth && Number(cachedAuth.verifiedAt) ? Date.now() - Number(cachedAuth.verifiedAt) : Infinity;
          const cachedUserId = cachedAuth && cachedAuth.user && (cachedAuth.user.id || cachedAuth.user.email);
          const currentUserId = (() => { try { const u=JSON.parse(localStorage.getItem(USER_KEY)||"null"); return u&&(u.id||u.email); } catch (_) { return null; } })();
          if (cachedAuth && cachedUserId && String(cachedUserId).toLowerCase() === String(currentUserId||"").toLowerCase() && age >= 0 && age <= 12*60*60*1000) {
            state.role = cachedAuth.role || "user";
            state.accessPermissions = cachedAuth.accessPermissions && typeof cachedAuth.accessPermissions === "object" ? cachedAuth.accessPermissions : null;
            state.isPrimaryAdmin = cachedAuth.isPrimaryAdmin === true;
            state.accessCustom = cachedAuth.accessCustom === true;
            state.accessFull = cachedAuth.accessFull === true && !state.accessCustom;
            state.accessLoaded = true;
            state.offlineMode = true;
            state.offlineAuthVerifiedAt = cachedAuth.verifiedAt;
            try { const outbox = await window.KJOfflineStore.listOutbox(); state.offlinePendingCount = outbox.filter(row => row.status === "pending").length; state.offlineReviewCount = outbox.length - state.offlinePendingCount; } catch (_) {}
            if (!canAccess(state.tab)) state.tab = "dashboard";
            toast("اینترنت در دسترس نیست؛ اطلاعات ذخیره‌شده قبلی در حالت آفلاین باز می‌شود.", "info");
            await showReleaseIntroIfNeeded();
            void loadData();
            return;
          }
        } catch (cacheError) { console.warn("KJ: offline session restore failed", cacheError); }
      }
      loginPage("بررسی نشست انجام نشد: " + (e && e.message ? e.message : "خطای ناشناخته") + " اگر فرم ورود نمایش داده می‌شود، ایمیل و رمز حساب معتبر را وارد کنید.");
    }
  }

  // کنترل‌های بانک خادمین با رویداد سراسری مدیریت می‌شوند تا پس از بازسازی DOM هم فعال بمانند.
  // این شنونده پیش از شروع احراز هویت ثبت می‌شود و به اتصال موفق بانک وابسته نیست.
  document.addEventListener("click", function (event) {
    const registrationButton = event.target && event.target.closest ? event.target.closest("#kj-open-registration") : null;
    const importButton = event.target && event.target.closest ? event.target.closest("#kj-open-import") : null;
    if (!registrationButton && !importButton) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    if (state.tab !== "khadems") {
      state.tab = "khadems";
      state.selectedKhadem = null;
    }
    if (registrationButton) {
      state.registrationOpen = !state.registrationOpen;
      render();
      if (state.registrationOpen) {
        const form = document.querySelector("#kj-registration-form");
        if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }
    try {
      openKhademImport();
    } catch (error) {
      console.error("KJ: opening khadem import failed", error);
      toast("باز کردن ورودی فایل ناموفق بود: " + (error && error.message ? error.message : "خطای نامشخص"), "error");
    }
  }, true);

  window.addEventListener("offline", function () {
    if (!token()) return;
    state.offlineMode = true;
    try { render(); } catch (err) { console.warn("KJ: offline banner render failed", err); }
  });
  window.addEventListener("online", function () {
    if (!token()) return;
    void (async function () {
      await syncOfflineOutbox();
      await loadData();
    })();
  });

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
