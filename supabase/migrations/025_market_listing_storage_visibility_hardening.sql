-- ============================================================
-- DIRECT GAIN
-- Market listing Storage visibility hardening v1
-- Migration 025
--
-- Additive. Does not modify 001–024 files.
-- Requires 024 already applied.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
-- DO NOT re-run 024.
--
-- Product:
-- Direct GET of market-listing-media objects must use the
-- same Market visibility rule as listing/media SELECT:
--   owner
--   OR parent listing status = 'active'
--
-- 024 Storage SELECT authorized an object when a
-- market_listing_media row existed for storage.objects.name
-- and assumed nested media RLS would hide non-active
-- listings. Job-media does not rely on that: it calls
-- job_is_readable_by_current_user inside the Storage
-- EXISTS. Production TEST O showed sold listing/media
-- SELECT and signed URL denied, while direct GET returned
-- the JPEG. This migration copies the listing predicate
-- into the Storage SELECT policy itself.
--
-- This migration does NOT:
--   recreate market_listings or market_listing_media
--   recreate the market-listing-media bucket
--   change INSERT / UPDATE / DELETE listing or media rules
--   change Storage INSERT or DELETE policies
--   change bucket privacy, size, or MIME
--   rewrite messaging, offers, profiles, or trust data
--   grant anonymous access
-- ============================================================


-- ============================================================
-- STORAGE SELECT
-- Replace the 024 policy of the same name.
-- Permissive policies OR together: do not leave the old
-- SELECT policy in place and add a second one.
--
-- Authorization chain:
--   storage.objects.name
--   = market_listing_media.storage_path
--   → market_listing_media.listing_id
--   = market_listings.id
--   AND (
--     seller_profile_id = auth.uid()
--     OR status = 'active'
--   )
--
-- Path helpers remain from 024. A row whose path does not
-- match the parent listing owner/id cannot authorize.
-- Orphan objects (no media row) remain unreadable.
-- Other buckets are excluded by bucket_id.
-- ============================================================

drop policy if exists
  "Authenticated users can read authorized market-listing-media objects"
on storage.objects;

create policy
  "Authenticated users can read authorized market-listing-media objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'market-listing-media'
  and public.market_listing_media_path_listing_id(name)
    is not null
  and exists (
    select 1
    from public.market_listing_media as media
    inner join public.market_listings as listings
      on listings.id = media.listing_id
    where media.storage_path = name
      and public.is_market_listing_media_storage_path(
        name,
        listings.seller_profile_id,
        listings.id
      )
      and (
        listings.seller_profile_id = auth.uid()
        or listings.status = 'active'
      )
  )
);
