import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { colors } from '../theme/colors';

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
                size={23}
                color={colors.text}
              />
            </Pressable>
          ) : showBrand ? (
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>DG</Text>
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
            <HeaderActionButton action={secondaryAction} />
          ) : null}

          {primaryAction ? (
            <HeaderActionButton action={primaryAction} />
          ) : null}
        </View>
      </View>

      {location ? (
        <Pressable
          accessibilityRole={
            onLocationPress ? 'button' : undefined
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
            pressed && onLocationPress && styles.locationPressed,
          ]}
        >
          <View style={styles.locationIcon}>
            <Ionicons
              name="location"
              size={15}
              color={colors.primary}
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
              color={colors.textMuted}
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
    action.badgeCount && action.badgeCount > 99
      ? '99+'
      : action.badgeCount;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.accessibilityLabel}
      hitSlop={8}
      onPress={action.onPress}
      style={({ pressed }) => [
        styles.iconButton,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={action.icon}
        size={21}
        color={colors.text}
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
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

  brandMark: {
    width: 44,
    height: 44,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: colors.primary,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 5,
  },

  brandMarkText: {
    color: '#071004',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.4,
  },

  eyebrow: {
    marginBottom: 3,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.7,
  },

  brandTitle: {
    fontSize: 24,
  },

  subtitle: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },

  actions: {
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  iconButton: {
    width: 43,
    height: 43,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.94,
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
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.cardRaised,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    color: '#071004',
    fontSize: 9,
    fontWeight: '900',
  },

  locationRow: {
    alignSelf: 'flex-start',
    minHeight: 34,
    marginTop: 14,
    paddingHorizontal: 10,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationPressed: {
    opacity: 0.8,
  },

  locationIcon: {
    width: 22,
    height: 22,
    marginRight: 5,
    borderRadius: 11,
    backgroundColor: `${colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  locationText: {
    maxWidth: 210,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
});