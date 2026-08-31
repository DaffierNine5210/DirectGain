-- ============================================================
-- DIRECT GAIN
-- Minimal public.profiles foundation
-- Migration 004
--
-- Local file only until approved.
-- Do not apply remotely without explicit approval.
--
-- This is identity storage only.
-- It does not add Gain Score, verification,
-- followers, completed-job counters, licences,
-- phone, or email.
-- ============================================================


-- ============================================================
-- TABLE
-- ============================================================

create table if not exists public.profiles (
  id uuid
    primary key
    references auth.users(id)
    on delete cascade,

  display_name text
    not null,

  bio text,

  avatar_path text,

  suburb text,

  state text,

  account_type text
    not null
    default 'personal'
    check (
      account_type in (
        'personal',
        'business'
      )
    ),

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint profiles_display_name_length_check
    check (
      char_length(trim(display_name))
        between 1 and 80
    ),

  constraint profiles_bio_length_check
    check (
      bio is null
      or char_length(bio) <= 160
    ),

  constraint profiles_suburb_length_check
    check (
      suburb is null
      or char_length(trim(suburb))
        between 1 and 60
    ),

  constraint profiles_state_length_check
    check (
      state is null
      or char_length(trim(state))
        between 1 and 40
    ),

  constraint profiles_avatar_path_check
    check (
      avatar_path is null
      or (
        char_length(avatar_path)
          between 1 and 255
        and position('..' in avatar_path) = 0
        and position('://' in avatar_path) = 0
      )
    )
);


-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists
  profiles_account_type_idx
on public.profiles(account_type);


create index if not exists
  profiles_state_suburb_idx
on public.profiles(state, suburb);


-- ============================================================
-- UPDATED_AT
-- ============================================================

drop trigger if exists
  profiles_set_updated_at
on public.profiles;

create trigger
  profiles_set_updated_at
before update
on public.profiles
for each row
execute function public.set_updated_at();


-- ============================================================
-- FREEZE ACCOUNT TYPE AFTER INSERT
-- ============================================================

create or replace function public.profiles_protect_account_type()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if
    new.id is distinct from old.id
  then
    raise exception
      'Profile id cannot be changed.';
  end if;

  if
    new.account_type is distinct from old.account_type
  then
    raise exception
      'Account type cannot be changed here.';
  end if;

  if
    new.created_at is distinct from old.created_at
  then
    raise exception
      'Profile created_at cannot be changed.';
  end if;

  return new;
end;
$$;


drop trigger if exists
  profiles_protect_account_type
on public.profiles;

create trigger
  profiles_protect_account_type
before update
on public.profiles
for each row
execute function public.profiles_protect_account_type();


-- ============================================================
-- CREATE PROFILE FOR NEW AUTH USERS
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  next_display_name text;
  next_account_type text;
begin
  next_display_name :=
    left(
      coalesce(
        nullif(
          trim(
            coalesce(
              new.raw_user_meta_data ->> 'full_name',
              ''
            )
          ),
          ''
        ),
        'Direct Gain member'
      ),
      80
    );

  if
    new.raw_user_meta_data ->> 'account_type'
      = 'business'
  then
    next_account_type :=
      'business';
  else
    next_account_type :=
      'personal';
  end if;

  insert into public.profiles (
    id,
    display_name,
    account_type
  )
  values (
    new.id,
    next_display_name,
    next_account_type
  )
  on conflict (id)
  do nothing;

  return new;
end;
$$;


drop trigger if exists
  on_auth_user_created
on auth.users;

create trigger
  on_auth_user_created
after insert
on auth.users
for each row
execute function public.handle_new_user();


-- ============================================================
-- BACKFILL EXISTING AUTH USERS
-- ============================================================

insert into public.profiles (
  id,
  display_name,
  account_type
)
select
  users.id,
  left(
    coalesce(
      nullif(
        trim(
          coalesce(
            users.raw_user_meta_data ->> 'full_name',
            ''
          )
        ),
        ''
      ),
      'Direct Gain member'
    ),
    80
  ),
  case
    when
      users.raw_user_meta_data ->> 'account_type'
        = 'business'
      then 'business'
    else 'personal'
  end
from auth.users as users
on conflict (id)
do nothing;


-- ============================================================
-- GRANTS
-- Authenticated members may read profiles
-- (Job Detail, applicant lists, seller-style
-- public identity). They may edit only ordinary
-- fields on their own row. Inserts come from
-- the auth trigger, not the client.
-- ============================================================

alter table public.profiles
enable row level security;

revoke all
on table public.profiles
from public;

revoke all
on table public.profiles
from anon;

revoke all
on table public.profiles
from authenticated;

grant select
on table public.profiles
to authenticated;

grant update (
  display_name,
  bio,
  avatar_path,
  suburb,
  state
)
on table public.profiles
to authenticated;


-- ============================================================
-- RLS
-- ============================================================

drop policy if exists
  "Authenticated users can read profiles"
on public.profiles;

create policy
  "Authenticated users can read profiles"
on public.profiles
for select
to authenticated
using (
  true
);


drop policy if exists
  "Users can update their own profile"
on public.profiles;

create policy
  "Users can update their own profile"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
)
with check (
  id = auth.uid()
);


revoke all
on function public.handle_new_user()
from public;

revoke all
on function public.handle_new_user()
from anon;

revoke all
on function public.handle_new_user()
from authenticated;

revoke all
on function public.profiles_protect_account_type()
from public;

revoke all
on function public.profiles_protect_account_type()
from anon;

revoke all
on function public.profiles_protect_account_type()
from authenticated;
