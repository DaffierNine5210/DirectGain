import {
  StyleSheet,
  View,
} from 'react-native';

import DiscoverMarketPreview from '../DiscoverMarketPreview';
import DGButton from '../DGButton';
import DGExpandableSection from '../DGExpandableSection';
import DGOpportunityCard from '../DGOpportunityCard';
import DGReveal from '../DGReveal';

import type {
  DiscoverAuction,
} from '../../data/discoverMockData';

import {
  spacing,
} from '../../theme/designSystem';

export type DiscoverSectionKey =
  | 'market'
  | 'auctions'
  | 'overview'
  | null;

type DiscoverOpportunityFeedProps = {
  searchQuery: string;

  auctions: DiscoverAuction[];

  expandedSection:
    DiscoverSectionKey;

  onSectionChange: (
    section:
      Exclude<
        DiscoverSectionKey,
        null
      >,
    expanded: boolean,
  ) => void;

  onMarketPress: () => void;

  onListingPress: (
    listingId: string,
  ) => void;

  onAuctionPress: (
    auction: DiscoverAuction,
  ) => void;

  onAuctionsPress: () => void;
};

export default function DiscoverOpportunityFeed({
  searchQuery,

  auctions,

  expandedSection,
  onSectionChange,

  onMarketPress,
  onListingPress,

  onAuctionPress,
  onAuctionsPress,
}: DiscoverOpportunityFeedProps) {
  return (
    <View style={styles.container}>
      <DGReveal
        delay={165}
        duration={430}
        distance={10}
      >
        <DGExpandableSection
          eyebrow="Recommended nearby"
          title="Market opportunities"
          subtitle="Trusted items and local listings selected for you."
          icon="storefront-outline"
          badgeText="143"
          expanded={
            expandedSection ===
            'market'
          }
          onExpandedChange={(
            expanded,
          ) => {
            onSectionChange(
              'market',
              expanded,
            );
          }}
          contentStyle={
            styles.marketContent
          }
        >
          <DiscoverMarketPreview
            searchQuery={
              searchQuery
            }
            onListingPress={
              onListingPress
            }
          />

          <DGButton
            title="Browse the Market"
            icon="arrow-forward"
            iconPosition="right"
            variant="outline"
            fullWidth
            style={
              styles.sectionAction
            }
            onPress={
              onMarketPress
            }
          />
        </DGExpandableSection>
      </DGReveal>

      <DGReveal
        delay={215}
        duration={440}
        distance={10}
        style={
          styles.sectionSpacing
        }
      >
        <DGExpandableSection
          eyebrow="Happening now"
          title="Live auctions"
          subtitle="See active bidding without filling your feed."
          icon="hammer-outline"
          badgeText={`${auctions.length} LIVE`}
          expanded={
            expandedSection ===
            'auctions'
          }
          onExpandedChange={(
            expanded,
          ) => {
            onSectionChange(
              'auctions',
              expanded,
            );
          }}
        >
          <View
            style={
              styles.opportunityList
            }
          >
            {auctions.map(
              (auction) => (
                <DGOpportunityCard
                  key={
                    auction.id
                  }
                  type="auction"
                  title={
                    auction.title
                  }
                  subtitle={`Current bid ${auction.currentBid} · ${auction.bidCount} bids`}
                  location={`${auction.location} · ${auction.sellerName}`}
                  badge={
                    auction.timeRemaining
                  }
                  gainScore={
                    auction.gainScore
                  }
                  verified
                  onPress={() => {
                    onAuctionPress(
                      auction,
                    );
                  }}
                />
              ),
            )}

            <DGButton
              title="View Live Auctions"
              icon="arrow-forward"
              iconPosition="right"
              variant="outline"
              fullWidth
              onPress={
                onAuctionsPress
              }
            />
          </View>
        </DGExpandableSection>
      </DGReveal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',

    paddingHorizontal:
      spacing.lg,
  },

  sectionSpacing: {
    marginTop:
      spacing.md,
  },

  marketContent: {
    paddingHorizontal: 0,
  },

  opportunityList: {
    width: '100%',

    gap:
      spacing.sm,
  },

  sectionAction: {
    marginTop:
      spacing.md,
  },
});
