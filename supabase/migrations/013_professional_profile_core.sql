-- ============================================================
-- DIRECT GAIN
-- Professional profile core
-- Migration 013
--
-- Additive. Does not modify 001–012 files.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
--
-- Product:
-- Professional presentation data is separate from
-- Direct Gain identity (public.profiles) and from
-- active style (public.profile_presentation).
--
-- This migration does NOT:
-- - change profiles columns
-- - copy suburb/state into service_area
-- - backfill rows for every user
-- - couple to account_type
-- - activate Professional presentation
-- - add portfolio, experience, résumé, or verification
--
-- Writes go through save_own_professional_profile.
-- Clients SELECT. Clients cannot INSERT/UPDATE/DELETE.
-- ============================================================


-- ============================================================
-- TABLE: professional_profiles
-- ============================================================

create table if not exists public.professional_profiles (
  profile_id uuid
    primary key
    references public.profiles(id)
    on delete cascade,

  professional_headline text,
  professional_about text,
  availability text,
  service_area text,
  work_preference text,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint professional_profiles_headline_check
    check (
      professional_headline is null
      or (
        professional_headline
          = btrim(professional_headline)
        and char_length(professional_headline)
          between 2 and 100
      )
    ),

  constraint professional_profiles_about_check
    check (
      professional_about is null
      or (
        professional_about
          = btrim(professional_about)
        and char_length(professional_about)
          between 1 and 1500
      )
    ),

  constraint professional_profiles_availability_check
    check (
      availability is null
      or availability in (
        'available_now',
        'open_to_opportunities',
        'not_available'
      )
    ),

  constraint professional_profiles_service_area_check
    check (
      service_area is null
      or (
        service_area = btrim(service_area)
        and char_length(service_area)
          between 1 and 120
      )
    ),

  constraint professional_profiles_work_preference_check
    check (
      work_preference is null
      or work_preference in (
        'one_off',
        'casual',
        'part_time',
        'full_time',
        'contract'
      )
    )
);


drop trigger if exists
  professional_profiles_set_updated_at
on public.professional_profiles;

create trigger
  professional_profiles_set_updated_at
before update
on public.professional_profiles
for each row
execute function public.set_updated_at();


create or replace function public.professional_profiles_protect_identity()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if
    new.profile_id is distinct from old.profile_id
  then
    raise exception
      'Professional profile cannot be moved to another account.';
  end if;

  if
    new.created_at is distinct from old.created_at
  then
    raise exception
      'Professional profile created_at cannot be changed.';
  end if;

  return new;
end;
$$;


drop trigger if exists
  professional_profiles_protect_identity
on public.professional_profiles;

create trigger
  professional_profiles_protect_identity
before update
on public.professional_profiles
for each row
execute function public.professional_profiles_protect_identity();


-- ============================================================
-- TABLE: professional_skills
-- Ordered capability labels. Not job records.
-- ============================================================

create table if not exists public.professional_skills (
  id uuid
    primary key
    default gen_random_uuid(),

  profile_id uuid
    not null
    references public.professional_profiles(profile_id)
    on delete cascade,

  name text
    not null,

  position smallint
    not null,

  created_at timestamptz
    not null
    default now(),

  constraint professional_skills_name_check
    check (
      name = btrim(name)
      and char_length(name) between 1 and 50
    ),

  constraint professional_skills_position_check
    check (
      position between 0 and 19
    )
);

-- Max 20 skills is a database invariant:
-- unique (profile_id, position) plus position 0–19.
-- The write RPC also rejects more than 20 skills
-- with a clear error. No count trigger.


create unique index if not exists
  professional_skills_profile_name_lower_idx
on public.professional_skills (
  profile_id,
  lower(name)
);


create unique index if not exists
  professional_skills_profile_position_idx
on public.professional_skills (
  profile_id,
  position
);

-- No standalone (profile_id) index: both unique
-- indexes already lead with profile_id, so equality
-- lookups by profile_id can use them.


-- ============================================================
-- WRITE RPC
-- Owner-only. Forces profile_id = auth.uid().
-- Replaces core fields and ordered skills in one
-- transaction so a failed skill write cannot leave
-- a half-updated Professional profile.
-- ============================================================

create or replace function public.normalize_professional_text(
  p_value text
)
returns text
language plpgsql
immutable
set search_path = public, pg_temp
as $$
begin
  return nullif(btrim(coalesce(p_value, '')), '');
end;
$$;


create or replace function public.save_own_professional_profile(
  p_headline text,
  p_about text,
  p_availability text,
  p_service_area text,
  p_work_preference text,
  p_skills text[]
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  next_headline text;
  next_about text;
  next_availability text;
  next_service_area text;
  next_work_preference text;
  raw_skills text[];
  next_skills text[] := '{}';
  skill_name text;
  skill_index integer := 0;
  existing_lower text;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to update your Professional profile.';
  end if;

  if not exists (
    select 1
    from public.profiles as profiles
    where profiles.id = current_user_id
  ) then
    raise exception
      'Your profile could not be found.';
  end if;

  next_headline :=
    public.normalize_professional_text(p_headline);
  next_about :=
    public.normalize_professional_text(p_about);
  next_availability :=
    public.normalize_professional_text(p_availability);
  next_service_area :=
    public.normalize_professional_text(p_service_area);
  next_work_preference :=
    public.normalize_professional_text(p_work_preference);

  if next_headline is not null
    and char_length(next_headline) not between 2 and 100
  then
    raise exception
      'Professional headline must be between 2 and 100 characters.';
  end if;

  if next_about is not null
    and char_length(next_about) > 1500
  then
    raise exception
      'Keep your professional about to 1500 characters or fewer.';
  end if;

  if next_service_area is not null
    and char_length(next_service_area) > 120
  then
    raise exception
      'Service area must be 120 characters or fewer.';
  end if;

  if next_availability is not null
    and next_availability not in (
      'available_now',
      'open_to_opportunities',
      'not_available'
    )
  then
    raise exception
      'Choose a valid availability.';
  end if;

  if next_work_preference is not null
    and next_work_preference not in (
      'one_off',
      'casual',
      'part_time',
      'full_time',
      'contract'
    )
  then
    raise exception
      'Choose a valid work preference.';
  end if;

  raw_skills := coalesce(p_skills, '{}');

  foreach skill_name in array raw_skills
  loop
    skill_name :=
      public.normalize_professional_text(skill_name);

    if skill_name is null then
      continue;
    end if;

    if char_length(skill_name) > 50 then
      raise exception
        'Each skill must be 50 characters or fewer.';
    end if;

    existing_lower := lower(skill_name);

    if exists (
      select 1
      from unnest(next_skills) as already(name)
      where lower(already.name) = existing_lower
    ) then
      continue;
    end if;

    if coalesce(array_length(next_skills, 1), 0) >= 20 then
      raise exception
        'You can add up to 20 skills.';
    end if;

    next_skills :=
      array_append(next_skills, skill_name);
  end loop;

  insert into public.professional_profiles (
    profile_id,
    professional_headline,
    professional_about,
    availability,
    service_area,
    work_preference
  )
  values (
    current_user_id,
    next_headline,
    next_about,
    next_availability,
    next_service_area,
    next_work_preference
  )
  on conflict (profile_id)
  do update set
    professional_headline =
      excluded.professional_headline,
    professional_about =
      excluded.professional_about,
    availability =
      excluded.availability,
    service_area =
      excluded.service_area,
    work_preference =
      excluded.work_preference;

  delete from public.professional_skills as skills
  where skills.profile_id = current_user_id;

  skill_index := 0;

  foreach skill_name in array next_skills
  loop
    insert into public.professional_skills (
      profile_id,
      name,
      position
    )
    values (
      current_user_id,
      skill_name,
      skill_index
    );

    skill_index := skill_index + 1;
  end loop;

  return current_user_id;
end;
$$;


-- ============================================================
-- GRANTS
-- Authenticated members may read Professional data.
-- Writes are RPC-only. No client INSERT/UPDATE/DELETE.
-- Anon has no access.
-- ============================================================

alter table public.professional_profiles
enable row level security;

alter table public.professional_skills
enable row level security;

revoke all
on table public.professional_profiles
from public;

revoke all
on table public.professional_profiles
from anon;

revoke all
on table public.professional_profiles
from authenticated;

grant select
on table public.professional_profiles
to authenticated;

revoke all
on table public.professional_skills
from public;

revoke all
on table public.professional_skills
from anon;

revoke all
on table public.professional_skills
from authenticated;

grant select
on table public.professional_skills
to authenticated;


drop policy if exists
  "Authenticated users can read professional profiles"
on public.professional_profiles;

create policy
  "Authenticated users can read professional profiles"
on public.professional_profiles
for select
to authenticated
using (
  true
);


drop policy if exists
  "Authenticated users can read professional skills"
on public.professional_skills;

create policy
  "Authenticated users can read professional skills"
on public.professional_skills
for select
to authenticated
using (
  true
);


revoke all
on function public.professional_profiles_protect_identity()
from public;

revoke all
on function public.professional_profiles_protect_identity()
from anon;

revoke all
on function public.professional_profiles_protect_identity()
from authenticated;

revoke all
on function public.normalize_professional_text(text)
from public;

revoke all
on function public.normalize_professional_text(text)
from anon;

revoke all
on function public.normalize_professional_text(text)
from authenticated;

revoke all
on function public.save_own_professional_profile(
  text,
  text,
  text,
  text,
  text,
  text[]
)
from public;

revoke all
on function public.save_own_professional_profile(
  text,
  text,
  text,
  text,
  text,
  text[]
)
from anon;

revoke all
on function public.save_own_professional_profile(
  text,
  text,
  text,
  text,
  text,
  text[]
)
from authenticated;

grant execute
on function public.save_own_professional_profile(
  text,
  text,
  text,
  text,
  text,
  text[]
)
to authenticated;
