import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';
import type { SellerProfile } from '../../types/SellerProfile';

type Props = {
  seller: SellerProfile;
  isFollowing: boolean;
  onFollowPress: () => void;
  onMessagePress: () => void;
};

export default function SellerProfileHeader({
  seller,
  isFollowing,
  onFollowPress,
  onMessagePress,
}: Props) {
  const initials = seller.name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.cover}>
        <View style={styles.coverGlowLarge} />
        <View style={styles.coverGlowSmall} />

        <View style={styles.brandMark}>
          <Ionicons
            name="trending-up"
            size={34}
            color={colors.primary}
          />
        </View>
      </View>

      <View style={styles.profileContent}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarOuter}>
            {seller.profileImage ? (
              <Image
                source={seller.profileImage}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>
                  {initials}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Message ${seller.name}`}
              onPress={onMessagePress}
              style={({ pressed }) => [
                styles.messageButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color={colors.text}
              />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isFollowing
                  ? `Unfollow ${seller.name}`
                  : `Follow ${seller.name}`
              }
              onPress={onFollowPress}
              style={({ pressed }) => [
                styles.followButton,
                isFollowing && styles.followingButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={
                  isFollowing
                    ? 'checkmark'
                    : 'person-add-outline'
                }
                size={17}
                color={
                  isFollowing
                    ? colors.text
                    : '#080B09'
                }
              />

              <Text
                style={[
                  styles.followButtonText,
                  isFollowing &&
                    styles.followingButtonText,
                ]}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.nameRow}>
          <Text style={styles.name}>
            {seller.name}
          </Text>

          {seller.verification.includes('identity') && (
            <View style={styles.identityBadge}>
              <Ionicons
                name="checkmark"
                size={13}
                color="#080B09"
              />
            </View>
          )}
        </View>

        <Text style={styles.username}>
          {seller.username}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={15}
            color={colors.primary}
          />

          <Text style={styles.locationText}>
            {seller.suburb}, {seller.state}
          </Text>

          <View style={styles.locationDot} />

          <Text style={styles.memberText}>
            Member since {seller.memberSince}
          </Text>
        </View>

        <Text style={styles.bio}>
          {seller.bio}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {seller.followers.toLocaleString('en-AU')}
            </Text>

            <Text style={styles.statLabel}>
              Followers
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {seller.following.toLocaleString('en-AU')}
            </Text>

            <Text style={styles.statLabel}>
              Following
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

          <View style={styles.statDivider} />

          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {seller.rating.toFixed(1)}
            </Text>

            <Text style={styles.statLabel}>
              Rating
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#080B09',
  },

  cover: {
    height: 176,
    overflow: 'hidden',
    backgroundColor: '#101711',
    justifyContent: 'center',
    alignItems: 'center',
  },

  coverGlowLarge: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    top: -112,
    right: -56,
    backgroundColor: 'rgba(158, 246, 90, 0.11)',
  },

  coverGlowSmall: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    bottom: -76,
    left: 20,
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
  },

  brandMark: {
    width: 72,
    height: 72,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.20)',
    backgroundColor: 'rgba(158, 246, 90, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  avatarRow: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  avatarOuter: {
    width: 104,
    height: 104,
    marginTop: -52,
    padding: 4,
    borderRadius: 34,
    backgroundColor: '#080B09',
  },

  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },

  avatarFallback: {
    flex: 1,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.24)',
    backgroundColor: '#182019',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarInitials: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.8,
  },

  actionRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  messageButton: {
    width: 46,
    height: 46,
    marginRight: 9,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  followButton: {
    height: 46,
    minWidth: 112,
    paddingHorizontal: 16,
    borderRadius: 15,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  followingButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.13)',
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
  },

  followButtonText: {
    marginLeft: 7,
    color: '#080B09',
    fontSize: 13,
    fontWeight: '900',
  },

  followingButtonText: {
    color: colors.text,
  },

  nameRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  name: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  identityBadge: {
    width: 21,
    height: 21,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  username: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },

  locationRow: {
    marginTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  locationText: {
    marginLeft: 5,
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },

  locationDot: {
    width: 3,
    height: 3,
    marginHorizontal: 9,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
  },

  memberText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },

  bio: {
    marginTop: 16,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },

  statsRow: {
    marginTop: 22,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  stat: {
    flex: 1,
    alignItems: 'center',
  },

  statValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },

  statLabel: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },

  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});