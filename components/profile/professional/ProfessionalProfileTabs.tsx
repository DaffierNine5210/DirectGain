import { Pressable, StyleSheet, Text, View } from 'react-native';

import { selectionHaptic } from '../../../utils/haptics';

import {
  alpha,
  palette,
  spacing,
  textColor,
} from '../../../theme/designSystem';

export type ProfessionalProfileTabKey =
  | 'overview'
  | 'portfolio'
  | 'experience'
  | 'reviews';

export const DEFAULT_PROFESSIONAL_TAB: ProfessionalProfileTabKey =
  'overview';

const TABS: {
  key: ProfessionalProfileTabKey;
  label: string;
}[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'experience', label: 'Experience' },
  { key: 'reviews', label: 'Reviews' },
];

type ProfessionalProfileTabsProps = {
  selectedTab: ProfessionalProfileTabKey;
  onSelectTab: (tab: ProfessionalProfileTabKey) => void;
};

export default function ProfessionalProfileTabs({
  selectedTab,
  onSelectTab,
}: ProfessionalProfileTabsProps) {
  return (
    <View style={styles.bar} accessibilityRole="tablist">
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
    paddingHorizontal: spacing.xxs,
    alignItems: 'center',
    justifyContent: 'center',
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
    letterSpacing: 0.1,
  },

  labelSelected: {
    color: palette.opportunityGreen,
  },

  pressed: {
    opacity: 0.8,
  },
});
