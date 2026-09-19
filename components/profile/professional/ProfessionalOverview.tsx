import { Pressable, StyleSheet, Text, View } from 'react-native';

import ProfessionalExperiencePreview from './ProfessionalExperiencePreview';
import ProfessionalLandingSectionHeader from './ProfessionalLandingSectionHeader';
import ProfessionalPortfolioPreview from './ProfessionalPortfolioPreview';
import ProfessionalResumeCard from './ProfessionalResumeCard';
import ProfessionalSetupModule from './ProfessionalSetupModule';

import {
  formatProfessionalAvailabilityLabel,
  formatProfessionalWorkPreferenceLabel,
  getMissingProfessionalCoreFieldLabels,
} from '../../../services/profile/professionalProfileAdapter';

import type {
  ProfessionalCredential,
  ProfessionalExperience as ProfessionalExperienceEntry,
  ProfessionalPortfolioPresentedProject,
  ProfessionalProfileCore,
  ProfessionalResume,
} from '../../../types/professionalProfile';

import {
  alpha,
  palette,
  radius,
  spacing,
  textColor,
} from '../../../theme/designSystem';

type ProfessionalOverviewProps = {
  professional: ProfessionalProfileCore | null;
  professionalError: string | null;
  onRetryProfessional: () => void;
  onEditProfessional: () => void;
  experiences: ProfessionalExperienceEntry[];
  credentials: ProfessionalCredential[];
  backgroundLoading: boolean;
  backgroundError: string | null;
  onRetryBackground: () => void;
  onEditBackground: () => void;
  portfolioProjects: ProfessionalPortfolioPresentedProject[];
  portfolioLoading: boolean;
  portfolioError: string | null;
  onRetryPortfolio: () => void;
  onEditPortfolio: () => void;
  onViewPortfolio: () => void;
  onViewExperience: () => void;
  resume: ProfessionalResume | null;
  resumeLoading?: boolean;
  resumeError?: string | null;
  resumeMutating?: boolean;
  onRetryResume?: () => void;
  onAddResume?: () => void;
  onViewResume?: () => void;
  onReplaceResume?: () => void;
  onRemoveResume?: () => void;
  mode?: 'ownerPreview' | 'visitor';
};

export default function ProfessionalOverview({
  professional,
  professionalError,
  onRetryProfessional,
  onEditProfessional,
  experiences,
  credentials,
  backgroundLoading,
  backgroundError,
  onRetryBackground,
  onEditBackground,
  portfolioProjects,
  portfolioLoading,
  portfolioError,
  onRetryPortfolio,
  onEditPortfolio,
  onViewPortfolio,
  onViewExperience,
  resume,
  resumeLoading = false,
  resumeError = null,
  resumeMutating = false,
  onRetryResume,
  onAddResume,
  onViewResume,
  onReplaceResume,
  onRemoveResume,
  mode = 'ownerPreview',
}: ProfessionalOverviewProps) {
  const isOwnerPreview = mode === 'ownerPreview';
  const missingFields = professionalError
    ? []
    : getMissingProfessionalCoreFieldLabels(professional);

  const availabilityLabel = professionalError
    ? null
    : professional?.availability
      ? formatProfessionalAvailabilityLabel(
          professional.availability,
        )
      : null;
  const workPreferenceLabel = professionalError
    ? null
    : professional?.workPreference
      ? formatProfessionalWorkPreferenceLabel(
          professional.workPreference,
        )
      : null;
  const detailsParts = [
    availabilityLabel,
    workPreferenceLabel,
  ].filter((value): value is string => Boolean(value));
  const skills = professionalError
    ? []
    : professional?.skills ?? [];

  return (
    <View style={styles.root}>
      {professionalError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>
            Professional details could not be loaded
          </Text>
          <Text style={styles.errorBody}>
            {professionalError}
          </Text>
          <Pressable
            onPress={onRetryProfessional}
            accessibilityRole="button"
            accessibilityLabel="Retry loading Professional details"
            style={({ pressed }) => [
              styles.retry,
              pressed && styles.retryPressed,
            ]}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
          {isOwnerPreview ? (
            <Pressable
              onPress={onEditProfessional}
              accessibilityRole="button"
              accessibilityLabel="Edit Professional Profile"
              style={({ pressed }) => [
                styles.editLink,
                pressed && styles.retryPressed,
              ]}
            >
              <Text style={styles.editLinkText}>
                Edit Professional Profile
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View style={styles.block}>
          <ProfessionalLandingSectionHeader title="Skills & services" />
          <Text style={styles.claimNote}>
            {isOwnerPreview
              ? 'These are your claims. Direct Gain has not verified them.'
              : 'These are claimed skills and services. Direct Gain has not verified them.'}
          </Text>
          {skills.length > 0 ? (
            <View style={styles.skillWrap}>
              {skills.map(skill => (
                <View key={skill.id} style={styles.skillChip}>
                  <Text style={styles.skillText}>
                    {skill.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.quietEmpty}>
              No skills or services added yet.
            </Text>
          )}
        </View>
      )}

      <ProfessionalPortfolioPreview
        loading={portfolioLoading}
        error={portfolioError}
        projects={portfolioProjects}
        onRetry={onRetryPortfolio}
        onViewAll={onViewPortfolio}
        onEditPortfolio={
          isOwnerPreview ? onEditPortfolio : undefined
        }
      />

      <ProfessionalExperiencePreview
        loading={backgroundLoading}
        error={backgroundError}
        experiences={experiences}
        credentials={credentials}
        onRetry={onRetryBackground}
        onViewAll={onViewExperience}
        onEditBackground={
          isOwnerPreview ? onEditBackground : undefined
        }
      />

      {detailsParts.length > 0 ? (
        <View style={styles.block}>
          <ProfessionalLandingSectionHeader title="Details" />
          <Text
            style={styles.detailsValue}
            accessibilityLabel={detailsParts.join(', ')}
          >
            {detailsParts.join(' · ')}
          </Text>
        </View>
      ) : null}

      {isOwnerPreview &&
      onAddResume &&
      onViewResume &&
      onReplaceResume &&
      onRemoveResume ? (
        <View style={styles.block}>
          <ProfessionalLandingSectionHeader title="Résumé" />
          <ProfessionalResumeCard
            presentation="landing"
            loading={resumeLoading}
            error={resumeError}
            resume={resume}
            mutating={resumeMutating}
            onRetry={onRetryResume}
            onAdd={onAddResume}
            onView={onViewResume}
            onReplace={onReplaceResume}
            onRemove={onRemoveResume}
          />
        </View>
      ) : null}

      {isOwnerPreview ? (
        <View style={styles.block}>
          <ProfessionalLandingSectionHeader title="Owner preview" />
          <ProfessionalSetupModule
            compact
            missingFields={missingFields}
            onEditPress={onEditProfessional}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },

  block: {
    gap: spacing.xxs,
    minWidth: 0,
  },

  claimNote: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },

  quietEmpty: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },

  skillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  skillChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: alpha.green04,
  },

  skillText: {
    color: textColor.secondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },

  detailsValue: {
    color: textColor.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  errorCard: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha.white08,
    gap: spacing.xs,
  },

  errorTitle: {
    color: textColor.primary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },

  errorBody: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
  },

  retry: {
    marginTop: 4,
    minHeight: 44,
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
    fontWeight: '800',
  },

  editLink: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  editLinkText: {
    color: palette.opportunityGreen,
    fontSize: 13,
    fontWeight: '800',
  },
});
