import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  formatApplicationStatus,
  formatJobStatus,
} from '../../services/jobs/jobAdapter';

import type {
  JobApplicationStatus,
  JobStatus,
} from '../../types/jobs';

import {
  alpha,
  iconSize,
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

type JobWorkCardProps = {
  title: string;
  payLabel: string;
  locationLabel: string;
  jobTypeLabel?: string | null;
  jobStatus: JobStatus;
  applicationStatus?: JobApplicationStatus | null;
  timeLabel?: string | null;
  emphasizeAssignment?: boolean;
  onPress: () => void;
};

export default function JobWorkCard({
  title,
  payLabel,
  locationLabel,
  jobTypeLabel,
  jobStatus,
  applicationStatus = null,
  timeLabel = null,
  emphasizeAssignment = false,
  onPress,
}: JobWorkCardProps) {
  const assigned =
    emphasizeAssignment ||
    applicationStatus === 'selected' ||
    jobStatus === 'assigned';

  const detailParts = [
    locationLabel,
    jobTypeLabel,
  ].filter(Boolean);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${formatJobStatus(jobStatus)}.`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        assigned && styles.assignedCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.topRow}>
        <Text
          style={[
            styles.jobStatus,
            assigned && styles.jobStatusAssigned,
          ]}
        >
          {formatJobStatus(jobStatus)}
        </Text>
        {applicationStatus ? (
          <Text
            style={[
              styles.applicationStatus,
              applicationStatus === 'selected' &&
                styles.applicationStatusSelected,
            ]}
          >
            {formatApplicationStatus(applicationStatus)}
          </Text>
        ) : null}
      </View>

      <Text
        style={styles.title}
        numberOfLines={2}
      >
        {title}
      </Text>

      <Text style={styles.pay}>{payLabel}</Text>

      {detailParts.length > 0 ? (
        <Text
          style={styles.meta}
          numberOfLines={1}
        >
          {detailParts.join(' · ')}
        </Text>
      ) : null}

      {timeLabel ? (
        <Text style={styles.time}>{timeLabel}</Text>
      ) : null}

      <View style={styles.chevronWrap}>
        <Ionicons
          name="chevron-forward"
          size={iconSize.sm}
          color={textColor.muted}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    paddingRight: 36,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    gap: 4,
  },

  assignedCard: {
    borderColor: alpha.green28,
  },

  pressed: {
    opacity: 0.86,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  jobStatus: {
    color: textColor.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  jobStatusAssigned: {
    color: palette.opportunityGreen,
  },

  applicationStatus: {
    color: textColor.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  applicationStatusSelected: {
    color: palette.opportunityGreen,
  },

  title: {
    marginTop: 2,
    color: textColor.primary,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },

  pay: {
    color: palette.opportunityGreen,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },

  meta: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  time: {
    color: textColor.muted,
    fontSize: 12,
    fontWeight: '600',
  },

  chevronWrap: {
    position: 'absolute',
    right: spacing.sm,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
