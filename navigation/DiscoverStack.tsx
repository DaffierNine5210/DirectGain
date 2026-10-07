import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DiscoverScreen from '../screens/DiscoverScreen';
import ConversationScreen from '../screens/ConversationScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';
import ApplyToJobScreen from '../screens/jobs/ApplyToJobScreen';
import DiscoverJobsScreen from '../screens/jobs/DiscoverJobsScreen';
import JobApplicantDetailScreen from '../screens/jobs/JobApplicantDetailScreen';
import JobApplicantsScreen from '../screens/jobs/JobApplicantsScreen';
import JobDetailScreen from '../screens/jobs/JobDetailScreen';
import LeaveReviewScreen from '../screens/jobs/LeaveReviewScreen';
import PublicProfileScreen from '../screens/profile/PublicProfileScreen';

import type { JobsFlowParamList } from './jobsFlow';
import type { MarketListingFlowParamList } from './marketListingFlow';

export type DiscoverStackParamList = {
  DiscoverHome: undefined;
  DiscoverJobs: undefined;
} & JobsFlowParamList
  & MarketListingFlowParamList;

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

      <Stack.Screen
        name="LeaveReview"
        component={LeaveReviewScreen}
        options={{
          animation: 'slide_from_right',
          gestureDirection: 'horizontal',
        }}
      />

      <Stack.Screen
        name="ApplyToJob"
        component={ApplyToJobScreen}
        options={{
          animation: 'slide_from_right',
          gestureDirection: 'horizontal',
        }}
      />

      <Stack.Screen
        name="JobApplicants"
        component={JobApplicantsScreen}
        options={{
          animation: 'slide_from_right',
          gestureDirection: 'horizontal',
        }}
      />

      <Stack.Screen
        name="JobApplicantDetail"
        component={JobApplicantDetailScreen}
        options={{
          animation: 'slide_from_right',
          gestureDirection: 'horizontal',
        }}
      />

      <Stack.Screen
        name="PublicProfile"
        component={PublicProfileScreen}
        options={{
          animation: 'slide_from_right',
          gestureDirection: 'horizontal',
        }}
      />

      <Stack.Screen
        name="ListingDetail"
        component={ListingDetailScreen}
        options={{
          animation: 'slide_from_right',
          gestureDirection: 'horizontal',
        }}
      />

      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{
          animation: 'slide_from_right',
          gestureDirection: 'horizontal',
        }}
      />
    </Stack.Navigator>
  );
}
