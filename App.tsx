import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator from './navigation/AppNavigator';
import AuthProvider from './providers/AuthProvider';
import { useAuth } from './hooks/useAuth';

function RootNavigator() {
  const {
  loading,
  isAuthenticated,
  isOnboarding,
} = useAuth();
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#9EF65A"
        />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator
  isAuthenticated={isAuthenticated}
  isOnboarding={isOnboarding}
/>
      
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080B09',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#080B09',
    justifyContent: 'center',
    alignItems: 'center',
  },
});