-- Additive compatibility migration for the currently uploaded v141 index.html.
-- Preserves existing columns, rows, RLS policies, and authentication requirements.
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS capacity integer,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'available';

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS sender_id uuid,
  ADD COLUMN IF NOT EXISTS body text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS recipient_id uuid,
  ADD COLUMN IF NOT EXISTS conversation_type text NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_sender_id_fkey' AND conrelid = 'public.chat_messages'::regclass) THEN
    ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_sender_id_fkey
      FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_recipient_id_fkey' AND conrelid = 'public.chat_messages'::regclass) THEN
    ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_recipient_id_fkey
      FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION private.sync_v141_compat_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
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
$$;

DROP TRIGGER IF EXISTS v141_sync_vehicle_compat_fields ON public.vehicles;
CREATE TRIGGER v141_sync_vehicle_compat_fields
BEFORE INSERT OR UPDATE ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION private.sync_v141_compat_fields();

DROP TRIGGER IF EXISTS v141_sync_chat_compat_fields ON public.chat_messages;
CREATE TRIGGER v141_sync_chat_compat_fields
BEFORE INSERT OR UPDATE ON public.chat_messages
FOR EACH ROW EXECUTE FUNCTION private.sync_v141_compat_fields();

CREATE INDEX IF NOT EXISTS chat_messages_v141_sender_id_idx ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS chat_messages_v141_recipient_id_idx ON public.chat_messages(recipient_id);
CREATE INDEX IF NOT EXISTS chat_messages_v141_conversation_type_created_at_idx ON public.chat_messages(conversation_type, created_at);
