import { Pressable, StyleSheet, Text, View } from 'react-native';

import ProfileSectionEmptyState from '../ProfileSectionEmptyState';
import ProfessionalCredentialCard from './ProfessionalCredentialCard';
import ProfessionalExperienceCard from './ProfessionalExperienceCard';

import type {
  ProfessionalCredential,
  ProfessionalExperience as ProfessionalExperienceEntry,
} from '../../../types/professionalProfile';

import {
  alpha,
  palette,
  radius,
  spacing,
  textColor,
} from '../../../theme/designSystem';

type ProfessionalExperienceProps = {
  loading: boolean;
  error: string | null;
  experiences: ProfessionalExperienceEntry[];
  credentials: ProfessionalCredential[];
  onRetry: () => void;
  ownerPreview?: boolean;
  onEditBackground?: () => void;
};

export default function ProfessionalExperience({
  loading,
  error,
  experiences,
  credentials,
  onRetry,
  ownerPreview = false,
  onEditBackground,
}: ProfessionalExperienceProps) {
  if (loading) {
    return (
      <View style={styles.root}>
        <Text style={styles.status}>Loading experience…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.root}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>
            Experience could not be loaded
          </Text>
          <Text style={styles.errorBody}>{error}</Text>
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading Professional experience"
            style={({ pressed }) => [
              styles.retry,
              pressed && styles.retryPressed,
            ]}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const hasExperiences = experiences.length > 0;
  const hasCredentials = credentials.length > 0;

  if (!hasExperiences && !hasCredentials) {
    return (
      <View style={styles.root}>
        <ProfileSectionEmptyState
          compact
          icon="briefcase-outline"
          title={
            ownerPreview
              ? 'Add your work experience'
              : 'No work experience yet'
          }
          body={
            ownerPreview
              ? 'Share roles, qualifications, licences and certifications. These are your claims — Direct Gain has not verified them.'
              : 'This Professional has not added work experience or credentials. These details are self-claimed when present — Direct Gain has not verified them.'
          }
          actionTitle={
            ownerPreview && onEditBackground
              ? 'Edit experience & credentials'
              : undefined
          }
          actionAccessibilityLabel="Edit experience and credentials"
          onActionPress={onEditBackground}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {hasExperiences ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>EXPERIENCE</Text>
          {experiences.map(item => (
            <ProfessionalExperienceCard
              key={item.id}
              experience={item}
            />
          ))}
        </View>
      ) : ownerPreview ? (
        <Text style={styles.quietEmpty}>
          No work experience added yet.
        </Text>
      ) : null}

      {hasCredentials ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            QUALIFICATIONS, LICENCES & CERTIFICATIONS
          </Text>
          {credentials.map(item => (
            <ProfessionalCredentialCard
              key={item.id}
              credential={item}
            />
          ))}
        </View>
      ) : ownerPreview ? (
        <Text style={styles.quietEmpty}>
          No qualifications, licences or certifications added yet.
        </Text>
      ) : null}

      {ownerPreview && onEditBackground ? (
        <Pressable
          onPress={onEditBackground}
          accessibilityRole="button"
          accessibilityLabel="Edit experience and credentials"
          style={({ pressed }) => [
            styles.editLink,
            pressed && styles.editLinkPressed,
          ]}
        >
          <Text style={styles.editLinkText}>
            Edit experience & credentials
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 148,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },

  status: {
    color: textColor.muted,
    fontSize: 13,
    fontWeight: '600',
  },

  section: {
    gap: spacing.sm,
  },

  sectionLabel: {
    color: textColor.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  quietEmpty: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },

  errorCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha.white08,
    gap: 6,
  },

  errorTitle: {
    color: textColor.primary,
    fontSize: 14,
    fontWeight: '800',
  },

  errorBody: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },

  retry: {
    alignSelf: 'flex-start',
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: palette.opportunityGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },

  retryPressed: {
    opacity: 0.88,
  },

  retryText: {
    color: textColor.inverse,
    fontSize: 13,
    fontWeight: '800',
  },

  editLink: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },

  editLinkPressed: {
    opacity: 0.8,
  },

  editLinkText: {
    color: palette.opportunityGreen,
    fontSize: 13,
    fontWeight: '800',
  },
});
