import { Pressable, StyleSheet, Text, View } from 'react-native';

import ResolvedProfileAvatar from './ResolvedProfileAvatar';
import StarRatingDisplay from '../reviews/StarRatingDisplay';

import type { PresentedProfileReview } from './profilePresentation';

import {
  alpha,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

type ProfileReviewCardProps = {
  review: PresentedProfileReview;
  onPressReviewer: (profileId: string) => void;
};

export default function ProfileReviewCard({
  review,
  onPressReviewer,
}: ProfileReviewCardProps) {
  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => {
          onPressReviewer(review.reviewerProfileId);
        }}
        style={({ pressed }) => [
          styles.reviewerRow,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`View ${review.reviewerDisplayName}'s profile`}
      >
        <ResolvedProfileAvatar
          displayName={review.reviewerDisplayName}
          avatarPath={review.reviewerAvatarPath}
          size="sm"
        />
        <View style={styles.reviewerCopy}>
          <Text
            style={styles.name}
            numberOfLines={1}
          >
            {review.reviewerDisplayName}
          </Text>
          <View style={styles.metaRow}>
            {review.dateLabel ? (
              <Text style={styles.meta}>
                {review.dateLabel}
              </Text>
            ) : null}
            {review.edited ? (
              <Text style={styles.meta}>
                {review.dateLabel ? ' · Edited' : 'Edited'}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipLabel}>
            {review.contextLabel}
          </Text>
        </View>
      </Pressable>

      <StarRatingDisplay
        rating={review.rating}
        size="sm"
      />

      {review.body ? (
        <Text style={styles.body}>
          {review.body}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardSoft,
    gap: spacing.sm,
  },

  reviewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  pressed: {
    opacity: 0.86,
  },

  reviewerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  name: {
    color: textColor.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  meta: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: alpha.green12,
    backgroundColor: alpha.green04,
  },

  chipLabel: {
    color: textColor.secondary,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  body: {
    color: textColor.primary,
    ...typography.bodyMedium,
    fontWeight: '500',
  },
});
