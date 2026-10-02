-- ============================================================
-- DIRECT GAIN
-- Conversation activity foundation — Market offer events v1
-- Migration 028
--
-- Additive. Does not modify 001–027 files.
-- Requires 001, 004, 009, and 027 already applied.
-- 027 was applied manually to production. This file is
-- CREATE OR REPLACE of lifecycle RPCs, not a rewrite of
-- the 027 source file.
--
-- DO NOT APPLY until Liam and ChatGPT review.
-- DO NOT APPLY via supabase db push / reset.
-- Apply once, manually, through the hosted SQL Editor
-- after review (same process as 024–027).
--
-- Product:
-- Market offer lifecycle remains authoritative in
-- market_offers. conversation_activity records
-- first-class transactional events for inbox ordering,
-- unread, and preview. These are NOT chat messages.
--
-- v1 source_kind: market_offer only.
-- v1 event_type:
--   offer_created, offer_accepted,
--   offer_declined, offer_withdrawn
--
-- This migration does NOT:
--   insert messages
--   change listing status
--   create deal_agreements
--   implement push notifications
--   redesign conversation_participants INSERT
--   backfill historical offer events (no retroactive unread)
--   grant anonymous access
--   wire React Native inbox/unread yet
--   rewrite historical conversations.created_at / messages.created_at
--
-- Timestamp authority:
-- NEW conversation and message writes use server now().
-- Clients cannot supply created_at / last_activity_at.
-- ============================================================


-- ============================================================
-- CONVERSATIONS.last_activity_at
--
-- Canonical server ordering timestamp for the conversation.
-- Not unread state. Clients must not set this column.
-- Backfill: max(conversation.created_at, latest living
-- message.created_at). No activity rows exist yet.
-- ============================================================

alter table public.conversations
  add column if not exists last_activity_at timestamptz;

update public.conversations as conversations
set last_activity_at = greatest(
  conversations.created_at,
  coalesce(
    (
      select max(messages.created_at)
      from public.messages as messages
      where
        messages.conversation_id = conversations.id
        and messages.deleted_at is null
    ),
    conversations.created_at
  )
)
where conversations.last_activity_at is null;

alter table public.conversations
  alter column last_activity_at set default now();

alter table public.conversations
  alter column last_activity_at set not null;

comment on column public.conversations.last_activity_at is
  'Server ordering time for inbox. greatest of conversation create, living messages, and conversation_activity. Not a read cursor. Clients cannot INSERT or UPDATE this column.';


revoke update (created_at)
on table public.conversations
from public;

revoke update (created_at)
on table public.conversations
from anon;

revoke update (created_at)
on table public.conversations
from authenticated;

revoke update (last_activity_at)
on table public.conversations
from public;

revoke update (last_activity_at)
on table public.conversations
from anon;

revoke update (last_activity_at)
on table public.conversations
from authenticated;


-- All NEW conversation rows get server now() for created_at
-- and last_activity_at, including SECURITY DEFINER helpers.
-- There is no legitimate supplied historical created_at on
-- insert. Internal last_activity_at bumps on UPDATE still
-- run as the function owner, not authenticated/anon.
create or replace function public.conversations_protect_last_activity_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.last_activity_at := new.created_at;
    return new;
  end if;

  if new.created_at is distinct from old.created_at then
    raise exception
      'Conversation created time cannot be changed.';
  end if;

  if current_user in ('authenticated', 'anon')
     and new.last_activity_at is distinct from old.last_activity_at
  then
    raise exception
      'Conversation activity time can only change through Direct Gain.';
  end if;

  return new;
end;
$$;


drop trigger if exists conversations_protect_last_activity_at
on public.conversations;

create trigger conversations_protect_last_activity_at
before insert or update
on public.conversations
for each row
execute function public.conversations_protect_last_activity_at();


revoke all
on function public.conversations_protect_last_activity_at()
from public;

revoke all
on function public.conversations_protect_last_activity_at()
from anon;

revoke all
on function public.conversations_protect_last_activity_at()
from authenticated;


-- ============================================================
-- conversation_activity
--
-- Generic event log. v1 CHECK allows only market_offer.
-- source_id is NOT a polymorphic FK: a UUID cannot safely
-- reference multiple tables. Market integrity is enforced
-- by record_market_offer_activity (row snapshot + party
-- checks) and SELECT RLS joining market_offers.
-- Future source_kind values need a later migration to
-- widen CHECKs; they must not assume a source_id FK.
--
-- Visibility is offer-party based, not conversation
-- membership. conversation_participants INSERT weakness
-- must not leak offer amounts through this table.
-- ============================================================

create table if not exists public.conversation_activity (
  id uuid
    primary key
    default gen_random_uuid(),

  conversation_id uuid
    not null
    references public.conversations(id)
    on delete cascade,

  source_kind text
    not null
    check (source_kind = 'market_offer'),

  source_id uuid
    not null,

  event_type text
    not null
    check (
      event_type in (
        'offer_created',
        'offer_accepted',
        'offer_declined',
        'offer_withdrawn'
      )
    ),

  -- Historical activity currently requires the actor profile
  -- row to remain. Do not SET NULL or CASCADE here.
  -- Account/profile deletion and retention of transactional
  -- history must be designed before changing this FK.
  actor_id uuid
    not null
    references public.profiles(id)
    on delete restrict,

  amount numeric(12, 2)
    not null
    check (
      amount > 0
      and amount <= 9999999999.99
    ),

  currency text
    not null
    check (currency = 'AUD'),

  created_at timestamptz
    not null
    default now(),

  constraint conversation_activity_source_event_unique
    unique (source_kind, source_id, event_type)
);

comment on table public.conversation_activity is
  'Transactional conversation events. Not messages. Market v1: source_kind market_offer, source_id = market_offers.id with no polymorphic FK. SELECT requires offer buyer_id or seller_id.';

comment on column public.conversation_activity.source_id is
  'Domain row id. For market_offer this is market_offers.id. No generic FK; helper + RLS join enforce integrity.';

comment on column public.conversation_activity.amount is
  'Immutable snapshot of the offer amount at event time. Do not store English preview copy.';

comment on column public.conversation_activity.actor_id is
  'ON DELETE RESTRICT: keep actor profile for transactional history. Future deletion/retention is a separate product decision.';


create index conversation_activity_conversation_created_idx
on public.conversation_activity (
  conversation_id,
  created_at desc
);

create index conversation_activity_source_idx
on public.conversation_activity (
  source_kind,
  source_id
);


alter table public.conversation_activity
enable row level security;

revoke all
on table public.conversation_activity
from public;

revoke all
on table public.conversation_activity
from anon;

revoke all
on table public.conversation_activity
from authenticated;

grant select
on table public.conversation_activity
to authenticated;


drop policy if exists
  "Offer parties can read market offer activity"
on public.conversation_activity;

create policy
  "Offer parties can read market offer activity"
on public.conversation_activity
for select
to authenticated
using (
  source_kind = 'market_offer'
  and exists (
    select 1
    from public.market_offers as offers
    where
      offers.id = conversation_activity.source_id
      and offers.conversation_id = conversation_activity.conversation_id
      and (
        auth.uid() = offers.buyer_id
        or auth.uid() = offers.seller_id
      )
  )
);


create or replace function public.conversation_activity_protect_row()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if current_user in ('authenticated', 'anon') then
    raise exception
      'Conversation activity can only be recorded through Direct Gain.';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  if tg_op = 'UPDATE' then
    raise exception
      'Conversation activity cannot be changed.';
  end if;

  return new;
end;
$$;


drop trigger if exists conversation_activity_protect_row
on public.conversation_activity;

create trigger conversation_activity_protect_row
before insert or update or delete
on public.conversation_activity
for each row
execute function public.conversation_activity_protect_row();


revoke all
on function public.conversation_activity_protect_row()
from public;

revoke all
on function public.conversation_activity_protect_row()
from anon;

revoke all
on function public.conversation_activity_protect_row()
from authenticated;


-- ============================================================
-- last_activity_at bump (server only)
-- ============================================================

create or replace function public.bump_conversation_last_activity(
  p_conversation_id uuid,
  p_occurred_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_conversation_id is null or p_occurred_at is null then
    return;
  end if;

  update public.conversations
  set last_activity_at = p_occurred_at
  where
    conversations.id = p_conversation_id
    and conversations.last_activity_at < p_occurred_at;
end;
$$;


revoke all
on function public.bump_conversation_last_activity(uuid, timestamptz)
from public;

revoke all
on function public.bump_conversation_last_activity(uuid, timestamptz)
from anon;

revoke all
on function public.bump_conversation_last_activity(uuid, timestamptz)
from authenticated;


create or replace function public.conversation_activity_touch_last_activity()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.bump_conversation_last_activity(
    new.conversation_id,
    new.created_at
  );

  return new;
end;
$$;


drop trigger if exists conversation_activity_touch_last_activity
on public.conversation_activity;

create trigger conversation_activity_touch_last_activity
after insert
on public.conversation_activity
for each row
execute function public.conversation_activity_touch_last_activity();


revoke all
on function public.conversation_activity_touch_last_activity()
from public;

revoke all
on function public.conversation_activity_touch_last_activity()
from anon;

revoke all
on function public.conversation_activity_touch_last_activity()
from authenticated;


create or replace function public.messages_protect_created_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    return new;
  end if;

  if new.created_at is distinct from old.created_at then
    raise exception
      'Message created time cannot be changed.';
  end if;

  return new;
end;
$$;


drop trigger if exists messages_protect_created_at
on public.messages;

create trigger messages_protect_created_at
before insert or update
on public.messages
for each row
execute function public.messages_protect_created_at();


revoke all
on function public.messages_protect_created_at()
from public;

revoke all
on function public.messages_protect_created_at()
from anon;

revoke all
on function public.messages_protect_created_at()
from authenticated;


revoke update (created_at)
on table public.messages
from public;

revoke update (created_at)
on table public.messages
from anon;

revoke update (created_at)
on table public.messages
from authenticated;


create or replace function public.messages_touch_last_activity()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.deleted_at is not null then
    return new;
  end if;

  perform public.bump_conversation_last_activity(
    new.conversation_id,
    new.created_at
  );

  return new;
end;
$$;


drop trigger if exists messages_touch_last_activity
on public.messages;

create trigger messages_touch_last_activity
after insert
on public.messages
for each row
execute function public.messages_touch_last_activity();


revoke all
on function public.messages_touch_last_activity()
from public;

revoke all
on function public.messages_touch_last_activity()
from anon;

revoke all
on function public.messages_touch_last_activity()
from authenticated;


-- ============================================================
-- record_market_offer_activity
--
-- SECURITY DEFINER. EXECUTE revoked from clients.
-- Lifecycle RPCs (same owner) call this internally.
-- Snapshots amount/currency from the offer row.
-- Does not insert messages or change listings/deals.
-- Unique key: exactly-once per (source_kind, source_id, event_type).
-- Matching existing row: idempotent, no extra last_activity bump.
-- Mismatched existing row: RAISE (lifecycle rolls back).
-- ============================================================

create or replace function public.record_market_offer_activity(
  p_offer public.market_offers,
  p_event_type text,
  p_actor_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_existing public.conversation_activity%rowtype;
begin
  if p_offer.id is null
     or p_offer.conversation_id is null
     or p_actor_id is null
     or p_event_type is null
  then
    raise exception
      'This offer could not be updated.';
  end if;

  if p_event_type not in (
    'offer_created',
    'offer_accepted',
    'offer_declined',
    'offer_withdrawn'
  ) then
    raise exception
      'This offer could not be updated.';
  end if;

  if p_actor_id is distinct from p_offer.buyer_id
     and p_actor_id is distinct from p_offer.seller_id
  then
    raise exception
      'This offer could not be updated.';
  end if;

  if p_event_type in ('offer_created', 'offer_withdrawn')
     and p_actor_id is distinct from p_offer.buyer_id
  then
    raise exception
      'This offer could not be updated.';
  end if;

  if p_event_type in ('offer_accepted', 'offer_declined')
     and p_actor_id is distinct from p_offer.seller_id
  then
    raise exception
      'This offer could not be updated.';
  end if;

  insert into public.conversation_activity (
    conversation_id,
    source_kind,
    source_id,
    event_type,
    actor_id,
    amount,
    currency
  )
  values (
    p_offer.conversation_id,
    'market_offer',
    p_offer.id,
    p_event_type,
    p_actor_id,
    p_offer.amount,
    p_offer.currency
  )
  on conflict on constraint conversation_activity_source_event_unique
  do nothing;

  if found then
    return;
  end if;

  select *
  into v_existing
  from public.conversation_activity as activity
  where
    activity.source_kind = 'market_offer'
    and activity.source_id = p_offer.id
    and activity.event_type = p_event_type;

  if not found then
    raise exception
      'This offer could not be updated.';
  end if;

  if v_existing.conversation_id is distinct from p_offer.conversation_id
     or v_existing.source_kind is distinct from 'market_offer'
     or v_existing.source_id is distinct from p_offer.id
     or v_existing.event_type is distinct from p_event_type
     or v_existing.actor_id is distinct from p_actor_id
     or v_existing.amount is distinct from p_offer.amount
     or v_existing.currency is distinct from p_offer.currency
  then
    raise exception
      'This offer could not be updated.';
  end if;
end;
$$;


revoke all
on function public.record_market_offer_activity(public.market_offers, text, uuid)
from public;

revoke all
on function public.record_market_offer_activity(public.market_offers, text, uuid)
from anon;

revoke all
on function public.record_market_offer_activity(public.market_offers, text, uuid)
from authenticated;


-- ============================================================
-- CREATE OR REPLACE 027 lifecycle RPCs
-- Preserve 027 validation, locking, and security.
-- Activity is recorded only on real transitions.
-- Unique-race create fallback does not insert activity;
-- the inserting transaction records offer_created.
-- Unique event constraint remains final safety.
-- ============================================================

create or replace function public.create_market_offer(
  p_listing_id uuid,
  p_amount numeric,
  p_message text default null
)
returns table (
  id uuid,
  conversation_id uuid,
  listing_id uuid,
  buyer_id uuid,
  seller_id uuid,
  amount numeric,
  currency text,
  status text,
  message text,
  created_at timestamptz,
  responded_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_buyer_id uuid;
  v_seller_id uuid;
  v_listing public.market_listings%rowtype;
  v_amount numeric(12, 2);
  v_message text;
  v_conversation_id uuid;
  v_existing public.market_offers%rowtype;
  v_created public.market_offers%rowtype;
  v_inserted boolean := false;
begin
  v_buyer_id := auth.uid();

  if v_buyer_id is null then
    raise exception
      'You must be signed in to make an offer.';
  end if;

  if p_listing_id is null then
    raise exception
      'This listing is not available.';
  end if;

  if p_amount is null
     or p_amount is distinct from round(p_amount, 2)
  then
    raise exception
      'Enter an amount with at most two decimal places.';
  end if;

  v_amount := round(p_amount, 2);

  if v_amount <= 0 or v_amount > 9999999999.99 then
    raise exception
      'Enter a valid amount.';
  end if;

  if p_message is null then
    v_message := null;
  else
    v_message := btrim(p_message);

    if v_message = '' then
      v_message := null;
    elsif char_length(v_message) > 500 then
      raise exception
        'Offer message is too long.';
    end if;
  end if;

  select *
  into v_listing
  from public.market_listings
  where market_listings.id = p_listing_id
  for update;

  if not found then
    raise exception
      'This listing is not available.';
  end if;

  if v_listing.status is distinct from 'active' then
    raise exception
      'This listing is not available.';
  end if;

  if v_listing.allows_offers is not true then
    raise exception
      'This listing is not accepting offers.';
  end if;

  v_seller_id := v_listing.seller_profile_id;

  if v_seller_id is null then
    raise exception
      'This listing is not available.';
  end if;

  if v_buyer_id = v_seller_id then
    raise exception
      'You cannot make an offer on your own listing.';
  end if;

  if exists (
    select 1
    from public.market_offers as accepted
    where
      accepted.listing_id = p_listing_id
      and accepted.status = 'accepted'
  ) then
    raise exception
      'This listing is not accepting new offers.';
  end if;

  select *
  into v_existing
  from public.market_offers as pending
  where
    pending.listing_id = p_listing_id
    and pending.buyer_id = v_buyer_id
    and pending.status = 'pending'
  for update;

  if found then
    return query
    select
      v_existing.id,
      v_existing.conversation_id,
      v_existing.listing_id,
      v_existing.buyer_id,
      v_existing.seller_id,
      v_existing.amount,
      v_existing.currency,
      v_existing.status,
      v_existing.message,
      v_existing.created_at,
      v_existing.responded_at;

    return;
  end if;

  v_conversation_id := public.ensure_market_offer_conversation(
    p_listing_id,
    v_buyer_id,
    v_seller_id,
    v_listing.title
  );

  begin
    insert into public.market_offers (
      conversation_id,
      listing_id,
      buyer_id,
      seller_id,
      amount,
      currency,
      status,
      created_by_role,
      message,
      parent_offer_id,
      responded_at
    )
    values (
      v_conversation_id,
      p_listing_id,
      v_buyer_id,
      v_seller_id,
      v_amount,
      'AUD',
      'pending',
      'buyer',
      v_message,
      null,
      null
    )
    returning * into v_created;

    v_inserted := true;
  exception
    when unique_violation then
      select *
      into v_created
      from public.market_offers as pending
      where
        pending.listing_id = p_listing_id
        and pending.buyer_id = v_buyer_id
        and pending.status = 'pending';

      if not found then
        raise exception
          'This offer could not be created.';
      end if;

      v_inserted := false;
  end;

  if v_inserted then
    perform public.record_market_offer_activity(
      v_created,
      'offer_created',
      v_buyer_id
    );
  end if;

  return query
  select
    v_created.id,
    v_created.conversation_id,
    v_created.listing_id,
    v_created.buyer_id,
    v_created.seller_id,
    v_created.amount,
    v_created.currency,
    v_created.status,
    v_created.message,
    v_created.created_at,
    v_created.responded_at;
end;
$$;


comment on function public.create_market_offer(uuid, numeric, text) is
  'Buyer creates a proposed price for an active listing that allows offers. Records offer_created activity only when a new pending row is inserted. Does not move money.';


create or replace function public.accept_market_offer(
  p_offer_id uuid
)
returns table (
  id uuid,
  conversation_id uuid,
  listing_id uuid,
  buyer_id uuid,
  seller_id uuid,
  amount numeric,
  currency text,
  status text,
  message text,
  created_at timestamptz,
  responded_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor uuid;
  v_listing_id uuid;
  v_listing public.market_listings%rowtype;
  v_offer public.market_offers%rowtype;
  v_sibling public.market_offers%rowtype;
begin
  v_actor := auth.uid();

  if v_actor is null then
    raise exception
      'You must be signed in to respond to an offer.';
  end if;

  if p_offer_id is null then
    raise exception
      'This offer could not be updated.';
  end if;

  select offers.listing_id
  into v_listing_id
  from public.market_offers as offers
  where offers.id = p_offer_id;

  if v_listing_id is null then
    raise exception
      'This offer could not be updated.';
  end if;

  select *
  into v_listing
  from public.market_listings
  where market_listings.id = v_listing_id
  for update;

  if not found then
    raise exception
      'This offer could not be updated.';
  end if;

  select *
  into v_offer
  from public.market_offers
  where market_offers.id = p_offer_id
  for update;

  if not found then
    raise exception
      'This offer could not be updated.';
  end if;

  if v_actor is distinct from v_offer.seller_id
     or v_actor is distinct from v_listing.seller_profile_id
     or v_offer.seller_id is distinct from v_listing.seller_profile_id
     or v_offer.listing_id is distinct from v_listing.id
  then
    raise exception
      'This offer could not be updated.';
  end if;

  if v_offer.status = 'accepted' then
    return query
    select
      v_offer.id,
      v_offer.conversation_id,
      v_offer.listing_id,
      v_offer.buyer_id,
      v_offer.seller_id,
      v_offer.amount,
      v_offer.currency,
      v_offer.status,
      v_offer.message,
      v_offer.created_at,
      v_offer.responded_at;

    return;
  end if;

  if v_offer.status is distinct from 'pending' then
    raise exception
      'This offer is no longer pending.';
  end if;

  if v_listing.status is distinct from 'active' then
    raise exception
      'This listing is not available.';
  end if;

  if exists (
    select 1
    from public.market_offers as accepted
    where
      accepted.listing_id = v_listing.id
      and accepted.status = 'accepted'
      and accepted.id is distinct from v_offer.id
  ) then
    raise exception
      'This listing already has an accepted offer.';
  end if;

  for v_sibling in
    update public.market_offers
    set
      status = 'declined',
      responded_at = now()
    where
      market_offers.listing_id = v_listing.id
      and market_offers.status = 'pending'
      and market_offers.id is distinct from v_offer.id
    returning *
  loop
    perform public.record_market_offer_activity(
      v_sibling,
      'offer_declined',
      v_actor
    );
  end loop;

  update public.market_offers
  set
    status = 'accepted',
    responded_at = now()
  where market_offers.id = v_offer.id
  returning * into v_offer;

  perform public.record_market_offer_activity(
    v_offer,
    'offer_accepted',
    v_actor
  );

  return query
  select
    v_offer.id,
    v_offer.conversation_id,
    v_offer.listing_id,
    v_offer.buyer_id,
    v_offer.seller_id,
    v_offer.amount,
    v_offer.currency,
    v_offer.status,
    v_offer.message,
    v_offer.created_at,
    v_offer.responded_at;
end;
$$;


comment on function public.accept_market_offer(uuid) is
  'Seller accepts a pending proposed price. Records offer_accepted and offer_declined for siblings actually declined. Does not mark the listing sold, create a deal agreement, or move money.';


create or replace function public.decline_market_offer(
  p_offer_id uuid
)
returns table (
  id uuid,
  conversation_id uuid,
  listing_id uuid,
  buyer_id uuid,
  seller_id uuid,
  amount numeric,
  currency text,
  status text,
  message text,
  created_at timestamptz,
  responded_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor uuid;
  v_listing_id uuid;
  v_listing public.market_listings%rowtype;
  v_offer public.market_offers%rowtype;
begin
  v_actor := auth.uid();

  if v_actor is null then
    raise exception
      'You must be signed in to respond to an offer.';
  end if;

  if p_offer_id is null then
    raise exception
      'This offer could not be updated.';
  end if;

  select offers.listing_id
  into v_listing_id
  from public.market_offers as offers
  where offers.id = p_offer_id;

  if v_listing_id is null then
    raise exception
      'This offer could not be updated.';
  end if;

  select *
  into v_listing
  from public.market_listings
  where market_listings.id = v_listing_id
  for update;

  if not found then
    raise exception
      'This offer could not be updated.';
  end if;

  select *
  into v_offer
  from public.market_offers
  where market_offers.id = p_offer_id
  for update;

  if not found then
    raise exception
      'This offer could not be updated.';
  end if;

  if v_actor is distinct from v_offer.seller_id
     or v_actor is distinct from v_listing.seller_profile_id
     or v_offer.seller_id is distinct from v_listing.seller_profile_id
     or v_offer.listing_id is distinct from v_listing.id
  then
    raise exception
      'This offer could not be updated.';
  end if;

  if v_offer.status = 'declined' then
    return query
    select
      v_offer.id,
      v_offer.conversation_id,
      v_offer.listing_id,
      v_offer.buyer_id,
      v_offer.seller_id,
      v_offer.amount,
      v_offer.currency,
      v_offer.status,
      v_offer.message,
      v_offer.created_at,
      v_offer.responded_at;

    return;
  end if;

  if v_offer.status is distinct from 'pending' then
    raise exception
      'This offer is no longer pending.';
  end if;

  if v_listing.status is distinct from 'active' then
    raise exception
      'This listing is not available.';
  end if;

  update public.market_offers
  set
    status = 'declined',
    responded_at = now()
  where market_offers.id = v_offer.id
  returning * into v_offer;

  perform public.record_market_offer_activity(
    v_offer,
    'offer_declined',
    v_actor
  );

  return query
  select
    v_offer.id,
    v_offer.conversation_id,
    v_offer.listing_id,
    v_offer.buyer_id,
    v_offer.seller_id,
    v_offer.amount,
    v_offer.currency,
    v_offer.status,
    v_offer.message,
    v_offer.created_at,
    v_offer.responded_at;
end;
$$;


comment on function public.decline_market_offer(uuid) is
  'Seller declines a pending proposed price. Records offer_declined only on a real pending transition. Other offers are unchanged.';


create or replace function public.withdraw_market_offer(
  p_offer_id uuid
)
returns table (
  id uuid,
  conversation_id uuid,
  listing_id uuid,
  buyer_id uuid,
  seller_id uuid,
  amount numeric,
  currency text,
  status text,
  message text,
  created_at timestamptz,
  responded_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor uuid;
  v_listing_id uuid;
  v_offer public.market_offers%rowtype;
begin
  v_actor := auth.uid();

  if v_actor is null then
    raise exception
      'You must be signed in to withdraw an offer.';
  end if;

  if p_offer_id is null then
    raise exception
      'This offer could not be updated.';
  end if;

  select offers.listing_id
  into v_listing_id
  from public.market_offers as offers
  where offers.id = p_offer_id;

  if v_listing_id is null then
    raise exception
      'This offer could not be updated.';
  end if;

  perform 1
  from public.market_listings
  where market_listings.id = v_listing_id
  for update;

  select *
  into v_offer
  from public.market_offers
  where market_offers.id = p_offer_id
  for update;

  if not found then
    raise exception
      'This offer could not be updated.';
  end if;

  if v_actor is distinct from v_offer.buyer_id then
    raise exception
      'This offer could not be updated.';
  end if;

  if v_offer.status = 'withdrawn' then
    return query
    select
      v_offer.id,
      v_offer.conversation_id,
      v_offer.listing_id,
      v_offer.buyer_id,
      v_offer.seller_id,
      v_offer.amount,
      v_offer.currency,
      v_offer.status,
      v_offer.message,
      v_offer.created_at,
      v_offer.responded_at;

    return;
  end if;

  if v_offer.status is distinct from 'pending' then
    raise exception
      'This offer is no longer pending.';
  end if;

  update public.market_offers
  set
    status = 'withdrawn',
    responded_at = now()
  where market_offers.id = p_offer_id
  returning * into v_offer;

  perform public.record_market_offer_activity(
    v_offer,
    'offer_withdrawn',
    v_actor
  );

  return query
  select
    v_offer.id,
    v_offer.conversation_id,
    v_offer.listing_id,
    v_offer.buyer_id,
    v_offer.seller_id,
    v_offer.amount,
    v_offer.currency,
    v_offer.status,
    v_offer.message,
    v_offer.created_at,
    v_offer.responded_at;
end;
$$;


comment on function public.withdraw_market_offer(uuid) is
  'Buyer withdraws their own pending proposed price. Records offer_withdrawn only on a real pending transition. The seller cannot withdraw a buyer offer.';


revoke all
on function public.create_market_offer(uuid, numeric, text)
from public;

revoke all
on function public.create_market_offer(uuid, numeric, text)
from anon;

revoke all
on function public.accept_market_offer(uuid)
from public;

revoke all
on function public.accept_market_offer(uuid)
from anon;

revoke all
on function public.decline_market_offer(uuid)
from public;

revoke all
on function public.decline_market_offer(uuid)
from anon;

revoke all
on function public.withdraw_market_offer(uuid)
from public;

revoke all
on function public.withdraw_market_offer(uuid)
from anon;

grant execute
on function public.create_market_offer(uuid, numeric, text)
to authenticated;

grant execute
on function public.accept_market_offer(uuid)
to authenticated;

grant execute
on function public.decline_market_offer(uuid)
to authenticated;

grant execute
on function public.withdraw_market_offer(uuid)
to authenticated;
