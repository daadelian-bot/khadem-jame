(function () {
  'use strict';

  const SUPABASE_URL = 'https://fxxtyfurdzpfzvweoppo.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_HA3Z2cmNMddMTmpFoLmerA_k-YtEId7';

  let sb = null;

  const state = {
    tab: 'dashboard',
    demo: false,
    khadems: [],
    services: [],
    meetings: [],
    deployments: [],
    finance: [],
    fund: [],
    donors: []
  };

  const menu = [
    ['dashboard', '🏠', 'داشبورد'],
    ['khadems', '👤', 'بانک خدام'],
    ['services', '🕌', 'خدمت اصلی'],
    ['friday', '🌙', 'شب‌های جمعه'],
    ['meetings', '📋', 'جلسات'],
    ['deployments', '🚐', 'ماموریت‌ها'],
    ['finance', '💳', 'امور مالی'],
    ['fund', '🏦', 'صندوق'],
    ['donors', '🤝', 'خیرین و حامیان'],
    ['reports', '📊', 'گزارش‌ها'],
    ['settings', '⚙️', 'تنظیمات']
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function faDate(value) {
    if (!value) return '-';

    try {
      return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date(value));
    } catch (e) {
      return value;
    }
  }

  function showToast(message) {
    let toast = document.getElementById('toast');

    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  function baseShell() {
    return `
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
          <button class="btn secondary" onclick="window.KJ.signout()">خروج</button>
        </div>
      </header>

      <div class="layout">
        <aside>
          <div class="nav" id="nav">
            ${menu.map(item => `
              <button
                class="nav-item ${state.tab === item[0] ? 'active' : ''}"
                onclick="window.KJ.go('${item[0]}')">
                <span>${item[1]}</span>
                <span>${item[2]}</span>
              </button>
            `).join('')}
          </div>
        </aside>

        <main id="main"></main>
      </div>
    `;
  }

  function showLogin() {
    document.body.innerHTML = `
      <div class="login-wrap">
        <div class="login-card">
          <img src="logo.png" alt="لوگو" class="login-logo">

          <h1>سامانه جامع مدیریت خدام</h1>
          <p class="muted">ورود به سامانه مدیریت خدام</p>

          <label>ایمیل</label>
          <input id="email" type="email" placeholder="ایمیل">

          <label>رمز عبور</label>
          <input id="password" type="password" placeholder="رمز عبور">

          <button class="btn" onclick="window.KJ.login()">
            ورود به سامانه
          </button>

          <button
            class="btn secondary"
            style="margin-top:8px"
            onclick="window.KJ.demo()">
            ورود آزمایشی
          </button>

          <div id="loginMsg" class="muted" style="margin-top:12px"></div>
        </div>
      </div>
    `;
  }

  function loadSDK() {
    return new Promise((resolve, reject) => {
      if (window.supabase) {
        resolve();
        return;
      }

      const script = document.createElement('script');

      script.src =
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

      script.onload = resolve;
      script.onerror = reject;

      document.head.appendChild(script);
    });
  }

  async function connect() {
    try {
      await loadSDK();

      sb = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async function login() {
    const email = $('email')?.value?.trim();
    const password = $('password')?.value;

    const msg = $('loginMsg');

    if (!email || !password) {
      if (msg) msg.textContent = 'ایمیل و رمز عبور را وارد کنید.';
      return;
    }

    if (msg) msg.textContent = 'در حال ورود...';

    const connected = await connect();

    if (!connected) {
      if (msg) msg.textContent = 'اتصال به سرویس آنلاین برقرار نشد.';
      return;
    }

    const { error } = await sb.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error(error);

      if (msg) {
        msg.textContent =
          'ورود ناموفق بود: ' + error.message;
      }

      return;
    }

    await loadData();
    renderPage();
  }

  async function signout() {
    try {
      if (sb) {
        await sb.auth.signOut();
      }
    } catch (error) {
      console.error(error);
    }

    state.demo = false;
    state.khadems = [];
    state.services = [];
    state.meetings = [];
    state.deployments = [];
    state.finance = [];
    state.fund = [];
    state.donors = [];

    showLogin();
  }

  function demo() {
    state.demo = true;

    state.khadems = [
      {
        code: '1001',
        name: 'داراب عادلیان',
        full_name: 'داراب بن ...',
        phone: '---',
        responsibility: 'مدیریت',
        membership: 'اصلی',
        status: 'فعال'
      },
      {
        code: '1002',
        name: 'ابراهیم باقری',
        full_name: 'ابراهیم بن ...',
        phone: '---',
        responsibility: 'خادم',
        membership: 'اصلی',
        status: 'فعال'
      }
    ];

    state.services = [];
    state.meetings = [];
    state.deployments = [];
    state.finance = [];
    state.fund = [];
    state.donors = [];

    renderPage();
  }

  async function get(table) {
    if (!sb) return [];

    const { data, error } = await sb
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase:', table, error);
      return [];
    }

    return data || [];
  }

  async function loadData() {
    if (state.demo || !sb) return;

    state.khadems = await get('khadems');
    state.services = await get('service_records');
    state.meetings = await get('meetings');
    state.deployments = await get('deployments');
    state.finance = await get('finance_transactions');
    state.fund = await get('fund_transactions');
    state.donors = await get('donors');
  }

  function renderPage() {
    document.body.innerHTML = baseShell();

    const main = $('main');

    if (!main) return;

    switch (state.tab) {
      case 'dashboard':
        dashboard(main);
        break;

      case 'khadems':
        khadems(main);
        break;

      case 'services':
        services(main);
        break;

      case 'friday':
        friday(main);
        break;

      case 'meetings':
        meetings(main);
        break;

      case 'deployments':
        deployments(main);
        break;

      case 'finance':
        finance(main);
        break;

      case 'fund':
        fund(main);
        break;

      case 'donors':
        donors(main);
        break;

      case 'reports':
        reports(main);
        break;

      case 'settings':
        settings(main);
        break;

      default:
        dashboard(main);
    }
  }

  function dashboard(main) {
    main.innerHTML = `
      <section class="section">

        <h2>🏠 داشبورد</h2>

        <div class="cards">

          <div class="card">
            کل خادمین
            <div class="num">${state.khadems.length}</div>
          </div>

          <div class="card">
            خدمت اصلی
            <div class="num">${state.services.length}</div>
          </div>

          <div class="card">
            شب‌های جمعه
            <div class="num">۰</div>
          </div>

          <div class="card">
            جلسات
            <div class="num">${state.meetings.length}</div>
          </div>

        </div>

        <div class="card" style="margin-top:16px">

          <h3>سامانه جامع مدیریت خدام</h3>

          <p class="muted">
            سامانه آماده استفاده و اتصال به اطلاعات آنلاین است.
          </p>

          <p class="muted">
            تاریخ امروز:
            ${faDate(new Date())}
          </p>

        </div>

      </section>
    `;
  }

  function khadems(main) {
    main.innerHTML = `
      <section class="section">

        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">

          <div>
            <h2>👤 بانک خدام</h2>
            <p class="muted">
              مدیریت اطلاعات خادمین مجموعه
            </p>
          </div>

          <input
            id="khademSearch"
            placeholder="جستجوی خادم..."
            oninput="window.KJ.filterKhadems()"
            style="max-width:240px">
        </div>

        <div class="card" style="margin-top:16px;overflow:auto">

          <table id="khademTable">

            <thead>
              <tr>
                <th>کد</th>
                <th>نام</th>
                <th>نام ثلاثی</th>
                <th>تلفن</th>
                <th>مسئولیت</th>
                <th>عضویت</th>
                <th>وضعیت</th>
              </tr>
            </thead>

            <tbody>
              ${khademRows(state.khadems)}
            </tbody>

          </table>

        </div>

      </section>
    `;
  }

  function khademRows(rows) {
    if (!rows.length) {
      return `
        <tr>
          <td colspan="7" class="muted">
            هنوز اطلاعاتی ثبت نشده است.
          </td>
        </tr>
      `;
    }

    return rows.map(row => `
      <tr>
        <td>${esc(row.code ?? row.id ?? '-')}</td>
        <td>${esc(row.name ?? row.full_name ?? '-')}</td>
        <td>${esc(row.full_name ?? row.name_three ?? '-')}</td>
        <td>${esc(row.phone ?? row.mobile ?? '-')}</td>
        <td>${esc(row.responsibility ?? row.role ?? '-')}</td>
        <td>${esc(row.membership ?? '-')}</td>
        <td>${esc(row.status ?? '-')}</td>
      </tr>
    `).join('');
  }

  function filterKhadems() {
    const input = $('khademSearch');

    if (!input) return;

    const query = input.value.trim().toLowerCase();

    const filtered = state.khadems.filter(row => {
      return JSON.stringify(row)
        .toLowerCase()
        .includes(query);
    });

    const table = $('khademTable');

    if (table) {
      const tbody = table.querySelector('tbody');

      if (tbody) {
        tbody.innerHTML = khademRows(filtered);
      }
    }
  }

  function services(main) {
    main.innerHTML = `
      <section class="section">

        <h2>🕌 خدمت اصلی</h2>

        <div class="card">
          <h3>ثبت و مدیریت خدمت اصلی</h3>
          <p class="muted">
            تعداد رکوردهای ثبت‌شده:
            ${state.services.length}
          </p>
          <p class="muted">
            این بخش برای توسعه فرم ثبت خدمت، برنامه شیفت‌ها
            و گزارش خدمت آماده شده است.
          </p>
        </div>

      </section>
    `;
  }

  function friday(main) {
    main.innerHTML = `
      <section class="section">

        <h2>🌙 شب‌های جمعه</h2>

        <div class="card">
          <h3>مدیریت خدمت شب‌های جمعه</h3>
          <p class="muted">
            این بخش برای ثبت برنامه و خادمان شب‌های جمعه آماده شده است.
          </p>
        </div>

      </section>
    `;
  }

  function meetings(main) {
    main.innerHTML = `
      <section class="section">

        <h2>📋 جلسات</h2>

        <div class="card">
          <h3>جلسات مجموعه</h3>

          <p class="muted">
            تعداد جلسات:
            ${state.meetings.length}
          </p>

          ${
            state.meetings.length
              ? `
                <div style="overflow:auto;margin-top:15px">
                  <table>
                    <thead>
                      <tr>
                        <th>عنوان</th>
                        <th>تاریخ</th>
                        <th>توضیحات</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${state.meetings.map(row => `
                        <tr>
                          <td>${esc(row.title ?? row.name ?? '-')}</td>
                          <td>${faDate(row.date ?? row.created_at)}</td>
                          <td>${esc(row.description ?? '-')}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `
              : `
                <p class="muted">
                  هنوز جلسه‌ای ثبت نشده است.
                </p>
              `
          }

        </div>

      </section>
    `;
  }

  function deployments(main) {
    main.innerHTML = `
      <section class="section">

        <h2>🚐 ماموریت‌ها</h2>

        <div class="card">

          <h3>ماموریت و اعزام خدام</h3>

          <p class="muted">
            تعداد ماموریت‌های ثبت‌شده:
            ${state.deployments.length}
          </p>

          <p class="muted">
            این بخش برای برنامه‌ریزی اعزام، مقصد، تاریخ،
            خادمان اعزامی و وضعیت ماموریت آماده شده است.
          </p>

        </div>

      </section>
    `;
  }

  function finance(main) {
    main.innerHTML = `
      <section class="section">

        <h2>💳 امور مالی</h2>

        <div class="card">

          <h3>تراکنش‌های مالی</h3>

          <p class="muted">
            تعداد تراکنش‌ها:
            ${state.finance.length}
          </p>

          <p class="muted">
            اطلاعات مالی در این سامانه باید با ثبت اصلاحیه،
            ابطال و سابقه تغییرات مدیریت شود و حذف مستقیم
            اطلاعات مالی انجام نشود.
          </p>

        </div>

      </section>
    `;
  }

  function fund(main) {
    main.innerHTML = `
      <section class="section">

        <h2>🏦 صندوق</h2>

        <div class="card">

          <h3>مدیریت صندوق</h3>

          <p class="muted">
            تعداد تراکنش‌های صندوق:
            ${state.fund.length}
          </p>

          <p class="muted">
            این بخش برای ثبت دریافت، پرداخت، مانده و گزارش صندوق آماده شده است.
          </p>

        </div>

      </section>
    `;
  }

  function donors(main) {
    main.innerHTML = `
      <section class="section">

        <h2>🤝 خیرین و حامیان</h2>

        <div class="card">

          <h3>بانک خیرین و حامیان</h3>

          <p class="muted">
            تعداد خیرین:
            ${state.donors.length}
          </p>

          <p class="muted">
            این بخش برای مدیریت اطلاعات خیرین، حمایت‌ها و سوابق کمک آماده شده است.
          </p>

        </div>

      </section>
    `;
  }

  function reports(main) {
    main.innerHTML = `
      <section class="section">

        <h2>📊 گزارش‌ها</h2>

        <div class="cards">

          <div class="card">
            خادمین
            <div class="num">${state.khadems.length}</div>
          </div>

          <div class="card">
            خدمت‌ها
            <div class="num">${state.services.length}</div>
          </div>

          <div class="card">
            جلسات
            <div class="num">${state.meetings.length}</div>
          </div>

          <div class="card">
            ماموریت‌ها
            <div class="num">${state.deployments.length}</div>
          </div>

        </div>

      </section>
    `;
  }

  function settings(main) {
    main.innerHTML = `
      <section class="section">

        <h2>⚙️ تنظیمات</h2>

        <div class="card">

          <h3>تنظیمات سامانه</h3>

          <p class="muted">
            تنظیمات تکمیلی سامانه در این بخش قرار خواهد گرفت.
          </p>

          <div style="margin-top:16px">

            <p>
              <strong>تقویم:</strong>
              شمسی
            </p>

            <p>
              <strong>پایگاه داده:</strong>
              Supabase
            </p>

            <p>
              <strong>وضعیت اتصال:</strong>
              ${sb ? 'متصل' : 'آماده اتصال'}
            </p>

          </div>

        </div>

      </section>
    `;
  }

  async function go(tab) {
    state.tab = tab;

    if (!state.demo && !sb) {
      await connect();
    }

    if (!state.demo && sb) {
      await loadData();
    }

    renderPage();
  }

  window.KJ = {
    showLogin,
    login,
    signout,
    demo,
    go,
    filterKhadems
  };

  showLogin();

})();