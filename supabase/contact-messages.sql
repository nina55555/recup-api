create extension if not exists pgcrypto;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages(created_at desc);

alter table public.contact_messages enable row level security;

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

alter table public.contact_messages
  add column if not exists user_id uuid references auth.users(id);

drop policy if exists "contact messages insert public" on public.contact_messages;
create policy "contact messages insert authenticated"
on public.contact_messages
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "contact messages read all" on public.contact_messages;
create policy "contact messages read owner_or_admin"
on public.contact_messages
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and coalesce(p.is_admin, false)
  )
);
