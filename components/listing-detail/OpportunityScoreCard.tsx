import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

type Props = {
  score: number;
};

function getScoreDetails(score: number) {
  if (score >= 90) {
    return {
      label: 'Excellent opportunity',
      description:
        'Strong seller trust and complete listing information.',
    };
  }

  if (score >= 75) {
    return {
      label: 'Good opportunity',
      description:
        'Positive trust signals with a few details worth checking.',
    };
  }

  if (score >= 60) {
    return {
      label: 'Review carefully',
      description:
        'Check the seller history and listing information before proceeding.',
    };
  }

  return {
    label: 'More checks recommended',
    description:
      'Review the listing and seller information carefully.',
  };
}

export default function OpportunityScoreCard({
  score,
}: Props) {
  const safeScore = Math.max(0, Math.min(score, 100));
  const details = getScoreDetails(safeScore);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>
            DIRECT GAIN INSIGHT
          </Text>

          <Text style={styles.title}>
            Opportunity Score
          </Text>
        </View>

        <View style={styles.scoreBadge}>
          <Text style={styles.score}>
            {safeScore}
          </Text>

          <Text style={styles.scoreMaximum}>
            /100
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${safeScore}%` },
          ]}
        />
      </View>

      <View style={styles.ratingRow}>
        <Ionicons
          name="sparkles"
          size={18}
          color={colors.primary}
        />

        <View style={styles.ratingContent}>
          <Text style={styles.ratingLabel}>
            {details.label}
          </Text>

          <Text style={styles.description}>
            {details.description}
          </Text>
        </View>
      </View>

      <View style={styles.signalList}>
        <View style={styles.signal}>
          <Ionicons
            name="checkmark-circle"
            size={17}
            color={colors.primary}
          />

          <Text style={styles.signalText}>
            Verified seller
          </Text>
        </View>

        <View style={styles.signal}>
          <Ionicons
            name="checkmark-circle"
            size={17}
            color={colors.primary}
          />

          <Text style={styles.signalText}>
            Strong Gain Score
          </Text>
        </View>

        <View style={styles.signal}>
          <Ionicons
            name="checkmark-circle"
            size={17}
            color={colors.primary}
          />

          <Text style={styles.signalText}>
            Complete listing information
          </Text>
        </View>
      </View>

      <Text style={styles.disclaimer}>
        This score is guidance based on available Direct Gain
        trust signals. Always review the listing before making
        a purchase.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 22,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.20)',
    backgroundColor: 'rgba(158, 246, 90, 0.055)',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },

  title: {
    marginTop: 5,
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },

  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  score: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1,
  },

  scoreMaximum: {
    marginLeft: 2,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },

  progressTrack: {
    height: 9,
    marginTop: 18,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.primary,
  },

  ratingRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  ratingContent: {
    flex: 1,
    marginLeft: 10,
  },

  ratingLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },

  description: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },

  signalList: {
    marginTop: 16,
  },

  signal: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  signalText: {
    marginLeft: 8,
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },

  disclaimer: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '600',
  },
});