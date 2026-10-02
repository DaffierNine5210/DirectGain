export type MarketOfferLifecycleStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'withdrawn';

export type MarketOfferRole =
  | 'buyer'
  | 'seller';

/**
 * Authoritative Market Offers v1 row (Migration 027).
 * Interactive statuses are pending / accepted / declined / withdrawn only.
 */
export type MarketOfferRecord = {
  id: string;
  conversationId: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: 'AUD';
  status: MarketOfferLifecycleStatus;
  createdByRole: MarketOfferRole | null;
  message: string | null;
  parentOfferId: string | null;
  createdAt: string;
  respondedAt: string | null;
  updatedAt: string | null;
};
