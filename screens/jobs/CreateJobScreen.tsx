import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
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
import DGChip from '../../components/DGChip';
import DGHeader from '../../components/DGHeader';
import DGInput from '../../components/DGInput';
import CreateJobPhotos from '../../components/jobs/CreateJobPhotos';

import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import type { CreateStackParamList } from '../../navigation/CreateStack';

import {
  formatJobCategory,
  formatJobType,
  formatWorkSite,
} from '../../services/jobs/jobAdapter';
import { attachJobPhotos } from '../../services/jobs/jobMediaRepository';
import {
  createOpenJob,
  getViewerJobRegion,
} from '../../services/jobs/jobRepository';
import { pickAndPrepareJobPhotos } from '../../services/jobs/pickJobPhotos';

import {
  alpha,
  palette,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

import {
  JOB_CATEGORIES,
  JOB_PAY_TYPES,
  JOB_TYPES,
  JOB_WORK_SITES,
  MAX_JOB_PHOTOS,
  type JobCategory,
  type JobPayType,
  type JobType,
  type JobWorkSite,
  type PendingJobPhoto,
} from '../../types/jobs';

type Props = NativeStackScreenProps<
  CreateStackParamList,
  'CreateJob'
>;

type FormErrors = {
  title?: string;
  description?: string;
  category?: string;
  jobType?: string;
  payType?: string;
  payAmount?: string;
  suburb?: string;
  state?: string;
  form?: string;
};

const MAX_PAY_AMOUNT = 9_999_999_999.99;

function payAmountHint(
  payType: JobPayType,
): string {
  if (payType === 'hourly') {
    return 'Per hour';
  }

  if (payType === 'daily') {
    return 'Per day';
  }

  if (payType === 'fixed') {
    return 'Total for the job';
  }

  return 'Annual salary';
}

function sanitizePayAmountInput(
  value: string,
): string {
  const stripped = value.replace(
    /[$,\s]/g,
    '',
  );
  const match = stripped.match(
    /^\d*(?:\.\d{0,2})?/,
  );

  return match?.[0] ?? '';
}

function payTypeLabel(
  payType: JobPayType,
): string {
  if (payType === 'hourly') {
    return 'Hourly';
  }

  if (payType === 'daily') {
    return 'Daily';
  }

  if (payType === 'fixed') {
    return 'Fixed';
  }

  if (payType === 'salary') {
    return 'Salary';
  }

  return 'Negotiable';
}

function parsePayAmount(
  value: string,
):
  | { ok: true; amount: number }
  | { ok: false; error: string } {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      ok: false,
      error: 'Enter a pay amount.',
    };
  }

  if (
    !/^\d+(\.\d{1,2})?$/.test(trimmed)
  ) {
    return {
      ok: false,
      error:
        'Enter a valid amount with up to two decimal places.',
    };
  }

  const amount = Number(trimmed);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return {
      ok: false,
      error:
        'Pay amount must be greater than 0.',
    };
  }

  if (amount > MAX_PAY_AMOUNT) {
    return {
      ok: false,
      error:
        'Pay amount is too large.',
    };
  }

  return {
    ok: true,
    amount: Number(amount.toFixed(2)),
  };
}

export default function CreateJobScreen({
  navigation,
}: Props) {
  const {
    hideTabBar,
    showTabBar,
  } = useTabBarVisibility();

  const mountedRef = useRef(true);
  const submittingRef = useRef(false);
  const allowLeaveAfterSubmitRef = useRef(false);

  const [
    title,
    setTitle,
  ] = useState('');

  const [
    description,
    setDescription,
  ] = useState('');

  const [
    category,
    setCategory,
  ] = useState<JobCategory | null>(
    null,
  );

  const [
    jobType,
    setJobType,
  ] = useState<JobType | null>(null);

  const [
    payType,
    setPayType,
  ] = useState<JobPayType | null>(
    null,
  );

  const [
    payAmountText,
    setPayAmountText,
  ] = useState('');

  const [
    suburb,
    setSuburb,
  ] = useState('');

  const [
    state,
    setState,
  ] = useState('');

  const [
    workSite,
    setWorkSite,
  ] = useState<JobWorkSite | null>(
    null,
  );

  const [
    errors,
    setErrors,
  ] = useState<FormErrors>({});

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    photos,
    setPhotos,
  ] = useState<PendingJobPhoto[]>([]);

  const [
    preparingPhotos,
    setPreparingPhotos,
  ] = useState(false);

  const [
    submitProgress,
    setSubmitProgress,
  ] = useState('Publish job');

  const photosRef = useRef<PendingJobPhoto[]>(
    [],
  );

  photosRef.current = photos;

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

    async function loadRegion() {
      const region =
        await getViewerJobRegion();

      if (!mountedRef.current) {
        return;
      }

      if (region.suburb) {
        setSuburb((current) =>
          current.trim()
            ? current
            : region.suburb ?? '',
        );
      }

      if (region.state) {
        setState((current) =>
          current.trim()
            ? current
            : region.state ?? '',
        );
      }
    }

    void loadRegion();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      'beforeRemove',
      (event) => {
        if (allowLeaveAfterSubmitRef.current) {
          return;
        }

        if (!submittingRef.current) {
          return;
        }

        event.preventDefault();
      },
    );

    return unsubscribe;
  }, [navigation]);

  function validate():
    | FormErrors
    | null {
    const next: FormErrors = {};
    const trimmedTitle = title.trim();
    const trimmedDescription =
      description.trim();
    const trimmedSuburb =
      suburb.trim();
    const trimmedState = state.trim();

    if (
      trimmedTitle.length < 3 ||
      trimmedTitle.length > 80
    ) {
      next.title =
        'Title must be between 3 and 80 characters.';
    }

    if (
      trimmedDescription.length < 10 ||
      trimmedDescription.length > 4000
    ) {
      next.description =
        'Description must be between 10 and 4,000 characters.';
    }

    if (!category) {
      next.category =
        'Choose a category.';
    }

    if (!jobType) {
      next.jobType =
        'Choose a job type.';
    }

    if (!payType) {
      next.payType =
        'Choose a pay type.';
    } else if (
      payType !== 'negotiable'
    ) {
      const parsed = parsePayAmount(
        payAmountText,
      );

      if (!parsed.ok) {
        next.payAmount = parsed.error;
      }
    }

    if (
      trimmedSuburb.length < 1 ||
      trimmedSuburb.length > 60
    ) {
      next.suburb =
        'Suburb must be between 1 and 60 characters.';
    }

    if (
      trimmedState.length < 1 ||
      trimmedState.length > 40
    ) {
      next.state =
        'State must be between 1 and 40 characters.';
    }

    return Object.keys(next).length > 0
      ? next
      : null;
  }

  function movePhoto(
    localId: string,
    direction: -1 | 1,
  ) {
    if (submittingRef.current) {
      return;
    }

    setPhotos((current) => {
      const index = current.findIndex(
        (photo) => photo.localId === localId,
      );

      const nextIndex = index + direction;

      if (
        index < 0 ||
        nextIndex < 0 ||
        nextIndex >= current.length
      ) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(nextIndex, 0, moved);
      return next;
    });
  }

  async function handleAddPhotos() {
    if (
      submittingRef.current ||
      preparingPhotos ||
      photos.length >= MAX_JOB_PHOTOS
    ) {
      return;
    }

    setPreparingPhotos(true);

    const result = await pickAndPrepareJobPhotos(
      MAX_JOB_PHOTOS - photos.length,
    );

    if (!mountedRef.current) {
      return;
    }

    setPreparingPhotos(false);

    if (result.kind === 'permission_denied') {
      Alert.alert(
        'Photo access needed',
        'Direct Gain needs access to your photo library so you can add pictures to a job. You can still post the job without photos.',
      );
      return;
    }

    if (result.kind === 'unavailable') {
      Alert.alert(
        'Unable to add photos',
        result.message,
      );
      return;
    }

    if (result.kind === 'cancelled') {
      return;
    }

    if (result.photos.length > 0) {
      setPhotos((current) =>
        [...current, ...result.photos].slice(
          0,
          MAX_JOB_PHOTOS,
        ),
      );
    }

    if (result.failedCount > 0) {
      Alert.alert(
        'Some photos could not be added',
        result.failedCount === 1
          ? 'One selected photo could not be prepared. You can try a different image.'
          : `${result.failedCount} selected photos could not be prepared. You can try different images.`,
      );
    }
  }

  async function handlePublish() {
    if (submittingRef.current) {
      return;
    }

    Keyboard.dismiss();

    const nextErrors = validate();

    if (nextErrors) {
      setErrors(nextErrors);
      return;
    }

    if (
      !category ||
      !jobType ||
      !payType
    ) {
      return;
    }

    if (preparingPhotos) {
      return;
    }

    submittingRef.current = true;
    navigation.setOptions({
      gestureEnabled: false,
    });
    setSubmitting(true);
    setSubmitProgress('Posting job…');
    setErrors({});

    const parsedPay =
      payType === 'negotiable'
        ? null
        : parsePayAmount(payAmountText);

    if (
      parsedPay &&
      parsedPay.ok === false
    ) {
      submittingRef.current = false;
      navigation.setOptions({
        gestureEnabled: true,
      });

      if (mountedRef.current) {
        setSubmitting(false);
        setSubmitProgress('Publish job');
        setErrors({
          payAmount: parsedPay.error,
        });
      }

      return;
    }

    const result = await createOpenJob({
      title,
      description,
      category,
      jobType,
      payType,
      payAmount:
        parsedPay && parsedPay.ok
          ? parsedPay.amount
          : null,
      suburb,
      state,
      workSite,
    });

    if (result.error || !result.job) {
      submittingRef.current = false;
      navigation.setOptions({
        gestureEnabled: true,
      });

      if (mountedRef.current) {
        setSubmitting(false);
        setSubmitProgress('Publish job');
        setErrors({
          form:
            result.error ??
            'This job could not be published. Try again.',
        });
      }

      return;
    }

    const jobId = result.job.id;
    const photosToUpload = photosRef.current.slice(
      0,
      MAX_JOB_PHOTOS,
    );

    let attachResult: Awaited<
      ReturnType<typeof attachJobPhotos>
    > = { status: 'skipped' };

    if (photosToUpload.length > 0) {
      if (mountedRef.current) {
        setSubmitProgress(
          `Uploading photo 1 of ${photosToUpload.length}…`,
        );
      }

      attachResult = await attachJobPhotos(
        jobId,
        photosToUpload,
        (progress) => {
          if (mountedRef.current) {
            setSubmitProgress(
              `Uploading photo ${progress.current} of ${progress.total}…`,
            );
          }
        },
      );
    }

    function openCreatedJob() {
      allowLeaveAfterSubmitRef.current = true;

      const parent = navigation.getParent();

      parent?.navigate('Discover', {
        screen: 'DiscoverJobs',
      });

      parent?.navigate('Discover', {
        screen: 'JobDetail',
        params: {
          jobId,
        },
      });

      navigation.popToTop();
    }

    if (!mountedRef.current) {
      return;
    }

    if (
      attachResult.status === 'partial_failure' ||
      attachResult.status === 'complete_failure'
    ) {
      Alert.alert(
        'Job posted',
        attachResult.message,
        [
          {
            text: 'OK',
            onPress: openCreatedJob,
          },
        ],
      );
      return;
    }

    openCreatedJob();
  }

  const descriptionLength =
    description.trim().length;

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <DGHeader
        showBackButton
        title="Post a Job"
        onBackPress={() => {
          if (submittingRef.current) {
            return;
          }

          navigation.goBack();
        }}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
          <Text style={styles.intro}>
            Tell people what work you need done.
          </Text>

          <DGInput
            label="Job title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Garden maintenance and clean up"
            maxLength={80}
            editable={!submitting}
            errorMessage={errors.title}
            autoCapitalize="sentences"
          />

          <DGInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="What needs doing, any requirements, and useful context"
            maxLength={4000}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            editable={!submitting}
            errorMessage={
              errors.description
            }
            helperText={
              errors.description
                ? undefined
                : `${descriptionLength}/4000`
            }
            autoCapitalize="sentences"
            inputContainerStyle={
              styles.descriptionInput
            }
            inputStyle={
              styles.descriptionField
            }
          />

          <CreateJobPhotos
            photos={photos}
            disabled={submitting || preparingPhotos}
            preparing={preparingPhotos}
            onAdd={() => {
              void handleAddPhotos();
            }}
            onRemove={(localId) => {
              if (submittingRef.current) {
                return;
              }

              setPhotos((current) =>
                current.filter(
                  (photo) => photo.localId !== localId,
                ),
              );
            }}
            onMoveLeft={(localId) => {
              movePhoto(localId, -1);
            }}
            onMoveRight={(localId) => {
              movePhoto(localId, 1);
            }}
          />

          <Text style={styles.section}>
            Category
          </Text>

          <View style={styles.chipWrap}>
            {JOB_CATEGORIES.map(
              (value) => (
                <DGChip
                  key={value}
                  size="compact"
                  label={formatJobCategory(
                    value,
                  )}
                  selected={
                    category === value
                  }
                  disabled={submitting}
                  onPress={() => {
                    setCategory(value);
                  }}
                  style={styles.chip}
                />
              ),
            )}
          </View>

          {errors.category ? (
            <Text style={styles.error}>
              {errors.category}
            </Text>
          ) : null}

          <Text style={styles.section}>
            Job type
          </Text>

          <View style={styles.chipWrap}>
            {JOB_TYPES.map((value) => (
              <DGChip
                key={value}
                size="compact"
                label={formatJobType(
                  value,
                )}
                selected={
                  jobType === value
                }
                disabled={submitting}
                onPress={() => {
                  setJobType(value);
                }}
                style={styles.chip}
              />
            ))}
          </View>

          {errors.jobType ? (
            <Text style={styles.error}>
              {errors.jobType}
            </Text>
          ) : null}

          <Text style={styles.section}>
            Pay
          </Text>

          <View style={styles.chipWrap}>
            {JOB_PAY_TYPES.map(
              (value) => (
                <DGChip
                  key={value}
                  size="compact"
                  label={payTypeLabel(
                    value,
                  )}
                  selected={
                    payType === value
                  }
                  disabled={submitting}
                  onPress={() => {
                    setPayType(value);
                    setErrors(
                      (current) => {
                        const next = {
                          ...current,
                        };
                        delete next.payType;
                        delete next.payAmount;
                        return next;
                      },
                    );
                  }}
                  style={styles.chip}
                />
              ),
            )}
          </View>

          {errors.payType ? (
            <Text style={styles.error}>
              {errors.payType}
            </Text>
          ) : null}

          <View style={styles.payAmountBlock}>
            {payType === 'negotiable' ? (
              <View style={styles.negotiableCard}>
                <Text style={styles.negotiableTitle}>
                  Pay negotiable
                </Text>
                <Text style={styles.negotiableBody}>
                  Pay can be discussed with applicants.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.payAmountLabel}>
                  Pay amount
                </Text>
                <View style={styles.payAmountRow}>
                  <View
                    style={[
                      styles.currencyPrefix,
                      !payType &&
                        styles.currencyPrefixDisabled,
                      errors.payAmount
                        ? styles.currencyPrefixError
                        : null,
                    ]}
                    accessibilityElementsHidden
                  >
                    <Text
                      style={[
                        styles.currencySymbol,
                        !payType &&
                          styles.currencySymbolDisabled,
                      ]}
                    >
                      $
                    </Text>
                  </View>
                  <View style={styles.payAmountInputWrap}>
                    {payType ? (
                      <DGInput
                        value={payAmountText}
                        onChangeText={(
                          value,
                        ) => {
                          setPayAmountText(
                            sanitizePayAmountInput(
                              value,
                            ),
                          );
                        }}
                        placeholder="0"
                        helperText={
                          errors.payAmount
                            ? undefined
                            : payAmountHint(
                                payType,
                              )
                        }
                        errorMessage={
                          errors.payAmount
                        }
                        keyboardType="decimal-pad"
                        editable={
                          !submitting
                        }
                      />
                    ) : (
                      <View
                        style={
                          styles.payAmountDisabledField
                        }
                        accessibilityState={{
                          disabled: true,
                        }}
                        accessibilityLabel="Pay amount. Choose a pay type first."
                      >
                        <Text
                          style={
                            styles.payAmountDisabledText
                          }
                        >
                          Choose a pay type first
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </>
            )}
          </View>

          <Text style={styles.section}>
            Location
          </Text>

          <Text style={styles.locationHint}>
            Suburb and state shown on the job.
          </Text>

          <DGInput
            label="Suburb"
            value={suburb}
            onChangeText={setSuburb}
            placeholder="Suburb"
            maxLength={60}
            editable={!submitting}
            errorMessage={errors.suburb}
            autoCapitalize="words"
          />

          <DGInput
            label="State"
            value={state}
            onChangeText={setState}
            placeholder="e.g. QLD"
            maxLength={40}
            editable={!submitting}
            errorMessage={errors.state}
            autoCapitalize="characters"
            autoCorrect={false}
            containerStyle={
              styles.fieldGap
            }
          />

          <Text style={styles.section}>
            Work site
          </Text>

          <Text style={styles.optional}>
            Optional
          </Text>

          <View style={styles.chipWrap}>
            <DGChip
              size="compact"
              label="Not specified"
              selected={workSite === null}
              disabled={submitting}
              onPress={() => {
                setWorkSite(null);
              }}
              style={styles.chip}
            />

            {JOB_WORK_SITES.map(
              (value) => (
                <DGChip
                  key={value}
                  size="compact"
                  label={
                    formatWorkSite(
                      value,
                    ) ?? value
                  }
                  selected={
                    workSite === value
                  }
                  disabled={submitting}
                  onPress={() => {
                    setWorkSite(value);
                  }}
                  style={styles.chip}
                />
              ),
            )}
          </View>

          {errors.form ? (
            <Text style={styles.formError}>
              {errors.form}
            </Text>
          ) : null}

          <DGButton
            title={
              submitting
                ? submitProgress
                : 'Publish job'
            }
            fullWidth
            loading={submitting}
            disabled={submitting || preparingPhotos}
            onPress={() => {
              void handlePublish();
            }}
            style={styles.submit}
            accessibilityLabel={
              submitting
                ? submitProgress
                : 'Publish job'
            }
          />
          </View>
        </ScrollView>
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

  scrollContent: {
    flexGrow: 1,
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.massive,
    gap: spacing.sm,
  },

  intro: {
    marginBottom: spacing.xs,
    color: textColor.secondary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },

  section: {
    ...typography.eyebrow,
    marginTop: spacing.xs,
    color: textColor.muted,
  },

  optional: {
    marginTop: -spacing.xxs,
    color: textColor.muted,
    fontSize: 12,
    fontWeight: '600',
  },

  locationHint: {
    marginTop: -spacing.xxs,
    color: textColor.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },

  chip: {
    marginRight: 0,
  },

  descriptionInput: {
    minHeight: 132,
    alignItems: 'flex-start',
  },

  descriptionField: {
    minHeight: 120,
  },

  payAmountBlock: {
    marginTop: spacing.xs,
    gap: 8,
  },

  payAmountLabel: {
    color: textColor.primary,
    fontSize: 14,
    fontWeight: '800',
  },

  payAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  currencyPrefix: {
    minHeight: 52,
    minWidth: 52,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },

  currencyPrefixError: {
    borderColor: '#E5484D',
  },

  currencyPrefixDisabled: {
    backgroundColor: surface.page,
  },

  currencySymbol: {
    color: palette.opportunityGreen,
    fontSize: 20,
    fontWeight: '800',
  },

  currencySymbolDisabled: {
    color: textColor.muted,
  },

  payAmountInputWrap: {
    flex: 1,
    minWidth: 0,
  },

  payAmountDisabledField: {
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.page,
    justifyContent: 'center',
  },

  payAmountDisabledText: {
    color: textColor.muted,
    fontSize: 15,
    fontWeight: '600',
  },

  negotiableCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: alpha.white03,
    gap: 4,
  },

  negotiableTitle: {
    color: textColor.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },

  negotiableBody: {
    color: textColor.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  fieldGap: {
    marginTop: spacing.xxs,
  },

  error: {
    color: '#E5484D',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },

  formError: {
    color: '#E5484D',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },

  submit: {
    marginTop: spacing.xl,
  },
});
