-- Applied to Supabase project fxxtyfurdzpzfvweoppo on 2026-10-11.
-- Purpose: prevent anonymous access to sensitive views/tables and restrict RPCs.
-- No rows or business data are deleted or modified by this migration.

ALTER VIEW public.finance_balance_summary SET (security_invoker = true);
ALTER VIEW public.friday_overdue SET (security_invoker = true);
ALTER VIEW public.fund_balance_summary SET (security_invoker = true);
ALTER VIEW public.khadem_service_summary SET (security_invoker = true);
ALTER VIEW public.khadems_compat SET (security_invoker = true);
ALTER VIEW public.meeting_attendance_summary SET (security_invoker = true);
ALTER VIEW public.meeting_stats_summary SET (security_invoker = true);

REVOKE ALL PRIVILEGES ON TABLE
  public.finance_balance_summary,
  public.friday_overdue,
  public.fund_balance_summary,
  public.khadem_service_summary,
  public.khadems_compat,
  public.meeting_attendance_summary,
  public.meeting_stats_summary
FROM PUBLIC, anon;
GRANT SELECT ON TABLE
  public.finance_balance_summary,
  public.friday_overdue,
  public.fund_balance_summary,
  public.khadem_service_summary,
  public.khadems_compat,
  public.meeting_attendance_summary,
  public.meeting_stats_summary
TO authenticated;

REVOKE SELECT ON TABLE
  public.khadems,
  public.service_records,
  public.finance_transactions,
  public.fund_transactions,
  public.meetings,
  public.meeting_invitees,
  public.meeting_attendance,
  public.system_settings
FROM PUBLIC, anon;

REVOKE EXECUTE ON FUNCTION public.get_my_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.has_app_permission(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_app_permission(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_khadem_code_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_khadem_permission_columns() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
ALTER FUNCTION public.set_updated_at() SET search_path = public;
