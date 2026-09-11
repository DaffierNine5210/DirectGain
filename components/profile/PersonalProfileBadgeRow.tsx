import { StyleSheet, Text, View } from 'react-native';

import {
  alpha,
  spacing,
  textColor,
} from '../../theme/designSystem';

export type PersonalProfileBadge = {
  label: string;
};

type PersonalProfileBadgeRowProps = {
  badges?: PersonalProfileBadge[];
};

export default function PersonalProfileBadgeRow({
  badges = [],
}: PersonalProfileBadgeRowProps) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <View
      style={styles.row}
      accessibilityRole="text"
      accessibilityLabel={badges
        .map(badge => badge.label)
        .join(', ')}
    >
      {badges.map(badge => (
        <View key={badge.label} style={styles.chip}>
          <Text style={styles.label}>{badge.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },

  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: alpha.green12,
    backgroundColor: alpha.green04,
  },

  label: {
    color: textColor.secondary,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
