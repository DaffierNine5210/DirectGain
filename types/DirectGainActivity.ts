export type DirectGainActivityType =
  | 'post-created'
  | 'listing-created'
  | 'listing-sold'
  | 'job-created'
  | 'job-completed'
  | 'auction-created'
  | 'auction-won'
  | 'review-received'
  | 'gain-score-changed'
  | 'verification-earned'
  | 'followed-user';

export type DirectGainActivityVisibility =
  | 'public'
  | 'followers'
  | 'private';

export type DirectGainActivity = {
  id: string;

  // Who this activity belongs to
  userId: string;

  // What happened
  type: DirectGainActivityType;

  // Optional linked content
  postId?: string;
  listingId?: string;
  jobId?: string;
  auctionId?: string;
  reviewId?: string;

  // Optional linked person
  relatedUserId?: string;

  // Display copy
  title: string;
  description?: string;

  // Optional values
  amount?: number;
  gainScoreBefore?: number;
  gainScoreAfter?: number;

  // Privacy
  visibility: DirectGainActivityVisibility;

  // Timing
  createdAt: string;
};