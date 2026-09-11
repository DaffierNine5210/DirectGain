import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import DGButton from '../DGButton';
import ProfileAvatar from './ProfileAvatar';
import PersonalProfileBadgeRow, {
  type PersonalProfileBadge,
} from './PersonalProfileBadgeRow';
import PersonalProfileStatsRow, {
  type PersonalProfileStat,
} from './PersonalProfileStatsRow';

import type {
  ProfileHeroIdentity,
  ProfileHeroMode,
} from './profilePresentation';

import {
  alpha,
  iconSize,
  layout,
  palette,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

type PersonalProfileHeroProps = {
  identity: ProfileHeroIdentity;
  mode: ProfileHeroMode;
  avatarUrl?: string | null;
  avatarUnavailable?: boolean;
  avatarBusy?: boolean;
  avatarProgress?: string | null;
  avatarError?: string | null;
  coverImageUri?: string | null;
  badges?: PersonalProfileBadge[];
  stats?: PersonalProfileStat[];
  onAvatarPress?: () => void;
  onEditProfilePress?: () => void;
  editProfileDisabled?: boolean;
  publicActions?: ReactNode;
};

export default function PersonalProfileHero({
  identity,
  mode,
  avatarUrl = null,
  avatarUnavailable = false,
  avatarBusy = false,
  avatarProgress = null,
  avatarError = null,
  coverImageUri = null,
  badges = [],
  stats = [],
  onAvatarPress,
  onEditProfilePress,
  editProfileDisabled = false,
  publicActions = null,
}: PersonalProfileHeroProps) {
  const isOwner = mode === 'owner';
  const hasCoverImage = Boolean(coverImageUri);

  const accessibilityLabel = isOwner
    ? `Your profile. ${identity.displayName}.`
    : `${identity.displayName}. Direct Gain profile.`;

  const ownerActions =
    isOwner && onEditProfilePress ? (
      <View style={styles.actions}>
        <DGButton
          title="Edit profile"
          variant="outline"
          size="small"
          disabled={editProfileDisabled}
          onPress={onEditProfilePress}
          accessibilityLabel="Edit profile"
          style={styles.editButton}
        />
      </View>
    ) : null;

  const extraPublicActions =
    !isOwner && publicActions ? (
      <View style={styles.actions}>{publicActions}</View>
    ) : null;

  return (
    <View
      style={styles.root}
      accessibilityLabel={accessibilityLabel}
    >
      {hasCoverImage && coverImageUri ? (
        <View
          style={styles.coverBand}
          importantForAccessibility="no-hide-descendants"
        >
          <Image
            source={{ uri: coverImageUri }}
            style={styles.coverImage}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        </View>
      ) : null}

      <View style={styles.body}>
        <View style={styles.identityRow}>
          <View style={styles.avatarRing}>
            <ProfileAvatar
              displayName={identity.displayName}
              imageUri={avatarUrl}
              hasStoredPhoto={identity.hasStoredPhoto}
              photoUnavailable={avatarUnavailable}
              size="lg"
              editable={isOwner}
              busy={avatarBusy}
              onPress={
                isOwner ? onAvatarPress : undefined
              }
            />
          </View>

          <View style={styles.identity}>
            <Text
              style={styles.name}
              accessibilityRole="header"
              numberOfLines={2}
            >
              {identity.displayName}
            </Text>

            <View style={styles.metaRow}>
              <Text style={styles.accountType}>
                {identity.accountTypeLabel}
              </Text>

              {identity.location ? (
                <View style={styles.locationRow}>
                  <Text
                    style={styles.metaSeparator}
                    accessibilityElementsHidden
                  >
                    ·
                  </Text>
                  <Ionicons
                    name="location-outline"
                    size={iconSize.xs}
                    color={textColor.muted}
                  />
                  <Text style={styles.location}>
                    {identity.location}
                  </Text>
                </View>
              ) : null}
            </View>

            {identity.bio ? (
              <Text style={styles.bio} numberOfLines={3}>
                {identity.bio}
              </Text>
            ) : null}

            {avatarProgress ? (
              <Text style={styles.progress}>
                {avatarProgress}
              </Text>
            ) : null}

            {avatarError ? (
              <Text style={styles.avatarError}>
                {avatarError}
              </Text>
            ) : null}

            {ownerActions}
            {extraPublicActions}
          </View>
        </View>

        <PersonalProfileBadgeRow badges={badges} />
        <PersonalProfileStatsRow stats={stats} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },

  coverBand: {
    height: 56,
    overflow: 'hidden',
    backgroundColor: palette.slate900,
  },

  coverImage: {
    ...StyleSheet.absoluteFill,
  },

  body: {
    width: '100%',
    maxWidth: layout.maximumContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 0,
  },

  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },

  avatarRing: {
    padding: 3,
    borderRadius: 999,
    backgroundColor: surface.page,
    borderWidth: 1,
    borderColor: alpha.green16,
  },

  identity: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    gap: 4,
  },

  name: {
    color: textColor.primary,
              ...typography.headingSmall,
    textAlign: 'left',
    width: '100%',
  },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    maxWidth: '100%',
    columnGap: spacing.xxs,
    rowGap: 2,
  },

  accountType: {
    color: textColor.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  metaSeparator: {
    color: textColor.muted,
    fontSize: 12,
    fontWeight: '700',
  },

  locationRow: {
    flexDirection: 'row',
    flexShrink: 1,
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
  },

  location: {
    flexShrink: 1,
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  bio: {
    marginTop: 2,
    color: textColor.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'left',
    width: '100%',
  },

  progress: {
    color: textColor.muted,
    fontSize: 12,
    fontWeight: '700',
  },

  avatarError: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },

  actions: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },

  editButton: {
    minHeight: 44,
    alignSelf: 'flex-start',
  },
});
