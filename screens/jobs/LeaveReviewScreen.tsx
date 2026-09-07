import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGButton from '../../components/DGButton';
import DGHeader from '../../components/DGHeader';
import DGInput from '../../components/DGInput';
import DGSkeleton from '../../components/DGSkeleton';
import ResolvedProfileAvatar from '../../components/profile/ResolvedProfileAvatar';
import StarRatingInput from '../../components/reviews/StarRatingInput';

import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import type { JobsFlowParamList } from '../../navigation/jobsFlow';

import { sanitiseReviewBody } from '../../services/reviews/reviewAdapter';
import {
  getOpenJobReviewEligibility,
  submitReview,
} from '../../services/reviews/reviewRepository';
import { getProfileById } from '../../services/profile/profileRepository';

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
import type { ReviewEligibility } from '../../types/reviews';
import { REVIEW_BODY_MAX } from '../../types/reviews';

type Props = NativeStackScreenProps<
  JobsFlowParamList,
  'LeaveReview'
>;

export default function LeaveReviewScreen({
  navigation,
  route,
}: Props) {
  const {
    hideTabBar,
    showTabBar,
  } = useTabBarVisibility();

  const jobId = route.params.jobId;
  const mountedRef = useRef(true);
  const submittingRef = useRef(false);
  const loadRequestIdRef = useRef(0);

  const [
    eligibility,
    setEligibility,
  ] =
    useState<ReviewEligibility | null>(null);
  const [
    reviewee,
    setReviewee,
  ] =
    useState<DirectGainProfile | null>(null);
  const [
    loading,
    setLoading,
  ] =
    useState(true);
  const [
    loadError,
    setLoadError,
  ] =
    useState<string | null>(null);
  const [
    rating,
    setRating,
  ] =
    useState<number | null>(null);
  const [
    body,
    setBody,
  ] =
    useState('');
  const [
    fieldError,
    setFieldError,
  ] =
    useState<string | null>(null);
  const [
    submitError,
    setSubmitError,
  ] =
    useState<string | null>(null);
  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);
  const [
    posted,
    setPosted,
  ] =
    useState(false);

  const loadOpportunity = useCallback(
    async () => {
      const requestId = ++loadRequestIdRef.current;
      setLoading(true);
      setLoadError(null);

      const result = await getOpenJobReviewEligibility(jobId);

      if (
        requestId !== loadRequestIdRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      if (result.error) {
        setEligibility(null);
        setReviewee(null);
        setLoading(false);
        setLoadError(result.error);
        return;
      }

      if (!result.eligibility) {
        setEligibility(null);
        setReviewee(null);
        setLoading(false);
        setLoadError(
          'This review is no longer available.',
        );
        return;
      }

      const profileResult = await getProfileById(
        result.eligibility.revieweeId,
      );

      if (
        requestId !== loadRequestIdRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      setEligibility(result.eligibility);
      setReviewee(profileResult.profile);
      setLoading(false);

      if (profileResult.error && !profileResult.profile) {
        setLoadError(null);
      }
    },
    [jobId],
  );

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
    void loadOpportunity();

    const unsubscribe = navigation.addListener(
      'beforeRemove',
      (event) => {
        if (!submittingRef.current) {
          return;
        }

        event.preventDefault();
      },
    );

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [loadOpportunity, navigation]);

  async function handleSubmit() {
    if (
      submittingRef.current ||
      posted ||
      !eligibility
    ) {
      return;
    }

    Keyboard.dismiss();

    if (rating == null) {
      setFieldError(null);
      setSubmitError('Choose a rating from 1 to 5.');
      return;
    }

    const sanitised = sanitiseReviewBody(body);

    if (!sanitised.ok) {
      setFieldError(sanitised.error);
      setSubmitError(null);
      return;
    }

    submittingRef.current = true;
    navigation.setOptions({
      gestureEnabled: false,
    });
    setSubmitting(true);
    setFieldError(null);
    setSubmitError(null);

    const result = await submitReview({
      eligibilityId: eligibility.id,
      rating,
      body: sanitised.body,
    });

    if (!mountedRef.current) {
      return;
    }

    if (result.error || !result.reviewId) {
      submittingRef.current = false;
      navigation.setOptions({
        gestureEnabled: true,
      });
      setSubmitting(false);
      setSubmitError(
        result.error ??
          'Your review could not be saved. Try again.',
      );
      return;
    }

    submittingRef.current = false;
    navigation.setOptions({
      gestureEnabled: true,
    });
    setSubmitting(false);
    setPosted(true);

    const refreshed = await getOpenJobReviewEligibility(jobId);

    if (!mountedRef.current) {
      return;
    }

    if (!refreshed.error) {
      setEligibility(refreshed.eligibility);
    }
  }

  function goBackToJob() {
    if (submittingRef.current) {
      return;
    }

    navigation.goBack();
  }

  const bodyLength = body.trim().length;
  const revieweeName =
    reviewee?.displayName ?? 'Direct Gain member';
  const canSubmit =
    rating != null &&
    !submitting &&
    !posted &&
    Boolean(eligibility);

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <DGHeader
        showBackButton
        title="Leave a review"
        onBackPress={goBackToJob}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        {loading ? (
          <View style={styles.loading}>
            <DGSkeleton width="42%" height={14} />
            <DGSkeleton
              width="70%"
              height={14}
              style={styles.skeleton}
            />
            <DGSkeleton
              width="100%"
              height={72}
              style={styles.skeleton}
            />
          </View>
        ) : loadError && !eligibility ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorTitle}>
              Review unavailable
            </Text>
            <Text style={styles.errorBody}>
              {loadError}
            </Text>
            <DGButton
              title="Retry"
              variant="secondary"
              fullWidth
              onPress={() => {
                void loadOpportunity();
              }}
              accessibilityLabel="Retry loading review"
            />
            <DGButton
              title="Back to job"
              variant="ghost"
              fullWidth
              onPress={goBackToJob}
              accessibilityLabel="Back to job"
            />
          </View>
        ) : posted ? (
          <View style={styles.successWrap}>
            <View style={styles.successCard}>
              <Text style={styles.successTitle}>
                Review posted
              </Text>
              <Text style={styles.successBody}>
                Thanks for helping build trust on Direct Gain.
              </Text>
            </View>
            <DGButton
              title="Done"
              fullWidth
              onPress={goBackToJob}
              accessibilityLabel="Done"
              accessibilityHint="Returns to the completed job"
            />
          </View>
        ) : (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.identityCard}>
              <ResolvedProfileAvatar
                displayName={revieweeName}
                avatarPath={reviewee?.avatarPath}
                size="lg"
              />
              <View style={styles.identityCopy}>
                <Text
                  style={styles.revieweeName}
                  numberOfLines={2}
                >
                  {revieweeName}
                </Text>
                <Text style={styles.context}>
                  Completed job work
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                How was your experience?
              </Text>
              <StarRatingInput
                value={rating}
                disabled={submitting}
                onChange={(next) => {
                  setRating(next);
                  setSubmitError(null);
                }}
              />
            </View>

            <DGInput
              label="Written review"
              value={body}
              onChangeText={(value) => {
                setBody(value);
                setFieldError(null);
              }}
              placeholder="Optional. Share what went well or what could improve."
              maxLength={REVIEW_BODY_MAX}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!submitting}
              errorMessage={fieldError ?? undefined}
              helperText={
                fieldError
                  ? undefined
                  : `Optional · ${bodyLength}/${REVIEW_BODY_MAX}`
              }
              autoCapitalize="sentences"
              inputContainerStyle={styles.messageInput}
              inputStyle={styles.messageField}
            />

            <Text style={styles.trustCopy}>
              Reviews help build trust across Direct Gain. You can edit your review for 72 hours after posting.
            </Text>

            {submitError ? (
              <Text style={styles.formError}>
                {submitError}
              </Text>
            ) : null}

            <DGButton
              title={
                submitting
                  ? 'Submitting…'
                  : 'Submit review'
              }
              fullWidth
              loading={submitting}
              disabled={!canSubmit}
              onPress={() => {
                void handleSubmit();
              }}
              accessibilityLabel="Submit review"
            />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#080B09',
  },

  flex: {
    flex: 1,
  },

  loading: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  skeleton: {
    marginTop: spacing.sm,
  },

  errorWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },

  errorTitle: {
    color: textColor.primary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },

  errorBody: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },

  successWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },

  successCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.green20,
    backgroundColor: alpha.green06,
    gap: spacing.sm,
  },

  successTitle: {
    color: palette.opportunityGreen,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },

  successBody: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.massive,
    gap: spacing.md,
  },

  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
  },

  identityCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },

  revieweeName: {
    color: textColor.primary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },

  context: {
    ...typography.eyebrow,
    color: textColor.muted,
  },

  section: {
    gap: spacing.sm,
  },

  sectionTitle: {
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },

  messageInput: {
    minHeight: 132,
    alignItems: 'flex-start',
  },

  messageField: {
    minHeight: 120,
  },

  trustCopy: {
    color: textColor.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },

  formError: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
});
