import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const reply = (status: number, data: Record<string, unknown>) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "فقط درخواست POST مجاز است." });

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !service) return reply(500, { error: "تنظیمات امن سرور کامل نیست." });

  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return reply(401, { error: "ابتدا با حساب مدیر اصلی وارد شوید." });

  const auth = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const db = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: who, error: whoError } = await auth.auth.getUser(token);
  if (whoError || !who.user) return reply(401, { error: "نشست معتبر نیست؛ دوباره وارد شوید." });

  const { data: manager, error: managerError } = await db
    .from("profiles").select("role,is_active").eq("id", who.user.id).maybeSingle();
  if (managerError) return reply(500, { error: "بررسی مجوز مدیر ناموفق بود." });
  if (manager?.role !== "admin" || manager?.is_active !== true) {
    return reply(403, { error: "فقط مدیر اصلی فعال اجازه ساخت حساب دارد." });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return reply(400, { error: "اطلاعات ارسالی معتبر نیست." }); }
  const email = String(body.email || "").trim().toLowerCase();
  const fullName = String(body.full_name || "").trim();
  const phone = String(body.phone || "").trim();
  const password = String(body.password || "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(400, { error: "ایمیل معتبر وارد کنید." });
  if (!fullName) return reply(400, { error: "نام کامل کاربر الزامی است." });
  if (password.length < 8) return reply(400, { error: "رمز اولیه باید دست‌کم ۸ نویسه داشته باشد." });

  const { data: created, error: createError } = await db.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name: fullName, created_by_admin: who.user.id },
  });
  if (createError || !created.user) {
    const duplicate = /already|registered|exists/i.test(createError?.message || "");
    return reply(duplicate ? 409 : 400, {
      error: duplicate
        ? "برای این ایمیل حساب احراز هویت وجود دارد؛ حساب تکراری ساخته نشد."
        : "ساخت حساب ناموفق بود: " + (createError?.message || "خطای نامشخص"),
    });
  }

  const id = created.user.id;
  const { error: profileError } = await db.from("profiles").upsert({
    id, email, full_name: fullName, display_name: fullName,
    phone: phone || null, role: "user", is_active: true,
  }, { onConflict: "id" });
  if (profileError) return reply(500, {
    created: true, user_id: id,
    error: "حساب ساخته شد اما نمایه ثبت نشد؛ حساب را حذف نکنید و نمایه را بررسی کنید.",
  });

  const { error: requestError } = await db.from("registration_requests").upsert({
    user_id: id, email, full_name: fullName, phone: phone || null,
    status: "approved", requested_role: "user",
    approved_by: who.user.id, approved_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (requestError) return reply(500, {
    created: true, user_id: id,
    error: "حساب و نمایه ساخته شد اما ثبت تأیید کامل نشد؛ وضعیت درخواست را بررسی کنید.",
  });

  return reply(201, {
    ok: true, user_id: id, email,
    message: "حساب ساخته و فعال شد؛ کاربر می‌تواند با ایمیل و رمز اولیه وارد شود و سپس رمز را تغییر دهد.",
  });
});
