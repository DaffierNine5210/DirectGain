import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import ProfileAvatar from '../ProfileAvatar';
import StarRatingDisplay from '../../reviews/StarRatingDisplay';

import {
  formatReviewAverageLabel,
  formatReviewCountLabel,
} from '../profilePresentation';

import type { ProfileReviewStats } from '../../../types/reviews';

import {
  alpha,
  iconSize,
  layout,
  spacing,
  surface,
  textColor,
  typography,
} from '../../../theme/designSystem';

type ProfessionalProfileHeroProps = {
  displayName: string;
  location: string | null;
  hasStoredPhoto: boolean;
  avatarUrl?: string | null;
  avatarUnavailable?: boolean;
  stats: ProfileReviewStats | null;
};

export default function ProfessionalProfileHero({
  displayName,
  location,
  hasStoredPhoto,
  avatarUrl = null,
  avatarUnavailable = false,
  stats,
}: ProfessionalProfileHeroProps) {
  const reviewCount = stats?.reviewCount ?? 0;
  const average = stats?.averageRating;
  const hasReviews =
    reviewCount > 0 &&
    average != null &&
    Number.isFinite(average);

  const averageLabel = hasReviews
    ? formatReviewAverageLabel(average)
    : '';
  const countLabel = hasReviews
    ? formatReviewCountLabel(reviewCount)
    : '';

  return (
    <View
      style={styles.root}
      accessibilityLabel={`${displayName}. Direct Gain professional profile preview.`}
    >
      <View style={styles.identityRow}>
        <View style={styles.avatarRing}>
          <ProfileAvatar
            displayName={displayName}
            imageUri={avatarUrl}
            hasStoredPhoto={hasStoredPhoto}
            photoUnavailable={avatarUnavailable}
            size="md"
          />
        </View>

        <View style={styles.identity}>
          <Text
            style={styles.name}
            accessibilityRole="header"
            numberOfLines={2}
          >
            {displayName}
          </Text>

          {location ? (
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={iconSize.xs}
                color={textColor.muted}
              />
              <Text style={styles.location} numberOfLines={1}>
                {location}
              </Text>
            </View>
          ) : null}

          {hasReviews ? (
            <View
              style={styles.trust}
              accessibilityLabel={`${averageLabel} average from ${countLabel}`}
            >
              <StarRatingDisplay
                rating={average}
                size="sm"
              />
              <Text style={styles.trustValue}>
                {averageLabel}
              </Text>
              <Text style={styles.trustCount}>
                {countLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    maxWidth: layout.maximumContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 0,
  },

  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },

  avatarRing: {
    padding: 2,
    borderRadius: 999,
    backgroundColor: surface.page,
    borderWidth: 1,
    borderColor: alpha.green16,
  },

  identity: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    gap: 4,
  },

  name: {
    color: textColor.primary,
    ...typography.headingSmall,
    textAlign: 'left',
    width: '100%',
  },

  locationRow: {
    flexDirection: 'row',
    flexShrink: 1,
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
  },

  location: {
    flexShrink: 1,
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  trust: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },

  trustValue: {
    color: textColor.primary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },

  trustCount: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
});
