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
import CreateListingPhotos from '../components/market/CreateListingPhotos';

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
} from '../types/marketListing';

type Props = NativeStackScreenProps<
  CreateStackParamList,
  'CreateListing'
>;

type FormErrors = {
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  condition?: string;
  price?: string;
  suburb?: string;
  state?: string;
  fulfilment?: string;
  form?: string;
};

type FormSnapshot = {
  title: string;
  description: string;
  category: MarketListingCategory | null;
  subcategory: string;
  condition: MarketListingCondition | null;
  priceText: string;
  suburb: string;
  state: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  allowsOffers: boolean;
};

const MAX_TITLE = 120;
const MAX_DESCRIPTION = 4000;
const MAX_SUBCATEGORY = 80;
const MAX_SUBURB = 60;
const MAX_STATE = 40;
const MAX_PRICE = 9_999_999_999.99;

function emptySnapshot(): FormSnapshot {
  return {
    title: '',
    description: '',
    category: null,
    subcategory: '',
    condition: null,
    priceText: '',
    suburb: '',
    state: '',
    pickupAvailable: true,
    deliveryAvailable: false,
    allowsOffers: true,
  };
}

function snapshotFromDraft(
  listing: MarketListingDraft,
): FormSnapshot {
  return {
    title: listing.title,
    description: listing.description,
    category: listing.category,
    subcategory: listing.subcategory,
    condition: listing.condition,
    priceText: formatPriceText(listing.price),
    suburb: listing.suburb,
    state: listing.state,
    pickupAvailable: listing.pickupAvailable,
    deliveryAvailable: listing.deliveryAvailable,
    allowsOffers: listing.allowsOffers,
  };
}

function snapshotsEqual(
  left: FormSnapshot,
  right: FormSnapshot,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function formatPriceText(price: number): string {
  return price.toFixed(2).replace(/\.00$/, '');
}

function sanitizePriceInput(value: string): string {
  const stripped = value.replace(/[$,\s]/g, '');
  const match = stripped.match(/^\d*(?:\.\d{0,2})?/);
  return match?.[0] ?? '';
}

function parsePrice(
  value: string,
):
  | { ok: true; amount: number }
  | { ok: false; error: string } {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      ok: false,
      error: 'Enter a price.',
    };
  }

  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return {
      ok: false,
      error:
        'Enter a valid price with up to two decimal places.',
    };
  }

  const amount = Number(trimmed);

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      ok: false,
      error: 'Price must be greater than 0.',
    };
  }

  if (amount > MAX_PRICE) {
    return {
      ok: false,
      error: 'That price is too large.',
    };
  }

  return {
    ok: true,
    amount: Number(amount.toFixed(2)),
  };
}

export default function CreateListingScreen({
  navigation,
  route,
}: Props) {
  const { hideTabBar, showTabBar } =
    useTabBarVisibility();

  const mountedRef = useRef(true);
  const savingRef = useRef(false);
  const uploadingRef = useRef(false);
  const reorderingRef = useRef(false);
  const allowLeaveRef = useRef(false);
  const listingIdRef = useRef<string | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const persistedRef = useRef<FormSnapshot>(
    emptySnapshot(),
  );
  const formRef = useRef<FormSnapshot>(emptySnapshot());

  const [loadState, setLoadState] = useState<
    'loading' | 'choice' | 'ready' | 'error'
  >('loading');
  const [successMessage, setSuccessMessage] = useState<string | null>(
    null,
  );
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
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [photosDragging, setPhotosDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [photos, setPhotos] = useState<
    MarketListingMediaPresentation[]
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

  const showSuccess = useCallback((message: string) => {
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
    }

    setSuccessMessage(message);
    successTimerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setSuccessMessage(null);
      }
    }, 4200);
  }, []);

  const loadPhotos = useCallback(async (id: string) => {
    const result = await getOwnListingMedia(id);

    if (!mountedRef.current) {
      return;
    }

    if (result.error) {
      setPhotos([]);
      setPhotosError(result.error);
      return;
    }

    setPhotosError(null);
    setPhotos(result.media);
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
    setPhotos([]);
    setPhotosError(null);
    setSuccessMessage(null);
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

      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, [loadEditor]);

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      'beforeRemove',
      (event) => {
        if (allowLeaveRef.current) {
          return;
        }

        if (savingRef.current || uploadingRef.current || reorderingRef.current) {
          event.preventDefault();
          return;
        }

        if (
          snapshotsEqual(
            formRef.current,
            persistedRef.current,
          )
        ) {
          return;
        }

        event.preventDefault();

        Alert.alert(
          'Discard unsaved changes?',
          'Your latest saved draft stays in Direct Gain. Unsaved edits on this screen will be lost.',
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
    const next: FormErrors = {};
    const snapshot = formRef.current;

    if (!snapshot.title.trim()) {
      next.title = 'Enter a title.';
    }

    if (!snapshot.description.trim()) {
      next.description = 'Enter a description.';
    }

    if (!snapshot.category) {
      next.category = 'Choose a category.';
    }

    if (!snapshot.subcategory.trim()) {
      next.subcategory = 'Enter the item type.';
    }

    if (!snapshot.condition) {
      next.condition = 'Choose a condition.';
    }

    const parsed = parsePrice(snapshot.priceText);

    if (!parsed.ok) {
      next.price = parsed.error;
    }

    if (!snapshot.suburb.trim()) {
      next.suburb = 'Enter a suburb.';
    }

    if (!snapshot.state.trim()) {
      next.state = 'Enter a state.';
    }

    if (
      !snapshot.pickupAvailable &&
      !snapshot.deliveryAvailable
    ) {
      next.fulfilment =
        'Choose pickup, delivery, or both.';
    }

    return Object.keys(next).length > 0 ? next : null;
  }

  async function handleSaveDraft() {
    if (
      savingRef.current ||
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

    const snapshot = formRef.current;
    const parsed = parsePrice(snapshot.priceText);

    if (
      !snapshot.category ||
      !snapshot.condition ||
      !parsed.ok
    ) {
      return;
    }

    const payload = {
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

    savingRef.current = true;
    setSaving(true);
    setErrors({});

    const existingId = listingIdRef.current;
    const isFirstSave = !existingId;

    const result = existingId
      ? await updateOwnDraft(existingId, payload)
      : await createDraftListing(payload);

    if (!mountedRef.current) {
      return;
    }

    savingRef.current = false;
    setSaving(false);

    if (result.error || !result.listing) {
      setErrors({
        form:
          result.error ??
          'This listing could not be saved. Try again.',
      });
      return;
    }

    const saved = snapshotFromDraft(result.listing);
    applySnapshot(saved);
    persistedRef.current = saved;
    listingIdRef.current = result.listing.id;
    setListingId(result.listing.id);

    if (isFirstSave) {
      setPhotos([]);
      setPhotosError(null);
      showSuccess('✓ Draft saved — you can add photos now');
    } else {
      showSuccess('✓ Draft saved');
    }
  }

  async function handleAddPhotos() {
    const currentId = listingIdRef.current;

    if (
      !currentId ||
      savingRef.current ||
      uploadingRef.current ||
      reorderingRef.current ||
      photosError ||
      photos.length >= MARKET_LISTING_MEDIA_MAX
    ) {
      return;
    }

    const remaining = MARKET_LISTING_MEDIA_MAX - photos.length;
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
        setPhotos((current) =>
          [...current, result.media as MarketListingMediaPresentation].sort(
            (left, right) => left.sortOrder - right.sortOrder,
          ),
        );
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

  function handleRemovePhoto(photo: MarketListingMediaPresentation) {
    if (savingRef.current || uploadingRef.current || reorderingRef.current) {
      return;
    }

    Alert.alert(
      'Remove photo?',
      'This photo will be removed from your draft.',
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

              const result = await deleteListingPhoto(photo);

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

              const currentId = listingIdRef.current;

              if (currentId) {
                await loadPhotos(currentId);
              } else {
                setPhotos((current) =>
                  current.filter((item) => item.id !== photo.id),
                );
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
    nextPhotos: MarketListingMediaPresentation[],
  ) {
    const currentId = listingIdRef.current;

    if (
      !currentId ||
      savingRef.current ||
      uploadingRef.current ||
      reorderingRef.current
    ) {
      return;
    }

    reorderingRef.current = true;
    setReordering(true);
    setPhotos(nextPhotos);

    const result = await reorderListingMedia(
      currentId,
      nextPhotos.map((photo) => photo.id),
    );

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
    if (savingRef.current || uploadingRef.current || reorderingRef.current) {
      return;
    }

    const dirty = !snapshotsEqual(
      formRef.current,
      persistedRef.current,
    );

    Alert.alert(
      'Start a new listing?',
      dirty
        ? 'Unsaved edits will be discarded. Your previous draft stays saved.'
        : 'Your current draft stays saved. This form will be cleared.',
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

  function handleBackPress() {
    if (savingRef.current || uploadingRef.current || reorderingRef.current) {
      return;
    }

    navigation.goBack();
  }

  const formDirty = !snapshotsEqual(
    currentSnapshot,
    persistedRef.current,
  );

  const statusLabel = !listingId
    ? 'Not saved yet'
    : formDirty
      ? 'Unsaved changes'
      : 'Draft saved';

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
                {`A$${resumeDraft.price.toFixed(2)}`}
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
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {statusLabel}
              </Text>
            </View>

            {successMessage ? (
              <View
                accessibilityLiveRegion="polite"
                accessibilityRole="text"
                accessibilityLabel={successMessage}
                style={styles.successBanner}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={palette.opportunityGreen}
                />
                <Text style={styles.successText}>
                  {successMessage}
                </Text>
              </View>
            ) : null}

            <Text style={styles.intro}>
              {listingId
                ? 'This listing is saved as a draft. It is not live on the Market.'
                : 'Save a draft on Direct Gain. Photos can be added after this draft is saved. This listing is not live.'}
            </Text>

            <CreateListingPhotos
              draftSaved={Boolean(listingId)}
              photos={photos}
              disabled={saving || uploading || reordering}
              uploading={uploading || reordering}
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
              maxLength={MAX_TITLE}
              editable={!saving}
              errorMessage={errors.title}
              autoCapitalize="sentences"
            />

            <DGInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Condition, inclusions, and anything a buyer should know"
              maxLength={MAX_DESCRIPTION}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!saving}
              errorMessage={errors.description}
              helperText={
                errors.description
                  ? undefined
                  : `${description.trim().length}/${MAX_DESCRIPTION}`
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
                  disabled={saving}
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
              maxLength={MAX_SUBCATEGORY}
              editable={!saving}
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
                  disabled={saving}
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
                  saving
                    ? styles.currencyPrefixDisabled
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.currencySymbol,
                    saving
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
                    setPriceText(sanitizePriceInput(value));
                  }}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  editable={!saving}
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
              maxLength={MAX_SUBURB}
              editable={!saving}
              errorMessage={errors.suburb}
              autoCapitalize="words"
            />
            <DGInput
              label="State"
              value={state}
              onChangeText={setState}
              placeholder="State"
              maxLength={MAX_STATE}
              editable={!saving}
              errorMessage={errors.state}
              autoCapitalize="characters"
            />

            <Text style={styles.section}>Fulfilment</Text>
            <View style={styles.chipWrap}>
              <DGChip
                size="compact"
                label="Pickup available"
                selected={pickupAvailable}
                disabled={saving}
                onPress={() => {
                  setPickupAvailable((current) => !current);
                }}
                style={styles.chip}
              />
              <DGChip
                size="compact"
                label="Delivery available"
                selected={deliveryAvailable}
                disabled={saving}
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
                disabled={saving}
                onPress={() => {
                  setAllowsOffers(true);
                }}
                style={styles.chip}
              />
              <DGChip
                size="compact"
                label="Fixed price"
                selected={!allowsOffers}
                disabled={saving}
                onPress={() => {
                  setAllowsOffers(false);
                }}
                style={styles.chip}
              />
            </View>

            {listingId ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Start new listing"
                accessibilityHint="Clears this form. Your saved draft is kept."
                disabled={saving}
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
              title={saving ? 'Saving draft' : 'Save draft'}
              fullWidth
              loading={saving}
              disabled={saving || uploading || reordering}
              onPress={() => {
                void handleSaveDraft();
              }}
              style={styles.submit}
              accessibilityLabel={
                saving ? 'Saving draft' : 'Save draft'
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

  submit: {
    marginTop: spacing.xl,
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
