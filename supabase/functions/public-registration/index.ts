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
  const url = Deno.env.get("SUPABASE_URL"), service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !service) return reply(500, { error: "تنظیمات امن سرور کامل نیست." });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return reply(400, { error: "اطلاعات ارسالی معتبر نیست." }); }
  const email = String(body.email || "").trim().toLowerCase();
  const fullName = String(body.full_name || "").trim();
  const password = String(body.password || "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(400, { error: "ایمیل معتبر وارد کنید." });
  if (!fullName || fullName.length > 120) return reply(400, { error: "نام و نام خانوادگی معتبر وارد کنید." });
  if (password.length < 8 || password.length > 128) return reply(400, { error: "رمز عبور باید بین ۸ تا ۱۲۸ نویسه باشد." });
  const adminDb = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: created, error: createError } = await adminDb.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name: fullName, display_name: fullName, registration_status: "pending_approval" },
  });
  if (createError || !created.user) {
    const msg = createError?.message || "";
    const duplicate = /already|registered|exists/i.test(msg);
    return reply(duplicate ? 409 : 400, { error: duplicate ? "برای این ایمیل حسابی وجود دارد؛ با همان حساب وارد شوید یا با مدیر تماس بگیرید." : "ایجاد درخواست حساب ناموفق بود: " + (msg || "خطای نامشخص") });
  }
  const id = created.user.id;
  const { error: profileError } = await adminDb.from("profiles").upsert({
    id, email, full_name: fullName, display_name: fullName, role: "user", is_active: false,
  }, { onConflict: "id" });
  if (profileError) {
    console.error("public-registration profile upsert failed", profileError.message);
    return reply(500, { created: true, user_id: id, error: "حساب ساخته شد اما ثبت نمایه کامل نشد؛ با مدیر اصلی تماس بگیرید و دوباره ثبت‌نام نکنید." });
  }
  const { error: requestError } = await adminDb.from("registration_requests").upsert({
    user_id: id, email, full_name: fullName, status: "pending", requested_role: "user",
  }, { onConflict: "user_id" });
  if (requestError) {
    console.error("public-registration request upsert failed", requestError.message);
    return reply(500, { created: true, user_id: id, error: "حساب ساخته شد اما درخواست تأیید ثبت نشد؛ با مدیر اصلی تماس بگیرید و دوباره ثبت‌نام نکنید." });
  }
  return reply(201, { ok: true, message: "درخواست ثبت شد و پس از تأیید مدیر اصلی می‌توانید وارد سامانه شوید." });
});
