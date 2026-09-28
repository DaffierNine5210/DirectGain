import type { ImageSourcePropType } from 'react-native';

import formatListingPrice from '../../utils/listing/formatListingPrice';

import type {
  MarketListingActive,
  MarketListingDraft,
  MarketListingMediaPresentation,
} from '../../types/marketListing';

export type ListingPreviewSellerPresentation = {
  displayName: string;
  avatarUrl: string | null;
  identityVerified: boolean;
};

export type ListingPreviewPresentation = {
  listingId: string;
  title: string;
  description: string;
  formattedPrice: string;
  suburb: string;
  state: string;
  listedOn: string;
  createdAt: string;
  category: string;
  subcategory: string;
  condition: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  allowsOffers: boolean;
  images: ImageSourcePropType[];
  photoCount: number;
  seller: ListingPreviewSellerPresentation;
};

export function formatListingCreatedOn(iso: string): string {
  const parsed = Date.parse(iso);

  if (!Number.isFinite(parsed)) {
    return 'Listed date unavailable';
  }

  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(parsed));
}

export function toListingPreviewPresentation(input: {
  listing: MarketListingDraft | MarketListingActive;
  media: MarketListingMediaPresentation[];
  seller: ListingPreviewSellerPresentation;
}): ListingPreviewPresentation {
  const ordered = [...input.media].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );

  return {
    listingId: input.listing.id,
    title: input.listing.title,
    description: input.listing.description,
    formattedPrice: formatListingPrice(
      input.listing.price,
      input.listing.currency,
    ),
    suburb: input.listing.suburb,
    state: input.listing.state,
    listedOn: formatListingCreatedOn(input.listing.createdAt),
    createdAt: input.listing.createdAt,
    category: input.listing.category,
    subcategory: input.listing.subcategory,
    condition: input.listing.condition,
    pickupAvailable: input.listing.pickupAvailable,
    deliveryAvailable: input.listing.deliveryAvailable,
    allowsOffers: input.listing.allowsOffers,
    images: ordered.map((photo) => ({
      uri: photo.signedUrl,
    })),
    photoCount: ordered.length,
    seller: input.seller,
  };
}
