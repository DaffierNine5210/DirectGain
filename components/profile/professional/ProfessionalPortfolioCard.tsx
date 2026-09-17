import { Image, StyleSheet, Text, View } from 'react-native';

import type { ProfessionalPortfolioPresentedProject } from '../../../types/professionalProfile';

import {
  alpha,
  radius,
  spacing,
  surface,
  textColor,
} from '../../../theme/designSystem';

type ProfessionalPortfolioCardProps = {
  project: ProfessionalPortfolioPresentedProject;
};

export default function ProfessionalPortfolioCard({
  project,
}: ProfessionalPortfolioCardProps) {
  const cover = project.media[0];
  const extraCount = Math.max(0, project.media.length - 1);
  const coverUri = cover?.displayUrl ?? null;

  return (
    <View style={styles.card}>
      <View style={styles.coverWrap}>
        {coverUri ? (
          <Image
            source={{ uri: coverUri }}
            style={styles.cover}
            resizeMode="cover"
            accessibilityLabel={`${project.title} cover photo`}
          />
        ) : (
          <View style={styles.coverFallback}>
            <Text style={styles.coverFallbackText}>
              Photo unavailable
            </Text>
          </View>
        )}
        {extraCount > 0 ? (
          <View style={styles.photoBadge}>
            <Text style={styles.photoBadgeText}>
              +{extraCount} photo{extraCount === 1 ? '' : 's'}
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {project.title}
      </Text>
      {project.description ? (
        <Text style={styles.description} numberOfLines={4}>
          {project.description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    overflow: 'hidden',
  },

  coverWrap: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: alpha.white08,
  },

  cover: {
    width: '100%',
    height: '100%',
  },

  coverFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },

  coverFallbackText: {
    color: textColor.muted,
    fontSize: 12,
    fontWeight: '600',
  },

  photoBadge: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    paddingHorizontal: 8,
    minHeight: 24,
    borderRadius: radius.pill,
    backgroundColor: alpha.black56,
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoBadgeText: {
    color: textColor.primary,
    fontSize: 11,
    fontWeight: '800',
  },

  title: {
    color: textColor.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },

  description: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    paddingHorizontal: spacing.md,
    paddingTop: 4,
    paddingBottom: spacing.sm,
    marginTop: -spacing.sm,
  },
});
