import { StyleSheet, Text, View } from 'react-native';

import DGButton from '../DGButton';
import DGSkeleton from '../DGSkeleton';

import {
  alpha,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

type JobReviewActionProps = {
  loading: boolean;
  error: string | null;
  canLeaveReview: boolean;
  onLeaveReview: () => void;
  onRetry: () => void;
};

export default function JobReviewAction({
  loading,
  error,
  canLeaveReview,
  onLeaveReview,
  onRetry,
}: JobReviewActionProps) {
  if (loading && !error && !canLeaveReview) {
    return (
      <View style={styles.card}>
        <DGSkeleton width="40%" height={12} />
        <DGSkeleton
          width="78%"
          height={12}
          style={styles.skeleton}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          Review unavailable
        </Text>
        <Text style={styles.body}>{error}</Text>
        <DGButton
          title="Retry"
          variant="secondary"
          fullWidth
          onPress={onRetry}
          accessibilityLabel="Retry loading review opportunity"
        />
      </View>
    );
  }

  if (!canLeaveReview) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Leave a review
      </Text>
      <Text style={styles.body}>
        Share how this completed work went. Your review helps people trust who they work with.
      </Text>
      <DGButton
        title="Leave review"
        fullWidth
        onPress={onLeaveReview}
        accessibilityLabel="Leave review"
        accessibilityHint="Opens a screen to rate this completed job"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.green16,
    backgroundColor: surface.cardRaised,
    gap: spacing.sm,
  },

  title: {
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },

  body: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },

  skeleton: {
    marginTop: spacing.xs,
  },
});
