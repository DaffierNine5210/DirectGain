import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { colors } from '../theme/colors';

export type VerificationType =
  | 'identity'
  | 'business'
  | 'professional'
  | 'community';

type VerificationBadgesProps = {
  identity?: boolean;
  business?: boolean;
  professional?: boolean;
  community?: boolean;
  compact?: boolean;
  showLabels?: boolean;
  style?: ViewStyle;
};

type VerificationDetails = {
  type: VerificationType;
  label: string;
  shortLabel: string;
  iconName:
    | 'person-circle'
    | 'business'
    | 'briefcase'
    | 'trophy';
  accentColor: string;
};

const verificationDetails: VerificationDetails[] = [
  {
    type: 'identity',
    label: 'Identity Verified',
    shortLabel: 'Identity',
    iconName: 'person-circle',
    accentColor: colors.primary,
  },
  {
    type: 'business',
    label: 'Business Verified',
    shortLabel: 'Business',
    iconName: 'business',
    accentColor: '#63A7FF',
  },
  {
    type: 'professional',
    label: 'Professional Verified',
    shortLabel: 'Professional',
    iconName: 'briefcase',
    accentColor: '#F4C95D',
  },
  {
    type: 'community',
    label: 'Community Trusted',
    shortLabel: 'Trusted',
    iconName: 'trophy',
    accentColor: '#D7D9DE',
  },
];

export default function VerificationBadges({
  identity = false,
  business = false,
  professional = false,
  community = false,
  compact = false,
  showLabels = true,
  style,
}: VerificationBadgesProps) {
  const enabledBadges = verificationDetails.filter((badge) => {
    if (badge.type === 'identity') {
      return identity;
    }

    if (badge.type === 'business') {
      return business;
    }

    if (badge.type === 'professional') {
      return professional;
    }

    return community;
  });

  if (enabledBadges.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {enabledBadges.map((badge) => (
        <View
          key={badge.type}
          style={[
            styles.badge,
            compact && styles.compactBadge,
            {
              borderColor: badge.accentColor,
            },
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              compact && styles.compactIconContainer,
              {
                backgroundColor: `${badge.accentColor}18`,
              },
            ]}
          >
            <Ionicons
              name={badge.iconName}
              size={compact ? 13 : 15}
              color={badge.accentColor}
            />
          </View>

          {showLabels && (
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                compact && styles.compactLabel,
              ]}
            >
              {compact ? badge.shortLabel : badge.label}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },

  badge: {
    minHeight: 38,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 19,
    borderWidth: 1,
    backgroundColor: colors.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
  },

  compactBadge: {
    minHeight: 30,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 15,
  },

  iconContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  compactIconContainer: {
    width: 21,
    height: 21,
    borderRadius: 10.5,
  },

  label: {
    maxWidth: 150,
    marginLeft: 7,
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },

  compactLabel: {
    maxWidth: 100,
    marginLeft: 5,
    fontSize: 11,
  },
});