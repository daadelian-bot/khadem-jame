# وضعیت انتقال و بازسازی مهاجرت‌ها — ۲۰۲۶-۱۰-۱۳

## پروژهٔ قدیمی
در تاریخچهٔ Supabase پروژهٔ قدیمی `fxxtyfurdzpzfvweoppo` این ۱۴ نسخه ثبت شده‌اند:
- `20261011125057_admin_managed_role_and_user_permissions`
- `20261011125324_separate_khadem_view_create_update_deactivate_permissions`
- `20261011125947_enforce_admin_managed_permissions_profiles_and_khadems`
- `20261011143622_secure_sensitive_views_and_rpc_permissions`
- `20261011184956_add_presence_private_chat_and_profile_display_fields`
- `20261011200243_admin_account_access_controls_and_global_rls_gate`
- `20261011200436_grant_presence_and_add_chat_directory`
- `20261011200839_secure_chat_directory_view_with_invoker_rls`
- `20261011200925_limit_presence_read_to_authorized_managers`
- `20261011215606_require_admin_approval_and_attendance_fields`
- `20261011215933_lock_registration_requests_to_pending_self_insert`
- `20261011215951_secure_registration_admin_policies`
- `20261011220036_harden_new_user_trigger_search_path`
- `20261011223438_phone_auth_signup_request`

فایل اصلیِ SQL این ۱۴ مهاجرت در مخزن موجود نبود؛ فقط فایل امنیتی نسخهٔ `20261011143622` پیدا شد. نسخهٔ موجود در ریشهٔ مخزن در مسیر `supabase/legacy-migrations/20261011143622_secure_sensitive_views_and_rpc_permissions.sql` بایگانی شده است. این مسیر بایگانی است، نه پوشهٔ مهاجرت قابل اجرای خودکار. متن دقیق ۱۳ فایل دیگر قابل بازیابی نبود و در این گزارش به‌عنوان فایل اصلی جا زده نشده‌اند.

## پروژهٔ جدید `khadem-jame-next`
مهاجرت‌های ثبت‌شده در پایگاه جدید در حال حاضر:
- `20261012224753_create_khadem_jame_v139_core_schema`
- `20261012224843_align_v139_finance_and_receipt_schema`
- `20261012224918_harden_profile_role_updates`
- `20261012225221_v139_compatibility_columns_for_service_requests_and_account_controls`
- `20261012225300_index_foreign_keys_v139_query_paths`
- `20261012225537_enforce_global_account_suspension_in_rls`
- `20261012225653_link_service_records_to_shrine_sites`
- `20261013000716_v141_index_compatibility_columns_for_vehicles_and_chat`
- `20261013000924_v141_add_missing_application_module_tables`
- `20261013001846_restore_legacy_compatibility_settings_and_summary_views`

دو مهاجرت سازگاری و یک مهاجرت بازسازی سازگاری در پروژهٔ جدید اجرا شده‌اند. فایل‌های قابل بازیابی/ثبت‌شده در `supabase/migrations/` هستند. فایل `20261013000000_rebuild_schema_baseline.sql` یک snapshot ساختار فعلی است، نه مهاجرتی که روی پایگاه جدید اجرا شده باشد.

## نکات مهم
- پروژهٔ قدیمی و داده‌های واقعی آن دست‌نخورده‌اند؛ هیچ داده‌ای به پروژهٔ جدید کپی نشده است.
- جدول پشتیبان `khadems_backup_before_code_migration` عمداً به پروژهٔ جدید کپی نشده، چون ممکن است شامل دادهٔ تاریخی/شخصی پروژهٔ قدیمی باشد.
- مهاجرت‌های قدیمی را کورکورانه روی پروژهٔ جدید اجرا نکنید؛ ترتیب و ساختار هر دو پروژه متفاوت است.
- baseline شامل ساختار فعلی جدول‌ها، قیود، ایندکس‌ها، توابع، تریگرها، RLS، سیاست‌ها، مجوزها و نماهای عمومی است، ولی داده‌های جدول‌ها، کاربران Auth و فایل‌های Storage را منتقل نمی‌کند.
