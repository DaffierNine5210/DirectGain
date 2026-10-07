import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import DGSkeleton from './DGSkeleton';
import DiscoverJobCard from './jobs/DiscoverJobCard';

import type { Job, JobCoverPresentation } from '../types/jobs';

import {
  alpha,
  layout,
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../theme/designSystem';

export const DISCOVER_JOBS_PREVIEW_LIMIT = 20;

const DISCOVER_JOBS_VISIBLE_CARDS = 2.5;
const DISCOVER_JOBS_CARD_MIN_WIDTH = 128;
const DISCOVER_JOBS_CARD_MAX_WIDTH = 168;

const JOB_SKELETON_KEYS = [
  'discover-jobs-skeleton-1',
  'discover-jobs-skeleton-2',
  'discover-jobs-skeleton-3',
] as const;

export type DiscoverJobsPreviewStatus =
  | 'loading'
  | 'error'
  | 'empty'
  | 'ready';

type DiscoverJobsPreviewProps = {
  status: DiscoverJobsPreviewStatus;
  jobs: Job[];
  covers: Record<string, JobCoverPresentation>;
  errorMessage?: string | null;
  filterActive?: boolean;
  onJobPress: (jobId: string) => void;
  onRetry: () => void;
};

function getDiscoverJobsCardWidth(windowWidth: number) {
  const availableWidth =
    windowWidth - layout.screenPadding * 2;
  const gap = spacing.sm;
  const measured = Math.round(
    (availableWidth - gap) / DISCOVER_JOBS_VISIBLE_CARDS,
  );

  return Math.min(
    DISCOVER_JOBS_CARD_MAX_WIDTH,
    Math.max(DISCOVER_JOBS_CARD_MIN_WIDTH, measured),
  );
}

export default function DiscoverJobsPreview({
  status,
  jobs,
  covers,
  errorMessage,
  filterActive = false,
  onJobPress,
  onRetry,
}: DiscoverJobsPreviewProps) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = getDiscoverJobsCardWidth(windowWidth);

  if (status === 'loading') {
    return (
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
      >
        {JOB_SKELETON_KEYS.map((key) => (
          <View
            key={key}
            style={[styles.cardSlot, { width: cardWidth }]}
          >
            <CompactJobSkeleton />
          </View>
        ))}
      </ScrollView>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.messageCard}>
        <Text style={styles.messageTitle}>
          Jobs could not be loaded
        </Text>

        <Text style={styles.messageBody}>
          {errorMessage?.trim() ||
            'The jobs feed could not be loaded. Try again.'}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry loading jobs"
          onPress={onRetry}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryPressed,
          ]}
        >
          <Text style={styles.retryLabel}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (status === 'empty') {
    return (
      <View style={styles.messageCard}>
        <Text style={styles.messageTitle}>
          {filterActive
            ? 'No Work matches on this page.'
            : 'No open jobs right now'}
        </Text>

        <Text style={styles.messageBody}>
          {filterActive
            ? 'Clear the filter to see loaded jobs, or find work.'
            : 'Find work to see jobs as they appear.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      contentContainerStyle={styles.railContent}
    >
      {jobs.map((job) => (
        <View
          key={job.id}
          style={[styles.cardSlot, { width: cardWidth }]}
        >
          <DiscoverJobCard
            job={job}
            coverUrl={covers[job.id]?.url ?? null}
            onPress={onJobPress}
          />
        </View>
      ))}
    </ScrollView>
  );
}

function CompactJobSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonBody}>
        <DGSkeleton width="38%" height={10} />
        <DGSkeleton
          width="92%"
          height={14}
          style={styles.skeletonTitle}
        />
        <DGSkeleton width="54%" height={16} />
        <DGSkeleton width="68%" height={10} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  railContent: {
    paddingRight: spacing.lg,
  },

  cardSlot: {
    marginRight: spacing.sm,
  },

  skeletonCard: {
    overflow: 'hidden',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
  },

  skeletonBody: {
    borderLeftWidth: 3,
    borderLeftColor: palette.opportunityGreen,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },

  skeletonTitle: {
    marginTop: 0,
  },

  messageCard: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
  },

  messageTitle: {
    color: textColor.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  messageBody: {
    marginTop: spacing.xs,
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  retryButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: palette.opportunityGreen,
  },

  retryPressed: {
    opacity: 0.86,
  },

  retryLabel: {
    color: textColor.inverse,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
  },
});
