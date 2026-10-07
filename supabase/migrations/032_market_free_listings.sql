-- ============================================================
-- DIRECT GAIN
-- Market genuine FREE listings + offer protection
-- Migration 032
--
-- Additive. Does not modify 001–031 files.
-- Requires 024, 026, 028, and 030 already applied.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
-- DO NOT re-run 024–031.
-- DO NOT supabase db push as part of this slice.
--
-- Product:
-- market_listings.price = 0 is a real FREE listing.
-- Presentation is client-side "FREE", not a status.
-- FREE listings cannot accept monetary offers.
-- Paid listings keep existing offer behaviour.
--
-- This migration does NOT:
--   change listing statuses
--   auto-sell on offer accept
--   create deal/payment/escrow
--   change Storage policies
--   grant anonymous access
--   redesign Create Listing
-- ============================================================


-- ============================================================
-- INVARIANT
-- Coerce any leftover zero-price + offers-on rows, then
-- prevent that combination from persisting.
-- price and allows_offers are NOT NULL.
-- Live paid listings (price > 0) are unaffected.
-- ============================================================

update public.market_listings
set
  allows_offers = false
where
  price = 0
  and allows_offers is distinct from false;

alter table public.market_listings
  drop constraint if exists
    market_listings_free_no_offers_check;

alter table public.market_listings
  add constraint market_listings_free_no_offers_check
  check (
    price > 0
    or allows_offers = false
  );

comment on constraint market_listings_free_no_offers_check
on public.market_listings is
  'FREE listings (price = 0) cannot accept monetary offers.';


-- ============================================================
-- PUBLISH
-- Same 026 body. Price rule: NULL/negative invalid, 0 valid.
-- FREE publish forces allows_offers false.
-- ============================================================

create or replace function public.publish_own_market_listing(
  p_listing_id uuid
)
returns table (
  id uuid,
  status text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  locked public.market_listings%rowtype;
  media_count integer;
  distinct_orders integer;
  min_order integer;
  max_order integer;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to list this item.';
  end if;

  if p_listing_id is null then
    raise exception
      'This listing could not be listed.';
  end if;

  select *
  into locked
  from public.market_listings as listings
  where listings.id = p_listing_id
    and listings.seller_profile_id = current_user_id
  for update;

  if not found then
    raise exception
      'This listing could not be listed.';
  end if;

  if locked.status is distinct from 'draft' then
    raise exception
      'Only a saved draft can be listed.';
  end if;

  if char_length(btrim(locked.title)) = 0 then
    raise exception
      'Enter a title before listing.';
  end if;

  if char_length(btrim(locked.description)) = 0 then
    raise exception
      'Enter a description before listing.';
  end if;

  if char_length(btrim(locked.subcategory)) = 0 then
    raise exception
      'Enter the item type before listing.';
  end if;

  if char_length(btrim(locked.suburb)) = 0 then
    raise exception
      'Enter a suburb before listing.';
  end if;

  if char_length(btrim(locked.state)) = 0 then
    raise exception
      'Enter a state before listing.';
  end if;

  if locked.currency is distinct from 'AUD' then
    raise exception
      'This listing could not be listed.';
  end if;

  if locked.price is null or locked.price < 0 then
    raise exception
      'Enter a valid price before listing.';
  end if;

  if
    locked.pickup_available is not true
    and locked.delivery_available is not true
  then
    raise exception
      'Choose pickup, delivery, or both before listing.';
  end if;

  perform
    media.id
  from public.market_listing_media as media
  where media.listing_id = locked.id
  for update;

  select
    count(*)::integer,
    count(distinct media.sort_order)::integer,
    coalesce(min(media.sort_order), -1)::integer,
    coalesce(max(media.sort_order), -1)::integer
  into
    media_count,
    distinct_orders,
    min_order,
    max_order
  from public.market_listing_media as media
  where media.listing_id = locked.id;

  if media_count < 1 then
    raise exception
      'Add at least one photo before listing.';
  end if;

  if media_count > 20 then
    raise exception
      'This listing has too many photos to list.';
  end if;

  if
    distinct_orders is distinct from media_count
    or min_order is distinct from 0
    or max_order is distinct from (media_count - 1)
  then
    raise exception
      'Photo order could not be confirmed. Reorder your photos and try again.';
  end if;

  update public.market_listings as listings
  set
    status = 'active',
    allows_offers = case
      when locked.price = 0 then false
      else listings.allows_offers
    end
  where listings.id = locked.id
    and listings.seller_profile_id = current_user_id
    and listings.status = 'draft';

  if not found then
    raise exception
      'This listing could not be listed.';
  end if;

  return query
  select
    locked.id,
    'active'::text;
end;
$$;


comment on function public.publish_own_market_listing(uuid) is
  'Owner publishes a draft to active after completeness checks. price = 0 is FREE and forces allows_offers false. Does not move money.';


revoke all
on function public.publish_own_market_listing(uuid)
from public;

revoke all
on function public.publish_own_market_listing(uuid)
from anon;

revoke all
on function public.publish_own_market_listing(uuid)
from authenticated;

grant execute
on function public.publish_own_market_listing(uuid)
to authenticated;


-- ============================================================
-- REACTIVATE
-- Same 030 body. Price rule: NULL/negative invalid, 0 valid.
-- FREE reactivate forces allows_offers false.
-- ============================================================

create or replace function public.reactivate_own_market_listing(
  p_listing_id uuid
)
returns table (
  id uuid,
  status text
)
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  locked public.market_listings%rowtype;
  media_count integer;
  distinct_orders integer;
  min_order integer;
  max_order integer;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to list this item.';
  end if;

  if p_listing_id is null then
    raise exception
      'This listing could not be listed.';
  end if;

  select *
  into locked
  from public.market_listings as listings
  where listings.id = p_listing_id
    and listings.seller_profile_id = current_user_id
  for update;

  if not found then
    raise exception
      'This listing could not be listed.';
  end if;

  if locked.status is distinct from 'paused' then
    raise exception
      'Only a paused listing can be listed again.';
  end if;

  if locked.sold_at is not null then
    raise exception
      'This listing could not be listed.';
  end if;

  if char_length(btrim(locked.title)) = 0 then
    raise exception
      'Enter a title before listing.';
  end if;

  if char_length(btrim(locked.description)) = 0 then
    raise exception
      'Enter a description before listing.';
  end if;

  if char_length(btrim(locked.subcategory)) = 0 then
    raise exception
      'Enter the item type before listing.';
  end if;

  if char_length(btrim(locked.suburb)) = 0 then
    raise exception
      'Enter a suburb before listing.';
  end if;

  if char_length(btrim(locked.state)) = 0 then
    raise exception
      'Enter a state before listing.';
  end if;

  if locked.currency is distinct from 'AUD' then
    raise exception
      'This listing could not be listed.';
  end if;

  if locked.price is null or locked.price < 0 then
    raise exception
      'Enter a valid price before listing.';
  end if;

  if
    locked.pickup_available is not true
    and locked.delivery_available is not true
  then
    raise exception
      'Choose pickup, delivery, or both before listing.';
  end if;

  perform
    media.id
  from public.market_listing_media as media
  where media.listing_id = locked.id
  for update;

  select
    count(*)::integer,
    count(distinct media.sort_order)::integer,
    coalesce(min(media.sort_order), -1)::integer,
    coalesce(max(media.sort_order), -1)::integer
  into
    media_count,
    distinct_orders,
    min_order,
    max_order
  from public.market_listing_media as media
  where media.listing_id = locked.id;

  if media_count < 1 then
    raise exception
      'Add at least one photo before listing.';
  end if;

  if media_count > 20 then
    raise exception
      'This listing has too many photos to list.';
  end if;

  if
    distinct_orders is distinct from media_count
    or min_order is distinct from 0
    or max_order is distinct from (media_count - 1)
  then
    raise exception
      'Photo order could not be confirmed. Reorder your photos and try again.';
  end if;

  update public.market_listings as listings
  set
    status = 'active',
    allows_offers = case
      when locked.price = 0 then false
      else listings.allows_offers
    end
  where listings.id = locked.id
    and listings.seller_profile_id = current_user_id
    and listings.status = 'paused'
    and listings.sold_at is null;

  if not found then
    raise exception
      'This listing could not be listed.';
  end if;

  return query
  select
    locked.id,
    'active'::text;
end;
$$;


comment on function public.reactivate_own_market_listing(uuid) is
  'Owner returns a paused listing to active after completeness checks. price = 0 is FREE and forces allows_offers false. Does not call publish_own_market_listing. Does not change offers or conversations.';


revoke all
on function public.reactivate_own_market_listing(uuid)
from public;

revoke all
on function public.reactivate_own_market_listing(uuid)
from anon;

revoke all
on function public.reactivate_own_market_listing(uuid)
from authenticated;

grant execute
on function public.reactivate_own_market_listing(uuid)
to authenticated;


-- ============================================================
-- CREATE OFFER
-- Same 028 body. Extra gate: listing asking price must be > 0.
-- Offer amount still must be > 0.
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

  if v_listing.price is null or v_listing.price <= 0 then
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
  'Buyer creates a proposed price for an active listing that allows offers and has a paid asking price. Records offer_created activity only when a new pending row is inserted. Does not move money. FREE listings (price = 0) cannot receive offers.';


revoke all
on function public.create_market_offer(uuid, numeric, text)
from public;

revoke all
on function public.create_market_offer(uuid, numeric, text)
from anon;

revoke all
on function public.create_market_offer(uuid, numeric, text)
from authenticated;

grant execute
on function public.create_market_offer(uuid, numeric, text)
to authenticated;
