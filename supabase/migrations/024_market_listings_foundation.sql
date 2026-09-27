-- ============================================================
-- DIRECT GAIN
-- Market listings + media foundation v1
-- Migration 024
--
-- Additive. Does not modify 001–023 files.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
--
-- Product:
-- Authoritative Postgres listing row with trusted
-- seller_profile_id = profiles.id = auth.uid().
-- Private listing photos via market_listing_media +
-- bucket market-listing-media. Signed URLs are
-- presentation-only and must never be stored.
--
-- This unblocks a later Market messaging RPC (025)
-- that can derive the seller from the listing.
--
-- This migration does NOT:
--   switch Market UI off fixtures
--   seed listing-001 mock rows
--   store coordinates or street address
--   add vehicle JSONB or modification arrays
--   persist Gain Score or other mock trust fields
--   rewrite conversations / offers / deals
--   add FK from market_offers.listing_id
--   change review_eligibilities
--   implement unified messaging
--   change profile_presentation.active_template
--   grant anon access
--   create a publish RPC
--
-- Create Listing UI is still unavailable.
-- The live Market feed is not switched yet.
--
-- Draft-first:
-- Ordinary client INSERT cannot set status.
-- Default and INSERT WITH CHECK require draft.
-- Owner UPDATE of status remains the later
-- activation path until a publish workflow exists.
--
-- Storage:
-- New bucket only. Does not rewrite job-media,
-- professional-portfolio, professional-resumes,
-- or profile-avatars.
--
-- Path:
--   {seller_profile_id}/{listing_id}/{object_id}.jpg
-- All three ids are lowercase UUID text.
--
-- Postgres and Storage are not one transaction.
-- Future app flow: upload object, then insert
-- metadata. If metadata insert fails, delete the
-- object immediately. Crash orphans are a later
-- cleanup concern. Orphan objects without a
-- matching media row are not readable.
--
-- Compatibility:
-- conversations.context_id and market_offers.listing_id
-- remain text with no FK to market_listings.
-- Real listing ids will be UUIDs. A later security
-- slice must derive Message Seller from the listing
-- instead of trusting client-supplied sellerId.
-- ============================================================


-- ============================================================
-- TABLE: market_listings
-- Core listing identity only. No trust snapshots,
-- images, vehicle blobs, or precise location.
-- ============================================================

create table if not exists public.market_listings (
  id uuid
    primary key
    default gen_random_uuid(),

  seller_profile_id uuid
    not null
    references public.profiles(id)
    on delete restrict,

  title text
    not null
    check (
      char_length(btrim(title)) > 0
    ),

  description text
    not null
    check (
      char_length(btrim(description)) > 0
    ),

  price numeric(12, 2)
    not null
    check (price >= 0),

  currency text
    not null
    default 'AUD'
    check (currency = 'AUD'),

  -- Closed set matches types/Listing.ts ListingCategory.
  category text
    not null
    check (
      category in (
        'Vehicles',
        'Property',
        'Electronics',
        'Furniture',
        'Clothing',
        'Tools',
        'Antiques',
        'Collectables',
        'Other'
      )
    ),

  -- Flexible text; client does not use a closed union.
  subcategory text
    not null
    check (
      char_length(btrim(subcategory)) > 0
    ),

  -- Closed set matches types/Listing.ts ListingCondition.
  condition text
    not null
    check (
      condition in (
        'New',
        'Like new',
        'Excellent',
        'Good',
        'Fair'
      )
    ),

  status text
    not null
    default 'draft'
    check (
      status in (
        'draft',
        'active',
        'reserved',
        'sold',
        'removed'
      )
    ),

  allows_offers boolean
    not null
    default true,

  pickup_available boolean
    not null
    default true,

  delivery_available boolean
    not null
    default false,

  suburb text
    not null
    check (
      char_length(btrim(suburb)) > 0
    ),

  state text
    not null
    check (
      char_length(btrim(state)) > 0
    ),

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);


comment on table public.market_listings is
  'Core Market listing identity. Photos live in market_listing_media. Trust is derived from profiles, not stored here.';

comment on column public.market_listings.suburb is
  'Public suburb only. No street address or coordinates.';

comment on column public.market_listings.state is
  'Public state/territory only.';

comment on column public.market_listings.status is
  'draft on insert. Owner UPDATE may later set active/reserved/sold/removed.';


-- ============================================================
-- INDEXES
-- Owner dashboard by seller.
-- Public feed: active listings newest first.
-- ============================================================

create index if not exists
  market_listings_seller_profile_id_idx
on public.market_listings (seller_profile_id);

create index if not exists
  market_listings_active_created_at_idx
on public.market_listings (created_at desc)
where
  status = 'active';


-- ============================================================
-- UPDATED_AT
-- Reuse public.set_updated_at from 001.
-- ============================================================

drop trigger if exists
  market_listings_set_updated_at
on public.market_listings;

create trigger
  market_listings_set_updated_at
before update
on public.market_listings
for each row
execute function public.set_updated_at();


-- ============================================================
-- OWNERSHIP TRANSFER DEFENCE
-- RLS WITH CHECK already requires the new
-- seller_profile_id = auth.uid(). Column GRANT
-- also omits seller_profile_id.
--
-- This trigger matches jobs_protect_lifecycle:
-- authenticated/anon cannot change owner.
-- Table-owner / service-role updates still may.
-- ============================================================

create or replace function public.market_listings_protect_seller()
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
    new.seller_profile_id
      is distinct from old.seller_profile_id
  then
    raise exception
      'Market listing ownership cannot be changed.';
  end if;

  return new;
end;
$$;


drop trigger if exists
  market_listings_protect_seller
on public.market_listings;

create trigger
  market_listings_protect_seller
before update
on public.market_listings
for each row
execute function public.market_listings_protect_seller();


-- ============================================================
-- PATH VALIDATION
--
-- Expected object name / storage_path:
-- {seller_profile_id}/{listing_id}/{object_id}.jpg
--
-- All three ids are lowercase UUID text.
-- No leading slash, no '..', no '://', no extra segments.
-- ============================================================

create or replace function public.is_market_listing_media_storage_path(
  object_path text,
  expected_seller_profile_id uuid,
  expected_listing_id uuid
)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select
    object_path is not null
    and expected_seller_profile_id is not null
    and expected_listing_id is not null
    and object_path = lower(object_path)
    and position('://' in object_path) = 0
    and position('..' in object_path) = 0
    and position('//' in object_path) = 0
    and left(object_path, 1) <> '/'
    and object_path ~
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$'
    and split_part(object_path, '/', 1)
      = expected_seller_profile_id::text
    and split_part(object_path, '/', 2)
      = expected_listing_id::text;
$$;


create or replace function public.market_listing_media_path_seller_id(
  object_path text
)
returns uuid
language plpgsql
immutable
set search_path = public, pg_temp
as $$
begin
  if
    object_path is null
    or object_path <> lower(object_path)
    or object_path !~
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$'
  then
    return null;
  end if;

  if not public.is_market_listing_media_storage_path(
    object_path,
    split_part(object_path, '/', 1)::uuid,
    split_part(object_path, '/', 2)::uuid
  ) then
    return null;
  end if;

  return split_part(object_path, '/', 1)::uuid;
end;
$$;


create or replace function public.market_listing_media_path_listing_id(
  object_path text
)
returns uuid
language plpgsql
immutable
set search_path = public, pg_temp
as $$
begin
  if
    object_path is null
    or object_path <> lower(object_path)
    or object_path !~
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$'
  then
    return null;
  end if;

  if not public.is_market_listing_media_storage_path(
    object_path,
    split_part(object_path, '/', 1)::uuid,
    split_part(object_path, '/', 2)::uuid
  ) then
    return null;
  end if;

  return split_part(object_path, '/', 2)::uuid;
end;
$$;


-- ============================================================
-- TABLE: market_listing_media
-- Many photos per listing. Stable storage_path only.
-- ============================================================

create table if not exists public.market_listing_media (
  id uuid
    primary key
    default gen_random_uuid(),

  listing_id uuid
    not null
    references public.market_listings(id)
    on delete cascade,

  storage_path text
    not null,

  sort_order integer
    not null,

  created_at timestamptz
    not null
    default now(),

  constraint market_listing_media_sort_order_check
    check (sort_order >= 0),

  constraint market_listing_media_storage_path_not_blank
    check (
      char_length(btrim(storage_path)) > 0
    ),

  -- Unique per listing, DEFERRABLE so a later atomic
  -- reorder RPC can swap sort_order in one transaction.
  -- INITIALLY IMMEDIATE keeps ordinary inserts strict.
  -- Do not reorder with separate client UPDATEs.
  constraint market_listing_media_listing_id_sort_order_key
    unique (listing_id, sort_order)
    deferrable initially immediate,

  constraint market_listing_media_storage_path_key
    unique (storage_path)
);


comment on table public.market_listing_media is
  'Listing photos. Cover is the lowest sort_order. Private storage_path only; never store signed URLs.';

comment on column public.market_listing_media.storage_path is
  'Private bucket object name: {seller_profile_id}/{listing_id}/{uuid}.jpg';

comment on column public.market_listing_media.sort_order is
  'Display order. 0 is the first gallery image. Reorder only via one atomic transaction.';


-- listing_id lookups use the leftmost column of
-- market_listing_media_listing_id_sort_order_key.


-- ============================================================
-- MEDIA PATH MUST MATCH PARENT LISTING
-- ============================================================

create or replace function public.market_listing_media_align_path()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  listing_seller_id uuid;
begin
  select
    listings.seller_profile_id
  into
    listing_seller_id
  from public.market_listings as listings
  where listings.id = new.listing_id;

  if not found then
    raise exception
      'That Market listing does not exist.';
  end if;

  if not public.is_market_listing_media_storage_path(
    new.storage_path,
    listing_seller_id,
    new.listing_id
  ) then
    raise exception
      'Market listing media path must match the listing owner and listing id.';
  end if;

  return new;
end;
$$;


drop trigger if exists
  market_listing_media_align_path
on public.market_listing_media;

create trigger
  market_listing_media_align_path
before insert or update
on public.market_listing_media
for each row
execute function public.market_listing_media_align_path();


-- ============================================================
-- MAX TWENTY PHOTOS
-- Abuse cap. Gallery remains many-photo, not job-style 5.
-- Concurrent inserts serialize on the parent listing row.
-- ============================================================

create or replace function public.market_listing_media_enforce_max_photos()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  media_count integer;
  locked_seller_id uuid;
begin
  select
    listings.seller_profile_id
  into
    locked_seller_id
  from public.market_listings as listings
  where listings.id = new.listing_id
  for update;

  if not found then
    raise exception
      'That Market listing does not exist.';
  end if;

  if
    current_user in ('authenticated', 'anon')
    and locked_seller_id is distinct from auth.uid()
  then
    raise exception
      'Only the listing owner can add photos.';
  end if;

  select count(*)::integer
  into media_count
  from public.market_listing_media
  where listing_id = new.listing_id;

  if media_count >= 20 then
    raise exception
      'A Market listing can have at most 20 photos.';
  end if;

  return new;
end;
$$;


drop trigger if exists
  market_listing_media_enforce_max_photos
on public.market_listing_media;

create trigger
  market_listing_media_enforce_max_photos
before insert
on public.market_listing_media
for each row
execute function public.market_listing_media_enforce_max_photos();


-- ============================================================
-- FREEZE MEDIA IDENTITY
-- Clients may only change sort_order (future reorder).
-- ============================================================

create or replace function public.market_listing_media_protect_columns()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if
    new.id is distinct from old.id
    or new.listing_id is distinct from old.listing_id
    or new.storage_path is distinct from old.storage_path
    or new.created_at is distinct from old.created_at
  then
    raise exception
      'Market listing media file metadata cannot be changed.';
  end if;

  return new;
end;
$$;


drop trigger if exists
  market_listing_media_protect_columns
on public.market_listing_media;

create trigger
  market_listing_media_protect_columns
before update
on public.market_listing_media
for each row
execute function public.market_listing_media_protect_columns();


-- ============================================================
-- GRANTS — market_listings
-- No DELETE grant. No anon access.
-- status / id / created_at / updated_at / seller_profile_id
-- are not client-insertable. status defaults to draft.
-- seller_profile_id / id / created_at are not
-- client-updatable.
-- ============================================================

alter table public.market_listings
enable row level security;

revoke all
on table public.market_listings
from public;

revoke all
on table public.market_listings
from anon;

revoke all
on table public.market_listings
from authenticated;

grant select
on table public.market_listings
to authenticated;

grant insert (
  seller_profile_id,
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

grant update (
  title,
  description,
  price,
  currency,
  category,
  subcategory,
  condition,
  status,
  allows_offers,
  pickup_available,
  delivery_available,
  suburb,
  state
)
on table public.market_listings
to authenticated;


-- ============================================================
-- RLS — market_listings
-- ============================================================

drop policy if exists
  "Authenticated users can read visible market listings"
on public.market_listings;

create policy
  "Authenticated users can read visible market listings"
on public.market_listings
for select
to authenticated
using (
  seller_profile_id = auth.uid()
  or status = 'active'
);


drop policy if exists
  "Users can create their own market listings"
on public.market_listings;

create policy
  "Users can create their own market listings"
on public.market_listings
for insert
to authenticated
with check (
  seller_profile_id = auth.uid()
  and status = 'draft'
);


drop policy if exists
  "Owners can update their own market listings"
on public.market_listings;

create policy
  "Owners can update their own market listings"
on public.market_listings
for update
to authenticated
using (
  seller_profile_id = auth.uid()
)
with check (
  seller_profile_id = auth.uid()
);


-- ============================================================
-- GRANTS — market_listing_media
-- UPDATE is sort_order only. File identity is frozen.
-- ============================================================

alter table public.market_listing_media
enable row level security;

revoke all
on table public.market_listing_media
from public;

revoke all
on table public.market_listing_media
from anon;

revoke all
on table public.market_listing_media
from authenticated;

grant select
on table public.market_listing_media
to authenticated;

grant insert (
  listing_id,
  storage_path,
  sort_order
)
on table public.market_listing_media
to authenticated;

grant update (
  sort_order
)
on table public.market_listing_media
to authenticated;

grant delete
on table public.market_listing_media
to authenticated;


-- ============================================================
-- RLS — market_listing_media
-- SELECT uses parent listing predicates directly.
-- Does not nest a helper that re-queries this table
-- (avoids INSERT ... RETURNING / recursive RLS traps).
-- Parent listings RLS does not query media.
-- ============================================================

drop policy if exists
  "Authenticated users can read visible market listing media"
on public.market_listing_media;

create policy
  "Authenticated users can read visible market listing media"
on public.market_listing_media
for select
to authenticated
using (
  exists (
    select 1
    from public.market_listings as listings
    where listings.id = listing_id
      and (
        listings.seller_profile_id = auth.uid()
        or listings.status = 'active'
      )
  )
);


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
  )
)
with check (
  exists (
    select 1
    from public.market_listings as listings
    where listings.id = listing_id
      and listings.seller_profile_id = auth.uid()
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
  )
);


-- ============================================================
-- PRIVATE BUCKET
-- New Direct Gain bucket. Do not silently rewrite an
-- unexpected existing market-listing-media configuration.
-- JPEG only. 2 MiB matches job-media / portfolio photos.
-- This migration does NOT strip EXIF/GPS.
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'market-listing-media',
  'market-listing-media',
  false,
  (2 * 1024 * 1024),
  array['image/jpeg']::text[]
)
on conflict (id) do nothing;

do $$
declare
  bucket_public boolean;
  bucket_limit bigint;
  bucket_mimes text[];
begin
  select
    buckets."public",
    buckets.file_size_limit,
    buckets.allowed_mime_types
  into
    bucket_public,
    bucket_limit,
    bucket_mimes
  from storage.buckets as buckets
  where buckets.id = 'market-listing-media';

  if not found then
    raise exception
      'market-listing-media storage bucket was not created.';
  end if;

  if
    bucket_public is distinct from false
    or bucket_limit is distinct from (2 * 1024 * 1024)
    or bucket_mimes is distinct from array['image/jpeg']::text[]
  then
    raise exception
      'market-listing-media storage bucket already exists with unexpected configuration.';
  end if;
end;
$$;


-- ============================================================
-- STORAGE POLICIES (bucket market-listing-media only)
--
-- SELECT requires a matching media row whose storage_path
-- equals the object name. market_listing_media RLS applies
-- to that EXISTS (active listing or owner).
-- Orphan uploads without metadata are not readable.
--
-- No UPDATE/upsert: clients must upload new objects.
-- DELETE is owner/path-owned so orphans can be removed
-- without a metadata row. Does not require status=active.
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
    where media.storage_path = name
  )
);


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
);


-- ============================================================
-- FUNCTION GRANTS
-- Path helpers are needed by storage policies.
-- Trigger functions are not executable by clients.
-- ============================================================

revoke all
on function public.market_listings_protect_seller()
from public;

revoke all
on function public.market_listings_protect_seller()
from anon;

revoke all
on function public.market_listings_protect_seller()
from authenticated;


revoke all
on function public.is_market_listing_media_storage_path(text, uuid, uuid)
from public;

revoke all
on function public.is_market_listing_media_storage_path(text, uuid, uuid)
from anon;

grant execute
on function public.is_market_listing_media_storage_path(text, uuid, uuid)
to authenticated;


revoke all
on function public.market_listing_media_path_seller_id(text)
from public;

revoke all
on function public.market_listing_media_path_seller_id(text)
from anon;

grant execute
on function public.market_listing_media_path_seller_id(text)
to authenticated;


revoke all
on function public.market_listing_media_path_listing_id(text)
from public;

revoke all
on function public.market_listing_media_path_listing_id(text)
from anon;

grant execute
on function public.market_listing_media_path_listing_id(text)
to authenticated;


revoke all
on function public.market_listing_media_align_path()
from public;

revoke all
on function public.market_listing_media_align_path()
from anon;

revoke all
on function public.market_listing_media_align_path()
from authenticated;


revoke all
on function public.market_listing_media_enforce_max_photos()
from public;

revoke all
on function public.market_listing_media_enforce_max_photos()
from anon;

revoke all
on function public.market_listing_media_enforce_max_photos()
from authenticated;


revoke all
on function public.market_listing_media_protect_columns()
from public;

revoke all
on function public.market_listing_media_protect_columns()
from anon;

revoke all
on function public.market_listing_media_protect_columns()
from authenticated;
