import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

export type ListingDetailItem = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type Props = {
  items: ListingDetailItem[];
};

export default function ListingDetailsGrid({
  items,
}: Props) {
  return (
    <View style={styles.grid}>
      {items.map(item => (
        <View
          key={item.label}
          style={styles.item}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name={item.icon}
              size={18}
              color={colors.primary}
            />
          </View>

          <View style={styles.itemContent}>
            <Text style={styles.label}>
              {item.label}
            </Text>

            <Text
              style={styles.value}
              numberOfLines={2}
            >
              {item.value}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  item: {
    width: '48.5%',
    minHeight: 86,
    marginBottom: 10,
    padding: 13,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.18)',
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemContent: {
    flex: 1,
    marginLeft: 10,
  },

  label: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
  },

  value: {
    marginTop: 4,
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '900',
  },
});