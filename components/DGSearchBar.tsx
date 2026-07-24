import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { colors } from '../theme/colors';

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
  const [isFocused, setIsFocused] = useState(false);

  function handleClear() {
    onChangeText('');
    onClear?.();
  }

  return (
    <View
      style={[
        styles.wrapper,
        containerStyle,
      ]}
    >
      <View
        style={[
          styles.searchContainer,
          isFocused && styles.focusedSearchContainer,
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={
            isFocused
              ? colors.primary
              : colors.textMuted
          }
          style={styles.searchIcon}
        />

        <TextInput
          value={value}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          returnKeyType={returnKeyType}
          autoCorrect={false}
          accessibilityLabel="Search Direct Gain"
          style={styles.input}
          onChangeText={onChangeText}
          onSubmitEditing={() => onSubmit?.(value.trim())}
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
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>

      {showFilter ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open search filters"
          accessibilityState={{
            selected: filterActive,
          }}
          onPress={onFilterPress}
          style={({ pressed }) => [
            styles.filterButton,
            filterActive && styles.activeFilterButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="options-outline"
            size={21}
            color={
              filterActive
                ? '#071004'
                : colors.text
            }
          />

          {filterActive ? (
            <View style={styles.activeDot} />
          ) : null}
        </Pressable>
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
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 15,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
  },

  focusedSearchContainer: {
    borderColor: colors.primary,

    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  searchIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    minHeight: 50,
    paddingVertical: 11,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },

  clearButton: {
    width: 34,
    height: 34,
    marginLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButton: {
    width: 52,
    height: 52,
    marginLeft: 10,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeFilterButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,

    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  activeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#071004',
  },

  pressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.94,
      },
    ],
  },
});