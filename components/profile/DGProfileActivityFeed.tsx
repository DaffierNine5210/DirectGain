import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type {
  ProfileActivityItem,
  ProfileActivityType,
} from '../../types/ProfileActivity';

import {
  alpha,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

type ActivityFilter =
  | 'all'
  | 'post'
  | 'market'
  | 'work'
  | 'review';

type DGProfileActivityFeedProps = {
  activities: ProfileActivityItem[];

  authorName: string;
  authorInitials?: string;

  onActivityPress?: (
    activity: ProfileActivityItem,
  ) => void;
};

type FilterOption = {
  key: ActivityFilter;
  label: string;
};

const filters: FilterOption[] = [
  {
    key: 'all',
    label: 'All',
  },
  {
    key: 'post',
    label: 'Posts',
  },
  {
    key: 'market',
    label: 'Market',
  },
  {
    key: 'work',
    label: 'Work',
  },
  {
    key: 'review',
    label: 'Reviews',
  },
];

function getFilterForType(
  type: ProfileActivityType,
): ActivityFilter {
  switch (type) {
    case 'listing':
    case 'sold':
    case 'auction-created':
    case 'auction-won':
      return 'market';

    case 'job-completed':
      return 'work';

    case 'review-received':
      return 'review';

    case 'post':
    case 'milestone':
    default:
      return 'post';
  }
}

function getActivityAppearance(
  activity: ProfileActivityItem,
) {
  switch (activity.type) {
    case 'listing':
      return {
        eyebrow: 'MARKET',
        icon: 'storefront-outline' as const,
        accent: true,
      };

    case 'sold':
      return {
        eyebrow: 'SOLD',
        icon: 'checkmark-circle-outline' as const,
        accent: true,
      };

    case 'auction-created':
      return {
        eyebrow: 'AUCTION',
        icon: 'hammer-outline' as const,
        accent: true,
      };

    case 'auction-won':
      return {
        eyebrow: 'AUCTION WON',
        icon: 'trophy-outline' as const,
        accent: true,
      };

    case 'job-completed':
      return {
        eyebrow: 'WORK',
        icon: 'briefcase-outline' as const,
        accent: false,
      };

    case 'review-received':
      return {
        eyebrow: 'REVIEW',
        icon: 'star-outline' as const,
        accent: false,
      };

    case 'milestone':
      return {
        eyebrow: 'MILESTONE',
        icon: 'trending-up-outline' as const,
        accent: true,
      };

    case 'post':
    default:
      return {
        eyebrow: 'POST',
        icon: 'document-text-outline' as const,
        accent: false,
      };
  }
}

function ActivityTile({
  activity,
  onPress,
}: {
  activity: ProfileActivityItem;
  onPress?: () => void;
}) {
  const appearance =
    getActivityAppearance(activity);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        activity.title ??
        `${appearance.eyebrow} activity`
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        pressed && styles.tilePressed,
      ]}
    >
      <View style={styles.tileTopRow}>
        <View
          style={[
            styles.tileIcon,
            appearance.accent &&
              styles.tileIconAccent,
          ]}
        >
          <Ionicons
            name={appearance.icon}
            size={17}
            color={
              appearance.accent
                ? '#95F24C'
                : textColor.secondary
            }
          />
        </View>

        <Text
          numberOfLines={1}
          style={[
            styles.tileEyebrow,
            appearance.accent &&
              styles.tileEyebrowAccent,
          ]}
        >
          {appearance.eyebrow}
        </Text>
      </View>

      <Text
        numberOfLines={2}
        style={styles.tileTitle}
      >
        {activity.title ?? 'Recent activity'}
      </Text>

      {activity.price ? (
        <Text
          numberOfLines={1}
          style={styles.tilePrice}
        >
          {activity.price}
        </Text>
      ) : null}

      {activity.type ===
        'review-received' &&
      activity.rating ? (
        <View style={styles.ratingRow}>
          <Ionicons
            name="star"
            size={15}
            color="#95F24C"
          />

          <Text style={styles.ratingValue}>
            {activity.rating.toFixed(1)}
          </Text>

          {activity.reviewerName ? (
            <Text
              numberOfLines={1}
              style={styles.reviewerName}
            >
              from {activity.reviewerName}
            </Text>
          ) : null}
        </View>
      ) : null}

      {activity.type === 'post' ? (
        <Text
          numberOfLines={2}
          style={styles.tileBody}
        >
          {activity.body}
        </Text>
      ) : null}

      <View style={styles.tileFooter}>
        <Text
          numberOfLines={1}
          style={styles.tileDate}
        >
          {activity.createdAtLabel}
        </Text>

        {activity.type === 'post' ? (
          <View style={styles.engagementRow}>
            {typeof activity.likeCount ===
            'number' ? (
              <>
                <Ionicons
                  name="heart-outline"
                  size={12}
                  color={textColor.muted}
                />

                <Text style={styles.engagementText}>
                  {activity.likeCount}
                </Text>
              </>
            ) : null}

            {typeof activity.commentCount ===
            'number' ? (
              <>
                <Ionicons
                  name="chatbubble-outline"
                  size={11}
                  color={textColor.muted}
                  style={
                    styles.engagementSecondIcon
                  }
                />

                <Text style={styles.engagementText}>
                  {activity.commentCount}
                </Text>
              </>
            ) : null}
          </View>
        ) : (
          <Ionicons
            name="chevron-forward"
            size={14}
            color={textColor.muted}
          />
        )}
      </View>
    </Pressable>
  );
}

export default function DGProfileActivityFeed({
  activities,
  onActivityPress,
}: DGProfileActivityFeedProps) {
  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState<ActivityFilter>('all');

  const filteredActivities =
    useMemo(() => {
      if (selectedFilter === 'all') {
        return activities;
      }

      return activities.filter(
        activity =>
          getFilterForType(
            activity.type,
          ) === selectedFilter,
      );
    }, [activities, selectedFilter]);

  if (activities.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="grid-outline"
            size={22}
            color={textColor.muted}
          />
        </View>

        <Text style={styles.emptyTitle}>
          No public activity yet
        </Text>

        <Text style={styles.emptyDescription}>
          Public posts, listings, reviews and
          milestones will appear here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {filters.map(filter => {
          const isSelected =
            selectedFilter === filter.key;

          return (
            <Pressable
              key={filter.key}
              accessibilityRole="button"
              accessibilityState={{
                selected: isSelected,
              }}
              onPress={() => {
                setSelectedFilter(
                  filter.key,
                );
              }}
              style={({ pressed }) => [
                styles.filterChip,
                isSelected &&
                  styles.filterChipSelected,
                pressed &&
                  styles.filterChipPressed,
              ]}
            >
              <Text
                style={[
                  styles.filterLabel,
                  isSelected &&
                    styles.filterLabelSelected,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.grid}>
        {filteredActivities.map(
          activity => (
            <ActivityTile
              key={activity.id}
              activity={activity}
              onPress={
                onActivityPress
                  ? () => {
                      onActivityPress(
                        activity,
                      );
                    }
                  : undefined
              }
            />
          ),
        )}
      </View>

      {filteredActivities.length === 0 ? (
        <View style={styles.filterEmptyState}>
          <Text style={styles.filterEmptyTitle}>
            Nothing here yet
          </Text>

          <Text
            style={styles.filterEmptyText}
          >
            This member has no public activity in
            this category yet.
          </Text>
        </View>
      ) : null}

      <View style={styles.helperRow}>
        <Ionicons
          name="information-circle-outline"
          size={14}
          color={textColor.muted}
        />

        <Text style={styles.helperText}>
          Tap an activity to view more details.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  filterRow: {
    width: '100%',
    marginBottom: spacing.md,

    flexDirection: 'row',
    flexWrap: 'wrap',

    gap: 7,
  },

  filterChip: {
    minHeight: 34,

    paddingHorizontal: 13,
    paddingVertical: 8,

    borderRadius: 999,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardSoft,

    alignItems: 'center',
    justifyContent: 'center',
  },

  filterChipSelected: {
    borderColor:
      'rgba(149, 242, 76, 0.28)',

    backgroundColor:
      'rgba(149, 242, 76, 0.11)',
  },

  filterChipPressed: {
    opacity: 0.72,
  },

  filterLabel: {
    color: textColor.muted,

    fontSize: 10,
    lineHeight: 13,

    fontWeight: '800',
  },

  filterLabelSelected: {
    color: '#95F24C',
  },

  grid: {
    width: '100%',

    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'space-between',

    rowGap: 10,
  },

  tile: {
    width: '48.5%',
    minHeight: 168,

    padding: 14,

    borderRadius: radius.lg,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardSoft,

    justifyContent: 'space-between',
  },

  tilePressed: {
    opacity: 0.72,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  tileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  tileIcon: {
    width: 31,
    height: 31,

    marginRight: 8,

    borderRadius: 10,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      'rgba(255, 255, 255, 0.025)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  tileIconAccent: {
    borderColor:
      'rgba(149, 242, 76, 0.20)',

    backgroundColor:
      'rgba(149, 242, 76, 0.07)',
  },

  tileEyebrow: {
    flex: 1,

    color: textColor.muted,

    fontSize: 8,
    lineHeight: 11,

    fontWeight: '900',

    letterSpacing: 0.9,
  },

  tileEyebrowAccent: {
    color: '#95F24C',
  },

  tileTitle: {
    marginTop: 13,

    color: textColor.primary,

    fontSize: 14,
    lineHeight: 18,

    fontWeight: '900',

    letterSpacing: -0.2,
  },

  tilePrice: {
    marginTop: 9,

    color: '#95F24C',

    fontSize: 17,
    lineHeight: 21,

    fontWeight: '900',
  },

  tileBody: {
    marginTop: 8,

    color: textColor.muted,

    fontSize: 10,
    lineHeight: 15,

    fontWeight: '600',
  },

  ratingRow: {
    marginTop: 10,

    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingValue: {
    marginLeft: 5,

    color: textColor.primary,

    fontSize: 12,

    fontWeight: '900',
  },

  reviewerName: {
    flex: 1,

    marginLeft: 5,

    color: textColor.muted,

    fontSize: 9,

    fontWeight: '700',
  },

  tileFooter: {
    minHeight: 22,

    marginTop: 14,

    paddingTop: 10,

    borderTopWidth: 1,
    borderTopColor: alpha.white08,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  tileDate: {
    flex: 1,

    color: textColor.muted,

    fontSize: 9,
    lineHeight: 12,

    fontWeight: '700',
  },

  engagementRow: {
    marginLeft: 6,

    flexDirection: 'row',
    alignItems: 'center',
  },

  engagementSecondIcon: {
    marginLeft: 7,
  },

  engagementText: {
    marginLeft: 3,

    color: textColor.muted,

    fontSize: 8,

    fontWeight: '800',
  },

  filterEmptyState: {
    marginTop: 2,

    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,

    borderRadius: radius.lg,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardSoft,

    alignItems: 'center',
  },

  filterEmptyTitle: {
    color: textColor.primary,

    fontSize: 14,
    lineHeight: 19,

    fontWeight: '900',
  },

  filterEmptyText: {
    maxWidth: 250,

    marginTop: 5,

    color: textColor.muted,

    fontSize: 10,
    lineHeight: 16,

    fontWeight: '600',

    textAlign: 'center',
  },

  helperRow: {
    marginTop: 14,

    paddingTop: 12,

    borderTopWidth: 1,
    borderTopColor: alpha.white08,

    flexDirection: 'row',
    alignItems: 'center',
  },

  helperText: {
    flex: 1,

    marginLeft: 6,

    color: textColor.muted,

    fontSize: 9,
    lineHeight: 13,

    fontWeight: '600',
  },

  emptyState: {
    width: '100%',

    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,

    borderRadius: radius.lg,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardSoft,

    alignItems: 'center',
  },

  emptyIcon: {
    width: 46,
    height: 46,

    borderRadius: 15,

    backgroundColor:
      'rgba(255, 255, 255, 0.035)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 12,

    color: textColor.primary,

    fontSize: 15,
    lineHeight: 20,

    fontWeight: '900',

    textAlign: 'center',
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