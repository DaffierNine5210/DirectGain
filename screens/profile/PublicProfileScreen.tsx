import { useCallback, useEffect, useRef, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGHeader from '../../components/DGHeader';
import DGSkeleton from '../../components/DGSkeleton';
import ProfileContentArea from '../../components/profile/ProfileContentArea';
import {
  DEFAULT_PROFILE_CONTENT_TAB,
  type ProfileContentTabKey,
} from '../../components/profile/ProfileContentTabs';
import PersonalProfileHero from '../../components/profile/PersonalProfileHero';
import {
  presentProfileAbout,
  presentProfileHeroIdentity,
  presentProfileReviewCards,
  type PresentedProfileReview,
} from '../../components/profile/profilePresentation';
import ProfileReviewsSection from '../../components/profile/ProfileReviewsSection';

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
import { loadProfileReputation } from '../../services/reviews/reviewRepository';

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
import type { ProfileReviewStats } from '../../types/reviews';

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
  const reputationRequestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const loadRef = useRef<
    (id: string, quiet: boolean) => Promise<void>
  >(async () => {});

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
  const [selectedTab, setSelectedTab] =
    useState<ProfileContentTabKey>(
      DEFAULT_PROFILE_CONTENT_TAB,
    );
  const [refreshing, setRefreshing] = useState(false);
  const [reviewStats, setReviewStats] =
    useState<ProfileReviewStats | null>(null);
  const [reviewStatsError, setReviewStatsError] =
    useState<string | null>(null);
  const [reviewStatsLoading, setReviewStatsLoading] =
    useState(false);
  const [presentedReviews, setPresentedReviews] =
    useState<PresentedProfileReview[]>([]);
  const [reviewsError, setReviewsError] =
    useState<string | null>(null);
  const [reviewsLoading, setReviewsLoading] =
    useState(false);

  const loadReputation = useCallback(
    async (
      id: string,
      showPlaceholder: boolean,
    ) => {
      const requestId = ++reputationRequestIdRef.current;

      if (showPlaceholder) {
        setReviewStatsLoading(true);
        setReviewsLoading(true);
      }

      const result = await loadProfileReputation(id);

      if (
        requestId !== reputationRequestIdRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      setReviewStatsLoading(false);
      setReviewsLoading(false);
      setReviewStatsError(result.statsError);
      setReviewStats(
        result.statsError ? null : result.stats,
      );
      setReviewsError(result.reviewsError);
      setPresentedReviews(
        result.reviewsError
          ? []
          : presentProfileReviewCards(
              result.reviews,
              result.reviewersById,
            ),
      );
    },
    [],
  );

  const loadProfile = useCallback(async (
    id: string,
    quiet: boolean,
  ) => {
    const requestId = ++requestIdRef.current;

    if (!quiet) {
      setLoading(true);
      setError(null);
      setProfile(null);
      setAvatarUrl(null);
      setAvatarUnavailable(false);
      setReviewStats(null);
      setReviewStatsError(null);
      setPresentedReviews([]);
      setReviewsError(null);
    }

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
        setRefreshing(false);
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
    setRefreshing(false);

    if (result.error || !result.profile) {
      if (!quiet) {
        setProfile(null);
        setError(
          result.error ??
            'This profile could not be found.',
        );
      }
      return;
    }

    if (userId && result.profile.id === userId) {
      if (!navigateToOwnMyGain(navigation)) {
        setError('Your profile is in My Gain.');
      }
      return;
    }

    setError(null);
    setProfile(result.profile);
    hasLoadedRef.current = true;
    void loadReputation(result.profile.id, !quiet);
  }, [loadReputation, navigation]);

  loadRef.current = loadProfile;

  useFocusEffect(
    useCallback(() => {
      hideTabBar();

      if (hasLoadedRef.current) {
        void loadRef.current(profileId, true);
      }

      return () => {
        showTabBar();
      };
    }, [hideTabBar, profileId, showTabBar]),
  );

  useEffect(() => {
    mountedRef.current = true;
    hasLoadedRef.current = false;
    setSelectedTab(DEFAULT_PROFILE_CONTENT_TAB);
    void loadRef.current(profileId, false);

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

  async function openReviewerProfile(reviewerId: string) {
    const userId = await getAuthenticatedUserId();

    if (userId && userId === reviewerId) {
      navigateToOwnMyGain(navigation);
      return;
    }

    if (reviewerId === profileId) {
      return;
    }

    navigation.push('PublicProfile', {
      profileId: reviewerId,
    });
  }

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
            width={72}
            height={72}
            borderRadius={36}
          />
          <View style={styles.identitySkeletonCopy}>
            <DGSkeleton width="72%" height={20} />
            <DGSkeleton width="48%" height={12} />
            <DGSkeleton width="88%" height={12} />
          </View>
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
              void loadProfile(profileId, false);
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void loadProfile(profileId, true);
              }}
              tintColor={palette.opportunityGreen}
            />
          }
        >
          <PersonalProfileHero
            identity={presentProfileHeroIdentity(profile)}
            mode="public"
            avatarUrl={avatarUrl}
            avatarUnavailable={avatarUnavailable}
          />

          <ProfileContentArea
            mode="public"
            selectedTab={selectedTab}
            onSelectTab={setSelectedTab}
            about={presentProfileAbout(profile)}
            reviewsContent={
              <ProfileReviewsSection
                mode="public"
                loading={reviewsLoading}
                error={reviewsError}
                reviews={presentedReviews}
                stats={reviewStats}
                statsError={reviewStatsError}
                statsLoading={reviewStatsLoading}
                onRetry={() => {
                  void loadReputation(profile.id, true);
                }}
                onPressReviewer={(reviewerId) => {
                  void openReviewerProfile(reviewerId);
                }}
              />
            }
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
    paddingBottom: spacing.massive,
    gap: spacing.xs,
  },

  identitySkeleton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  identitySkeletonCopy: {
    flex: 1,
    gap: spacing.xs,
    paddingTop: 4,
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
