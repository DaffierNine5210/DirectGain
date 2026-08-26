import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';

type Props = {
  title: string;
  price: string;

  suburb: string;
  state: string;

  distanceKm?: number;

  createdAt: string;
};

export default function ListingHeader({
  title,
  price,
  suburb,
  state,
  distanceKm,
  createdAt,
}: Props) {
  return (
    <View>
      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.price}>
        {price}
      </Text>

      <View style={styles.metadataRow}>
        <Ionicons
          name="location-outline"
          size={15}
          color={colors.primary}
        />

        <Text style={styles.metadataText}>
          {suburb}, {state}

          {distanceKm !== undefined
            ? ` · ${distanceKm} km away`
            : ''}

          {` · Listed ${createdAt}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,

    fontSize: 25,

    lineHeight: 31,

    fontWeight: '900',

    letterSpacing: -0.45,
  },

  price: {
    marginTop: 7,

    color: colors.primary,

    fontSize: 34,

    lineHeight: 39,

    fontWeight: '900',

    letterSpacing: -0.8,
  },

  metadataRow: {
    marginTop: 11,

    flexDirection: 'row',

    alignItems: 'flex-start',
  },

  metadataText: {
    flex: 1,

    marginLeft: 7,

    color: colors.textMuted,

    fontSize: 11,

    lineHeight: 17,

    fontWeight: '700',
  },
});