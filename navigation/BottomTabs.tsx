import { Ionicons } from '@expo/vector-icons';
import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import {
  mediumTap,
  selectionHaptic,
} from '../utils/haptics';

import type {
  NavigatorScreenParams,
} from '@react-navigation/native';

import CreateStack, {
  type CreateStackParamList,
} from './CreateStack';
import DiscoverStack, {
  type DiscoverStackParamList,
} from './DiscoverStack';
import MarketStack from './MarketStack';
import MessagesStack from './MessagesStack';
import LiveBidScreen from '../screens/LiveBidScreen';
import MyGainScreen from '../screens/MyGainScreen';

import useTabBarVisibility from '../hooks/useTabBarVisibility';
import TabBarVisibilityProvider from '../providers/TabBarVisibilityProvider';

import { colors } from '../theme/colors';

export type BottomTabParamList = {
  Discover:
    | NavigatorScreenParams<DiscoverStackParamList>
    | undefined;
  Market: undefined;
  Create:
    | NavigatorScreenParams<CreateStackParamList>
    | undefined;
  Auctions: undefined;
  'My Gain': undefined;
  Messages: undefined;
};

const Tab =
  createBottomTabNavigator<BottomTabParamList>();

type VisibleTabName =
  | 'Discover'
  | 'Market'
  | 'Create'
  | 'Auctions'
  | 'My Gain';

type TabIconName =
  | 'compass'
  | 'compass-outline'
  | 'storefront'
  | 'storefront-outline'
  | 'add'
  | 'hammer'
  | 'hammer-outline'
  | 'person-circle'
  | 'person-circle-outline';

function getTabIcon(
  routeName: VisibleTabName,
  focused: boolean,
): TabIconName {
  switch (routeName) {
    case 'Discover':
      return focused
        ? 'compass'
        : 'compass-outline';

    case 'Market':
      return focused
        ? 'storefront'
        : 'storefront-outline';

    case 'Create':
      return 'add';

    case 'Auctions':
      return focused
        ? 'hammer'
        : 'hammer-outline';

    case 'My Gain':
      return focused
        ? 'person-circle'
        : 'person-circle-outline';

    default:
      return 'compass-outline';
  }
}

function BottomTabsNavigator() {
  const {
    translateY,
    showTabBar,
  } = useTabBarVisibility();

  return (
    <Tab.Navigator
      initialRouteName="Discover"
      screenListeners={({ route }) => ({
        tabPress: () => {
          showTabBar();

          if (route.name === 'Create') {
            void mediumTap();
          } else {
            void selectionHaptic();
          }
        },
      })}
      screenOptions={({ route }) => {
        const isCreate =
          route.name === 'Create';

        return {
          headerShown: false,

          tabBarHideOnKeyboard: true,

          tabBarActiveTintColor:
            colors.primary,

          tabBarInactiveTintColor:
            '#778078',

          tabBarStyle: [
            styles.tabBar,
            {
              transform: [
                {
                  translateY,
                },
              ],
            },
          ],

          tabBarItemStyle: isCreate
            ? styles.createTabItem
            : styles.tabItem,

          tabBarLabelStyle:
            styles.tabLabel,

          tabBarLabelPosition:
            'below-icon',

          tabBarIcon: ({
            color,
            focused,
          }) => {
            if (
              route.name === 'Messages'
            ) {
              return null;
            }

            const visibleRoute =
              route.name as VisibleTabName;

            const iconName =
              getTabIcon(
                visibleRoute,
                focused,
              );

            if (isCreate) {
              return (
                <View
                  style={
                    styles.createOuterGlow
                  }
                >
                  <View
                    style={
                      styles.createButton
                    }
                  >
                    <Ionicons
                      name={iconName}
                      size={30}
                      color="#071004"
                    />
                  </View>
                </View>
              );
            }

            return (
              <View
                style={[
                  styles.iconArea,
                  focused &&
                    styles.iconAreaActive,
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={23}
                  color={color}
                />
              </View>
            );
          },
        };
      }}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverStack}
        options={{
          tabBarLabel: 'Discover',
        }}
      />

      <Tab.Screen
        name="Market"
        component={MarketStack}
        options={{
          tabBarLabel: 'Market',
        }}
      />

      <Tab.Screen
        name="Create"
        component={CreateStack}
        options={{
          tabBarLabel: '',
        }}
      />

      <Tab.Screen
        name="Auctions"
        component={LiveBidScreen}
        options={{
          tabBarLabel: 'Auctions',
        }}
      />

      <Tab.Screen
        name="My Gain"
        component={MyGainScreen}
        options={{
          tabBarLabel: 'My Gain',
        }}
      />

      <Tab.Screen
        name="Messages"
        component={MessagesStack}
        options={{
          tabBarButton: () => null,

          tabBarItemStyle: {
            display: 'none',
          },
        }}
      />
    </Tab.Navigator>
  );
}

export default function BottomTabs() {
  return (
    <TabBarVisibilityProvider>
      <BottomTabsNavigator />
    </TabBarVisibilityProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',

    right: 0,
    bottom: 0,
    left: 0,

    height:
      Platform.OS === 'ios'
        ? 94
        : 80,

    paddingTop: 10,
    paddingHorizontal: 12,

    paddingBottom:
      Platform.OS === 'ios'
        ? 25
        : 12,

    borderTopWidth: 1,

    borderTopColor:
      'rgba(158, 246, 90, 0.10)',

    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    backgroundColor: '#090D0A',

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: -8,
    },

    shadowOpacity: 0.34,
    shadowRadius: 18,

    elevation: 20,
  },

  tabItem: {
    minWidth: 0,
    paddingTop: 1,
  },

  createTabItem: {
    minWidth: 0,
    paddingTop: 0,
  },

  tabLabel: {
    marginTop: 1,

    fontSize: 9,
    lineHeight: 12,

    fontWeight: '800',

    letterSpacing: 0.1,
  },

  iconArea: {
    width: 42,
    height: 34,

    borderRadius: 13,

    alignItems: 'center',
    justifyContent: 'center',
  },

  iconAreaActive: {
    backgroundColor:
      'rgba(158, 246, 90, 0.10)',

    borderWidth: 1,

    borderColor:
      'rgba(158, 246, 90, 0.12)',
  },

  createOuterGlow: {
    width: 62,
    height: 62,

    marginTop: -27,

    borderRadius: 22,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      'rgba(158, 246, 90, 0.04)',

    shadowColor: colors.primary,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.12,
    shadowRadius: 6,

    elevation: 6,
  },

  createButton: {
    width: 54,
    height: 54,

    borderRadius: 19,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      colors.primary,

    borderWidth: 1,

    borderColor:
      'rgba(216, 255, 194, 0.68)',

    shadowColor:
      colors.primary,

    shadowOffset: {
      width: 0,
      height: 0,
    },

    shadowOpacity: 0.13,
    shadowRadius: 4,

    elevation: 6,
  },
});