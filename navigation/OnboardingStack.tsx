import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfilePhotoScreen from '../screens/onboarding/ProfilePhotoScreen';

export type OnboardingStackParamList = {
  ProfilePhoto: undefined;
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
    </Stack.Navigator>
  );
}