import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ConversationScreen from '../screens/ConversationScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';
import MarketScreen from '../screens/MarketScreen';
import MyListingsScreen from '../screens/MyListingsScreen';
import SellerProfileScreen from '../screens/SellerProfileScreen';
import PublicProfileScreen from '../screens/profile/PublicProfileScreen';

import type { PublicProfileParamList } from './publicProfile';

export type MarketStackParamList = {
  MarketHome: undefined;

  MyListings: undefined;

  ListingDetail: {
    listingId: string;
  };

  SellerProfile: {
    sellerId: string;
  };

  Conversation: {
    conversationId: string;

    listingId?: string;

    intent?:
      | 'message'
      | 'offer';
  };
} & PublicProfileParamList;

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