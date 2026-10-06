import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGButton from '../components/DGButton';
import DGChip from '../components/DGChip';
import DGHeader from '../components/DGHeader';
import DGSkeleton from '../components/DGSkeleton';
import OwnMarketListingRow from '../components/market/OwnMarketListingRow';

import useTabBarVisibility from '../hooks/useTabBarVisibility';

import type { BottomTabParamList } from '../navigation/BottomTabs';
import type { MarketStackParamList } from '../navigation/MarketStack';

import { formatListingCreatedOn } from '../services/market/listingPreviewPresentation';
import { formatViewerRegionLabel } from '../services/market/marketFeedPresentation';
import { listOwnMarketListings } from '../services/market/marketListingsRepository';
import formatListingPrice from '../utils/listing/formatListingPrice';

import type {
  MarketListingStatus,
  OwnMarketListingFeedItem,
} from '../types/marketListing';

import {
  alpha,
  layout,
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../theme/designSystem';

type Props = {
  navigation: CompositeNavigationProp<
    NativeStackNavigationProp<MarketStackParamList, 'MyListings'>,
    BottomTabNavigationProp<BottomTabParamList>
  >;
  route: NativeStackScreenProps<
    MarketStackParamList,
    'MyListings'
  >['route'];
};

type StatusFilter =
  | 'all'
  | 'active'
  | 'paused'
  | 'draft'
  | 'sold'
  | 'reserved'
  | 'removed';

function formatOwnListingStatus(
  status: MarketListingStatus,
): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'active':
      return 'Active';
    case 'paused':
      return 'Paused';
    case 'reserved':
      return 'Reserved';
    case 'sold':
      return 'Sold';
    case 'removed':
      return 'Removed';
  }
}

function dateLabelForListing(
  item: OwnMarketListingFeedItem,
): string {
  const created = formatListingCreatedOn(item.listing.createdAt);

  if (created === 'Listed date unavailable') {
    return item.listing.status === 'draft'
      ? 'Created date unavailable'
      : created;
  }

  if (item.listing.status === 'draft') {
    return `Created ${created}`;
  }

  return `Listed ${created}`;
}

function emptyCopyForFilter(
  filter: StatusFilter,
): { title: string; body: string } {
  switch (filter) {
    case 'active':
      return {
        title: 'No active listings',
        body: 'Listings that are live on Market will appear here.',
      };
    case 'paused':
      return {
        title: 'No paused listings',
        body: 'Listings you have paused will appear here.',
      };
    case 'draft':
      return {
        title: 'No draft listings',
        body: 'Unpublished drafts will appear here.',
      };
    case 'sold':
      return {
        title: 'No sold listings',
        body: 'Listings marked sold will appear here.',
      };
    case 'reserved':
      return {
        title: 'No reserved listings',
        body: 'Reserved listings will appear here if that status is used.',
      };
    case 'removed':
      return {
        title: 'No removed listings',
        body: 'Archived listings will appear here.',
      };
    default:
      return {
        title: "You haven't listed anything yet.",
        body: 'Use Create to list something on Market.',
      };
  }
}

export default function MyListingsScreen({
  navigation,
}: Props) {
  const { showTabBar } = useTabBarVisibility();
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const loadRef = useRef<(showSpinner: boolean) => Promise<void>>(
    async () => {},
  );

  const [items, setItems] = useState<OwnMarketListingFeedItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');

  const loadListings = useCallback(async (showSpinner: boolean) => {
    const requestId = ++requestIdRef.current;

    if (showSpinner) {
      setLoading(true);
    }

    const result = await listOwnMarketListings();

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
      setItems([]);
      return;
    }

    setError(null);
    setItems(result.listings);
  }, []);

  loadRef.current = loadListings;

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
    void loadListings(true);

    return () => {
      mountedRef.current = false;
    };
  }, [loadListings]);

  const counts = useMemo(() => {
    let active = 0;
    let paused = 0;
    let draft = 0;
    let sold = 0;
    let reserved = 0;
    let removed = 0;

    for (const item of items) {
      switch (item.listing.status) {
        case 'active':
          active += 1;
          break;
        case 'paused':
          paused += 1;
          break;
        case 'draft':
          draft += 1;
          break;
        case 'sold':
          sold += 1;
          break;
        case 'reserved':
          reserved += 1;
          break;
        case 'removed':
          removed += 1;
          break;
      }
    }

    return {
      active,
      paused,
      draft,
      sold,
      reserved,
      removed,
      all: items.length - removed,
    };
  }, [items]);

  const filters = useMemo(() => {
    const next: {
      key: StatusFilter;
      label: string;
      count: number;
      accessibilityLabel: string;
    }[] = [
      {
        key: 'all',
        label: `All · ${counts.all}`,
        count: counts.all,
        accessibilityLabel: `All listings, ${counts.all}`,
      },
      {
        key: 'active',
        label: `Active · ${counts.active}`,
        count: counts.active,
        accessibilityLabel: `Active listings, ${counts.active}`,
      },
      {
        key: 'paused',
        label: `Paused · ${counts.paused}`,
        count: counts.paused,
        accessibilityLabel: `Paused listings, ${counts.paused}`,
      },
      {
        key: 'draft',
        label: `Drafts · ${counts.draft}`,
        count: counts.draft,
        accessibilityLabel: `Draft listings, ${counts.draft}`,
      },
      {
        key: 'sold',
        label: `Sold · ${counts.sold}`,
        count: counts.sold,
        accessibilityLabel: `Sold listings, ${counts.sold}`,
      },
    ];

    if (counts.reserved > 0) {
      next.push({
        key: 'reserved',
        label: `Reserved · ${counts.reserved}`,
        count: counts.reserved,
        accessibilityLabel: `Reserved listings, ${counts.reserved}`,
      });
    }

    if (counts.removed > 0) {
      next.push({
        key: 'removed',
        label: `Removed · ${counts.removed}`,
        count: counts.removed,
        accessibilityLabel: `Removed listings, ${counts.removed}`,
      });
    }

    return next;
  }, [counts]);

  useEffect(() => {
    if (filter === 'reserved' && counts.reserved === 0) {
      setFilter('all');
    }

    if (filter === 'removed' && counts.removed === 0) {
      setFilter('all');
    }
  }, [counts.removed, counts.reserved, filter]);

  const visibleItems = useMemo(() => {
    if (filter === 'all') {
      return items.filter(
        (item) => item.listing.status !== 'removed',
      );
    }

    return items.filter((item) => item.listing.status === filter);
  }, [filter, items]);

  function openCreateListing(listingId?: string) {
    if (listingId) {
      navigation.navigate('Create', {
        screen: 'CreateListing',
        params: {
          listingId,
        },
      });
      return;
    }

    navigation.navigate('Create', {
      screen: 'CreateListing',
    });
  }

  function onPressItem(item: OwnMarketListingFeedItem) {
    if (item.listing.status === 'draft') {
      openCreateListing(item.listing.id);
      return;
    }

    navigation.navigate('ManageListing', {
      listingId: item.listing.id,
    });
  }

  const empty = emptyCopyForFilter(filter);

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <DGHeader
        showBackButton
        title="My Listings"
        onBackPress={() => {
          navigation.goBack();
        }}
        style={styles.header}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadListings(false);
            }}
            tintColor={palette.opportunityGreen}
          />
        }
      >
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.filters}
          contentContainerStyle={styles.chips}
        >
          {filters.map((item) => (
            <DGChip
              key={item.key}
              label={item.label}
              size="compact"
              selected={filter === item.key}
              onPress={() => {
                setFilter(item.key);
              }}
              accessibilityLabel={item.accessibilityLabel}
              style={styles.chip}
            />
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.card}>
            <DGSkeleton width="28%" height={12} />
            <DGSkeleton
              width="88%"
              height={18}
              style={styles.skeleton}
            />
          </View>
        ) : error ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>
              Listings could not be loaded
            </Text>
            <Text style={styles.emptyBody}>{error}</Text>
            <Pressable
              onPress={() => {
                void loadListings(true);
              }}
              style={styles.retry}
              accessibilityRole="button"
              accessibilityLabel="Retry loading listings"
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>{empty.title}</Text>
            <Text style={styles.emptyBody}>{empty.body}</Text>
            <DGButton
              title="Create listing"
              fullWidth
              onPress={() => {
                openCreateListing();
              }}
              accessibilityLabel="Create listing"
            />
          </View>
        ) : visibleItems.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>{empty.title}</Text>
            <Text style={styles.emptyBody}>{empty.body}</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {visibleItems.map((item) => {
              const locationLabel = formatViewerRegionLabel({
                suburb: item.listing.suburb,
                state: item.listing.state,
              });

              return (
                <OwnMarketListingRow
                  key={item.listing.id}
                  item={item}
                  title={item.listing.title}
                  priceLabel={formatListingPrice(
                    item.listing.price,
                    item.listing.currency,
                  )}
                  statusLabel={formatOwnListingStatus(
                    item.listing.status,
                  )}
                  locationLabel={
                    locationLabel === 'Your area'
                      ? ''
                      : locationLabel
                  }
                  dateLabel={dateLabelForListing(item)}
                  onPress={() => {
                    onPressItem(item);
                  }}
                />
              );
            })}
          </View>
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

  header: {
    paddingBottom: spacing.xs,
  },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: 0,
    paddingBottom: layout.bottomNavigationClearance,
    gap: spacing.xs,
  },

  filters: {
    flexGrow: 0,
  },

  chips: {
    alignItems: 'center',
    gap: 6,
  },

  chip: {
    marginRight: 0,
  },

  list: {
    gap: spacing.xs,
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
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },

  retryText: {
    color: palette.opportunityGreen,
    fontSize: 14,
    fontWeight: '800',
  },
});
