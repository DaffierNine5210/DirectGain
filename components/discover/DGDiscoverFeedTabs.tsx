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
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

import {
  selectionHaptic,
} from '../../utils/haptics';

export type DiscoverFeedTab =
  | 'for-you'
  | 'following'
  | 'nearby';

type DiscoverFeedTabItem = {
  key: DiscoverFeedTab;
  label: string;
};

type DGDiscoverFeedTabsProps = {
  selectedTab: DiscoverFeedTab;

  onTabChange: (
    tab: DiscoverFeedTab,
  ) => void;

  style?: StyleProp<ViewStyle>;
};

const tabs: DiscoverFeedTabItem[] = [
  {
    key: 'for-you',
    label: 'For You',
  },
  {
    key: 'following',
    label: 'Following',
  },
  {
    key: 'nearby',
    label: 'Nearby',
  },
];

export default function DGDiscoverFeedTabs({
  selectedTab,
  onTabChange,
  style,
}: DGDiscoverFeedTabsProps) {
  async function handleTabPress(
    tab: DiscoverFeedTab,
  ) {
    if (tab === selectedTab) {
      return;
    }

    await selectionHaptic();

    onTabChange(tab);
  }

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.container,
        style,
      ]}
    >
      {tabs.map((tab) => {
        const selected =
          selectedTab === tab.key;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={
              `${tab.label} feed`
            }
            accessibilityState={{
              selected,
            }}
            onPress={() => {
              void handleTabPress(
                tab.key,
              );
            }}
            style={({ pressed }) => [
              styles.tab,

              selected &&
                styles.selectedTab,

              pressed &&
                styles.pressedTab,
            ]}
          >
            <Text
              style={[
                styles.label,

                selected &&
                  styles.selectedLabel,
              ]}
            >
              {tab.label}
            </Text>

            {selected ? (
              <View
                pointerEvents="none"
                style={
                  styles.activeIndicator
                }
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',

    minHeight: 58,

    padding: 5,

    borderRadius:
      radius.lg,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardRaised,

    flexDirection: 'row',

    shadowColor: '#000000',

    shadowOpacity: 0.08,

    shadowRadius: 9,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  tab: {
    position: 'relative',

    flex: 1,

    minHeight: 46,

    borderRadius:
      radius.md,

    alignItems: 'center',

    justifyContent: 'center',

    overflow: 'hidden',
  },

  selectedTab: {
    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      'rgba(255, 255, 255, 0.04)',
  },

  pressedTab: {
    opacity: 0.78,

    transform: [
      {
        scale:
          motion.pressedScale,
      },
    ],
  },

  label: {
    color:
      textColor.muted,

    fontSize: 12,

    lineHeight: 16,

    fontWeight: '800',

    letterSpacing: -0.1,
  },

  selectedLabel: {
    color:
      textColor.primary,

    fontWeight: '900',
  },

  activeIndicator: {
    position: 'absolute',

    right: spacing.md,
    bottom: 5,
    left: spacing.md,

    height: 3,

    borderRadius:
      radius.pill,

    backgroundColor:
      palette.opportunityGreen,
  },
});