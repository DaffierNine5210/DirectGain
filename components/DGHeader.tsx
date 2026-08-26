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
  radius,
  shadow,
  spacing,
  surface,
  textColor,
  typography,
} from '../theme/designSystem';

type DGHeaderIconName =
  React.ComponentProps<
    typeof Ionicons
  >['name'];

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
  const displayedTitle =
    showBrand
      ? 'Direct Gain'
      : title;

  const displayedSubtitle =
  showBrand
    ? subtitle ?? 'Locally Trusted.'
    : subtitle;

  return (
    <View
      style={[
        styles.container,
        style,
      ]}
    >
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
                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={iconSize.lg}
                color={
                  textColor.primary
                }
              />
            </Pressable>
          ) : showBrand ? (
            <View
              style={
                styles.brandLogoWrapper
              }
            >
              <Image
                source={require('../assets/direct-gain-logo.png')}
                resizeMode="contain"
                style={
                  styles.brandLogo
                }
              />
            </View>
          ) : null}

          <View
            style={[
              styles.titleArea,

              showBrand &&
                styles.brandTitleArea,

              showBackButton &&
                styles.backTitleArea,
            ]}
          >
            {eyebrow ? (
              <Text
                numberOfLines={1}
                style={
                  styles.eyebrow
                }
              >
                {eyebrow}
              </Text>
            ) : null}

            {displayedTitle ? (
              <Text
                numberOfLines={1}
                style={[
                  styles.title,

                  showBrand &&
                    styles.brandTitle,
                ]}
              >
                {displayedTitle}
              </Text>
            ) : null}

            {displayedSubtitle ? (
              <Text
                numberOfLines={1}
                style={
                  styles.subtitle
                }
              >
                {displayedSubtitle}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.actions}>
          {secondaryAction ? (
            <HeaderActionButton
              action={
                secondaryAction
              }
            />
          ) : null}

          {primaryAction ? (
            <HeaderActionButton
              action={
                primaryAction
              }
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
          disabled={
            !onLocationPress
          }
          onPress={
            onLocationPress
          }
          style={({ pressed }) => [
            styles.locationRow,

            pressed &&
              onLocationPress &&
              styles.locationPressed,
          ]}
        >
          <View
            style={
              styles.locationIcon
            }
          >
            <Ionicons
              name="location-outline"
              size={15}
              color={
                textColor.secondary
              }
            />
          </View>

          <Text
            numberOfLines={1}
            style={
              styles.locationText
            }
          >
            {location}
          </Text>

          {onLocationPress ? (
            <Ionicons
              name="chevron-down"
              size={15}
              color={
                textColor.muted
              }
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
      onPress={
        action.onPress
      }
      style={({ pressed }) => [
        styles.iconButton,

        pressed &&
          styles.pressed,
      ]}
    >
      <View
        pointerEvents="none"
        style={
          styles.actionGlow
        }
      />

      <Ionicons
        name={action.icon}
        size={21}
        color={
          textColor.primary
        }
      />

      {action.badgeCount &&
      action.badgeCount > 0 ? (
        <View
          style={styles.badge}
        >
          <Text
            style={
              styles.badgeText
            }
          >
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

    paddingHorizontal:
      spacing.lg,

    paddingTop:
      spacing.sm,

    paddingBottom:
      spacing.md,
  },

  topRow: {
    width: '100%',

    minHeight: 62,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',
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

  brandTitleArea: {
    marginLeft: spacing.sm,
  },

  backTitleArea: {
    marginLeft: spacing.sm,
  },

  brandLogoWrapper: {
    width: 58,
    height: 58,

    flexShrink: 0,

    alignItems: 'center',

    justifyContent:
      'center',
  },

  brandLogo: {
    width: 58,
    height: 58,
  },

  eyebrow: {
    marginBottom: 3,

    color:
      textColor.muted,

    fontSize: 11,

    fontWeight: '900',

    letterSpacing: 1,

    textTransform:
      'uppercase',
  },

  title: {
    color:
      textColor.primary,

    fontSize: 25,

    lineHeight: 30,

    fontWeight: '900',

    letterSpacing: -0.7,
  },

  brandTitle: {
    fontSize: 27,

    lineHeight: 31,

    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 3,

    color:
      textColor.secondary,

    fontSize: 13,

    lineHeight: 18,

    fontWeight: '600',
  },

  actions: {
    flexShrink: 0,

    marginLeft:
      spacing.md,

    flexDirection: 'row',

    alignItems: 'center',

    gap: 9,
  },

  iconButton: {
    position: 'relative',

    width: 46,
    height: 46,

    borderRadius:
      radius.md,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardSoft,

    alignItems: 'center',

    justifyContent:
      'center',

    overflow: 'hidden',

    ...shadow.card,
  },

  actionGlow: {
    position: 'absolute',

    top: -32,
    right: -30,

    width: 70,
    height: 70,

    borderRadius: 35,

    backgroundColor:
      'rgba(255, 255, 255, 0.025)',
  },

  pressed: {
    opacity: 0.84,

    transform: [
      {
        scale:
          motion.iconPressedScale,
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

    borderRadius:
      radius.pill,

    borderWidth: 2,

    borderColor:
      surface.cardRaised,

    backgroundColor:
      '#9EF65A',

    alignItems: 'center',

    justifyContent:
      'center',
  },

  badgeText: {
    color:
      textColor.inverse,

    fontSize: 9,

    fontWeight: '900',
  },

  locationRow: {
    alignSelf:
      'flex-start',

    minHeight: 38,

    marginTop:
      spacing.md,

    paddingHorizontal:
      spacing.sm,

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

  locationPressed: {
    opacity: 0.82,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  locationIcon: {
    width: 24,
    height: 24,

    marginRight:
      spacing.xs,

    borderRadius:
      radius.pill,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      'rgba(255, 255, 255, 0.025)',

    alignItems: 'center',

    justifyContent:
      'center',
  },

  locationText: {
    maxWidth: 220,

    color:
      textColor.secondary,

    fontSize:
      typography
        .labelLarge
        .fontSize,

    lineHeight:
      typography
        .labelLarge
        .lineHeight,

    fontWeight: '800',
  },
});