import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  formatProfessionalResumeByteSize,
} from '../../../services/profile/professionalProfileAdapter';

import type { ProfessionalResume } from '../../../types/professionalProfile';

import {
  alpha,
  iconSize,
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../../../theme/designSystem';

type ProfessionalResumeCardProps = {
  loading?: boolean;
  error?: string | null;
  resume: ProfessionalResume | null;
  mutating?: boolean;
  onRetry?: () => void;
  onAdd: () => void;
  onView: () => void;
  onReplace: () => void;
  onRemove: () => void;
};

export default function ProfessionalResumeCard({
  loading = false,
  error = null,
  resume,
  mutating = false,
  onRetry,
  onAdd,
  onView,
  onReplace,
  onRemove,
}: ProfessionalResumeCardProps) {
  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.status}>Loading résumé…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Résumé</Text>
        <Text style={styles.errorBody}>{error}</Text>
        {onRetry ? (
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading résumé"
            style={({ pressed }) => [
              styles.secondaryAction,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryActionText}>Retry</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (!resume) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconWrap}>
            <Ionicons
              name="document-text-outline"
              size={iconSize.md}
              color={textColor.muted}
            />
          </View>
          <Text style={styles.title}>Résumé</Text>
        </View>
        <Text style={styles.body}>
          Add your résumé so your Professional profile is ready
          for future work opportunities. It stays private while
          Professional is preview-only.
        </Text>
        <Pressable
          onPress={onAdd}
          disabled={mutating}
          accessibilityRole="button"
          accessibilityLabel="Add résumé"
          style={({ pressed }) => [
            styles.primaryAction,
            pressed && styles.pressed,
            mutating && styles.disabled,
          ]}
        >
          <Text style={styles.primaryActionText}>Add résumé</Text>
        </Pressable>
      </View>
    );
  }

  const sizeLabel = formatProfessionalResumeByteSize(
    resume.byteSize,
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Ionicons
            name="document-text-outline"
            size={iconSize.md}
            color={palette.opportunityGreen}
          />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>Résumé</Text>
          <Text style={styles.filename} numberOfLines={2}>
            {resume.originalFilename}
          </Text>
          <Text style={styles.meta}>
            {sizeLabel ? `${sizeLabel} · ` : ''}PDF · Private
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={onView}
          disabled={mutating}
          accessibilityRole="button"
          accessibilityLabel="View résumé"
          style={({ pressed }) => [
            styles.primaryAction,
            pressed && styles.pressed,
            mutating && styles.disabled,
          ]}
        >
          <Text style={styles.primaryActionText}>View résumé</Text>
        </Pressable>
        <Pressable
          onPress={onReplace}
          disabled={mutating}
          accessibilityRole="button"
          accessibilityLabel="Replace résumé"
          style={({ pressed }) => [
            styles.secondaryAction,
            pressed && styles.pressed,
            mutating && styles.disabled,
          ]}
        >
          <Text style={styles.secondaryActionText}>Replace</Text>
        </Pressable>
        <Pressable
          onPress={onRemove}
          disabled={mutating}
          accessibilityRole="button"
          accessibilityLabel="Remove résumé"
          style={({ pressed }) => [
            styles.secondaryAction,
            pressed && styles.pressed,
            mutating && styles.disabled,
          ]}
        >
          <Text style={styles.dangerActionText}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    gap: spacing.sm,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },

  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.green06,
    borderWidth: 1,
    borderColor: alpha.green10,
  },

  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  title: {
    color: textColor.primary,
    fontSize: 15,
    fontWeight: '800',
  },

  body: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },

  filename: {
    color: textColor.primary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  meta: {
    color: textColor.muted,
    fontSize: 12,
    fontWeight: '600',
  },

  status: {
    color: textColor.muted,
    fontSize: 13,
    fontWeight: '600',
  },

  errorBody: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
  },

  actions: {
    gap: spacing.xs,
  },

  primaryAction: {
    minHeight: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.opportunityGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryActionText: {
    color: textColor.inverse,
    fontSize: 13,
    fontWeight: '800',
  },

  secondaryAction: {
    minHeight: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: alpha.white08,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryActionText: {
    color: palette.opportunityGreen,
    fontSize: 13,
    fontWeight: '800',
  },

  dangerActionText: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.88,
  },

  disabled: {
    opacity: 0.45,
  },
});
