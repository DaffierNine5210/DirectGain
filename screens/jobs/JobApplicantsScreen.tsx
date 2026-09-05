import { useCallback, useEffect, useRef, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGHeader from '../../components/DGHeader';
import DGSkeleton from '../../components/DGSkeleton';
import ResolvedProfileAvatar from '../../components/profile/ResolvedProfileAvatar';

import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import type { JobsFlowParamList } from '../../navigation/jobsFlow';

import {
  formatApplicationStatus,
  formatPostedLabel,
  previewApplicationMessage,
} from '../../services/jobs/jobAdapter';
import { listApplicationsForJob } from '../../services/jobs/jobApplicationRepository';

import {
  alpha,
  palette,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

import type { PosterJobApplication } from '../../types/jobs';

type Props = NativeStackScreenProps<
  JobsFlowParamList,
  'JobApplicants'
>;

export default function JobApplicantsScreen({
  navigation,
  route,
}: Props) {
  const {
    hideTabBar,
    showTabBar,
  } = useTabBarVisibility();

  const jobId = route.params.jobId;
  const jobTitle = route.params.jobTitle;
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const loadApplicationsRef = useRef<
    (showSpinner: boolean) => Promise<void>
  >(async () => {});

  const [
    applications,
    setApplications,
  ] = useState<PosterJobApplication[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const loadApplications = useCallback(
    async (showSpinner: boolean) => {
      const requestId = ++requestIdRef.current;

      if (showSpinner) {
        setLoading(true);
      }

      const result = await listApplicationsForJob(jobId);

      if (
        requestId !== requestIdRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      setLoading(false);
      setRefreshing(false);
      hasLoadedRef.current = true;

      if (result.error) {
        setError(result.error);
        setApplications([]);
        return;
      }

      setError(null);
      setApplications(result.applications);
    },
    [jobId],
  );

  loadApplicationsRef.current = loadApplications;

  useFocusEffect(
    useCallback(() => {
      hideTabBar();

      if (hasLoadedRef.current) {
        void loadApplicationsRef.current(false);
      }

      return () => {
        showTabBar();
      };
    }, [hideTabBar, showTabBar]),
  );

  useEffect(() => {
    mountedRef.current = true;
    void loadApplications(true);

    return () => {
      mountedRef.current = false;
    };
  }, [loadApplications]);

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <DGHeader
        showBackButton
        title="Applicants"
        onBackPress={() => {
          navigation.goBack();
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadApplications(false);
            }}
            tintColor={palette.opportunityGreen}
          />
        }
      >
        <View style={styles.jobCard}>
          <Text style={styles.eyebrow}>Hiring for</Text>
          <Text style={styles.jobTitle}>{jobTitle}</Text>
        </View>

        {loading ? (
          <View style={styles.card}>
            <DGSkeleton width="48%" height={14} />
            <DGSkeleton
              width="92%"
              height={12}
              style={styles.skeleton}
            />
          </View>
        ) : error ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>
              Applicants could not be loaded
            </Text>
            <Text style={styles.emptyBody}>{error}</Text>
            <Pressable
              onPress={() => {
                void loadApplications(true);
              }}
              style={styles.retry}
              accessibilityRole="button"
              accessibilityLabel="Retry loading applicants"
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : applications.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>
              No applications yet
            </Text>
            <Text style={styles.emptyBody}>
              When someone applies, their message will appear here for you to review.
            </Text>
          </View>
        ) : (
          applications.map((item) => {
            const name =
              item.applicant?.displayName ??
              'Direct Gain member';
            const selected = item.status === 'selected';

            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`${name}. ${formatApplicationStatus(item.status)}.`}
                onPress={() => {
                  navigation.navigate('JobApplicantDetail', {
                    jobId,
                    jobTitle,
                    applicationId: item.id,
                  });
                }}
                style={({ pressed }) => [
                  styles.card,
                  selected && styles.selectedCard,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.row}>
                  <ResolvedProfileAvatar
                    displayName={name}
                    avatarPath={item.applicant?.avatarPath}
                    size="md"
                  />
                  <View style={styles.copy}>
                    <View style={styles.nameRow}>
                      <Text
                        style={styles.name}
                        numberOfLines={1}
                      >
                        {name}
                      </Text>
                      <Text
                        style={[
                          styles.status,
                          selected && styles.statusSelected,
                        ]}
                      >
                        {formatApplicationStatus(item.status)}
                      </Text>
                    </View>
                    {item.applicant?.accountType ===
                    'business' ? (
                      <Text style={styles.meta}>
                        Business account
                      </Text>
                    ) : null}
                    <Text
                      style={styles.preview}
                      numberOfLines={2}
                    >
                      {previewApplicationMessage(item.message)}
                    </Text>
                    <Text style={styles.time}>
                      {formatPostedLabel(item.createdAt)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: surface.page,
  },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.massive,
    gap: spacing.sm,
  },

  jobCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    gap: 4,
    marginBottom: spacing.xs,
  },

  eyebrow: {
    ...typography.eyebrow,
    color: textColor.muted,
  },

  jobTitle: {
    color: textColor.primary,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },

  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
  },

  selectedCard: {
    borderColor: alpha.green28,
  },

  pressed: {
    opacity: 0.86,
  },

  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },

  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  name: {
    flex: 1,
    minWidth: 0,
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },

  status: {
    color: textColor.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  statusSelected: {
    color: palette.opportunityGreen,
  },

  meta: {
    color: textColor.muted,
    fontSize: 12,
    fontWeight: '600',
  },

  preview: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
  },

  time: {
    color: textColor.muted,
    fontSize: 12,
    fontWeight: '600',
  },

  skeleton: {
    marginTop: spacing.sm,
  },

  emptyTitle: {
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },

  emptyBody: {
    marginTop: spacing.xs,
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
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
