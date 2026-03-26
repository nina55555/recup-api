alter table public.profiles
  add column if not exists instagram_url text default '',
  add column if not exists facebook_url text default '',
  add column if not exists tiktok_url text default '',
  add column if not exists x_url text default '',
  add column if not exists youtube_url text default '',
  add column if not exists linkedin_url text default '';

create table if not exists public.profile_media (
  user_id uuid primary key references auth.users(id) on delete cascade,
  avatar_path text not null default '',
  story_image_path text not null default '',
  story_video_path text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.profile_media enable row level security;

drop policy if exists "profile media select own" on public.profile_media;
drop policy if exists "profile media insert own" on public.profile_media;
drop policy if exists "profile media update own" on public.profile_media;
drop policy if exists "profile media delete own" on public.profile_media;

create policy "profile media select own"
on public.profile_media
for select
to authenticated
using (user_id = auth.uid());

create policy "profile media insert own"
on public.profile_media
for insert
to authenticated
with check (user_id = auth.uid());

create policy "profile media update own"
on public.profile_media
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "profile media delete own"
on public.profile_media
for delete
to authenticated
using (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-media',
  'profile-media',
  false,
  20971520,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "profile media select signed access" on storage.objects;
drop policy if exists "profile media insert own" on storage.objects;
drop policy if exists "profile media update own" on storage.objects;
drop policy if exists "profile media delete own" on storage.objects;

create policy "profile media select signed access"
on storage.objects
for select
to authenticated
using (bucket_id = 'profile-media' and owner = auth.uid());

create policy "profile media insert own"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'profile-media' and owner = auth.uid());

create policy "profile media update own"
on storage.objects
for update
to authenticated
using (bucket_id = 'profile-media' and owner = auth.uid())
with check (bucket_id = 'profile-media' and owner = auth.uid());

create policy "profile media delete own"
on storage.objects
for delete
to authenticated
using (bucket_id = 'profile-media' and owner = auth.uid());
