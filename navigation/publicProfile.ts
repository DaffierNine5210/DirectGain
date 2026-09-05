import type {
  NavigationProp,
  ParamListBase,
} from '@react-navigation/native';

export type PublicProfileParamList = {
  PublicProfile: {
    profileId: string;
  };
};

export function navigateToOwnMyGain(
  navigation: NavigationProp<ParamListBase>,
): boolean {
  let current:
    | NavigationProp<ParamListBase>
    | undefined = navigation;

  while (current) {
    const names = current.getState()?.routeNames ?? [];

    if (names.includes('MyGainHome')) {
      current.navigate('MyGainHome');
      return true;
    }

    if (names.includes('My Gain')) {
      current.navigate('My Gain', {
        screen: 'MyGainHome',
      });
      return true;
    }

    current = current.getParent();
  }

  if (navigation.canGoBack()) {
    navigation.goBack();
    return true;
  }

  return false;
}
