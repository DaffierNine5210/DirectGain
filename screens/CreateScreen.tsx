import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useCallback,
  type ComponentProps,
} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGHeader from '../components/DGHeader';

import useTabBarVisibility from '../hooks/useTabBarVisibility';

import type { CreateStackParamList } from '../navigation/CreateStack';

import {
  alpha,
  layout,
  palette,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../theme/designSystem';

type Props = NativeStackScreenProps<
  CreateStackParamList,
  'CreateHome'
>;

type CreateOption = {
  key: 'job' | 'listing' | 'auction' | 'post';
  title: string;
  subtitle: string;
  icon: ComponentProps<
    typeof Ionicons
  >['name'];
  available: boolean;
};

const OPTIONS: CreateOption[] = [
  {
    key: 'job',
    title: 'Post a Job',
    subtitle: 'Find someone for local work',
    icon: 'briefcase-outline',
    available: true,
  },
  {
    key: 'listing',
    title: 'Sell an item',
    subtitle: 'List something on the Market',
    icon: 'storefront-outline',
    available: false,
  },
  {
    key: 'auction',
    title: 'Start an auction',
    subtitle: 'Open live bidding',
    icon: 'hammer-outline',
    available: false,
  },
  {
    key: 'post',
    title: 'Share a post',
    subtitle: 'Post to the local feed',
    icon: 'images-outline',
    available: false,
  },
];

export default function CreateScreen({
  navigation,
}: Props) {
  const { showTabBar } =
    useTabBarVisibility();

  useFocusEffect(
    useCallback(() => {
      showTabBar();
    }, [showTabBar]),
  );

  const availableOptions =
    OPTIONS.filter(
      (option) => option.available,
    );

  const laterOptions =
    OPTIONS.filter(
      (option) => !option.available,
    );

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <DGHeader
        title="Create"
        subtitle="Choose what to add to Direct Gain"
      />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>
          Available now
        </Text>

        {availableOptions.map(
          (option) => (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              accessibilityLabel={
                option.title
              }
              accessibilityHint="Opens Post a Job"
              onPress={() => {
                if (
                  option.key ===
                  'job'
                ) {
                  navigation.navigate(
                    'CreateJob',
                  );
                }
              }}
              style={({
                pressed,
              }) => [
                styles.option,
                styles.optionLive,
                pressed &&
                  styles.optionPressed,
              ]}
            >
              <View
                style={
                  styles.optionIconLive
                }
              >
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={
                    textColor.inverse
                  }
                />
              </View>

              <View
                style={
                  styles.optionCopy
                }
              >
                <Text
                  style={
                    styles.optionTitleLive
                  }
                >
                  {option.title}
                </Text>

                <Text
                  style={
                    styles.optionSubtitle
                  }
                >
                  {option.subtitle}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={
                  palette.opportunityGreen
                }
              />
            </Pressable>
          ),
        )}

        <Text
          style={[
            styles.sectionLabel,
            styles.laterLabel,
          ]}
        >
          Coming later
        </Text>

        {laterOptions.map((option) => (
          <View
            key={option.key}
            accessibilityRole="text"
            accessibilityLabel={`${option.title}, coming later`}
            style={[
              styles.option,
              styles.optionLater,
            ]}
          >
            <View
              style={
                styles.optionIconLater
              }
            >
              <Ionicons
                name={option.icon}
                size={20}
                color={
                  textColor.muted
                }
              />
            </View>

            <View style={styles.optionCopy}>
              <Text
                style={
                  styles.optionTitleLater
                }
              >
                {option.title}
              </Text>

              <Text
                style={
                  styles.optionSubtitleLater
                }
              >
                {option.subtitle}
              </Text>
            </View>

            <Text style={styles.laterBadge}>
              Soon
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#080B09',
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom:
      layout.bottomNavigationClearance,
  },

  sectionLabel: {
    ...typography.eyebrow,
    marginBottom: spacing.sm,
    color: textColor.muted,
  },

  laterLabel: {
    marginTop: spacing.xl,
  },

  option: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },

  optionLive: {
    borderColor: alpha.green20,
    backgroundColor: surface.cardRaised,
  },

  optionLater: {
    marginBottom: spacing.sm,
    borderColor: alpha.white08,
    backgroundColor: surface.cardSoft,
  },

  optionPressed: {
    opacity: 0.9,
  },

  optionIconLive: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: palette.opportunityGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionIconLater: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: alpha.white08,
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing.sm,
  },

  optionTitleLive: {
    color: textColor.primary,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
    letterSpacing: -0.25,
  },

  optionTitleLater: {
    color: textColor.secondary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },

  optionSubtitle: {
    marginTop: 3,
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  optionSubtitleLater: {
    marginTop: 2,
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  laterBadge: {
    ...typography.eyebrow,
    color: textColor.muted,
  },
});
