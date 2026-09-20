-- ============================================================
-- DIRECT GAIN
-- Profile-to-profile general conversations
-- Migration 022
--
-- Additive. Does not modify 001–021 files.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
--
-- Product:
-- One general conversation per authenticated pair.
-- Public Professional (and later other profiles) Message
-- uses get_or_create_general_conversation.
--
-- Canonical context_id:
--   lower(uuid_a)::text || ':' || lower(uuid_b)::text
--   with uuid_a < uuid_b lexicographically.
-- Same pair always, regardless of who starts.
--
-- This migration does NOT:
--   change profile_presentation.active_template
--   create Market/Job/Auction conversations
--   add blocking/reporting
--   expose résumé or private profile fields
--   grant anon conversation access
--
-- Clients must not INSERT context_type = 'general'.
-- Market / auction / support client INSERT remains allowed.
-- Job client INSERT remains blocked (009).
-- ============================================================


-- ============================================================
-- EXISTING GENERAL ROWS
-- Fail loud if duplicate context_id values would make
-- the unique index unsafe. Do not delete or rewrite rows.
-- ============================================================

do $$
declare
  duplicate_count integer;
begin
  select count(*)
  into duplicate_count
  from (
    select conversations.context_id
    from public.conversations as conversations
    where conversations.context_type = 'general'
      and conversations.context_id is not null
    group by conversations.context_id
    having count(*) > 1
  ) as duplicates;

  if duplicate_count > 0 then
    raise exception
      'Migration 022 cannot add a unique general conversation index because duplicate general context_id values already exist. Inspect those rows before applying.';
  end if;
end;
$$;


-- ============================================================
-- UNIQUE PAIR
-- ============================================================

create unique index if not exists
  conversations_unique_general_context_idx
on public.conversations (context_id)
where
  context_type = 'general'
  and context_id is not null;


-- ============================================================
-- CLIENT INSERT HARDENING
-- Exclude job (already) and general.
-- Market / auction / support remain client-insertable.
-- ============================================================

drop policy if exists
  "Authenticated users can create conversations"
on public.conversations;

create policy
  "Authenticated users can create conversations"
on public.conversations
for insert
to authenticated
with check (
  created_by = auth.uid()
  and context_type is distinct from 'job'
  and context_type is distinct from 'general'
);


-- ============================================================
-- UPDATE HARDENING
-- Clients must not rewrite a market/auction/support
-- thread into a general thread, or mutate a general
-- pair key. SECURITY DEFINER RPCs still may, because
-- the existing job-context trigger skips non-client
-- roles.
-- ============================================================

create or replace function public.conversations_protect_job_context()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if
    current_user
      not in (
        'authenticated',
        'anon'
      )
  then
    return new;
  end if;

  if
    new.context_type is distinct from old.context_type
    or new.context_id is distinct from old.context_id
  then
    if
      old.context_type = 'job'
      or new.context_type = 'job'
    then
      raise exception
        'Job conversation context can only change through Direct Gain RPCs.';
    end if;

    if
      old.context_type = 'general'
      or new.context_type = 'general'
    then
      raise exception
        'General conversation context can only change through Direct Gain RPCs.';
    end if;
  end if;

  return new;
end;
$$;


-- ============================================================
-- RPC
-- ============================================================

create or replace function public.get_or_create_general_conversation(
  p_target_profile_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  target_user_id uuid;
  first_id uuid;
  second_id uuid;
  pair_key text;
  conversation_uuid uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to start a conversation.';
  end if;

  if p_target_profile_id is null then
    raise exception
      'This profile could not be found.';
  end if;

  target_user_id := p_target_profile_id;

  if current_user_id = target_user_id then
    raise exception
      'You cannot start a conversation with yourself.';
  end if;

  if not exists (
    select 1
    from public.profiles as profiles
    where profiles.id = current_user_id
  ) then
    raise exception
      'Your profile could not be found.';
  end if;

  if not exists (
    select 1
    from public.profiles as profiles
    where profiles.id = target_user_id
  ) then
    raise exception
      'This profile could not be found.';
  end if;

  if current_user_id::text < target_user_id::text then
    first_id := current_user_id;
    second_id := target_user_id;
  else
    first_id := target_user_id;
    second_id := current_user_id;
  end if;

  pair_key :=
    first_id::text
    || ':'
    || second_id::text;

  select conversations.id
  into conversation_uuid
  from public.conversations as conversations
  where conversations.context_type = 'general'
    and conversations.context_id = pair_key;

  if conversation_uuid is not null then
    return conversation_uuid;
  end if;

  begin
    insert into public.conversations (
      context_type,
      context_id,
      title,
      created_by
    )
    values (
      'general',
      pair_key,
      null,
      current_user_id
    )
    returning id
    into conversation_uuid;
  exception
    when unique_violation then
      select conversations.id
      into conversation_uuid
      from public.conversations as conversations
      where conversations.context_type = 'general'
        and conversations.context_id = pair_key;

      if conversation_uuid is null then
        raise exception
          'A conversation could not be opened. Try again.';
      end if;

      return conversation_uuid;
  end;

  insert into public.conversation_participants (
    conversation_id,
    user_id,
    role
  )
  values
    (
      conversation_uuid,
      current_user_id,
      'member'
    ),
    (
      conversation_uuid,
      target_user_id,
      'member'
    );

  return conversation_uuid;
end;
$$;


revoke all
on function public.get_or_create_general_conversation(uuid)
from public;

revoke all
on function public.get_or_create_general_conversation(uuid)
from anon;

revoke all
on function public.get_or_create_general_conversation(uuid)
from authenticated;

grant execute
on function public.get_or_create_general_conversation(uuid)
to authenticated;
