import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChooseProfileScreen from '../screens/auth/ChooseProfileScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';

export type AccountType = 'personal' | 'business';

export type AuthStackParamList = {
  Welcome: undefined;
  ChooseProfile: undefined;
  Login: undefined;
  Register:
    | {
        accountType: AccountType;
      }
    | undefined;
  ForgotPassword: undefined;
};

const Stack =
  createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: '#080B09',
        },
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
      />

      <Stack.Screen
        name="ChooseProfile"
        component={ChooseProfileScreen}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
      />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
    </Stack.Navigator>
  );
}