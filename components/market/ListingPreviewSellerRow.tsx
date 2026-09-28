import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import IdentityVerifiedMark from '../profile/IdentityVerifiedMark';

import {
  alpha,
  palette,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

type ListingPreviewSellerRowProps = {
  displayName: string;
  avatarUrl: string | null;
  identityVerified: boolean;
  onViewProfile: () => void;
};

export default function ListingPreviewSellerRow({
  displayName,
  avatarUrl,
  identityVerified,
  onViewProfile,
}: ListingPreviewSellerRowProps) {
  const initials = getInitials(displayName);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${displayName}'s Gain Profile`}
      accessibilityHint="Opens your Direct Gain profile."
      onPress={onViewProfile}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.mainRow}>
        <View style={styles.avatar}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatarImage}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
        </View>

        <View style={styles.identity}>
          <Text numberOfLines={1} style={styles.name}>
            {displayName}
          </Text>
          <IdentityVerifiedMark
            identityVerified={identityVerified}
          />
          {!identityVerified ? (
            <Text style={styles.profileLabel}>Gain Profile</Text>
          ) : null}
        </View>

        <View style={styles.action}>
          <Text style={styles.actionText}>View profile</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={palette.opportunityGreen}
          />
        </View>
      </View>
    </Pressable>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'DG';
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
  },

  pressed: {
    opacity: 0.88,
  },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.white08,
  },

  avatarImage: {
    width: 48,
    height: 48,
  },

  avatarText: {
    color: textColor.primary,
    fontSize: 16,
    fontWeight: '800',
  },

  identity: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },

  name: {
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },

  profileLabel: {
    color: textColor.muted,
    fontSize: 12,
    fontWeight: '700',
  },

  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  actionText: {
    color: palette.opportunityGreen,
    fontSize: 12,
    fontWeight: '800',
  },
});
