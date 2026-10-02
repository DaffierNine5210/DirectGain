-- ============================================================
-- DIRECT GAIN
-- Real Market Offers v1 — production offer authority
-- Migration 027
--
-- Additive. Does not modify 001–026 files.
-- Requires 001 and 024 already applied.
-- DO NOT APPLY until Liam and ChatGPT review.
-- DO NOT APPLY via supabase db push / reset.
-- Apply once, manually, through the hosted SQL Editor
-- after review (same process as 024 / 025 / 026).
--
-- Product:
-- An offer is a proposed price. Acceptance means the
-- seller accepted that proposal inside Direct Gain.
-- This is not payment, escrow, verified funds, a
-- completed sale, a binding guarantee, or proof of
-- exchange.
--
-- Ordinary authenticated clients must not INSERT,
-- UPDATE, or DELETE market_offers. Lifecycle is only:
--   public.create_market_offer
--   public.accept_market_offer
--   public.decline_market_offer
--   public.withdraw_market_offer
--
-- v1 statuses used by RPCs:
--   pending, accepted, declined, withdrawn
-- Counteroffers, expired, Deal Agreements, listing
-- reserved/sold, reviews, and notifications are
-- deferred. Listing status is not changed by accept.
--
-- This migration does NOT:
--   modify deal_agreements
--   redesign conversation_participants INSERT
--   grant anonymous access
--   connect React Native Make Offer UI
-- ============================================================


-- ============================================================
-- EXISTING DATA — listing_id TEXT → UUID
--
-- Strategy B: fail with an explicit precondition if any
-- historical market_offers row is incompatible.
--
-- Compatible means:
--   listing_id is a UUID string
--   AND it references an existing market_listings.id
--   AND currency is AUD
--   AND no duplicate pending (listing_id, buyer_id)
--   AND no duplicate accepted listing_id
--
-- Empty table is compatible (no rows to convert).
--
-- Do not delete or rewrite production offer rows merely
-- to make the type change or unique indexes succeed.
-- ============================================================

do $$
begin
  if exists (
    select 1
    from public.market_offers as offers
    where
      offers.listing_id is null
      or offers.listing_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  ) then
    raise exception
      '027 precondition failed: market_offers.listing_id contains values that are not UUIDs. Convert or archive those rows before applying this migration. No rows were deleted.';
  end if;

  if exists (
    select 1
    from public.market_offers as offers
    where not exists (
      select 1
      from public.market_listings as listings
      where listings.id = offers.listing_id::uuid
    )
  ) then
    raise exception
      '027 precondition failed: market_offers.listing_id contains UUIDs that do not match public.market_listings(id). Convert or archive those rows before applying this migration. No rows were deleted.';
  end if;

  if exists (
    select 1
    from public.market_offers
    where currency is distinct from 'AUD'
  ) then
    raise exception
      '027 precondition failed: market_offers.currency contains non-AUD values. Convert or archive those rows before applying this migration. No rows were deleted.';
  end if;

  if exists (
    select 1
    from public.market_offers as offers
    where offers.status = 'pending'
    group by
      offers.listing_id::uuid,
      offers.buyer_id
    having count(*) > 1
  ) then
    raise exception
      '027 cannot continue: historical pending market_offers violate the one-pending-offer-per-buyer/listing invariant. Convert or archive those rows before applying this migration. No rows were deleted, merged, declined, or withdrawn.';
  end if;

  if exists (
    select 1
    from public.market_offers as offers
    where offers.status = 'accepted'
    group by offers.listing_id::uuid
    having count(*) > 1
  ) then
    raise exception
      '027 cannot continue: historical accepted market_offers violate the one-accepted-offer-per-listing invariant. Convert or archive those rows before applying this migration. No rows were deleted or rewritten.';
  end if;
end;
$$;


alter table public.market_offers
  alter column listing_id
  type uuid
  using listing_id::uuid;


-- Listings are not hard-deleted as normal lifecycle.
-- RESTRICT preserves offer history: a listing row with
-- offers cannot be deleted. Do not CASCADE (would erase
-- transaction history). Do not SET NULL (listing_id is
-- required).
alter table public.market_offers
  drop constraint if exists market_offers_listing_id_fkey;

alter table public.market_offers
  add constraint market_offers_listing_id_fkey
  foreign key (listing_id)
  references public.market_listings(id)
  on delete restrict;


comment on column public.market_offers.listing_id is
  'Authoritative market listing. Client cannot choose this independently of create_market_offer.';

comment on column public.market_offers.amount is
  'Proposed price in AUD. Not a payment, escrow hold, or proof of funds.';

comment on column public.market_offers.status is
  'Offer lifecycle. accepted means the seller accepted this proposed price inside Direct Gain, not that a sale completed.';

comment on table public.market_offers is
  'Market price proposals. Writes only through create/accept/decline/withdraw RPCs.';


-- ============================================================
-- MONEY
-- amount already CHECK (amount > 0) from 001.
-- numeric(12,2) upper bound is 9999999999.99, matching
-- listing price. Do not require amount < listing price.
-- ============================================================

alter table public.market_offers
  drop constraint if exists market_offers_amount_max_check;

alter table public.market_offers
  add constraint market_offers_amount_max_check
  check (amount <= 9999999999.99);

alter table public.market_offers
  drop constraint if exists market_offers_currency_aud_check;

alter table public.market_offers
  add constraint market_offers_currency_aud_check
  check (currency = 'AUD');


-- Status CHECK from 001 still allows countered/expired for
-- historical compatibility. v1 RPCs never write those.
-- Tightening the CHECK is not required for security because
-- clients cannot UPDATE status.


-- ============================================================
-- UNIQUE INVARIANTS
-- Duplicate historical pending/accepted rows already failed
-- closed in the existing-data precondition. These indexes
-- do not rewrite rows.
-- ============================================================

drop index if exists public.market_offers_one_pending_per_buyer_listing;

create unique index market_offers_one_pending_per_buyer_listing
on public.market_offers (
  listing_id,
  buyer_id
)
where status = 'pending';

drop index if exists public.market_offers_one_accepted_per_listing;

create unique index market_offers_one_accepted_per_listing
on public.market_offers (
  listing_id
)
where status = 'accepted';


-- ============================================================
-- DIRECT WRITE LOCKDOWN
-- Revoke first. Do not rely on RLS alone.
-- ============================================================

revoke all
on table public.market_offers
from public;

revoke all
on table public.market_offers
from anon;

revoke all
on table public.market_offers
from authenticated;

grant select
on table public.market_offers
to authenticated;


drop policy if exists
  "Deal participants can read offers"
on public.market_offers;

drop policy if exists
  "Buyers and sellers can create offers"
on public.market_offers;

drop policy if exists
  "Participants can update offers"
on public.market_offers;

drop policy if exists
  "Deal participants can update offers"
on public.market_offers;

drop policy if exists
  "Offer parties can read offers"
on public.market_offers;


-- Buyer or seller on the row. Conversation membership
-- is not the identity authority.
create policy
  "Offer parties can read offers"
on public.market_offers
for select
to authenticated
using (
  auth.uid() = buyer_id
  or
  auth.uid() = seller_id
);


-- No INSERT / UPDATE / DELETE policies for clients.


-- ============================================================
-- IMMUTABILITY
-- SECURITY DEFINER RPCs are not current_user
-- authenticated/anon, so they may write. Even then,
-- only status / responded_at / updated_at may change.
-- ============================================================

create or replace function public.market_offers_protect_row()
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
    if tg_op = 'INSERT' then
      raise exception
        'Market offers can only be created through the offer operation.';
    end if;

    if tg_op = 'DELETE' then
      raise exception
        'Market offers cannot be deleted.';
    end if;

    raise exception
      'Market offers can only change through the offer operations.';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  if tg_op = 'INSERT' then
    return new;
  end if;

  if
    new.id is distinct from old.id
    or new.conversation_id is distinct from old.conversation_id
    or new.listing_id is distinct from old.listing_id
    or new.buyer_id is distinct from old.buyer_id
    or new.seller_id is distinct from old.seller_id
    or new.amount is distinct from old.amount
    or new.currency is distinct from old.currency
    or new.created_by_role is distinct from old.created_by_role
    or new.message is distinct from old.message
    or new.parent_offer_id is distinct from old.parent_offer_id
    or new.created_at is distinct from old.created_at
  then
    raise exception
      'Market offer fields cannot be changed.';
  end if;

  if new.status is distinct from old.status then
    if old.status is distinct from 'pending' then
      raise exception
        'This offer can no longer be updated.';
    end if;

    if new.status not in (
      'accepted',
      'declined',
      'withdrawn'
    ) then
      raise exception
        'This offer status is not allowed.';
    end if;
  end if;

  return new;
end;
$$;


drop trigger if exists market_offers_protect_row
on public.market_offers;

create trigger market_offers_protect_row
before insert or update or delete
on public.market_offers
for each row
execute function public.market_offers_protect_row();


revoke all
on function public.market_offers_protect_row()
from public;

revoke all
on function public.market_offers_protect_row()
from anon;

revoke all
on function public.market_offers_protect_row()
from authenticated;


-- ============================================================
-- CONVERSATION CREATE / REUSE (server-controlled)
--
-- Does not trust a client conversation_id.
-- Reuses the oldest market thread for this listing
-- whose participants are exactly this buyer (role buyer)
-- and this seller (role seller).
-- Otherwise inserts a market conversation + those two
-- participants.
--
-- Broader conversation_participants INSERT weakness is
-- not redesigned here. Offer identity still comes from
-- listing.seller_profile_id and auth.uid(), never from
-- forged membership.
-- ============================================================

create or replace function public.ensure_market_offer_conversation(
  p_listing_id uuid,
  p_buyer_id uuid,
  p_seller_id uuid,
  p_title text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_conversation_id uuid;
  v_context_id text;
  v_listing_seller_id uuid;
begin
  if
    p_buyer_id is null
    or p_buyer_id is distinct from auth.uid()
  then
    raise exception
      'This offer could not be created.';
  end if;

  if p_listing_id is null
     or p_seller_id is null
  then
    raise exception
      'This offer could not be created.';
  end if;

  select listings.seller_profile_id
  into v_listing_seller_id
  from public.market_listings as listings
  where listings.id = p_listing_id;

  if not found then
    raise exception
      'This offer could not be created.';
  end if;

  if v_listing_seller_id is distinct from p_seller_id then
    raise exception
      'This offer could not be created.';
  end if;

  if p_buyer_id = p_seller_id then
    raise exception
      'This offer could not be created.';
  end if;

  v_context_id := p_listing_id::text;

  select conversations.id
  into v_conversation_id
  from public.conversations as conversations
  where
    conversations.context_type = 'market'
    and conversations.context_id = v_context_id
    and exists (
      select 1
      from public.conversation_participants as buyer_row
      where
        buyer_row.conversation_id = conversations.id
        and buyer_row.user_id = p_buyer_id
        and buyer_row.role = 'buyer'
    )
    and exists (
      select 1
      from public.conversation_participants as seller_row
      where
        seller_row.conversation_id = conversations.id
        and seller_row.user_id = p_seller_id
        and seller_row.role = 'seller'
    )
    and (
      select count(*)
      from public.conversation_participants as members
      where members.conversation_id = conversations.id
    ) = 2
  order by conversations.created_at asc
  limit 1;

  if v_conversation_id is not null then
    return v_conversation_id;
  end if;

  insert into public.conversations (
    context_type,
    context_id,
    title,
    created_by
  )
  values (
    'market',
    v_context_id,
    left(btrim(coalesce(p_title, '')), 80),
    p_buyer_id
  )
  returning id
  into v_conversation_id;

  insert into public.conversation_participants (
    conversation_id,
    user_id,
    role
  )
  values
    (
      v_conversation_id,
      p_buyer_id,
      'buyer'
    ),
    (
      v_conversation_id,
      p_seller_id,
      'seller'
    );

  return v_conversation_id;
end;
$$;


revoke all
on function public.ensure_market_offer_conversation(uuid, uuid, uuid, text)
from public;

revoke all
on function public.ensure_market_offer_conversation(uuid, uuid, uuid, text)
from anon;

revoke all
on function public.ensure_market_offer_conversation(uuid, uuid, uuid, text)
from authenticated;


-- ============================================================
-- CREATE
--
-- Client supplies: listing id, amount, optional message.
-- DB derives: buyer, seller, currency, status, role,
-- conversation, timestamps.
--
-- Duplicate pending (same buyer + listing): return the
-- existing pending row (idempotent / retry-friendly).
-- Amount/message from a retry are ignored if a pending
-- offer already exists.
--
-- Once any accepted offer exists for the listing, new
-- offers are rejected until a later lifecycle reopens it.
--
-- Locking: lock the listing row first, then inspect
-- offers. Same listing-first order as accept/decline.
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
  end;

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
  'Buyer creates a proposed price for an active listing that allows offers. Does not move money.';


-- ============================================================
-- ACCEPT / DECLINE / WITHDRAW
--
-- Locking order (deadlock avoidance):
--   1. market_listings row FOR UPDATE (by listing_id)
--   2. target market_offers row FOR UPDATE (by id)
--
-- create_market_offer uses the same listing-first lock.
-- withdraw also takes the listing lock first so it
-- cannot deadlock against accept/decline.
--
-- Accept does NOT require allows_offers still true:
-- the seller may still respond to an existing pending
-- proposal after turning off new offers.
-- Accept DOES require listing.status = active.
-- Accept does NOT change listing status.
--
-- Sibling pending offers on the same listing are
-- declined in the same transaction as accept.
-- ============================================================

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

  update public.market_offers
  set
    status = 'declined',
    responded_at = now()
  where
    market_offers.listing_id = v_listing.id
    and market_offers.status = 'pending'
    and market_offers.id is distinct from v_offer.id;

  update public.market_offers
  set
    status = 'accepted',
    responded_at = now()
  where market_offers.id = v_offer.id
  returning * into v_offer;

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
  'Seller accepts a pending proposed price. Does not mark the listing sold, create a deal agreement, or move money.';


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
  'Seller declines a pending proposed price. Other offers are unchanged.';


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
  'Buyer withdraws their own pending proposed price. The seller cannot withdraw a buyer offer.';


-- ============================================================
-- RPC GRANTS
-- Helper ensure_market_offer_conversation is not granted
-- to clients. Trigger function is not granted.
-- ============================================================

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
