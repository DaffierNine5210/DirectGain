import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ResolvedProfileAvatar from '../profile/ResolvedProfileAvatar';

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
  coverUrl?: string | null;
  photoCount?: number;
  onPress: (jobId: string) => void;
};

export default function JobCard({
  job,
  coverUrl = null,
  photoCount = 0,
  onPress,
}: JobCardProps) {
  const [
    imageFailed,
    setImageFailed,
  ] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [coverUrl]);

  const showCover =
    Boolean(coverUrl) && !imageFailed;

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

  const accessibilityLabel = showCover
    ? `${job.title}. ${job.categoryLabel}. ${job.payLabel}. ${job.locationLabel}. Includes photo.`
    : `${job.title}. ${job.categoryLabel}. ${job.payLabel}. ${job.locationLabel}.`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        onPress(job.id);
      }}
      style={({ pressed }) => [
        styles.card,
        showCover && styles.photoCard,
        pressed && styles.pressed,
      ]}
    >
      {showCover && coverUrl ? (
        <View style={styles.coverWrap}>
          <Image
            source={{ uri: coverUrl }}
            style={styles.cover}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
            accessibilityLabel="Job photo"
            onError={() => {
              setImageFailed(true);
            }}
          />
          {photoCount > 1 ? (
            <View
              style={styles.countBadge}
              accessibilityElementsHidden
            >
              <Text style={styles.countText}>
                {photoCount}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View
        style={showCover ? styles.photoBody : undefined}
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
            <ResolvedProfileAvatar
              displayName={posterName}
              avatarPath={job.poster?.avatarPath}
              size="xs"
            />
            <Text
              style={styles.posterName}
              numberOfLines={1}
            >
              {posterName}
              {showBusiness ? ' · Business' : ''}
            </Text>
          </View>
        ) : null}
      </View>
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

  photoCard: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'hidden',
  },

  pressed: {
    opacity: 0.86,
    transform: [
      {
        scale: motion.pressedScale,
      },
    ],
  },

  coverWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: alpha.white05,
  },

  cover: {
    width: '100%',
    height: '100%',
  },

  countBadge: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    minWidth: 28,
    minHeight: 22,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: alpha.black56,
    borderWidth: 1,
    borderColor: alpha.white14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    color: textColor.primary,
    fontSize: 11,
    fontWeight: '800',
  },

  photoBody: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
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

  posterName: {
    flex: 1,
    minWidth: 0,
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
});
