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
  function session() { try { return JSON.parse(localStorage.getItem('khadem_session') || '{}'); } catch (_) { return {}; } }
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
  function mountPage(html) {
    const content = $('content');
    if (content) content.innerHTML = '<div class="page-title"><h2>👕 مدیریت وسایل خدمت و بدهی خدام</h2><span class="muted">حساب هیئت، موجودی مجموعه و پرونده مالی خادم</span></div>' + html;
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
      ['khademPayments', 'khadem_equipment_payments', 'select=*&order=paid_date.desc&limit=5000']
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
  function renderPage() {
    const khademOptions = cache.khadems.filter(k => k.is_active !== false).map(k => '<option value="' + esc(k.id) + '">' + esc(k.khadem_code || '') + ' — ' + esc(k.full_name || 'بدون نام') + '</option>').join('');
    const stockOptions = cache.items.filter(i => remainingStock(i) > 0).map(i => {
      const r = cache.receipts.find(x => x.id === i.receipt_id) || {};
      return '<option value="' + esc(i.id) + '" data-item="' + esc(i.item_key) + '" data-stock="' + remainingStock(i) + '">' + esc(label(i.item_key)) + ' · رسید ' + esc(jdate(r.received_date)) + ' · موجودی ' + esc(fa(remainingStock(i))) + ' · قیمت هیئت ' + esc(money(i.unit_cost_toman)) + '</option>';
    }).join('');
    const issueOptions = cache.issues.map(i => {
      const k = issueKhadem(i);
      return '<option value="' + esc(i.id) + '">' + esc(k.khadem_code || '') + ' — ' + esc(k.full_name || 'خادم') + ' · ' + esc(label(i.item_key)) + ' · مانده ' + esc(money(issueBalance(i))) + (i.issue_status === 'delivered' ? '' : ' · هنوز تحویل نشده') + '</option>';
    }).join('');
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
      const lines = cache.items.filter(i => i.receipt_id === r.id).map(i => label(i.item_key) + ' × ' + fa(i.quantity) + ' (' + money(i.unit_cost_toman) + ')').join('، ');
      return '<tr><td>' + esc(jdate(r.received_date)) + '</td><td>' + esc(r.reference_no || '—') + '</td><td>' + esc(lines || 'قلمی ثبت نشده') + '</td><td>' + esc(money(total)) + '</td><td>' + esc(money(paid)) + '</td><td><b>' + esc(money(Math.max(0,total-paid))) + '</b></td></tr>';
    }).join('');
    const issueRows = cache.issues.map(i => {
      const k = issueKhadem(i), paid = paidForIssue(i.id), bal = issueBalance(i);
      const status = i.issue_status === 'delivered' ? 'تحویل شده' : i.issue_status === 'returned' ? 'برگشت خورده' : 'در انتظار تحویل';
      const action = i.issue_status === 'pending' ? '<button type="button" class="btn secondary eq-mark-delivered" data-id="' + esc(i.id) + '">تأیید تحویل</button>' : '—';
      return '<tr><td>' + esc(i.khadem_code || k.khadem_code || '—') + '</td><td>' + esc(k.full_name || '—') + '</td><td>' + esc(label(i.item_key)) + '</td><td>' + fa(i.quantity) + '</td><td>' + esc(money(i.unit_price_toman)) + '</td><td>' + esc(money(i.total_amount_toman)) + '</td><td>' + esc(money(paid)) + '</td><td><b>' + esc(money(i.issue_status === 'delivered' ? bal : 0)) + '</b></td><td>' + esc(status) + '</td><td>' + esc(jdate(i.delivery_date || i.issue_date)) + '</td><td>' + action + '</td></tr>';
    }).join('');
    mountPage(
      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))">' +
      '<div class="card"><span class="muted">کل هزینه وسایل دریافتی از هیئت</span><b style="display:block;font-size:20px">' + esc(money(receiptsTotal)) + '</b></div>' +
      '<div class="card"><span class="muted">پرداخت به هیئت</span><b style="display:block;font-size:20px">' + esc(money(committeePaid)) + '</b></div>' +
      '<div class="card"><span class="muted">بدهی مجموعه به هیئت</span><b style="display:block;font-size:20px;color:#b42318">' + esc(money(committeeDebt)) + '</b></div>' +
      '<div class="card"><span class="muted">بدهی خدام بابت اقلام تحویل‌شده</span><b style="display:block;font-size:20px;color:#b42318">' + esc(money(deliveredDebt)) + '</b></div></div>' +
      '<div class="card section"><h3>۱. ثبت دریافت وسایل از هیئت</h3><p class="muted">قیمت در هر رسید جداگانه ثبت می‌شود؛ تغییر قیمت جدید سوابق قبلی را تغییر نمی‌دهد.</p>' +
      '<form id="eqReceiptForm"><div class="form-grid"><div class="field"><label>تاریخ دریافت (شمسی)</label><input id="eqRDate" data-jalali-date placeholder="۱۴۰۵/۰۷/۲۱"></div><div class="field"><label>شماره رسید هیئت</label><input id="eqRRef" placeholder="اختیاری"></div>' +
      '<div class="field"><label>تعداد جلیقه</label><input id="eqRQty_vest" type="number" min="0" step="1" value="0"></div><div class="field"><label>قیمت واحد جلیقه (تومان)</label><input id="eqRPrice_vest" type="number" min="0" step="1" value="0"></div>' +
      '<div class="field"><label>تعداد کلاه سفید</label><input id="eqRQty_white_cap" type="number" min="0" step="1" value="0"></div><div class="field"><label>قیمت واحد کلاه سفید (تومان)</label><input id="eqRPrice_white_cap" type="number" min="0" step="1" value="0"></div>' +
      '<div class="field"><label>تعداد کلاه کرم</label><input id="eqRQty_cream_cap" type="number" min="0" step="1" value="0"></div><div class="field"><label>قیمت واحد کلاه کرم (تومان)</label><input id="eqRPrice_cream_cap" type="number" min="0" step="1" value="0"></div>' +
      '<div class="field"><label>تعداد ریشه (پر)</label><input id="eqRQty_fringe" type="number" min="0" step="1" value="0"></div><div class="field"><label>قیمت واحد ریشه (پر) (تومان)</label><input id="eqRPrice_fringe" type="number" min="0" step="1" value="0"></div>' +
      '<div class="field"><label>پرداخت به هیئت در همین نوبت (تومان)</label><input id="eqRPay" type="number" min="0" step="1" value="0"></div><div class="field"><label>جمع هزینه اقلام این رسید</label><b id="eqRTotal">۰ تومان</b></div><div class="field full"><label>توضیحات</label><textarea id="eqRNotes"></textarea></div></div><button class="btn primary" type="submit">ثبت رسید و همه اقلام</button><span id="eqRMsg" class="muted"></span></form></div>' +
      '<div class="card section"><h3>۲. ثبت تحویل وسیله به خادم</h3><p class="muted">قیمت هر بار تحویل جداگانه ثبت می‌شود. اگر وسیله تحویل شود و پول پرداخت نشود، بدهی در پرونده خادم باقی می‌ماند.</p>' +
      '<form id="eqIssueForm"><div class="form-grid"><div class="field"><label>خادم</label><select id="eqKhadem" required><option value="">انتخاب خادم…</option>' + khademOptions + '</select></div><div class="field"><label>قلم</label><select id="eqItem"><option value="vest">جلیقه</option><option value="white_cap">کلاه سفید</option><option value="cream_cap">کلاه کرم</option><option value="fringe">ریشه (پر)</option><option value="service_shirt">پیراهن خدمت (دوخت خیاط)</option></select></div><div class="field"><label>تعداد</label><input id="eqQty" type="number" min="1" value="1" required></div><div class="field"><label>قیمت واحد هنگام تحویل (تومان)</label><input id="eqPrice" type="number" min="0" step="1" required></div><div class="field"><label>وضعیت تحویل</label><select id="eqStatus"><option value="delivered">تحویل خادم شده</option><option value="pending">هنوز تحویل نشده</option></select></div><div class="field"><label>تاریخ ثبت/تحویل (شمسی)</label><input id="eqIDate" data-jalali-date placeholder="۱۴۰۵/۰۷/۲۱"></div><div class="field full" id="eqSourceWrap"><label>از کدام رسید موجودی تحویل می‌شود؟</label><select id="eqSource"><option value="">انتخاب رسید موجودی…</option>' + stockOptions + '</select><small class="muted">برای چهار قلم دریافتی از هیئت، رسید منبع انتخاب شود تا موجودی درست کم شود.</small></div><div class="field" id="eqTailorWrap" style="display:none"><label>نام خیاط</label><input id="eqTailor"></div><div class="field" id="eqSizeWrap" style="display:none"><label>اندازه پیراهن</label><input id="eqSize"></div><div class="field" id="eqOrderWrap" style="display:none"><label>تاریخ سفارش دوخت (شمسی)</label><input id="eqOrderDate" data-jalali-date placeholder="اختیاری"></div><div class="field full"><label>توضیحات</label><textarea id="eqINotes"></textarea></div></div><button class="btn primary" type="submit">ثبت تحویل / سفارش وسیله</button><span id="eqIMsg" class="muted"></span></form></div>' +
      '<div class="card section"><h3>۳. ثبت پرداخت خادم یا پرداخت مجموعه به هیئت</h3><p class="muted">پرداخت جزئی مجاز است؛ سامانه مانده را خودکار حساب می‌کند و تلاش می‌کند تراکنش را هم در دفتر مالی عمومی ثبت کند.</p>' +
      '<form id="eqPayForm"><div class="form-grid"><div class="field"><label>نوع پرداخت</label><select id="eqPayType"><option value="khadem">دریافت از خادم</option><option value="committee">پرداخت مجموعه به هیئت</option></select></div><div class="field full" id="eqPayIssueWrap"><label>قلم و پرونده خادم</label><select id="eqPayIssue">' + issueOptions + '</select></div><div class="field full" id="eqPayReceiptWrap" style="display:none"><label>رسید دریافت از هیئت</label><select id="eqPayReceipt">' + cache.receipts.map(r => '<option value="' + esc(r.id) + '">' + esc(jdate(r.received_date)) + ' · ' + esc(r.reference_no || 'بدون شماره') + ' · مانده ' + esc(money(Math.max(0,receiptTotal(r)-paidForReceipt(r.id)))) + '</option>').join('') + '</select></div><div class="field"><label>مبلغ پرداخت (تومان)</label><input id="eqPayAmount" type="number" min="1" step="1" required></div><div class="field"><label>تاریخ پرداخت (شمسی)</label><input id="eqPayDate" data-jalali-date placeholder="۱۴۰۵/۰۷/۲۱"></div><div class="field"><label>روش پرداخت</label><select id="eqPayMethod"><option value="cash">نقدی</option><option value="card">کارت‌به‌کارت / کارت</option><option value="bank">حواله بانکی</option><option value="other">سایر</option></select></div><div class="field"><label>شماره رسید / پیگیری</label><input id="eqPayRef"></div><div class="field full"><label>توضیحات</label><textarea id="eqPayNotes"></textarea></div></div><button class="btn primary" type="submit">ثبت پرداخت</button><span id="eqPMsg" class="muted"></span></form></div>' +
      '<div class="card section"><h3>موجودی وسایل مجموعه</h3><div style="overflow:auto"><table class="data-table"><thead><tr><th>قلم</th><th>دریافت از هیئت</th><th>تحویل‌شده به خدام</th><th>موجودی باقی‌مانده</th></tr></thead><tbody>' + stockRows + '</tbody></table></div></div>' +
      '<div class="card section"><h3>دفتر حساب مجموعه با هیئت</h3><div style="overflow:auto"><table class="data-table"><thead><tr><th>تاریخ</th><th>شماره رسید</th><th>اقلام و قیمت‌های همان نوبت</th><th>کل هزینه</th><th>پرداخت‌شده</th><th>بدهی مجموعه</th></tr></thead><tbody>' + (receiptRows || '<tr><td colspan="6">هنوز دریافتی از هیئت ثبت نشده است.</td></tr>') + '</tbody></table></div></div>' +
      '<div class="card section"><h3>پرونده تحویل و بدهی خدام</h3><div style="overflow:auto"><table class="data-table"><thead><tr><th>کد خادم</th><th>نام خادم</th><th>قلم</th><th>تعداد</th><th>قیمت واحد</th><th>هزینه کل</th><th>پرداخت خادم</th><th>بدهی خادم</th><th>وضعیت</th><th>تاریخ</th><th>عملیات</th></tr></thead><tbody>' + (issueRows || '<tr><td colspan="10">هنوز وسیله‌ای به خادم تحویل نشده است.</td></tr>') + '</tbody></table></div></div>' +
      '<div class="card section"><h3>خلاصه پرداخت خدام</h3><p>هزینه ثبت‌شده اقلام: <b>' + esc(money(issueCost)) + '</b> · پرداخت‌های ثبت‌شده: <b>' + esc(money(khademPaid)) + '</b></p><p class="muted">بدهی فقط برای اقلامی محاسبه می‌شود که وضعیت آن‌ها «تحویل خادم شده» باشد.</p></div>'
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
    $('eqPayType')?.addEventListener('change', () => {
      const committee = $('eqPayType').value === 'committee';
      $('eqPayIssueWrap').style.display = committee ? 'none' : '';
      $('eqPayReceiptWrap').style.display = committee ? '' : 'none';
    });
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
        setMsg(msg,ledgerWarnings.length?'رسید ذخیره شد، اما دفتر مالی عمومی به‌روزرسانی نشد: '+ledgerWarnings.join('؛ '):'رسید و همه اقلام این نوبت ثبت شد.');
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
        setMsg(msg,'سابقه ثبت شد؛ قیمت این نوبت مستقل است و پرداخت‌نشده به‌عنوان بدهی باقی می‌ماند.');
        $('eqIssueForm').reset(); $('eqQty').value='1'; await loadData(); renderPage();
      } catch(err) { setMsg(msg,'ثبت تحویل ناموفق بود: '+err.message,true); }
    });
    $('eqPayForm')?.addEventListener('submit', async e => {
      e.preventDefault();
      const msg='eqPMsg'; setMsg(msg,'در حال ثبت پرداخت…');
      const amount=num($('eqPayAmount').value), date=dateVal('eqPayDate'), method=$('eqPayMethod').value, ref=$('eqPayRef').value.trim()||null, notes=$('eqPayNotes').value.trim()||null;
      if (!amount || !date) { setMsg(msg,'مبلغ و تاریخ معتبر لازم است.',true); return; }
      try {
        if ($('eqPayType').value==='committee') {
          const receiptId=$('eqPayReceipt').value;
          if (!receiptId) { setMsg(msg,'رسید هیئت را انتخاب کنید.',true); return; }
          const rec=cache.receipts.find(r=>r.id===receiptId), balance=rec?Math.max(0,receiptTotal(rec)-paidForReceipt(rec.id)):0;
          if (amount>balance) { setMsg(msg,'مبلغ پرداخت از بدهی باقی‌مانده این رسید بیشتر است.',true); return; }
          var committeeResult = await bindLedgerPayment({table:'equipment_committee_payments',payload:{receipt_id:receiptId,amount_toman:amount,paid_date:date,payment_method:method,reference_no:ref,notes},transaction:{transaction_date:date,transaction_type:'expense',amount:amount*10,title:'پرداخت بدهی وسایل خدمت به هیئت',category:'وسایل خدمت',party:'هیئت',reference_no:ref,payment_method:method,status:'posted',description:notes||'پرداخت ثبت‌شده در بخش وسایل خدمت'}});
          if (committeeResult.ledgerWarning) setMsg(msg,'پرداخت ثبت شد، اما دفتر مالی عمومی به‌روزرسانی نشد: '+committeeResult.ledgerWarning,true);
        } else {
          const issueId=$('eqPayIssue').value, issue=cache.issues.find(i=>i.id===issueId);
          if (!issue) { setMsg(msg,'قلم و پرونده خادم را انتخاب کنید.',true); return; }
          const balance=issueBalance(issue);
          if (amount>balance) { setMsg(msg,'مبلغ پرداخت از مانده این قلم بیشتر است.',true); return; }
          const k=issueKhadem(issue);
          var khademResult = await bindLedgerPayment({table:'khadem_equipment_payments',payload:{issue_id:issueId,amount_toman:amount,paid_date:date,payment_method:method,reference_no:ref,notes},transaction:{transaction_date:date,transaction_type:'income',amount:amount*10,title:'دریافت بابت '+label(issue.item_key),category:'وسایل خدمت',party:k.full_name||'خادم',khadem_id:k.id,khadem_code:k.khadem_code,khadem_name:k.full_name,reference_no:ref,payment_method:method,status:'posted',description:notes||'دریافت ثبت‌شده در پرونده مالی خادم'}});
          if (khademResult.ledgerWarning) setMsg(msg,'پرداخت خادم ثبت شد، اما دفتر مالی عمومی به‌روزرسانی نشد: '+khademResult.ledgerWarning,true);
        }
        setMsg(msg,'پرداخت ثبت شد و مانده بدهی دوباره محاسبه می‌شود.');
        $('eqPayForm').reset(); await loadData(); renderPage();
      } catch(err) { setMsg(msg,'ثبت پرداخت ناموفق بود: '+err.message,true); }
    });
  }
  async function equipmentPage() {
    mountPage('<div class="card"><div class="notice">در حال دریافت اطلاعات وسایل و حساب‌های مالی…</div></div>');
    try { await loadData(); renderPage(); }
    catch (e) { mountPage(notice('دریافت اطلاعات ناموفق بود: ' + e.message + ' — مجوز finance.manage و اتصال شبکه را بررسی کنید.', true)); }
  }
  addMenu();
  const oldRender = window.render;
  if (typeof oldRender === 'function') {
    window.render = function (page) {
      if (page === 'finance:equipment') { window.khademCurrentPage = page; equipmentPage(); return; }
      return oldRender.apply(this, arguments);
    };
  }
})();