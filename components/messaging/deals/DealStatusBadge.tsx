import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../../theme/colors';

import type {
  DealAgreementStatus,
} from '../../../types/DealAgreement';

type Props = {
  status: DealAgreementStatus;
};

export default function DealStatusBadge({
  status,
}: Props) {
  const config =
    getStatusConfig(status);

  return (
    <View
      style={[
        styles.badge,
        config.variant === 'positive' &&
          styles.positiveBadge,
        config.variant === 'warning' &&
          styles.warningBadge,
        config.variant === 'muted' &&
          styles.mutedBadge,
      ]}
    >
      <Ionicons
        name={config.icon}
        size={12}
        color={config.color}
      />

      <Text
        style={[
          styles.text,
          {
            color: config.color,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

function getStatusConfig(
  status: DealAgreementStatus,
) {
  switch (status) {
    case 'draft':
      return {
        label: 'Draft',
        icon:
          'create-outline' as const,
        color:
          colors.textMuted,
        variant:
          'muted' as const,
      };

    case 'pending':
      return {
        label: 'Awaiting confirmation',
        icon:
          'time-outline' as const,
        color:
          '#E8C95D',
        variant:
          'warning' as const,
      };

    case 'confirmed':
      return {
        label: 'Confirmed',
        icon:
          'checkmark-circle-outline' as const,
        color:
          colors.primary,
        variant:
          'positive' as const,
      };

    case 'declined':
      return {
        label: 'Declined',
        icon:
          'close-circle-outline' as const,
        color:
          '#E48787',
        variant:
          'muted' as const,
      };

    case 'cancelled':
      return {
        label: 'Cancelled',
        icon:
          'ban-outline' as const,
        color:
          colors.textMuted,
        variant:
          'muted' as const,
      };

    case 'completed':
      return {
        label: 'Completed',
        icon:
          'shield-checkmark-outline' as const,
        color:
          colors.primary,
        variant:
          'positive' as const,
      };
  }
}

const styles =
  StyleSheet.create({
    badge: {
      minHeight: 28,

      paddingHorizontal: 9,

      borderRadius: 10,

      borderWidth: 1,

      flexDirection: 'row',

      alignItems: 'center',

      alignSelf: 'flex-start',
    },

    positiveBadge: {
      borderColor:
        'rgba(158, 246, 90, 0.18)',

      backgroundColor:
        'rgba(158, 246, 90, 0.07)',
    },

    warningBadge: {
      borderColor:
        'rgba(232, 201, 93, 0.18)',

      backgroundColor:
        'rgba(232, 201, 93, 0.07)',
    },

    mutedBadge: {
      borderColor:
        'rgba(255, 255, 255, 0.08)',

      backgroundColor:
        'rgba(255, 255, 255, 0.035)',
    },

    text: {
      marginLeft: 5,

      fontSize: 9,

      fontWeight: '900',
    },
  });