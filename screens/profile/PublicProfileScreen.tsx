import { useCallback, useEffect, useRef, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGHeader from '../../components/DGHeader';
import DGSkeleton from '../../components/DGSkeleton';
import ProfileIdentityHeader from '../../components/profile/ProfileIdentityHeader';

import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import {
  navigateToOwnMyGain,
  type PublicProfileParamList,
} from '../../navigation/publicProfile';

import { resolveProfileAvatarUrl } from '../../services/profile/profileAvatarRepository';
import {
  getAuthenticatedUserId,
  getProfileById,
} from '../../services/profile/profileRepository';

import {
  alpha,
  palette,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

import type { DirectGainProfile } from '../../types/profile';

type Props = NativeStackScreenProps<
  PublicProfileParamList,
  'PublicProfile'
>;

export default function PublicProfileScreen({
  navigation,
  route,
}: Props) {
  const {
    hideTabBar,
    showTabBar,
  } = useTabBarVisibility();

  const profileId = route.params.profileId.trim().toLowerCase();

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const loadRef = useRef<(id: string) => Promise<void>>(
    async () => {},
  );

  const [
    profile,
    setProfile,
  ] = useState<DirectGainProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    null,
  );
  const [avatarUnavailable, setAvatarUnavailable] =
    useState(false);

  const loadProfile = useCallback(async (id: string) => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);
    setProfile(null);
    setAvatarUrl(null);
    setAvatarUnavailable(false);

    const userId = await getAuthenticatedUserId();

    if (
      requestId !== requestIdRef.current ||
      !mountedRef.current
    ) {
      return;
    }

    if (userId && userId === id) {
      if (!navigateToOwnMyGain(navigation)) {
        setLoading(false);
        setError('Your profile is in My Gain.');
      }
      return;
    }

    const result = await getProfileById(id);

    if (
      requestId !== requestIdRef.current ||
      !mountedRef.current
    ) {
      return;
    }

    setLoading(false);

    if (result.error || !result.profile) {
      setProfile(null);
      setError(
        result.error ??
          'This profile could not be found.',
      );
      return;
    }

    if (userId && result.profile.id === userId) {
      if (!navigateToOwnMyGain(navigation)) {
        setLoading(false);
        setError('Your profile is in My Gain.');
      }
      return;
    }

    setError(null);
    setProfile(result.profile);
  }, [navigation]);

  loadRef.current = loadProfile;

  useFocusEffect(
    useCallback(() => {
      hideTabBar();

      return () => {
        showTabBar();
      };
    }, [hideTabBar, showTabBar]),
  );

  useEffect(() => {
    mountedRef.current = true;
    void loadRef.current(profileId);

    return () => {
      mountedRef.current = false;
    };
  }, [profileId]);

  useEffect(() => {
    let cancelled = false;
    const path = profile?.avatarPath ?? null;

    if (!path) {
      setAvatarUrl(null);
      setAvatarUnavailable(false);
      return;
    }

    setAvatarUrl(null);
    setAvatarUnavailable(false);

    void (async () => {
      const url = await resolveProfileAvatarUrl(path);

      if (!cancelled && mountedRef.current) {
        setAvatarUrl(url);
        setAvatarUnavailable(url == null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profile?.avatarPath]);

  const title = profile?.displayName ?? 'Profile';

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <DGHeader
        showBackButton
        title={title}
        onBackPress={() => {
          navigation.goBack();
        }}
      />

      {loading ? (
        <View style={styles.identitySkeleton}>
          <DGSkeleton
            width={104}
            height={104}
            borderRadius={52}
          />
          <DGSkeleton
            width="48%"
            height={22}
            style={styles.skeleton}
          />
          <DGSkeleton width="32%" height={12} />
        </View>
      ) : error || !profile ? (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>
            Profile could not be loaded
          </Text>
          <Text style={styles.messageBody}>
            {error ?? 'This profile is unavailable.'}
          </Text>
          <Pressable
            onPress={() => {
              void loadProfile(profileId);
            }}
            style={styles.retry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading profile"
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              navigation.goBack();
            }}
            style={styles.backLink}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backLinkText}>Go back</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <ProfileIdentityHeader
            profile={profile}
            mode="public"
            avatarUrl={avatarUrl}
            avatarUnavailable={avatarUnavailable}
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

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.massive,
  },

  identitySkeleton: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },

  skeleton: {
    marginTop: spacing.sm,
  },

  messageCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
  },

  messageTitle: {
    color: textColor.primary,
    ...typography.headingSmall,
  },

  messageBody: {
    marginTop: spacing.xs,
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
  },

  retry: {
    marginTop: spacing.md,
    minHeight: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.opportunityGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },

  retryText: {
    color: textColor.inverse,
    fontWeight: '800',
  },

  backLink: {
    marginTop: spacing.sm,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backLinkText: {
    color: textColor.secondary,
    fontSize: 14,
    fontWeight: '700',
  },
});
