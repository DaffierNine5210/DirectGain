export type DirectGainAuctionStatus =
  | 'draft'
  | 'scheduled'
  | 'live'
  | 'ended'
  | 'cancelled';

export type DirectGainAuctionBid = {
  id: string;

  bidderId: string;

  amount: number;

  createdAt: string;
};

export type DirectGainAuction = {
  id: string;

  // Ownership
  sellerId: string;

  // Auction information
  title: string;
  description: string;
  category: string;

  // Pricing
  startingBid: number;
  currentBid: number;
  reservePrice?: number;
  buyNowPrice?: number;

  // Location
  suburb: string;
  state: string;

  // Auction state
  status: DirectGainAuctionStatus;

  // Media
  imageUris: string[];

  // Bidding
  bids: DirectGainAuctionBid[];
  bidCount: number;

  highestBidderId?: string;
  winnerId?: string;

  // Engagement
  viewCount: number;
  watcherCount: number;

  // Current user's interaction
  isWatching: boolean;

  // Timing
  createdAt: string;
  updatedAt: string;

  startsAt: string;
  endsAt: string;
};