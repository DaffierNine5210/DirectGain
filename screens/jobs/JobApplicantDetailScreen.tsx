import { useCallback, useEffect, useRef, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGButton from '../../components/DGButton';
import DGHeader from '../../components/DGHeader';
import DGSkeleton from '../../components/DGSkeleton';

import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import type { DiscoverStackParamList } from '../../navigation/DiscoverStack';

import {
  formatApplicationStatus,
  formatPostedLabel,
  posterInitials,
} from '../../services/jobs/jobAdapter';
import {
  declineJobApplication,
  getPosterApplication,
  hireJobApplicant,
} from '../../services/jobs/jobApplicationRepository';
import { getJobById } from '../../services/jobs/jobRepository';

import {
  alpha,
  palette,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

import type {
  JobStatus,
  PosterJobApplication,
} from '../../types/jobs';

type Props = NativeStackScreenProps<
  DiscoverStackParamList,
  'JobApplicantDetail'
>;

export default function JobApplicantDetailScreen({
  navigation,
  route,
}: Props) {
  const {
    hideTabBar,
    showTabBar,
  } = useTabBarVisibility();

  const {
    jobId,
    jobTitle,
    applicationId,
  } = route.params;

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const actingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const loadDetailRef = useRef<
    (showSpinner: boolean) => Promise<void>
  >(async () => {});

  const [
    application,
    setApplication,
  ] = useState<PosterJobApplication | null>(null);

  const [
    jobStatus,
    setJobStatus,
  ] = useState<JobStatus | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    actionError,
    setActionError,
  ] = useState<string | null>(null);

  const [
    hiring,
    setHiring,
  ] = useState(false);

  const [
    declining,
    setDeclining,
  ] = useState(false);

  const loadDetail = useCallback(
    async (showSpinner: boolean) => {
      const requestId = ++requestIdRef.current;

      if (showSpinner) {
        setLoading(true);
      }

      setActionError(null);

      const [applicationResult, jobResult] = await Promise.all([
        getPosterApplication(jobId, applicationId),
        getJobById(jobId),
      ]);

      if (
        requestId !== requestIdRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      setLoading(false);

      if (applicationResult.error || !applicationResult.application) {
        setApplication(null);
        setError(
          applicationResult.error ??
            'That application could not be found.',
        );
        return;
      }

      setError(null);
      setApplication(applicationResult.application);
      setJobStatus(jobResult.job?.status ?? null);
      hasLoadedRef.current = true;
    },
    [applicationId, jobId],
  );

  loadDetailRef.current = loadDetail;

  useFocusEffect(
    useCallback(() => {
      hideTabBar();

      if (hasLoadedRef.current) {
        void loadDetailRef.current(false);
      }

      return () => {
        showTabBar();
      };
    }, [hideTabBar, showTabBar]),
  );

  useEffect(() => {
    mountedRef.current = true;
    void loadDetail(true);

    return () => {
      mountedRef.current = false;
    };
  }, [loadDetail]);

  const name =
    application?.applicant?.displayName ??
    'Direct Gain member';

  const canAct =
    application?.status === 'submitted' &&
    jobStatus === 'open' &&
    !hiring &&
    !declining;

  async function handleHire() {
    if (actingRef.current || !canAct) {
      return;
    }

    actingRef.current = true;
    setHiring(true);
    setActionError(null);

    const result = await hireJobApplicant({
      jobId,
      applicationId,
    });

    if (!mountedRef.current) {
      return;
    }

    actingRef.current = false;
    setHiring(false);

    if (!result.ok) {
      setActionError(
        result.error ??
          'This applicant could not be hired. Try again.',
      );
      void loadDetail(false);
      return;
    }

    await loadDetail(false);
  }

  async function handleDecline() {
    if (actingRef.current || !canAct) {
      return;
    }

    actingRef.current = true;
    setDeclining(true);
    setActionError(null);

    const result = await declineJobApplication(
      applicationId,
      jobId,
    );

    if (!mountedRef.current) {
      return;
    }

    actingRef.current = false;
    setDeclining(false);

    if (!result.ok) {
      setActionError(
        result.error ??
          'This application could not be declined. Try again.',
      );
      void loadDetail(false);
      return;
    }

    await loadDetail(false);
  }

  const location = [
    application?.applicant?.suburb,
    application?.applicant?.state,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <DGHeader
        showBackButton
        title="Applicant"
        onBackPress={() => {
          navigation.goBack();
        }}
      />

      {loading ? (
        <View style={styles.body}>
          <DGSkeleton width="40%" height={12} />
          <DGSkeleton
            width="78%"
            height={20}
            style={styles.skeleton}
          />
          <DGSkeleton width="92%" height={12} />
        </View>
      ) : error || !application ? (
        <View style={styles.messageCard}>
          <Text style={styles.emptyTitle}>
            Applicant could not be loaded
          </Text>
          <Text style={styles.emptyBody}>
            {error ?? 'That application is no longer available.'}
          </Text>
          <Pressable
            onPress={() => {
              void loadDetail(true);
            }}
            style={styles.retry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading applicant"
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.jobCard}>
            <Text style={styles.eyebrow}>Application for</Text>
            <Text style={styles.jobTitle}>{jobTitle}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.identity}>
              <View style={styles.avatar}>
                <Text style={styles.initials}>
                  {posterInitials(name)}
                </Text>
              </View>
              <View style={styles.identityCopy}>
                <Text style={styles.name}>{name}</Text>
                <Text
                  style={[
                    styles.status,
                    application.status === 'selected' &&
                      styles.statusSelected,
                  ]}
                >
                  {formatApplicationStatus(application.status)}
                </Text>
              </View>
            </View>

            {application.status === 'selected' ? (
              <Text style={styles.meta}>
                This applicant is assigned to the job.
              </Text>
            ) : null}
            {application.applicant?.accountType ===
            'business' ? (
              <Text style={styles.meta}>Business account</Text>
            ) : (
              <Text style={styles.meta}>Direct Gain member</Text>
            )}

            {location ? (
              <Text style={styles.meta}>{location}</Text>
            ) : null}

            <Text style={styles.meta}>
              Applied {formatPostedLabel(application.createdAt)}
            </Text>
          </View>

          {application.applicant?.bio ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.message}>
                {application.applicant.bio}
              </Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Message</Text>
            <Text style={styles.message}>
              {application.message?.trim() ||
                'No message included.'}
            </Text>
          </View>

          {actionError ? (
            <Text style={styles.actionError}>{actionError}</Text>
          ) : null}

          {canAct ? (
            <View style={styles.actions}>
              <DGButton
                title={hiring ? 'Hiring…' : 'Hire applicant'}
                fullWidth
                loading={hiring}
                disabled={hiring || declining}
                onPress={() => {
                  Alert.alert(
                    `Hire ${name}?`,
                    'This applicant will be selected and the job will become assigned. Other submitted applicants will not be selected. This does not create a payment or legal contract in Direct Gain.',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                      {
                        text: 'Hire',
                        onPress: () => {
                          void handleHire();
                        },
                      },
                    ],
                  );
                }}
                accessibilityLabel={`Hire ${name}`}
              />

              <DGButton
                title={
                  declining ? 'Declining…' : 'Decline'
                }
                variant="outline"
                fullWidth
                loading={declining}
                disabled={hiring || declining}
                onPress={() => {
                  Alert.alert(
                    `Decline ${name}?`,
                    'This application will be declined. They will not be selected for this job and cannot apply again.',
                    [
                      {
                        text: 'Keep application',
                        style: 'cancel',
                      },
                      {
                        text: 'Decline',
                        style: 'destructive',
                        onPress: () => {
                          void handleDecline();
                        },
                      },
                    ],
                  );
                }}
                accessibilityLabel={`Decline ${name}`}
              />
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: surface.page,
  },

  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.massive,
    gap: spacing.sm,
  },

  skeleton: {
    marginTop: spacing.sm,
  },

  jobCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    gap: 4,
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
    gap: spacing.xs,
  },

  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: alpha.white08,
    alignItems: 'center',
    justifyContent: 'center',
  },

  initials: {
    color: textColor.primary,
    fontSize: 16,
    fontWeight: '800',
  },

  identityCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },

  name: {
    color: textColor.primary,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
  },

  status: {
    color: textColor.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  statusSelected: {
    color: palette.opportunityGreen,
  },

  meta: {
    color: textColor.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  sectionTitle: {
    color: textColor.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  message: {
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },

  actions: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },

  actionError: {
    color: '#E5484D',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
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

  emptyTitle: {
    color: textColor.primary,
    fontSize: 16,
    fontWeight: '800',
  },

  emptyBody: {
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
