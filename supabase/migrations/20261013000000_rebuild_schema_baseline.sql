-- REBUILD BASELINE generated from the live schema of khadem-jame-next on 2026-10-13.
-- Schema only: no production data or auth.users records are included.
-- Intended for a fresh rebuild/recovery; review project-specific Supabase Auth/Storage settings separately.

CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS public.account_access_controls (id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid, module_key text NOT NULL, can_view boolean DEFAULT false NOT NULL, can_create boolean DEFAULT false NOT NULL, can_edit boolean DEFAULT false NOT NULL, can_delete boolean DEFAULT false NOT NULL, granted_by uuid, expires_at timestamp with time zone, created_at timestamp with time zone DEFAULT now() NOT NULL, access_disabled boolean DEFAULT false NOT NULL, suspended_until timestamp with time zone, admin_note text, updated_by uuid, updated_at timestamp with time zone DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS public.app_settings (setting_key text NOT NULL, value jsonb DEFAULT '{}'::jsonb NOT NULL, updated_by uuid, updated_at timestamp with time zone DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS public.audit_logs (id uuid DEFAULT gen_random_uuid() NOT NULL, actor_user_id uuid, action text NOT NULL, module_key text, record_id text, old_data jsonb, new_data jsonb, created_at timestamp with time zone DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS public.chat_messages (id uuid DEFAULT gen_random_uuid() NOT NULL, sender_user_id uuid, sender_name text, message text DEFAULT ''::text NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL, sender_id uuid, body text DEFAULT ''::text NOT NULL, recipient_id uuid, conversation_type text DEFAULT 'public'::text NOT NULL, deleted_at timestamp with time zone);

CREATE TABLE IF NOT EXISTS public.chat_recipients (id uuid DEFAULT gen_random_uuid() NOT NULL, message_id uuid, user_id uuid, display_name text, role text, is_read boolean DEFAULT false NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS public.finance_accounts (id uuid DEFAULT gen_random_uuid() NOT NULL, account_code text, account_name text NOT NULL, category text, is_active boolean DEFAULT true NOT NULL, notes text, created_at timestamp with time zone DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS public.finance_installments (id uuid DEFAULT gen_random_uuid() NOT NULL, khadem_id uuid, finance_transaction_id uuid, title text, installment_number integer, amount numeric(14,2) DEFAULT 0 NOT NULL, due_date date, status text DEFAULT 'pending'::text NOT NULL, paid_amount numeric(14,2) DEFAULT 0 NOT NULL, paid_date date, notes text, created_at timestamp with time zone DEFAULT now() NOT NULL, transaction_id uuid);

CREATE TABLE IF NOT EXISTS public.finance_transactions (id uuid DEFAULT gen_random_uuid() NOT NULL, khadem_id uuid, khadem_code bigint, transaction_type text, category text, party text, amount numeric(14,2) DEFAULT 0 NOT NULL, paid_amount numeric(14,2), balance numeric(14,2), transaction_date date DEFAULT CURRENT_DATE NOT NULL, reference_no text, payment_method text DEFAULT 'cash'::text, account_id uuid, description text, notes text, created_by uuid, created_by_email text, created_at timestamp with time zone DEFAULT now() NOT NULL, khadem_name text, title text, status text DEFAULT 'posted'::text NOT NULL);

CREATE TABLE IF NOT EXISTS public.khadem_receipt_attachments (id uuid DEFAULT gen_random_uuid() NOT NULL, record_table text NOT NULL, record_id text NOT NULL, receipt_type text DEFAULT 'other'::text NOT NULL, sender_name text, file_path text NOT NULL, file_name text, mime_type text, file_size bigint, notes text, uploaded_by uuid, created_at timestamp with time zone DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS public.khadems (id uuid DEFAULT gen_random_uuid() NOT NULL, khadem_code bigint, full_name text DEFAULT ''::text NOT NULL, tri_name text, father_name text, national_id text, phone text, membership_date date, birth_date date, occupation text, residence text, blood_type text, medical_history text, emergency_contact_name text, emergency_contact_phone text, emergency_contact_name_2 text, emergency_contact_phone_2 text, emergency_contact_name_3 text, emergency_contact_phone_3 text, skills text, education_level text, extra_data jsonb DEFAULT '{}'::jsonb NOT NULL, is_active boolean DEFAULT true NOT NULL, responsibility text, notes text, photo_url text, tuition_exempt boolean DEFAULT false NOT NULL, tuition_exempt_note text, tuition_exempt_from date, tuition_exempt_until date, last_main_service_date date, last_friday_service_date date, main_service_count integer DEFAULT 0 NOT NULL, friday_service_count integer DEFAULT 0 NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL, photo_path text);

CREATE TABLE IF NOT EXISTS public.meeting_invitees (id uuid DEFAULT gen_random_uuid() NOT NULL, meeting_id uuid, khadem_id uuid, khadem_code bigint, khadem_name text, attendance_status text DEFAULT 'pending'::text NOT NULL, invite_status text DEFAULT 'invited'::text NOT NULL, notes text, created_at timestamp with time zone DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS public.meetings (id uuid DEFAULT gen_random_uuid() NOT NULL, title text NOT NULL, meeting_date date DEFAULT CURRENT_DATE NOT NULL, meeting_time time without time zone, location text, owner text, status text DEFAULT 'scheduled'::text NOT NULL, notes text, created_by uuid, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS public.profiles (id uuid NOT NULL, email text, username text, full_name text, display_name text, role text DEFAULT 'user'::text NOT NULL, is_active boolean DEFAULT true NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS public.registration_requests (id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid, email text, full_name text, phone text, status text DEFAULT 'pending'::text NOT NULL, requested_role text DEFAULT 'user'::text NOT NULL, notes text, created_at timestamp with time zone DEFAULT now() NOT NULL, reviewed_at timestamp with time zone, reviewed_by uuid, approved_by uuid, approved_at timestamp with time zone, updated_at timestamp with time zone DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS public.service_records (id uuid DEFAULT gen_random_uuid() NOT NULL, khadem_id uuid, khadem_code bigint, khadem_name text, service_type text, service_date date DEFAULT CURRENT_DATE NOT NULL, location text, responsibility text, notes text, created_by uuid, created_at timestamp with time zone DEFAULT now() NOT NULL, shrine_id uuid);

CREATE TABLE IF NOT EXISTS public.shrine_sites (id uuid DEFAULT gen_random_uuid() NOT NULL, name text NOT NULL, city text, is_active boolean DEFAULT true NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS public.tuition_dues (id uuid DEFAULT gen_random_uuid() NOT NULL, khadem_id uuid, period_month date NOT NULL, amount_toman numeric(14,2) DEFAULT 0 NOT NULL, paid_toman numeric(14,2) DEFAULT 0 NOT NULL, status text DEFAULT 'pending'::text NOT NULL, notes text, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS public.tuition_payments (id uuid DEFAULT gen_random_uuid() NOT NULL, khadem_id uuid, amount_toman numeric(14,2) DEFAULT 0 NOT NULL, paid_date date DEFAULT CURRENT_DATE NOT NULL, payment_method text DEFAULT 'cash'::text, reference_no text, notes text, finance_transaction_id uuid, created_at timestamp with time zone DEFAULT now() NOT NULL, tuition_due_id uuid);

CREATE TABLE IF NOT EXISTS public.tuition_settings (id uuid DEFAULT gen_random_uuid() NOT NULL, first_six_monthly_toman numeric(14,2) DEFAULT 0 NOT NULL, after_six_monthly_toman numeric(14,2) DEFAULT 0 NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS public.user_presence (user_id uuid NOT NULL, last_seen_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL, started_at timestamp with time zone, ended_at timestamp with time zone, duration_seconds bigint);

CREATE TABLE IF NOT EXISTS public.vehicles (id uuid DEFAULT gen_random_uuid() NOT NULL, name text, plate_number text, vehicle_type text, driver_name text, driver_phone text, is_active boolean DEFAULT true NOT NULL, notes text, created_at timestamp with time zone DEFAULT now() NOT NULL, title text, capacity integer, status text DEFAULT 'available'::text NOT NULL);

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'account_access_controls_granted_by_fkey' AND conrelid = 'public.account_access_controls'::regclass) THEN ALTER TABLE public.account_access_controls ADD CONSTRAINT account_access_controls_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES auth.users(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'account_access_controls_pkey' AND conrelid = 'public.account_access_controls'::regclass) THEN ALTER TABLE public.account_access_controls ADD CONSTRAINT account_access_controls_pkey PRIMARY KEY (id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'account_access_controls_user_id_fkey' AND conrelid = 'public.account_access_controls'::regclass) THEN ALTER TABLE public.account_access_controls ADD CONSTRAINT account_access_controls_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'account_access_controls_user_id_module_key_key' AND conrelid = 'public.account_access_controls'::regclass) THEN ALTER TABLE public.account_access_controls ADD CONSTRAINT account_access_controls_user_id_module_key_key UNIQUE (user_id, module_key); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'app_settings_pkey' AND conrelid = 'public.app_settings'::regclass) THEN ALTER TABLE public.app_settings ADD CONSTRAINT app_settings_pkey PRIMARY KEY (setting_key); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'app_settings_updated_by_fkey' AND conrelid = 'public.app_settings'::regclass) THEN ALTER TABLE public.app_settings ADD CONSTRAINT app_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_actor_user_id_fkey' AND conrelid = 'public.audit_logs'::regclass) THEN ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES auth.users(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_pkey' AND conrelid = 'public.audit_logs'::regclass) THEN ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_pkey' AND conrelid = 'public.chat_messages'::regclass) THEN ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_recipient_id_fkey' AND conrelid = 'public.chat_messages'::regclass) THEN ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_sender_id_fkey' AND conrelid = 'public.chat_messages'::regclass) THEN ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_sender_user_id_fkey' AND conrelid = 'public.chat_messages'::regclass) THEN ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_sender_user_id_fkey FOREIGN KEY (sender_user_id) REFERENCES auth.users(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_recipients_message_id_fkey' AND conrelid = 'public.chat_recipients'::regclass) THEN ALTER TABLE public.chat_recipients ADD CONSTRAINT chat_recipients_message_id_fkey FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_recipients_message_id_user_id_key' AND conrelid = 'public.chat_recipients'::regclass) THEN ALTER TABLE public.chat_recipients ADD CONSTRAINT chat_recipients_message_id_user_id_key UNIQUE (message_id, user_id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_recipients_pkey' AND conrelid = 'public.chat_recipients'::regclass) THEN ALTER TABLE public.chat_recipients ADD CONSTRAINT chat_recipients_pkey PRIMARY KEY (id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_recipients_user_id_fkey' AND conrelid = 'public.chat_recipients'::regclass) THEN ALTER TABLE public.chat_recipients ADD CONSTRAINT chat_recipients_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'finance_accounts_account_code_key' AND conrelid = 'public.finance_accounts'::regclass) THEN ALTER TABLE public.finance_accounts ADD CONSTRAINT finance_accounts_account_code_key UNIQUE (account_code); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'finance_accounts_pkey' AND conrelid = 'public.finance_accounts'::regclass) THEN ALTER TABLE public.finance_accounts ADD CONSTRAINT finance_accounts_pkey PRIMARY KEY (id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'finance_installments_finance_transaction_id_fkey' AND conrelid = 'public.finance_installments'::regclass) THEN ALTER TABLE public.finance_installments ADD CONSTRAINT finance_installments_finance_transaction_id_fkey FOREIGN KEY (finance_transaction_id) REFERENCES finance_transactions(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'finance_installments_khadem_id_fkey' AND conrelid = 'public.finance_installments'::regclass) THEN ALTER TABLE public.finance_installments ADD CONSTRAINT finance_installments_khadem_id_fkey FOREIGN KEY (khadem_id) REFERENCES khadems(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'finance_installments_pkey' AND conrelid = 'public.finance_installments'::regclass) THEN ALTER TABLE public.finance_installments ADD CONSTRAINT finance_installments_pkey PRIMARY KEY (id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'finance_installments_transaction_id_fkey' AND conrelid = 'public.finance_installments'::regclass) THEN ALTER TABLE public.finance_installments ADD CONSTRAINT finance_installments_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES finance_transactions(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'finance_transactions_account_id_fkey' AND conrelid = 'public.finance_transactions'::regclass) THEN ALTER TABLE public.finance_transactions ADD CONSTRAINT finance_transactions_account_id_fkey FOREIGN KEY (account_id) REFERENCES finance_accounts(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'finance_transactions_created_by_fkey' AND conrelid = 'public.finance_transactions'::regclass) THEN ALTER TABLE public.finance_transactions ADD CONSTRAINT finance_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'finance_transactions_khadem_id_fkey' AND conrelid = 'public.finance_transactions'::regclass) THEN ALTER TABLE public.finance_transactions ADD CONSTRAINT finance_transactions_khadem_id_fkey FOREIGN KEY (khadem_id) REFERENCES khadems(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'finance_transactions_pkey' AND conrelid = 'public.finance_transactions'::regclass) THEN ALTER TABLE public.finance_transactions ADD CONSTRAINT finance_transactions_pkey PRIMARY KEY (id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'khadem_receipt_attachments_pkey' AND conrelid = 'public.khadem_receipt_attachments'::regclass) THEN ALTER TABLE public.khadem_receipt_attachments ADD CONSTRAINT khadem_receipt_attachments_pkey PRIMARY KEY (id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'khadem_receipt_attachments_uploaded_by_fkey' AND conrelid = 'public.khadem_receipt_attachments'::regclass) THEN ALTER TABLE public.khadem_receipt_attachments ADD CONSTRAINT khadem_receipt_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'khadems_khadem_code_key' AND conrelid = 'public.khadems'::regclass) THEN ALTER TABLE public.khadems ADD CONSTRAINT khadems_khadem_code_key UNIQUE (khadem_code); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'khadems_pkey' AND conrelid = 'public.khadems'::regclass) THEN ALTER TABLE public.khadems ADD CONSTRAINT khadems_pkey PRIMARY KEY (id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'meeting_invitees_khadem_id_fkey' AND conrelid = 'public.meeting_invitees'::regclass) THEN ALTER TABLE public.meeting_invitees ADD CONSTRAINT meeting_invitees_khadem_id_fkey FOREIGN KEY (khadem_id) REFERENCES khadems(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'meeting_invitees_meeting_id_fkey' AND conrelid = 'public.meeting_invitees'::regclass) THEN ALTER TABLE public.meeting_invitees ADD CONSTRAINT meeting_invitees_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'meeting_invitees_meeting_id_khadem_id_key' AND conrelid = 'public.meeting_invitees'::regclass) THEN ALTER TABLE public.meeting_invitees ADD CONSTRAINT meeting_invitees_meeting_id_khadem_id_key UNIQUE (meeting_id, khadem_id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'meeting_invitees_pkey' AND conrelid = 'public.meeting_invitees'::regclass) THEN ALTER TABLE public.meeting_invitees ADD CONSTRAINT meeting_invitees_pkey PRIMARY KEY (id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'meetings_created_by_fkey' AND conrelid = 'public.meetings'::regclass) THEN ALTER TABLE public.meetings ADD CONSTRAINT meetings_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'meetings_pkey' AND conrelid = 'public.meetings'::regclass) THEN ALTER TABLE public.meetings ADD CONSTRAINT meetings_pkey PRIMARY KEY (id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_fkey' AND conrelid = 'public.profiles'::regclass) THEN ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_pkey' AND conrelid = 'public.profiles'::regclass) THEN ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check' AND conrelid = 'public.profiles'::regclass) THEN ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'manager'::text, 'user'::text]))); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'registration_requests_pkey' AND conrelid = 'public.registration_requests'::regclass) THEN ALTER TABLE public.registration_requests ADD CONSTRAINT registration_requests_pkey PRIMARY KEY (id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'registration_requests_reviewed_by_fkey' AND conrelid = 'public.registration_requests'::regclass) THEN ALTER TABLE public.registration_requests ADD CONSTRAINT registration_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'registration_requests_user_id_fkey' AND conrelid = 'public.registration_requests'::regclass) THEN ALTER TABLE public.registration_requests ADD CONSTRAINT registration_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_records_created_by_fkey' AND conrelid = 'public.service_records'::regclass) THEN ALTER TABLE public.service_records ADD CONSTRAINT service_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_records_khadem_id_fkey' AND conrelid = 'public.service_records'::regclass) THEN ALTER TABLE public.service_records ADD CONSTRAINT service_records_khadem_id_fkey FOREIGN KEY (khadem_id) REFERENCES khadems(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_records_pkey' AND conrelid = 'public.service_records'::regclass) THEN ALTER TABLE public.service_records ADD CONSTRAINT service_records_pkey PRIMARY KEY (id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_records_shrine_id_fkey' AND conrelid = 'public.service_records'::regclass) THEN ALTER TABLE public.service_records ADD CONSTRAINT service_records_shrine_id_fkey FOREIGN KEY (shrine_id) REFERENCES shrine_sites(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shrine_sites_pkey' AND conrelid = 'public.shrine_sites'::regclass) THEN ALTER TABLE public.shrine_sites ADD CONSTRAINT shrine_sites_pkey PRIMARY KEY (id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tuition_dues_khadem_id_fkey' AND conrelid = 'public.tuition_dues'::regclass) THEN ALTER TABLE public.tuition_dues ADD CONSTRAINT tuition_dues_khadem_id_fkey FOREIGN KEY (khadem_id) REFERENCES khadems(id) ON DELETE CASCADE; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tuition_dues_khadem_id_period_month_key' AND conrelid = 'public.tuition_dues'::regclass) THEN ALTER TABLE public.tuition_dues ADD CONSTRAINT tuition_dues_khadem_id_period_month_key UNIQUE (khadem_id, period_month); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tuition_dues_pkey' AND conrelid = 'public.tuition_dues'::regclass) THEN ALTER TABLE public.tuition_dues ADD CONSTRAINT tuition_dues_pkey PRIMARY KEY (id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tuition_payments_finance_transaction_id_fkey' AND conrelid = 'public.tuition_payments'::regclass) THEN ALTER TABLE public.tuition_payments ADD CONSTRAINT tuition_payments_finance_transaction_id_fkey FOREIGN KEY (finance_transaction_id) REFERENCES finance_transactions(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tuition_payments_khadem_id_fkey' AND conrelid = 'public.tuition_payments'::regclass) THEN ALTER TABLE public.tuition_payments ADD CONSTRAINT tuition_payments_khadem_id_fkey FOREIGN KEY (khadem_id) REFERENCES khadems(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tuition_payments_pkey' AND conrelid = 'public.tuition_payments'::regclass) THEN ALTER TABLE public.tuition_payments ADD CONSTRAINT tuition_payments_pkey PRIMARY KEY (id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tuition_payments_tuition_due_id_fkey' AND conrelid = 'public.tuition_payments'::regclass) THEN ALTER TABLE public.tuition_payments ADD CONSTRAINT tuition_payments_tuition_due_id_fkey FOREIGN KEY (tuition_due_id) REFERENCES tuition_dues(id) ON DELETE SET NULL; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tuition_settings_pkey' AND conrelid = 'public.tuition_settings'::regclass) THEN ALTER TABLE public.tuition_settings ADD CONSTRAINT tuition_settings_pkey PRIMARY KEY (id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_presence_pkey' AND conrelid = 'public.user_presence'::regclass) THEN ALTER TABLE public.user_presence ADD CONSTRAINT user_presence_pkey PRIMARY KEY (user_id); END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_presence_user_id_fkey' AND conrelid = 'public.user_presence'::regclass) THEN ALTER TABLE public.user_presence ADD CONSTRAINT user_presence_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; END IF; END $mig$;

DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_pkey' AND conrelid = 'public.vehicles'::regclass) THEN ALTER TABLE public.vehicles ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id); END IF; END $mig$;

CREATE OR REPLACE FUNCTION private.is_staff()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.is_active = true
      and p.role in ('admin','manager')
      and not exists (
        select 1
        from public.account_access_controls ac
        where ac.user_id = p.id
          and ac.module_key = '__account__'
          and (
            ac.access_disabled = true
            or ac.suspended_until > now()
          )
      )
  );
$function$
;

CREATE OR REPLACE FUNCTION private.sync_v141_compat_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  IF TG_TABLE_SCHEMA = 'public' AND TG_TABLE_NAME = 'vehicles' THEN
    NEW.title := COALESCE(NULLIF(btrim(NEW.title), ''), NULLIF(btrim(NEW.name), ''), '');
    NEW.name := COALESCE(NULLIF(btrim(NEW.name), ''), NEW.title, '');
    NEW.status := COALESCE(NULLIF(NEW.status, ''), 'available');
  ELSIF TG_TABLE_SCHEMA = 'public' AND TG_TABLE_NAME = 'chat_messages' THEN
    NEW.sender_id := COALESCE(NEW.sender_id, NEW.sender_user_id);
    NEW.sender_user_id := COALESCE(NEW.sender_user_id, NEW.sender_id);
    NEW.body := COALESCE(NEW.body, NEW.message, '');
    NEW.message := COALESCE(NEW.message, NEW.body, '');
    NEW.conversation_type := COALESCE(NULLIF(NEW.conversation_type, ''), 'public');
  END IF;
  RETURN NEW;
END;
$function$
;

ALTER TABLE public.account_access_controls ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.chat_recipients ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.finance_accounts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.finance_installments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.khadem_receipt_attachments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.khadems ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.meeting_invitees ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.registration_requests ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.service_records ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.shrine_sites ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tuition_dues ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tuition_payments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tuition_settings ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_read_own_or_staff ON public.profiles; CREATE POLICY profiles_read_own_or_staff ON public.profiles AS permissive FOR SELECT TO authenticated USING (((id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_staff() AS is_staff)));

DROP POLICY IF EXISTS profiles_staff_manage ON public.profiles; CREATE POLICY profiles_staff_manage ON public.profiles AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.account_access_controls; CREATE POLICY staff_manage_all ON public.account_access_controls AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.app_settings; CREATE POLICY staff_manage_all ON public.app_settings AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.audit_logs; CREATE POLICY staff_manage_all ON public.audit_logs AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.chat_messages; CREATE POLICY staff_manage_all ON public.chat_messages AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.chat_recipients; CREATE POLICY staff_manage_all ON public.chat_recipients AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.finance_accounts; CREATE POLICY staff_manage_all ON public.finance_accounts AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.finance_installments; CREATE POLICY staff_manage_all ON public.finance_installments AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.finance_transactions; CREATE POLICY staff_manage_all ON public.finance_transactions AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.khadem_receipt_attachments; CREATE POLICY staff_manage_all ON public.khadem_receipt_attachments AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.khadems; CREATE POLICY staff_manage_all ON public.khadems AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.meeting_invitees; CREATE POLICY staff_manage_all ON public.meeting_invitees AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.meetings; CREATE POLICY staff_manage_all ON public.meetings AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.registration_requests; CREATE POLICY staff_manage_all ON public.registration_requests AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.service_records; CREATE POLICY staff_manage_all ON public.service_records AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.shrine_sites; CREATE POLICY staff_manage_all ON public.shrine_sites AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.tuition_dues; CREATE POLICY staff_manage_all ON public.tuition_dues AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.tuition_payments; CREATE POLICY staff_manage_all ON public.tuition_payments AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.tuition_settings; CREATE POLICY staff_manage_all ON public.tuition_settings AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.user_presence; CREATE POLICY staff_manage_all ON public.user_presence AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

DROP POLICY IF EXISTS staff_manage_all ON public.vehicles; CREATE POLICY staff_manage_all ON public.vehicles AS permissive FOR ALL TO authenticated USING (( SELECT private.is_staff() AS is_staff)) WITH CHECK (( SELECT private.is_staff() AS is_staff));

CREATE INDEX IF NOT EXISTS chat_messages_v141_conversation_type_created_at_idx ON public.chat_messages USING btree (conversation_type, created_at);

CREATE INDEX IF NOT EXISTS chat_messages_v141_recipient_id_idx ON public.chat_messages USING btree (recipient_id);

CREATE INDEX IF NOT EXISTS chat_messages_v141_sender_id_idx ON public.chat_messages USING btree (sender_id);

CREATE INDEX IF NOT EXISTS idx_access_controls_granted_by ON public.account_access_controls USING btree (granted_by);

CREATE INDEX IF NOT EXISTS idx_account_access_controls_user_id ON public.account_access_controls USING btree (user_id);

CREATE INDEX IF NOT EXISTS idx_app_settings_updated_by ON public.app_settings USING btree (updated_by);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id ON public.audit_logs USING btree (actor_user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs USING btree (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_user_id ON public.chat_messages USING btree (sender_user_id);

CREATE INDEX IF NOT EXISTS idx_chat_recipients_user_id ON public.chat_recipients USING btree (user_id);

CREATE INDEX IF NOT EXISTS idx_finance_installments_finance_transaction_id ON public.finance_installments USING btree (finance_transaction_id);

CREATE INDEX IF NOT EXISTS idx_finance_installments_khadem_id ON public.finance_installments USING btree (khadem_id);

CREATE INDEX IF NOT EXISTS idx_finance_installments_transaction ON public.finance_installments USING btree (transaction_id);

CREATE INDEX IF NOT EXISTS idx_finance_transactions_account_id ON public.finance_transactions USING btree (account_id);

CREATE INDEX IF NOT EXISTS idx_finance_transactions_created_by ON public.finance_transactions USING btree (created_by);

CREATE INDEX IF NOT EXISTS idx_finance_transactions_khadem_date ON public.finance_transactions USING btree (khadem_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_meeting_invitees_khadem_id ON public.meeting_invitees USING btree (khadem_id);

CREATE INDEX IF NOT EXISTS idx_meeting_invitees_meeting ON public.meeting_invitees USING btree (meeting_id);

CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON public.meetings USING btree (created_by);

CREATE INDEX IF NOT EXISTS idx_receipt_attachments_uploaded_by ON public.khadem_receipt_attachments USING btree (uploaded_by);

CREATE INDEX IF NOT EXISTS idx_receipts_record ON public.khadem_receipt_attachments USING btree (record_table, record_id);

CREATE INDEX IF NOT EXISTS idx_registration_requests_reviewed_by ON public.registration_requests USING btree (reviewed_by);

CREATE INDEX IF NOT EXISTS idx_registration_requests_user_status ON public.registration_requests USING btree (user_id, status);

CREATE INDEX IF NOT EXISTS idx_service_records_created_by ON public.service_records USING btree (created_by);

CREATE INDEX IF NOT EXISTS idx_service_records_khadem_date ON public.service_records USING btree (khadem_id, service_date DESC);

CREATE INDEX IF NOT EXISTS idx_service_records_shrine_id ON public.service_records USING btree (shrine_id);

CREATE INDEX IF NOT EXISTS idx_tuition_dues_khadem_period ON public.tuition_dues USING btree (khadem_id, period_month);

CREATE INDEX IF NOT EXISTS idx_tuition_payments_due ON public.tuition_payments USING btree (tuition_due_id);

CREATE INDEX IF NOT EXISTS idx_tuition_payments_finance_transaction_id ON public.tuition_payments USING btree (finance_transaction_id);

CREATE INDEX IF NOT EXISTS idx_tuition_payments_khadem_id ON public.tuition_payments USING btree (khadem_id);

CREATE TRIGGER v141_sync_chat_compat_fields BEFORE INSERT OR UPDATE ON chat_messages FOR EACH ROW EXECUTE FUNCTION private.sync_v141_compat_fields();

CREATE TRIGGER v141_sync_vehicle_compat_fields BEFORE INSERT OR UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION private.sync_v141_compat_fields();

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.account_access_controls TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.account_access_controls TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.account_access_controls TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.app_settings TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.app_settings TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.app_settings TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.audit_logs TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.audit_logs TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.audit_logs TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.chat_messages TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.chat_messages TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.chat_messages TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.chat_recipients TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.chat_recipients TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.chat_recipients TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.finance_accounts TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.finance_accounts TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.finance_accounts TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.finance_installments TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.finance_installments TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.finance_installments TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.finance_transactions TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.finance_transactions TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.finance_transactions TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.khadem_receipt_attachments TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.khadem_receipt_attachments TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.khadem_receipt_attachments TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.khadems TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.khadems TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.khadems TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.meeting_invitees TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.meeting_invitees TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.meeting_invitees TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.meetings TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.meetings TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.meetings TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.profiles TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.profiles TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.profiles TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.registration_requests TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.registration_requests TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.registration_requests TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.service_records TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.service_records TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.service_records TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.shrine_sites TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.shrine_sites TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.shrine_sites TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.tuition_dues TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.tuition_dues TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.tuition_dues TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.tuition_payments TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.tuition_payments TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.tuition_payments TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.tuition_settings TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.tuition_settings TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.tuition_settings TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.user_presence TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.user_presence TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.user_presence TO service_role;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.vehicles TO anon;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.vehicles TO authenticated;

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE public.vehicles TO service_role;

GRANT USAGE ON SCHEMA private TO authenticated;
