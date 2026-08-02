import { Ionicons } from '@expo/vector-icons';
import {
  useEffect,
  useRef,
} from 'react';
import {
  ActivityIndicator,
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
  motion,
  palette,
  radius,
  shadow,
  spacing,
  surface,
  textColor,
} from '../theme/designSystem';

export type DGButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';

export type DGButtonSize =
  | 'small'
  | 'medium'
  | 'large';

type DGButtonIconName =
  React.ComponentProps<
    typeof Ionicons
  >['name'];

export type DGButtonProps = {
  title: string;
  onPress?: () => void;

  variant?: DGButtonVariant;
  size?: DGButtonSize;

  icon?: DGButtonIconName;
  iconPosition?: 'left' | 'right';

  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;

  style?: StyleProp<ViewStyle>;
  testID?: string;

  accessibilityLabel?: string;
  accessibilityHint?: string;

  onPressIn?: () => void;
  onPressOut?: () => void;
};

export default function DGButton({
  title,
  onPress,

  variant = 'primary',
  size = 'medium',

  icon,
  iconPosition = 'left',

  fullWidth = false,
  disabled = false,
  loading = false,

  style,
  testID,

  accessibilityLabel,
  accessibilityHint,

  onPressIn,
  onPressOut,
}: DGButtonProps) {
  const scaleAnimation =
    useRef(
      new Animated.Value(1),
    ).current;

  const glowAnimation =
    useRef(
      new Animated.Value(0),
    ).current;

  const highlightAnimation =
    useRef(
      new Animated.Value(0),
    ).current;

  const isDisabled =
    disabled || loading;

  const textColour =
    getButtonTextColour(variant);

  const spinnerColour =
    getSpinnerColour(variant);

  useEffect(() => {
    if (
      variant !== 'primary' ||
      isDisabled
    ) {
      glowAnimation.setValue(0);
      highlightAnimation.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(
        glowAnimation,
        {
          toValue: 1,
          duration: motion.relaxed,
          useNativeDriver: true,
        },
      ),

      Animated.timing(
        highlightAnimation,
        {
          toValue: 1,
          duration: motion.standard,
          useNativeDriver: true,
        },
      ),
    ]).start();
  }, [
    glowAnimation,
    highlightAnimation,
    isDisabled,
    variant,
  ]);

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
    if (isDisabled) {
      return;
    }

    animateScale(
      motion.pressedScale,
    );

    onPressIn?.();
  }

  function handlePressOut() {
    if (isDisabled) {
      return;
    }

    animateScale(1);

    onPressOut?.();
  }

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ??
        title
      }
      accessibilityHint={
        accessibilityHint
      }
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.pressable,
        fullWidth &&
          styles.fullWidth,
      ]}
    >
      <Animated.View
        style={[
          styles.button,
          getButtonSizeStyle(size),
          getButtonVariantStyle(
            variant,
          ),
          fullWidth &&
            styles.fullWidth,
          isDisabled &&
            styles.disabledButton,
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
        {variant === 'primary' ? (
          <>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.primaryGlow,
                {
                  opacity:
                    glowAnimation.interpolate(
                      {
                        inputRange: [
                          0,
                          1,
                        ],
                        outputRange: [
                          0,
                          0.52,
                        ],
                      },
                    ),
                },
              ]}
            />

            <Animated.View
              pointerEvents="none"
              style={[
                styles.primaryHighlight,
                {
                  opacity:
                    highlightAnimation,
                },
              ]}
            />
          </>
        ) : null}

        <View style={styles.content}>
          {loading ? (
            <>
              <ActivityIndicator
                size="small"
                color={
                  spinnerColour
                }
              />

              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  getLabelSizeStyle(
                    size,
                  ),
                  styles.loadingLabel,
                  {
                    color:
                      textColour,
                  },
                ]}
              >
                {title}
              </Text>
            </>
          ) : (
            <>
              {icon &&
              iconPosition ===
                'left' ? (
                <Ionicons
                  name={icon}
                  size={getIconSize(
                    size,
                  )}
                  color={
                    textColour
                  }
                  style={
                    styles.leftIcon
                  }
                />
              ) : null}

              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  getLabelSizeStyle(
                    size,
                  ),
                  {
                    color:
                      textColour,
                  },
                ]}
              >
                {title}
              </Text>

              {icon &&
              iconPosition ===
                'right' ? (
                <Ionicons
                  name={icon}
                  size={getIconSize(
                    size,
                  )}
                  color={
                    textColour
                  }
                  style={
                    styles.rightIcon
                  }
                />
              ) : null}
            </>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

function getButtonSizeStyle(
  size: DGButtonSize,
) {
  switch (size) {
    case 'small':
      return styles.smallButton;

    case 'large':
      return styles.largeButton;

    case 'medium':
    default:
      return styles.mediumButton;
  }
}

function getLabelSizeStyle(
  size: DGButtonSize,
) {
  switch (size) {
    case 'small':
      return styles.smallLabel;

    case 'large':
      return styles.largeLabel;

    case 'medium':
    default:
      return styles.mediumLabel;
  }
}

function getButtonVariantStyle(
  variant: DGButtonVariant,
) {
  switch (variant) {
    case 'secondary':
      return styles.secondaryButton;

    case 'outline':
      return styles.outlineButton;

    case 'ghost':
      return styles.ghostButton;

    case 'danger':
      return styles.dangerButton;

    case 'primary':
    default:
      return styles.primaryButton;
  }
}

function getButtonTextColour(
  variant: DGButtonVariant,
) {
  switch (variant) {
    case 'primary':
      return textColor.inverse;

    case 'outline':
      return textColor.accent;

    case 'danger':
      return '#FFFFFF';

    case 'secondary':
    case 'ghost':
    default:
      return textColor.primary;
  }
}

function getSpinnerColour(
  variant: DGButtonVariant,
) {
  return getButtonTextColour(
    variant,
  );
}

function getIconSize(
  size: DGButtonSize,
) {
  switch (size) {
    case 'small':
      return 16;

    case 'large':
      return 21;

    case 'medium':
    default:
      return 18;
  }
}

const styles = StyleSheet.create({
  pressable: {
    alignSelf: 'flex-start',
  },

  fullWidth: {
    width: '100%',
  },

  button: {
    position: 'relative',
    alignSelf: 'flex-start',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    zIndex: 2,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryGlow: {
    position: 'absolute',
    top: -65,
    right: -45,

    width: 155,
    height: 155,

    borderRadius: 78,

    backgroundColor:
      'rgba(255, 255, 255, 0.18)',
  },

  primaryHighlight: {
    position: 'absolute',
    top: 0,
    right: spacing.lg,
    left: spacing.lg,

    height: 1,

    borderRadius:
      radius.pill,

    backgroundColor:
      'rgba(255, 255, 255, 0.62)',
  },

  smallButton: {
    minHeight: 38,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },

  mediumButton: {
    minHeight: 48,
    paddingHorizontal:
      spacing.lg,
    paddingVertical: 11,
    borderRadius: radius.md,
  },

  largeButton: {
    minHeight: 58,
    paddingHorizontal:
      spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.lg,
  },

  primaryButton: {
    backgroundColor:
      palette.opportunityGreen,

    borderWidth: 1,

    borderColor:
      'rgba(216, 255, 194, 0.76)',

    ...shadow.greenMedium,
  },

  secondaryButton: {
    backgroundColor:
      surface.cardRaised,

    borderWidth: 1,
    borderColor:
      alpha.white10,

    ...shadow.card,
  },

  outlineButton: {
    backgroundColor:
      alpha.green04,

    borderWidth: 1,
    borderColor:
      alpha.green40,
  },

  ghostButton: {
    backgroundColor:
      'transparent',

    borderWidth: 1,
    borderColor:
      'transparent',
  },

  dangerButton: {
    backgroundColor:
      palette.danger,

    borderWidth: 1,

    borderColor:
      'rgba(255, 255, 255, 0.16)',

    shadowColor:
      palette.danger,

    shadowOpacity: 0.17,
    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 5,
  },

  label: {
    flexShrink: 1,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.1,
  },

  smallLabel: {
    fontSize: 12,
    lineHeight: 16,
  },

  mediumLabel: {
    fontSize: 14,
    lineHeight: 19,
  },

  largeLabel: {
    fontSize: 16,
    lineHeight: 21,
  },

  leftIcon: {
    marginRight: spacing.xs,
  },

  rightIcon: {
    marginLeft: spacing.xs,
  },

  loadingLabel: {
    marginLeft: 9,
  },

  disabledButton: {
    opacity: 0.42,
    shadowOpacity: 0,
    elevation: 0,
  },
});