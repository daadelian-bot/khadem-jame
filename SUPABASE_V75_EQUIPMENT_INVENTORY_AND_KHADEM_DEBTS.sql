-- Version 75: equipment inventory, committee account, and khadem-level item debts.
-- Applied to Supabase project fxxtyfurdzpzfvweoppo on 2026-10-13.
-- All money values in these equipment tables are stored in TOMAN. When a payment is
-- mirrored to finance_transactions, it is converted to RIAL (1 toman = 10 rials).
-- Access is restricted to authenticated users who pass the account-access gate and finance.manage.

create table public.equipment_committee_receipts (
  id uuid primary key default gen_random_uuid(),
  received_date date not null default current_date,
  received_from text not null default 'هیئت',
  reference_no text,
  notes text,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.equipment_committee_receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.equipment_committee_receipts(id) on delete restrict,
  item_key text not null check (item_key in ('white_cap','cream_cap','vest','fringe')),
  quantity integer not null check (quantity > 0),
  unit_cost_toman numeric(14,0) not null check (unit_cost_toman >= 0),
  total_cost_toman numeric(16,0) generated always as (quantity::numeric * unit_cost_toman) stored,
  notes text,
  created_at timestamptz not null default now()
);

create table public.equipment_committee_payments (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.equipment_committee_receipts(id) on delete restrict,
  amount_toman numeric(14,0) not null check (amount_toman > 0),
  paid_date date not null default current_date,
  payment_method text,
  reference_no text,
  notes text,
  finance_transaction_id uuid references public.finance_transactions(id) on delete set null,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.khadem_equipment_issues (
  id uuid primary key default gen_random_uuid(),
  khadem_id uuid not null references public.khadems(id) on delete restrict,
  source_receipt_item_id uuid references public.equipment_committee_receipt_items(id) on delete set null,
  item_key text not null check (item_key in ('white_cap','cream_cap','vest','fringe','service_shirt')),
  quantity integer not null default 1 check (quantity > 0),
  unit_price_toman numeric(14,0) not null check (unit_price_toman >= 0),
  total_amount_toman numeric(16,0) generated always as (quantity::numeric * unit_price_toman) stored,
  issue_status text not null default 'pending' check (issue_status in ('pending','delivered','returned')),
  issue_date date not null default current_date,
  delivery_date date,
  tailor_name text,
  shirt_size text,
  order_date date,
  notes text,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (item_key = 'service_shirt' or (tailor_name is null and shirt_size is null and order_date is null))
);

create table public.khadem_equipment_payments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.khadem_equipment_issues(id) on delete restrict,
  amount_toman numeric(14,0) not null check (amount_toman > 0),
  paid_date date not null default current_date,
  payment_method text,
  reference_no text,
  notes text,
  finance_transaction_id uuid references public.finance_transactions(id) on delete set null,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create index equipment_receipt_items_receipt_idx on public.equipment_committee_receipt_items(receipt_id);
create index equipment_committee_payments_receipt_idx on public.equipment_committee_payments(receipt_id);
create index khadem_equipment_issues_khadem_idx on public.khadem_equipment_issues(khadem_id, issue_date desc);
create index khadem_equipment_issues_item_idx on public.khadem_equipment_issues(item_key, issue_status);
create index khadem_equipment_payments_issue_idx on public.khadem_equipment_payments(issue_id, paid_date desc);

alter table public.equipment_committee_receipts enable row level security;
alter table public.equipment_committee_receipt_items enable row level security;
alter table public.equipment_committee_payments enable row level security;
alter table public.khadem_equipment_issues enable row level security;
alter table public.khadem_equipment_payments enable row level security;

grant select, insert, update, delete on public.equipment_committee_receipts to authenticated;
grant select, insert, update, delete on public.equipment_committee_receipt_items to authenticated;
grant select, insert, update, delete on public.equipment_committee_payments to authenticated;
grant select, insert, update, delete on public.khadem_equipment_issues to authenticated;
grant select, insert, update, delete on public.khadem_equipment_payments to authenticated;

create policy equipment_committee_receipts_finance_manage on public.equipment_committee_receipts
for all to authenticated
using (private.account_access_allowed() and has_app_permission('finance.manage'))
with check (private.account_access_allowed() and has_app_permission('finance.manage'));

create policy equipment_committee_receipt_items_finance_manage on public.equipment_committee_receipt_items
for all to authenticated
using (private.account_access_allowed() and has_app_permission('finance.manage'))
with check (private.account_access_allowed() and has_app_permission('finance.manage'));

create policy equipment_committee_payments_finance_manage on public.equipment_committee_payments
for all to authenticated
using (private.account_access_allowed() and has_app_permission('finance.manage'))
with check (private.account_access_allowed() and has_app_permission('finance.manage'));

create policy khadem_equipment_issues_finance_manage on public.khadem_equipment_issues
for all to authenticated
using (private.account_access_allowed() and has_app_permission('finance.manage'))
with check (private.account_access_allowed() and has_app_permission('finance.manage'));

create policy khadem_equipment_payments_finance_manage on public.khadem_equipment_payments
for all to authenticated
using (private.account_access_allowed() and has_app_permission('finance.manage'))
with check (private.account_access_allowed() and has_app_permission('finance.manage'));
