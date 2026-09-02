-- ============================================================
-- DIRECT GAIN
-- Jobs media v1 — metadata table, private bucket, RLS
-- Migration 007
--
-- Additive. Does not modify 001–006, jobs lifecycle,
-- messaging, or Storage buckets other than job-media.
--
-- Product:
-- Optional 0–5 photos per job.
-- Photos only. No video.
-- Cover image is position 0. No separate cover column.
-- Text-only jobs remain first-class (zero rows).
--
-- Privacy:
-- Stored objects are expected to be client-normalized
-- JPEG re-encodes. This migration does NOT strip EXIF/GPS.
-- expo-image-picker must not be assumed to strip GPS.
-- Future upload code must re-encode before shipping.
--
-- Consistency:
-- Postgres and Storage are not one transaction.
-- Future app flow: upload object, then insert metadata.
-- If metadata insert fails, delete the object immediately.
-- Crash orphans are a later cleanup concern.
-- Do not store signed URLs. Database stores storage_path only.
--
-- Visibility vs can_read_job():
-- 006 replaced jobs SELECT so it uses row-local predicates
-- instead of can_read_job(id). That helper still exists in
-- 005 with equivalent predicates, but it is SECURITY DEFINER
-- and was the cause of INSERT ... RETURNING failure on jobs.
--
-- job_media SELECT does NOT call can_read_job().
-- Canonical jobs SELECT remains the 006 policy on public.jobs.
-- This migration does not change that policy.
--
-- Child/media authorization uses SECURITY INVOKER
-- job_is_readable_by_current_user(job_id), which copies the
-- FINAL 006 predicates. Those predicates MUST stay synchronized
-- with the jobs SELECT policy. Do not "fix duplication" by
-- switching media back to can_read_job().
--
-- Child INSERT ... RETURNING does not re-query job_media
-- through a nested helper on the new media row.
--
-- Readable when parent job is:
--   open, assigned, or completed
--   OR viewer is poster
--   OR viewer is assigned worker
--   OR viewer has an application
-- Cancelled jobs: poster / assigned worker / applicant only.
--
-- Storage SELECT:
-- Object read requires a matching public.job_media row
-- (storage_path = object name) that the viewer can read
-- under job_media RLS / 006 parent visibility.
-- Orphan uploads without metadata are not readable.
-- Poster DELETE of storage objects remains path-owned so
-- a later cleanup can remove orphans.
--
-- Reorder:
-- Clients must not swap positions with independent
-- statements (0→1 and 1→0 collide). Future reorder is an
-- atomic transaction/RPC using the deferrable unique
-- constraint. Slice A grants UPDATE(position) only.
-- ============================================================


-- ============================================================
-- PARENT VISIBILITY (006-equivalent, invoker)
--
-- Keep in lockstep with public.jobs SELECT (migration 006).
-- Adversarial QA must include visibility parity.
-- ============================================================

create or replace function public.job_is_readable_by_current_user(
  target_job_id uuid
)
returns boolean
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.jobs as jobs
    where jobs.id = target_job_id
      and (
        jobs.status in (
          'open',
          'assigned',
          'completed'
        )
        or jobs.poster_id = auth.uid()
        or jobs.assigned_user_id = auth.uid()
        or exists (
          select 1
          from public.job_applications as applications
          where applications.job_id = jobs.id
            and applications.applicant_id = auth.uid()
        )
      )
  );
$$;


-- ============================================================
-- PATH VALIDATION
--
-- Expected object name / storage_path:
-- {job_id}/{uploader_id}/{object_id}.jpg
--
-- All three ids are lowercase UUID text.
-- No leading slash, no '..', no '://', no extra segments.
-- ============================================================

create or replace function public.is_job_media_storage_path(
  object_path text,
  expected_job_id uuid,
  expected_uploader_id uuid
)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select
    object_path is not null
    and expected_job_id is not null
    and expected_uploader_id is not null
    and object_path = lower(object_path)
    and position('://' in object_path) = 0
    and position('..' in object_path) = 0
    and position('//' in object_path) = 0
    and left(object_path, 1) <> '/'
    and object_path ~
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$'
    and split_part(object_path, '/', 1)
      = expected_job_id::text
    and split_part(object_path, '/', 2)
      = expected_uploader_id::text;
$$;


create or replace function public.job_media_path_job_id(
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
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$'
  then
    return null;
  end if;

  if not public.is_job_media_storage_path(
    object_path,
    split_part(object_path, '/', 1)::uuid,
    split_part(object_path, '/', 2)::uuid
  ) then
    return null;
  end if;

  return split_part(object_path, '/', 1)::uuid;
end;
$$;


-- ============================================================
-- JOB_MEDIA
--
-- jobs.poster_id is ON DELETE RESTRICT: jobs are not removed
-- when a profile is deleted. Product cancels jobs rather than
-- deleting them. job_applications already CASCADE if a job
-- row is ever deleted.
--
-- job_media is child metadata of a job, so job_id CASCADE
-- if that parent row is legitimately deleted.
-- uploader_id RESTRICT matches applications.applicant_id.
-- Storage objects are not deleted by this FK.
-- ============================================================

create table if not exists public.job_media (
  id uuid
    primary key
    default gen_random_uuid(),

  job_id uuid
    not null
    references public.jobs(id)
    on delete cascade,

  uploader_id uuid
    not null
    references public.profiles(id)
    on delete restrict,

  storage_path text
    not null,

  position smallint
    not null,

  media_type text
    not null
    default 'photo',

  mime_type text
    not null,

  byte_size integer
    not null,

  created_at timestamptz
    not null
    default now(),

  constraint job_media_media_type_check
    check (media_type = 'photo'),

  -- V1 stored objects are normalized JPEG only.
  -- Additional MIME types need a later additive migration.
  constraint job_media_mime_type_check
    check (mime_type = 'image/jpeg'),

  constraint job_media_byte_size_check
    check (
      byte_size > 0
      and byte_size <= (2 * 1024 * 1024)
    ),

  constraint job_media_position_check
    check (
      position >= 0
      and position <= 4
    ),

  constraint job_media_storage_path_format_check
    check (
      public.is_job_media_storage_path(
        storage_path,
        job_id,
        uploader_id
      )
    ),

  -- Unique per job, but DEFERRABLE so a later atomic
  -- reorder RPC can swap 0↔1 in one transaction.
  -- INITIALLY IMMEDIATE keeps ordinary inserts strict.
  -- Do not reorder with separate client UPDATEs.
  constraint job_media_job_id_position_key
    unique (job_id, position)
    deferrable initially immediate,

  constraint job_media_storage_path_key
    unique (storage_path)
);


comment on table public.job_media is
  'Optional job photos. Cover is position 0. Max 5 per job. Private storage_path only; never store signed URLs.';

comment on column public.job_media.storage_path is
  'Private bucket object name: {job_id}/{uploader_id}/{uuid}.jpg';

comment on column public.job_media.position is
  'Display order. 0 is the cover image. Reorder only via one atomic transaction.';


-- job_id lookups use the leftmost column of
-- job_media_job_id_position_key. No extra job_id index.


-- ============================================================
-- MAX FIVE PHOTOS
--
-- Lock the parent job row, then re-check poster/open on
-- that locked snapshot so a concurrent cancel/assign cannot
-- sneak a photo onto a closed job after a stale pre-check.
-- Concurrent inserts serialize on the same job row.
-- ============================================================

create or replace function public.job_media_enforce_max_photos()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  media_count integer;
  locked_poster_id uuid;
  locked_status text;
begin
  if new.uploader_id is distinct from auth.uid() then
    raise exception
      'Only the poster can add photos to an open job.';
  end if;

  select
    poster_id,
    status
  into
    locked_poster_id,
    locked_status
  from public.jobs
  where id = new.job_id
  for update;

  if not found then
    raise exception
      'That job does not exist.';
  end if;

  if
    locked_poster_id is distinct from auth.uid()
    or locked_status is distinct from 'open'
  then
    raise exception
      'Only the poster can add photos to an open job.';
  end if;

  select count(*)::integer
  into media_count
  from public.job_media
  where job_id = new.job_id;

  if media_count >= 5 then
    raise exception
      'A job can have at most 5 photos.';
  end if;

  return new;
end;
$$;


drop trigger if exists
  job_media_enforce_max_photos
on public.job_media;

create trigger
  job_media_enforce_max_photos
before insert
on public.job_media
for each row
execute function public.job_media_enforce_max_photos();


-- ============================================================
-- FREEZE IDENTITY / FILE METADATA
-- Clients may only change position (future reorder).
-- ============================================================

create or replace function public.job_media_protect_columns()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if
    new.id is distinct from old.id
    or new.job_id is distinct from old.job_id
    or new.uploader_id is distinct from old.uploader_id
    or new.storage_path is distinct from old.storage_path
    or new.media_type is distinct from old.media_type
    or new.mime_type is distinct from old.mime_type
    or new.byte_size is distinct from old.byte_size
    or new.created_at is distinct from old.created_at
  then
    raise exception
      'Job media file metadata cannot be changed.';
  end if;

  return new;
end;
$$;


drop trigger if exists
  job_media_protect_columns
on public.job_media;

create trigger
  job_media_protect_columns
before update
on public.job_media
for each row
execute function public.job_media_protect_columns();


-- ============================================================
-- RLS
-- ============================================================

alter table public.job_media
enable row level security;

revoke all
on table public.job_media
from public;

revoke all
on table public.job_media
from anon;

revoke all
on table public.job_media
from authenticated;

grant select
on table public.job_media
to authenticated;

grant insert (
  job_id,
  uploader_id,
  storage_path,
  position,
  media_type,
  mime_type,
  byte_size
)
on table public.job_media
to authenticated;

grant update (
  position
)
on table public.job_media
to authenticated;

-- UPDATE is position-only. File identity columns are frozen
-- by job_media_protect_columns. Independent multi-row swaps
-- are not supported; use a later atomic reorder RPC.

grant delete
on table public.job_media
to authenticated;


drop policy if exists
  "Authenticated users can read visible job media"
on public.job_media;

create policy
  "Authenticated users can read visible job media"
on public.job_media
for select
to authenticated
using (
  public.job_is_readable_by_current_user(job_id)
);


drop policy if exists
  "Posters can add media to their open jobs"
on public.job_media;

create policy
  "Posters can add media to their open jobs"
on public.job_media
for insert
to authenticated
with check (
  uploader_id = auth.uid()
  and public.is_job_poster(job_id)
  and public.is_open_job(job_id)
  and public.is_job_media_storage_path(
    storage_path,
    job_id,
    uploader_id
  )
);


drop policy if exists
  "Posters can reorder media on their open jobs"
on public.job_media;

create policy
  "Posters can reorder media on their open jobs"
on public.job_media
for update
to authenticated
using (
  public.is_job_poster(job_id)
  and public.is_open_job(job_id)
)
with check (
  public.is_job_poster(job_id)
  and public.is_open_job(job_id)
  and uploader_id = auth.uid()
);


drop policy if exists
  "Posters can delete media on their open jobs"
on public.job_media;

create policy
  "Posters can delete media on their open jobs"
on public.job_media
for delete
to authenticated
using (
  public.is_job_poster(job_id)
  and public.is_open_job(job_id)
);


-- ============================================================
-- PRIVATE BUCKET
--
-- New Direct Gain bucket. Do not silently rewrite an
-- unexpected existing job-media configuration.
-- Insert if missing; fail if present with different settings.
-- file_size_limit matches job_media.byte_size (2 MiB).
-- MIME matches normalized JPEG metadata.
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'job-media',
  'job-media',
  false,
  (2 * 1024 * 1024),
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
  where buckets.id = 'job-media';

  if not found then
    raise exception
      'job-media storage bucket was not created.';
  end if;

  if
    bucket_public is distinct from false
    or bucket_limit is distinct from (2 * 1024 * 1024)
    or bucket_mimes is distinct from array['image/jpeg']::text[]
  then
    raise exception
      'job-media storage bucket already exists with unexpected configuration.';
  end if;
end;
$$;


-- ============================================================
-- STORAGE POLICIES (bucket job-media only)
--
-- SELECT requires legitimate job_media metadata whose
-- storage_path matches the object name. job_media RLS
-- (006 parent visibility) applies to that EXISTS.
-- No recursive storage.objects lookup.
--
-- No UPDATE/upsert policy: clients must upload new objects.
-- DELETE stays poster/open/path-owned so orphans can be
-- removed without a metadata row.
-- ============================================================

drop policy if exists
  "Authenticated users can read authorized job-media objects"
on storage.objects;

create policy
  "Authenticated users can read authorized job-media objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'job-media'
  and public.job_media_path_job_id(name) is not null
  and exists (
    select 1
    from public.job_media as media
    where media.storage_path = name
      and public.job_is_readable_by_current_user(
        media.job_id
      )
  )
);


drop policy if exists
  "Posters can upload job-media objects to their open jobs"
on storage.objects;

create policy
  "Posters can upload job-media objects to their open jobs"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'job-media'
  and public.is_job_media_storage_path(
    name,
    public.job_media_path_job_id(name),
    auth.uid()
  )
  and split_part(name, '/', 2) = auth.uid()::text
  and public.is_job_poster(
    public.job_media_path_job_id(name)
  )
  and public.is_open_job(
    public.job_media_path_job_id(name)
  )
);


drop policy if exists
  "Posters can delete job-media objects on their open jobs"
on storage.objects;

create policy
  "Posters can delete job-media objects on their open jobs"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'job-media'
  and public.is_job_media_storage_path(
    name,
    public.job_media_path_job_id(name),
    auth.uid()
  )
  and split_part(name, '/', 2) = auth.uid()::text
  and public.is_job_poster(
    public.job_media_path_job_id(name)
  )
  and public.is_open_job(
    public.job_media_path_job_id(name)
  )
);


-- ============================================================
-- FUNCTION GRANTS
-- ============================================================

revoke all on function public.job_is_readable_by_current_user(uuid) from public;
revoke all on function public.job_is_readable_by_current_user(uuid) from anon;
grant execute on function public.job_is_readable_by_current_user(uuid) to authenticated;

revoke all on function public.is_job_media_storage_path(text, uuid, uuid) from public;
revoke all on function public.is_job_media_storage_path(text, uuid, uuid) from anon;
grant execute on function public.is_job_media_storage_path(text, uuid, uuid) to authenticated;

revoke all on function public.job_media_path_job_id(text) from public;
revoke all on function public.job_media_path_job_id(text) from anon;
grant execute on function public.job_media_path_job_id(text) to authenticated;

revoke all on function public.job_media_enforce_max_photos() from public;
revoke all on function public.job_media_enforce_max_photos() from anon;
revoke all on function public.job_media_enforce_max_photos() from authenticated;

revoke all on function public.job_media_protect_columns() from public;
revoke all on function public.job_media_protect_columns() from anon;
revoke all on function public.job_media_protect_columns() from authenticated;
