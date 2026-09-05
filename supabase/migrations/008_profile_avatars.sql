-- ============================================================
-- DIRECT GAIN
-- Profile avatars — private bucket, path ownership,
-- profiles.avatar_path integrity
-- Migration 008
--
-- Additive. Does not modify 001–007 files or rewrite
-- public.profiles columns. avatar_path already exists
-- on public.profiles (004).
--
-- Product:
-- One circular identity photo per Direct Gain profile.
-- Personal and business accounts share this system.
-- Initials remain valid when avatar_path is null.
--
-- Privacy:
-- Bucket is private. Database stores storage path only.
-- Signed URLs are presentation-only and must not be stored.
-- Uploaded objects are expected to be client-normalized
-- JPEG re-encodes. This migration does NOT strip EXIF.
--
-- Path:
--   {owner_user_id}/{object_uuid}.jpg
-- Owner is always auth.uid() / profiles.id.
--
-- Integrity gap closed:
-- 004 UPDATE RLS lets an owner set avatar_path to any
-- string matching the 004 check (including another
-- user's valid object name). This migration rejects
-- avatar_path values that are not null and not owned
-- by the same profile id.
-- ============================================================


-- ============================================================
-- PATH HELPERS
-- ============================================================

create or replace function public.is_profile_avatar_storage_path(
  object_name text,
  owner_id uuid
)
returns boolean
language sql
immutable
as $$
  select
    owner_id is not null
    and object_name is not null
    and object_name ~
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$'
    and split_part(object_name, '/', 1)
      = owner_id::text;
$$;


create or replace function public.profile_avatar_path_owner_id(
  object_name text
)
returns uuid
language sql
immutable
as $$
  select
    case
      when
        object_name ~
          '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$'
      then
        nullif(
          split_part(object_name, '/', 1),
          ''
        )::uuid
      else
        null
    end;
$$;


-- ============================================================
-- AVATAR PATH OWNERSHIP ON profiles
-- Authenticated clients may only set avatar_path to null
-- or to an object they own under {profiles.id}/{uuid}.jpg.
-- Superuser/maintenance roles skip this (same pattern as
-- 004 account-type protection).
-- ============================================================

create or replace function public.profiles_protect_avatar_path()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if
    current_user
      not in (
        'authenticated',
        'anon'
      )
  then
    return new;
  end if;

  if
    new.avatar_path
      is not distinct from old.avatar_path
  then
    return new;
  end if;

  if new.avatar_path is null then
    return new;
  end if;

  if auth.uid() is distinct from new.id then
    raise exception
      'Only the profile owner can set an avatar.';
  end if;

  if not public.is_profile_avatar_storage_path(
    new.avatar_path,
    new.id
  ) then
    raise exception
      'Avatar path must belong to this profile.';
  end if;

  return new;
end;
$$;


drop trigger if exists
  profiles_protect_avatar_path
on public.profiles;

create trigger
  profiles_protect_avatar_path
before update
on public.profiles
for each row
execute function public.profiles_protect_avatar_path();


-- ============================================================
-- PRIVATE BUCKET
-- file_size_limit 512 KiB matches client avatar cap.
-- JPEG only.
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'profile-avatars',
  'profile-avatars',
  false,
  (512 * 1024),
  array['image/jpeg']::text[]
)
on conflict (id) do nothing;

do $$
declare
  bucket_public boolean;
  bucket_limit bigint;
  bucket_mimes text[];
begin
  select
    buckets."public",
    buckets.file_size_limit,
    buckets.allowed_mime_types
  into
    bucket_public,
    bucket_limit,
    bucket_mimes
  from storage.buckets as buckets
  where buckets.id = 'profile-avatars';

  if not found then
    raise exception
      'profile-avatars storage bucket was not created.';
  end if;

  if
    bucket_public is distinct from false
    or bucket_limit is distinct from (512 * 1024)
    or bucket_mimes is distinct from array['image/jpeg']::text[]
  then
    raise exception
      'profile-avatars storage bucket already exists with unexpected configuration.';
  end if;
end;
$$;


-- ============================================================
-- STORAGE POLICIES
-- SELECT: any authenticated member (future public profiles).
-- INSERT: owner folder only, new unique objects.
-- DELETE: owner folder only.
-- No UPDATE/upsert: replace by uploading a new object.
-- ============================================================

drop policy if exists
  "Authenticated users can read profile-avatar objects"
on storage.objects;

create policy
  "Authenticated users can read profile-avatar objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'profile-avatars'
  and public.profile_avatar_path_owner_id(name)
    is not null
);


drop policy if exists
  "Users can upload their own profile-avatar objects"
on storage.objects;

create policy
  "Users can upload their own profile-avatar objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-avatars'
  and public.is_profile_avatar_storage_path(
    name,
    auth.uid()
  )
);


drop policy if exists
  "Users can delete their own profile-avatar objects"
on storage.objects;

create policy
  "Users can delete their own profile-avatar objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-avatars'
  and public.is_profile_avatar_storage_path(
    name,
    auth.uid()
  )
);


-- ============================================================
-- FUNCTION GRANTS
-- ============================================================

revoke all on function public.is_profile_avatar_storage_path(text, uuid) from public;
revoke all on function public.is_profile_avatar_storage_path(text, uuid) from anon;
grant execute on function public.is_profile_avatar_storage_path(text, uuid) to authenticated;

revoke all on function public.profile_avatar_path_owner_id(text) from public;
revoke all on function public.profile_avatar_path_owner_id(text) from anon;
grant execute on function public.profile_avatar_path_owner_id(text) to authenticated;

revoke all on function public.profiles_protect_avatar_path() from public;
revoke all on function public.profiles_protect_avatar_path() from anon;
revoke all on function public.profiles_protect_avatar_path() from authenticated;
