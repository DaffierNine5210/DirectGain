import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  alpha,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

export type ProfileTabKey =
  | 'overview'
  | 'market'
  | 'work'
  | 'activity'
  | 'reviews';

type ProfileTab = {
  key: ProfileTabKey;
  label: string;

  icon: React.ComponentProps<
    typeof Ionicons
  >['name'];

  badge?: string;
};

type Props = {
  selectedTab: ProfileTabKey;

  onSelect: (
    tab: ProfileTabKey,
  ) => void;

  activeListingCount?: number;
  reviewCount?: number;
};

export default function DGProfileTabs({
  selectedTab,
  onSelect,
  activeListingCount = 0,
  reviewCount = 0,
}: Props) {
  const tabs: ProfileTab[] = [
    {
      key: 'overview',
      label: 'Overview',
      icon: 'person-outline',
    },
    {
      key: 'market',
      label: 'Market',
      icon: 'storefront-outline',
      badge:
        activeListingCount > 0
          ? `${activeListingCount}`
          : undefined,
    },
    {
      key: 'work',
      label: 'Work',
      icon: 'briefcase-outline',
    },
    {
      key: 'activity',
      label: 'Activity',
      icon: 'grid-outline',
    },
    {
      key: 'reviews',
      label: 'Reviews',
      icon: 'star-outline',
      badge:
        reviewCount > 0
          ? `${reviewCount}`
          : undefined,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {tabs.map(tab => {
          const isSelected =
            selectedTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{
                selected: isSelected,
              }}
              onPress={() => {
                onSelect(tab.key);
              }}
              style={({ pressed }) => [
                styles.tab,
                isSelected &&
                  styles.tabSelected,
                pressed &&
                  styles.tabPressed,
              ]}
            >
              <Ionicons
                name={tab.icon}
                size={17}
                color={
                  isSelected
                    ? '#95F24C'
                    : textColor.muted
                }
              />

              <Text
                style={[
                  styles.label,
                  isSelected &&
                    styles.labelSelected,
                ]}
              >
                {tab.label}
              </Text>

              {tab.badge ? (
                <View
                  style={[
                    styles.badge,
                    isSelected &&
                      styles.badgeSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      isSelected &&
                        styles.badgeTextSelected,
                    ]}
                  >
                    {tab.badge}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',

    marginTop: spacing.md,

    borderBottomWidth: 1,
    borderBottomColor: alpha.white08,
  },

  scrollContent: {
    paddingHorizontal: 2,
    gap: 5,
  },

  tab: {
    minHeight: 45,

    paddingHorizontal: 12,

    borderRadius: radius.md,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabSelected: {
    backgroundColor:
      'rgba(149, 242, 76, 0.08)',
  },

  tabPressed: {
    opacity: 0.7,
  },

  label: {
    marginLeft: 6,

    color: textColor.muted,

    fontSize: 10,
    lineHeight: 14,

    fontWeight: '800',
  },

  labelSelected: {
    color: '#95F24C',
  },

  badge: {
    minWidth: 20,
    height: 20,

    marginLeft: 6,
    paddingHorizontal: 5,

    borderRadius: radius.pill,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor: surface.cardSoft,

    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeSelected: {
    borderColor:
      'rgba(149, 242, 76, 0.22)',

    backgroundColor:
      'rgba(149, 242, 76, 0.10)',
  },

  badgeText: {
    color: textColor.muted,

    fontSize: 8,

    fontWeight: '900',
  },

  badgeTextSelected: {
    color: '#95F24C',
  },
});