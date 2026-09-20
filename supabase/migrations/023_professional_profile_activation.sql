-- ============================================================
-- DIRECT GAIN
-- Professional public activation v1
-- Migration 023
--
-- Additive. Does not modify 001–022 files.
-- Does not modify paused Market listings foundation (024).
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
--
-- Product:
-- Owners change profile_presentation.active_template
-- through this RPC only. That value is what OTHER
-- users see. Owner My Gain stays Personal management.
--
-- This migration does NOT:
--   activate Business
--   create/delete Professional rows
--   modify profiles, messaging, jobs, reviews
--   grant Identity / Professional / Business Verified
--   change profile UUID
--   insert mock data
--
-- Direct UPDATE(active_template) is revoked so clients
-- cannot bypass readiness or activate business.
-- Authenticated SELECT is preserved.
-- ============================================================


-- ============================================================
-- CLOSE DIRECT UPDATE BYPASS
-- 012 granted UPDATE(active_template) to authenticated.
-- That would let an owner set business or professional
-- with no headline. RPC is now the only client write path.
-- ============================================================

revoke update
on table public.profile_presentation
from authenticated;

revoke update (
  active_template
)
on table public.profile_presentation
from authenticated;


-- ============================================================
-- RPC
-- ============================================================

create or replace function public.set_own_active_profile_template(
  p_template text
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  requested_template text;
  locked_presentation public.profile_presentation%rowtype;
  professional_headline text;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to change your profile style.';
  end if;

  requested_template :=
    nullif(btrim(coalesce(p_template, '')), '');

  if requested_template is null then
    raise exception
      'Choose Personal or Professional.';
  end if;

  if requested_template = 'business' then
    raise exception
      'Business profile is not available yet.';
  end if;

  if requested_template not in (
    'personal',
    'professional'
  ) then
    raise exception
      'Choose Personal or Professional.';
  end if;

  if not exists (
    select 1
    from public.profiles as profiles
    where profiles.id = current_user_id
  ) then
    raise exception
      'Your profile could not be found.';
  end if;

  if requested_template = 'professional' then
    select
      professional_profiles.professional_headline
    into professional_headline
    from public.professional_profiles as professional_profiles
    where professional_profiles.profile_id = current_user_id;

    if not found
      or professional_headline is null
      or char_length(btrim(professional_headline)) < 2
    then
      raise exception
        'Complete your Professional headline before making this profile live.';
    end if;
  end if;

  select *
  into locked_presentation
  from public.profile_presentation as profile_presentation
  where profile_presentation.profile_id = current_user_id
  for update;

  if not found then
    raise exception
      'Your profile style could not be found.';
  end if;

  if locked_presentation.active_template
    is distinct from requested_template
  then
    update public.profile_presentation as profile_presentation
    set active_template = requested_template
    where profile_presentation.profile_id = current_user_id;
  end if;

  return requested_template;
end;
$$;


revoke all
on function public.set_own_active_profile_template(text)
from public;

revoke all
on function public.set_own_active_profile_template(text)
from anon;

revoke all
on function public.set_own_active_profile_template(text)
from authenticated;

grant execute
on function public.set_own_active_profile_template(text)
to authenticated;
