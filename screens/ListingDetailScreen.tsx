import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { MarketStackParamList } from '../navigation/MarketStack';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<
  MarketStackParamList,
  'ListingDetail'
>;

export default function ListingDetailScreen({
  navigation,
  route,
}: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.text}
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Listing
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share listing"
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="share-outline"
            size={22}
            color={colors.text}
          />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="sparkles"
            size={34}
            color={colors.primary}
          />
        </View>

        <Text style={styles.eyebrow}>
          DIRECT GAIN
        </Text>

        <Text style={styles.title}>
          Listing experience ready
        </Text>

        <Text style={styles.description}>
          You opened listing {route.params.listingId}.
          {'\n\n'}
          This screen will become the full Direct Gain
          listing experience with images, seller trust
          information, Opportunity Score and animated
          actions.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080B09',
  },

  header: {
    height: 62,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    width: 74,
    height: 74,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.30)',
    backgroundColor: 'rgba(158, 246, 90, 0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  eyebrow: {
    marginTop: 22,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.8,
  },

  title: {
    marginTop: 8,
    color: colors.text,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
    textAlign: 'center',
  },

  description: {
    marginTop: 14,
    maxWidth: 330,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
  },

  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.96 }],
  },
});