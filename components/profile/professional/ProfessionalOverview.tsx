import { Pressable, StyleSheet, Text, View } from 'react-native';

import ProfileReviewCard from '../ProfileReviewCard';
import ProfessionalSetupModule from './ProfessionalSetupModule';

import type { PresentedProfileReview } from '../profilePresentation';

import {
  formatProfessionalAvailabilityLabel,
  formatProfessionalWorkPreferenceLabel,
  getMissingProfessionalCoreFieldLabels,
} from '../../../services/profile/professionalProfileAdapter';

import type { ProfessionalProfileCore } from '../../../types/professionalProfile';

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
  reviews: PresentedProfileReview[];
  onPressReviewer: (profileId: string) => void;
};

export default function ProfessionalOverview({
  professional,
  professionalError,
  onRetryProfessional,
  onEditProfessional,
  reviews,
  onPressReviewer,
}: ProfessionalOverviewProps) {
  const recentReviews = reviews.slice(0, 2);
  const missingFields = professionalError
    ? []
    : getMissingProfessionalCoreFieldLabels(professional);

  const availabilityLabel = professional?.availability
    ? formatProfessionalAvailabilityLabel(
        professional.availability,
      )
    : null;
  const workPreferenceLabel = professional?.workPreference
    ? formatProfessionalWorkPreferenceLabel(
        professional.workPreference,
      )
    : null;
  const skills = professional?.skills ?? [];

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
        </View>
      ) : (
        <>
          {professional?.about ? (
            <View style={styles.block}>
              <Text style={styles.label}>About</Text>
              <Text style={styles.value}>
                {professional.about}
              </Text>
            </View>
          ) : null}

          {availabilityLabel || workPreferenceLabel ? (
            <View style={styles.metaRow}>
              {availabilityLabel ? (
                <View style={styles.block}>
                  <Text style={styles.label}>
                    Availability
                  </Text>
                  <Text style={styles.value}>
                    {availabilityLabel}
                  </Text>
                </View>
              ) : null}
              {workPreferenceLabel ? (
                <View style={styles.block}>
                  <Text style={styles.label}>
                    Work preference
                  </Text>
                  <Text style={styles.value}>
                    {workPreferenceLabel}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {skills.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.label}>Skills</Text>
              <View style={styles.skillWrap}>
                {skills.map(skill => (
                  <View
                    key={skill.id}
                    style={styles.skillChip}
                  >
                    <Text style={styles.skillText}>
                      {skill.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <ProfessionalSetupModule
            missingFields={missingFields}
            onEditPress={onEditProfessional}
          />
        </>
      )}

      {recentReviews.length > 0 ? (
        <View style={styles.recent}>
          <Text style={styles.sectionTitle}>
            Recent reviews
          </Text>
          {recentReviews.map(review => (
            <ProfileReviewCard
              key={review.cardKey}
              review={review}
              onPressReviewer={onPressReviewer}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },

  block: {
    gap: 6,
    flex: 1,
    minWidth: 0,
  },

  metaRow: {
    gap: spacing.sm,
  },

  label: {
    color: textColor.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  value: {
    color: textColor.primary,
    fontSize: 14,
    lineHeight: 20,
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

  recent: {
    gap: spacing.sm,
  },

  sectionTitle: {
    color: textColor.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
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
