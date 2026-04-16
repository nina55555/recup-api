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

drop policy if exists "contact messages insert public" on public.contact_messages;
create policy "contact messages insert public"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

drop policy if exists "contact messages read all" on public.contact_messages;
create policy "contact messages read all"
on public.contact_messages
for select
to anon, authenticated
using (true);
