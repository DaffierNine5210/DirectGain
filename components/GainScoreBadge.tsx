import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type GainLevel =
  | 'Excellent'
  | 'Trusted'
  | 'Established'
  | 'Building'
  | 'New';

type GainScoreBadgeProps = {
  score: number;
  compact?: boolean;
};

type GainScoreDetails = {
  level: GainLevel;
  accentColor: string;
  iconName:
    | 'trophy'
    | 'shield-checkmark'
    | 'ribbon'
    | 'trending-up'
    | 'leaf';
};

function getGainScoreDetails(score: number): GainScoreDetails {
  if (score >= 90) {
    return {
      level: 'Excellent',
      accentColor: '#F4C95D',
      iconName: 'trophy',
    };
  }

  if (score >= 75) {
    return {
      level: 'Trusted',
      accentColor: colors.primary,
      iconName: 'shield-checkmark',
    };
  }

  if (score >= 60) {
    return {
      level: 'Established',
      accentColor: '#63A7FF',
      iconName: 'ribbon',
    };
  }

  if (score >= 40) {
    return {
      level: 'Building',
      accentColor: '#C5CAD3',
      iconName: 'trending-up',
    };
  }

  return {
    level: 'New',
    accentColor: '#AAB2A4',
    iconName: 'leaf',
  };
}

export default function GainScoreBadge({
  score,
  compact = false,
}: GainScoreBadgeProps) {
  const safeScore = Math.min(Math.max(Math.round(score), 0), 100);
  const details = getGainScoreDetails(safeScore);

  if (compact) {
    return (
      <View
        style={[
          styles.compactContainer,
          {
            borderColor: details.accentColor,
          },
        ]}
      >
        <Ionicons
          name={details.iconName}
          size={15}
          color={details.accentColor}
        />

        <Text style={styles.compactLabel}>Gain Score</Text>

        <Text
          style={[
            styles.compactScore,
            {
              color: details.accentColor,
            },
          ]}
        >
          {safeScore}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.scoreCircleOuter,
          {
            borderColor: details.accentColor,
            shadowColor: details.accentColor,
          },
        ]}
      >
        <View style={styles.scoreCircleInner}>
          <Text style={styles.score}>{safeScore}</Text>
          <Text style={styles.outOf}>/100</Text>
        </View>
      </View>

      <View style={styles.information}>
        <Text style={styles.label}>GAIN SCORE</Text>

        <View style={styles.levelRow}>
          <Ionicons
            name={details.iconName}
            size={20}
            color={details.accentColor}
          />

          <Text
            style={[
              styles.level,
              {
                color: details.accentColor,
              },
            ]}
          >
            {details.level}
          </Text>
        </View>

        <Text style={styles.description}>
          Reputation earned through trusted activity.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 112,
    padding: 17,
    borderRadius: 24,
    backgroundColor: colors.cardRaised,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: colors.cardShadow,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7,
    },
  },

  scoreCircleOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',

    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  scoreCircleInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  score: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 28,
  },

  outOf: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },

  information: {
    flex: 1,
    marginLeft: 17,
  },

  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  level: {
    fontSize: 20,
    fontWeight: '900',
    marginLeft: 7,
  },

  description: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },

  compactContainer: {
    alignSelf: 'flex-start',
    minHeight: 34,
    paddingHorizontal: 11,
    borderRadius: 17,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  compactLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },

  compactScore: {
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 5,
  },
});