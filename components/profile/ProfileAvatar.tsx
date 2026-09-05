import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { profileInitials } from '../../services/profile/profileAdapter';

import {
  alpha,
  iconSize,
  palette,
  surface,
  textColor,
} from '../../theme/designSystem';

export type ProfileAvatarSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl';

const AVATAR_SIZES: Record<ProfileAvatarSize, number> = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 72,
  xl: 104,
};

type ProfileAvatarProps = {
  displayName: string;
  imageUri?: string | null;
  hasStoredPhoto?: boolean;
  photoUnavailable?: boolean;
  size?: ProfileAvatarSize;
  editable?: boolean;
  busy?: boolean;
  onPress?: () => void;
};

export default function ProfileAvatar({
  displayName,
  imageUri = null,
  hasStoredPhoto = false,
  photoUnavailable = false,
  size = 'md',
  editable = false,
  busy = false,
  onPress,
}: ProfileAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUri]);

  const dimension = AVATAR_SIZES[size];
  const initialsSize = Math.round(dimension * 0.34);
  const showImage = Boolean(imageUri) && !imageFailed;
  const showInitials =
    !hasStoredPhoto || photoUnavailable || imageFailed;
  const interactive = Boolean(onPress) && !busy;

  const content = (
    <View
      style={[
        styles.wrap,
        {
          width: dimension,
          height: dimension,
        },
      ]}
    >
      <View
        style={[
          styles.circle,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
          },
        ]}
      >
        {showImage && imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
            accessibilityLabel={`${displayName} profile photo`}
            onError={() => {
              setImageFailed(true);
            }}
          />
        ) : null}

        {showInitials ? (
          <Text
            style={[
              styles.initials,
              { fontSize: initialsSize },
            ]}
          >
            {profileInitials(displayName)}
          </Text>
        ) : null}

        {busy ? (
          <View style={styles.busy}>
            <ActivityIndicator
              color={palette.opportunityGreen}
            />
          </View>
        ) : null}
      </View>

      {editable && !busy ? (
        <View
          style={styles.editBadge}
          accessibilityElementsHidden
        >
          <Ionicons
            name="camera-outline"
            size={iconSize.xs}
            color={textColor.primary}
          />
        </View>
      ) : null}
    </View>
  );

  if (!interactive) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        hasStoredPhoto
          ? 'Change profile photo'
          : 'Add profile photo'
      }
      onPress={onPress}
      style={({ pressed }) => [
        pressed && styles.pressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },

  circle: {
    overflow: 'hidden',
    backgroundColor: surface.cardRaised,
    borderWidth: 1,
    borderColor: alpha.white08,
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  initials: {
    color: palette.opportunityGreen,
    fontWeight: '800',
  },

  busy: {
    ...StyleSheet.absoluteFill,
    backgroundColor: alpha.black40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  editBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: surface.page,
    borderWidth: 1,
    borderColor: alpha.white14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pressed: {
    opacity: 0.86,
  },
});
