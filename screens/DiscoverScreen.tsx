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
  useState,
} from 'react';

import {
  Alert,
  StyleSheet,
  View,
} from 'react-native';

import DGDiscoverSkeleton from '../components/DGDiscoverSkeleton';
import DGScreen from '../components/layout/DGScreen';

import DGDiscoverFeed from '../components/discover/DGDiscoverFeed';

import DGDiscoverFeedTabs, {
  DiscoverFeedTab,
} from '../components/discover/DGDiscoverFeedTabs';

import DiscoverCreateSection from '../components/discover/DiscoverCreateSection';

import DiscoverOpportunityFeed, {
  DiscoverSectionKey,
} from '../components/discover/DiscoverOpportunityFeed';

import DiscoverOverviewSection from '../components/discover/DiscoverOverviewSection';
import DiscoverSearchSection from '../components/discover/DiscoverSearchSection';
import DiscoverTopSection from '../components/discover/DiscoverTopSection';

import {
  liveAuctions,
  nearbyJobs,
  regionSummary,
} from '../data/discoverMockData';

import {
  getDiscoverFeed,
} from '../data/selectors/getDiscoverFeed';

import useFocusedUnreadTotal from '../hooks/useFocusedUnreadTotal';
import useTabBarVisibility from '../hooks/useTabBarVisibility';

import type {
  DiscoverStackParamList,
} from '../navigation/DiscoverStack';

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
    selectedFeedTab,
    setSelectedFeedTab,
  ] = useState<DiscoverFeedTab>(
    'for-you',
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  useFocusEffect(
    useCallback(() => {
      showTabBar();
    }, [showTabBar]),
  );

  useEffect(() => {
    const loadingTimer = setTimeout(
      () => {
        setLoading(false);
      },
      1200,
    );

    return () => {
      clearTimeout(loadingTimer);
    };
  }, []);

  const normalizedSearch =
    searchQuery
      .trim()
      .toLowerCase();

  const filteredJobs =
    useMemo(() => {
      if (!normalizedSearch) {
        return nearbyJobs;
      }

      return nearbyJobs.filter(
        (job) =>
          job.title
            .toLowerCase()
            .includes(
              normalizedSearch,
            ) ||
          job.businessName
            .toLowerCase()
            .includes(
              normalizedSearch,
            ) ||
          job.location
            .toLowerCase()
            .includes(
              normalizedSearch,
            ) ||
          job.workType
            .toLowerCase()
            .includes(
              normalizedSearch,
            ),
      );
    }, [normalizedSearch]);

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

  function showComingSoon(
    feature: string,
  ) {
    Alert.alert(
      feature,
      `${feature} will be connected in a future Direct Gain release.`,
    );
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

  function handleRefresh() {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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

  if (loading) {
    return (
      <DGScreen
        scrollable
        contentContainerStyle={
          styles.loadingContent
        }
        onScroll={
          updateFromScroll
        }
      >
        <DGDiscoverSkeleton />
      </DGScreen>
    );
  }

  return (
    <DGScreen
      refreshing={refreshing}
      onRefresh={handleRefresh}
      onScroll={updateFromScroll}
      contentContainerStyle={
        styles.content
      }
    >
      <DiscoverTopSection
        userName="Liam"
        locationName="Sunshine Coast"
        locationRadius="Within 15 km"
        opportunityCount={143}
        listingCount={143}
        jobCount={17}
        auctionCount={8}
        notificationCount={3}
        unreadMessageCount={
          unreadMessageCount
        }
        onLocationPress={() => {
          showComingSoon(
            'Location settings',
          );
        }}
        onMessagesPress={() => {
          navigateTab(
            'Messages',
          );
        }}
        onNotificationsPress={() => {
          showComingSoon(
            'Notifications',
          );
        }}
        onExplorePress={() => {
          setExpandedSection(
            'market',
          );

          void selectionHaptic();
        }}
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

      <DiscoverOpportunityFeed
        searchQuery={
          searchQuery
        }
        jobs={filteredJobs}
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
          console.log(
            'Selected Discover listing:',
            listingId,
          );

          navigateTab(
            'Market',
          );
        }}
        onJobPress={(job) => {
          showComingSoon(
            job.title,
          );
        }}
        onJobsPress={() => {
          navigation.navigate(
            'DiscoverJobs',
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

  loadingContent: {
    paddingBottom:
      spacing.xxxl,
  },
});
