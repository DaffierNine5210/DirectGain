export const REVIEW_BODY_MIN = 10;
export const REVIEW_BODY_MAX = 500;

export type ReviewSubjectType =
  | 'job'
  | 'market'
  | 'auction';

export type ReviewStatus =
  | 'published'
  | 'hidden'
  | 'removed';

export type ReviewEligibilityRow = {
  id: string;
  subject_type: ReviewSubjectType;
  subject_id: string;
  reviewer_id: string;
  reviewee_id: string;
  created_at: string;
  review_id: string | null;
};

export type ReviewEligibility = {
  id: string;
  subjectType: ReviewSubjectType;
  subjectId: string;
  revieweeId: string;
  createdAt: string;
};

export type PublishedReviewRow = {
  id: string;
  reviewer_id: string;
  rating: number;
  body: string | null;
  subject_type: ReviewSubjectType;
  created_at: string;
  edited_at: string | null;
};

export type PublishedReview = {
  id: string;
  reviewerId: string;
  rating: number;
  body: string | null;
  contextLabel: 'Job' | 'Market' | 'Auction';
  createdAt: string;
  editedAt: string | null;
};

export type ReviewStatsRow = {
  review_count: number;
  average_rating: number | string | null;
};

export type ProfileReviewStats = {
  reviewCount: number;
  averageRating: number | null;
};

export type ConfirmJobCompletionRow = {
  job_id: string;
  job_status: string;
  poster_confirmed: boolean;
  worker_confirmed: boolean;
};

export type JobCompletionConfirmationRow = {
  confirmer_id: string;
};

export type JobCompletionRole =
  | 'poster'
  | 'worker';

export type JobCompletionView = {
  role: JobCompletionRole;
  currentUserConfirmed: boolean;
  otherPartyConfirmed: boolean;
  bothConfirmed: boolean;
  jobCompleted: boolean;
};
