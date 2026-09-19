import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import IdentityVerifiedMark from '../IdentityVerifiedMark';
import ProfileAvatar from '../ProfileAvatar';
import PersonalProfileStatsRow, {
  type PersonalProfileStat,
} from '../PersonalProfileStatsRow';

import {
  formatReviewAverageLabel,
  formatReviewCountLabel,
} from '../profilePresentation';

import type { ProfileReviewStats } from '../../../types/reviews';

import {
  alpha,
  iconSize,
  layout,
  palette,
  spacing,
  surface,
  textColor,
  typography,
} from '../../../theme/designSystem';

const HERO_BACKDROP_HEIGHT = spacing.huge + spacing.massive;
const AVATAR_OVERLAP = 52;
const UNKNOWN_STAT = '—';

type ProfessionalProfileHeroProps = {
  displayName: string;
  headline: string | null;
  serviceArea: string | null;
  about: string | null;
  skillsCount: number | null;
  hasStoredPhoto: boolean;
  avatarUrl?: string | null;
  avatarUnavailable?: boolean;
  stats: ProfileReviewStats | null;
  statsError: string | null;
  statsLoading: boolean;
  completedJobsCount: number | null;
  completedJobsError: string | null;
  identityVerified?: boolean;
  audience?: 'ownerPreview' | 'visitor';
};

function buildRatingStat(
  stats: ProfileReviewStats | null,
  statsError: string | null,
  statsLoading: boolean,
): PersonalProfileStat {
  const reviewCount = stats?.reviewCount ?? 0;
  const average = stats?.averageRating;
  const hasReviews =
    !statsLoading &&
    !statsError &&
    reviewCount > 0 &&
    average != null &&
    Number.isFinite(average);

  if (hasReviews && average != null) {
    return {
      label: 'Rating',
      value: formatReviewAverageLabel(average),
    };
  }

  if (statsLoading || statsError) {
    return {
      label: 'Rating',
      value: UNKNOWN_STAT,
    };
  }

  return {
    label: 'Rating',
    value: 'No reviews',
  };
}

export default function ProfessionalProfileHero({
  displayName,
  headline,
  serviceArea,
  about,
  skillsCount,
  hasStoredPhoto,
  avatarUrl = null,
  avatarUnavailable = false,
  stats,
  statsError,
  statsLoading,
  completedJobsCount,
  completedJobsError,
  identityVerified = false,
  audience = 'ownerPreview',
}: ProfessionalProfileHeroProps) {
  const trimmedHeadline = headline?.trim() || null;
  const trimmedServiceArea = serviceArea?.trim() || null;
  const trimmedAbout = about?.trim() || null;

  const reviewCount = stats?.reviewCount ?? 0;
  const average = stats?.averageRating;
  const hasReviews =
    !statsLoading &&
    !statsError &&
    reviewCount > 0 &&
    average != null &&
    Number.isFinite(average);

  const ratingStat = buildRatingStat(
    stats,
    statsError,
    statsLoading,
  );
  const jobsStat: PersonalProfileStat = {
    label: 'Jobs Completed',
    value:
      completedJobsError || completedJobsCount == null
        ? UNKNOWN_STAT
        : String(completedJobsCount),
  };
  const skillsStat: PersonalProfileStat = {
    label: 'Skills',
    value:
      skillsCount == null
        ? UNKNOWN_STAT
        : String(skillsCount),
  };

  const ratingDetail = hasReviews
    ? `${formatReviewAverageLabel(average)} average from ${formatReviewCountLabel(reviewCount)}`
    : statsError
      ? 'Rating unavailable'
      : 'No reviews';
  const jobsDetail =
    completedJobsError || completedJobsCount == null
      ? 'Jobs completed unavailable'
      : `${completedJobsCount} jobs completed`;
  const skillsDetail =
    skillsCount == null
      ? 'Skills unavailable'
      : `${skillsCount} skills`;

  const profileKind =
    audience === 'visitor'
      ? 'Direct Gain professional profile'
      : 'Direct Gain professional profile preview';

  return (
    <View
      style={styles.root}
      accessibilityLabel={`${displayName}. ${profileKind}. ${ratingDetail}. ${jobsDetail}. ${skillsDetail}.`}
    >
      <View
        style={styles.backdrop}
        importantForAccessibility="no-hide-descendants"
      >
        <View style={styles.backdropBase} />
        <View style={styles.backdropGlow} />
        <View style={styles.backdropAccent} />
        <View style={styles.backdropFade} />
      </View>

      <View style={styles.body}>
        <View style={styles.avatarOverlap}>
          <View style={styles.avatarRing}>
            <ProfileAvatar
              displayName={displayName}
              imageUri={avatarUrl}
              hasStoredPhoto={hasStoredPhoto}
              photoUnavailable={avatarUnavailable}
              size="xl"
            />
          </View>
        </View>

        <Text
          style={styles.name}
          accessibilityRole="header"
          numberOfLines={2}
        >
          {displayName}
        </Text>

        <IdentityVerifiedMark
          identityVerified={identityVerified}
        />

        {trimmedHeadline || trimmedServiceArea ? (
          <View style={styles.metaStack}>
            {trimmedHeadline ? (
              <Text style={styles.headline} numberOfLines={2}>
                {trimmedHeadline}
              </Text>
            ) : null}

            {trimmedServiceArea ? (
              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={iconSize.xs}
                  color={textColor.muted}
                />
                <Text style={styles.location} numberOfLines={2}>
                  {trimmedServiceArea}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <PersonalProfileStatsRow
          stats={[ratingStat, jobsStat, skillsStat]}
        />

        {trimmedAbout ? (
          <Text style={styles.about} numberOfLines={3}>
            {trimmedAbout}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },

  backdrop: {
    height: HERO_BACKDROP_HEIGHT,
    overflow: 'hidden',
    backgroundColor: palette.slate900,
  },

  backdropBase: {
    ...StyleSheet.absoluteFill,
    backgroundColor: surface.cardSoft,
  },

  backdropGlow: {
    position: 'absolute',
    top: -spacing.massive,
    right: -spacing.xxl,
    width: spacing.massive * 4,
    height: spacing.massive * 4,
    borderRadius: spacing.massive * 2,
    backgroundColor: alpha.green06,
  },

  backdropAccent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: spacing.xxs,
    backgroundColor: alpha.green16,
  },

  backdropFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: spacing.xl,
    backgroundColor: alpha.black40,
  },

  body: {
    width: '100%',
    maxWidth: layout.maximumContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: 0,
  },

  avatarOverlap: {
    marginTop: -AVATAR_OVERLAP,
    alignSelf: 'flex-start',
  },

  avatarRing: {
    padding: 3,
    borderRadius: 999,
    backgroundColor: surface.page,
    borderWidth: 2,
    borderColor: alpha.green40,
  },

  name: {
    marginTop: spacing.xs,
    color: textColor.primary,
    ...typography.headingSmall,
    textAlign: 'left',
    width: '100%',
  },

  metaStack: {
    marginTop: spacing.xxxs,
    gap: spacing.xxxs,
    maxWidth: '100%',
  },

  headline: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    width: '100%',
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

  about: {
    marginTop: spacing.sm,
    color: textColor.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'left',
    width: '100%',
  },
});
