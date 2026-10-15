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
  if (!token) return reply(401, { error: "ابتدا با حساب مدیر اصلی وارد شوید." });
  const auth = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const adminDb = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await auth.auth.getUser(token);
  if (authError || !authData.user) return reply(401, { error: "نشست معتبر نیست؛ دوباره وارد شوید." });
  const { data: manager, error: managerError } = await adminDb.from("profiles").select("role,is_active").eq("id", authData.user.id).maybeSingle();
  if (managerError) return reply(500, { error: "بررسی دسترسی مدیر ناموفق بود." });
  if (manager?.role !== "admin" || manager?.is_active !== true) return reply(403, { error: "فقط مدیر اصلی فعال اجازه بررسی درخواست‌ها را دارد." });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return reply(400, { error: "اطلاعات ارسالی معتبر نیست." }); }
  const action = String(body.action || "");
  if (action === "list") {
    const { data, error } = await adminDb.from("registration_requests").select("user_id,email,full_name,phone,status,requested_role,created_at").eq("status","pending").order("created_at",{ascending:true}).limit(100);
    if (error) return reply(500, { error: "دریافت درخواست‌ها ناموفق بود." });
    return reply(200, { requests: data || [] });
  }
  if (action === "list_users") {
    const { data, error } = await adminDb.from("profiles").select("id,email,full_name,display_name,role,is_active").order("full_name",{ascending:true}).limit(300);
    if (error) return reply(500, { error: "دریافت فهرست کاربران ناموفق بود." });
    return reply(200, { users: data || [] });
  }
  if (action === "set_role") {
    const userId = String(body.user_id || "");
    const role = String(body.role || "");
    if (!/^[0-9a-f-]{36}$/i.test(userId)) return reply(400, { error: "شناسه کاربر معتبر نیست." });
    if (role !== "user" && role !== "manager") return reply(400, { error: "نقش باید کاربر یا مدیر باشد؛ تغییر نقش مدیر اصلی از این بخش مجاز نیست." });
    const { data: target, error: targetError } = await adminDb.from("profiles").select("id,role").eq("id", userId).maybeSingle();
    if (targetError) return reply(500, { error: "بررسی حساب هدف ناموفق بود." });
    if (!target) return reply(404, { error: "حساب کاربر پیدا نشد." });
    if (target.role === "admin") return reply(403, { error: "نقش مدیر اصلی از این بخش قابل تغییر نیست." });
    const { data: updated, error: updateError } = await adminDb.from("profiles").update({ role }).eq("id", userId).neq("role", "admin").select("id,role").maybeSingle();
    if (updateError) return reply(500, { error: "ذخیره نقش کاربر ناموفق بود." });
    if (!updated) return reply(409, { error: "نقش کاربر تغییر نکرد؛ صفحه را تازه‌سازی کنید." });
    return reply(200, { ok: true, user_id: userId, role, message: "نقش کاربر به‌روزرسانی شد." });
  }
  if (action !== "approve" && action !== "reject") return reply(400, { error: "عملیات پشتیبانی نمی‌شود." });
  const userId = String(body.user_id || "");
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return reply(400, { error: "شناسه درخواست معتبر نیست." });
  const requestedRole = String(body.role || "user");
  if (action === "approve" && requestedRole !== "user" && requestedRole !== "manager") return reply(400, { error: "نقش باید کاربر یا مدیر باشد." });
  const { data: requestRow, error: requestLookupError } = await adminDb.from("registration_requests").select("user_id,status").eq("user_id",userId).maybeSingle();
  if (requestLookupError) return reply(500, { error: "بررسی درخواست ناموفق بود." });
  if (!requestRow || requestRow.status !== "pending") return reply(409, { error: "درخواست پیدا نشد یا قبلاً بررسی شده است." });
  const now = new Date().toISOString();
  const nextStatus = action === "approve" ? "approved" : "rejected";
  const { error: updateRequestError } = await adminDb.from("registration_requests").update({ status: nextStatus, approved_by: authData.user.id, approved_at: now, ...(action === "approve" ? { requested_role: requestedRole } : {}) }).eq("user_id",userId).eq("status","pending");
  if (updateRequestError) return reply(500, { error: "ثبت تصمیم مدیر ناموفق بود؛ وضعیت درخواست را بررسی کنید." });
  const { error: profileError } = await adminDb.from("profiles").update({ is_active: action === "approve", ...(action === "approve" ? { role: requestedRole } : {}) }).eq("id",userId);
  if (profileError) {
    console.error("registration-approval profile update failed", profileError.message);
    return reply(500, { approved: action === "approve", request_updated: true, error: "تصمیم درخواست ثبت شد اما وضعیت نمایه به‌روزرسانی نشد؛ مدیر باید نمایه را بررسی کند." });
  }
  return reply(200, { ok: true, status: nextStatus, message: action === "approve" ? "حساب تأیید شد؛ کاربر اکنون می‌تواند وارد سامانه شود." : "درخواست رد شد." });
});
