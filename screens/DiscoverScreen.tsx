import {
  useFocusEffect,
} from '@react-navigation/native';

import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import DGScreen from '../components/layout/DGScreen';

import DGDiscoverFeed from '../components/discover/DGDiscoverFeed';

import DGDiscoverFeedTabs, {
  DiscoverFeedTab,
} from '../components/discover/DGDiscoverFeedTabs';

import DiscoverCreateSection from '../components/discover/DiscoverCreateSection';

import {
  DISCOVER_JOBS_PREVIEW_LIMIT,
  type DiscoverJobsPreviewStatus,
} from '../components/DiscoverJobsPreview';
import {
  DISCOVER_MARKET_PREVIEW_LIMIT,
  type DiscoverMarketPreviewStatus,
} from '../components/DiscoverMarketPreview';
import DiscoverOpportunityFeed, {
  DiscoverSectionKey,
} from '../components/discover/DiscoverOpportunityFeed';

import DiscoverOverviewSection from '../components/discover/DiscoverOverviewSection';
import DiscoverSearchSection from '../components/discover/DiscoverSearchSection';
import DiscoverTopSection from '../components/discover/DiscoverTopSection';

import {
  liveAuctions,
  regionSummary,
} from '../data/discoverMockData';

import {
  getDiscoverFeed,
} from '../data/selectors/getDiscoverFeed';

import useFocusedUnreadTotal from '../hooks/useFocusedUnreadTotal';
import { useResolvedProfileAvatar } from '../hooks/useResolvedProfileAvatar';
import useTabBarVisibility from '../hooks/useTabBarVisibility';

import type {
  DiscoverStackParamList,
} from '../navigation/DiscoverStack';

import {
  listingMatchesMarketSearch,
  toMarketFeedCard,
  type MarketFeedCardPresentation,
} from '../services/market/marketFeedPresentation';
import { resolveJobCoverPhotos } from '../services/jobs/jobMediaRepository';
import { listOpenJobs } from '../services/jobs/jobRepository';
import { listActiveMarketListings } from '../services/market/marketListingsRepository';
import {
  formatProfileLocation,
  profileInitials,
} from '../services/profile/profileAdapter';
import { getOwnProfile } from '../services/profile/profileRepository';
import type {
  Job,
  JobCoverPresentation,
} from '../types/jobs';
import type { ActiveMarketListingFeedItem } from '../types/marketListing';
import type { DirectGainProfile } from '../types/profile';

import {
  openMessagesInbox,
} from '../navigation/messages';

import type {
  BottomTabParamList,
} from '../navigation/BottomTabs';

import {
  spacing,
} from '../theme/designSystem';

import {
  selectionHaptic,
} from '../utils/haptics';

type Props =
  NativeStackScreenProps<
    DiscoverStackParamList,
    'DiscoverHome'
  >;

export default function DiscoverScreen({
  navigation,
}: Props) {

  const {
    updateFromScroll,
    showTabBar,
  } = useTabBarVisibility();

  const unreadMessageCount =
    useFocusedUnreadTotal();

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('');

  const [
    filterActive,
    setFilterActive,
  ] = useState(false);

  const [
    expandedSection,
    setExpandedSection,
  ] = useState<DiscoverSectionKey>(
    'market',
  );

  const [
    jobsSectionExpanded,
    setJobsSectionExpanded,
  ] = useState(true);

  const [
    selectedFeedTab,
    setSelectedFeedTab,
  ] = useState<DiscoverFeedTab>(
    'for-you',
  );

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    ownProfile,
    setOwnProfile,
  ] = useState<DirectGainProfile | null>(
    null,
  );

  const [
    marketItems,
    setMarketItems,
  ] = useState<ActiveMarketListingFeedItem[]>(
    [],
  );

  const [
    marketError,
    setMarketError,
  ] = useState<string | null>(null);

  const [
    marketLoading,
    setMarketLoading,
  ] = useState(true);

  const mountedRef = useRef(true);
  const marketHasLoadedRef = useRef(false);
  const marketRequestIdRef = useRef(0);
  const marketInFlightRef = useRef(false);
  const [
    jobItems,
    setJobItems,
  ] = useState<Job[]>([]);

  const [
    jobCovers,
    setJobCovers,
  ] = useState<Record<string, JobCoverPresentation>>(
    {},
  );

  const [
    jobsError,
    setJobsError,
  ] = useState<string | null>(null);

  const [
    jobsLoading,
    setJobsLoading,
  ] = useState(true);

  const loadMarketRef = useRef<
    (mode: 'initial' | 'refresh' | 'silent') => Promise<void>
  >(async () => {});
  const jobsHasLoadedRef = useRef(false);
  const jobsRequestIdRef = useRef(0);
  const jobsInFlightRef = useRef(false);
  const loadJobsRef = useRef<
    (mode: 'initial' | 'refresh' | 'silent') => Promise<void>
  >(async () => {});
  const profileHasLoadedRef = useRef(false);
  const profileRequestIdRef = useRef(0);
  const profileInFlightRef = useRef(false);
  const loadProfileRef = useRef<
    (mode: 'initial' | 'refresh' | 'silent') => Promise<void>
  >(async () => {});
  const scrollViewRef = useRef<ScrollView>(null);
  const opportunityOffsetYRef = useRef(0);

  const loadMarket = useCallback(
    async (mode: 'initial' | 'refresh' | 'silent') => {
      if (mode === 'silent' && marketInFlightRef.current) {
        return;
      }

      const requestId = ++marketRequestIdRef.current;
      marketInFlightRef.current = true;

      if (mode === 'initial') {
        setMarketLoading(true);
      }

      const feedResult = await listActiveMarketListings();

      if (
        requestId !== marketRequestIdRef.current ||
        !mountedRef.current
      ) {
        if (requestId === marketRequestIdRef.current) {
          marketInFlightRef.current = false;
        }
        return;
      }

      if (feedResult.error) {
        if (mode !== 'silent') {
          setMarketError(feedResult.error);
          setMarketItems([]);
        }
      } else {
        setMarketError(null);
        setMarketItems(feedResult.listings);
      }

      marketHasLoadedRef.current = true;
      marketInFlightRef.current = false;
      setMarketLoading(false);
    },
    [],
  );

  loadMarketRef.current = loadMarket;

  const loadJobs = useCallback(
    async (mode: 'initial' | 'refresh' | 'silent') => {
      if (mode === 'silent' && jobsInFlightRef.current) {
        return;
      }

      const requestId = ++jobsRequestIdRef.current;
      jobsInFlightRef.current = true;

      if (mode === 'initial') {
        setJobsLoading(true);
      }

      const feedResult = await listOpenJobs({
        offset: 0,
        limit: DISCOVER_JOBS_PREVIEW_LIMIT,
      });

      if (
        requestId !== jobsRequestIdRef.current ||
        !mountedRef.current
      ) {
        if (requestId === jobsRequestIdRef.current) {
          jobsInFlightRef.current = false;
        }
        return;
      }

      if (feedResult.error) {
        if (mode !== 'silent') {
          setJobsError(feedResult.error);
          setJobItems([]);
          setJobCovers({});
        }

        jobsHasLoadedRef.current = true;
        jobsInFlightRef.current = false;
        setJobsLoading(false);
        return;
      }

      const covers = await resolveJobCoverPhotos(
        feedResult.jobs.map((job) => job.id),
      );

      if (
        requestId !== jobsRequestIdRef.current ||
        !mountedRef.current
      ) {
        if (requestId === jobsRequestIdRef.current) {
          jobsInFlightRef.current = false;
        }
        return;
      }

      setJobsError(null);
      setJobItems(feedResult.jobs);
      setJobCovers(covers);
      jobsHasLoadedRef.current = true;
      jobsInFlightRef.current = false;
      setJobsLoading(false);
    },
    [],
  );

  loadJobsRef.current = loadJobs;

  const loadProfile = useCallback(
    async (mode: 'initial' | 'refresh' | 'silent') => {
      if (mode === 'silent' && profileInFlightRef.current) {
        return;
      }

      const requestId = ++profileRequestIdRef.current;
      profileInFlightRef.current = true;

      const result = await getOwnProfile();

      if (
        requestId !== profileRequestIdRef.current ||
        !mountedRef.current
      ) {
        if (requestId === profileRequestIdRef.current) {
          profileInFlightRef.current = false;
        }
        return;
      }

      if (result.profile) {
        setOwnProfile(result.profile);
      } else if (mode === 'initial') {
        setOwnProfile(null);
      }

      profileHasLoadedRef.current = true;
      profileInFlightRef.current = false;
    },
    [],
  );

  loadProfileRef.current = loadProfile;

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    void loadMarket('initial');
  }, [loadMarket]);

  useEffect(() => {
    void loadJobs('initial');
  }, [loadJobs]);

  useEffect(() => {
    void loadProfile('initial');
  }, [loadProfile]);

  useFocusEffect(
    useCallback(() => {
      showTabBar();

      if (marketHasLoadedRef.current) {
        void loadMarketRef.current('silent');
      }

      if (jobsHasLoadedRef.current) {
        void loadJobsRef.current('silent');
      }

      if (profileHasLoadedRef.current) {
        void loadProfileRef.current('silent');
      }
    }, [showTabBar]),
  );

  const normalizedSearch =
    searchQuery
      .trim()
      .toLowerCase();

  const filteredAuctions =
    useMemo(() => {
      if (!normalizedSearch) {
        return liveAuctions;
      }

      return liveAuctions.filter(
        (auction) =>
          auction.title
            .toLowerCase()
            .includes(
              normalizedSearch,
            ) ||
          auction.sellerName
            .toLowerCase()
            .includes(
              normalizedSearch,
            ) ||
          auction.location
            .toLowerCase()
            .includes(
              normalizedSearch,
            ),
      );
    }, [normalizedSearch]);

  const socialFeedItems =
    useMemo(
      () =>
        getDiscoverFeed(
          selectedFeedTab,
        ),
      [selectedFeedTab],
    );

  const marketPreviewCards = useMemo(() => {
    const matched: MarketFeedCardPresentation[] = [];

    for (const item of marketItems) {
      const card = toMarketFeedCard(item);

      if (
        !listingMatchesMarketSearch(
          card,
          searchQuery,
          item,
        )
      ) {
        continue;
      }

      matched.push(card);

      if (matched.length >= DISCOVER_MARKET_PREVIEW_LIMIT) {
        break;
      }
    }

    return matched;
  }, [marketItems, searchQuery]);

  const marketStatus: DiscoverMarketPreviewStatus = marketLoading
    ? 'loading'
    : marketError
      ? 'error'
      : marketPreviewCards.length === 0
        ? 'empty'
        : 'ready';

  const marketBadgeText =
    marketStatus === 'ready' || marketStatus === 'empty'
      ? String(marketItems.length)
      : undefined;

  const jobsStatus: DiscoverJobsPreviewStatus = jobsLoading
    ? 'loading'
    : jobsError
      ? 'error'
      : jobItems.length === 0
        ? 'empty'
        : 'ready';

  const {
    imageUri: ownAvatarUri,
  } = useResolvedProfileAvatar(
    ownProfile?.avatarPath,
  );

  const greeting = timeOfDayGreeting(
    greetingFirstName(ownProfile?.displayName),
  );

  const locationLabel = ownAreaLabel(
    ownProfile?.suburb ?? null,
    ownProfile?.state ?? null,
  );

  const heroInitials = ownProfile
    ? profileInitials(ownProfile.displayName)
    : 'DG';

  function navigateTab(
    name: keyof BottomTabParamList,
  ) {
    const parentNavigation =
      navigation.getParent();

    if (parentNavigation) {
      parentNavigation.navigate(
        name,
      );
    }
  }

  function handleSectionChange(
    section: Exclude<
      DiscoverSectionKey,
      null
    >,
    expanded: boolean,
  ) {
    setExpandedSection(
      expanded
        ? section
        : null,
    );
  }

  async function handleRefresh() {
    if (refreshing) {
      return;
    }

    setRefreshing(true);
    await Promise.all([
      loadMarket('refresh'),
      loadJobs('refresh'),
      loadProfile('refresh'),
    ]);

    if (mountedRef.current) {
      setRefreshing(false);
    }
  }

  function handleSearchSubmit(
    query: string,
  ) {
    const trimmedQuery =
      query.trim();

    if (!trimmedQuery) {
      return;
    }

    Alert.alert(
      'Local search',
      `Showing opportunities matching “${trimmedQuery}”.`,
    );
  }

  function handleExplorePress() {
    void selectionHaptic();
    setExpandedSection('market');
    setJobsSectionExpanded(true);

    requestAnimationFrame(() => {
      const y = Math.max(
        0,
        opportunityOffsetYRef.current - 8,
      );

      scrollViewRef.current?.scrollTo({
        y,
        animated: true,
      });
    });
  }

  return (
    <DGScreen
      refreshing={refreshing}
      onRefresh={handleRefresh}
      onScroll={updateFromScroll}
      scrollViewRef={scrollViewRef}
      contentContainerStyle={
        styles.content
      }
    >
      <DiscoverTopSection
        greeting={greeting}
        locationLabel={locationLabel}
        initials={heroInitials}
        avatarImage={
          ownAvatarUri
            ? { uri: ownAvatarUri }
            : undefined
        }
        unreadMessageCount={
          unreadMessageCount
        }
        onMessagesPress={() => {
          if (
            !openMessagesInbox(
              navigation,
            )
          ) {
            Alert.alert(
              'Messages',
              'Messages could not be opened.',
            );
          }
        }}
        onExplorePress={handleExplorePress}
      />

      <DiscoverSearchSection
        value={searchQuery}
        filterActive={
          filterActive
        }
        locationName="Sunshine Coast"
        locationRadius="Within 15 km"
        onChangeText={
          setSearchQuery
        }
        onFilterPress={() => {
          setFilterActive(
            (current) =>
              !current,
          );
        }}
        onClearFilter={() => {
          setFilterActive(false);
        }}
        onSubmit={
          handleSearchSubmit
        }
      />

      <View
        style={
          styles.socialFeedSection
        }
      >
        <DGDiscoverFeedTabs
          selectedTab={
            selectedFeedTab
          }
          onTabChange={
            setSelectedFeedTab
          }
        />

        <View
          style={
            styles.socialFeedContent
          }
        >
          <DGDiscoverFeed
            items={
              socialFeedItems
            }
            onItemPress={(
              item,
            ) => {
              Alert.alert(
                item.title ??
                  'Direct Gain',
                `Open ${item.type} coming next.`,
              );
            }}
            onAuthorPress={(
              authorId,
            ) => {
              Alert.alert(
                'Gain Profile',
                `Open profile: ${authorId}`,
              );
            }}
            onLikePress={(
              item,
            ) => {
              Alert.alert(
                'Like',
                `Liked ${
                  item.title ??
                  'this post'
                }.`,
              );
            }}
            onCommentPress={(
              item,
            ) => {
              Alert.alert(
                'Comments',
                `Comments for ${
                  item.title ??
                  'this post'
                } coming next.`,
              );
            }}
            onSharePress={(
              item,
            ) => {
              Alert.alert(
                'Share',
                `Share ${
                  item.title ??
                  'this post'
                }.`,
              );
            }}
          />
        </View>
      </View>

      <View
        onLayout={(event) => {
          opportunityOffsetYRef.current =
            event.nativeEvent.layout.y;
        }}
      >
      <DiscoverOpportunityFeed
        marketStatus={marketStatus}
        marketCards={marketPreviewCards}
        marketErrorMessage={marketError}
        marketBadgeText={marketBadgeText}
        onMarketRetry={() => {
          void loadMarket('initial');
        }}
        jobsSectionExpanded={jobsSectionExpanded}
        onJobsSectionChange={setJobsSectionExpanded}
        jobsStatus={jobsStatus}
        jobs={jobItems}
        jobCovers={jobCovers}
        jobsErrorMessage={jobsError}
        onJobsRetry={() => {
          void loadJobs('initial');
        }}
        onJobPress={(jobId) => {
          navigation.navigate('JobDetail', {
            jobId,
          });
        }}
        onBrowseJobsPress={() => {
          void selectionHaptic();
          navigation.navigate('DiscoverJobs');
        }}
        auctions={
          filteredAuctions
        }
        expandedSection={
          expandedSection
        }
        onSectionChange={
          handleSectionChange
        }
        onMarketPress={() => {
          navigateTab(
            'Market',
          );
        }}
        onListingPress={(
          listingId,
        ) => {
          navigation.navigate(
            'ListingDetail',
            {
              listingId,
            },
          );
        }}
        onAuctionPress={() => {
          navigateTab(
            'Auctions',
          );
        }}
        onAuctionsPress={() => {
          navigateTab(
            'Auctions',
          );
        }}
      />
      </View>

      <DiscoverOverviewSection
        regionName="Sunshine Coast"
        items={regionSummary}
        gainScore={86}
        identityVerified
        professionalVerified
        communityTrusted
        expandedSection={
          expandedSection
        }
        onSectionChange={
          handleSectionChange
        }
      />

      <DiscoverCreateSection
        onPress={() => {
          navigateTab(
            'Create',
          );
        }}
      />
    </DGScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom:
      spacing.xxxl,
  },

  socialFeedSection: {
    width: '100%',

    marginTop: spacing.lg,

    paddingHorizontal:
      spacing.lg,
  },

  socialFeedContent: {
    width: '100%',

    marginTop: spacing.md,
  },
});

function timeOfDayGreeting(
  firstName: string | null,
): string {
  const hour = new Date().getHours();
  const part =
    hour < 12
      ? 'Good morning'
      : hour < 17
        ? 'Good afternoon'
        : 'Good evening';

  if (!firstName) {
    return part;
  }

  return `${part}, ${firstName}`;
}

function greetingFirstName(
  displayName: string | null | undefined,
): string | null {
  const first = displayName
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)[0];

  return first ?? null;
}

function ownAreaLabel(
  suburb: string | null,
  state: string | null,
): string | null {
  const location = formatProfileLocation(
    suburb,
    state,
  );

  return location
    ? `Your area: ${location}`
    : null;
}
