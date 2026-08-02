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

import {
  alpha,
  iconSize,
  motion,
  palette,
  radius,
  shadow,
  spacing,
  surface,
  textColor,
  typography,
} from '../theme/designSystem';

type DGHeaderIconName =
  React.ComponentProps<typeof Ionicons>['name'];

type DGHeaderAction = {
  icon: DGHeaderIconName;
  accessibilityLabel: string;
  onPress: () => void;
  badgeCount?: number;
};

type DGHeaderProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  location?: string;

  showBrand?: boolean;
  showBackButton?: boolean;

  onBackPress?: () => void;
  onLocationPress?: () => void;

  primaryAction?: DGHeaderAction;
  secondaryAction?: DGHeaderAction;

  style?: StyleProp<ViewStyle>;
};

export default function DGHeader({
  title,
  subtitle,
  eyebrow,
  location,

  showBrand = false,
  showBackButton = false,

  onBackPress,
  onLocationPress,

  primaryAction,
  secondaryAction,

  style,
}: DGHeaderProps) {
  const displayedTitle = showBrand
    ? 'Direct Gain'
    : title;

  const displayedSubtitle = showBrand
    ? subtitle ?? 'Grow Together'
    : subtitle;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        <View style={styles.leftSection}>
          {showBackButton ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={10}
              onPress={onBackPress}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={iconSize.lg}
                color={textColor.primary}
              />
            </Pressable>
          ) : showBrand ? (
            <View style={styles.brandMarkOuter}>
              <View style={styles.brandMark}>
                <View
                  pointerEvents="none"
                  style={styles.brandGlow}
                />

                <Image
                  source={require('../assets/direct-gain-logo.png')}
                  resizeMode="contain"
                  style={styles.brandLogo}
                />
              </View>
            </View>
          ) : null}

          <View style={styles.titleArea}>
            {eyebrow ? (
              <Text
                numberOfLines={1}
                style={styles.eyebrow}
              >
                {eyebrow}
              </Text>
            ) : null}

            {displayedTitle ? (
              <Text
                numberOfLines={1}
                style={[
                  styles.title,
                  showBrand && styles.brandTitle,
                ]}
              >
                {displayedTitle}
              </Text>
            ) : null}

            {displayedSubtitle ? (
              <Text
                numberOfLines={1}
                style={styles.subtitle}
              >
                {displayedSubtitle}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.actions}>
          {secondaryAction ? (
            <HeaderActionButton
              action={secondaryAction}
            />
          ) : null}

          {primaryAction ? (
            <HeaderActionButton
              action={primaryAction}
            />
          ) : null}
        </View>
      </View>

      {location ? (
        <Pressable
          accessibilityRole={
            onLocationPress
              ? 'button'
              : undefined
          }
          accessibilityLabel={
            onLocationPress
              ? `Change location. Current location: ${location}`
              : undefined
          }
          disabled={!onLocationPress}
          onPress={onLocationPress}
          style={({ pressed }) => [
            styles.locationRow,
            pressed &&
              onLocationPress &&
              styles.locationPressed,
          ]}
        >
          <View style={styles.locationIcon}>
            <Ionicons
              name="location"
              size={15}
              color={palette.opportunityGreen}
            />
          </View>

          <Text
            numberOfLines={1}
            style={styles.locationText}
          >
            {location}
          </Text>

          {onLocationPress ? (
            <Ionicons
              name="chevron-down"
              size={15}
              color={textColor.muted}
            />
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
}

type HeaderActionButtonProps = {
  action: DGHeaderAction;
};

function HeaderActionButton({
  action,
}: HeaderActionButtonProps) {
  const displayedBadgeCount =
    action.badgeCount &&
    action.badgeCount > 99
      ? '99+'
      : action.badgeCount;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        action.accessibilityLabel
      }
      hitSlop={8}
      onPress={action.onPress}
      style={({ pressed }) => [
        styles.iconButton,
        pressed && styles.pressed,
      ]}
    >
      <View
        pointerEvents="none"
        style={styles.actionGlow}
      />

      <Ionicons
        name={action.icon}
        size={21}
        color={textColor.primary}
      />

      {action.badgeCount &&
      action.badgeCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {displayedBadgeCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },

  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  leftSection: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  titleArea: {
    flex: 1,
    minWidth: 0,
  },

  brandMarkOuter: {
    width: 58,
    height: 58,
    marginRight: spacing.sm,
    borderRadius: radius.lg,
    padding: 3,

    backgroundColor: alpha.green06,

    shadowColor: palette.opportunityGreen,
    shadowOpacity: 0.12,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 4,
  },

  brandMark: {
    position: 'relative',
    flex: 1,
    borderRadius: 17,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: palette.slate850,

    borderWidth: 1,
    borderColor: alpha.green20,
  },

  brandGlow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,

    backgroundColor: alpha.green08,
  },

  brandLogo: {
    width: 48,
    height: 48,

    /*
     * This tiny adjustment visually centres the
     * arrow-heavy logo inside the rounded square.
     */
    transform: [
      {
        translateX: -1,
      },
      {
        translateY: 1,
      },
    ],
  },

  eyebrow: {
    marginBottom: 3,
    color: textColor.accent,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  title: {
    color: textColor.primary,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.7,
  },

  brandTitle: {
    fontSize: 25,
    lineHeight: 30,
  },

  subtitle: {
    marginTop: 2,
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  actions: {
    marginLeft: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  iconButton: {
    position: 'relative',

    width: 46,
    height: 46,

    borderRadius: radius.md,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor: surface.cardSoft,

    alignItems: 'center',
    justifyContent: 'center',

    overflow: 'hidden',

    ...shadow.card,
  },

  actionGlow: {
    position: 'absolute',
    top: -30,
    right: -28,

    width: 70,
    height: 70,

    borderRadius: 35,

    backgroundColor: alpha.green04,
  },

  pressed: {
    opacity: 0.82,

    transform: [
      {
        scale: motion.iconPressedScale,
      },
    ],
  },

  badge: {
    position: 'absolute',
    top: -5,
    right: -5,

    minWidth: 19,
    height: 19,

    paddingHorizontal: 4,

    borderRadius: radius.pill,

    borderWidth: 2,
    borderColor: surface.cardRaised,

    backgroundColor:
      palette.opportunityGreen,

    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    color: textColor.inverse,
    fontSize: 9,
    fontWeight: '900',
  },

  locationRow: {
    alignSelf: 'flex-start',

    minHeight: 38,
    marginTop: spacing.md,

    paddingHorizontal: spacing.sm,

    borderRadius: radius.pill,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor: surface.cardSoft,

    flexDirection: 'row',
    alignItems: 'center',
  },

  locationPressed: {
    opacity: 0.8,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  locationIcon: {
    width: 24,
    height: 24,

    marginRight: spacing.xs,

    borderRadius: radius.pill,

    backgroundColor: alpha.green10,

    alignItems: 'center',
    justifyContent: 'center',
  },

  locationText: {
    maxWidth: 220,

    color: textColor.secondary,

    fontSize:
      typography.labelLarge.fontSize,

    lineHeight:
      typography.labelLarge.lineHeight,

    fontWeight: '800',
  },
});