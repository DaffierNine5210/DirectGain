import { Ionicons } from '@expo/vector-icons';
import {
  useRef,
} from 'react';
import {
  Animated,
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
  spacing,
  surface,
  textColor,
  typography,
} from '../theme/designSystem';

export type DGChipSize =
  | 'compact'
  | 'regular';

type DGChipIconName =
  React.ComponentProps<typeof Ionicons>['name'];

export type DGChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;

  icon?: DGChipIconName;

  size?: DGChipSize;

  onPress?: () => void;

  style?: StyleProp<ViewStyle>;

  testID?: string;

  accessibilityLabel?: string;
};

export default function DGChip({
  label,
  selected = false,
  disabled = false,

  icon,

  size = 'regular',

  onPress,

  style,

  testID,

  accessibilityLabel,
}: DGChipProps) {
  const scaleAnimation =
    useRef(
      new Animated.Value(1),
    ).current;

  function animateScale(
    value: number,
  ) {
    Animated.spring(
      scaleAnimation,
      {
        toValue: value,

        speed:
          value === 1
            ? 24
            : 34,

        bounciness:
          value === 1
            ? 5
            : 0,

        useNativeDriver: true,
      },
    ).start();
  }

  function handlePressIn() {
    if (disabled) {
      return;
    }

    animateScale(
      motion.iconPressedScale,
    );
  }

  function handlePressOut() {
    if (disabled) {
      return;
    }

    animateScale(1);
  }

  const textColour = selected
    ? textColor.inverse
    : textColor.secondary;

  const iconColour = selected
    ? textColor.inverse
    : palette.opportunityGreen;

  return (
    <Animated.View
      style={[
        {
          transform: [
            {
              scale:
                scaleAnimation,
            },
          ],
        },
        style,
      ]}
    >
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel ??
          label
        }
        accessibilityState={{
          selected,
          disabled,
        }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.chip,

          size === 'compact'
            ? styles.compactChip
            : styles.regularChip,

          selected
            ? styles.selectedChip
            : styles.defaultChip,

          disabled &&
            styles.disabledChip,

          pressed &&
            !disabled &&
            styles.pressedChip,
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            styles.internalGlow,

            selected &&
              styles.selectedGlow,
          ]}
        />

        {icon ? (
          <View
            style={[
              styles.iconContainer,

              size === 'compact'
                ? styles.compactIconContainer
                : styles.regularIconContainer,

              selected &&
                styles.selectedIconContainer,
            ]}
          >
            <Ionicons
              name={icon}
              size={
                size === 'compact'
                  ? iconSize.xs
                  : iconSize.sm
              }
              color={iconColour}
            />
          </View>
        ) : null}

        <Text
          numberOfLines={1}
          style={[
            styles.label,

            size === 'compact'
              ? styles.compactLabel
              : styles.regularLabel,

            {
              color: textColour,
            },
          ]}
        >
          {label}
        </Text>

        {selected ? (
          <Ionicons
            name="checkmark"
            size={
              size === 'compact'
                ? 14
                : 16
            }
            color={textColor.inverse}
            style={styles.checkIcon}
          />
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    position: 'relative',

    alignSelf: 'flex-start',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    overflow: 'hidden',

    borderWidth: 1,
  },

  compactChip: {
    minHeight: 34,

    paddingHorizontal:
      spacing.sm,

    borderRadius:
      radius.pill,
  },

  regularChip: {
    minHeight: 44,

    paddingHorizontal:
      spacing.md,

    borderRadius:
      radius.md,
  },

  defaultChip: {
    backgroundColor:
      surface.cardSoft,

    borderColor:
      alpha.white08,
  },

  selectedChip: {
    backgroundColor:
      palette.opportunityGreen,

    borderColor:
      'rgba(216, 255, 194, 0.72)',

    shadowColor:
      palette.opportunityGreen,

    shadowOpacity: 0.13,

    shadowRadius: 7,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 4,
  },

  disabledChip: {
    opacity: 0.42,
  },

  pressedChip: {
    opacity: 0.88,
  },

  internalGlow: {
    position: 'absolute',

    top: -34,
    right: -28,

    width: 84,
    height: 84,

    borderRadius: 42,

    backgroundColor:
      alpha.green04,
  },

  selectedGlow: {
    backgroundColor:
      'rgba(255, 255, 255, 0.14)',
  },

  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',

    borderRadius:
      radius.pill,

    backgroundColor:
      alpha.green08,
  },

  compactIconContainer: {
    width: 22,
    height: 22,

    marginRight:
      spacing.xs,
  },

  regularIconContainer: {
    width: 28,
    height: 28,

    marginRight:
      spacing.xs,
  },

  selectedIconContainer: {
    backgroundColor:
      'rgba(7, 16, 4, 0.10)',
  },

  label: {
    flexShrink: 1,

    fontWeight: '800',

    textAlign: 'center',
  },

  compactLabel: {
    fontSize:
      typography.labelMedium
        .fontSize,

    lineHeight:
      typography.labelMedium
        .lineHeight,
  },

  regularLabel: {
    fontSize:
      typography.labelLarge
        .fontSize,

    lineHeight:
      typography.labelLarge
        .lineHeight,
  },

  checkIcon: {
    marginLeft:
      spacing.xs,
  },
});