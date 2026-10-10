import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGButton from '../components/DGButton';
import DGChip from '../components/DGChip';
import DGHeader from '../components/DGHeader';
import DGListingSkeleton from '../components/DGListingSkeleton';
import DGSearchBar from '../components/DGSearchBar';
import MarketListingCard from '../components/MarketListingCard';

import useFocusedUnreadTotal from '../hooks/useFocusedUnreadTotal';
import useTabBarVisibility from '../hooks/useTabBarVisibility';
import type { MarketStackParamList } from '../navigation/MarketStack';
import {
  openMessagesInbox,
} from '../navigation/messages';

import {
  formatViewerRegionLabel,
  listingMatchesMarketSearch,
  toMarketFeedCard,
  type MarketFeedCardPresentation,
} from '../services/market/marketFeedPresentation';
import {
  getViewerListingRegion,
  listActiveMarketListings,
} from '../services/market/marketListingsRepository';
import type {
  ActiveMarketListingFeedItem,
  ViewerListingRegion,
} from '../types/marketListing';

import {
  alpha,
  layout,
  motion,
  palette,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../theme/designSystem';

type Props = NativeStackScreenProps<
  MarketStackParamList,
  'MarketHome'
>;

type MarketLayout = 'grid' | 'list';

type CategoryItem = {
  label: string;
  icon: React.ComponentProps<
    typeof Ionicons
  >['name'];
};

type SkeletonItem = {
  id: string;
  skeleton: true;
};

type MarketListItem =
  | MarketFeedCardPresentation
  | SkeletonItem;

const categories: CategoryItem[] = [
  {
    label: 'All',
    icon: 'grid-outline',
  },
  {
    label: 'Vehicles',
    icon: 'car-outline',
  },
  {
    label: 'Tools',
    icon: 'construct-outline',
  },
  {
    label: 'Electronics',
    icon: 'phone-portrait-outline',
  },
  {
    label: 'Clothing',
    icon: 'shirt-outline',
  },
  {
    label: 'Furniture',
    icon: 'bed-outline',
  },
  {
    label: 'Property',
    icon: 'home-outline',
  },
  {
    label: 'Antiques',
    icon: 'time-outline',
  },
  {
    label: 'Collectables',
    icon: 'diamond-outline',
  },
];

const skeletonItems: SkeletonItem[] =
  Array.from(
    {
      length: 8,
    },
    (_, index) => ({
      id: `market-skeleton-${index}`,
      skeleton: true,
    }),
  );

function isSkeletonItem(
  item: MarketListItem,
): item is SkeletonItem {
  return 'skeleton' in item;
}

export default function MarketScreen({
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
    selectedCategory,
    setSelectedCategory,
  ] = useState('All');

  const [
    layoutMode,
    setLayoutMode,
  ] = useState<MarketLayout>('grid');

  const [feedItems, setFeedItems] =
    useState<ActiveMarketListingFeedItem[]>(
      [],
    );

  const [regionLabel, setRegionLabel] =
    useState<string | null>(null);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const mountedRef = useRef(true);
  const hasLoadedRef = useRef(false);
  const feedRequestIdRef = useRef(0);
  const feedInFlightRef = useRef(false);
  const loadFeedRef = useRef<
    (mode: 'initial' | 'refresh' | 'silent') => Promise<void>
  >(async () => {});

  useFocusEffect(
    useCallback(() => {
      showTabBar();

      if (hasLoadedRef.current) {
        void loadFeedRef.current('silent');
      }
    }, [showTabBar]),
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadFeed = useCallback(
    async (mode: 'initial' | 'refresh' | 'silent') => {
      if (mode === 'silent' && feedInFlightRef.current) {
        return;
      }

      const requestId = ++feedRequestIdRef.current;
      feedInFlightRef.current = true;

      if (mode === 'initial') {
        setLoading(true);
      } else if (mode === 'refresh') {
        setRefreshing(true);
      }

      const [feedResult, region] =
        await Promise.all([
          listActiveMarketListings(),
          getViewerListingRegion(),
        ]);

      if (
        requestId !== feedRequestIdRef.current ||
        !mountedRef.current
      ) {
        if (requestId === feedRequestIdRef.current) {
          feedInFlightRef.current = false;
        }
        return;
      }

      setRegionLabel(
        marketViewerAreaLabel(region),
      );

      if (feedResult.error) {
        if (mode !== 'silent') {
          setLoadError(feedResult.error);
          setFeedItems([]);
        }
      } else {
        setLoadError(null);
        setFeedItems(feedResult.listings);
      }

      hasLoadedRef.current = true;
      feedInFlightRef.current = false;
      setLoading(false);
      setRefreshing(false);
    },
    [],
  );

  loadFeedRef.current = loadFeed;

  useEffect(() => {
    void loadFeed('initial');
  }, [loadFeed]);

  const filteredListings =
    useMemo(() => {
      return feedItems
        .filter(item => {
          const listingCategory =
            item.listing.category
              .trim()
              .toLowerCase();

          const selectedCategoryValue =
            selectedCategory
              .trim()
              .toLowerCase();

          const matchesCategory =
            selectedCategory === 'All' ||
            listingCategory ===
              selectedCategoryValue;

          const card = toMarketFeedCard(item);

          return (
            matchesCategory &&
            listingMatchesMarketSearch(
              card,
              searchQuery,
              item,
            )
          );
        })
        .map(item => toMarketFeedCard(item));
    }, [
      feedItems,
      searchQuery,
      selectedCategory,
    ]);

  const listData: MarketListItem[] =
    loading
      ? skeletonItems
      : filteredListings;

  function handleRefresh() {
    if (refreshing || loading) {
      return;
    }

    void loadFeed('refresh');
  }

  function openMessages() {
    if (
      openMessagesInbox(
        navigation,
      )
    ) {
      return;
    }

    Alert.alert(
      'Messages',
      'Messages could not be opened.',
    );
  }

  function renderListing(
    item: MarketFeedCardPresentation,
  ) {
    return (
      <View
        style={
          layoutMode === 'grid'
            ? styles.gridColumn
            : styles.listColumn
        }
      >
        <MarketListingCard
          id={item.id}
          title={item.title}
          price={item.price}
          image={item.image}
          location={item.location}
          listedTime={
            item.listedTime
          }
          imageCount={
            item.imageCount
          }
          category={item.category}
          layout={layoutMode}
          onPress={() => {
            navigation.navigate(
              'ListingDetail',
              {
                listingId:
                  item.id,
              },
            );
          }}
        />
      </View>
    );
  }

  function renderSkeleton() {
    return (
      <View
        style={
          layoutMode === 'grid'
            ? styles.gridColumn
            : styles.listColumn
        }
      >
        <DGListingSkeleton
          layout={layoutMode}
        />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <View
        pointerEvents="none"
        style={styles.background}
      >
        <View
          style={styles.topGlow}
        />

        <View
          style={styles.bottomGlow}
        />
      </View>

      <FlatList
        key={`${layoutMode}-${loading ? 'loading' : 'ready'}`}
        data={listData}
        keyExtractor={item =>
          item.id
        }
        renderItem={({ item }) => {
          if (
            isSkeletonItem(item)
          ) {
            return renderSkeleton();
          }

          return renderListing(
            item,
          );
        }}
        numColumns={
          layoutMode === 'grid'
            ? 2
            : 1
        }
        columnWrapperStyle={
          layoutMode === 'grid'
            ? styles.columnWrapper
            : undefined
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
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={
          styles.contentContainer
        }
        ListHeaderComponent={
          <View>
            <DGHeader
              title="Market"
              location={regionLabel ?? undefined}
              style={styles.marketHeader}
              topRowStyle={
                styles.marketTitleRow
              }
              locationStyle={
                styles.marketLocation
              }
              secondaryAction={{
                icon:
                  'chatbubble-ellipses-outline',

                accessibilityLabel:
                  'Open Direct Gain Inbox',

                onPress:
                  openMessages,

                badgeCount:
                  unreadMessageCount,
              }}
              primaryAction={{
                icon:
                  'albums-outline',

                accessibilityLabel:
                  'My Listings',

                onPress: () => {
                  navigation.navigate(
                    'MyListings',
                  );
                },
              }}
            />

            <View
              style={
                styles.headerContent
              }
            >
              <View
                style={
                  styles.compactMarketHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.compactEyebrow
                    }
                  >
                    MARKET
                  </Text>

                  <Text
                    style={
                      styles.compactTitle
                    }
                  >
                    Active listings
                  </Text>
                </View>
              </View>

              <DGSearchBar
                value={searchQuery}
                onChangeText={
                  setSearchQuery
                }
                placeholder="Search listings"
                showFilter={false}
                onSubmit={() => {
                  Keyboard.dismiss();
                }}
                containerStyle={
                  styles.searchBar
                }
              />

              <FlatList
                horizontal
                data={categories}
                keyExtractor={item =>
                  item.label
                }
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.categoryList
                }
                renderItem={({
                  item,
                }) => (
                  <DGChip
                    label={item.label}
                    icon={item.icon}
                    size="compact"
                    selected={
                      selectedCategory ===
                      item.label
                    }
                    onPress={() => {
                      setSelectedCategory(
                        item.label,
                      );
                    }}
                    style={
                      styles.categoryChip
                    }
                  />
                )}
              />

              <View
                style={
                  styles.resultsHeader
                }
              >
                <View
                  style={
                    styles.resultsHeading
                  }
                >
                  <View
                    style={
                      styles.resultsIcon
                    }
                  >
                    <Ionicons
                      name="storefront-outline"
                      size={17}
                      color={
                        palette.opportunityGreen
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.resultsCopy
                    }
                  >
                    <Text
                      style={
                        styles.resultsTitle
                      }
                    >
                      Latest listings
                    </Text>

                    <Text
                      style={
                        styles.resultsSubtitle
                      }
                    >
                      {
                        filteredListings.length
                      }{' '}
                      {filteredListings.length ===
                      1
                        ? 'listing'
                        : 'listings'}
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.layoutToggle
                  }
                >
                  <LayoutButton
                    icon="grid-outline"
                    label="Grid view"
                    selected={
                      layoutMode ===
                      'grid'
                    }
                    onPress={() => {
                      setLayoutMode(
                        'grid',
                      );
                    }}
                  />

                  <LayoutButton
                    icon="list-outline"
                    label="List view"
                    selected={
                      layoutMode ===
                      'list'
                    }
                    onPress={() => {
                      setLayoutMode(
                        'list',
                      );
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? null : loadError ? (
            <View
              style={
                styles.emptyState
              }
            >
              <View
                style={
                  styles.emptyGlow
                }
              />

              <View
                style={
                  styles.emptyIcon
                }
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={32}
                  color={
                    palette.opportunityGreen
                  }
                />
              </View>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                Couldn't load listings
              </Text>

              <Text
                style={
                  styles.emptyDescription
                }
              >
                {loadError}
              </Text>

              <DGButton
                title="Retry"
                icon="refresh-outline"
                variant="outline"
                onPress={() => {
                  void loadFeed('initial');
                }}
              />
            </View>
          ) : feedItems.length === 0 ? (
            <View
              style={
                styles.emptyState
              }
            >
              <View
                style={
                  styles.emptyGlow
                }
              />

              <View
                style={
                  styles.emptyIcon
                }
              >
                <Ionicons
                  name="storefront-outline"
                  size={32}
                  color={
                    palette.opportunityGreen
                  }
                />
              </View>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No listings yet
              </Text>

              <Text
                style={
                  styles.emptyDescription
                }
              >
                There aren’t any active listings to show right now.
              </Text>
            </View>
          ) : (
            <View
              style={
                styles.emptyState
              }
            >
              <View
                style={
                  styles.emptyGlow
                }
              />

              <View
                style={
                  styles.emptyIcon
                }
              >
                <Ionicons
                  name="search-outline"
                  size={32}
                  color={
                    palette.opportunityGreen
                  }
                />
              </View>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No listings found
              </Text>

              <Text
                style={
                  styles.emptyDescription
                }
              >
                Try another search or choose a different category.
              </Text>

              <DGButton
                title="Reset filters"
                icon="refresh-outline"
                variant="outline"
                onPress={() => {
                  setSearchQuery('');

                  setSelectedCategory(
                    'All',
                  );
                }}
              />
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

type LayoutButtonProps = {
  icon: React.ComponentProps<
    typeof Ionicons
  >['name'];

  label: string;
  selected: boolean;
  onPress: () => void;
};

function LayoutButton({
  icon,
  label,
  selected,
  onPress,
}: LayoutButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{
        selected,
      }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.layoutButton,

        selected &&
          styles.layoutButtonSelected,

        pressed &&
          styles.pressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={
          selected
            ? textColor.inverse
            : textColor.muted
        }
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      palette.midnight,
  },

  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },

  topGlow: {
    position: 'absolute',
    top: -220,
    right: -170,
    width: 430,
    height: 430,
    borderRadius: 215,
    backgroundColor:
      alpha.green04,
  },

  bottomGlow: {
    position: 'absolute',
    bottom: -260,
    left: -190,
    width: 430,
    height: 430,
    borderRadius: 215,
    backgroundColor:
      alpha.green04,
  },

  contentContainer: {
    paddingHorizontal:
      spacing.md,

    paddingBottom:
      layout.bottomNavigationClearance +
      spacing.xl,
  },

  marketHeader: {
    paddingTop: spacing.xxs,
    paddingBottom: spacing.xxs,
  },

  marketTitleRow: {
    minHeight: 46,
  },

  marketLocation: {
    minHeight: 36,
    marginTop: 6,
  },

  headerContent: {
    width: '100%',
    paddingHorizontal:
      spacing.xxs,
  },

  compactMarketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  compactEyebrow: {
    ...typography.eyebrow,

    color:
      palette.opportunityGreen,
  },

  compactTitle: {
    color: textColor.primary,

    fontSize: 19,
    lineHeight: 22,

    fontWeight: '900',

    letterSpacing: -0.35,
  },

  searchBar: {
    marginTop: spacing.xxs,
  },

  categoryList: {
    paddingTop: spacing.xs,

    paddingBottom: 0,

    paddingRight:
      spacing.md,
  },

  categoryChip: {
    marginRight: spacing.xs,
  },

  resultsHeader: {
    marginTop: spacing.xs,

    marginBottom: spacing.xs,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',
  },

  resultsHeading: {
    flex: 1,

    minWidth: 0,

    flexDirection: 'row',

    alignItems: 'center',
  },

  resultsIcon: {
    width: 36,
    height: 36,

    borderRadius: radius.sm,

    backgroundColor:
      alpha.green08,

    alignItems: 'center',
    justifyContent: 'center',
  },

  resultsCopy: {
    flex: 1,

    minWidth: 0,

    marginLeft: spacing.sm,
  },

  resultsTitle: {
    color: textColor.primary,

    fontSize: 16,
    lineHeight: 20,

    fontWeight: '900',

    letterSpacing: -0.25,
  },

  resultsSubtitle: {
    marginTop: 2,

    color: textColor.muted,

    fontSize: 9,
    fontWeight: '600',
  },

  layoutToggle: {
    marginLeft: spacing.sm,

    padding: 3,

    borderRadius: radius.md,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardSoft,

    flexDirection: 'row',
  },

  layoutButton: {
    width: 36,
    height: 34,

    borderRadius: radius.sm,

    alignItems: 'center',

    justifyContent: 'center',
  },

  layoutButtonSelected: {
    backgroundColor:
      palette.opportunityGreen,
  },

  columnWrapper: {
    justifyContent:
      'space-between',
  },

  gridColumn: {
    width: '48.6%',

    marginBottom:
      spacing.sm,
  },

  listColumn: {
    width: '100%',

    marginBottom:
      spacing.sm,
  },

  emptyState: {
    position: 'relative',

    marginTop: spacing.xl,

    paddingHorizontal:
      spacing.xl,

    paddingVertical:
      spacing.xxxl,

    borderRadius:
      radius.card,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardRaised,

    alignItems: 'center',

    overflow: 'hidden',
  },

  emptyGlow: {
    position: 'absolute',

    top: -85,
    right: -65,

    width: 190,
    height: 190,

    borderRadius: 95,

    backgroundColor:
      alpha.green06,
  },

  emptyIcon: {
    width: 64,
    height: 64,

    borderRadius: radius.lg,

    backgroundColor:
      alpha.green10,

    alignItems: 'center',

    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: spacing.md,

    ...typography.headingSmall,

    color: textColor.primary,

    textAlign: 'center',
  },

  emptyDescription: {
    maxWidth: 280,

    marginTop: spacing.xs,

    marginBottom: spacing.lg,

    ...typography.bodySmall,

    color:
      textColor.secondary,

    textAlign: 'center',
  },

  pressed: {
    opacity: 0.78,

    transform: [
      {
        scale:
          motion.iconPressedScale,
      },
    ],
  },
});

function marketViewerAreaLabel(
  region: ViewerListingRegion,
): string | null {
  const location = formatViewerRegionLabel(region);

  if (location === 'Your area') {
    return null;
  }

  return `Your area: ${location}`;
}