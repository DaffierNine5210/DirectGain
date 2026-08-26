import { Ionicons } from '@expo/vector-icons';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';

import type {
  SellerProfile,
} from '../../types/SellerProfile';

type Props = {
  seller: SellerProfile;
};

type TrustItemProps = {
  icon:
    | 'shield-checkmark-outline'
    | 'briefcase-outline'
    | 'people-outline'
    | 'checkmark-circle-outline'
    | 'star-outline'
    | 'flash-outline';

  label: string;
  verified?: boolean;
};

function TrustItem({
  icon,
  label,
  verified = true,
}: TrustItemProps) {
  return (
    <View style={styles.trustItem}>
      <View
        style={[
          styles.trustIcon,

          !verified &&
            styles.trustIconInactive,
        ]}
      >
        <Ionicons
          name={icon}
          size={16}
          color={
            verified
              ? colors.primary
              : colors.textMuted
          }
        />
      </View>

      <Text
        numberOfLines={2}
        style={[
          styles.trustLabel,

          !verified &&
            styles.trustLabelInactive,
        ]}
      >
        {label}
      </Text>

      {verified ? (
        <View
          style={
            styles.trustCheck
          }
        >
          <Ionicons
            name="checkmark"
            size={12}
            color="#071004"
          />
        </View>
      ) : null}
    </View>
  );
}

function getScoreLabel(
  score: number,
): string {
  if (score >= 90) {
    return 'Excellent reputation';
  }

  if (score >= 75) {
    return 'Strong reputation';
  }

  if (score >= 60) {
    return 'Good reputation';
  }

  return 'Building reputation';
}

export default function GainScoreCard({
  seller,
}: Props) {
  const safeScore = Math.max(
    0,
    Math.min(
      100,
      seller.gainScore,
    ),
  );

  const identityVerified =
    seller.verification.includes(
      'identity',
    );

  const businessVerified =
    seller.verification.includes(
      'business',
    );

  const communityTrusted =
    seller.verification.includes(
      'community',
    );

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <View style={styles.eyebrowRow}>
          <Ionicons
            name="trending-up"
            size={16}
            color={colors.primary}
          />

          <Text style={styles.eyebrow}>
            DIRECT GAIN TRUST
          </Text>
        </View>

        <Text style={styles.title}>
          Gain Score
        </Text>

        <Text style={styles.subtitle}>
          A combined view of this seller's
          trust, activity and reputation.
        </Text>
      </View>

      <View style={styles.scoreSection}>
        <View style={styles.scoreBadge}>
          <Text style={styles.score}>
            {safeScore}
          </Text>

          <Text
            style={
              styles.scoreMaximum
            }
          >
            /100
          </Text>
        </View>

        <Text
          style={
            styles.scoreDescription
          }
        >
          Overall Gain Score
        </Text>
      </View>

      <View style={styles.reputationRow}>
        <View
          style={
            styles.reputationIcon
          }
        >
          <Ionicons
            name="sparkles"
            size={18}
            color={colors.primary}
          />
        </View>

        <View
          style={
            styles.reputationContent
          }
        >
          <Text
            numberOfLines={2}
            style={
              styles.reputationLabel
            }
          >
            {getScoreLabel(
              safeScore,
            )}
          </Text>

          <Text
            style={
              styles.reputationText
            }
          >
            Based on verified activity
            across Direct Gain.
          </Text>
        </View>
      </View>

      <View
        style={
          styles.progressSection
        }
      >
        <View
          style={
            styles.progressTrack
          }
        >
          <View
            style={[
              styles.progressFill,

              {
                width:
                  `${safeScore}%`,
              },
            ]}
          />
        </View>

        <View style={styles.scoreScale}>
          <Text
            style={
              styles.scaleText
            }
          >
            0
          </Text>

          <Text
            style={
              styles.scaleText
            }
          >
            50
          </Text>

          <Text
            style={
              styles.scaleText
            }
          >
            100
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>
        Why this score is strong
      </Text>

      <Text
        style={
          styles.sectionDescription
        }
      >
        Trust signals from this member's
        activity and verification.
      </Text>

      <View style={styles.trustList}>
        <TrustItem
          icon="shield-checkmark-outline"
          label="Identity verified"
          verified={
            identityVerified
          }
        />

        <TrustItem
          icon="briefcase-outline"
          label="Business verified"
          verified={
            businessVerified
          }
        />

        <TrustItem
          icon="people-outline"
          label="Community trusted"
          verified={
            communityTrusted
          }
        />

        <TrustItem
          icon="checkmark-circle-outline"
          label={
            seller.completedSales === 0
              ? 'Building sales history'
              : `${seller.completedSales} successful sales`
          }
        />

        <TrustItem
          icon="star-outline"
          label={
            seller.reviewCount === 0
              ? 'Building review history'
              : `${seller.rating.toFixed(
                  1,
                )} rating from ${
                  seller.reviewCount
                } reviews`
          }
        />

        <TrustItem
          icon="flash-outline"
          label={`${seller.responseRate}% response rate`}
        />
      </View>

      <View style={styles.footer}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={
            colors.textMuted
          }
        />

        <Text
          style={
            styles.footerText
          }
        >
          Gain Scores can change as
          members complete transactions,
          receive reviews and verify their
          information.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 4,

    padding: 18,

    borderRadius: 24,

    borderWidth: 1,

    borderColor:
      'rgba(158, 246, 90, 0.18)',

    backgroundColor:
      '#101511',
  },

  heading: {
    width: '100%',

    alignItems: 'center',
  },

  eyebrowRow: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'center',
  },

  eyebrow: {
    marginLeft: 7,

    color: colors.primary,

    fontSize: 10,

    fontWeight: '900',

    letterSpacing: 1.1,

    textAlign: 'center',
  },

  title: {
    marginTop: 8,

    color: colors.text,

    fontSize: 23,

    lineHeight: 29,

    fontWeight: '900',

    letterSpacing: -0.4,

    textAlign: 'center',
  },

  subtitle: {
    maxWidth: 280,

    marginTop: 6,

    color:
      colors.textMuted,

    fontSize: 12,

    lineHeight: 18,

    fontWeight: '600',

    textAlign: 'center',
  },

  scoreSection: {
    width: '100%',

    marginTop: 20,

    alignItems: 'center',

    justifyContent:
      'center',
  },

  scoreBadge: {
    width: 92,
    height: 92,

    borderRadius: 46,

    borderWidth: 1,

    borderColor:
      'rgba(158, 246, 90, 0.28)',

    backgroundColor:
      'rgba(158, 246, 90, 0.09)',

    alignItems: 'center',

    justifyContent:
      'center',
  },

  score: {
    color: colors.primary,

    fontSize: 30,

    lineHeight: 34,

    fontWeight: '900',

    letterSpacing: -1,
  },

  scoreMaximum: {
    marginTop: 1,

    color:
      colors.textMuted,

    fontSize: 10,

    lineHeight: 13,

    fontWeight: '800',
  },

  scoreDescription: {
    marginTop: 8,

    color:
      colors.textMuted,

    fontSize: 10,

    lineHeight: 14,

    fontWeight: '800',

    textAlign: 'center',
  },

  reputationRow: {
    width: '100%',

    marginTop: 20,

    padding: 13,

    borderRadius: 17,

    backgroundColor:
      'rgba(158, 246, 90, 0.06)',

    flexDirection: 'row',

    alignItems: 'center',
  },

  reputationIcon: {
    width: 39,
    height: 39,

    flexShrink: 0,

    borderRadius: 13,

    borderWidth: 1,

    borderColor:
      'rgba(158, 246, 90, 0.18)',

    backgroundColor:
      'rgba(158, 246, 90, 0.08)',

    alignItems: 'center',

    justifyContent:
      'center',
  },

  reputationContent: {
    flex: 1,

    minWidth: 0,

    marginLeft: 11,
  },

  reputationLabel: {
    color: colors.text,

    fontSize: 13,

    lineHeight: 18,

    fontWeight: '900',
  },

  reputationText: {
    marginTop: 3,

    color:
      colors.textMuted,

    fontSize: 10,

    lineHeight: 15,

    fontWeight: '600',
  },

  progressSection: {
    width: '100%',

    marginTop: 20,
  },

  progressTrack: {
    width: '100%',

    height: 10,

    overflow: 'hidden',

    borderRadius: 5,

    backgroundColor:
      'rgba(255, 255, 255, 0.07)',
  },

  progressFill: {
    height: '100%',

    borderRadius: 5,

    backgroundColor:
      colors.primary,
  },

  scoreScale: {
    marginTop: 7,

    flexDirection: 'row',

    justifyContent:
      'space-between',
  },

  scaleText: {
    color:
      colors.textMuted,

    fontSize: 9,

    fontWeight: '700',
  },

  divider: {
    height: 1,

    marginVertical: 20,

    backgroundColor:
      'rgba(255, 255, 255, 0.08)',
  },

  sectionTitle: {
    color: colors.text,

    fontSize: 14,

    lineHeight: 19,

    fontWeight: '900',
  },

  sectionDescription: {
    marginTop: 4,

    color:
      colors.textMuted,

    fontSize: 10,

    lineHeight: 15,

    fontWeight: '600',
  },

  trustList: {
    marginTop: 10,
  },

  trustItem: {
    width: '100%',

    minHeight: 48,

    paddingVertical: 7,

    flexDirection: 'row',

    alignItems: 'center',
  },

  trustIcon: {
    width: 32,
    height: 32,

    flexShrink: 0,

    marginRight: 10,

    borderRadius: 11,

    backgroundColor:
      'rgba(158, 246, 90, 0.08)',

    alignItems: 'center',

    justifyContent:
      'center',
  },

  trustIconInactive: {
    backgroundColor:
      'rgba(255, 255, 255, 0.04)',
  },

  trustLabel: {
    flex: 1,

    minWidth: 0,

    paddingRight: 10,

    color: colors.text,

    fontSize: 12,

    lineHeight: 17,

    fontWeight: '700',
  },

  trustLabelInactive: {
    color:
      colors.textMuted,
  },

  trustCheck: {
    width: 20,
    height: 20,

    flexShrink: 0,

    borderRadius: 10,

    backgroundColor:
      colors.primary,

    alignItems: 'center',

    justifyContent:
      'center',
  },

  footer: {
    width: '100%',

    marginTop: 16,

    paddingTop: 15,

    borderTopWidth: 1,

    borderTopColor:
      'rgba(255, 255, 255, 0.07)',

    flexDirection: 'row',

    alignItems:
      'flex-start',
  },

  footerText: {
    flex: 1,

    minWidth: 0,

    marginLeft: 8,

    color:
      colors.textMuted,

    fontSize: 10,

    lineHeight: 15,

    fontWeight: '600',
  },
});