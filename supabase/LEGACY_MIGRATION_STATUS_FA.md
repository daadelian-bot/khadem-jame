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

فایل اصلی SQL این ۱۴ مهاجرت در مخزن موجود نبود؛ فقط فایل امنیتی نسخهٔ `20261011143622` پیدا شد. نسخهٔ موجود در ریشهٔ مخزن در مسیر `supabase/legacy-migrations/20261011143622_secure_sensitive_views_and_rpc_permissions.sql` بایگانی شده است. این مسیر بایگانی است، نه پوشهٔ مهاجرت قابل اجرای خودکار. متن دقیق ۱۳ فایل دیگر قابل بازیابی نبود و در این گزارش به‌عنوان فایل اصلی جا زده نشده‌اند.

## پروژهٔ جدید `khadem-jame-next`
تاریخچهٔ پایگاه جدید در آخرین بررسی ۱۲ مهاجرت ثبت کرده است:
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
- `20261013002225_add_remaining_legacy_compatibility_columns`
- `20261013002305_align_remaining_legacy_column_types_and_foreign_keys`

فایل `supabase/migrations/20261013000000_rebuild_schema_baseline.sql` یک snapshot بازسازی از ساختار فعلی است؛ این فایل در پایگاه زنده اجرا نشده است. مهاجرت‌های تازهٔ سازگاری در پروژهٔ جدید اجرا شده‌اند و فایل‌هایشان در `supabase/migrations/` نگهداری می‌شود.

## نتیجهٔ مقایسه
- پروژهٔ جدید ۳۹ جدول عمومی و ۷ نمای عمومی دارد.
- همهٔ ۳۹ جدول عمومی RLS فعال دارند.
- مقایسهٔ زندهٔ ستون‌ها، نوع داده و کلیدهای خارجی میان دو پروژه برای ۳۹ جدول قابل مقایسه، مورد مفقودی گزارش نکرد.
- جدول پشتیبان قدیمی `khadems_backup_before_code_migration` عمداً منتقل نشده؛ ممکن است حاوی اطلاعات تاریخی/شخصی پروژهٔ قدیمی باشد.
- پروژهٔ قدیمی و داده‌های واقعی آن دست‌نخورده‌اند. داده‌های خادمین و مالی به پروژهٔ جدید کپی نشده‌اند؛ فقط یک پروفایل مدیر در پروژهٔ جدید وجود دارد.

## احراز هویت
راهنمای تنظیم بازیابی رمز مدیر اصلی در `supabase/AUTH_RECOVERY_SETUP_FA.md` ثبت شده است. فایل HTML آزمایشی `index-auth-recovery-v143.html` هنوز به GitHub Pages منتشر نشده. تنظیمات Redirect URLs، Site URL و SMTP باید در داشبورد Supabase بررسی شوند؛ ارسال ایمیل واقعی در این جلسه آزمایش نشده است.
