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
