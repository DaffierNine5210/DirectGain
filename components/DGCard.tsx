import type { ReactNode } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import {
  alpha,
  border,
  layout,
  motion,
  palette,
  radius,
  shadow,
  surface,
} from '../theme/designSystem';

export type DGCardVariant =
  | 'default'
  | 'raised'
  | 'outlined'
  | 'soft';

type DGCardProps = {
  children: ReactNode;
  variant?: DGCardVariant;
  pressable?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

export default function DGCard({
  children,
  variant = 'default',
  pressable = false,
  disabled = false,
  onPress,
  style,
  contentStyle,
  testID,
}: DGCardProps) {
  const isInteractive =
    pressable || Boolean(onPress);

  const outerStyles = [
    styles.outer,
    variant === 'raised' &&
      styles.raisedOuter,
    disabled && styles.disabled,
    style,
  ];

  const surfaceStyles = [
    styles.surface,
    variant === 'default' &&
      styles.defaultSurface,
    variant === 'raised' &&
      styles.raisedSurface,
    variant === 'outlined' &&
      styles.outlinedSurface,
    variant === 'soft' &&
      styles.softSurface,
  ];

  const cardContent = (
    <View style={surfaceStyles}>
      <View
        pointerEvents="none"
        style={styles.topHighlight}
      />

      <View
        pointerEvents="none"
        style={styles.internalGlow}
      />

      <View
        style={[
          styles.content,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );

  if (isInteractive) {
    return (
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityState={{
          disabled,
        }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          outerStyles,
          pressed &&
            !disabled &&
            styles.pressed,
        ]}
      >
        {cardContent}
      </Pressable>
    );
  }

  return (
    <View
      testID={testID}
      style={outerStyles}
    >
      {cardContent}
    </View>
  );
}

const styles = StyleSheet.create({
  /*
   * Shadow and motion live on this outer layer.
   * Keeping overflow visible prevents shadows
   * from being cut off by rounded corners.
   */
  outer: {
    width: '100%',
    borderRadius: radius.card,
  },

  raisedOuter: {
    ...shadow.raised,
  },

  disabled: {
    opacity: 0.5,
  },

  pressed: {
    opacity: 0.94,

    transform: [
      {
        scale: motion.pressedScale,
      },
      {
        translateY: motion.cardLift,
      },
    ],
  },

  /*
   * The inner layer owns the background,
   * border, rounded corners and clipping.
   */
  surface: {
    position: 'relative',
    width: '100%',
    borderRadius: radius.card,
    overflow: 'hidden',
  },

  defaultSurface: {
    backgroundColor: surface.cardRaised,
    ...border.subtle,
  },

  raisedSurface: {
    backgroundColor: palette.slate800,
    borderWidth: 1,
    borderColor: alpha.green10,
  },

  outlinedSurface: {
    backgroundColor: alpha.white03,
    borderWidth: 1,
    borderColor: alpha.green16,
  },

  softSurface: {
    backgroundColor: surface.cardSoft,
    borderWidth: 1,
    borderColor: alpha.white05,
  },

  content: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    padding: layout.cardPadding,
  },

  /*
   * A faint internal green light gives cards
   * depth without creating a strong outer glow.
   */
  internalGlow: {
    position: 'absolute',
    top: -110,
    right: -95,

    width: 220,
    height: 220,

    borderRadius: 110,

    backgroundColor: alpha.green04,
  },

  /*
   * This subtle top edge catches light and
   * makes the surface feel layered.
   */
  topHighlight: {
    position: 'absolute',
    top: 0,
    right: 24,
    left: 24,

    height: 1,

    backgroundColor:
      'rgba(255, 255, 255, 0.08)',
  },
});