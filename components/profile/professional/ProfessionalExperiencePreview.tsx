import { Pressable, StyleSheet, Text, View } from 'react-native';

import ProfessionalExperienceCard from './ProfessionalExperienceCard';
import ProfessionalLandingSectionHeader from './ProfessionalLandingSectionHeader';

import type {
  ProfessionalCredential,
  ProfessionalExperience as ProfessionalExperienceEntry,
} from '../../../types/professionalProfile';

import { palette, spacing, textColor } from '../../../theme/designSystem';

const PREVIEW_COUNT = 2;

type ProfessionalExperiencePreviewProps = {
  loading: boolean;
  error: string | null;
  experiences: ProfessionalExperienceEntry[];
  credentials: ProfessionalCredential[];
  onRetry: () => void;
  onViewAll: () => void;
  onEditBackground?: () => void;
};

function formatCredentialSummary(
  count: number,
): string | null {
  if (count <= 0) {
    return null;
  }

  if (count === 1) {
    return '+ 1 qualification or credential';
  }

  return `+ ${count} qualifications & credentials`;
}

export default function ProfessionalExperiencePreview({
  loading,
  error,
  experiences,
  credentials,
  onRetry,
  onViewAll,
  onEditBackground,
}: ProfessionalExperiencePreviewProps) {
  const previewExperiences = experiences.slice(0, PREVIEW_COUNT);
  const credentialSummary = formatCredentialSummary(
    credentials.length,
  );

  return (
    <View style={styles.root}>
      <ProfessionalLandingSectionHeader
        title="Experience"
        actionLabel="View all"
        onActionPress={onViewAll}
        actionAccessibilityLabel="View all experience"
        actionAccessibilityHint="Opens the Experience tab"
      />

      {loading ? (
        <Text style={styles.status}>Loading experience…</Text>
      ) : error ? (
        <View style={styles.block}>
          <Text style={styles.status}>{error}</Text>
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading Professional experience"
            style={({ pressed }) => [
              styles.textAction,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.textActionLabel}>Retry</Text>
          </Pressable>
        </View>
      ) : previewExperiences.length === 0 &&
        credentials.length === 0 ? (
        <View style={styles.block}>
          <Text style={styles.status}>
            No work experience added yet.
          </Text>
          {onEditBackground ? (
            <Pressable
              onPress={onEditBackground}
              accessibilityRole="button"
              accessibilityLabel="Edit experience and credentials"
              style={({ pressed }) => [
                styles.textAction,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.textActionLabel}>
                Edit experience
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View style={styles.entries}>
          {previewExperiences.map(item => (
            <ProfessionalExperienceCard
              key={item.id}
              experience={item}
              compact
            />
          ))}
          {previewExperiences.length === 0 ? (
            <Text style={styles.status}>
              No work experience added yet.
            </Text>
          ) : null}
          {credentialSummary ? (
            <Text
              style={styles.credentialSummary}
              accessibilityLabel={`${credentialSummary}. These are your claims. Direct Gain has not verified them.`}
            >
              {credentialSummary}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xxs,
  },

  entries: {
    gap: spacing.sm,
  },

  block: {
    gap: 2,
  },

  status: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },

  credentialSummary: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  textAction: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },

  textActionLabel: {
    color: palette.opportunityGreen,
    fontSize: 13,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.8,
  },
});
