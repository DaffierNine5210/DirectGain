import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';

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
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#080B09',
    justifyContent: 'center',
    alignItems: 'center',
  },
});