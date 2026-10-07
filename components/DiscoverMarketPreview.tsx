import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import DGSkeleton from './DGSkeleton';
import MarketListingCard from './MarketListingCard';

import type { MarketFeedCardPresentation } from '../services/market/marketFeedPresentation';

import {
  alpha,
  layout,
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../theme/designSystem';

export const DISCOVER_MARKET_PREVIEW_LIMIT = 20;

const DISCOVER_MARKET_VISIBLE_CARDS = 2.5;
const DISCOVER_MARKET_CARD_MIN_WIDTH = 128;
const DISCOVER_MARKET_CARD_MAX_WIDTH = 168;

const MARKET_SKELETON_KEYS = [
  'discover-market-skeleton-1',
  'discover-market-skeleton-2',
  'discover-market-skeleton-3',
] as const;

export type DiscoverMarketPreviewStatus =
  | 'loading'
  | 'error'
  | 'empty'
  | 'ready';

type DiscoverMarketPreviewProps = {
  status: DiscoverMarketPreviewStatus;
  cards: MarketFeedCardPresentation[];
  errorMessage?: string | null;
  filterActive?: boolean;
  onListingPress: (listingId: string) => void;
  onRetry: () => void;
};

function getDiscoverMarketCardWidth(
  windowWidth: number,
) {
  const availableWidth =
    windowWidth - layout.screenPadding * 2;
  const gap = spacing.sm;
  const measured = Math.round(
    (availableWidth - gap) /
      DISCOVER_MARKET_VISIBLE_CARDS,
  );

  return Math.min(
    DISCOVER_MARKET_CARD_MAX_WIDTH,
    Math.max(
      DISCOVER_MARKET_CARD_MIN_WIDTH,
      measured,
    ),
  );
}

export default function DiscoverMarketPreview({
  status,
  cards,
  errorMessage,
  filterActive = false,
  onListingPress,
  onRetry,
}: DiscoverMarketPreviewProps) {
  const { width: windowWidth } =
    useWindowDimensions();
  const cardWidth =
    getDiscoverMarketCardWidth(windowWidth);

  if (status === 'loading') {
    return (
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
      >
        {MARKET_SKELETON_KEYS.map((key) => (
          <View
            key={key}
            style={[
              styles.cardSlot,
              { width: cardWidth },
            ]}
          >
            <CompactMarketSkeleton
              imageHeight={Math.round(
                (cardWidth * 5) / 4,
              )}
            />
          </View>
        ))}
      </ScrollView>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.messageCard}>
        <Text style={styles.messageTitle}>
          Market listings could not be loaded
        </Text>

        <Text style={styles.messageBody}>
          {errorMessage?.trim() ||
            "Couldn't load listings. Try again."}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry loading Market listings"
          onPress={onRetry}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryPressed,
          ]}
        >
          <Text style={styles.retryLabel}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (status === 'empty') {
    return (
      <View style={styles.messageCard}>
        <Text style={styles.messageTitle}>
          {filterActive
            ? 'No Market matches on this page.'
            : 'No active listings right now'}
        </Text>

        <Text style={styles.messageBody}>
          {filterActive
            ? 'Clear the filter to see loaded listings, or browse the Market.'
            : 'Browse the Market to see listings as they appear.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      contentContainerStyle={styles.railContent}
    >
      {cards.map((listing) => (
        <View
          key={listing.id}
          style={[
            styles.cardSlot,
            { width: cardWidth },
          ]}
        >
          <MarketListingCard
            id={listing.id}
            title={listing.title}
            price={listing.price}
            image={listing.image}
            location={listing.location}
            imageCount={listing.imageCount}
            category={listing.category}
            layout="compact"
            onPress={() => {
              onListingPress(listing.id);
            }}
          />
        </View>
      ))}
    </ScrollView>
  );
}

function CompactMarketSkeleton({
  imageHeight,
}: {
  imageHeight: number;
}) {
  return (
    <View style={styles.skeletonCard}>
      <DGSkeleton
        variant="image"
        height={imageHeight}
        borderRadius={0}
      />

      <View style={styles.skeletonDetails}>
        <DGSkeleton width="48%" height={18} />
        <DGSkeleton
          width="88%"
          height={12}
          style={styles.skeletonTitle}
        />
        <DGSkeleton width="56%" height={10} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  railContent: {
    paddingRight: spacing.lg,
  },

  cardSlot: {
    marginRight: spacing.sm,
  },

  skeletonCard: {
    overflow: 'hidden',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
  },

  skeletonDetails: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },

  skeletonTitle: {
    marginTop: 0,
  },

  messageCard: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
  },

  messageTitle: {
    color: textColor.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  messageBody: {
    marginTop: spacing.xs,
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  retryButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: palette.opportunityGreen,
  },

  retryPressed: {
    opacity: 0.86,
  },

  retryLabel: {
    color: textColor.inverse,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
  },
});
