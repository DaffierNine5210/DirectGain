import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
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
  Pressable,
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

import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import type { MyGainStackParamList } from '../../navigation/MyGainStack';

import {
  formatProfessionalAvailabilityLabel,
  formatProfessionalWorkPreferenceLabel,
  sanitiseOwnProfessionalProfileInput,
} from '../../services/profile/professionalProfileAdapter';
import {
  getOwnProfessionalProfile,
  saveOwnProfessionalProfile,
} from '../../services/profile/professionalProfileRepository';

import {
  alpha,
  iconSize,
  palette,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

import type {
  ProfessionalAvailability,
  ProfessionalWorkPreference,
} from '../../types/professionalProfile';
import {
  PROFESSIONAL_ABOUT_MAX,
  PROFESSIONAL_AVAILABILITIES,
  PROFESSIONAL_HEADLINE_MAX,
  PROFESSIONAL_SERVICE_AREA_MAX,
  PROFESSIONAL_SKILL_NAME_MAX,
  PROFESSIONAL_SKILLS_MAX,
  PROFESSIONAL_WORK_PREFERENCES,
} from '../../types/professionalProfile';

type Props = NativeStackScreenProps<
  MyGainStackParamList,
  'EditProfessionalProfile'
>;

type FormSnapshot = {
  headline: string;
  about: string;
  availability: ProfessionalAvailability | null;
  serviceArea: string;
  workPreference: ProfessionalWorkPreference | null;
  skills: string[];
};

const EMPTY_SNAPSHOT: FormSnapshot = {
  headline: '',
  about: '',
  availability: null,
  serviceArea: '',
  workPreference: null,
  skills: [],
};

function snapshotsEqual(
  left: FormSnapshot,
  right: FormSnapshot,
): boolean {
  if (
    left.headline !== right.headline ||
    left.about !== right.about ||
    left.availability !== right.availability ||
    left.serviceArea !== right.serviceArea ||
    left.workPreference !== right.workPreference ||
    left.skills.length !== right.skills.length
  ) {
    return false;
  }

  return left.skills.every(
    (skill, index) => skill === right.skills[index],
  );
}

export default function EditProfessionalProfileScreen({
  navigation,
}: Props) {
  const { hideTabBar } = useTabBarVisibility();

  const mountedRef = useRef(true);
  const savingRef = useRef(false);
  const allowLeaveRef = useRef(false);
  const dirtyRef = useRef(false);

  const [headline, setHeadline] = useState('');
  const [about, setAbout] = useState('');
  const [availability, setAvailability] =
    useState<ProfessionalAvailability | null>(null);
  const [serviceArea, setServiceArea] = useState('');
  const [workPreference, setWorkPreference] =
    useState<ProfessionalWorkPreference | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillDraft, setSkillDraft] = useState('');
  const [savedSnapshot, setSavedSnapshot] =
    useState<FormSnapshot>(EMPTY_SNAPSHOT);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(
    null,
  );
  const [saveError, setSaveError] = useState<string | null>(
    null,
  );
  const [headlineError, setHeadlineError] = useState<
    string | null
  >(null);
  const [aboutError, setAboutError] = useState<string | null>(
    null,
  );
  const [serviceAreaError, setServiceAreaError] = useState<
    string | null
  >(null);
  const [skillError, setSkillError] = useState<string | null>(
    null,
  );

  const currentSnapshot: FormSnapshot = {
    headline,
    about,
    availability,
    serviceArea,
    workPreference,
    skills,
  };

  dirtyRef.current = !snapshotsEqual(
    currentSnapshot,
    savedSnapshot,
  );

  useFocusEffect(
    useCallback(() => {
      hideTabBar();
    }, [hideTabBar]),
  );

  const applySnapshot = useCallback((snapshot: FormSnapshot) => {
    setHeadline(snapshot.headline);
    setAbout(snapshot.about);
    setAvailability(snapshot.availability);
    setServiceArea(snapshot.serviceArea);
    setWorkPreference(snapshot.workPreference);
    setSkills(snapshot.skills);
    setSkillDraft('');
    setSavedSnapshot(snapshot);
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setSaveError(null);

    const result = await getOwnProfessionalProfile();

    if (!mountedRef.current) {
      return;
    }

    setLoading(false);

    if (result.error) {
      setLoadError(result.error);
      return;
    }

    const next: FormSnapshot = result.profile
      ? {
          headline: result.profile.headline ?? '',
          about: result.profile.about ?? '',
          availability: result.profile.availability,
          serviceArea: result.profile.serviceArea ?? '',
          workPreference: result.profile.workPreference,
          skills: result.profile.skills.map(skill => skill.name),
        }
      : EMPTY_SNAPSHOT;

    applySnapshot(next);
  }, [applySnapshot]);

  useEffect(() => {
    mountedRef.current = true;
    void loadProfile();

    const unsubscribe = navigation.addListener(
      'beforeRemove',
      (event) => {
        if (allowLeaveRef.current) {
          return;
        }

        if (savingRef.current) {
          event.preventDefault();
          return;
        }

        if (!dirtyRef.current) {
          return;
        }

        event.preventDefault();

        Alert.alert(
          'Discard unsaved changes?',
          'Your Professional profile edits have not been saved.',
          [
            {
              text: 'Keep editing',
              style: 'cancel',
            },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => {
                allowLeaveRef.current = true;
                navigation.dispatch(event.data.action);
              },
            },
          ],
        );
      },
    );

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [loadProfile, navigation]);

  function clearFieldErrors() {
    setHeadlineError(null);
    setAboutError(null);
    setServiceAreaError(null);
    setSkillError(null);
    setSaveError(null);
  }

  function addSkill() {
    const name = skillDraft.trim();

    if (!name) {
      setSkillError(null);
      setSkillDraft('');
      return;
    }

    if (name.length > PROFESSIONAL_SKILL_NAME_MAX) {
      setSkillError(
        'Each skill must be 50 characters or fewer.',
      );
      return;
    }

    if (skills.length >= PROFESSIONAL_SKILLS_MAX) {
      setSkillError('You can add up to 20 skills.');
      return;
    }

    const duplicate = skills.some(
      skill => skill.toLowerCase() === name.toLowerCase(),
    );

    if (duplicate) {
      setSkillError(
        'That skill is already on your list.',
      );
      return;
    }

    setSkills(current => [...current, name]);
    setSkillDraft('');
    setSkillError(null);
  }

  function removeSkill(index: number) {
    setSkills(current =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
    setSkillError(null);
  }

  function moveSkill(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= skills.length) {
      return;
    }

    setSkills(current => {
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
    setSkillError(null);
  }

  async function handleSave() {
    if (savingRef.current || loading) {
      return;
    }

    Keyboard.dismiss();
    clearFieldErrors();

    const trimmedHeadline = headline.trim();

    if (
      trimmedHeadline &&
      (trimmedHeadline.length < 2 ||
        trimmedHeadline.length > PROFESSIONAL_HEADLINE_MAX)
    ) {
      setHeadlineError(
        'Professional headline must be between 2 and 100 characters.',
      );
      return;
    }

    if (about.trim().length > PROFESSIONAL_ABOUT_MAX) {
      setAboutError(
        'Keep your professional about to 1500 characters or fewer.',
      );
      return;
    }

    if (serviceArea.trim().length > PROFESSIONAL_SERVICE_AREA_MAX) {
      setServiceAreaError(
        'Service area must be 120 characters or fewer.',
      );
      return;
    }

    if (skills.length > PROFESSIONAL_SKILLS_MAX) {
      setSkillError('You can add up to 20 skills.');
      return;
    }

    const input = {
      headline,
      about,
      availability,
      serviceArea,
      workPreference,
      skills,
    };

    const sanitised = sanitiseOwnProfessionalProfileInput(
      input,
    );

    if (!sanitised.ok) {
      setSaveError(sanitised.error);
      return;
    }

    savingRef.current = true;
    setSaving(true);

    const result = await saveOwnProfessionalProfile(input);

    if (!mountedRef.current) {
      return;
    }

    savingRef.current = false;
    setSaving(false);

    if (result.error || !result.profileId) {
      setSaveError(
        result.error ??
          'Your Professional profile could not be saved. Try again.',
      );
      return;
    }

    allowLeaveRef.current = true;
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DGHeader
        showBackButton
        title="Edit Professional Profile"
        onBackPress={() => {
          if (savingRef.current) {
            return;
          }

          navigation.goBack();
        }}
      />

      {loading ? (
        <View style={styles.body}>
          <DGSkeleton width="54%" height={14} />
          <DGSkeleton
            width="100%"
            height={48}
            style={styles.skeleton}
          />
          <DGSkeleton width="100%" height={88} />
          <DGSkeleton width="72%" height={14} />
        </View>
      ) : loadError ? (
        <View style={styles.body}>
          <Text style={styles.errorTitle}>
            Professional profile could not be loaded
          </Text>
          <Text style={styles.errorBody}>{loadError}</Text>
          <DGButton
            title="Retry"
            fullWidth
            onPress={() => {
              void loadProfile();
            }}
            accessibilityLabel="Retry loading Professional profile"
          />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS === 'ios' ? 'padding' : undefined
          }
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.intro}>
              Build the work profile people will see when
              you use Professional.
            </Text>

            <Text style={styles.sectionLabel}>
              PROFESSIONAL IDENTITY
            </Text>

            <DGInput
              label="Professional headline"
              value={headline}
              onChangeText={(value) => {
                setHeadline(value);
                setHeadlineError(null);
                setSaveError(null);
              }}
              editable={!saving}
              errorMessage={headlineError ?? undefined}
              helperText={`Optional. ${headline.trim().length}/${PROFESSIONAL_HEADLINE_MAX}. A short capability title, not your Personal bio.`}
              accessibilityLabel="Professional headline"
            />

            <DGInput
              label="Professional About"
              value={about}
              onChangeText={(value) => {
                setAbout(value);
                setAboutError(null);
                setSaveError(null);
              }}
              multiline
              editable={!saving}
              errorMessage={aboutError ?? undefined}
              helperText={`Optional. ${about.trim().length}/${PROFESSIONAL_ABOUT_MAX}. Describe the work you can do.`}
              accessibilityLabel="Professional About"
            />

            <Text style={styles.sectionLabel}>
              WORK AVAILABILITY
            </Text>

            <Text style={styles.fieldLabel}>Availability</Text>
            <View style={styles.chipWrap}>
              <ChoiceChip
                label="Not set"
                selected={availability === null}
                disabled={saving}
                onPress={() => {
                  setAvailability(null);
                  setSaveError(null);
                }}
              />
              {PROFESSIONAL_AVAILABILITIES.map(value => (
                <ChoiceChip
                  key={value}
                  label={formatProfessionalAvailabilityLabel(
                    value,
                  )}
                  selected={availability === value}
                  disabled={saving}
                  onPress={() => {
                    setAvailability(value);
                    setSaveError(null);
                  }}
                />
              ))}
            </View>

            <Text style={styles.fieldLabel}>
              Work preference
            </Text>
            <View style={styles.chipWrap}>
              <ChoiceChip
                label="Not set"
                selected={workPreference === null}
                disabled={saving}
                onPress={() => {
                  setWorkPreference(null);
                  setSaveError(null);
                }}
              />
              {PROFESSIONAL_WORK_PREFERENCES.map(value => (
                <ChoiceChip
                  key={value}
                  label={formatProfessionalWorkPreferenceLabel(
                    value,
                  )}
                  selected={workPreference === value}
                  disabled={saving}
                  onPress={() => {
                    setWorkPreference(value);
                    setSaveError(null);
                  }}
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>
              SERVICE AREA
            </Text>

            <DGInput
              label="Service area"
              value={serviceArea}
              onChangeText={(value) => {
                setServiceArea(value);
                setServiceAreaError(null);
                setSaveError(null);
              }}
              editable={!saving}
              errorMessage={serviceAreaError ?? undefined}
              helperText={`Optional. ${serviceArea.trim().length}/${PROFESSIONAL_SERVICE_AREA_MAX}. Where you work or service clients — not a street address. e.g. Melbourne CBD & Eastern Suburbs`}
              accessibilityLabel="Professional service area"
            />

            <Text style={styles.sectionLabel}>SKILLS</Text>
            <Text style={styles.helper}>
              Ordered capability labels. Add up to 20.
            </Text>

            <View style={styles.skillAddRow}>
              <View style={styles.skillInput}>
                <DGInput
                  label="Add a skill"
                  value={skillDraft}
                  onChangeText={(value) => {
                    setSkillDraft(value);
                    setSkillError(null);
                  }}
                  editable={
                    !saving &&
                    skills.length < PROFESSIONAL_SKILLS_MAX
                  }
                  onSubmitEditing={addSkill}
                  returnKeyType="done"
                  errorMessage={skillError ?? undefined}
                  helperText={`${skillDraft.trim().length}/${PROFESSIONAL_SKILL_NAME_MAX} · ${skills.length}/${PROFESSIONAL_SKILLS_MAX} added`}
                  accessibilityLabel="Add a skill"
                />
              </View>
              <Pressable
                onPress={addSkill}
                disabled={
                  saving ||
                  skills.length >= PROFESSIONAL_SKILLS_MAX
                }
                accessibilityRole="button"
                accessibilityLabel="Add skill"
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.addButtonPressed,
                  (saving ||
                    skills.length >= PROFESSIONAL_SKILLS_MAX) &&
                    styles.addButtonDisabled,
                ]}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </Pressable>
            </View>

            {skills.map((skill, index) => (
              <View key={`${skill}-${index}`} style={styles.skillRow}>
                <Text style={styles.skillName} numberOfLines={2}>
                  {skill}
                </Text>
                <View style={styles.skillActions}>
                  <IconAction
                    icon="chevron-up"
                    label={`Move ${skill} up`}
                    disabled={saving || index === 0}
                    onPress={() => {
                      moveSkill(index, -1);
                    }}
                  />
                  <IconAction
                    icon="chevron-down"
                    label={`Move ${skill} down`}
                    disabled={
                      saving || index === skills.length - 1
                    }
                    onPress={() => {
                      moveSkill(index, 1);
                    }}
                  />
                  <IconAction
                    icon="close"
                    label={`Remove ${skill}`}
                    disabled={saving}
                    onPress={() => {
                      removeSkill(index);
                    }}
                  />
                </View>
              </View>
            ))}

            {saveError ? (
              <Text style={styles.saveError}>{saveError}</Text>
            ) : null}

            <DGButton
              title={saving ? 'Saving…' : 'Save'}
              fullWidth
              loading={saving}
              disabled={saving}
              onPress={() => {
                void handleSave();
              }}
              accessibilityLabel="Save Professional profile"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

function ChoiceChip({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.chipPressed,
        disabled && styles.chipDisabled,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          selected && styles.chipTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function IconAction({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: 'chevron-up' | 'chevron-down' | 'close';
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [
        styles.iconAction,
        pressed && styles.iconActionPressed,
        disabled && styles.iconActionDisabled,
      ]}
    >
      <Ionicons
        name={icon}
        size={iconSize.md}
        color={
          disabled ? textColor.muted : textColor.primary
        }
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: surface.page,
  },

  flex: {
    flex: 1,
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
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },

  sectionLabel: {
    color: textColor.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: spacing.xs,
  },

  fieldLabel: {
    color: textColor.secondary,
    fontSize: 13,
    fontWeight: '700',
  },

  helper: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    marginTop: -spacing.sm,
  },

  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },

  chip: {
    minHeight: 40,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chipSelected: {
    borderColor: alpha.green16,
    backgroundColor: alpha.green06,
  },

  chipPressed: {
    opacity: 0.88,
  },

  chipDisabled: {
    opacity: 0.5,
  },

  chipText: {
    color: textColor.secondary,
    fontSize: 13,
    fontWeight: '700',
  },

  chipTextSelected: {
    color: palette.opportunityGreen,
  },

  skillAddRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },

  skillInput: {
    flex: 1,
    minWidth: 0,
  },

  addButton: {
    minHeight: 48,
    minWidth: 64,
    marginTop: 22,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: palette.opportunityGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButtonPressed: {
    opacity: 0.88,
  },

  addButtonDisabled: {
    opacity: 0.45,
  },

  addButtonText: {
    color: textColor.inverse,
    fontSize: 14,
    fontWeight: '800',
  },

  skillRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    gap: spacing.sm,
  },

  skillName: {
    flex: 1,
    minWidth: 0,
    color: textColor.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  skillActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconAction: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconActionPressed: {
    opacity: 0.7,
  },

  iconActionDisabled: {
    opacity: 0.35,
  },

  skeleton: {
    marginTop: spacing.sm,
  },

  errorTitle: {
    color: textColor.primary,
    ...typography.headingSmall,
  },

  errorBody: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
  },

  saveError: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
});
