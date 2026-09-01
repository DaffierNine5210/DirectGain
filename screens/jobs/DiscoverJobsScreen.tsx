import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGChip from '../../components/DGChip';
import DGHeader from '../../components/DGHeader';
import DGSearchBar from '../../components/DGSearchBar';
import DGSkeleton from '../../components/DGSkeleton';
import JobCard from '../../components/jobs/JobCard';

import useFocusedUnreadTotal from '../../hooks/useFocusedUnreadTotal';
import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import type { DiscoverStackParamList } from '../../navigation/DiscoverStack';

import { formatJobCategory, formatJobType, formatViewerRegionLabel } from '../../services/jobs/jobAdapter';
import {
  getViewerJobRegion,
  listOpenJobs,
} from '../../services/jobs/jobRepository';

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

import {
  JOB_CATEGORIES,
  JOB_PAGE_SIZE,
  JOB_PAY_TYPES,
  JOB_TYPES,
  type Job,
  type JobCategory,
  type JobPayType,
  type JobType,
  type ViewerJobRegion,
} from '../../types/jobs';

type Props = NativeStackScreenProps<
  DiscoverStackParamList,
  'DiscoverJobs'
>;

type ExpandedPanel =
  | 'none'
  | 'category'
  | 'pay'
  | 'type';

type EmptyKind =
  | 'none'
  | 'error'
  | 'region'
  | 'filtered'
  | 'empty';

function JobCardSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonRow}>
        <DGSkeleton width="28%" height={10} />
        <DGSkeleton width={64} height={10} />
      </View>
      <DGSkeleton
        width="86%"
        height={16}
        style={styles.skeletonTitle}
      />
      <DGSkeleton width="40%" height={14} />
      <DGSkeleton
        width="94%"
        height={12}
        style={styles.skeletonPreview}
      />
    </View>
  );
}

export default function DiscoverJobsScreen({
  navigation,
}: Props) {
  const {
    updateFromScroll,
    showTabBar,
  } = useTabBarVisibility();

  const unreadMessageCount =
    useFocusedUnreadTotal();

  const [
    region,
    setRegion,
  ] =
    useState<ViewerJobRegion | null>(
      null,
    );

  const [
    searchInput,
    setSearchInput,
  ] =
    useState('');

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState('');

  const [
    localOnly,
    setLocalOnly,
  ] =
    useState(false);

  const [
    category,
    setCategory,
  ] =
    useState<JobCategory | null>(
      null,
    );

  const [
    payType,
    setPayType,
  ] =
    useState<JobPayType | null>(
      null,
    );

  const [
    jobType,
    setJobType,
  ] =
    useState<JobType | null>(null);

  const [
    expandedPanel,
    setExpandedPanel,
  ] =
    useState<ExpandedPanel>('none');

  const [
    jobs,
    setJobs,
  ] =
    useState<Job[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    loadingMore,
    setLoadingMore,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(null);

  const [
    hasMore,
    setHasMore,
  ] =
    useState(true);

  const requestIdRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const jobsRef = useRef<Job[]>([]);
  const refreshingRef = useRef(false);
  const mountedRef = useRef(true);

  const regionReady = Boolean(
    region?.state || region?.suburb,
  );

  const regionLabel =
    formatViewerRegionLabel(
      region?.suburb ?? null,
      region?.state ?? null,
    );

  const blockedByRegion =
    localOnly && !regionReady;

  const localRegion =
    localOnly && regionReady
      ? region
      : null;

  useFocusEffect(
    useCallback(() => {
      showTabBar();
    }, [showTabBar]),
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(
        searchInput.trim(),
      );
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput]);

  useEffect(() => {
    let active = true;

    async function loadRegion() {
      const next =
        await getViewerJobRegion();

      if (!active) {
        return;
      }

      setRegion(next);
    }

    void loadRegion();

    return () => {
      active = false;
    };
  }, []);

  const loadJobs = useCallback(
    async (
      mode: 'replace' | 'append',
    ) => {
      if (blockedByRegion) {
        requestIdRef.current += 1;
        setJobs([]);
        jobsRef.current = [];
        setError(null);
        setHasMore(false);
        hasMoreRef.current = false;
        setLoading(false);
        setRefreshing(false);
        refreshingRef.current = false;
        setLoadingMore(false);
        loadingMoreRef.current = false;
        return;
      }

      if (
        mode === 'append' &&
        (loadingMoreRef.current ||
          !hasMoreRef.current)
      ) {
        return;
      }

      const requestId =
        ++requestIdRef.current;

      if (mode === 'replace') {
        if (!refreshingRef.current) {
          setLoading(
            jobsRef.current.length ===
              0,
          );
        }
        setError(null);
        hasMoreRef.current = true;
        setHasMore(true);
      } else {
        loadingMoreRef.current = true;
        setLoadingMore(true);
      }

      const offset =
        mode === 'append'
          ? jobsRef.current.length
          : 0;

      const result =
        await listOpenJobs({
          offset,
          limit: JOB_PAGE_SIZE,
          search: searchQuery,
          region: localRegion,
          category,
          payType,
          jobType,
        });

      if (
        requestId !==
          requestIdRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      if (result.error) {
        if (mode === 'replace') {
          setJobs([]);
          jobsRef.current = [];
        }

        setError(result.error);
        setLoading(false);
        setRefreshing(false);
        refreshingRef.current = false;
        setLoadingMore(false);
        loadingMoreRef.current = false;
        return;
      }

      const nextJobs =
        mode === 'append'
          ? mergeJobs(
              jobsRef.current,
              result.jobs,
            )
          : result.jobs;

      jobsRef.current = nextJobs;
      setJobs(nextJobs);
      setError(null);

      const more =
        result.jobs.length ===
        JOB_PAGE_SIZE;

      hasMoreRef.current = more;
      setHasMore(more);
      setLoading(false);
      setRefreshing(false);
      refreshingRef.current = false;
      setLoadingMore(false);
      loadingMoreRef.current = false;
    },
    [
      blockedByRegion,
      category,
      jobType,
      localRegion,
      payType,
      searchQuery,
    ],
  );

  useEffect(() => {
    void loadJobs('replace');
  }, [loadJobs]);

  function openMessages() {
    const parentNavigation =
      navigation.getParent();

    if (parentNavigation) {
      parentNavigation.navigate(
        'Messages',
      );
      return;
    }

    Alert.alert(
      'Messages',
      'Messages could not be opened.',
    );
  }

  function handleRefresh() {
    if (refreshingRef.current) {
      return;
    }

    refreshingRef.current = true;
    setRefreshing(true);
    void loadJobs('replace');
  }

  function emptyKind(): EmptyKind {
    if (error) {
      return 'error';
    }

    if (blockedByRegion) {
      return 'region';
    }

    if (loading) {
      return 'none';
    }

    if (jobs.length > 0) {
      return 'none';
    }

    if (
      searchQuery ||
      localOnly ||
      category ||
      payType ||
      jobType
    ) {
      return 'filtered';
    }

    return 'empty';
  }

  const kind = emptyKind();

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <FlatList
        data={
          loading && jobs.length === 0
            ? []
            : jobs
        }
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <JobCard
              job={item}
              onPress={jobId => {
                navigation.navigate(
                  'JobDetail',
                  { jobId },
                );
              }}
            />
          </View>
        )}
        ListHeaderComponent={
          <View>
            <DGHeader
              showBackButton
              title="Discover Jobs"
              location={regionLabel}
              onBackPress={() => {
                navigation.goBack();
              }}
              secondaryAction={{
                icon:
                  'chatbubble-ellipses-outline',
                accessibilityLabel:
                  'Open messages',
                onPress: openMessages,
                badgeCount:
                  unreadMessageCount,
              }}
            />

            <View style={styles.searchWrap}>
              <DGSearchBar
                value={searchInput}
                onChangeText={setSearchInput}
                placeholder="Search jobs"
                showFilter
                filterActive={
                  expandedPanel ===
                    'type' ||
                  Boolean(jobType)
                }
                onFilterPress={() => {
                  setExpandedPanel(
                    current =>
                      current ===
                      'type'
                        ? 'none'
                        : 'type',
                  );
                }}
                onSubmit={value => {
                  setSearchQuery(
                    value.trim(),
                  );
                }}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.chipRow
              }
            >
              <DGChip
                label="All"
                size="compact"
                selected={
                  !localOnly &&
                  !category &&
                  !payType &&
                  !jobType
                }
                onPress={() => {
                  setLocalOnly(false);
                  setCategory(null);
                  setPayType(null);
                  setJobType(null);
                  setExpandedPanel('none');
                }}
                style={styles.chip}
              />
              <DGChip
                label="Local"
                size="compact"
                icon="location-outline"
                selected={localOnly}
                onPress={() => {
                  setLocalOnly(
                    current => !current,
                  );
                }}
                style={styles.chip}
              />
              <DGChip
                label={
                  category
                    ? formatJobCategory(
                        category,
                      )
                    : 'Category'
                }
                size="compact"
                selected={
                  expandedPanel ===
                    'category' ||
                  Boolean(category)
                }
                onPress={() => {
                  setExpandedPanel(
                    current =>
                      current ===
                      'category'
                        ? 'none'
                        : 'category',
                  );
                }}
                style={styles.chip}
              />
              <DGChip
                label={
                  payType
                    ? formatPayChip(
                        payType,
                      )
                    : 'Pay'
                }
                size="compact"
                selected={
                  expandedPanel ===
                    'pay' ||
                  Boolean(payType)
                }
                onPress={() => {
                  setExpandedPanel(
                    current =>
                      current === 'pay'
                        ? 'none'
                        : 'pay',
                  );
                }}
                style={styles.chip}
              />
            </ScrollView>

            {expandedPanel ===
            'category' ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.chipRow
                }
              >
                <DGChip
                  label="Any category"
                  size="compact"
                  selected={!category}
                  onPress={() => {
                    setCategory(null);
                  }}
                  style={styles.chip}
                />
                {JOB_CATEGORIES.filter(
                  value =>
                    value !== category,
                ).map(value => (
                  <DGChip
                    key={value}
                    label={formatJobCategory(
                      value,
                    )}
                    size="compact"
                    selected={false}
                    onPress={() => {
                      setCategory(value);
                    }}
                    style={styles.chip}
                  />
                ))}
              </ScrollView>
            ) : null}

            {expandedPanel === 'pay' ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.chipRow
                }
              >
                <DGChip
                  label="Any pay"
                  size="compact"
                  selected={!payType}
                  onPress={() => {
                    setPayType(null);
                  }}
                  style={styles.chip}
                />
                {JOB_PAY_TYPES.filter(
                  value =>
                    value !== payType,
                ).map(value => (
                  <DGChip
                    key={value}
                    label={formatPayChip(
                      value,
                    )}
                    size="compact"
                    selected={false}
                    onPress={() => {
                      setPayType(value);
                    }}
                    style={styles.chip}
                  />
                ))}
              </ScrollView>
            ) : null}

            {expandedPanel === 'type' ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.chipRow
                }
              >
                <DGChip
                  label="Any type"
                  size="compact"
                  selected={!jobType}
                  onPress={() => {
                    setJobType(null);
                  }}
                  style={styles.chip}
                />
                {JOB_TYPES.filter(
                  value =>
                    value !== jobType,
                ).map(value => (
                  <DGChip
                    key={value}
                    label={formatJobType(
                      value,
                    )}
                    size="compact"
                    selected={false}
                    onPress={() => {
                      setJobType(value);
                    }}
                    style={styles.chip}
                  />
                ))}
              </ScrollView>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          loading && jobs.length === 0 ? (
            <View>
              {Array.from(
                { length: 6 },
                (_, index) => (
                  <View
                    key={`skeleton-${index}`}
                    style={styles.cardWrap}
                  >
                    <JobCardSkeleton />
                  </View>
                ),
              )}
            </View>
          ) : (
            <EmptyState
              kind={kind}
              error={error}
              onRetry={() => {
                void loadJobs(
                  'replace',
                );
              }}
            />
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator
                color={
                  palette.opportunityGreen
                }
              />
            </View>
          ) : (
            <View style={styles.footerSpacer} />
          )
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={() => {
          Keyboard.dismiss();
        }}
        onScroll={event => {
          updateFromScroll(
            event.nativeEvent
              .contentOffset.y,
          );
        }}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={
              palette.opportunityGreen
            }
            colors={[
              palette.opportunityGreen,
            ]}
            progressBackgroundColor={
              surface.cardRaised
            }
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (
            !loading &&
            !refreshing &&
            hasMore
          ) {
            void loadJobs('append');
          }
        }}
        contentContainerStyle={
          styles.content
        }
      />
    </SafeAreaView>
  );
}

function formatPayChip(
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

function mergeJobs(
  current: Job[],
  incoming: Job[],
): Job[] {
  const seen = new Set(
    current.map(job => job.id),
  );
  const next = [...current];

  for (const job of incoming) {
    if (!seen.has(job.id)) {
      seen.add(job.id);
      next.push(job);
    }
  }

  return next;
}

function EmptyState({
  kind,
  error,
  onRetry,
}: {
  kind: EmptyKind;
  error: string | null;
  onRetry: () => void;
}) {
  if (kind === 'none') {
    return null;
  }

  const title =
    kind === 'error'
      ? 'Jobs could not be loaded'
      : kind === 'region'
        ? 'Region not set'
        : kind === 'filtered'
          ? 'No matching jobs'
          : 'No open jobs';

  const body =
    kind === 'error'
      ? error ??
        'Check your connection and try again.'
      : kind === 'region'
        ? 'Local shows open jobs in your profile suburb and state. Add a region to your profile to use this filter.'
        : kind === 'filtered'
          ? 'Try a different search or clear filters.'
          : 'There are no open jobs to show yet.';

  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={
            kind === 'error'
              ? 'alert-circle-outline'
              : 'briefcase-outline'
          }
          size={28}
          color={palette.opportunityGreen}
        />
      </View>
      <Text style={styles.emptyTitle}>
        {title}
      </Text>
      <Text style={styles.emptyBody}>
        {body}
      </Text>
      {kind === 'error' ? (
        <Pressable
          onPress={onRetry}
          style={styles.retry}
          accessibilityRole="button"
          accessibilityLabel="Retry loading jobs"
        >
          <Text style={styles.retryText}>
            Retry
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: surface.page,
  },

  content: {
    paddingBottom:
      layout.bottomNavigationClearance,
  },

  searchWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },

  chipRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingRight: spacing.md,
  },

  chip: {
    marginRight: spacing.xs,
  },

  cardWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },

  skeletonCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    padding: spacing.md,
  },

  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  skeletonTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },

  skeletonPreview: {
    marginTop: spacing.sm,
  },

  footer: {
    paddingVertical: spacing.lg,
  },

  footerSpacer: {
    height: spacing.md,
  },

  empty: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: alpha.green08,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: spacing.md,
    color: textColor.primary,
    ...typography.headingSmall,
    textAlign: 'center',
  },

  emptyBody: {
    marginTop: spacing.xs,
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },

  retry: {
    marginTop: spacing.md,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: palette.opportunityGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },

  retryText: {
    color: textColor.inverse,
    fontWeight: '800',
    fontSize: 14,
  },
});
