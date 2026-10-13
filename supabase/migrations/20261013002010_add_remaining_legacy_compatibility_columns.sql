-- Add columns found missing when comparing the new project to the old app schema.
-- No rows are deleted; new fields are nullable or have safe defaults.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.vehicles
 ADD COLUMN IF NOT EXISTS model text,
 ADD COLUMN IF NOT EXISTS plate text,
 ADD COLUMN IF NOT EXISTS owner_name text,
 ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.finance_transactions ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE public.registration_requests ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS edited_at timestamptz;
ALTER TABLE public.shrine_sites ADD COLUMN IF NOT EXISTS address text, ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS app_settings_v141_id_uidx ON public.app_settings(id);
ALTER TABLE public.tuition_settings
 ADD COLUMN IF NOT EXISTS effective_from date,
 ADD COLUMN IF NOT EXISTS updated_by uuid;
ALTER TABLE public.tuition_dues
 ADD COLUMN IF NOT EXISTS finance_transaction_id uuid,
 ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.tuition_payments ADD COLUMN IF NOT EXISTS created_by uuid;

DO $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='tuition_dues_finance_transaction_id_fkey' AND conrelid='public.tuition_dues'::regclass) THEN
  ALTER TABLE public.tuition_dues ADD CONSTRAINT tuition_dues_finance_transaction_id_fkey FOREIGN KEY (finance_transaction_id) REFERENCES public.finance_transactions(id) ON DELETE SET NULL;
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='tuition_dues_created_by_fkey' AND conrelid='public.tuition_dues'::regclass) THEN
  ALTER TABLE public.tuition_dues ADD CONSTRAINT tuition_dues_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='tuition_payments_created_by_fkey' AND conrelid='public.tuition_payments'::regclass) THEN
  ALTER TABLE public.tuition_payments ADD CONSTRAINT tuition_payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='tuition_settings_updated_by_fkey' AND conrelid='public.tuition_settings'::regclass) THEN
  ALTER TABLE public.tuition_settings ADD CONSTRAINT tuition_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;
 END IF;
END $$;

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
