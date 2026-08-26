import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../../theme/colors';

type Props = {
  hasActiveAgreement?: boolean;

  onPress: () => void;
};

export default function DealAgreementLauncher({
  hasActiveAgreement = false,
  onPress,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        hasActiveAgreement
          ? 'Open current deal agreement'
          : 'Create deal agreement'
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,

        hasActiveAgreement &&
          styles.cardActive,

        pressed &&
          styles.pressed,
      ]}
    >
      <View style={styles.icon}>
        <Ionicons
          name={
            hasActiveAgreement
              ? 'shield-checkmark'
              : 'shield-checkmark-outline'
          }
          size={19}
          color={colors.primary}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.eyebrow}>
          SAFE TRANSACTION
        </Text>

        <Text style={styles.title}>
          {hasActiveAgreement
            ? 'Deal agreement active'
            : 'Create deal agreement'}
        </Text>

        <Text
          numberOfLines={2}
          style={styles.subtitle}
        >
          {hasActiveAgreement
            ? 'Review the agreed price, location, time and confirmation status.'
            : 'Record the price, location and transaction time once you have agreed on the details.'}
        </Text>
      </View>

      <View style={styles.action}>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.primary}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',

    minHeight: 76,

    padding: 12,

    borderRadius: 17,

    borderWidth: 1,

    borderColor:
      'rgba(158, 246, 90, 0.14)',

    backgroundColor:
      'rgba(158, 246, 90, 0.035)',

    flexDirection: 'row',

    alignItems: 'center',
  },

  cardActive: {
    borderColor:
      'rgba(158, 246, 90, 0.28)',

    backgroundColor:
      'rgba(158, 246, 90, 0.065)',
  },

  icon: {
    width: 40,
    height: 40,

    borderRadius: 13,

    backgroundColor:
      'rgba(158, 246, 90, 0.08)',

    alignItems: 'center',

    justifyContent: 'center',
  },

  content: {
    flex: 1,

    minWidth: 0,

    marginLeft: 11,

    marginRight: 8,
  },

  eyebrow: {
    color: colors.primary,

    fontSize: 7,

    lineHeight: 10,

    fontWeight: '900',

    letterSpacing: 1.1,
  },

  title: {
    marginTop: 2,

    color: colors.text,

    fontSize: 12,

    lineHeight: 16,

    fontWeight: '900',
  },

  subtitle: {
    marginTop: 3,

    color: colors.textMuted,

    fontSize: 8,

    lineHeight: 12,

    fontWeight: '600',
  },

  action: {
    width: 31,
    height: 31,

    borderRadius: 10,

    backgroundColor:
      'rgba(158, 246, 90, 0.07)',

    alignItems: 'center',

    justifyContent: 'center',
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