import { Ionicons } from '@expo/vector-icons';
import type {
  ComponentProps,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../../theme/colors';

type IoniconName =
  ComponentProps<
    typeof Ionicons
  >['name'];

export type DetailRowItem = {
  label: string;
  value: string;
  icon: IoniconName;
};

type Props = {
  item: DetailRowItem;
  showDivider?: boolean;
};

export default function DetailRow({
  item,
  showDivider = false,
}: Props) {
  return (
    <View
      style={[
        styles.row,

        showDivider &&
          styles.divider,
      ]}
    >
      <View style={styles.left}>
        <View style={styles.icon}>
          <Ionicons
            name={item.icon}
            size={16}
            color={
              colors.primary
            }
          />
        </View>

        <Text
          style={styles.label}
        >
          {item.label}
        </Text>
      </View>

      <Text
        numberOfLines={2}
        style={styles.value}
      >
        {item.value}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    row: {
      minHeight: 49,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },

    divider: {
      borderBottomWidth: 1,

      borderBottomColor:
        'rgba(255, 255, 255, 0.06)',
    },

    left: {
      flex: 1,

      minWidth: 0,

      flexDirection: 'row',

      alignItems: 'center',
    },

    icon: {
      width: 29,
      height: 29,

      borderRadius: 9,

      backgroundColor:
        'rgba(158, 246, 90, 0.065)',

      alignItems: 'center',

      justifyContent: 'center',
    },

    label: {
      marginLeft: 9,

      color:
        colors.textMuted,

      fontSize: 10,

      fontWeight: '700',
    },

    value: {
      maxWidth: '52%',

      marginLeft: 12,

      color:
        colors.text,

      fontSize: 10,

      lineHeight: 15,

      fontWeight: '900',

      textAlign: 'right',
    },
  });