import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGHeader from '../../components/DGHeader';
import DGSkeleton from '../../components/DGSkeleton';
import ProfileContentArea from '../../components/profile/ProfileContentArea';
import {
  DEFAULT_PROFILE_CONTENT_TAB,
  type ProfileContentTabKey,
} from '../../components/profile/ProfileContentTabs';
import PersonalProfileHero from '../../components/profile/PersonalProfileHero';
import ProfessionalProfileView from '../../components/profile/professional/ProfessionalProfileView';
import {
  presentProfileAbout,
  presentProfileHeroIdentity,
  presentProfileReviewCards,
  type PresentedProfileReview,
} from '../../components/profile/profilePresentation';
import ProfileReviewsSection from '../../components/profile/ProfileReviewsSection';

import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import type { MyGainStackParamList } from '../../navigation/MyGainStack';
import { navigateToOwnMyGain } from '../../navigation/publicProfile';

import { resolveProfileAvatarUrl } from '../../services/profile/profileAvatarRepository';
import {
  getAuthenticatedUserId,
  getOwnProfile,
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
  MyGainStackParamList,
  'ProfileStylePreview'
>;

export default function ProfileStylePreviewScreen({
  navigation,
  route,
}: Props) {
  const template = route.params.template;
  const { hideTabBar } = useTabBarVisibility();

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const reputationRequestIdRef = useRef(0);
  const loadRef = useRef<
    (quiet: boolean) => Promise<void>
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
      profileId: string,
      showPlaceholder: boolean,
    ) => {
      const requestId = ++reputationRequestIdRef.current;

      if (showPlaceholder) {
        setReviewStatsLoading(true);
        setReviewsLoading(true);
      }

      const result = await loadProfileReputation(profileId);

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

  const loadProfile = useCallback(async (quiet: boolean) => {
    const requestId = ++requestIdRef.current;

    if (!quiet) {
      setLoading(true);
      setError(null);
    }

    const result = await getOwnProfile();

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
            'Your profile could not be loaded.',
        );
      }
      return;
    }

    setError(null);
    setProfile(result.profile);
    void loadReputation(result.profile.id, !quiet);
  }, [loadReputation]);

  loadRef.current = loadProfile;

  useFocusEffect(
    useCallback(() => {
      hideTabBar();
    }, [hideTabBar]),
  );

  useEffect(() => {
    mountedRef.current = true;

    if (
      template === 'personal' ||
      template === 'professional'
    ) {
      void loadRef.current(false);
    } else {
      setLoading(false);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [template]);

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

  async function openReviewerProfile(reviewerId: string) {
    const userId = await getAuthenticatedUserId();

    if (userId && userId === reviewerId) {
      navigateToOwnMyGain(navigation);
      return;
    }

    navigation.push('PublicProfile', {
      profileId: reviewerId,
    });
  }

  const unavailable = template === 'business';
  const previewTitle =
    template === 'professional'
      ? 'Professional preview'
      : 'Personal preview';
  const isProfessional = template === 'professional';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DGHeader
        showBackButton
        title={previewTitle}
        onBackPress={() => {
          navigation.goBack();
        }}
      />

      {unavailable ? (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>
            Preview coming next
          </Text>
          <Text style={styles.messageBody}>
            This style is not available to preview yet.
            Your saved profile style was not changed.
          </Text>
        </View>
      ) : loading ? (
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
            {error ?? 'Your profile is unavailable.'}
          </Text>
          <Pressable
            onPress={() => {
              void loadProfile(false);
            }}
            style={styles.retry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading profile preview"
          >
            <Text style={styles.retryText}>Retry</Text>
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
                void loadProfile(true);
              }}
              tintColor={palette.opportunityGreen}
            />
          }
        >
          {isProfessional ? (
            <>
              <View
                style={styles.professionalNotice}
                accessibilityRole="text"
                accessibilityLabel="Professional preview. Personal remains your live profile. Nothing was saved."
              >
                <Text style={styles.professionalNoticeText}>
                  Professional preview · Personal stays live ·
                  Nothing saved
                </Text>
              </View>

              <ProfessionalProfileView
                profile={profile}
                avatarUrl={avatarUrl}
                avatarUnavailable={avatarUnavailable}
                reviews={presentedReviews}
                stats={reviewStats}
                statsError={reviewStatsError}
                statsLoading={reviewStatsLoading}
                reviewsLoading={reviewsLoading}
                reviewsError={reviewsError}
                onRetryReviews={() => {
                  void loadReputation(profile.id, true);
                }}
                onPressReviewer={(reviewerId) => {
                  void openReviewerProfile(reviewerId);
                }}
              />

              <View style={styles.currentWrap}>
                <View
                  style={styles.currentButton}
                  accessibilityRole="text"
                  accessibilityLabel="Preview only. Professional is not your saved profile style."
                >
                  <Text style={styles.currentButtonText}>
                    Preview only
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <View
                style={styles.banner}
                accessibilityRole="text"
                accessibilityLabel="Preview. Personal style. This is what other people would see. Your saved style is not changed."
              >
                <Text style={styles.bannerKicker}>
                  PREVIEW
                </Text>
                <Text style={styles.bannerTitle}>
                  Personal style
                </Text>
                <Text style={styles.bannerBody}>
                  This is what other people would see. Your
                  saved style is not changed.
                </Text>
              </View>

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

              <View style={styles.currentWrap}>
                <View
                  style={styles.currentButton}
                  accessibilityRole="text"
                  accessibilityLabel="Current style. Personal is already your saved profile style."
                >
                  <Text style={styles.currentButtonText}>
                    Current style
                  </Text>
                </View>
              </View>
            </>
          )}
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

  banner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.green16,
    backgroundColor: alpha.green04,
    gap: 2,
  },

  bannerKicker: {
    color: palette.opportunityGreen,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  bannerTitle: {
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },

  bannerBody: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },

  professionalNotice: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: alpha.green12,
    backgroundColor: alpha.green04,
  },

  professionalNoticeText: {
    color: textColor.secondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
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

  currentWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },

  currentButton: {
    minHeight: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: alpha.green16,
    backgroundColor: alpha.green06,
    alignItems: 'center',
    justifyContent: 'center',
  },

  currentButtonText: {
    color: palette.opportunityGreen,
    fontSize: 14,
    fontWeight: '800',
  },
});
