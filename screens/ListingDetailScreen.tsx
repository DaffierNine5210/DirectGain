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
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ListingActionBar from '../components/listing-detail/ListingActionBar';
import ListingHeader from '../components/listing-detail/ListingHeader';
import ListingHeroGallery from '../components/listing-detail/ListingHeroGallery';
import ListingPhotoViewer from '../components/listing-detail/ListingPhotoViewer';
import ListingSafetyCard from '../components/listing-detail/ListingSafetyCard';
import GeneralDetailsTab from '../components/listing-detail/details/GeneralDetailsTab';
import ListingPreviewSellerRow from '../components/market/ListingPreviewSellerRow';
import DGButton from '../components/DGButton';

import type {
  MarketStackParamList,
} from '../navigation/MarketStack';
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
import { openMarketConversation } from '../services/messaging/openMarketConversation';
import { getProfileIdentityVerified } from '../services/profile/identityVerificationRepository';
import { resolveProfileAvatarUrl } from '../services/profile/profileAvatarRepository';
import {
  getAuthenticatedUserId,
  getProfileById,
} from '../services/profile/profileRepository';

import { colors } from '../theme/colors';
import { palette } from '../theme/designSystem';

type Props =
  NativeStackScreenProps<
    MarketStackParamList,
    'ListingDetail'
  >;

type LoadState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | {
      kind: 'ready';
      detail: ListingPreviewPresentation;
      sellerProfileId: string;
      allowsOffers: boolean;
      isOwner: boolean;
    };

export default function ListingDetailScreen({
  navigation,
  route,
}: Props) {
  const listingId = route.params.listingId;
  const { hideTabBar, showTabBar } = useTabBarVisibility();
  const [loadState, setLoadState] = useState<LoadState>({
    kind: 'loading',
  });
  const [isFavourite, setIsFavourite] = useState(false);
  const [photoViewer, setPhotoViewer] = useState<{
    visible: boolean;
    index: number;
  }>({
    visible: false,
    index: 0,
  });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      showTabBar();
    };
  }, [showTabBar]);

  useEffect(() => {
    if (photoViewer.visible) {
      hideTabBar();
      return;
    }

    showTabBar();
  }, [hideTabBar, photoViewer.visible, showTabBar]);

  const loadDetail = useCallback(async () => {
    setLoadState({ kind: 'loading' });

    const listingResult = await getActiveMarketListing(listingId);

    if (listingResult.error || !listingResult.listing) {
      if (!mountedRef.current) {
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

    if (!mountedRef.current) {
      return;
    }

    const displayName =
      profileResult.profile?.displayName.trim() ||
      'Direct Gain member';

    const avatarUrl = await resolveProfileAvatarUrl(
      profileResult.profile?.avatarPath ?? null,
    );

    if (!mountedRef.current) {
      return;
    }

    setLoadState({
      kind: 'ready',
      sellerProfileId: listing.sellerProfileId,
      allowsOffers: listing.allowsOffers,
      isOwner:
        viewerId !== null &&
        viewerId === listing.sellerProfileId,
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
  }, [listingId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  function handleFavouritePress() {
    setIsFavourite((current) => !current);
  }

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

  function handleOfferPress() {
    Alert.alert(
      'Offers',
      'Offers will be connected in a later Market step.',
    );
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

  if (loadState.kind === 'error') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>
            Couldn't load listing
          </Text>
          <Text style={styles.errorBody}>{loadState.message}</Text>
          <DGButton
            title="Retry"
            onPress={() => {
              void loadDetail();
            }}
          />
          <DGButton
            title="Back"
            variant="ghost"
            onPress={() => {
              navigation.goBack();
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const { detail } = loadState;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ListingHeroGallery
          images={detail.images}
          favourite={isFavourite}
          onBackPress={() => navigation.goBack()}
          onFavouritePress={handleFavouritePress}
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
            listingTitle={detail.title}
            allowsOffers={loadState.allowsOffers}
            onMessagePress={() => {
              void handleMessagePress();
            }}
            onOfferPress={handleOfferPress}
          />

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
    </SafeAreaView>
  );
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
});
