import { File } from 'expo-file-system';

import { supabase } from '../../lib/supabase';

import { JOB_PHOTO_JPEG_MIME } from '../jobs/jobPhotoNormalizer';

import {
  MARKET_LISTING_CATEGORIES,
  MARKET_LISTING_CONDITIONS,
  MARKET_LISTING_CURRENCY,
  MARKET_LISTING_MEDIA_BUCKET,
  MARKET_LISTING_MEDIA_MAX,
  MARKET_LISTING_MEDIA_MAX_BYTES,
  MARKET_LISTING_STATUSES,
  type ActiveMarketListingFeedItem,
  type CreateMarketListingDraftInput,
  type DeleteOwnActiveListingPhotoResult,
  type MarketListingActive,
  type MarketListingCategory,
  type MarketListingCondition,
  type MarketListingDraft,
  type MarketListingMedia,
  type MarketListingMediaPresentation,
  type MarketListingPendingPhoto,
  type MarketListingStatus,
  type OwnMarketListing,
  type OwnMarketListingDetail,
  type OwnMarketListingFeedItem,
  type UpdateMarketListingDraftInput,
  type ViewerListingRegion,
} from '../../types/marketListing';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const MARKET_LISTING_SELECT =
  'id, seller_profile_id, title, description, price, currency, category, subcategory, condition, status, allows_offers, pickup_available, delivery_available, suburb, state, created_at, updated_at';

const MAX_PRICE = 9_999_999_999.99;

type MarketListingRow = {
  id: string;
  seller_profile_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  subcategory: string;
  condition: string;
  status: string;
  allows_offers: boolean;
  pickup_available: boolean;
  delivery_available: boolean;
  suburb: string;
  state: string;
  created_at: string;
  updated_at: string;
};

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.toLowerCase());
}

function isMarketListingCategory(
  value: string,
): value is MarketListingCategory {
  return (
    MARKET_LISTING_CATEGORIES as readonly string[]
  ).includes(value);
}

function isMarketListingCondition(
  value: string,
): value is MarketListingCondition {
  return (
    MARKET_LISTING_CONDITIONS as readonly string[]
  ).includes(value);
}

function isMarketListingStatus(
  value: string,
): value is MarketListingStatus {
  return (
    MARKET_LISTING_STATUSES as readonly string[]
  ).includes(value);
}

function isMarketListingRow(
  value: unknown,
): value is MarketListingRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row.id === 'string' &&
    typeof row.seller_profile_id === 'string' &&
    typeof row.title === 'string' &&
    typeof row.description === 'string' &&
    (typeof row.price === 'number' ||
      typeof row.price === 'string') &&
    typeof row.currency === 'string' &&
    typeof row.category === 'string' &&
    typeof row.subcategory === 'string' &&
    typeof row.condition === 'string' &&
    typeof row.status === 'string' &&
    typeof row.allows_offers === 'boolean' &&
    typeof row.pickup_available === 'boolean' &&
    typeof row.delivery_available === 'boolean' &&
    typeof row.suburb === 'string' &&
    typeof row.state === 'string' &&
    typeof row.created_at === 'string' &&
    typeof row.updated_at === 'string'
  );
}

function parsePriceValue(
  value: number | string,
): number | null {
  const numeric =
    typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(numeric)) {
    return null;
  }

  return Number(numeric.toFixed(2));
}

function adaptDraftRow(
  row: MarketListingRow,
): MarketListingDraft | null {
  if (
    row.status !== 'draft' ||
    row.currency !== MARKET_LISTING_CURRENCY ||
    !isMarketListingCategory(row.category) ||
    !isMarketListingCondition(row.condition)
  ) {
    return null;
  }

  const price = parsePriceValue(row.price);

  if (price == null || price < 0) {
    return null;
  }

  return {
    id: row.id,
    sellerProfileId: row.seller_profile_id,
    title: row.title,
    description: row.description,
    price,
    currency: MARKET_LISTING_CURRENCY,
    category: row.category,
    subcategory: row.subcategory,
    condition: row.condition,
    status: 'draft',
    allowsOffers: row.allows_offers,
    pickupAvailable: row.pickup_available,
    deliveryAvailable: row.delivery_available,
    suburb: row.suburb,
    state: row.state,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function adaptActiveRow(
  row: MarketListingRow,
): MarketListingActive | null {
  if (
    row.status !== 'active' ||
    row.currency !== MARKET_LISTING_CURRENCY ||
    !isMarketListingCategory(row.category) ||
    !isMarketListingCondition(row.condition)
  ) {
    return null;
  }

  const price = parsePriceValue(row.price);

  if (price == null || price < 0) {
    return null;
  }

  return {
    id: row.id,
    sellerProfileId: row.seller_profile_id,
    title: row.title,
    description: row.description,
    price,
    currency: MARKET_LISTING_CURRENCY,
    category: row.category,
    subcategory: row.subcategory,
    condition: row.condition,
    status: 'active',
    allowsOffers: row.allows_offers,
    pickupAvailable: row.pickup_available,
    deliveryAvailable: row.delivery_available,
    suburb: row.suburb,
    state: row.state,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function adaptOwnRow(
  row: MarketListingRow,
): OwnMarketListing | null {
  if (
    !isMarketListingStatus(row.status) ||
    row.currency !== MARKET_LISTING_CURRENCY ||
    !isMarketListingCategory(row.category) ||
    !isMarketListingCondition(row.condition)
  ) {
    return null;
  }

  const price = parsePriceValue(row.price);

  if (price == null || price < 0) {
    return null;
  }

  return {
    id: row.id,
    sellerProfileId: row.seller_profile_id,
    title: row.title,
    description: row.description,
    price,
    currency: MARKET_LISTING_CURRENCY,
    category: row.category,
    subcategory: row.subcategory,
    condition: row.condition,
    status: row.status,
    allowsOffers: row.allows_offers,
    pickupAvailable: row.pickup_available,
    deliveryAvailable: row.delivery_available,
    suburb: row.suburb,
    state: row.state,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatSafeError(
  error: {
    message?: string;
    code?: string;
  } | null,
  fallback: string,
): string {
  if (!error?.message) {
    return fallback;
  }

  const message = error.message.toLowerCase();
  const code = error.code ?? '';

  if (
    code === '42501' ||
    message.includes('row-level security')
  ) {
    return 'You do not have permission to save this listing.';
  }

  if (message.includes('network')) {
    return 'Check your connection and try again.';
  }

  return fallback;
}

function formatPublishError(
  error: {
    message?: string;
    code?: string;
  } | null,
): string {
  if (!error?.message) {
    return 'This listing could not be listed. Try again.';
  }

  const message = error.message.trim();
  const lowered = message.toLowerCase();

  if (
    error.code === '42501' ||
    lowered.includes('row-level security')
  ) {
    return 'You do not have permission to list this item.';
  }

  if (lowered.includes('network')) {
    return 'Check your connection and try again.';
  }

  if (
    lowered.includes('postgres') ||
    lowered.includes('permission denied') ||
    lowered.includes('function') ||
    lowered.includes('sql') ||
    lowered.includes('schema')
  ) {
    return 'This listing could not be listed. Try again.';
  }

  const firstLine = message.split('\n')[0]?.trim() ?? '';

  if (firstLine.length > 0 && firstLine.length <= 160) {
    return firstLine;
  }

  return 'This listing could not be listed. Try again.';
}

function formatLifecycleError(
  error: {
    message?: string;
    code?: string;
  } | null,
  fallback: string,
): string {
  if (!error?.message) {
    return fallback;
  }

  const message = error.message.trim();
  const lowered = message.toLowerCase();

  if (
    error.code === '42501' ||
    lowered.includes('row-level security')
  ) {
    return 'You do not have permission to update this listing.';
  }

  if (lowered.includes('network')) {
    return 'Check your connection and try again.';
  }

  if (
    lowered.includes('postgres') ||
    lowered.includes('permission denied') ||
    lowered.includes('function') ||
    lowered.includes('sql') ||
    lowered.includes('schema')
  ) {
    return fallback;
  }

  const firstLine = message.split('\n')[0]?.trim() ?? '';

  if (firstLine.length > 0 && firstLine.length <= 160) {
    return firstLine;
  }

  return fallback;
}

const LAST_PHOTO_PROTECTED_MESSAGE =
  'This listing must keep at least one photo.';

const ACTIVE_LISTING_PHOTOS_ONLY =
  'Photos can only be managed on an active or paused listing.';

const ACTIVE_PHOTO_STORAGE_CLEANUP_WARNING =
  'The photo was removed. Storage cleanup may still be pending.';

function isLastPhotoProtectedError(error: {
  message?: string;
} | null): boolean {
  return (error?.message ?? '')
    .toLowerCase()
    .includes('must keep at least one photo');
}

function canManageOwnListingPhotos(status: string): boolean {
  return status === 'active' || status === 'paused';
}

function formatActivePhotoRpcError(
  error: {
    message?: string;
    code?: string;
  } | null,
  fallback: string,
): string {
  if (isLastPhotoProtectedError(error)) {
    return LAST_PHOTO_PROTECTED_MESSAGE;
  }

  if (!error?.message) {
    return fallback;
  }

  const message = error.message.trim();
  const lowered = message.toLowerCase();

  if (
    error.code === '42501' ||
    lowered.includes('row-level security')
  ) {
    return 'You do not have permission to manage these photos.';
  }

  if (lowered.includes('network')) {
    return 'Check your connection and try again.';
  }

  if (
    lowered.includes('postgres') ||
    lowered.includes('permission denied') ||
    lowered.includes('function') ||
    lowered.includes('sql') ||
    lowered.includes('schema')
  ) {
    return fallback;
  }

  const firstLine = message.split('\n')[0]?.trim() ?? '';

  if (firstLine.length > 0 && firstLine.length <= 160) {
    return firstLine;
  }

  return fallback;
}

function formatMarketReadError(
  error: {
    message?: string;
    code?: string;
  } | null,
  fallback: string,
): string {
  if (!error?.message) {
    return fallback;
  }

  const message = error.message.toLowerCase();
  const code = error.code ?? '';

  if (
    code === '42501' ||
    message.includes('row-level security')
  ) {
    return 'You do not have permission to view this listing.';
  }

  if (message.includes('network')) {
    return 'Check your connection and try again.';
  }

  if (
    message.includes('postgres') ||
    message.includes('permission denied') ||
    message.includes('function') ||
    message.includes('sql') ||
    message.includes('schema')
  ) {
    return fallback;
  }

  return fallback;
}

type SanitisedDraftFields = {
  title: string;
  description: string;
  category: MarketListingCategory;
  subcategory: string;
  condition: MarketListingCondition;
  price: number;
  allowsOffers: boolean;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  suburb: string;
  state: string;
};

function sanitiseDraftInput(
  input: CreateMarketListingDraftInput,
):
  | { ok: true; fields: SanitisedDraftFields }
  | { ok: false; error: string } {
  const title = input.title.trim();
  const description = input.description.trim();
  const subcategory = input.subcategory.trim();
  const suburb = input.suburb.trim();
  const state = input.state.trim();

  if (!title) {
    return { ok: false, error: 'Enter a title.' };
  }

  if (!description) {
    return { ok: false, error: 'Enter a description.' };
  }

  if (!isMarketListingCategory(input.category)) {
    return { ok: false, error: 'Choose a category.' };
  }

  if (!subcategory) {
    return {
      ok: false,
      error: 'Enter the item type.',
    };
  }

  if (!isMarketListingCondition(input.condition)) {
    return { ok: false, error: 'Choose a condition.' };
  }

  if (
    !Number.isFinite(input.price) ||
    input.price <= 0
  ) {
    return {
      ok: false,
      error: 'Enter a price greater than 0.',
    };
  }

  if (input.price > MAX_PRICE) {
    return {
      ok: false,
      error: 'That price is too large.',
    };
  }

  if (!suburb) {
    return { ok: false, error: 'Enter a suburb.' };
  }

  if (!state) {
    return { ok: false, error: 'Enter a state.' };
  }

  if (!input.pickupAvailable && !input.deliveryAvailable) {
    return {
      ok: false,
      error: 'Choose pickup, delivery, or both.',
    };
  }

  return {
    ok: true,
    fields: {
      title,
      description,
      category: input.category,
      subcategory,
      condition: input.condition,
      price: Number(input.price.toFixed(2)),
      allowsOffers: input.allowsOffers === true,
      pickupAvailable: input.pickupAvailable === true,
      deliveryAvailable: input.deliveryAvailable === true,
      suburb,
      state,
    },
  };
}

function toInsertPayload(
  userId: string,
  fields: SanitisedDraftFields,
) {
  return {
    seller_profile_id: userId,
    title: fields.title,
    description: fields.description,
    price: fields.price,
    currency: MARKET_LISTING_CURRENCY,
    category: fields.category,
    subcategory: fields.subcategory,
    condition: fields.condition,
    allows_offers: fields.allowsOffers,
    pickup_available: fields.pickupAvailable,
    delivery_available: fields.deliveryAvailable,
    suburb: fields.suburb,
    state: fields.state,
  };
}

async function requireUserId(): Promise<
  | { ok: true; userId: string }
  | { ok: false; error: string }
> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user?.id) {
    return {
      ok: false,
      error: 'Sign in to save a listing.',
    };
  }

  return {
    ok: true,
    userId: data.user.id,
  };
}

export async function getViewerListingRegion(): Promise<ViewerListingRegion> {
  const auth = await requireUserId();

  if (!auth.ok) {
    return {
      suburb: null,
      state: null,
    };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('suburb, state')
    .eq('id', auth.userId)
    .maybeSingle();

  if (error || !data) {
    return {
      suburb: null,
      state: null,
    };
  }

  const row = data as {
    suburb?: unknown;
    state?: unknown;
  };

  return {
    suburb:
      typeof row.suburb === 'string' && row.suburb.trim()
        ? row.suburb.trim()
        : null,
    state:
      typeof row.state === 'string' && row.state.trim()
        ? row.state.trim()
        : null,
  };
}

export async function createDraftListing(
  input: CreateMarketListingDraftInput,
): Promise<{
  listing: MarketListingDraft | null;
  error: string | null;
}> {
  const auth = await requireUserId();

  if (!auth.ok) {
    return {
      listing: null,
      error: auth.error,
    };
  }

  const sanitised = sanitiseDraftInput(input);

  if (!sanitised.ok) {
    return {
      listing: null,
      error: sanitised.error,
    };
  }

  const inserted = await supabase
    .from('market_listings')
    .insert(toInsertPayload(auth.userId, sanitised.fields))
    .select(MARKET_LISTING_SELECT)
    .maybeSingle();

  if (inserted.error) {
    return {
      listing: null,
      error: formatSafeError(
        inserted.error,
        'This listing could not be saved. Try again.',
      ),
    };
  }

  if (!isMarketListingRow(inserted.data)) {
    return {
      listing: null,
      error: 'This listing could not be saved. Try again.',
    };
  }

  if (inserted.data.seller_profile_id !== auth.userId) {
    return {
      listing: null,
      error: 'This listing could not be saved. Try again.',
    };
  }

  const listing = adaptDraftRow(inserted.data);

  if (!listing) {
    return {
      listing: null,
      error: 'This listing could not be saved. Try again.',
    };
  }

  return {
    listing,
    error: null,
  };
}

export async function getOwnListing(
  listingId: string,
): Promise<{
  listing: MarketListingDraft | null;
  error: string | null;
}> {
  const trimmed = listingId.trim().toLowerCase();

  if (!isUuid(trimmed)) {
    return {
      listing: null,
      error: "Couldn't load your draft.",
    };
  }

  const auth = await requireUserId();

  if (!auth.ok) {
    return {
      listing: null,
      error: auth.error,
    };
  }

  const loaded = await supabase
    .from('market_listings')
    .select(MARKET_LISTING_SELECT)
    .eq('id', trimmed)
    .eq('seller_profile_id', auth.userId)
    .maybeSingle();

  if (loaded.error) {
    return {
      listing: null,
      error: formatSafeError(
        loaded.error,
        "Couldn't load your draft.",
      ),
    };
  }

  if (!loaded.data) {
    return {
      listing: null,
      error: "Couldn't load your draft.",
    };
  }

  if (!isMarketListingRow(loaded.data)) {
    return {
      listing: null,
      error: "Couldn't load your draft.",
    };
  }

  if (loaded.data.seller_profile_id !== auth.userId) {
    return {
      listing: null,
      error: "Couldn't load your draft.",
    };
  }

  if (loaded.data.status !== 'draft') {
    return {
      listing: null,
      error: 'This listing is no longer a draft.',
    };
  }

  const listing = adaptDraftRow(loaded.data);

  if (!listing) {
    return {
      listing: null,
      error: "Couldn't load your draft.",
    };
  }

  return {
    listing,
    error: null,
  };
}

export async function listOwnDrafts(): Promise<{
  listings: MarketListingDraft[];
  error: string | null;
}> {
  const auth = await requireUserId();

  if (!auth.ok) {
    return {
      listings: [],
      error: auth.error,
    };
  }

  const loaded = await supabase
    .from('market_listings')
    .select(MARKET_LISTING_SELECT)
    .eq('seller_profile_id', auth.userId)
    .eq('status', 'draft')
    .order('updated_at', { ascending: false });

  if (loaded.error) {
    return {
      listings: [],
      error: formatSafeError(
        loaded.error,
        "Couldn't load your draft.",
      ),
    };
  }

  const listings: MarketListingDraft[] = [];

  for (const row of loaded.data ?? []) {
    if (!isMarketListingRow(row)) {
      continue;
    }

    if (row.seller_profile_id !== auth.userId) {
      continue;
    }

    const listing = adaptDraftRow(row);

    if (listing) {
      listings.push(listing);
    }
  }

  return {
    listings,
    error: null,
  };
}

export async function listOwnMarketListings(): Promise<{
  listings: OwnMarketListingFeedItem[];
  error: string | null;
}> {
  const auth = await requireUserId();

  if (!auth.ok) {
    return {
      listings: [],
      error: auth.error,
    };
  }

  const loaded = await supabase
    .from('market_listings')
    .select(MARKET_LISTING_SELECT)
    .eq('seller_profile_id', auth.userId)
    .order('updated_at', { ascending: false })
    .order('id', { ascending: false });

  if (loaded.error) {
    return {
      listings: [],
      error: formatSafeError(
        loaded.error,
        "Couldn't load your listings.",
      ),
    };
  }

  const listings: OwnMarketListing[] = [];

  for (const row of loaded.data ?? []) {
    if (!isMarketListingRow(row)) {
      continue;
    }

    if (row.seller_profile_id !== auth.userId) {
      continue;
    }

    const listing = adaptOwnRow(row);

    if (listing) {
      listings.push(listing);
    }
  }

  if (listings.length === 0) {
    return {
      listings: [],
      error: null,
    };
  }

  const listingIds = listings.map((listing) => listing.id);

  const mediaLoaded = await supabase
    .from('market_listing_media')
    .select(MARKET_LISTING_MEDIA_SELECT)
    .in('listing_id', listingIds)
    .order('listing_id', { ascending: true })
    .order('sort_order', { ascending: true });

  const mediaByListing = new Map<string, MarketListingMedia[]>();

  if (!mediaLoaded.error) {
    for (const row of mediaLoaded.data ?? []) {
      if (!isMarketListingMediaRow(row)) {
        continue;
      }

      const media = adaptMediaRow(row);

      if (!media) {
        continue;
      }

      const current = mediaByListing.get(media.listingId) ?? [];
      current.push(media);
      mediaByListing.set(media.listingId, current);
    }
  }

  const coverPaths: string[] = [];

  for (const listing of listings) {
    const media = mediaByListing.get(listing.id) ?? [];
    const cover = media[0];

    if (cover) {
      coverPaths.push(cover.storagePath);
    }
  }

  const signedCovers =
    coverPaths.length > 0
      ? await createListingMediaSignedUrls(coverPaths)
      : new Map<string, string>();

  return {
    listings: listings.map((listing) => {
      const media = mediaByListing.get(listing.id) ?? [];
      const cover = media[0] ?? null;
      const coverSignedUrl = cover
        ? signedCovers.get(cover.storagePath) ?? null
        : null;

      return {
        listing,
        photoCount: media.length,
        coverSignedUrl,
      };
    }),
    error: null,
  };
}

const OWN_LISTING_INACCESSIBLE =
  "Couldn't load this listing.";

export async function getOwnMarketListing(
  listingId: string,
): Promise<{
  listing: OwnMarketListingDetail | null;
  error: string | null;
}> {
  const trimmed = listingId.trim().toLowerCase();

  if (!isUuid(trimmed)) {
    return {
      listing: null,
      error: OWN_LISTING_INACCESSIBLE,
    };
  }

  const auth = await requireUserId();

  if (!auth.ok) {
    return {
      listing: null,
      error: auth.error,
    };
  }

  const loaded = await supabase
    .from('market_listings')
    .select(MARKET_LISTING_SELECT)
    .eq('id', trimmed)
    .eq('seller_profile_id', auth.userId)
    .maybeSingle();

  if (loaded.error) {
    return {
      listing: null,
      error: formatSafeError(
        loaded.error,
        OWN_LISTING_INACCESSIBLE,
      ),
    };
  }

  if (!loaded.data || !isMarketListingRow(loaded.data)) {
    return {
      listing: null,
      error: OWN_LISTING_INACCESSIBLE,
    };
  }

  if (loaded.data.seller_profile_id !== auth.userId) {
    return {
      listing: null,
      error: OWN_LISTING_INACCESSIBLE,
    };
  }

  const listing = adaptOwnRow(loaded.data);

  if (!listing) {
    return {
      listing: null,
      error: OWN_LISTING_INACCESSIBLE,
    };
  }

  const mediaLoaded = await supabase
    .from('market_listing_media')
    .select(MARKET_LISTING_MEDIA_SELECT)
    .eq('listing_id', listing.id)
    .order('sort_order', { ascending: true })
    .limit(MARKET_LISTING_MEDIA_MAX);

  const rows: MarketListingMedia[] = [];

  if (!mediaLoaded.error) {
    for (const row of mediaLoaded.data ?? []) {
      if (!isMarketListingMediaRow(row)) {
        continue;
      }

      const media = adaptMediaRow(row);

      if (media && media.listingId === listing.id) {
        rows.push(media);
      }
    }
  }

  rows.sort((left, right) => left.sortOrder - right.sortOrder);

  const urls =
    rows.length > 0
      ? await createListingMediaSignedUrls(
          rows.map((item) => item.storagePath),
        )
      : new Map<string, string>();

  const media: MarketListingMediaPresentation[] = [];

  for (const item of rows) {
    const signedUrl = urls.get(item.storagePath);

    if (!signedUrl) {
      continue;
    }

    media.push({
      ...item,
      signedUrl,
    });
  }

  return {
    listing: {
      listing,
      media,
    },
    error: null,
  };
}

export async function updateOwnDraft(
  listingId: string,
  fields: UpdateMarketListingDraftInput,
): Promise<{
  listing: MarketListingDraft | null;
  error: string | null;
}> {
  const current = await getOwnListing(listingId);

  if (current.error || !current.listing) {
    return {
      listing: null,
      error:
        current.error ??
        'This draft could not be updated.',
    };
  }

  const sanitised = sanitiseDraftInput(fields);

  if (!sanitised.ok) {
    return {
      listing: null,
      error: sanitised.error,
    };
  }

  const updated = await supabase
    .from('market_listings')
    .update({
      title: sanitised.fields.title,
      description: sanitised.fields.description,
      price: sanitised.fields.price,
      currency: MARKET_LISTING_CURRENCY,
      category: sanitised.fields.category,
      subcategory: sanitised.fields.subcategory,
      condition: sanitised.fields.condition,
      allows_offers: sanitised.fields.allowsOffers,
      pickup_available: sanitised.fields.pickupAvailable,
      delivery_available: sanitised.fields.deliveryAvailable,
      suburb: sanitised.fields.suburb,
      state: sanitised.fields.state,
    })
    .eq('id', current.listing.id)
    .eq('seller_profile_id', current.listing.sellerProfileId)
    .eq('status', 'draft')
    .select(MARKET_LISTING_SELECT)
    .maybeSingle();

  if (updated.error) {
    return {
      listing: null,
      error: formatSafeError(
        updated.error,
        'This listing could not be saved. Try again.',
      ),
    };
  }

  if (!isMarketListingRow(updated.data)) {
    return {
      listing: null,
      error: 'This listing could not be saved. Try again.',
    };
  }

  const listing = adaptDraftRow(updated.data);

  if (!listing) {
    return {
      listing: null,
      error: 'This listing could not be saved. Try again.',
    };
  }

  return {
    listing,
    error: null,
  };
}

export async function updateOwnMarketListingDetails(
  listingId: string,
  fields: UpdateMarketListingDraftInput,
): Promise<{
  listing: OwnMarketListingDetail | null;
  error: string | null;
}> {
  const current = await getOwnMarketListing(listingId);

  if (current.error || !current.listing) {
    return {
      listing: null,
      error:
        current.error ??
        "Couldn't load this listing.",
    };
  }

  if (
    current.listing.listing.status !== 'active' &&
    current.listing.listing.status !== 'paused'
  ) {
    return {
      listing: null,
      error: 'This listing cannot be edited.',
    };
  }

  const sanitised = sanitiseDraftInput(fields);

  if (!sanitised.ok) {
    return {
      listing: null,
      error: sanitised.error,
    };
  }

  const updated = await supabase
    .from('market_listings')
    .update({
      title: sanitised.fields.title,
      description: sanitised.fields.description,
      price: sanitised.fields.price,
      currency: MARKET_LISTING_CURRENCY,
      category: sanitised.fields.category,
      subcategory: sanitised.fields.subcategory,
      condition: sanitised.fields.condition,
      allows_offers: sanitised.fields.allowsOffers,
      pickup_available: sanitised.fields.pickupAvailable,
      delivery_available: sanitised.fields.deliveryAvailable,
      suburb: sanitised.fields.suburb,
      state: sanitised.fields.state,
    })
    .eq('id', current.listing.listing.id)
    .eq(
      'seller_profile_id',
      current.listing.listing.sellerProfileId,
    )
    .in('status', ['active', 'paused'])
    .select(MARKET_LISTING_SELECT)
    .maybeSingle();

  if (updated.error) {
    return {
      listing: null,
      error: formatSafeError(
        updated.error,
        'This listing could not be saved. Try again.',
      ),
    };
  }

  if (!updated.data) {
    return {
      listing: null,
      error: 'This listing cannot be edited.',
    };
  }

  if (
    !isMarketListingRow(updated.data) ||
    (updated.data.status !== 'active' &&
      updated.data.status !== 'paused')
  ) {
    return {
      listing: null,
      error: 'This listing cannot be edited.',
    };
  }

  return getOwnMarketListing(current.listing.listing.id);
}

const MARKET_LISTING_MEDIA_SELECT =
  'id, listing_id, storage_path, sort_order, created_at';

const MARKET_LISTING_MEDIA_PATH =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/;

const SIGNED_URL_TTL_SECONDS = 60 * 60;

const SIGNED_URL_REFRESH_MARGIN_MS = 5 * 60 * 1000;

const SORT_ORDER_COMPACT_OFFSET = 1000;

type MarketListingMediaRow = {
  id: string;
  listing_id: string;
  storage_path: string;
  sort_order: number;
  created_at: string;
};

type SignedUrlCacheEntry = {
  url: string;
  expiresAt: number;
};

const signedUrlCache = new Map<string, SignedUrlCacheEntry>();

function createMarketListingMediaObjectId(): string {
  const cryptoObj = globalThis.crypto;

  if (typeof cryptoObj?.randomUUID === 'function') {
    return cryptoObj.randomUUID().toLowerCase();
  }

  const bytes = new Uint8Array(16);

  if (typeof cryptoObj?.getRandomValues === 'function') {
    cryptoObj.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function createMarketListingMediaStoragePath(
  sellerProfileId: string,
  listingId: string,
  objectId: string,
): string | null {
  const path =
    `${sellerProfileId.toLowerCase()}/${listingId.toLowerCase()}/${objectId.toLowerCase()}.jpg`;

  if (!MARKET_LISTING_MEDIA_PATH.test(path)) {
    return null;
  }

  if (
    path.split('/')[0] !== sellerProfileId.toLowerCase() ||
    path.split('/')[1] !== listingId.toLowerCase()
  ) {
    return null;
  }

  return path;
}

function isMarketListingMediaRow(
  value: unknown,
): value is MarketListingMediaRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row.id === 'string' &&
    isUuid(row.id) &&
    typeof row.listing_id === 'string' &&
    isUuid(row.listing_id) &&
    typeof row.storage_path === 'string' &&
    MARKET_LISTING_MEDIA_PATH.test(row.storage_path) &&
    typeof row.sort_order === 'number' &&
    Number.isInteger(row.sort_order) &&
    row.sort_order >= 0 &&
    typeof row.created_at === 'string'
  );
}

function adaptMediaRow(
  row: MarketListingMediaRow,
): MarketListingMedia | null {
  if (
    row.storage_path.split('/')[1] !==
    row.listing_id.toLowerCase()
  ) {
    return null;
  }

  return {
    id: row.id,
    listingId: row.listing_id.toLowerCase(),
    storagePath: row.storage_path,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

function isSafeUploadUri(uri: string): boolean {
  const trimmed = uri.trim();

  if (
    trimmed.length === 0 ||
    trimmed.includes('..') ||
    /[\u0000-\u001F\u007F]/.test(trimmed)
  ) {
    return false;
  }

  const schemeMatch = trimmed.match(
    /^([a-zA-Z][a-zA-Z0-9+.-]*):/,
  );

  if (!schemeMatch) {
    return trimmed.startsWith('/');
  }

  const scheme = schemeMatch[1].toLowerCase();

  return scheme === 'file' || scheme === 'content';
}

async function readJpegBytes(
  uri: string,
): Promise<{ bytes: Uint8Array; byteSize: number } | null> {
  if (!isSafeUploadUri(uri)) {
    console.warn(
      '[Direct Gain] Listing photo upload rejected: unexpected local path.',
    );
    return null;
  }

  let file: File;

  try {
    file = new File(uri);
  } catch (error) {
    console.warn(
      '[Direct Gain] Listing photo upload rejected: invalid local file.',
      error instanceof Error ? error.message : error,
    );
    return null;
  }

  if (!file.exists) {
    console.warn(
      '[Direct Gain] Listing photo upload rejected: local file is missing.',
    );
    return null;
  }

  try {
    const bytes = await file.bytes();
    const byteSize = bytes.byteLength;

    if (
      byteSize <= 0 ||
      byteSize > MARKET_LISTING_MEDIA_MAX_BYTES
    ) {
      console.warn(
        '[Direct Gain] Listing photo upload rejected: file size is not allowed.',
      );
      return null;
    }

    return {
      bytes,
      byteSize,
    };
  } catch (error) {
    console.warn(
      '[Direct Gain] Listing photo upload rejected: unable to read file bytes.',
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function deleteMarketListingMediaObject(
  storagePath: string,
): Promise<{ confirmed: boolean }> {
  try {
    const removed = await supabase.storage
      .from(MARKET_LISTING_MEDIA_BUCKET)
      .remove([storagePath]);

    if (removed.error) {
      console.warn(
        '[Direct Gain] Market listing media object cleanup failed.',
        removed.error.message,
      );
      return { confirmed: false };
    }

    if (
      !marketListingMediaRemoveConfirmed(removed.data, storagePath)
    ) {
      console.warn(
        '[Direct Gain] Market listing media object cleanup was not confirmed.',
        storagePath,
      );
      return { confirmed: false };
    }

    return { confirmed: true };
  } catch (error) {
    console.warn(
      '[Direct Gain] Market listing media object cleanup threw.',
      error instanceof Error ? error.message : error,
    );
    return { confirmed: false };
  }
}

function marketListingMediaRemoveConfirmed(
  data: unknown,
  storagePath: string,
): boolean {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  const fileName = storagePath.split('/').pop() ?? '';

  if (!fileName) {
    return false;
  }

  return data.some((entry) => {
    if (!entry || typeof entry !== 'object') {
      return false;
    }

    const name = (entry as { name?: unknown }).name;

    if (typeof name !== 'string' || name.length === 0) {
      return false;
    }

    return name === storagePath || name === fileName;
  });
}

function cachedSignedUrl(storagePath: string): string | null {
  const entry = signedUrlCache.get(storagePath);

  if (!entry) {
    return null;
  }

  if (
    entry.expiresAt - Date.now() <=
    SIGNED_URL_REFRESH_MARGIN_MS
  ) {
    signedUrlCache.delete(storagePath);
    return null;
  }

  return entry.url;
}

function rememberSignedUrl(storagePath: string, url: string) {
  signedUrlCache.set(storagePath, {
    url,
    expiresAt: Date.now() + SIGNED_URL_TTL_SECONDS * 1000,
  });
}

export async function createListingMediaSignedUrls(
  storagePaths: readonly string[],
): Promise<Map<string, string>> {
  const urls = new Map<string, string>();
  const pending: string[] = [];

  for (const path of storagePaths) {
    if (!MARKET_LISTING_MEDIA_PATH.test(path)) {
      continue;
    }

    const cached = cachedSignedUrl(path);

    if (cached) {
      urls.set(path, cached);
      continue;
    }

    pending.push(path);
  }

  if (pending.length === 0) {
    return urls;
  }

  const signed = await supabase.storage
    .from(MARKET_LISTING_MEDIA_BUCKET)
    .createSignedUrls(pending, SIGNED_URL_TTL_SECONDS);

  if (signed.error) {
    console.warn(
      '[Direct Gain] Listing media signed URLs could not be created.',
    );
    return urls;
  }

  for (const item of signed.data ?? []) {
    const path = item.path;
    const url = item.signedUrl;

    if (
      !path ||
      !url ||
      item.error ||
      !MARKET_LISTING_MEDIA_PATH.test(path)
    ) {
      continue;
    }

    rememberSignedUrl(path, url);
    urls.set(path, url);
  }

  return urls;
}

async function listOwnListingMediaRows(
  listingId: string,
): Promise<{
  media: MarketListingMedia[];
  error: string | null;
}> {
  const listing = await getOwnListing(listingId);

  if (listing.error || !listing.listing) {
    return {
      media: [],
      error:
        listing.error ??
        'Photos could not be loaded for this draft.',
    };
  }

  const loaded = await supabase
    .from('market_listing_media')
    .select(MARKET_LISTING_MEDIA_SELECT)
    .eq('listing_id', listing.listing.id)
    .order('sort_order', { ascending: true })
    .limit(MARKET_LISTING_MEDIA_MAX);

  if (loaded.error) {
    return {
      media: [],
      error: formatSafeError(
        loaded.error,
        "Couldn't load photos.",
      ),
    };
  }

  const media: MarketListingMedia[] = [];

  for (const row of loaded.data ?? []) {
    if (!isMarketListingMediaRow(row)) {
      continue;
    }

    const adapted = adaptMediaRow(row);

    if (
      adapted &&
      adapted.listingId === listing.listing.id
    ) {
      media.push(adapted);
    }
  }

  media.sort((left, right) => left.sortOrder - right.sortOrder);

  return {
    media,
    error: null,
  };
}

async function listListingMediaRows(
  listingId: string,
): Promise<{
  media: MarketListingMedia[];
  error: string | null;
}> {
  const loaded = await supabase
    .from('market_listing_media')
    .select(MARKET_LISTING_MEDIA_SELECT)
    .eq('listing_id', listingId)
    .order('sort_order', { ascending: true })
    .limit(MARKET_LISTING_MEDIA_MAX);

  if (loaded.error) {
    return {
      media: [],
      error: formatSafeError(
        loaded.error,
        "Couldn't load photos.",
      ),
    };
  }

  const media: MarketListingMedia[] = [];

  for (const row of loaded.data ?? []) {
    if (!isMarketListingMediaRow(row)) {
      continue;
    }

    const adapted = adaptMediaRow(row);

    if (adapted && adapted.listingId === listingId) {
      media.push(adapted);
    }
  }

  media.sort((left, right) => left.sortOrder - right.sortOrder);

  return {
    media,
    error: null,
  };
}

export async function getOwnListingMedia(
  listingId: string,
): Promise<{
  media: MarketListingMediaPresentation[];
  error: string | null;
}> {
  const listed = await listOwnListingMediaRows(listingId);

  if (listed.error) {
    return {
      media: [],
      error: listed.error,
    };
  }

  const urls = await createListingMediaSignedUrls(
    listed.media.map((item) => item.storagePath),
  );

  const media: MarketListingMediaPresentation[] = [];

  for (const item of listed.media) {
    const signedUrl = urls.get(item.storagePath);

    if (!signedUrl) {
      continue;
    }

    media.push({
      ...item,
      signedUrl,
    });
  }

  if (listed.media.length > 0 && media.length === 0) {
    return {
      media: [],
      error: "Couldn't load photos.",
    };
  }

  return {
    media,
    error: null,
  };
}

async function compactListingMediaSortOrder(
  listingId: string,
): Promise<string | null> {
  const listed = await listOwnListingMediaRows(listingId);

  if (listed.error) {
    return listed.error;
  }

  const remaining = listed.media;
  const alreadyCompact = remaining.every(
    (item, index) => item.sortOrder === index,
  );

  if (alreadyCompact) {
    return null;
  }

  for (const item of remaining) {
    const shifted = await supabase
      .from('market_listing_media')
      .update({
        sort_order: SORT_ORDER_COMPACT_OFFSET + item.sortOrder,
      })
      .eq('id', item.id)
      .eq('listing_id', listingId);

    if (shifted.error) {
      return formatSafeError(
        shifted.error,
        'Photos could not be reordered after removal.',
      );
    }
  }

  for (let index = 0; index < remaining.length; index += 1) {
    const item = remaining[index];
    const finalized = await supabase
      .from('market_listing_media')
      .update({
        sort_order: index,
      })
      .eq('id', item.id)
      .eq('listing_id', listingId);

    if (finalized.error) {
      return formatSafeError(
        finalized.error,
        'Photos could not be reordered after removal.',
      );
    }
  }

  return null;
}

async function persistNormalizedListingPhoto(
  listingId: string,
  sellerProfileId: string,
  existingMedia: readonly MarketListingMedia[],
  normalizedPhoto: MarketListingPendingPhoto,
  signedUrlRetryMessage: string,
): Promise<{
  media: MarketListingMediaPresentation | null;
  error: string | null;
}> {
  if (
    normalizedPhoto.byteSize <= 0 ||
    normalizedPhoto.byteSize > MARKET_LISTING_MEDIA_MAX_BYTES
  ) {
    return {
      media: null,
      error: 'That photo is too large to upload.',
    };
  }

  if (existingMedia.length >= MARKET_LISTING_MEDIA_MAX) {
    return {
      media: null,
      error: 'A listing can have at most 20 photos.',
    };
  }

  const nextSortOrder =
    existingMedia.length === 0
      ? 0
      : Math.max(
          ...existingMedia.map((item) => item.sortOrder),
        ) + 1;

  const objectId = createMarketListingMediaObjectId();
  const storagePath = createMarketListingMediaStoragePath(
    sellerProfileId,
    listingId,
    objectId,
  );

  if (!storagePath) {
    return {
      media: null,
      error: 'That photo could not be uploaded. Try again.',
    };
  }

  const fileBody = await readJpegBytes(normalizedPhoto.uri);

  if (!fileBody) {
    return {
      media: null,
      error: 'That photo could not be uploaded. Try a different image.',
    };
  }

  const uploaded = await supabase.storage
    .from(MARKET_LISTING_MEDIA_BUCKET)
    .upload(storagePath, fileBody.bytes, {
      contentType: JOB_PHOTO_JPEG_MIME,
      upsert: false,
    });

  if (uploaded.error) {
    console.warn(
      '[Direct Gain] Listing photo storage upload failed.',
      uploaded.error.message,
    );

    return {
      media: null,
      error: formatSafeError(
        uploaded.error,
        'That photo could not be uploaded. Try again.',
      ),
    };
  }

  const inserted = await supabase
    .from('market_listing_media')
    .insert({
      listing_id: listingId,
      storage_path: storagePath,
      sort_order: nextSortOrder,
    })
    .select(MARKET_LISTING_MEDIA_SELECT)
    .maybeSingle();

  if (inserted.error || !isMarketListingMediaRow(inserted.data)) {
    console.warn(
      '[Direct Gain] Listing media metadata insert failed.',
      inserted.error?.message,
    );

    const cleaned = await deleteMarketListingMediaObject(storagePath);

    if (!cleaned.confirmed) {
      console.warn(
        '[Direct Gain] Orphan market-listing-media object may remain after metadata failure.',
        storagePath,
      );
    }

    return {
      media: null,
      error: formatSafeError(
        inserted.error,
        'That photo could not be saved. Try again.',
      ),
    };
  }

  const adapted = adaptMediaRow(inserted.data);

  if (!adapted) {
    const cleaned = await deleteMarketListingMediaObject(storagePath);

    if (!cleaned.confirmed) {
      console.warn(
        '[Direct Gain] Orphan market-listing-media object may remain after metadata failure.',
        storagePath,
      );
    }

    return {
      media: null,
      error: 'That photo could not be saved. Try again.',
    };
  }

  const urls = await createListingMediaSignedUrls([adapted.storagePath]);
  const signedUrl = urls.get(adapted.storagePath);

  if (!signedUrl) {
    return {
      media: null,
      error: signedUrlRetryMessage,
    };
  }

  return {
    media: {
      ...adapted,
      signedUrl,
    },
    error: null,
  };
}

export async function uploadListingPhoto(
  listingId: string,
  normalizedPhoto: MarketListingPendingPhoto,
): Promise<{
  media: MarketListingMediaPresentation | null;
  error: string | null;
}> {
  const listing = await getOwnListing(listingId);

  if (listing.error || !listing.listing) {
    return {
      media: null,
      error:
        listing.error ??
        'Photos can only be added to a saved draft.',
    };
  }

  const existing = await listOwnListingMediaRows(listing.listing.id);

  if (existing.error) {
    return {
      media: null,
      error: existing.error,
    };
  }

  return persistNormalizedListingPhoto(
    listing.listing.id,
    listing.listing.sellerProfileId,
    existing.media,
    normalizedPhoto,
    'The photo uploaded, but it could not be displayed yet. Reopen this draft to try again.',
  );
}

export async function deleteListingPhoto(
  media: MarketListingMedia,
): Promise<{
  error: string | null;
  cleanupWarning: string | null;
}> {
  const listing = await getOwnListing(media.listingId);

  if (listing.error || !listing.listing) {
    return {
      error:
        listing.error ??
        'Photos can only be removed from a saved draft.',
      cleanupWarning: null,
    };
  }

  const removed = await supabase
    .from('market_listing_media')
    .delete()
    .eq('id', media.id)
    .eq('listing_id', listing.listing.id);

  if (removed.error) {
    return {
      error: formatSafeError(
        removed.error,
        'That photo could not be removed. Try again.',
      ),
      cleanupWarning: null,
    };
  }

  signedUrlCache.delete(media.storagePath);

  const objectRemoved = await deleteMarketListingMediaObject(
    media.storagePath,
  );

  const compactError = await compactListingMediaSortOrder(
    listing.listing.id,
  );

  if (compactError) {
    console.warn(
      '[Direct Gain] Listing media sort order could not be compacted.',
      compactError,
    );
  }

  if (!objectRemoved.confirmed) {
    return {
      error: null,
      cleanupWarning:
        'The photo was removed. Storage cleanup may still be pending.',
    };
  }

  return {
    error: null,
    cleanupWarning: null,
  };
}

export async function reorderListingMedia(
  listingId: string,
  orderedMediaIds: readonly string[],
): Promise<{ error: string | null }> {
  const listing = await getOwnListing(listingId);

  if (listing.error || !listing.listing) {
    return {
      error:
        listing.error ??
        "Couldn't save photo order. Please try again.",
    };
  }

  const current = await listOwnListingMediaRows(listing.listing.id);

  if (current.error) {
    return {
      error:
        current.error === "Couldn't load photos."
          ? "Couldn't save photo order. Please try again."
          : current.error,
    };
  }

  const currentIds = current.media.map((item) =>
    item.id.toLowerCase(),
  );
  const requested = orderedMediaIds.map((id) => id.trim().toLowerCase());

  if (requested.some((id) => !isUuid(id))) {
    return {
      error: "Couldn't save photo order. Please try again.",
    };
  }

  if (requested.length !== currentIds.length) {
    return {
      error: "Couldn't save photo order. Please try again.",
    };
  }

  const uniqueRequested = new Set(requested);

  if (uniqueRequested.size !== requested.length) {
    return {
      error: "Couldn't save photo order. Please try again.",
    };
  }

  const currentSet = new Set(currentIds);

  for (const id of requested) {
    if (!currentSet.has(id)) {
      return {
        error: "Couldn't save photo order. Please try again.",
      };
    }
  }

  for (const id of currentIds) {
    if (!uniqueRequested.has(id)) {
      return {
        error: "Couldn't save photo order. Please try again.",
      };
    }
  }

  const alreadyOrdered = current.media.every(
    (item, index) =>
      item.id.toLowerCase() === requested[index] &&
      item.sortOrder === index,
  );

  if (alreadyOrdered) {
    return { error: null };
  }

  const byId = new Map(
    current.media.map((item) => [item.id.toLowerCase(), item]),
  );

  for (const item of current.media) {
    const shifted = await supabase
      .from('market_listing_media')
      .update({
        sort_order: SORT_ORDER_COMPACT_OFFSET + item.sortOrder,
      })
      .eq('id', item.id)
      .eq('listing_id', listing.listing.id);

    if (shifted.error) {
      return {
        error: formatSafeError(
          shifted.error,
          "Couldn't save photo order. Please try again.",
        ),
      };
    }
  }

  for (let index = 0; index < requested.length; index += 1) {
    const mediaId = requested[index];
    const existing = byId.get(mediaId);

    if (!existing) {
      return {
        error: "Couldn't save photo order. Please try again.",
      };
    }

    const finalized = await supabase
      .from('market_listing_media')
      .update({
        sort_order: index,
      })
      .eq('id', existing.id)
      .eq('listing_id', listing.listing.id);

    if (finalized.error) {
      return {
        error: formatSafeError(
          finalized.error,
          "Couldn't save photo order. Please try again.",
        ),
      };
    }
  }

  return { error: null };
}

async function loadOwnActiveListing(
  listingId: string,
): Promise<{
  detail: OwnMarketListingDetail | null;
  error: string | null;
}> {
  const loaded = await getOwnMarketListing(listingId);

  if (loaded.error || !loaded.listing) {
    return {
      detail: null,
      error: loaded.error ?? OWN_LISTING_INACCESSIBLE,
    };
  }

  if (!canManageOwnListingPhotos(loaded.listing.listing.status)) {
    return {
      detail: null,
      error: ACTIVE_LISTING_PHOTOS_ONLY,
    };
  }

  return {
    detail: loaded.listing,
    error: null,
  };
}

function parseDeletedActiveMediaRow(value: unknown): {
  id: string;
  listingId: string;
  storagePath: string;
} | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const row = value as {
    id?: unknown;
    listing_id?: unknown;
    storage_path?: unknown;
  };

  if (
    typeof row.id !== 'string' ||
    typeof row.listing_id !== 'string' ||
    typeof row.storage_path !== 'string' ||
    !isUuid(row.id) ||
    !isUuid(row.listing_id) ||
    !MARKET_LISTING_MEDIA_PATH.test(row.storage_path)
  ) {
    return null;
  }

  return {
    id: row.id.toLowerCase(),
    listingId: row.listing_id.toLowerCase(),
    storagePath: row.storage_path,
  };
}

export async function getOwnActiveListingForPhotos(
  listingId: string,
): Promise<{
  listing: OwnMarketListingDetail | null;
  error: string | null;
}> {
  const loaded = await loadOwnActiveListing(listingId);

  return {
    listing: loaded.detail,
    error: loaded.error,
  };
}

export async function uploadOwnActiveListingPhoto(
  listingId: string,
  normalizedPhoto: MarketListingPendingPhoto,
): Promise<{
  media: MarketListingMediaPresentation | null;
  error: string | null;
}> {
  const owned = await loadOwnActiveListing(listingId);

  if (owned.error || !owned.detail) {
    return {
      media: null,
      error: owned.error ?? ACTIVE_LISTING_PHOTOS_ONLY,
    };
  }

  const existing = await listListingMediaRows(owned.detail.listing.id);

  if (existing.error) {
    return {
      media: null,
      error: existing.error,
    };
  }

  return persistNormalizedListingPhoto(
    owned.detail.listing.id,
    owned.detail.listing.sellerProfileId,
    existing.media,
    normalizedPhoto,
    'The photo uploaded, but it could not be displayed yet. Reopen this listing to try again.',
  );
}

export async function deleteOwnActiveListingPhoto(
  listingId: string,
  mediaId: string,
): Promise<DeleteOwnActiveListingPhotoResult> {
  const trimmedListingId = listingId.trim().toLowerCase();
  const trimmedMediaId = mediaId.trim().toLowerCase();

  if (!isUuid(trimmedListingId) || !isUuid(trimmedMediaId)) {
    return {
      error: 'That photo could not be removed. Try again.',
      lastPhotoProtected: false,
      cleanupWarning: null,
    };
  }

  const owned = await loadOwnActiveListing(trimmedListingId);

  if (owned.error || !owned.detail) {
    return {
      error: owned.error ?? ACTIVE_LISTING_PHOTOS_ONLY,
      lastPhotoProtected: false,
      cleanupWarning: null,
    };
  }

  const deleted = await supabase.rpc(
    'delete_own_market_listing_media',
    {
      p_listing_id: owned.detail.listing.id,
      p_media_id: trimmedMediaId,
    },
  );

  if (deleted.error) {
    return {
      error: formatActivePhotoRpcError(
        deleted.error,
        'That photo could not be removed. Try again.',
      ),
      lastPhotoProtected: isLastPhotoProtectedError(deleted.error),
      cleanupWarning: null,
    };
  }

  const row = Array.isArray(deleted.data)
    ? parseDeletedActiveMediaRow(deleted.data[0])
    : parseDeletedActiveMediaRow(deleted.data);

  if (!row || row.listingId !== owned.detail.listing.id) {
    return {
      error: 'That photo could not be removed. Try again.',
      lastPhotoProtected: false,
      cleanupWarning: null,
    };
  }

  signedUrlCache.delete(row.storagePath);

  const objectRemoved = await deleteMarketListingMediaObject(
    row.storagePath,
  );

  if (!objectRemoved.confirmed) {
    return {
      error: null,
      lastPhotoProtected: false,
      cleanupWarning: ACTIVE_PHOTO_STORAGE_CLEANUP_WARNING,
    };
  }

  return {
    error: null,
    lastPhotoProtected: false,
    cleanupWarning: null,
  };
}

export async function reorderOwnActiveListingMedia(
  listingId: string,
  orderedMediaIds: readonly string[],
): Promise<{
  listing: OwnMarketListingDetail | null;
  error: string | null;
}> {
  const requested = orderedMediaIds.map((id) =>
    id.trim().toLowerCase(),
  );

  if (
    requested.length === 0 ||
    requested.length > MARKET_LISTING_MEDIA_MAX ||
    requested.some((id) => !isUuid(id))
  ) {
    return {
      listing: null,
      error: 'Photo order is not valid.',
    };
  }

  const uniqueRequested = new Set(requested);

  if (uniqueRequested.size !== requested.length) {
    return {
      listing: null,
      error: 'Photo order is not valid.',
    };
  }

  const owned = await loadOwnActiveListing(listingId);

  if (owned.error || !owned.detail) {
    return {
      listing: null,
      error: owned.error ?? ACTIVE_LISTING_PHOTOS_ONLY,
    };
  }

  const reordered = await supabase.rpc(
    'reorder_own_market_listing_media',
    {
      p_listing_id: owned.detail.listing.id,
      p_media_ids: requested,
    },
  );

  if (reordered.error) {
    return {
      listing: null,
      error: formatActivePhotoRpcError(
        reordered.error,
        "Couldn't save photo order. Please try again.",
      ),
    };
  }

  const refreshed = await getOwnMarketListing(owned.detail.listing.id);

  if (refreshed.error || !refreshed.listing) {
    return {
      listing: null,
      error:
        'Photo order was saved, but photos could not be reloaded. Close and reopen this listing.',
    };
  }

  if (!canManageOwnListingPhotos(refreshed.listing.listing.status)) {
    return {
      listing: null,
      error: ACTIVE_LISTING_PHOTOS_ONLY,
    };
  }

  return {
    listing: refreshed.listing,
    error: null,
  };
}

export async function publishOwnListing(
  listingId: string,
): Promise<{
  listingId: string | null;
  status: 'active' | null;
  error: string | null;
}> {
  const trimmed = listingId.trim().toLowerCase();

  if (!isUuid(trimmed)) {
    return {
      listingId: null,
      status: null,
      error: 'This listing could not be listed.',
    };
  }

  const auth = await requireUserId();

  if (!auth.ok) {
    return {
      listingId: null,
      status: null,
      error: auth.error,
    };
  }

  const published = await supabase.rpc(
    'publish_own_market_listing',
    {
      p_listing_id: trimmed,
    },
  );

  if (published.error) {
    return {
      listingId: null,
      status: null,
      error: formatPublishError(published.error),
    };
  }

  const row = Array.isArray(published.data)
    ? published.data[0]
    : published.data;

  if (
    !row ||
    typeof row !== 'object' ||
    typeof (row as { id?: unknown }).id !== 'string' ||
    (row as { status?: unknown }).status !== 'active'
  ) {
    return {
      listingId: null,
      status: null,
      error: 'This listing could not be listed. Try again.',
    };
  }

  return {
    listingId: (row as { id: string }).id,
    status: 'active',
    error: null,
  };
}

function parseLifecycleRpcStatus(
  data: unknown,
): { id: string; status: string } | null {
  const row = Array.isArray(data) ? data[0] : data;

  if (!row || typeof row !== 'object') {
    return null;
  }

  const parsed = row as {
    id?: unknown;
    status?: unknown;
  };

  if (
    typeof parsed.id !== 'string' ||
    typeof parsed.status !== 'string'
  ) {
    return null;
  }

  return {
    id: parsed.id,
    status: parsed.status,
  };
}

export async function pauseOwnMarketListing(
  listingId: string,
): Promise<{ error: string | null }> {
  const trimmed = listingId.trim().toLowerCase();

  if (!isUuid(trimmed)) {
    return { error: 'This listing could not be paused.' };
  }

  const auth = await requireUserId();

  if (!auth.ok) {
    return { error: auth.error };
  }

  const paused = await supabase.rpc('pause_own_market_listing', {
    p_listing_id: trimmed,
  });

  if (paused.error) {
    return {
      error: formatLifecycleError(
        paused.error,
        'This listing could not be paused.',
      ),
    };
  }

  const row = parseLifecycleRpcStatus(paused.data);

  if (!row || row.status !== 'paused') {
    return { error: 'This listing could not be paused. Try again.' };
  }

  return { error: null };
}

export async function reactivateOwnMarketListing(
  listingId: string,
): Promise<{ error: string | null }> {
  const trimmed = listingId.trim().toLowerCase();

  if (!isUuid(trimmed)) {
    return { error: 'This listing could not be listed again.' };
  }

  const auth = await requireUserId();

  if (!auth.ok) {
    return { error: auth.error };
  }

  const reactivated = await supabase.rpc(
    'reactivate_own_market_listing',
    {
      p_listing_id: trimmed,
    },
  );

  if (reactivated.error) {
    return {
      error: formatLifecycleError(
        reactivated.error,
        'This listing could not be listed again.',
      ),
    };
  }

  const row = parseLifecycleRpcStatus(reactivated.data);

  if (!row || row.status !== 'active') {
    return {
      error: 'This listing could not be listed again. Try again.',
    };
  }

  return { error: null };
}

export async function markOwnMarketListingSold(
  listingId: string,
): Promise<{ error: string | null }> {
  const trimmed = listingId.trim().toLowerCase();

  if (!isUuid(trimmed)) {
    return { error: 'This listing could not be marked as sold.' };
  }

  const auth = await requireUserId();

  if (!auth.ok) {
    return { error: auth.error };
  }

  const sold = await supabase.rpc('mark_own_market_listing_sold', {
    p_listing_id: trimmed,
  });

  if (sold.error) {
    return {
      error: formatLifecycleError(
        sold.error,
        'This listing could not be marked as sold.',
      ),
    };
  }

  const row = parseLifecycleRpcStatus(sold.data);

  if (!row || row.status !== 'sold') {
    return {
      error: 'This listing could not be marked as sold. Try again.',
    };
  }

  return { error: null };
}

export async function listActiveMarketListings(): Promise<{
  listings: ActiveMarketListingFeedItem[];
  error: string | null;
}> {
  const auth = await requireUserId();

  if (!auth.ok) {
    return {
      listings: [],
      error: auth.error,
    };
  }

  const loaded = await supabase
    .from('market_listings')
    .select(MARKET_LISTING_SELECT)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (loaded.error) {
    return {
      listings: [],
      error: formatMarketReadError(
        loaded.error,
        "Couldn't load listings.",
      ),
    };
  }

  const listings: MarketListingActive[] = [];

  for (const row of loaded.data ?? []) {
    if (!isMarketListingRow(row)) {
      continue;
    }

    const listing = adaptActiveRow(row);

    if (!listing) {
      continue;
    }

    listings.push(listing);
  }

  if (listings.length === 0) {
    return {
      listings: [],
      error: null,
    };
  }

  const listingIds = listings.map((listing) => listing.id);

  const mediaLoaded = await supabase
    .from('market_listing_media')
    .select(MARKET_LISTING_MEDIA_SELECT)
    .in('listing_id', listingIds)
    .order('listing_id', { ascending: true })
    .order('sort_order', { ascending: true });

  const mediaByListing = new Map<
    string,
    MarketListingMedia[]
  >();

  if (!mediaLoaded.error) {
    for (const row of mediaLoaded.data ?? []) {
      if (!isMarketListingMediaRow(row)) {
        continue;
      }

      const media = adaptMediaRow(row);

      if (!media) {
        continue;
      }

      const current = mediaByListing.get(media.listingId) ?? [];
      current.push(media);
      mediaByListing.set(media.listingId, current);
    }
  }

  const coverPaths: string[] = [];

  for (const listing of listings) {
    const media = mediaByListing.get(listing.id) ?? [];
    const cover = media[0];

    if (cover) {
      coverPaths.push(cover.storagePath);
    }
  }

  const signedCovers =
    coverPaths.length > 0
      ? await createListingMediaSignedUrls(coverPaths)
      : new Map<string, string>();

  return {
    listings: listings.map((listing) => {
      const media = mediaByListing.get(listing.id) ?? [];
      const cover = media[0] ?? null;
      const coverSignedUrl = cover
        ? signedCovers.get(cover.storagePath) ?? null
        : null;

      return {
        listing,
        photoCount: media.length,
        coverSignedUrl,
      };
    }),
    error: null,
  };
}

export async function getActiveMarketListing(
  listingId: string,
): Promise<{
  listing: MarketListingActive | null;
  error: string | null;
}> {
  const trimmed = listingId.trim().toLowerCase();

  if (!isUuid(trimmed)) {
    return {
      listing: null,
      error: "Couldn't load this listing.",
    };
  }

  const auth = await requireUserId();

  if (!auth.ok) {
    return {
      listing: null,
      error: auth.error,
    };
  }

  const loaded = await supabase
    .from('market_listings')
    .select(MARKET_LISTING_SELECT)
    .eq('id', trimmed)
    .eq('status', 'active')
    .maybeSingle();

  if (loaded.error) {
    return {
      listing: null,
      error: formatMarketReadError(
        loaded.error,
        "Couldn't load this listing.",
      ),
    };
  }

  if (!loaded.data || !isMarketListingRow(loaded.data)) {
    return {
      listing: null,
      error: "Couldn't load this listing.",
    };
  }

  const listing = adaptActiveRow(loaded.data);

  if (!listing) {
    return {
      listing: null,
      error: "Couldn't load this listing.",
    };
  }

  return {
    listing,
    error: null,
  };
}

export async function getActiveListingMedia(
  listingId: string,
): Promise<{
  media: MarketListingMediaPresentation[];
  error: string | null;
}> {
  const listingResult = await getActiveMarketListing(listingId);

  if (listingResult.error || !listingResult.listing) {
    return {
      media: [],
      error:
        listingResult.error ??
        "Couldn't load this listing.",
    };
  }

  const loaded = await supabase
    .from('market_listing_media')
    .select(MARKET_LISTING_MEDIA_SELECT)
    .eq('listing_id', listingResult.listing.id)
    .order('sort_order', { ascending: true });

  if (loaded.error) {
    return {
      media: [],
      error: null,
    };
  }

  const rows: MarketListingMedia[] = [];

  for (const row of loaded.data ?? []) {
    if (!isMarketListingMediaRow(row)) {
      continue;
    }

    const media = adaptMediaRow(row);

    if (!media || media.listingId !== listingResult.listing.id) {
      continue;
    }

    rows.push(media);
  }

  rows.sort((left, right) => left.sortOrder - right.sortOrder);

  const urls = await createListingMediaSignedUrls(
    rows.map((item) => item.storagePath),
  );

  const media: MarketListingMediaPresentation[] = [];

  for (const item of rows) {
    const signedUrl = urls.get(item.storagePath);

    if (!signedUrl) {
      continue;
    }

    media.push({
      ...item,
      signedUrl,
    });
  }

  return {
    media,
    error: null,
  };
}
