import { StyleSheet, Text, View } from 'react-native';

import {
  alpha,
  spacing,
  textColor,
} from '../../theme/designSystem';

export type PersonalProfileStat = {
  label: string;
  value: string;
};

type PersonalProfileStatsRowProps = {
  stats?: PersonalProfileStat[];
};

export default function PersonalProfileStatsRow({
  stats = [],
}: PersonalProfileStatsRowProps) {
  if (stats.length < 2) {
    return null;
  }

  return (
    <View
      style={styles.row}
      accessibilityRole="text"
      accessibilityLabel={stats
        .map(stat => `${stat.value} ${stat.label}`)
        .join(', ')}
    >
      {stats.map((stat, index) => (
        <View
          key={stat.label}
          style={[
            styles.item,
            index > 0 && styles.itemBorder,
          ]}
        >
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: alpha.white08,
  },

  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },

  itemBorder: {
    borderLeftWidth: 1,
    borderLeftColor: alpha.white08,
  },

  value: {
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },

  label: {
    color: textColor.muted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
