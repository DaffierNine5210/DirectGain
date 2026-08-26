import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert } from 'react-native';

import GainProfileScreen from './profile/GainProfileScreen';

import {
  listings,
} from '../data/listings';

import {
  getSellerById,
  sellers,
} from '../data/sellers';

import type {
  MarketStackParamList,
} from '../navigation/MarketStack';

import type {
  VerificationType,
} from '../types/Listing';

import type {
  SellerPortfolioItem,
} from '../types/SellerProfile';

type Props =
  NativeStackScreenProps<
    MarketStackParamList,
    'SellerProfile'
  >;

export default function SellerProfileScreen({
  navigation,
  route,
}: Props) {
  const seller =
    getSellerById(
      route.params.sellerId,
    ) ?? sellers[0];

  const [
    isFollowing,
    setIsFollowing,
  ] = useState(
    seller.isFollowing,
  );

  function handleFollowPress() {
    setIsFollowing(
      (current) => !current,
    );
  }

  function handleMessagePress() {
    Alert.alert(
      `Message ${seller.name}`,
      'Direct messaging will be connected in a later stage.',
    );
  }

  function handleSharePress() {
    Alert.alert(
      'Share profile',
      'Profile sharing will be connected in a later stage.',
    );
  }

  function handleMorePress() {
    Alert.alert(
      'Profile options',
      'Reporting, blocking and additional profile options will be added later.',
    );
  }

  function handleListingPress(
    listingId: string,
  ) {
    navigation.navigate(
      'ListingDetail',
      {
        listingId,
      },
    );
  }

  function handleVerificationPress(
    verification:
      VerificationType,
  ) {
    const titles: Record<
      VerificationType,
      string
    > = {
      identity:
        'Identity verified',

      business:
        'Business verified',

      professional:
        'Professional verified',

      community:
        'Community trusted',
    };

    const descriptions: Record<
      VerificationType,
      string
    > = {
      identity:
        'This member has completed Direct Gain identity checks using verified personal information.',

      business:
        'This member has provided business information that has been reviewed by Direct Gain.',

      professional:
        'This member has supplied relevant professional licences, qualifications or trade credentials.',

      community:
        'This badge is earned through strong reviews, verified activity and positive community conduct.',
    };

    Alert.alert(
      titles[verification],
      descriptions[verification],
    );
  }

  function handlePortfolioItemPress(
    item:
      SellerPortfolioItem,
  ) {
    Alert.alert(
      item.title,
      item.description ??
        'More portfolio details will be available later.',
    );
  }

  function handleViewAllPortfolioPress() {
    Alert.alert(
      'Complete portfolio',
      'The full portfolio screen will be connected in a later stage.',
    );
  }

  function handleViewAllReviewsPress() {
    Alert.alert(
      'All reviews',
      'The full reviews screen will be connected in a later stage.',
    );
  }

  return (
    <GainProfileScreen
      seller={seller}
      listings={listings}
      isFollowing={
        isFollowing
      }
      onBackPress={() => {
        navigation.goBack();
      }}
      onFollowPress={
        handleFollowPress
      }
      onMessagePress={
        handleMessagePress
      }
      onSharePress={
        handleSharePress
      }
      onMorePress={
        handleMorePress
      }
      onListingPress={
        handleListingPress
      }
      onVerificationPress={
        handleVerificationPress
      }
      onPortfolioItemPress={
        handlePortfolioItemPress
      }
      onViewAllPortfolioPress={
        handleViewAllPortfolioPress
      }
      onViewAllReviewsPress={
        handleViewAllReviewsPress
      }
    />
  );
}