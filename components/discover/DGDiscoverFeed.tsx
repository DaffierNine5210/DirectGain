import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type {
  DiscoverFeedItem,
} from '../../types/DiscoverFeed';

import {
  alpha,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

type DGDiscoverFeedProps = {
  items: DiscoverFeedItem[];

  onItemPress?: (
    item: DiscoverFeedItem,
  ) => void;

  onAuthorPress?: (
    authorId: string,
  ) => void;

  onLikePress?: (
    item: DiscoverFeedItem,
  ) => void;

  onCommentPress?: (
    item: DiscoverFeedItem,
  ) => void;

  onSharePress?: (
    item: DiscoverFeedItem,
  ) => void;
};

export default function DGDiscoverFeed({
  items,

  onItemPress,
  onAuthorPress,

  onLikePress,
  onCommentPress,
  onSharePress,
}: DGDiscoverFeedProps) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="compass-outline"
          size={28}
          color={textColor.muted}
        />

        <Text style={styles.emptyTitle}>
          Nothing here yet
        </Text>

        <Text style={styles.emptyDescription}>
          New posts, listings, jobs and auctions
          will appear here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <DiscoverFeedCard
          key={item.id}
          item={item}
          onPress={onItemPress}
          onAuthorPress={onAuthorPress}
          onLikePress={onLikePress}
          onCommentPress={onCommentPress}
          onSharePress={onSharePress}
        />
      ))}
    </View>
  );
}

type DiscoverFeedCardProps = {
  item: DiscoverFeedItem;

  onPress?: (
    item: DiscoverFeedItem,
  ) => void;

  onAuthorPress?: (
    authorId: string,
  ) => void;

  onLikePress?: (
    item: DiscoverFeedItem,
  ) => void;

  onCommentPress?: (
    item: DiscoverFeedItem,
  ) => void;

  onSharePress?: (
    item: DiscoverFeedItem,
  ) => void;
};

function DiscoverFeedCard({
  item,

  onPress,
  onAuthorPress,

  onLikePress,
  onCommentPress,
  onSharePress,
}: DiscoverFeedCardProps) {
  const presentation =
    getFeedPresentation(item.type);

  return (
    <Pressable
      accessibilityRole={
        onPress ? 'button' : undefined
      }
      accessibilityLabel={
        onPress
          ? `Open ${item.title ?? item.type}`
          : undefined
      }
      disabled={!onPress}
      onPress={() => {
        onPress?.(item);
      }}
      style={({ pressed }) => [
        styles.card,

        pressed &&
          onPress &&
          styles.cardPressed,
      ]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole={
            onAuthorPress
              ? 'button'
              : undefined
          }
          disabled={!onAuthorPress}
          onPress={() => {
            onAuthorPress?.(
              item.author.id,
            );
          }}
          style={({ pressed }) => [
            styles.authorArea,

            pressed &&
              onAuthorPress &&
              styles.authorPressed,
          ]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(
                item.author.name,
              )}
            </Text>
          </View>

          <View style={styles.authorCopy}>
            <View
              style={
                styles.authorNameRow
              }
            >
              <Text
                numberOfLines={1}
                style={styles.authorName}
              >
                {item.author.name}
              </Text>

              {item.author.verified ? (
                <View
                  style={
                    styles.verifiedBadge
                  }
                >
                  <Ionicons
                    name="checkmark"
                    size={9}
                    color="#071004"
                  />
                </View>
              ) : null}
            </View>

            <View
              style={
                styles.authorMetadata
              }
            >
              <Text
                numberOfLines={1}
                style={
                  styles.authorUsername
                }
              >
                {item.author.username}
              </Text>

              <View
                style={styles.metadataDot}
              />

              <Text
                numberOfLines={1}
                style={styles.createdAt}
              >
                {formatCreatedAt(
                  item.createdAt,
                )}
              </Text>
            </View>
          </View>
        </Pressable>

        <View
          style={[
            styles.typeBadge,

            {
              borderColor:
                presentation.borderColor,

              backgroundColor:
                presentation.backgroundColor,
            },
          ]}
        >
          <Ionicons
            name={presentation.icon}
            size={13}
            color={presentation.color}
          />

          <Text
            style={[
              styles.typeBadgeText,

              {
                color:
                  presentation.color,
              },
            ]}
          >
            {presentation.label}
          </Text>
        </View>
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

      {item.price ||
      item.location ||
      item.badge ? (
        <View style={styles.detailCard}>
          <View
            style={
              styles.detailTopRow
            }
          >
            <View
              style={
                styles.detailCopy
              }
            >
              {item.price ? (
                <Text
                  style={
                    styles.price
                  }
                >
                  {item.price}
                </Text>
              ) : null}

              {item.location ? (
                <View
                  style={
                    styles.locationRow
                  }
                >
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={
                      textColor.muted
                    }
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
            </View>

            {item.badge ? (
              <View
                style={
                  styles.contentBadge
                }
              >
                <Text
                  style={
                    styles.contentBadgeText
                  }
                >
                  {item.badge}
                </Text>
              </View>
            ) : null}
          </View>

          <View
            style={
              styles.viewAction
            }
          >
            <Text
              style={
                styles.viewActionText
              }
            >
              {getActionLabel(
                item.type,
              )}
            </Text>

            <Ionicons
              name="arrow-forward"
              size={15}
              color="#071004"
            />
          </View>
        </View>
      ) : null}

      <View
        style={
          styles.engagementSummary
        }
      >
        <Text
          style={
            styles.engagementText
          }
        >
          {item.stats.likes} likes
        </Text>

        <View
          style={
            styles.engagementRight
          }
        >
          <Text
            style={
              styles.engagementText
            }
          >
            {item.stats.comments}{' '}
            comments
          </Text>

          <View
            style={styles.summaryDot}
          />

          <Text
            style={
              styles.engagementText
            }
          >
            {item.stats.shares}{' '}
            shares
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.actions}>
        <FeedAction
          icon="heart-outline"
          label="Like"
          onPress={() => {
            onLikePress?.(item);
          }}
        />

        <FeedAction
          icon="chatbubble-outline"
          label="Comment"
          onPress={() => {
            onCommentPress?.(item);
          }}
        />

        <FeedAction
          icon="arrow-redo-outline"
          label="Share"
          last
          onPress={() => {
            onSharePress?.(item);
          }}
        />
      </View>
    </Pressable>
  );
}

type FeedActionProps = {
  icon: React.ComponentProps<
    typeof Ionicons
  >['name'];

  label: string;
  last?: boolean;

  onPress: () => void;
};

function FeedAction({
  icon,
  label,
  last = false,
  onPress,
}: FeedActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.feedAction,

        last &&
          styles.lastFeedAction,

        pressed &&
          styles.feedActionPressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={17}
        color={textColor.secondary}
      />

      <Text
        style={
          styles.feedActionText
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

function getFeedPresentation(
  type: DiscoverFeedItem['type'],
) {
  switch (type) {
    case 'listing':
      return {
        label: 'Market',
        icon:
          'storefront-outline' as const,

        color: '#9EF65A',

        borderColor:
          'rgba(158, 246, 90, 0.2)',

        backgroundColor:
          'rgba(158, 246, 90, 0.055)',
      };

    case 'auction':
      return {
        label: 'Auction',
        icon:
          'hammer-outline' as const,

        color: '#F2C94C',

        borderColor:
          'rgba(242, 201, 76, 0.2)',

        backgroundColor:
          'rgba(242, 201, 76, 0.05)',
      };

    case 'job':
      return {
        label: 'Job',
        icon:
          'briefcase-outline' as const,

        color: '#FFFFFF',

        borderColor:
          'rgba(255, 255, 255, 0.11)',

        backgroundColor:
          'rgba(255, 255, 255, 0.035)',
      };

    case 'post':
    default:
      return {
        label: 'Post',
        icon:
          'newspaper-outline' as const,

        color: textColor.secondary,

        borderColor:
          alpha.white08,

        backgroundColor:
          'rgba(255, 255, 255, 0.025)',
      };
  }
}

function getActionLabel(
  type: DiscoverFeedItem['type'],
) {
  switch (type) {
    case 'listing':
      return 'View listing';

    case 'auction':
      return 'View auction';

    case 'job':
      return 'View job';

    case 'post':
    default:
      return 'View post';
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

function formatCreatedAt(
  value: string,
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  const difference =
    Date.now() - date.getTime();

  const minutes =
    Math.floor(
      difference / 60_000,
    );

  if (minutes < 1) {
    return 'Now';
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  if (hours < 24) {
    return `${hours}h`;
  }

  const days =
    Math.floor(
      hours / 24,
    );

  if (days < 7) {
    return `${days}d`;
  }

  return date.toLocaleDateString(
    'en-AU',
    {
      day: 'numeric',
      month: 'short',
    },
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  card: {
    width: '100%',

    marginBottom: spacing.md,
    padding: spacing.md,

    borderRadius: radius.card,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardRaised,

    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 2,
  },

  cardPressed: {
    opacity: 0.95,

    transform: [
      {
        scale: 0.992,
      },
    ],
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

  authorPressed: {
    opacity: 0.78,
  },

  avatar: {
    width: 44,
    height: 44,

    borderRadius: 15,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardSoft,

    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: textColor.primary,

    fontSize: 13,
    lineHeight: 17,

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
    width: 16,
    height: 16,

    marginLeft: 5,

    borderRadius: 6,

    backgroundColor: '#9EF65A',

    alignItems: 'center',
    justifyContent: 'center',
  },

  authorMetadata: {
    marginTop: 3,

    flexDirection: 'row',
    alignItems: 'center',
  },

  authorUsername: {
    maxWidth: 110,

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

  createdAt: {
    color: textColor.muted,

    fontSize: 9,
    lineHeight: 12,

    fontWeight: '600',
  },

  typeBadge: {
    minHeight: 29,

    marginLeft: spacing.sm,

    paddingHorizontal: spacing.sm,

    borderRadius: radius.pill,

    borderWidth: 1,

    flexDirection: 'row',
    alignItems: 'center',
  },

  typeBadgeText: {
    marginLeft: 5,

    fontSize: 8,
    lineHeight: 11,

    fontWeight: '900',

    letterSpacing: 0.35,

    textTransform: 'uppercase',
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

  detailCard: {
    marginTop: spacing.md,

    padding: spacing.sm,

    borderRadius: radius.lg,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardSoft,
  },

  detailTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent:
      'space-between',
  },

  detailCopy: {
    flex: 1,
    minWidth: 0,
  },

  price: {
    color: '#9EF65A',

    fontSize: 21,
    lineHeight: 26,

    fontWeight: '900',

    letterSpacing: -0.5,
  },

  locationRow: {
    marginTop: spacing.xs,

    flexDirection: 'row',
    alignItems: 'center',
  },

  locationText: {
    flex: 1,

    marginLeft: 5,

    color: textColor.muted,

    fontSize: 10,
    lineHeight: 14,

    fontWeight: '700',
  },

  contentBadge: {
    minHeight: 24,

    marginLeft: spacing.sm,

    paddingHorizontal: spacing.xs,

    borderRadius: radius.pill,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardRaised,

    alignItems: 'center',
    justifyContent: 'center',
  },

  contentBadgeText: {
    color: textColor.secondary,

    fontSize: 8,
    lineHeight: 11,

    fontWeight: '900',

    letterSpacing: 0.35,
  },

  viewAction: {
    minHeight: 42,

    marginTop: spacing.sm,

    paddingHorizontal: spacing.md,

    borderRadius: radius.md,

    backgroundColor: '#9EF65A',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  viewActionText: {
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

  engagementRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  engagementText: {
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
    marginTop: spacing.xs,

    flexDirection: 'row',
  },

  feedAction: {
    flex: 1,

    minHeight: 40,

    marginRight: spacing.xs,

    borderRadius: radius.md,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  lastFeedAction: {
    marginRight: 0,
  },

  feedActionPressed: {
    backgroundColor:
      'rgba(255, 255, 255, 0.04)',

    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  feedActionText: {
    marginLeft: 6,

    color: textColor.secondary,

    fontSize: 10,
    lineHeight: 14,

    fontWeight: '800',
  },

  emptyState: {
    width: '100%',

    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,

    borderRadius: radius.card,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardRaised,

    alignItems: 'center',
  },

  emptyTitle: {
    marginTop: spacing.sm,

    color: textColor.primary,

    fontSize: 15,
    lineHeight: 20,

    fontWeight: '900',
  },

  emptyDescription: {
    maxWidth: 270,

    marginTop: spacing.xs,

    color: textColor.muted,

    fontSize: 11,
    lineHeight: 17,

    fontWeight: '600',

    textAlign: 'center',
  },
});