import type { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MyGainScreen from '../screens/MyGainScreen';

import WorkStack, {
  type WorkStackParamList,
} from './WorkStack';

export type MyGainStackParamList = {
  MyGainHome: undefined;
  Work: NavigatorScreenParams<WorkStackParamList> | undefined;
};

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
        name="Work"
        component={WorkStack}
      />
    </Stack.Navigator>
  );
}
