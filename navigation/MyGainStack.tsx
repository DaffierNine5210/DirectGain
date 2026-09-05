import type { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MyGainScreen from '../screens/MyGainScreen';
import EditOwnProfileScreen from '../screens/profile/EditOwnProfileScreen';
import PublicProfileScreen from '../screens/profile/PublicProfileScreen';

import type { PublicProfileParamList } from './publicProfile';
import WorkStack, {
  type WorkStackParamList,
} from './WorkStack';

export type MyGainStackParamList = {
  MyGainHome: undefined;
  EditProfile: undefined;
  Work: NavigatorScreenParams<WorkStackParamList> | undefined;
} & PublicProfileParamList;

const Stack =
  createNativeStackNavigator<MyGainStackParamList>();

export default function MyGainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#080B09',
        },
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen
        name="MyGainHome"
        component={MyGainScreen}
        options={{
          animation: 'fade',
        }}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditOwnProfileScreen}
      />

      <Stack.Screen
        name="PublicProfile"
        component={PublicProfileScreen}
      />

      <Stack.Screen
        name="Work"
        component={WorkStack}
      />
    </Stack.Navigator>
  );
}
