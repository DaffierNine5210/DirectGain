import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import ConversationScreen from '../screens/ConversationScreen';
import MessagesInboxScreen from '../screens/MessagesInboxScreen';

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
};

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
    </Stack.Navigator>
  );
}