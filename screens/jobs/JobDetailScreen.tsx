import { Ionicons } from '@expo/vector-icons';
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
  iconSize,
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

type IoniconName = React.ComponentProps<
  typeof Ionicons
>['name'];

export default function JobDetailScreen({
  navigation,
  route,
}: Props) {
  const {
    hideTabBar,
    showTabBar,
  } = useTabBarVisibility();

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
      hideTabBar();

      return () => {
        showTabBar();
      };
    }, [hideTabBar, showTabBar]),
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
        <View style={styles.detailRoot}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={
              styles.scroll
            }
            showsVerticalScrollIndicator={
              false
            }
          >
            <View style={styles.hero}>
              <View style={styles.categoryPill}>
                <Text style={styles.category}>
                  {job.categoryLabel}
                </Text>
              </View>

              <Text
                style={styles.title}
                accessibilityRole="header"
              >
                {job.title}
              </Text>

              <Text style={styles.pay}>
                {job.payLabel}
              </Text>

              <View style={styles.heroMetaRow}>
                <Ionicons
                  name="location-outline"
                  size={iconSize.sm}
                  color={textColor.muted}
                />
                <Text style={styles.heroMeta}>
                  {job.locationLabel}
                </Text>
                <Text style={styles.heroMetaDot}>
                  ·
                </Text>
                <Text style={styles.heroMeta}>
                  {job.postedLabel}
                </Text>
              </View>

              <View style={styles.pillRow}>
                <MetaPill
                  icon="briefcase-outline"
                  label={job.jobTypeLabel}
                />
                {job.workSiteLabel ? (
                  <MetaPill
                    icon="business-outline"
                    label={job.workSiteLabel}
                  />
                ) : null}
              </View>
            </View>

            {closed ? (
              <View style={styles.statusNote}>
                <Text style={styles.statusText}>
                  This job is no longer open.
                </Text>
              </View>
            ) : null}

            <View style={styles.specSection}>
              {(
                [
                  {
                    icon: 'cash-outline' as const,
                    label: 'Pay type',
                    value: formatPayTypeLabel(
                      job.payType,
                    ),
                  },
                  {
                    icon: 'location-outline' as const,
                    label: 'Location',
                    value: job.locationLabel,
                  },
                  {
                    icon: 'briefcase-outline' as const,
                    label: 'Job type',
                    value: job.jobTypeLabel,
                  },
                  ...(job.workSiteLabel
                    ? [
                        {
                          icon: 'business-outline' as const,
                          label: 'Work site',
                          value:
                            job.workSiteLabel,
                        },
                      ]
                    : []),
                  ...(startsLabel
                    ? [
                        {
                          icon: 'calendar-outline' as const,
                          label: 'Starts',
                          value: startsLabel,
                        },
                      ]
                    : []),
                ] as const
              ).map((item, index, items) => (
                <SpecRow
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  last={
                    index ===
                    items.length - 1
                  }
                />
              ))}
            </View>

            <View style={styles.aboutSection}>
              <Text style={styles.aboutEyebrow}>
                About this job
              </Text>
              <Text style={styles.description}>
                {job.description}
              </Text>
            </View>

            {job.poster ? (
              <View
                style={styles.posterCard}
                accessibilityLabel={`Posted by ${job.poster.displayName}`}
              >
                <Text style={styles.posterEyebrow}>
                  Posted by
                </Text>
                <View style={styles.posterRow}>
                  <View style={styles.avatarRing}>
                    <View style={styles.avatar}>
                      <Text style={styles.initials}>
                        {posterInitials(
                          job.poster.displayName,
                        )}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.posterText}>
                    <Text style={styles.posterName}>
                      {job.poster.displayName}
                    </Text>
                    <Text style={styles.posterMeta}>
                      {job.poster.accountType ===
                      'business'
                        ? 'Business account'
                        : 'Direct Gain member'}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

function MetaPill({
  icon,
  label,
}: {
  icon: IoniconName;
  label: string;
}) {
  return (
    <View style={styles.metaPill}>
      <Ionicons
        name={icon}
        size={iconSize.xs}
        color={textColor.secondary}
      />
      <Text style={styles.metaPillLabel}>
        {label}
      </Text>
    </View>
  );
}

function SpecRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: IoniconName;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.specRow,
        last && styles.specRowLast,
      ]}
    >
      <View style={styles.specIcon}>
        <Ionicons
          name={icon}
          size={iconSize.sm}
          color={palette.opportunityGreen}
        />
      </View>
      <View style={styles.specCopy}>
        <Text style={styles.specLabel}>
          {label}
        </Text>
        <Text
          style={styles.specValue}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
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

  flex: {
    flex: 1,
  },

  detailRoot: {
    flex: 1,
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
    paddingBottom: spacing.massive,
    gap: spacing.xl,
  },

  hero: {
    gap: spacing.sm,
  },

  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: alpha.green08,
    borderWidth: 1,
    borderColor: alpha.green16,
  },

  category: {
    color: palette.opportunityGreen,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  title: {
    color: textColor.primary,
    ...typography.headingLarge,
    fontSize: 28,
    lineHeight: 34,
  },

  pay: {
    color: palette.opportunityGreen,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.4,
  },

  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },

  heroMeta: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  heroMetaDot: {
    color: textColor.muted,
    fontSize: 14,
    fontWeight: '700',
  },

  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },

  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: alpha.white05,
    borderWidth: 1,
    borderColor: alpha.white08,
  },

  metaPillLabel: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
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

  specSection: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: alpha.white08,
    paddingVertical: spacing.xs,
  },

  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: alpha.white05,
  },

  specRowLast: {
    borderBottomWidth: 0,
  },

  specIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: alpha.green08,
    alignItems: 'center',
    justifyContent: 'center',
  },

  specCopy: {
    flex: 1,
    minWidth: 0,
  },

  specLabel: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },

  specValue: {
    marginTop: 1,
    color: textColor.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },

  aboutSection: {
    gap: spacing.sm,
  },

  aboutEyebrow: {
    ...typography.eyebrow,
    color: textColor.muted,
  },

  description: {
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '500',
  },

  posterCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: alpha.green10,
    backgroundColor: alpha.white03,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },

  posterEyebrow: {
    marginBottom: spacing.sm,
    ...typography.eyebrow,
    color: textColor.muted,
  },

  posterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },

  avatarRing: {
    padding: 2,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: alpha.green20,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: alpha.green10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  initials: {
    color: palette.opportunityGreen,
    fontSize: 16,
    fontWeight: '800',
  },

  posterText: {
    flex: 1,
    minWidth: 0,
  },

  posterName: {
    color: textColor.primary,
    fontSize: 17,
    lineHeight: 22,
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
