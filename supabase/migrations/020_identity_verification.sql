-- ============================================================
-- DIRECT GAIN
-- Identity Verification foundation v1
-- Migration 020
--
-- Additive. Does not modify 001–019 files.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
--
-- Product:
-- Status-only Identity Verified foundation.
-- One current row per profile. No row = not submitted.
--
-- Identity Verified means ONLY that Direct Gain has
-- confirmed this account holder's identity through
-- the identity verification process.
--
-- It does NOT verify:
--   skills, credentials, licences, résumé,
--   work quality, employment, business,
--   or Professional status.
--
-- A user must never be able to verify themselves.
-- Owners may submit / resubmit / withdraw pending
-- and read their own safe status.
-- Privileged review (service-role / table owner)
-- is the only path to verified or rejected.
--
-- Does NOT:
--   store legal name, DOB, address, ID numbers,
--   documents, selfies, or biometrics
--   create Storage buckets
--   add Gain Score, Professional Verified,
--   Business Verified, or Community Trusted
--   add UI, badges, or client helpers
--   write profile_presentation.active_template
-- ============================================================


-- ============================================================
-- TABLE
-- ============================================================

create table if not exists public.identity_verifications (
  profile_id uuid
    primary key
    references public.profiles(id)
    on delete cascade,

  status text
    not null,

  submitted_at timestamptz
    not null,

  reviewed_at timestamptz,

  verified_at timestamptz,

  rejection_reason text,

  provider text,

  provider_reference text,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint identity_verifications_status_check
    check (
      status in (
        'pending',
        'verified',
        'rejected'
      )
    ),

  constraint identity_verifications_verified_at_check
    check (
      (
        status = 'verified'
        and verified_at is not null
      )
      or (
        status <> 'verified'
        and verified_at is null
      )
    ),

  constraint identity_verifications_pending_check
    check (
      status <> 'pending'
      or (
        reviewed_at is null
        and rejection_reason is null
        and provider is null
        and provider_reference is null
      )
    ),

  constraint identity_verifications_verified_reason_check
    check (
      status <> 'verified'
      or rejection_reason is null
    ),

  constraint identity_verifications_rejected_check
    check (
      status <> 'rejected'
      or (
        reviewed_at is not null
        and rejection_reason is not null
      )
    ),

  constraint identity_verifications_rejection_reason_check
    check (
      rejection_reason is null
      or (
        rejection_reason = btrim(rejection_reason)
        and char_length(rejection_reason)
          between 1 and 200
      )
    ),

  constraint identity_verifications_provider_check
    check (
      provider is null
      or (
        provider = btrim(provider)
        and char_length(provider)
          between 1 and 40
      )
    ),

  constraint identity_verifications_provider_reference_check
    check (
      provider_reference is null
      or (
        provider_reference = btrim(provider_reference)
        and char_length(provider_reference)
          between 1 and 128
        and position('://' in provider_reference) = 0
        and position('..' in provider_reference) = 0
      )
    )
);

comment on table public.identity_verifications is
  'Current identity-verification status per profile. Absence of a row means not submitted. Identity only — not skills, credentials, business, or Professional verification.';

comment on column public.identity_verifications.provider_reference is
  'Opaque future provider identifier. Never returned by client-facing RPCs.';


-- ============================================================
-- UPDATED_AT
-- ============================================================

drop trigger if exists
  identity_verifications_set_updated_at
on public.identity_verifications;

create trigger
  identity_verifications_set_updated_at
before update
on public.identity_verifications
for each row
execute function public.set_updated_at();


-- ============================================================
-- WRITE DEFENCE
-- Authenticated/anon cannot mutate this table even if
-- grants slip. SECURITY DEFINER RPCs run as the function
-- owner and are allowed. They still cannot set verified
-- from owner submit/withdraw functions.
-- ============================================================

create or replace function public.identity_verifications_protect_writes()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if
    current_user
      in (
        'authenticated',
        'anon'
      )
  then
    raise exception
      'Identity verification can only change through Direct Gain RPCs.';
  end if;

  if tg_op = 'UPDATE' then
    if
      new.profile_id is distinct from old.profile_id
    then
      raise exception
        'Identity verification cannot be moved to another account.';
    end if;

    if
      new.created_at is distinct from old.created_at
    then
      raise exception
        'Identity verification created_at cannot be changed.';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;


drop trigger if exists
  identity_verifications_protect_writes
on public.identity_verifications;

create trigger
  identity_verifications_protect_writes
before insert or update or delete
on public.identity_verifications
for each row
execute function public.identity_verifications_protect_writes();


-- ============================================================
-- HELPERS
-- ============================================================

create or replace function public.normalize_identity_rejection_reason(
  p_reason text
)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select
    case
      when p_reason is null then
        null
      when btrim(p_reason) = '' then
        null
      else
        left(btrim(p_reason), 200)
    end;
$$;


-- ============================================================
-- OWNER: get_own_identity_verification
-- No row = not submitted.
-- Does not return provider_reference.
-- ============================================================

create or replace function public.get_own_identity_verification()
returns table (
  status text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  verified_at timestamptz,
  rejection_reason text
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to view identity verification.';
  end if;

  return query
  select
    identity_verifications.status,
    identity_verifications.submitted_at,
    identity_verifications.reviewed_at,
    identity_verifications.verified_at,
    identity_verifications.rejection_reason
  from public.identity_verifications as identity_verifications
  where identity_verifications.profile_id = current_user_id;
end;
$$;


-- ============================================================
-- OWNER: submit_own_identity_verification
-- Creates or resubmits PENDING only.
-- ============================================================

create or replace function public.submit_own_identity_verification()
returns table (
  status text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  verified_at timestamptz,
  rejection_reason text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  locked_row public.identity_verifications%rowtype;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to submit identity verification.';
  end if;

  perform
    1
  from public.profiles as profiles
  where profiles.id = current_user_id
  for update;

  if not found then
    raise exception
      'Your profile could not be found.';
  end if;

  select *
  into locked_row
  from public.identity_verifications as identity_verifications
  where identity_verifications.profile_id = current_user_id
  for update;

  if found then
    if locked_row.status = 'pending' then
      raise exception
        'Identity verification is already in review.';
    end if;

    if locked_row.status = 'verified' then
      raise exception
        'Your identity is already verified.';
    end if;

    if locked_row.status is distinct from 'rejected' then
      raise exception
        'Identity verification cannot be submitted.';
    end if;

    update public.identity_verifications as identity_verifications
    set
      status = 'pending',
      submitted_at = now(),
      reviewed_at = null,
      verified_at = null,
      rejection_reason = null,
      provider = null,
      provider_reference = null
    where identity_verifications.profile_id = current_user_id;
  else
    insert into public.identity_verifications (
      profile_id,
      status,
      submitted_at
    )
    values (
      current_user_id,
      'pending',
      now()
    );
  end if;

  return query
  select
    identity_verifications.status,
    identity_verifications.submitted_at,
    identity_verifications.reviewed_at,
    identity_verifications.verified_at,
    identity_verifications.rejection_reason
  from public.identity_verifications as identity_verifications
  where identity_verifications.profile_id = current_user_id;
end;
$$;


-- ============================================================
-- OWNER: withdraw_own_pending_identity_verification
-- Deletes a pending row only (back to not submitted).
-- ============================================================

create or replace function public.withdraw_own_pending_identity_verification()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  locked_row public.identity_verifications%rowtype;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to withdraw identity verification.';
  end if;

  perform
    1
  from public.profiles as profiles
  where profiles.id = current_user_id
  for update;

  if not found then
    raise exception
      'Your profile could not be found.';
  end if;

  select *
  into locked_row
  from public.identity_verifications as identity_verifications
  where identity_verifications.profile_id = current_user_id
  for update;

  if not found then
    raise exception
      'There is no pending identity verification to withdraw.';
  end if;

  if locked_row.status = 'verified' then
    raise exception
      'Verified identity cannot be withdrawn.';
  end if;

  if locked_row.status = 'rejected' then
    raise exception
      'Rejected identity verification cannot be withdrawn. Submit again instead.';
  end if;

  if locked_row.status is distinct from 'pending' then
    raise exception
      'Only a pending identity verification can be withdrawn.';
  end if;

  delete from public.identity_verifications as identity_verifications
  where identity_verifications.profile_id = current_user_id
    and identity_verifications.status = 'pending';
end;
$$;


-- ============================================================
-- SAFE PROFILE READ: get_profile_identity_verified
-- Visitor/UI boolean only. No pending/rejected leakage.
-- ============================================================

create or replace function public.get_profile_identity_verified(
  p_profile_id uuid
)
returns boolean
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception
      'You must be signed in to view identity verification.';
  end if;

  if p_profile_id is null then
    return false;
  end if;

  return exists (
    select 1
    from public.identity_verifications as identity_verifications
    where identity_verifications.profile_id = p_profile_id
      and identity_verifications.status = 'verified'
  );
end;
$$;


-- ============================================================
-- PRIVILEGED: review_identity_verification
-- NOT granted to anon / authenticated / public.
-- p_decision: verified | rejected
-- rejected covers both first-time reject and revoke.
-- ============================================================

create or replace function public.review_identity_verification(
  p_profile_id uuid,
  p_decision text,
  p_user_reason text
)
returns table (
  profile_id uuid,
  status text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  verified_at timestamptz,
  rejection_reason text,
  provider text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  locked_row public.identity_verifications%rowtype;
  next_decision text;
  next_reason text;
begin
  if p_profile_id is null then
    raise exception
      'A profile is required.';
  end if;

  next_decision := btrim(coalesce(p_decision, ''));

  if next_decision not in ('verified', 'rejected') then
    raise exception
      'Choose verified or rejected.';
  end if;

  next_reason :=
    public.normalize_identity_rejection_reason(p_user_reason);

  if next_decision = 'rejected' and next_reason is null then
    raise exception
      'A short reason is required.';
  end if;

  perform
    1
  from public.profiles as profiles
  where profiles.id = p_profile_id
  for update;

  if not found then
    raise exception
      'That profile does not exist.';
  end if;

  select *
  into locked_row
  from public.identity_verifications as identity_verifications
  where identity_verifications.profile_id = p_profile_id
  for update;

  if not found then
    raise exception
      'This profile has not submitted identity verification.';
  end if;

  if next_decision = 'verified' then
    if locked_row.status is distinct from 'pending' then
      raise exception
        'Only a pending identity verification can be verified.';
    end if;

    update public.identity_verifications as identity_verifications
    set
      status = 'verified',
      reviewed_at = now(),
      verified_at = now(),
      rejection_reason = null,
      provider = 'manual',
      provider_reference = null
    where identity_verifications.profile_id = p_profile_id;
  else
    if locked_row.status not in ('pending', 'verified') then
      raise exception
        'This identity verification cannot be rejected.';
    end if;

    update public.identity_verifications as identity_verifications
    set
      status = 'rejected',
      reviewed_at = now(),
      verified_at = null,
      rejection_reason = next_reason,
      provider = 'manual',
      provider_reference = null
    where identity_verifications.profile_id = p_profile_id;
  end if;

  return query
  select
    identity_verifications.profile_id,
    identity_verifications.status,
    identity_verifications.submitted_at,
    identity_verifications.reviewed_at,
    identity_verifications.verified_at,
    identity_verifications.rejection_reason,
    identity_verifications.provider
  from public.identity_verifications as identity_verifications
  where identity_verifications.profile_id = p_profile_id;
end;
$$;


-- ============================================================
-- TABLE PRIVILEGES / RLS
-- Table is private. All client access is via RPCs.
-- ============================================================

alter table public.identity_verifications
enable row level security;

revoke all
on table public.identity_verifications
from public;

revoke all
on table public.identity_verifications
from anon;

revoke all
on table public.identity_verifications
from authenticated;


-- ============================================================
-- FUNCTION PRIVILEGES
-- ============================================================

revoke all
on function public.identity_verifications_protect_writes()
from public;

revoke all
on function public.identity_verifications_protect_writes()
from anon;

revoke all
on function public.identity_verifications_protect_writes()
from authenticated;

revoke all
on function public.normalize_identity_rejection_reason(text)
from public;

revoke all
on function public.normalize_identity_rejection_reason(text)
from anon;

revoke all
on function public.normalize_identity_rejection_reason(text)
from authenticated;

revoke all
on function public.get_own_identity_verification()
from public;

revoke all
on function public.get_own_identity_verification()
from anon;

revoke all
on function public.get_own_identity_verification()
from authenticated;

grant execute
on function public.get_own_identity_verification()
to authenticated;

revoke all
on function public.submit_own_identity_verification()
from public;

revoke all
on function public.submit_own_identity_verification()
from anon;

revoke all
on function public.submit_own_identity_verification()
from authenticated;

grant execute
on function public.submit_own_identity_verification()
to authenticated;

revoke all
on function public.withdraw_own_pending_identity_verification()
from public;

revoke all
on function public.withdraw_own_pending_identity_verification()
from anon;

revoke all
on function public.withdraw_own_pending_identity_verification()
from authenticated;

grant execute
on function public.withdraw_own_pending_identity_verification()
to authenticated;

revoke all
on function public.get_profile_identity_verified(uuid)
from public;

revoke all
on function public.get_profile_identity_verified(uuid)
from anon;

revoke all
on function public.get_profile_identity_verified(uuid)
from authenticated;

grant execute
on function public.get_profile_identity_verified(uuid)
to authenticated;

revoke all
on function public.review_identity_verification(uuid, text, text)
from public;

revoke all
on function public.review_identity_verification(uuid, text, text)
from anon;

revoke all
on function public.review_identity_verification(uuid, text, text)
from authenticated;

do $$
begin
  if exists (
    select 1
    from pg_roles
    where rolname = 'service_role'
  ) then
    execute
      'grant execute on function public.review_identity_verification(uuid, text, text) to service_role';
  end if;
end
$$;
