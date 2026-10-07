import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
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

import DGButton from '../components/DGButton';
import DGCard from '../components/DGCard';
import DGChip from '../components/DGChip';
import DGHeader from '../components/DGHeader';
import DGInput from '../components/DGInput';
import CreateListingPhotos, {
  type CreateListingPhotoItem,
} from '../components/market/CreateListingPhotos';

import useTabBarVisibility from '../hooks/useTabBarVisibility';

import type { CreateStackParamList } from '../navigation/CreateStack';

import {
  createDraftListing,
  deleteListingPhoto,
  getOwnListing,
  getOwnListingMedia,
  getViewerListingRegion,
  listOwnDrafts,
  reorderListingMedia,
  updateOwnDraft,
  uploadListingPhoto,
} from '../services/market/marketListingsRepository';
import { pickAndPrepareMarketListingPhotos } from '../services/market/pickMarketListingPhotos';

import {
  alpha,
  palette,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../theme/designSystem';

import {
  MARKET_LISTING_CATEGORIES,
  MARKET_LISTING_CONDITIONS,
  MARKET_LISTING_MEDIA_MAX,
  type MarketListingCategory,
  type MarketListingCondition,
  type MarketListingDraft,
  type MarketListingMediaPresentation,
  type MarketListingPendingPhoto,
} from '../types/marketListing';

import {
  emptyListingFormSnapshot,
  listingFormSnapshotFromValues,
  listingFormSnapshotsEqual,
  LISTING_FORM_MAX_DESCRIPTION,
  LISTING_FORM_MAX_STATE,
  LISTING_FORM_MAX_SUBCATEGORY,
  LISTING_FORM_MAX_SUBURB,
  LISTING_FORM_MAX_TITLE,
  parseListingPrice,
  sanitizeListingPriceInput,
  validateListingForm,
  type ListingFormErrors,
  type ListingFormSnapshot,
} from '../utils/market/listingFormValidation';
import formatListingPrice from '../utils/listing/formatListingPrice';

type Props = NativeStackScreenProps<
  CreateStackParamList,
  'CreateListing'
>;

type FormErrors = ListingFormErrors;
type FormSnapshot = ListingFormSnapshot;

type ComposerPhoto =
  | {
      kind: 'server';
      id: string;
      uri: string;
      media: MarketListingMediaPresentation;
    }
  | {
      kind: 'pending';
      id: string;
      uri: string;
      photo: MarketListingPendingPhoto;
    };

function emptySnapshot(): FormSnapshot {
  return emptyListingFormSnapshot();
}

function snapshotFromDraft(
  listing: MarketListingDraft,
): FormSnapshot {
  return listingFormSnapshotFromValues(listing);
}

function snapshotsEqual(
  left: FormSnapshot,
  right: FormSnapshot,
): boolean {
  return listingFormSnapshotsEqual(left, right);
}

function toDisplayPhotos(
  photos: ComposerPhoto[],
): CreateListingPhotoItem[] {
  return photos.map((photo) => ({
    id: photo.id,
    uri: photo.uri,
  }));
}

function serverComposerPhoto(
  media: MarketListingMediaPresentation,
): ComposerPhoto {
  return {
    kind: 'server',
    id: media.id,
    uri: media.signedUrl,
    media,
  };
}

function pendingComposerPhoto(
  photo: MarketListingPendingPhoto,
): ComposerPhoto {
  return {
    kind: 'pending',
    id: photo.localId,
    uri: photo.uri,
    photo,
  };
}

export default function CreateListingScreen({
  navigation,
  route,
}: Props) {
  const { hideTabBar, showTabBar } =
    useTabBarVisibility();

  const mountedRef = useRef(true);
  const previewingRef = useRef(false);
  const uploadingRef = useRef(false);
  const reorderingRef = useRef(false);
  const allowLeaveRef = useRef(false);
  const listingIdRef = useRef<string | null>(null);
  const persistedRef = useRef<FormSnapshot>(
    emptySnapshot(),
  );
  const formRef = useRef<FormSnapshot>(emptySnapshot());
  const composerPhotosRef = useRef<ComposerPhoto[]>([]);

  const [loadState, setLoadState] = useState<
    'loading' | 'choice' | 'ready' | 'error'
  >('loading');
  const [resumeDraft, setResumeDraft] =
    useState<MarketListingDraft | null>(null);
  const [resumeDraftCount, setResumeDraftCount] = useState(0);
  const [resumeCoverUrl, setResumeCoverUrl] = useState<string | null>(
    null,
  );
  const [resumePhotoCount, setResumePhotoCount] = useState(0);
  const [listingId, setListingId] = useState<
    string | null
  >(null);
  const [previewing, setPreviewing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [photosDragging, setPhotosDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [composerPhotos, setComposerPhotos] = useState<
    ComposerPhoto[]
  >([]);
  const [photosError, setPhotosError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] =
    useState<MarketListingCategory | null>(null);
  const [subcategory, setSubcategory] = useState('');
  const [condition, setCondition] =
    useState<MarketListingCondition | null>(null);
  const [priceText, setPriceText] = useState('');
  const [suburb, setSuburb] = useState('');
  const [state, setState] = useState('');
  const [pickupAvailable, setPickupAvailable] =
    useState(true);
  const [deliveryAvailable, setDeliveryAvailable] =
    useState(false);
  const [allowsOffers, setAllowsOffers] = useState(true);

  const currentSnapshot: FormSnapshot = {
    title,
    description,
    category,
    subcategory,
    condition,
    priceText,
    suburb,
    state,
    pickupAvailable,
    deliveryAvailable,
    allowsOffers,
  };

  formRef.current = currentSnapshot;
  listingIdRef.current = listingId;
  composerPhotosRef.current = composerPhotos;

  const parsedPrice = parseListingPrice(priceText);
  const isFreePrice = parsedPrice.ok && parsedPrice.amount === 0;

  useFocusEffect(
    useCallback(() => {
      hideTabBar();

      return () => {
        showTabBar();
      };
    }, [hideTabBar, showTabBar]),
  );

  const applySnapshot = useCallback(
    (snapshot: FormSnapshot) => {
      setTitle(snapshot.title);
      setDescription(snapshot.description);
      setCategory(snapshot.category);
      setSubcategory(snapshot.subcategory);
      setCondition(snapshot.condition);
      setPriceText(snapshot.priceText);
      setSuburb(snapshot.suburb);
      setState(snapshot.state);
      setPickupAvailable(snapshot.pickupAvailable);
      setDeliveryAvailable(snapshot.deliveryAvailable);
      setAllowsOffers(snapshot.allowsOffers);
      formRef.current = snapshot;
    },
    [],
  );

  const loadPhotos = useCallback(async (id: string) => {
    const result = await getOwnListingMedia(id);

    if (!mountedRef.current) {
      return;
    }

    if (result.error) {
      setComposerPhotos([]);
      composerPhotosRef.current = [];
      setPhotosError(result.error);
      return;
    }

    setPhotosError(null);
    const next = result.media.map(serverComposerPhoto);
    composerPhotosRef.current = next;
    setComposerPhotos(next);
  }, []);

  const loadBlankForm = useCallback(async () => {
    const blank = emptySnapshot();
    const region = await getViewerListingRegion();

    if (!mountedRef.current) {
      return;
    }

    const next: FormSnapshot = {
      ...blank,
      suburb: region.suburb ?? '',
      state: region.state ?? '',
    };

    applySnapshot(next);
    persistedRef.current = next;
    listingIdRef.current = null;
    setListingId(null);
    composerPhotosRef.current = [];
    setComposerPhotos([]);
    setPhotosError(null);
    setResumeDraft(null);
    setResumeDraftCount(0);
    setResumeCoverUrl(null);
    setResumePhotoCount(0);
    setErrors({});
  }, [applySnapshot]);

  const openDraftEditor = useCallback(
    async (listing: MarketListingDraft) => {
      const snapshot = snapshotFromDraft(listing);
      applySnapshot(snapshot);
      persistedRef.current = snapshot;
      listingIdRef.current = listing.id;
      setListingId(listing.id);
      setResumeDraft(null);
      await loadPhotos(listing.id);

      if (mountedRef.current) {
        setLoadState('ready');
      }
    },
    [applySnapshot, loadPhotos],
  );

  const loadEditor = useCallback(async () => {
    setLoadState('loading');
    setErrors({});

    const requestedId =
      route.params?.listingId?.trim() ?? '';

    if (requestedId) {
      const result = await getOwnListing(requestedId);

      if (!mountedRef.current) {
        return;
      }

      if (result.error || !result.listing) {
        setLoadState('error');
        return;
      }

      const snapshot = snapshotFromDraft(result.listing);
      applySnapshot(snapshot);
      persistedRef.current = snapshot;
      listingIdRef.current = result.listing.id;
      setListingId(result.listing.id);
      await loadPhotos(result.listing.id);
      setLoadState('ready');
      return;
    }

    const drafts = await listOwnDrafts();

    if (!mountedRef.current) {
      return;
    }

    if (drafts.error) {
      setLoadState('error');
      return;
    }

    const latest = drafts.listings[0];

    if (!latest) {
      await loadBlankForm();
      if (mountedRef.current) {
        setLoadState('ready');
      }
      return;
    }

    const media = await getOwnListingMedia(latest.id);

    if (!mountedRef.current) {
      return;
    }

    setResumeDraft(latest);
    setResumeDraftCount(drafts.listings.length);
    setResumePhotoCount(media.error ? 0 : media.media.length);
    setResumeCoverUrl(
      media.error ? null : media.media[0]?.signedUrl ?? null,
    );
    setLoadState('choice');
  }, [applySnapshot, loadBlankForm, loadPhotos, route.params?.listingId]);

  useEffect(() => {
    mountedRef.current = true;
    void loadEditor();

    return () => {
      mountedRef.current = false;
    };
  }, [loadEditor]);

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      'beforeRemove',
      (event) => {
        if (allowLeaveRef.current) {
          return;
        }

        if (
          previewingRef.current ||
          uploadingRef.current ||
          reorderingRef.current
        ) {
          event.preventDefault();
          return;
        }

        const formDirty = !snapshotsEqual(
          formRef.current,
          persistedRef.current,
        );
        const hasPendingPhotos = composerPhotosRef.current.some(
          (photo) => photo.kind === 'pending',
        );

        if (!formDirty && !hasPendingPhotos) {
          return;
        }

        event.preventDefault();

        Alert.alert(
          'Leave without finishing?',
          'Unsaved edits and photos still only on this screen will be lost. Any listing already saved in My Listings stays there.',
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

    return unsubscribe;
  }, [navigation]);

  function validate(): FormErrors | null {
    return validateListingForm(formRef.current);
  }

  function listingPayload(snapshot: FormSnapshot) {
    const parsed = parseListingPrice(snapshot.priceText);

    if (
      !snapshot.category ||
      !snapshot.condition ||
      !parsed.ok
    ) {
      return null;
    }

    return {
      title: snapshot.title,
      description: snapshot.description,
      category: snapshot.category,
      subcategory: snapshot.subcategory,
      condition: snapshot.condition,
      price: parsed.amount,
      allowsOffers: snapshot.allowsOffers,
      pickupAvailable: snapshot.pickupAvailable,
      deliveryAvailable: snapshot.deliveryAvailable,
      suburb: snapshot.suburb,
      state: snapshot.state,
    };
  }

  async function handleAddPhotos() {
    if (
      previewingRef.current ||
      uploadingRef.current ||
      reorderingRef.current ||
      photosError ||
      composerPhotosRef.current.length >= MARKET_LISTING_MEDIA_MAX
    ) {
      return;
    }

    const remaining =
      MARKET_LISTING_MEDIA_MAX - composerPhotosRef.current.length;
    const picked = await pickAndPrepareMarketListingPhotos(remaining);

    if (!mountedRef.current) {
      return;
    }

    if (picked.kind === 'permission_denied') {
      Alert.alert(
        'Photo access needed',
        'Direct Gain needs access to your photo library so you can add pictures to a listing.',
      );
      return;
    }

    if (picked.kind === 'unavailable') {
      Alert.alert('Unable to add photos', picked.message);
      return;
    }

    if (picked.kind === 'cancelled') {
      return;
    }

    if (picked.photos.length === 0) {
      if (picked.failedCount > 0) {
        Alert.alert(
          'Photos could not be added',
          'The selected photos could not be prepared. Try different images.',
        );
      }
      return;
    }

    const currentId = listingIdRef.current;

    if (!currentId) {
      const next = [
        ...composerPhotosRef.current,
        ...picked.photos.map(pendingComposerPhoto),
      ];
      composerPhotosRef.current = next;
      setComposerPhotos(next);

      if (picked.failedCount > 0) {
        Alert.alert(
          'Some photos could not be added',
          picked.failedCount === 1
            ? 'One selected photo could not be prepared. You can try it again.'
            : `${picked.failedCount} selected photos could not be prepared. You can try them again.`,
        );
      }
      return;
    }

    uploadingRef.current = true;
    setUploading(true);

    let uploaded = 0;
    let failed = picked.failedCount;

    for (let index = 0; index < picked.photos.length; index += 1) {
      if (!mountedRef.current) {
        return;
      }

      setUploadProgress({
        current: index + 1,
        total: picked.photos.length,
      });

      const result = await uploadListingPhoto(
        currentId,
        picked.photos[index],
      );

      if (result.media) {
        uploaded += 1;
        const next = [
          ...composerPhotosRef.current,
          serverComposerPhoto(result.media),
        ];
        composerPhotosRef.current = next;
        setComposerPhotos(next);
      } else {
        failed += 1;
      }
    }

    if (!mountedRef.current) {
      return;
    }

    uploadingRef.current = false;
    setUploading(false);
    setUploadProgress(null);

    if (failed > 0 && uploaded === 0) {
      Alert.alert(
        'Photos could not be added',
        failed === 1
          ? 'That photo could not be uploaded. Try a different image.'
          : 'Those photos could not be uploaded. Try different images.',
      );
      return;
    }

    if (failed > 0) {
      Alert.alert(
        'Some photos could not be added',
        failed === 1
          ? 'One selected photo could not be uploaded. You can try it again.'
          : `${failed} selected photos could not be uploaded. You can try them again.`,
      );
    }
  }

  function handleRemovePhoto(photo: CreateListingPhotoItem) {
    if (
      previewingRef.current ||
      uploadingRef.current ||
      reorderingRef.current
    ) {
      return;
    }

    const current = composerPhotosRef.current.find(
      (item) => item.id === photo.id,
    );

    if (!current) {
      return;
    }

    if (current.kind === 'pending') {
      Alert.alert(
        'Remove photo?',
        'This photo will be removed. It has not been saved yet.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              const next = composerPhotosRef.current.filter(
                (item) => item.id !== photo.id,
              );
              composerPhotosRef.current = next;
              setComposerPhotos(next);
            },
          },
        ],
      );
      return;
    }

    Alert.alert(
      'Remove photo?',
      'This photo will be removed from your listing.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              uploadingRef.current = true;
              setUploading(true);

              const result = await deleteListingPhoto(current.media);

              if (!mountedRef.current) {
                return;
              }

              if (result.error) {
                uploadingRef.current = false;
                setUploading(false);
                Alert.alert(
                  'Photo could not be removed',
                  result.error,
                );
                return;
              }

              const pending = composerPhotosRef.current.filter(
                  (item) => item.kind === 'pending',
                );
                const listingId = listingIdRef.current;

                if (listingId) {
                  await loadPhotos(listingId);
                  if (pending.length > 0) {
                    const merged = [
                      ...composerPhotosRef.current,
                      ...pending,
                    ];
                    composerPhotosRef.current = merged;
                    setComposerPhotos(merged);
                  }
                } else {
                  const next = composerPhotosRef.current.filter(
                    (item) => item.id !== photo.id,
                  );
                  composerPhotosRef.current = next;
                  setComposerPhotos(next);
                }

              uploadingRef.current = false;
              setUploading(false);

              if (result.cleanupWarning) {
                Alert.alert('Photo removed', result.cleanupWarning);
              }
            })();
          },
        },
      ],
    );
  }

  async function handleReorderPhotos(
    nextPhotos: CreateListingPhotoItem[],
  ) {
    if (
      previewingRef.current ||
      uploadingRef.current ||
      reorderingRef.current
    ) {
      return;
    }

    const byId = new Map(
      composerPhotosRef.current.map((photo) => [photo.id, photo]),
    );
    const nextComposer: ComposerPhoto[] = [];

    for (const item of nextPhotos) {
      const current = byId.get(item.id);
      if (current) {
        nextComposer.push(current);
      }
    }

    composerPhotosRef.current = nextComposer;
    setComposerPhotos(nextComposer);

    const currentId = listingIdRef.current;
    const serverIds = nextComposer
      .filter((photo) => photo.kind === 'server')
      .map((photo) => photo.id);

    if (
      !currentId ||
      nextComposer.some((photo) => photo.kind === 'pending')
    ) {
      return;
    }

    reorderingRef.current = true;
    setReordering(true);

    const result = await reorderListingMedia(currentId, serverIds);

    if (!mountedRef.current) {
      return;
    }

    if (result.error) {
      await loadPhotos(currentId);
      reorderingRef.current = false;
      setReordering(false);
      Alert.alert(
        "Couldn't save photo order",
        "Couldn't save photo order. Please try again.",
      );
      return;
    }

    reorderingRef.current = false;
    setReordering(false);
  }

  function handleStartNewListing() {
    if (
      previewingRef.current ||
      uploadingRef.current ||
      reorderingRef.current
    ) {
      return;
    }

    Alert.alert(
      'Start a new listing?',
      'Your current unfinished listing stays saved. This screen will be cleared.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Start new listing',
          onPress: () => {
            void (async () => {
              await loadBlankForm();
            })();
          },
        },
      ],
    );
  }

  async function handlePreviewPress() {
    if (
      previewingRef.current ||
      uploadingRef.current ||
      reorderingRef.current ||
      loadState !== 'ready'
    ) {
      return;
    }

    Keyboard.dismiss();

    const nextErrors = validate();

    if (nextErrors) {
      setErrors(nextErrors);
      return;
    }

    if (composerPhotosRef.current.length < 1) {
      setErrors({
        form: 'Add at least one photo before previewing.',
      });
      return;
    }

    const snapshot = formRef.current;
    const payload = listingPayload(snapshot);

    if (!payload) {
      return;
    }

    previewingRef.current = true;
    setPreviewing(true);
    setErrors({});

    let currentId = listingIdRef.current;

    if (!currentId) {
      const created = await createDraftListing(payload);

      if (!mountedRef.current) {
        return;
      }

      if (created.error || !created.listing) {
        previewingRef.current = false;
        setPreviewing(false);
        setErrors({
          form:
            created.error ??
            'This listing could not be prepared for preview. Try again.',
        });
        return;
      }

      currentId = created.listing.id;
      listingIdRef.current = currentId;
      setListingId(currentId);
      const saved = snapshotFromDraft(created.listing);
      applySnapshot(saved);
      persistedRef.current = saved;
    } else if (!snapshotsEqual(snapshot, persistedRef.current)) {
      const updated = await updateOwnDraft(currentId, payload);

      if (!mountedRef.current) {
        return;
      }

      if (updated.error || !updated.listing) {
        previewingRef.current = false;
        setPreviewing(false);
        setErrors({
          form:
            updated.error ??
            'This listing could not be updated. Try again.',
        });
        return;
      }

      const saved = snapshotFromDraft(updated.listing);
      applySnapshot(saved);
      persistedRef.current = saved;
    }

    const pendingRows = composerPhotosRef.current
      .map((photo, index) => ({ photo, index }))
      .filter((row) => row.photo.kind === 'pending');

    if (pendingRows.length > 0) {
      setUploadProgress({
        current: 0,
        total: pendingRows.length,
      });
    }

    let uploadFailed = 0;

    for (let index = 0; index < pendingRows.length; index += 1) {
      if (!mountedRef.current) {
        return;
      }

      const pending = pendingRows[index];

      if (pending.photo.kind !== 'pending') {
        continue;
      }

      setUploadProgress({
        current: index + 1,
        total: pendingRows.length,
      });

      const result = await uploadListingPhoto(
        currentId,
        pending.photo.photo,
      );

      if (!result.media) {
        uploadFailed += 1;
        continue;
      }

      const next = [...composerPhotosRef.current];
      next[pending.index] = serverComposerPhoto(result.media);
      composerPhotosRef.current = next;
      setComposerPhotos(next);
    }

    if (!mountedRef.current) {
      return;
    }

    setUploadProgress(null);

    const remainingPending = composerPhotosRef.current.some(
      (photo) => photo.kind === 'pending',
    );

    if (uploadFailed > 0 || remainingPending) {
      previewingRef.current = false;
      setPreviewing(false);
      setErrors({
        form:
          'Some photos could not be uploaded. Your listing is saved as a draft. Try Preview again.',
      });
      return;
    }

    const orderedIds = composerPhotosRef.current
      .filter((photo) => photo.kind === 'server')
      .map((photo) => photo.id);

    if (orderedIds.length > 1) {
      const reordered = await reorderListingMedia(currentId, orderedIds);

      if (!mountedRef.current) {
        return;
      }

      if (reordered.error) {
        previewingRef.current = false;
        setPreviewing(false);
        setErrors({
          form:
            'Photos uploaded, but order could not be saved. Try Preview again.',
        });
        return;
      }
    }

    previewingRef.current = false;
    setPreviewing(false);
    navigation.navigate('ListingPreview', {
      listingId: currentId,
    });
  }

  function handleBackPress() {
    if (
      previewingRef.current ||
      uploadingRef.current ||
      reorderingRef.current
    ) {
      return;
    }

    navigation.goBack();
  }

  if (loadState === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <DGHeader
          showBackButton
          title="Create listing"
          onBackPress={handleBackPress}
        />
        <View style={styles.centered}>
          <ActivityIndicator
            color={palette.opportunityGreen}
          />
          <Text style={styles.loadingCopy}>
            Loading your draft
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadState === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <DGHeader
          showBackButton
          title="Create listing"
          onBackPress={handleBackPress}
        />
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>
            Couldn't load your draft
          </Text>
          <Text style={styles.errorBody}>
            Check your connection and try again. Direct
            Gain will not start a new listing until this
            draft can be loaded.
          </Text>
          <DGButton
            title="Retry"
            onPress={() => {
              void loadEditor();
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (loadState === 'choice' && resumeDraft) {
    const locationLabel = `${resumeDraft.suburb}, ${resumeDraft.state}`;
    const photoLabel =
      resumePhotoCount === 1
        ? '1 photo'
        : `${resumePhotoCount} photos`;

    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <DGHeader
          showBackButton
          title="Create listing"
          onBackPress={handleBackPress}
        />

        <ScrollView
          contentContainerStyle={styles.choiceContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.choiceEyebrow}>
            UNFINISHED LISTING
          </Text>
          <Text style={styles.choiceTitle}>
            You have an unfinished listing
          </Text>
          {resumeDraftCount > 1 ? (
            <Text style={styles.choiceHint}>
              {`You have ${resumeDraftCount} saved drafts`}
            </Text>
          ) : (
            <Text style={styles.choiceHint}>
              Continue this draft or start a new listing.
              Your existing draft stays saved.
            </Text>
          )}

          <DGCard
            variant="raised"
            contentStyle={styles.draftCard}
          >
            {resumeCoverUrl ? (
              <Image
                source={{ uri: resumeCoverUrl }}
                style={styles.draftCover}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
                accessibilityLabel="Draft cover photo"
              />
            ) : (
              <View
                style={styles.draftCoverPlaceholder}
                accessibilityLabel="No cover photo yet"
              >
                <Ionicons
                  name="image-outline"
                  size={22}
                  color={textColor.muted}
                />
              </View>
            )}

            <View style={styles.draftCopy}>
              <View style={styles.draftMetaRow}>
                <Text style={styles.draftBadge}>Draft</Text>
                <Text style={styles.draftPhotos}>{photoLabel}</Text>
              </View>
              <Text
                style={styles.draftListingTitle}
                numberOfLines={2}
              >
                {resumeDraft.title}
              </Text>
              <Text style={styles.draftPrice}>
                {formatListingPrice(
                  resumeDraft.price,
                  resumeDraft.currency,
                )}
              </Text>
              <Text
                style={styles.draftLocation}
                numberOfLines={1}
              >
                {locationLabel}
              </Text>
            </View>
          </DGCard>

          <DGButton
            title="Continue draft"
            fullWidth
            onPress={() => {
              void openDraftEditor(resumeDraft);
            }}
            accessibilityLabel="Continue draft"
            accessibilityHint="Opens your most recent unfinished listing"
          />

          <DGButton
            title="Start new listing"
            variant="outline"
            fullWidth
            onPress={() => {
              void (async () => {
                await loadBlankForm();
                if (mountedRef.current) {
                  setLoadState('ready');
                }
              })();
            }}
            accessibilityLabel="Start new listing"
            accessibilityHint="Opens a blank listing. Your existing draft stays saved."
            style={styles.choiceSecondary}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DGHeader
        showBackButton
        title="Create listing"
        onBackPress={handleBackPress}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!photosDragging}
        >
          <View style={styles.content}>
            <Text style={styles.intro}>
              Preview your listing before it goes on the Market.
            </Text>

            <CreateListingPhotos
              photos={toDisplayPhotos(composerPhotos)}
              disabled={previewing || uploading || reordering}
              uploading={uploading || reordering || previewing}
              uploadProgress={uploadProgress}
              loadError={photosError}
              onAdd={() => {
                void handleAddPhotos();
              }}
              onRemove={handleRemovePhoto}
              onReorder={(nextPhotos) => {
                void handleReorderPhotos(nextPhotos);
              }}
              onRetryLoad={() => {
                const currentId = listingIdRef.current;
                if (currentId) {
                  void loadPhotos(currentId);
                }
              }}
              onDragSessionChange={setPhotosDragging}
            />

            <DGInput
              label="Title"
              value={title}
              onChangeText={setTitle}
              placeholder="What are you selling?"
              maxLength={LISTING_FORM_MAX_TITLE}
              editable={!previewing}
              errorMessage={errors.title}
              autoCapitalize="sentences"
            />

            <DGInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Condition, inclusions, and anything a buyer should know"
              maxLength={LISTING_FORM_MAX_DESCRIPTION}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!previewing}
              errorMessage={errors.description}
              helperText={
                errors.description
                  ? undefined
                  : `${description.trim().length}/${LISTING_FORM_MAX_DESCRIPTION}`
              }
              autoCapitalize="sentences"
              inputContainerStyle={styles.descriptionInput}
              inputStyle={styles.descriptionField}
            />

            <Text style={styles.section}>Category</Text>
            <View style={styles.chipWrap}>
              {MARKET_LISTING_CATEGORIES.map((value) => (
                <DGChip
                  key={value}
                  size="compact"
                  label={value}
                  selected={category === value}
                  disabled={previewing}
                  onPress={() => {
                    setCategory(value);
                  }}
                  style={styles.chip}
                />
              ))}
            </View>
            {errors.category ? (
              <Text style={styles.error}>{errors.category}</Text>
            ) : null}

            <DGInput
              label="Type"
              value={subcategory}
              onChangeText={setSubcategory}
              placeholder="e.g. Mountain bike, sofa, iPhone"
              maxLength={LISTING_FORM_MAX_SUBCATEGORY}
              editable={!previewing}
              errorMessage={errors.subcategory}
              helperText={
                errors.subcategory
                  ? undefined
                  : 'Describe the item type. This is saved as the listing type.'
              }
              autoCapitalize="sentences"
            />

            <Text style={styles.section}>Condition</Text>
            <View style={styles.chipWrap}>
              {MARKET_LISTING_CONDITIONS.map((value) => (
                <DGChip
                  key={value}
                  size="compact"
                  label={value}
                  selected={condition === value}
                  disabled={previewing}
                  onPress={() => {
                    setCondition(value);
                  }}
                  style={styles.chip}
                />
              ))}
            </View>
            {errors.condition ? (
              <Text style={styles.error}>{errors.condition}</Text>
            ) : null}

            <Text style={styles.section}>Price</Text>
            <View style={styles.priceRow}>
              <View
                style={[
                  styles.currencyPrefix,
                  errors.price
                    ? styles.currencyPrefixError
                    : null,
                  previewing
                    ? styles.currencyPrefixDisabled
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.currencySymbol,
                    previewing
                      ? styles.currencySymbolDisabled
                      : null,
                  ]}
                >
                  A$
                </Text>
              </View>
              <View style={styles.priceInputWrap}>
                <DGInput
                  value={priceText}
                  onChangeText={(value) => {
                    const next = sanitizeListingPriceInput(value);
                    setPriceText(next);
                    const parsed = parseListingPrice(next);
                    if (parsed.ok && parsed.amount === 0) {
                      setAllowsOffers(false);
                    }
                  }}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  editable={!previewing}
                  errorMessage={errors.price}
                  containerStyle={styles.priceInput}
                />
              </View>
            </View>

            <Text style={styles.section}>Location</Text>
            <Text style={styles.locationHint}>
              Suburb and state only. Do not enter a street
              address.
            </Text>
            <DGInput
              label="Suburb"
              value={suburb}
              onChangeText={setSuburb}
              placeholder="Suburb"
              maxLength={LISTING_FORM_MAX_SUBURB}
              editable={!previewing}
              errorMessage={errors.suburb}
              autoCapitalize="words"
            />
            <DGInput
              label="State"
              value={state}
              onChangeText={setState}
              placeholder="State"
              maxLength={LISTING_FORM_MAX_STATE}
              editable={!previewing}
              errorMessage={errors.state}
              autoCapitalize="characters"
            />

            <Text style={styles.section}>Fulfilment</Text>
            <View style={styles.chipWrap}>
              <DGChip
                size="compact"
                label="Pickup available"
                selected={pickupAvailable}
                disabled={previewing}
                onPress={() => {
                  setPickupAvailable((current) => !current);
                }}
                style={styles.chip}
              />
              <DGChip
                size="compact"
                label="Delivery available"
                selected={deliveryAvailable}
                disabled={previewing}
                onPress={() => {
                  setDeliveryAvailable((current) => !current);
                }}
                style={styles.chip}
              />
            </View>
            {errors.fulfilment ? (
              <Text style={styles.error}>
                {errors.fulfilment}
              </Text>
            ) : null}

            <Text style={styles.section}>Offers</Text>
            <View style={styles.chipWrap}>
              <DGChip
                size="compact"
                label="Allow offers"
                selected={allowsOffers}
                disabled={previewing || isFreePrice}
                onPress={() => {
                  if (isFreePrice) {
                    return;
                  }

                  setAllowsOffers(true);
                }}
                style={styles.chip}
              />
              <DGChip
                size="compact"
                label="Fixed price"
                selected={!allowsOffers}
                disabled={previewing}
                onPress={() => {
                  setAllowsOffers(false);
                }}
                style={styles.chip}
              />
            </View>
            {isFreePrice ? (
              <Text style={styles.locationHint}>
                FREE listings do not accept offers.
              </Text>
            ) : null}

            {listingId ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Start new listing"
                accessibilityHint="Clears this form. Your saved draft is kept."
                disabled={previewing}
                onPress={handleStartNewListing}
                style={({ pressed }) => [
                  styles.startNew,
                  pressed && styles.startNewPressed,
                ]}
              >
                <Text style={styles.startNewText}>
                  Start new listing
                </Text>
              </Pressable>
            ) : null}

            {errors.form ? (
              <Text style={styles.formError}>{errors.form}</Text>
            ) : null}

            <DGButton
              title={
                previewing ? 'Preparing preview' : 'Preview Listing'
              }
              fullWidth
              loading={previewing}
              disabled={previewing || uploading || reordering}
              onPress={() => {
                void handlePreviewPress();
              }}
              style={styles.submit}
              accessibilityLabel={
                previewing
                  ? 'Preparing preview'
                  : 'Preview Listing'
              }
              accessibilityHint="Checks your listing, saves it privately, then opens Preview. It is not listed on Market yet."
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

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },

  loadingCopy: {
    color: textColor.secondary,
    fontSize: 15,
    fontWeight: '600',
  },

  errorTitle: {
    color: textColor.primary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '900',
    textAlign: 'center',
  },

  errorBody: {
    color: textColor.secondary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    textAlign: 'center',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.opportunityGreen,
  },

  statusText: {
    ...typography.eyebrow,
    color: textColor.muted,
  },

  intro: {
    color: textColor.secondary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },

  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: alpha.green28,
    backgroundColor: alpha.green12,
  },

  successText: {
    flex: 1,
    color: palette.opportunityGreen,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },

  section: {
    ...typography.eyebrow,
    marginTop: spacing.xs,
    color: textColor.muted,
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

  priceRow: {
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
    fontSize: 16,
    fontWeight: '800',
  },

  currencySymbolDisabled: {
    color: textColor.muted,
  },

  priceInputWrap: {
    flex: 1,
    minWidth: 0,
  },

  priceInput: {
    marginBottom: 0,
  },

  locationHint: {
    marginTop: -spacing.xxs,
    color: textColor.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  startNew: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },

  startNewPressed: {
    opacity: 0.8,
  },

  startNewText: {
    color: palette.opportunityGreen,
    fontSize: 14,
    fontWeight: '800',
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

  preview: {
    marginTop: spacing.xl,
  },

  submit: {
    marginTop: spacing.sm,
  },

  choiceContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.massive,
    gap: spacing.sm,
  },

  choiceEyebrow: {
    ...typography.eyebrow,
    color: textColor.muted,
  },

  choiceTitle: {
    color: textColor.primary,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    letterSpacing: -0.4,
  },

  choiceHint: {
    color: textColor.secondary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },

  draftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },

  draftCover: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: alpha.white05,
  },

  draftCoverPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: alpha.white08,
    alignItems: 'center',
    justifyContent: 'center',
  },

  draftCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },

  draftMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  draftBadge: {
    ...typography.eyebrow,
    color: palette.opportunityGreen,
  },

  draftPhotos: {
    color: textColor.muted,
    fontSize: 12,
    fontWeight: '700',
  },

  draftListingTitle: {
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },

  draftPrice: {
    color: palette.opportunityGreen,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
  },

  draftLocation: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  choiceSecondary: {
    marginTop: spacing.xs,
  },
});
