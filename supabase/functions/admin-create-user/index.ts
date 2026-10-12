import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json; charset=utf-8" } });
}
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "فقط درخواست POST مجاز است." });
  const url = Deno.env.get("SUPABASE_URL"), anon = Deno.env.get("SUPABASE_ANON_KEY"), service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !service) return reply(500, { error: "تنظیمات امن سرور کامل نیست." });
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return reply(401, { error: "ابتدا با حساب مدیر وارد شوید." });
  const auth = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const adminDb = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await auth.auth.getUser(token);
  if (authError || !authData.user) return reply(401, { error: "نشست معتبر نیست؛ دوباره وارد شوید." });
  const { data: manager, error: managerError } = await adminDb.from("profiles").select("role,is_active").eq("id", authData.user.id).maybeSingle();
  if (managerError) return reply(500, { error: "بررسی دسترسی مدیر ناموفق بود." });
  if (manager?.role !== "admin" || manager?.is_active !== true) return reply(403, { error: "فقط مدیر اصلی فعال اجازه ساخت حساب دارد." });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return reply(400, { error: "اطلاعات ارسالی معتبر نیست." }); }
  const email = String(body.email || "").trim().toLowerCase(), fullName = String(body.full_name || "").trim(), phone = String(body.phone || "").trim(), role = String(body.role || "user");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(400, { error: "ایمیل معتبر وارد کنید." });
  if (!fullName) return reply(400, { error: "نام کامل الزامی است." });
  if (role !== "user" && role !== "manager") return reply(400, { error: "نقش باید کاربر یا مدیر باشد." });
  const { data: invited, error: inviteError } = await adminDb.auth.admin.inviteUserByEmail(email, {
    redirectTo: "https://daadelian-bot.github.io/khadem-jame/set-password.html",
    data: { full_name: fullName, display_name: fullName, created_by_admin: authData.user.id, requested_role: role },
  });
  if (inviteError || !invited.user) {
    const msg = inviteError?.message || "", duplicate = /already|registered|exists/i.test(msg);
    return reply(duplicate ? 409 : 400, { error: duplicate ? "برای این ایمیل قبلاً حساب ساخته شده است؛ حساب تکراری ایجاد نشد." : "ارسال دعوت‌نامه ناموفق بود: " + (msg || "خطای نامشخص") });
  }
  const id = invited.user.id;
  const { error: profileError } = await adminDb.from("profiles").upsert({ id, email, full_name: fullName, display_name: fullName, phone: phone || null, role, is_active: true }, { onConflict: "id" });
  if (profileError) return reply(500, { created: true, user_id: id, error: "دعوت‌نامه ارسال شد اما نمایه ثبت نشد؛ حساب را حذف نکنید و نمایه را بررسی کنید." });
  const { error: requestError } = await adminDb.from("registration_requests").upsert({ user_id: id, email, full_name: fullName, phone: phone || null, status: "approved", requested_role: role, approved_by: authData.user.id, approved_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (requestError) return reply(500, { created: true, user_id: id, error: "دعوت‌نامه و نمایه ثبت شد اما ثبت درخواست کامل نشد؛ وضعیت درخواست را بررسی کنید." });
  return reply(201, { ok: true, user_id: id, email, role, message: "حساب ساخته شد و پیوند دعوت/تأیید ایمیل ارسال شد. کاربر باید پیوند را باز کند، رمز شخصی بسازد و سپس وارد شود." });
});