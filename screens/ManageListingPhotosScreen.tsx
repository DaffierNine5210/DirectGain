import { useCallback, useEffect, useRef, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGHeader from '../components/DGHeader';
import DGSkeleton from '../components/DGSkeleton';
import ManageListingPhotosGrid, {
  MANAGE_PHOTOS_GRID_COLUMNS,
} from '../components/market/ManageListingPhotosGrid';

import useTabBarVisibility from '../hooks/useTabBarVisibility';

import type { MarketStackParamList } from '../navigation/MarketStack';

import {
  deleteOwnActiveListingPhoto,
  getOwnActiveListingForPhotos,
  reorderOwnActiveListingMedia,
  uploadOwnActiveListingPhoto,
} from '../services/market/marketListingsRepository';
import { pickAndPrepareMarketListingPhotos } from '../services/market/pickMarketListingPhotos';

import {
  MARKET_LISTING_MEDIA_MAX,
  type MarketListingMediaPresentation,
  type OwnMarketListingDetail,
} from '../types/marketListing';

import {
  alpha,
  layout,
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../theme/designSystem';

type Props = NativeStackScreenProps<
  MarketStackParamList,
  'ManageListingPhotos'
>;

type LoadState = 'loading' | 'ready' | 'error' | 'unavailable';

type MutationKind = 'idle' | 'upload' | 'delete' | 'reorder';

const GRID_COLUMNS = MANAGE_PHOTOS_GRID_COLUMNS;

const ORDER_SAVED_RELOAD_FAILED =
  'Photo order was saved, but photos could not be reloaded. Close and reopen this listing.';

export default function ManageListingPhotosScreen({
  navigation,
  route,
}: Props) {
  const { listingId } = route.params;
  const { showTabBar } = useTabBarVisibility();
  const { width: windowWidth } = useWindowDimensions();

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const mutatingRef = useRef(false);
  const draggingRef = useRef(false);
  const pickingRef = useRef(false);
  const loadRef = useRef<(showSpinner: boolean) => Promise<void>>(
    async () => {},
  );

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [detail, setDetail] = useState<OwnMarketListingDetail | null>(
    null,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mutation, setMutation] = useState<MutationKind>('idle');
  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const applyDetail = useCallback((next: OwnMarketListingDetail) => {
    setDetail(next);
    setSelectedId((current) => {
      if (
        current &&
        next.media.some((photo) => photo.id === current)
      ) {
        return current;
      }

      return next.media[0]?.id ?? null;
    });
  }, []);

  const refreshPhotos = useCallback(async (): Promise<boolean> => {
    const result = await getOwnActiveListingForPhotos(listingId);

    if (!mountedRef.current) {
      return false;
    }

    if (result.error || !result.listing) {
      return false;
    }

    applyDetail(result.listing);
    setLoadError(null);
    setLoadState('ready');
    return true;
  }, [applyDetail, listingId]);

  const loadListing = useCallback(async (showSpinner: boolean) => {
    const requestId = ++requestIdRef.current;

    if (showSpinner) {
      setLoadState('loading');
      setLoadError(null);
    }

    const result = await getOwnActiveListingForPhotos(listingId);

    if (
      requestId !== requestIdRef.current ||
      !mountedRef.current
    ) {
      return;
    }

    hasLoadedRef.current = true;

    if (result.error || !result.listing) {
      const message =
        result.error ?? "Couldn't load this listing.";

      if (
        message ===
        'Photos can only be managed on an active or paused listing.'
      ) {
        setLoadState('unavailable');
        setLoadError(message);
        setDetail(null);
        return;
      }

      setLoadState('error');
      setLoadError(message);
      setDetail(null);
      return;
    }

    applyDetail(result.listing);
    setLoadError(null);
    setLoadState('ready');
  }, [applyDetail, listingId]);

  loadRef.current = loadListing;

  useFocusEffect(
    useCallback(() => {
      showTabBar();

      if (
        hasLoadedRef.current &&
        !mutatingRef.current &&
        !draggingRef.current
      ) {
        void loadRef.current(false);
      }
    }, [showTabBar]),
  );

  useEffect(() => {
    mountedRef.current = true;
    void loadListing(true);

    return () => {
      mountedRef.current = false;
    };
  }, [loadListing]);

  const photos = detail?.media ?? [];
  const persisting = mutation !== 'idle';
  const remaining = MARKET_LISTING_MEDIA_MAX - photos.length;
  const canAdd =
    remaining > 0 && !persisting && loadState === 'ready';
  const selectedIndex = photos.findIndex(
    (photo) => photo.id === selectedId,
  );
  const selectedPhoto =
    selectedIndex >= 0 ? photos[selectedIndex] : null;
  const canDelete =
    photos.length > 1 &&
    selectedPhoto != null &&
    !persisting &&
    !dragging;
  const innerWidth = Math.max(
    0,
    windowWidth - spacing.lg * 2,
  );
  const tileSize = Math.floor(
    (innerWidth - spacing.xs * (GRID_COLUMNS - 1)) / GRID_COLUMNS,
  );

  async function saveOrder(
    nextPhotos: MarketListingMediaPresentation[],
    previous: MarketListingMediaPresentation[],
  ) {
    if (!detail || mutatingRef.current) {
      return;
    }

    mutatingRef.current = true;
    setMutation('reorder');
    setDetail({
      ...detail,
      media: nextPhotos,
    });

    const result = await reorderOwnActiveListingMedia(
      listingId,
      nextPhotos.map((photo) => photo.id),
    );

    if (!mountedRef.current) {
      return;
    }

    if (result.listing) {
      applyDetail(result.listing);
      mutatingRef.current = false;
      setMutation('idle');
      return;
    }

    if (result.error === ORDER_SAVED_RELOAD_FAILED) {
      await refreshPhotos();
      mutatingRef.current = false;
      setMutation('idle');
      Alert.alert('Photo order saved', result.error);
      return;
    }

    setDetail({
      ...detail,
      media: previous,
    });
    await refreshPhotos();
    mutatingRef.current = false;
    setMutation('idle');
    Alert.alert(
      "Couldn't save photo order",
      result.error ??
        "Couldn't save photo order. Please try again.",
    );
  }

  async function handleAddPhotos() {
    if (
      !canAdd ||
      mutatingRef.current ||
      pickingRef.current ||
      draggingRef.current
    ) {
      return;
    }

    pickingRef.current = true;
    const picked = await pickAndPrepareMarketListingPhotos(remaining);
    pickingRef.current = false;

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

    mutatingRef.current = true;
    setMutation('upload');

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

      const result = await uploadOwnActiveListingPhoto(
        listingId,
        picked.photos[index],
      );

      if (result.media) {
        uploaded += 1;
        const refreshed = await refreshPhotos();

        if (!refreshed && mountedRef.current) {
          const uploadedPhoto = result.media;

          setDetail((current) => {
            if (!current) {
              return current;
            }

            if (
              current.media.some(
                (photo) => photo.id === uploadedPhoto.id,
              )
            ) {
              return current;
            }

            return {
              ...current,
              media: [...current.media, uploadedPhoto],
            };
          });
          setSelectedId(uploadedPhoto.id);
        }
      } else {
        failed += 1;
        break;
      }
    }

    if (!mountedRef.current) {
      return;
    }

    mutatingRef.current = false;
    setMutation('idle');
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
        uploaded === 1
          ? 'One photo was added. The rest could not be uploaded.'
          : `${uploaded} photos were added. The rest could not be uploaded.`,
      );
    }
  }

  function handleRemoveSelected() {
    if (!selectedPhoto || !canDelete || mutatingRef.current) {
      return;
    }

    const removingCover = selectedIndex === 0;

    Alert.alert(
      'Remove photo?',
      removingCover
        ? 'This photo will be removed from your listing. The next photo will become your cover.'
        : 'This photo will be removed from your listing.',
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
              if (mutatingRef.current) {
                return;
              }

              mutatingRef.current = true;
              setMutation('delete');

              const result = await deleteOwnActiveListingPhoto(
                listingId,
                selectedPhoto.id,
              );

              if (!mountedRef.current) {
                return;
              }

              if (result.lastPhotoProtected) {
                Alert.alert(
                  'Photo could not be removed',
                  'Your active listing must keep at least one photo.',
                );
                await refreshPhotos();
                mutatingRef.current = false;
                setMutation('idle');
                return;
              }

              if (result.error) {
                mutatingRef.current = false;
                setMutation('idle');
                Alert.alert(
                  'Photo could not be removed',
                  result.error,
                );
                return;
              }

              const removedId = selectedPhoto.id;
              const remainingPhotos = photos.filter(
                (photo) => photo.id !== removedId,
              );

              setDetail((current) => {
                if (!current) {
                  return current;
                }

                return {
                  ...current,
                  media: current.media.filter(
                    (photo) => photo.id !== removedId,
                  ),
                };
              });
              setSelectedId(remainingPhotos[0]?.id ?? null);

              await refreshPhotos();
              mutatingRef.current = false;
              setMutation('idle');

              if (result.cleanupWarning) {
                Alert.alert(
                  'Photo removed',
                  result.cleanupWarning,
                );
              }
            })();
          },
        },
      ],
    );
  }

  const statusText =
    mutation === 'upload' && uploadProgress
      ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}…`
      : mutation === 'delete'
        ? 'Removing photo…'
        : mutation === 'reorder'
          ? 'Saving photo order…'
          : null;

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <DGHeader
        showBackButton
        title="Manage Photos"
        onBackPress={() => {
          navigation.goBack();
        }}
        style={styles.header}
      />

      <ScrollView
        scrollEnabled={!dragging}
        contentContainerStyle={styles.scroll}
      >
        {loadState === 'loading' ? (
          <View style={styles.body}>
            <DGSkeleton width="72%" height={14} />
            <DGSkeleton width="38%" height={12} />
            <View style={styles.skeletonGrid}>
              <DGSkeleton
                width={tileSize}
                height={tileSize}
                borderRadius={radius.md}
              />
              <DGSkeleton
                width={tileSize}
                height={tileSize}
                borderRadius={radius.md}
              />
              <DGSkeleton
                width={tileSize}
                height={tileSize}
                borderRadius={radius.md}
              />
            </View>
          </View>
        ) : loadState === 'unavailable' ? (
          <View style={styles.statusCard}>
            <Text style={styles.emptyTitle}>
              Photos can't be managed
            </Text>
            <Text style={styles.emptyBody}>
              {loadError ??
                'Photos can only be managed on an active or paused listing.'}
            </Text>
          </View>
        ) : loadState === 'error' || !detail ? (
          <View style={styles.statusCard}>
            <Text style={styles.emptyTitle}>
              This listing isn't available
            </Text>
            <Text style={styles.emptyBody}>
              {loadError ?? "Couldn't load this listing."}
            </Text>
            <Pressable
              onPress={() => {
                void loadListing(true);
              }}
              style={styles.retry}
              accessibilityRole="button"
              accessibilityLabel="Retry loading photos"
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.body}>
            <Text style={styles.intro}>
              Add, remove, or reorder your listing photos.
            </Text>
            <Text style={styles.count}>
              {photos.length} of {MARKET_LISTING_MEDIA_MAX} photos
            </Text>

            {remaining <= 0 ? (
              <Text style={styles.hint}>
                A listing can have at most 20 photos.
              </Text>
            ) : null}

            <ManageListingPhotosGrid
              photos={photos}
              selectedId={selectedId}
              busy={persisting}
              canAdd={canAdd}
              onSelect={(photo) => {
                if (mutation !== 'idle' || draggingRef.current) {
                  return;
                }

                setSelectedId(photo.id);
              }}
              onAdd={() => {
                void handleAddPhotos();
              }}
              onReorder={(nextPhotos) => {
                void saveOrder(nextPhotos, photos);
              }}
              onDragSessionChange={(active) => {
                draggingRef.current = active;
                setDragging(active);
              }}
            />

            <Text style={styles.hint}>
              Hold and drag photos to reorder. The first photo is your
              cover.
            </Text>

            {statusText ? (
              <Text style={styles.progress}>{statusText}</Text>
            ) : null}

            {selectedPhoto ? (
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    canDelete
                      ? 'Remove this photo from the listing'
                      : 'Remove photo unavailable. This listing must keep at least one photo.'
                  }
                  disabled={!canDelete}
                  onPress={handleRemoveSelected}
                  style={({ pressed }) => [
                    styles.removeButton,
                    pressed && canDelete && styles.pressed,
                    !canDelete && styles.orderDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.removeLabel,
                      !canDelete && styles.orderLabelDisabled,
                    ]}
                  >
                    Remove photo
                  </Text>
                </Pressable>

                {photos.length <= 1 ? (
                  <Text style={styles.lastPhoto}>
                    This listing must keep at least one photo.
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: surface.page,
  },

  header: {
    paddingBottom: spacing.xs,
  },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxs,
    paddingBottom: layout.bottomNavigationClearance,
  },

  body: {
    gap: spacing.xs,
  },

  statusCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.card,
    gap: spacing.xs,
  },

  skeletonGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },

  intro: {
    color: textColor.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },

  count: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },

  hint: {
    color: textColor.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  progress: {
    color: palette.opportunityGreen,
    fontSize: 13,
    fontWeight: '700',
  },

  actions: {
    marginTop: 2,
    gap: spacing.xs,
  },

  orderDisabled: {
    opacity: 0.45,
  },

  orderLabelDisabled: {
    color: textColor.muted,
  },

  removeButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  removeLabel: {
    color: palette.danger,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.86,
  },

  lastPhoto: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  emptyTitle: {
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },

  emptyBody: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  retry: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },

  retryText: {
    color: palette.opportunityGreen,
    fontSize: 14,
    fontWeight: '800',
  },
});
