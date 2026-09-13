import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  alpha,
  palette,
  radius,
  spacing,
  textColor,
} from '../../../theme/designSystem';

const LATER_ITEMS = [
  'Experience',
  'Portfolio',
  'Qualifications',
] as const;

type ProfessionalSetupModuleProps = {
  missingFields: string[];
  onEditPress: () => void;
};

export default function ProfessionalSetupModule({
  missingFields,
  onEditPress,
}: ProfessionalSetupModuleProps) {
  const hasMissing = missingFields.length > 0;
  const missingLabel = missingFields.join(', ');

  return (
    <View
      style={styles.card}
      accessibilityRole="text"
      accessibilityLabel={
        hasMissing
          ? `Owner preview. Complete your Professional profile. Missing: ${missingLabel}. Experience, Portfolio and Qualifications come later. These details are not public yet.`
          : 'Owner preview. Core Professional details are ready. Experience, Portfolio and Qualifications come later. These details are not public yet.'
      }
    >
      <Text style={styles.kicker}>OWNER PREVIEW</Text>
      <Text style={styles.title}>
        {hasMissing
          ? 'Complete your Professional profile'
          : 'Core Professional details are ready'}
      </Text>
      <Text style={styles.body}>
        {hasMissing
          ? `Still to add: ${missingLabel}.`
          : 'Headline, About, availability, service area, work preference and skills can be edited any time.'}
      </Text>
      <Text style={styles.items}>
        Coming later · {LATER_ITEMS.join(' · ')}
      </Text>

      <Pressable
        onPress={onEditPress}
        accessibilityRole="button"
        accessibilityLabel="Edit Professional Profile"
        style={({ pressed }) => [
          styles.editButton,
          pressed && styles.editButtonPressed,
        ]}
      >
        <Text style={styles.editButtonText}>
          Edit Professional Profile
        </Text>
      </Pressable>
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

  editButton: {
    marginTop: 6,
    minHeight: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.opportunityGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },

  editButtonPressed: {
    opacity: 0.88,
  },

  editButtonText: {
    color: textColor.inverse,
    fontSize: 13,
    fontWeight: '800',
  },
});
