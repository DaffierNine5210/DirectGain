import AuthStack from './AuthStack';
import BottomTabs from './BottomTabs';

type AppNavigatorProps = {
  isAuthenticated: boolean;
};

export default function AppNavigator({
  isAuthenticated,
}: AppNavigatorProps) {
  if (isAuthenticated) {
    return <BottomTabs />;
  }

  return <AuthStack />;
}