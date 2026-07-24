import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ListingHeroGallery from '../components/listing-detail/ListingHeroGallery';
import SellerTrustCard from '../components/listing-detail/SellerTrustCard';
import { listings } from '../data/listings';
import type { MarketStackParamList } from '../navigation/MarketStack';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<
  MarketStackParamList,
  'ListingDetail'
>;

export default function ListingDetailScreen({
  navigation,
  route,
}: Props) {
  const listing = useMemo(
    () =>
      listings.find(
        item => item.id === route.params.listingId,
      ) ?? listings[0],
    [route.params.listingId],
  );

  const [isFavourite, setIsFavourite] = useState(
    listing.isFavourite,
  );

  const formattedPrice = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: listing.currency,
    maximumFractionDigits: 0,
  }).format(listing.price);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${listing.title} — ${formattedPrice}`,
      });
    } catch {
      Alert.alert(
        'Unable to share',
        'Please try again shortly.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ListingHeroGallery
            image={listing.images[0]}
            imageCount={listing.images.length}
            currentImage={1}
            favourite={isFavourite}
            onBackPress={() => navigation.goBack()}
            onFavouritePress={() =>
              setIsFavourite(current => !current)
            }
            onSharePress={handleShare}
          />

          <View style={styles.content}>
            <Text style={styles.price}>
              {formattedPrice}
            </Text>

            <Text style={styles.title}>
              {listing.title}
            </Text>

            <View style={styles.metaRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={colors.primary}
              />

              <Text style={styles.metaText}>
                {listing.location.suburb},{' '}
                {listing.location.state}
                {listing.location.distanceKm
                  ? ` • ${listing.location.distanceKm} km away`
                  : ''}
                {' • '}
                {listing.createdAt}
              </Text>
            </View>

            <View style={styles.chipRow}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  {listing.category}
                </Text>
              </View>

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
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>
              Description
            </Text>

            <Text style={styles.description}>
              {listing.description}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>
              Seller
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.sellerCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.sellerAvatar}>
                <Text style={styles.sellerInitial}>
                  {listing.seller.name.charAt(0)}
                </Text>
              </View>

              <View style={styles.sellerContent}>
                <View style={styles.sellerNameRow}>
                  <Text style={styles.sellerName}>
                    {listing.seller.name}
                  </Text>

                  <Ionicons
                    name="shield-checkmark"
                    size={17}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.sellerMeta}>
                  Gain Score {listing.seller.gainScore}
                  {' • '}
                  {listing.seller.rating.toFixed(1)} ★
                </Text>

                <Text style={styles.sellerMeta}>
                  {listing.seller.reviewCount} reviews
                  {' • '}
                  {listing.seller.completedSales} sales
                </Text>

                <Text style={styles.responseTime}>
                  {listing.seller.responseTime}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textMuted}
              />
            </Pressable>

            <View style={styles.bottomSpacer} />
          </View>
        </ScrollView>

        <View style={styles.actionBar}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              Alert.alert(
                'Message seller',
                'Messaging will be connected in a later stage.',
              )
            }
          >
            <Ionicons
              name="chatbubble-outline"
              size={19}
              color={colors.text}
            />

            <Text style={styles.secondaryButtonText}>
              Message
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              Alert.alert(
                'Make an offer',
                'The offer flow will be added in a later stage.',
              )
            }
          >
            <Text style={styles.primaryButtonText}>
              Make Offer
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080B09',
  },

  screen: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 96,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  price: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.6,
  },

  title: {
    marginTop: 6,
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
  },

  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaText: {
    flex: 1,
    marginLeft: 7,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },

  chipRow: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  chip: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.18)',
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
  },

  chipText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },

  divider: {
    height: 1,
    marginVertical: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },

  description: {
    marginTop: 10,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600',
  },

  sellerCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  sellerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(158, 246, 90, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sellerInitial: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '900',
  },

  sellerContent: {
    flex: 1,
    marginLeft: 13,
  },

  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sellerName: {
    marginRight: 6,
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },

  sellerMeta: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },

  responseTime: {
    marginTop: 6,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },

  bottomSpacer: {
    height: 24,
  },

  actionBar: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(8, 11, 9, 0.98)',
    flexDirection: 'row',
  },

  secondaryButton: {
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.13)',
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
    marginLeft: 8,
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },

  primaryButton: {
    flex: 1,
    height: 52,
    marginLeft: 10,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: '#080B09',
    fontSize: 14,
    fontWeight: '900',
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});