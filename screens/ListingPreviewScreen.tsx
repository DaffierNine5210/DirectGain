import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ListingHeader from '../components/listing-detail/ListingHeader';
import ListingHeroGallery from '../components/listing-detail/ListingHeroGallery';
import ListingSafetyCard from '../components/listing-detail/ListingSafetyCard';
import GeneralDetailsTab from '../components/listing-detail/details/GeneralDetailsTab';
import ListingPreviewOwnerActions from '../components/market/ListingPreviewOwnerActions';
import ListingPreviewSellerRow from '../components/market/ListingPreviewSellerRow';
import DGButton from '../components/DGButton';

import useTabBarVisibility from '../hooks/useTabBarVisibility';

import type { CreateStackParamList } from '../navigation/CreateStack';
import { navigateToOwnMyGain } from '../navigation/publicProfile';

import {
  toListingPreviewPresentation,
  type ListingPreviewPresentation,
} from '../services/market/listingPreviewPresentation';
import {
  getOwnListing,
  getOwnListingMedia,
  publishOwnListing,
} from '../services/market/marketListingsRepository';
import { getProfileIdentityVerified } from '../services/profile/identityVerificationRepository';
import { resolveProfileAvatarUrl } from '../services/profile/profileAvatarRepository';
import { getProfileById } from '../services/profile/profileRepository';

import { colors } from '../theme/colors';
import { palette } from '../theme/designSystem';

type Props = NativeStackScreenProps<
  CreateStackParamList,
  'ListingPreview'
>;

type LoadState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; preview: ListingPreviewPresentation };

type PreviewListingStatus = 'draft' | 'active';

function looksLikeInternalPublishError(message: string): boolean {
  const lowered = message.toLowerCase();

  return (
    lowered.includes('sql') ||
    lowered.includes('postgres') ||
    lowered.includes('schema') ||
    lowered.includes('row-level security') ||
    lowered.includes('permission denied') ||
    lowered.includes('42501') ||
    lowered.includes('pgrst') ||
    lowered.includes('function')
  );
}

function mapPublishErrorToUserCopy(error: string | null): string {
  const message = error?.trim() ?? '';
  const lowered = message.toLowerCase();

  if (lowered.includes('at least one photo')) {
    return 'Add at least one photo before listing.';
  }

  if (lowered.includes('price greater than 0')) {
    return 'Enter a price greater than 0 before listing.';
  }

  if (lowered.includes('photo order')) {
    return 'We couldn’t confirm your photo order. Return to your draft and try again.';
  }

  if (lowered.includes('only a saved draft')) {
    return 'This listing can no longer be published from this preview.';
  }

  if (lowered.includes('could not be listed')) {
    return 'We couldn’t list your item. Please try again.';
  }

  if (looksLikeInternalPublishError(message) || message.length === 0) {
    return 'We couldn’t list your item. Please try again.';
  }

  if (message.length <= 160) {
    return message;
  }

  return 'We couldn’t list your item. Please try again.';
}

export default function ListingPreviewScreen({
  navigation,
  route,
}: Props) {
  const { hideTabBar, showTabBar } = useTabBarVisibility();
  const listingId = route.params.listingId;
  const [loadState, setLoadState] = useState<LoadState>({
    kind: 'loading',
  });
  const [listingStatus, setListingStatus] =
    useState<PreviewListingStatus>('draft');
  const [isPublishing, setIsPublishing] = useState(false);
  const mountedRef = useRef(true);
  const publishingRef = useRef(false);
  const listingStatusRef = useRef<PreviewListingStatus>('draft');

  useEffect(() => {
    mountedRef.current = true;
    hideTabBar();

    return () => {
      mountedRef.current = false;
      showTabBar();
    };
  }, [hideTabBar, showTabBar]);

  const returnToCreateHome = useCallback(() => {
    navigation.popToTop();
  }, [navigation]);

  const runPublish = useCallback(async () => {
    if (
      publishingRef.current ||
      listingStatusRef.current !== 'draft'
    ) {
      return;
    }

    publishingRef.current = true;
    setIsPublishing(true);

    const result = await publishOwnListing(listingId);

    if (!mountedRef.current) {
      publishingRef.current = false;
      return;
    }

    if (result.error || result.status !== 'active') {
      publishingRef.current = false;
      setIsPublishing(false);
      Alert.alert(
        'Couldn’t list this item',
        mapPublishErrorToUserCopy(result.error),
      );
      return;
    }

    publishingRef.current = false;
    listingStatusRef.current = 'active';
    setIsPublishing(false);
    setListingStatus('active');
  }, [listingId]);

  const handleListItemPress = useCallback(() => {
    if (
      publishingRef.current ||
      listingStatusRef.current !== 'draft' ||
      loadState.kind !== 'ready'
    ) {
      return;
    }

    Alert.alert(
      'List this item?',
      'Your listing will become active on Direct Gain. You can’t return it to draft from this screen.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'List item',
          onPress: () => {
            void runPublish();
          },
        },
      ],
    );
  }, [loadState.kind, runPublish]);

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      'beforeRemove',
      (event) => {
        if (publishingRef.current) {
          event.preventDefault();
          return;
        }

        if (listingStatusRef.current !== 'active') {
          return;
        }

        if (event.data.action.type === 'POP_TO_TOP') {
          return;
        }

        event.preventDefault();
        navigation.popToTop();
      },
    );

    return unsubscribe;
  }, [navigation]);

  const loadPreview = useCallback(async () => {
    setLoadState({ kind: 'loading' });

    const listingResult = await getOwnListing(listingId);

    if (listingResult.error || !listingResult.listing) {
      setLoadState({
        kind: 'error',
        message:
          listingResult.error ??
          "Couldn't load this preview.",
      });
      return;
    }

    const listing = listingResult.listing;

    const [mediaResult, profileResult, identityResult] =
      await Promise.all([
        getOwnListingMedia(listing.id),
        getProfileById(listing.sellerProfileId),
        getProfileIdentityVerified(listing.sellerProfileId),
      ]);

    if (mediaResult.error) {
      setLoadState({
        kind: 'error',
        message: mediaResult.error,
      });
      return;
    }

    const displayName =
      profileResult.profile?.displayName.trim() ||
      'Direct Gain member';

    const avatarUrl = await resolveProfileAvatarUrl(
      profileResult.profile?.avatarPath ?? null,
    );

    setLoadState({
      kind: 'ready',
      preview: toListingPreviewPresentation({
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
    void loadPreview();
  }, [loadPreview]);

  if (loadState.kind === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator color={palette.opportunityGreen} />
          <Text style={styles.loadingCopy}>Loading preview</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadState.kind === 'error') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Couldn't load preview</Text>
          <Text style={styles.errorBody}>{loadState.message}</Text>
          <DGButton
            title="Retry"
            onPress={() => {
              void loadPreview();
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

  const { preview } = loadState;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ListingHeroGallery
          images={preview.images}
          showFavourite={false}
          showShare={false}
          onBackPress={() => {
            if (listingStatus === 'active') {
              returnToCreateHome();
              return;
            }

            navigation.goBack();
          }}
          onFavouritePress={() => {}}
          onSharePress={() => {}}
        />

        <View style={styles.content}>
          <ListingHeader
            title={preview.title}
            price={preview.formattedPrice}
            suburb={preview.suburb}
            state={preview.state}
            createdAt={preview.listedOn}
          />

          <ListingPreviewOwnerActions
            status={listingStatus}
            isPublishing={isPublishing}
            photoCount={preview.photoCount}
            onListItem={handleListItemPress}
            onDone={returnToCreateHome}
          />

          <SectionDivider />

          <SectionHeader
            eyebrow="ABOUT THIS LISTING"
            title="Description"
          />

          <Text style={styles.description}>
            {preview.description}
          </Text>

          <SectionDivider />

          <SectionHeader
            eyebrow="SELLER"
            title="Who's selling it"
          />

          <ListingPreviewSellerRow
            displayName={preview.seller.displayName}
            avatarUrl={preview.seller.avatarUrl}
            identityVerified={preview.seller.identityVerified}
            onViewProfile={() => {
              navigateToOwnMyGain(navigation);
            }}
          />

          <SectionDivider />

          <GeneralDetailsTab
            category={preview.category}
            subcategory={preview.subcategory}
            condition={preview.condition}
            pickupAvailable={preview.pickupAvailable}
            deliveryAvailable={preview.deliveryAvailable}
          />

          <ListingSafetyCard />

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
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
