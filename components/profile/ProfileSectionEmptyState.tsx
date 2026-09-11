import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import DGButton from '../DGButton';

import {
  alpha,
  iconSize,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

type ProfileSectionEmptyStateProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  body?: string;
  compact?: boolean;
  actionTitle?: string;
  actionAccessibilityLabel?: string;
  actionDisabled?: boolean;
  onActionPress?: () => void;
};

export default function ProfileSectionEmptyState({
  icon,
  title,
  body,
  compact = false,
  actionTitle,
  actionAccessibilityLabel,
  actionDisabled = false,
  onActionPress,
}: ProfileSectionEmptyStateProps) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={[styles.iconWrap, compact && styles.iconWrapCompact]}>
        <Ionicons
          name={icon}
          size={compact ? iconSize.md : iconSize.lg}
          color={textColor.muted}
        />
      </View>

      <Text style={[styles.title, compact && styles.titleCompact]}>
        {title}
      </Text>

      {body ? (
        <Text style={styles.body}>{body}</Text>
      ) : null}

      {actionTitle && onActionPress ? (
        <View style={styles.action}>
          <DGButton
            title={actionTitle}
            variant="outline"
            size="small"
            onPress={onActionPress}
            disabled={actionDisabled}
            accessibilityLabel={
              actionAccessibilityLabel ?? actionTitle
            }
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardSoft,
    gap: spacing.xs,
  },

  cardCompact: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },

  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.green06,
    borderWidth: 1,
    borderColor: alpha.green10,
    marginBottom: spacing.xxs,
  },

  iconWrapCompact: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },

  title: {
    color: textColor.primary,
    ...typography.headingSmall,
    textAlign: 'center',
  },

  titleCompact: {
    fontSize: 16,
    lineHeight: 22,
  },

  body: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
  },

  action: {
    marginTop: spacing.sm,
  },
});
