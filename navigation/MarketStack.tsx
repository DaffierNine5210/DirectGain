import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ListingDetailScreen from '../screens/ListingDetailScreen';
import MarketScreen from '../screens/MarketScreen';

export type MarketStackParamList = {
  MarketHome: undefined;

  ListingDetail: {
    listingId: string;
  };
};

const Stack =
  createNativeStackNavigator<MarketStackParamList>();

export default function MarketStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#080B09',
        },
        animation: 'fade_from_bottom',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="MarketHome"
        component={MarketScreen}
      />

      <Stack.Screen
        name="ListingDetail"
        component={ListingDetailScreen}
        options={{
          animation: 'slide_from_right',
          gestureDirection: 'horizontal',
        }}
      />
    </Stack.Navigator>
  );
}