import type {
  ImageSourcePropType,
} from 'react-native';

export type ListingCategory =
  | 'Vehicles'
  | 'Property'
  | 'Electronics'
  | 'Furniture'
  | 'Clothing'
  | 'Tools'
  | 'Antiques'
  | 'Collectables'
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

export type VehicleDetails = {
  year: number;

  make: string;

  model: string;

  variant?: string;

  bodyType?: string;

  kilometres?: number;

  transmission?: string;

  fuelType?: string;

  drivetrain?: string;

  engine?: string;

  colour?: string;

  registration?: string;

  modifications?: string[];
};

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

  description: string;

  price: number;

  currency: 'AUD';

  images: ImageSourcePropType[];

  category: ListingCategory;

  subcategory: string;

  condition: ListingCondition;

  location: ListingLocation;

  seller: ListingSeller;

  createdAt: string;

  isFavourite: boolean;

  allowsOffers: boolean;

  deliveryAvailable: boolean;

  pickupAvailable: boolean;

  vehicleDetails?: VehicleDetails;
};