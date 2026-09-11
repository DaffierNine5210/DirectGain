import {
  formatAccountTypeLabel,
  formatProfileLocation,
  optionalProfileText,
} from '../../services/profile/profileAdapter';

import type { DirectGainProfile } from '../../types/profile';
import type { PublishedReview } from '../../types/reviews';

export type ProfileHeroMode = 'owner' | 'public';

export type ProfileHeroIdentity = {
  displayName: string;
  accountTypeLabel: string;
  location: string | null;
  bio: string | null;
  hasStoredPhoto: boolean;
};

export type ProfileAboutContent = {
  bio: string | null;
  accountTypeLabel: string;
  location: string | null;
};

export type PresentedProfileReview = {
  cardKey: string;
  reviewerProfileId: string;
  reviewerDisplayName: string;
  reviewerAvatarPath: string | null;
  rating: number;
  body: string | null;
  contextLabel: PublishedReview['contextLabel'];
  dateLabel: string;
  edited: boolean;
};

export function formatReviewDateLabel(
  isoDate: string,
  now = Date.now(),
): string {
  const then = Date.parse(isoDate);

  if (!Number.isFinite(then)) {
    return '';
  }

  const nowDate = new Date(now);
  const thenDate = new Date(then);
  const startOfToday = Date.UTC(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate(),
  );
  const startOfThen = Date.UTC(
    thenDate.getFullYear(),
    thenDate.getMonth(),
    thenDate.getDate(),
  );
  const dayDiff = Math.round(
    (startOfToday - startOfThen) / 86400000,
  );

  if (dayDiff <= 0) {
    return 'Today';
  }

  if (dayDiff === 1) {
    return 'Yesterday';
  }

  return thenDate.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatReviewAverageLabel(
  averageRating: number,
): string {
  const rounded = Math.round(averageRating * 10) / 10;

  if (!Number.isFinite(rounded)) {
    return '';
  }

  return rounded.toFixed(1);
}

export function formatReviewCountLabel(
  reviewCount: number,
): string {
  if (reviewCount === 1) {
    return '1 review';
  }

  return `${reviewCount} reviews`;
}

export function presentProfileReviewCards(
  reviews: PublishedReview[],
  profilesById: Map<string, DirectGainProfile>,
): PresentedProfileReview[] {
  return reviews.map(review => {
    const reviewerId = review.reviewerId.toLowerCase();
    const profile = profilesById.get(reviewerId);

    return {
      cardKey: review.id,
      reviewerProfileId: reviewerId,
      reviewerDisplayName:
        profile?.displayName ?? 'Direct Gain member',
      reviewerAvatarPath: profile?.avatarPath ?? null,
      rating: review.rating,
      body: review.body,
      contextLabel: review.contextLabel,
      dateLabel: formatReviewDateLabel(review.createdAt),
      edited: Boolean(review.editedAt),
    };
  });
}

export function presentProfileHeroIdentity(
  profile: DirectGainProfile,
): ProfileHeroIdentity {
  return {
    displayName: profile.displayName,
    accountTypeLabel: formatAccountTypeLabel(
      profile.accountType,
    ),
    location: formatProfileLocation(
      profile.suburb,
      profile.state,
    ),
    bio: optionalProfileText(profile.bio),
    hasStoredPhoto: Boolean(profile.avatarPath),
  };
}

export function presentProfileAbout(
  profile: DirectGainProfile,
): ProfileAboutContent {
  return {
    bio: optionalProfileText(profile.bio),
    accountTypeLabel: formatAccountTypeLabel(
      profile.accountType,
    ),
    location: formatProfileLocation(
      profile.suburb,
      profile.state,
    ),
  };
}
