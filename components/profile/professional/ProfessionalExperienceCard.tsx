import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatProfessionalExperienceDateRange } from '../../../services/profile/professionalProfileAdapter';

import type { ProfessionalExperience } from '../../../types/professionalProfile';

import {
  alpha,
  radius,
  spacing,
  surface,
  textColor,
} from '../../../theme/designSystem';

type ProfessionalExperienceCardProps = {
  experience: Pick<
    ProfessionalExperience,
    | 'title'
    | 'organisation'
    | 'startYear'
    | 'startMonth'
    | 'endYear'
    | 'endMonth'
    | 'isCurrent'
    | 'description'
  >;
  footer?: ReactNode;
};

export default function ProfessionalExperienceCard({
  experience,
  footer,
}: ProfessionalExperienceCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title} numberOfLines={2}>
        {experience.title}
      </Text>
      <Text style={styles.organisation} numberOfLines={2}>
        {experience.organisation}
      </Text>
      <Text style={styles.dates}>
        {formatProfessionalExperienceDateRange(experience)}
      </Text>
      {experience.description ? (
        <Text style={styles.description} numberOfLines={4}>
          {experience.description}
        </Text>
      ) : null}
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    gap: 4,
  },

  title: {
    color: textColor.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },

  organisation: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  dates: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  description: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginTop: 2,
  },
});
