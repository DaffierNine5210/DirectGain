import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';
import type { VerificationType } from '../../types/Listing';
import type { SellerProfile } from '../../types/SellerProfile';

type Props = {
  seller: SellerProfile;
  onVerificationPress?: (
    verification: VerificationType,
  ) => void;
};

type VerificationItem = {
  type: VerificationType;
  title: string;
  description: string;
  detail: string;
  icon:
    | 'shield-checkmark-outline'
    | 'briefcase-outline'
    | 'ribbon-outline'
    | 'people-outline';
};

const verificationItems: VerificationItem[] = [
  {
    type: 'identity',
    title: 'Identity verified',
    description:
      'This member has completed Direct Gain identity checks.',
    detail:
      'Government-issued identification confirmed.',
    icon: 'shield-checkmark-outline',
  },
  {
    type: 'business',
    title: 'Business verified',
    description:
      'Business information has been reviewed and connected to this profile.',
    detail:
      'Registered business details confirmed.',
    icon: 'briefcase-outline',
  },
  {
    type: 'professional',
    title: 'Professional verified',
    description:
      'Professional qualifications or trade credentials have been reviewed.',
    detail:
      'Relevant licences or qualifications confirmed.',
    icon: 'ribbon-outline',
  },
  {
    type: 'community',
    title: 'Community trusted',
    description:
      'Earned through strong platform history and positive community conduct.',
    detail:
      'Consistent reviews, activity and conduct recognised.',
    icon: 'people-outline',
  },
];

function getVerifiedCount(
  seller: SellerProfile,
): number {
  return verificationItems.filter(item =>
    seller.verification.includes(item.type),
  ).length;
}

export default function VerificationHub({
  seller,
  onVerificationPress,
}: Props) {
  const verifiedCount = getVerifiedCount(seller);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <Ionicons
            name="shield-checkmark-outline"
            size={21}
            color={colors.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.eyebrow}>
            TRUST AND SAFETY
          </Text>

          <Text style={styles.title}>
            Verification
          </Text>

          <Text style={styles.subtitle}>
            See which checks and trust milestones this member
            has completed.
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countValue}>
            {verifiedCount}
          </Text>

          <Text style={styles.countLabel}>
            verified
          </Text>
        </View>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusIcon}>
          <Ionicons
            name="checkmark-circle"
            size={22}
            color={colors.primary}
          />
        </View>

        <View style={styles.statusContent}>
          <Text style={styles.statusTitle}>
            Strong verification coverage
          </Text>

          <Text style={styles.statusText}>
            {verifiedCount} of {verificationItems.length}{' '}
            available verification types are active on this
            profile.
          </Text>
        </View>
      </View>

      <View style={styles.verificationList}>
        {verificationItems.map(item => {
          const isVerified =
            seller.verification.includes(item.type);

          return (
            <Pressable
              key={item.type}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}. ${
                isVerified
                  ? 'Verified'
                  : 'Not yet verified'
              }`}
              onPress={() =>
                onVerificationPress?.(item.type)
              }
              style={({ pressed }) => [
                styles.verificationCard,
                isVerified &&
                  styles.verificationCardActive,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.verificationIcon,
                  isVerified &&
                    styles.verificationIconActive,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={
                    isVerified
                      ? colors.primary
                      : colors.textMuted
                  }
                />
              </View>

              <View style={styles.verificationContent}>
                <View style={styles.verificationTitleRow}>
                  <Text
                    style={[
                      styles.verificationTitle,
                      !isVerified &&
                        styles.verificationTitleInactive,
                    ]}
                  >
                    {item.title}
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,
                      isVerified
                        ? styles.statusBadgeActive
                        : styles.statusBadgeInactive,
                    ]}
                  >
                    <Ionicons
                      name={
                        isVerified
                          ? 'checkmark'
                          : 'lock-closed-outline'
                      }
                      size={12}
                      color={
                        isVerified
                          ? '#080B09'
                          : colors.textMuted
                      }
                    />

                    <Text
                      style={[
                        styles.statusBadgeText,
                        isVerified
                          ? styles.statusBadgeTextActive
                          : styles.statusBadgeTextInactive,
                      ]}
                    >
                      {isVerified
                        ? 'Verified'
                        : 'Not active'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.verificationDescription}>
                  {item.description}
                </Text>

                <View style={styles.detailRow}>
                  <Ionicons
                    name={
                      isVerified
                        ? 'checkmark-circle-outline'
                        : 'information-circle-outline'
                    }
                    size={14}
                    color={
                      isVerified
                        ? colors.primary
                        : colors.textMuted
                    }
                  />

                  <Text
                    style={[
                      styles.detailText,
                      !isVerified &&
                        styles.detailTextInactive,
                    ]}
                  >
                    {item.detail}
                  </Text>
                </View>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Ionicons
          name="lock-closed-outline"
          size={15}
          color={colors.textMuted}
        />

        <Text style={styles.footerText}>
          Verification information is reviewed by Direct Gain
          and cannot be manually changed by other members.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.14)',
    backgroundColor: '#101511',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  headerIcon: {
    width: 44,
    height: 44,
    marginRight: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.18)',
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerContent: {
    flex: 1,
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  title: {
    marginTop: 4,
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  subtitle: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '600',
  },

  countBadge: {
    minWidth: 62,
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.20)',
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
  },

  countValue: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '900',
  },

  countLabel: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '800',
  },

  statusCard: {
    marginTop: 20,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.12)',
    backgroundColor: 'rgba(158, 246, 90, 0.045)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusIcon: {
    width: 42,
    height: 42,
    marginRight: 11,
    borderRadius: 14,
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },

  statusText: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '600',
  },

  verificationList: {
    marginTop: 18,
  },

  verificationCard: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  verificationCardActive: {
    borderColor: 'rgba(158, 246, 90, 0.14)',
    backgroundColor: 'rgba(158, 246, 90, 0.035)',
  },

  verificationIcon: {
    width: 46,
    height: 46,
    marginRight: 12,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  verificationIconActive: {
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.18)',
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
  },

  verificationContent: {
    flex: 1,
  },

  verificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  verificationTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },

  verificationTitleInactive: {
    color: colors.textMuted,
  },

  statusBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusBadgeActive: {
    backgroundColor: colors.primary,
  },

  statusBadgeInactive: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },

  statusBadgeText: {
    marginLeft: 4,
    fontSize: 8,
    fontWeight: '900',
  },

  statusBadgeTextActive: {
    color: '#080B09',
  },

  statusBadgeTextInactive: {
    color: colors.textMuted,
  },

  verificationDescription: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '600',
  },

  detailRow: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailText: {
    flex: 1,
    marginLeft: 6,
    color: colors.text,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '700',
  },

  detailTextInactive: {
    color: colors.textMuted,
  },

  footer: {
    marginTop: 8,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  footerText: {
    flex: 1,
    marginLeft: 8,
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '600',
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.985 }],
  },
});