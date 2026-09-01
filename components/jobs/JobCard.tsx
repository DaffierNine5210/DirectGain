import { Pressable, StyleSheet, Text, View } from 'react-native';

import { posterInitials } from '../../services/jobs/jobAdapter';

import type { Job } from '../../types/jobs';

import {
  alpha,
  motion,
  palette,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

type JobCardProps = {
  job: Job;
  onPress: (jobId: string) => void;
};

export default function JobCard({
  job,
  onPress,
}: JobCardProps) {
  const detailParts = [
    job.locationLabel,
    job.jobTypeLabel,
    job.workSiteLabel,
  ].filter(Boolean);

  const posterName =
    job.poster?.displayName ?? null;

  const showBusiness =
    job.poster?.accountType ===
    'business';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${job.title}. ${job.categoryLabel}. ${job.payLabel}. ${job.locationLabel}.`}
      onPress={() => {
        onPress(job.id);
      }}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.topRow}>
        <Text
          style={styles.category}
          numberOfLines={1}
        >
          {job.categoryLabel}
        </Text>
        <Text
          style={styles.posted}
          numberOfLines={1}
        >
          {job.postedLabel}
        </Text>
      </View>

      <Text
        style={styles.title}
        numberOfLines={2}
      >
        {job.title}
      </Text>

      <Text
        style={styles.pay}
        numberOfLines={1}
      >
        {job.payLabel}
      </Text>

      {job.descriptionPreview ? (
        <Text
          style={styles.preview}
          numberOfLines={2}
        >
          {job.descriptionPreview}
        </Text>
      ) : null}

      {detailParts.length > 0 ? (
        <Text
          style={styles.details}
          numberOfLines={1}
        >
          {detailParts.join(' · ')}
        </Text>
      ) : null}

      {posterName ? (
        <View style={styles.posterRow}>
          <View
            style={styles.avatar}
            accessibilityElementsHidden
          >
            <Text style={styles.initials}>
              {posterInitials(posterName)}
            </Text>
          </View>
          <Text
            style={styles.posterName}
            numberOfLines={1}
          >
            {posterName}
            {showBusiness ? ' · Business' : ''}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },

  pressed: {
    opacity: 0.86,
    transform: [
      {
        scale: motion.pressedScale,
      },
    ],
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  category: {
    flex: 1,
    color: textColor.muted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  posted: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },

  title: {
    marginTop: spacing.xs,
    color: textColor.primary,
    ...typography.headingSmall,
    fontSize: 17,
    lineHeight: 22,
  },

  pay: {
    marginTop: 6,
    color: palette.opportunityGreen,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },

  preview: {
    marginTop: spacing.sm,
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
  },

  details: {
    marginTop: spacing.sm,
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  posterRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 0,
  },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: alpha.white08,
    alignItems: 'center',
    justifyContent: 'center',
  },

  initials: {
    color: textColor.primary,
    fontSize: 10,
    fontWeight: '800',
  },

  posterName: {
    flex: 1,
    minWidth: 0,
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
});
