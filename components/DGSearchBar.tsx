import { Ionicons } from '@expo/vector-icons';
import {
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
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

type DGSearchBarProps = Omit<
  TextInputProps,
  'style' | 'onChangeText'
> & {
  value: string;
  onChangeText: (value: string) => void;

  onSubmit?: (value: string) => void;
  onClear?: () => void;
  onFilterPress?: () => void;

  showFilter?: boolean;
  filterActive?: boolean;

  containerStyle?: StyleProp<ViewStyle>;
};

export default function DGSearchBar({
  value,
  onChangeText,

  onSubmit,
  onClear,
  onFilterPress,

  showFilter = false,
  filterActive = false,

  containerStyle,

  placeholder = 'Search Direct Gain',
  returnKeyType = 'search',

  onFocus,
  onBlur,

  ...textInputProps
}: DGSearchBarProps) {
  const [isFocused, setIsFocused] =
    useState(false);

  const focusAnimation =
    useRef(
      new Animated.Value(0),
    ).current;

  const filterScale =
    useRef(
      new Animated.Value(1),
    ).current;

  useEffect(() => {
    Animated.timing(
      focusAnimation,
      {
        toValue:
          isFocused ? 1 : 0,
        duration:
          motion.standard,
        useNativeDriver: false,
      },
    ).start();
  }, [
    focusAnimation,
    isFocused,
  ]);

  function handleClear() {
    onChangeText('');
    onClear?.();
  }

  function animateFilter(
    value: number,
  ) {
    Animated.spring(
      filterScale,
      {
        toValue: value,
        speed:
          value === 1
            ? 24
            : 32,
        bounciness:
          value === 1
            ? 5
            : 0,
        useNativeDriver: true,
      },
    ).start();
  }

  return (
    <View
      style={[
        styles.wrapper,
        containerStyle,
      ]}
    >
      <Animated.View
        style={[
          styles.searchContainer,
          {
            borderColor:
              focusAnimation.interpolate(
                {
                  inputRange: [0, 1],
                  outputRange: [
                    alpha.white08,
                    alpha.green40,
                  ],
                },
              ),

            shadowOpacity:
              focusAnimation.interpolate(
                {
                  inputRange: [0, 1],
                  outputRange: [
                    0,
                    0.14,
                  ],
                },
              ),
          },
        ]}
      >
        <View
          pointerEvents="none"
          style={styles.internalGlow}
        />

        <View
          style={[
            styles.searchIconContainer,
            isFocused &&
              styles.searchIconContainerFocused,
          ]}
        >
          <Ionicons
            name="search"
            size={iconSize.md}
            color={
              isFocused
                ? palette.opportunityGreen
                : textColor.muted
            }
          />
        </View>

        <TextInput
          value={value}
          placeholder={placeholder}
          placeholderTextColor={
            textColor.muted
          }
          selectionColor={
            palette.opportunityGreen
          }
          cursorColor={
            palette.opportunityGreen
          }
          returnKeyType={
            returnKeyType
          }
          autoCorrect={false}
          accessibilityLabel="Search Direct Gain"
          style={styles.input}
          onChangeText={
            onChangeText
          }
          onSubmitEditing={() =>
            onSubmit?.(
              value.trim(),
            )
          }
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          {...textInputProps}
        />

        {value.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={8}
            onPress={handleClear}
            style={({ pressed }) => [
              styles.clearButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="close-circle"
              size={iconSize.md}
              color={
                textColor.muted
              }
            />
          </Pressable>
        ) : null}
      </Animated.View>

      {showFilter ? (
        <Animated.View
          style={[
            styles.filterWrapper,
            {
              transform: [
                {
                  scale:
                    filterScale,
                },
              ],
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open search filters"
            accessibilityState={{
              selected:
                filterActive,
            }}
            onPress={
              onFilterPress
            }
            onPressIn={() =>
              animateFilter(
                motion.iconPressedScale,
              )
            }
            onPressOut={() =>
              animateFilter(1)
            }
            style={({ pressed }) => [
              styles.filterButton,
              filterActive &&
                styles.activeFilterButton,
              pressed &&
                styles.filterPressed,
            ]}
          >
            <View
              pointerEvents="none"
              style={[
                styles.filterGlow,
                filterActive &&
                  styles.filterGlowActive,
              ]}
            />

            <Ionicons
              name="options-outline"
              size={iconSize.md}
              color={
                filterActive
                  ? textColor.inverse
                  : textColor.primary
              }
            />

            {filterActive ? (
              <View
                style={
                  styles.activeDot
                }
              />
            ) : null}
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchContainer: {
    position: 'relative',
    flex: 1,
    minHeight: 56,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor:
      surface.input,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',

    shadowColor:
      palette.opportunityGreen,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 3,
  },

  internalGlow: {
    position: 'absolute',
    top: -75,
    right: -55,

    width: 155,
    height: 155,

    borderRadius: 78,

    backgroundColor:
      alpha.green04,
  },

  searchIconContainer: {
    width: 36,
    height: 36,
    marginRight: spacing.xs,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      alpha.white03,
  },

  searchIconContainerFocused: {
    backgroundColor:
      alpha.green08,
  },

  input: {
    flex: 1,
    minHeight: 54,
    paddingVertical: spacing.sm,
    color: textColor.primary,
    fontSize:
      typography.bodyMedium
        .fontSize,
    lineHeight:
      typography.bodyMedium
        .lineHeight,
    fontWeight: '600',
  },

  clearButton: {
    width: 36,
    height: 36,
    marginLeft: spacing.xxs,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterWrapper: {
    marginLeft: spacing.sm,
  },

  filterButton: {
    position: 'relative',
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor:
      alpha.white08,
    backgroundColor:
      surface.input,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadow.card,
  },

  activeFilterButton: {
    borderColor:
      alpha.green40,
    backgroundColor:
      palette.opportunityGreen,
    ...shadow.greenSoft,
  },

  filterGlow: {
    position: 'absolute',
    top: -28,
    right: -28,

    width: 72,
    height: 72,

    borderRadius: 36,

    backgroundColor:
      alpha.green04,
  },

  filterGlowActive: {
    backgroundColor:
      'rgba(255, 255, 255, 0.16)',
  },

  activeDot: {
    position: 'absolute',
    top: 9,
    right: 9,

    width: 7,
    height: 7,

    borderRadius:
      radius.pill,

    backgroundColor:
      textColor.inverse,
  },

  pressed: {
    opacity: 0.74,
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  filterPressed: {
    opacity: 0.9,
  },
});