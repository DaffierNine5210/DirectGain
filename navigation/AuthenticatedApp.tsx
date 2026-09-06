import type {
  NavigatorScreenParams,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import BottomTabs, {
  type BottomTabParamList,
} from './BottomTabs';
import MessagesStack, {
  type MessagesStackParamList,
} from './MessagesStack';

import TabBarVisibilityProvider from '../providers/TabBarVisibilityProvider';

export type AuthenticatedRootParamList = {
  Tabs:
    | NavigatorScreenParams<BottomTabParamList>
    | undefined;
  Messages:
    | NavigatorScreenParams<MessagesStackParamList>
    | undefined;
};

const Stack =
  createNativeStackNavigator<AuthenticatedRootParamList>();

export default function AuthenticatedApp() {
  return (
    <TabBarVisibilityProvider>
      <Stack.Navigator
        initialRouteName="Tabs"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: '#080B09',
          },
        }}
      >
        <Stack.Screen
          name="Tabs"
          component={BottomTabs}
        />

        <Stack.Screen
          name="Messages"
          component={MessagesStack}
        />
      </Stack.Navigator>
    </TabBarVisibilityProvider>
  );
}
