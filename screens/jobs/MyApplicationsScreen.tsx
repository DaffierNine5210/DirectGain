import { useCallback, useEffect, useRef, useState } from 'react';
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
import DGHeader from '../../components/DGHeader';
import DGSkeleton from '../../components/DGSkeleton';
import JobWorkCard from '../../components/jobs/JobWorkCard';

import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import type { BottomTabParamList } from '../../navigation/BottomTabs';
import type { MyGainStackParamList } from '../../navigation/MyGainStack';
import type { WorkStackParamList } from '../../navigation/WorkStack';

import { formatPostedLabel } from '../../services/jobs/jobAdapter';
import { listMyApplications } from '../../services/jobs/jobApplicationRepository';

import {
  alpha,
  layout,
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

import type { MyWorkApplication } from '../../types/jobs';

type Props = {
  navigation: CompositeNavigationProp<
    NativeStackNavigationProp<WorkStackParamList, 'MyApplications'>,
    CompositeNavigationProp<
      NativeStackNavigationProp<MyGainStackParamList>,
      BottomTabNavigationProp<BottomTabParamList>
    >
  >;
  route: NativeStackScreenProps<
    WorkStackParamList,
    'MyApplications'
  >['route'];
};

export default function MyApplicationsScreen({
  navigation,
}: Props) {
  const { showTabBar } = useTabBarVisibility();
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const loadRef = useRef<
    (showSpinner: boolean) => Promise<void>
  >(async () => {});

  const [
    applications,
    setApplications,
  ] = useState<MyWorkApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = useCallback(
    async (showSpinner: boolean) => {
      const requestId = ++requestIdRef.current;

      if (showSpinner) {
        setLoading(true);
      }

      const result = await listMyApplications();

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
    [],
  );

  loadRef.current = loadApplications;

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
        title="My Applications"
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
        {loading ? (
          <View style={styles.card}>
            <DGSkeleton width="42%" height={12} />
            <DGSkeleton
              width="90%"
              height={18}
              style={styles.skeleton}
            />
          </View>
        ) : error ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>
              Applications could not be loaded
            </Text>
            <Text style={styles.emptyBody}>{error}</Text>
            <Pressable
              onPress={() => {
                void loadApplications(true);
              }}
              style={styles.retry}
              accessibilityRole="button"
              accessibilityLabel="Retry loading applications"
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : applications.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>
              You haven't applied for any jobs yet.
            </Text>
            <Text style={styles.emptyBody}>
              Browse open jobs and send a short application when you are a good fit.
            </Text>
            <DGButton
              title="Find jobs"
              fullWidth
              onPress={() => {
                navigation.navigate('Discover', {
                  screen: 'DiscoverJobs',
                });
              }}
              accessibilityLabel="Find jobs"
            />
          </View>
        ) : (
          applications.map((item) => {
            const job = item.job;
            const selected = item.status === 'selected';

            return (
              <JobWorkCard
                key={item.id}
                title={job?.title ?? 'Job unavailable'}
                payLabel={job?.payLabel ?? 'Pay unavailable'}
                locationLabel={
                  job?.locationLabel ?? 'Location unavailable'
                }
                jobTypeLabel={job?.jobTypeLabel}
                jobStatus={job?.status ?? 'cancelled'}
                applicationStatus={item.status}
                timeLabel={`Applied ${formatPostedLabel(item.createdAt)}`}
                emphasizeAssignment={selected}
                onPress={() => {
                  if (!job) {
                    return;
                  }

                  navigation.navigate('JobDetail', {
                    jobId: job.id,
                  });
                }}
              />
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
