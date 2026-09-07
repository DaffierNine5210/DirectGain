import { StyleSheet, Text, View } from 'react-native';

import DGButton from '../DGButton';
import DGSkeleton from '../DGSkeleton';

import type { JobCompletionView } from '../../types/reviews';

import {
  alpha,
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

type JobCompletionActionsProps = {
  view: JobCompletionView | null;
  loading: boolean;
  confirming: boolean;
  error: string | null;
  onConfirm: () => void;
  onRetry: () => void;
};

export default function JobCompletionActions({
  view,
  loading,
  confirming,
  error,
  onConfirm,
  onRetry,
}: JobCompletionActionsProps) {
  if (loading && !view) {
    return (
      <View style={styles.card}>
        <DGSkeleton width="48%" height={12} />
        <DGSkeleton
          width="82%"
          height={12}
          style={styles.skeleton}
        />
      </View>
    );
  }

  if (!view) {
    if (error) {
      return (
        <View style={styles.card}>
          <Text style={styles.title}>
            Completion status unavailable
          </Text>
          <Text style={styles.body}>{error}</Text>
          <DGButton
            title="Retry"
            variant="secondary"
            fullWidth
            onPress={onRetry}
            accessibilityLabel="Retry loading completion status"
          />
        </View>
      );
    }

    return null;
  }

  if (view.jobCompleted || view.bothConfirmed) {
    return (
      <View style={[styles.card, styles.completedCard]}>
        <Text style={styles.completedTitle}>
          Completed
        </Text>
        <Text style={styles.body}>
          Both the employer and worker confirmed this work is complete.
        </Text>
      </View>
    );
  }

  if (view.currentUserConfirmed) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          Completion confirmed
        </Text>
        <Text style={styles.body}>
          {view.role === 'poster'
            ? 'Waiting for worker confirmation. This job stays assigned until they confirm too.'
            : 'Waiting for employer confirmation. This job stays assigned until they confirm too.'}
        </Text>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}
      </View>
    );
  }

  const actionTitle =
    view.role === 'poster'
      ? 'Mark work complete'
      : 'Confirm work completed';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {view.role === 'poster'
          ? 'Finish this job'
          : 'Confirm this job'}
      </Text>
      <Text style={styles.body}>
        Both the employer and the worker must confirm. Your confirmation is recorded first; the job is completed only after both sides confirm.
      </Text>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}
      <DGButton
        title={actionTitle}
        fullWidth
        loading={confirming}
        disabled={confirming}
        onPress={onConfirm}
        accessibilityLabel={actionTitle}
        accessibilityHint="Records your completion confirmation. The other party must also confirm."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    gap: spacing.sm,
  },

  completedCard: {
    borderColor: alpha.green20,
    backgroundColor: alpha.green06,
  },

  title: {
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },

  completedTitle: {
    color: palette.opportunityGreen,
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

  error: {
    color: palette.danger,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  skeleton: {
    marginTop: spacing.xs,
  },
});
