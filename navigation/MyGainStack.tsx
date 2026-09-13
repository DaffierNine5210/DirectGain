import type { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MyGainScreen from '../screens/MyGainScreen';
import EditOwnProfileScreen from '../screens/profile/EditOwnProfileScreen';
import EditProfessionalProfileScreen from '../screens/profile/EditProfessionalProfileScreen';
import ProfileStylePreviewScreen from '../screens/profile/ProfileStylePreviewScreen';
import ProfileStyleScreen from '../screens/profile/ProfileStyleScreen';
import PublicProfileScreen from '../screens/profile/PublicProfileScreen';

import type { PublicProfileParamList } from './publicProfile';
import WorkStack, {
  type WorkStackParamList,
} from './WorkStack';

import type { ProfileTemplate } from '../types/profile';

export type MyGainStackParamList = {
  MyGainHome: undefined;
  EditProfile: undefined;
  ProfileStyle: undefined;
  ProfileStylePreview: {
    template: ProfileTemplate;
  };
  EditProfessionalProfile: undefined;
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
        name="ProfileStyle"
        component={ProfileStyleScreen}
      />

      <Stack.Screen
        name="ProfileStylePreview"
        component={ProfileStylePreviewScreen}
      />

      <Stack.Screen
        name="EditProfessionalProfile"
        component={EditProfessionalProfileScreen}
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
