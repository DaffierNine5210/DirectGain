import { createNativeStackNavigator } from '@react-navigation/native-stack';

import InterestsScreen from '../screens/onboarding/InterestsScreen';
import OnboardingWelcomeScreen from '../screens/onboarding/OnboardingWelcomeScreen';
import ProfileDetailsScreen from '../screens/onboarding/ProfileDetailsScreen';
import ProfilePhotoScreen from '../screens/onboarding/ProfilePhotoScreen';
import TrustSafetyScreen from '../screens/onboarding/TrustSafetyScreen';

export type ProfileSetupDetails = {
  photoUri: string | null;
  displayName: string;
  username: string;
  bio: string;
  location: string;
};

export type InterestsSetupDetails = ProfileSetupDetails & {
  interests: string[];
};

export type OnboardingStackParamList = {
  ProfilePhoto: undefined;

  ProfileDetails: {
    photoUri: string | null;
  };

  Interests: ProfileSetupDetails;

  TrustSafety: InterestsSetupDetails;

  OnboardingWelcome: InterestsSetupDetails;
};

const Stack =
  createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack() {
  return (
    <Stack.Navigator
      initialRouteName="ProfilePhoto"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: '#080B09',
        },
      }}
    >
      <Stack.Screen
        name="ProfilePhoto"
        component={ProfilePhotoScreen}
      />

      <Stack.Screen
        name="ProfileDetails"
        component={ProfileDetailsScreen}
      />

      <Stack.Screen
        name="Interests"
        component={InterestsScreen}
      />

      <Stack.Screen
        name="TrustSafety"
        component={TrustSafetyScreen}
      />

      <Stack.Screen
        name="OnboardingWelcome"
        component={OnboardingWelcomeScreen}
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}