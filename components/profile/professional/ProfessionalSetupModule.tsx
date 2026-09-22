import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  alpha,
  palette,
  radius,
  spacing,
  textColor,
} from '../../../theme/designSystem';

type ProfessionalSetupModuleProps = {
  missingFields: string[];
  onEditPress: () => void;
  compact?: boolean;
  professionalIsLive?: boolean;
};

export default function ProfessionalSetupModule({
  missingFields,
  onEditPress,
  compact = false,
  professionalIsLive = false,
}: ProfessionalSetupModuleProps) {
  const hasMissing = missingFields.length > 0;
  const missingLabel = missingFields.join(', ');
  const readyTitle = compact
    ? 'Professional profile details are ready.'
    : 'Core Professional details are ready';
  const readyBody = compact
    ? 'Edit your information at any time.'
    : 'Headline, About, availability, service area, work preference, skills, experience, credentials, portfolio and résumé can be edited any time.';

  const accessibilityLabel = professionalIsLive
    ? hasMissing
      ? `Professional is live publicly. Still to add: ${missingLabel}. Edit any time.`
      : 'Professional is live publicly. Edit any time.'
    : hasMissing
      ? `Owner preview. Complete your Professional profile. Missing: ${missingLabel}. These details are not public yet.`
      : 'Owner preview. Professional profile details are ready. Edit your information at any time. These details are not public yet.';

  const title =
    professionalIsLive && !hasMissing
      ? 'Professional is live publicly.'
      : hasMissing
        ? 'Complete your Professional profile'
        : readyTitle;

  const body = professionalIsLive
    ? hasMissing
      ? `Still to add: ${missingLabel}.`
      : 'Edit any time.'
    : hasMissing
      ? `Still to add: ${missingLabel}.`
      : readyBody;

  return (
    <View
      style={[styles.card, compact && styles.cardCompact]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      {compact ? null : (
        <Text style={styles.kicker}>OWNER PREVIEW</Text>
      )}
      <Text style={styles.title}>
        {title}
      </Text>
      <Text style={styles.body}>
        {body}
      </Text>

      <Pressable
        onPress={onEditPress}
        accessibilityRole="button"
        accessibilityLabel="Edit Professional Profile"
        style={({ pressed }) => [
          styles.editButton,
          compact && styles.editButtonCompact,
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

  cardCompact: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    gap: spacing.xxs,
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

  editButton: {
    marginTop: 6,
    minHeight: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  editButtonCompact: {
    marginTop: spacing.xxs,
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
    borderWidth: 0,
  },

  editButtonPressed: {
    opacity: 0.88,
  },

  editButtonText: {
    color: palette.opportunityGreen,
    fontSize: 13,
    fontWeight: '800',
  },
});
