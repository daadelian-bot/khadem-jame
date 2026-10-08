// تنظیمات اتصال به Supabase (نسخه جدید با Publishable Key)
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_HA3Z2cmNMddMTmpFoLmerA_k-YtEId7';

let supabaseClient = null;

if (window.supabase && SUPABASE_URL.startsWith('https://')) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    document.getElementById('connection-status').innerText = 'اتصال موفق به پایگاه داده Supabase برقرار شد.';
} else {
    document.getElementById('connection-status').innerText = 'لطفاً آدرس صحیح Supabase URL را در فایل app.js وارد کنید.';
}
