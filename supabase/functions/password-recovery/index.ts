// Password recovery with admin approval and SMS OTP.
// Deploy with: supabase functions deploy password-recovery --no-verify-jwt
// Configure secrets: KAVENEGAR_API_KEY, KAVENEGAR_SENDER, OTP_PEPPER.
// Supabase provides SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to Edge Functions.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const otpPepper = Deno.env.get("OTP_PEPPER") ?? "";

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}
function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}
function normalizePhone(value: unknown): string {
  let s = String(value ?? "").trim();
  const persian = "۰۱۲۳۴۵۶۷۸۹", arabic = "٠١٢٣٤٥٦٧٨٩";
  s = s.replace(/[۰-۹]/g, c => String(persian.indexOf(c)))
       .replace(/[٠-٩]/g, c => String(arabic.indexOf(c)))
       .replace(/[\s()\-]/g, "");
  if (s.startsWith("0098")) s = "+98" + s.slice(4);
  else if (s.startsWith("98")) s = "+" + s;
  else if (s.startsWith("09") && s.length === 11) s = "+98" + s.slice(1);
  return s;
}
function validPhone(s: string) { return /^\+[1-9]\d{7,14}$/.test(s); }
function restHeaders(extra: Record<string, string> = {}) {
  return { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, ...extra };
}
async function rest(path: string, init: RequestInit = {}) {
  return fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: restHeaders({ Accept: "application/json", ...(init.headers as Record<string, string> ?? {}) }),
    cache: "no-store",
  });
}
async function rows(path: string) {
  const r = await rest(path);
  const j = await r.json().catch(() => []);
  if (!r.ok) throw new Error(`Database request failed (${r.status})`);
  if (!Array.isArray(j)) throw new Error("Unexpected database response");
  return j as Record<string, any>[];
}
async function patch(path: string, body: Record<string, unknown>) {
  const r = await rest(path, { method: "PATCH", headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => []);
  if (!r.ok) throw new Error(`Database update failed (${r.status})`);
  return Array.isArray(j) ? j as Record<string, any>[] : [];
}
async function create(path: string, body: Record<string, unknown>) {
  const r = await rest(path, { method: "POST", headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => []);
  if (!r.ok) throw new Error(`Database insert failed (${r.status})`);
  return Array.isArray(j) ? j as Record<string, any>[] : [];
}
async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function randomCode(): string {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return String(a[0] % 1_000_000).padStart(6, "0");
}
async function requireAdmin(req: Request): Promise<string> {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) throw new Error("برای این عملیات ورود مدیر اصلی لازم است.");
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: restHeaders({ Authorization: auth }), cache: "no-store" });
  const user = await userResponse.json().catch(() => ({}));
  if (!userResponse.ok || !user.id) throw new Error("نشست کاربر معتبر نیست.");
  const profile = await rows(`profiles?select=role,is_active&id=eq.${encodeURIComponent(user.id)}&limit=1`);
  if (profile[0]?.role !== "admin" || profile[0]?.is_active === false) throw new Error("فقط مدیر اصلی مجاز به این عملیات است.");
  return String(user.id);
}
async function sendSms(phone: string, message: string) {
  const apiKey = Deno.env.get("KAVENEGAR_API_KEY") ?? "";
  const sender = Deno.env.get("KAVENEGAR_SENDER") ?? "";
  if (!apiKey || !sender || !otpPepper) throw new Error("تنظیمات کاوه‌نگار یا OTP_PEPPER کامل نیست.");
  const receptor = phone.startsWith("+98") ? "0" + phone.slice(3) : phone;
  const body = new URLSearchParams({ receptor, sender, message });
  const r = await fetch(`https://api.kavenegar.com/v1/${encodeURIComponent(apiKey)}/sms/send.json`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const result = await r.json().catch(() => ({}));
  if (!r.ok || Number(result?.return?.status) !== 200) {
    console.error("Kavenegar SMS error", r.status, JSON.stringify(result).slice(0, 300));
    throw new Error("ارسال پیامک ناموفق بود؛ کلید API، خط ارسال و اعتبار سرویس پیامک را بررسی کنید.");
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply(405, { error: "Method not allowed" });
  if (!supabaseUrl || !serviceKey) return reply(500, { error: "تنظیمات سرور Supabase کامل نیست." });

  let body: Record<string, any>;
  try { body = await req.json(); } catch { return reply(400, { error: "درخواست معتبر نیست." }); }
  const action = String(body.action ?? "");

  try {
    if (action === "request") {
      const email = normalizeEmail(body.email);
      const phone = normalizePhone(body.phone);
      if (!/^\S+@\S+\.\S+$/.test(email) || !validPhone(phone)) return reply(400, { error: "ایمیل یا شماره همراه معتبر نیست." });
      const regs = await rows(`registration_requests?select=user_id,email,phone,status&email=eq.${encodeURIComponent(email)}&status=eq.approved&limit=10`);
      const matched = regs.find(x => x.user_id && normalizeEmail(x.email) === email && normalizePhone(x.phone) === phone);
      // Do not reveal whether an email, phone, or account exists.
      if (!matched) return reply(200, { ok: true, message: "اگر اطلاعات با حساب تأییدشده مطابقت داشته باشد، درخواست برای بررسی مدیر اصلی ثبت می‌شود." });
      const recentAfter = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const recent = await rows(`password_reset_requests?select=id,status&user_id=eq.${encodeURIComponent(matched.user_id)}&created_at=gte.${encodeURIComponent(recentAfter)}&limit=1`);
      if (!recent.length) {
        await create("password_reset_requests", { user_id: matched.user_id, email, phone, status: "pending" });
      }
      return reply(200, { ok: true, message: "اگر اطلاعات با حساب تأییدشده مطابقت داشته باشد، درخواست برای بررسی مدیر اصلی ثبت می‌شود." });
    }

    if (action === "list") {
      await requireAdmin(req);
      const requests = await rows("password_reset_requests?select=id,email,phone,status,created_at&status=in.(pending,otp_sent)&order=created_at.desc&limit=100");
      return reply(200, { requests });
    }

    if (action === "reject" || action === "approve") {
      const adminId = await requireAdmin(req);
      const id = String(body.request_id ?? "");
      if (!/^[0-9a-f-]{36}$/i.test(id)) return reply(400, { error: "شناسه درخواست معتبر نیست." });
      const pending = await rows(`password_reset_requests?select=id,user_id,email,phone,status&id=eq.${encodeURIComponent(id)}&limit=1`);
      const item = pending[0];
      if (!item || item.status !== "pending") return reply(409, { error: "درخواست پیدا نشد یا قبلاً بررسی شده است." });
      if (action === "reject") {
        await patch(`password_reset_requests?id=eq.${encodeURIComponent(id)}&status=eq.pending`, { status: "rejected", approved_by: adminId, approved_at: new Date().toISOString(), updated_at: new Date().toISOString() });
        return reply(200, { ok: true });
      }
      if (!otpPepper) return reply(500, { error: "راز OTP_PEPPER در Supabase تنظیم نشده است." });
      const regs = await rows(`registration_requests?select=user_id,email,phone,status&user_id=eq.${encodeURIComponent(item.user_id)}&status=eq.approved&limit=10`);
      const reg = regs.find(x => normalizeEmail(x.email) === normalizeEmail(item.email) && normalizePhone(x.phone) === normalizePhone(item.phone));
      if (!reg || !validPhone(normalizePhone(item.phone))) return reply(409, { error: "شماره ثبت‌شده با پرونده تأییدشده مطابقت ندارد؛ مدیر باید شماره را بررسی کند." });
      const claimed = await patch(`password_reset_requests?id=eq.${encodeURIComponent(id)}&status=eq.pending`, { status: "sending", approved_by: adminId, approved_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      if (!claimed.length) return reply(409, { error: "این درخواست هم‌زمان توسط کاربر دیگری بررسی شده است." });
      const code = randomCode();
      const otpHash = await sha256(`${id}:${code}:${otpPepper}`);
      try {
        await sendSms(normalizePhone(item.phone), `سامانه جامع مدیریت خدام\nکد بازیابی: ${code}\nشناسه درخواست: ${id}\nاعتبار: ۱۰ دقیقه\nاگر درخواست نداده‌اید، پیام را نادیده بگیرید.`);
        await patch(`password_reset_requests?id=eq.${encodeURIComponent(id)}&status=eq.sending`, { status: "otp_sent", otp_hash: otpHash, otp_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), attempts: 0, updated_at: new Date().toISOString() });
      } catch (e) {
        await patch(`password_reset_requests?id=eq.${encodeURIComponent(id)}&status=eq.sending`, { status: "pending", otp_hash: null, otp_expires_at: null, updated_at: new Date().toISOString() }).catch(() => []);
        throw e;
      }
      return reply(200, { ok: true });
    }

    if (action === "complete") {
      const id = String(body.request_id ?? ""), code = String(body.code ?? ""), password = String(body.new_password ?? "");
      if (!/^[0-9a-f-]{36}$/i.test(id) || !/^\d{6}$/.test(code) || password.length < 10 || password.length > 128) return reply(400, { error: "شناسه، کد یا رمز جدید معتبر نیست. رمز باید حداقل ۱۰ نویسه داشته باشد." });
      if (!otpPepper) return reply(500, { error: "تنظیمات امن OTP کامل نیست." });
      const found = await rows(`password_reset_requests?select=id,user_id,email,phone,status,otp_hash,otp_expires_at,attempts&id=eq.${encodeURIComponent(id)}&limit=1`);
      const item = found[0];
      if (!item || item.status !== "otp_sent" || !item.otp_expires_at || new Date(item.otp_expires_at).getTime() < Date.now() || Number(item.attempts) >= 5) {
        if (item?.status === "otp_sent") await patch(`password_reset_requests?id=eq.${encodeURIComponent(id)}`, { status: "expired", otp_hash: null, updated_at: new Date().toISOString() });
        return reply(400, { error: "کد معتبر نیست یا منقضی شده است. درخواست جدید ثبت کنید." });
      }
      const expected = await sha256(`${id}:${code}:${otpPepper}`);
      if (expected !== item.otp_hash) {
        const attempts = Number(item.attempts || 0) + 1;
        await patch(`password_reset_requests?id=eq.${encodeURIComponent(id)}&status=eq.otp_sent`, { attempts, ...(attempts >= 5 ? { status: "expired", otp_hash: null } : {}), updated_at: new Date().toISOString() });
        return reply(400, { error: "کد یک‌بارمصرف اشتباه است." });
      }
      const regs = await rows(`registration_requests?select=user_id,email,phone,status&user_id=eq.${encodeURIComponent(item.user_id)}&status=eq.approved&limit=10`);
      if (!regs.some(x => normalizeEmail(x.email) === normalizeEmail(item.email) && normalizePhone(x.phone) === normalizePhone(item.phone))) return reply(403, { error: "اطلاعات ثبت‌شده دیگر تأیید نیست؛ با مدیر اصلی تماس بگیرید." });
      const update = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(item.user_id)}`, { method: "PUT", headers: restHeaders({ "Content-Type": "application/json" }), body: JSON.stringify({ password }) });
      if (!update.ok) {
        const detail = await update.text().catch(() => "");
        console.error("Supabase admin password update failed", update.status, detail.slice(0, 300));
        return reply(502, { error: "تغییر رمز در سرویس احراز هویت ناموفق بود." });
      }
      await patch(`password_reset_requests?id=eq.${encodeURIComponent(id)}&status=eq.otp_sent`, { status: "completed", otp_hash: null, otp_expires_at: null, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      return reply(200, { ok: true, message: "رمز عبور تغییر کرد." });
    }
    return reply(400, { error: "عملیات پشتیبانی نمی‌شود." });
  } catch (e) {
    const message = e instanceof Error ? e.message : "خطای غیرمنتظره";
    console.error("password-recovery", message);
    return reply(500, { error: message });
  }
});
