-- Compatibility restoration for v141 app schema and summary views.
-- Additive only; no old-project data is copied or deleted.
ALTER TABLE public.khadems
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS service_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS service_days integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS first_main_service_date date,
  ADD COLUMN IF NOT EXISTS first_friday_service_date date,
  ADD COLUMN IF NOT EXISTS total_service_days integer NOT NULL DEFAULT 0;
ALTER TABLE public.service_records
  ADD COLUMN IF NOT EXISTS service_days integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS responsibility text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS start_time time,
  ADD COLUMN IF NOT EXISTS end_time time,
  ADD COLUMN IF NOT EXISTS duration_minutes integer,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS meeting_type text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS start_time time,
  ADD COLUMN IF NOT EXISTS end_time time,
  ADD COLUMN IF NOT EXISTS topic text,
  ADD COLUMN IF NOT EXISTS invite_mode text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS invite_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.meeting_invitees
  ADD COLUMN IF NOT EXISTS invited_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS invited_by uuid,
  ADD COLUMN IF NOT EXISTS excuse_reason text,
  ADD COLUMN IF NOT EXISTS arrival_time time,
  ADD COLUMN IF NOT EXISTS attendance_recorded_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS absence_type text,
  ADD COLUMN IF NOT EXISTS departure_time time,
  ADD COLUMN IF NOT EXISTS arrival_session_start boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS departure_session_end boolean NOT NULL DEFAULT false;
ALTER TABLE public.finance_accounts ADD COLUMN IF NOT EXISTS account_type text, ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.finance_installments
  ADD COLUMN IF NOT EXISTS transaction_id uuid,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS capacity integer,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'available';

CREATE OR REPLACE FUNCTION private.sync_v141_compat_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF TG_TABLE_SCHEMA='public' AND TG_TABLE_NAME='khadems' THEN
    IF TG_OP='INSERT' THEN
      IF NEW.is_active IS DISTINCT FROM (NEW.status <> 'inactive') THEN NEW.status := CASE WHEN NEW.is_active THEN 'active' ELSE 'inactive' END; END IF;
    ELSIF NEW.is_active IS DISTINCT FROM OLD.is_active THEN NEW.status := CASE WHEN NEW.is_active THEN 'active' ELSE 'inactive' END;
    ELSIF NEW.status IS DISTINCT FROM OLD.status THEN NEW.is_active := (NEW.status <> 'inactive');
    END IF;
  ELSIF TG_TABLE_SCHEMA='public' AND TG_TABLE_NAME='vehicles' THEN
    NEW.title := COALESCE(NULLIF(btrim(NEW.title),''),NULLIF(btrim(NEW.model),''),NULLIF(btrim(NEW.vehicle_type),''),'');
    NEW.model := COALESCE(NULLIF(btrim(NEW.model),''),NEW.title,'');
    NEW.status := COALESCE(NULLIF(NEW.status,''),'available');
  ELSIF TG_TABLE_SCHEMA='public' AND TG_TABLE_NAME='chat_messages' THEN
    NEW.sender_id := COALESCE(NEW.sender_id,NEW.sender_user_id);
    NEW.sender_user_id := COALESCE(NEW.sender_user_id,NEW.sender_id);
    NEW.body := COALESCE(NEW.body,NEW.message,'');
    NEW.message := COALESCE(NEW.message,NEW.body,'');
    NEW.conversation_type := COALESCE(NULLIF(NEW.conversation_type,''),'public');
  ELSIF TG_TABLE_SCHEMA='public' AND TG_TABLE_NAME='finance_installments' THEN
    NEW.transaction_id := COALESCE(NEW.transaction_id,NEW.finance_transaction_id);
    NEW.finance_transaction_id := COALESCE(NEW.finance_transaction_id,NEW.transaction_id);
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS v141_sync_khadem_compat_status ON public.khadems;
CREATE TRIGGER v141_sync_khadem_compat_status BEFORE INSERT OR UPDATE ON public.khadems FOR EACH ROW EXECUTE FUNCTION private.sync_v141_compat_fields();
DROP TRIGGER IF EXISTS v141_sync_vehicle_compat_fields ON public.vehicles;
CREATE TRIGGER v141_sync_vehicle_compat_fields BEFORE INSERT OR UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION private.sync_v141_compat_fields();
DROP TRIGGER IF EXISTS v141_sync_chat_compat_fields ON public.chat_messages;
CREATE TRIGGER v141_sync_chat_compat_fields BEFORE INSERT OR UPDATE ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION private.sync_v141_compat_fields();
DROP TRIGGER IF EXISTS v141_sync_finance_installment_compat_fields ON public.finance_installments;
CREATE TRIGGER v141_sync_finance_installment_compat_fields BEFORE INSERT OR UPDATE ON public.finance_installments FOR EACH ROW EXECUTE FUNCTION private.sync_v141_compat_fields();

CREATE TABLE IF NOT EXISTS public.system_settings (key text PRIMARY KEY,value_json jsonb NOT NULL DEFAULT '{}'::jsonb,updated_at timestamptz DEFAULT now());
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.system_settings TO authenticated;
DROP POLICY IF EXISTS system_settings_staff_manage ON public.system_settings;
CREATE POLICY system_settings_staff_manage ON public.system_settings FOR ALL TO authenticated USING ((SELECT private.is_staff())) WITH CHECK ((SELECT private.is_staff()));

CREATE OR REPLACE VIEW public.khadem_service_summary WITH (security_invoker=true) AS
SELECT k.id,k.khadem_code,k.full_name,k.tri_name,k.status,
 count(s.id) FILTER (WHERE lower(COALESCE(s.service_type,''))='main') AS main_count,
 count(s.id) FILTER (WHERE lower(COALESCE(s.service_type,''))='friday') AS friday_count,
 min(s.service_date) FILTER (WHERE lower(COALESCE(s.service_type,''))='main') AS first_main_date,
 max(s.service_date) FILTER (WHERE lower(COALESCE(s.service_type,''))='main') AS last_main_date,
 min(s.service_date) FILTER (WHERE lower(COALESCE(s.service_type,''))='friday') AS first_friday_date,
 max(s.service_date) FILTER (WHERE lower(COALESCE(s.service_type,''))='friday') AS last_friday_date
FROM public.khadems k LEFT JOIN public.service_records s ON s.khadem_id=k.id GROUP BY k.id,k.khadem_code,k.full_name,k.tri_name,k.status;
CREATE OR REPLACE VIEW public.khadems_compat WITH (security_invoker=true) AS
SELECT k.id,k.khadem_code,k.full_name,k.father_name,k.national_id,k.phone,k.membership_date,k.responsibility,k.service_count,k.service_days,k.is_active,k.photo_url,k.description,k.created_at,k.updated_at,k.tri_name,k.birth_date,k.occupation,k.residence,k.blood_type,k.medical_history,k.status,k.photo_path,k.first_main_service_date,k.last_main_service_date,k.first_friday_service_date,k.last_friday_service_date,k.main_service_count,k.friday_service_count,k.total_service_days,k.full_name AS first_name,k.tri_name AS triad_name FROM public.khadems k;
CREATE OR REPLACE VIEW public.friday_overdue WITH (security_invoker=true) AS
SELECT id,khadem_code,full_name,tri_name,status,main_count,friday_count,first_main_date,last_main_date,first_friday_date,last_friday_date,(CURRENT_DATE-last_friday_date) AS days_since_friday FROM public.khadem_service_summary
WHERE status='active' AND (last_friday_date IS NULL OR CURRENT_DATE-last_friday_date > COALESCE((SELECT (value_json #>> '{}')::integer FROM public.system_settings WHERE key='friday_cycle_days'),45));
CREATE OR REPLACE VIEW public.meeting_attendance_summary WITH (security_invoker=true) AS
SELECT k.id,k.khadem_code,k.full_name,count(DISTINCT mi.id) AS invited_count,count(DISTINCT ma.id) FILTER (WHERE ma.status='present') AS present_count,count(DISTINCT ma.id) FILTER (WHERE ma.status='absent') AS absent_count,count(DISTINCT ma.id) FILTER (WHERE ma.status='excused') AS excused_count,count(DISTINCT ma.id) FILTER (WHERE ma.status='late') AS late_count
FROM public.khadems k LEFT JOIN public.meeting_invitees mi ON mi.khadem_id=k.id LEFT JOIN public.meeting_attendance ma ON ma.khadem_id=k.id AND ma.meeting_id=mi.meeting_id GROUP BY k.id,k.khadem_code,k.full_name;
CREATE OR REPLACE VIEW public.meeting_stats_summary WITH (security_invoker=true) AS
SELECT m.meeting_type,count(DISTINCT m.id) FILTER (WHERE m.status='held') AS held_sessions,count(mi.id) AS invitees,count(ma.id) FILTER (WHERE ma.status='present') AS present_count,count(ma.id) FILTER (WHERE ma.status='absent') AS absent_count,count(ma.id) FILTER (WHERE ma.status='excused') AS excused_count,count(ma.id) FILTER (WHERE ma.status='late') AS late_count,round(100.0*count(ma.id) FILTER (WHERE ma.status='present')::numeric/NULLIF(count(mi.id),0)::numeric,2) AS attendance_percent
FROM public.meetings m LEFT JOIN public.meeting_invitees mi ON mi.meeting_id=m.id LEFT JOIN public.meeting_attendance ma ON ma.meeting_id=m.id AND ma.khadem_id=mi.khadem_id GROUP BY m.meeting_type;
CREATE OR REPLACE VIEW public.finance_balance_summary WITH (security_invoker=true) AS
SELECT COALESCE(sum(CASE WHEN lower(COALESCE(transaction_type,'')) IN ('income','receipt','دریافت') AND status='posted' THEN amount ELSE 0 END),0) AS total_income,COALESCE(sum(CASE WHEN lower(COALESCE(transaction_type,'')) IN ('expense','payment','پرداخت') AND status='posted' THEN amount ELSE 0 END),0) AS total_expense,COALESCE(sum(CASE WHEN lower(COALESCE(transaction_type,'')) IN ('income','receipt','دریافت') AND status='posted' THEN amount WHEN lower(COALESCE(transaction_type,'')) IN ('expense','payment','پرداخت') AND status='posted' THEN -amount ELSE 0 END),0) AS balance FROM public.finance_transactions;
CREATE OR REPLACE VIEW public.fund_balance_summary WITH (security_invoker=true) AS
SELECT COALESCE(sum(CASE WHEN lower(COALESCE(transaction_type,'')) IN ('income','receipt','دریافت','donation') AND status='posted' THEN amount ELSE 0 END),0) AS total_income,COALESCE(sum(CASE WHEN lower(COALESCE(transaction_type,'')) IN ('expense','payment','پرداخت') AND status='posted' THEN amount ELSE 0 END),0) AS total_expense,COALESCE(sum(CASE WHEN lower(COALESCE(transaction_type,'')) IN ('income','receipt','دریافت','donation') AND status='posted' THEN amount WHEN lower(COALESCE(transaction_type,'')) IN ('expense','payment','پرداخت') AND status='posted' THEN -amount ELSE 0 END),0) AS balance FROM public.fund_transactions;
