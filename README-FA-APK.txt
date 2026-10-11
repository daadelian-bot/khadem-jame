سامانه جامع خادمین — بسته راه‌اندازی ساخت APK

این بسته شامل یک فایل GitHub Actions است که در GitHub Actions یک APK آزمایشی (debug-signed) می‌سازد و به‌صورت Artifact قابل دریافت می‌کند.
APK خروجی به‌تنهایی برنامه آفلاین کامل نیست؛ رابط فعلی از index.html زمان build داخل APK قرار می‌گیرد، اما ورود و اطلاعات واقعی به اینترنت و Supabase نیاز دارند.

مراحل از گوشی Android:
1) فایل ZIP را دانلود و باز کنید.
2) در مخزن https://github.com/daadelian-bot/khadem-jame روی Add file > Create new file بزنید.
3) نام فایل را دقیقاً این بگذارید:
   .github/workflows/build-android-apk.yml
4) محتوای فایل هم‌نام داخل ZIP را کامل کپی کنید و Commit changes بزنید.
5) به تب Actions بروید و workflow با نام Build Android APK را باز کنید.
6) آخرین اجرای سبز را باز کنید؛ از بخش Artifacts، فایل Samane-Jame-Khademin-APK-... را دریافت کنید.
7) ZIP آرتیفکت را باز کنید و APK را نصب کنید. ممکن است Android اجازه نصب از منبع ناشناس را درخواست کند.

اگر Actions غیرفعال باشد، باید از Settings > Actions اجازه اجرای workflow داده شود.

محدودیت دسترسی: در این نوبت اتصال GitHub اجازه ایجاد branch یا commit از طریق ابزار را نداد (403 Resource not accessible by integration)، بنابراین workflow را نمی‌توانم از طرف خودم در مخزن منتشر کنم. این بسته آماده است تا فایل workflow اضافه شود.

امنیت و انتشار:
- این خروجی نسخه آزمایشی است؛ APK debug برای انتشار Google Play نهایی نیست.
- هرگز Supabase service_role key یا رمز/کلید امضای خصوصی را در مخزن یا HTML قرار ندهید.
- پیش از استفاده واقعی، آزمون حساب‌های کاربری و مجوزها الزامی است.
- APK هر بار از index.html موجود در شاخه main در زمان اجرای workflow ساخته می‌شود.
