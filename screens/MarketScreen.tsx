import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import type { MarketStackParamList } from '../navigation/MarketStack';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<
  MarketStackParamList,
  'MarketHome'
>;

type MarketTab = 'forYou' | 'nearby';

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

export default function MarketScreen({
  navigation,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState('All');
  const [selectedTab, setSelectedTab] =
    useState<MarketTab>('forYou');
  const [favouriteIds, setFavouriteIds] = useState<
    string[]
  >([]);

  const filteredListings = useMemo(() => {
    const normalizedSearch = searchQuery
      .trim()
      .toLowerCase();

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
        listing.location
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

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

  function renderListing({
    item,
  }: {
    item: MarketListing;
  }) {
    const isFavourite =
      favouriteIds.includes(item.id) ||
      item.favourite;

    return (
      <View style={styles.gridColumn}>
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
            navigation.navigate('ListingDetail', {
              listingId: item.id,
            });
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredListings}
        renderItem={renderListing}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={Keyboard.dismiss}
        contentContainerStyle={
          styles.contentContainer
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
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
                    style={styles.notificationBadge}
                  >
                    <Text
                      style={styles.notificationText}
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
                placeholder="Search the Market..."
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
                  onPress={() => setSearchQuery('')}
                  hitSlop={10}
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
                  accessibilityLabel="Open filters"
                  hitSlop={10}
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
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={
                styles.categoryList
              }
              renderItem={({ item }) => {
                const isSelected =
                  selectedCategory === item.label;

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

            <View style={styles.sectionHeading}>
              <View style={styles.sectionTitleArea}>
                <View style={styles.sectionIcon}>
                  <Ionicons
                    name={
                      selectedTab === 'nearby'
                        ? 'location-outline'
                        : 'sparkles-outline'
                    }
                    size={17}
                    color={colors.primary}
                  />
                </View>

                <View>
                  <Text style={styles.sectionTitle}>
                    {selectedTab === 'nearby'
                      ? 'Nearby Market'
                      : 'Recommended For You'}
                  </Text>

                  <Text
                    style={styles.sectionSubtitle}
                  >
                    {filteredListings.length}{' '}
                    opportunities available
                  </Text>
                </View>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="search-outline"
                size={32}
                color={colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No opportunities found
            </Text>

            <Text style={styles.emptyDescription}>
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
              <Text style={styles.resetButtonText}>
                Reset filters
              </Text>
            </Pressable>
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

  header: {
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
    borderColor: 'rgba(158, 246, 90, 0.24)',
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
    borderColor: 'rgba(255, 255, 255, 0.09)',
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
    borderColor: 'rgba(255, 255, 255, 0.09)',
    backgroundColor: colors.cardRaised,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    height: '100%',
    marginHorizontal: 10,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
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
    borderColor: 'rgba(255, 255, 255, 0.09)',
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

  sectionHeading: {
    marginTop: 22,
    marginBottom: 12,
  },

  sectionTitleArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionIcon: {
    width: 34,
    height: 34,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor:
      'rgba(158, 246, 90, 0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },

  columnWrapper: {
    justifyContent: 'space-between',
  },

  gridColumn: {
    width: '48.7%',
    marginBottom: 12,
  },

  emptyState: {
    marginTop: 32,
    paddingHorizontal: 28,
    paddingVertical: 42,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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