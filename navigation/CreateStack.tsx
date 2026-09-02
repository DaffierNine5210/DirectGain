import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CreateScreen from '../screens/CreateScreen';
import CreateJobScreen from '../screens/jobs/CreateJobScreen';

export type CreateStackParamList = {
  CreateHome: undefined;
  CreateJob: undefined;
};

const Stack =
  createNativeStackNavigator<CreateStackParamList>();

export default function CreateStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#080B09',
        },
        animation: 'fade_from_bottom',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="CreateHome"
        component={CreateScreen}
      />

      <Stack.Screen
        name="CreateJob"
        component={CreateJobScreen}
        options={{
          animation: 'slide_from_right',
          gestureDirection: 'horizontal',
        }}
      />
    </Stack.Navigator>
  );
}
