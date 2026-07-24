import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import MarketListingCard from '../components/MarketListingCard';

import {
  MarketListing,
  marketListings,
} from '../data/marketMockData';

import { colors } from '../theme/colors';

type MarketFeedTab = 'forYou' | 'nearby';

const categories = [
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
    label: 'Furniture',
    icon: 'bed-outline',
  },
  {
    label: 'Jobs',
    icon: 'briefcase-outline',
  },
  {
    label: 'Auctions',
    icon: 'hammer-outline',
  },
  {
    label: 'Services',
    icon: 'people-outline',
  },
] as const;

export default function MarketScreen() {
  const [searchQuery, setSearchQuery] =
    useState('');

  const [selectedCategory, setSelectedCategory] =
    useState('All');

  const [selectedTab, setSelectedTab] =
    useState<MarketFeedTab>('forYou');

  const [favouriteIds, setFavouriteIds] =
    useState<string[]>([]);

  const filteredListings = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    return marketListings.filter((listing) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        listing.category.toLowerCase() ===
          selectedCategory.toLowerCase() ||
        (selectedCategory === 'Auctions' &&
          listing.listingType === 'auction') ||
        (selectedCategory === 'Jobs' &&
          listing.listingType === 'job') ||
        (selectedCategory === 'Services' &&
          listing.listingType === 'service');

      const matchesSearch =
        normalizedSearch.length === 0 ||
        listing.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        listing.description
          .toLowerCase()
          .includes(normalizedSearch) ||
        listing.category
          .toLowerCase()
          .includes(normalizedSearch) ||
        listing.subcategory
          .toLowerCase()
          .includes(normalizedSearch) ||
        listing.location
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const trendingListings = useMemo(
    () =>
      filteredListings
        .filter(
          (listing) =>
            listing.listingType !== 'job' &&
            listing.listingType !== 'service',
        )
        .slice(0, 4),
    [filteredListings],
  );

  const trustedListings = useMemo(
    () =>
      filteredListings
        .filter(
          (listing) =>
            listing.sellerVerified ||
            listing.sellerGainScore >= 90,
        )
        .slice(4, 8),
    [filteredListings],
  );

  const recommendedListings = useMemo(
    () => filteredListings.slice(8),
    [filteredListings],
  );

  function toggleFavourite(listingId: string) {
    setFavouriteIds((currentIds) => {
      if (currentIds.includes(listingId)) {
        return currentIds.filter(
          (id) => id !== listingId,
        );
      }

      return [...currentIds, listingId];
    });
  }

  function renderListingCard(
    item: MarketListing,
  ) {
    const isFavourite =
      favouriteIds.includes(item.id) ||
      item.favourite;

    return (
      <View style={styles.gridItem}>
        <MarketListingCard
          id={item.id}
          title={item.title}
          price={formatPrice(
            item.price,
            item.currency,
          )}
          image={item.image}
          sellerName={item.sellerName}
          location={item.location}
          distance={item.distance}
          listedTime={item.listedTime}
          rating={item.rating}
          reviewCount={item.reviewCount}
          gainScore={item.sellerGainScore}
          verified={item.sellerVerified}
          favourite={isFavourite}
          imageCount={item.imageCount}
          category={item.category}
          auctionLabel={item.auctionLabel}
          onPress={() => {
            console.log(
              'Open listing:',
              item.id,
            );
          }}
          onFavouritePress={() => {
            toggleFavourite(item.id);
          }}
          onMessagePress={() => {
            console.log(
              'Message seller:',
              item.sellerId,
            );
          }}
          onOfferPress={() => {
            console.log(
              'Make offer:',
              item.id,
            );
          }}
        />
      </View>
    );
  }

  function renderGridSection(
    listings: MarketListing[],
    title: string,
    subtitle: string,
    icon: React.ComponentProps<
      typeof Ionicons
    >['name'],
  ) {
    if (listings.length === 0) {
      return null;
    }

    return (
      <View style={styles.discoverySection}>
        <View style={styles.sectionHeading}>
          <View style={styles.sectionTitleGroup}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name={icon}
                size={16}
                color={colors.primary}
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                {title}
              </Text>

              <Text style={styles.sectionSubtitle}>
                {subtitle}
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`See all ${title}`}
            style={({ pressed }) => [
              styles.seeAllButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.seeAllText}>
              See all
            </Text>

            <Ionicons
              name="chevron-forward"
              size={14}
              color={colors.primary}
            />
          </Pressable>
        </View>

        <View style={styles.grid}>
          {listings.map((listing) => (
            <View
              key={listing.id}
              style={styles.gridColumn}
            >
              {renderListingCard(listing)}
            </View>
          ))}
        </View>
      </View>
    );
  }

  const hasResults =
    filteredListings.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={[]}
        renderItem={() => null}
        keyExtractor={(_, index) =>
          String(index)
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={Keyboard.dismiss}
        contentContainerStyle={
          styles.contentContainer
        }
        ListHeaderComponent={
          <View>
            <View style={styles.topHeader}>
              <View style={styles.brandArea}>
                <View style={styles.logoMark}>
                  <Text style={styles.logoText}>
                    DG
                  </Text>

                  <Ionicons
                    name="trending-up"
                    size={18}
                    color={colors.primary}
                    style={styles.logoArrow}
                  />
                </View>

                <View style={styles.brandTextArea}>
                  <Text style={styles.brandName}>
                    DIRECT{' '}
                    <Text style={styles.brandAccent}>
                      GAIN
                    </Text>
                  </Text>

                  <Text style={styles.brandSlogan}>
                    Grow Together
                  </Text>
                </View>
              </View>

              <View style={styles.headerActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open messages"
                  style={({ pressed }) => [
                    styles.headerButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={21}
                    color={colors.text}
                  />
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open notifications"
                  style={({ pressed }) => [
                    styles.headerButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color={colors.text}
                  />

                  <View
                    style={
                      styles.notificationBadge
                    }
                  >
                    <Text
                      style={
                        styles.notificationText
                      }
                    >
                      3
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color={colors.textMuted}
              />

              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search for anything..."
                placeholderTextColor={
                  colors.textMuted
                }
                returnKeyType="search"
                clearButtonMode="while-editing"
                style={styles.searchInput}
              />

              {searchQuery.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  hitSlop={10}
                  onPress={() =>
                    setSearchQuery('')
                  }
                  style={styles.searchAction}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.textMuted}
                  />
                </Pressable>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open market filters"
                  hitSlop={10}
                  style={styles.searchAction}
                >
                  <Ionicons
                    name="options-outline"
                    size={21}
                    color={colors.primary}
                  />
                </Pressable>
              )}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change market location"
              style={({ pressed }) => [
                styles.locationRow,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.locationLeft}>
                <Ionicons
                  name="location"
                  size={18}
                  color={colors.primary}
                />

                <Text style={styles.locationText}>
                  Mackay, QLD
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={15}
                  color={colors.textMuted}
                />
              </View>

              <Text style={styles.changeText}>
                Change
              </Text>
            </Pressable>

            <View style={styles.tabBar}>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{
                  selected:
                    selectedTab === 'forYou',
                }}
                onPress={() =>
                  setSelectedTab('forYou')
                }
                style={styles.tabButton}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === 'forYou' &&
                      styles.tabTextSelected,
                  ]}
                >
                  For You
                </Text>

                {selectedTab === 'forYou' ? (
                  <View
                    style={styles.tabIndicator}
                  />
                ) : null}
              </Pressable>

              <Pressable
                accessibilityRole="tab"
                accessibilityState={{
                  selected:
                    selectedTab === 'nearby',
                }}
                onPress={() =>
                  setSelectedTab('nearby')
                }
                style={styles.tabButton}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === 'nearby' &&
                      styles.tabTextSelected,
                  ]}
                >
                  Nearby
                </Text>

                {selectedTab === 'nearby' ? (
                  <View
                    style={styles.tabIndicator}
                  />
                ) : null}
              </Pressable>
            </View>

            <FlatList
              horizontal
              data={categories}
              keyExtractor={(item) => item.label}
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.categoryList
              }
              renderItem={({ item }) => {
                const isSelected =
                  selectedCategory ===
                  item.label;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: isSelected,
                    }}
                    onPress={() =>
                      setSelectedCategory(
                        item.label,
                      )
                    }
                    style={({ pressed }) => [
                      styles.categoryChip,
                      isSelected &&
                        styles.categoryChipSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={15}
                      color={
                        isSelected
                          ? '#10150D'
                          : colors.textMuted
                      }
                    />

                    <Text
                      style={[
                        styles.categoryText,
                        isSelected &&
                          styles.categoryTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
            />

            {hasResults ? (
              <>
                {renderGridSection(
                  trendingListings,
                  selectedTab === 'nearby'
                    ? 'Trending Nearby'
                    : 'Trending Near You',
                  selectedTab === 'nearby'
                    ? 'Popular listings close to your location'
                    : 'Popular opportunities selected for you',
                  'flame-outline',
                )}

                {renderGridSection(
                  trustedListings,
                  'Trusted Sellers',
                  'Highly rated and verified local members',
                  'shield-checkmark-outline',
                )}

                <View style={styles.trustBanner}>
                  <View
                    style={styles.trustBannerIcon}
                  >
                    <Ionicons
                      name="shield-checkmark"
                      size={24}
                      color={colors.primary}
                    />
                  </View>

                  <View
                    style={styles.trustBannerText}
                  >
                    <Text
                      style={
                        styles.trustBannerTitle
                      }
                    >
                      Buy with confidence
                    </Text>

                    <Text
                      style={
                        styles.trustBannerDescription
                      }
                    >
                      Gain Scores, seller
                      verification and reviews help
                      you make safer decisions.
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.primary}
                  />
                </View>

                {renderGridSection(
                  recommendedListings.length > 0
                    ? recommendedListings
                    : filteredListings.slice(0, 4),
                  'Recommended For You',
                  `${filteredListings.length} local opportunities available`,
                  'heart-outline',
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="search-outline"
                    size={31}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  No opportunities found
                </Text>

                <Text
                  style={styles.emptyDescription}
                >
                  Try another search or choose a
                  different category.
                </Text>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  style={({ pressed }) => [
                    styles.resetButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={styles.resetButtonText}
                  >
                    Reset filters
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

function formatPrice(
  price: number,
  currency: string,
) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080B09',
  },

  contentContainer: {
    paddingHorizontal: 14,
    paddingBottom: 130,
  },

  topHeader: {
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brandArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoMark: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.24)',
    backgroundColor:
      'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -1,
  },

  logoArrow: {
    position: 'absolute',
    top: 3,
    right: 3,
  },

  brandTextArea: {
    marginLeft: 11,
  },

  brandName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },

  brandAccent: {
    color: colors.primary,
  },

  brandSlogan: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerButton: {
    position: 'relative',
    width: 42,
    height: 42,
    marginLeft: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.09)',
    backgroundColor: colors.cardRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationText: {
    color: '#10150D',
    fontSize: 8,
    fontWeight: '900',
  },

  searchContainer: {
    height: 52,
    marginTop: 18,
    paddingHorizontal: 14,
    borderRadius: 17,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.09)',
    backgroundColor: colors.cardRaised,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 10,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },

  searchAction: {
    paddingLeft: 8,
  },

  locationRow: {
    minHeight: 48,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationText: {
    marginHorizontal: 7,
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },

  changeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },

  tabBar: {
    marginTop: 3,
    borderBottomWidth: 1,
    borderBottomColor:
      'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
  },

  tabButton: {
    position: 'relative',
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },

  tabTextSelected: {
    color: colors.text,
  },

  tabIndicator: {
    position: 'absolute',
    right: 0,
    bottom: -1,
    left: 0,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },

  categoryList: {
    paddingTop: 14,
    paddingBottom: 4,
    paddingRight: 14,
  },

  categoryChip: {
    minHeight: 37,
    marginRight: 8,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.09)',
    backgroundColor:
      'rgba(255, 255, 255, 0.035)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  categoryText: {
    marginLeft: 6,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },

  categoryTextSelected: {
    color: '#10150D',
  },

  discoverySection: {
    marginTop: 23,
  },

  sectionHeading: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionIcon: {
    width: 31,
    height: 31,
    marginRight: 9,
    borderRadius: 11,
    backgroundColor:
      'rgba(158, 246, 90, 0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2,
  },

  sectionSubtitle: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
  },

  seeAllButton: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  seeAllText: {
    marginRight: 1,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
  },

  grid: {
    marginHorizontal: -5,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  gridColumn: {
    width: '50%',
    paddingHorizontal: 5,
    marginBottom: 10,
  },

  gridItem: {
    width: '100%',
  },

  trustBanner: {
    minHeight: 94,
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.22)',
    backgroundColor:
      'rgba(158, 246, 90, 0.055)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  trustBannerIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.28)',
    backgroundColor:
      'rgba(158, 246, 90, 0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  trustBannerText: {
    flex: 1,
    marginHorizontal: 12,
  },

  trustBannerTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },

  trustBannerDescription: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '600',
  },

  emptyState: {
    marginTop: 32,
    paddingHorizontal: 28,
    paddingVertical: 42,
    borderRadius: 24,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
    backgroundColor: colors.cardRaised,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 21,
    backgroundColor:
      'rgba(158, 246, 90, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 17,
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },

  emptyDescription: {
    marginTop: 7,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
  },

  resetButton: {
    minHeight: 42,
    marginTop: 20,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  resetButtonText: {
    color: '#10150D',
    fontSize: 12,
    fontWeight: '900',
  },

  pressed: {
    opacity: 0.7,
  },
});