import { supabase } from '../../lib/supabase';

import {
  adaptPublishedReviewRow,
  adaptReviewEligibilityRow,
  adaptReviewStatsRow,
  isPublishedReviewRow,
  isReviewEligibilityRow,
} from './reviewAdapter';

import { getProfilesByIds } from '../profile/profileRepository';

import type { DirectGainProfile } from '../../types/profile';
import type {
  ProfileReviewStats,
  PublishedReview,
  ReviewEligibility,
} from '../../types/reviews';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.toLowerCase());
}

function formatReviewError(
  error: {
    message?: string;
  } | null,
  fallback: string,
): string {
  if (!error?.message) {
    return fallback;
  }

  const message = error.message.toLowerCase();

  if (
    message.includes('row-level security') ||
    message.includes('permission')
  ) {
    return 'You do not have permission to view this.';
  }

  if (message.includes('signed in')) {
    return 'Sign in to continue.';
  }

  return fallback;
}

function formatSubmitReviewError(
  error: {
    message?: string;
  } | null,
): string {
  if (!error?.message) {
    return 'Your review could not be saved. Try again.';
  }

  const message = error.message.toLowerCase();

  if (message.includes('signed in')) {
    return 'Sign in to leave a review.';
  }

  if (
    message.includes('eligibility') ||
    message.includes('belongs to you')
  ) {
    return 'This review is no longer available.';
  }

  if (
    message.includes('rating') ||
    message.includes('1 to 5')
  ) {
    return 'Choose a rating from 1 to 5.';
  }

  if (
    message.includes('10 and 500') ||
    message.includes('10 to 500') ||
    message.includes('characters')
  ) {
    return 'Keep written feedback between 10 and 500 characters, or leave it empty.';
  }

  if (
    message.includes('row-level security') ||
    message.includes('permission')
  ) {
    return 'You do not have permission to leave this review.';
  }

  return 'Your review could not be saved. Try again.';
}

export async function listMyOpenReviewEligibilities(): Promise<{
  eligibilities: ReviewEligibility[];
  error: string | null;
}> {
  const result = await supabase
    .from('review_eligibilities')
    .select(
      'id, subject_type, subject_id, reviewer_id, reviewee_id, created_at, review_id',
    )
    .is('review_id', null)
    .order('created_at', {
      ascending: false,
    });

  if (result.error) {
    return {
      eligibilities: [],
      error: formatReviewError(
        result.error,
        'Review opportunities could not be loaded. Try again.',
      ),
    };
  }

  const eligibilities = (result.data ?? [])
    .filter(isReviewEligibilityRow)
    .filter(row => row.review_id == null)
    .map(adaptReviewEligibilityRow);

  return {
    eligibilities,
    error: null,
  };
}

export async function getOpenJobReviewEligibility(
  jobId: string,
): Promise<{
  eligibility: ReviewEligibility | null;
  error: string | null;
}> {
  const id = jobId.trim().toLowerCase();

  if (!isUuid(id)) {
    return {
      eligibility: null,
      error: null,
    };
  }

  const listed = await listMyOpenReviewEligibilities();

  if (listed.error) {
    return {
      eligibility: null,
      error: listed.error,
    };
  }

  const eligibility =
    listed.eligibilities.find(
      item =>
        item.subjectType === 'job' &&
        item.subjectId.toLowerCase() === id,
    ) ?? null;

  return {
    eligibility,
    error: null,
  };
}

export async function getPublishedReviewsForProfile(
  profileId: string,
): Promise<{
  reviews: PublishedReview[];
  error: string | null;
}> {
  const id = profileId.trim().toLowerCase();

  if (!isUuid(id)) {
    return {
      reviews: [],
      error: 'This profile could not be found.',
    };
  }

  const result = await supabase.rpc(
    'get_profile_reviews',
    {
      p_reviewee_id: id,
    },
  );

  if (result.error) {
    return {
      reviews: [],
      error: formatReviewError(
        result.error,
        'Reviews could not be loaded. Try again.',
      ),
    };
  }

  const reviews = (result.data ?? [])
    .filter(isPublishedReviewRow)
    .map(adaptPublishedReviewRow);

  return {
    reviews,
    error: null,
  };
}

export async function getProfileReviewStats(
  profileId: string,
): Promise<{
  stats: ProfileReviewStats;
  error: string | null;
}> {
  const id = profileId.trim().toLowerCase();

  if (!isUuid(id)) {
    return {
      stats: {
        reviewCount: 0,
        averageRating: null,
      },
      error: 'This profile could not be found.',
    };
  }

  const result = await supabase.rpc(
    'get_profile_review_stats',
    {
      p_reviewee_id: id,
    },
  );

  if (result.error) {
    return {
      stats: {
        reviewCount: 0,
        averageRating: null,
      },
      error: formatReviewError(
        result.error,
        'Review summary could not be loaded. Try again.',
      ),
    };
  }

  const row = Array.isArray(result.data)
    ? result.data[0]
    : result.data;

  if (!row || typeof row !== 'object') {
    return {
      stats: {
        reviewCount: 0,
        averageRating: null,
      },
      error: null,
    };
  }

  const statsRow = row as {
    review_count?: unknown;
    average_rating?: unknown;
  };

  return {
    stats: adaptReviewStatsRow({
      review_count:
        typeof statsRow.review_count === 'number'
          ? statsRow.review_count
          : Number(statsRow.review_count ?? 0),
      average_rating:
        typeof statsRow.average_rating === 'number' ||
        typeof statsRow.average_rating === 'string' ||
        statsRow.average_rating === null
          ? statsRow.average_rating
          : null,
    }),
    error: null,
  };
}

export async function submitReview(input: {
  eligibilityId: string;
  rating: number;
  body?: string | null;
}): Promise<{
  reviewId: string | null;
  error: string | null;
}> {
  const eligibilityId =
    input.eligibilityId.trim().toLowerCase();

  if (!isUuid(eligibilityId)) {
    return {
      reviewId: null,
      error: 'This review could not be submitted.',
    };
  }

  const result = await supabase.rpc(
    'submit_review',
    {
      p_eligibility_id: eligibilityId,
      p_rating: input.rating,
      p_body: input.body ?? null,
    },
  );

  if (result.error || typeof result.data !== 'string') {
    return {
      reviewId: null,
      error: formatSubmitReviewError(result.error),
    };
  }

  return {
    reviewId: result.data,
    error: null,
  };
}

export async function editReview(input: {
  reviewId: string;
  rating: number;
  body?: string | null;
}): Promise<{
  reviewId: string | null;
  error: string | null;
}> {
  const reviewId = input.reviewId.trim().toLowerCase();

  if (!isUuid(reviewId)) {
    return {
      reviewId: null,
      error: 'This review could not be updated.',
    };
  }

  const result = await supabase.rpc(
    'edit_review',
    {
      p_review_id: reviewId,
      p_rating: input.rating,
      p_body: input.body ?? null,
    },
  );

  if (result.error || typeof result.data !== 'string') {
    return {
      reviewId: null,
      error: formatReviewError(
        result.error,
        'Your review could not be updated. Try again.',
      ),
    };
  }

  return {
    reviewId: result.data,
    error: null,
  };
}

export async function loadProfileReputation(
  profileId: string,
): Promise<{
  stats: ProfileReviewStats;
  statsError: string | null;
  reviews: PublishedReview[];
  reviewsError: string | null;
  reviewersById: Map<string, DirectGainProfile>;
}> {
  const emptyStats: ProfileReviewStats = {
    reviewCount: 0,
    averageRating: null,
  };

  const [
    statsResult,
    reviewsResult,
  ] = await Promise.all([
    getProfileReviewStats(profileId),
    getPublishedReviewsForProfile(profileId),
  ]);

  const reviewersById =
    new Map<string, DirectGainProfile>();

  if (
    !reviewsResult.error &&
    reviewsResult.reviews.length > 0
  ) {
    const reviewerIds = reviewsResult.reviews.map(
      review => review.reviewerId,
    );
    const profilesResult =
      await getProfilesByIds(reviewerIds);

    for (const profile of profilesResult.profiles) {
      reviewersById.set(
        profile.id.toLowerCase(),
        profile,
      );
    }
  }

  return {
    stats: statsResult.error
      ? emptyStats
      : statsResult.stats,
    statsError: statsResult.error,
    reviews: reviewsResult.error
      ? []
      : reviewsResult.reviews,
    reviewsError: reviewsResult.error,
    reviewersById,
  };
}
