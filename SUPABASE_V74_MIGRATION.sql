-- سامانه جامع خادمین مجموعة السیدة زینب سلام الله علیها
-- Migration 74: finance installments schema and access hardening
-- Safe to re-run: no existing finance rows are updated or deleted.
-- Review before applying to production. This migration is limited to finance_installments.

begin;

create table if not exists public.finance_installments (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null,
  khadem_id uuid null,
  installment_number integer not null,
  amount numeric not null,
  due_date date not null,
  paid_amount numeric not null default 0,
  paid_date date null,
  status text not null default 'pending',
  notes text null,
  created_by uuid null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.finance_installments
  add column if not exists transaction_id uuid,
  add column if not exists khadem_id uuid,
  add column if not exists installment_number integer,
  add column if not exists amount numeric,
  add column if not exists due_date date,
  add column if not exists paid_amount numeric not null default 0,
  add column if not exists paid_date date,
  add column if not exists status text not null default 'pending',
  add column if not exists notes text,
  add column if not exists created_by uuid default auth.uid(),
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $migration$
begin
  if not exists (select 1 from pg_constraint where conrelid='public.finance_installments'::regclass and conname='finance_installments_transaction_id_fkey') then
    alter table public.finance_installments
      add constraint finance_installments_transaction_id_fkey
      foreign key (transaction_id) references public.finance_transactions(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.finance_installments'::regclass and conname='finance_installments_khadem_id_fkey') then
    alter table public.finance_installments
      add constraint finance_installments_khadem_id_fkey
      foreign key (khadem_id) references public.khadems(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.finance_installments'::regclass and conname='finance_installments_installment_number_check') then
    alter table public.finance_installments
      add constraint finance_installments_installment_number_check check (installment_number > 0);
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.finance_installments'::regclass and conname='finance_installments_amount_check') then
    alter table public.finance_installments
      add constraint finance_installments_amount_check check (amount > 0);
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.finance_installments'::regclass and conname='finance_installments_paid_amount_check') then
    alter table public.finance_installments
      add constraint finance_installments_paid_amount_check check (paid_amount >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.finance_installments'::regclass and conname='finance_installments_check') then
    alter table public.finance_installments
      add constraint finance_installments_check check (paid_amount <= amount);
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.finance_installments'::regclass and conname='finance_installments_status_check') then
    alter table public.finance_installments
      add constraint finance_installments_status_check check (status in ('pending','paid','overdue','cancelled'));
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.finance_installments'::regclass and conname='finance_installments_transaction_id_installment_number_key') then
    alter table public.finance_installments
      add constraint finance_installments_transaction_id_installment_number_key unique (transaction_id, installment_number);
  end if;
end
$migration$;

create index if not exists finance_installments_due_idx
  on public.finance_installments (due_date, status);
create index if not exists finance_installments_tx_idx
  on public.finance_installments (transaction_id);

alter table public.finance_installments enable row level security;

-- Do not allow unauthenticated clients to reach financial installment rows.
revoke all on table public.finance_installments from anon;
grant select, insert, update, delete on table public.finance_installments to authenticated;
grant all on table public.finance_installments to service_role;

-- Rebuild policies so the global account gate and finance permission must BOTH pass.
-- Dropping account_access_gate is scoped to this table only; its condition is folded into
-- every policy below, avoiding PostgreSQL's permissive-policy OR behavior.
drop policy if exists account_access_gate on public.finance_installments;
drop policy if exists finance_installments_admin_permission_select on public.finance_installments;
drop policy if exists finance_installments_admin_permission_insert on public.finance_installments;
drop policy if exists finance_installments_admin_permission_update on public.finance_installments;
drop policy if exists finance_installments_admin_permission_delete on public.finance_installments;

create policy finance_installments_admin_permission_select
  on public.finance_installments for select to authenticated
  using (private.account_access_allowed() and public.has_app_permission('finance.manage'));

create policy finance_installments_admin_permission_insert
  on public.finance_installments for insert to authenticated
  with check (private.account_access_allowed() and public.has_app_permission('finance.manage'));

create policy finance_installments_admin_permission_update
  on public.finance_installments for update to authenticated
  using (private.account_access_allowed() and public.has_app_permission('finance.manage'))
  with check (private.account_access_allowed() and public.has_app_permission('finance.manage'));

create policy finance_installments_admin_permission_delete
  on public.finance_installments for delete to authenticated
  using (private.account_access_allowed() and public.has_app_permission('finance.manage'));

commit;
