(function () {
  "use strict";

  /* =========================================================
     سامانه جامع مدیریت خدام
     Frontend: GitHub Pages
     Backend: Supabase REST API
     ========================================================= */

  /* =========================================================
     SUPABASE CONFIG
     ========================================================= */

  const SUPABASE_URL =
    "https://fxxtyfurdzpzfvweoppo.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_HA3Z2cmNMddMTmpFoLmerA_k-YtEId7";


  /* =========================================================
     CONSTANTS
     ========================================================= */

  const STORAGE_TOKEN = "kj_access_token";
  const STORAGE_USER = "kj_user";

  const REQUEST_TIMEOUT = 20000;


  /* =========================================================
     SESSION
     ========================================================= */

  let accessToken =
    localStorage.getItem(STORAGE_TOKEN) || "";

  let currentUser = null;

  try {
    currentUser = JSON.parse(
      localStorage.getItem(STORAGE_USER) || "null"
    );
  } catch {
    currentUser = null;
  }


  /* =========================================================
     APPLICATION STATE
     ========================================================= */

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


  /* =========================================================
     MENU
     ========================================================= */

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


  /* =========================================================
     PERSIAN NUMBER
     ========================================================= */

  function fa(value) {
    return String(value ?? 0).replace(
      /\d/g,
      d => "۰۱۲۳۴۵۶۷۸۹"[d]
    );
  }


  /* =========================================================
     HTML ESCAPE
     ========================================================= */

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  /* =========================================================
     TOAST
     ========================================================= */

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
        line-height:1.8;
      `;

      document.body.appendChild(el);
    }

    el.style.background =
      type === "error"
        ? "#b42318"
        : type === "success"
        ? "#18794e"
        : "#333";

    el.textContent = message;

    clearTimeout(window.__kjToastTimer);

    window.__kjToastTimer = setTimeout(() => {
      if (el && el.parentNode) {
        el.remove();
      }
    }, 5000);
  }


  /* =========================================================
     REQUEST WITH TIMEOUT
     ========================================================= */

  async function fetchWithTimeout(
    url,
    options = {},
    timeout = REQUEST_TIMEOUT
  ) {
    const controller = new AbortController();

    const timer = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
        credentials: "omit",
        cache: "no-store"
      });
    } finally {
      clearTimeout(timer);
    }
  }


  /* =========================================================
     SUPABASE API
     ========================================================= */

  async function api(path, options = {}) {

    const headers = {
      apikey: SUPABASE_KEY,
      Accept: "application/json",
      ...(options.headers || {})
    };

    /*
      فقط زمانی Content-Type ارسال می‌کنیم
      که واقعاً Body داشته باشیم.
    */

    if (options.body !== undefined && options.body !== null) {
      headers["Content-Type"] = "application/json";
    }

    /*
      بعد از Login، JWT کاربر را نیز ارسال می‌کنیم.
    */

    if (
      accessToken &&
      accessToken !== "demo"
    ) {
      headers.Authorization =
        "Bearer " + accessToken;
    }

    const requestOptions = {
      method: options.method || "GET",
      headers
    };

    if (
      options.body !== undefined &&
      options.body !== null
    ) {
      requestOptions.body =
        typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body);
    }

    let response;

    try {

      response = await fetchWithTimeout(
        SUPABASE_URL + path,
        requestOptions
      );

    } catch (error) {

      console.error(
        "SUPABASE NETWORK ERROR:",
        error
      );

      if (error?.name === "AbortError") {
        throw new Error(
          "زمان اتصال به Supabase به پایان رسید."
        );
      }

      throw new Error(
        "ارتباط مرورگر با Supabase برقرار نشد. اتصال اینترنت، آدرس Supabase یا تنظیمات شبکه را بررسی کنید."
      );
    }


    const text = await response.text();

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }


    /*
      خطاهای HTTP
    */

    if (!response.ok) {

      let message =
        data?.msg ||
        data?.message ||
        data?.error_description ||
        data?.error ||
        text ||
        `HTTP ${response.status}`;

      /*
        خطاهای رایج Login
      */

      if (
        response.status === 400 &&
        path.includes("/auth/v1/token")
      ) {
        message =
          data?.error_description ||
          data?.msg ||
          data?.message ||
          "ایمیل یا رمز عبور صحیح نیست.";
      }

      if (response.status === 401) {
        message =
          data?.message ||
          data?.error_description ||
          "نشست کاربر معتبر نیست یا منقضی شده است.";
      }

      if (response.status === 403) {
        message =
          data?.message ||
          "دسترسی به این بخش مجاز نیست.";
      }

      throw new Error(
        String(message)
      );
    }


    return data;
  }


  /* =========================================================
     LOGIN PAGE
     ========================================================= */

  function loginPage(message = "") {

    const app = document.getElementById("app");

    if (!app) {
      console.error(
        "Element #app not found."
      );
      return;
    }


    app.innerHTML = `
      <div style="
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
        background:#f6f3ef;
        box-sizing:border-box;
      ">

        <div style="
          width:100%;
          max-width:430px;
          background:#fff;
          border-radius:20px;
          padding:28px;
          box-shadow:0 10px 40px rgba(0,0,0,.12);
          text-align:center;
          box-sizing:border-box;
        ">

          <img
            src="logo.png"
            alt="لوگوی مجموعه"
            style="
              width:95px;
              height:95px;
              object-fit:contain;
              margin-bottom:10px;
            "
            onerror="this.style.display='none'"
          >

          <h2 style="
            margin:8px 0 5px;
          ">
            سامانه جامع مدیریت خدام
          </h2>

          <p style="
            color:#777;
            margin-bottom:24px;
          ">
            ورود به سامانه
          </p>


          <input
            id="kj-email"
            type="email"
            placeholder="ایمیل"
            autocomplete="email"
            inputmode="email"
            style="
              width:100%;
              box-sizing:border-box;
              padding:14px;
              margin-bottom:12px;
              border:1px solid #ddd;
              border-radius:10px;
              font-size:16px;
              direction:ltr;
              text-align:left;
              outline:none;
            "
          >


          <input
            id="kj-password"
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
              text-align:left;
              outline:none;
            "
          >


          <button
            id="kj-login-btn"
            style="
              width:100%;
              padding:14px;
              border:0;
              border-radius:10px;
              background:#7b1e1e;
              color:#fff;
              font-size:16px;
              cursor:pointer;
            "
          >
            ورود
          </button>


          ${
            message
              ? `
                <div style="
                  margin-top:15px;
                  padding:12px;
                  border-radius:10px;
                  background:#fff1f0;
                  color:#b42318;
                  line-height:1.8;
                  text-align:right;
                  direction:rtl;
                ">
                  ${escapeHtml(message)}
                </div>
              `
              : ""
          }


          <button
            id="kj-demo-btn"
            style="
              margin-top:12px;
              background:none;
              border:0;
              color:#777;
              cursor:pointer;
            "
          >
            ورود آزمایشی
          </button>

        </div>
      </div>
    `;


    const loginButton =
      document.getElementById(
        "kj-login-btn"
      );

    const passwordInput =
      document.getElementById(
        "kj-password"
      );

    const emailInput =
      document.getElementById(
        "kj-email"
      );

    const demoButton =
      document.getElementById(
        "kj-demo-btn"
      );


    if (loginButton) {
      loginButton.onclick = login;
    }


    if (passwordInput) {
      passwordInput.addEventListener(
        "keydown",
        event => {
          if (event.key === "Enter") {
            login();
          }
        }
      );
    }


    if (emailInput) {
      emailInput.addEventListener(
        "keydown",
        event => {
          if (event.key === "Enter") {
            login();
          }
        }
      );
    }


    if (demoButton) {
      demoButton.onclick = demo;
    }
  }


  /* =========================================================
     LOGIN
     ========================================================= */

  async function login() {

    const emailElement =
      document.getElementById(
        "kj-email"
      );

    const passwordElement =
      document.getElementById(
        "kj-password"
      );

    const button =
      document.getElementById(
        "kj-login-btn"
      );


    const email =
      emailElement?.value
        ?.trim() || "";

    const password =
      passwordElement?.value || "";


    if (!email || !password) {

      toast(
        "ایمیل و رمز عبور را وارد کنید.",
        "error"
      );

      return;
    }


    if (button) {
      button.disabled = true;
      button.textContent =
        "در حال ورود...";
      button.style.opacity = "0.7";
    }


    try {

      console.log(
        "KJ LOGIN: connecting to Supabase..."
      );


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


      if (!result) {
        throw new Error(
          "پاسخی از Supabase دریافت نشد."
        );
      }


      if (!result.access_token) {
        throw new Error(
          "توکن ورود از Supabase دریافت نشد."
        );
      }


      /*
        ذخیره Session
      */

      accessToken =
        result.access_token;

      currentUser =
        result.user || null;


      localStorage.setItem(
        STORAGE_TOKEN,
        accessToken
      );

      localStorage.setItem(
        STORAGE_USER,
        JSON.stringify(
          currentUser
        )
      );


      toast(
        "ورود موفق بود.",
        "success"
      );


      /*
        دریافت اطلاعات سامانه
      */

      await loadData();


      /*
        نمایش سامانه
      */

      render();


    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );


      const message =
        error?.message ||
        "خطای نامشخص هنگام ورود";


      /*
        Session قبلی را پاک نمی‌کنیم
        مگر اینکه خود Login موفق نشده باشد.
      */

      loginPage(
        "ورود ناموفق بود: " +
        message
      );

    } finally {

      /*
        اگر صفحه Login هنوز وجود دارد،
        دکمه را دوباره فعال می‌کنیم.
      */

      const currentButton =
        document.getElementById(
          "kj-login-btn"
        );

      if (currentButton) {
        currentButton.disabled = false;
        currentButton.textContent =
          "ورود";
        currentButton.style.opacity =
          "1";
      }
    }
  }


  /* =========================================================
     LOAD ALL DATA
     ========================================================= */

  async function loadData() {

    /*
      هر جدول مستقل بارگذاری می‌شود.
      خرابی یک جدول باعث از کار افتادن
      کل Dashboard نمی‌شود.
    */

    state.khadems =
      await getTable("khadems");

    state.services =
      await getTable("service_records");

    state.meetings =
      await getTable("meetings");

    state.deployments =
      await getTable("deployments");

    state.finance =
      await getTable(
        "finance_transactions"
      );

    state.fund =
      await getTable(
        "fund_transactions"
      );

    state.donors =
      await getTable("donors");
  }


  /* =========================================================
     GET TABLE
     ========================================================= */

  async function getTable(table) {

    try {

      return await api(
        "/rest/v1/" +
          encodeURIComponent(table) +
          "?select=*"
      );

    } catch (error) {

      console.warn(
        "TABLE ERROR:",
        table,
        error
      );

      return [];
    }
  }


  /* =========================================================
     APPLICATION SHELL
     ========================================================= */

  function shell() {

    const app =
      document.getElementById(
        "app"
      );

    if (!app) {
      return;
    }


    app.innerHTML = `

      <header class="top">

        <div class="brand">

          <img
            src="logo.png"
            alt="لوگو"
          >

          <div>

            <h1>
              سامانه جامع مدیریت خدام
            </h1>

            <small>
              مدیریت یکپارچه خادمین، خدمت، جلسات و امور مجموعه
            </small>

          </div>

        </div>


        <div style="
          display:flex;
          gap:8px;
          align-items:center;
        ">

          <span class="pill ok">
            آنلاین
          </span>

          <button
            class="btn"
            onclick="KJ.signout()"
          >
            خروج
          </button>

        </div>

      </header>


      <div class="layout">

        <aside>

          <div
            class="nav"
            id="nav"
          ></div>

        </aside>


        <main
          id="main"
        ></main>

      </div>
    `;


    const nav =
      document.getElementById(
        "nav"
      );


    if (!nav) {
      return;
    }


    menu.forEach(
      ([id, title]) => {

        const button =
          document.createElement(
            "button"
          );


        button.textContent =
          title;


        button.className =
          state.tab === id
            ? "active"
            : "";


        button.onclick = () => {

          state.tab = id;

          render();
        };


        nav.appendChild(
          button
        );
      }
    );
  }


  /* =========================================================
     DASHBOARD
     ========================================================= */

  function dashboard() {

    return `

      <section class="section">

        <h2>
          🏠 داشبورد
        </h2>


        <div class="cards">

          <div class="card">

            کل خادمین

            <div class="num">
              ${fa(
                state.khadems.length
              )}
            </div>

          </div>


          <div class="card">

            خدمت‌ها

            <div class="num">
              ${fa(
                state.services.length
              )}
            </div>

          </div>


          <div class="card">

            جلسات

            <div class="num">
              ${fa(
                state.meetings.length
              )}
            </div>

          </div>


          <div class="card">

            مأموریت‌ها

            <div class="num">
              ${fa(
                state.deployments.length
              )}
            </div>

          </div>

        </div>


        <div
          class="card"
          style="margin-top:16px"
        >

          <h3>
            سامانه متصل است
          </h3>

          <p class="muted">
            اتصال مستقیم به Supabase برقرار شده است.
          </p>

        </div>

      </section>
    `;
  }


  /* =========================================================
     KHADEMS
     ========================================================= */

  function khadems() {

    return `

      <section class="section">

        <h2>
          👤 بانک خدام
        </h2>


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

          <div
            style="overflow:auto"
          >

            <table>

              <thead>

                <tr>

                  <th>
                    ردیف
                  </th>

                  <th>
                    نام و نام خانوادگی
                  </th>

                  <th>
                    اطلاعات
                  </th>

                </tr>

              </thead>


              <tbody
                id="khadem-list"
              >
                ${khademRows(
                  state.khadems
                )}
              </tbody>

            </table>

          </div>

        </div>

      </section>
    `;
  }


  /* =========================================================
     KHADEM ROWS
     ===========================
