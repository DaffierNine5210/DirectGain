export type DirectGainListingCondition =
  | 'new'
  | 'like-new'
  | 'excellent'
  | 'good'
  | 'fair';

export type DirectGainListingStatus =
  | 'draft'
  | 'active'
  | 'reserved'
  | 'sold'
  | 'removed';

export type DirectGainListingDelivery =
  | 'pickup'
  | 'delivery'
  | 'shipping';

export type DirectGainListing = {
  id: string;

  // Ownership
  sellerId: string;

  // Listing information
  title: string;
  description: string;
  category: string;
  price: number;
  condition: DirectGainListingCondition;

  // Location
  suburb: string;
  state: string;

  // Listing state
  status: DirectGainListingStatus;

  // Fulfilment options
  deliveryOptions: DirectGainListingDelivery[];

  // Media
  imageUris: string[];

  // Engagement
  viewCount: number;
  saveCount: number;

  // Current user's interaction
  isSaved: boolean;

  // Timing
  createdAt: string;
  updatedAt: string;
};