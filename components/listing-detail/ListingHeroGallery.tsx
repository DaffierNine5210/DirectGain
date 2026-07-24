import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';

type Props = {
  image: ImageSourcePropType;
  imageCount?: number;
  currentImage?: number;
  favourite?: boolean;
  onBackPress: () => void;
  onFavouritePress: () => void;
  onSharePress: () => void;
};

export default function ListingHeroGallery({
  image,
  imageCount = 1,
  currentImage = 1,
  favourite = false,
  onBackPress,
  onFavouritePress,
  onSharePress,
}: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={image}
        resizeMode="cover"
        style={styles.image}
      />

      <View style={styles.overlay} />

      <View style={styles.topActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBackPress}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.text}
          />
        </Pressable>

        <View style={styles.rightActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              favourite
                ? 'Remove listing from favourites'
                : 'Save listing to favourites'
            }
            onPress={onFavouritePress}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={
                favourite ? 'heart' : 'heart-outline'
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
            onPress={onSharePress}
            style={({ pressed }) => [
              styles.actionButton,
              styles.actionButtonSpacing,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="share-outline"
              size={22}
              color={colors.text}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.imageCounter}>
        <Ionicons
          name="images-outline"
          size={14}
          color={colors.text}
        />

        <Text style={styles.imageCounterText}>
          {currentImage} / {imageCount}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: 340,
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: '#111512',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  overlay: {
  ...StyleSheet.absoluteFill,
  backgroundColor: 'rgba(0, 0, 0, 0.12)',

  },

  topActions: {
    position: 'absolute',
    top: 14,
    right: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: 'rgba(8, 11, 9, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionButtonSpacing: {
    marginLeft: 9,
  },

  imageCounter: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    minHeight: 32,
    paddingHorizontal: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: 'rgba(8, 11, 9, 0.76)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageCounterText: {
    marginLeft: 6,
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
});