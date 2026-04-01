alter table public.profiles
  add column if not exists phone text default '';

create table if not exists public.otp_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  purpose text not null check (purpose in ('login', 'recover_password', 'recover_email', 'profile_change')),
  phone text not null,
  target_email text,
  target_user_id uuid references auth.users(id) on delete set null,
  pseudo text,
  country text,
  code_hash text not null,
  attempt_count integer not null default 0,
  max_attempts integer not null default 5,
  expires_at timestamptz not null,
  verified_at timestamptz,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_otp_challenges_phone_purpose_created
  on public.otp_challenges (phone, purpose, created_at desc);

create index if not exists idx_otp_challenges_user_id_created
  on public.otp_challenges (user_id, created_at desc);

alter table public.otp_challenges enable row level security;
