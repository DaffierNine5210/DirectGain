import { useCallback, useEffect, useRef, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGButton from '../../components/DGButton';
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

import {
  navigateToOwnMyGain,
  type PublicProfileParamList,
} from '../../navigation/publicProfile';
import { openMessagesConversation } from '../../navigation/messages';

import { countCompletedJobsForAssignedUser } from '../../services/jobs/jobRepository';
import { openGeneralConversation } from '../../services/messaging/openGeneralConversation';
import { getProfileIdentityVerified } from '../../services/profile/identityVerificationRepository';
import { resolveProfileAvatarUrl } from '../../services/profile/profileAvatarRepository';
import { getProfilePresentation } from '../../services/profile/profilePresentationRepository';
import {
  getAuthenticatedUserId,
  getProfileById,
} from '../../services/profile/profileRepository';
import { getProfessionalPortfolio } from '../../services/profile/professionalPortfolioRepository';
import {
  getProfessionalCredentials,
  getProfessionalExperiences,
  getProfessionalProfile,
} from '../../services/profile/professionalProfileRepository';
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
import type {
  ProfessionalCredential,
  ProfessionalExperience,
  ProfessionalPortfolioPresentedProject,
  ProfessionalProfileCore,
} from '../../types/professionalProfile';
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
  const identityRequestIdRef = useRef(0);
  const professionalRequestIdRef = useRef(0);
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
  const [identityVerified, setIdentityVerified] =
    useState(false);
  const [showProfessional, setShowProfessional] =
    useState(false);
  const [professional, setProfessional] =
    useState<ProfessionalProfileCore | null>(null);
  const [professionalError, setProfessionalError] =
    useState<string | null>(null);
  const [experiences, setExperiences] = useState<
    ProfessionalExperience[]
  >([]);
  const [credentials, setCredentials] = useState<
    ProfessionalCredential[]
  >([]);
  const [backgroundLoading, setBackgroundLoading] =
    useState(false);
  const [backgroundError, setBackgroundError] = useState<
    string | null
  >(null);
  const [portfolioProjects, setPortfolioProjects] = useState<
    ProfessionalPortfolioPresentedProject[]
  >([]);
  const [portfolioLoading, setPortfolioLoading] =
    useState(false);
  const [portfolioError, setPortfolioError] = useState<
    string | null
  >(null);
  const [completedJobsCount, setCompletedJobsCount] =
    useState<number | null>(null);
  const [completedJobsError, setCompletedJobsError] =
    useState<string | null>(null);
  const [messageOpening, setMessageOpening] =
    useState(false);

  const loadIdentityVerified = useCallback(
    async (id: string) => {
      const requestId = ++identityRequestIdRef.current;
      const result = await getProfileIdentityVerified(id);

      if (
        requestId !== identityRequestIdRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      setIdentityVerified(
        result.error == null &&
          result.result?.verified === true,
      );
    },
    [],
  );

  const clearProfessionalState = useCallback(() => {
    setShowProfessional(false);
    setProfessional(null);
    setProfessionalError(null);
    setExperiences([]);
    setCredentials([]);
    setBackgroundLoading(false);
    setBackgroundError(null);
    setPortfolioProjects([]);
    setPortfolioLoading(false);
    setPortfolioError(null);
    setCompletedJobsCount(null);
    setCompletedJobsError(null);
  }, []);

  const loadProfessionalBundle = useCallback(
    async (id: string, showPlaceholder: boolean) => {
      const requestId = ++professionalRequestIdRef.current;

      if (showPlaceholder) {
        setProfessionalError(null);
        setBackgroundError(null);
        setPortfolioError(null);
        setBackgroundLoading(true);
        setPortfolioLoading(true);
      }

      const [
        professionalResult,
        experienceResult,
        credentialResult,
        portfolioResult,
        jobsResult,
      ] = await Promise.all([
        getProfessionalProfile(id),
        getProfessionalExperiences(id),
        getProfessionalCredentials(id),
        getProfessionalPortfolio(id),
        countCompletedJobsForAssignedUser(id),
      ]);

      if (
        requestId !== professionalRequestIdRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      setBackgroundLoading(false);
      setPortfolioLoading(false);

      if (professionalResult.error) {
        setProfessional(null);
        setProfessionalError(professionalResult.error);
      } else {
        setProfessionalError(null);
        setProfessional(professionalResult.profile);
      }

      if (experienceResult.error || credentialResult.error) {
        setExperiences([]);
        setCredentials([]);
        setBackgroundError(
          experienceResult.error ??
            credentialResult.error ??
            'Professional experience could not be loaded. Try again.',
        );
      } else {
        setBackgroundError(null);
        setExperiences(experienceResult.experiences);
        setCredentials(credentialResult.credentials);
      }

      if (portfolioResult.error) {
        setPortfolioProjects([]);
        setPortfolioError(portfolioResult.error);
      } else {
        setPortfolioError(null);
        setPortfolioProjects(portfolioResult.projects);
      }

      setCompletedJobsError(jobsResult.error);
      setCompletedJobsCount(
        jobsResult.error ? null : jobsResult.count,
      );
    },
    [],
  );

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
      setIdentityVerified(false);
      setAvatarUrl(null);
      setAvatarUnavailable(false);
      setReviewStats(null);
      setReviewStatsError(null);
      setPresentedReviews([]);
      setReviewsError(null);
      clearProfessionalState();
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

    const [result, presentationResult] = await Promise.all([
      getProfileById(id),
      getProfilePresentation(id),
    ]);

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
        setIdentityVerified(false);
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
    void loadIdentityVerified(result.profile.id);

    const useProfessional =
      presentationResult.error == null &&
      presentationResult.presentation.activeTemplate ===
        'professional';

    if (useProfessional) {
      setShowProfessional(true);
      void loadProfessionalBundle(result.profile.id, !quiet);
    } else {
      clearProfessionalState();
    }
  }, [
    clearProfessionalState,
    loadIdentityVerified,
    loadProfessionalBundle,
    loadReputation,
    navigation,
  ]);

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

  async function handleVisitorMessage() {
    if (messageOpening) {
      return;
    }

    setMessageOpening(true);

    const result = await openGeneralConversation(profileId);

    if (!mountedRef.current) {
      return;
    }

    if (result.error || !result.conversationId) {
      setMessageOpening(false);
      Alert.alert(
        'Unable to open messages',
        result.error ??
          'A conversation could not be opened. Try again.',
      );
      return;
    }

    const opened = openMessagesConversation(
      navigation,
      result.conversationId,
    );

    setMessageOpening(false);

    if (!opened) {
      Alert.alert(
        'Unable to open messages',
        'A conversation could not be opened. Try again.',
      );
    }
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
          {showProfessional ? (
            <ProfessionalProfileView
              mode="visitor"
              profile={profile}
              professional={professional}
              professionalError={professionalError}
              onRetryProfessional={() => {
                void loadProfessionalBundle(profile.id, true);
              }}
              onEditProfessional={() => {}}
              experiences={experiences}
              credentials={credentials}
              backgroundLoading={backgroundLoading}
              backgroundError={backgroundError}
              onRetryBackground={() => {
                void loadProfessionalBundle(profile.id, true);
              }}
              onEditBackground={() => {}}
              portfolioProjects={portfolioProjects}
              portfolioLoading={portfolioLoading}
              portfolioError={portfolioError}
              onRetryPortfolio={() => {
                void loadProfessionalBundle(profile.id, true);
              }}
              onEditPortfolio={() => {}}
              resume={null}
              avatarUrl={avatarUrl}
              avatarUnavailable={avatarUnavailable}
              identityVerified={identityVerified}
              reviews={presentedReviews}
              stats={reviewStats}
              statsError={reviewStatsError}
              statsLoading={reviewStatsLoading}
              completedJobsCount={completedJobsCount}
              completedJobsError={completedJobsError}
              reviewsLoading={reviewsLoading}
              reviewsError={reviewsError}
              onRetryReviews={() => {
                void loadReputation(profile.id, true);
              }}
              onPressReviewer={(reviewerId) => {
                void openReviewerProfile(reviewerId);
              }}
              onMessage={() => {
                void handleVisitorMessage();
              }}
              messageLoading={messageOpening}
            />
          ) : (
            <>
          <PersonalProfileHero
            identity={presentProfileHeroIdentity(profile)}
            mode="public"
            identityVerified={identityVerified}
            avatarUrl={avatarUrl}
            avatarUnavailable={avatarUnavailable}
            publicActions={
              <DGButton
                title="Message"
                variant="primary"
                size="small"
                icon="chatbubble-outline"
                loading={messageOpening}
                disabled={messageOpening}
                onPress={() => {
                  void handleVisitorMessage();
                }}
                accessibilityLabel="Message"
                accessibilityHint="Open a conversation with this member"
                style={styles.personalMessageButton}
              />
            }
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

  personalMessageButton: {
    minHeight: 44,
    alignSelf: 'flex-start',
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
