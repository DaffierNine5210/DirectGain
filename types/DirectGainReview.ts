export type DirectGainReviewContext =
  | 'market'
  | 'job'
  | 'auction';

export type DirectGainReviewStatus =
  | 'published'
  | 'pending'
  | 'reported'
  | 'removed';

export type DirectGainReview = {
  id: string;

  // People involved
  reviewerId: string;
  recipientId: string;

  // What created the review
  context: DirectGainReviewContext;

  listingId?: string;
  jobId?: string;
  auctionId?: string;

  // Review content
  rating: number;
  comment?: string;

  // Trust signals
  verifiedInteraction: boolean;

  // Review state
  status: DirectGainReviewStatus;

  // Optional response from the reviewed user
  response?: {
    text: string;
    createdAt: string;
  };

  // Engagement
  helpfulCount: number;
  isMarkedHelpful: boolean;

  // Timing
  createdAt: string;
  updatedAt: string;
};