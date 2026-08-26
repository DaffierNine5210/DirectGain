import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../../theme/colors';

import type {
  DealAgreement,
} from '../../../types/DealAgreement';

type Props = {
  agreement: DealAgreement;

  onPress: () => void;
};

export default function CompletedDealAgreementCard({
  agreement,
  onPress,
}: Props) {
  const formattedPrice =
    new Intl.NumberFormat(
      'en-AU',
      {
        style: 'currency',
        currency:
          agreement.currency,
        maximumFractionDigits: 0,
      },
    ).format(
      agreement.agreedPrice,
    );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="View completed deal agreement"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,

        pressed &&
          styles.pressed,
      ]}
    >
      <View
        style={
          styles.iconContainer
        }
      >
        <Ionicons
          name="shield-checkmark-outline"
          size={21}
          color={
            colors.primary
          }
        />
      </View>

      <View
        style={
          styles.content
        }
      >
        <Text
          style={
            styles.title
          }
        >
          Deal Agreement
        </Text>

        <View
          style={
            styles.summaryRow
          }
        >
          <Text
            style={
              styles.summary
            }
          >
            Both confirmed
          </Text>

          <View
            style={
              styles.summaryDot
            }
          />

          <Text
            style={
              styles.summary
            }
          >
            {formattedPrice}
          </Text>
        </View>
      </View>

      <View
        style={
          styles.viewArea
        }
      >
        <Text
          style={
            styles.viewText
          }
        >
          View
        </Text>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={
            colors.textMuted
          }
        />
      </View>
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    card: {
      minHeight: 78,

      paddingHorizontal: 14,
      paddingVertical: 12,

      borderRadius: 18,

      borderWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.08)',

      backgroundColor:
        'rgba(255, 255, 255, 0.025)',

      flexDirection: 'row',

      alignItems: 'center',
    },

    iconContainer: {
      width: 46,
      height: 46,

      borderRadius: 14,

      backgroundColor:
        'rgba(158, 246, 90, 0.08)',

      alignItems: 'center',

      justifyContent: 'center',
    },

    content: {
      flex: 1,

      marginLeft: 12,

      minWidth: 0,
    },

    title: {
      color:
        colors.text,

      fontSize: 14,

      fontWeight: '900',
    },

    summaryRow: {
      marginTop: 5,

      flexDirection: 'row',

      alignItems: 'center',
    },

    summary: {
      color:
        colors.textMuted,

      fontSize: 9,

      fontWeight: '700',
    },

    summaryDot: {
      width: 3,
      height: 3,

      marginHorizontal: 7,

      borderRadius: 2,

      backgroundColor:
        colors.textMuted,
    },

    viewArea: {
      marginLeft: 10,

      flexDirection: 'row',

      alignItems: 'center',
    },

    viewText: {
      marginRight: 3,

      color:
        colors.primary,

      fontSize: 9,

      fontWeight: '900',
    },

    pressed: {
      opacity: 0.75,

      transform: [
        {
          scale: 0.985,
        },
      ],
    },
  });