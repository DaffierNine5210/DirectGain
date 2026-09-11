-- ============================================================
-- DIRECT GAIN
-- Profile presentation foundation
-- Migration 012
--
-- Additive. Does not modify 001–011 files.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
--
-- Product:
-- One Direct Gain account, one identity, one shared
-- reputation, three presentations.
--
-- This table stores ONLY the active public profile
-- style. It is NOT profiles.account_type.
-- account_type remains the frozen signup/account class.
--
-- active_template:
--   personal | professional | business
--
-- Slice 1:
-- Every existing and new profile gets personal.
-- Do NOT copy account_type = business into
-- active_template.
-- Clients do not create or delete rows.
-- ============================================================


-- ============================================================
-- TABLE
-- ============================================================

create table if not exists public.profile_presentation (
  profile_id uuid
    primary key
    references public.profiles(id)
    on delete cascade,

  active_template text
    not null
    default 'personal'
    check (
      active_template in (
        'personal',
        'professional',
        'business'
      )
    ),

  updated_at timestamptz
    not null
    default now()
);


-- ============================================================
-- UPDATED_AT
-- ============================================================

drop trigger if exists
  profile_presentation_set_updated_at
on public.profile_presentation;

create trigger
  profile_presentation_set_updated_at
before update
on public.profile_presentation
for each row
execute function public.set_updated_at();


-- ============================================================
-- PROTECT PROFILE_ID
-- Presentation is 1:1 with identity. Clients must not
-- reattach a row to another profile.
-- ============================================================

create or replace function public.profile_presentation_protect_identity()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if
    new.profile_id is distinct from old.profile_id
  then
    raise exception
      'Profile presentation cannot be moved to another profile.';
  end if;

  return new;
end;
$$;


drop trigger if exists
  profile_presentation_protect_identity
on public.profile_presentation;

create trigger
  profile_presentation_protect_identity
before update
on public.profile_presentation
for each row
execute function public.profile_presentation_protect_identity();


-- ============================================================
-- CREATE PRESENTATION FOR NEW PROFILES
-- Does not replace handle_new_user.
-- Does not read or copy account_type.
-- Always personal.
-- SECURITY DEFINER so the database owns the insert
-- even though authenticated clients have no INSERT grant.
-- ============================================================

create or replace function public.ensure_profile_presentation_for_profile()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profile_presentation (
    profile_id,
    active_template
  )
  values (
    new.id,
    'personal'
  )
  on conflict (profile_id)
  do nothing;

  return new;
end;
$$;


drop trigger if exists
  profile_presentation_on_profile_created
on public.profiles;

create trigger
  profile_presentation_on_profile_created
after insert
on public.profiles
for each row
execute function public.ensure_profile_presentation_for_profile();


-- ============================================================
-- BACKFILL EXISTING PROFILES
-- Always personal, including account_type = business.
-- ============================================================

insert into public.profile_presentation (
  profile_id,
  active_template
)
select
  profiles.id,
  'personal'
from public.profiles as profiles
on conflict (profile_id)
do nothing;


-- ============================================================
-- GRANTS
-- Authenticated members may read any presentation so
-- Public Profile can resolve the active style.
-- Owners may update only active_template on their row.
-- No INSERT or DELETE for clients.
-- ============================================================

alter table public.profile_presentation
enable row level security;

revoke all
on table public.profile_presentation
from public;

revoke all
on table public.profile_presentation
from anon;

revoke all
on table public.profile_presentation
from authenticated;

grant select
on table public.profile_presentation
to authenticated;

grant update (
  active_template
)
on table public.profile_presentation
to authenticated;


-- ============================================================
-- RLS
-- ============================================================

drop policy if exists
  "Authenticated users can read profile presentation"
on public.profile_presentation;

create policy
  "Authenticated users can read profile presentation"
on public.profile_presentation
for select
to authenticated
using (
  true
);


drop policy if exists
  "Users can update their own profile presentation"
on public.profile_presentation;

create policy
  "Users can update their own profile presentation"
on public.profile_presentation
for update
to authenticated
using (
  profile_id = auth.uid()
)
with check (
  profile_id = auth.uid()
);


revoke all
on function public.profile_presentation_protect_identity()
from public;

revoke all
on function public.profile_presentation_protect_identity()
from anon;

revoke all
on function public.profile_presentation_protect_identity()
from authenticated;

revoke all
on function public.ensure_profile_presentation_for_profile()
from public;

revoke all
on function public.ensure_profile_presentation_for_profile()
from anon;

revoke all
on function public.ensure_profile_presentation_for_profile()
from authenticated;
