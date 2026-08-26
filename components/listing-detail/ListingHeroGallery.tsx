import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';

type Props = {
  images?: ImageSourcePropType[];
  image?: ImageSourcePropType;

  favourite?: boolean;

  onBackPress: () => void;
  onFavouritePress: () => void;
  onSharePress: () => void;
};

export default function ListingHeroGallery({
  images,
  image,

  favourite = false,

  onBackPress,
  onFavouritePress,
  onSharePress,
}: Props) {
  const { width } =
    useWindowDimensions();

  const listRef =
    useRef<FlatList<ImageSourcePropType>>(
      null,
    );

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const safeImages: ImageSourcePropType[] =
    Array.isArray(images) &&
    images.length > 0
      ? images
      : image
        ? [image]
        : [];

  function handleMomentumEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    if (safeImages.length === 0) {
      return;
    }

    const offset =
      event.nativeEvent
        .contentOffset.x;

    const nextIndex =
      Math.round(
        offset / width,
      );

    const boundedIndex =
      Math.max(
        0,
        Math.min(
          nextIndex,
          safeImages.length - 1,
        ),
      );

    setCurrentIndex(
      boundedIndex,
    );
  }

  return (
    <View style={styles.container}>
      {safeImages.length > 0 ? (
        <FlatList
          ref={listRef}
          horizontal
          pagingEnabled
          data={safeImages}
          keyExtractor={(
            _,
            index,
          ) =>
            `listing-image-${index}`
          }
          showsHorizontalScrollIndicator={
            false
          }
          bounces={false}
          decelerationRate="fast"
          onMomentumScrollEnd={
            handleMomentumEnd
          }
          renderItem={({
            item,
          }) => (
            <View
              style={{
                width,
              }}
            >
              <Image
                source={item}
                resizeMode="cover"
                style={
                  styles.image
                }
              />
            </View>
          )}
        />
      ) : (
        <View
          style={
            styles.emptyImage
          }
        >
          <Ionicons
            name="image-outline"
            size={42}
            color={
              colors.textMuted
            }
          />

          <Text
            style={
              styles.emptyImageText
            }
          >
            No listing photos
          </Text>
        </View>
      )}

      <View
        pointerEvents="none"
        style={styles.overlay}
      />

      <View
        style={
          styles.topActions
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          onPress={
            onBackPress
          }
          style={({
            pressed,
          }) => [
            styles.actionButton,

            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={
              colors.text
            }
          />
        </Pressable>

        <View
          style={
            styles.rightActions
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              favourite
                ? 'Remove from saved listings'
                : 'Save listing'
            }
            hitSlop={8}
            onPress={
              onFavouritePress
            }
            style={({
              pressed,
            }) => [
              styles.actionButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name={
                favourite
                  ? 'heart'
                  : 'heart-outline'
              }
              size={22}
              color={
                favourite
                  ? colors.primary
                  : colors.text
              }
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share listing"
            hitSlop={8}
            onPress={
              onSharePress
            }
            style={({
              pressed,
            }) => [
              styles.actionButton,

              styles.actionButtonSpacing,

              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="share-outline"
              size={22}
              color={
                colors.text
              }
            />
          </Pressable>
        </View>
      </View>

      {safeImages.length > 1 ? (
        <View
          pointerEvents="none"
          style={
            styles.pagination
          }
        >
          {safeImages
            .slice(0, 7)
            .map(
              (_, index) => {
                const isActive =
                  currentIndex ===
                  index;

                const hasMore =
                  safeImages.length >
                    7 &&
                  index === 6;

                return (
                  <View
                    key={`gallery-dot-${index}`}
                    style={[
                      styles.dot,

                      isActive &&
                        styles.dotActive,

                      hasMore &&
                        !isActive &&
                        styles.dotMore,
                    ]}
                  />
                );
              },
            )}
        </View>
      ) : null}

      <View
        pointerEvents="none"
        style={
          styles.imageCounter
        }
      >
        <Ionicons
          name="images-outline"
          size={14}
          color={
            colors.text
          }
        />

        <Text
          style={
            styles.imageCounterText
          }
        >
          {safeImages.length > 0
            ? currentIndex + 1
            : 0}{' '}
          / {safeImages.length}
        </Text>
      </View>

      {safeImages.length > 1 ? (
        <View
          pointerEvents="none"
          style={
            styles.swipeHint
          }
        >
          <Ionicons
            name="swap-horizontal"
            size={13}
            color={
              colors.textMuted
            }
          />

          <Text
            style={
              styles.swipeHintText
            }
          >
            Swipe photos
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      position: 'relative',

      width: '100%',
      height: 390,

      overflow: 'hidden',

      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,

      backgroundColor:
        '#111512',
    },

    image: {
      width: '100%',
      height: 390,

      backgroundColor:
        '#111512',
    },

    emptyImage: {
      width: '100%',
      height: '100%',

      alignItems: 'center',

      justifyContent:
        'center',

      backgroundColor:
        '#111512',
    },

    emptyImageText: {
      marginTop: 10,

      color:
        colors.textMuted,

      fontSize: 12,

      fontWeight: '700',
    },

    overlay: {
      position: 'absolute',

      top: 0,
      right: 0,
      bottom: 0,
      left: 0,

      backgroundColor:
        'rgba(0, 0, 0, 0.05)',
    },

    topActions: {
      position: 'absolute',

      top: 14,
      right: 14,
      left: 14,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },

    rightActions: {
      flexDirection: 'row',

      alignItems: 'center',
    },

    actionButton: {
      width: 44,
      height: 44,

      borderRadius: 15,

      borderWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.18)',

      backgroundColor:
        'rgba(8, 11, 9, 0.76)',

      alignItems: 'center',

      justifyContent:
        'center',
    },

    actionButtonSpacing: {
      marginLeft: 9,
    },

    pagination: {
      position: 'absolute',

      right: 100,
      bottom: 24,
      left: 100,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'center',
    },

    dot: {
      width: 6,
      height: 6,

      marginHorizontal: 3,

      borderRadius: 3,

      backgroundColor:
        'rgba(255, 255, 255, 0.34)',
    },

    dotActive: {
      width: 18,

      backgroundColor:
        colors.primary,
    },

    dotMore: {
      opacity: 0.55,
    },

    imageCounter: {
      position: 'absolute',

      right: 16,
      bottom: 16,

      minHeight: 32,

      paddingHorizontal: 11,

      borderRadius: 12,

      borderWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.16)',

      backgroundColor:
        'rgba(8, 11, 9, 0.82)',

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'center',
    },

    imageCounterText: {
      marginLeft: 6,

      color:
        colors.text,

      fontSize: 11,

      fontWeight: '800',
    },

    swipeHint: {
      position: 'absolute',

      left: 16,
      bottom: 16,

      minHeight: 32,

      paddingHorizontal: 10,

      borderRadius: 12,

      backgroundColor:
        'rgba(8, 11, 9, 0.72)',

      flexDirection: 'row',

      alignItems: 'center',
    },

    swipeHintText: {
      marginLeft: 5,

      color:
        colors.textMuted,

      fontSize: 9,

      fontWeight: '700',
    },

    pressed: {
      opacity: 0.72,

      transform: [
        {
          scale: 0.96,
        },
      ],
    },
  });