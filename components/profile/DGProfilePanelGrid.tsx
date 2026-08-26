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
} from '../../theme/designSystem';

import {
  selectionHaptic,
} from '../../utils/haptics';

export type ProfilePanelGridKey =
  | 'reputation'
  | 'marketplace'
  | 'work'
  | 'reviews'
  | 'community'
  | 'about';

type ProfilePanelGridIcon =
  React.ComponentProps<
    typeof Ionicons
  >['name'];

export type ProfilePanelGridItem = {
  key: ProfilePanelGridKey;

  label: string;
  accessibilityLabel?: string;

  icon: ProfilePanelGridIcon;

  badgeText?: string;
};

type DGProfilePanelGridProps = {
  items: ProfilePanelGridItem[];

  selectedKey:
    ProfilePanelGridKey | null;

  onSelect: (
    key: ProfilePanelGridKey | null,
  ) => void;

  style?: StyleProp<ViewStyle>;
};

export default function DGProfilePanelGrid({
  items,
  selectedKey,
  onSelect,
  style,
}: DGProfilePanelGridProps) {
  const visibleItems =
    items.slice(0, 6);

  async function handleSelect(
    key: ProfilePanelGridKey,
  ) {
    await selectionHaptic();

    if (key === selectedKey) {
      onSelect(null);
      return;
    }

    onSelect(key);
  }

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.container,
        style,
      ]}
    >
      {visibleItems.map((item) => {
        const selected =
          item.key === selectedKey;

        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityLabel={
              item.accessibilityLabel ??
              `${item.label} profile section`
            }
            accessibilityHint={
              selected
                ? 'Closes this profile section'
                : 'Opens this profile section'
            }
            accessibilityState={{
              selected,
              expanded: selected,
            }}
            onPress={() => {
              void handleSelect(
                item.key,
              );
            }}
            style={({ pressed }) => [
              styles.item,

              selected &&
                styles.selectedItem,

              pressed &&
                styles.pressedItem,
            ]}
          >
            <View
              pointerEvents="none"
              style={[
                styles.iconContainer,

                selected &&
                  styles.selectedIconContainer,
              ]}
            >
              <Ionicons
                name={item.icon}
                size={21}
                color={
                  selected
                    ? '#9EF65A'
                    : textColor.secondary
                }
              />

              {selected ? (
                <View
                  style={
                    styles.activeDot
                  }
                />
              ) : null}
            </View>

            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
              style={[
                styles.label,

                selected &&
                  styles.selectedLabel,
              ]}
            >
              {item.label}
            </Text>

            {item.badgeText ? (
              <View
                style={[
                  styles.badge,

                  selected &&
                    styles.selectedBadge,
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.badgeText,

                    selected &&
                      styles.selectedBadgeText,
                  ]}
                >
                  {item.badgeText}
                </Text>
              </View>
            ) : (
              <View
                style={styles.badgeSpacer}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',

    padding: spacing.xs,

    borderRadius:
      radius.card,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardRaised,

    flexDirection: 'row',

    flexWrap: 'wrap',

    justifyContent:
      'space-between',

    rowGap: spacing.xs,

    shadowColor: '#000000',

    shadowOpacity: 0.1,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 2,
  },

  item: {
    width: '32%',

    minHeight: 104,

    paddingHorizontal:
      spacing.xs,

    paddingVertical:
      spacing.sm,

    borderRadius:
      radius.lg,

    borderWidth: 1,

    borderColor:
      'rgba(255, 255, 255, 0.055)',

    backgroundColor:
      'rgba(255, 255, 255, 0.018)',

    alignItems: 'center',

    justifyContent: 'center',
  },

  selectedItem: {
    borderColor:
      'rgba(158, 246, 90, 0.24)',

    backgroundColor:
      'rgba(158, 246, 90, 0.045)',

    shadowColor:
      '#9EF65A',

    shadowOpacity: 0.08,

    shadowRadius: 9,

    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 3,
  },

  pressedItem: {
    opacity: 0.82,

    transform: [
      {
        scale:
          motion.pressedScale,
      },
    ],
  },

  iconContainer: {
    position: 'relative',

    width: 40,
    height: 40,

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

  selectedIconContainer: {
    borderColor:
      'rgba(158, 246, 90, 0.22)',

    backgroundColor:
      'rgba(158, 246, 90, 0.06)',
  },

  activeDot: {
    position: 'absolute',

    right: 5,
    bottom: 5,

    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor:
      '#9EF65A',

    shadowColor:
      '#9EF65A',

    shadowOpacity: 0.4,

    shadowRadius: 4,

    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  label: {
    width: '100%',

    marginTop:
      spacing.xs,

    color:
      textColor.secondary,

    fontSize: 10,

    lineHeight: 14,

    fontWeight: '800',

    textAlign: 'center',
  },

  selectedLabel: {
    color:
      textColor.primary,

    fontWeight: '900',
  },

  badge: {
    minHeight: 20,

    maxWidth: '100%',

    marginTop: 5,

    paddingHorizontal: 7,

    borderRadius:
      radius.pill,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardSoft,

    alignItems: 'center',

    justifyContent: 'center',
  },

  selectedBadge: {
    borderColor:
      'rgba(158, 246, 90, 0.18)',

    backgroundColor:
      'rgba(158, 246, 90, 0.04)',
  },

  badgeText: {
    color:
      textColor.muted,

    fontSize: 8,

    lineHeight: 11,

    fontWeight: '900',

    letterSpacing: 0.15,
  },

  selectedBadgeText: {
    color:
      textColor.secondary,
  },

  badgeSpacer: {
    height: 21,

    marginTop: 5,
  },
});