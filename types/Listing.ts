import type { ImageSourcePropType } from 'react-native';

export type ListingCategory =
  | 'Vehicles'
  | 'Property'
  | 'Electronics'
  | 'Home'
  | 'Fashion'
  | 'Tools'
  | 'Collectibles'
  | 'Other';

export type ListingCondition =
  | 'New'
  | 'Like new'
  | 'Excellent'
  | 'Good'
  | 'Fair';

export type VerificationType =
  | 'identity'
  | 'business'
  | 'professional'
  | 'community';

export type ListingSeller = {
  id: string;
  name: string;
  profileImage?: ImageSourcePropType;
  gainScore: number;
  rating: number;
  reviewCount: number;
  responseTime: string;
  completedSales: number;
  memberSince: number;
  verification: VerificationType[];
};

export type ListingLocation = {
  suburb: string;
  state: string;
  distanceKm?: number;
  latitude?: number;
  longitude?: number;
};

export type Listing = {
  id: string;
  title: string;
  price: number;
  currency: 'AUD';
  images: ImageSourcePropType[];
  category: ListingCategory;
  condition: ListingCondition;
  description: string;
  location: ListingLocation;
  seller: ListingSeller;
  createdAt: string;
  isFavourite: boolean;
  allowsOffers: boolean;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  opportunityScore?: number;
};