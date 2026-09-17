-- ============================================================
-- DIRECT GAIN
-- Professional Portfolio v1
-- Migration 016
--
-- Additive. Does not modify 001–015 files.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
--
-- Product:
-- Owner-claimed work/project cards with 1–5 photos.
-- NOT posts. NOT completed Direct Gain jobs.
-- NOT Direct Gain-verified work.
-- NOT seller mock portfolio.
-- Does NOT reuse job-media, listing, or avatar buckets.
--
-- Product lock:
-- Professional remains owner-preview-only.
-- This migration does NOT write
-- profile_presentation.active_template.
-- Table and Storage SELECT are owner-only
-- (profile_id = auth.uid()). Widen later when
-- Professional is public.
--
-- Does NOT:
-- - add a completed_job_id FK (additive later)
-- - add résumé, contact actions, or verification flags
-- - overwrite Professional core / skills / experience /
--   credentials
--
-- Writes go through:
--   save_own_professional_portfolio(jsonb)
-- Nested collection. Empty [] clears all projects.
-- Clients SELECT. Clients cannot INSERT/UPDATE/DELETE
-- table rows.
--
-- Postgres and Storage are not one transaction.
-- Upload objects first, then save metadata.
-- If metadata save fails, the client should delete
-- the uploaded objects. Crash orphans are a later
-- cleanup concern. This migration does not delete
-- Storage objects from SQL.
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
-- {profile_id}/{project_id}/{object_id}.jpg
-- All three ids lowercase UUID text.
-- ============================================================

create or replace function public.is_professional_portfolio_storage_path(
  object_path text,
  expected_profile_id uuid,
  expected_project_id uuid
)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select
    object_path is not null
    and expected_profile_id is not null
    and expected_project_id is not null
    and object_path = lower(object_path)
    and position('://' in object_path) = 0
    and position('..' in object_path) = 0
    and position('//' in object_path) = 0
    and left(object_path, 1) <> '/'
    and object_path ~
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$'
    and split_part(object_path, '/', 1)
      = expected_profile_id::text
    and split_part(object_path, '/', 2)
      = expected_project_id::text;
$$;


create or replace function public.professional_portfolio_path_profile_id(
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

  if not public.is_professional_portfolio_storage_path(
    object_path,
    split_part(object_path, '/', 1)::uuid,
    split_part(object_path, '/', 2)::uuid
  ) then
    return null;
  end if;

  return split_part(object_path, '/', 1)::uuid;
end;
$$;


create or replace function public.professional_portfolio_path_project_id(
  object_path text
)
returns uuid
language plpgsql
immutable
set search_path = public, pg_temp
as $$
begin
  if public.professional_portfolio_path_profile_id(
    object_path
  ) is null then
    return null;
  end if;

  return split_part(object_path, '/', 2)::uuid;
end;
$$;


-- ============================================================
-- TABLE: professional_portfolio_projects
-- ============================================================

create table if not exists public.professional_portfolio_projects (
  id uuid
    primary key
    default gen_random_uuid(),

  profile_id uuid
    not null
    references public.professional_profiles(profile_id)
    on delete cascade,

  title text
    not null,

  description text,

  position smallint
    not null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint professional_portfolio_projects_title_check
    check (
      title = btrim(title)
      and char_length(title) between 2 and 80
    ),

  constraint professional_portfolio_projects_description_check
    check (
      description is null
      or (
        description = btrim(description)
        and char_length(description) between 1 and 800
      )
    ),

  constraint professional_portfolio_projects_position_check
    check (
      position between 0 and 11
    ),

  constraint professional_portfolio_projects_profile_position_key
    unique (profile_id, position)
    deferrable initially deferred
);


comment on table public.professional_portfolio_projects is
  'Owner-claimed Professional Portfolio projects. Not verified Direct Gain work. Max 12 per profile. At least one photo is enforced by the save RPC.';


drop trigger if exists
  professional_portfolio_projects_set_updated_at
on public.professional_portfolio_projects;

create trigger
  professional_portfolio_projects_set_updated_at
before update
on public.professional_portfolio_projects
for each row
execute function public.set_updated_at();


create or replace function public.professional_portfolio_projects_protect_identity()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.id is distinct from old.id then
    raise exception
      'Portfolio project id cannot be changed.';
  end if;

  if
    new.profile_id is distinct from old.profile_id
  then
    raise exception
      'Portfolio project cannot be moved to another account.';
  end if;

  if
    new.created_at is distinct from old.created_at
  then
    raise exception
      'Portfolio project created_at cannot be changed.';
  end if;

  return new;
end;
$$;


drop trigger if exists
  professional_portfolio_projects_protect_identity
on public.professional_portfolio_projects;

create trigger
  professional_portfolio_projects_protect_identity
before update
on public.professional_portfolio_projects
for each row
execute function public.professional_portfolio_projects_protect_identity();


-- ============================================================
-- TABLE: professional_portfolio_media
-- profile_id is denormalized for owner RLS, path CHECKs,
-- and Storage policies. Trigger keeps it aligned with
-- the parent project.
-- ============================================================

create table if not exists public.professional_portfolio_media (
  id uuid
    primary key
    default gen_random_uuid(),

  project_id uuid
    not null
    references public.professional_portfolio_projects(id)
    on delete cascade,

  profile_id uuid
    not null
    references public.professional_profiles(profile_id)
    on delete cascade,

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

  constraint professional_portfolio_media_type_check
    check (media_type = 'photo'),

  constraint professional_portfolio_media_mime_type_check
    check (mime_type = 'image/jpeg'),

  constraint professional_portfolio_media_byte_size_check
    check (
      byte_size > 0
      and byte_size <= (2 * 1024 * 1024)
    ),

  constraint professional_portfolio_media_position_check
    check (
      position between 0 and 4
    ),

  constraint professional_portfolio_media_storage_path_format_check
    check (
      public.is_professional_portfolio_storage_path(
        storage_path,
        profile_id,
        project_id
      )
    ),

  constraint professional_portfolio_media_project_position_key
    unique (project_id, position)
    deferrable initially deferred,

  constraint professional_portfolio_media_storage_path_key
    unique (storage_path)
);


comment on table public.professional_portfolio_media is
  'Portfolio project photos. Cover is position 0. Max 5 per project. Private storage_path only; never store signed URLs.';

comment on column public.professional_portfolio_media.storage_path is
  'Private bucket object name: {profile_id}/{project_id}/{object_id}.jpg';


create or replace function public.professional_portfolio_media_align_profile()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  parent_profile_id uuid;
begin
  select projects.profile_id
  into parent_profile_id
  from public.professional_portfolio_projects as projects
  where projects.id = new.project_id;

  if parent_profile_id is null then
    raise exception
      'That portfolio project could not be found.';
  end if;

  if new.profile_id is distinct from parent_profile_id then
    raise exception
      'Portfolio media must belong to the same Professional profile as its project.';
  end if;

  if tg_op = 'UPDATE' then
    if new.id is distinct from old.id then
      raise exception
        'Portfolio media id cannot be changed.';
    end if;

    if new.project_id is distinct from old.project_id then
      raise exception
        'Portfolio media cannot be moved to another project.';
    end if;

    if new.profile_id is distinct from old.profile_id then
      raise exception
        'Portfolio media cannot be moved to another account.';
    end if;

    if new.storage_path is distinct from old.storage_path then
      raise exception
        'Portfolio media storage path cannot be changed.';
    end if;

    if new.created_at is distinct from old.created_at then
      raise exception
        'Portfolio media created_at cannot be changed.';
    end if;
  end if;

  return new;
end;
$$;


drop trigger if exists
  professional_portfolio_media_align_profile
on public.professional_portfolio_media;

create trigger
  professional_portfolio_media_align_profile
before insert or update
on public.professional_portfolio_media
for each row
execute function public.professional_portfolio_media_align_profile();


-- ============================================================
-- WRITE RPC
-- Nested JSON array of projects. Each project MUST include
-- a client-generated id so photos can be uploaded first:
--   {profile_id}/{project_id}/{object_id}.jpg
-- Media entries require storage_path, mime_type, byte_size.
-- Media id is optional (stable when supplied and owned).
-- Payload order is dense position. RPC omits client position.
-- ============================================================

create or replace function public.save_own_professional_portfolio(
  p_entries jsonb
)
returns table (
  id uuid,
  profile_id uuid,
  title text,
  description text,
  sort_position smallint,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  entry_count integer;
  entry jsonb;
  media_entry jsonb;
  media_list jsonb;
  media_count integer;
  project_index integer := 0;
  media_index integer;
  entry_id uuid;
  media_id uuid;
  keep_project_ids uuid[] := '{}';
  keep_media_ids uuid[] := '{}';
  seen_storage_paths text[] := '{}';
  next_title text;
  next_description text;
  next_storage_path text;
  next_mime_type text;
  next_byte_size integer;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to update your Professional portfolio.';
  end if;

  if not exists (
    select 1
    from public.profiles as profiles
    where profiles.id = current_user_id
  ) then
    raise exception
      'Your profile could not be found.';
  end if;

  if p_entries is null
    or jsonb_typeof(p_entries) is distinct from 'array'
  then
    raise exception
      'Portfolio entries must be an array.';
  end if;

  entry_count := jsonb_array_length(p_entries);

  if entry_count > 12 then
    raise exception
      'You can add up to 12 portfolio projects.';
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

  for entry in
    select value
    from jsonb_array_elements(p_entries)
  loop
    perform public.professional_jsonb_reject_unknown_keys(
      entry,
      array[
        'id',
        'title',
        'description',
        'media'
      ]
    );

    entry_id :=
      public.professional_jsonb_optional_uuid(
        entry->'id',
        'Portfolio project id'
      );

    if entry_id is null then
      raise exception
        'Each portfolio project needs an id before photos can be saved.';
    end if;

    if entry_id = any (keep_project_ids) then
      raise exception
        'Each portfolio project can only appear once.';
    end if;

    if exists (
      select 1
      from public.professional_portfolio_projects as projects
      where projects.id = entry_id
        and projects.profile_id is distinct from current_user_id
    ) then
      raise exception
        'That portfolio project could not be found.';
    end if;

    keep_project_ids := array_append(keep_project_ids, entry_id);

    next_title :=
      public.normalize_professional_text(
        public.professional_jsonb_required_string(
          entry->'title',
          'Portfolio title'
        )
      );

    next_description :=
      public.normalize_professional_text(
        public.professional_jsonb_optional_string(
          entry->'description',
          'Portfolio description'
        )
      );

    if next_title is null
      or char_length(next_title) not between 2 and 80
    then
      raise exception
        'Portfolio title must be between 2 and 80 characters.';
    end if;

    if next_description is not null
      and char_length(next_description) > 800
    then
      raise exception
        'Keep the portfolio description to 800 characters or fewer.';
    end if;

    media_list := entry->'media';

    if media_list is null
      or jsonb_typeof(media_list) is distinct from 'array'
    then
      raise exception
        'Each portfolio project needs a photo list.';
    end if;

    media_count := jsonb_array_length(media_list);

    if media_count < 1 or media_count > 5 then
      raise exception
        'Each portfolio project needs between 1 and 5 photos.';
    end if;

    for media_entry in
      select value
      from jsonb_array_elements(media_list)
    loop
      perform public.professional_jsonb_reject_unknown_keys(
        media_entry,
        array[
          'id',
          'storage_path',
          'mime_type',
          'byte_size'
        ]
      );

      media_id :=
        public.professional_jsonb_optional_uuid(
          media_entry->'id',
          'Portfolio photo id'
        );

      if media_id is not null then
        if media_id = any (keep_media_ids) then
          raise exception
            'Each portfolio photo can only appear once.';
        end if;

        if exists (
          select 1
          from public.professional_portfolio_media as media
          where media.id = media_id
            and (
              media.profile_id is distinct from current_user_id
              or media.project_id is distinct from entry_id
            )
        ) then
          raise exception
            'That portfolio photo could not be found.';
        end if;

        keep_media_ids := array_append(keep_media_ids, media_id);
      end if;

      next_storage_path :=
        public.normalize_professional_text(
          public.professional_jsonb_required_string(
            media_entry->'storage_path',
            'Portfolio photo path'
          )
        );

      next_mime_type :=
        public.normalize_professional_text(
          public.professional_jsonb_required_string(
            media_entry->'mime_type',
            'Portfolio photo type'
          )
        );

      if jsonb_typeof(media_entry->'byte_size')
        is distinct from 'number'
        or (media_entry->>'byte_size') !~ '^[0-9]+$'
      then
        raise exception
          'Portfolio photo size must be a whole number.';
      end if;

      next_byte_size :=
        (media_entry->>'byte_size')::integer;

      if next_mime_type is distinct from 'image/jpeg' then
        raise exception
          'Portfolio photos must be JPEG.';
      end if;

      if next_byte_size is null
        or next_byte_size <= 0
        or next_byte_size > (2 * 1024 * 1024)
      then
        raise exception
          'Portfolio photos must be 2 MB or smaller.';
      end if;

      if next_storage_path = any (seen_storage_paths) then
        raise exception
          'Each portfolio photo path can only be used once.';
      end if;

      seen_storage_paths :=
        array_append(seen_storage_paths, next_storage_path);

      if not public.is_professional_portfolio_storage_path(
        next_storage_path,
        current_user_id,
        entry_id
      ) then
        raise exception
          'Portfolio photo path is not valid.';
      end if;

      if exists (
        select 1
        from public.professional_portfolio_media as media
        where media.storage_path = next_storage_path
          and (
            media.profile_id is distinct from current_user_id
            or (
              media_id is not null
              and media.id is distinct from media_id
            )
          )
      ) then
        raise exception
          'That portfolio photo could not be saved.';
      end if;
    end loop;
  end loop;

  delete from public.professional_portfolio_projects as projects
  where projects.profile_id = current_user_id
    and (
      coalesce(array_length(keep_project_ids, 1), 0) = 0
      or projects.id <> all (keep_project_ids)
    );

  delete from public.professional_portfolio_media as media
  where media.profile_id = current_user_id
    and media.project_id = any (keep_project_ids)
    and (
      coalesce(array_length(keep_media_ids, 1), 0) = 0
      or media.id <> all (keep_media_ids)
    );

  -- Media rows with omitted ids are replaced by insert below.
  -- Rows whose ids were not listed are deleted above.
  -- New media (no id) must not collide with remaining rows.

  project_index := 0;

  for entry in
    select value
    from jsonb_array_elements(p_entries)
  loop
    entry_id :=
      public.professional_jsonb_optional_uuid(
        entry->'id',
        'Portfolio project id'
      );

    next_title :=
      public.normalize_professional_text(
        public.professional_jsonb_required_string(
          entry->'title',
          'Portfolio title'
        )
      );

    next_description :=
      public.normalize_professional_text(
        public.professional_jsonb_optional_string(
          entry->'description',
          'Portfolio description'
        )
      );

    if exists (
      select 1
      from public.professional_portfolio_projects as projects
      where projects.id = entry_id
        and projects.profile_id = current_user_id
    ) then
      update public.professional_portfolio_projects as projects
      set
        title = next_title,
        description = next_description,
        position = project_index
      where projects.id = entry_id
        and projects.profile_id = current_user_id;

      if not found then
        raise exception
          'That portfolio project could not be found.';
      end if;
    else
      insert into public.professional_portfolio_projects as projects (
        id,
        profile_id,
        title,
        description,
        position
      )
      values (
        entry_id,
        current_user_id,
        next_title,
        next_description,
        project_index
      );
    end if;

    media_list := entry->'media';
    media_index := 0;

    for media_entry in
      select value
      from jsonb_array_elements(media_list)
    loop
      media_id :=
        public.professional_jsonb_optional_uuid(
          media_entry->'id',
          'Portfolio photo id'
        );

      next_storage_path :=
        public.normalize_professional_text(
          public.professional_jsonb_required_string(
            media_entry->'storage_path',
            'Portfolio photo path'
          )
        );

      next_mime_type :=
        public.normalize_professional_text(
          public.professional_jsonb_required_string(
            media_entry->'mime_type',
            'Portfolio photo type'
          )
        );

      next_byte_size :=
        (media_entry->>'byte_size')::integer;

      if media_id is not null
        and exists (
          select 1
          from public.professional_portfolio_media as media
          where media.id = media_id
            and media.profile_id = current_user_id
            and media.project_id = entry_id
        )
      then
        update public.professional_portfolio_media as media
        set
          position = media_index
        where media.id = media_id
          and media.profile_id = current_user_id
          and media.project_id = entry_id;
      else
        insert into public.professional_portfolio_media as media (
          id,
          project_id,
          profile_id,
          storage_path,
          position,
          media_type,
          mime_type,
          byte_size
        )
        values (
          coalesce(media_id, gen_random_uuid()),
          entry_id,
          current_user_id,
          next_storage_path,
          media_index,
          'photo',
          next_mime_type,
          next_byte_size
        );
      end if;

      media_index := media_index + 1;
    end loop;

    project_index := project_index + 1;
  end loop;

  return query
  select
    projects.id,
    projects.profile_id,
    projects.title,
    projects.description,
    projects.position as sort_position,
    projects.created_at,
    projects.updated_at
  from public.professional_portfolio_projects as projects
  where projects.profile_id = current_user_id
  order by projects.position;
end;
$$;


-- ============================================================
-- RLS / GRANTS
-- Owner-preview SELECT only. Writes are RPC-only.
-- ============================================================

alter table public.professional_portfolio_projects
enable row level security;

alter table public.professional_portfolio_media
enable row level security;

revoke all
on table public.professional_portfolio_projects
from public;

revoke all
on table public.professional_portfolio_projects
from anon;

revoke all
on table public.professional_portfolio_projects
from authenticated;

grant select
on table public.professional_portfolio_projects
to authenticated;

revoke all
on table public.professional_portfolio_media
from public;

revoke all
on table public.professional_portfolio_media
from anon;

revoke all
on table public.professional_portfolio_media
from authenticated;

grant select
on table public.professional_portfolio_media
to authenticated;


drop policy if exists
  "Owners can read their professional portfolio projects"
on public.professional_portfolio_projects;

create policy
  "Owners can read their professional portfolio projects"
on public.professional_portfolio_projects
for select
to authenticated
using (
  profile_id = auth.uid()
);


drop policy if exists
  "Owners can read their professional portfolio media"
on public.professional_portfolio_media;

create policy
  "Owners can read their professional portfolio media"
on public.professional_portfolio_media
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
  'professional-portfolio',
  'professional-portfolio',
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
  where buckets.id = 'professional-portfolio';

  if not found then
    raise exception
      'professional-portfolio storage bucket was not created.';
  end if;

  if
    bucket_public is distinct from false
    or bucket_limit is distinct from (2 * 1024 * 1024)
    or bucket_mimes is distinct from array['image/jpeg']::text[]
  then
    raise exception
      'professional-portfolio storage bucket already exists with unexpected configuration.';
  end if;
end;
$$;


-- Storage SELECT requires a matching metadata row the
-- owner can read. Draft uploads are not readable until
-- save. INSERT/DELETE are path-owned so the owner can
-- upload before metadata and remove orphans.

drop policy if exists
  "Owners can read their professional-portfolio objects"
on storage.objects;

create policy
  "Owners can read their professional-portfolio objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'professional-portfolio'
  and public.professional_portfolio_path_profile_id(name)
    = auth.uid()
  and exists (
    select 1
    from public.professional_portfolio_media as media
    where media.storage_path = name
      and media.profile_id = auth.uid()
  )
);


drop policy if exists
  "Owners can upload professional-portfolio objects"
on storage.objects;

create policy
  "Owners can upload professional-portfolio objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'professional-portfolio'
  and public.is_professional_portfolio_storage_path(
    name,
    public.professional_portfolio_path_profile_id(name),
    public.professional_portfolio_path_project_id(name)
  )
  and public.professional_portfolio_path_profile_id(name)
    = auth.uid()
);


drop policy if exists
  "Owners can delete professional-portfolio objects"
on storage.objects;

create policy
  "Owners can delete professional-portfolio objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'professional-portfolio'
  and public.is_professional_portfolio_storage_path(
    name,
    public.professional_portfolio_path_profile_id(name),
    public.professional_portfolio_path_project_id(name)
  )
  and public.professional_portfolio_path_profile_id(name)
    = auth.uid()
);


revoke all
on function public.is_professional_portfolio_storage_path(text, uuid, uuid)
from public;

revoke all
on function public.is_professional_portfolio_storage_path(text, uuid, uuid)
from anon;

grant execute
on function public.is_professional_portfolio_storage_path(text, uuid, uuid)
to authenticated;

revoke all
on function public.professional_portfolio_path_profile_id(text)
from public;

revoke all
on function public.professional_portfolio_path_profile_id(text)
from anon;

grant execute
on function public.professional_portfolio_path_profile_id(text)
to authenticated;

revoke all
on function public.professional_portfolio_path_project_id(text)
from public;

revoke all
on function public.professional_portfolio_path_project_id(text)
from anon;

grant execute
on function public.professional_portfolio_path_project_id(text)
to authenticated;

revoke all
on function public.professional_portfolio_projects_protect_identity()
from public;

revoke all
on function public.professional_portfolio_projects_protect_identity()
from anon;

revoke all
on function public.professional_portfolio_projects_protect_identity()
from authenticated;

revoke all
on function public.professional_portfolio_media_align_profile()
from public;

revoke all
on function public.professional_portfolio_media_align_profile()
from anon;

revoke all
on function public.professional_portfolio_media_align_profile()
from authenticated;

revoke all
on function public.save_own_professional_portfolio(jsonb)
from public;

revoke all
on function public.save_own_professional_portfolio(jsonb)
from anon;

revoke all
on function public.save_own_professional_portfolio(jsonb)
from authenticated;

grant execute
on function public.save_own_professional_portfolio(jsonb)
to authenticated;
