import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import DGButton from '../DGButton';

import {
  alpha,
  motion,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

import {
  getDynamicLightingTheme,
} from '../../theme/dynamicLighting';

import {
  selectionHaptic,
} from '../../utils/haptics';

type ProfileBadge = {
  id: string;
  label: string;

  icon?: React.ComponentProps<
    typeof Ionicons
  >['name'];
};

type DGProfileIdentityCardProps = {
  name: string;

  username?: string;
  profession?: string;
  location?: string;

  profileImage?: ImageSourcePropType;
  coverImage?: ImageSourcePropType;

  initials?: string;

  bio?: string;

  gainScore: number;
  trustLabel?: string;

  rating?: number;
  reviewCount?: number;

  badges?: ProfileBadge[];

  isFollowing?: boolean;
  isOwnProfile?: boolean;

  onFollowPress?: () => void;
  onMessagePress?: () => void;
  onEditProfilePress?: () => void;

  onLocationPress?: () => void;
  onGainScorePress?: () => void;

  onBadgePress?: (
    badge: ProfileBadge,
  ) => void;

  style?: StyleProp<ViewStyle>;
};

export default function DGProfileIdentityCard({
  name,

  username,
  profession,
  location,

  profileImage,
  coverImage,

  initials,

  bio,

  gainScore,
  trustLabel = 'Trusted Member',

  rating,
  reviewCount,

  badges = [],

  isFollowing = false,
  isOwnProfile = false,

  onFollowPress,
  onMessagePress,
  onEditProfilePress,

  onLocationPress,
  onGainScorePress,
  onBadgePress,

  style,
}: DGProfileIdentityCardProps) {
  const lightingTheme =
    getDynamicLightingTheme();

  const displayedInitials =
    initials ?? getInitials(name);

  async function handleGainScorePress() {
    if (!onGainScorePress) {
      return;
    }

    await selectionHaptic();

    onGainScorePress();
  }

  async function handleLocationPress() {
    if (!onLocationPress) {
      return;
    }

    await selectionHaptic();

    onLocationPress();
  }

  async function handleBadgePress(
    badge: ProfileBadge,
  ) {
    if (!onBadgePress) {
      return;
    }

    await selectionHaptic();

    onBadgePress(badge);
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor:
            lightingTheme.elevatedBackground,

          borderColor:
            lightingTheme.subtleBorder,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.cover,
          {
            backgroundColor:
              lightingTheme.ambientSurface,
          },
        ]}
      >
        {coverImage ? (
          <Image
            source={coverImage}
            resizeMode="cover"
            style={styles.coverImage}
          />
        ) : (
          <>
            <View
              pointerEvents="none"
              style={[
                styles.fallbackGlow,
                {
                  backgroundColor:
                    lightingTheme.topGlow,
                },
              ]}
            />

            <View
              pointerEvents="none"
              style={styles.arrowPattern}
            >
              <Ionicons
                name="arrow-up"
                size={132}
                color="rgba(255, 255, 255, 0.014)"
              />
            </View>
          </>
        )}

        <View
          pointerEvents="none"
          style={styles.coverDarkOverlay}
        />

        <View
          pointerEvents="none"
          style={styles.coverBottomFade}
        />

        <View style={styles.coverLabel}>
          <View style={styles.coverDot} />

          <Text style={styles.coverLabelText}>
            GAIN PROFILE
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarRow}>
          <View
            style={[
              styles.avatarOuter,
              {
                borderColor:
                  lightingTheme.elevatedBackground,
              },
            ]}
          >
            <View style={styles.avatar}>
              {profileImage ? (
                <Image
                  source={profileImage}
                  resizeMode="cover"
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarInitials}>
                  {displayedInitials}
                </Text>
              )}
            </View>

            <View
              accessibilityLabel="Identity verified"
              style={styles.verifiedBadge}
            >
              <Ionicons
                name="shield-checkmark"
                size={14}
                color="#071004"
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Gain Score ${gainScore}. ${trustLabel}`}
            accessibilityHint="Opens Gain Score details"
            disabled={!onGainScorePress}
            onPress={handleGainScorePress}
            style={({ pressed }) => [
              styles.gainScoreCard,

              pressed &&
                onGainScorePress &&
                styles.gainScorePressed,
            ]}
          >
            <View
              pointerEvents="none"
              style={styles.gainScoreGlow}
            />

            <Text style={styles.gainScoreValue}>
              {gainScore}
            </Text>

            <View style={styles.gainScoreCopy}>
              <Text style={styles.gainScoreLabel}>
                Gain Score
              </Text>

              <Text
                numberOfLines={1}
                style={styles.trustLabel}
              >
                {trustLabel}
              </Text>
            </View>

            {onGainScorePress ? (
              <Ionicons
                name="chevron-forward"
                size={16}
                color={textColor.muted}
              />
            ) : null}
          </Pressable>
        </View>

        <View style={styles.identity}>
          <Text
            numberOfLines={1}
            style={styles.name}
          >
            {name}
          </Text>

          {username ? (
            <Text
              numberOfLines={1}
              style={styles.username}
            >
              @{username}
            </Text>
          ) : null}

          {profession ? (
            <Text
              numberOfLines={2}
              style={styles.profession}
            >
              {profession}
            </Text>
          ) : null}

          <View style={styles.metadataRow}>
            {location ? (
              <Pressable
                accessibilityRole={
                  onLocationPress
                    ? 'button'
                    : undefined
                }
                accessibilityLabel={
                  onLocationPress
                    ? `Open location ${location}`
                    : location
                }
                disabled={!onLocationPress}
                onPress={handleLocationPress}
                style={({ pressed }) => [
                  styles.metadataItem,

                  pressed &&
                    onLocationPress &&
                    styles.metadataPressed,
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={textColor.muted}
                />

                <Text
                  numberOfLines={1}
                  style={styles.metadataText}
                >
                  {location}
                </Text>
              </Pressable>
            ) : null}

            {typeof rating === 'number' ? (
              <View style={styles.metadataItem}>
                <Ionicons
                  name="star"
                  size={13}
                  color="#F2C94C"
                />

                <Text style={styles.ratingText}>
                  {rating.toFixed(1)}
                </Text>

                {typeof reviewCount ===
                'number' ? (
                  <Text style={styles.reviewCount}>
                    ({reviewCount})
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        {badges.length > 0 ? (
          <View style={styles.badges}>
            {badges
              .slice(0, 3)
              .map((badge) => (
                <Pressable
                  key={badge.id}
                  accessibilityRole="button"
                  accessibilityLabel={
                    badge.label
                  }
                  disabled={!onBadgePress}
                  onPress={() => {
                    void handleBadgePress(
                      badge,
                    );
                  }}
                  style={({ pressed }) => [
                    styles.badge,

                    pressed &&
                      onBadgePress &&
                      styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={
                      badge.icon ??
                      'shield-checkmark-outline'
                    }
                    size={13}
                    color={
                      textColor.secondary
                    }
                  />

                  <Text
                    numberOfLines={1}
                    style={styles.badgeText}
                  >
                    {badge.label}
                  </Text>
                </Pressable>
              ))}
          </View>
        ) : null}

        {bio ? (
          <Text
            numberOfLines={3}
            style={styles.bio}
          >
            {bio}
          </Text>
        ) : null}

        <View style={styles.actions}>
          {isOwnProfile ? (
            <DGButton
              title="Edit Profile"
              icon="create-outline"
              variant="secondary"
              fullWidth
              onPress={
                onEditProfilePress
              }
            />
          ) : (
            <>
              <View style={styles.primaryAction}>
                <DGButton
                  title={
                    isFollowing
                      ? 'Following'
                      : 'Follow'
                  }
                  icon={
                    isFollowing
                      ? 'checkmark'
                      : 'person-add-outline'
                  }
                  variant={
                    isFollowing
                      ? 'secondary'
                      : 'primary'
                  }
                  fullWidth
                  onPress={
                    onFollowPress
                  }
                />
              </View>

              <View style={styles.secondaryAction}>
                <DGButton
                  title="Message"
                  icon="chatbubble-outline"
                  variant="secondary"
                  fullWidth
                  onPress={
                    onMessagePress
                  }
                />
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

function getInitials(
  name: string,
) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return 'DG';
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${
    words[words.length - 1][0]
  }`.toUpperCase();
}

const styles = StyleSheet.create({
  card: {
    width: '100%',

    borderRadius: radius.card,

    borderWidth: 1,

    overflow: 'hidden',

    shadowColor: '#000000',

    shadowOpacity: 0.16,

    shadowRadius: 15,

    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 5,
  },

  cover: {
    position: 'relative',

    height: 152,

    overflow: 'hidden',

    backgroundColor:
      surface.cardRaised,
  },

  coverImage: {
    position: 'absolute',

    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    width: '100%',
    height: '100%',
  },

  fallbackGlow: {
    position: 'absolute',

    top: -125,
    right: -85,

    width: 270,
    height: 270,

    borderRadius: 135,
  },

  arrowPattern: {
    position: 'absolute',

    right: -18,
    bottom: -47,

    transform: [
      {
        rotate: '18deg',
      },
    ],
  },

  coverDarkOverlay: {
    position: 'absolute',

    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    backgroundColor:
      'rgba(2, 5, 3, 0.34)',
  },

  coverBottomFade: {
    position: 'absolute',

    right: 0,
    bottom: 0,
    left: 0,

    height: 76,

    backgroundColor:
      'rgba(4, 8, 5, 0.48)',
  },

  coverLabel: {
    position: 'absolute',

    top: spacing.md,
    left: spacing.md,

    minHeight: 28,

    paddingHorizontal: spacing.sm,

    borderRadius: radius.pill,

    borderWidth: 1,

    borderColor:
      'rgba(255, 255, 255, 0.14)',

    backgroundColor:
      'rgba(4, 7, 5, 0.66)',

    flexDirection: 'row',

    alignItems: 'center',
  },

  coverDot: {
    width: 5,
    height: 5,

    marginRight: 6,

    borderRadius: 3,

    backgroundColor: '#9EF65A',
  },

  coverLabelText: {
    color:
      'rgba(255, 255, 255, 0.76)',

    fontSize: 9,
    lineHeight: 12,

    fontWeight: '900',

    letterSpacing: 1,
  },

  content: {
    paddingHorizontal: spacing.lg,

    paddingBottom:
      spacing.xl,
  },

  avatarRow: {
    minHeight: 82,

    marginTop: -51,

    flexDirection: 'row',

    alignItems: 'flex-end',

    justifyContent: 'space-between',
  },

  avatarOuter: {
    position: 'relative',

    width: 104,
    height: 104,

    borderRadius: 35,

    borderWidth: 5,

    backgroundColor:
      surface.cardRaised,

    shadowColor: '#000000',

    shadowOpacity: 0.28,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 5,
  },

  avatar: {
    flex: 1,

    borderRadius: 30,

    borderWidth: 1,

    borderColor: alpha.white08,

    backgroundColor:
      surface.cardSoft,

    alignItems: 'center',

    justifyContent: 'center',

    overflow: 'hidden',
  },

  avatarImage: {
    width: '100%',

    height: '100%',
  },

  avatarInitials: {
    color: textColor.primary,

    fontSize: 28,
    lineHeight: 34,

    fontWeight: '900',

    letterSpacing: -0.8,
  },

  verifiedBadge: {
    position: 'absolute',

    right: -4,
    bottom: -3,

    width: 30,
    height: 30,

    borderRadius: 11,

    borderWidth: 4,

    borderColor:
      surface.cardRaised,

    backgroundColor: '#9EF65A',

    alignItems: 'center',

    justifyContent: 'center',
  },

  gainScoreCard: {
    position: 'relative',

    minHeight: 58,

    maxWidth: 178,

    marginBottom: 4,

    paddingHorizontal: spacing.sm,

    borderRadius: radius.md,

    borderWidth: 1,

    borderColor:
      'rgba(255, 255, 255, 0.1)',

    backgroundColor:
      'rgba(10, 15, 11, 0.88)',

    flexDirection: 'row',

    alignItems: 'center',

    overflow: 'hidden',
  },

  gainScorePressed: {
    transform: [
      {
        scale: 0.97,
      },
    ],

    borderColor:
      'rgba(158, 246, 90, 0.22)',
  },

  gainScoreGlow: {
    position: 'absolute',

    top: -32,
    left: -22,

    width: 95,
    height: 95,

    borderRadius: 48,

    backgroundColor:
      'rgba(158, 246, 90, 0.035)',
  },

  gainScoreValue: {
    color: '#9EF65A',

    fontSize: 24,
    lineHeight: 28,

    fontWeight: '900',

    letterSpacing: -0.65,
  },

  gainScoreCopy: {
    flex: 1,

    minWidth: 0,

    marginLeft: spacing.xs,
  },

  gainScoreLabel: {
    color: textColor.primary,

    fontSize: 10,
    lineHeight: 14,

    fontWeight: '900',
  },

  trustLabel: {
    marginTop: 2,

    color: textColor.muted,

    fontSize: 9,
    lineHeight: 12,

    fontWeight: '600',
  },

  identity: {
    marginTop: spacing.lg,
  },

  name: {
    color: textColor.primary,

    fontSize: 26,
    lineHeight: 31,

    fontWeight: '900',

    letterSpacing: -0.75,
  },

  username: {
    marginTop: 5,

    color: textColor.muted,

    fontSize: 12,
    lineHeight: 17,

    fontWeight: '600',
  },

  profession: {
    marginTop: spacing.md,

    color: textColor.secondary,

    fontSize: 14,
    lineHeight: 20,

    fontWeight: '800',
  },

  metadataRow: {
    minHeight: 30,

    marginTop: spacing.md,

    flexDirection: 'row',

    alignItems: 'center',

    flexWrap: 'wrap',

    gap: spacing.sm,
  },

  metadataItem: {
    minHeight: 30,

    paddingHorizontal: spacing.sm,

    borderRadius: radius.pill,

    borderWidth: 1,

    borderColor: alpha.white08,

    backgroundColor:
      'rgba(255, 255, 255, 0.022)',

    flexDirection: 'row',

    alignItems: 'center',
  },

  metadataPressed: {
    opacity: 0.8,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  metadataText: {
    maxWidth: 170,

    marginLeft: 5,

    color: textColor.secondary,

    ...typography.bodySmall,

    fontWeight: '700',
  },

  ratingText: {
    marginLeft: 4,

    color: textColor.primary,

    fontSize: 11,

    fontWeight: '900',
  },

  reviewCount: {
    marginLeft: 3,

    color: textColor.muted,

    fontSize: 10,

    fontWeight: '600',
  },

  badges: {
    marginTop: spacing.lg,

    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: spacing.sm,
  },

  badge: {
    minHeight: 34,

    maxWidth: '100%',

    paddingHorizontal: spacing.sm,

    borderRadius: radius.pill,

    borderWidth: 1,

    borderColor: alpha.white08,

    backgroundColor:
      'rgba(255, 255, 255, 0.022)',

    flexDirection: 'row',

    alignItems: 'center',
  },

  badgeText: {
    flexShrink: 1,

    marginLeft: 6,

    color: textColor.secondary,

    fontSize: 10,
    lineHeight: 14,

    fontWeight: '800',
  },

  bio: {
    marginTop: spacing.lg,

    color: textColor.secondary,

    fontSize: 12,
    lineHeight: 20,

    fontWeight: '600',
  },

  actions: {
    width: '100%',

    marginTop: spacing.xl,

    flexDirection: 'row',
  },

  primaryAction: {
    flex: 1,

    marginRight: spacing.xs,
  },

  secondaryAction: {
    flex: 1,

    marginLeft: spacing.xs,
  },

  pressed: {
    opacity: 0.84,

    transform: [
      {
        scale:
          motion.pressedScale,
      },
    ],
  },
});