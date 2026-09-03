import { Alert, StyleSheet, Text, View } from 'react-native';

import DGButton from '../DGButton';
import DGSkeleton from '../DGSkeleton';

import type {
  JobApplication,
  JobStatus,
} from '../../types/jobs';

import {
  alpha,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

type JobApplicationActionsProps = {
  jobStatus: JobStatus;
  isOwner: boolean;
  application: JobApplication | null;
  applicationError: string | null;
  applicationLoading: boolean;
  withdrawing: boolean;
  onApply: () => void;
  onRetry: () => void;
  onWithdraw: () => void;
};

export default function JobApplicationActions({
  jobStatus,
  isOwner,
  application,
  applicationError,
  applicationLoading,
  withdrawing,
  onApply,
  onRetry,
  onWithdraw,
}: JobApplicationActionsProps) {
  if (isOwner) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Your job</Text>
        <Text style={styles.body}>
          You posted this job. Manage applications and hiring from your jobs.
        </Text>
      </View>
    );
  }

  if (applicationLoading) {
    return (
      <View style={styles.card}>
        <DGSkeleton width="42%" height={12} />
        <DGSkeleton
          width="78%"
          height={12}
          style={styles.skeleton}
        />
      </View>
    );
  }

  if (applicationError) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          Application status unavailable
        </Text>
        <Text style={styles.body}>
          {applicationError}
        </Text>
        <DGButton
          title="Retry"
          variant="secondary"
          fullWidth
          onPress={onRetry}
          accessibilityLabel="Retry loading application status"
        />
      </View>
    );
  }

  if (application?.status === 'submitted') {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          Application submitted
        </Text>
        <Text style={styles.body}>
          The poster can review your application. You can withdraw it while it is still submitted.
        </Text>
        <DGButton
          title={
            withdrawing
              ? 'Withdrawing…'
              : 'Withdraw application'
          }
          variant="outline"
          fullWidth
          loading={withdrawing}
          disabled={withdrawing}
          onPress={() => {
            Alert.alert(
              'Withdraw application?',
              'The poster will no longer see this as an active application. You will not be able to apply to this job again.',
              [
                {
                  text: 'Keep application',
                  style: 'cancel',
                },
                {
                  text: 'Withdraw',
                  style: 'destructive',
                  onPress: onWithdraw,
                },
              ],
            );
          }}
          accessibilityLabel="Withdraw application"
        />
      </View>
    );
  }

  if (application?.status === 'withdrawn') {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          Application withdrawn
        </Text>
        <Text style={styles.body}>
          You withdrew this application. This job cannot be applied to again.
        </Text>
      </View>
    );
  }

  if (application?.status === 'declined') {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          Application declined
        </Text>
        <Text style={styles.body}>
          The poster declined this application.
        </Text>
      </View>
    );
  }

  if (application?.status === 'selected') {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          Selected for this job
        </Text>
        <Text style={styles.body}>
          The poster selected your application.
        </Text>
      </View>
    );
  }

  if (application?.status === 'not_selected') {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          Not selected
        </Text>
        <Text style={styles.body}>
          Another applicant was selected for this job.
        </Text>
      </View>
    );
  }

  if (application?.status === 'cancelled') {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          Application cancelled
        </Text>
        <Text style={styles.body}>
          This application was cancelled because the job is no longer open.
        </Text>
      </View>
    );
  }

  if (jobStatus !== 'open') {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          Not accepting applications
        </Text>
        <Text style={styles.body}>
          This job is no longer open to new applications.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Interested in this job?
      </Text>
      <Text style={styles.body}>
        Send a short message to the poster. Keep it professional and specific.
      </Text>
      <DGButton
        title="Apply for this job"
        fullWidth
        onPress={onApply}
        accessibilityLabel="Apply for this job"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    gap: spacing.sm,
  },

  title: {
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },

  body: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  skeleton: {
    marginTop: 4,
  },
});
