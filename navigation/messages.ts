import type {
  NavigationProp,
  ParamListBase,
} from '@react-navigation/native';

export function openMessagesInbox(
  navigation: NavigationProp<ParamListBase>,
): boolean {
  let current:
    | NavigationProp<ParamListBase>
    | undefined = navigation;

  while (current) {
    const names = current.getState()?.routeNames ?? [];

    if (names.includes('Messages')) {
      current.navigate('Messages', {
        screen: 'Inbox',
      });
      return true;
    }

    current = current.getParent();
  }

  return false;
}

export function openMessagesConversation(
  navigation: NavigationProp<ParamListBase>,
  conversationId: string,
): boolean {
  const id = conversationId.trim().toLowerCase();

  if (!id) {
    return false;
  }

  let current:
    | NavigationProp<ParamListBase>
    | undefined = navigation;

  while (current) {
    const names = current.getState()?.routeNames ?? [];

    if (names.includes('Messages')) {
      current.navigate('Messages', {
        screen: 'Conversation',
        params: {
          conversationId: id,
        },
      });
      return true;
    }

    if (names.includes('Conversation')) {
      current.navigate('Conversation', {
        conversationId: id,
      });
      return true;
    }

    current = current.getParent();
  }

  return false;
}
