import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import type {
  ProfileActivityItem,
} from '../../types/ProfileActivity';

import {
  alpha,
  motion,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

import {
  selectionHaptic,
} from '../../utils/haptics';

type PostIconName =
  React.ComponentProps<
    typeof Ionicons
  >['name'];

type DGPostProps = {
  item: ProfileActivityItem;

  authorName: string;
  authorInitials?: string;

  authorImage?:
    React.ComponentProps<
      typeof Image
    >['source'];

  onAuthorPress?: () => void;
  onPress?: () => void;

  onLikePress?: (
    item: ProfileActivityItem,
  ) => void;

  onCommentPress?: (
    item: ProfileActivityItem,
  ) => void;

  onSharePress?: (
    item: ProfileActivityItem,
  ) => void;

  onActionPress?: (
    item: ProfileActivityItem,
  ) => void;

  style?: StyleProp<ViewStyle>;
};

export default function DGPost({
  item,

  authorName,
  authorInitials,
  authorImage,

  onAuthorPress,
  onPress,

  onLikePress,
  onCommentPress,
  onSharePress,
  onActionPress,

  style,
}: DGPostProps) {
  const displayedInitials =
    authorInitials ??
    getInitials(authorName);

  const activityPresentation =
    getActivityPresentation(
      item.type,
    );

  const primaryMedia =
    item.media?.[0];

  async function handlePostPress() {
    if (!onPress) {
      return;
    }

    await selectionHaptic();
    onPress();
  }

  async function handleAuthorPress() {
    if (!onAuthorPress) {
      return;
    }

    await selectionHaptic();
    onAuthorPress();
  }

  async function handleLikePress() {
    await selectionHaptic();
    onLikePress?.(item);
  }

  async function handleCommentPress() {
    await selectionHaptic();
    onCommentPress?.(item);
  }

  async function handleSharePress() {
    await selectionHaptic();
    onSharePress?.(item);
  }

  async function handleActionPress() {
    if (!onActionPress) {
      return;
    }

    await selectionHaptic();
    onActionPress(item);
  }

  return (
    <Pressable
      accessibilityRole={
        onPress ? 'button' : undefined
      }
      accessibilityLabel={
        onPress
          ? `Open ${item.title ?? 'post'}`
          : undefined
      }
      disabled={!onPress}
      onPress={handlePostPress}
      style={({ pressed }) => [
        styles.card,

        pressed &&
          onPress &&
          styles.cardPressed,

        style,
      ]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole={
            onAuthorPress
              ? 'button'
              : undefined
          }
          accessibilityLabel={
            onAuthorPress
              ? `Open ${authorName}'s profile`
              : undefined
          }
          disabled={!onAuthorPress}
          onPress={handleAuthorPress}
          style={({ pressed }) => [
            styles.authorArea,

            pressed &&
              onAuthorPress &&
              styles.pressed,
          ]}
        >
          <View style={styles.avatar}>
            {authorImage ? (
              <Image
                source={authorImage}
                resizeMode="cover"
                style={
                  styles.avatarImage
                }
              />
            ) : (
              <Text
                style={
                  styles.avatarInitials
                }
              >
                {displayedInitials}
              </Text>
            )}
          </View>

          <View style={styles.authorCopy}>
            <View style={styles.authorNameRow}>
              <Text
                numberOfLines={1}
                style={styles.authorName}
              >
                {authorName}
              </Text>

              <View
                accessibilityLabel="Identity verified"
                style={
                  styles.verifiedBadge
                }
              >
                <Ionicons
                  name="checkmark"
                  size={10}
                  color="#071004"
                />
              </View>
            </View>

            <View style={styles.metadataRow}>
              <Text
                numberOfLines={1}
                style={
                  styles.createdAt
                }
              >
                {item.createdAtLabel}
              </Text>

              <View
                style={
                  styles.metadataDot
                }
              />

              <Ionicons
                name="earth-outline"
                size={12}
                color={textColor.muted}
              />
            </View>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="More post options"
          hitSlop={8}
          style={({ pressed }) => [
            styles.moreButton,
            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={19}
            color={textColor.muted}
          />
        </Pressable>
      </View>

      <View style={styles.activityTypeRow}>
        <View
          style={[
            styles.activityTypeIcon,
            {
              borderColor:
                activityPresentation
                  .borderColor,

              backgroundColor:
                activityPresentation
                  .backgroundColor,
            },
          ]}
        >
          <Ionicons
            name={
              activityPresentation.icon
            }
            size={14}
            color={
              activityPresentation.color
            }
          />
        </View>

        <Text
          numberOfLines={1}
          style={styles.activityTypeText}
        >
          {
            activityPresentation.label
          }
        </Text>

        {item.badgeText ? (
          <View style={styles.badge}>
            <Text
              numberOfLines={1}
              style={styles.badgeText}
            >
              {item.badgeText}
            </Text>
          </View>
        ) : null}
      </View>

      {item.title ? (
        <Text style={styles.title}>
          {item.title}
        </Text>
      ) : null}

      {item.body ? (
        <Text style={styles.body}>
          {item.body}
        </Text>
      ) : null}

      {primaryMedia?.image ? (
        <View style={styles.mediaContainer}>
          <Image
            source={primaryMedia.image}
            resizeMode="cover"
            accessibilityLabel={
              primaryMedia.accessibilityLabel
            }
            style={styles.media}
          />

          {item.media &&
          item.media.length > 1 ? (
            <View
              style={
                styles.mediaCountBadge
              }
            >
              <Ionicons
                name="images-outline"
                size={13}
                color={textColor.primary}
              />

              <Text
                style={
                  styles.mediaCountText
                }
              >
                {item.media.length}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {item.price ||
      item.location ||
      item.rating ? (
        <View style={styles.detailCard}>
          {item.price ? (
            <Text style={styles.price}>
              {item.price}
            </Text>
          ) : null}

          {typeof item.rating ===
          'number' ? (
            <View
              style={
                styles.ratingRow
              }
            >
              <Ionicons
                name="star"
                size={14}
                color="#F2C94C"
              />

              <Text
                style={
                  styles.ratingText
                }
              >
                {item.rating.toFixed(1)}
              </Text>

              {item.reviewerName ? (
                <Text
                  style={
                    styles.reviewerText
                  }
                >
                  from {item.reviewerName}
                </Text>
              ) : null}
            </View>
          ) : null}

          {item.location ? (
            <View
              style={
                styles.locationRow
              }
            >
              <Ionicons
                name="location-outline"
                size={14}
                color={textColor.muted}
              />

              <Text
                numberOfLines={1}
                style={
                  styles.locationText
                }
              >
                {item.location}
              </Text>
            </View>
          ) : null}

          {item.action ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                item.action.label
              }
              disabled={!onActionPress}
              onPress={
                handleActionPress
              }
              style={({ pressed }) => [
                styles.actionButton,

                pressed &&
                  onActionPress &&
                  styles.actionButtonPressed,
              ]}
            >
              <Text
                style={
                  styles.actionButtonText
                }
              >
                {item.action.label}
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color="#071004"
              />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.engagementSummary}>
        <Text
          style={
            styles.engagementSummaryText
          }
        >
          {item.likeCount ?? 0} likes
        </Text>

        <View
          style={
            styles.engagementSummaryRight
          }
        >
          <Text
            style={
              styles.engagementSummaryText
            }
          >
            {item.commentCount ?? 0}{' '}
            comments
          </Text>

          <View
            style={styles.summaryDot}
          />

          <Text
            style={
              styles.engagementSummaryText
            }
          >
            {item.shareCount ?? 0}{' '}
            shares
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.actions}>
        <PostAction
          icon={
            item.likedByCurrentUser
              ? 'heart'
              : 'heart-outline'
          }
          label="Like"
          active={
            item.likedByCurrentUser
          }
          onPress={handleLikePress}
        />

        <PostAction
          icon="chatbubble-outline"
          label="Comment"
          onPress={
            handleCommentPress
          }
        />

        <PostAction
          icon="arrow-redo-outline"
          label="Share"
          onPress={
            handleSharePress
          }
          last
        />
      </View>
    </Pressable>
  );
}

type PostActionProps = {
  icon: PostIconName;
  label: string;
  active?: boolean;
  last?: boolean;
  onPress: () => void;
};

function PostAction({
  icon,
  label,
  active = false,
  last = false,
  onPress,
}: PostActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.postAction,

        last &&
          styles.lastPostAction,

        pressed &&
          styles.postActionPressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={
          active
            ? '#9EF65A'
            : textColor.secondary
        }
      />

      <Text
        style={[
          styles.postActionText,

          active &&
            styles.postActionTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function getActivityPresentation(
  type: ProfileActivityItem['type'],
): {
  label: string;
  icon: PostIconName;
  color: string;
  borderColor: string;
  backgroundColor: string;
} {
  switch (type) {
    case 'listing':
      return {
        label: 'Marketplace listing',
        icon: 'storefront-outline',
        color: '#9EF65A',
        borderColor:
          'rgba(158, 246, 90, 0.2)',
        backgroundColor:
          'rgba(158, 246, 90, 0.055)',
      };

    case 'sold':
      return {
        label: 'Item sold',
        icon: 'bag-check-outline',
        color: '#FFFFFF',
        borderColor:
          'rgba(255, 255, 255, 0.12)',
        backgroundColor:
          'rgba(255, 255, 255, 0.035)',
      };

    case 'auction-created':
      return {
        label: 'Auction created',
        icon: 'hammer-outline',
        color: '#F2C94C',
        borderColor:
          'rgba(242, 201, 76, 0.2)',
        backgroundColor:
          'rgba(242, 201, 76, 0.05)',
      };

    case 'auction-won':
      return {
        label: 'Auction won',
        icon: 'trophy-outline',
        color: '#F2C94C',
        borderColor:
          'rgba(242, 201, 76, 0.2)',
        backgroundColor:
          'rgba(242, 201, 76, 0.05)',
      };

    case 'job-completed':
      return {
        label: 'Job completed',
        icon: 'briefcase-outline',
        color: '#FFFFFF',
        borderColor:
          'rgba(255, 255, 255, 0.12)',
        backgroundColor:
          'rgba(255, 255, 255, 0.035)',
      };

    case 'review-received':
      return {
        label: 'Review received',
        icon: 'star-outline',
        color: '#F2C94C',
        borderColor:
          'rgba(242, 201, 76, 0.2)',
        backgroundColor:
          'rgba(242, 201, 76, 0.05)',
      };

    case 'milestone':
      return {
        label: 'Gain milestone',
        icon: 'trending-up',
        color: '#9EF65A',
        borderColor:
          'rgba(158, 246, 90, 0.2)',
        backgroundColor:
          'rgba(158, 246, 90, 0.055)',
      };

    case 'post':
    default:
      return {
        label: 'Public post',
        icon: 'newspaper-outline',
        color: textColor.secondary,
        borderColor: alpha.white08,
        backgroundColor:
          'rgba(255, 255, 255, 0.025)',
      };
  }
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

    marginBottom: spacing.md,

    padding: spacing.md,

    borderRadius: radius.card,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardSoft,

    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 11,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 2,
  },

  cardPressed: {
    transform: [
      {
        scale:
          motion.pressedScale,
      },
    ],

    opacity: 0.95,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  authorArea: {
    flex: 1,
    minWidth: 0,

    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 44,
    height: 44,

    borderRadius: 15,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardRaised,

    overflow: 'hidden',

    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  avatarInitials: {
    color: textColor.primary,

    fontSize: 14,
    lineHeight: 18,

    fontWeight: '900',
  },

  authorCopy: {
    flex: 1,
    minWidth: 0,

    marginLeft: spacing.sm,
  },

  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  authorName: {
    flexShrink: 1,

    color: textColor.primary,

    fontSize: 13,
    lineHeight: 18,

    fontWeight: '900',
  },

  verifiedBadge: {
    width: 17,
    height: 17,

    marginLeft: 6,

    borderRadius: 6,

    backgroundColor: '#9EF65A',

    alignItems: 'center',
    justifyContent: 'center',
  },

  metadataRow: {
    marginTop: 3,

    flexDirection: 'row',
    alignItems: 'center',
  },

  createdAt: {
    color: textColor.muted,

    fontSize: 9,
    lineHeight: 12,

    fontWeight: '600',
  },

  metadataDot: {
    width: 3,
    height: 3,

    marginHorizontal: 6,

    borderRadius: 2,

    backgroundColor:
      textColor.muted,
  },

  moreButton: {
    width: 36,
    height: 36,

    marginLeft: spacing.xs,

    borderRadius: radius.sm,

    alignItems: 'center',
    justifyContent: 'center',
  },

  activityTypeRow: {
    marginTop: spacing.md,

    flexDirection: 'row',
    alignItems: 'center',
  },

  activityTypeIcon: {
    width: 29,
    height: 29,

    borderRadius: radius.sm,

    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  activityTypeText: {
    flex: 1,
    minWidth: 0,

    marginLeft: spacing.xs,

    color: textColor.secondary,

    fontSize: 10,
    lineHeight: 14,

    fontWeight: '800',
  },

  badge: {
    minHeight: 23,

    paddingHorizontal: spacing.xs,

    borderRadius: radius.pill,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardRaised,

    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    color: textColor.secondary,

    fontSize: 8,
    lineHeight: 11,

    fontWeight: '900',

    letterSpacing: 0.35,
  },

  title: {
    marginTop: spacing.md,

    color: textColor.primary,

    fontSize: 18,
    lineHeight: 23,

    fontWeight: '900',

    letterSpacing: -0.35,
  },

  body: {
    marginTop: spacing.xs,

    color: textColor.secondary,

    fontSize: 12,
    lineHeight: 19,

    fontWeight: '600',
  },

  mediaContainer: {
    position: 'relative',

    width: '100%',
    aspectRatio: 1.35,

    marginTop: spacing.md,

    borderRadius: radius.lg,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardRaised,

    overflow: 'hidden',
  },

  media: {
    width: '100%',
    height: '100%',
  },

  mediaCountBadge: {
    position: 'absolute',

    top: spacing.sm,
    right: spacing.sm,

    minHeight: 29,

    paddingHorizontal: spacing.sm,

    borderRadius: radius.pill,

    backgroundColor:
      'rgba(5, 8, 6, 0.76)',

    flexDirection: 'row',
    alignItems: 'center',
  },

  mediaCountText: {
    marginLeft: 5,

    color: textColor.primary,

    fontSize: 10,
    fontWeight: '900',
  },

  detailCard: {
    marginTop: spacing.md,

    padding: spacing.sm,

    borderRadius: radius.lg,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardRaised,
  },

  price: {
    color: '#9EF65A',

    fontSize: 21,
    lineHeight: 26,

    fontWeight: '900',

    letterSpacing: -0.5,
  },

  ratingRow: {
    marginTop: spacing.xs,

    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingText: {
    marginLeft: 5,

    color: textColor.primary,

    fontSize: 11,
    fontWeight: '900',
  },

  reviewerText: {
    marginLeft: 5,

    color: textColor.muted,

    fontSize: 10,
    fontWeight: '600',
  },

  locationRow: {
    marginTop: spacing.xs,

    flexDirection: 'row',
    alignItems: 'center',
  },

  locationText: {
    flex: 1,

    marginLeft: 5,

    color: textColor.secondary,

    fontSize: 10,
    lineHeight: 14,

    fontWeight: '700',
  },

  actionButton: {
    minHeight: 44,

    marginTop: spacing.sm,

    paddingHorizontal: spacing.md,

    borderRadius: radius.md,

    backgroundColor: '#9EF65A',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionButtonPressed: {
    opacity: 0.84,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  actionButtonText: {
    marginRight: spacing.xs,

    color: '#071004',

    fontSize: 11,
    lineHeight: 15,

    fontWeight: '900',
  },

  engagementSummary: {
    marginTop: spacing.md,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  engagementSummaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  engagementSummaryText: {
    color: textColor.muted,

    fontSize: 9,
    lineHeight: 12,

    fontWeight: '600',
  },

  summaryDot: {
    width: 3,
    height: 3,

    marginHorizontal: 6,

    borderRadius: 2,

    backgroundColor:
      textColor.muted,
  },

  divider: {
    height: 1,

    marginTop: spacing.sm,

    backgroundColor:
      alpha.white08,
  },

  actions: {
    flexDirection: 'row',

    marginTop: spacing.xs,
  },

  postAction: {
    flex: 1,

    minHeight: 42,

    marginRight: spacing.xs,

    borderRadius: radius.md,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  lastPostAction: {
    marginRight: 0,
  },

  postActionPressed: {
    backgroundColor:
      'rgba(255, 255, 255, 0.04)',

    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  postActionText: {
    marginLeft: 6,

    color: textColor.secondary,

    fontSize: 10,
    lineHeight: 14,

    fontWeight: '800',
  },

  postActionTextActive: {
    color: '#9EF65A',
  },

  pressed: {
    opacity: 0.78,

    transform: [
      {
        scale:
          motion.pressedScale,
      },
    ],
  },
});