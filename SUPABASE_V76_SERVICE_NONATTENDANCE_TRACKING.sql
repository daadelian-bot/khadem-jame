-- Version 76: minimal follow-up for khadems who cannot attend a planned service after preparation/payments.
-- Applied to Supabase project fxxtyfurdzpzfvweoppo on 2026-10-13.
-- This records an exception only; it does not create a completed service record or alter existing financial transactions.
create table public.khadem_service_nonattendance (
  id uuid primary key default gen_random_uuid(),
  khadem_id uuid not null references public.khadems(id) on delete restrict,
  service_kind text not null check (service_kind in ('official','friday_night')),
  planned_service_date date not null,
  preparation_completed boolean not null default true,
  cost_total_toman numeric(14,0) not null default 0 check (cost_total_toman >= 0),
  cost_paid_toman numeric(14,0) not null default 0 check (cost_paid_toman >= 0),
  reason_code text not null check (reason_code in ('border_exit_issue','illness','family_emergency','other')),
  reason_details text,
  resolution_status text not null default 'pending' check (resolution_status in ('pending','rescheduled','refunded','not_refundable','closed')),
  refund_amount_toman numeric(14,0) not null default 0 check (refund_amount_toman >= 0),
  notes text,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cost_paid_toman <= cost_total_toman),
  check (refund_amount_toman <= cost_paid_toman),
  check (resolution_status <> 'refunded' or refund_amount_toman > 0)
);
create index khadem_service_nonattendance_khadem_idx on public.khadem_service_nonattendance(khadem_id, planned_service_date desc);
create index khadem_service_nonattendance_kind_date_idx on public.khadem_service_nonattendance(service_kind, planned_service_date desc);
alter table public.khadem_service_nonattendance enable row level security;
grant select, insert, update, delete on public.khadem_service_nonattendance to authenticated;
create policy khadem_service_nonattendance_finance_manage on public.khadem_service_nonattendance
  for all to authenticated
  using (private.account_access_allowed() and has_app_permission('finance.manage'))
  with check (private.account_access_allowed() and has_app_permission('finance.manage'));
