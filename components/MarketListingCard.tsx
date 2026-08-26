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

import {
  alpha,
  motion,
  palette,
  radius,
  shadow,
  spacing,
  surface,
  textColor,
} from '../theme/designSystem';

export type MarketListingCardLayout =
  | 'grid'
  | 'list';

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

  layout?: MarketListingCardLayout;

  onPress?: () => void;
  onFavouritePress?: () => void;
  onMessagePress?: () => void;
  onOfferPress?: () => void;
};

export default function MarketListingCard({
  title,
  price,
  image,

  sellerName,
  location,
  distance,
  listedTime,

  rating,
  reviewCount,
  gainScore,

  verified = false,
  favourite = false,

  imageCount,
  category,
  auctionLabel,

  layout = 'grid',

  onPress,
  onFavouritePress,
  onMessagePress,
  onOfferPress,
}: MarketListingCardProps) {
  const scaleAnimation =
    useRef(
      new Animated.Value(1),
    ).current;

  const overlayOpacity =
    useRef(
      new Animated.Value(0),
    ).current;

  const isListLayout =
    layout === 'list';

  function handlePressIn() {
    Animated.parallel([
      Animated.spring(
        scaleAnimation,
        {
          toValue:
            motion.pressedScale,

          speed: 34,
          bounciness: 0,

          useNativeDriver: true,
        },
      ),

      Animated.timing(
        overlayOpacity,
        {
          toValue: 1,

          duration:
            motion.fast,

          useNativeDriver: true,
        },
      ),
    ]).start();
  }

  function handlePressOut() {
    Animated.parallel([
      Animated.spring(
        scaleAnimation,
        {
          toValue: 1,

          speed: 24,
          bounciness: 5,

          useNativeDriver: true,
        },
      ),

      Animated.timing(
        overlayOpacity,
        {
          toValue: 0,

          duration:
            motion.standard,

          useNativeDriver: true,
        },
      ),
    ]).start();
  }

  if (isListLayout) {
    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            transform: [
              {
                scale:
                  scaleAnimation,
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
          onPressIn={
            handlePressIn
          }
          onPressOut={
            handlePressOut
          }
          style={styles.listCard}
        >
          <View
            style={
              styles.listImageArea
            }
          >
            <DGImage
              source={image}
              aspectRatio="portrait"
              cornerRadius="large"
              favourite={
                favourite
              }
              onFavouritePress={
                onFavouritePress
              }
              imageCount={
                imageCount
              }
              auctionLabel={
                auctionLabel
              }
              accessibilityLabel={
                title
              }
              style={
                styles.listImage
              }
            />

            {category &&
            !auctionLabel ? (
              <View
                style={
                  styles.listCategoryBadge
                }
              >
                <View
                  style={
                    styles.categoryDot
                  }
                />

                <Text
                  numberOfLines={1}
                  style={
                    styles.categoryText
                  }
                >
                  {category}
                </Text>
              </View>
            ) : null}
          </View>

          <View
            style={
              styles.listContent
            }
          >
            <View>
              <Text
                numberOfLines={1}
                style={
                  styles.listPrice
                }
              >
                {price}
              </Text>

              <Text
                numberOfLines={2}
                style={
                  styles.listTitle
                }
              >
                {title}
              </Text>
            </View>

            <View
              style={
                styles.listMetadata
              }
            >
              <View
                style={
                  styles.metadataLine
                }
              >
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={
                    palette.opportunityGreen
                  }
                />

                <Text
                  numberOfLines={1}
                  style={
                    styles.metadataText
                  }
                >
                  {distance
                    ? `${location} · ${distance}`
                    : location}
                </Text>
              </View>

              {listedTime ? (
                <View
                  style={
                    styles.metadataLine
                  }
                >
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={
                      textColor.muted
                    }
                  />

                  <Text
                    numberOfLines={1}
                    style={
                      styles.metadataText
                    }
                  >
                    {listedTime}
                  </Text>
                </View>
              ) : null}
            </View>

            <View
              style={
                styles.sellerRow
              }
            >
              <View
                style={
                  styles.sellerAvatar
                }
              >
                <Text
                  style={
                    styles.sellerAvatarText
                  }
                >
                  {sellerName
                    .trim()
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>

              <View
                style={
                  styles.sellerDetails
                }
              >
                <View
                  style={
                    styles.sellerNameRow
                  }
                >
                  <Text
                    numberOfLines={1}
                    style={
                      styles.sellerName
                    }
                  >
                    {sellerName}
                  </Text>

                  {verified ? (
                    <Ionicons
                      name="shield-checkmark"
                      size={14}
                      color={
                        palette.opportunityGreen
                      }
                    />
                  ) : null}
                </View>

                {typeof rating ===
                'number' ? (
                  <View
                    style={
                      styles.ratingRow
                    }
                  >
                    <Ionicons
                      name="star"
                      size={12}
                      color={
                        palette.opportunityGreen
                      }
                    />

                    <Text
                      style={
                        styles.ratingText
                      }
                    >
                      {rating.toFixed(
                        1,
                      )}

                      {typeof reviewCount ===
                      'number'
                        ? ` · ${reviewCount} reviews`
                        : ''}
                    </Text>
                  </View>
                ) : null}
              </View>

              {typeof gainScore ===
              'number' ? (
                <View
                  accessibilityLabel={`Gain Score ${gainScore}`}
                  style={
                    styles.listGainScoreBadge
                  }
                >
                  <Text
                    style={
                      styles.listGainScoreNumber
                    }
                  >
                    {gainScore}
                  </Text>

                  <Text
                    style={
                      styles.listGainScoreLabel
                    }
                  >
                    GAIN
                  </Text>
                </View>
              ) : null}
            </View>

            <View
              style={
                styles.listActions
              }
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Message ${sellerName}`}
                onPress={event => {
                  event.stopPropagation();

                  onMessagePress?.();
                }}
                style={({
                  pressed,
                }) => [
                  styles.secondaryAction,

                  pressed &&
                    styles.actionPressed,
                ]}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={15}
                  color={
                    textColor.primary
                  }
                />

                <Text
                  style={
                    styles.secondaryActionText
                  }
                >
                  Message
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Make an offer on ${title}`}
                onPress={event => {
                  event.stopPropagation();

                  onOfferPress?.();
                }}
                style={({
                  pressed,
                }) => [
                  styles.primaryAction,

                  pressed &&
                    styles.actionPressed,
                ]}
              >
                <Text
                  style={
                    styles.primaryActionText
                  }
                >
                  Make offer
                </Text>
              </Pressable>
            </View>
          </View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.pressOverlay,
              {
                opacity:
                  overlayOpacity,
              },
            ]}
          />
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [
            {
              scale:
                scaleAnimation,
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
        onPressIn={
          handlePressIn
        }
        onPressOut={
          handlePressOut
        }
        style={
          styles.gridCard
        }
      >
        <View
          style={
            styles.gridImageArea
          }
        >
          <DGImage
            source={image}
            aspectRatio="portrait"
            cornerRadius="large"
            favourite={
              favourite
            }
            onFavouritePress={
              onFavouritePress
            }
            imageCount={
              imageCount
            }
            auctionLabel={
              auctionLabel
            }
            accessibilityLabel={
              title
            }
            style={
              styles.gridImage
            }
          />

          {category &&
          !auctionLabel ? (
            <View
              style={
                styles.categoryBadge
              }
            >
              <View
                style={
                  styles.categoryDot
                }
              />

              <Text
                numberOfLines={1}
                style={
                  styles.categoryText
                }
              >
                {category}
              </Text>
            </View>
          ) : null}
        </View>

        <View
          style={
            styles.gridDetails
          }
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={
              0.84
            }
            style={
              styles.gridPrice
            }
          >
            {price}
          </Text>

          <Text
            numberOfLines={2}
            style={
              styles.gridTitle
            }
          >
            {title}
          </Text>

          <View
            style={
              styles.gridMetaRow
            }
          >
            <View
              style={
                styles.locationGroup
              }
            >
              <Ionicons
                name="location"
                size={12}
                color={
                  palette.opportunityGreen
                }
              />

              <Text
                numberOfLines={1}
                style={
                  styles.locationText
                }
              >
                {distance ||
                  location}
              </Text>
            </View>

            {typeof gainScore ===
            'number' ? (
              <View
                accessibilityLabel={`Gain Score ${gainScore}`}
                style={
                  styles.compactTrustBadge
                }
              >
                {verified ? (
                  <Ionicons
                    name="shield-checkmark"
                    size={11}
                    color={
                      palette.opportunityGreen
                    }
                  />
                ) : (
                  <Ionicons
                    name="trending-up"
                    size={11}
                    color={
                      palette.opportunityGreen
                    }
                  />
                )}

                <Text
                  style={
                    styles.compactTrustText
                  }
                >
                  {gainScore}
                </Text>
              </View>
            ) : verified ? (
              <View
                accessibilityLabel="Verified seller"
                style={
                  styles.compactVerifiedBadge
                }
              >
                <Ionicons
                  name="shield-checkmark"
                  size={12}
                  color={
                    palette.opportunityGreen
                  }
                />
              </View>
            ) : null}
          </View>

          {listedTime ? (
            <Text
              numberOfLines={1}
              style={
                styles.gridListedTime
              }
            >
              {listedTime}
            </Text>
          ) : null}
        </View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.pressOverlay,
            {
              opacity:
                overlayOpacity,
            },
          ]}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
  },

  gridCard: {
    position: 'relative',

    width: '100%',

    overflow: 'hidden',

    borderRadius:
      radius.lg,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardRaised,

    ...shadow.card,
  },

  gridImageArea: {
    position: 'relative',

    width: '100%',

    overflow: 'hidden',
  },

  gridImage: {
    width: '100%',

    borderRadius: 0,
  },

  categoryBadge: {
    position: 'absolute',

    top: 9,
    left: 9,

    maxWidth: '62%',

    minHeight: 24,

    paddingHorizontal:
      spacing.xs,

    borderRadius:
      radius.pill,

    borderWidth: 1,

    borderColor:
      alpha.green40,

    backgroundColor:
      'rgba(5, 9, 6, 0.90)',

    flexDirection: 'row',

    alignItems: 'center',
  },

  categoryDot: {
    width: 5,
    height: 5,

    marginRight: 5,

    borderRadius:
      radius.pill,

    backgroundColor:
      palette.opportunityGreen,
  },

  categoryText: {
    flexShrink: 1,

    color:
      palette.opportunityGreen,

    fontSize: 8,

    lineHeight: 11,

    fontWeight: '900',

    letterSpacing: 0.55,

    textTransform:
      'uppercase',
  },

  gridDetails: {
    minHeight: 120,

    paddingHorizontal: 11,

    paddingTop: 10,

    paddingBottom: 11,
  },

  gridPrice: {
    color:
      palette.opportunityGreen,

    fontSize: 20,

    lineHeight: 23,

    fontWeight: '900',

    letterSpacing: -0.5,
  },

  gridTitle: {
    minHeight: 34,

    marginTop: 3,

    color:
      textColor.primary,

    fontSize: 12,

    lineHeight: 16,

    fontWeight: '800',
  },

  gridMetaRow: {
    marginTop: 9,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',
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

    color:
      textColor.secondary,

    fontSize: 9,

    fontWeight: '700',
  },

  compactTrustBadge: {
    minWidth: 38,

    height: 23,

    paddingHorizontal: 6,

    borderRadius:
      radius.pill,

    borderWidth: 1,

    borderColor:
      alpha.green20,

    backgroundColor:
      alpha.green06,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'center',
  },

  compactTrustText: {
    marginLeft: 4,

    color:
      textColor.primary,

    fontSize: 9,

    fontWeight: '900',
  },

  compactVerifiedBadge: {
    width: 24,
    height: 24,

    borderRadius: 8,

    borderWidth: 1,

    borderColor:
      alpha.green20,

    backgroundColor:
      alpha.green06,

    alignItems: 'center',

    justifyContent:
      'center',
  },

  gridListedTime: {
    marginTop: 7,

    color:
      textColor.muted,

    fontSize: 8,

    lineHeight: 11,

    fontWeight: '700',
  },

  pressOverlay: {
    position: 'absolute',

    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    backgroundColor:
      alpha.green06,
  },

  listCard: {
    position: 'relative',

    width: '100%',

    padding: spacing.sm,

    borderRadius:
      radius.card,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardRaised,

    flexDirection: 'row',

    overflow: 'hidden',

    ...shadow.card,
  },

  listImageArea: {
    position: 'relative',

    width: 126,

    minHeight: 182,

    borderRadius:
      radius.lg,

    overflow: 'hidden',
  },

  listImage: {
    width: '100%',

    height: '100%',

    borderRadius:
      radius.lg,
  },

  listCategoryBadge: {
    position: 'absolute',

    left: 8,
    bottom: 8,

    maxWidth: '84%',

    minHeight: 24,

    paddingHorizontal:
      spacing.xs,

    borderRadius:
      radius.pill,

    borderWidth: 1,

    borderColor:
      alpha.green40,

    backgroundColor:
      'rgba(5, 9, 6, 0.90)',

    flexDirection: 'row',

    alignItems: 'center',
  },

  listContent: {
    flex: 1,

    minWidth: 0,

    paddingLeft:
      spacing.md,

    justifyContent:
      'space-between',
  },

  listPrice: {
    color:
      palette.opportunityGreen,

    fontSize: 22,

    lineHeight: 26,

    fontWeight: '900',

    letterSpacing: -0.5,
  },

  listTitle: {
    marginTop: 4,

    color:
      textColor.primary,

    fontSize: 15,

    lineHeight: 20,

    fontWeight: '900',
  },

  listMetadata: {
    marginTop:
      spacing.sm,

    gap: 5,
  },

  metadataLine: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  metadataText: {
    flex: 1,

    marginLeft: 5,

    color:
      textColor.muted,

    fontSize: 10,

    lineHeight: 14,

    fontWeight: '700',
  },

  sellerRow: {
    marginTop:
      spacing.sm,

    paddingTop:
      spacing.sm,

    borderTopWidth: 1,

    borderTopColor:
      alpha.white08,

    flexDirection: 'row',

    alignItems: 'center',
  },

  sellerAvatar: {
    width: 34,
    height: 34,

    borderRadius: 12,

    backgroundColor:
      alpha.green10,

    alignItems: 'center',

    justifyContent:
      'center',
  },

  sellerAvatarText: {
    color:
      palette.opportunityGreen,

    fontSize: 13,

    fontWeight: '900',
  },

  sellerDetails: {
    flex: 1,

    minWidth: 0,

    marginLeft: 9,
  },

  sellerNameRow: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 4,
  },

  sellerName: {
    flexShrink: 1,

    color:
      textColor.primary,

    fontSize: 11,

    fontWeight: '800',
  },

  ratingRow: {
    marginTop: 3,

    flexDirection: 'row',

    alignItems: 'center',
  },

  ratingText: {
    marginLeft: 4,

    color:
      textColor.muted,

    fontSize: 9,

    fontWeight: '700',
  },

  listGainScoreBadge: {
    minWidth: 48,

    minHeight: 34,

    paddingHorizontal: 8,

    borderRadius:
      radius.md,

    borderWidth: 1,

    borderColor:
      alpha.green20,

    backgroundColor:
      alpha.green06,

    alignItems: 'center',

    justifyContent:
      'center',
  },

  listGainScoreNumber: {
    color:
      palette.opportunityGreen,

    fontSize: 12,

    fontWeight: '900',
  },

  listGainScoreLabel: {
    marginTop: 1,

    color:
      textColor.muted,

    fontSize: 6,

    lineHeight: 8,

    fontWeight: '900',

    letterSpacing: 0.7,
  },

  listActions: {
    marginTop:
      spacing.sm,

    flexDirection: 'row',

    gap: spacing.xs,
  },

  secondaryAction: {
    flex: 1,

    minHeight: 36,

    borderRadius:
      radius.sm,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardSoft,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'center',
  },

  secondaryActionText: {
    marginLeft: 6,

    color:
      textColor.primary,

    fontSize: 10,

    fontWeight: '800',
  },

  primaryAction: {
    flex: 1,

    minHeight: 36,

    borderRadius:
      radius.sm,

    backgroundColor:
      palette.opportunityGreen,

    alignItems: 'center',

    justifyContent:
      'center',
  },

  primaryActionText: {
    color:
      textColor.inverse,

    fontSize: 10,

    fontWeight: '900',
  },

  actionPressed: {
    opacity: 0.8,

    transform: [
      {
        scale: 0.97,
      },
    ],
  },
});