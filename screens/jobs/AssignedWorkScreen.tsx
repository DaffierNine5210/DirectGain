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
import JobWorkCard from '../../components/jobs/JobWorkCard';

import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import type { WorkStackParamList } from '../../navigation/WorkStack';

import { formatPostedLabel } from '../../services/jobs/jobAdapter';
import { listMyAssignedJobs } from '../../services/jobs/jobRepository';

import {
  alpha,
  layout,
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

import type { Job } from '../../types/jobs';

type Props = NativeStackScreenProps<
  WorkStackParamList,
  'AssignedWork'
>;

export default function AssignedWorkScreen({
  navigation,
}: Props) {
  const { showTabBar } = useTabBarVisibility();
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const loadRef = useRef<
    (showSpinner: boolean) => Promise<void>
  >(async () => {});

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback(
    async (showSpinner: boolean) => {
      const requestId = ++requestIdRef.current;

      if (showSpinner) {
        setLoading(true);
      }

      const result = await listMyAssignedJobs();

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
        setJobs([]);
        return;
      }

      setError(null);
      setJobs(result.jobs);
    },
    [],
  );

  loadRef.current = loadJobs;

  useFocusEffect(
    useCallback(() => {
      showTabBar();

      if (hasLoadedRef.current) {
        void loadRef.current(false);
      }
    }, [showTabBar]),
  );

  useEffect(() => {
    mountedRef.current = true;
    void loadJobs(true);

    return () => {
      mountedRef.current = false;
    };
  }, [loadJobs]);

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <DGHeader
        showBackButton
        title="Assigned Work"
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
              void loadJobs(false);
            }}
            tintColor={palette.opportunityGreen}
          />
        }
      >
        {loading ? (
          <View style={styles.card}>
            <DGSkeleton width="40%" height={12} />
            <DGSkeleton
              width="86%"
              height={18}
              style={styles.skeleton}
            />
          </View>
        ) : error ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>
              Assigned work could not be loaded
            </Text>
            <Text style={styles.emptyBody}>{error}</Text>
            <Pressable
              onPress={() => {
                void loadJobs(true);
              }}
              style={styles.retry}
              accessibilityRole="button"
              accessibilityLabel="Retry loading assigned work"
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : jobs.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>
              No assigned work yet.
            </Text>
            <Text style={styles.emptyBody}>
              When a poster selects you, the job will appear here.
            </Text>
          </View>
        ) : (
          jobs.map((job) => (
            <JobWorkCard
              key={job.id}
              title={job.title}
              payLabel={job.payLabel}
              locationLabel={job.locationLabel}
              jobTypeLabel={job.jobTypeLabel}
              jobStatus={job.status}
              applicationStatus="selected"
              timeLabel={formatPostedLabel(job.publishedAt)}
              emphasizeAssignment
              onPress={() => {
                navigation.navigate('JobDetail', {
                  jobId: job.id,
                });
              }}
            />
          ))
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
    paddingBottom: layout.bottomNavigationClearance,
    gap: spacing.sm,
  },

  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    gap: spacing.sm,
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
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  retry: {
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
