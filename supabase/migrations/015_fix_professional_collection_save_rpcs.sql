-- ============================================================
-- DIRECT GAIN
-- Fix ambiguous profile_id in Professional collection saves
-- Migration 015
--
-- Additive. Does not modify 001–014 files.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
--
-- Why:
-- save_own_professional_experiences failed at runtime with
--   42702 column reference "profile_id" is ambiguous
--   It could refer to either a PL/pgSQL variable
--   or a table column.
--
-- Both collection save RPCs RETURNS TABLE
-- (id, profile_id, ...), so profile_id is a
-- PL/pgSQL output variable. Unqualified
--   on conflict (profile_id)
-- in the professional_profiles stub INSERT collides
-- with that variable. This statement runs on every
-- save, including first-time Experience inserts.
--
-- save_own_professional_credentials has the same
-- stub INSERT and the same OUT variable, so it is
-- corrected together even though Experience failed
-- first.
--
-- Other SQL in both functions already table-qualifies
-- experiences/credentials columns in WHERE, DELETE,
-- ownership checks, and RETURN QUERY.
--
-- This migration:
-- 1. Replaces both save RPCs with CREATE OR REPLACE
--    FUNCTION, preserving the live 014 contract.
-- 2. Uses ON CONFLICT ON CONSTRAINT
--    professional_profiles_pkey (same 011 pattern).
-- 3. Reasserts EXECUTE grants on the two public
--    save RPCs only.
-- 4. Does not change tables, CHECKs, FKs, unique
--    constraints, RLS, table grants, helpers, or
--    core Professional field writes.
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
      insert into public.professional_experiences as experiences (
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
      insert into public.professional_credentials as credentials (
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
