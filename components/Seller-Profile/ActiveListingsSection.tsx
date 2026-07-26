import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';
import type { Listing } from '../../types/Listing';
import type { SellerProfile } from '../../types/SellerProfile';

type Props = {
  seller: SellerProfile;
  listings: Listing[];
  onListingPress: (listingId: string) => void;
};

function formatPrice(listing: Listing): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: listing.currency,
    maximumFractionDigits: 0,
  }).format(listing.price);
}

export default function ActiveListingsSection({
  seller,
  listings,
  onListingPress,
}: Props) {
  const activeListings = listings.filter(listing =>
    seller.activeListingIds.includes(listing.id),
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <Ionicons
            name="storefront-outline"
            size={21}
            color={colors.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.eyebrow}>
            MARKET ACTIVITY
          </Text>

          <Text style={styles.title}>
            Active listings
          </Text>

          <Text style={styles.subtitle}>
            Browse items currently available from this seller.
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {activeListings.length}
          </Text>
        </View>
      </View>

      {activeListings.length > 0 ? (
        <View style={styles.list}>
          {activeListings.map(listing => (
            <Pressable
              key={listing.id}
              accessibilityRole="button"
              accessibilityLabel={`Open ${listing.title}`}
              onPress={() => onListingPress(listing.id)}
              style={({ pressed }) => [
                styles.listingCard,
                pressed && styles.pressed,
              ]}
            >
              <Image
                source={listing.images[0]}
                style={styles.listingImage}
              />

              <View style={styles.listingContent}>
                <Text
                  style={styles.listingTitle}
                  numberOfLines={2}
                >
                  {listing.title}
                </Text>

                <Text style={styles.price}>
                  {formatPrice(listing)}
                </Text>

                <View style={styles.locationRow}>
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={colors.primary}
                  />

                  <Text
                    style={styles.locationText}
                    numberOfLines={1}
                  >
                    {listing.location.suburb},{' '}
                    {listing.location.state}
                    {listing.location.distanceKm !== undefined
                      ? ` • ${listing.location.distanceKm} km away`
                      : ''}
                  </Text>
                </View>

                <View style={styles.chipRow}>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>
                      {listing.condition}
                    </Text>
                  </View>

                  {listing.pickupAvailable && (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>
                        Pickup
                      </Text>
                    </View>
                  )}

                  {listing.deliveryAvailable && (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>
                        Delivery
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.chevron}>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textMuted}
                />
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="storefront-outline"
              size={24}
              color={colors.textMuted}
            />
          </View>

          <Text style={styles.emptyTitle}>
            No active listings
          </Text>

          <Text style={styles.emptyText}>
            This seller does not currently have any items
            available in the Market.
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Ionicons
          name="shield-checkmark-outline"
          size={15}
          color={colors.textMuted}
        />

        <Text style={styles.footerText}>
          Listings shown here are connected to this seller’s
          verified Direct Gain profile.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#101511',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  headerIcon: {
    width: 44,
    height: 44,
    marginRight: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.18)',
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerContent: {
    flex: 1,
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  title: {
    marginTop: 4,
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  subtitle: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '600',
  },

  countBadge: {
    minWidth: 34,
    height: 34,
    marginLeft: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.20)',
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },

  list: {
    marginTop: 20,
  },

  listingCard: {
    minHeight: 132,
    marginBottom: 12,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  listingImage: {
    width: 108,
    height: 108,
    borderRadius: 16,
    backgroundColor: '#182019',
  },

  listingContent: {
    flex: 1,
    alignSelf: 'stretch',
    marginLeft: 12,
    paddingVertical: 3,
    justifyContent: 'center',
  },

  listingTitle: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
  },

  price: {
    marginTop: 5,
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },

  locationRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationText: {
    flex: 1,
    marginLeft: 4,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },

  chipRow: {
    marginTop: 9,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  chip: {
    marginRight: 6,
    marginBottom: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(158, 246, 90, 0.07)',
  },

  chipText: {
    color: colors.text,
    fontSize: 8,
    fontWeight: '800',
  },

  chevron: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyState: {
    marginTop: 20,
    paddingHorizontal: 22,
    paddingVertical: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    alignItems: 'center',
  },

  emptyIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 13,
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },

  emptyText: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  footer: {
    marginTop: 8,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  footerText: {
    flex: 1,
    marginLeft: 8,
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '600',
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.985 }],
  },
});