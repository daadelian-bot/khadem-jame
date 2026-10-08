// تنظیمات اتصال به Supabase
const SUPABASE_URL = 'https://Fxxtyfurdzpzfvweoppo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_HA3Z2cmNMddMTmpFoLmerA_k-YtEId7';

let supabaseClient = null;

if (window.supabase && SUPABASE_URL.startsWith('https://')) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    document.getElementById('connection-status').innerText = 'اتصال موفق به پایگاه داده Supabase برقرار شد.';
    loadKhademin();
} else {
    document.getElementById('connection-status').innerText = 'خطا در تنظیمات اتصال.';
}

// تابع خواندن لیست خادمین با جزئیات کامل
async function loadKhademin() {
    const listContainer = document.getElementById('khadem-list');
    if (!supabaseClient) return;

    const { data, error } = await supabaseClient
        .from('khademin')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        listContainer.innerHTML = 'خطا در بارگذاری اطلاعات از پایگاه داده.';
        console.error(error);
        return;
    }

    if (!data || data.length === 0) {
        listContainer.innerHTML = 'هنوز هیچ خادمی ثبت نشده است.';
        return;
    }

    let html = '<ul style="padding:0; list-style:none;">';
    data.forEach(item => {
        html += `<li style="padding: 10px; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong>${item.name}</strong><br>
                <small style="color: #6c757d;">تلفن: ${item.phone || 'ندارد'} | بخش: ${item.section || 'عمومی'}</small>
            </div>
        </li>`;
    });
    html += '</ul>';
    listContainer.innerHTML = html;
}

// ثبت خادم جدید با جزئیات کامل
document.getElementById('khadem-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!supabaseClient) return;

    const name = document.getElementById('khadem-name').value.trim();
    const phone = document.getElementById('khadem-phone').value.trim();
    const section = document.getElementById('khadem-section')?.value || 'عمومی';

    if (!name) return;

    const { error } = await supabaseClient
        .from('khademin')
        .insert([{ name, phone, section }]);

    if (error) {
        alert('خطا در ثبت اطلاعات: ' + error.message);
    } else {
        alert('خادم جدید با موفقیت ثبت شد.');
        document.getElementById('khadem-form').reset();
        loadKhademin();
    }
});
