import type {
  ImageSourcePropType,
} from 'react-native';

import {
  listings,
} from './listings';

export type ListingType =
  'sale';

export interface MarketListing {
  id: string;

  listingType: ListingType;

  title: string;

  description: string;

  price: number;

  currency: string;

  category: string;

  subcategory: string;

  sellerId: string;

  sellerName: string;

  sellerVerified: boolean;

  sellerGainScore: number;

  rating: number;

  reviewCount: number;

  location: string;

  distance: string;

  listedTime: string;

  favourite: boolean;

  image: ImageSourcePropType;

  imageCount: number;

  auctionLabel?: string;
}

export const marketListings:
  MarketListing[] =
  listings.map(listing => ({
    id: listing.id,

    listingType: 'sale',

    title:
      listing.title,

    description:
      listing.description,

    price:
      listing.price,

    currency:
      listing.currency,

    category:
      listing.category,

    subcategory:
      listing.subcategory,

    sellerId:
      listing.seller.id,

    sellerName:
      listing.seller.name,

    sellerVerified:
      listing.seller.verification
        .length > 0,

    sellerGainScore:
      listing.seller.gainScore,

    rating:
      listing.seller.rating,

    reviewCount:
      listing.seller.reviewCount,

    location:
      `${listing.location.suburb}, ${listing.location.state}`,

    distance:
      listing.location.distanceKm !==
      undefined
        ? `${listing.location.distanceKm} km`
        : '',

    listedTime:
      listing.createdAt,

    favourite:
      listing.isFavourite,

    image:
      listing.images[0] ??
      require('../assets/icon.png'),

    imageCount:
      listing.images.length,
  }));