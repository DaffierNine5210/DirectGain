import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGButton from '../components/DGButton';
import DGHeader from '../components/DGHeader';
import DGSkeleton from '../components/DGSkeleton';
import ManageListingActionRow from '../components/market/ManageListingActionRow';

import useTabBarVisibility from '../hooks/useTabBarVisibility';

import type { MarketStackParamList } from '../navigation/MarketStack';

import { formatListingCreatedOn } from '../services/market/listingPreviewPresentation';
import { formatViewerRegionLabel } from '../services/market/marketFeedPresentation';
import {
  getOwnMarketListing,
  markOwnMarketListingSold,
  pauseOwnMarketListing,
  reactivateOwnMarketListing,
} from '../services/market/marketListingsRepository';
import formatListingPrice from '../utils/listing/formatListingPrice';
import { ownListingStatusTone } from '../utils/market/ownListingStatusTone';

import type {
  MarketListingStatus,
  OwnMarketListingDetail,
} from '../types/marketListing';

import {
  alpha,
  layout,
  palette,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../theme/designSystem';

type Props = NativeStackScreenProps<
  MarketStackParamList,
  'ManageListing'
>;

function formatOwnListingStatus(
  status: MarketListingStatus,
): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'active':
      return 'Active';
    case 'paused':
      return 'Paused';
    case 'reserved':
      return 'Reserved';
    case 'sold':
      return 'Sold';
    case 'removed':
      return 'Removed';
  }
}

function dateLabelForListing(
  status: MarketListingStatus,
  createdAt: string,
): string {
  const created = formatListingCreatedOn(createdAt);

  if (created === 'Listed date unavailable') {
    return status === 'draft'
      ? 'Created date unavailable'
      : created;
  }

  if (status === 'draft') {
    return `Created ${created}`;
  }

  return `Listed ${created}`;
}

function OwnerPhoto({
  uri,
  accessibilityLabel,
  width,
}: {
  uri: string;
  accessibilityLabel: string;
  width: number;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <View
        accessibilityLabel={`${accessibilityLabel} failed to load`}
        style={[styles.photo, styles.photoFallback, { width }]}
      >
        <Ionicons
          name="image-outline"
          size={28}
          color={textColor.muted}
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      resizeMode="cover"
      accessibilityLabel={accessibilityLabel}
      onError={() => {
        setFailed(true);
      }}
      style={[styles.photo, { width }]}
    />
  );
}

export default function ManageListingScreen({
  navigation,
  route,
}: Props) {
  const { listingId } = route.params;
  const { showTabBar } = useTabBarVisibility();
  const [galleryWidth, setGalleryWidth] = useState(0);

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const lifecycleBusyRef = useRef(false);
  const loadRef = useRef<(showSpinner: boolean) => Promise<void>>(
    async () => {},
  );

  const [detail, setDetail] = useState<OwnMarketListingDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lifecycleBusy, setLifecycleBusy] = useState(false);

  const loadListing = useCallback(async (showSpinner: boolean) => {
    const requestId = ++requestIdRef.current;

    if (showSpinner) {
      setLoading(true);
    }

    const result = await getOwnMarketListing(listingId);

    if (
      requestId !== requestIdRef.current ||
      !mountedRef.current
    ) {
      return;
    }

    setLoading(false);
    hasLoadedRef.current = true;

    if (result.error || !result.listing) {
      setError(result.error ?? "Couldn't load this listing.");
      setDetail(null);
      return;
    }

    setError(null);
    setDetail(result.listing);
  }, [listingId]);

  loadRef.current = loadListing;

  useFocusEffect(
    useCallback(() => {
      showTabBar();

      if (hasLoadedRef.current && !lifecycleBusyRef.current) {
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

  async function runLifecycleAction(
    action: () => Promise<{ error: string | null }>,
    failureTitle: string,
  ) {
    if (lifecycleBusyRef.current) {
      return;
    }

    lifecycleBusyRef.current = true;
    setLifecycleBusy(true);
    requestIdRef.current += 1;

    const result = await action();

    if (!mountedRef.current) {
      return;
    }

    if (result.error) {
      lifecycleBusyRef.current = false;
      setLifecycleBusy(false);
      Alert.alert(failureTitle, result.error);
      return;
    }

    await loadListing(false);

    if (!mountedRef.current) {
      return;
    }

    lifecycleBusyRef.current = false;
    setLifecycleBusy(false);
  }

  function confirmPause() {
    if (lifecycleBusyRef.current) {
      return;
    }

    Alert.alert(
      'Pause listing?',
      'This listing will leave Market. New offers and new Market chats will stop. Existing chats stay open. Pending offers stay pending; you cannot accept or decline them until you list again. A buyer can still withdraw.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pause listing',
          onPress: () => {
            void runLifecycleAction(
              () => pauseOwnMarketListing(listingId),
              'This listing could not be paused',
            );
          },
        },
      ],
    );
  }

  function confirmListAgain() {
    if (lifecycleBusyRef.current) {
      return;
    }

    Alert.alert(
      'List again?',
      'This listing will return to Market. New offers can start again if offers are enabled.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'List again',
          onPress: () => {
            void runLifecycleAction(
              () => reactivateOwnMarketListing(listingId),
              'This listing could not be listed again',
            );
          },
        },
      ],
    );
  }

  function confirmMarkSold() {
    if (lifecycleBusyRef.current) {
      return;
    }

    Alert.alert(
      'Mark as Sold?',
      'This listing will leave Market. Pending offers will be declined. Sold cannot be reversed by pause or list-again. This does not record payment or a completed transaction.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Sold',
          style: 'destructive',
          onPress: () => {
            void runLifecycleAction(
              () => markOwnMarketListingSold(listingId),
              'This listing could not be marked as sold',
            );
          },
        },
      ],
    );
  }

  const listing = detail?.listing ?? null;
  const media = detail?.media ?? [];
  const canViewPublic = listing?.status === 'active';
  const canEditDetails =
    listing?.status === 'active' || listing?.status === 'paused';
  const canManagePhotos = canEditDetails;
  const canPause = listing?.status === 'active';
  const canListAgain = listing?.status === 'paused';
  const canMarkSold =
    listing?.status === 'active' || listing?.status === 'paused';
  const locationLabel = listing
    ? formatViewerRegionLabel({
        suburb: listing.suburb,
        state: listing.state,
      })
    : '';
  const tone = listing ? ownListingStatusTone(listing.status) : null;

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <DGHeader
        showBackButton
        title="Manage Listing"
        onBackPress={() => {
          navigation.goBack();
        }}
        style={styles.header}
        topRowStyle={styles.headerRow}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
      >
        {loading ? (
          <View style={styles.summaryCard}>
            <DGSkeleton
              width="100%"
              height={158}
              borderRadius={radius.md}
            />
            <DGSkeleton width="42%" height={12} />
            <DGSkeleton width="78%" height={20} />
          </View>
        ) : error || !listing ? (
          <View style={styles.summaryCard}>
            <Text style={styles.emptyTitle}>
              This listing isn't available
            </Text>
            <Text style={styles.emptyBody}>
              {error ?? "Couldn't load this listing."}
            </Text>
            <Pressable
              onPress={() => {
                void loadListing(true);
              }}
              style={styles.retry}
              accessibilityRole="button"
              accessibilityLabel="Retry loading listing"
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <View
                style={styles.gallery}
                onLayout={(event) => {
                  setGalleryWidth(
                    event.nativeEvent.layout.width,
                  );
                }}
              >
                {media.length > 0 && galleryWidth > 0 ? (
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(event) => {
                      const next = Math.round(
                        event.nativeEvent.contentOffset.x /
                          galleryWidth,
                      );
                      setPhotoIndex(next);
                    }}
                  >
                    {media.map((photo) => (
                      <OwnerPhoto
                        key={photo.id}
                        uri={photo.signedUrl}
                        accessibilityLabel={`${listing.title} photo`}
                        width={galleryWidth}
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.photoFallback}>
                    <Ionicons
                      name="image-outline"
                      size={28}
                      color={textColor.muted}
                    />
                    <Text style={styles.photoFallbackText}>
                      No photo
                    </Text>
                  </View>
                )}

                {media.length > 1 ? (
                  <View style={styles.photoCount}>
                    <Text style={styles.photoCountText}>
                      {photoIndex + 1}/{media.length}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.titleRow}>
                <Text
                  style={styles.title}
                  numberOfLines={2}
                >
                  {listing.title}
                </Text>

                {tone ? (
                  <View
                    style={[
                      styles.pill,
                      {
                        backgroundColor: tone.backgroundColor,
                        borderColor: tone.borderColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: tone.color },
                      ]}
                    >
                      {formatOwnListingStatus(listing.status)}
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.price}>
                {formatListingPrice(
                  listing.price,
                  listing.currency,
                )}
              </Text>

              {locationLabel && locationLabel !== 'Your area' ? (
                <Text style={styles.meta}>{locationLabel}</Text>
              ) : null}

              <Text style={styles.date}>
                {dateLabelForListing(
                  listing.status,
                  listing.createdAt,
                )}
              </Text>

              {canViewPublic ? (
                <DGButton
                  title="View Listing"
                  icon="eye-outline"
                  size="medium"
                  fullWidth
                  onPress={() => {
                    navigation.navigate('ListingDetail', {
                      listingId: listing.id,
                    });
                  }}
                  accessibilityLabel="View Listing"
                  style={styles.viewButton}
                />
              ) : null}
            </View>

            <View style={styles.manageCard}>
              <Text style={styles.manageLabel}>Manage</Text>

              <ManageListingActionRow
                icon="create-outline"
                title="Edit Details"
                unavailable={!canEditDetails}
                onPress={
                  canEditDetails
                    ? () => {
                        navigation.navigate('EditListingDetails', {
                          listingId: listing.id,
                        });
                      }
                    : undefined
                }
              />

              <View>
                <View style={styles.divider} />
                <ManageListingActionRow
                  icon="images-outline"
                  title="Manage Photos"
                  unavailable={!canManagePhotos}
                  onPress={
                    canManagePhotos
                      ? () => {
                          navigation.navigate('ManageListingPhotos', {
                            listingId: listing.id,
                          });
                        }
                      : undefined
                  }
                />
              </View>

              <View>
                <View style={styles.divider} />
                <ManageListingActionRow
                  icon="pricetag-outline"
                  title="View Offers"
                  unavailable
                />
              </View>

              {canPause ? (
                <View>
                  <View style={styles.divider} />
                  <ManageListingActionRow
                    icon="pause-circle-outline"
                    title="Pause listing"
                    unavailable={lifecycleBusy}
                    onPress={
                      lifecycleBusy ? undefined : confirmPause
                    }
                  />
                </View>
              ) : null}

              {canListAgain ? (
                <View>
                  <View style={styles.divider} />
                  <ManageListingActionRow
                    icon="play-circle-outline"
                    title="List again"
                    unavailable={lifecycleBusy}
                    onPress={
                      lifecycleBusy ? undefined : confirmListAgain
                    }
                  />
                </View>
              ) : null}

              {canMarkSold ? (
                <View>
                  <View style={styles.divider} />
                  <ManageListingActionRow
                    icon="checkmark-circle-outline"
                    title="Mark as Sold"
                    unavailable={lifecycleBusy}
                    onPress={
                      lifecycleBusy ? undefined : confirmMarkSold
                    }
                  />
                </View>
              ) : null}

              <View>
                <View style={styles.divider} />
                <ManageListingActionRow
                  icon="archive-outline"
                  title="Archive Listing"
                  unavailable
                />
              </View>
            </View>
          </>
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
    paddingTop: spacing.xxs,
    paddingBottom: 0,
  },

  headerRow: {
    minHeight: 46,
  },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: 0,
    paddingBottom: layout.bottomNavigationClearance,
    gap: spacing.xs,
  },

  summaryCard: {
    padding: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.card,
    gap: 4,
  },

  gallery: {
    height: 158,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: surface.cardSoft,
  },

  photo: {
    height: 158,
  },

  photoFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },

  photoFallbackText: {
    color: textColor.muted,
    fontSize: 12,
    fontWeight: '700',
  },

  photoCount: {
    position: 'absolute',
    right: spacing.xs,
    bottom: spacing.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: alpha.black56,
  },

  photoCountText: {
    color: textColor.primary,
    fontSize: 11,
    fontWeight: '800',
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: 2,
  },

  title: {
    flex: 1,
    color: textColor.primary,
    fontSize: typography.headingSmall.fontSize,
    lineHeight: 23,
    fontWeight: typography.headingSmall.fontWeight,
    letterSpacing: typography.headingSmall.letterSpacing,
  },

  pill: {
    marginTop: 2,
    flexShrink: 0,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },

  pillText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  price: {
    color: palette.opportunityGreen,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  meta: {
    color: textColor.secondary,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '600',
  },

  date: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '600',
  },

  viewButton: {
    marginTop: 6,
  },

  manageCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.card,
    paddingVertical: spacing.xs,
    overflow: 'hidden',
  },

  manageLabel: {
    paddingHorizontal: spacing.sm,
    paddingTop: 2,
    paddingBottom: 2,
    color: textColor.muted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  divider: {
    height: 1,
    backgroundColor: alpha.white08,
    marginLeft: 48,
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
