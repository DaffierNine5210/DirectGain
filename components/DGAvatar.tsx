import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';

type AvatarSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl';

type DGAvatarProps = {
  image?: ImageSourcePropType;

  initials?: string;

  size?: AvatarSize;

  verified?: boolean;

  online?: boolean;

  gainScore?: number;

  onPress?: () => void;
};

export default function DGAvatar({
  image,
  initials,
  size = 'md',
  verified = false,
  online = false,
  gainScore,
  onPress,
}: DGAvatarProps) {
  const avatarSize = getSize(size);

  const content = (
    <View
      style={[
        styles.outerRing,
        {
          width: avatarSize + 8,
          height: avatarSize + 8,
          borderRadius: (avatarSize + 8) / 2,
        },
      ]}
    >
      <View
        style={[
          styles.avatar,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          },
        ]}
      >
        {image ? (
          <Image
            source={image}
            style={styles.image}
          />
        ) : (
          <Text style={styles.initials}>
            {initials ?? 'DG'}
          </Text>
        )}

        {online && (
          <View style={styles.onlineDot} />
        )}

        {verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons
              name="checkmark"
              size={10}
              color="#071004"
            />
          </View>
        )}
      </View>

      {typeof gainScore === 'number' && (
        <View style={styles.gainBadge}>
          <Text style={styles.gainText}>
            {gainScore}
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
}

function getSize(size: AvatarSize) {
  switch (size) {
    case 'xs':
      return 30;

    case 'sm':
      return 40;

    case 'md':
      return 54;

    case 'lg':
      return 68;

    case 'xl':
      return 92;
  }
}

const styles = StyleSheet.create({
  outerRing: {
    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 2,
    borderColor: 'rgba(158,246,90,0.28)',

    backgroundColor: 'rgba(158,246,90,0.03)',
  },

  avatar: {
    overflow: 'hidden',

    backgroundColor: colors.cardRaised,

    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  initials: {
    color: colors.primary,

    fontSize: 18,

    fontWeight: '900',
  },

  verifiedBadge: {
    position: 'absolute',

    bottom: 0,

    right: 0,

    width: 18,

    height: 18,

    borderRadius: 9,

    backgroundColor: colors.primary,

    alignItems: 'center',

    justifyContent: 'center',

    borderWidth: 2,

    borderColor: colors.cardRaised,
  },

  onlineDot: {
    position: 'absolute',

    bottom: 2,

    left: 2,

    width: 12,

    height: 12,

    borderRadius: 6,

    backgroundColor: '#41D36A',

    borderWidth: 2,

    borderColor: colors.cardRaised,
  },

  gainBadge: {
    position: 'absolute',

    top: -4,

    right: -4,

    minWidth: 22,

    height: 22,

    borderRadius: 11,

    backgroundColor: '#111',

    borderWidth: 1,

    borderColor: colors.primary,

    alignItems: 'center',

    justifyContent: 'center',
  },

  gainText: {
    color: colors.primary,

    fontSize: 10,

    fontWeight: '900',
  },
});