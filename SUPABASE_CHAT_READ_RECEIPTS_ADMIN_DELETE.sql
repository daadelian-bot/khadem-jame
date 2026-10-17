-- Applied to Supabase project fxxtyfurdzpzfvweoppo on 2026-10-17.
-- Enables per-member read receipts and lets active primary admins remove a message for everyone.
-- This is a migration record; the live migration has already been applied.

drop policy if exists chat_members_update_self_read on public.chat_members;
create policy chat_members_update_self_read
on public.chat_members for update to authenticated
using (user_id = auth.uid() and public.chat_is_member(conversation_id))
with check (user_id = auth.uid() and public.chat_is_member(conversation_id));

drop policy if exists chat_messages_admin_manage on public.chat_messages;
create policy chat_messages_admin_manage
on public.chat_messages for update to authenticated
using (
  public.has_app_permission('chat.view')
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_active = true and p.role = 'admin'
  )
)
with check (
  public.has_app_permission('chat.view')
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_active = true and p.role = 'admin'
  )
);

grant update on public.chat_members to authenticated;
grant update on public.chat_messages to authenticated;
