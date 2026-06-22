create extension if not exists pgcrypto;

create table if not exists public.waiting_list (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'home',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists waiting_list_email_unique
  on public.waiting_list (lower(email));

create or replace function public.set_waiting_list_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_waiting_list_updated_at on public.waiting_list;
create trigger trg_waiting_list_updated_at
before update on public.waiting_list
for each row execute procedure public.set_waiting_list_updated_at();

alter table public.waiting_list enable row level security;

drop policy if exists "waiting_list_insert_public" on public.waiting_list;
create policy "waiting_list_insert_public"
on public.waiting_list
for insert
to anon, authenticated
with check (true);

drop policy if exists "waiting_list_select_owner_only" on public.waiting_list;
create policy "waiting_list_select_owner_only"
on public.waiting_list
for select
to authenticated
using (false);
