(function () {
  'use strict';

  /* =========================
     Supabase Configuration
  ========================= */

  const SUPABASE_URL =
    'https://fxxtyfurdzpfzvweoppo.supabase.co';

  const SUPABASE_KEY =
    'sb_publishable_HA3Z2cmNMddMTmpFoLmerA_k-YtEId7';

  let sb = null;

  /* =========================
     Application State
  ========================= */

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

  /* =========================
     Menu
  ========================= */

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

  /* =========================
     Helpers
  ========================= */

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
      return new Intl.DateTimeFormat(
        'fa-IR-u-ca-persian',
        {
          year: 'numeric',
          month: '2-digit',
          day: '
