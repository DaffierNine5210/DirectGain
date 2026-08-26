import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';

export default function ListingSafetyCard() {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Ionicons
          name="shield-checkmark-outline"
          size={21}
          color={colors.primary}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Trade with clarity
        </Text>

        <Text style={styles.text}>
          Keep communication inside Direct Gain,
          check the seller's Gain Profile and
          confirm the agreed transaction details
          before meeting.
        </Text>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      marginTop: 24,

      padding: 15,

      borderRadius: 18,

      borderWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.08)',

      backgroundColor:
        'rgba(255, 255, 255, 0.035)',

      flexDirection: 'row',

      alignItems: 'flex-start',
    },

    icon: {
      width: 42,
      height: 42,

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        'rgba(158, 246, 90, 0.17)',

      backgroundColor:
        'rgba(158, 246, 90, 0.07)',

      alignItems: 'center',

      justifyContent: 'center',
    },

    content: {
      flex: 1,

      marginLeft: 12,
    },

    title: {
      color: colors.text,

      fontSize: 13,

      fontWeight: '900',
    },

    text: {
      marginTop: 5,

      color: colors.textMuted,

      fontSize: 10,

      lineHeight: 16,

      fontWeight: '600',
    },
  });