export type DealAgreementStatus =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'declined'
  | 'cancelled'
  | 'completed';

export type DealTransactionMethod =
  | 'meetup'
  | 'pickup'
  | 'delivery'
  | 'other';

export type DealParticipantConfirmation = {
  userId: string;

  confirmed: boolean;

  confirmedAt?: string;
};

export type DealAgreement = {
  id: string;

  conversationId: string;

  listingId: string;

  buyerId: string;

  sellerId: string;

  agreedPrice: number;

  currency: 'AUD';

  transactionMethod: DealTransactionMethod;

  locationName: string;

  scheduledAt: string;

  notes?: string;

  status: DealAgreementStatus;

  buyerConfirmation:
    DealParticipantConfirmation;

  sellerConfirmation:
    DealParticipantConfirmation;

  createdAt: string;

  updatedAt: string;

  completedAt?: string;
};