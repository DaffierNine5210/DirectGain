import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGHeader from '../../components/DGHeader';
import DGSkeleton from '../../components/DGSkeleton';
import ProfileStyleOptionCard from '../../components/profile/ProfileStyleOptionCard';

import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import type { MyGainStackParamList } from '../../navigation/MyGainStack';

import {
  DEFAULT_PROFILE_TEMPLATE,
  type ProfileTemplate,
} from '../../types/profile';
import { getOwnProfilePresentation } from '../../services/profile/profilePresentationRepository';

import {
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

type Props = NativeStackScreenProps<
  MyGainStackParamList,
  'ProfileStyle'
>;

export default function ProfileStyleScreen({
  navigation,
}: Props) {
  const { hideTabBar } = useTabBarVisibility();

  const mountedRef = useRef(true);
  const [loading, setLoading] = useState(true);
  const [activeTemplate, setActiveTemplate] =
    useState<ProfileTemplate>(DEFAULT_PROFILE_TEMPLATE);
  const [focusedTemplate, setFocusedTemplate] =
    useState<ProfileTemplate | null>(null);

  const loadPresentation = useCallback(async () => {
    const result = await getOwnProfilePresentation();

    if (!mountedRef.current) {
      return;
    }

    setActiveTemplate(
      result.presentation.activeTemplate,
    );
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      hideTabBar();
      mountedRef.current = true;
      void loadPresentation();

      return () => {
        mountedRef.current = false;
      };
    }, [hideTabBar, loadPresentation]),
  );

  function handleSelect(template: ProfileTemplate) {
    if (template === 'personal') {
      setFocusedTemplate(null);
      navigation.navigate('ProfileStylePreview', {
        template: 'personal',
      });
      return;
    }

    setFocusedTemplate(template);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DGHeader
        showBackButton
        title="Profile style"
        onBackPress={() => {
          navigation.goBack();
        }}
      />

      {loading ? (
        <View style={styles.body}>
          <DGSkeleton width="62%" height={22} />
          <DGSkeleton width="100%" height={48} />
          <DGSkeleton width="100%" height={168} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <Text style={styles.heading}>
              Choose how you present yourself
            </Text>
            <Text style={styles.bodyCopy}>
              Your profile style changes how your
              information and content are presented. Your
              Direct Gain identity, reviews and history
              stay with you.
            </Text>
          </View>

          <ProfileStyleOptionCard
            template="personal"
            current={activeTemplate === 'personal'}
            onPress={() => {
              handleSelect('personal');
            }}
          />

          <ProfileStyleOptionCard
            template="professional"
            current={activeTemplate === 'professional'}
            comingSoon
            focused={focusedTemplate === 'professional'}
            onPress={() => {
              handleSelect('professional');
            }}
          />

          <ProfileStyleOptionCard
            template="business"
            current={activeTemplate === 'business'}
            comingSoon
            focused={focusedTemplate === 'business'}
            onPress={() => {
              handleSelect('business');
            }}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: surface.page,
  },

  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.massive,
    gap: spacing.md,
  },

  intro: {
    gap: spacing.xs,
    paddingBottom: spacing.xxs,
  },

  heading: {
    color: textColor.primary,
    ...typography.headingMedium,
  },

  bodyCopy: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
});
