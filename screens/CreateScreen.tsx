import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function CreateScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.icon}>
        <Ionicons name="add" size={48} color={colors.background} />
      </View>

      <Text style={styles.title}>Create</Text>
      <Text style={styles.description}>
        Create a listing, job post, social post or live auction.
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
    backgroundColor: colors.primary,
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