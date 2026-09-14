-- ============================================================
-- DIRECT GAIN
-- Professional experience + credentials
-- Migration 014
--
-- Additive. Does not modify 001–013 files.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
--
-- Product:
-- Manual work-experience and credential rows are
-- owner CLAIMS. They are not Direct Gain job
-- history, reviews, or verified credentials.
--
-- This migration does NOT:
-- - change professional_profiles columns
-- - overwrite Professional core fields
-- - add verification flags or evidence paths
-- - add credential/reference numbers
-- - add portfolio, media, résumé, or Storage
-- - activate Professional presentation
-- - write profile_presentation.active_template
--
-- Writes go through:
--   save_own_professional_experiences(jsonb)
--   save_own_professional_credentials(jsonb)
-- Both return the saved collection (stable ids,
-- dense positions, persisted claim fields), ordered
-- by position. Empty payload returns zero rows.
-- Clients SELECT. Clients cannot INSERT/UPDATE/DELETE.
--
-- Date rules:
--   Table CHECKs: structural only (months, current
--   vs end, expiry vs does_not_expire, chronology,
--   year in 1950–2100). No now()/current_date in
--   CHECKs.
--   RPCs: purpose-specific calendar-year bounds
--   using CURRENT_DATE (database calendar, not
--   client time).
--     Experience start/end year <= current year
--     Credential issued year <= current year
--     Credential expiry year <= current year + 50
-- ============================================================


-- ============================================================
-- JSON HELPERS
-- Untrusted jsonb parsing. EXECUTE revoked from
-- client roles; SECURITY DEFINER RPCs may call them.
-- ============================================================

create or replace function public.professional_jsonb_reject_unknown_keys(
  p_object jsonb,
  p_allowed text[]
)
returns void
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  key_name text;
begin
  if jsonb_typeof(p_object) is distinct from 'object' then
    raise exception
      'Each entry must be an object.';
  end if;

  for key_name in
    select jsonb_object_keys(p_object)
  loop
    if not (key_name = any (p_allowed)) then
      raise exception
        'Unknown field "%" is not allowed.',
        key_name;
    end if;
  end loop;
end;
$$;


create or replace function public.professional_jsonb_optional_uuid(
  p_value jsonb,
  p_field text
)
returns uuid
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  as_text text;
begin
  if p_value is null or p_value = 'null'::jsonb then
    return null;
  end if;

  if jsonb_typeof(p_value) is distinct from 'string' then
    raise exception
      '% is not valid.',
      p_field;
  end if;

  as_text := lower(p_value #>> '{}');

  if as_text !~
    '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  then
    raise exception
      '% is not valid.',
      p_field;
  end if;

  return as_text::uuid;
end;
$$;


create or replace function public.professional_jsonb_required_boolean(
  p_value jsonb,
  p_field text
)
returns boolean
language plpgsql
immutable
set search_path = public, pg_temp
as $$
begin
  if p_value is null or p_value = 'null'::jsonb then
    raise exception
      '% is required.',
      p_field;
  end if;

  if jsonb_typeof(p_value) is distinct from 'boolean' then
    raise exception
      '% must be true or false.',
      p_field;
  end if;

  return (p_value = 'true'::jsonb);
end;
$$;


create or replace function public.professional_jsonb_optional_smallint(
  p_value jsonb,
  p_field text
)
returns smallint
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  as_text text;
  as_int integer;
begin
  if p_value is null or p_value = 'null'::jsonb then
    return null;
  end if;

  if jsonb_typeof(p_value) is distinct from 'number' then
    raise exception
      '% must be a whole number.',
      p_field;
  end if;

  as_text := p_value #>> '{}';

  if as_text !~ '^[0-9]+$' then
    raise exception
      '% must be a whole number.',
      p_field;
  end if;

  as_int := as_text::integer;

  if as_int > 32767 then
    raise exception
      '% is not valid.',
      p_field;
  end if;

  return as_int::smallint;
end;
$$;


create or replace function public.professional_jsonb_required_smallint(
  p_value jsonb,
  p_field text
)
returns smallint
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  parsed smallint;
begin
  parsed :=
    public.professional_jsonb_optional_smallint(
      p_value,
      p_field
    );

  if parsed is null then
    raise exception
      '% is required.',
      p_field;
  end if;

  return parsed;
end;
$$;


create or replace function public.professional_jsonb_required_string(
  p_value jsonb,
  p_field text
)
returns text
language plpgsql
immutable
set search_path = public, pg_temp
as $$
begin
  if p_value is null or p_value = 'null'::jsonb then
    raise exception
      '% is required.',
      p_field;
  end if;

  if jsonb_typeof(p_value) is distinct from 'string' then
    raise exception
      '% must be text.',
      p_field;
  end if;

  return p_value #>> '{}';
end;
$$;


create or replace function public.professional_jsonb_optional_string(
  p_value jsonb,
  p_field text
)
returns text
language plpgsql
immutable
set search_path = public, pg_temp
as $$
begin
  if p_value is null or p_value = 'null'::jsonb then
    return null;
  end if;

  if jsonb_typeof(p_value) is distinct from 'string' then
    raise exception
      '% must be text.',
      p_field;
  end if;

  return p_value #>> '{}';
end;
$$;


-- Chronology without inventing a day:
-- start uses month 1 when month is omitted
-- end/expiry uses month 12 when month is omitted
-- so year-only ranges in the same year remain valid.
create or replace function public.professional_year_month_not_before(
  p_left_year smallint,
  p_left_month smallint,
  p_right_year smallint,
  p_right_month smallint
)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select
    p_left_year < p_right_year
    or (
      p_left_year = p_right_year
      and coalesce(p_left_month, 1)
        <= coalesce(p_right_month, 12)
    );
$$;


-- ============================================================
-- TABLE: professional_experiences
-- ============================================================

create table if not exists public.professional_experiences (
  id uuid
    primary key
    default gen_random_uuid(),

  profile_id uuid
    not null
    references public.professional_profiles(profile_id)
    on delete cascade,

  title text
    not null,

  organisation text
    not null,

  start_year smallint
    not null,

  start_month smallint,

  end_year smallint,

  end_month smallint,

  is_current boolean
    not null
    default false,

  description text,

  position smallint
    not null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint professional_experiences_title_check
    check (
      title = btrim(title)
      and char_length(title) between 2 and 80
    ),

  constraint professional_experiences_organisation_check
    check (
      organisation = btrim(organisation)
      and char_length(organisation) between 1 and 80
    ),

  constraint professional_experiences_description_check
    check (
      description is null
      or (
        description = btrim(description)
        and char_length(description) between 1 and 800
      )
    ),

  constraint professional_experiences_start_year_check
    check (
      start_year between 1950 and 2100
    ),

  constraint professional_experiences_end_year_check
    check (
      end_year is null
      or end_year between 1950 and 2100
    ),

  constraint professional_experiences_start_month_check
    check (
      start_month is null
      or start_month between 1 and 12
    ),

  constraint professional_experiences_end_month_check
    check (
      end_month is null
      or (
        end_month between 1 and 12
        and end_year is not null
      )
    ),

  constraint professional_experiences_current_end_check
    check (
      (
        is_current = true
        and end_year is null
        and end_month is null
      )
      or (
        is_current = false
        and end_year is not null
      )
    ),

  constraint professional_experiences_chronology_check
    check (
      is_current = true
      or (
        start_year < end_year
        or (
          start_year = end_year
          and coalesce(start_month, 1)
            <= coalesce(end_month, 12)
        )
      )
    ),

  constraint professional_experiences_position_check
    check (
      position between 0 and 11
    ),

  constraint professional_experiences_profile_position_key
    unique (profile_id, position)
    deferrable initially deferred
);


drop trigger if exists
  professional_experiences_set_updated_at
on public.professional_experiences;

create trigger
  professional_experiences_set_updated_at
before update
on public.professional_experiences
for each row
execute function public.set_updated_at();


create or replace function public.professional_experiences_protect_identity()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.id is distinct from old.id then
    raise exception
      'Experience id cannot be changed.';
  end if;

  if
    new.profile_id is distinct from old.profile_id
  then
    raise exception
      'Experience cannot be moved to another account.';
  end if;

  if
    new.created_at is distinct from old.created_at
  then
    raise exception
      'Experience created_at cannot be changed.';
  end if;

  return new;
end;
$$;


drop trigger if exists
  professional_experiences_protect_identity
on public.professional_experiences;

create trigger
  professional_experiences_protect_identity
before update
on public.professional_experiences
for each row
execute function public.professional_experiences_protect_identity();


-- ============================================================
-- TABLE: professional_credentials
-- ============================================================

create table if not exists public.professional_credentials (
  id uuid
    primary key
    default gen_random_uuid(),

  profile_id uuid
    not null
    references public.professional_profiles(profile_id)
    on delete cascade,

  credential_type text
    not null,

  name text
    not null,

  issuer text,

  issued_year smallint,

  issued_month smallint,

  expires_year smallint,

  expires_month smallint,

  does_not_expire boolean
    not null
    default false,

  position smallint
    not null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint professional_credentials_type_check
    check (
      credential_type in (
        'qualification',
        'licence',
        'certification'
      )
    ),

  constraint professional_credentials_name_check
    check (
      name = btrim(name)
      and char_length(name) between 2 and 120
    ),

  constraint professional_credentials_issuer_check
    check (
      issuer is null
      or (
        issuer = btrim(issuer)
        and char_length(issuer) between 1 and 120
      )
    ),

  constraint professional_credentials_issued_year_check
    check (
      issued_year is null
      or issued_year between 1950 and 2100
    ),

  constraint professional_credentials_expires_year_check
    check (
      expires_year is null
      or expires_year between 1950 and 2100
    ),

  constraint professional_credentials_issued_month_check
    check (
      issued_month is null
      or (
        issued_month between 1 and 12
        and issued_year is not null
      )
    ),

  constraint professional_credentials_expires_month_check
    check (
      expires_month is null
      or (
        expires_month between 1 and 12
        and expires_year is not null
      )
    ),

  constraint professional_credentials_no_expiry_check
    check (
      does_not_expire = false
      or (
        expires_year is null
        and expires_month is null
      )
    ),

  constraint professional_credentials_chronology_check
    check (
      issued_year is null
      or expires_year is null
      or (
        issued_year < expires_year
        or (
          issued_year = expires_year
          and coalesce(issued_month, 1)
            <= coalesce(expires_month, 12)
        )
      )
    ),

  constraint professional_credentials_position_check
    check (
      position between 0 and 14
    ),

  constraint professional_credentials_profile_position_key
    unique (profile_id, position)
    deferrable initially deferred
);


drop trigger if exists
  professional_credentials_set_updated_at
on public.professional_credentials;

create trigger
  professional_credentials_set_updated_at
before update
on public.professional_credentials
for each row
execute function public.set_updated_at();


create or replace function public.professional_credentials_protect_identity()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.id is distinct from old.id then
    raise exception
      'Credential id cannot be changed.';
  end if;

  if
    new.profile_id is distinct from old.profile_id
  then
    raise exception
      'Credential cannot be moved to another account.';
  end if;

  if
    new.created_at is distinct from old.created_at
  then
    raise exception
      'Credential created_at cannot be changed.';
  end if;

  return new;
end;
$$;


drop trigger if exists
  professional_credentials_protect_identity
on public.professional_credentials;

create trigger
  professional_credentials_protect_identity
before update
on public.professional_credentials
for each row
execute function public.professional_credentials_protect_identity();


-- ============================================================
-- WRITE RPC: experiences
-- Owner-only. Forces profile_id = auth.uid().
-- Identity-preserving collection save.
-- Unique (profile_id, position) is DEFERRABLE
-- INITIALLY DEFERRED so reorder UPDATEs may
-- temporarily share positions.
-- PostgreSQL checks deferred unique constraints at
-- COMMIT of the caller's transaction, not after
-- each UPDATE and not at function return.
-- A typical PostgREST RPC is one transaction, so
-- the check runs after this function succeeds.
-- SET CONSTRAINTS ... IMMEDIATE in the same
-- transaction would make uniqueness fail
-- mid-reorder; these RPCs do not SET CONSTRAINTS.
--
-- RETURNS TABLE uses sort_position, not position,
-- because POSITION is reserved SQL syntax.
-- The table column remains position.
-- RETURN QUERY maps experiences.position AS
-- sort_position. SQL statements table-qualify
-- columns (same lesson as Migration 011).
-- ============================================================

create or replace function public.save_own_professional_experiences(
  p_entries jsonb
)
returns table (
  id uuid,
  profile_id uuid,
  title text,
  organisation text,
  start_year smallint,
  start_month smallint,
  end_year smallint,
  end_month smallint,
  is_current boolean,
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
  current_year integer;
  entry_count integer;
  entry jsonb;
  entry_index integer := 0;
  entry_id uuid;
  keep_ids uuid[] := '{}';
  next_title text;
  next_organisation text;
  next_description text;
  next_start_year smallint;
  next_start_month smallint;
  next_end_year smallint;
  next_end_month smallint;
  next_is_current boolean;
begin
  current_user_id := auth.uid();
  current_year :=
    (extract(year from current_date))::integer;

  if current_user_id is null then
    raise exception
      'You must be signed in to update your Professional experience.';
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
      'Experience entries must be an array.';
  end if;

  entry_count := jsonb_array_length(p_entries);

  if entry_count > 12 then
    raise exception
      'You can add up to 12 experience entries.';
  end if;

  insert into public.professional_profiles (
    profile_id
  )
  values (
    current_user_id
  )
  on conflict (profile_id)
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
        'organisation',
        'start_year',
        'start_month',
        'end_year',
        'end_month',
        'is_current',
        'description'
      ]
    );

    entry_id :=
      public.professional_jsonb_optional_uuid(
        entry->'id',
        'Experience id'
      );

    if entry_id is not null then
      if entry_id = any (keep_ids) then
        raise exception
          'Each experience entry can only appear once.';
      end if;

      if not exists (
        select 1
        from public.professional_experiences as experiences
        where experiences.id = entry_id
          and experiences.profile_id = current_user_id
      ) then
        raise exception
          'That experience entry could not be found.';
      end if;

      keep_ids := array_append(keep_ids, entry_id);
    end if;

    next_title :=
      public.normalize_professional_text(
        public.professional_jsonb_required_string(
          entry->'title',
          'Role/title'
        )
      );

    next_organisation :=
      public.normalize_professional_text(
        public.professional_jsonb_required_string(
          entry->'organisation',
          'Organisation'
        )
      );

    next_description :=
      public.normalize_professional_text(
        public.professional_jsonb_optional_string(
          entry->'description',
          'Description'
        )
      );

    next_is_current :=
      public.professional_jsonb_required_boolean(
        entry->'is_current',
        'Currently working here'
      );

    next_start_year :=
      public.professional_jsonb_required_smallint(
        entry->'start_year',
        'Start year'
      );

    next_start_month :=
      public.professional_jsonb_optional_smallint(
        entry->'start_month',
        'Start month'
      );

    next_end_year :=
      public.professional_jsonb_optional_smallint(
        entry->'end_year',
        'End year'
      );

    next_end_month :=
      public.professional_jsonb_optional_smallint(
        entry->'end_month',
        'End month'
      );

    if next_title is null
      or char_length(next_title) not between 2 and 80
    then
      raise exception
        'Role/title must be between 2 and 80 characters.';
    end if;

    if next_organisation is null
      or char_length(next_organisation) not between 1 and 80
    then
      raise exception
        'Organisation must be between 1 and 80 characters.';
    end if;

    if next_description is not null
      and char_length(next_description) > 800
    then
      raise exception
        'Keep the experience description to 800 characters or fewer.';
    end if;

    if next_start_month is not null
      and next_start_month not between 1 and 12
    then
      raise exception
        'Start month must be between 1 and 12.';
    end if;

    if next_end_month is not null
      and next_end_month not between 1 and 12
    then
      raise exception
        'End month must be between 1 and 12.';
    end if;

    if next_start_year < 1950
      or next_start_year > current_year
    then
      raise exception
        'Start year must be between 1950 and the current year.';
    end if;

    if next_is_current then
      if next_end_year is not null
        or next_end_month is not null
      then
        raise exception
          'A current role cannot have an end date.';
      end if;
    else
      if next_end_year is null then
        raise exception
          'Ended roles need an end year.';
      end if;

      if next_end_month is not null
        and next_end_year is null
      then
        raise exception
          'End month cannot be set without an end year.';
      end if;

      if next_end_year < 1950
        or next_end_year > current_year
      then
        raise exception
          'End year must be between 1950 and the current year.';
      end if;

      if not public.professional_year_month_not_before(
        next_start_year,
        next_start_month,
        next_end_year,
        next_end_month
      ) then
        raise exception
          'The end date cannot be earlier than the start date.';
      end if;
    end if;
  end loop;

  delete from public.professional_experiences as experiences
  where experiences.profile_id = current_user_id
    and (
      coalesce(array_length(keep_ids, 1), 0) = 0
      or experiences.id <> all (keep_ids)
    );

  entry_index := 0;

  for entry in
    select value
    from jsonb_array_elements(p_entries)
  loop
    entry_id :=
      public.professional_jsonb_optional_uuid(
        entry->'id',
        'Experience id'
      );

    next_title :=
      public.normalize_professional_text(
        public.professional_jsonb_required_string(
          entry->'title',
          'Role/title'
        )
      );

    next_organisation :=
      public.normalize_professional_text(
        public.professional_jsonb_required_string(
          entry->'organisation',
          'Organisation'
        )
      );

    next_description :=
      public.normalize_professional_text(
        public.professional_jsonb_optional_string(
          entry->'description',
          'Description'
        )
      );

    next_is_current :=
      public.professional_jsonb_required_boolean(
        entry->'is_current',
        'Currently working here'
      );

    next_start_year :=
      public.professional_jsonb_required_smallint(
        entry->'start_year',
        'Start year'
      );

    next_start_month :=
      public.professional_jsonb_optional_smallint(
        entry->'start_month',
        'Start month'
      );

    next_end_year :=
      public.professional_jsonb_optional_smallint(
        entry->'end_year',
        'End year'
      );

    next_end_month :=
      public.professional_jsonb_optional_smallint(
        entry->'end_month',
        'End month'
      );

    if entry_id is not null then
      update public.professional_experiences as experiences
      set
        title = next_title,
        organisation = next_organisation,
        start_year = next_start_year,
        start_month = next_start_month,
        end_year = next_end_year,
        end_month = next_end_month,
        is_current = next_is_current,
        description = next_description,
        position = entry_index
      where experiences.id = entry_id
        and experiences.profile_id = current_user_id;

      if not found then
        raise exception
          'That experience entry could not be found.';
      end if;
    else
      insert into public.professional_experiences (
        profile_id,
        title,
        organisation,
        start_year,
        start_month,
        end_year,
        end_month,
        is_current,
        description,
        position
      )
      values (
        current_user_id,
        next_title,
        next_organisation,
        next_start_year,
        next_start_month,
        next_end_year,
        next_end_month,
        next_is_current,
        next_description,
        entry_index
      );
    end if;

    entry_index := entry_index + 1;
  end loop;

  return query
  select
    experiences.id,
    experiences.profile_id,
    experiences.title,
    experiences.organisation,
    experiences.start_year,
    experiences.start_month,
    experiences.end_year,
    experiences.end_month,
    experiences.is_current,
    experiences.description,
    experiences.position as sort_position,
    experiences.created_at,
    experiences.updated_at
  from public.professional_experiences as experiences
  where experiences.profile_id = current_user_id
  order by experiences.position;
end;
$$;


-- ============================================================
-- WRITE RPC: credentials
-- ============================================================

create or replace function public.save_own_professional_credentials(
  p_entries jsonb
)
returns table (
  id uuid,
  profile_id uuid,
  credential_type text,
  name text,
  issuer text,
  issued_year smallint,
  issued_month smallint,
  expires_year smallint,
  expires_month smallint,
  does_not_expire boolean,
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
  current_year integer;
  max_expiry_year integer;
  entry_count integer;
  entry jsonb;
  entry_index integer := 0;
  entry_id uuid;
  keep_ids uuid[] := '{}';
  next_type text;
  next_name text;
  next_issuer text;
  next_issued_year smallint;
  next_issued_month smallint;
  next_expires_year smallint;
  next_expires_month smallint;
  next_does_not_expire boolean;
begin
  current_user_id := auth.uid();
  current_year :=
    (extract(year from current_date))::integer;
  max_expiry_year := current_year + 50;

  if current_user_id is null then
    raise exception
      'You must be signed in to update your Professional credentials.';
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
      'Credential entries must be an array.';
  end if;

  entry_count := jsonb_array_length(p_entries);

  if entry_count > 15 then
    raise exception
      'You can add up to 15 credentials.';
  end if;

  insert into public.professional_profiles (
    profile_id
  )
  values (
    current_user_id
  )
  on conflict (profile_id)
  do nothing;

  for entry in
    select value
    from jsonb_array_elements(p_entries)
  loop
    perform public.professional_jsonb_reject_unknown_keys(
      entry,
      array[
        'id',
        'credential_type',
        'name',
        'issuer',
        'issued_year',
        'issued_month',
        'expires_year',
        'expires_month',
        'does_not_expire'
      ]
    );

    entry_id :=
      public.professional_jsonb_optional_uuid(
        entry->'id',
        'Credential id'
      );

    if entry_id is not null then
      if entry_id = any (keep_ids) then
        raise exception
          'Each credential can only appear once.';
      end if;

      if not exists (
        select 1
        from public.professional_credentials as credentials
        where credentials.id = entry_id
          and credentials.profile_id = current_user_id
      ) then
        raise exception
          'That credential could not be found.';
      end if;

      keep_ids := array_append(keep_ids, entry_id);
    end if;

    next_type :=
      public.normalize_professional_text(
        public.professional_jsonb_required_string(
          entry->'credential_type',
          'Credential type'
        )
      );

    next_name :=
      public.normalize_professional_text(
        public.professional_jsonb_required_string(
          entry->'name',
          'Credential name'
        )
      );

    next_issuer :=
      public.normalize_professional_text(
        public.professional_jsonb_optional_string(
          entry->'issuer',
          'Issuer'
        )
      );

    next_does_not_expire :=
      public.professional_jsonb_required_boolean(
        entry->'does_not_expire',
        'Does not expire'
      );

    next_issued_year :=
      public.professional_jsonb_optional_smallint(
        entry->'issued_year',
        'Issued year'
      );

    next_issued_month :=
      public.professional_jsonb_optional_smallint(
        entry->'issued_month',
        'Issued month'
      );

    next_expires_year :=
      public.professional_jsonb_optional_smallint(
        entry->'expires_year',
        'Expiry year'
      );

    next_expires_month :=
      public.professional_jsonb_optional_smallint(
        entry->'expires_month',
        'Expiry month'
      );

    if next_type is null
      or next_type not in (
        'qualification',
        'licence',
        'certification'
      )
    then
      raise exception
        'Choose a valid credential type.';
    end if;

    if next_name is null
      or char_length(next_name) not between 2 and 120
    then
      raise exception
        'Credential name must be between 2 and 120 characters.';
    end if;

    if next_issuer is not null
      and char_length(next_issuer) > 120
    then
      raise exception
        'Issuer must be 120 characters or fewer.';
    end if;

    if next_issued_month is not null
      and next_issued_year is null
    then
      raise exception
        'Issued month cannot be set without an issued year.';
    end if;

    if next_issued_month is not null
      and next_issued_month not between 1 and 12
    then
      raise exception
        'Issued month must be between 1 and 12.';
    end if;

    if next_expires_month is not null
      and next_expires_year is null
    then
      raise exception
        'Expiry month cannot be set without an expiry year.';
    end if;

    if next_expires_month is not null
      and next_expires_month not between 1 and 12
    then
      raise exception
        'Expiry month must be between 1 and 12.';
    end if;

    if next_issued_year is not null
      and (
        next_issued_year < 1950
        or next_issued_year > current_year
      )
    then
      raise exception
        'Issued year must be between 1950 and the current year.';
    end if;

    if next_does_not_expire then
      if next_expires_year is not null
        or next_expires_month is not null
      then
        raise exception
          'A credential that does not expire cannot have an expiry date.';
      end if;
    else
      if next_expires_year is not null
        and (
          next_expires_year < 1950
          or next_expires_year > max_expiry_year
          or next_expires_year > 2100
        )
      then
        raise exception
          'Expiry year must be between 1950 and 50 years from now.';
      end if;
    end if;

    if next_issued_year is not null
      and next_expires_year is not null
      and not public.professional_year_month_not_before(
        next_issued_year,
        next_issued_month,
        next_expires_year,
        next_expires_month
      )
    then
      raise exception
        'The expiry date cannot be earlier than the issued date.';
    end if;
  end loop;

  delete from public.professional_credentials as credentials
  where credentials.profile_id = current_user_id
    and (
      coalesce(array_length(keep_ids, 1), 0) = 0
      or credentials.id <> all (keep_ids)
    );

  entry_index := 0;

  for entry in
    select value
    from jsonb_array_elements(p_entries)
  loop
    entry_id :=
      public.professional_jsonb_optional_uuid(
        entry->'id',
        'Credential id'
      );

    next_type :=
      public.normalize_professional_text(
        public.professional_jsonb_required_string(
          entry->'credential_type',
          'Credential type'
        )
      );

    next_name :=
      public.normalize_professional_text(
        public.professional_jsonb_required_string(
          entry->'name',
          'Credential name'
        )
      );

    next_issuer :=
      public.normalize_professional_text(
        public.professional_jsonb_optional_string(
          entry->'issuer',
          'Issuer'
        )
      );

    next_does_not_expire :=
      public.professional_jsonb_required_boolean(
        entry->'does_not_expire',
        'Does not expire'
      );

    next_issued_year :=
      public.professional_jsonb_optional_smallint(
        entry->'issued_year',
        'Issued year'
      );

    next_issued_month :=
      public.professional_jsonb_optional_smallint(
        entry->'issued_month',
        'Issued month'
      );

    next_expires_year :=
      public.professional_jsonb_optional_smallint(
        entry->'expires_year',
        'Expiry year'
      );

    next_expires_month :=
      public.professional_jsonb_optional_smallint(
        entry->'expires_month',
        'Expiry month'
      );

    if entry_id is not null then
      update public.professional_credentials as credentials
      set
        credential_type = next_type,
        name = next_name,
        issuer = next_issuer,
        issued_year = next_issued_year,
        issued_month = next_issued_month,
        expires_year = next_expires_year,
        expires_month = next_expires_month,
        does_not_expire = next_does_not_expire,
        position = entry_index
      where credentials.id = entry_id
        and credentials.profile_id = current_user_id;

      if not found then
        raise exception
          'That credential could not be found.';
      end if;
    else
      insert into public.professional_credentials (
        profile_id,
        credential_type,
        name,
        issuer,
        issued_year,
        issued_month,
        expires_year,
        expires_month,
        does_not_expire,
        position
      )
      values (
        current_user_id,
        next_type,
        next_name,
        next_issuer,
        next_issued_year,
        next_issued_month,
        next_expires_year,
        next_expires_month,
        next_does_not_expire,
        entry_index
      );
    end if;

    entry_index := entry_index + 1;
  end loop;

  return query
  select
    credentials.id,
    credentials.profile_id,
    credentials.credential_type,
    credentials.name,
    credentials.issuer,
    credentials.issued_year,
    credentials.issued_month,
    credentials.expires_year,
    credentials.expires_month,
    credentials.does_not_expire,
    credentials.position as sort_position,
    credentials.created_at,
    credentials.updated_at
  from public.professional_credentials as credentials
  where credentials.profile_id = current_user_id
  order by credentials.position;
end;
$$;


-- ============================================================
-- GRANTS
-- Authenticated members may read claims.
-- Writes are RPC-only. No client INSERT/UPDATE/DELETE.
-- Anon has no access.
-- ============================================================

alter table public.professional_experiences
enable row level security;

alter table public.professional_credentials
enable row level security;

revoke all
on table public.professional_experiences
from public;

revoke all
on table public.professional_experiences
from anon;

revoke all
on table public.professional_experiences
from authenticated;

grant select
on table public.professional_experiences
to authenticated;

revoke all
on table public.professional_credentials
from public;

revoke all
on table public.professional_credentials
from anon;

revoke all
on table public.professional_credentials
from authenticated;

grant select
on table public.professional_credentials
to authenticated;


drop policy if exists
  "Authenticated users can read professional experiences"
on public.professional_experiences;

create policy
  "Authenticated users can read professional experiences"
on public.professional_experiences
for select
to authenticated
using (
  true
);


drop policy if exists
  "Authenticated users can read professional credentials"
on public.professional_credentials;

create policy
  "Authenticated users can read professional credentials"
on public.professional_credentials
for select
to authenticated
using (
  true
);


revoke all
on function public.professional_jsonb_reject_unknown_keys(jsonb, text[])
from public;

revoke all
on function public.professional_jsonb_reject_unknown_keys(jsonb, text[])
from anon;

revoke all
on function public.professional_jsonb_reject_unknown_keys(jsonb, text[])
from authenticated;

revoke all
on function public.professional_jsonb_optional_uuid(jsonb, text)
from public;

revoke all
on function public.professional_jsonb_optional_uuid(jsonb, text)
from anon;

revoke all
on function public.professional_jsonb_optional_uuid(jsonb, text)
from authenticated;

revoke all
on function public.professional_jsonb_required_boolean(jsonb, text)
from public;

revoke all
on function public.professional_jsonb_required_boolean(jsonb, text)
from anon;

revoke all
on function public.professional_jsonb_required_boolean(jsonb, text)
from authenticated;

revoke all
on function public.professional_jsonb_optional_smallint(jsonb, text)
from public;

revoke all
on function public.professional_jsonb_optional_smallint(jsonb, text)
from anon;

revoke all
on function public.professional_jsonb_optional_smallint(jsonb, text)
from authenticated;

revoke all
on function public.professional_jsonb_required_smallint(jsonb, text)
from public;

revoke all
on function public.professional_jsonb_required_smallint(jsonb, text)
from anon;

revoke all
on function public.professional_jsonb_required_smallint(jsonb, text)
from authenticated;

revoke all
on function public.professional_jsonb_required_string(jsonb, text)
from public;

revoke all
on function public.professional_jsonb_required_string(jsonb, text)
from anon;

revoke all
on function public.professional_jsonb_required_string(jsonb, text)
from authenticated;

revoke all
on function public.professional_jsonb_optional_string(jsonb, text)
from public;

revoke all
on function public.professional_jsonb_optional_string(jsonb, text)
from anon;

revoke all
on function public.professional_jsonb_optional_string(jsonb, text)
from authenticated;

revoke all
on function public.professional_year_month_not_before(
  smallint,
  smallint,
  smallint,
  smallint
)
from public;

revoke all
on function public.professional_year_month_not_before(
  smallint,
  smallint,
  smallint,
  smallint
)
from anon;

revoke all
on function public.professional_year_month_not_before(
  smallint,
  smallint,
  smallint,
  smallint
)
from authenticated;

revoke all
on function public.professional_experiences_protect_identity()
from public;

revoke all
on function public.professional_experiences_protect_identity()
from anon;

revoke all
on function public.professional_experiences_protect_identity()
from authenticated;

revoke all
on function public.professional_credentials_protect_identity()
from public;

revoke all
on function public.professional_credentials_protect_identity()
from anon;

revoke all
on function public.professional_credentials_protect_identity()
from authenticated;

revoke all
on function public.save_own_professional_experiences(jsonb)
from public;

revoke all
on function public.save_own_professional_experiences(jsonb)
from anon;

revoke all
on function public.save_own_professional_experiences(jsonb)
from authenticated;

grant execute
on function public.save_own_professional_experiences(jsonb)
to authenticated;

revoke all
on function public.save_own_professional_credentials(jsonb)
from public;

revoke all
on function public.save_own_professional_credentials(jsonb)
from anon;

revoke all
on function public.save_own_professional_credentials(jsonb)
from authenticated;

grant execute
on function public.save_own_professional_credentials(jsonb)
to authenticated;
