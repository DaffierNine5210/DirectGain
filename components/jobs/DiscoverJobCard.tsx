import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Job } from '../../types/jobs';

import {
  alpha,
  motion,
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

type DiscoverJobCardProps = {
  job: Job;
  coverUrl?: string | null;
  onPress: (jobId: string) => void;
};

export default function DiscoverJobCard({
  job,
  coverUrl = null,
  onPress,
}: DiscoverJobCardProps) {
  const [imageFailed, setImageFailed] =
    useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [coverUrl]);

  const showCover =
    Boolean(coverUrl) && !imageFailed;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${job.title}. ${job.payLabel}. ${job.locationLabel}.`}
      accessibilityHint="Opens the job"
      onPress={() => {
        onPress(job.id);
      }}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      {showCover && coverUrl ? (
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
      ) : null}

      <View
        style={[
          styles.body,
          !showCover && styles.bodyWithoutCover,
        ]}
      >
        <Text numberOfLines={1} style={styles.category}>
          {job.categoryLabel}
        </Text>

        <Text numberOfLines={2} style={styles.title}>
          {job.title}
        </Text>

        <Text numberOfLines={1} style={styles.pay}>
          {job.payLabel}
        </Text>

        {job.locationLabel ? (
          <Text numberOfLines={1} style={styles.location}>
            {job.locationLabel}
          </Text>
        ) : null}

        {job.jobTypeLabel ? (
          <Text numberOfLines={1} style={styles.meta}>
            {job.jobTypeLabel}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
  },

  pressed: {
    opacity: 0.86,
    transform: [
      {
        scale: motion.pressedScale,
      },
    ],
  },

  cover: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: alpha.white05,
  },

  body: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },

  bodyWithoutCover: {
    borderLeftWidth: 3,
    borderLeftColor: palette.opportunityGreen,
    paddingTop: spacing.sm,
  },

  category: {
    color: textColor.muted,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  title: {
    marginTop: 4,
    color: textColor.primary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  pay: {
    marginTop: 6,
    color: palette.opportunityGreen,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  location: {
    marginTop: 4,
    color: textColor.secondary,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },

  meta: {
    marginTop: 3,
    color: textColor.muted,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
  },
});
