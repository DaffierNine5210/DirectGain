import type { ImageSourcePropType } from 'react-native';

import formatListingPrice from '../../utils/listing/formatListingPrice';

import type { ActiveMarketListingFeedItem } from '../../types/marketListing';

import { formatListingCreatedOn } from './listingPreviewPresentation';

export type MarketFeedCardPresentation = {
  id: string;
  title: string;
  price: string;
  image: ImageSourcePropType | undefined;
  imageCount: number;
  category: string;
  location: string;
  listedTime: string;
};

export function formatViewerRegionLabel(input: {
  suburb: string | null;
  state: string | null;
}): string {
  const suburb = input.suburb?.trim() ?? '';
  const state = input.state?.trim() ?? '';

  if (suburb && state) {
    return `${suburb}, ${state}`;
  }

  if (suburb) {
    return suburb;
  }

  if (state) {
    return state;
  }

  return 'Your area';
}

export function toMarketFeedCard(
  item: ActiveMarketListingFeedItem,
): MarketFeedCardPresentation {
  const listing = item.listing;
  const cover = item.coverSignedUrl?.trim() ?? '';

  return {
    id: listing.id,
    title: listing.title,
    price: formatListingPrice(
      listing.price,
      listing.currency,
    ),
    image: cover ? { uri: cover } : undefined,
    imageCount: item.photoCount,
    category: listing.category,
    location: `${listing.suburb}, ${listing.state}`,
    listedTime: formatListingCreatedOn(listing.createdAt),
  };
}

export function listingMatchesMarketSearch(
  card: MarketFeedCardPresentation,
  query: string,
  item: ActiveMarketListingFeedItem,
): boolean {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return (
    card.title.toLowerCase().includes(normalized) ||
    item.listing.category.toLowerCase().includes(normalized) ||
    item.listing.subcategory.toLowerCase().includes(normalized) ||
    item.listing.suburb.toLowerCase().includes(normalized) ||
    item.listing.state.toLowerCase().includes(normalized)
  );
}
