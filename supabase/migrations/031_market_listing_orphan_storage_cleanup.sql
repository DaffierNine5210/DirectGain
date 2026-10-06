-- ============================================================
-- DIRECT GAIN
-- Market listing owner-orphan Storage SELECT
-- Migration 031
--
-- Additive. Does not modify 001–030 files.
-- Requires 024, 025, and 030 already applied.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
-- DO NOT re-run 024–030.
-- DO NOT supabase db push as part of this slice.
--
-- Product:
-- DB-first media deletion can leave a short-lived Storage
-- object with no market_listing_media row before the
-- authenticated owner cleanup call. Migration 030 already
-- permits owner DELETE of that orphan. This migration
-- hardens owner SELECT for the same exact orphan so the
-- Storage cleanup call can address it. It does not make
-- orphan objects public.
--
-- This migration does NOT:
--   change listing/media tables
--   change Storage INSERT or DELETE policies
--   change bucket privacy, size, or MIME
--   grant anonymous access
--   allow one owner to read another owner's orphans
--   allow public/active readers to see orphans
-- ============================================================


-- ============================================================
-- STORAGE SELECT
-- Replace the 025 policy of the same name.
--
-- Keep 025 referenced-media rules:
--   owner of a listing that still has a media row
--   OR any authenticated user when that listing is active
--
-- Add owner-orphan branch:
--   no media row for storage.objects.name
--   listing still exists
--   path seller/listing matches that listing
--   listings.seller_profile_id = auth.uid()
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
  and (
    exists (
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
    or (
      not exists (
        select 1
        from public.market_listing_media as media
        where media.storage_path = name
      )
      and exists (
        select 1
        from public.market_listings as listings
        where listings.id
          = public.market_listing_media_path_listing_id(name)
          and listings.seller_profile_id = auth.uid()
          and public.is_market_listing_media_storage_path(
            name,
            listings.seller_profile_id,
            listings.id
          )
      )
    )
  )
);
