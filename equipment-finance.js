/* بخش مدیریت وسایل خدمت و بدهی خدام — نسخه ۱۵۳ */
(function () {
  'use strict';
  if (window.__equipmentFinance153) return;
  window.__equipmentFinance153 = true;

  const URL = 'https://fxxtyfurdzpzfvweoppo.supabase.co';
  const KEY = 'sb_publishable_HA3Z2cmNMddMTmpFoLmerA_k-YtEId7';
  const ITEMS = {
    white_cap: 'کلاه سفید',
    cream_cap: 'کلاه کرم',
    vest: 'جلیقه',
    fringe: 'ریشه (پر)',
    service_shirt: 'پیراهن خدمت'
  };
  const $ = id => document.getElementById(id);
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = v => Number(v || 0);
  const money = v => new Intl.NumberFormat('fa-IR').format(Math.round(num(v))) + ' تومان';
  const fa = v => new Intl.NumberFormat('fa-IR').format(num(v));
  const label = k => ITEMS[k] || k || '—';
  function session() { try { const s = JSON.parse(localStorage.getItem('khadem_session') || '{}'); if (s && s.access_token) return s; const token = localStorage.getItem('kj_access_token') || ''; return token ? { access_token: token } : {}; } catch (_) { const token = localStorage.getItem('kj_access_token') || ''; return token ? { access_token: token } : {}; } }
  async function api(table, method, query, body) {
    const s = session();
    if (!s.access_token) throw new Error('نشست معتبر پیدا نشد؛ دوباره وارد سامانه شوید.');
    const headers = { apikey: KEY, Authorization: 'Bearer ' + s.access_token, Accept: 'application/json', 'Content-Type': 'application/json', Prefer: 'return=representation' };
    const response = await fetch(URL + '/rest/v1/' + table + (query ? '?' + query : ''), {
      method: method || 'GET', headers, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store', credentials: 'omit'
    });
    if (!response.ok) throw new Error('خطای ' + response.status + ' در ' + table + ': ' + (await response.text()).slice(0, 220));
    if (response.status === 204) return [];
    const text = await response.text();
    return text ? JSON.parse(text) : [];
  }
  function digitsAscii(v) { return String(v || '').replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)); }
  function jalaliToIso(jy, jm, jd) {
    jy += 1595;
    let days = -355668 + 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + jd;
    days += jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186;
    let gy = 400 * Math.floor(days / 146097); days %= 146097;
    if (days > 36524) { gy += 100 * Math.floor(--days / 36524); days %= 36524; if (days >= 365) days++; }
    gy += 4 * Math.floor(days / 1461); days %= 1461;
    if (days > 365) { gy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
    let gd = days + 1;
    const leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
    const mdays = [0,31,leap ? 29 : 28,31,30,31,30,31,31,30,31,30,31];
    let gm = 1;
    while (gm <= 12 && gd > mdays[gm]) { gd -= mdays[gm]; gm++; }
    return String(gy).padStart(4,'0') + '-' + String(gm).padStart(2,'0') + '-' + String(gd).padStart(2,'0');
  }
  function dateVal(id) {
    const v = digitsAscii($(id)?.value?.trim() || '');
    if (!v) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const m = v.match(/^(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})$/);
    if (!m) return null;
    const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
    if (mo < 1 || mo > 12 || d < 1 || d > (mo <= 6 ? 31 : mo <= 11 ? 30 : 30)) return null;
    return jalaliToIso(y, mo, d);
  }
  function jdate(v) {
    if (!v) return '—';
    try { return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(String(v).slice(0,10) + 'T12:00:00')); }
    catch (_) { return v; }
  }
  function toast(msg) {
    if (typeof window.toast === 'function') window.toast(msg);
    else { const el = $('toast'); if (el) { el.textContent = msg; el.style.display = 'block'; } }
  }
  function notice(msg, bad) {
    return '<div class="notice" style="' + (bad ? 'border-color:#b42318;color:#b42318;' : '') + '">' + esc(msg) + '</div>';
  }
  function addMenu() {
    const menus = window.menus;
    const finance = Array.isArray(menus) && menus.find(m => m[0] === 'finance');
    if (!finance) return;
    finance[3] = finance[3] || [];
    if (!finance[3].some(s => s[0] === 'equipment')) finance[3].push(['equipment', '👕 وسایل خدمت و بدهی خدام']);
    try { if (typeof window.buildNav === 'function') window.buildNav(); } catch (_) {}
  }
  let activeSection = 'receipt';
  const EQUIPMENT_SECTIONS = [
    ['receipt', '۱. دریافت وسایل از هیئت'],
    ['stock', '۲. موجودی وسایل مجموعه'],
    ['issue', '۳. تحویل وسیله به خادم'],
    ['payment', '۴. دریافت از خادم / پرداخت به هیئت'],
    ['khadem-ledger', '۵. پرونده تحویل و بدهی خدام'],
    ['committee-ledger', '۶. دفتر حساب مجموعه با هیئت'],
    ['khadem-summary', '۷. خلاصه پرداخت خدام']
  ];
  function mountPage(html) {
    if (!EQUIPMENT_SECTIONS.some(([id]) => id === activeSection)) activeSection = 'receipt';
    const content = $('content');
    const tabs = EQUIPMENT_SECTIONS.map(([id, title]) =>
      '<button type="button" class="btn ' + (activeSection === id ? 'primary' : 'secondary') + '" data-eq-tab="' + id + '">' + esc(title) + '</button>'
    ).join('');
    if (content) content.innerHTML = '<div class="page-title"><h2>👕 مدیریت وسایل خدمت و بدهی خدام</h2><span class="muted">فرایند منظم از دریافت از هیئت تا تحویل به خادم و تسویه دوطرفه</span></div>' +
      '<div class="notice" style="margin-bottom:12px"><b>ترتیب کار:</b> ۱) ثبت رسید و اقلام دریافتی از هیئت؛ ۲) کنترل موجودی؛ ۳) ثبت تحویل هر قلم به خادم با انتخاب رسید منبع؛ ۴) ثبت دریافت وجه از خادم و پرداخت بدهی مجموعه به هیئت در بخش پرداخت‌ها؛ ۵) کنترل پرونده‌ها و دفترهای حساب. <b>تحویل کالا و پرداخت پول دو رویداد جدا هستند</b>؛ فقط پس از ثبت پرداخت واقعی، مانده کم می‌شود.</div>' +
      '<div class="card" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' + tabs + '</div>' + html;
    if (content) content.querySelectorAll('[data-eq-tab]').forEach(button => button.addEventListener('click', () => { activeSection = button.dataset.eqTab; renderPage(); }));
    if (content) {
      const selectors = {
        receipt: ['۱. دریافت وسایل و تجهیزات از هیئت'],
        issue: ['۳. تحویل وسیله به خادم'],
        payment: ['۴. ثبت پرداخت‌ها: دریافت از خادم یا پرداخت به هیئت'],
        stock: ['۲. موجودی وسایل مجموعه'],
        'khadem-ledger': ['۵. پرونده تحویل و بدهی خدام'],
        'committee-ledger': ['۶. دفتر حساب مجموعه با هیئت'],
        'khadem-summary': ['۷. خلاصه پرداخت خدام']
      };
      const allowed = selectors[activeSection] || [];
      content.querySelectorAll('.card.section').forEach(card => {
        const heading = card.querySelector('h3')?.textContent?.trim() || '';
        card.style.display = allowed.some(title => heading.startsWith(title)) ? '' : 'none';
      });
      const stats = content.querySelector('.grid');
      if (stats) stats.style.display = 'none';
    }
    try { if (typeof initOfflineJalaliCalendars === 'function') initOfflineJalaliCalendars(); } catch (_) {}
  }
  let cache = { khadems: [], receipts: [], items: [], committeePayments: [], issues: [], khademPayments: [] };
  async function loadData() {
    const tables = [
      ['khadems', 'khadems', 'select=id,khadem_code,full_name,is_active&order=khadem_code.asc&limit=3000'],
      ['receipts', 'equipment_committee_receipts', 'select=*&order=received_date.desc&limit=3000'],
      ['items', 'equipment_committee_receipt_items', 'select=*&limit=5000'],
      ['committeePayments', 'equipment_committee_payments', 'select=*&order=paid_date.desc&limit=5000'],
      ['issues', 'khadem_equipment_issues', 'select=*&order=issue_date.desc&limit=5000'],
      ['khademPayments', 'khadem_equipment_payments', 'select=*&order=paid_date.desc&limit=5000'],
    ];
    const loaded = await Promise.all(tables.map(async ([key, table, query]) => [key, await api(table, 'GET', query)]));
    loaded.forEach(([key, value]) => { cache[key] = value; });
  }
  function paidForIssue(id) {
    return cache.khademPayments.filter(p => p.issue_id === id).reduce((s, p) => s + num(p.amount_toman), 0);
  }
  function paidForReceipt(id) {
    return cache.committeePayments.filter(p => p.receipt_id === id).reduce((s, p) => s + num(p.amount_toman), 0);
  }
  function issueKhadem(issue) { return cache.khadems.find(k => k.id === issue.khadem_id) || {}; }
  function issueBalance(issue) { return Math.max(0, num(issue.total_amount_toman) - paidForIssue(issue.id)); }
  function receiptTotal(receipt) {
    return cache.items.filter(i => i.receipt_id === receipt.id).reduce((s, i) => s + num(i.total_cost_toman), 0);
  }
  function remainingStock(item) {
    const issued = cache.issues.filter(i => i.source_receipt_item_id === item.id && i.issue_status === 'delivered').reduce((s, i) => s + num(i.quantity), 0);
    return Math.max(0, num(item.quantity) - issued);
  }
  async function editRecord(table, id, fields, title) {
    const values = {};
    for (const field of fields) {
      const next = prompt(field.label + '\nبرای حفظ مقدار فعلی، همان مقدار را نگه دارید.', String(field.value ?? ''));
      if (next === null) return;
      if (field.type === 'date' && next.trim() && !dateValFromText(next)) { toast('تاریخ شمسی یا میلادی معتبر وارد کنید.'); return; }
      values[field.key] = field.type === 'date' ? (dateValFromText(next) || null) : (next.trim() || null);
    }
    try { await api(table, 'PATCH', 'id=eq.' + encodeURIComponent(id), values); toast(title + ' با موفقیت ویرایش شد.'); await loadData(); renderPage(); }
    catch (e) { toast('ویرایش ناموفق بود: ' + e.message); }
  }
  function dateValFromText(value) {
    const v = digitsAscii(value).trim();
    if (!v) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const m = v.match(/^(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})$/);
    if (!m) return null;
    const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
    if (mo < 1 || mo > 12 || d < 1 || d > (mo <= 6 ? 31 : 30)) return null;
    return jalaliToIso(y, mo, d);
  }
  function renderPage() {
    if (!EQUIPMENT_SECTIONS.some(([id]) => id === activeSection)) activeSection = 'receipt';
    const khademOptions = cache.khadems.filter(k => k.is_active !== false).map(k => '<option value="' + esc(k.id) + '">' + esc(k.khadem_code || '') + ' — ' + esc(k.full_name || 'بدون نام') + '</option>').join('');
    const stockOptions = cache.items.filter(i => remainingStock(i) > 0).map(i => {
      const r = cache.receipts.find(x => x.id === i.receipt_id) || {};
      return '<option value="' + esc(i.id) + '" data-item="' + esc(i.item_key) + '" data-stock="' + remainingStock(i) + '">' + esc(label(i.item_key)) + ' · رسید ' + esc(jdate(r.received_date)) + ' · موجودی ' + esc(fa(remainingStock(i))) + ' · قیمت هیئت ' + esc(money(i.unit_cost_toman)) + '</option>';
    }).join('');
    const payableIssues = cache.issues.filter(i => i.issue_status === 'delivered' && issueBalance(i) > 0);
    const issueOptions = payableIssues.length
      ? '<option value="">انتخاب قلم بدهکار خادم…</option>' + payableIssues.map(i => {
          const k = issueKhadem(i);
          return '<option value="' + esc(i.id) + '">' + esc(k.khadem_code || '') + ' — ' + esc(k.full_name || 'خادم') + ' · ' + esc(label(i.item_key)) + ' · مانده ' + esc(money(issueBalance(i))) + '</option>';
        }).join('')
      : '<option value="">هنوز قلم تحویل‌شده با بدهی باقی‌مانده ثبت نشده است</option>';
    const payableReceipts = cache.receipts.filter(r => Math.max(0, receiptTotal(r) - paidForReceipt(r.id)) > 0);
    const committeeReceiptOptions = payableReceipts.length
      ? '<option value="">انتخاب رسید بدهکار هیئت…</option>' + payableReceipts.map(r => '<option value="' + esc(r.id) + '">' + esc(jdate(r.received_date)) + ' · ' + esc(r.reference_no || 'بدون شماره') + ' · مانده ' + esc(money(Math.max(0,receiptTotal(r)-paidForReceipt(r.id)))) + '</option>').join('')
      : '<option value="">هنوز بدهی باز به هیئت ثبت نشده است</option>';
    const receiptsTotal = cache.receipts.reduce((s, r) => s + receiptTotal(r), 0);
    const committeePaid = cache.receipts.reduce((s, r) => s + paidForReceipt(r.id), 0);
    const committeeDebt = Math.max(0, receiptsTotal - committeePaid);
    const deliveredDebt = cache.issues.filter(i => i.issue_status === 'delivered').reduce((s, i) => s + issueBalance(i), 0);
    const issueCost = cache.issues.reduce((s, i) => s + num(i.total_amount_toman), 0);
    const khademPaid = cache.khademPayments.reduce((s, p) => s + num(p.amount_toman), 0);
    const stockKeys = ['white_cap','cream_cap','vest','fringe'];
    const stockRows = stockKeys.map(key => {
      const total = cache.items.filter(i => i.item_key === key).reduce((s, i) => s + num(i.quantity), 0);
      const delivered = cache.issues.filter(i => i.item_key === key && i.issue_status === 'delivered').reduce((s, i) => s + num(i.quantity), 0);
      return '<tr><td>' + esc(label(key)) + '</td><td>' + fa(total) + '</td><td>' + fa(delivered) + '</td><td><b>' + fa(Math.max(0,total-delivered)) + '</b></td></tr>';
    }).join('');
    const receiptRows = cache.receipts.map(r => {
      const total = receiptTotal(r), paid = paidForReceipt(r.id);
      const lines = cache.items.filter(i => i.receipt_id === r.id).map(i =>
        esc(label(i.item_key)) + ' × ' + fa(i.quantity) + ' (' + esc(money(i.unit_cost_toman)) + ') <button type="button" class="btn secondary eq-edit-item" data-id="' + esc(i.id) + '">ویرایش قلم</button>'
      ).join('<br>');
      return '<tr><td>' + esc(jdate(r.received_date)) + '</td><td>' + esc(r.reference_no || '—') + '</td><td>' + (lines || 'قلمی ثبت نشده') + '</td><td>' + esc(money(total)) + '</td><td>' + esc(money(paid)) + '</td><td><b>' + esc(money(Math.max(0,total-paid))) + '</b></td><td><button type="button" class="btn secondary eq-edit-receipt" data-id="' + esc(r.id) + '">ویرایش رسید</button></td></tr>';
    }).join('');
    const issueRows = cache.issues.map(i => {
      const k = issueKhadem(i), paid = paidForIssue(i.id), bal = issueBalance(i);
      const status = i.issue_status === 'delivered' ? 'تحویل شده' : i.issue_status === 'returned' ? 'برگشت خورده' : 'در انتظار تحویل';
      const action = (i.issue_status === 'pending' ? '<button type="button" class="btn secondary eq-mark-delivered" data-id="' + esc(i.id) + '">تأیید تحویل</button> ' : '') + '<button type="button" class="btn secondary eq-edit-issue" data-id="' + esc(i.id) + '">ویرایش رکورد</button>';
      return '<tr><td>' + esc(i.khadem_code || k.khadem_code || '—') + '</td><td>' + esc(k.full_name || '—') + '</td><td>' + esc(label(i.item_key)) + '</td><td>' + fa(i.quantity) + '</td><td>' + esc(money(i.unit_price_toman)) + '</td><td>' + esc(money(i.total_amount_toman)) + '</td><td>' + esc(money(paid)) + '</td><td><b>' + esc(money(i.issue_status === 'delivered' ? bal : 0)) + '</b></td><td>' + esc(status) + '</td><td>' + esc(jdate(i.delivery_date || i.issue_date)) + '</td><td>' + action + '</td></tr>';
    }).join('');
    mountPage(
      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))">' +
      '<div class="card"><span class="muted">کل هزینه وسایل دریافتی از هیئت</span><b style="display:block;font-size:20px">' + esc(money(receiptsTotal)) + '</b></div>' +
      '<div class="card"><span class="muted">پرداخت به هیئت</span><b style="display:block;font-size:20px">' + esc(money(committeePaid)) + '</b></div>' +
      '<div class="card"><span class="muted">بدهی مجموعه به هیئت</span><b style="display:block;font-size:20px;color:#b42318">' + esc(money(committeeDebt)) + '</b></div>' +
      '<div class="card"><span class="muted">بدهی خدام بابت اقلام تحویل‌شده</span><b style="display:block;font-size:20px;color:#b42318">' + esc(money(deliveredDebt)) + '</b></div></div>' +
      '<div class="card section"><h3>۱. دریافت وسایل و تجهیزات از هیئت</h3><p class="muted">ابتدا رسید دریافت را ثبت کنید. تعداد و قیمت واحد هر قلم در همان رسید نگهداری می‌شود و قیمت‌های رسیدهای قبلی تغییر نمی‌کند. پرداخت هم‌زمان فقط وقتی وارد شود که واقعاً همان لحظه وجهی به هیئت پرداخت شده باشد.</p>' +
      '<form id="eqReceiptForm"><div class="form-grid"><div class="field"><label>تاریخ دریافت (شمسی)</label><input id="eqRDate" data-jalali-date placeholder="۱۴۰۵/۰۷/۲۱"></div><div class="field"><label>شماره رسید هیئت</label><input id="eqRRef" placeholder="اختیاری"></div>' +
      '<div class="field"><label>تعداد جلیقه</label><input id="eqRQty_vest" type="number" min="0" step="1" value="0"></div><div class="field"><label>قیمت واحد جلیقه (تومان)</label><input id="eqRPrice_vest" type="number" min="0" step="1" value="0"></div>' +
      '<div class="field"><label>تعداد کلاه سفید</label><input id="eqRQty_white_cap" type="number" min="0" step="1" value="0"></div><div class="field"><label>قیمت واحد کلاه سفید (تومان)</label><input id="eqRPrice_white_cap" type="number" min="0" step="1" value="0"></div>' +
      '<div class="field"><label>تعداد کلاه کرم</label><input id="eqRQty_cream_cap" type="number" min="0" step="1" value="0"></div><div class="field"><label>قیمت واحد کلاه کرم (تومان)</label><input id="eqRPrice_cream_cap" type="number" min="0" step="1" value="0"></div>' +
      '<div class="field"><label>تعداد ریشه (پر)</label><input id="eqRQty_fringe" type="number" min="0" step="1" value="0"></div><div class="field"><label>قیمت واحد ریشه (پر) (تومان)</label><input id="eqRPrice_fringe" type="number" min="0" step="1" value="0"></div>' +
      '<div class="field"><label>پرداخت به هیئت در همین نوبت (تومان)</label><input id="eqRPay" type="number" min="0" step="1" value="0"></div><div class="field"><label>جمع هزینه اقلام این رسید</label><b id="eqRTotal">۰ تومان</b></div><div class="field full"><label>توضیحات</label><textarea id="eqRNotes"></textarea></div></div><button class="btn primary" type="submit">ثبت رسید و همه اقلام</button><span id="eqRMsg" class="muted"></span></form></div>' +
      '<div class="card section"><h3>۳. تحویل وسیله به خادم</h3><p class="muted">ابتدا موجودی را بررسی کنید؛ سپس خادم، قلم و رسید منبع را انتخاب کنید. سامانه تعداد را از موجودی همان رسید کم می‌کند. تحویل کالا به‌تنهایی به معنی پرداخت نیست؛ بدهی فقط پس از ثبت وجه دریافتی کاهش می‌یابد.</p>' +
      '<form id="eqIssueForm"><div class="form-grid"><div class="field"><label>خادم</label><select id="eqKhadem" required><option value="">انتخاب خادم…</option>' + khademOptions + '</select></div><div class="field"><label>قلم</label><select id="eqItem"><option value="vest">جلیقه</option><option value="white_cap">کلاه سفید</option><option value="cream_cap">کلاه کرم</option><option value="fringe">ریشه (پر)</option><option value="service_shirt">پیراهن خدمت (دوخت خیاط)</option></select></div><div class="field"><label>تعداد</label><input id="eqQty" type="number" min="1" value="1" required></div><div class="field"><label>قیمت واحد هنگام تحویل (تومان)</label><input id="eqPrice" type="number" min="0" step="1" required></div><div class="field"><label>وضعیت تحویل</label><select id="eqStatus"><option value="delivered">تحویل خادم شده</option><option value="pending">هنوز تحویل نشده</option></select></div><div class="field"><label>تاریخ ثبت/تحویل (شمسی)</label><input id="eqIDate" data-jalali-date placeholder="۱۴۰۵/۰۷/۲۱"></div><div class="field full" id="eqSourceWrap"><label>از کدام رسید موجودی تحویل می‌شود؟</label><select id="eqSource"><option value="">انتخاب رسید موجودی…</option>' + stockOptions + '</select><small class="muted">برای چهار قلم دریافتی از هیئت، رسید منبع انتخاب شود تا موجودی درست کم شود.</small></div><div class="field" id="eqTailorWrap" style="display:none"><label>نام خیاط</label><input id="eqTailor"></div><div class="field" id="eqSizeWrap" style="display:none"><label>اندازه پیراهن</label><input id="eqSize"></div><div class="field" id="eqOrderWrap" style="display:none"><label>تاریخ سفارش دوخت (شمسی)</label><input id="eqOrderDate" data-jalali-date placeholder="اختیاری"></div><div class="field full"><label>توضیحات</label><textarea id="eqINotes"></textarea></div></div><button class="btn primary" type="submit">ثبت تحویل / سفارش وسیله</button><span id="eqIMsg" class="muted"></span></form></div>' +
      '<div class="card section"><h3>۴. ثبت پرداخت‌ها: دریافت از خادم یا پرداخت به هیئت</h3><p class="muted">نوع پرداخت را مشخص کنید: «دریافت از خادم» فقط مانده همان قلم تحویل‌شده را کم می‌کند؛ «پرداخت مجموعه به هیئت» فقط بدهی همان رسید دریافت از هیئت را کم می‌کند. پرداخت جزئی مجاز است و مبلغ از مانده بیشتر پذیرفته نمی‌شود.</p>' +
      '<form id="eqPayForm"><div class="form-grid"><div class="field"><label>نوع پرداخت</label><select id="eqPayType"><option value="khadem">دریافت از خادم</option><option value="committee">پرداخت مجموعه به هیئت</option></select></div><div class="field full" id="eqPayIssueWrap"><label>قلم و پرونده خادم</label><select id="eqPayIssue" required>' + issueOptions + '</select></div><div class="field full" id="eqPayReceiptWrap" style="display:none"><label>رسید دریافت از هیئت</label><select id="eqPayReceipt" required>' + committeeReceiptOptions + '</select></div><div class="field"><label>مبلغ پرداخت (تومان)</label><input id="eqPayAmount" type="number" min="1" step="1" required></div><div class="field"><label>تاریخ پرداخت (شمسی)</label><input id="eqPayDate" data-jalali-date placeholder="۱۴۰۵/۰۷/۲۱"></div><div class="field"><label>روش پرداخت</label><select id="eqPayMethod"><option value="cash">نقدی</option><option value="card">کارت‌به‌کارت / کارت</option><option value="bank">حواله بانکی</option><option value="other">سایر</option></select></div><div class="field"><label>شماره رسید / پیگیری</label><input id="eqPayRef"></div><div class="field full"><label>توضیحات</label><textarea id="eqPayNotes"></textarea></div></div><button class="btn primary" type="submit">ثبت پرداخت</button><span id="eqPMsg" class="muted"></span></form></div>' +
      '<div class="card section"><h3>۲. موجودی وسایل مجموعه</h3><div style="overflow:auto"><table class="data-table"><thead><tr><th>قلم</th><th>دریافت از هیئت</th><th>تحویل‌شده به خدام</th><th>موجودی باقی‌مانده</th></tr></thead><tbody>' + stockRows + '</tbody></table></div></div>' +
      '<div class="card section"><h3>۶. دفتر حساب مجموعه با هیئت</h3><div style="overflow:auto"><table class="data-table"><thead><tr><th>تاریخ</th><th>شماره رسید</th><th>اقلام و قیمت‌های همان نوبت</th><th>کل هزینه</th><th>پرداخت‌شده</th><th>بدهی مجموعه</th><th>عملیات</th></tr></thead><tbody>' + (receiptRows || '<tr><td colspan="7">هنوز دریافتی از هیئت ثبت نشده است.</td></tr>') + '</tbody></table></div></div>' +
      '<div class="card section"><h3>۵. پرونده تحویل و بدهی خدام</h3><div style="overflow:auto"><table class="data-table"><thead><tr><th>کد خادم</th><th>نام خادم</th><th>قلم</th><th>تعداد</th><th>قیمت واحد</th><th>هزینه کل</th><th>پرداخت خادم</th><th>بدهی خادم</th><th>وضعیت</th><th>تاریخ</th><th>عملیات</th></tr></thead><tbody>' + (issueRows || '<tr><td colspan="11">هنوز وسیله‌ای به خادم تحویل نشده است.</td></tr>') + '</tbody></table></div></div>' +
      '<div class="card section"><h3>۷. خلاصه پرداخت خدام</h3><p>هزینه ثبت‌شده اقلام: <b>' + esc(money(issueCost)) + '</b> · پرداخت‌های ثبت‌شده: <b>' + esc(money(khademPaid)) + '</b></p><p class="muted">بدهی فقط برای اقلامی محاسبه می‌شود که وضعیت آن‌ها «تحویل خادم شده» باشد.</p></div>'
    );
    bindForms();
  }

  function setMsg(id, text, bad) {
    const el = $(id); if (!el) return;
    el.textContent = text; el.style.color = bad ? '#b42318' : '#16803c';
  }
  async function saveFinanceTransaction(data) {
    try {
      const rows = await api('finance_transactions', 'POST', '', data);
      return rows[0] || null;
    } catch (e) { return { __error: e.message }; }
  }
  async function bindLedgerPayment({table, payload, transaction}) {
    const created = await api(table, 'POST', '', payload);
    const row = created[0];
    let ledgerWarning = null;
    if (transaction && row) {
      const tx = await saveFinanceTransaction(transaction);
      if (tx && tx.id) {
        try { await api(table, 'PATCH', 'id=eq.' + encodeURIComponent(row.id), {finance_transaction_id:tx.id}); }
        catch (e) { ledgerWarning = 'تراکنش ثبت شد ولی پیوند آن به دفتر مالی انجام نشد: ' + e.message; }
      } else if (tx && tx.__error) ledgerWarning = tx.__error;
    }
    return {row, ledgerWarning};
  }
  function bindForms() {
    document.querySelectorAll('.eq-edit-receipt').forEach(button => button.addEventListener('click', async () => {
      const row=cache.receipts.find(x=>x.id===button.dataset.id); if(!row)return;
      await editRecord('equipment_committee_receipts',row.id,[
        {key:'received_date',label:'تاریخ دریافت (شمسی یا میلادی)',value:row.received_date,type:'date'},
        {key:'reference_no',label:'شماره رسید هیئت',value:row.reference_no||''},
        {key:'notes',label:'توضیحات',value:row.notes||''}
      ],'رسید دریافت از هیئت');
    }));
    document.querySelectorAll('.eq-edit-item').forEach(button => button.addEventListener('click', async () => {
      const row=cache.items.find(x=>x.id===button.dataset.id); if(!row)return;
      const qt=prompt('تعداد قلم',String(row.quantity)); if(qt===null)return;
      const pt=prompt('قیمت واحد (تومان)',String(row.unit_cost_toman)); if(pt===null)return;
      const quantity=Number(digitsAscii(qt)),price=Number(digitsAscii(pt));
      if(!Number.isInteger(quantity)||quantity<1||!Number.isFinite(price)||price<0){toast('تعداد و قیمت معتبر وارد کنید.');return;}
      const issued=cache.issues.filter(i=>i.source_receipt_item_id===row.id&&i.issue_status==='delivered').reduce((s,i)=>s+num(i.quantity),0);
      if(quantity<issued){toast('تعداد جدید نمی‌تواند از تعداد تحویل‌شده به خدام کمتر باشد.');return;}
      const receipt=cache.receipts.find(r=>r.id===row.receipt_id);
      const total=(receipt?receiptTotal(receipt):0)-num(row.total_cost_toman)+quantity*price;
      if(receipt&&total<paidForReceipt(receipt.id)){toast('جمع جدید رسید از پرداخت‌های ثبت‌شده کمتر می‌شود؛ ابتدا پرداخت‌ها را بررسی کنید.');return;}
      try{await api('equipment_committee_receipt_items','PATCH','id=eq.'+encodeURIComponent(row.id),{quantity,unit_cost_toman:price});toast('قلم رسید ویرایش شد.');await loadData();renderPage();}
      catch(e){toast('ویرایش قلم ناموفق بود: '+e.message);}
    }));
    document.querySelectorAll('.eq-edit-issue').forEach(button => button.addEventListener('click', async () => {
      const row=cache.issues.find(x=>x.id===button.dataset.id); if(!row)return;
      const pt=prompt('قیمت واحد هنگام تحویل (تومان)',String(row.unit_price_toman)); if(pt===null)return;
      const dt=prompt('تاریخ ثبت/تحویل (شمسی یا میلادی)',String(row.issue_date||row.delivery_date||'')); if(dt===null)return;
      const nt=prompt('توضیحات',String(row.notes||'')); if(nt===null)return;
      const price=Number(digitsAscii(pt)),date=dateValFromText(dt);
      if(!Number.isFinite(price)||price<0||!date){toast('قیمت و تاریخ معتبر وارد کنید.');return;}
      if(num(row.quantity)*price<paidForIssue(row.id)){toast('هزینه جدید از مبلغ پرداخت‌شده کمتر می‌شود؛ ابتدا پرداخت‌های پرونده را بررسی کنید.');return;}
      try{await api('khadem_equipment_issues','PATCH','id=eq.'+encodeURIComponent(row.id),{unit_price_toman:price,issue_date:date,...(row.issue_status==='delivered'?{delivery_date:date}:{}),notes:nt.trim()||null});toast('رکورد تحویل/سفارش ویرایش شد.');await loadData();renderPage();}
      catch(e){toast('ویرایش رکورد ناموفق بود: '+e.message);}
    }));
    document.querySelectorAll('.eq-mark-delivered').forEach(button => button.addEventListener('click', async () => {
      const id = button.dataset.id;
      if (!id || !confirm('تحویل این قلم به خادم تأیید شود؟ از این لحظه مانده پرداخت‌نشده به‌عنوان بدهی خادم محاسبه می‌شود.')) return;
      try {
        await api('khadem_equipment_issues','PATCH','id=eq.' + encodeURIComponent(id),{issue_status:'delivered',delivery_date:new Date().toISOString().slice(0,10)});
        toast('تحویل تأیید شد؛ بدهی خادم محاسبه شد.'); await loadData(); renderPage();
      } catch (e) { toast('تأیید تحویل ناموفق بود: ' + e.message); }
    }));
    const receiptTotalUpdate = () => {
      const total = ['vest','white_cap','cream_cap','fringe'].reduce((sum,k)=>sum+num($('eqRQty_'+k)?.value)*num($('eqRPrice_'+k)?.value),0);
      const el=$('eqRTotal'); if(el) el.textContent=money(total);
    };
    ['vest','white_cap','cream_cap','fringe'].forEach(k=>['eqRQty_'+k,'eqRPrice_'+k].forEach(id=>$(id)?.addEventListener('input',receiptTotalUpdate)));
    receiptTotalUpdate();
    const itemSel = $('eqItem');
    const sourceWrap = $('eqSourceWrap'), tailorWrap = $('eqTailorWrap'), sizeWrap = $('eqSizeWrap'), orderWrap = $('eqOrderWrap');
    function syncIssueFields() {
      const shirt = itemSel.value === 'service_shirt';
      if (sourceWrap) sourceWrap.style.display = shirt ? 'none' : '';
      if (tailorWrap) tailorWrap.style.display = shirt ? '' : 'none';
      if (sizeWrap) sizeWrap.style.display = shirt ? '' : 'none';
      if (orderWrap) orderWrap.style.display = shirt ? '' : 'none';
    }
    function filterStockOptions() {
      const source = $('eqSource');
      if (!source) return;
      Array.from(source.options).forEach(opt => {
        if (!opt.dataset.item) return;
        const matches = opt.dataset.item === itemSel.value;
        opt.hidden = !matches; opt.disabled = !matches;
      });
      if (source.selectedOptions[0]?.disabled) source.value = '';
    }
    itemSel?.addEventListener('change', () => { syncIssueFields(); filterStockOptions(); });
    syncIssueFields(); filterStockOptions();
    function syncPaymentTarget() {
      const committee = $('eqPayType')?.value === 'committee';
      const issueWrap = $('eqPayIssueWrap'), receiptWrap = $('eqPayReceiptWrap');
      const issueSelect = $('eqPayIssue'), receiptSelect = $('eqPayReceipt');
      if (issueWrap) issueWrap.style.display = committee ? 'none' : '';
      if (receiptWrap) receiptWrap.style.display = committee ? '' : 'none';
      // Only the selector for the chosen payment type may be required.
      // A hidden required selector otherwise blocks the form on mobile browsers.
      if (issueSelect) issueSelect.required = !committee;
      if (receiptSelect) receiptSelect.required = !!committee;
    }
    $('eqPayType')?.addEventListener('change', syncPaymentTarget);
    syncPaymentTarget();
    $('eqReceiptForm')?.addEventListener('submit', async e => {
      e.preventDefault();
      const msg = 'eqRMsg'; setMsg(msg, 'در حال ثبت…');
      const paid = num($('eqRPay').value), date = dateVal('eqRDate');
      const lineDefs = ['vest','white_cap','cream_cap','fringe'].map(key => ({key,qty:num($('eqRQty_'+key).value),price:num($('eqRPrice_'+key).value)}));
      const lines = lineDefs.filter(x => x.qty > 0);
      if (!date || !lines.length || lines.some(x => !Number.isInteger(x.qty) || x.qty < 1 || x.price < 0) || paid < 0) { setMsg(msg, 'تاریخ معتبر و دست‌کم یک قلم با تعداد صحیح و قیمت معتبر وارد کنید.', true); return; }
      const total = lines.reduce((sum,x) => sum + x.qty*x.price, 0);
      if (paid > total) { setMsg(msg, 'پرداخت به هیئت نمی‌تواند از جمع هزینه این رسید بیشتر باشد.', true); return; }
      const ledgerWarnings = [];
      try {
        const receipt = (await api('equipment_committee_receipts','POST','',{received_date:date,received_from:'هیئت',reference_no:$('eqRRef').value.trim()||null,notes:$('eqRNotes').value.trim()||null}))[0];
        for (const line of lines) await api('equipment_committee_receipt_items','POST','',{receipt_id:receipt.id,item_key:line.key,quantity:line.qty,unit_cost_toman:line.price,notes:$('eqRNotes').value.trim()||null});
        if (paid > 0) {
          const result = await bindLedgerPayment({
            table:'equipment_committee_payments',
            payload:{receipt_id:receipt.id,amount_toman:paid,paid_date:date,payment_method:'cash',reference_no:$('eqRRef').value.trim()||null,notes:'پرداخت هم‌زمان با ثبت رسید دریافت از هیئت'},
            transaction:{transaction_date:date,transaction_type:'expense',amount:paid*10,title:'پرداخت بابت وسایل خدمت به هیئت',category:'وسایل خدمت',party:'هیئت',reference_no:$('eqRRef').value.trim()||null,payment_method:'cash',status:'posted',description:'پرداخت ثبت‌شده هنگام ثبت رسید وسایل خدمت'}
          });
          if (result && result.ledgerWarning) ledgerWarnings.push(result.ledgerWarning);
        }
        toast(ledgerWarnings.length?'رسید ذخیره شد، اما دفتر مالی عمومی به‌روزرسانی نشد: '+ledgerWarnings.join('؛ '):'رسید و همه اقلام این نوبت ثبت شد.');
        $('eqReceiptForm').reset(); ['vest','white_cap','cream_cap','fringe'].forEach(k=>{$('eqRQty_'+k).value='0';$('eqRPrice_'+k).value='0'}); $('eqRPay').value='0';
        await loadData(); renderPage();
      } catch (err) { setMsg(msg,'ثبت کامل نشد: '+err.message,true); }
    });
    $('eqIssueForm')?.addEventListener('submit', async e => {
      e.preventDefault();
      const msg='eqIMsg'; setMsg(msg,'در حال ثبت…');
      const khademId=$('eqKhadem').value, item=$('eqItem').value, qty=num($('eqQty').value), price=num($('eqPrice').value), status=$('eqStatus').value, date=dateVal('eqIDate');
      const sourceId=$('eqSource').value || null;
      if (!khademId || !qty || price < 0 || !date) { setMsg(msg,'خادم، تعداد، قیمت و تاریخ معتبر لازم است.',true); return; }
      if (item !== 'service_shirt' && !sourceId) { setMsg(msg,'برای اقلام دریافتی از هیئت، رسید منبع موجودی را انتخاب کنید.',true); return; }
      if (sourceId) {
        const src=cache.items.find(i=>i.id===sourceId);
        if (!src || src.item_key!==item) { setMsg(msg,'قلم انتخاب‌شده با رسید منبع هم‌خوانی ندارد.',true); return; }
        if (qty>remainingStock(src)) { setMsg(msg,'تعداد بیشتر از موجودی باقی‌مانده این رسید است.',true); return; }
      }
      const khadem=cache.khadems.find(k=>k.id===khademId);
      const payload={khadem_id:khademId,source_receipt_item_id:sourceId,item_key:item,quantity:qty,unit_price_toman:price,issue_status:status,issue_date:date,delivery_date:status==='delivered'?date:null,tailor_name:item==='service_shirt'?($('eqTailor').value.trim()||null):null,shirt_size:item==='service_shirt'?($('eqSize').value.trim()||null):null,order_date:item==='service_shirt'?(dateVal('eqOrderDate')||date):null,notes:$('eqINotes').value.trim()||null};
      try {
        await api('khadem_equipment_issues','POST','',payload);
        toast('سابقه ثبت شد؛ قیمت این نوبت مستقل است و مبلغ پرداخت‌نشده در بدهی خادم محاسبه می‌شود.');
        $('eqIssueForm').reset(); $('eqQty').value='1'; await loadData(); renderPage();
      } catch(err) { setMsg(msg,'ثبت تحویل ناموفق بود: '+err.message,true); }
    });
    $('eqPayForm')?.addEventListener('submit', async e => {
      e.preventDefault();
      const msg='eqPMsg'; setMsg(msg,'در حال ثبت پرداخت…');
      const amount=num($('eqPayAmount').value), date=dateVal('eqPayDate'), method=$('eqPayMethod').value, ref=$('eqPayRef').value.trim()||null, notes=$('eqPayNotes').value.trim()||null;
      if (!amount || !date) { setMsg(msg,'مبلغ و تاریخ معتبر لازم است.',true); return; }
      let ledgerWarning = null;
      try {
        if ($('eqPayType').value==='committee') {
          const receiptId=$('eqPayReceipt').value;
          if (!receiptId) { setMsg(msg,'رسید هیئت را انتخاب کنید.',true); return; }
          const rec=cache.receipts.find(r=>r.id===receiptId), balance=rec?Math.max(0,receiptTotal(rec)-paidForReceipt(rec.id)):0;
          if (amount>balance) { setMsg(msg,'مبلغ پرداخت از بدهی باقی‌مانده این رسید بیشتر است.',true); return; }
          var committeeResult = await bindLedgerPayment({table:'equipment_committee_payments',payload:{receipt_id:receiptId,amount_toman:amount,paid_date:date,payment_method:method,reference_no:ref,notes},transaction:{transaction_date:date,transaction_type:'expense',amount:amount*10,title:'پرداخت بدهی وسایل خدمت به هیئت',category:'وسایل خدمت',party:'هیئت',reference_no:ref,payment_method:method,status:'posted',description:notes||'پرداخت ثبت‌شده در بخش وسایل خدمت'}});
          ledgerWarning = committeeResult.ledgerWarning || null;
        } else {
          const issueId=$('eqPayIssue').value, issue=cache.issues.find(i=>i.id===issueId);
          if (!issue) { setMsg(msg,'قلم و پرونده خادم را انتخاب کنید.',true); return; }
          const balance=issueBalance(issue);
          if (amount>balance) { setMsg(msg,'مبلغ پرداخت از مانده این قلم بیشتر است.',true); return; }
          const k=issueKhadem(issue);
          var khademResult = await bindLedgerPayment({table:'khadem_equipment_payments',payload:{issue_id:issueId,amount_toman:amount,paid_date:date,payment_method:method,reference_no:ref,notes},transaction:{transaction_date:date,transaction_type:'income',amount:amount*10,title:'دریافت بابت '+label(issue.item_key),category:'وسایل خدمت',party:k.full_name||'خادم',khadem_id:k.id,khadem_code:k.khadem_code,khadem_name:k.full_name,reference_no:ref,payment_method:method,status:'posted',description:notes||'دریافت ثبت‌شده در پرونده مالی خادم'}});
          ledgerWarning = khademResult.ledgerWarning || null;
        }
        if (ledgerWarning) toast('پرداخت در دفتر وسایل ثبت شد، اما ثبت/پیوند دفتر مالی عمومی ناموفق بود: ' + ledgerWarning);
        else toast('پرداخت ثبت شد؛ مانده بدهی دوباره محاسبه شد.');
        $('eqPayForm').reset(); await loadData(); renderPage();
      } catch(err) { setMsg(msg,'ثبت پرداخت ناموفق بود: '+err.message,true); }
    });
  }
  async function equipmentPage() {
    mountPage('<div class="card"><div class="notice">در حال دریافت اطلاعات وسایل و حساب‌های مالی…</div></div>');
    try { await loadData(); renderPage(); }
    catch (e) { mountPage(notice('دریافت اطلاعات ناموفق بود: ' + e.message + ' — مجوز finance.manage و اتصال شبکه را بررسی کنید.', true)); }
  }
  async function appendNonattendanceToServicePage(page) {
    const content = $('content') || $('#kj-main');
    if (!content) return;
    const existing = $('eqServiceAbsenceHistory');
    if (existing) existing.remove();
    const kind = page === 'friday' ? 'friday_night' : 'official';
    const kindTitle = kind === 'friday_night' ? 'خدمت شب‌های جمعه' : 'خدمت رسمی';
    const reasonLabels = {border_exit_issue:'مشکل خروج از مرز',illness:'بیماری',family_emergency:'اتفاق یا ضرورت خانوادگی',other:'سایر موارد'};
    const statusLabels = {pending:'در انتظار پیگیری',rescheduled:'تغییر تاریخ خدمت',refunded:'هزینه بازپرداخت شد',not_refundable:'هزینه قابل بازپرداخت نیست',closed:'مختومه'};
    try {
      const [rows, khadems] = await Promise.all([
        api('khadem_service_nonattendance', 'GET', 'select=*&service_kind=eq.' + kind + '&order=planned_service_date.desc,created_at.desc&limit=1000'),
        api('khadems', 'GET', 'select=id,khadem_code,full_name,is_active&order=khadem_code.asc&limit=3000')
      ]);
      if ((window.khademCurrentPage !== page && !(window.KJ && window.KJ.state && window.KJ.state.tab === page)) || !($('content') || $('#kj-main'))) return;
      const activeKhadems = khadems.filter(k => k.is_active !== false);
      const options = activeKhadems.map(k => '<option value="' + esc(k.id) + '">' + esc(k.khadem_code || '—') + ' — ' + esc(k.full_name || 'بدون نام') + '</option>').join('');
      const names = new Map(khadems.map(k => [k.id, k]));
      const paid = rows.reduce((sum, r) => sum + num(r.cost_paid_toman), 0);
      const list = rows.map(r => {
        const k = names.get(r.khadem_id) || {};
        const reason = reasonLabels[r.reason_code] || 'سایر موارد';
        const state = statusLabels[r.resolution_status] || r.resolution_status || '—';
        return '<tr><td>' + esc(k.khadem_code || '—') + '</td><td>' + esc(k.full_name || 'خادم نامشخص') + '</td><td>' + esc(jdate(r.planned_service_date)) + '</td><td>' + (r.preparation_completed ? 'کامل' : 'ناقص') + '</td><td>' + esc(reason) + (r.reason_details ? '<br><small>' + esc(r.reason_details) + '</small>' : '') + '</td><td>' + esc(money(r.cost_paid_toman)) + ' از ' + esc(money(r.cost_total_toman)) + '</td><td><select class="eq-absence-resolution" data-id="' + esc(r.id) + '">' +
          ['pending','rescheduled','refunded','not_refundable','closed'].map(s => '<option value="' + s + '"' + (r.resolution_status === s ? ' selected' : '') + '>' + esc(statusLabels[s]) + '</option>').join('') +
          '</select><input class="eq-absence-refund" data-id="' + esc(r.id) + '" type="number" min="0" step="1" value="' + esc(r.refund_amount_toman || 0) + '" aria-label="مبلغ بازپرداخت تومان" placeholder="مبلغ بازپرداخت" style="max-width:130px;margin-top:5px"><button type="button" class="btn secondary eq-save-absence" data-id="' + esc(r.id) + '" style="margin-top:5px">ثبت پیگیری</button></td></tr>';
      }).join('');
      const panel = document.createElement('section');
      panel.id = 'eqServiceAbsenceHistory';
      panel.className = 'card section';
      panel.innerHTML = '<h3>ثبت و پیگیری عدم حضور در ' + kindTitle + '</h3>' +
        '<p class="muted">اگر خادم پس از طی مراحل اعزام و حتی پس از پرداخت هزینه نتوانست حاضر شود، پرونده را همین‌جا ثبت کنید. این سابقه به‌عنوان خدمت انجام‌شده محاسبه نمی‌شود و پرداخت‌ها را خودکار تغییر نمی‌دهد.</p>' +
        '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))"><div class="card"><span class="muted">تعداد پرونده‌های عدم حضور</span><b style="display:block;font-size:20px">' + esc(fa(rows.length)) + '</b></div><div class="card"><span class="muted">هزینه پرداخت‌شده مرتبط</span><b style="display:block;font-size:20px">' + esc(money(paid)) + '</b></div></div>' +
        '<form id="eqAbsenceForm" class="card" style="margin:12px 0"><h4>ثبت عدم حضور در ' + kindTitle + '</h4><div class="form-grid">' +
        '<div class="field"><label for="eqAbsKhadem">خادم</label><select id="eqAbsKhadem" required><option value="">انتخاب خادم…</option>' + options + '</select></div>' +
        '<div class="field"><label for="eqAbsDate">تاریخ برنامه‌ریزی‌شده خدمت (شمسی)</label><input id="eqAbsDate" data-jalali-date placeholder="۱۴۰۵/۰۷/۲۱" required></div>' +
        '<div class="field"><label for="eqAbsPreparation">مراحل پیش از خدمت</label><select id="eqAbsPreparation"><option value="true">کامل شده</option><option value="false">کامل نشده</option></select></div>' +
        '<div class="field"><label for="eqAbsReason">علت عدم حضور</label><select id="eqAbsReason" required><option value="border_exit_issue">مشکل خروج از مرز</option><option value="illness">بیماری</option><option value="family_emergency">اتفاق یا ضرورت خانوادگی</option><option value="other">سایر موارد</option></select></div>' +
        '<div class="field"><label for="eqAbsTotal">کل هزینه خدمت (تومان)</label><input id="eqAbsTotal" type="number" min="0" step="1" value="0" required></div>' +
        '<div class="field"><label for="eqAbsPaid">هزینه پرداخت‌شده (تومان)</label><input id="eqAbsPaid" type="number" min="0" step="1" value="0" required></div>' +
        '<div class="field full"><label for="eqAbsDetails">شرح علت / توضیحات</label><textarea id="eqAbsDetails" placeholder="اختیاری"></textarea></div>' +
        '<div class="field full"><label for="eqAbsNotes">یادداشت داخلی</label><textarea id="eqAbsNotes" placeholder="اختیاری"></textarea></div></div>' +
        '<button class="btn primary" type="submit">ثبت عدم حضور</button> <span id="eqAbsMsg" class="muted"></span></form>' +
        '<h4>سوابق عدم حضور همین نوع خدمت</h4><p class="muted">برای جلوگیری از دوباره‌شماری، ثبت عدم حضور سابقه خدمت انجام‌شده ایجاد نمی‌کند و بازپرداخت در دفتر مالی عمومی به‌صورت خودکار ثبت نمی‌شود.</p>' +
        '<div style="overflow:auto"><table class="data-table"><thead><tr><th>کد خادم</th><th>نام خادم</th><th>تاریخ برنامه</th><th>مراحل اعزام</th><th>علت</th><th>هزینه پرداخت‌شده</th><th>وضعیت پیگیری / بازپرداخت</th></tr></thead><tbody>' + (list || '<tr><td colspan="7">برای این نوع خدمت پرونده عدم حضوری ثبت نشده است.</td></tr>') + '</tbody></table></div>';
      content.appendChild(panel);
      try { if (typeof initOfflineJalaliCalendars === 'function') initOfflineJalaliCalendars(); } catch (_) {}
      $('eqAbsenceForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        const msg = 'eqAbsMsg';
        const total = num($('eqAbsTotal').value), paidAmount = num($('eqAbsPaid').value), date = dateVal('eqAbsDate');
        const khademId = $('eqAbsKhadem').value;
        if (!khademId || !date || !Number.isInteger(total) || !Number.isInteger(paidAmount) || total < 0 || paidAmount < 0 || paidAmount > total) {
          setMsg(msg, 'خادم و تاریخ معتبر لازم است؛ مبالغ باید عدد صحیح تومان باشند و پرداخت‌شده از کل هزینه بیشتر نباشد.', true); return;
        }
        if (rows.some(r => r.khadem_id === khademId && String(r.planned_service_date).slice(0,10) === date)) {
          setMsg(msg, 'برای این خادم در همین تاریخ، پرونده عدم حضور ثبت شده است؛ سوابق قبلی را پیگیری کنید.', true); return;
        }
        setMsg(msg, 'در حال ثبت پرونده…');
        try {
          await api('khadem_service_nonattendance', 'POST', '', {
            khadem_id: khademId, service_kind: kind, planned_service_date: date,
            preparation_completed: $('eqAbsPreparation').value === 'true',
            cost_total_toman: total, cost_paid_toman: paidAmount,
            reason_code: $('eqAbsReason').value,
            reason_details: $('eqAbsDetails').value.trim() || null,
            notes: $('eqAbsNotes').value.trim() || null,
            resolution_status: 'pending', refund_amount_toman: 0
          });
          toast('عدم حضور در سوابق این خادم ثبت شد؛ این مورد خدمت انجام‌شده محسوب نمی‌شود.');
          await appendNonattendanceToServicePage(page);
        } catch (err) { setMsg(msg, 'ثبت عدم حضور ناموفق بود: ' + err.message, true); }
      });
      panel.querySelectorAll('.eq-save-absence').forEach(button => button.addEventListener('click', async () => {
        const id = button.dataset.id;
        const status = panel.querySelector('.eq-absence-resolution[data-id="' + id + '"]')?.value;
        const refund = num(panel.querySelector('.eq-absence-refund[data-id="' + id + '"]')?.value);
        const record = rows.find(x => x.id === id);
        if (!record) return;
        if (refund < 0 || refund > num(record.cost_paid_toman)) { toast('مبلغ بازپرداخت نمی‌تواند از مبلغ پرداخت‌شده بیشتر باشد.'); return; }
        if (status === 'refunded' && refund <= 0) { toast('برای وضعیت بازپرداخت‌شده، مبلغ بازپرداخت را وارد کنید.'); return; }
        try {
          await api('khadem_service_nonattendance', 'PATCH', 'id=eq.' + encodeURIComponent(id), {resolution_status:status, refund_amount_toman:refund});
          toast('وضعیت پیگیری عدم حضور ذخیره شد.');
          await appendNonattendanceToServicePage(page);
        } catch (err) { toast('ذخیره پیگیری ناموفق بود: ' + err.message); }
      }));
    } catch (err) {
      if ((window.khademCurrentPage !== page && !(window.KJ && window.KJ.state && window.KJ.state.tab === page)) || !($('content') || $('#kj-main'))) return;
      const panel = document.createElement('section');
      panel.id = 'eqServiceAbsenceHistory';
      panel.className = 'card section';
      panel.innerHTML = '<h3>ثبت و پیگیری عدم حضور در ' + kindTitle + '</h3>' + notice('دریافت سوابق عدم حضور ناموفق بود: ' + err.message + '؛ اتصال و مجوز دسترسی را بررسی کنید و دوباره تلاش کنید.', true) + '<button type="button" class="btn secondary" id="eqAbsenceRetry">تلاش دوباره</button>';
      content.appendChild(panel);
      $('eqAbsenceRetry')?.addEventListener('click', () => appendNonattendanceToServicePage(page));
    }
  }
  window.KhademEquipmentFinance = { appendNonattendanceToServicePage };
  addMenu();
  const oldRender = window.render;
  if (typeof oldRender === 'function') {
    window.render = function (page) {
      window.khademCurrentPage = page;
      if (page === 'finance:equipment') { equipmentPage(); return; }
      const result = oldRender.apply(this, arguments);
      if (page === 'services' || page === 'friday') {
        Promise.resolve(result).then(() => {
          window.setTimeout(() => {
            if (window.khademCurrentPage === page) appendNonattendanceToServicePage(page);
          }, 450);
        });
      }
      return result;
    };
  }
})();