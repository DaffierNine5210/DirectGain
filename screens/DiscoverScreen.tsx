import { Ionicons } from '@expo/vector-icons';
import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import type {
  BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import type {
  BottomTabParamList,
} from '../navigation/BottomTabs';

import {
  DiscoverAuction,
  DiscoverJob,
  DiscoverListing,
  liveAuctions,
  nearbyJobs,
  regionSummary,
  trendingListings,
} from '../data/discoverMockData';

import { colors } from '../theme/colors';

import DGButton from '../components/DGButton';
import DGCard from '../components/DGCard';
import DGHeader from '../components/DGHeader';
import DGHeroCard from '../components/DGHeroCard';
import DGSearchBar from '../components/DGSearchBar';
import DGSection from '../components/DGSection';
import GainScoreBadge from '../components/GainScoreBadge';
import RegionSummaryCard from '../components/RegionSummaryCard';
import TrustCard from '../components/TrustCard';

import useTabBarVisibility from '../hooks/useTabBarVisibility';

type DiscoverNavigation =
  BottomTabNavigationProp<
    BottomTabParamList,
    'Discover'
  >;

export default function DiscoverScreen() {
  const navigation =
    useNavigation<DiscoverNavigation>();

  const {
    updateFromScroll,
    showTabBar,
  } = useTabBarVisibility();

  const [searchValue, setSearchValue] =
    useState('');

  const [filterActive, setFilterActive] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      showTabBar();
    }, [showTabBar]),
  );

  const filteredListings = useMemo(() => {
    const query =
      searchValue.trim().toLowerCase();

    if (!query) {
      return trendingListings;
    }

    return trendingListings.filter(
      (listing) => {
        return (
          listing.title
            .toLowerCase()
            .includes(query) ||
          listing.category
            .toLowerCase()
            .includes(query) ||
          listing.location
            .toLowerCase()
            .includes(query)
        );
      },
    );
  }, [searchValue]);

  function showComingSoon(
    feature: string,
  ) {
    Alert.alert(
      feature,
      `${feature} will be connected as we build the next Direct Gain release.`,
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
        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={(event) => {
          updateFromScroll(
            event.nativeEvent.contentOffset.y,
          );
        }}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <DGHeader
  showBrand
  location="Sunshine Coast · Within 15 km"
  onLocationPress={() =>
    showComingSoon(
      'Location settings',
    )
  }
  secondaryAction={{
    icon:
      'chatbubble-ellipses-outline',

    accessibilityLabel:
      'Open messages',

    onPress: () => {
      navigation.navigate(
        'Messages',
      );
    },
  }}
  primaryAction={{
    icon: 'notifications-outline',

    accessibilityLabel:
      'Open notifications',

    badgeCount: 3,

    onPress: () =>
      showComingSoon(
        'Notifications',
      ),
  }}
/>

<View style={styles.heroWrapper}>
  <DGHeroCard
    greeting="Good Afternoon, Liam 👋"
    location="Sunshine Coast"
    opportunities={143}
    listings={143}
    jobs={17}
    auctions={8}
    onPress={() =>
      Alert.alert(
        'Explore',
        'Opportunity feed coming soon.',
      )
    }
  />
</View>

<View style={styles.pageContent}></View>
         

        

        <View style={styles.pageContent}>
          <DGSearchBar
            value={searchValue}
            onChangeText={setSearchValue}
            placeholder="Search listings, jobs and auctions"
            showFilter
            filterActive={filterActive}
            onFilterPress={() => {
              setFilterActive(
                (currentValue) =>
                  !currentValue,
              );
            }}
            onSubmit={(query) => {
              if (!query) {
                return;
              }

              Alert.alert(
                'Search',
                `Searching Direct Gain for “${query}”.`,
              );
            }}
          />

          {filterActive ? (
            <View
              style={styles.filterNotice}
            >
              <Ionicons
                name="options-outline"
                size={17}
                color={colors.primary}
              />

              <Text
                style={
                  styles.filterNoticeText
                }
              >
                Local results within 15 km
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear active filter"
                onPress={() =>
                  setFilterActive(false)
                }
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
            style={styles.sectionSpacing}
          >
            <RegionSummaryCard
              regionName="Sunshine Coast"
              items={regionSummary}
            />
          </View>

          <View
            style={styles.sectionSpacing}
          >
            <TrustCard
              gainScore={86}
              identityVerified
              professionalVerified
              communityTrusted
            />
          </View>

          <DGSection
            style={styles.sectionSpacing}
            eyebrow="Trending nearby"
            title="Marketplace"
            subtitle="Fresh listings from trusted local sellers."
            actionLabel="View All"
            onActionPress={() =>
              navigation.navigate('Market')
            }
          >
            {filteredListings.length >
            0 ? (
              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.horizontalList
                }
              >
                {filteredListings.map(
                  (listing) => (
                    <ListingPreviewCard
                      key={listing.id}
                      listing={listing}
                      onPress={() =>
                        showComingSoon(
                          listing.title,
                        )
                      }
                    />
                  ),
                )}
              </ScrollView>
            ) : (
              <DGCard variant="soft">
                <View
                  style={styles.emptyState}
                >
                  <Ionicons
                    name="search-outline"
                    size={30}
                    color={colors.primary}
                  />

                  <Text
                    style={
                      styles.emptyTitle
                    }
                  >
                    No local results
                  </Text>

                  <Text
                    style={
                      styles.emptyDescription
                    }
                  >
                    Try another search or
                    clear your filters.
                  </Text>

                  <DGButton
                    title="Clear Search"
                    size="small"
                    variant="outline"
                    onPress={() =>
                      setSearchValue('')
                    }
                  />
                </View>
              </DGCard>
            )}
          </DGSection>

          <DGSection
            style={styles.sectionSpacing}
            eyebrow="Work locally"
            title="Jobs Near You"
            subtitle="Opportunities from trusted businesses in your region."
            actionLabel="Explore"
            onActionPress={() =>
              showComingSoon('Jobs')
            }
          >
            <View
              style={styles.verticalList}
            >
              {nearbyJobs.map((job) => (
                <JobPreviewCard
                  key={job.id}
                  job={job}
                  onPress={() =>
                    showComingSoon(
                      job.title,
                    )
                  }
                />
              ))}
            </View>
          </DGSection>

          <DGSection
            style={styles.sectionSpacing}
            eyebrow="Happening now"
            title="Live Auctions"
            subtitle="Place bids on items currently active near you."
            actionLabel="View Live"
            onActionPress={() =>
              navigation.navigate(
                'Auctions',
              )
            }
          >
            <View
              style={styles.verticalList}
            >
              {liveAuctions.map(
                (auction) => (
                  <AuctionPreviewCard
                    key={auction.id}
                    auction={auction}
                    onPress={() =>
                      showComingSoon(
                        auction.title,
                      )
                    }
                  />
                ),
              )}
            </View>
          </DGSection>

          <DGCard
            variant="raised"
            style={
              styles.createOpportunityCard
            }
          >
            <View
              style={styles.createIcon}
            >
              <Ionicons
                name="arrow-up"
                size={25}
                color="#071004"
              />
            </View>

            <Text
              style={styles.createEyebrow}
            >
              GROW TOGETHER
            </Text>

            <Text
              style={styles.createTitle}
            >
              Create your next opportunity
            </Text>

            <Text
              style={
                styles.createDescription
              }
            >
              Sell an item, post a job,
              start an auction or share
              something with your local
              community.
            </Text>

            <DGButton
              title="Create"
              icon="add"
              fullWidth
              onPress={() =>
                navigation.navigate(
                  'Create',
                )
              }
            />
          </DGCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type ListingPreviewCardProps = {
  listing: DiscoverListing;
  onPress: () => void;
};

function ListingPreviewCard({
  listing,
  onPress,
}: ListingPreviewCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open listing: ${listing.title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.listingCard,
        pressed &&
          styles.previewPressed,
      ]}
    >
      <View
        style={
          styles.listingImagePlaceholder
        }
      >
        <View
          style={styles.imageGlow}
        />

        <Ionicons
          name="image-outline"
          size={34}
          color={colors.textMuted}
        />

        {listing.featured ? (
          <View
            style={styles.featuredBadge}
          >
            <Ionicons
              name="sparkles"
              size={11}
              color="#071004"
            />

            <Text
              style={styles.featuredText}
            >
              FEATURED
            </Text>
          </View>
        ) : null}

        <View
          style={styles.categoryBadge}
        >
          <Text
            style={styles.categoryText}
          >
            {listing.category}
          </Text>
        </View>
      </View>

      <View
        style={styles.listingContent}
      >
        <Text
          numberOfLines={2}
          style={styles.cardTitle}
        >
          {listing.title}
        </Text>

        <Text style={styles.priceText}>
          {listing.price}
        </Text>

        <View
          style={styles.metadataRow}
        >
          <Ionicons
            name="location-outline"
            size={14}
            color={colors.textMuted}
          />

          <Text
            numberOfLines={1}
            style={styles.metadataText}
          >
            {listing.location} ·{' '}
            {listing.distance}
          </Text>
        </View>

        <View style={styles.sellerRow}>
          <View
            style={
              styles.avatarPlaceholder
            }
          >
            <Text
              style={styles.avatarText}
            >
              {listing.sellerName.charAt(
                0,
              )}
            </Text>
          </View>

          <View
            style={styles.sellerDetails}
          >
            <Text
              numberOfLines={1}
              style={styles.sellerName}
            >
              {listing.sellerName}
            </Text>

            <Text
              style={styles.postedText}
            >
              {listing.postedAt}
            </Text>
          </View>

          <GainScoreBadge
            score={listing.gainScore}
            compact
          />
        </View>
      </View>
    </Pressable>
  );
}

type JobPreviewCardProps = {
  job: DiscoverJob;
  onPress: () => void;
};

function JobPreviewCard({
  job,
  onPress,
}: JobPreviewCardProps) {
  return (
    <DGCard
      variant="raised"
      pressable
      onPress={onPress}
      contentStyle={
        styles.compactCardContent
      }
    >
      <View style={styles.cardTopRow}>
        <View
          style={styles.featureIcon}
        >
          <Ionicons
            name="briefcase-outline"
            size={22}
            color={colors.primary}
          />
        </View>

        <View
          style={styles.cardHeadingArea}
        >
          <Text
            numberOfLines={2}
            style={styles.cardTitle}
          >
            {job.title}
          </Text>

          <Text
            numberOfLines={1}
            style={styles.businessName}
          >
            {job.businessName}
          </Text>
        </View>

        <Ionicons
          name="bookmark-outline"
          size={22}
          color={colors.textMuted}
        />
      </View>

      <View style={styles.tagRow}>
        <InfoTag
          icon="cash-outline"
          label={job.pay}
        />

        <InfoTag
          icon="time-outline"
          label={job.workType}
        />
      </View>

      <View
        style={styles.cardBottomRow}
      >
        <View
          style={styles.locationDetails}
        >
          <Ionicons
            name="location-outline"
            size={15}
            color={colors.textMuted}
          />

          <Text
            numberOfLines={1}
            style={styles.metadataText}
          >
            {job.location} ·{' '}
            {job.distance} ·{' '}
            {job.postedAt}
          </Text>
        </View>

        <GainScoreBadge
          score={job.gainScore}
          compact
        />
      </View>
    </DGCard>
  );
}

type AuctionPreviewCardProps = {
  auction: DiscoverAuction;
  onPress: () => void;
};

function AuctionPreviewCard({
  auction,
  onPress,
}: AuctionPreviewCardProps) {
  return (
    <DGCard
      variant="raised"
      pressable
      onPress={onPress}
      contentStyle={
        styles.compactCardContent
      }
    >
      <View
        style={styles.auctionTopRow}
      >
        <View
          style={
            styles.liveAuctionBadge
          }
        >
          <View
            style={styles.auctionLiveDot}
          />

          <Text
            style={
              styles.liveAuctionText
            }
          >
            LIVE
          </Text>
        </View>

        <View
          style={styles.timerBadge}
        >
          <Ionicons
            name="timer-outline"
            size={14}
            color={colors.primary}
          />

          <Text
            style={styles.timerText}
          >
            {auction.timeRemaining}
          </Text>
        </View>
      </View>

      <Text
        numberOfLines={2}
        style={styles.auctionTitle}
      >
        {auction.title}
      </Text>

      <View style={styles.bidRow}>
        <View>
          <Text
            style={styles.bidLabel}
          >
            CURRENT BID
          </Text>

          <Text
            style={styles.bidValue}
          >
            {auction.currentBid}
          </Text>
        </View>

        <View
          style={styles.bidCountArea}
        >
          <Text
            style={styles.bidCount}
          >
            {auction.bidCount}
          </Text>

          <Text
            style={styles.bidCountLabel}
          >
            bids
          </Text>
        </View>
      </View>

      <View
        style={styles.cardBottomRow}
      >
        <View
          style={styles.locationDetails}
        >
          <Ionicons
            name="person-circle-outline"
            size={16}
            color={colors.textMuted}
          />

          <Text
            numberOfLines={1}
            style={styles.metadataText}
          >
            {auction.sellerName} ·{' '}
            {auction.location}
          </Text>
        </View>

        <GainScoreBadge
          score={auction.gainScore}
          compact
        />
      </View>
    </DGCard>
  );
}

type InfoTagProps = {
  icon: React.ComponentProps<
    typeof Ionicons
  >['name'];

  label: string;
};

function InfoTag({
  icon,
  label,
}: InfoTagProps) {
  return (
    <View style={styles.infoTag}>
      <Ionicons
        name={icon}
        size={14}
        color={colors.primary}
      />

      <Text
        numberOfLines={1}
        style={styles.infoTagText}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070A07',
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
    top: -210,
    right: -160,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor:
      'rgba(158, 246, 90, 0.045)',
  },

  bottomGlow: {
    position: 'absolute',
    bottom: -250,
    left: -190,
    width: 430,
    height: 430,
    borderRadius: 215,
    backgroundColor:
      'rgba(158, 246, 90, 0.035)',
  },

  scrollContent: {
    /*
     * Enough space for all content to sit above
     * the navigation whenever it is visible.
     */
    paddingBottom: 165,
  },
heroWrapper: {
  width: '100%',
  paddingHorizontal: 20,
  marginBottom: 20,
},
  pageContent: {
    width: '100%',
    paddingHorizontal: 20,
  },

  sectionSpacing: {
    marginTop: 28,
  },

  filterNotice: {
    minHeight: 40,
    marginTop: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor:
      colors.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterNoticeText: {
    flex: 1,
    marginLeft: 8,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },

  clearFilterText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },

  horizontalList: {
    paddingRight: 20,
    gap: 14,
  },

  verticalList: {
    width: '100%',
    gap: 13,
  },

  listingCard: {
    width: 278,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor:
      colors.cardRaised,
    overflow: 'hidden',

    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7,
    },

    elevation: 6,
  },

  previewPressed: {
    opacity: 0.9,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  listingImagePlaceholder: {
    position: 'relative',
    width: '100%',
    height: 158,
    backgroundColor:
      colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  imageGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor:
      'rgba(158, 246, 90, 0.035)',
  },

  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    minHeight: 26,
    paddingHorizontal: 8,
    borderRadius: 13,
    backgroundColor:
      colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },

  featuredText: {
    marginLeft: 4,
    color: '#071004',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  categoryBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    minHeight: 27,
    paddingHorizontal: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor:
      colors.cardRaised,
    justifyContent: 'center',
  },

  categoryText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },

  listingContent: {
    padding: 15,
  },

  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 21,
  },

  priceText: {
    marginTop: 8,
    color: colors.primary,
    fontSize: 21,
    fontWeight: '900',
  },

  metadataRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  metadataText: {
    flexShrink: 1,
    marginLeft: 5,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },

  sellerRow: {
    marginTop: 15,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarPlaceholder: {
    width: 34,
    height: 34,
    marginRight: 9,
    borderRadius: 12,
    backgroundColor:
      `${colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },

  sellerDetails: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },

  sellerName: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },

  postedText: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },

  compactCardContent: {
    padding: 16,
  },

  cardTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  featureIcon: {
    width: 44,
    height: 44,
    marginRight: 12,
    borderRadius: 15,
    backgroundColor:
      `${colors.primary}16`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardHeadingArea: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },

  businessName: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },

  tagRow: {
    marginTop: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  infoTag: {
    minHeight: 31,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor:
      colors.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoTagText: {
    maxWidth: 170,
    marginLeft: 5,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },

  cardBottomRow: {
    width: '100%',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationDetails: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  auctionTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  liveAuctionBadge: {
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: 14,
    backgroundColor: '#E5484D20',
    borderWidth: 1,
    borderColor: '#E5484D55',
    flexDirection: 'row',
    alignItems: 'center',
  },

  auctionLiveDot: {
    width: 7,
    height: 7,
    marginRight: 5,
    borderRadius: 4,
    backgroundColor: '#E5484D',
  },

  liveAuctionText: {
    color: '#FF7277',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  timerBadge: {
    minHeight: 30,
    paddingHorizontal: 9,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor:
      colors.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
  },

  timerText: {
    marginLeft: 5,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },

  auctionTitle: {
    marginTop: 17,
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 23,
  },

  bidRow: {
    width: '100%',
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  bidLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  bidValue: {
    marginTop: 4,
    color: colors.primary,
    fontSize: 25,
    fontWeight: '900',
  },

  bidCountArea: {
    alignItems: 'flex-end',
  },

  bidCount: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },

  bidCountLabel: {
    marginTop: 1,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 8,
  },

  emptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },

  emptyDescription: {
    marginTop: 5,
    marginBottom: 16,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },

  createOpportunityCard: {
    marginTop: 30,
    marginBottom: 10,
  },

  createIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor:
      colors.primary,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: colors.primary,
    shadowOpacity: 0.13,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  createEyebrow: {
    marginTop: 18,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  createTitle: {
    marginTop: 6,
    color: colors.text,
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  createDescription: {
    marginTop: 8,
    marginBottom: 20,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});