import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import DGHeader from '../components/DGHeader';

import ListingActionBar, {
  type ListingOfferAction,
} from '../components/listing-detail/ListingActionBar';
import ListingHeader from '../components/listing-detail/ListingHeader';
import ListingHeroGallery from '../components/listing-detail/ListingHeroGallery';
import ListingPhotoViewer from '../components/listing-detail/ListingPhotoViewer';
import ListingSafetyCard from '../components/listing-detail/ListingSafetyCard';
import GeneralDetailsTab from '../components/listing-detail/details/GeneralDetailsTab';
import ListingPreviewSellerRow from '../components/market/ListingPreviewSellerRow';
import OfferComposer, {
  type OfferComposerValues,
} from '../components/messaging/offers/OfferComposer';
import DGButton from '../components/DGButton';

import type {
  MarketListingFlowParamList,
} from '../navigation/marketListingFlow';
import { navigateToOwnMyGain } from '../navigation/publicProfile';

import useTabBarVisibility from '../hooks/useTabBarVisibility';

import {
  toListingPreviewPresentation,
  type ListingPreviewPresentation,
} from '../services/market/listingPreviewPresentation';
import {
  getActiveListingMedia,
  getActiveMarketListing,
} from '../services/market/marketListingsRepository';
import {
  createMarketOffer,
  listOffersForListing,
} from '../services/market/marketOffersRepository';
import { openMarketConversation } from '../services/messaging/openMarketConversation';
import { getProfileIdentityVerified } from '../services/profile/identityVerificationRepository';
import { resolveProfileAvatarUrl } from '../services/profile/profileAvatarRepository';
import {
  getAuthenticatedUserId,
  getProfileById,
} from '../services/profile/profileRepository';

import { colors } from '../theme/colors';
import {
  iconSize,
  palette,
  spacing,
  textColor,
} from '../theme/designSystem';
import type { MarketOfferRecord } from '../types/MarketOffer';
import {
  normaliseMarketOfferMessage,
  parseMarketOfferAmount,
} from '../utils/market/parseMarketOfferAmount';

type Props =
  NativeStackScreenProps<
    MarketListingFlowParamList,
    'ListingDetail'
  >;

type LoadState =
  | { kind: 'loading' }
  | { kind: 'unavailable' }
  | { kind: 'error'; message: string }
  | {
      kind: 'ready';
      detail: ListingPreviewPresentation;
      sellerProfileId: string;
      askingPrice: number;
      allowsOffers: boolean;
      isOwner: boolean;
      viewerId: string | null;
    };

type ViewerOffersState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | {
      kind: 'known';
      viewerId: string | null;
      offers: MarketOfferRecord[];
    }
  | {
      kind: 'failed';
      viewerId: string | null;
    };

type OfferCta =
  | { kind: 'hidden' }
  | { kind: 'loading' }
  | { kind: 'unavailable' }
  | { kind: 'make' }
  | { kind: 'view_pending'; offer: MarketOfferRecord }
  | { kind: 'view_accepted'; offer: MarketOfferRecord };

export default function ListingDetailScreen({
  navigation,
  route,
}: Props) {
  const listingId = route.params.listingId;
  const { hideTabBar, showTabBar } = useTabBarVisibility();
  const [loadState, setLoadState] = useState<LoadState>({
    kind: 'loading',
  });
  const [viewerOffers, setViewerOffers] = useState<ViewerOffersState>({
    kind: 'idle',
  });
  const [composerOpen, setComposerOpen] = useState(false);
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [photoViewer, setPhotoViewer] = useState<{
    visible: boolean;
    index: number;
  }>({
    visible: false,
    index: 0,
  });
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const isFirstFocusRef = useRef(true);
  const lastKnownOffersRef = useRef<{
    viewerId: string | null;
    offers: MarketOfferRecord[];
  } | null>(null);
  const loadStateRef = useRef(loadState);
  loadStateRef.current = loadState;

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      showTabBar();
    };
  }, [showTabBar]);

  useEffect(() => {
    if (photoViewer.visible || composerOpen) {
      hideTabBar();
      return;
    }

    showTabBar();
  }, [composerOpen, hideTabBar, photoViewer.visible, showTabBar]);

  const loadViewerOffers = useCallback(
    async (input: {
      isOwner: boolean;
      viewerId: string | null;
      preserveKnown: boolean;
    }) => {
      if (input.isOwner) {
        const next = {
          viewerId: input.viewerId,
          offers: [] as MarketOfferRecord[],
        };
        lastKnownOffersRef.current = next;
        setViewerOffers({
          kind: 'known',
          ...next,
        });
        return;
      }

      if (!input.preserveKnown || lastKnownOffersRef.current === null) {
        setViewerOffers({ kind: 'loading' });
      }

      const result = await listOffersForListing(listingId);

      if (!mountedRef.current) {
        return;
      }

      if (result.error) {
        if (input.preserveKnown && lastKnownOffersRef.current) {
          setViewerOffers({
            kind: 'known',
            ...lastKnownOffersRef.current,
          });
          return;
        }

        setViewerOffers({
          kind: 'failed',
          viewerId: input.viewerId,
        });
        return;
      }

      const next = {
        viewerId: input.viewerId,
        offers: result.offers,
      };
      lastKnownOffersRef.current = next;
      setViewerOffers({
        kind: 'known',
        ...next,
      });
    },
    [listingId],
  );

  function clearListingSession() {
    lastKnownOffersRef.current = null;
    setViewerOffers({ kind: 'idle' });
    setComposerOpen(false);
    setSubmittingOffer(false);
    setSubmitError(null);
    setPhotoViewer({
      visible: false,
      index: 0,
    });
  }

  function goBackFromListing() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.getParent()?.navigate('Market' as never);
  }

  const loadDetail = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setLoadState({ kind: 'loading' });
    clearListingSession();

    const listingResult = await getActiveMarketListing(listingId);

    if (
      requestId !== requestIdRef.current ||
      !mountedRef.current
    ) {
      return;
    }

    if (listingResult.unavailable) {
      setLoadState({ kind: 'unavailable' });
      return;
    }

    if (listingResult.error || !listingResult.listing) {
      setLoadState({
        kind: 'error',
        message:
          listingResult.error ??
          "Couldn't load this listing.",
      });
      return;
    }

    const listing = listingResult.listing;

    const [
      mediaResult,
      profileResult,
      identityResult,
      viewerId,
    ] = await Promise.all([
      getActiveListingMedia(listing.id),
      getProfileById(listing.sellerProfileId),
      getProfileIdentityVerified(listing.sellerProfileId),
      getAuthenticatedUserId(),
    ]);

    if (
      requestId !== requestIdRef.current ||
      !mountedRef.current
    ) {
      return;
    }

    const displayName =
      profileResult.profile?.displayName.trim() ||
      'Direct Gain member';

    const avatarUrl = await resolveProfileAvatarUrl(
      profileResult.profile?.avatarPath ?? null,
    );

    if (
      requestId !== requestIdRef.current ||
      !mountedRef.current
    ) {
      return;
    }

    const isOwner =
      viewerId !== null &&
      viewerId === listing.sellerProfileId;

    setLoadState({
      kind: 'ready',
      sellerProfileId: listing.sellerProfileId,
      askingPrice: listing.price,
      allowsOffers: listing.allowsOffers,
      isOwner,
      viewerId,
      detail: toListingPreviewPresentation({
        listing,
        media: mediaResult.media,
        seller: {
          displayName,
          avatarUrl,
          identityVerified:
            identityResult.result?.verified === true,
        },
      }),
    });

    await loadViewerOffers({
      isOwner,
      viewerId,
      preserveKnown: false,
    });
  }, [listingId, loadViewerOffers]);

  const revalidateActiveListing = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const listingResult = await getActiveMarketListing(listingId);

    if (
      requestId !== requestIdRef.current ||
      !mountedRef.current
    ) {
      return;
    }

    if (listingResult.unavailable) {
      clearListingSession();
      setLoadState({ kind: 'unavailable' });
      return;
    }

    if (listingResult.error || !listingResult.listing) {
      const current = loadStateRef.current;

      if (current.kind === 'ready' || current.kind === 'unavailable') {
        return;
      }

      setLoadState({
        kind: 'error',
        message:
          listingResult.error ??
          "Couldn't load this listing.",
      });
      return;
    }

    const current = loadStateRef.current;

    if (current.kind === 'ready') {
      void loadViewerOffers({
        isOwner: current.isOwner,
        viewerId: current.viewerId,
        preserveKnown: true,
      });
      return;
    }

    void loadDetail();
  }, [listingId, loadDetail, loadViewerOffers]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocusRef.current) {
        isFirstFocusRef.current = false;
        return;
      }

      void revalidateActiveListing();
    }, [revalidateActiveListing]),
  );

  async function handleSharePress() {
    if (loadState.kind !== 'ready') {
      return;
    }

    try {
      await Share.share({
        message: `${loadState.detail.title} — ${loadState.detail.formattedPrice}`,
      });
    } catch {
      Alert.alert(
        'Unable to share',
        'Please try again shortly.',
      );
    }
  }

  function handleSellerPress() {
    if (loadState.kind !== 'ready') {
      return;
    }

    if (loadState.isOwner) {
      navigateToOwnMyGain(navigation);
      return;
    }

    navigation.navigate('PublicProfile', {
      profileId: loadState.sellerProfileId,
    });
  }

  async function handleMessagePress() {
    if (loadState.kind !== 'ready') {
      return;
    }

    if (loadState.isOwner) {
      Alert.alert(
        'Your listing',
        "You can't message yourself on your own listing.",
      );
      return;
    }

    try {
      const result = await openMarketConversation({
        listingId: loadState.detail.listingId,
        listingTitle: loadState.detail.title,
        sellerId: loadState.sellerProfileId,
      });

      if (!result?.conversationId) {
        Alert.alert(
          'Unable to open messages',
          'A conversation could not be created or found for this listing.',
        );
        return;
      }

      navigation.navigate('Conversation', {
        conversationId: result.conversationId,
        listingId: loadState.detail.listingId,
        intent: 'message',
      });
    } catch {
      Alert.alert(
        'Unable to open messages',
        'A conversation could not be created or found for this listing.',
      );
    }
  }

  function openConversationForOffer(offer: MarketOfferRecord) {
    if (loadState.kind !== 'ready') {
      return;
    }

    navigation.navigate('Conversation', {
      conversationId: offer.conversationId,
      listingId: loadState.detail.listingId,
    });
  }

  function handleOfferPress() {
    if (loadState.kind !== 'ready') {
      return;
    }

    const cta = deriveOfferCta({
      isOwner: loadState.isOwner,
      allowsOffers: loadState.allowsOffers,
      askingPrice: loadState.askingPrice,
      viewerId: loadState.viewerId,
      viewerOffers,
    });

    if (cta.kind === 'loading' || cta.kind === 'hidden') {
      return;
    }

    if (cta.kind === 'unavailable') {
      void loadViewerOffers({
        isOwner: loadState.isOwner,
        viewerId: loadState.viewerId,
        preserveKnown: false,
      });
      return;
    }

    if (cta.kind === 'view_pending' || cta.kind === 'view_accepted') {
      openConversationForOffer(cta.offer);
      return;
    }

    setSubmitError(null);
    setComposerOpen(true);
  }

  async function handleSubmitOffer(values: OfferComposerValues) {
    if (loadState.kind !== 'ready' || submittingOffer) {
      return;
    }

    const amountResult = parseMarketOfferAmount(String(values.amount));
    const messageResult = normaliseMarketOfferMessage(
      values.message ?? '',
    );

    if (!amountResult.ok) {
      setSubmitError('Enter a valid offer amount.');
      return;
    }

    if (!messageResult.ok) {
      setSubmitError('Keep your message to 500 characters or fewer.');
      return;
    }

    setSubmittingOffer(true);
    setSubmitError(null);

    const result = await createMarketOffer({
      listingId: loadState.detail.listingId,
      amount: amountResult.amount,
      message: messageResult.message,
    });

    if (!mountedRef.current) {
      return;
    }

    if (result.error || !result.offer) {
      setSubmittingOffer(false);
      setSubmitError(
        toBuyerOfferError(
          result.error ?? "We couldn't send your offer. Please try again.",
        ),
      );
      return;
    }

    const created = result.offer;
    const previous = lastKnownOffersRef.current;
    const mergedOffers = upsertOffer(
      previous?.offers ?? [],
      created,
    );
    const next = {
      viewerId: loadState.viewerId,
      offers: mergedOffers,
    };
    lastKnownOffersRef.current = next;
    setViewerOffers({
      kind: 'known',
      ...next,
    });
    setSubmittingOffer(false);
    setComposerOpen(false);

    void loadViewerOffers({
      isOwner: loadState.isOwner,
      viewerId: loadState.viewerId,
      preserveKnown: true,
    });
  }

  if (loadState.kind === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator color={palette.opportunityGreen} />
          <Text style={styles.loadingCopy}>Loading listing</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadState.kind === 'unavailable') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <DGHeader
          showBackButton
          onBackPress={goBackFromListing}
        />
        <View style={styles.centered}>
          <View style={styles.unavailableIcon}>
            <Ionicons
              name="storefront-outline"
              size={iconSize.xl}
              color={textColor.muted}
            />
          </View>
          <Text style={styles.errorTitle}>
            This listing isn't available
          </Text>
          <Text style={styles.errorBody}>
            This listing may have been changed or is no longer available to view.
          </Text>
          <View style={styles.actionGroup}>
            <View>
              <DGButton
                title="Back"
                variant="ghost"
                onPress={goBackFromListing}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (loadState.kind === 'error') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <DGHeader
          showBackButton
          onBackPress={goBackFromListing}
        />
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>
            Couldn't load listing
          </Text>
          <Text style={styles.errorBody}>{loadState.message}</Text>
          <View style={styles.actionGroup}>
            <View>
              <DGButton
                title="Retry"
                onPress={() => {
                  void loadDetail();
                }}
              />
            </View>
            <View>
              <DGButton
                title="Back"
                variant="ghost"
                onPress={goBackFromListing}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const { detail } = loadState;
  const offerCta = deriveOfferCta({
    isOwner: loadState.isOwner,
    allowsOffers: loadState.allowsOffers,
    askingPrice: loadState.askingPrice,
    viewerId: loadState.viewerId,
    viewerOffers,
  });
  const offerAction = toListingOfferAction(
    offerCta,
    detail.title,
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ListingHeroGallery
          images={detail.images}
          showFavourite={false}
          onBackPress={goBackFromListing}
          onSharePress={() => {
            void handleSharePress();
          }}
          onPhotoPress={(index) => {
            if (detail.images.length === 0) {
              return;
            }

            setPhotoViewer({
              visible: true,
              index,
            });
          }}
        />

        <View style={styles.content}>
          <ListingHeader
            title={detail.title}
            price={detail.formattedPrice}
            suburb={detail.suburb}
            state={detail.state}
            createdAt={detail.listedOn}
          />

          <ListingActionBar
            sellerName={detail.seller.displayName}
            showOfferAction={offerCta.kind !== 'hidden'}
            offerAction={offerAction}
            onMessagePress={() => {
              void handleMessagePress();
            }}
            onOfferPress={handleOfferPress}
          />

          {offerCta.kind === 'unavailable' ? (
            <Text style={styles.offerStateCopy}>
              Offers could not be loaded. Tap Retry offers to try again.
            </Text>
          ) : null}

          <SectionDivider />

          <SectionHeader
            eyebrow="ABOUT THIS LISTING"
            title="Description"
          />

          <Text style={styles.description}>
            {detail.description}
          </Text>

          <SectionDivider />

          <SectionHeader
            eyebrow="SELLER"
            title="Who's selling it"
          />

          <ListingPreviewSellerRow
            displayName={detail.seller.displayName}
            avatarUrl={detail.seller.avatarUrl}
            identityVerified={detail.seller.identityVerified}
            accessibilityHint={
              loadState.isOwner
                ? 'Opens your Direct Gain profile.'
                : 'Opens this seller’s Gain Profile.'
            }
            onViewProfile={handleSellerPress}
          />

          <SectionDivider />

          <GeneralDetailsTab
            category={detail.category}
            subcategory={detail.subcategory}
            condition={detail.condition}
            pickupAvailable={detail.pickupAvailable}
            deliveryAvailable={detail.deliveryAvailable}
          />

          <ListingSafetyCard />

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <ListingPhotoViewer
        visible={photoViewer.visible}
        photos={detail.images}
        initialIndex={photoViewer.index}
        onClose={() => {
          setPhotoViewer({
            visible: false,
            index: 0,
          });
        }}
      />

      <Modal
        visible={composerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          if (submittingOffer) {
            return;
          }

          setComposerOpen(false);
          setSubmitError(null);
        }}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <KeyboardAvoidingView
            style={styles.modalKeyboard}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {composerOpen ? (
                <OfferComposer
                  listingTitle={detail.title}
                  listingPrice={loadState.askingPrice}
                  submitting={submittingOffer}
                  error={submitError}
                  onCancel={() => {
                    if (submittingOffer) {
                      return;
                    }

                    setComposerOpen(false);
                    setSubmitError(null);
                  }}
                  onSubmit={(values) => {
                    void handleSubmitOffer(values);
                  }}
                />
              ) : null}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function deriveOfferCta(input: {
  isOwner: boolean;
  allowsOffers: boolean;
  askingPrice: number;
  viewerId: string | null;
  viewerOffers: ViewerOffersState;
}): OfferCta {
  if (input.isOwner) {
    return { kind: 'hidden' };
  }

  const knownOffers =
    input.viewerOffers.kind === 'known'
      ? input.viewerOffers.offers
      : null;
  const knownViewerId =
    input.viewerOffers.kind === 'known' ||
    input.viewerOffers.kind === 'failed'
      ? input.viewerOffers.viewerId
      : input.viewerId;

  if (input.viewerOffers.kind === 'failed' && knownOffers === null) {
    return { kind: 'unavailable' };
  }

  if (input.viewerOffers.kind === 'loading' || input.viewerOffers.kind === 'idle') {
    return { kind: 'loading' };
  }

  if (knownOffers === null) {
    return { kind: 'unavailable' };
  }

  const viewerId = knownViewerId;
  const mine =
    viewerId === null
      ? []
      : knownOffers.filter((offer) => offer.buyerId === viewerId);

  const accepted = [...mine]
    .reverse()
    .find((offer) => offer.status === 'accepted');

  if (accepted) {
    return {
      kind: 'view_accepted',
      offer: accepted,
    };
  }

  const pending = [...mine]
    .reverse()
    .find((offer) => offer.status === 'pending');

  if (pending) {
    return {
      kind: 'view_pending',
      offer: pending,
    };
  }

  if (
    !input.allowsOffers ||
    input.askingPrice <= 0 ||
    viewerId === null
  ) {
    return { kind: 'hidden' };
  }

  return { kind: 'make' };
}

function toListingOfferAction(
  cta: OfferCta,
  listingTitle: string,
): ListingOfferAction | undefined {
  if (cta.kind === 'hidden') {
    return undefined;
  }

  if (cta.kind === 'loading') {
    return {
      label: 'Offers…',
      accessibilityLabel: `Loading offers for ${listingTitle}`,
      disabled: true,
    };
  }

  if (cta.kind === 'unavailable') {
    return {
      label: 'Retry offers',
      accessibilityLabel: `Retry loading offers for ${listingTitle}`,
    };
  }

  if (cta.kind === 'view_pending') {
    return {
      label: 'View offer',
      accessibilityLabel: `View your offer for ${listingTitle}`,
    };
  }

  if (cta.kind === 'view_accepted') {
    return {
      label: 'View accepted offer',
      accessibilityLabel: `View your accepted offer for ${listingTitle}`,
    };
  }

  return {
    label: 'Make offer',
    accessibilityLabel: `Make an offer for ${listingTitle}`,
  };
}

function upsertOffer(
  offers: MarketOfferRecord[],
  next: MarketOfferRecord,
): MarketOfferRecord[] {
  const without = offers.filter((offer) => offer.id !== next.id);
  return [...without, next].sort((left, right) => {
    const created = left.createdAt.localeCompare(right.createdAt);
    if (created !== 0) {
      return created;
    }

    return left.id.localeCompare(right.id);
  });
}

function toBuyerOfferError(message: string): string {
  const lowered = message.toLowerCase();

  if (
    lowered.includes('p0001') ||
    lowered.includes('42501') ||
    lowered.includes('postgres') ||
    lowered.includes('row-level') ||
    lowered.includes('rls') ||
    lowered.includes('policy') ||
    lowered.includes('jwt') ||
    lowered.includes('sql')
  ) {
    return "We couldn't send your offer. Please try again.";
  }

  if (lowered.includes('own listing')) {
    return "You can't make an offer on your own listing.";
  }

  if (lowered.includes('not accepting new offers')) {
    return "This listing isn't accepting new offers.";
  }

  if (lowered.includes('not accepting offers')) {
    return "This listing isn't accepting offers.";
  }

  if (
    lowered.includes('no longer available') ||
    lowered.includes('not available')
  ) {
    return 'This listing is no longer available.';
  }

  if (
    lowered.includes('valid amount') ||
    lowered.includes('decimal')
  ) {
    return 'Enter a valid offer amount.';
  }

  if (lowered.includes('too long') || lowered.includes('500')) {
    return 'Keep your message to 500 characters or fewer.';
  }

  if (lowered.includes('signed in')) {
    return 'Sign in to continue.';
  }

  if (lowered.includes('connection')) {
    return 'Check your connection and try again.';
  }

  return "We couldn't send your offer. Please try again.";
}

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
};

function SectionHeader({
  eyebrow,
  title,
}: SectionHeaderProps) {
  return (
    <View>
      <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function SectionDivider() {
  return <View style={styles.sectionDivider} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080B09',
  },

  scrollContent: {
    paddingBottom: 40,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 14,
  },

  loadingCopy: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },

  errorTitle: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '900',
    textAlign: 'center',
  },

  errorBody: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    textAlign: 'center',
  },

  actionGroup: {
    marginTop: spacing.xxs,
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
  },

  unavailableIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: spacing.xxs,
  },

  offerStateCopy: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },

  sectionDivider: {
    height: 1,
    marginVertical: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },

  sectionEyebrow: {
    color: colors.primary,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  sectionTitle: {
    marginTop: 5,
    color: colors.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
  },

  description: {
    marginTop: 11,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: '600',
  },

  bottomSpacer: {
    height: 28,
  },

  modalSafeArea: {
    flex: 1,
    backgroundColor: '#080B09',
  },

  modalKeyboard: {
    flex: 1,
  },

  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
});
