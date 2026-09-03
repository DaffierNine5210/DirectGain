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

import DGHeader from '../../components/DGHeader';

import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import type { WorkStackParamList } from '../../navigation/WorkStack';

import {
  alpha,
  iconSize,
  layout,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

type Props = NativeStackScreenProps<
  WorkStackParamList,
  'WorkHome'
>;

export default function WorkHomeScreen({
  navigation,
}: Props) {
  const { showTabBar } = useTabBarVisibility();

  useFocusEffect(
    useCallback(() => {
      showTabBar();
    }, [showTabBar]),
  );

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <DGHeader
        showBackButton
        title="Work"
        onBackPress={() => {
          navigation.goBack();
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Manage jobs you have posted, applications you have sent, and work you have been selected for.
        </Text>

        <WorkEntry
          icon="briefcase-outline"
          title="My Jobs"
          body="Manage jobs you've posted"
          onPress={() => {
            navigation.navigate('MyJobs');
          }}
        />

        <WorkEntry
          icon="document-text-outline"
          title="My Applications"
          body="Track jobs you've applied for"
          onPress={() => {
            navigation.navigate('MyApplications');
          }}
        />

        <WorkEntry
          icon="checkmark-circle-outline"
          title="Assigned Work"
          body="Jobs you've been selected for"
          onPress={() => {
            navigation.navigate('AssignedWork');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function WorkEntry({
  icon,
  title,
  body,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons
          name={icon}
          size={iconSize.md}
          color={textColor.primary}
        />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={iconSize.sm}
        color={textColor.muted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: surface.page,
  },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: layout.bottomNavigationClearance,
    gap: spacing.sm,
  },

  intro: {
    marginBottom: spacing.xs,
    color: textColor.secondary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
  },

  pressed: {
    opacity: 0.86,
  },

  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: alpha.green08,
    borderWidth: 1,
    borderColor: alpha.green16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  title: {
    color: textColor.primary,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },

  body: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
