import { StyleSheet, Text, View } from 'react-native';

import {
  alpha,
  radius,
  spacing,
  textColor,
} from '../../../theme/designSystem';

const SETUP_ITEMS = [
  'Professional headline',
  'Skills',
  'Experience',
  'Portfolio work',
  'Qualifications',
] as const;

export default function ProfessionalSetupModule() {
  return (
    <View
      style={styles.card}
      accessibilityRole="text"
      accessibilityLabel={`Owner preview. Complete your Professional profile. ${SETUP_ITEMS.join(', ')}. These details are not public yet.`}
    >
      <Text style={styles.kicker}>OWNER PREVIEW</Text>
      <Text style={styles.title}>
        Complete your Professional profile
      </Text>
      <Text style={styles.body}>
        Add these later. They are not public yet.
      </Text>
      <Text style={styles.items}>
        {SETUP_ITEMS.join(' · ')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha.green12,
    backgroundColor: alpha.green04,
    gap: 4,
  },

  kicker: {
    color: textColor.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  title: {
    color: textColor.primary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },

  body: {
    color: textColor.secondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },

  items: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
