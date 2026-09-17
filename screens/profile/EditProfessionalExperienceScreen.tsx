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
import ProfessionalCredentialCard from '../../components/profile/professional/ProfessionalCredentialCard';
import ProfessionalExperienceCard from '../../components/profile/professional/ProfessionalExperienceCard';

import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import type { MyGainStackParamList } from '../../navigation/MyGainStack';

import {
  formatProfessionalCredentialTypeLabel,
  PROFESSIONAL_MONTH_LABELS,
  sanitiseOwnProfessionalCredentials,
  sanitiseOwnProfessionalExperiences,
  type ProfessionalCredentialDraftFields,
  type ProfessionalExperienceDraftFields,
} from '../../services/profile/professionalProfileAdapter';
import {
  getOwnProfessionalCredentials,
  getOwnProfessionalExperiences,
  saveOwnProfessionalCredentials,
  saveOwnProfessionalExperiences,
} from '../../services/profile/professionalProfileRepository';

import {
  alpha,
  iconSize,
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

import type {
  ProfessionalCredential,
  ProfessionalExperience,
} from '../../types/professionalProfile';
import {
  PROFESSIONAL_CREDENTIAL_ISSUER_MAX,
  PROFESSIONAL_CREDENTIAL_NAME_MAX,
  PROFESSIONAL_CREDENTIAL_TYPES,
  PROFESSIONAL_CREDENTIALS_MAX,
  PROFESSIONAL_EXPERIENCE_DESCRIPTION_MAX,
  PROFESSIONAL_EXPERIENCE_ORGANISATION_MAX,
  PROFESSIONAL_EXPERIENCE_TITLE_MAX,
  PROFESSIONAL_EXPERIENCES_MAX,
} from '../../types/professionalProfile';

type Props = NativeStackScreenProps<
  MyGainStackParamList,
  'EditProfessionalExperience'
>;

type ExperienceDraft = ProfessionalExperienceDraftFields & {
  draftKey: string;
};

type CredentialDraft = ProfessionalCredentialDraftFields & {
  draftKey: string;
};

type Panel =
  | { type: 'list' }
  | { type: 'experience'; index: number | null }
  | { type: 'credential'; index: number | null };

function emptyExperienceDraft(draftKey: string): ExperienceDraft {
  return {
    draftKey,
    id: null,
    title: '',
    organisation: '',
    startYearText: '',
    startMonth: null,
    isCurrent: false,
    endYearText: '',
    endMonth: null,
    description: '',
  };
}

function emptyCredentialDraft(draftKey: string): CredentialDraft {
  return {
    draftKey,
    id: null,
    credentialType: null,
    name: '',
    issuer: '',
    issuedYearText: '',
    issuedMonth: null,
    doesNotExpire: false,
    expiresYearText: '',
    expiresMonth: null,
  };
}

function experienceFromSaved(
  item: ProfessionalExperience,
): ExperienceDraft {
  return {
    draftKey: item.id,
    id: item.id,
    title: item.title,
    organisation: item.organisation,
    startYearText: String(item.startYear),
    startMonth: item.startMonth,
    isCurrent: item.isCurrent,
    endYearText:
      item.endYear == null ? '' : String(item.endYear),
    endMonth: item.endMonth,
    description: item.description ?? '',
  };
}

function credentialFromSaved(
  item: ProfessionalCredential,
): CredentialDraft {
  return {
    draftKey: item.id,
    id: item.id,
    credentialType: item.credentialType,
    name: item.name,
    issuer: item.issuer ?? '',
    issuedYearText:
      item.issuedYear == null ? '' : String(item.issuedYear),
    issuedMonth: item.issuedMonth,
    doesNotExpire: item.doesNotExpire,
    expiresYearText:
      item.expiresYear == null ? '' : String(item.expiresYear),
    expiresMonth: item.expiresMonth,
  };
}

function snapshotExperiences(items: ExperienceDraft[]): string {
  return JSON.stringify(
    items.map(item => ({
      id: item.id ?? null,
      title: item.title,
      organisation: item.organisation,
      startYearText: item.startYearText,
      startMonth: item.startMonth,
      isCurrent: item.isCurrent,
      endYearText: item.endYearText,
      endMonth: item.endMonth,
      description: item.description,
    })),
  );
}

function snapshotCredentials(items: CredentialDraft[]): string {
  return JSON.stringify(
    items.map(item => ({
      id: item.id ?? null,
      credentialType: item.credentialType,
      name: item.name,
      issuer: item.issuer,
      issuedYearText: item.issuedYearText,
      issuedMonth: item.issuedMonth,
      doesNotExpire: item.doesNotExpire,
      expiresYearText: item.expiresYearText,
      expiresMonth: item.expiresMonth,
    })),
  );
}

function moveItem<T>(
  items: T[],
  index: number,
  direction: -1 | 1,
): T[] {
  const nextIndex = index + direction;

  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

export default function EditProfessionalExperienceScreen({
  navigation,
}: Props) {
  const { hideTabBar } = useTabBarVisibility();

  const mountedRef = useRef(true);
  const savingRef = useRef(false);
  const allowLeaveRef = useRef(false);
  const dirtyRef = useRef(false);
  const panelRef = useRef<Panel>({ type: 'list' });
  const draftSeqRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [experiences, setExperiences] = useState<ExperienceDraft[]>(
    [],
  );
  const [credentials, setCredentials] = useState<CredentialDraft[]>(
    [],
  );
  const [savedExperienceSnapshot, setSavedExperienceSnapshot] =
    useState('');
  const [savedCredentialSnapshot, setSavedCredentialSnapshot] =
    useState('');
  const [panel, setPanel] = useState<Panel>({ type: 'list' });
  const [experienceForm, setExperienceForm] =
    useState<ExperienceDraft | null>(null);
  const [credentialForm, setCredentialForm] =
    useState<CredentialDraft | null>(null);

  panelRef.current = panel;

  const dirty =
    !loading &&
    (snapshotExperiences(experiences) !==
      savedExperienceSnapshot ||
      snapshotCredentials(credentials) !==
        savedCredentialSnapshot);
  dirtyRef.current = dirty;

  function nextDraftKey(prefix: string): string {
    draftSeqRef.current += 1;
    return `local-${prefix}-${draftSeqRef.current}`;
  }

  const loadCollections = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const [experienceResult, credentialResult] = await Promise.all([
      getOwnProfessionalExperiences(),
      getOwnProfessionalCredentials(),
    ]);

    if (!mountedRef.current) {
      return;
    }

    if (experienceResult.error || credentialResult.error) {
      setLoading(false);
      setLoadError(
        experienceResult.error ??
          credentialResult.error ??
          'Experience and credentials could not be loaded.',
      );
      return;
    }

    const nextExperiences = experienceResult.experiences.map(
      experienceFromSaved,
    );
    const nextCredentials = credentialResult.credentials.map(
      credentialFromSaved,
    );

    setExperiences(nextExperiences);
    setCredentials(nextCredentials);
    setSavedExperienceSnapshot(
      snapshotExperiences(nextExperiences),
    );
    setSavedCredentialSnapshot(
      snapshotCredentials(nextCredentials),
    );
    setSaveError(null);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      hideTabBar();
    }, [hideTabBar]),
  );

  useEffect(() => {
    mountedRef.current = true;
    void loadCollections();

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

        const activePanel = panelRef.current;

        if (activePanel.type !== 'list') {
          event.preventDefault();
          Alert.alert(
            'Discard this entry?',
            'Changes to this entry will not be kept unless you add it to the list, then save.',
            [
              {
                text: 'Keep editing',
                style: 'cancel',
              },
              {
                text: 'Discard',
                style: 'destructive',
                onPress: () => {
                  setPanel({ type: 'list' });
                  setExperienceForm(null);
                  setCredentialForm(null);
                  setFormError(null);
                },
              },
            ],
          );
          return;
        }

        if (!dirtyRef.current) {
          return;
        }

        event.preventDefault();

        Alert.alert(
          'Discard changes?',
          'Your experience and credentials have not been saved.',
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
  }, [loadCollections, navigation]);

  function openExperienceForm(index: number | null) {
    setFormError(null);
    setSaveError(null);
    setExperienceForm(
      index == null
        ? emptyExperienceDraft(nextDraftKey('exp'))
        : { ...experiences[index] },
    );
    setPanel({ type: 'experience', index });
  }

  function openCredentialForm(index: number | null) {
    setFormError(null);
    setSaveError(null);
    setCredentialForm(
      index == null
        ? emptyCredentialDraft(nextDraftKey('cred'))
        : { ...credentials[index] },
    );
    setPanel({ type: 'credential', index });
  }

  function closeItemForm() {
    setPanel({ type: 'list' });
    setExperienceForm(null);
    setCredentialForm(null);
    setFormError(null);
  }

  function applyExperienceForm() {
    if (!experienceForm) {
      return;
    }

    const nextItems =
      panel.type === 'experience' && panel.index == null
        ? [...experiences, experienceForm]
        : experiences.map((item, index) =>
            panel.type === 'experience' && panel.index === index
              ? experienceForm
              : item,
          );

    const sanitised = sanitiseOwnProfessionalExperiences(nextItems);

    if (!sanitised.ok) {
      setFormError(sanitised.error);
      return;
    }

    setExperiences(nextItems);
    closeItemForm();
  }

  function applyCredentialForm() {
    if (!credentialForm) {
      return;
    }

    const nextItems =
      panel.type === 'credential' && panel.index == null
        ? [...credentials, credentialForm]
        : credentials.map((item, index) =>
            panel.type === 'credential' && panel.index === index
              ? credentialForm
              : item,
          );

    const sanitised = sanitiseOwnProfessionalCredentials(nextItems);

    if (!sanitised.ok) {
      setFormError(sanitised.error);
      return;
    }

    setCredentials(nextItems);
    closeItemForm();
  }

  function confirmRemoveExperience(index: number) {
    const item = experiences[index];

    const remove = () => {
      setExperiences(current =>
        current.filter((_, itemIndex) => itemIndex !== index),
      );
      setSaveError(null);
    };

    if (!item.id) {
      remove();
      return;
    }

    Alert.alert(
      'Remove this experience?',
      'It stays on your profile until you save this screen.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: remove,
        },
      ],
    );
  }

  function confirmRemoveCredential(index: number) {
    const item = credentials[index];

    const remove = () => {
      setCredentials(current =>
        current.filter((_, itemIndex) => itemIndex !== index),
      );
      setSaveError(null);
    };

    if (!item.id) {
      remove();
      return;
    }

    Alert.alert(
      'Remove this credential?',
      'It stays on your profile until you save this screen.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: remove,
        },
      ],
    );
  }

  async function handleSave() {
    if (savingRef.current || loading || panel.type !== 'list') {
      return;
    }

    Keyboard.dismiss();
    setSaveError(null);

    const experienceResult =
      sanitiseOwnProfessionalExperiences(experiences);
    const credentialResult =
      sanitiseOwnProfessionalCredentials(credentials);

    if (!experienceResult.ok) {
      setSaveError(experienceResult.error);
      return;
    }

    if (!credentialResult.ok) {
      setSaveError(credentialResult.error);
      return;
    }

    savingRef.current = true;
    setSaving(true);

    const savedExperiences = await saveOwnProfessionalExperiences(
      experienceResult.entries,
    );

    if (!mountedRef.current) {
      return;
    }

    if (savedExperiences.error) {
      savingRef.current = false;
      setSaving(false);
      setSaveError(savedExperiences.error);
      return;
    }

    const persistedExperiences = savedExperiences.experiences.map(
      experienceFromSaved,
    );
    setExperiences(persistedExperiences);

    const savedCredentials = await saveOwnProfessionalCredentials(
      credentialResult.entries,
    );

    if (!mountedRef.current) {
      return;
    }

    if (savedCredentials.error) {
      savingRef.current = false;
      setSaving(false);
      setSavedExperienceSnapshot(
        snapshotExperiences(persistedExperiences),
      );
      setSaveError(
        `${savedCredentials.error} Work experience was saved. Credentials were not. Retry to save credentials.`,
      );
      return;
    }

    const persistedCredentials = savedCredentials.credentials.map(
      credentialFromSaved,
    );
    setCredentials(persistedCredentials);
    setSavedExperienceSnapshot(
      snapshotExperiences(persistedExperiences),
    );
    setSavedCredentialSnapshot(
      snapshotCredentials(persistedCredentials),
    );

    savingRef.current = false;
    setSaving(false);
    allowLeaveRef.current = true;
    navigation.goBack();
  }

  const headerTitle =
    panel.type === 'experience'
      ? panel.index == null
        ? 'Add experience'
        : 'Edit experience'
      : panel.type === 'credential'
        ? panel.index == null
          ? 'Add credential'
          : 'Edit credential'
        : 'Experience & credentials';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DGHeader
        showBackButton
        title={headerTitle}
        onBackPress={() => {
          if (savingRef.current) {
            return;
          }

          if (panel.type !== 'list') {
            closeItemForm();
            return;
          }

          navigation.goBack();
        }}
      />

      {loading ? (
        <View style={styles.body}>
          <DGSkeleton width="48%" height={14} />
          <DGSkeleton
            width="100%"
            height={72}
            style={styles.skeleton}
          />
          <DGSkeleton width="100%" height={72} />
        </View>
      ) : loadError ? (
        <View style={styles.body}>
          <Text style={styles.errorTitle}>
            Experience could not be loaded
          </Text>
          <Text style={styles.errorBody}>{loadError}</Text>
          <DGButton
            title="Retry"
            fullWidth
            onPress={() => {
              void loadCollections();
            }}
            accessibilityLabel="Retry loading experience and credentials"
          />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS === 'ios' ? 'padding' : undefined
          }
        >
          {panel.type === 'list' ? (
            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.intro}>
                These are your professional claims. Direct Gain has
                not verified them.
              </Text>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>EXPERIENCE</Text>
                <Text style={styles.count}>
                  {experiences.length}/{PROFESSIONAL_EXPERIENCES_MAX}
                </Text>
              </View>

              {experiences.length === 0 ? (
                <Text style={styles.emptyCopy}>
                  Add your work experience. Include roles that show
                  what you can do.
                </Text>
              ) : null}

              {experiences.map((item, index) => (
                <ProfessionalExperienceCard
                  key={item.draftKey}
                  experience={{
                    title: item.title || 'Untitled role',
                    organisation:
                      item.organisation || 'Organisation needed',
                    startYear: Number(item.startYearText) || 0,
                    startMonth: item.startMonth,
                    endYear: item.isCurrent
                      ? null
                      : Number(item.endYearText) || null,
                    endMonth: item.endMonth,
                    isCurrent: item.isCurrent,
                    description:
                      item.description.trim() || null,
                  }}
                  footer={
                    <OwnerActions
                      disabled={saving}
                      canMoveUp={index > 0}
                      canMoveDown={
                        index < experiences.length - 1
                      }
                      onEdit={() => {
                        openExperienceForm(index);
                      }}
                      onMoveUp={() => {
                        setExperiences(current =>
                          moveItem(current, index, -1),
                        );
                      }}
                      onMoveDown={() => {
                        setExperiences(current =>
                          moveItem(current, index, 1),
                        );
                      }}
                      onRemove={() => {
                        confirmRemoveExperience(index);
                      }}
                    />
                  }
                />
              ))}

              <DGButton
                title="Add experience"
                variant="outline"
                fullWidth
                disabled={
                  saving ||
                  experiences.length >= PROFESSIONAL_EXPERIENCES_MAX
                }
                onPress={() => {
                  openExperienceForm(null);
                }}
                accessibilityLabel="Add experience"
              />

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>
                  QUALIFICATIONS, LICENCES & CERTIFICATIONS
                </Text>
                <Text style={styles.count}>
                  {credentials.length}/{PROFESSIONAL_CREDENTIALS_MAX}
                </Text>
              </View>

              {credentials.length === 0 ? (
                <Text style={styles.emptyCopy}>
                  Add qualifications, licences and certifications
                  relevant to your work.
                </Text>
              ) : null}

              {credentials.map((item, index) => (
                <ProfessionalCredentialCard
                  key={item.draftKey}
                  credential={{
                    credentialType:
                      item.credentialType ?? 'qualification',
                    name: item.name || 'Untitled credential',
                    issuer: item.issuer.trim() || null,
                    issuedYear: Number(item.issuedYearText) || null,
                    issuedMonth: item.issuedMonth,
                    expiresYear: item.doesNotExpire
                      ? null
                      : Number(item.expiresYearText) || null,
                    expiresMonth: item.expiresMonth,
                    doesNotExpire: item.doesNotExpire,
                  }}
                  footer={
                    <OwnerActions
                      disabled={saving}
                      canMoveUp={index > 0}
                      canMoveDown={
                        index < credentials.length - 1
                      }
                      onEdit={() => {
                        openCredentialForm(index);
                      }}
                      onMoveUp={() => {
                        setCredentials(current =>
                          moveItem(current, index, -1),
                        );
                      }}
                      onMoveDown={() => {
                        setCredentials(current =>
                          moveItem(current, index, 1),
                        );
                      }}
                      onRemove={() => {
                        confirmRemoveCredential(index);
                      }}
                    />
                  }
                />
              ))}

              <DGButton
                title="Add credential"
                variant="outline"
                fullWidth
                disabled={
                  saving ||
                  credentials.length >= PROFESSIONAL_CREDENTIALS_MAX
                }
                onPress={() => {
                  openCredentialForm(null);
                }}
                accessibilityLabel="Add credential"
              />

              {saveError ? (
                <Text style={styles.saveError}>{saveError}</Text>
              ) : null}

              <DGButton
                title={saving ? 'Saving…' : saveError ? 'Retry' : 'Save'}
                fullWidth
                loading={saving}
                disabled={saving}
                onPress={() => {
                  void handleSave();
                }}
                accessibilityLabel="Save experience and credentials"
              />
            </ScrollView>
          ) : panel.type === 'experience' && experienceForm ? (
            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
            >
              <DGInput
                label="Role / title"
                value={experienceForm.title}
                onChangeText={(value) => {
                  setExperienceForm(current =>
                    current
                      ? { ...current, title: value }
                      : current,
                  );
                  setFormError(null);
                }}
                editable={!saving}
                helperText={`${experienceForm.title.trim().length}/${PROFESSIONAL_EXPERIENCE_TITLE_MAX}`}
                accessibilityLabel="Role or title"
              />

              <DGInput
                label="Organisation"
                value={experienceForm.organisation}
                onChangeText={(value) => {
                  setExperienceForm(current =>
                    current
                      ? { ...current, organisation: value }
                      : current,
                  );
                  setFormError(null);
                }}
                editable={!saving}
                helperText={`${experienceForm.organisation.trim().length}/${PROFESSIONAL_EXPERIENCE_ORGANISATION_MAX}`}
                accessibilityLabel="Organisation"
              />

              <DGInput
                label="Start year"
                value={experienceForm.startYearText}
                onChangeText={(value) => {
                  setExperienceForm(current =>
                    current
                      ? { ...current, startYearText: value }
                      : current,
                  );
                  setFormError(null);
                }}
                editable={!saving}
                keyboardType="number-pad"
                helperText="Required. 1950 through this year."
                accessibilityLabel="Start year"
              />

              <Text style={styles.fieldLabel}>Start month</Text>
              <MonthChips
                value={experienceForm.startMonth}
                disabled={saving}
                onChange={(startMonth) => {
                  setExperienceForm(current =>
                    current
                      ? { ...current, startMonth }
                      : current,
                  );
                  setFormError(null);
                }}
              />

              <Text style={styles.fieldLabel}>Current role</Text>
              <View style={styles.chipWrap}>
                <ChoiceChip
                  label="Yes"
                  selected={experienceForm.isCurrent}
                  disabled={saving}
                  onPress={() => {
                    setExperienceForm(current =>
                      current
                        ? {
                            ...current,
                            isCurrent: true,
                            endYearText: '',
                            endMonth: null,
                          }
                        : current,
                    );
                    setFormError(null);
                  }}
                />
                <ChoiceChip
                  label="No"
                  selected={!experienceForm.isCurrent}
                  disabled={saving}
                  onPress={() => {
                    setExperienceForm(current =>
                      current
                        ? { ...current, isCurrent: false }
                        : current,
                    );
                    setFormError(null);
                  }}
                />
              </View>

              {experienceForm.isCurrent ? (
                <Text style={styles.helper}>
                  Current roles do not use an end date.
                </Text>
              ) : (
                <>
                  <DGInput
                    label="End year"
                    value={experienceForm.endYearText}
                    onChangeText={(value) => {
                      setExperienceForm(current =>
                        current
                          ? { ...current, endYearText: value }
                          : current,
                      );
                      setFormError(null);
                    }}
                    editable={!saving}
                    keyboardType="number-pad"
                    helperText="Required unless this is a current role."
                    accessibilityLabel="End year"
                  />

                  <Text style={styles.fieldLabel}>End month</Text>
                  <MonthChips
                    value={experienceForm.endMonth}
                    disabled={saving}
                    onChange={(endMonth) => {
                      setExperienceForm(current =>
                        current
                          ? { ...current, endMonth }
                          : current,
                      );
                      setFormError(null);
                    }}
                  />
                </>
              )}

              <DGInput
                label="Description"
                value={experienceForm.description}
                onChangeText={(value) => {
                  setExperienceForm(current =>
                    current
                      ? { ...current, description: value }
                      : current,
                  );
                  setFormError(null);
                }}
                multiline
                editable={!saving}
                helperText={`Optional. ${experienceForm.description.trim().length}/${PROFESSIONAL_EXPERIENCE_DESCRIPTION_MAX}`}
                accessibilityLabel="Experience description"
              />

              {formError ? (
                <Text style={styles.saveError}>{formError}</Text>
              ) : null}

              <DGButton
                title={
                  panel.index == null
                    ? 'Add to list'
                    : 'Update entry'
                }
                fullWidth
                disabled={saving}
                onPress={applyExperienceForm}
                accessibilityLabel={
                  panel.index == null
                    ? 'Add experience to list'
                    : 'Update experience entry'
                }
              />
            </ScrollView>
          ) : panel.type === 'credential' && credentialForm ? (
            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.fieldLabel}>Type</Text>
              <View style={styles.chipWrap}>
                {PROFESSIONAL_CREDENTIAL_TYPES.map(value => (
                  <ChoiceChip
                    key={value}
                    label={formatProfessionalCredentialTypeLabel(
                      value,
                    )}
                    selected={
                      credentialForm.credentialType === value
                    }
                    disabled={saving}
                    onPress={() => {
                      setCredentialForm(current =>
                        current
                          ? {
                              ...current,
                              credentialType: value,
                            }
                          : current,
                      );
                      setFormError(null);
                    }}
                  />
                ))}
              </View>

              <DGInput
                label="Name"
                value={credentialForm.name}
                onChangeText={(value) => {
                  setCredentialForm(current =>
                    current
                      ? { ...current, name: value }
                      : current,
                  );
                  setFormError(null);
                }}
                editable={!saving}
                helperText={`${credentialForm.name.trim().length}/${PROFESSIONAL_CREDENTIAL_NAME_MAX}`}
                accessibilityLabel="Credential name"
              />

              <DGInput
                label="Issuer"
                value={credentialForm.issuer}
                onChangeText={(value) => {
                  setCredentialForm(current =>
                    current
                      ? { ...current, issuer: value }
                      : current,
                  );
                  setFormError(null);
                }}
                editable={!saving}
                helperText={`Optional. ${credentialForm.issuer.trim().length}/${PROFESSIONAL_CREDENTIAL_ISSUER_MAX}`}
                accessibilityLabel="Credential issuer"
              />

              <DGInput
                label="Issued year"
                value={credentialForm.issuedYearText}
                onChangeText={(value) => {
                  setCredentialForm(current =>
                    current
                      ? { ...current, issuedYearText: value }
                      : current,
                  );
                  setFormError(null);
                }}
                editable={!saving}
                keyboardType="number-pad"
                helperText="Optional. 1950 through this year."
                accessibilityLabel="Issued year"
              />

              <Text style={styles.fieldLabel}>Issued month</Text>
              <MonthChips
                value={credentialForm.issuedMonth}
                disabled={saving}
                onChange={(issuedMonth) => {
                  setCredentialForm(current =>
                    current
                      ? { ...current, issuedMonth }
                      : current,
                  );
                  setFormError(null);
                }}
              />

              <Text style={styles.fieldLabel}>Does not expire</Text>
              <View style={styles.chipWrap}>
                <ChoiceChip
                  label="Yes"
                  selected={credentialForm.doesNotExpire}
                  disabled={saving}
                  onPress={() => {
                    setCredentialForm(current =>
                      current
                        ? {
                            ...current,
                            doesNotExpire: true,
                            expiresYearText: '',
                            expiresMonth: null,
                          }
                        : current,
                    );
                    setFormError(null);
                  }}
                />
                <ChoiceChip
                  label="No"
                  selected={!credentialForm.doesNotExpire}
                  disabled={saving}
                  onPress={() => {
                    setCredentialForm(current =>
                      current
                        ? { ...current, doesNotExpire: false }
                        : current,
                    );
                    setFormError(null);
                  }}
                />
              </View>

              {credentialForm.doesNotExpire ? (
                <Text style={styles.helper}>
                  Expiry date is cleared for credentials that do
                  not expire.
                </Text>
              ) : (
                <>
                  <DGInput
                    label="Expiry year"
                    value={credentialForm.expiresYearText}
                    onChangeText={(value) => {
                      setCredentialForm(current =>
                        current
                          ? {
                              ...current,
                              expiresYearText: value,
                            }
                          : current,
                      );
                      setFormError(null);
                    }}
                    editable={!saving}
                    keyboardType="number-pad"
                    helperText="Optional. Future expiry is allowed. Leave blank if unknown."
                    accessibilityLabel="Expiry year"
                  />

                  <Text style={styles.fieldLabel}>Expiry month</Text>
                  <MonthChips
                    value={credentialForm.expiresMonth}
                    disabled={saving}
                    onChange={(expiresMonth) => {
                      setCredentialForm(current =>
                        current
                          ? { ...current, expiresMonth }
                          : current,
                      );
                      setFormError(null);
                    }}
                  />
                </>
              )}

              {formError ? (
                <Text style={styles.saveError}>{formError}</Text>
              ) : null}

              <DGButton
                title={
                  panel.index == null
                    ? 'Add to list'
                    : 'Update entry'
                }
                fullWidth
                disabled={saving}
                onPress={applyCredentialForm}
                accessibilityLabel={
                  panel.index == null
                    ? 'Add credential to list'
                    : 'Update credential entry'
                }
              />
            </ScrollView>
          ) : null}
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

function OwnerActions({
  disabled,
  canMoveUp,
  canMoveDown,
  onEdit,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  disabled: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.actions}>
      <Pressable
        onPress={onEdit}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Edit"
        style={({ pressed }) => [
          styles.editAction,
          pressed && styles.iconActionPressed,
          disabled && styles.iconActionDisabled,
        ]}
      >
        <Text style={styles.editActionText}>Edit</Text>
      </Pressable>
      <View style={styles.actionIcons}>
        <IconAction
          icon="chevron-up"
          label="Move up"
          disabled={disabled || !canMoveUp}
          onPress={onMoveUp}
        />
        <IconAction
          icon="chevron-down"
          label="Move down"
          disabled={disabled || !canMoveDown}
          onPress={onMoveDown}
        />
        <IconAction
          icon="close"
          label="Remove"
          disabled={disabled}
          onPress={onRemove}
        />
      </View>
    </View>
  );
}

function MonthChips({
  value,
  disabled,
  onChange,
}: {
  value: number | null;
  disabled: boolean;
  onChange: (value: number | null) => void;
}) {
  return (
    <View style={styles.chipWrap}>
      <ChoiceChip
        label="Not set"
        selected={value == null}
        disabled={disabled}
        onPress={() => {
          onChange(null);
        }}
      />
      {PROFESSIONAL_MONTH_LABELS.map((label, index) => {
        const month = index + 1;

        return (
          <ChoiceChip
            key={label}
            label={label}
            selected={value === month}
            disabled={disabled}
            onPress={() => {
              onChange(month);
            }}
          />
        );
      })}
    </View>
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

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },

  sectionLabel: {
    flex: 1,
    color: textColor.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  count: {
    color: textColor.muted,
    fontSize: 11,
    fontWeight: '700',
  },

  emptyCopy: {
    color: textColor.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginTop: -spacing.sm,
  },

  helper: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    marginTop: -spacing.sm,
  },

  fieldLabel: {
    color: textColor.secondary,
    fontSize: 13,
    fontWeight: '700',
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

  actions: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  editAction: {
    minHeight: 44,
    justifyContent: 'center',
    paddingRight: spacing.sm,
  },

  editActionText: {
    color: palette.opportunityGreen,
    fontSize: 13,
    fontWeight: '800',
  },

  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconAction: {
    minWidth: 40,
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
    fontSize: 16,
    fontWeight: '800',
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
