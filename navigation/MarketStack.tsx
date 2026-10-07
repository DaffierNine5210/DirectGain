import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ConversationScreen from '../screens/ConversationScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';
import MarketScreen from '../screens/MarketScreen';
import MyListingsScreen from '../screens/MyListingsScreen';
import ManageListingScreen from '../screens/ManageListingScreen';
import EditListingDetailsScreen from '../screens/EditListingDetailsScreen';
import ManageListingPhotosScreen from '../screens/ManageListingPhotosScreen';
import SellerProfileScreen from '../screens/SellerProfileScreen';
import PublicProfileScreen from '../screens/profile/PublicProfileScreen';

import type { MarketListingFlowParamList } from './marketListingFlow';

export type MarketStackParamList = {
  MarketHome: undefined;

  MyListings: undefined;

  ManageListing: {
    listingId: string;
  };

  EditListingDetails: {
    listingId: string;
  };

  ManageListingPhotos: {
    listingId: string;
  };

  SellerProfile: {
    sellerId: string;
  };
} & MarketListingFlowParamList;

const Stack =
  createNativeStackNavigator<MarketStackParamList>();

export default function MarketStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,

        contentStyle: {
          backgroundColor:
            '#080B09',
        },

        animation:
          'fade_from_bottom',

        gestureEnabled:
          true,
      }}
    >
      <Stack.Screen
        name="MarketHome"
        component={
          MarketScreen
        }
      />

      <Stack.Screen
        name="MyListings"
        component={
          MyListingsScreen
        }
        options={{
          animation:
            'slide_from_right',

          gestureDirection:
            'horizontal',
        }}
      />

      <Stack.Screen
        name="ManageListing"
        component={
          ManageListingScreen
        }
        options={{
          animation:
            'slide_from_right',

          gestureDirection:
            'horizontal',
        }}
      />

      <Stack.Screen
        name="EditListingDetails"
        component={
          EditListingDetailsScreen
        }
        options={{
          animation:
            'slide_from_right',

          gestureDirection:
            'horizontal',
        }}
      />

      <Stack.Screen
        name="ManageListingPhotos"
        component={
          ManageListingPhotosScreen
        }
        options={{
          animation:
            'slide_from_right',

          gestureDirection:
            'horizontal',
        }}
      />

      <Stack.Screen
        name="ListingDetail"
        component={
          ListingDetailScreen
        }
        options={{
          animation:
            'slide_from_right',

          gestureDirection:
            'horizontal',
        }}
      />

      <Stack.Screen
        name="SellerProfile"
        component={
          SellerProfileScreen
        }
        options={{
          animation:
            'slide_from_right',

          gestureDirection:
            'horizontal',
        }}
      />

      <Stack.Screen
        name="PublicProfile"
        component={
          PublicProfileScreen
        }
        options={{
          animation:
            'slide_from_right',

          gestureDirection:
            'horizontal',
        }}
      />

      <Stack.Screen
        name="Conversation"
        component={
          ConversationScreen
        }
        options={{
          animation:
            'slide_from_right',

          gestureDirection:
            'horizontal',
        }}
      />
    </Stack.Navigator>
  );
}