-- سامانه جامع مدیریت خادمین: گفت‌وگوی داخلی و تماس صوتی
-- این فایل مستندِ تغییرات اعمال‌شده روی Supabase است؛ روی پایگاه داده‌ای که این تغییرات را دارد دوباره اجرا نشود.
create table if not exists public.chat_conversations (
 id uuid primary key default gen_random_uuid(),
 kind text not null default 'direct' check(kind in ('direct','group')),
 title text,
 created_by uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.chat_members (
 conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 member_role text not null default 'member' check(member_role in ('owner','admin','member')),
 joined_at timestamptz not null default now(),
 last_read_at timestamptz,
 primary key(conversation_id,user_id)
);
create table if not exists public.chat_call_signals (
 id uuid primary key default gen_random_uuid(),
 conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
 call_id uuid not null,
 sender_id uuid not null references auth.users(id) on delete cascade,
 recipient_id uuid not null references auth.users(id) on delete cascade,
 event_type text not null check(event_type in ('offer','answer','ice','accept','reject','end','busy')),
 payload jsonb not null default '{}'::jsonb check(octet_length(payload::text)<=32768),
 created_at timestamptz not null default now(),
 check(sender_id<>recipient_id)
);
alter table public.chat_messages add column if not exists conversation_id uuid references public.chat_conversations(id) on delete cascade;
alter table public.chat_messages drop constraint if exists chat_messages_private_recipient_check;
alter table public.chat_messages drop constraint if exists chat_messages_conversation_type_check;
alter table public.chat_messages add constraint chat_messages_conversation_type_check check(conversation_type=any(array['public','private','group']));
alter table public.chat_messages add constraint chat_messages_private_recipient_check check(
 (conversation_type='public' and recipient_id is null and conversation_id is null) or
 (conversation_type='private' and recipient_id is not null and conversation_id is null) or
 (conversation_type='group' and recipient_id is null and conversation_id is not null)
);
create index if not exists chat_members_user_idx on public.chat_members(user_id,joined_at desc);
create index if not exists chat_messages_conversation_time_idx on public.chat_messages(conversation_id,created_at desc);
create index if not exists chat_calls_recipient_time_idx on public.chat_call_signals(recipient_id,created_at desc);
alter table public.chat_conversations enable row level security;
alter table public.chat_members enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_call_signals enable row level security;
create or replace function public.chat_is_member(p_conversation_id uuid)
returns boolean language sql stable security definer set search_path=public,auth
as $$ select auth.uid() is not null and exists(select 1 from public.chat_members m where m.conversation_id=p_conversation_id and m.user_id=auth.uid()) $$;
revoke all on function public.chat_is_member(uuid) from public,anon;
grant execute on function public.chat_is_member(uuid) to authenticated;
create or replace function public.chat_directory()
returns table(id uuid,display_name text,role text) language plpgsql security definer set search_path=public,auth as $$
begin
 if auth.uid() is null or not public.has_app_permission('chat.view') then raise exception 'اجازه دسترسی به گفت‌وگوی سامانه را ندارید.'; end if;
 return query select p.id,coalesce(nullif(p.display_name,''),nullif(p.full_name,''),nullif(p.username,''),'کاربر سامانه')::text,p.role::text from public.profiles p where p.is_active=true order by coalesce(nullif(p.display_name,''),nullif(p.full_name,''),nullif(p.username,''),'کاربر سامانه');
end; $$;
revoke all on function public.chat_directory() from public,anon;
grant execute on function public.chat_directory() to authenticated;
-- has_app_permission must treat chat permissions as enabled by default for active users,
-- but honor explicit chat=false or chat.create/update/delete=false settings.
create or replace function public.has_app_permission(p_permission text)
returns boolean language plpgsql stable security definer set search_path=public,pg_temp as $function$
declare v_uid uuid:=auth.uid(); v_role text; v_user_permissions jsonb; v_module text; v_action text;
begin
 if v_uid is null or p_permission is null or length(trim(p_permission))=0 then return false; end if;
 select p.role into v_role from public.profiles p where p.id=v_uid and p.is_active=true limit 1;
 if v_role='admin' then return true; end if;
 if v_role not in ('manager','user') or v_role is null then return false; end if;
 if p_permission in ('chat.view','chat.create','chat.update','chat.delete') then
  select uap.permissions into v_user_permissions from public.user_access_profiles uap where uap.user_id=v_uid and uap.is_custom=true limit 1;
  if v_user_permissions is null or jsonb_typeof(v_user_permissions)<>'object' then return true; end if;
  if v_user_permissions ? 'chat' and v_user_permissions->>'chat'='false' then return false; end if;
  if v_user_permissions ? p_permission then return v_user_permissions->>p_permission='true'; end if;
  return true;
 end if;
 select uap.permissions into v_user_permissions from public.user_access_profiles uap where uap.user_id=v_uid and uap.is_custom=true limit 1;
 if v_user_permissions is null or jsonb_typeof(v_user_permissions)<>'object' then return false; end if;
 if p_permission ~ '^[a-zA-Z0-9_]+[.](create|update|delete|view|manage)$' then
  v_module:=split_part(p_permission,'.',1); v_action:=split_part(p_permission,'.',2);
  if v_action='view' or v_action='manage' then return v_user_permissions->>v_module='true'; end if;
  if v_user_permissions ? p_permission then return v_user_permissions->>p_permission='true'; end if;
  return false;
 end if;
 return false;
end; $function$;
drop policy if exists account_access_gate on public.chat_messages;
drop policy if exists chat_read_public_or_participant on public.chat_messages;
drop policy if exists chat_insert_own_public_or_private on public.chat_messages;
drop policy if exists "chat update own" on public.chat_messages;
drop policy if exists chat_conversations_select_member on public.chat_conversations;
create policy chat_conversations_select_member on public.chat_conversations for select to authenticated using(created_by=auth.uid() or public.chat_is_member(id));
drop policy if exists chat_conversations_insert_authorized on public.chat_conversations;
create policy chat_conversations_insert_authorized on public.chat_conversations for insert to authenticated with check(created_by=auth.uid() and public.has_app_permission('chat.create'));
drop policy if exists chat_conversations_update_owner on public.chat_conversations;
create policy chat_conversations_update_owner on public.chat_conversations for update to authenticated using(created_by=auth.uid() and public.has_app_permission('chat.view')) with check(created_by=auth.uid() and public.has_app_permission('chat.view'));
drop policy if exists chat_members_select_member on public.chat_members;
create policy chat_members_select_member on public.chat_members for select to authenticated using(public.chat_is_member(conversation_id));
drop policy if exists chat_members_insert_owner on public.chat_members;
create policy chat_members_insert_owner on public.chat_members for insert to authenticated with check(public.has_app_permission('chat.create') and exists(select 1 from public.chat_conversations c where c.id=chat_members.conversation_id and c.created_by=auth.uid()));
drop policy if exists chat_members_update_self on public.chat_members;
create policy chat_members_update_self on public.chat_members for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists chat_messages_select_authorized on public.chat_messages;
create policy chat_messages_select_authorized on public.chat_messages for select to authenticated using(
 deleted_at is null and public.has_app_permission('chat.view') and
 ((conversation_type='public' and recipient_id is null and conversation_id is null) or
 (conversation_type='private' and (sender_id=auth.uid() or recipient_id=auth.uid()) and conversation_id is null) or
 (conversation_type='group' and public.chat_is_member(conversation_id))
);
drop policy if exists chat_messages_insert_authorized on public.chat_messages;
create policy chat_messages_insert_authorized on public.chat_messages for insert to authenticated with check(
 sender_id=auth.uid() and public.has_app_permission('chat.create') and
 ((conversation_type='public' and recipient_id is null and conversation_id is null) or
 (conversation_type='private' and recipient_id is not null and recipient_id<>auth.uid() and conversation_id is null) or
 (conversation_type='group' and recipient_id is null and public.chat_is_member(conversation_id)))
);
drop policy if exists chat_messages_update_own_authorized on public.chat_messages;
create policy chat_messages_update_own_authorized on public.chat_messages for update to authenticated using(sender_id=auth.uid() and public.has_app_permission('chat.update')) with check(sender_id=auth.uid() and public.has_app_permission('chat.update'));
drop policy if exists chat_messages_delete_own_authorized on public.chat_messages;
create policy chat_messages_delete_own_authorized on public.chat_messages for delete to authenticated using(sender_id=auth.uid() and public.has_app_permission('chat.delete'));
drop policy if exists chat_calls_select_members on public.chat_call_signals;
create policy chat_calls_select_members on public.chat_call_signals for select to authenticated using(public.has_app_permission('chat.view') and (sender_id=auth.uid() or recipient_id=auth.uid()) and public.chat_is_member(conversation_id));
drop policy if exists chat_calls_insert_members on public.chat_call_signals;
create policy chat_calls_insert_members on public.chat_call_signals for insert to authenticated with check(sender_id=auth.uid() and recipient_id<>auth.uid() and public.has_app_permission('chat.view') and public.chat_is_member(conversation_id) and exists(select 1 from public.chat_members m where m.conversation_id=chat_call_signals.conversation_id and m.user_id=chat_call_signals.recipient_id));
grant select,insert,update,delete on public.chat_conversations,public.chat_members,public.chat_messages,public.chat_call_signals to authenticated;
do $$ begin alter publication supabase_realtime add table public.chat_conversations; exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.chat_members; exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.chat_messages; exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.chat_call_signals; exception when duplicate_object then null; when undefined_object then null; end $$;