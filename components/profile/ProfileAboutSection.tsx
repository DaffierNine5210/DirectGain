import { StyleSheet, Text, View } from 'react-native';

import DGButton from '../DGButton';
import ProfileSectionEmptyState from './ProfileSectionEmptyState';

import type { ProfileAboutContent } from './profilePresentation';
import type { ProfileHeroMode } from './profilePresentation';

import {
  alpha,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

type ProfileAboutSectionProps = {
  about: ProfileAboutContent;
  mode: ProfileHeroMode;
  editProfileDisabled?: boolean;
  onEditProfilePress?: () => void;
};

export default function ProfileAboutSection({
  about,
  mode,
  editProfileDisabled = false,
  onEditProfilePress,
}: ProfileAboutSectionProps) {
  const rows = [
    about.bio
      ? {
          key: 'bio',
          label: 'Introduction',
          value: about.bio,
        }
      : null,
    {
      key: 'account',
      label: 'Account',
      value: about.accountTypeLabel,
    },
    about.location
      ? {
          key: 'location',
          label: 'Location',
          value: about.location,
        }
      : null,
  ].filter((row): row is {
    key: string;
    label: string;
    value: string;
  } => row !== null);

  const hasOptionalDetail = Boolean(
    about.bio || about.location,
  );

  if (rows.length === 0) {
    if (mode === 'owner') {
      return (
        <ProfileSectionEmptyState
          icon="person-outline"
          title="Complete your profile"
          body="Add a few details so people know who you are."
          actionTitle="Edit profile"
          actionAccessibilityLabel="Edit profile"
          actionDisabled={editProfileDisabled}
          onActionPress={onEditProfilePress}
        />
      );
    }

    return (
      <ProfileSectionEmptyState
        icon="person-outline"
        title="No additional profile information yet."
      />
    );
  }

  return (
    <View style={styles.card}>
      {rows.map((row, index) => (
        <View
          key={row.key}
          style={[
            styles.row,
            index > 0 && styles.rowDivider,
          ]}
        >
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value}</Text>
        </View>
      ))}

      {mode === 'owner' &&
      !hasOptionalDetail &&
      onEditProfilePress ? (
        <View style={styles.prompt}>
          <Text style={styles.promptText}>
            Complete your profile to tell people more about you.
          </Text>
          <DGButton
            title="Edit profile"
            variant="outline"
            size="small"
            disabled={editProfileDisabled}
            onPress={onEditProfilePress}
            accessibilityLabel="Edit profile"
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardSoft,
    overflow: 'hidden',
  },

  row: {
    gap: spacing.xxs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },

  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: alpha.white08,
  },

  label: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  value: {
    color: textColor.primary,
    ...typography.bodyMedium,
    fontWeight: '600',
  },

  prompt: {
    borderTopWidth: 1,
    borderTopColor: alpha.white08,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },

  promptText: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
