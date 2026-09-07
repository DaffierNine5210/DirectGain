import {
  REVIEW_BODY_MAX,
  REVIEW_BODY_MIN,
  type PublishedReview,
  type PublishedReviewRow,
  type ProfileReviewStats,
  type ReviewEligibility,
  type ReviewEligibilityRow,
  type ReviewStatsRow,
  type ReviewSubjectType,
} from '../../types/reviews';

export type SanitisedReviewBody =
  | {
      ok: true;
      body: string | null;
    }
  | {
      ok: false;
      error: string;
    };

export function sanitiseReviewBody(
  body: string,
): SanitisedReviewBody {
  const trimmed = body.trim();

  if (!trimmed) {
    return {
      ok: true,
      body: null,
    };
  }

  if (trimmed.length < REVIEW_BODY_MIN) {
    return {
      ok: false,
      error:
        'Written feedback needs at least 10 characters, or leave it blank.',
    };
  }

  if (trimmed.length > REVIEW_BODY_MAX) {
    return {
      ok: false,
      error:
        'Written feedback must be 500 characters or fewer.',
    };
  }

  return {
    ok: true,
    body: trimmed,
  };
}

export function isReviewSubjectType(
  value: string,
): value is ReviewSubjectType {
  return (
    value === 'job' ||
    value === 'market' ||
    value === 'auction'
  );
}

export function reviewContextLabel(
  subjectType: ReviewSubjectType,
): PublishedReview['contextLabel'] {
  if (subjectType === 'market') {
    return 'Market';
  }

  if (subjectType === 'auction') {
    return 'Auction';
  }

  return 'Job';
}

export function adaptReviewEligibilityRow(
  row: ReviewEligibilityRow,
): ReviewEligibility {
  return {
    id: row.id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    revieweeId: row.reviewee_id,
    createdAt: row.created_at,
  };
}

export function adaptPublishedReviewRow(
  row: PublishedReviewRow,
): PublishedReview {
  return {
    id: row.id,
    reviewerId: row.reviewer_id,
    rating: Number(row.rating),
    body: row.body,
    contextLabel: reviewContextLabel(
      row.subject_type,
    ),
    createdAt: row.created_at,
    editedAt: row.edited_at,
  };
}

export function adaptReviewStatsRow(
  row: ReviewStatsRow | null | undefined,
): ProfileReviewStats {
  if (!row) {
    return {
      reviewCount: 0,
      averageRating: null,
    };
  }

  const count = Number(row.review_count);
  const averageRaw = row.average_rating;
  const average =
    averageRaw == null || averageRaw === ''
      ? NaN
      : Number(averageRaw);

  return {
    reviewCount: Number.isFinite(count) ? count : 0,
    averageRating: Number.isFinite(average)
      ? average
      : null,
  };
}

export function isReviewEligibilityRow(
  value: unknown,
): value is ReviewEligibilityRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const row = value as Partial<ReviewEligibilityRow>;

  return (
    typeof row.id === 'string' &&
    typeof row.subject_type === 'string' &&
    isReviewSubjectType(row.subject_type) &&
    typeof row.subject_id === 'string' &&
    typeof row.reviewer_id === 'string' &&
    typeof row.reviewee_id === 'string' &&
    typeof row.created_at === 'string' &&
    (row.review_id === null ||
      typeof row.review_id === 'string')
  );
}

export function isPublishedReviewRow(
  value: unknown,
): value is PublishedReviewRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const row = value as Partial<PublishedReviewRow> & {
    rating?: unknown;
  };
  const rating = Number(row.rating);

  return (
    typeof row.id === 'string' &&
    typeof row.reviewer_id === 'string' &&
    Number.isInteger(rating) &&
    rating >= 1 &&
    rating <= 5 &&
    (row.body === null || typeof row.body === 'string') &&
    typeof row.subject_type === 'string' &&
    isReviewSubjectType(row.subject_type) &&
    typeof row.created_at === 'string' &&
    (row.edited_at === null ||
      typeof row.edited_at === 'string')
  );
}
