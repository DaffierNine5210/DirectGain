export const MARKET_LISTING_CATEGORIES = [
  'Vehicles',
  'Property',
  'Electronics',
  'Furniture',
  'Clothing',
  'Tools',
  'Antiques',
  'Collectables',
  'Other',
] as const;

export type MarketListingCategory =
  (typeof MARKET_LISTING_CATEGORIES)[number];

export const MARKET_LISTING_CONDITIONS = [
  'New',
  'Like new',
  'Excellent',
  'Good',
  'Fair',
] as const;

export type MarketListingCondition =
  (typeof MARKET_LISTING_CONDITIONS)[number];

export const MARKET_LISTING_CURRENCY = 'AUD' as const;

export type MarketListingCurrency =
  typeof MARKET_LISTING_CURRENCY;

export type MarketListingDraftStatus = 'draft';

export type MarketListingActiveStatus = 'active';

export const MARKET_LISTING_STATUSES = [
  'draft',
  'active',
  'reserved',
  'sold',
  'removed',
] as const;

export type MarketListingStatus =
  (typeof MARKET_LISTING_STATUSES)[number];

type MarketListingCore = {
  id: string;
  sellerProfileId: string;
  title: string;
  description: string;
  price: number;
  currency: MarketListingCurrency;
  category: MarketListingCategory;
  subcategory: string;
  condition: MarketListingCondition;
  allowsOffers: boolean;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  suburb: string;
  state: string;
  createdAt: string;
  updatedAt: string;
};

export type MarketListingDraft = MarketListingCore & {
  status: MarketListingDraftStatus;
};

export type MarketListingActive = MarketListingCore & {
  status: MarketListingActiveStatus;
};

export type OwnMarketListing = MarketListingCore & {
  status: MarketListingStatus;
};

export type ActiveMarketListingFeedItem = {
  listing: MarketListingActive;
  photoCount: number;
  coverSignedUrl: string | null;
};

export type OwnMarketListingFeedItem = {
  listing: OwnMarketListing;
  photoCount: number;
  coverSignedUrl: string | null;
};

export type OwnMarketListingDetail = {
  listing: OwnMarketListing;
  media: MarketListingMediaPresentation[];
};

export type DeleteOwnActiveListingPhotoResult = {
  error: string | null;
  lastPhotoProtected: boolean;
  cleanupWarning: string | null;
};

export type CreateMarketListingDraftInput = {
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

export type UpdateMarketListingDraftInput =
  CreateMarketListingDraftInput;

export type ViewerListingRegion = {
  suburb: string | null;
  state: string | null;
};

export const MARKET_LISTING_MEDIA_MAX = 20;

export const MARKET_LISTING_MEDIA_MAX_BYTES = 2 * 1024 * 1024;

export const MARKET_LISTING_MEDIA_BUCKET = 'market-listing-media';

export type MarketListingPendingPhoto = {
  localId: string;
  uri: string;
  byteSize: number;
};

export type MarketListingMedia = {
  id: string;
  listingId: string;
  storagePath: string;
  sortOrder: number;
  createdAt: string;
};

export type MarketListingMediaPresentation = MarketListingMedia & {
  signedUrl: string;
};
