import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import {
  alpha,
  motion,
  radius,
  spacing,
  surface,
  textColor,
} from '../theme/designSystem';

import {
  selectionHaptic,
} from '../utils/haptics';

export type OpportunityType =
  | 'market'
  | 'job'
  | 'auction'
  | 'business';

type DGOpportunityCardProps = {
  title: string;
  subtitle: string;

  type: OpportunityType;

  location: string;

  badge?: string;

  gainScore?: number;

  verified?: boolean;

  onPress?: () => void;

  style?: StyleProp<ViewStyle>;
};

export default function DGOpportunityCard({
  title,
  subtitle,
  type,
  location,
  badge,
  gainScore,
  verified = false,
  onPress,
  style,
}: DGOpportunityCardProps) {
  async function handlePress() {
    await selectionHaptic();
    onPress?.();
  }

  const isLiveAuction =
    type === 'auction';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}. ${location}`}
      accessibilityHint="Opens this opportunity"
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,

        pressed &&
          styles.pressed,

        style,
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconContainer,

            isLiveAuction &&
              styles.liveIconContainer,
          ]}
        >
          <Ionicons
            name={getIcon(type)}
            size={21}
            color={
              isLiveAuction
                ? '#FF8B90'
                : textColor.secondary
            }
          />

          {verified ? (
            <View
              accessibilityLabel="Verified"
              style={styles.verifiedDot}
            />
          ) : null}
        </View>

        <View style={styles.titleArea}>
          <Text
            numberOfLines={2}
            style={styles.title}
          >
            {title}
          </Text>

          <Text
            numberOfLines={1}
            style={styles.subtitle}
          >
            {subtitle}
          </Text>
        </View>

        {badge ? (
          <View
            style={[
              styles.badge,

              isLiveAuction &&
                styles.liveBadge,
            ]}
          >
            {isLiveAuction ? (
              <View
                style={styles.liveDot}
              />
            ) : null}

            <Text
              numberOfLines={1}
              style={[
                styles.badgeText,

                isLiveAuction &&
                  styles.liveBadgeText,
              ]}
            >
              {badge}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.locationGroup}>
          <Ionicons
            name="location-outline"
            size={14}
            color={textColor.muted}
          />

          <Text
            numberOfLines={1}
            style={styles.locationText}
          >
            {location}
          </Text>
        </View>

        <View style={styles.trustGroup}>
          {verified ? (
            <View
              accessibilityLabel="Verified opportunity"
              style={styles.verifiedBadge}
            >
              <Ionicons
                name="shield-checkmark"
                size={13}
                color="#9EF65A"
              />
            </View>
          ) : null}

          {typeof gainScore === 'number' ? (
            <View
              accessibilityLabel={`Gain Score ${gainScore}`}
              style={styles.gainBadge}
            >
              <Text style={styles.gainLabel}>
                Gain
              </Text>

              <Text style={styles.gainScore}>
                {gainScore}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function getIcon(
  type: OpportunityType,
): React.ComponentProps<
  typeof Ionicons
>['name'] {
  switch (type) {
    case 'market':
      return 'storefront-outline';

    case 'job':
      return 'briefcase-outline';

    case 'auction':
      return 'hammer-outline';

    case 'business':
      return 'business-outline';
  }
}

const styles = StyleSheet.create({
  card: {
    width: '100%',

    padding: spacing.md,

    borderRadius: radius.lg,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardRaised,

    shadowColor: '#000000',

    shadowOpacity: 0.13,

    shadowRadius: 11,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 3,
  },

  pressed: {
    opacity: 0.9,

    transform: [
      {
        scale:
          motion.pressedScale,
      },
    ],
  },

  topRow: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  iconContainer: {
    position: 'relative',

    width: 46,
    height: 46,

    marginRight:
      spacing.sm,

    borderRadius:
      radius.md,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardSoft,

    alignItems: 'center',

    justifyContent: 'center',
  },

  liveIconContainer: {
    borderColor:
      'rgba(229, 72, 77, 0.22)',

    backgroundColor:
      'rgba(229, 72, 77, 0.07)',
  },

  verifiedDot: {
    position: 'absolute',

    right: 5,
    bottom: 5,

    width: 6,
    height: 6,

    borderRadius: 3,

    borderWidth: 1,

    borderColor:
      surface.cardRaised,

    backgroundColor:
      '#9EF65A',
  },

  titleArea: {
    flex: 1,

    minWidth: 0,

    paddingRight:
      spacing.xs,
  },

  title: {
    color:
      textColor.primary,

    fontSize: 15,

    lineHeight: 20,

    fontWeight: '900',

    letterSpacing: -0.2,
  },

  subtitle: {
    marginTop: 4,

    color:
      textColor.secondary,

    fontSize: 11,

    lineHeight: 16,

    fontWeight: '600',
  },

  badge: {
    minHeight: 26,

    maxWidth: 92,

    paddingHorizontal:
      spacing.xs,

    borderRadius:
      radius.pill,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardSoft,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',
  },

  badgeText: {
    color:
      textColor.secondary,

    fontSize: 9,

    lineHeight: 12,

    fontWeight: '900',

    letterSpacing: 0.15,
  },

  liveBadge: {
    borderColor:
      'rgba(229, 72, 77, 0.22)',

    backgroundColor:
      'rgba(229, 72, 77, 0.07)',
  },

  liveDot: {
    width: 6,
    height: 6,

    marginRight: 5,

    borderRadius: 3,

    backgroundColor:
      '#E5484D',
  },

  liveBadgeText: {
    color: '#FF8B90',
  },

  divider: {
    height: 1,

    marginVertical:
      spacing.sm,

    backgroundColor:
      alpha.white08,
  },

  infoRow: {
    minHeight: 28,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',
  },

  locationGroup: {
    flex: 1,

    minWidth: 0,

    marginRight:
      spacing.sm,

    flexDirection: 'row',

    alignItems: 'center',
  },

  locationText: {
    flex: 1,

    marginLeft: 5,

    color:
      textColor.muted,

    fontSize: 10,

    lineHeight: 14,

    fontWeight: '700',
  },

  trustGroup: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  verifiedBadge: {
    width: 28,
    height: 28,

    borderRadius:
      radius.sm,

    borderWidth: 1,

    borderColor:
      'rgba(158, 246, 90, 0.18)',

    backgroundColor:
      'rgba(158, 246, 90, 0.045)',

    alignItems: 'center',

    justifyContent: 'center',
  },

  gainBadge: {
    minHeight: 28,

    marginLeft: 6,

    paddingHorizontal:
      spacing.xs,

    borderRadius:
      radius.pill,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardSoft,

    flexDirection: 'row',

    alignItems: 'center',
  },

  gainLabel: {
    color:
      textColor.muted,

    fontSize: 9,

    fontWeight: '700',
  },

  gainScore: {
    marginLeft: 4,

    color:
      '#9EF65A',

    fontSize: 10,

    fontWeight: '900',
  },
});