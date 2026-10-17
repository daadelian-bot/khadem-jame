import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const REPO = "daadelian-bot/khadem-jame";
const BOT_LOGIN = "daadelian-bot";

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
function ghHeaders(token: string) {
  return {
    Authorization: "Bearer " + token,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}
async function github(token: string, path: string, init: RequestInit = {}) {
  const response = await fetch("https://api.github.com" + path, {
    ...init,
    headers: { ...ghHeaders(token), ...(init.headers || {}) },
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof data?.message === "string" ? data.message : "GitHub API error";
    throw new Error("درخواست GitHub انجام نشد: " + response.status + " " + detail);
  }
  return data;
}
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "فقط درخواست POST مجاز است." });

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !service) return reply(500, { error: "تنظیمات امن سرور کامل نیست." });

  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return reply(401, { error: "ابتدا با حساب مدیر اصلی وارد شوید." });

  const auth = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const adminDb = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await auth.auth.getUser(token);
  if (authError || !authData.user) return reply(401, { error: "نشست معتبر نیست یا منقضی شده است؛ دوباره وارد شوید." });

  const { data: manager, error: managerError } = await adminDb
    .from("profiles").select("role,is_active").eq("id", authData.user.id).maybeSingle();
  if (managerError) return reply(500, { error: "بررسی مجوز مدیر اصلی ناموفق بود." });
  if (manager?.role !== "admin" || manager?.is_active !== true) {
    return reply(403, { error: "این بخش فقط برای حساب فعال مدیر اصلی در دسترس است." });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return reply(400, { error: "اطلاعات ارسالی معتبر نیست." }); }
  const action = String(body.action || "check");

  if (action === "check") {
    return reply(200, { ok: true, is_admin: true, message: "دسترسی مدیر اصلی تأیید شد." });
  }

  const ghToken = Deno.env.get("GITHUB_AUTOMATION_TOKEN");
  if (!ghToken) {
    return reply(503, {
      error: "پنل آماده است اما اتصال خودکار توسعه هنوز پیکربندی نشده است. یک‌بار باید secret با نام GITHUB_AUTOMATION_TOKEN در Supabase تنظیم شود؛ این مقدار نباید داخل APK یا کد قرار گیرد.",
      code: "AUTOMATION_NOT_CONFIGURED",
    });
  }

  if (action === "submit") {
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    if (title.length < 4 || title.length > 140) return reply(400, { error: "عنوان درخواست باید بین ۴ تا ۱۴۰ نویسه باشد." });
    if (description.length < 12 || description.length > 5000) return reply(400, { error: "شرح درخواست باید بین ۱۲ تا ۵۰۰۰ نویسه باشد." });
    if (/\b(?:sb_secret_[A-Za-z0-9_-]+|service_role|OPENAI_API_KEY|GITHUB_AUTOMATION_TOKEN|GH_AUTOMATION_TOKEN)\b/i.test(title + "\n" + description)) {
      return reply(400, { error: "درخواست شامل عبارتی شبیه کلید محرمانه است. کلید، رمز عبور یا اطلاعات خصوصی را ارسال نکنید." });
    }
    try {
      const account = await github(ghToken, "/user");
      if (String(account.login || "").toLowerCase() !== BOT_LOGIN) {
        return reply(503, {
          error: "توکن توسعه به حساب مورد انتظار متصل نیست. برای اجرای خودکار، GITHUB_AUTOMATION_TOKEN باید متعلق به حساب daadelian-bot و دارای مجوز Issues باشد.",
          code: "WRONG_GITHUB_ACCOUNT",
        });
      }
      const issueTitle = "[AI-DEV] " + title;
      const issueBody = [
        "## درخواست توسعه ثبت‌شده از داخل APK",
        "",
        description,
        "",
        "---",
        "این درخواست از پنل توسعه داخل سامانه جامع خادمین ارسال شده است.",
        "حساب مدیر تأییدشده: " + String(authData.user.id),
        "عامل کدنویسی باید تغییرات را در محیط محدود بررسی کند، آزمون‌های موجود را اجرا کند و پیشنهاد را برای بررسی آماده سازد.",
        "از تغییر داده‌های زنده، دور زدن نقش‌ها، افشای اسرار یا ادعای آزمون/انتشار تأییدنشده خودداری شود.",
      ].join("\n");
      const issue = await github(ghToken, "/repos/" + REPO + "/issues", {
        method: "POST",
        body: JSON.stringify({ title: issueTitle, body: issueBody }),
      });
      if (String(issue?.user?.login || "").toLowerCase() !== BOT_LOGIN) {
        return reply(502, { error: "درخواست ثبت شد اما حساب ایجادکننده مورد انتظار نبود؛ اجرای خودکار تأیید نشد." });
      }
      return reply(200, {
        ok: true,
        issue: { number: issue.number, title: issue.title, html_url: issue.html_url, created_at: issue.created_at },
        message: "درخواست به گردش‌کار توسعه فرستاده شد. نتیجه و وضعیت بررسی را می‌توانید از همین صفحه پیگیری کنید.",
      });
    } catch (error) {
      console.error("submit-developer-request failed", error instanceof Error ? error.message : "unknown");
      return reply(502, { error: error instanceof Error ? error.message : "ثبت درخواست توسعه ناموفق بود." });
    }
  }

  if (action === "list") {
    try {
      const items = await github(ghToken, "/repos/" + REPO + "/issues?creator=" + BOT_LOGIN + "&state=all&per_page=30&sort=created&direction=desc");
      const requests = (Array.isArray(items) ? items : [])
        .filter((item: any) => !item.pull_request && String(item.title || "").startsWith("[AI-DEV]"))
        .slice(0, 20);
      const enriched = await Promise.all(requests.map(async (item: any) => {
        let comments: any[] = [];
        try {
          comments = await github(ghToken, "/repos/" + REPO + "/issues/" + item.number + "/comments?per_page=30");
        } catch (_) {}
        return {
          number: item.number,
          title: String(item.title || "").replace(/^\[AI-DEV\]\s*/, ""),
          state: item.state,
          created_at: item.created_at,
          updated_at: item.updated_at,
          comments: (Array.isArray(comments) ? comments : []).slice(-5).map((c: any) => ({
            body: String(c.body || "").slice(0, 3000),
            created_at: c.created_at,
          })),
        };
      }));
      return reply(200, { ok: true, requests: enriched });
    } catch (error) {
      console.error("list developer requests failed", error instanceof Error ? error.message : "unknown");
      return reply(502, { error: error instanceof Error ? error.message : "دریافت سوابق درخواست‌ها ناموفق بود." });
    }
  }
  return reply(400, { error: "عملیات درخواستی پشتیبانی نمی‌شود." });
});