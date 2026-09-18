import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, spacing, textColor } from '../../../theme/designSystem';

type ProfessionalLandingSectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  actionAccessibilityLabel?: string;
  actionAccessibilityHint?: string;
};

export default function ProfessionalLandingSectionHeader({
  title,
  actionLabel,
  onActionPress,
  actionAccessibilityLabel,
  actionAccessibilityHint,
}: ProfessionalLandingSectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          accessibilityRole="button"
          accessibilityLabel={
            actionAccessibilityLabel ?? actionLabel
          }
          accessibilityHint={actionAccessibilityHint}
          hitSlop={8}
          style={({ pressed }) => [
            styles.action,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  title: {
    flex: 1,
    color: textColor.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  action: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxs,
  },

  actionText: {
    color: palette.opportunityGreen,
    fontSize: 13,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.8,
  },
});
