import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import {
  Animated,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import DGImage from './DGImage';
import { colors } from '../theme/colors';

export type MarketListingCardProps = {
  id: string;
  title: string;
  price: string;
  image: ImageSourcePropType;

  sellerName: string;
  location: string;
  distance?: string;
  listedTime?: string;

  rating?: number;
  reviewCount?: number;
  gainScore?: number;

  verified?: boolean;
  favourite?: boolean;

  imageCount?: number;
  category?: string;
  auctionLabel?: string;

  onPress?: () => void;
  onFavouritePress?: () => void;
  onMessagePress?: () => void;
  onOfferPress?: () => void;
};

export default function MarketListingCard({
  title,
  price,
  image,
  location,
  distance,
  gainScore,
  verified = false,
  favourite = false,
  imageCount,
  category,
  auctionLabel,
  onPress,
  onFavouritePress,
}: MarketListingCardProps) {
  const scaleAnimation = useRef(
    new Animated.Value(1),
  ).current;

  const overlayOpacity = useRef(
    new Animated.Value(0),
  ).current;

  function handlePressIn() {
    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 0.975,
        speed: 34,
        bounciness: 0,
        useNativeDriver: true,
      }),

      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function handlePressOut() {
    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 1,
        speed: 24,
        bounciness: 6,
        useNativeDriver: true,
      }),

      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [
            {
              scale: scaleAnimation,
            },
          ],
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${price}`}
        accessibilityHint="Opens the full market listing"
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
      >
        <DGImage
          source={image}
          aspectRatio="portrait"
          cornerRadius="large"
          favourite={favourite}
          onFavouritePress={onFavouritePress}
          imageCount={imageCount}
          auctionLabel={auctionLabel}
          accessibilityLabel={title}
          style={styles.image}
        />

        <View
          pointerEvents="none"
          style={styles.baseShade}
        />

        <View
          pointerEvents="none"
          style={styles.middleShade}
        />

        <View
          pointerEvents="none"
          style={styles.bottomShade}
        />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.pressOverlay,
            {
              opacity: overlayOpacity,
            },
          ]}
        />

        {category && !auctionLabel ? (
          <View style={styles.categoryBadge}>
            <View style={styles.categoryDot} />

            <Text
              numberOfLines={1}
              style={styles.categoryText}
            >
              {category}
            </Text>
          </View>
        ) : null}

        <View style={styles.content}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.82}
            style={styles.price}
          >
            {price}
          </Text>

          <Text
            numberOfLines={2}
            style={styles.title}
          >
            {title}
          </Text>

          <View style={styles.footer}>
            <View style={styles.locationGroup}>
              <Ionicons
                name="location"
                size={12}
                color={colors.primary}
              />

              <Text
                numberOfLines={1}
                style={styles.locationText}
              >
                {distance || location}
              </Text>
            </View>

            <View style={styles.trustGroup}>
              {verified ? (
                <View
                  accessibilityLabel="Verified seller"
                  style={styles.verifiedBadge}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={11}
                    color={colors.primary}
                  />
                </View>
              ) : null}

              {typeof gainScore === 'number' ? (
                <View
                  accessibilityLabel={`Gain Score ${gainScore}`}
                  style={styles.gainScoreBadge}
                >
                  <Ionicons
                    name="star"
                    size={10}
                    color={colors.primary}
                  />

                  <Text style={styles.gainScoreText}>
                    {gainScore}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
  },

  card: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.18)',
    backgroundColor: colors.cardRaised,

    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 6,
  },

  image: {
    width: '100%',
    borderRadius: 0,
  },

  baseShade: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: '70%',
    backgroundColor:
      'rgba(4, 7, 5, 0.18)',
  },

  middleShade: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: '50%',
    backgroundColor:
      'rgba(4, 7, 5, 0.42)',
  },

  bottomShade: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: '34%',
    backgroundColor:
      'rgba(4, 7, 5, 0.82)',
  },

  pressOverlay: {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: 'rgba(158, 246, 90, 0.055)',
},
    
  

  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    maxWidth: '58%',
    minHeight: 25,
    paddingHorizontal: 8,
    borderRadius: 13,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.45)',
    backgroundColor:
      'rgba(5, 9, 6, 0.88)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  categoryDot: {
    width: 5,
    height: 5,
    marginRight: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },

  categoryText: {
    flexShrink: 1,
    color: colors.primary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.55,
    textTransform: 'uppercase',
  },

  content: {
    position: 'absolute',
    right: 11,
    bottom: 11,
    left: 11,
  },

  price: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 23,
    fontWeight: '900',
    letterSpacing: -0.5,

    textShadowColor:
      'rgba(0, 0, 0, 0.75)',
    textShadowRadius: 5,
    textShadowOffset: {
      width: 0,
      height: 2,
    },
  },

  title: {
    minHeight: 34,
    marginTop: 3,
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',

    textShadowColor:
      'rgba(0, 0, 0, 0.8)',
    textShadowRadius: 4,
    textShadowOffset: {
      width: 0,
      height: 1,
    },
  },

  footer: {
    minHeight: 22,
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  locationGroup: {
    flex: 1,
    minWidth: 0,
    marginRight: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationText: {
    flex: 1,
    marginLeft: 4,
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
  },

  trustGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  verifiedBadge: {
    width: 21,
    height: 21,
    borderRadius: 8,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.38)',
    backgroundColor:
      'rgba(6, 12, 7, 0.86)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  gainScoreBadge: {
    minWidth: 38,
    height: 21,
    marginLeft: 5,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.38)',
    backgroundColor:
      'rgba(6, 12, 7, 0.86)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  gainScoreText: {
    marginLeft: 3,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});