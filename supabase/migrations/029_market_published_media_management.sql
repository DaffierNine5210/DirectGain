-- ============================================================
-- DIRECT GAIN
-- Market published media management v1
-- Migration 029
--
-- Additive. Does not modify 001–028 files.
-- Requires 024–026 already applied (listings, media,
-- Storage, controlled publish). Compatible with 027–028.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
-- DO NOT re-run 024–028.
-- DO NOT supabase db push as part of this slice.
--
-- Product:
-- 1. An ACTIVE listing must never lose its last
--    market_listing_media row, including under concurrent
--    delete of the last two photos.
-- 2. Authenticated clients cannot DELETE active media
--    rows directly. Active photo removal is only
--    public.delete_own_market_listing_media(uuid, uuid).
-- 3. Owners reorder ACTIVE listing photos only through
--    public.reorder_own_market_listing_media(uuid, uuid[]):
--    atomic, exact-set, contiguous sort_order 0..n-1.
--    Cover image is the first supplied id (sort_order 0).
--
-- Delete architecture:
-- Direct owner DELETE remains for non-active listings so
-- Create Listing draft photo removal stays on the 024
-- client DELETE path.
-- DELETE RLS is narrowed: owner AND status IS DISTINCT
-- FROM 'active'. JWT DELETE of active media is a no-op
-- (zero rows), not a last-photo race.
-- Active deletion is a SECURITY DEFINER RPC that:
--   authenticates, locks the listing FOR UPDATE, verifies
--   ownership, requires active, counts under that lock,
--   rejects the final photo, deletes the row, returns
--   storage_path for later best-effort Storage cleanup.
-- Concurrency for ordinary active deletion:
--   RLS blocks direct authenticated DELETE of active media.
--   delete_own_market_listing_media serializes on the
--   parent listing FOR UPDATE, then counts, then deletes.
-- A BEFORE DELETE trigger is defence in depth for
-- privileged / SECURITY DEFINER DELETE. It locks the
-- listing, locks media rows with PERFORM ... FOR UPDATE,
-- then uses a separate plain COUNT(*). It is not the
-- primary JWT last-two-photo concurrency architecture.
--
-- This migration does NOT:
--   change Storage bucket, policies, or paths
--   change media SELECT / INSERT / UPDATE grants
--   revoke DELETE for draft/reserved/sold/removed
--   change draft Create Listing helpers
--   allow reorder of draft/reserved/sold/removed
--   mutate offers, conversations, or listing status
--   compact sort_order after delete
--   weaken the 024 max-20 insert trigger
--   invent a paused status
-- ============================================================


-- ============================================================
-- DELETE RLS — ACTIVE MEDIA IS NOT DIRECTLY DELETABLE
-- 024 allowed owner DELETE of every media row, including
-- the last photo on an active listing.
-- Authenticated DELETE now requires the parent listing is
-- not active. Reserved / sold / removed keep the previous
-- owner DELETE path. Draft Create Listing is unchanged.
-- ============================================================

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
      and listings.status is distinct from 'active'
  )
);


-- ============================================================
-- ACTIVE LISTING LAST PHOTO (defence in depth)
-- Runs for every DELETE, including the active RPC
-- (SECURITY DEFINER bypasses RLS but not triggers).
--
-- Role: last-photo guard after the parent listing row is
-- locked. Ordinary JWT active DELETE never reaches this
-- with a matching row (RLS). Concurrent authenticated
-- active deletes serialize in delete_own_market_listing_
-- media on this same listing row.
--
-- This trigger does not replace that RPC as the
-- concurrency architecture. It stops a privileged or
-- DEFINER DELETE from removing the final active photo
-- once this session holds the listing lock.
--
-- Lock listing FOR UPDATE (same row as 024 max-20 INSERT
-- and the active media RPCs). If still active, lock media
-- rows with a row-producing PERFORM ... FOR UPDATE, then
-- COUNT(*) separately. Do not attach FOR UPDATE to
-- COUNT(*) — that is invalid PostgreSQL.
--
-- BEFORE DELETE: this row is still present, so count 1
-- means the delete would leave zero.
--
-- If the parent listing row is already gone (CASCADE
-- from a privileged listing delete), allow the media
-- delete. Authenticated clients have no listing DELETE
-- grant.
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

  if locked_status is distinct from 'active' then
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
      'An active listing must keep at least one photo.';
  end if;

  return old;
end;
$$;


drop trigger if exists
  market_listing_media_protect_active_last_photo
on public.market_listing_media;

create trigger
  market_listing_media_protect_active_last_photo
before delete
on public.market_listing_media
for each row
execute function public.market_listing_media_protect_active_last_photo();


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
-- ACTIVE MEDIA DELETE RPC
-- Primary concurrency path for authenticated active photo
-- removal. Top-level client command. Two concurrent calls
-- targeting the last two photos serialize on
-- market_listings FOR UPDATE. After the waiter acquires
-- the listing lock, PERFORM locks remaining media rows,
-- then a separate plain COUNT(*) runs. The waiter sees
-- the committed sibling delete and rejects count <= 1.
--
-- Sequence: lock owned listing → require active →
-- PERFORM media.id FOR UPDATE → COUNT(*) → load target
-- on this listing → reject last photo → DELETE row →
-- return id, listing_id, storage_path.
--
-- Does not touch Storage. Returns storage_path so the
-- repository can delete the object after the DB row is
-- gone.
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

  if locked.status is distinct from 'active' then
    raise exception
      'This listing is not active.';
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
      'An active listing must keep at least one photo.';
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
      'An active listing must keep at least one photo.';
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


-- ============================================================
-- ATOMIC ACTIVE MEDIA REORDER
-- SECURITY DEFINER so SET CONSTRAINTS and the unique
-- (listing_id, sort_order) write run as the function owner.
-- Ownership, auth, and active status are checked inside.
-- Direct client two-phase sort_order updates are not used.
-- Draft reorder remains the existing Create Listing path.
--
-- market_listing_media_listing_id_sort_order_key is
-- UNIQUE DEFERRABLE INITIALLY IMMEDIATE (024). SET
-- CONSTRAINTS ... DEFERRED is valid only because it is
-- DEFERRABLE. UPDATE is restricted to locked.id so this
-- cannot retarget another listing.
-- ============================================================

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

  if locked.status is distinct from 'active' then
    raise exception
      'This listing is not active.';
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
      'An active listing must keep at least one photo.';
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
