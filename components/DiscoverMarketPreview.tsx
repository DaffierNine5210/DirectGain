import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import MarketListingCard from './MarketListingCard';

import {
  marketListings,
} from '../data/marketMockData';

import {
  spacing,
} from '../theme/designSystem';

type DiscoverMarketPreviewProps = {
  searchQuery?: string;
  onListingPress?: (
    listingId: string,
  ) => void;
};

export default function DiscoverMarketPreview({
  searchQuery = '',
  onListingPress,
}: DiscoverMarketPreviewProps) {
  const normalizedSearch =
    searchQuery
      .trim()
      .toLowerCase();

  const previewListings =
    marketListings
      .filter((listing) => {
        if (!normalizedSearch) {
          return true;
        }

        return (
          listing.title
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
            )
        );
      })
      .slice(0, 5);

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={
        false
      }
      contentContainerStyle={
        styles.contentContainer
      }
    >
      {previewListings.map(
        (listing) => (
          <View
            key={listing.id}
            style={styles.cardWrapper}
          >
            <MarketListingCard
              id={listing.id}
              title={listing.title}
              price={formatPrice(
                listing.price,
                listing.currency,
              )}
              image={listing.image}
              sellerName={
                listing.sellerName
              }
              location={
                listing.location
              }
              distance={
                listing.distance
              }
              listedTime={
                listing.listedTime
              }
              rating={
                listing.rating
              }
              reviewCount={
                listing.reviewCount
              }
              gainScore={
                listing.sellerGainScore
              }
              verified={
                listing.sellerVerified
              }
              favourite={
                listing.favourite
              }
              imageCount={
                listing.imageCount
              }
              category={
                listing.category
              }
              auctionLabel={
                listing.auctionLabel
              }
              layout="grid"
              onPress={() => {
                if (
                  onListingPress
                ) {
                  onListingPress(
                    listing.id,
                  );

                  return;
                }

                Alert.alert(
                  listing.title,
                  'Opening this listing will be connected next.',
                );
              }}
              onFavouritePress={() => {
                Alert.alert(
                  'Saved',
                  `${listing.title} was added to your saved listings.`,
                );
              }}
            />
          </View>
        ),
      )}
    </ScrollView>
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
  contentContainer: {
    paddingRight: spacing.lg,
  },

  cardWrapper: {
    width: 216,
    marginRight: spacing.md,
  },
});