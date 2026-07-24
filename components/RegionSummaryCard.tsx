import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { RegionSummaryItem } from '../data/discoverMockData';
import { colors } from '../theme/colors';
import DGCard from './DGCard';

type RegionSummaryCardProps = {
  regionName: string;
  items: RegionSummaryItem[];
};

export default function RegionSummaryCard({
  regionName,
  items,
}: RegionSummaryCardProps) {
  return (
    <DGCard variant="raised">
      <View style={styles.headingRow}>
        <View style={styles.locationIcon}>
          <Ionicons
            name="location"
            size={18}
            color={colors.primary}
          />
        </View>

        <View style={styles.headingText}>
          <Text style={styles.eyebrow}>YOUR REGION TODAY</Text>
          <Text numberOfLines={1} style={styles.regionName}>
            {regionName}
          </Text>
        </View>

        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.id} style={styles.summaryItem}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name={item.icon}
                size={20}
                color={colors.primary}
              />
            </View>

            <Text style={styles.summaryValue}>{item.value}</Text>

            <Text numberOfLines={1} style={styles.summaryLabel}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.description}>
        Fresh opportunities and activity currently available near you.
      </Text>
    </DGCard>
  );
}

const styles = StyleSheet.create({
  headingRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationIcon: {
    width: 42,
    height: 42,
    marginRight: 12,
    borderRadius: 15,
    backgroundColor: `${colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headingText: {
    flex: 1,
    minWidth: 0,
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  regionName: {
    marginTop: 3,
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },

  liveIndicator: {
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
  },

  liveDot: {
    width: 7,
    height: 7,
    marginRight: 5,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },

  liveText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  divider: {
    width: '100%',
    height: 1,
    marginVertical: 18,
    backgroundColor: colors.border,
  },

  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  summaryItem: {
    width: '48%',
    minHeight: 112,
    marginBottom: 12,
    padding: 14,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
  },

  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: `${colors.primary}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryValue: {
    marginTop: 12,
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  summaryLabel: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },

  description: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});