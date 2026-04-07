-- Stripe + auctions settlement schema
-- Run this in Supabase SQL editor before deploying the new edge functions.

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists stripe_customer_id text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_stripe_customer_id_key'
  ) then
    alter table public.profiles
      add constraint profiles_stripe_customer_id_key unique (stripe_customer_id);
  end if;
end $$;

alter table public.models
  add column if not exists auction_end_at timestamptz,
  add column if not exists auction_settlement_status text not null default 'pending',
  add column if not exists auction_settled_at timestamptz,
  add column if not exists auction_winner_user_id uuid references auth.users(id),
  add column if not exists auction_winning_bid numeric,
  add column if not exists deposit_amount_cents integer,
  add column if not exists stripe_deposit_payment_intent_id text;

alter table public.bids
  add column if not exists accepted_auto_debit_terms boolean not null default false,
  add column if not exists auto_debit_percentage smallint not null default 50;

create table if not exists public.bidder_payment_methods (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_payment_method_id text not null,
  brand text not null default '',
  last4 text not null default '',
  exp_month integer,
  exp_year integer,
  is_default boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists bidder_payment_methods_pm_uidx
  on public.bidder_payment_methods(stripe_payment_method_id);

create table if not exists public.auction_bidder_consents (
  product_id text not null references public.models(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  accepted_terms_text text not null,
  accepted_at timestamptz not null default now(),
  first_bid_amount numeric,
  setup_intent_id text,
  primary key (product_id, user_id)
);

create table if not exists public.auction_charge_attempts (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.models(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  bid_amount numeric not null,
  amount_cents integer not null,
  stripe_payment_intent_id text,
  status text not null,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text
);

create index if not exists auction_charge_attempts_product_idx
  on public.auction_charge_attempts(product_id, created_at desc);

create index if not exists bids_product_amount_idx
  on public.bids(product_id, amount desc, created_at asc);

create unique index if not exists auction_charge_attempts_pi_uidx
  on public.auction_charge_attempts(stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

alter table public.bids
  drop constraint if exists bids_auto_debit_percentage_check;

alter table public.bids
  add constraint bids_auto_debit_percentage_check
  check (auto_debit_percentage >= 0 and auto_debit_percentage <= 100);

alter table public.bidder_payment_methods enable row level security;
alter table public.auction_bidder_consents enable row level security;
alter table public.auction_charge_attempts enable row level security;

drop policy if exists "bidder payment methods select own" on public.bidder_payment_methods;
create policy "bidder payment methods select own"
on public.bidder_payment_methods
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "auction consents select own" on public.auction_bidder_consents;
drop policy if exists "auction consents insert own" on public.auction_bidder_consents;
drop policy if exists "auction consents update own" on public.auction_bidder_consents;

create policy "auction consents select own"
on public.auction_bidder_consents
for select
to authenticated
using (user_id = auth.uid());

create policy "auction consents insert own"
on public.auction_bidder_consents
for insert
to authenticated
with check (user_id = auth.uid());

create policy "auction consents update own"
on public.auction_bidder_consents
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
