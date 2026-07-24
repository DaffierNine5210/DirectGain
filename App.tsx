import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import BottomTabs from './navigation/BottomTabs';
import { colors } from './theme/colors';

const directGainTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
};

export default function App() {
  return (
    <NavigationContainer theme={directGainTheme}>
      <StatusBar style="light" />
      <BottomTabs />
    </NavigationContainer>
  );
}