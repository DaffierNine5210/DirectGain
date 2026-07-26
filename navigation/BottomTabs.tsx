import { Ionicons } from '@expo/vector-icons';
import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import MarketStack from './MarketStack';

import CreateScreen from '../screens/CreateScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import LiveBidScreen from '../screens/LiveBidScreen';
import MessagesInboxScreen from '../screens/MessagesInboxScreen';
import MyGainScreen from '../screens/MyGainScreen';

import { colors } from '../theme/colors';

export type BottomTabParamList = {
  Discover: undefined;
  Market: undefined;
  Messages: undefined;
  Create: undefined;
  Auctions: undefined;
  'My Gain': undefined;
};

const Tab =
  createBottomTabNavigator<BottomTabParamList>();

type TabIconName =
  | 'home'
  | 'home-outline'
  | 'storefront'
  | 'storefront-outline'
  | 'chatbubbles'
  | 'chatbubbles-outline'
  | 'add'
  | 'hammer'
  | 'hammer-outline'
  | 'person'
  | 'person-outline';

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: colors.primary,

        tabBarInactiveTintColor:
          colors.textSecondary,

        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          height: 92,
          paddingTop: 8,
          paddingBottom: 22,
          backgroundColor: '#090B09',
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },

        tabBarItemStyle: {
          minWidth: 0,
        },

        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '700',
        },

        tabBarIcon: ({
          color,
          size,
          focused,
        }) => {
          let iconName: TabIconName;

          switch (route.name) {
            case 'Discover':
              iconName = focused
                ? 'home'
                : 'home-outline';
              break;

            case 'Market':
              iconName = focused
                ? 'storefront'
                : 'storefront-outline';
              break;

            case 'Messages':
              iconName = focused
                ? 'chatbubbles'
                : 'chatbubbles-outline';
              break;

            case 'Create':
              iconName = 'add';
              break;

            case 'Auctions':
              iconName = focused
                ? 'hammer'
                : 'hammer-outline';
              break;

            case 'My Gain':
              iconName = focused
                ? 'person'
                : 'person-outline';
              break;

            default:
              iconName = 'home-outline';
          }

          const isCreate =
            route.name === 'Create';

          return (
            <Ionicons
              name={iconName}
              size={
                isCreate
                  ? 29
                  : Math.min(size, 23)
              }
              color={
                isCreate
                  ? colors.background
                  : color
              }
              style={
                isCreate
                  ? {
                      width: 48,
                      height: 44,
                      borderRadius: 15,
                      backgroundColor:
                        colors.primary,
                      textAlign: 'center',
                      lineHeight: 44,
                      shadowColor:
                        colors.primary,
                      shadowOpacity: 0.22,
                      shadowRadius: 10,
                      shadowOffset: {
                        width: 0,
                        height: 0,
                      },
                    }
                  : focused
                    ? {
                        textShadowColor:
                          colors.primary,
                        textShadowRadius: 7,
                      }
                    : undefined
              }
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
      />

      <Tab.Screen
        name="Market"
        component={MarketStack}
      />

      <Tab.Screen
        name="Messages"
        component={MessagesInboxScreen}
      />

      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{
          tabBarLabel: () => null,
        }}
      />

      <Tab.Screen
        name="Auctions"
        component={LiveBidScreen}
      />

      <Tab.Screen
        name="My Gain"
        component={MyGainScreen}
      />
    </Tab.Navigator>
  );
}