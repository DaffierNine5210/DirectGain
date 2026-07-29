import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <Text style={styles.title}>Sign in</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080B09',
  },

  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#080B09',
  },

  title: {
    color: '#F5F8F5',
    fontSize: 28,
    fontWeight: '900',
  },
});
