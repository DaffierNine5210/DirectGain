export type MarketOfferStatus =
  | 'pending'
  | 'accepted'
  | 'countered'
  | 'declined'
  | 'withdrawn'
  | 'expired';

export type MarketOfferRole =
  | 'buyer'
  | 'seller';

export type MarketOffer = {
  id: string;

  conversationId: string;

  listingId: string;

  buyerId: string;

  sellerId: string;

  amount: number;

  currency: 'AUD';

  status: MarketOfferStatus;

  createdBy:
    MarketOfferRole;

  message?: string;

  parentOfferId?: string;

  createdAt: string;

  updatedAt: string;

  respondedAt?: string;
};