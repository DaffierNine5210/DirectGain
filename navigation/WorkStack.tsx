import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ApplyToJobScreen from '../screens/jobs/ApplyToJobScreen';
import AssignedWorkScreen from '../screens/jobs/AssignedWorkScreen';
import JobApplicantDetailScreen from '../screens/jobs/JobApplicantDetailScreen';
import JobApplicantsScreen from '../screens/jobs/JobApplicantsScreen';
import JobDetailScreen from '../screens/jobs/JobDetailScreen';
import MyApplicationsScreen from '../screens/jobs/MyApplicationsScreen';
import MyJobsScreen from '../screens/jobs/MyJobsScreen';
import WorkHomeScreen from '../screens/jobs/WorkHomeScreen';
import PublicProfileScreen from '../screens/profile/PublicProfileScreen';

import type { JobsFlowParamList } from './jobsFlow';

export type WorkStackParamList = {
  WorkHome: undefined;
  MyJobs: undefined;
  MyApplications: undefined;
  AssignedWork: undefined;
} & JobsFlowParamList;

const Stack =
  createNativeStackNavigator<WorkStackParamList>();

export default function WorkStack() {
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
        name="WorkHome"
        component={WorkHomeScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />

      <Stack.Screen
        name="MyJobs"
        component={MyJobsScreen}
      />

      <Stack.Screen
        name="MyApplications"
        component={MyApplicationsScreen}
      />

      <Stack.Screen
        name="AssignedWork"
        component={AssignedWorkScreen}
      />

      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
      />

      <Stack.Screen
        name="ApplyToJob"
        component={ApplyToJobScreen}
      />

      <Stack.Screen
        name="JobApplicants"
        component={JobApplicantsScreen}
      />

      <Stack.Screen
        name="JobApplicantDetail"
        component={JobApplicantDetailScreen}
      />

      <Stack.Screen
        name="PublicProfile"
        component={PublicProfileScreen}
      />
    </Stack.Navigator>
  );
}
