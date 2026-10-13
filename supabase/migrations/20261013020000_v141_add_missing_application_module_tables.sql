-- Add the tables used by the uploaded v141 application modules.
-- Additive only: no existing tables or rows are deleted or rewritten.
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text,
  record_id uuid,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.app_labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label_key text NOT NULL UNIQUE,
  label_value text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.app_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text NOT NULL UNIQUE,
  title text NOT NULL,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_key text NOT NULL UNIQUE,
  title text NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id uuid NOT NULL REFERENCES public.app_roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
CREATE TABLE IF NOT EXISTS public.meeting_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  khadem_id uuid NOT NULL REFERENCES public.khadems(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'present',
  reason text,
  notes text,
  UNIQUE (meeting_id, khadem_id)
);
CREATE TABLE IF NOT EXISTS public.deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_date date NOT NULL,
  origin text,
  destination text,
  service_type text,
  responsible text,
  status text NOT NULL DEFAULT 'planned',
  notes text,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  khadem_id uuid REFERENCES public.khadems(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  phone text,
  license_no text,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.deployment_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id uuid NOT NULL REFERENCES public.deployments(id) ON DELETE CASCADE,
  khadem_id uuid NOT NULL REFERENCES public.khadems(id) ON DELETE RESTRICT,
  role_title text,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  UNIQUE (deployment_id, khadem_id)
);
CREATE TABLE IF NOT EXISTS public.deployment_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id uuid NOT NULL REFERENCES public.deployments(id) ON DELETE CASCADE,
  cost_type text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'proposed',
  notes text,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.fund_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  title text,
  transaction_type text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  notes text,
  status text NOT NULL DEFAULT 'posted',
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.donors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_code text UNIQUE,
  full_name text NOT NULL,
  phone text,
  donor_type text DEFAULT 'person',
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_code text UNIQUE,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.field_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key text NOT NULL,
  field_key text NOT NULL,
  label text NOT NULL,
  field_type text NOT NULL DEFAULT 'text',
  sort_order integer DEFAULT 0,
  is_required boolean DEFAULT false,
  is_enabled boolean DEFAULT true,
  is_system_field boolean DEFAULT false,
  is_sensitive boolean DEFAULT false,
  UNIQUE (module_key, field_key)
);
CREATE TABLE IF NOT EXISTS public.custom_field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid NOT NULL REFERENCES public.field_definitions(id) ON DELETE RESTRICT,
  record_id uuid NOT NULL,
  value_text text,
  value_number numeric,
  value_date date,
  value_json jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (field_id, record_id)
);
CREATE TABLE IF NOT EXISTS public.password_reset_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sending','otp_sent','completed','rejected','expired')),
  otp_hash text,
  otp_expires_at timestamptz,
  attempts smallint NOT NULL DEFAULT 0 CHECK (attempts >= 0 AND attempts <= 5),
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.signup_rate_limits (
  ip_hash text NOT NULL,
  window_start timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 1 CHECK (attempts >= 1),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (ip_hash, window_start)
);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'activity_logs','app_labels','app_roles','permissions','role_permissions',
    'meeting_attendance','deployments','drivers','deployment_participants',
    'deployment_costs','fund_transactions','donors','funds','field_definitions',
    'custom_field_values','password_reset_requests','signup_rate_limits'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname='staff_manage_all') THEN
      EXECUTE format(
        'CREATE POLICY staff_manage_all ON public.%I FOR ALL TO authenticated USING ((SELECT private.is_staff())) WITH CHECK ((SELECT private.is_staff()))',
        t
      );
    END IF;
  END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.activity_logs, public.app_labels, public.app_roles, public.permissions,
  public.role_permissions, public.meeting_attendance, public.deployments, public.drivers,
  public.deployment_participants, public.deployment_costs, public.fund_transactions,
  public.donors, public.funds, public.field_definitions, public.custom_field_values,
  public.password_reset_requests, public.signup_rate_limits
TO authenticated;

CREATE INDEX IF NOT EXISTS activity_logs_v141_created_at_idx ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS meeting_attendance_v141_khadem_idx ON public.meeting_attendance(khadem_id, meeting_id);
CREATE INDEX IF NOT EXISTS deployments_v141_date_idx ON public.deployments(deployment_date DESC);
CREATE INDEX IF NOT EXISTS deployment_participants_v141_khadem_idx ON public.deployment_participants(khadem_id);
CREATE INDEX IF NOT EXISTS deployment_costs_v141_deployment_idx ON public.deployment_costs(deployment_id);
CREATE INDEX IF NOT EXISTS fund_transactions_v141_date_idx ON public.fund_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS custom_field_values_v141_record_idx ON public.custom_field_values(record_id);
