import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
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
import DGButton from '../../components/DGButton';
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

import { getProfileIdentityVerified } from '../../services/profile/identityVerificationRepository';
import { resolveProfileAvatarUrl } from '../../services/profile/profileAvatarRepository';
import {
  getAuthenticatedUserId,
  getOwnProfile,
} from '../../services/profile/profileRepository';
import {
  getOwnProfilePresentation,
  setOwnActiveProfileTemplate,
} from '../../services/profile/profilePresentationRepository';
import {
  getOwnProfessionalCredentials,
  getOwnProfessionalExperiences,
  getOwnProfessionalProfile,
} from '../../services/profile/professionalProfileRepository';
import { getOwnProfessionalPortfolio } from '../../services/profile/professionalPortfolioRepository';
import {
  getOwnProfessionalResume,
  removeOwnProfessionalResume,
} from '../../services/profile/professionalResumeRepository';
import { countCompletedJobsForAssignedUser } from '../../services/jobs/jobRepository';
import { loadProfileReputation } from '../../services/reviews/reviewRepository';

import type {
  ProfessionalCredential,
  ProfessionalExperience,
  ProfessionalPortfolioPresentedProject,
  ProfessionalProfileCore,
  ProfessionalResume,
} from '../../types/professionalProfile';

import {
  alpha,
  palette,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

import {
  type DirectGainProfile,
  type ProfileTemplate,
} from '../../types/profile';
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
  const identityRequestIdRef = useRef(0);
  const professionalRequestIdRef = useRef(0);
  const professionalLoadedRef = useRef(false);
  const backgroundRequestIdRef = useRef(0);
  const backgroundLoadedRef = useRef(false);
  const portfolioRequestIdRef = useRef(0);
  const portfolioLoadedRef = useRef(false);
  const resumeRequestIdRef = useRef(0);
  const resumeLoadedRef = useRef(false);
  const completedJobsRequestIdRef = useRef(0);
  const loadRef = useRef<
    (quiet: boolean) => Promise<void>
  >(async () => {});
  const loadProfessionalRef = useRef<
    (quiet: boolean) => Promise<void>
  >(async () => {});
  const loadBackgroundRef = useRef<
    (quiet: boolean) => Promise<void>
  >(async () => {});
  const loadPortfolioRef = useRef<
    (quiet: boolean) => Promise<void>
  >(async () => {});
  const loadResumeRef = useRef<
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
  const [resume, setResume] = useState<ProfessionalResume | null>(
    null,
  );
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(
    null,
  );
  const [resumeMutating, setResumeMutating] = useState(false);
  const [completedJobsCount, setCompletedJobsCount] =
    useState<number | null>(null);
  const [completedJobsError, setCompletedJobsError] =
    useState<string | null>(null);
  const [identityVerified, setIdentityVerified] =
    useState(false);
  const [savedTemplate, setSavedTemplate] =
    useState<ProfileTemplate | null>(null);
  const [switching, setSwitching] = useState(false);

  const loadIdentityVerified = useCallback(
    async (profileId: string) => {
      const requestId = ++identityRequestIdRef.current;
      const result = await getProfileIdentityVerified(
        profileId,
      );

      if (
        requestId !== identityRequestIdRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      if (result.error || !result.result) {
        return;
      }

      setIdentityVerified(
        result.result.verified === true,
      );
    },
    [],
  );

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

  const loadCompletedJobsCount = useCallback(
    async (profileId: string) => {
      const requestId = ++completedJobsRequestIdRef.current;
      const result =
        await countCompletedJobsForAssignedUser(profileId);

      if (
        requestId !== completedJobsRequestIdRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      setCompletedJobsError(result.error);
      setCompletedJobsCount(
        result.error ? null : result.count,
      );
    },
    [],
  );

  const applyProfessionalResult = useCallback(
    (
      result: {
        profile: ProfessionalProfileCore | null;
        error: string | null;
      },
      quiet: boolean,
    ) => {
      if (result.error) {
        setProfessionalError(result.error);

        if (!quiet) {
          setProfessional(null);
        }

        return;
      }

      setProfessionalError(null);
      setProfessional(result.profile);
    },
    [],
  );

  const applyBackgroundResult = useCallback(
    (
      experienceResult: {
        experiences: ProfessionalExperience[];
        error: string | null;
      },
      credentialResult: {
        credentials: ProfessionalCredential[];
        error: string | null;
      },
      quiet: boolean,
    ) => {
      const error =
        experienceResult.error ?? credentialResult.error;

      if (error) {
        setBackgroundError(error);

        if (!quiet) {
          setExperiences([]);
          setCredentials([]);
        }

        return;
      }

      setBackgroundError(null);
      setExperiences(experienceResult.experiences);
      setCredentials(credentialResult.credentials);
    },
    [],
  );

  const applyPortfolioResult = useCallback(
    (
      result: {
        projects: ProfessionalPortfolioPresentedProject[];
        error: string | null;
      },
      quiet: boolean,
    ) => {
      if (result.error) {
        setPortfolioError(result.error);

        if (!quiet) {
          setPortfolioProjects([]);
        }

        return;
      }

      setPortfolioError(null);
      setPortfolioProjects(result.projects);
    },
    [],
  );

  const applyResumeResult = useCallback(
    (
      result: {
        resume: ProfessionalResume | null;
        error: string | null;
      },
      quiet: boolean,
    ) => {
      if (result.error) {
        setResumeError(result.error);

        if (!quiet) {
          setResume(null);
        }

        return;
      }

      setResumeError(null);
      setResume(result.resume);
    },
    [],
  );

  const loadProfessional = useCallback(
    async (quiet: boolean) => {
      const requestId = ++professionalRequestIdRef.current;
      const result = await getOwnProfessionalProfile();

      if (
        requestId !== professionalRequestIdRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      applyProfessionalResult(result, quiet);
      professionalLoadedRef.current = true;
    },
    [applyProfessionalResult],
  );

  const loadBackground = useCallback(
    async (quiet: boolean) => {
      const requestId = ++backgroundRequestIdRef.current;

      if (!quiet) {
        setBackgroundLoading(true);
      }

      const [experienceResult, credentialResult] =
        await Promise.all([
          getOwnProfessionalExperiences(),
          getOwnProfessionalCredentials(),
        ]);

      if (
        requestId !== backgroundRequestIdRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      setBackgroundLoading(false);
      applyBackgroundResult(
        experienceResult,
        credentialResult,
        quiet,
      );
      backgroundLoadedRef.current = true;
    },
    [applyBackgroundResult],
  );

  const loadPortfolio = useCallback(
    async (quiet: boolean) => {
      const requestId = ++portfolioRequestIdRef.current;

      if (!quiet) {
        setPortfolioLoading(true);
      }

      const result = await getOwnProfessionalPortfolio();

      if (
        requestId !== portfolioRequestIdRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      setPortfolioLoading(false);
      applyPortfolioResult(result, quiet);
      portfolioLoadedRef.current = true;
    },
    [applyPortfolioResult],
  );

  const loadResume = useCallback(
    async (quiet: boolean) => {
      const requestId = ++resumeRequestIdRef.current;

      if (!quiet) {
        setResumeLoading(true);
      }

      const result = await getOwnProfessionalResume();

      if (
        requestId !== resumeRequestIdRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      setResumeLoading(false);
      applyResumeResult(result, quiet);
      resumeLoadedRef.current = true;
    },
    [applyResumeResult],
  );

  const loadProfile = useCallback(async (quiet: boolean) => {
    const requestId = ++requestIdRef.current;

    if (!quiet) {
      setLoading(true);
      setError(null);
    }

    const professionalRequestId =
      template === 'professional'
        ? ++professionalRequestIdRef.current
        : null;

    const backgroundRequestId =
      template === 'professional'
        ? ++backgroundRequestIdRef.current
        : null;

    const portfolioRequestId =
      template === 'professional'
        ? ++portfolioRequestIdRef.current
        : null;

    const resumeRequestId =
      template === 'professional'
        ? ++resumeRequestIdRef.current
        : null;

    const [
      identityResult,
      presentationResult,
      professionalResult,
      experienceResult,
      credentialResult,
      portfolioResult,
      resumeResult,
    ] = await Promise.all([
      getOwnProfile(),
      getOwnProfilePresentation(),
      template === 'professional'
        ? getOwnProfessionalProfile()
        : Promise.resolve(null),
      template === 'professional'
        ? getOwnProfessionalExperiences()
        : Promise.resolve(null),
      template === 'professional'
        ? getOwnProfessionalCredentials()
        : Promise.resolve(null),
      template === 'professional'
        ? getOwnProfessionalPortfolio()
        : Promise.resolve(null),
      template === 'professional'
        ? getOwnProfessionalResume()
        : Promise.resolve(null),
    ]);

    if (
      requestId !== requestIdRef.current ||
      !mountedRef.current
    ) {
      return;
    }

    setLoading(false);
    setRefreshing(false);

    if (identityResult.error || !identityResult.profile) {
      if (!quiet) {
        setProfile(null);
        setIdentityVerified(false);
        setError(
          identityResult.error ??
            'Your profile could not be loaded.',
        );
      }
      return;
    }

    setError(null);
    setProfile(identityResult.profile);
    if (presentationResult.error == null) {
      setSavedTemplate(
        presentationResult.presentation.activeTemplate,
      );
    }
    void loadReputation(identityResult.profile.id, !quiet);
    void loadIdentityVerified(identityResult.profile.id);

    if (template === 'professional') {
      void loadCompletedJobsCount(identityResult.profile.id);
    }

    if (
      professionalResult &&
      professionalRequestId ===
        professionalRequestIdRef.current
    ) {
      applyProfessionalResult(professionalResult, quiet);
      professionalLoadedRef.current = true;
    }

    if (
      experienceResult &&
      credentialResult &&
      backgroundRequestId === backgroundRequestIdRef.current
    ) {
      applyBackgroundResult(
        experienceResult,
        credentialResult,
        quiet,
      );
      backgroundLoadedRef.current = true;
    }

    if (
      portfolioResult &&
      portfolioRequestId === portfolioRequestIdRef.current
    ) {
      applyPortfolioResult(portfolioResult, quiet);
      portfolioLoadedRef.current = true;
    }

    if (
      resumeResult &&
      resumeRequestId === resumeRequestIdRef.current
    ) {
      applyResumeResult(resumeResult, quiet);
      resumeLoadedRef.current = true;
    }
  }, [
    applyBackgroundResult,
    applyPortfolioResult,
    applyProfessionalResult,
    applyResumeResult,
    loadCompletedJobsCount,
    loadIdentityVerified,
    loadReputation,
    template,
  ]);

  loadRef.current = loadProfile;
  loadProfessionalRef.current = loadProfessional;
  loadBackgroundRef.current = loadBackground;
  loadPortfolioRef.current = loadPortfolio;
  loadResumeRef.current = loadResume;

  useFocusEffect(
    useCallback(() => {
      hideTabBar();

      if (
        template === 'professional' &&
        professionalLoadedRef.current
      ) {
        void loadProfessionalRef.current(true);
      }

      if (
        template === 'professional' &&
        backgroundLoadedRef.current
      ) {
        void loadBackgroundRef.current(true);
      }

      if (
        template === 'professional' &&
        portfolioLoadedRef.current
      ) {
        void loadPortfolioRef.current(true);
      }

      if (
        template === 'professional' &&
        resumeLoadedRef.current
      ) {
        void loadResumeRef.current(true);
      }
    }, [hideTabBar, template]),
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

  async function applyTemplate(
    nextTemplate: 'personal' | 'professional',
  ) {
    if (switching || savedTemplate == null) {
      return;
    }

    setSwitching(true);

    const result = await setOwnActiveProfileTemplate(
      nextTemplate,
    );

    if (!mountedRef.current) {
      return;
    }

    setSwitching(false);

    if (result.error || !result.activeTemplate) {
      Alert.alert(
        'Profile style could not be updated',
        result.error ??
          'Your profile style could not be updated. Try again.',
      );
      return;
    }

    setSavedTemplate(result.activeTemplate);
  }

  function handleMakeProfessionalLive() {
    if (!presentationKnown || switching) {
      return;
    }

    Alert.alert(
      'Make Professional your public profile?',
      'Other people will see your Professional profile. Your Personal profile is not deleted. You can switch back anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Make live',
          onPress: () => {
            void applyTemplate('professional');
          },
        },
      ],
    );
  }

  function handleUsePersonal() {
    if (!presentationKnown || switching) {
      return;
    }

    void applyTemplate('personal');
  }

  const unavailable = template === 'business';
  const isProfessional = template === 'professional';
  const presentationKnown = savedTemplate != null;
  const professionalIsLive =
    savedTemplate === 'professional';
  const personalIsLive = savedTemplate === 'personal';
  const previewTitle = isProfessional
    ? professionalIsLive
      ? 'Professional'
      : 'Preview'
    : 'Personal preview';

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
          contentContainerStyle={
            isProfessional
              ? styles.scrollProfessional
              : styles.scroll
          }
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
              {presentationKnown ? (
                <View
                  style={styles.professionalNotice}
                  accessibilityRole="text"
                  accessibilityLabel={
                    professionalIsLive
                      ? 'Professional is live publicly.'
                      : 'Professional preview. Personal remains your live profile.'
                  }
                >
                  <Text style={styles.professionalNoticeText}>
                    {professionalIsLive
                      ? 'Professional is live publicly'
                      : 'Professional preview · Personal stays live'}
                  </Text>
                </View>
              ) : (
                <View
                  style={styles.professionalNotice}
                  accessibilityRole="text"
                  accessibilityLabel="Public style unavailable"
                >
                  <Text style={styles.professionalNoticeText}>
                    Public style unavailable
                  </Text>
                  <Pressable
                    onPress={() => {
                      void loadProfile(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Retry loading public style"
                    style={({ pressed }) => [
                      styles.inlineRetry,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.inlineRetryText}>
                      Retry
                    </Text>
                  </Pressable>
                </View>
              )}

              <ProfessionalProfileView
                mode="ownerPreview"
                professionalIsLive={professionalIsLive}
                profile={profile}
                professional={professional}
                professionalError={professionalError}
                onRetryProfessional={() => {
                  void loadProfessional(false);
                }}
                onEditProfessional={() => {
                  navigation.navigate(
                    'EditProfessionalProfile',
                  );
                }}
                experiences={experiences}
                credentials={credentials}
                backgroundLoading={backgroundLoading}
                backgroundError={backgroundError}
                onRetryBackground={() => {
                  void loadBackground(false);
                }}
                onEditBackground={() => {
                  navigation.navigate(
                    'EditProfessionalExperience',
                  );
                }}
                portfolioProjects={portfolioProjects}
                portfolioLoading={portfolioLoading}
                portfolioError={portfolioError}
                onRetryPortfolio={() => {
                  void loadPortfolio(false);
                }}
                onEditPortfolio={() => {
                  navigation.navigate(
                    'EditProfessionalPortfolio',
                  );
                }}
                resume={resume}
                resumeLoading={resumeLoading}
                resumeError={resumeError}
                resumeMutating={resumeMutating}
                onRetryResume={() => {
                  void loadResume(false);
                }}
                onAddResume={() => {
                  navigation.navigate('EditProfessionalResume');
                }}
                onViewResume={() => {
                  if (!resume) {
                    return;
                  }

                  navigation.navigate('ProfessionalResumeViewer', {
                    storagePath: resume.storagePath,
                    originalFilename: resume.originalFilename,
                  });
                }}
                onReplaceResume={() => {
                  navigation.navigate('EditProfessionalResume');
                }}
                onRemoveResume={() => {
                  if (!resume || resumeMutating) {
                    return;
                  }

                  Alert.alert(
                    'Remove this résumé?',
                    'It will be removed from your Professional preview.',
                    [
                      { text: 'Keep', style: 'cancel' },
                      {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => {
                          void (async () => {
                            setResumeMutating(true);
                            const removed =
                              await removeOwnProfessionalResume(
                                resume,
                              );
                            setResumeMutating(false);

                            if (removed.error) {
                              Alert.alert(
                                'Résumé could not be removed',
                                removed.error,
                              );
                              return;
                            }

                            setResume(null);

                            if (removed.cleanupWarning) {
                              Alert.alert(
                                'Résumé removed',
                                removed.cleanupWarning,
                              );
                            }
                          })();
                        },
                      },
                    ],
                  );
                }}
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
              />

              <View style={styles.currentWrap}>
                {presentationKnown && professionalIsLive ? (
                  <View
                    style={styles.currentButton}
                    accessibilityRole="text"
                    accessibilityLabel="Professional is your public profile."
                  >
                    <Text style={styles.currentButtonText}>
                      Live publicly
                    </Text>
                  </View>
                ) : (
                  <DGButton
                    title="Make Professional live"
                    fullWidth
                    loading={switching}
                    disabled={switching || !presentationKnown}
                    onPress={handleMakeProfessionalLive}
                    accessibilityLabel="Make Professional live"
                    accessibilityHint="Makes Professional the profile other people see"
                  />
                )}
              </View>
            </>
          ) : (
            <>
              {presentationKnown ? (
                <View
                  style={styles.banner}
                  accessibilityRole="text"
                  accessibilityLabel={
                    personalIsLive
                      ? 'Preview. Personal style. This is what other people see.'
                      : 'Preview. Personal style. Professional is currently live publicly.'
                  }
                >
                  <Text style={styles.bannerKicker}>
                    {personalIsLive ? 'CURRENT' : 'PREVIEW'}
                  </Text>
                  <Text style={styles.bannerTitle}>
                    Personal style
                  </Text>
                  <Text style={styles.bannerBody}>
                    {personalIsLive
                      ? 'This is what other people see. Your Personal profile is live.'
                      : 'This is what other people would see if you switch back to Personal. Professional is currently live.'}
                  </Text>
                </View>
              ) : (
                <View
                  style={styles.banner}
                  accessibilityRole="text"
                  accessibilityLabel="Public style unavailable"
                >
                  <Text style={styles.bannerTitle}>
                    Public style unavailable
                  </Text>
                  <Pressable
                    onPress={() => {
                      void loadProfile(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Retry loading public style"
                    style={({ pressed }) => [
                      styles.inlineRetry,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.inlineRetryText}>
                      Retry
                    </Text>
                  </Pressable>
                </View>
              )}

              <PersonalProfileHero
                identity={presentProfileHeroIdentity(profile)}
                mode="public"
                identityVerified={identityVerified}
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
                {presentationKnown && personalIsLive ? (
                  <View
                    style={styles.currentButton}
                    accessibilityRole="text"
                    accessibilityLabel="Personal is your public profile."
                  >
                    <Text style={styles.currentButtonText}>
                      Current style
                    </Text>
                  </View>
                ) : (
                  <DGButton
                    title="Use Personal"
                    fullWidth
                    loading={switching}
                    disabled={switching || !presentationKnown}
                    onPress={handleUsePersonal}
                    accessibilityLabel="Use Personal"
                    accessibilityHint="Makes Personal the profile other people see"
                  />
                )}
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

  scrollProfessional: {
    paddingBottom: spacing.massive,
    gap: 0,
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
    marginTop: 0,
    marginBottom: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: alpha.green12,
    backgroundColor: alpha.green04,
    gap: 2,
  },

  professionalNoticeText: {
    color: textColor.secondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  inlineRetry: {
    alignSelf: 'flex-start',
    minHeight: 32,
    justifyContent: 'center',
  },

  inlineRetryText: {
    color: palette.opportunityGreen,
    fontSize: 13,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.8,
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
