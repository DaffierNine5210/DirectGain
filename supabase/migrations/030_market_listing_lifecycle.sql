-- ============================================================
-- DIRECT GAIN
-- Market listing lifecycle v1 — pause / reactivate / sold
-- Migration 030
--
-- Additive. Does not modify 001–029 files.
-- Requires 024–029 already applied (listings, Storage,
-- controlled publish, offers, offer activity, published
-- media RPCs).
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
-- DO NOT re-run 024–029.
-- DO NOT supabase db push as part of this slice.
--
-- Product:
-- 1. Status paused is a first-class listing state.
--    Public discovery remains status = active only.
-- 2. Owners pause / reactivate / mark sold only through
--    SECURITY DEFINER RPCs. JWT still cannot UPDATE
--    status (026 trigger, updated wording only).
-- 3. sold_at is server-set on mark-sold. Clients have
--    no GRANT on sold_at.
-- 4. Mark sold declines remaining pending offers in the
--    same transaction and records offer_declined activity
--    via public.record_market_offer_activity. Accepted
--    offers are unchanged. Accept Offer is still not Sold.
-- 5. JWT commercial-field UPDATE is blocked on sold and
--    removed. Draft / active / paused remain editable.
--    SECURITY DEFINER lifecycle (and later archive) still
--    may update those rows.
-- 6. Direct JWT media DELETE/UPDATE is draft Create
--    Listing only. Active and paused photos use the 029
--    RPCs, now allowed for both statuses. Media INSERT
--    is draft / active / paused only.
-- 7. New context_type = market conversations require an
--    active listing. Existing threads and messages are
--    unchanged. Job / general / auction / support insert
--    rules are otherwise preserved.
--
-- Idempotency:
-- pause_own_market_listing: if the owned row is already
-- paused, return it without writing. Any other non-active
-- status raises. No silent sold/draft/reserved mutation.
--
-- reactivate and mark-sold are not silent no-ops on the
-- wrong status (including already-sold).
--
-- This migration does NOT:
--   implement reserved behaviour
--   implement removed / archive
--   add paused_at, published_at, or removed_at
--   change public feed indexes
--   rewrite 027/028 files
--   grant UPDATE(status) to authenticated
--   mutate production rows
-- ============================================================


-- ============================================================
-- STATUS CHECK — ADD paused
-- Existing rows are unchanged. Constraint replacement
-- only widens the allowed set.
-- ============================================================

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select c.conname
    from pg_constraint as c
    inner join pg_class as t
      on t.oid = c.conrelid
    inner join pg_namespace as n
      on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'market_listings'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) like '%status%'
      and pg_get_constraintdef(c.oid) like '%''draft''%'
      and pg_get_constraintdef(c.oid) like '%''reserved''%'
      and pg_get_constraintdef(c.oid) not like '%paused%'
  loop
    execute format(
      'alter table public.market_listings drop constraint %I',
      constraint_name
    );
  end loop;
end;
$$;

alter table public.market_listings
  drop constraint if exists market_listings_status_check;

alter table public.market_listings
  add constraint market_listings_status_check
  check (
    status in (
      'draft',
      'active',
      'paused',
      'reserved',
      'sold',
      'removed'
    )
  );

comment on column public.market_listings.status is
  'draft on insert. Client cannot UPDATE status. Controlled lifecycle: publish draft→active; pause active→paused; reactivate paused→active; mark-sold active|paused→sold. reserved is dormant. removed is later archive.';


-- ============================================================
-- sold_at
-- Nullable. No client INSERT/UPDATE grant. JWT sold_at
-- writes are also rejected by protect_status.
-- ============================================================

alter table public.market_listings
  add column if not exists sold_at timestamptz;

comment on column public.market_listings.sold_at is
  'Set only by mark_own_market_listing_sold. Null until the listing is marked sold.';


-- ============================================================
-- STATUS + sold_at JWT PROTECTION
-- SECURITY DEFINER RPCs are not current_user
-- authenticated/anon, so they may change both.
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
      'Listing status can only be changed through controlled listing lifecycle operations.';
  end if;

  if new.sold_at is distinct from old.sold_at then
    raise exception
      'Listing sold time can only be set through controlled listing lifecycle operations.';
  end if;

  return new;
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


-- ============================================================
-- SOLD / REMOVED COMMERCIAL FREEZE (JWT)
-- Blocks authenticated owner UPDATE of listing fields
-- once status is sold or removed, including title,
-- description, price, currency, category, subcategory,
-- condition, allows_offers, pickup_available,
-- delivery_available, suburb, and state (the 024 UPDATE
-- grant set, minus status which is already ungranted).
-- Any JWT UPDATE on those rows is rejected so a future
-- grant cannot reopen sold listings.
-- Draft Create Listing, active Edit Details, and paused
-- Edit Details are unaffected.
-- DEFINER mark-sold / future archive still run.
-- updated_at remains trigger-managed on allowed updates.
-- ============================================================

create or replace function public.market_listings_protect_sold_fields()
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

  if old.status in ('sold', 'removed') then
    raise exception
      'This listing can no longer be edited.';
  end if;

  return new;
end;
$$;


drop trigger if exists
  market_listings_protect_sold_fields
on public.market_listings;

create trigger
  market_listings_protect_sold_fields
before update
on public.market_listings
for each row
execute function public.market_listings_protect_sold_fields();


revoke all
on function public.market_listings_protect_sold_fields()
from public;

revoke all
on function public.market_listings_protect_sold_fields()
from anon;

revoke all
on function public.market_listings_protect_sold_fields()
from authenticated;


-- ============================================================
-- MEDIA JWT MUTATION — DRAFT DELETE/UPDATE
-- INSERT remains for draft Create Listing and for
-- active/paused Manage Photos uploads.
-- sold / removed / reserved cannot INSERT/UPDATE/DELETE
-- media rows via JWT.
-- ============================================================

drop policy if exists
  "Owners can add media to their market listings"
on public.market_listing_media;

create policy
  "Owners can add media to their market listings"
on public.market_listing_media
for insert
to authenticated
with check (
  exists (
    select 1
    from public.market_listings as listings
    where listings.id = listing_id
      and listings.seller_profile_id = auth.uid()
      and listings.status in (
        'draft',
        'active',
        'paused'
      )
  )
  and public.is_market_listing_media_storage_path(
    storage_path,
    auth.uid(),
    listing_id
  )
);


drop policy if exists
  "Owners can reorder media on their market listings"
on public.market_listing_media;

create policy
  "Owners can reorder media on their market listings"
on public.market_listing_media
for update
to authenticated
using (
  exists (
    select 1
    from public.market_listings as listings
    where listings.id = listing_id
      and listings.seller_profile_id = auth.uid()
      and listings.status = 'draft'
  )
)
with check (
  exists (
    select 1
    from public.market_listings as listings
    where listings.id = listing_id
      and listings.seller_profile_id = auth.uid()
      and listings.status = 'draft'
  )
);


drop policy if exists
  "Owners can delete media on their market listings"
on public.market_listing_media;

create policy
  "Owners can delete media on their market listings"
on public.market_listing_media
for delete
to authenticated
using (
  exists (
    select 1
    from public.market_listings as listings
    where listings.id = listing_id
      and listings.seller_profile_id = auth.uid()
      and listings.status = 'draft'
  )
);


-- ============================================================
-- STORAGE INSERT / DELETE — MATCH LISTING MUTABILITY
-- SELECT remains 025 (owner or listing active).
-- Orphan object DELETE (no media row) stays allowed for
-- the path owner so failed metadata inserts can clean up.
-- Objects that still have a media row may only be deleted
-- when the listing is draft, active, or paused.
-- ============================================================

drop policy if exists
  "Owners can upload market-listing-media objects to their listings"
on storage.objects;

create policy
  "Owners can upload market-listing-media objects to their listings"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'market-listing-media'
  and public.is_market_listing_media_storage_path(
    name,
    auth.uid(),
    public.market_listing_media_path_listing_id(name)
  )
  and exists (
    select 1
    from public.market_listings as listings
    where listings.id
      = public.market_listing_media_path_listing_id(name)
      and listings.seller_profile_id = auth.uid()
      and listings.status in (
        'draft',
        'active',
        'paused'
      )
  )
);


drop policy if exists
  "Owners can delete market-listing-media objects on their listings"
on storage.objects;

create policy
  "Owners can delete market-listing-media objects on their listings"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'market-listing-media'
  and public.is_market_listing_media_storage_path(
    name,
    auth.uid(),
    public.market_listing_media_path_listing_id(name)
  )
  and exists (
    select 1
    from public.market_listings as listings
    where listings.id
      = public.market_listing_media_path_listing_id(name)
      and listings.seller_profile_id = auth.uid()
  )
  and (
    not exists (
      select 1
      from public.market_listing_media as media
      where media.storage_path = name
    )
    or exists (
      select 1
      from public.market_listings as listings
      where listings.id
        = public.market_listing_media_path_listing_id(name)
        and listings.seller_profile_id = auth.uid()
        and listings.status in (
          'draft',
          'active',
          'paused'
        )
    )
  )
);


-- ============================================================
-- LAST PHOTO — ACTIVE AND PAUSED
-- Draft Create Listing may still remove the last photo.
-- ============================================================

create or replace function public.market_listing_media_protect_active_last_photo()
returns trigger
language plpgsql
volatile
set search_path = public, pg_temp
as $$
declare
  locked_status text;
  media_count integer;
begin
  select
    listings.status
  into
    locked_status
  from public.market_listings as listings
  where listings.id = old.listing_id
  for update;

  if not found then
    return old;
  end if;

  if locked_status not in ('active', 'paused') then
    return old;
  end if;

  perform
    media.id
  from public.market_listing_media as media
  where media.listing_id = old.listing_id
  for update;

  select count(*)::integer
  into media_count
  from public.market_listing_media as media
  where media.listing_id = old.listing_id;

  if media_count <= 1 then
    raise exception
      'This listing must keep at least one photo.';
  end if;

  return old;
end;
$$;


revoke all
on function public.market_listing_media_protect_active_last_photo()
from public;

revoke all
on function public.market_listing_media_protect_active_last_photo()
from anon;

revoke all
on function public.market_listing_media_protect_active_last_photo()
from authenticated;


-- ============================================================
-- PHOTO RPCs — ACTIVE OR PAUSED
-- Same 029 locking, last-photo, exact-set reorder rules.
-- ============================================================

create or replace function public.delete_own_market_listing_media(
  p_listing_id uuid,
  p_media_id uuid
)
returns table (
  id uuid,
  listing_id uuid,
  storage_path text
)
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  locked public.market_listings%rowtype;
  target public.market_listing_media%rowtype;
  media_count integer;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to remove a photo.';
  end if;

  if p_listing_id is null or p_media_id is null then
    raise exception
      'This listing is not available.';
  end if;

  select *
  into locked
  from public.market_listings as listings
  where listings.id = p_listing_id
    and listings.seller_profile_id = current_user_id
  for update;

  if not found then
    raise exception
      'This listing is not available.';
  end if;

  if locked.status not in ('active', 'paused') then
    raise exception
      'This listing is not available.';
  end if;

  perform
    media.id
  from public.market_listing_media as media
  where media.listing_id = locked.id
  for update;

  select count(*)::integer
  into media_count
  from public.market_listing_media as media
  where media.listing_id = locked.id;

  if media_count < 1 then
    raise exception
      'This listing must keep at least one photo.';
  end if;

  select *
  into target
  from public.market_listing_media as media
  where media.id = p_media_id
    and media.listing_id = locked.id;

  if not found then
    raise exception
      'This photo could not be removed.';
  end if;

  if media_count <= 1 then
    raise exception
      'This listing must keep at least one photo.';
  end if;

  delete from public.market_listing_media as media
  where media.id = target.id
    and media.listing_id = locked.id;

  if not found then
    raise exception
      'This photo could not be removed.';
  end if;

  return query
  select
    target.id,
    target.listing_id,
    target.storage_path;
end;
$$;


revoke all
on function public.delete_own_market_listing_media(uuid, uuid)
from public;

revoke all
on function public.delete_own_market_listing_media(uuid, uuid)
from anon;

revoke all
on function public.delete_own_market_listing_media(uuid, uuid)
from authenticated;

grant execute
on function public.delete_own_market_listing_media(uuid, uuid)
to authenticated;


create or replace function public.reorder_own_market_listing_media(
  p_listing_id uuid,
  p_media_ids uuid[]
)
returns table (
  id uuid,
  sort_order integer
)
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  locked public.market_listings%rowtype;
  requested_count integer;
  distinct_requested integer;
  current_count integer;
  updated_count integer;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to reorder photos.';
  end if;

  if p_listing_id is null then
    raise exception
      'This listing is not available.';
  end if;

  if p_media_ids is null then
    raise exception
      'Photo order is not valid.';
  end if;

  requested_count := cardinality(p_media_ids);

  if requested_count is null or requested_count < 1 then
    raise exception
      'Photo order is not valid.';
  end if;

  if requested_count > 20 then
    raise exception
      'Photo order is not valid.';
  end if;

  if exists (
    select 1
    from unnest(p_media_ids) as requested(media_id)
    where requested.media_id is null
  ) then
    raise exception
      'Photo order is not valid.';
  end if;

  select count(distinct requested.media_id)::integer
  into distinct_requested
  from unnest(p_media_ids) as requested(media_id);

  if distinct_requested is distinct from requested_count then
    raise exception
      'Photo order is not valid.';
  end if;

  select *
  into locked
  from public.market_listings as listings
  where listings.id = p_listing_id
    and listings.seller_profile_id = current_user_id
  for update;

  if not found then
    raise exception
      'This listing is not available.';
  end if;

  if locked.status not in ('active', 'paused') then
    raise exception
      'This listing is not available.';
  end if;

  perform
    media.id
  from public.market_listing_media as media
  where media.listing_id = locked.id
  for update;

  select count(*)::integer
  into current_count
  from public.market_listing_media as media
  where media.listing_id = locked.id;

  if current_count < 1 then
    raise exception
      'This listing must keep at least one photo.';
  end if;

  if current_count > 20 then
    raise exception
      'Photo order is not valid.';
  end if;

  if requested_count is distinct from current_count then
    raise exception
      'Photo order is not valid.';
  end if;

  if exists (
    select 1
    from unnest(p_media_ids) as requested(media_id)
    where not exists (
      select 1
      from public.market_listing_media as media
      where media.listing_id = locked.id
        and media.id = requested.media_id
    )
  ) then
    raise exception
      'Photo order is not valid.';
  end if;

  set constraints
    market_listing_media_listing_id_sort_order_key
  deferred;

  update public.market_listing_media as media
  set
    sort_order = requested.sort_index
  from (
    select
      requested.media_id,
      (requested.ordinality - 1)::integer as sort_index
    from unnest(p_media_ids)
      with ordinality as requested(media_id, ordinality)
  ) as requested
  where media.listing_id = locked.id
    and media.id = requested.media_id;

  get diagnostics updated_count = row_count;

  if updated_count is distinct from current_count then
    raise exception
      'Photo order is not valid.';
  end if;

  return query
  select
    media.id,
    media.sort_order
  from public.market_listing_media as media
  where media.listing_id = locked.id
  order by media.sort_order;
end;
$$;


revoke all
on function public.reorder_own_market_listing_media(uuid, uuid[])
from public;

revoke all
on function public.reorder_own_market_listing_media(uuid, uuid[])
from anon;

revoke all
on function public.reorder_own_market_listing_media(uuid, uuid[])
from authenticated;

grant execute
on function public.reorder_own_market_listing_media(uuid, uuid[])
to authenticated;


-- ============================================================
-- NEW MARKET CONVERSATIONS — ACTIVE LISTING ONLY
-- Replaces 022 insert WITH CHECK. Job and general remain
-- excluded. Auction / support unchanged. Market requires
-- Market INSERT requires an active listing. Compare
-- listings.id::text to lower(context_id) so a malformed
-- context_id cannot raise from uuid input in RLS.
-- PostgreSQL does not guarantee AND short-circuit before
-- a cast. create_market_offer inserts as DEFINER and is
-- unaffected.
-- SELECT / UPDATE / message send policies are untouched.
-- create_market_offer still inserts conversations as
-- SECURITY DEFINER after its own active-listing check.
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
  and (
    context_type is distinct from 'market'
    or (
      context_id is not null
      and context_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      and exists (
        select 1
        from public.market_listings as listings
        where listings.id::text = lower(context_id)
          and listings.status = 'active'
      )
    )
  )
);


-- ============================================================
-- PAUSE
-- Owned listing FOR UPDATE. active → paused.
-- Already paused: return current row, no write.
-- sold_at, offers, conversations, media: untouched.
-- ============================================================

create or replace function public.pause_own_market_listing(
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
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to pause this listing.';
  end if;

  if p_listing_id is null then
    raise exception
      'This listing is not available.';
  end if;

  select *
  into locked
  from public.market_listings as listings
  where listings.id = p_listing_id
    and listings.seller_profile_id = current_user_id
  for update;

  if not found then
    raise exception
      'This listing is not available.';
  end if;

  if locked.status = 'paused' then
    return query
    select
      locked.id,
      locked.status;
    return;
  end if;

  if locked.status is distinct from 'active' then
    raise exception
      'Only an active listing can be paused.';
  end if;

  update public.market_listings as listings
  set
    status = 'paused'
  where listings.id = locked.id
    and listings.seller_profile_id = current_user_id
    and listings.status = 'active';

  if not found then
    raise exception
      'This listing could not be paused.';
  end if;

  return query
  select
    locked.id,
    'paused'::text;
end;
$$;


comment on function public.pause_own_market_listing(uuid) is
  'Owner pauses an active listing. Idempotent if already paused. Does not change offers, conversations, media, or sold_at.';


revoke all
on function public.pause_own_market_listing(uuid)
from public;

revoke all
on function public.pause_own_market_listing(uuid)
from anon;

revoke all
on function public.pause_own_market_listing(uuid)
from authenticated;

grant execute
on function public.pause_own_market_listing(uuid)
to authenticated;


-- ============================================================
-- REACTIVATE
-- paused → active after publish-equivalent completeness.
-- Does not call publish_own_market_listing.
-- sold_at must stay null. No offer/conversation writes.
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
  'Owner returns a paused listing to active after completeness checks. Does not call publish_own_market_listing. Does not change offers or conversations.';


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
-- MARK SOLD
-- Lock listing first, then lock offers on that listing.
-- active or paused → sold. sold_at = now().
-- Remaining pending offers → declined + offer_declined
-- activity. Accepted / declined / withdrawn unchanged.
-- Does not create or require an accepted offer.
-- ============================================================

create or replace function public.mark_own_market_listing_sold(
  p_listing_id uuid
)
returns table (
  id uuid,
  status text,
  sold_at timestamptz
)
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  locked public.market_listings%rowtype;
  v_sold_at timestamptz;
  v_pending public.market_offers%rowtype;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to mark this listing as sold.';
  end if;

  if p_listing_id is null then
    raise exception
      'This listing is not available.';
  end if;

  select *
  into locked
  from public.market_listings as listings
  where listings.id = p_listing_id
    and listings.seller_profile_id = current_user_id
  for update;

  if not found then
    raise exception
      'This listing is not available.';
  end if;

  if locked.status = 'sold' then
    raise exception
      'This listing is already sold.';
  end if;

  if locked.status not in ('active', 'paused') then
    raise exception
      'This listing cannot be marked as sold.';
  end if;

  perform
    offers.id
  from public.market_offers as offers
  where offers.listing_id = locked.id
  for update;

  v_sold_at := now();

  update public.market_listings as listings
  set
    status = 'sold',
    sold_at = v_sold_at
  where listings.id = locked.id
    and listings.seller_profile_id = current_user_id
    and listings.status in ('active', 'paused');

  if not found then
    raise exception
      'This listing could not be marked as sold.';
  end if;

  for v_pending in
    update public.market_offers as offers
    set
      status = 'declined',
      responded_at = v_sold_at
    where
      offers.listing_id = locked.id
      and offers.status = 'pending'
    returning *
  loop
    perform public.record_market_offer_activity(
      v_pending,
      'offer_declined',
      current_user_id
    );
  end loop;

  return query
  select
    locked.id,
    'sold'::text,
    v_sold_at;
end;
$$;


comment on function public.mark_own_market_listing_sold(uuid) is
  'Owner marks an active or paused listing sold. Declines remaining pending offers with conversation_activity. Does not change accepted offers or set removed.';


revoke all
on function public.mark_own_market_listing_sold(uuid)
from public;

revoke all
on function public.mark_own_market_listing_sold(uuid)
from anon;

revoke all
on function public.mark_own_market_listing_sold(uuid)
from authenticated;

grant execute
on function public.mark_own_market_listing_sold(uuid)
to authenticated;
