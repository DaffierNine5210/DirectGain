-- ============================================================
-- DIRECT GAIN
-- Professional Résumé v1
-- Migration 017
--
-- Additive. Does not modify 001–016 files.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
--
-- Product:
-- One current private PDF résumé per Professional profile.
-- NOT a chat attachment. NOT Portfolio media.
-- NOT Direct Gain-verified. NOT public.
-- Does NOT reuse conversation-attachments,
-- professional-portfolio, profile-avatars, or job-media.
--
-- Product lock:
-- Professional remains owner-preview-only.
-- This migration does NOT write
-- profile_presentation.active_template.
-- Table and Storage SELECT are owner-only
-- (profile_id = auth.uid()). Widen later when
-- Professional is public with an explicit viewer model.
--
-- Does NOT:
-- - add résumé version history
-- - add DOC/DOCX/Excel/text
-- - add contact actions
-- - overwrite Professional core / skills / experience /
--   credentials / Portfolio
--
-- Writes go through:
--   save_own_professional_resume(...)
--   remove_own_professional_resume()
-- Clients SELECT. Clients cannot INSERT/UPDATE/DELETE
-- table rows.
--
-- Postgres and Storage are not one transaction.
-- Upload the object first, then save metadata.
-- Replacement: upload a NEW object UUID, save metadata,
-- then delete the previous object. This SQL does not
-- delete Storage objects.
--
-- MIME/extension checks are NOT malware scanning.
-- Direct Gain does not currently scan résumé files.
-- The PDF remains untrusted content.
--
-- Ambiguity:
-- RETURNS TABLE includes profile_id, so the stub
-- professional_profiles insert MUST use
-- ON CONFLICT ON CONSTRAINT professional_profiles_pkey
-- (Migration 015), never ON CONFLICT (profile_id).
-- ============================================================


-- ============================================================
-- PATH VALIDATION
-- Object name / storage_path:
-- {profile_id}/{object_id}.pdf
-- Both ids lowercase UUID text.
-- ============================================================

create or replace function public.is_professional_resume_storage_path(
  object_path text,
  expected_profile_id uuid
)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select
    object_path is not null
    and expected_profile_id is not null
    and object_path = lower(object_path)
    and position('://' in object_path) = 0
    and position('..' in object_path) = 0
    and position('//' in object_path) = 0
    and left(object_path, 1) <> '/'
    and object_path ~
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$'
    and split_part(object_path, '/', 1)
      = expected_profile_id::text;
$$;


create or replace function public.professional_resume_path_profile_id(
  object_path text
)
returns uuid
language plpgsql
immutable
set search_path = public, pg_temp
as $$
begin
  if
    object_path is null
    or object_path <> lower(object_path)
    or object_path !~
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$'
  then
    return null;
  end if;

  if not public.is_professional_resume_storage_path(
    object_path,
    split_part(object_path, '/', 1)::uuid
  ) then
    return null;
  end if;

  return split_part(object_path, '/', 1)::uuid;
end;
$$;


-- Display-only filename. Rejects oversize/unsafe names
-- instead of silently truncating. Does not prove the
-- PDF contents are safe.

create or replace function public.normalize_professional_resume_filename(
  p_value text
)
returns text
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  next_name text;
  stem text;
begin
  next_name := replace(coalesce(p_value, ''), '\', '/');

  if position('/' in next_name) > 0 then
    next_name := split_part(
      next_name,
      '/',
      array_length(string_to_array(next_name, '/'), 1)
    );
  end if;

  next_name := btrim(next_name);
  next_name := regexp_replace(next_name, '\s+', ' ', 'g');

  if next_name = '' then
    return null;
  end if;

  if next_name ~ '[[:cntrl:]]' then
    return null;
  end if;

  if
    position('..' in next_name) > 0
    or position('/' in next_name) > 0
    or position('://' in next_name) > 0
  then
    return null;
  end if;

  if char_length(next_name) not between 5 and 120 then
    return null;
  end if;

  if lower(right(next_name, 4)) is distinct from '.pdf' then
    return null;
  end if;

  stem := btrim(left(next_name, char_length(next_name) - 4));

  if stem = '' or stem = '.' then
    return null;
  end if;

  return stem || '.pdf';
end;
$$;


-- ============================================================
-- TABLE: professional_resumes
-- Current résumé only. PK = profile_id (0 or 1 row).
-- ============================================================

create table if not exists public.professional_resumes (
  profile_id uuid
    primary key
    references public.professional_profiles(profile_id)
    on delete cascade,

  storage_path text
    not null,

  mime_type text
    not null,

  byte_size bigint
    not null,

  original_filename text
    not null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint professional_resumes_mime_type_check
    check (mime_type = 'application/pdf'),

  constraint professional_resumes_byte_size_check
    check (
      byte_size > 0
      and byte_size <= (5 * 1024 * 1024)
    ),

  constraint professional_resumes_storage_path_format_check
    check (
      public.is_professional_resume_storage_path(
        storage_path,
        profile_id
      )
    ),

  constraint professional_resumes_storage_path_key
    unique (storage_path),

  constraint professional_resumes_original_filename_check
    check (
      original_filename
        = public.normalize_professional_resume_filename(
          original_filename
        )
      and char_length(original_filename) between 5 and 120
    )
);


comment on table public.professional_resumes is
  'Current owner Professional résumé metadata. One PDF per profile. Private storage_path only; never store signed or public URLs. MIME/filename checks are not malware scanning.';

comment on column public.professional_resumes.storage_path is
  'Private bucket object name: {profile_id}/{object_id}.pdf';

comment on column public.professional_resumes.original_filename is
  'Display filename only. Not used as the Storage object name.';


drop trigger if exists
  professional_resumes_set_updated_at
on public.professional_resumes;

create trigger
  professional_resumes_set_updated_at
before update
on public.professional_resumes
for each row
execute function public.set_updated_at();


create or replace function public.professional_resumes_protect_identity()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if
    new.profile_id is distinct from old.profile_id
  then
    raise exception
      'Professional résumé cannot be moved to another account.';
  end if;

  if
    new.created_at is distinct from old.created_at
  then
    raise exception
      'Professional résumé created_at cannot be changed.';
  end if;

  return new;
end;
$$;


drop trigger if exists
  professional_resumes_protect_identity
on public.professional_resumes;

create trigger
  professional_resumes_protect_identity
before update
on public.professional_resumes
for each row
execute function public.professional_resumes_protect_identity();


-- ============================================================
-- SAVE RPC
-- Typed parameters. Caller cannot supply profile_id.
-- ============================================================

create or replace function public.save_own_professional_resume(
  p_storage_path text,
  p_mime_type text,
  p_byte_size bigint,
  p_original_filename text
)
returns table (
  profile_id uuid,
  storage_path text,
  mime_type text,
  byte_size bigint,
  original_filename text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  next_storage_path text;
  next_mime_type text;
  next_filename text;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to update your Professional résumé.';
  end if;

  if not exists (
    select 1
    from public.profiles as profiles
    where profiles.id = current_user_id
  ) then
    raise exception
      'Your profile could not be found.';
  end if;

  next_storage_path :=
    public.normalize_professional_text(p_storage_path);

  next_mime_type :=
    public.normalize_professional_text(p_mime_type);

  next_filename :=
    public.normalize_professional_resume_filename(
      p_original_filename
    );

  if next_storage_path is null
    or not public.is_professional_resume_storage_path(
      next_storage_path,
      current_user_id
    )
  then
    raise exception
      'Résumé path is not valid.';
  end if;

  if next_mime_type is distinct from 'application/pdf' then
    raise exception
      'Résumés must be PDF files.';
  end if;

  if
    p_byte_size is null
    or p_byte_size <= 0
    or p_byte_size > (5 * 1024 * 1024)
  then
    raise exception
      'Résumés must be 5 MB or smaller.';
  end if;

  if next_filename is null then
    raise exception
      'Choose a valid PDF filename.';
  end if;

  insert into public.professional_profiles as professional_profiles (
    profile_id
  )
  values (
    current_user_id
  )
  on conflict
    on constraint professional_profiles_pkey
  do nothing;

  insert into public.professional_resumes as resumes (
    profile_id,
    storage_path,
    mime_type,
    byte_size,
    original_filename
  )
  values (
    current_user_id,
    next_storage_path,
    next_mime_type,
    p_byte_size,
    next_filename
  )
  on conflict
    on constraint professional_resumes_pkey
  do update set
    storage_path = excluded.storage_path,
    mime_type = excluded.mime_type,
    byte_size = excluded.byte_size,
    original_filename = excluded.original_filename;

  return query
  select
    resumes.profile_id,
    resumes.storage_path,
    resumes.mime_type,
    resumes.byte_size,
    resumes.original_filename,
    resumes.created_at,
    resumes.updated_at
  from public.professional_resumes as resumes
  where resumes.profile_id = current_user_id;
end;
$$;


-- ============================================================
-- REMOVE RPC
-- Deletes metadata only. Returns the storage_path the
-- client should delete afterwards, or null if none.
-- ============================================================

create or replace function public.remove_own_professional_resume()
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  removed_storage_path text;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to remove your Professional résumé.';
  end if;

  delete from public.professional_resumes as resumes
  where resumes.profile_id = current_user_id
  returning resumes.storage_path
  into removed_storage_path;

  return removed_storage_path;
end;
$$;


-- ============================================================
-- RLS / GRANTS
-- Owner-preview SELECT only. Writes are RPC-only.
-- ============================================================

alter table public.professional_resumes
enable row level security;

revoke all
on table public.professional_resumes
from public;

revoke all
on table public.professional_resumes
from anon;

revoke all
on table public.professional_resumes
from authenticated;

grant select
on table public.professional_resumes
to authenticated;


drop policy if exists
  "Owners can read their professional résumé"
on public.professional_resumes;

create policy
  "Owners can read their professional résumé"
on public.professional_resumes
for select
to authenticated
using (
  profile_id = auth.uid()
);


-- ============================================================
-- PRIVATE BUCKET
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'professional-resumes',
  'professional-resumes',
  false,
  (5 * 1024 * 1024),
  array['application/pdf']::text[]
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
  where buckets.id = 'professional-resumes';

  if not found then
    raise exception
      'professional-resumes storage bucket was not created.';
  end if;

  if
    bucket_public is distinct from false
    or bucket_limit is distinct from (5 * 1024 * 1024)
    or bucket_mimes is distinct from array['application/pdf']::text[]
  then
    raise exception
      'professional-resumes storage bucket already exists with unexpected configuration.';
  end if;
end;
$$;


-- Storage SELECT requires a matching metadata row.
-- Draft uploads are not readable until save.
-- INSERT/DELETE are path-owned so the owner can
-- upload before metadata and remove orphans.
-- No UPDATE policy: replacement uses a new object UUID.

drop policy if exists
  "Owners can read their professional-resumes objects"
on storage.objects;

create policy
  "Owners can read their professional-resumes objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'professional-resumes'
  and public.professional_resume_path_profile_id(name)
    = auth.uid()
  and exists (
    select 1
    from public.professional_resumes as resumes
    where resumes.storage_path = name
      and resumes.profile_id = auth.uid()
  )
);


drop policy if exists
  "Owners can upload professional-resumes objects"
on storage.objects;

create policy
  "Owners can upload professional-resumes objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'professional-resumes'
  and public.is_professional_resume_storage_path(
    name,
    public.professional_resume_path_profile_id(name)
  )
  and public.professional_resume_path_profile_id(name)
    = auth.uid()
);


drop policy if exists
  "Owners can delete professional-resumes objects"
on storage.objects;

create policy
  "Owners can delete professional-resumes objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'professional-resumes'
  and public.is_professional_resume_storage_path(
    name,
    public.professional_resume_path_profile_id(name)
  )
  and public.professional_resume_path_profile_id(name)
    = auth.uid()
);


revoke all
on function public.is_professional_resume_storage_path(text, uuid)
from public;

revoke all
on function public.is_professional_resume_storage_path(text, uuid)
from anon;

grant execute
on function public.is_professional_resume_storage_path(text, uuid)
to authenticated;

revoke all
on function public.professional_resume_path_profile_id(text)
from public;

revoke all
on function public.professional_resume_path_profile_id(text)
from anon;

grant execute
on function public.professional_resume_path_profile_id(text)
to authenticated;

revoke all
on function public.normalize_professional_resume_filename(text)
from public;

revoke all
on function public.normalize_professional_resume_filename(text)
from anon;

revoke all
on function public.normalize_professional_resume_filename(text)
from authenticated;

revoke all
on function public.professional_resumes_protect_identity()
from public;

revoke all
on function public.professional_resumes_protect_identity()
from anon;

revoke all
on function public.professional_resumes_protect_identity()
from authenticated;

revoke all
on function public.save_own_professional_resume(text, text, bigint, text)
from public;

revoke all
on function public.save_own_professional_resume(text, text, bigint, text)
from anon;

revoke all
on function public.save_own_professional_resume(text, text, bigint, text)
from authenticated;

grant execute
on function public.save_own_professional_resume(text, text, bigint, text)
to authenticated;

revoke all
on function public.remove_own_professional_resume()
from public;

revoke all
on function public.remove_own_professional_resume()
from anon;

revoke all
on function public.remove_own_professional_resume()
from authenticated;

grant execute
on function public.remove_own_professional_resume()
to authenticated;
