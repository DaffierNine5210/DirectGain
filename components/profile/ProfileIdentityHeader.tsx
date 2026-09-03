import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import {
  formatAccountTypeLabel,
  formatProfileLocation,
  profileInitials,
} from '../../services/profile/profileAdapter';

import type { DirectGainProfile } from '../../types/profile';

import {
  alpha,
  iconSize,
  palette,
  spacing,
  textColor,
  typography,
} from '../../theme/designSystem';

type ProfileIdentityHeaderProps = {
  profile: DirectGainProfile;
  mode?: 'own' | 'public';
};

export default function ProfileIdentityHeader({
  profile,
  mode = 'public',
}: ProfileIdentityHeaderProps) {
  const location = formatProfileLocation(
    profile.suburb,
    profile.state,
  );

  const accessibilityLabel =
    mode === 'own'
      ? `Your profile. ${profile.displayName}.`
      : profile.displayName;

  return (
    <View
      style={styles.identity}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.avatarRing}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>
            {profileInitials(profile.displayName)}
          </Text>
        </View>
      </View>

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

  avatarRing: {
    padding: 3,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: alpha.green20,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: alpha.green10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  initials: {
    color: palette.opportunityGreen,
    fontSize: 28,
    fontWeight: '800',
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
