import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
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

import { colors } from '../theme/colors';

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
  React.ComponentProps<typeof Ionicons>['name'];

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
  const scaleAnimation = useRef(
    new Animated.Value(1),
  ).current;

  const glowAnimation = useRef(
    new Animated.Value(0),
  ).current;

  const isDisabled = disabled || loading;

  const textColor =
    getButtonTextColor(variant);

  const spinnerColor =
    getSpinnerColor(variant);

  useEffect(() => {
    if (
      variant !== 'primary' ||
      isDisabled
    ) {
      glowAnimation.setValue(0);
      return;
    }

    Animated.timing(glowAnimation, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [
    glowAnimation,
    isDisabled,
    variant,
  ]);

  function animateScale(
    value: number,
  ) {
    Animated.spring(scaleAnimation, {
      toValue: value,
      speed: value === 1 ? 24 : 34,
      bounciness: value === 1 ? 6 : 0,
      useNativeDriver: true,
    }).start();
  }

  function handlePressIn() {
    if (isDisabled) {
      return;
    }

    animateScale(0.97);
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
        accessibilityLabel ?? title
      }
      accessibilityHint={accessibilityHint}
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
        fullWidth && styles.fullWidth,
      ]}
    >
      <Animated.View
        style={[
          styles.button,
          getButtonSizeStyle(size),
          getButtonVariantStyle(variant),
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabledButton,
          {
            transform: [
              {
                scale: scaleAnimation,
              },
            ],
          },
          style,
        ]}
      >
        {variant === 'primary' ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.primaryHighlight,
              {
                opacity: glowAnimation,
              },
            ]}
          />
        ) : null}

        <View style={styles.content}>
          {loading ? (
            <>
              <ActivityIndicator
                size="small"
                color={spinnerColor}
              />

              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  getLabelSizeStyle(size),
                  styles.loadingLabel,
                  {
                    color: textColor,
                  },
                ]}
              >
                {title}
              </Text>
            </>
          ) : (
            <>
              {icon &&
              iconPosition === 'left' ? (
                <Ionicons
                  name={icon}
                  size={getIconSize(size)}
                  color={textColor}
                  style={styles.leftIcon}
                />
              ) : null}

              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  getLabelSizeStyle(size),
                  {
                    color: textColor,
                  },
                ]}
              >
                {title}
              </Text>

              {icon &&
              iconPosition === 'right' ? (
                <Ionicons
                  name={icon}
                  size={getIconSize(size)}
                  color={textColor}
                  style={styles.rightIcon}
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

function getButtonTextColor(
  variant: DGButtonVariant,
) {
  switch (variant) {
    case 'primary':
      return '#071004';

    case 'outline':
      return colors.primary;

    case 'danger':
      return '#FFFFFF';

    case 'secondary':
    case 'ghost':
    default:
      return colors.text;
  }
}

function getSpinnerColor(
  variant: DGButtonVariant,
) {
  switch (variant) {
    case 'primary':
      return '#071004';

    case 'outline':
      return colors.primary;

    case 'secondary':
    case 'ghost':
    case 'danger':
    default:
      return colors.text;
  }
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
    borderRadius: 16,
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

  primaryHighlight: {
    position: 'absolute',
    top: 0,
    right: 20,
    left: 20,
    height: 1,
    borderRadius: 1,
    backgroundColor:
      'rgba(255, 255, 255, 0.7)',
  },

  smallButton: {
    minHeight: 38,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 13,
  },

  mediumButton: {
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 16,
  },

  largeButton: {
    minHeight: 56,
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 18,
  },

  primaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary,

    shadowColor: colors.primary,
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 5,
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.1)',
    backgroundColor: colors.cardRaised,

    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 3,
  },

  outlineButton: {
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.7)',
    backgroundColor:
      'rgba(158, 246, 90, 0.04)',
  },

  ghostButton: {
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },

  dangerButton: {
    borderWidth: 1,
    borderColor: '#E5484D',
    backgroundColor: '#E5484D',

    shadowColor: '#E5484D',
    shadowOpacity: 0.2,
    shadowRadius: 11,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 4,
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
    marginRight: 8,
  },

  rightIcon: {
    marginLeft: 8,
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