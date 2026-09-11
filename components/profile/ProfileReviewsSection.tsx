import { StyleSheet, Text, View } from 'react-native';

import DGButton from '../DGButton';
import DGSkeleton from '../DGSkeleton';
import StarRatingDisplay from '../reviews/StarRatingDisplay';
import ProfileReviewCard from './ProfileReviewCard';
import ProfileSectionEmptyState from './ProfileSectionEmptyState';

import {
  formatReviewAverageLabel,
  formatReviewCountLabel,
} from './profilePresentation';
import type { PresentedProfileReview } from './profilePresentation';
import type { ProfileHeroMode } from './profilePresentation';

import type { ProfileReviewStats } from '../../types/reviews';

import {
  alpha,
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

type ProfileReviewsSectionProps = {
  mode: ProfileHeroMode;
  loading: boolean;
  error: string | null;
  reviews: PresentedProfileReview[];
  stats: ProfileReviewStats | null;
  statsError: string | null;
  statsLoading: boolean;
  onRetry: () => void;
  onPressReviewer: (profileId: string) => void;
};

function CompactReviewSummary({
  stats,
  statsError,
  statsLoading,
  onRetry,
}: {
  stats: ProfileReviewStats | null;
  statsError: string | null;
  statsLoading: boolean;
  onRetry: () => void;
}) {
  if (statsLoading) {
    return (
      <View style={styles.summaryRow}>
        <DGSkeleton width={36} height={18} />
        <DGSkeleton width={88} height={12} />
        <DGSkeleton width={64} height={12} />
      </View>
    );
  }

  if (statsError) {
    return (
      <View style={styles.summaryError}>
        <Text style={styles.summaryErrorText}>
          Couldn't load review summary.
        </Text>
        <DGButton
          title="Retry"
          variant="secondary"
          size="small"
          onPress={onRetry}
          accessibilityLabel="Retry loading review summary"
        />
      </View>
    );
  }

  const reviewCount = stats?.reviewCount ?? 0;
  const average = stats?.averageRating;
  const hasReviews =
    reviewCount > 0 &&
    average != null &&
    Number.isFinite(average);

  if (!hasReviews) {
    return null;
  }

  const averageLabel = formatReviewAverageLabel(average);
  const countLabel = formatReviewCountLabel(reviewCount);

  return (
    <View
      style={styles.summaryRow}
      accessibilityLabel={`${averageLabel} average from ${countLabel}`}
    >
      <Text style={styles.average}>{averageLabel}</Text>
      <View
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        <StarRatingDisplay
          rating={average}
          size="sm"
        />
      </View>
      <Text style={styles.count}>{countLabel}</Text>
    </View>
  );
}

export default function ProfileReviewsSection({
  mode,
  loading,
  error,
  reviews,
  stats,
  statsError,
  statsLoading,
  onRetry,
  onPressReviewer,
}: ProfileReviewsSectionProps) {
  if (loading) {
    return (
      <View style={styles.list}>
        <View style={styles.summaryRow}>
          <DGSkeleton width={36} height={18} />
          <DGSkeleton width={88} height={12} />
          <DGSkeleton width={64} height={12} />
        </View>
        <View style={styles.skeletonCard}>
          <DGSkeleton width={36} height={36} borderRadius={18} />
          <DGSkeleton width="48%" height={12} />
          <DGSkeleton width="88%" height={12} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorCard}>
        <Text style={styles.errorTitle}>
          Couldn't load reviews.
        </Text>
        <Text style={styles.errorBody}>
          {error}
        </Text>
        <DGButton
          title="Retry"
          variant="secondary"
          fullWidth
          onPress={onRetry}
          accessibilityLabel="Retry loading reviews"
        />
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <ProfileSectionEmptyState
        icon="star-outline"
        title="No reviews yet"
        body={
          mode === 'owner'
            ? 'Reviews from completed Direct Gain activity will appear here.'
            : undefined
        }
      />
    );
  }

  return (
    <View style={styles.list}>
      <CompactReviewSummary
        stats={stats}
        statsError={statsError}
        statsLoading={statsLoading}
        onRetry={onRetry}
      />
      {reviews.map(review => (
        <ProfileReviewCard
          key={review.cardKey}
          review={review}
          onPressReviewer={onPressReviewer}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.xxs,
  },

  average: {
    color: palette.opportunityGreen,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
  },

  count: {
    color: textColor.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },

  summaryError: {
    gap: spacing.xs,
    paddingBottom: spacing.xxs,
  },

  summaryErrorText: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  skeletonCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardSoft,
    gap: spacing.sm,
  },

  errorCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardSoft,
    gap: spacing.sm,
  },

  errorTitle: {
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },

  errorBody: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
