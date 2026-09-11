import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { selectionHaptic } from '../../utils/haptics';

import {
  alpha,
  iconSize,
  palette,
  spacing,
  textColor,
} from '../../theme/designSystem';

export type ProfileContentTabKey =
  | 'posts'
  | 'work'
  | 'reviews'
  | 'about';

export const DEFAULT_PROFILE_CONTENT_TAB: ProfileContentTabKey =
  'posts';

type ProfileContentTab = {
  key: ProfileContentTabKey;
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
};

const TABS: ProfileContentTab[] = [
  {
    key: 'posts',
    label: 'Posts',
    icon: 'grid-outline',
  },
  {
    key: 'work',
    label: 'Work',
    icon: 'briefcase-outline',
  },
  {
    key: 'reviews',
    label: 'Reviews',
    icon: 'star-outline',
  },
  {
    key: 'about',
    label: 'About',
    icon: 'information-circle-outline',
  },
];

type ProfileContentTabsProps = {
  selectedTab: ProfileContentTabKey;
  onSelectTab: (tab: ProfileContentTabKey) => void;
};

export default function ProfileContentTabs({
  selectedTab,
  onSelectTab,
}: ProfileContentTabsProps) {
  return (
    <View
      style={styles.bar}
      accessibilityRole="tablist"
    >
      {TABS.map(tab => {
        const selected = selectedTab === tab.key;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected }}
            onPress={() => {
              void selectionHaptic();
              onSelectTab(tab.key);
            }}
            style={({ pressed }) => [
              styles.tab,
              selected && styles.tabSelected,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={tab.icon}
              size={iconSize.sm}
              color={
                selected
                  ? palette.opportunityGreen
                  : textColor.muted
              }
            />
            <Text
              style={[
                styles.label,
                selected && styles.labelSelected,
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: alpha.white08,
  },

  tab: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.xxs,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  tabSelected: {
    borderBottomColor: palette.opportunityGreen,
  },

  label: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  labelSelected: {
    color: palette.opportunityGreen,
  },

  pressed: {
    opacity: 0.8,
  },
});
