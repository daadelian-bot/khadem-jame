// تنظیمات اتصال به Supabase (تکمیل‌شده بر اساس اطلاعات پروژه شما)
const SUPABASE_URL = 'https://daadelian-bot.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_HA3Z2cmNMddMTmpFoLmerA_k-YtEId7';

let supabaseClient = null;

if (window.supabase && SUPABASE_URL.startsWith('https://')) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    document.getElementById('connection-status').innerText = 'اتصال موفق به پایگاه داده Supabase برقرار شد.';
    loadKhademin();
} else {
    document.getElementById('connection-status').innerText = 'لطفاً آدرس صحیح Supabase URL را در فایل app.js وارد کنید.';
}

// تابع خواندن لیست خادمین از جدول پایگاه داده
async function loadKhademin() {
    const listContainer = document.getElementById('khadem-list');
    
    if (!supabaseClient) return;

    const { data, error } = await supabaseClient
        .from('khademin')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        listContainer.innerHTML = 'خطا در بارگذاری اطلاعات (جدول ممکن است هنوز ایجاد نشده باشد).';
        console.error(error);
        return;
    }

    if (!data || data.length === 0) {
        listContainer.innerHTML = 'هنوز هیچ خادمی ثبت نشده است.';
        return;
    }

    let html = '<ul>';
    data.forEach(item => {
        html += `<li><span>${item.name}</span><span style="color: #6c757d; font-size: 0.85rem;">${item.phone || 'بدون شماره'}</span></li>`;
    });
    html += '</ul>';
    listContainer.innerHTML = html;
}

// ثبت خادم جدید در پایگاه داده
document.getElementById('khadem-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!supabaseClient) {
        alert('پایگاه داده متصل نیست.');
        return;
    }

    const name = document.getElementById('khadem-name').value.trim();
    const phone = document.getElementById('khadem-phone').value.trim();

    if (!name) return;

    const { error } = await supabaseClient
        .from('khademin')
        .insert([{ name, phone }]);

    if (error) {
        alert('خطا در ثبت اطلاعات: ' + error.message);
    } else {
        alert('خادم جدید با موفقیت ثبت شد.');
        document.getElementById('khadem-form').reset();
        loadKhademin();
    }
});
