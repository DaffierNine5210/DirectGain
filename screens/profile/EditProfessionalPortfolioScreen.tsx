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
  Image,
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

import { pickAndPrepareProfessionalPortfolioPhotos } from '../../services/profile/pickProfessionalPortfolioPhotos';
import {
  validateProfessionalPortfolioDrafts,
} from '../../services/profile/professionalProfileAdapter';
import {
  createProfessionalPortfolioObjectId,
  getOwnProfessionalPortfolio,
  presentedPortfolioToDrafts,
  saveOwnProfessionalPortfolio,
} from '../../services/profile/professionalPortfolioRepository';

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
  ProfessionalPortfolioDraftMedia,
  ProfessionalPortfolioDraftProject,
  ProfessionalPortfolioPresentedProject,
} from '../../types/professionalProfile';
import {
  PROFESSIONAL_PORTFOLIO_DESCRIPTION_MAX,
  PROFESSIONAL_PORTFOLIO_MEDIA_MAX,
  PROFESSIONAL_PORTFOLIO_PROJECTS_MAX,
  PROFESSIONAL_PORTFOLIO_TITLE_MAX,
} from '../../types/professionalProfile';

type Props = NativeStackScreenProps<
  MyGainStackParamList,
  'EditProfessionalPortfolio'
>;

type Panel =
  | { type: 'list' }
  | { type: 'project'; index: number | null };

function emptyProject(): ProfessionalPortfolioDraftProject {
  return {
    id: createProfessionalPortfolioObjectId(),
    persisted: false,
    title: '',
    description: '',
    media: [],
  };
}

function cloneProject(
  project: ProfessionalPortfolioDraftProject,
): ProfessionalPortfolioDraftProject {
  return {
    ...project,
    media: project.media.map(item => ({ ...item })),
  };
}

function snapshotProjects(
  items: ProfessionalPortfolioDraftProject[],
): string {
  return JSON.stringify(
    items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      media: item.media.map(photo => ({
        persistedId: photo.persistedId,
        storagePath: photo.storagePath,
        byteSize: photo.byteSize,
        localPreviewUri: photo.localPreviewUri,
      })),
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

function mediaPreviewUri(
  item: ProfessionalPortfolioDraftMedia,
): string | null {
  return item.localPreviewUri || item.displayUrl;
}

export default function EditProfessionalPortfolioScreen({
  navigation,
}: Props) {
  const { hideTabBar } = useTabBarVisibility();

  const mountedRef = useRef(true);
  const savingRef = useRef(false);
  const allowLeaveRef = useRef(false);
  const dirtyRef = useRef(false);
  const panelRef = useRef<Panel>({ type: 'list' });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [projects, setProjects] = useState<
    ProfessionalPortfolioDraftProject[]
  >([]);
  const [persisted, setPersisted] = useState<
    ProfessionalPortfolioPresentedProject[]
  >([]);
  const [savedSnapshot, setSavedSnapshot] = useState('');
  const [panel, setPanel] = useState<Panel>({ type: 'list' });
  const [projectForm, setProjectForm] =
    useState<ProfessionalPortfolioDraftProject | null>(null);

  panelRef.current = panel;

  const dirty =
    !loading && snapshotProjects(projects) !== savedSnapshot;
  dirtyRef.current = dirty;

  const loadCollection = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const result = await getOwnProfessionalPortfolio();

    if (!mountedRef.current) {
      return;
    }

    if (result.error) {
      setLoading(false);
      setLoadError(result.error);
      return;
    }

    const drafts = presentedPortfolioToDrafts(result.projects);
    setPersisted(result.projects);
    setProjects(drafts);
    setSavedSnapshot(snapshotProjects(drafts));
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
    void loadCollection();

    const unsubscribe = navigation.addListener(
      'beforeRemove',
      event => {
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
            'Discard this project?',
            'Changes to this project will not be kept unless you add it to the list, then save.',
            [
              { text: 'Keep editing', style: 'cancel' },
              {
                text: 'Discard',
                style: 'destructive',
                onPress: () => {
                  setPanel({ type: 'list' });
                  setProjectForm(null);
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
          'Your portfolio changes will be lost unless you save.',
          [
            { text: 'Keep editing', style: 'cancel' },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => {
                allowLeaveRef.current = true;
                navigation.goBack();
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
  }, [loadCollection, navigation]);

  function openNewProject() {
    if (projects.length >= PROFESSIONAL_PORTFOLIO_PROJECTS_MAX) {
      setSaveError('You can add up to 12 portfolio projects.');
      return;
    }

    setSaveError(null);
    setFormError(null);
    setProjectForm(emptyProject());
    setPanel({ type: 'project', index: null });
  }

  function openExistingProject(index: number) {
    const item = projects[index];

    if (!item) {
      return;
    }

    setSaveError(null);
    setFormError(null);
    setProjectForm(cloneProject(item));
    setPanel({ type: 'project', index });
  }

  function closeProjectForm() {
    setPanel({ type: 'list' });
    setProjectForm(null);
    setFormError(null);
  }

  function applyProjectForm() {
    if (!projectForm) {
      return;
    }

    const nextItems =
      panel.type === 'project' && panel.index == null
        ? [projectForm, ...projects]
        : projects.map((item, index) =>
            panel.type === 'project' && panel.index === index
              ? projectForm
              : item,
          );

    const validated = validateProfessionalPortfolioDrafts(
      nextItems,
    );

    if (!validated.ok) {
      setFormError(validated.error);
      return;
    }

    setProjects(nextItems);
    closeProjectForm();
  }

  function confirmRemoveProject(index: number) {
    const item = projects[index];

    const remove = () => {
      setProjects(current =>
        current.filter((_, itemIndex) => itemIndex !== index),
      );
      setSaveError(null);
    };

    if (!item.persisted) {
      remove();
      return;
    }

    Alert.alert(
      'Remove this project?',
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

  async function addPhotosToForm() {
    if (!projectForm || saving) {
      return;
    }

    const remaining =
      PROFESSIONAL_PORTFOLIO_MEDIA_MAX -
      projectForm.media.length;

    const picked =
      await pickAndPrepareProfessionalPortfolioPhotos(
        remaining,
      );

    if (!mountedRef.current) {
      return;
    }

    if (picked.kind === 'cancelled') {
      return;
    }

    if (picked.kind === 'permission_denied') {
      setFormError(
        'Allow photo access to add portfolio photos.',
      );
      return;
    }

    if (picked.kind === 'unavailable') {
      setFormError(picked.message);
      return;
    }

    if (picked.failedCount > 0 && picked.photos.length === 0) {
      setFormError(
        'Those photos could not be prepared. Please choose JPEG-friendly images under 2 MB after optimisation.',
      );
      return;
    }

    setProjectForm(current => {
      if (!current) {
        return current;
      }

      const room =
        PROFESSIONAL_PORTFOLIO_MEDIA_MAX - current.media.length;
      const additions = picked.photos.slice(0, room).map(
        (photo): ProfessionalPortfolioDraftMedia => ({
          draftKey: photo.localId,
          persistedId: null,
          storagePath: null,
          byteSize: photo.byteSize,
          localPreviewUri: photo.uri,
          displayUrl: null,
        }),
      );

      return {
        ...current,
        media: [...current.media, ...additions],
      };
    });

    if (picked.failedCount > 0) {
      setFormError(
        `${picked.failedCount} photo${picked.failedCount === 1 ? '' : 's'} could not be prepared.`,
      );
    } else {
      setFormError(null);
    }
  }

  async function handleSave() {
    if (savingRef.current || loading || panel.type !== 'list') {
      return;
    }

    Keyboard.dismiss();
    setSaveError(null);

    const validated = validateProfessionalPortfolioDrafts(
      projects,
    );

    if (!validated.ok) {
      setSaveError(validated.error);
      return;
    }

    savingRef.current = true;
    setSaving(true);

    const saved = await saveOwnProfessionalPortfolio(
      projects,
      persisted,
    );

    if (!mountedRef.current) {
      return;
    }

    if (saved.error) {
      savingRef.current = false;
      setSaving(false);
      setSaveError(saved.error);
      return;
    }

    const drafts = presentedPortfolioToDrafts(saved.projects);
    setPersisted(saved.projects);
    setProjects(drafts);
    setSavedSnapshot(snapshotProjects(drafts));
    savingRef.current = false;
    setSaving(false);

    if (saved.cleanupWarning) {
      Alert.alert('Portfolio saved', saved.cleanupWarning);
    }

    allowLeaveRef.current = true;
    navigation.goBack();
  }

  const headerTitle =
    panel.type === 'project'
      ? panel.index == null
        ? 'Add project'
        : 'Edit project'
      : 'Portfolio';

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
            closeProjectForm();
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
            height={120}
            style={styles.skeleton}
          />
          <DGSkeleton width="100%" height={120} />
        </View>
      ) : loadError ? (
        <View style={styles.body}>
          <Text style={styles.errorTitle}>
            Portfolio could not be loaded
          </Text>
          <Text style={styles.errorBody}>{loadError}</Text>
          <DGButton
            title="Retry"
            fullWidth
            onPress={() => {
              void loadCollection();
            }}
            accessibilityLabel="Retry loading Professional portfolio"
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
                Show examples of your work. These are your
                claimed projects, not Direct Gain jobs, and they
                are not verified.
              </Text>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>PROJECTS</Text>
                <Text style={styles.count}>
                  {projects.length}/{PROFESSIONAL_PORTFOLIO_PROJECTS_MAX}
                </Text>
              </View>

              {projects.length === 0 ? (
                <Text style={styles.emptyCopy}>
                  No projects yet. Add a title, 1–5 photos, then
                  save.
                </Text>
              ) : (
                projects.map((item, index) => {
                  const cover = item.media[0];
                  const coverUri = cover
                    ? mediaPreviewUri(cover)
                    : null;

                  return (
                    <View key={item.id} style={styles.projectCard}>
                      <View style={styles.listCoverWrap}>
                        {coverUri ? (
                          <Image
                            source={{ uri: coverUri }}
                            style={styles.listCover}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.listCoverFallback} />
                        )}
                      </View>
                      <Text style={styles.projectTitle} numberOfLines={2}>
                        {item.title.trim() || 'Untitled project'}
                      </Text>
                      <Text style={styles.projectMeta}>
                        {item.media.length}/
                        {PROFESSIONAL_PORTFOLIO_MEDIA_MAX} photos
                        {item.media.length > 0
                          ? ' · first photo is the cover'
                          : ''}
                      </Text>
                      <OwnerActions
                        disabled={saving}
                        canMoveUp={index > 0}
                        canMoveDown={index < projects.length - 1}
                        onEdit={() => {
                          openExistingProject(index);
                        }}
                        onMoveUp={() => {
                          setProjects(current =>
                            moveItem(current, index, -1),
                          );
                        }}
                        onMoveDown={() => {
                          setProjects(current =>
                            moveItem(current, index, 1),
                          );
                        }}
                        onRemove={() => {
                          confirmRemoveProject(index);
                        }}
                      />
                    </View>
                  );
                })
              )}

              <DGButton
                title="Add project"
                variant="outline"
                fullWidth
                disabled={
                  saving ||
                  projects.length >=
                    PROFESSIONAL_PORTFOLIO_PROJECTS_MAX
                }
                onPress={openNewProject}
                accessibilityLabel="Add portfolio project"
              />

              {saveError ? (
                <Text style={styles.saveError}>{saveError}</Text>
              ) : null}

              <DGButton
                title={saving ? 'Saving…' : 'Save portfolio'}
                fullWidth
                disabled={saving}
                onPress={() => {
                  void handleSave();
                }}
                accessibilityLabel="Save Professional portfolio"
              />
            </ScrollView>
          ) : projectForm ? (
            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.helper}>
                First photo is the cover. Reorder photos with
                the arrows.
              </Text>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>PHOTOS</Text>
                <Text style={styles.count}>
                  {projectForm.media.length}/
                  {PROFESSIONAL_PORTFOLIO_MEDIA_MAX}
                </Text>
              </View>

              {projectForm.media.length === 0 ? (
                <Text style={styles.emptyCopy}>
                  Add at least one photo to keep this project.
                </Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.photoRow}
                >
                  {projectForm.media.map((photo, photoIndex) => {
                    const uri = mediaPreviewUri(photo);

                    return (
                      <View
                        key={photo.draftKey}
                        style={styles.photoTile}
                      >
                        {uri ? (
                          <Image
                            source={{ uri }}
                            style={styles.photoImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.photoFallback} />
                        )}
                        {photoIndex === 0 ? (
                          <Text style={styles.coverLabel}>
                            Cover
                          </Text>
                        ) : null}
                        <View style={styles.photoActions}>
                          <IconAction
                            icon="chevron-back"
                            label="Move photo left"
                            disabled={saving || photoIndex === 0}
                            onPress={() => {
                              setProjectForm(current =>
                                current
                                  ? {
                                      ...current,
                                      media: moveItem(
                                        current.media,
                                        photoIndex,
                                        -1,
                                      ),
                                    }
                                  : current,
                              );
                            }}
                          />
                          <IconAction
                            icon="chevron-forward"
                            label="Move photo right"
                            disabled={
                              saving ||
                              photoIndex ===
                                projectForm.media.length - 1
                            }
                            onPress={() => {
                              setProjectForm(current =>
                                current
                                  ? {
                                      ...current,
                                      media: moveItem(
                                        current.media,
                                        photoIndex,
                                        1,
                                      ),
                                    }
                                  : current,
                              );
                            }}
                          />
                          <IconAction
                            icon="close"
                            label="Remove photo"
                            disabled={saving}
                            onPress={() => {
                              setProjectForm(current =>
                                current
                                  ? {
                                      ...current,
                                      media: current.media.filter(
                                        (_, index) =>
                                          index !== photoIndex,
                                      ),
                                    }
                                  : current,
                              );
                            }}
                          />
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              )}

              <DGButton
                title="Add photos"
                variant="outline"
                fullWidth
                disabled={
                  saving ||
                  projectForm.media.length >=
                    PROFESSIONAL_PORTFOLIO_MEDIA_MAX
                }
                onPress={() => {
                  void addPhotosToForm();
                }}
                accessibilityLabel="Add portfolio photos"
              />

              <DGInput
                label="Project title"
                value={projectForm.title}
                onChangeText={value => {
                  setProjectForm(current =>
                    current
                      ? { ...current, title: value }
                      : current,
                  );
                  setFormError(null);
                }}
                editable={!saving}
                maxLength={PROFESSIONAL_PORTFOLIO_TITLE_MAX}
                helperText="Required. 2–80 characters."
                accessibilityLabel="Portfolio project title"
              />

              <DGInput
                label="Description"
                value={projectForm.description}
                onChangeText={value => {
                  setProjectForm(current =>
                    current
                      ? { ...current, description: value }
                      : current,
                  );
                  setFormError(null);
                }}
                editable={!saving}
                multiline
                maxLength={PROFESSIONAL_PORTFOLIO_DESCRIPTION_MAX}
                helperText="Optional. 800 characters or fewer."
                accessibilityLabel="Portfolio project description"
              />

              {formError ? (
                <Text style={styles.saveError}>{formError}</Text>
              ) : null}

              <DGButton
                title={
                  panel.index == null
                    ? 'Add to list'
                    : 'Update project'
                }
                fullWidth
                disabled={saving}
                onPress={applyProjectForm}
                accessibilityLabel={
                  panel.index == null
                    ? 'Add project to list'
                    : 'Update portfolio project'
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

function IconAction({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon:
    | 'chevron-up'
    | 'chevron-down'
    | 'chevron-back'
    | 'chevron-forward'
    | 'close';
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

  helper: {
    color: textColor.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  sectionLabel: {
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

  projectCard: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    gap: 6,
  },

  listCoverWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: alpha.white08,
  },

  listCover: {
    width: '100%',
    height: '100%',
  },

  listCoverFallback: {
    flex: 1,
  },

  projectTitle: {
    color: textColor.primary,
    fontSize: 15,
    fontWeight: '800',
  },

  projectMeta: {
    color: textColor.muted,
    fontSize: 12,
    fontWeight: '600',
  },

  photoRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },

  photoTile: {
    width: 132,
    gap: 4,
  },

  photoImage: {
    width: 132,
    height: 96,
    borderRadius: radius.sm,
    backgroundColor: alpha.white08,
  },

  photoFallback: {
    width: 132,
    height: 96,
    borderRadius: radius.sm,
    backgroundColor: alpha.white08,
  },

  coverLabel: {
    color: palette.opportunityGreen,
    fontSize: 11,
    fontWeight: '800',
  },

  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actions: {
    marginTop: 2,
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
