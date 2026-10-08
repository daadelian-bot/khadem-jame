(function () {
  "use strict";

  const SUPABASE_URL = "https://fxxtyfurdzpfzvweoppo.supabase.co";
  const SUPABASE_KEY = "sb_publishable_HA3Z2cmNMddMTmpFoLmerA_k-YtEId7";

  let accessToken = localStorage.getItem("kj_access_token") || "";
  let currentUser = JSON.parse(localStorage.getItem("kj_user") || "null");

  const state = {
    tab: "dashboard",
    khadems: [],
    services: [],
    meetings: [],
    deployments: [],
    finance: [],
    fund: [],
    donors: []
  };

  const menu = [
    ["dashboard", "🏠 داشبورد"],
    ["khadems", "👤 بانک خدام"],
    ["services", "🕌 خدمات"],
    ["friday", "🌙 شب‌های جمعه"],
    ["meetings", "📅 جلسات"],
    ["deployments", "🚍 مأموریت‌ها"],
    ["finance", "💰 مالی"],
    ["fund", "🏦 صندوق"],
    ["donors", "🤝 خیرین"],
    ["reports", "📊 گزارش‌ها"],
    ["settings", "⚙️ تنظیمات"]
  ];

  function fa(n) {
    return String(n ?? 0).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
  }

  function toast(message, type = "info") {
    let el = document.getElementById("kj-toast");

    if (!el) {
      el = document.createElement("div");
      el.id = "kj-toast";
      el.style.cssText = `
        position:fixed;
        bottom:20px;
        left:20px;
        right:20px;
        max-width:520px;
        margin:auto;
        padding:14px 18px;
        border-radius:12px;
        color:#fff;
        background:#333;
        z-index:99999;
        text-align:center;
        box-shadow:0 8px 30px rgba(0,0,0,.25);
        font-family:inherit;
      `;
      document.body.appendChild(el);
    }

    el.style.background =
      type === "error" ? "#b42318" :
      type === "success" ? "#18794e" : "#333";

    el.textContent = message;

    clearTimeout(window.__kjToastTimer);
    window.__kjToastTimer = setTimeout(() => {
      el.remove();
    }, 5000);
  }

  async function api(path, options = {}) {
    const headers = {
      apikey: SUPABASE_KEY,
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    if (accessToken) {
      headers.Authorization = "Bearer " + accessToken;
    }

    const response = await fetch(SUPABASE_URL + path, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const text = await response.text();

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      let message =
        data?.msg ||
        data?.message ||
        data?.error_description ||
        data?.error ||
        text ||
        ("HTTP " + response.status);

      throw new Error(message);
    }

    return data;
  }

  function loginPage(message = "") {
    document.getElementById("app").innerHTML = `
      <div style="
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
        background:#f6f3ef;
      ">
        <div style="
          width:100%;
          max-width:430px;
          background:#fff;
          border-radius:20px;
          padding:28px;
          box-shadow:0 10px 40px rgba(0,0,0,.12);
          text-align:center;
        ">
          <img src="logo.png"
               style="width:95px;height:95px;object-fit:contain;margin-bottom:10px"
               onerror="this.style.display='none'">

          <h2 style="margin:8px 0 5px">سامانه جامع مدیریت خدام</h2>

          <p style="color:#777;margin-bottom:24px">
            ورود به سامانه
          </p>

          <input id="kj-email"
            type="email"
            placeholder="ایمیل"
            autocomplete="email"
            style="
              width:100%;
              box-sizing:border-box;
              padding:14px;
              margin-bottom:12px;
              border:1px solid #ddd;
              border-radius:10px;
              font-size:16px;
              direction:ltr;
            ">

          <input id="kj-password"
            type="password"
            placeholder="رمز عبور"
            autocomplete="current-password"
            style="
              width:100%;
              box-sizing:border-box;
              padding:14px;
              margin-bottom:14px;
              border:1px solid #ddd;
              border-radius:10px;
              font-size:16px;
              direction:ltr;
            ">

          <button id="kj-login-btn"
            style="
              width:100%;
              padding:14px;
              border:0;
              border-radius:10px;
              background:#7b1e1e;
              color:#fff;
              font-size:16px;
              cursor:pointer;
            ">
            ورود
          </button>

          ${
            message
              ? `<div style="
                    margin-top:15px;
                    padding:12px;
                    border-radius:10px;
                    background:#fff1f0;
                    color:#b42318;
                    line-height:1.8;
                  ">${escapeHtml(message)}</div>`
              : ""
          }

          <button id="kj-demo-btn"
            style="
              margin-top:12px;
              background:none;
              border:0;
              color:#777;
              cursor:pointer;
            ">
            ورود آزمایشی
          </button>
        </div>
      </div>
    `;

    document.getElementById("kj-login-btn").onclick = login;

    document.getElementById("kj-password").addEventListener("keydown", e => {
      if (e.key === "Enter") login();
    });

    document.getElementById("kj-email").addEventListener("keydown", e => {
      if (e.key === "Enter") login();
    });

    document.getElementById("kj-demo-btn").onclick = demo;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function login() {
    const email = document.getElementById("kj-email")?.value.trim();
    const password = document.getElementById("kj-password")?.value;

    if (!email || !password) {
      toast("ایمیل و رمز عبور را وارد کنید.", "error");
      return;
    }

    const button = document.getElementById("kj-login-btn");

    if (button) {
      button.disabled = true;
      button.textContent = "در حال ورود...";
    }

    try {
      const result = await api(
        "/auth/v1/token?grant_type=password",
        {
          method: "POST",
          body: {
            email,
            password
          }
        }
      );

      if (!result.access_token) {
        throw new Error("توکن ورود از Supabase دریافت نشد.");
      }

      accessToken = result.access_token;
      currentUser = result.user || null;

      localStorage.setItem("kj_access_token", accessToken);
      localStorage.setItem("kj_user", JSON.stringify(currentUser));

      toast("ورود موفق بود.", "success");

      await loadData();
      render();
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      let msg = error?.message || "خطای نامشخص";

      if (
        msg.toLowerCase().includes("failed to fetch") ||
        msg.toLowerCase().includes("network")
      ) {
        msg =
          "اتصال مرورگر به Supabase برقرار نشد. اگر این پیام ادامه داشت، مرحله بعدی بررسی مستقیم اتصال شبکه است.";
      }

      loginPage("ورود ناموفق بود: " + msg);
    }
  }

  async function loadData() {
    state.khadems = await getTable("khadems");
    state.services = await getTable("service_records");
    state.meetings = await getTable("meetings");
    state.deployments = await getTable("deployments");
    state.finance = await getTable("finance_transactions");
    state.fund = await getTable("fund_transactions");
    state.donors = await getTable("donors");
  }

  async function getTable(table) {
    try {
      return await api(
        "/rest/v1/" + encodeURIComponent(table) + "?select=*"
      );
    } catch (error) {
      console.warn("TABLE ERROR:", table, error);
      return [];
    }
  }

  function shell() {
    document.getElementById("app").innerHTML = `
      <header class="top">
        <div class="brand">
          <img src="logo.png" alt="لوگو">
          <div>
            <h1>سامانه جامع مدیریت خدام</h1>
            <small>مدیریت یکپارچه خادمین، خدمت، جلسات و امور مجموعه</small>
          </div>
        </div>

        <div style="display:flex;gap:8px;align-items:center">
          <span class="pill ok">آنلاین</span>
          <button class="btn" onclick="KJ.signout()">خروج</button>
        </div>
      </header>

      <div class="layout">
        <aside>
          <div class="nav" id="nav"></div>
        </aside>

        <main id="main"></main>
      </div>
    `;

    const nav = document.getElementById("nav");

    menu.forEach(([id, title]) => {
      const btn = document.createElement("button");

      btn.textContent = title;
      btn.className = state.tab === id ? "active" : "";

      btn.onclick = () => {
        state.tab = id;
        render();
      };

      nav.appendChild(btn);
    });
  }

  function dashboard() {
    return `
      <section class="section">
        <h2>🏠 داشبورد</h2>

        <div class="cards">
          <div class="card">
            کل خادمین
            <div class="num">${fa(state.khadems.length)}</div>
          </div>

          <div class="card">
            خدمت‌ها
            <div class="num">${fa(state.services.length)}</div>
          </div>

          <div class="card">
            جلسات
            <div class="num">${fa(state.meetings.length)}</div>
          </div>

          <div class="card">
            مأموریت‌ها
            <div class="num">${fa(state.deployments.length)}</div>
          </div>
        </div>

        <div class="card" style="margin-top:16px">
          <h3>سامانه متصل است</h3>
          <p class="muted">
            اتصال مستقیم به Supabase برقرار شده است.
          </p>
        </div>
      </section>
    `;
  }

  function khadems() {
    return `
      <section class="section">
        <h2>👤 بانک خدام</h2>

        <input
          id="kj-search"
          type="text"
          placeholder="جستجوی نام خادم..."
          oninput="KJ.filterKhadems(this.value)"
          style="
            width:100%;
            box-sizing:border-box;
            padding:12px;
            margin:10px 0 16px;
            border:1px solid #ddd;
            border-radius:10px;
          "
        >

        <div class="card">
          <div style="overflow:auto">
            <table>
              <thead>
                <tr>
                  <th>ردیف</th>
                  <th>نام و نام خانوادگی</th>
                  <th>اطلاعات</th>
                </tr>
              </thead>

              <tbody id="khadem-list">
                ${khademRows(state.khadems)}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;
  }

  function khademRows(rows) {
    if (!rows.length) {
      return `
        <tr>
          <td colspan="3" style="text-align:center">
            خادمی ثبت نشده است
          </td>
        </tr>
      `;
    }

    return rows.map((x, i) => {
      const name =
        x.name ||
        x.full_name ||
        x.fullname ||
        x.first_name ||
        "بدون نام";

      return `
        <tr>
          <td>${fa(i + 1)}</td>
          <td>${escapeHtml(name)}</td>
          <td>${escapeHtml(
            x.phone || x.mobile || x.description || ""
          )}</td>
        </tr>
      `;
    }).join("");
  }

  function simplePage(title, text, count) {
    return `
      <section class="section">
        <h2>${title}</h2>

        <div class="card">
          <h3>${text}</h3>
          <div class="num">${fa(count)}</div>
        </div>
      </section>
    `;
  }

  function render() {
    if (!accessToken) {
      loginPage();
      return;
    }

    shell();

    const main = document.getElementById("main");

    switch (state.tab) {
      case "dashboard":
        main.innerHTML = dashboard();
        break;

      case "khadems":
        main.innerHTML = khadems();
        break;

      case "services":
        main.innerHTML =
          simplePage("🕌 خدمات", "تعداد سوابق خدمات", state.services.length);
        break;

      case "friday":
        main.innerHTML =
          simplePage("🌙 شب‌های جمعه", "بخش شب‌های جمعه", 0);
        break;

      case "meetings":
        main.innerHTML =
          simplePage("📅 جلسات", "تعداد جلسات", state.meetings.length);
        break;

      case "deployments":
        main.innerHTML =
          simplePage("🚍 مأموریت‌ها", "تعداد مأموریت‌ها", state.deployments.length);
        break;

      case "finance":
        main.innerHTML =
          simplePage("💰 مالی", "تعداد تراکنش‌های مالی", state.finance.length);
        break;

      case "fund":
        main.innerHTML =
          simplePage("🏦 صندوق", "تعداد تراکنش‌های صندوق", state.fund.length);
        break;

      case "donors":
        main.innerHTML =
          simplePage("🤝 خیرین", "تعداد خیرین", state.donors.length);
        break;

      case "reports":
        main.innerHTML =
          simplePage("📊 گزارش‌ها", "گزارش‌های سامانه", 0);
        break;

      case "settings":
        main.innerHTML = `
          <section class="section">
            <h2>⚙️ تنظیمات</h2>
            <div class="card">
              <p>تنظیمات سامانه</p>
              <p class="muted">
                کاربر واردشده:
                ${escapeHtml(currentUser?.email || "")}
              </p>
            </div>
          </section>
        `;
        break;
    }
  }

  function filterKhadems(value) {
    const q = String(value || "").trim().toLowerCase();

    const rows = state.khadems.filter(x => {
      const text = JSON.stringify(x).toLowerCase();
      return text.includes(q);
    });

    const body = document.getElementById("khadem-list");

    if (body) {
      body.innerHTML = khademRows(rows);
    }
  }

  async function signout() {
    try {
      if (accessToken) {
        await api("/auth/v1/logout", {
          method: "POST"
        });
      }
    } catch (e) {
      console.warn(e);
    }

    accessToken = "";
    currentUser = null;

    localStorage.removeItem("kj_access_token");
    localStorage.removeItem("kj_user");

    loginPage();
  }

  function demo() {
    accessToken = "demo";
    currentUser = {
      email: "demo@example.com"
    };

    state.khadems = [];
    state.services = [];
    state.meetings = [];
    state.deployments = [];
    state.finance = [];
    state.fund = [];
    state.donors = [];

    render();
  }

  async function restore() {
    if (!accessToken || accessToken === "demo") {
      render();
      return;
    }

    try {
      const user = await api("/auth/v1/user");

      currentUser = user;
      localStorage.setItem("kj_user", JSON.stringify(user));

      await loadData();
      render();

    } catch (error) {
      console.warn("SESSION ERROR:", error);

      accessToken = "";
      currentUser = null;

      localStorage.removeItem("kj_access_token");
      localStorage.removeItem("kj_user");

      loginPage();
    }
  }

  window.KJ = {
    login,
    signout,
    demo,
    filterKhadems,
    showLogin: loginPage
  };

  restore();

})();
