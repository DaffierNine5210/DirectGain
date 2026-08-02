import AuthStack from './AuthStack';
import BottomTabs from './BottomTabs';
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
    return <BottomTabs />;
  }

  return <AuthStack />;
}