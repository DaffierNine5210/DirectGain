import AuthStack from './AuthStack';
import AuthenticatedApp from './AuthenticatedApp';
import OnboardingStack from './OnboardingStack';

type AppNavigatorProps = {
  isAuthenticated: boolean;
  isOnboarding: boolean;
};

export default function AppNavigator({
  isAuthenticated,
  isOnboarding,
}: AppNavigatorProps) {
  if (isOnboarding) {
    return <OnboardingStack />;
  }

  if (isAuthenticated) {
    return <AuthenticatedApp />;
  }

  return <AuthStack />;
}