-- Payment and Escrow System
-- Adds support for payment tracking, escrow management, and OEM financial dashboard

-- Payment status enum
create type public.payment_status as enum (
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'cancelled'
);

-- Payment type enum
create type public.payment_type as enum (
  'deposit',
  'balance',
  'full_payment',
  'milestone',
  'refund'
);

-- Payment method enum
create type public.payment_method as enum (
  'credit_card',
  'bank_transfer',
  'paypal',
  'stripe',
  'wire_transfer',
  'other'
);

-- Escrow status enum
create type public.escrow_status as enum (
  'pending',
  'held',
  'released',
  'refunded',
  'disputed'
);

-- Withdrawal status enum
create type public.withdrawal_status as enum (
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled'
);

-- Payments table - tracks all payment transactions
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  buyer_org_id uuid not null references public.organizations(id),
  oem_org_id uuid not null references public.organizations(id),
  
  -- Payment details
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'THB',
  payment_type public.payment_type not null,
  payment_method public.payment_method,
  status public.payment_status not null default 'pending',
  
  -- Gateway information
  gateway_name text, -- 'stripe', 'paypal', etc
  gateway_transaction_id text,
  gateway_response jsonb,
  
  -- Metadata
  description text,
  metadata jsonb,
  
  -- Timestamps
  paid_at timestamptz,
  failed_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  
  -- Indexes
  constraint unique_gateway_transaction unique (gateway_name, gateway_transaction_id)
);

create index idx_payments_order_id on public.payments(order_id);
create index idx_payments_buyer_org_id on public.payments(buyer_org_id);
create index idx_payments_oem_org_id on public.payments(oem_org_id);
create index idx_payments_status on public.payments(status);
create index idx_payments_created_at on public.payments(created_at desc);

create trigger payments_updated_at
before update on public.payments
for each row
execute function public.set_updated_at();

-- Escrow table - manages held funds for orders
create table public.escrow (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  
  -- Parties
  buyer_org_id uuid not null references public.organizations(id),
  oem_org_id uuid not null references public.organizations(id),
  
  -- Escrow details
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'THB',
  status public.escrow_status not null default 'pending',
  
  -- Release conditions
  release_conditions jsonb, -- e.g., {"type": "on_delivery", "requires_approval": true}
  auto_release_date timestamptz, -- automatic release date if conditions met
  
  -- Actions
  held_at timestamptz,
  released_at timestamptz,
  released_to uuid references public.organizations(id), -- Usually oem_org_id
  released_by uuid references public.profiles(id), -- Admin or automated system
  refunded_at timestamptz,
  
  -- Metadata
  notes text,
  metadata jsonb,
  
  -- Timestamps
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index idx_escrow_order_id on public.escrow(order_id);
create index idx_escrow_oem_org_id on public.escrow(oem_org_id);
create index idx_escrow_status on public.escrow(status);
create index idx_escrow_auto_release_date on public.escrow(auto_release_date);

create trigger escrow_updated_at
before update on public.escrow
for each row
execute function public.set_updated_at();

-- Withdrawals table - tracks OEM withdrawal requests
create table public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  oem_org_id uuid not null references public.organizations(id),
  
  -- Withdrawal details
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'THB',
  status public.withdrawal_status not null default 'pending',
  
  -- Bank details (encrypted in production)
  bank_name text,
  account_number text,
  account_holder_name text,
  bank_details jsonb, -- additional routing info, SWIFT, etc
  
  -- Processing
  requested_by uuid not null references public.profiles(id),
  processed_by uuid references public.profiles(id), -- Admin who processed
  processed_at timestamptz,
  
  -- Gateway information
  gateway_name text,
  gateway_transaction_id text,
  gateway_response jsonb,
  
  -- Failure tracking
  failure_reason text,
  failed_at timestamptz,
  
  -- Metadata
  notes text,
  metadata jsonb,
  
  -- Timestamps
  requested_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index idx_withdrawals_oem_org_id on public.withdrawals(oem_org_id);
create index idx_withdrawals_status on public.withdrawals(status);
create index idx_withdrawals_requested_at on public.withdrawals(requested_at desc);

create trigger withdrawals_updated_at
before update on public.withdrawals
for each row
execute function public.set_updated_at();

-- OEM Financial Dashboard View
-- Calculates available balance, escrow balance, and total earnings for OEMs
create or replace view public.oem_financials as
select
  o.id as oem_org_id,
  o.display_name as oem_name,
  
  -- Total earnings (all completed payments)
  coalesce(sum(p.amount) filter (where p.status = 'completed'), 0) as total_earnings,
  
  -- Money in escrow (held funds)
  coalesce(sum(e.amount) filter (where e.status = 'held'), 0) as escrow_balance,
  
  -- Money released from escrow (available for withdrawal)
  coalesce(sum(e.amount) filter (where e.status = 'released'), 0) as released_balance,
  
  -- Total withdrawn
  coalesce(sum(w.amount) filter (where w.status = 'completed'), 0) as total_withdrawn,
  
  -- Pending withdrawals
  coalesce(sum(w.amount) filter (where w.status in ('pending', 'processing')), 0) as pending_withdrawals,
  
  -- Available to withdraw (released - withdrawn - pending)
  coalesce(sum(e.amount) filter (where e.status = 'released'), 0) - 
  coalesce(sum(w.amount) filter (where w.status in ('completed', 'pending', 'processing')), 0) as available_balance,
  
  -- Statistics
  count(distinct p.id) filter (where p.status = 'completed') as total_transactions,
  count(distinct e.id) filter (where e.status = 'held') as active_escrows,
  
  -- Last updated
  greatest(
    max(p.updated_at),
    max(e.updated_at),
    max(w.updated_at)
  ) as last_transaction_at

from public.organizations o
left join public.payments p on p.oem_org_id = o.id
left join public.escrow e on e.oem_org_id = o.id
left join public.withdrawals w on w.oem_org_id = o.id
where o.type = 'oem'
group by o.id, o.display_name;

-- Add comment
comment on view public.oem_financials is 'Aggregated financial data for OEM dashboard showing earnings, escrow, and withdrawal balances';

-- Row Level Security Policies

-- Payments
alter table public.payments enable row level security;

create policy "Users can view payments for their organization"
  on public.payments for select
  using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id in (buyer_org_id, oem_org_id)
        and om.profile_id = auth.uid()
    )
  );

create policy "Buyers can create payments for their orders"
  on public.payments for insert
  with check (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = buyer_org_id
        and om.profile_id = auth.uid()
    )
  );

create policy "System can update payment records"
  on public.payments for update
  using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id in (buyer_org_id, oem_org_id)
        and om.profile_id = auth.uid()
    )
  );

-- Escrow
alter table public.escrow enable row level security;

create policy "Users can view escrow for their organization"
  on public.escrow for select
  using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id in (buyer_org_id, oem_org_id)
        and om.profile_id = auth.uid()
    )
  );

create policy "Buyers can create escrow records"
  on public.escrow for insert
  with check (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = buyer_org_id
        and om.profile_id = auth.uid()
    )
  );

create policy "System can update escrow records"
  on public.escrow for update
  using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id in (buyer_org_id, oem_org_id)
        and om.profile_id = auth.uid()
    )
  );

-- Withdrawals
alter table public.withdrawals enable row level security;

create policy "OEMs can view their withdrawals"
  on public.withdrawals for select
  using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = oem_org_id
        and om.profile_id = auth.uid()
    )
  );

create policy "OEMs can create withdrawal requests"
  on public.withdrawals for insert
  with check (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = oem_org_id
        and om.profile_id = auth.uid()
    )
  );

-- Grant permissions
grant select on public.oem_financials to authenticated;
grant all on public.payments to authenticated;
grant all on public.escrow to authenticated;
grant all on public.withdrawals to authenticated;

-- Helper function to get OEM available balance
create or replace function public.get_oem_available_balance(p_oem_org_id uuid)
returns numeric
language plpgsql
security definer
as $$
declare
  v_available numeric;
begin
  select available_balance into v_available
  from public.oem_financials
  where oem_org_id = p_oem_org_id;
  
  return coalesce(v_available, 0);
end;
$$;

-- Helper function to create withdrawal request
create or replace function public.create_withdrawal_request(
  p_oem_org_id uuid,
  p_amount numeric,
  p_bank_name text,
  p_account_number text,
  p_account_holder_name text,
  p_notes text,
  p_requested_by uuid
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_withdrawal_id uuid;
begin
  insert into public.withdrawals (
    oem_org_id,
    amount,
    currency,
    status,
    bank_name,
    account_number,
    account_holder_name,
    notes,
    requested_by,
    requested_at
  ) values (
    p_oem_org_id,
    p_amount,
    'THB',
    'pending',
    p_bank_name,
    p_account_number,
    p_account_holder_name,
    p_notes,
    p_requested_by,
    timezone('utc', now())
  )
  returning id into v_withdrawal_id;
  
  return v_withdrawal_id;
end;
$$;

-- Helper function to get OEM withdrawals
create or replace function public.get_oem_withdrawals(p_oem_org_id uuid)
returns table (
  id uuid,
  amount numeric,
  currency text,
  status withdrawal_status,
  requested_at timestamptz,
  processed_at timestamptz,
  failure_reason text,
  bank_name text,
  account_holder_name text
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    w.id,
    w.amount,
    w.currency,
    w.status,
    w.requested_at,
    w.processed_at,
    w.failure_reason,
    w.bank_name,
    w.account_holder_name
  from public.withdrawals w
  where w.oem_org_id = p_oem_org_id
  order by w.requested_at desc;
end;
$$;

