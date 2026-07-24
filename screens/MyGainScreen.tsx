import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function MyGainScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.icon}>
        <Ionicons name="person-outline" size={43} color={colors.primary} />
      </View>

      <Text style={styles.title}>My Gain</Text>
      <Text style={styles.description}>
        Manage your profile, listings, ratings, saved items and activity.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  icon: {
    width: 82,
    height: 82,
    borderRadius: 26,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    marginTop: 20,
  },

  description: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 8,
  },
});