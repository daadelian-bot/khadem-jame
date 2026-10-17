-- Applied to Supabase project fxxtyfurdzpzfvweoppo on 2026-10-17.
-- Restrict chat updates to the exact columns used by read receipts and admin removal.
revoke update on table public.chat_members from authenticated;
grant update (last_read_at) on table public.chat_members to authenticated;

revoke update on table public.chat_messages from authenticated;
grant update (body, edited_at) on table public.chat_messages to authenticated;
