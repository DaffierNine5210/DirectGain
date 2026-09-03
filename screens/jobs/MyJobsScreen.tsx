import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  CompositeNavigationProp,
} from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGButton from '../../components/DGButton';
import DGChip from '../../components/DGChip';
import DGHeader from '../../components/DGHeader';
import DGSkeleton from '../../components/DGSkeleton';
import JobWorkCard from '../../components/jobs/JobWorkCard';

import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import type { BottomTabParamList } from '../../navigation/BottomTabs';
import type { MyGainStackParamList } from '../../navigation/MyGainStack';
import type { WorkStackParamList } from '../../navigation/WorkStack';

import { formatPostedLabel } from '../../services/jobs/jobAdapter';
import { listMyPostedJobs } from '../../services/jobs/jobRepository';

import {
  alpha,
  layout,
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

import type { Job, JobStatus } from '../../types/jobs';

type Props = {
  navigation: CompositeNavigationProp<
    NativeStackNavigationProp<WorkStackParamList, 'MyJobs'>,
    CompositeNavigationProp<
      NativeStackNavigationProp<MyGainStackParamList>,
      BottomTabNavigationProp<BottomTabParamList>
    >
  >;
  route: NativeStackScreenProps<
    WorkStackParamList,
    'MyJobs'
  >['route'];
};

type StatusFilter = 'all' | JobStatus;

const FILTERS: {
  key: StatusFilter;
  label: string;
}[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function MyJobsScreen({
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
  const [filter, setFilter] = useState<StatusFilter>('all');

  const loadJobs = useCallback(
    async (showSpinner: boolean) => {
      const requestId = ++requestIdRef.current;

      if (showSpinner) {
        setLoading(true);
      }

      const result = await listMyPostedJobs();

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

  const visibleJobs = useMemo(() => {
    if (filter === 'all') {
      return jobs;
    }

    return jobs.filter((job) => job.status === filter);
  }, [filter, jobs]);

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <DGHeader
        showBackButton
        title="My Jobs"
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {FILTERS.map((item) => (
            <DGChip
              key={item.key}
              label={item.label}
              size="compact"
              selected={filter === item.key}
              onPress={() => {
                setFilter(item.key);
              }}
              style={styles.chip}
            />
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.card}>
            <DGSkeleton width="36%" height={12} />
            <DGSkeleton
              width="88%"
              height={18}
              style={styles.skeleton}
            />
          </View>
        ) : error ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>
              Jobs could not be loaded
            </Text>
            <Text style={styles.emptyBody}>{error}</Text>
            <Pressable
              onPress={() => {
                void loadJobs(true);
              }}
              style={styles.retry}
              accessibilityRole="button"
              accessibilityLabel="Retry loading jobs"
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : jobs.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>
              You haven't posted any jobs yet.
            </Text>
            <Text style={styles.emptyBody}>
              Post a job when you need trusted local help.
            </Text>
            <DGButton
              title="Post a job"
              fullWidth
              onPress={() => {
                navigation.navigate('Create', {
                  screen: 'CreateJob',
                });
              }}
              accessibilityLabel="Post a job"
            />
          </View>
        ) : visibleJobs.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>
              No jobs in this status
            </Text>
            <Text style={styles.emptyBody}>
              Try another filter to see the rest of your posted jobs.
            </Text>
          </View>
        ) : (
          visibleJobs.map((job) => (
            <JobWorkCard
              key={job.id}
              title={job.title}
              payLabel={job.payLabel}
              locationLabel={job.locationLabel}
              jobTypeLabel={job.jobTypeLabel}
              jobStatus={job.status}
              timeLabel={formatPostedLabel(job.publishedAt)}
              emphasizeAssignment={job.status === 'assigned'}
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

  chips: {
    paddingBottom: spacing.xs,
    gap: spacing.xs,
  },

  chip: {
    marginRight: 0,
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
