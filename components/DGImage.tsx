import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ImageResizeMode,
  ImageSourcePropType,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { colors } from '../theme/colors';

type DGImageAspectRatio =
  | 'square'
  | 'portrait'
  | 'landscape'
  | 'wide';

type DGImageCornerRadius =
  | 'small'
  | 'medium'
  | 'large';

type DGImageProps = {
  source: ImageSourcePropType;

  aspectRatio?: DGImageAspectRatio;
  cornerRadius?: DGImageCornerRadius;
  resizeMode?: ImageResizeMode;

  favourite?: boolean;
  onFavouritePress?: () => void;

  /*
   * Kept for compatibility with existing components.
   * Seller verification is now displayed beside the
   * seller name instead of over the listing image.
   */
  verified?: boolean;

  imageIndex?: number;
  imageCount?: number;

  auctionLabel?: string;

  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export default function DGImage({
  source,
  aspectRatio = 'landscape',
  cornerRadius = 'large',
  resizeMode = 'cover',
  favourite = false,
  onFavouritePress,
  imageIndex = 1,
  imageCount,
  auctionLabel,
  accessibilityLabel = 'Direct Gain image',
  style,
  testID,
}: DGImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const imageOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const skeletonOpacity = useRef(
    new Animated.Value(0.4),
  ).current;

  const favouriteScale = useRef(
    new Animated.Value(1),
  ).current;

  useEffect(() => {
    if (!isLoading || hasError) {
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonOpacity, {
          toValue: 0.78,
          duration: 700,
          useNativeDriver: true,
        }),

        Animated.timing(skeletonOpacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [
    hasError,
    isLoading,
    skeletonOpacity,
  ]);

  function handleLoadStart() {
    setIsLoading(true);
    setHasError(false);
    imageOpacity.setValue(0);
  }

  function handleLoad() {
    setIsLoading(false);
    setHasError(false);

    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }

  function handleError() {
    setIsLoading(false);
    setHasError(true);
    imageOpacity.setValue(0);
  }

  function handleFavouritePress() {
    if (!onFavouritePress) {
      return;
    }

    Animated.sequence([
      Animated.spring(favouriteScale, {
        toValue: 0.82,
        speed: 30,
        bounciness: 0,
        useNativeDriver: true,
      }),

      Animated.spring(favouriteScale, {
        toValue: 1.16,
        speed: 26,
        bounciness: 8,
        useNativeDriver: true,
      }),

      Animated.spring(favouriteScale, {
        toValue: 1,
        speed: 24,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();

    onFavouritePress();
  }

  const showImageCount =
    typeof imageCount === 'number' &&
    imageCount > 1;

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        getAspectRatioStyle(aspectRatio),
        getCornerRadiusStyle(cornerRadius),
        style,
      ]}
    >
      {!hasError ? (
        <Animated.Image
          source={source}
          resizeMode={resizeMode}
          accessibilityLabel={accessibilityLabel}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
          style={[
            styles.image,
            {
              opacity: imageOpacity,
            },
          ]}
        />
      ) : null}

      {isLoading && !hasError ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.fill,
            styles.skeleton,
            {
              opacity: skeletonOpacity,
            },
          ]}
        >
          <View style={styles.placeholderIcon}>
            <Ionicons
              name="image-outline"
              size={27}
              color={colors.textMuted}
            />
          </View>
        </Animated.View>
      ) : null}

      {hasError ? (
        <View
          style={[
            styles.fill,
            styles.errorContainer,
          ]}
        >
          <View style={styles.placeholderIcon}>
            <Ionicons
              name="image-outline"
              size={27}
              color={colors.textMuted}
            />
          </View>

          <Text style={styles.errorTitle}>
            Image unavailable
          </Text>

          <Text style={styles.errorDescription}>
            This image could not be loaded.
          </Text>
        </View>
      ) : null}

      {!hasError ? (
        <View
          pointerEvents="none"
          style={[
            styles.fill,
            styles.imageShade,
          ]}
        />
      ) : null}

      {onFavouritePress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            favourite
              ? 'Remove from favourites'
              : 'Add to favourites'
          }
          accessibilityState={{
            selected: favourite,
          }}
          hitSlop={10}
          onPress={handleFavouritePress}
          style={styles.favouritePressable}
        >
          <Animated.View
            style={[
              styles.favouriteButton,
              favourite &&
                styles.favouriteButtonActive,
              {
                transform: [
                  {
                    scale: favouriteScale,
                  },
                ],
              },
            ]}
          >
            <Ionicons
              name={
                favourite
                  ? 'heart'
                  : 'heart-outline'
              }
              size={21}
              color={
                favourite
                  ? colors.primary
                  : colors.text
              }
            />
          </Animated.View>
        </Pressable>
      ) : null}

      {auctionLabel ? (
        <View style={styles.auctionBadge}>
          <Ionicons
            name="hammer"
            size={13}
            color={colors.text}
          />

          <Text
            numberOfLines={1}
            style={styles.auctionText}
          >
            {auctionLabel}
          </Text>
        </View>
      ) : null}

      {showImageCount ? (
        <View style={styles.imageCountBadge}>
          <Ionicons
            name="images-outline"
            size={13}
            color={colors.text}
          />

          <Text style={styles.imageCountText}>
            {imageIndex}/{imageCount}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function getAspectRatioStyle(
  aspectRatio: DGImageAspectRatio,
) {
  switch (aspectRatio) {
    case 'square':
      return styles.squareRatio;

    case 'portrait':
      return styles.portraitRatio;

    case 'wide':
      return styles.wideRatio;

    case 'landscape':
    default:
      return styles.landscapeRatio;
  }
}

function getCornerRadiusStyle(
  cornerRadius: DGImageCornerRadius,
) {
  switch (cornerRadius) {
    case 'small':
      return styles.smallRadius;

    case 'medium':
      return styles.mediumRadius;

    case 'large':
    default:
      return styles.largeRadius;
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.cardRaised,
  },

  fill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  squareRatio: {
    aspectRatio: 1,
  },

  portraitRatio: {
    aspectRatio: 4 / 5,
  },

  landscapeRatio: {
    aspectRatio: 4 / 3,
  },

  wideRatio: {
    aspectRatio: 16 / 9,
  },

  smallRadius: {
    borderRadius: 10,
  },

  mediumRadius: {
    borderRadius: 16,
  },

  largeRadius: {
    borderRadius: 22,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  imageShade: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },

  skeleton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardRaised,
  },

  placeholderIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
  },

  errorContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardRaised,
  },

  errorTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },

  errorDescription: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  favouritePressable: {
    position: 'absolute',
    top: 12,
    right: 12,
  },

  favouriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.16)',
    backgroundColor:
      'rgba(7, 10, 8, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  favouriteButtonActive: {
    borderColor: `${colors.primary}88`,
    backgroundColor:
      'rgba(7, 16, 4, 0.94)',

    shadowColor: colors.primary,
    shadowOpacity: 0.24,
    shadowRadius: 10,
  },

  auctionBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    maxWidth: '65%',
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.16)',
    backgroundColor:
      'rgba(7, 10, 8, 0.88)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  auctionText: {
    flexShrink: 1,
    marginLeft: 6,
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },

  imageCountBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    minHeight: 30,
    paddingHorizontal: 9,
    borderRadius: 15,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.14)',
    backgroundColor:
      'rgba(7, 10, 8, 0.82)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  imageCountText: {
    marginLeft: 5,
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
});