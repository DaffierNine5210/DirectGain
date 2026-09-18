import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ProfessionalLandingSectionHeader from './ProfessionalLandingSectionHeader';

import type { ProfessionalPortfolioPresentedProject } from '../../../types/professionalProfile';

import {
  alpha,
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../../../theme/designSystem';

const PREVIEW_COUNT = 3;
const TILE_WIDTH = spacing.massive * 2;

type ProfessionalPortfolioPreviewProps = {
  loading: boolean;
  error: string | null;
  projects: ProfessionalPortfolioPresentedProject[];
  onRetry: () => void;
  onViewAll: () => void;
  onEditPortfolio?: () => void;
};

export default function ProfessionalPortfolioPreview({
  loading,
  error,
  projects,
  onRetry,
  onViewAll,
  onEditPortfolio,
}: ProfessionalPortfolioPreviewProps) {
  const previewProjects = projects.slice(0, PREVIEW_COUNT);

  return (
    <View style={styles.root}>
      <ProfessionalLandingSectionHeader
        title="Portfolio"
        actionLabel="View all"
        onActionPress={onViewAll}
        actionAccessibilityLabel="View all portfolio projects"
        actionAccessibilityHint="Opens the Portfolio tab"
      />

      {loading ? (
        <Text style={styles.status}>Loading portfolio…</Text>
      ) : error ? (
        <View style={styles.errorBlock}>
          <Text style={styles.status}>{error}</Text>
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading Professional portfolio"
            style={({ pressed }) => [
              styles.textAction,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.textActionLabel}>Retry</Text>
          </Pressable>
        </View>
      ) : previewProjects.length === 0 ? (
        <View style={styles.emptyBlock}>
          <Text style={styles.status}>
            No portfolio projects yet.
          </Text>
          {onEditPortfolio ? (
            <Pressable
              onPress={onEditPortfolio}
              accessibilityRole="button"
              accessibilityLabel="Edit Professional portfolio"
              style={({ pressed }) => [
                styles.textAction,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.textActionLabel}>
                Edit portfolio
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.strip}
          accessibilityRole="list"
          accessibilityLabel="Portfolio project previews"
        >
          {previewProjects.map(project => {
            const coverUri = project.media[0]?.displayUrl ?? null;

            return (
              <Pressable
                key={project.id}
                onPress={onViewAll}
                accessibilityRole="button"
                accessibilityLabel={`${project.title}. View all portfolio projects`}
                accessibilityHint="Opens the Portfolio tab"
                style={({ pressed }) => [
                  styles.tile,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.coverWrap}>
                  {coverUri ? (
                    <Image
                      source={{ uri: coverUri }}
                      style={styles.cover}
                      resizeMode="cover"
                      accessibilityIgnoresInvertColors
                    />
                  ) : (
                    <View style={styles.coverFallback}>
                      <Text style={styles.coverFallbackText}>
                        Photo unavailable
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.tileTitle} numberOfLines={1}>
                  {project.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xxs,
  },

  strip: {
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },

  tile: {
    width: TILE_WIDTH,
    borderRadius: radius.sm,
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
    paddingHorizontal: spacing.xs,
  },

  coverFallbackText: {
    color: textColor.muted,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  tileTitle: {
    color: textColor.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },

  status: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },

  emptyBlock: {
    gap: 2,
  },

  errorBlock: {
    gap: 2,
  },

  textAction: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },

  textActionLabel: {
    color: palette.opportunityGreen,
    fontSize: 13,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.8,
  },
});
