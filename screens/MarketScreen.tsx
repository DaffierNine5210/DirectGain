import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useCallback,
  useEffect,
  useMemo,
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

import {
  MarketListing,
  marketListings,
} from '../data/marketMockData';

import useFocusedUnreadTotal from '../hooks/useFocusedUnreadTotal';
import useTabBarVisibility from '../hooks/useTabBarVisibility';
import type { MarketStackParamList } from '../navigation/MarketStack';

import {
  alpha,
  layout,
  motion,
  palette,
  radius,
  shadow,
  spacing,
  surface,
  textColor,
  typography,
} from '../theme/designSystem';

type Props = NativeStackScreenProps<
  MarketStackParamList,
  'MarketHome'
>;

type MarketTab = 'forYou' | 'nearby';
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
  | MarketListing
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
    selectedTab,
    setSelectedTab,
  ] = useState<MarketTab>('forYou');

  const [
    layoutMode,
    setLayoutMode,
  ] = useState<MarketLayout>('grid');

  const [
    filterActive,
    setFilterActive,
  ] = useState(false);

  const [
    favouriteIds,
    setFavouriteIds,
  ] = useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      showTabBar();
    }, [showTabBar]),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const filteredListings =
    useMemo(() => {
      const normalizedSearch =
        searchQuery
          .trim()
          .toLowerCase();

      return marketListings.filter(
        listing => {
          const listingCategory =
            listing.category
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

          const matchesSearch =
            normalizedSearch.length ===
              0 ||
            listing.title
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            listing.description
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            listing.category
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            listing.location
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          return (
            matchesCategory &&
            matchesSearch
          );
        },
      );
    }, [
      searchQuery,
      selectedCategory,
    ]);

  const listData: MarketListItem[] =
    loading
      ? skeletonItems
      : filteredListings;

  function toggleFavourite(
    listingId: string,
  ) {
    setFavouriteIds(
      currentIds => {
        if (
          currentIds.includes(
            listingId,
          )
        ) {
          return currentIds.filter(
            id =>
              id !== listingId,
          );
        }

        return [
          ...currentIds,
          listingId,
        ];
      },
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

  function renderListing(
    item: MarketListing,
  ) {
    const isFavourite =
      favouriteIds.includes(
        item.id,
      ) || item.favourite;

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
          price={formatPrice(
            item.price,
            item.currency,
          )}
          image={item.image}
          sellerName={
            item.sellerName
          }
          location={item.location}
          distance={item.distance}
          listedTime={
            item.listedTime
          }
          rating={item.rating}
          reviewCount={
            item.reviewCount
          }
          gainScore={
            item.sellerGainScore
          }
          verified={
            item.sellerVerified
          }
          favourite={
            isFavourite
          }
          imageCount={
            item.imageCount
          }
          category={item.category}
          auctionLabel={
            item.auctionLabel
          }
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
          onFavouritePress={() => {
            toggleFavourite(
              item.id,
            );
          }}
          onMessagePress={() => {
            Alert.alert(
              'Message seller',
              `Starting a conversation with ${item.sellerName}.`,
            );
          }}
          onOfferPress={() => {
            Alert.alert(
              'Make an offer',
              `Offer tools for ${item.title} will be connected later.`,
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
              location="Mackay, QLD · Within 25 km"
              onLocationPress={() => {
                Alert.alert(
                  'Market location',
                  'Location selection will be connected in a later release.',
                );
              }}
              secondaryAction={{
                icon:
                  'chatbubble-ellipses-outline',

                accessibilityLabel:
                  'Open messages',

                onPress:
                  openMessages,

                badgeCount:
                  unreadMessageCount,
              }}
              primaryAction={{
                icon:
                  'notifications-outline',

                accessibilityLabel:
                  'Open notifications',

                badgeCount: 3,

                onPress: () => {
                  Alert.alert(
                    'Notifications',
                    'Market notifications will be connected later.',
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
                    LOCAL MARKET
                  </Text>

                  <Text
                    style={
                      styles.compactTitle
                    }
                  >
                    Buy and sell nearby
                  </Text>
                </View>

                <View
                  style={
                    styles.localStatusBadge
                  }
                >
                  <View
                    style={
                      styles.localStatusDot
                    }
                  />

                  <Text
                    style={
                      styles.localStatusText
                    }
                  >
                    LOCAL
                  </Text>
                </View>
              </View>

              <DGSearchBar
                value={searchQuery}
                onChangeText={
                  setSearchQuery
                }
                placeholder="Search listings"
                showFilter
                filterActive={
                  filterActive
                }
                onFilterPress={() => {
                  setFilterActive(
                    current =>
                      !current,
                  );
                }}
                onSubmit={() => {
                  Keyboard.dismiss();
                }}
                containerStyle={
                  styles.searchBar
                }
              />

              {filterActive ? (
                <View
                  style={
                    styles.filterNotice
                  }
                >
                  <View
                    style={
                      styles.filterNoticeIcon
                    }
                  >
                    <Ionicons
                      name="options-outline"
                      size={16}
                      color={
                        palette.opportunityGreen
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.filterNoticeCopy
                    }
                  >
                    <Text
                      style={
                        styles.filterNoticeTitle
                      }
                    >
                      Local results active
                    </Text>

                    <Text
                      style={
                        styles.filterNoticeDescription
                      }
                    >
                      Showing listings within 25 km.
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Clear market filters"
                    onPress={() => {
                      setFilterActive(
                        false,
                      );
                    }}
                    style={({
                      pressed,
                    }) => [
                      styles.clearFilterButton,
                      pressed &&
                        styles.pressed,
                    ]}
                  >
                    <Text
                      style={
                        styles.clearFilterText
                      }
                    >
                      Clear
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              <View
                style={
                  styles.marketTabs
                }
              >
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{
                    selected:
                      selectedTab ===
                      'forYou',
                  }}
                  onPress={() => {
                    setSelectedTab(
                      'forYou',
                    );
                  }}
                  style={({
                    pressed,
                  }) => [
                    styles.marketTab,

                    selectedTab ===
                      'forYou' &&
                      styles.marketTabSelected,

                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="sparkles-outline"
                    size={16}
                    color={
                      selectedTab ===
                      'forYou'
                        ? textColor.inverse
                        : textColor.muted
                    }
                  />

                  <Text
                    style={[
                      styles.marketTabText,

                      selectedTab ===
                        'forYou' &&
                        styles.marketTabTextSelected,
                    ]}
                  >
                    For You
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{
                    selected:
                      selectedTab ===
                      'nearby',
                  }}
                  onPress={() => {
                    setSelectedTab(
                      'nearby',
                    );
                  }}
                  style={({
                    pressed,
                  }) => [
                    styles.marketTab,

                    selectedTab ===
                      'nearby' &&
                      styles.marketTabSelected,

                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={
                      selectedTab ===
                      'nearby'
                        ? textColor.inverse
                        : textColor.muted
                    }
                  />

                  <Text
                    style={[
                      styles.marketTabText,

                      selectedTab ===
                        'nearby' &&
                        styles.marketTabTextSelected,
                    ]}
                  >
                    Nearby
                  </Text>
                </Pressable>
              </View>

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
                      name={
                        selectedTab ===
                        'nearby'
                          ? 'location-outline'
                          : 'sparkles-outline'
                      }
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
                      {selectedTab ===
                      'nearby'
                        ? 'Nearby listings'
                        : 'Recommended for you'}
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
          loading ? null : (
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

                  setFilterActive(
                    false,
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

function formatPrice(
  price: number,
  currency: string,
) {
  return new Intl.NumberFormat(
    'en-AU',
    {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    },
  ).format(price);
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

  headerContent: {
    width: '100%',
    paddingHorizontal:
      spacing.xxs,
  },

  compactMarketHeader: {
    marginTop: spacing.xs,

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
    marginTop: 3,

    color: textColor.primary,

    fontSize: 19,
    lineHeight: 24,

    fontWeight: '900',

    letterSpacing: -0.35,
  },

  localStatusBadge: {
    minHeight: 28,

    paddingHorizontal:
      spacing.sm,

    borderRadius:
      radius.pill,

    borderWidth: 1,

    borderColor:
      alpha.green16,

    backgroundColor:
      alpha.green06,

    flexDirection: 'row',
    alignItems: 'center',
  },

  localStatusDot: {
    width: 6,
    height: 6,

    marginRight: 6,

    borderRadius: 3,

    backgroundColor:
      palette.opportunityGreen,
  },

  localStatusText: {
    color:
      palette.opportunityGreen,

    fontSize: 8,
    lineHeight: 11,

    fontWeight: '900',

    letterSpacing: 0.8,
  },

  searchBar: {
    marginTop: spacing.md,
  },

  filterNotice: {
    minHeight: 58,

    marginTop: spacing.xs,

    paddingHorizontal:
      spacing.sm,

    paddingVertical:
      spacing.xs,

    borderRadius: radius.md,

    borderWidth: 1,

    borderColor:
      alpha.green16,

    backgroundColor:
      surface.cardSoft,

    flexDirection: 'row',
    alignItems: 'center',
  },

  filterNoticeIcon: {
    width: 34,
    height: 34,

    borderRadius: radius.sm,

    backgroundColor:
      alpha.green08,

    alignItems: 'center',
    justifyContent: 'center',
  },

  filterNoticeCopy: {
    flex: 1,
    marginLeft: spacing.sm,
  },

  filterNoticeTitle: {
    color: textColor.primary,

    fontSize: 11,
    fontWeight: '900',
  },

  filterNoticeDescription: {
    marginTop: 2,

    color: textColor.muted,

    fontSize: 9,
    fontWeight: '600',
  },

  clearFilterButton: {
    minHeight: 32,

    paddingHorizontal:
      spacing.sm,

    borderRadius: radius.sm,

    backgroundColor:
      alpha.green08,

    alignItems: 'center',
    justifyContent: 'center',
  },

  clearFilterText: {
    color:
      palette.opportunityGreen,

    fontSize: 10,
    fontWeight: '900',
  },

  marketTabs: {
    marginTop: spacing.sm,

    padding: spacing.xxs,

    borderRadius: radius.lg,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardSoft,

    flexDirection: 'row',
  },

  marketTab: {
    flex: 1,

    minHeight: 42,

    borderRadius: radius.md,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  marketTabSelected: {
    backgroundColor:
      palette.opportunityGreen,

    ...shadow.greenSoft,
  },

  marketTabText: {
    marginLeft: spacing.xs,

    color: textColor.muted,

    fontSize: 11,
    fontWeight: '800',
  },

  marketTabTextSelected: {
    color: textColor.inverse,
  },

  categoryList: {
    paddingTop: spacing.sm,

    paddingBottom:
      spacing.xxs,

    paddingRight:
      spacing.md,
  },

  categoryChip: {
    marginRight: spacing.xs,
  },

  resultsHeader: {
    marginTop: spacing.md,

    marginBottom:
      spacing.sm,

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