import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import DGButton from '../DGButton';
import ProfileAvatar from './ProfileAvatar';

import type {
  ProfileHeroIdentity,
  ProfileHeroMode,
} from './profilePresentation';

import {
  alpha,
  iconSize,
  layout,
  palette,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

const COVER_BAND_HEIGHT = 128;
const AVATAR_OVERLAP = 60;

type ProfileHeroProps = {
  identity: ProfileHeroIdentity;
  mode: ProfileHeroMode;
  avatarUrl?: string | null;
  avatarUnavailable?: boolean;
  avatarBusy?: boolean;
  avatarProgress?: string | null;
  avatarError?: string | null;
  onAvatarPress?: () => void;
  onEditProfilePress?: () => void;
  editProfileDisabled?: boolean;
  publicActions?: ReactNode;
};

export default function ProfileHero({
  identity,
  mode,
  avatarUrl = null,
  avatarUnavailable = false,
  avatarBusy = false,
  avatarProgress = null,
  avatarError = null,
  onAvatarPress,
  onEditProfilePress,
  editProfileDisabled = false,
  publicActions = null,
}: ProfileHeroProps) {
  const isOwner = mode === 'owner';

  const accessibilityLabel = isOwner
    ? `Your profile. ${identity.displayName}.`
    : `${identity.displayName}. Direct Gain profile.`;

  const ownerActions =
    isOwner && onEditProfilePress ? (
      <View style={styles.actions}>
        <DGButton
          title="Edit profile"
          variant="outline"
          fullWidth
          disabled={editProfileDisabled}
          onPress={onEditProfilePress}
          accessibilityLabel="Edit profile"
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
      <View
        style={styles.coverBand}
        importantForAccessibility="no-hide-descendants"
      >
        <View style={styles.coverMediaSlot} pointerEvents="none">
          <View style={styles.coverGlowPrimary} />
          <View style={styles.coverGlowSecondary} />
          <View style={styles.coverGlowAccent} />
          <View style={styles.coverShapePrimary} />
          <View style={styles.coverShapeSecondary} />
          <View style={styles.coverWash} />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            <ProfileAvatar
              displayName={identity.displayName}
              imageUri={avatarUrl}
              hasStoredPhoto={identity.hasStoredPhoto}
              photoUnavailable={avatarUnavailable}
              size="xl"
              editable={isOwner}
              busy={avatarBusy}
              onPress={
                isOwner ? onAvatarPress : undefined
              }
            />
          </View>
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
                  size={iconSize.sm}
                  color={textColor.muted}
                />
                <Text style={styles.location}>
                  {identity.location}
                </Text>
              </View>
            ) : null}
          </View>

          {identity.bio ? (
            <Text style={styles.bio}>{identity.bio}</Text>
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
        </View>

        {ownerActions}
        {extraPublicActions}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },

  coverBand: {
    height: COVER_BAND_HEIGHT,
    overflow: 'hidden',
    backgroundColor: palette.slate900,
    borderBottomWidth: 1,
    borderBottomColor: alpha.green10,
  },

  coverMediaSlot: {
    ...StyleSheet.absoluteFill,
  },

  coverGlowPrimary: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: alpha.green10,
    top: -92,
    right: -48,
  },

  coverGlowSecondary: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: alpha.green06,
    bottom: -70,
    left: -36,
  },

  coverGlowAccent: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: alpha.green08,
    top: 28,
    left: '42%',
  },

  coverShapePrimary: {
    position: 'absolute',
    top: 18,
    left: 18,
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: alpha.green16,
    backgroundColor: alpha.green04,
    transform: [{ rotate: '16deg' }],
  },

  coverShapeSecondary: {
    position: 'absolute',
    top: 36,
    left: 40,
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: alpha.green12,
    backgroundColor: alpha.green02,
    transform: [{ rotate: '16deg' }],
  },

  coverWash: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 36,
    backgroundColor: alpha.green04,
  },

  body: {
    width: '100%',
    maxWidth: layout.maximumContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: 0,
  },

  avatarWrap: {
    alignItems: 'center',
    marginTop: -AVATAR_OVERLAP,
    marginBottom: spacing.xs,
  },

  avatarRing: {
    padding: 4,
    borderRadius: 999,
    backgroundColor: surface.page,
    borderWidth: 1,
    borderColor: alpha.green16,
  },

  identity: {
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },

  name: {
    color: textColor.primary,
    ...typography.headingLarge,
    textAlign: 'center',
    width: '100%',
  },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
    columnGap: spacing.xxs,
    rowGap: spacing.xxs,
  },

  accountType: {
    color: textColor.muted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  metaSeparator: {
    color: textColor.muted,
    fontSize: 13,
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
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  bio: {
    marginTop: 0,
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },

  progress: {
    marginTop: spacing.xxs,
    color: textColor.muted,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },

  avatarError: {
    marginTop: spacing.xxs,
    color: palette.danger,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },

  actions: {
    marginTop: spacing.sm,
    width: '100%',
    gap: spacing.sm,
  },
});
