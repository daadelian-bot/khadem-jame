-- Align two legacy foreign keys and audit-log record identifier type after live-schema comparison.
-- audit_logs is empty in khadem-jame-next, so text-to-UUID conversion does not rewrite existing records.
ALTER TABLE public.audit_logs
  ALTER COLUMN record_id TYPE uuid USING NULLIF(record_id,'')::uuid;

DO $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='registration_requests_approved_by_fkey' AND conrelid='public.registration_requests'::regclass) THEN
  ALTER TABLE public.registration_requests ADD CONSTRAINT registration_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='account_access_controls_updated_by_fkey' AND conrelid='public.account_access_controls'::regclass) THEN
  ALTER TABLE public.account_access_controls ADD CONSTRAINT account_access_controls_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;
 END IF;
END $$;
