import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';
import type {
  ListingSeller,
} from '../../types/Listing';

type Props = {
  seller: ListingSeller;
  onPress?: () => void;
};

export default function SellerTrustCard({
  seller,
  onPress,
}: Props) {
  const initials =
    getInitials(seller.name);

  const verificationCount =
    seller.verification.length;

  const isIdentityVerified =
    seller.verification.includes(
      'identity',
    );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${seller.name}'s Gain Profile`}
      accessibilityHint="Opens seller trust, reviews and profile details"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,

        pressed &&
          styles.pressed,
      ]}
    >
      <View style={styles.mainRow}>
        <View style={styles.avatar}>
          {seller.profileImage ? (
            <Image
              source={
                seller.profileImage
              }
              style={
                styles.avatarImage
              }
            />
          ) : (
            <Text
              style={
                styles.avatarText
              }
            >
              {initials}
            </Text>
          )}

          {isIdentityVerified ? (
            <View
              style={
                styles.verifiedMark
              }
            >
              <Ionicons
                name="shield-checkmark"
                size={12}
                color="#081006"
              />
            </View>
          ) : null}
        </View>

        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text
              numberOfLines={1}
              style={styles.name}
            >
              {seller.name}
            </Text>

            {isIdentityVerified ? (
              <Ionicons
                name="shield-checkmark"
                size={15}
                color={
                  colors.primary
                }
              />
            ) : null}
          </View>

          <Text
            style={
              styles.profileLabel
            }
          >
            Gain Profile
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={19}
          color={
            colors.textMuted
          }
        />
      </View>

      <View style={styles.trustRow}>
        <View style={styles.trustItem}>
          <View
            style={
              styles.trustIcon
            }
          >
            <Ionicons
              name="trending-up"
              size={14}
              color={
                colors.primary
              }
            />
          </View>

          <View>
            <Text
              style={
                styles.trustValue
              }
            >
              {seller.gainScore}
            </Text>

            <Text
              style={
                styles.trustLabel
              }
            >
              Gain Score
            </Text>
          </View>
        </View>

        <View
          style={
            styles.trustDivider
          }
        />

        <View style={styles.trustItem}>
          <View
            style={
              styles.trustIcon
            }
          >
            <Ionicons
              name="star"
              size={14}
              color={
                colors.primary
              }
            />
          </View>

          <View>
            <Text
              style={
                styles.trustValue
              }
            >
              {seller.rating.toFixed(
                1,
              )}
            </Text>

            <Text
              style={
                styles.trustLabel
              }
            >
              {seller.reviewCount}{' '}
              reviews
            </Text>
          </View>
        </View>

        <View
          style={
            styles.trustDivider
          }
        />

        <View style={styles.trustItem}>
          <View
            style={
              styles.trustIcon
            }
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color={
                colors.primary
              }
            />
          </View>

          <View>
            <Text
              style={
                styles.trustValue
              }
            >
              {verificationCount}
            </Text>

            <Text
              style={
                styles.trustLabel
              }
            >
              Verified
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View
          style={
            styles.reputationStatus
          }
        >
          <View
            style={
              styles.statusDot
            }
          />

          <Text
            style={
              styles.statusText
            }
          >
            {getTrustLabel(
              seller.gainScore,
            )}
          </Text>
        </View>

        <View
          style={
            styles.profileAction
          }
        >
          <Text
            style={
              styles.profileActionText
            }
          >
            View profile
          </Text>

          <Ionicons
            name="arrow-forward"
            size={14}
            color={
              colors.primary
            }
          />
        </View>
      </View>
    </Pressable>
  );
}

function getInitials(
  name: string,
) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

function getTrustLabel(
  gainScore: number,
) {
  if (gainScore >= 90) {
    return 'Excellent reputation';
  }

  if (gainScore >= 75) {
    return 'Trusted member';
  }

  if (gainScore >= 60) {
    return 'Established member';
  }

  return 'Building reputation';
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,

    padding: 15,

    borderRadius: 20,

    borderWidth: 1,

    borderColor:
      'rgba(158, 246, 90, 0.16)',

    backgroundColor:
      'rgba(255, 255, 255, 0.04)',
  },

  mainRow: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  avatar: {
    position: 'relative',

    width: 50,
    height: 50,

    borderRadius: 17,

    borderWidth: 1,

    borderColor:
      'rgba(158, 246, 90, 0.20)',

    backgroundColor:
      'rgba(158, 246, 90, 0.09)',

    alignItems: 'center',

    justifyContent: 'center',

    overflow: 'visible',
  },

  avatarImage: {
    width: '100%',
    height: '100%',

    borderRadius: 16,
  },

  avatarText: {
    color:
      colors.primary,

    fontSize: 17,

    fontWeight: '900',
  },

  verifiedMark: {
    position: 'absolute',

    right: -5,
    bottom: -4,

    width: 22,
    height: 22,

    borderRadius: 8,

    borderWidth: 2,

    borderColor:
      '#0B100C',

    backgroundColor:
      colors.primary,

    alignItems: 'center',

    justifyContent: 'center',
  },

  identity: {
    flex: 1,

    minWidth: 0,

    marginLeft: 12,
  },

  nameRow: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  name: {
    flexShrink: 1,

    marginRight: 6,

    color:
      colors.text,

    fontSize: 16,

    lineHeight: 20,

    fontWeight: '900',
  },

  profileLabel: {
    marginTop: 3,

    color:
      colors.textMuted,

    fontSize: 10,

    lineHeight: 14,

    fontWeight: '700',
  },

  trustRow: {
    minHeight: 70,

    marginTop: 15,

    paddingVertical: 11,

    borderRadius: 15,

    borderWidth: 1,

    borderColor:
      'rgba(255, 255, 255, 0.06)',

    backgroundColor:
      'rgba(158, 246, 90, 0.045)',

    flexDirection: 'row',

    alignItems: 'center',
  },

  trustItem: {
    flex: 1,

    minWidth: 0,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',
  },

  trustIcon: {
    width: 27,
    height: 27,

    marginRight: 7,

    borderRadius: 9,

    backgroundColor:
      'rgba(158, 246, 90, 0.08)',

    alignItems: 'center',

    justifyContent: 'center',
  },

  trustValue: {
    color:
      colors.text,

    fontSize: 14,

    lineHeight: 17,

    fontWeight: '900',
  },

  trustLabel: {
    marginTop: 2,

    color:
      colors.textMuted,

    fontSize: 8,

    lineHeight: 11,

    fontWeight: '700',
  },

  trustDivider: {
    width: 1,
    height: 31,

    backgroundColor:
      'rgba(255, 255, 255, 0.07)',
  },

  footer: {
    minHeight: 38,

    marginTop: 12,

    paddingTop: 11,

    borderTopWidth: 1,

    borderTopColor:
      'rgba(255, 255, 255, 0.06)',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',
  },

  reputationStatus: {
    flex: 1,

    minWidth: 0,

    flexDirection: 'row',

    alignItems: 'center',
  },

  statusDot: {
    width: 6,
    height: 6,

    marginRight: 7,

    borderRadius: 3,

    backgroundColor:
      colors.primary,
  },

  statusText: {
    flexShrink: 1,

    color:
      colors.textMuted,

    fontSize: 9,

    lineHeight: 12,

    fontWeight: '700',
  },

  profileAction: {
    marginLeft: 10,

    flexDirection: 'row',

    alignItems: 'center',
  },

  profileActionText: {
    marginRight: 5,

    color:
      colors.primary,

    fontSize: 10,

    lineHeight: 14,

    fontWeight: '900',
  },

  pressed: {
    opacity: 0.76,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },
});