import { useCallback, useEffect, useRef, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import DGHeader from '../../components/DGHeader';
import DGSkeleton from '../../components/DGSkeleton';

import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import type { DiscoverStackParamList } from '../../navigation/DiscoverStack';

import {
  formatStartsOn,
  posterInitials,
} from '../../services/jobs/jobAdapter';
import { getJobById } from '../../services/jobs/jobRepository';

import {
  alpha,
  layout,
  palette,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

import type { Job, JobPayType } from '../../types/jobs';

type Props = NativeStackScreenProps<
  DiscoverStackParamList,
  'JobDetail'
>;

export default function JobDetailScreen({
  navigation,
  route,
}: Props) {
  const { showTabBar } =
    useTabBarVisibility();

  const jobId = route.params.jobId;
  const mountedRef = useRef(true);

  const [
    job,
    setJob,
  ] =
    useState<Job | null>(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      showTabBar();
    }, [showTabBar]),
  );

  const loadJob = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      const result =
        await getJobById(jobId);

      if (!mountedRef.current) {
        return;
      }

      setLoading(false);

      if (result.error) {
        setJob(null);
        setError(result.error);
        return;
      }

      setJob(result.job);
    },
    [jobId],
  );

  useEffect(() => {
    mountedRef.current = true;
    void loadJob();

    return () => {
      mountedRef.current = false;
    };
  }, [loadJob]);

  const closed =
    job !== null &&
    job.status !== 'open';

  const startsLabel = job
    ? formatStartsOn(job.startsOn)
    : null;

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <DGHeader
        showBackButton
        title="Job Details"
        onBackPress={() => {
          navigation.goBack();
        }}
      />

      {loading ? (
        <View style={styles.body}>
          <DGSkeleton width="28%" height={10} />
          <DGSkeleton
            width="90%"
            height={22}
            style={styles.skeletonBlock}
          />
          <DGSkeleton width="42%" height={16} />
          <View style={styles.skeletonCard}>
            <DGSkeleton width="48%" height={12} />
            <DGSkeleton
              width="62%"
              height={12}
              style={styles.skeletonBlock}
            />
          </View>
        </View>
      ) : error ? (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>
            Job could not be loaded
          </Text>
          <Text style={styles.messageBody}>
            {error}
          </Text>
          <Pressable
            onPress={() => {
              void loadJob();
            }}
            style={styles.retry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading job"
          >
            <Text style={styles.retryText}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : !job ? (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>
            Job unavailable
          </Text>
          <Text style={styles.messageBody}>
            This job is no longer visible. It may have been filled, cancelled, or removed.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={
            styles.scroll
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <Text style={styles.category}>
            {job.categoryLabel}
          </Text>
          <Text
            style={styles.title}
            accessibilityRole="header"
          >
            {job.title}
          </Text>
          <Text style={styles.pay}>
            {job.payLabel}
          </Text>
          <Text style={styles.heroMeta}>
            {[
              job.locationLabel,
              job.postedLabel,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>

          {closed ? (
            <View style={styles.statusNote}>
              <Text style={styles.statusText}>
                This job is no longer open.
              </Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>
              Job info
            </Text>
            <View style={styles.factGrid}>
              <Fact
                label="Location"
                value={job.locationLabel}
              />
              <Fact
                label="Type"
                value={job.jobTypeLabel}
              />
              {job.workSiteLabel ? (
                <Fact
                  label="Work site"
                  value={job.workSiteLabel}
                />
              ) : null}
              <Fact
                label="Pay type"
                value={formatPayTypeLabel(
                  job.payType,
                )}
              />
              {startsLabel ? (
                <Fact
                  label="Starts"
                  value={startsLabel}
                />
              ) : null}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>
              About this job
            </Text>
            <Text style={styles.description}>
              {job.description}
            </Text>
          </View>

          {job.poster ? (
            <View
              style={styles.card}
              accessibilityLabel={`Posted by ${job.poster.displayName}`}
            >
              <Text style={styles.cardEyebrow}>
                Posted by
              </Text>
              <View style={styles.posterRow}>
                <View style={styles.avatar}>
                  <Text style={styles.initials}>
                    {posterInitials(
                      job.poster.displayName,
                    )}
                  </Text>
                </View>
                <View style={styles.posterText}>
                  <Text style={styles.posterName}>
                    {job.poster.displayName}
                  </Text>
                  <Text style={styles.posterMeta}>
                    {job.poster.accountType ===
                    'business'
                      ? 'Business'
                      : 'Direct Gain member'}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Fact({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>
        {label}
      </Text>
      <Text
        style={styles.factValue}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function formatPayTypeLabel(
  payType: JobPayType,
): string {
  if (payType === 'hourly') {
    return 'Hourly';
  }

  if (payType === 'daily') {
    return 'Daily';
  }

  if (payType === 'fixed') {
    return 'Fixed';
  }

  if (payType === 'salary') {
    return 'Salary';
  }

  return 'Negotiable';
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: surface.page,
  },

  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },

  skeletonBlock: {
    marginTop: spacing.sm,
  },

  skeletonCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
  },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom:
      layout.bottomNavigationClearance,
    gap: spacing.md,
  },

  category: {
    color: textColor.muted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  title: {
    color: textColor.primary,
    ...typography.headingMedium,
    fontSize: 26,
    lineHeight: 32,
  },

  pay: {
    color: palette.opportunityGreen,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },

  heroMeta: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  statusNote: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: alpha.white08,
  },

  statusText: {
    color: textColor.secondary,
    fontSize: 13,
    fontWeight: '700',
  },

  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },

  cardEyebrow: {
    marginBottom: spacing.sm,
    color: textColor.muted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  factGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.md,
    rowGap: spacing.md,
  },

  fact: {
    width: '47%',
    minWidth: 132,
  },

  factLabel: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },

  factValue: {
    marginTop: 2,
    color: textColor.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },

  description: {
    color: textColor.secondary,
    fontSize: 16,
    lineHeight: 24,
  },

  posterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: alpha.white08,
    alignItems: 'center',
    justifyContent: 'center',
  },

  initials: {
    color: textColor.primary,
    fontSize: 14,
    fontWeight: '800',
  },

  posterText: {
    flex: 1,
    minWidth: 0,
  },

  posterName: {
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },

  posterMeta: {
    marginTop: 2,
    color: textColor.muted,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
  },

  messageCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
  },

  messageTitle: {
    color: textColor.primary,
    ...typography.headingSmall,
  },

  messageBody: {
    marginTop: spacing.xs,
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
  },

  retry: {
    marginTop: spacing.md,
    minHeight: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.opportunityGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },

  retryText: {
    color: textColor.inverse,
    fontWeight: '800',
  },
});
