# گزارش بازسازی ساختار پایگاه داده

شاخه آماده‌سازی: `rebuild/schema-migrations-20261013`

## فایل‌های اصلی
- [Baseline بازسازی](https://github.com/daadelian-bot/khadem-jame/blob/rebuild/schema-migrations-20261013/supabase/migrations/20261013000000_rebuild_schema_baseline.sql) — snapshot به‌روز از ساختار زنده؛ شامل جدول‌ها، قیود، توابع، تریگرها، RLS، سیاست‌ها، مجوزها و نماها. روی پروژه زنده اجرا نشده و برای پایگاه تازه است.
- [مهاجرت سازگاری خودرو/پیام](https://github.com/daadelian-bot/khadem-jame/blob/rebuild/schema-migrations-20261013/supabase/migrations/20261013000716_v141_index_compatibility_columns_for_vehicles_and_chat.sql)
- [مهاجرت جدول‌های ماژول‌های نسخه ۱۴۱](https://github.com/daadelian-bot/khadem-jame/blob/rebuild/schema-migrations-20261013/supabase/migrations/20261013000924_v141_add_missing_application_module_tables.sql)
- [بازیابی تنظیمات و نماهای سازگاری](https://github.com/daadelian-bot/khadem-jame/blob/rebuild/schema-migrations-20261013/supabase/migrations/20261013001846_restore_legacy_compatibility_settings_and_summary_views.sql)
- [تکمیل ستون‌های سازگاری باقی‌مانده](https://github.com/daadelian-bot/khadem-jame/blob/rebuild/schema-migrations-20261013/supabase/migrations/20261013002225_add_remaining_legacy_compatibility_columns.sql)
- [تطبیق نوع ستون و کلیدهای خارجی باقی‌مانده](https://github.com/daadelian-bot/khadem-jame/blob/rebuild/schema-migrations-20261013/supabase/migrations/20261013002305_align_remaining_legacy_column_types_and_foreign_keys.sql)
- [راهنمای بازیابی رمز مدیر اصلی](https://github.com/daadelian-bot/khadem-jame/blob/rebuild/schema-migrations-20261013/supabase/AUTH_RECOVERY_SETUP_FA.md)
- [وضعیت مهاجرت‌های قدیمی](https://github.com/daadelian-bot/khadem-jame/blob/rebuild/schema-migrations-20261013/supabase/LEGACY_MIGRATION_STATUS_FA.md)

## نتیجهٔ بررسی ساختار
- پروژهٔ جدید `khadem-jame-next` اکنون ۳۹ جدول عمومی دارد و ۷ نمای سازگاری دارد.
- همهٔ ۳۹ جدول عمومی RLS فعال دارند.
- مقایسهٔ زندهٔ ستون‌ها، نوع داده و کلیدهای خارجی میان پروژه قدیمی و جدید، برای ۳۹ جدول قابل مقایسه، دیگر مورد مفقودی گزارش نکرد؛ تنها جدول backup قدیمی عمداً به پروژهٔ جدید منتقل نشده است.
- پروژهٔ جدید فقط یک پروفایل مدیر دارد؛ اطلاعات واقعی خادمین/مالی از پروژهٔ قدیمی کپی نشده‌اند.
- پروژهٔ قدیمی و داده‌های واقعی آن دست‌نخورده مانده‌اند.

## مهاجرت‌های قدیمی
تاریخچهٔ قدیمی ۱۴ نسخه را ثبت کرده، اما متن اصلی فقط یک فایل SQL در مخزن پیدا شد. آن فایل در `supabase/legacy-migrations/` بایگانی شده است. متن دقیق ۱۳ فایل دیگر قابل بازیابی نبود؛ برای آن‌ها فایل ساختگی به‌عنوان نسخهٔ اصلی تولید نشده است. جزئیات در گزارش وضعیت مهاجرت‌های قدیمی آمده است.

## احراز هویت
- فایل آزمایشی `index-auth-recovery-v143.html` به‌صورت محلی ساخته شده و ۳۵ بلوک JavaScript آن از نظر نحوی بررسی شده‌اند.
- فایل به پروژهٔ جدید `khadem-jame-next` متصل شده است، اما هنوز در GitHub Pages منتشر نشده.
- مسیر بازیابی ایمیلی در فایل ساخته شده؛ ارسال واقعی ایمیل هنوز از داخل این جلسه آزمایش نشده است.
- تنظیمات Redirect URLs، Site URL و SMTP باید در داشبورد Supabase کنترل شوند؛ این تنظیمات از ابزارهای در دسترس قابل تغییر نبودند.
- Security Advisor هنوز خاموش بودن محافظت در برابر رمزهای افشاشده را گزارش می‌کند؛ باید از تنظیمات Authentication فعال شود.
