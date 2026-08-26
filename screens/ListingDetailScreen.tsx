import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  useMemo,
  useState,
} from 'react';
import {
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
import ListingSafetyCard from '../components/listing-detail/ListingSafetyCard';
import SellerTrustCard from '../components/listing-detail/SellerTrustCard';

import GeneralDetailsTab from '../components/listing-detail/details/GeneralDetailsTab';
import VehicleDetailsTab from '../components/listing-detail/details/VehicleDetailsTab';
import VehicleModificationsTab from '../components/listing-detail/details/VehicleModificationsTab';

import {
  getListingById,
  listings,
} from '../data/listings';

import type {
  MarketStackParamList,
} from '../navigation/MarketStack';

import {
  resolveMarketConversation,
} from '../services/messaging/conversationResolver';

import {
  openMarketConversation,
} from '../services/messaging/openMarketConversation';

import { colors } from '../theme/colors';

import formatListingPrice from '../utils/listing/formatListingPrice';

type Props =
  NativeStackScreenProps<
    MarketStackParamList,
    'ListingDetail'
  >;

export default function ListingDetailScreen({
  navigation,
  route,
}: Props) {
  const listing = useMemo(
    () =>
      getListingById(
        route.params.listingId,
      ) ?? listings[0],
    [route.params.listingId],
  );

  const [
    isFavourite,
    setIsFavourite,
  ] = useState(
    listing.isFavourite,
  );

  const formattedPrice =
    formatListingPrice(
      listing.price,
      listing.currency,
    );

  const vehicleDetails =
    listing.vehicleDetails;

  function handleFavouritePress() {
    setIsFavourite(
      current => !current,
    );
  }

  async function handleSharePress() {
    try {
      await Share.share({
        message:
          `${listing.title} — ${formattedPrice}`,
      });
    } catch {
      Alert.alert(
        'Unable to share',
        'Please try again shortly.',
      );
    }
  }

  function handleSellerPress() {
    navigation.navigate(
      'SellerProfile',
      {
        sellerId:
          listing.seller.id,
      },
    );
  }

  async function handleMessagePress() {
    const conversationId =
      await resolveConversationId();

    if (!conversationId) {
      Alert.alert(
        'Unable to open messages',
        'A conversation could not be created or found for this listing.',
      );

      return;
    }

    navigation.navigate(
      'Conversation',
      {
        conversationId,

        listingId:
          listing.id,

        intent:
          'message',
      },
    );
  }

  async function handleOfferPress() {
    const conversationId =
      await resolveConversationId();

    if (!conversationId) {
      Alert.alert(
        'Unable to make offer',
        'A conversation could not be created or found for this listing.',
      );

      return;
    }

    navigation.navigate(
      'Conversation',
      {
        conversationId,

        listingId:
          listing.id,

        intent:
          'offer',
      },
    );
  }

  async function resolveConversationId():
    Promise<string | null> {
    /*
     * During development our Market listings still
     * contain mock seller IDs.
     *
     * Real Supabase Auth user IDs are UUIDs.
     *
     * Once Market listings themselves are stored in
     * Supabase this fallback can be removed.
     */

    if (
      !isUuid(
        listing.seller.id,
      )
    ) {
      const localConversation =
        resolveMarketConversation({
          listingId:
            listing.id,

          sellerId:
            listing.seller.id,
        });

      return (
        localConversation?.id ??
        null
      );
    }

    try {
      const result =
        await openMarketConversation({
          listingId:
            listing.id,

          listingTitle:
            listing.title,

          sellerId:
            listing.seller.id,
        });

      return (
        result?.conversationId ??
        null
      );
    } catch (error) {
      console.warn(
        '[Direct Gain] Unable to resolve Supabase market conversation:',
        error,
      );

      return null;
    }
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <ListingHeroGallery
          images={
            listing.images
          }
          favourite={
            isFavourite
          }
          onBackPress={() =>
            navigation.goBack()
          }
          onFavouritePress={
            handleFavouritePress
          }
          onSharePress={
            handleSharePress
          }
        />

        <View style={styles.content}>
          <ListingHeader
            title={
              listing.title
            }
            price={
              formattedPrice
            }
            suburb={
              listing.location
                .suburb
            }
            state={
              listing.location
                .state
            }
            distanceKm={
              listing.location
                .distanceKm
            }
            createdAt={
              listing.createdAt
            }
          />

          <ListingActionBar
            sellerName={
              listing.seller.name
            }
            listingTitle={
              listing.title
            }
            allowsOffers={
              listing.allowsOffers
            }
            onMessagePress={
              handleMessagePress
            }
            onOfferPress={
              handleOfferPress
            }
          />

          <SectionDivider />

          <SectionHeader
            eyebrow="ABOUT THIS LISTING"
            title="Description"
          />

          <Text
            style={
              styles.description
            }
          >
            {listing.description}
          </Text>

          <SectionDivider />

          <SectionHeader
            eyebrow="SELLER"
            title="Who's selling it"
          />

          <SellerTrustCard
            seller={
              listing.seller
            }
            onPress={
              handleSellerPress
            }
          />

          <SectionDivider />

          {vehicleDetails ? (
            <VehicleDetailsTab
              details={
                vehicleDetails
              }
            />
          ) : (
            <GeneralDetailsTab
              category={
                listing.category
              }
              subcategory={
                listing.subcategory
              }
              condition={
                listing.condition
              }
              pickupAvailable={
                listing.pickupAvailable
              }
              deliveryAvailable={
                listing.deliveryAvailable
              }
            />
          )}

          {vehicleDetails
            ?.modifications
            ?.length ? (
            <>
              <View
                style={
                  styles.compactSpacing
                }
              />

              <VehicleModificationsTab
                modifications={
                  vehicleDetails.modifications
                }
              />
            </>
          ) : null}

          <ListingSafetyCard />

          <View
            style={
              styles.bottomSpacer
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function isUuid(
  value: string,
): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
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
      <Text
        style={
          styles.sectionEyebrow
        }
      >
        {eyebrow}
      </Text>

      <Text
        style={
          styles.sectionTitle
        }
      >
        {title}
      </Text>
    </View>
  );
}

function SectionDivider() {
  return (
    <View
      style={
        styles.sectionDivider
      }
    />
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,

      backgroundColor:
        '#080B09',
    },

    scrollContent: {
      paddingBottom: 40,
    },

    content: {
      paddingHorizontal: 20,

      paddingTop: 20,
    },

    sectionDivider: {
      height: 1,

      marginVertical: 22,

      backgroundColor:
        'rgba(255, 255, 255, 0.07)',
    },

    compactSpacing: {
      height: 10,
    },

    sectionEyebrow: {
      color:
        colors.primary,

      fontSize: 9,

      lineHeight: 12,

      fontWeight: '900',

      letterSpacing: 1.5,
    },

    sectionTitle: {
      marginTop: 5,

      color:
        colors.text,

      fontSize: 20,

      lineHeight: 25,

      fontWeight: '900',
    },

    description: {
      marginTop: 11,

      color:
        colors.textMuted,

      fontSize: 13,

      lineHeight: 21,

      fontWeight: '600',
    },

    bottomSpacer: {
      height: 28,
    },
  });