import type { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MyGainScreen from '../screens/MyGainScreen';
import EditOwnProfileScreen from '../screens/profile/EditOwnProfileScreen';
import EditProfessionalProfileScreen from '../screens/profile/EditProfessionalProfileScreen';
import EditProfessionalExperienceScreen from '../screens/profile/EditProfessionalExperienceScreen';
import EditProfessionalPortfolioScreen from '../screens/profile/EditProfessionalPortfolioScreen';
import EditProfessionalResumeScreen from '../screens/profile/EditProfessionalResumeScreen';
import ProfessionalResumeViewerScreen from '../screens/profile/ProfessionalResumeViewerScreen';
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
  EditProfessionalExperience: undefined;
  EditProfessionalPortfolio: undefined;
  EditProfessionalResume: undefined;
  ProfessionalResumeViewer: {
    storagePath: string;
    originalFilename: string;
  };
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
        name="EditProfessionalExperience"
        component={EditProfessionalExperienceScreen}
      />

      <Stack.Screen
        name="EditProfessionalPortfolio"
        component={EditProfessionalPortfolioScreen}
      />

      <Stack.Screen
        name="EditProfessionalResume"
        component={EditProfessionalResumeScreen}
      />

      <Stack.Screen
        name="ProfessionalResumeViewer"
        component={ProfessionalResumeViewerScreen}
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
