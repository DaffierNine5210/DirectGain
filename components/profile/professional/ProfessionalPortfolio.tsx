import { Pressable, StyleSheet, Text, View } from 'react-native';

import ProfileSectionEmptyState from '../ProfileSectionEmptyState';
import ProfessionalPortfolioCard from './ProfessionalPortfolioCard';

import type { ProfessionalPortfolioPresentedProject } from '../../../types/professionalProfile';

import {
  alpha,
  palette,
  radius,
  spacing,
  textColor,
} from '../../../theme/designSystem';

type ProfessionalPortfolioProps = {
  loading: boolean;
  error: string | null;
  projects: ProfessionalPortfolioPresentedProject[];
  onRetry: () => void;
  ownerPreview?: boolean;
  onEditPortfolio?: () => void;
};

export default function ProfessionalPortfolio({
  loading,
  error,
  projects,
  onRetry,
  ownerPreview = false,
  onEditPortfolio,
}: ProfessionalPortfolioProps) {
  if (loading) {
    return (
      <View style={styles.root}>
        <Text style={styles.status}>Loading portfolio…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.root}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>
            Portfolio could not be loaded
          </Text>
          <Text style={styles.errorBody}>{error}</Text>
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading Professional portfolio"
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

  if (projects.length === 0) {
    return (
      <View style={styles.root}>
        <ProfileSectionEmptyState
          compact
          icon="images-outline"
          title={
            ownerPreview
              ? 'Show examples of your work'
              : 'No portfolio yet'
          }
          body={
            ownerPreview
              ? 'Add project photos so people can see the kind of work you do. These are your examples — Direct Gain has not verified them.'
              : 'This Professional has not added portfolio projects. Examples shown here are self-claimed — Direct Gain has not verified them.'
          }
          actionTitle={
            ownerPreview && onEditPortfolio
              ? 'Edit portfolio'
              : undefined
          }
          actionAccessibilityLabel="Edit Professional portfolio"
          onActionPress={onEditPortfolio}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {projects.map(project => (
        <ProfessionalPortfolioCard
          key={project.id}
          project={project}
        />
      ))}
      {ownerPreview && onEditPortfolio ? (
        <Pressable
          onPress={onEditPortfolio}
          accessibilityRole="button"
          accessibilityLabel="Edit Professional portfolio"
          style={({ pressed }) => [
            styles.editLink,
            pressed && styles.editLinkPressed,
          ]}
        >
          <Text style={styles.editLinkText}>Edit portfolio</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 148,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },

  status: {
    color: textColor.muted,
    fontSize: 13,
    fontWeight: '600',
  },

  errorCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha.white08,
    gap: spacing.xs,
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
  },

  retry: {
    marginTop: 4,
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
