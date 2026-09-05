import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import ProfileAvatar from './ProfileAvatar';

import {
  formatAccountTypeLabel,
  formatProfileLocation,
} from '../../services/profile/profileAdapter';

import type { DirectGainProfile } from '../../types/profile';

import {
  iconSize,
  spacing,
  textColor,
  typography,
} from '../../theme/designSystem';

type ProfileIdentityHeaderProps = {
  profile: DirectGainProfile;
  mode?: 'own' | 'public';
  avatarUrl?: string | null;
  avatarBusy?: boolean;
  avatarUnavailable?: boolean;
  onAvatarPress?: () => void;
};

export default function ProfileIdentityHeader({
  profile,
  mode = 'public',
  avatarUrl = null,
  avatarBusy = false,
  avatarUnavailable = false,
  onAvatarPress,
}: ProfileIdentityHeaderProps) {
  const location = formatProfileLocation(
    profile.suburb,
    profile.state,
  );

  const accessibilityLabel =
    mode === 'own'
      ? `Your profile. ${profile.displayName}.`
      : `${profile.displayName}. Direct Gain profile.`;

  return (
    <View
      style={styles.identity}
      accessibilityLabel={accessibilityLabel}
    >
      <ProfileAvatar
        displayName={profile.displayName}
        imageUri={avatarUrl}
        hasStoredPhoto={Boolean(profile.avatarPath)}
        photoUnavailable={avatarUnavailable}
        size="xl"
        editable={mode === 'own'}
        busy={avatarBusy}
        onPress={
          mode === 'own' ? onAvatarPress : undefined
        }
      />

      <Text
        style={styles.name}
        accessibilityRole="header"
      >
        {profile.displayName}
      </Text>

      <Text style={styles.meta}>
        {formatAccountTypeLabel(profile.accountType)}
      </Text>

      {location ? (
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={iconSize.sm}
            color={textColor.muted}
          />
          <Text style={styles.location}>{location}</Text>
        </View>
      ) : null}

      {profile.bio ? (
        <Text style={styles.bio}>{profile.bio}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  identity: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },

  name: {
    color: textColor.primary,
    ...typography.headingLarge,
    textAlign: 'center',
  },

  meta: {
    color: textColor.muted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  location: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  bio: {
    marginTop: spacing.xs,
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    textAlign: 'center',
  },
});
