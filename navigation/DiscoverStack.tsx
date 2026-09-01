import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DiscoverScreen from '../screens/DiscoverScreen';
import DiscoverJobsScreen from '../screens/jobs/DiscoverJobsScreen';
import JobDetailScreen from '../screens/jobs/JobDetailScreen';

export type DiscoverStackParamList = {
  DiscoverHome: undefined;
  DiscoverJobs: undefined;
  JobDetail: {
    jobId: string;
  };
};

const Stack =
  createNativeStackNavigator<DiscoverStackParamList>();

export default function DiscoverStack() {
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
        name="DiscoverHome"
        component={DiscoverScreen}
      />

      <Stack.Screen
        name="DiscoverJobs"
        component={DiscoverJobsScreen}
        options={{
          animation: 'slide_from_right',
          gestureDirection: 'horizontal',
        }}
      />

      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{
          animation: 'slide_from_right',
          gestureDirection: 'horizontal',
        }}
      />
    </Stack.Navigator>
  );
}
