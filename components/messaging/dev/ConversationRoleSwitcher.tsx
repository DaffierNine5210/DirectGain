import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';

export type ConversationRole =
  | 'buyer'
  | 'seller';

type Props = {
  role: ConversationRole;

  onChange: (
    role: ConversationRole,
  ) => void;
};

export default function ConversationRoleSwitcher({
  role,
  onChange,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        DEV ROLE
      </Text>

      <View style={styles.switcher}>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            onChange('buyer')
          }
          style={({ pressed }) => [
            styles.option,

            role === 'buyer' &&
              styles.optionActive,

            pressed &&
              styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.optionText,

              role === 'buyer' &&
                styles.optionTextActive,
            ]}
          >
            Buyer
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            onChange('seller')
          }
          style={({ pressed }) => [
            styles.option,

            role === 'seller' &&
              styles.optionActive,

            pressed &&
              styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.optionText,

              role === 'seller' &&
                styles.optionTextActive,
            ]}
          >
            Seller
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    wrapper: {
      marginHorizontal: 14,
      marginTop: 8,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    label: {
      color:
        colors.textMuted,

      fontSize: 7,

      fontWeight: '900',

      letterSpacing: 1.1,
    },

    switcher: {
      padding: 3,

      borderRadius: 12,

      borderWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.07)',

      backgroundColor:
        'rgba(255, 255, 255, 0.025)',

      flexDirection: 'row',
    },

    option: {
      minWidth: 64,
      height: 30,

      paddingHorizontal: 10,

      borderRadius: 9,

      alignItems: 'center',
      justifyContent:
        'center',
    },

    optionActive: {
      backgroundColor:
        'rgba(158, 246, 90, 0.12)',
    },

    optionText: {
      color:
        colors.textMuted,

      fontSize: 9,

      fontWeight: '800',
    },

    optionTextActive: {
      color:
        colors.primary,
    },

    pressed: {
      opacity: 0.72,
    },
  });