-- ============================================================
-- DIRECT GAIN
-- Market listing controlled publish v1
-- Migration 026
--
-- Additive. Does not modify 001–025 files.
-- Requires 024 and 025 already applied.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
-- DO NOT re-run 024.
-- DO NOT re-run 025.
--
-- Product:
-- Ordinary authenticated clients must not UPDATE
-- market_listings.status. Draft field edits remain.
-- Owners publish only through
-- public.publish_own_market_listing(uuid):
--   draft → active
-- after field and media validation.
--
-- This migration does NOT:
--   recreate market_listings or market_listing_media
--   change Storage policies
--   grant anonymous access
--   allow sold/removed/reserved reactivation
--   switch Market Home to Supabase
-- ============================================================


-- ============================================================
-- CLOSE DIRECT STATUS BYPASS
-- 024 granted UPDATE(status) to authenticated.
-- That would let an owner activate without photos or
-- reactivate sold/removed listings. RPC is now the only
-- client path that may change status.
-- Other 024 UPDATE columns stay granted.
-- updated_at remains trigger-managed (not client-granted).
-- ============================================================

revoke update (status)
on table public.market_listings
from authenticated;

grant update (
  title,
  description,
  price,
  currency,
  category,
  subcategory,
  condition,
  allows_offers,
  pickup_available,
  delivery_available,
  suburb,
  state
)
on table public.market_listings
to authenticated;


-- ============================================================
-- STATUS DEFENCE IN DEPTH
-- Same current_user model as market_listings_protect_seller:
-- authenticated/anon cannot change status.
-- SECURITY DEFINER RPC runs as the function owner, so
-- current_user is not authenticated and the write is allowed.
-- ============================================================

create or replace function public.market_listings_protect_status()
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

  if new.status is distinct from old.status then
    raise exception
      'Market listing status can only change through the publish operation.';
  end if;

  return new;
end;
$$;


drop trigger if exists
  market_listings_protect_status
on public.market_listings;

create trigger
  market_listings_protect_status
before update
on public.market_listings
for each row
execute function public.market_listings_protect_status();


-- ============================================================
-- RPC
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

  if locked.price is null or locked.price <= 0 then
    raise exception
      'Enter a price greater than 0 before listing.';
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
    status = 'active'
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


revoke all
on function public.market_listings_protect_status()
from public;

revoke all
on function public.market_listings_protect_status()
from anon;

revoke all
on function public.market_listings_protect_status()
from authenticated;


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
