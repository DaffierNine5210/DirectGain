import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import type { ListingSeller } from '../../types/Listing';

type Props = {
  seller: ListingSeller;
  onPress?: () => void;
};

export default function SellerTrustCard({
  seller,
  onPress,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${seller.name}'s profile`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {seller.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {seller.name}
            </Text>

            {seller.verification.includes('identity') && (
              <Ionicons
                name="shield-checkmark"
                size={17}
                color={colors.primary}
              />
            )}
          </View>

          <Text style={styles.memberSince}>
            Member since {seller.memberSince}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textMuted}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {seller.gainScore}
          </Text>

          <Text style={styles.statLabel}>
            Gain Score
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {seller.rating.toFixed(1)} ★
          </Text>

          <Text style={styles.statLabel}>
            {seller.reviewCount} reviews
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {seller.completedSales}
          </Text>

          <Text style={styles.statLabel}>
            Sales
          </Text>
        </View>
      </View>

      <View style={styles.responseRow}>
        <Ionicons
          name="flash-outline"
          size={16}
          color={colors.primary}
        />

        <Text style={styles.responseText}>
          {seller.responseTime}
        </Text>
      </View>

      <View style={styles.badgeRow}>
        {seller.verification.includes('identity') && (
          <View style={styles.badge}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={colors.primary}
            />

            <Text style={styles.badgeText}>
              Identity Verified
            </Text>
          </View>
        )}

        {seller.verification.includes('business') && (
          <View style={styles.badge}>
            <Ionicons
              name="briefcase"
              size={14}
              color={colors.primary}
            />

            <Text style={styles.badgeText}>
              Business Verified
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.18)',
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.24)',
    backgroundColor: 'rgba(158, 246, 90, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: colors.primary,
    fontSize: 21,
    fontWeight: '900',
  },

  identity: {
    flex: 1,
    marginLeft: 13,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  name: {
    marginRight: 6,
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },

  memberSince: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },

  statsRow: {
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(158, 246, 90, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  stat: {
    flex: 1,
    alignItems: 'center',
  },

  statValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },

  statLabel: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  responseRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  responseText: {
    marginLeft: 7,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  badgeRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  badge: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  badgeText: {
    marginLeft: 6,
    color: colors.text,
    fontSize: 10,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.985 }],
  },
});