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
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

type DGDiscoverSearchBarProps = {
  placeholder?: string;

  onPress: () => void;

  style?: StyleProp<ViewStyle>;
};

export default function DGDiscoverSearchBar({
  placeholder = 'Search listings, people, jobs, auctions...',
  onPress,
  style,
}: DGDiscoverSearchBarProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Search Direct Gain"
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,

        pressed && styles.pressed,

        style,
      ]}
    >
      <Ionicons
        name="search"
        size={20}
        color={textColor.muted}
      />

      <Text
        numberOfLines={1}
        style={styles.placeholder}
      >
        {placeholder}
      </Text>

      <View style={styles.shortcut}>
        <Text style={styles.shortcutText}>
          Search
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',

    minHeight: 56,

    paddingHorizontal: spacing.md,

    borderRadius: radius.lg,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor: surface.cardRaised,

    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000',

    shadowOpacity: 0.08,

    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  pressed: {
    opacity: 0.82,

    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  placeholder: {
    flex: 1,

    marginLeft: spacing.sm,

    color: textColor.muted,

    fontSize: 14,

    fontWeight: '600',
  },

  shortcut: {
    paddingHorizontal: spacing.sm,

    paddingVertical: 5,

    borderRadius: radius.pill,

    backgroundColor:
      'rgba(255,255,255,0.04)',
  },

  shortcutText: {
    color: textColor.secondary,

    fontSize: 10,

    fontWeight: '800',
  },
});