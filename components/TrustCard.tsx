import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import DGCard from './DGCard';
import GainScoreBadge from './GainScoreBadge';
import VerificationBadges from './VerificationBadges';

type TrustCardVariant = 'compact' | 'full';

type TrustCardProps = {
  gainScore: number;

  variant?: TrustCardVariant;

  identityVerified?: boolean;
  businessVerified?: boolean;
  professionalVerified?: boolean;
  communityTrusted?: boolean;
};

type CompactBadgeProps = {
  label: string;
  icon:
    | 'person'
    | 'briefcase'
    | 'construct'
    | 'trophy';
  tone: 'green' | 'gold' | 'neutral';
};

export default function TrustCard({
  gainScore,

  variant = 'compact',

  identityVerified = false,
  businessVerified = false,
  professionalVerified = false,
  communityTrusted = false,
}: TrustCardProps) {
  const trustLevel = getTrustLevel(gainScore);

  if (variant === 'compact') {
    return (
      <DGCard variant="raised">
        <View style={styles.compactContainer}>
          <View style={styles.compactHeader}>
            <View style={styles.compactHeadingArea}>
              <View style={styles.shieldIcon}>
                <Ionicons
                  name="shield-checkmark"
                  size={21}
                  color={colors.primary}
                />
              </View>

              <View style={styles.compactHeadingText}>
                <Text style={styles.compactTitle}>
                  Trust Profile
                </Text>

                <Text style={styles.compactSubtitle}>
                  Your reputation across Direct Gain
                </Text>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={colors.textMuted}
            />
          </View>

          <View style={styles.compactScoreArea}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>
                {gainScore}
              </Text>

              <Text style={styles.scoreMaximum}>
                /100
              </Text>
            </View>

            <View style={styles.scoreDetails}>
              <Text style={styles.scoreEyebrow}>
                GAIN SCORE
              </Text>

              <View style={styles.levelRow}>
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color={colors.primary}
                />

                <Text style={styles.levelText}>
                  {trustLevel}
                </Text>
              </View>

              <Text style={styles.scoreDescription}>
                Built through verified and trusted activity.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.compactBadges}>
            {identityVerified ? (
              <CompactBadge
                label="Identity"
                icon="person"
                tone="green"
              />
            ) : null}

            {businessVerified ? (
              <CompactBadge
                label="Business"
                icon="briefcase"
                tone="green"
              />
            ) : null}

            {professionalVerified ? (
              <CompactBadge
                label="Professional"
                icon="construct"
                tone="gold"
              />
            ) : null}

            {communityTrusted ? (
              <CompactBadge
                label="Community"
                icon="trophy"
                tone="neutral"
              />
            ) : null}
          </View>
        </View>
      </DGCard>
    );
  }

  return (
    <DGCard variant="raised">
      <View style={styles.fullContainer}>
        <Text style={styles.fullTitle}>
          Trust Profile
        </Text>

        <Text style={styles.fullSubtitle}>
          Your reputation across Direct Gain.
        </Text>

        <View style={styles.fullGainContainer}>
          <GainScoreBadge score={gainScore} />
        </View>

        <Text style={styles.fullSectionTitle}>
          Verification
        </Text>

        <VerificationBadges
          identity={identityVerified}
          business={businessVerified}
          professional={professionalVerified}
          community={communityTrusted}
        />
      </View>
    </DGCard>
  );
}

function CompactBadge({
  label,
  icon,
  tone,
}: CompactBadgeProps) {
  const toneStyles = getBadgeTone(tone);

  return (
    <View
      style={[
        styles.compactBadge,
        {
          borderColor: toneStyles.borderColor,
          backgroundColor: toneStyles.backgroundColor,
        },
      ]}
    >
      <View
        style={[
          styles.compactBadgeIcon,
          {
            backgroundColor: toneStyles.iconBackgroundColor,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={13}
          color={toneStyles.iconColor}
        />
      </View>

      <Text
        numberOfLines={1}
        style={styles.compactBadgeText}
      >
        {label}
      </Text>
    </View>
  );
}

function getTrustLevel(score: number) {
  if (score >= 90) {
    return 'Excellent';
  }

  if (score >= 75) {
    return 'Trusted';
  }

  if (score >= 60) {
    return 'Established';
  }

  if (score >= 40) {
    return 'Building';
  }

  return 'New';
}

function getBadgeTone(
  tone: CompactBadgeProps['tone'],
) {
  if (tone === 'gold') {
    return {
      borderColor: '#E9B94966',
      backgroundColor: '#E9B94912',
      iconBackgroundColor: '#E9B94922',
      iconColor: '#E9B949',
    };
  }

  if (tone === 'neutral') {
    return {
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      iconBackgroundColor: '#FFFFFF12',
      iconColor: colors.textSecondary,
    };
  }

  return {
    borderColor: `${colors.primary}66`,
    backgroundColor: `${colors.primary}10`,
    iconBackgroundColor: `${colors.primary}20`,
    iconColor: colors.primary,
  };
}

const styles = StyleSheet.create({
  compactContainer: {
    width: '100%',
  },

  compactHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  compactHeadingArea: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  shieldIcon: {
    width: 42,
    height: 42,
    marginRight: 12,
    borderRadius: 15,
    backgroundColor: `${colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  compactHeadingText: {
    flex: 1,
    minWidth: 0,
  },

  compactTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },

  compactSubtitle: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },

  compactScoreArea: {
    width: '100%',
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  scoreCircle: {
    width: 86,
    height: 86,
    marginRight: 17,
    borderRadius: 43,
    borderWidth: 6,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: colors.primary,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  scoreValue: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.8,
  },

  scoreMaximum: {
    marginTop: -2,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },

  scoreDetails: {
    flex: 1,
    minWidth: 0,
  },

  scoreEyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  levelRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  levelText: {
    marginLeft: 7,
    color: colors.primary,
    fontSize: 22,
    fontWeight: '900',
  },

  scoreDescription: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },

  divider: {
    width: '100%',
    height: 1,
    marginVertical: 17,
    backgroundColor: colors.border,
  },

  compactBadges: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  compactBadge: {
    minHeight: 35,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  compactBadgeIcon: {
    width: 24,
    height: 24,
    marginRight: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  compactBadgeText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },

  fullContainer: {
    width: '100%',
  },

  fullTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },

  fullSubtitle: {
    marginTop: 4,
    marginBottom: 20,
    color: colors.textSecondary,
    fontSize: 14,
  },

  fullGainContainer: {
    marginBottom: 24,
  },

  fullSectionTitle: {
    marginBottom: 12,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});