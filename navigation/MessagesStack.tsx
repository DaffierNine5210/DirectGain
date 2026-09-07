import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import ApplyToJobScreen from '../screens/jobs/ApplyToJobScreen';
import ConversationScreen from '../screens/ConversationScreen';
import JobApplicantDetailScreen from '../screens/jobs/JobApplicantDetailScreen';
import JobApplicantsScreen from '../screens/jobs/JobApplicantsScreen';
import JobDetailScreen from '../screens/jobs/JobDetailScreen';
import LeaveReviewScreen from '../screens/jobs/LeaveReviewScreen';
import MessagesInboxScreen from '../screens/MessagesInboxScreen';
import PublicProfileScreen from '../screens/profile/PublicProfileScreen';

import type { JobsFlowParamList } from './jobsFlow';

export type ConversationEntryIntent =
  | 'message'
  | 'offer';

export type MessagesStackParamList = {
  Inbox: undefined;

  Conversation: {
    conversationId: string;

    listingId?: string;

    intent?: ConversationEntryIntent;
  };
} & JobsFlowParamList;

const Stack =
  createNativeStackNavigator<MessagesStackParamList>();

export default function MessagesStack() {
  return (
    <Stack.Navigator
      initialRouteName="Inbox"
      screenOptions={{
        headerShown: false,

        animation:
          'slide_from_right',

        contentStyle: {
          backgroundColor:
            '#080B09',
        },
      }}
    >
      <Stack.Screen
        name="Inbox"
        component={
          MessagesInboxScreen
        }
      />

      <Stack.Screen
        name="Conversation"
        component={
          ConversationScreen
        }
      />

      <Stack.Screen
        name="PublicProfile"
        component={PublicProfileScreen}
      />

      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
      />

      <Stack.Screen
        name="LeaveReview"
        component={LeaveReviewScreen}
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
    </Stack.Navigator>
  );
}
