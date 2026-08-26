import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';

type Props = {
  sellerName: string;
  listingTitle: string;
  allowsOffers: boolean;

  onMessagePress: () => void;
  onOfferPress: () => void;
};

export default function ListingActionBar({
  sellerName,
  listingTitle,
  allowsOffers,
  onMessagePress,
  onOfferPress,
}: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Message ${sellerName}`}
        onPress={onMessagePress}
        style={({ pressed }) => [
          styles.messageButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="chatbubble-outline"
          size={19}
          color={colors.text}
        />

        <Text style={styles.messageButtonText}>
          Message seller
        </Text>
      </Pressable>

      {allowsOffers ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Make an offer for ${listingTitle}`}
          onPress={onOfferPress}
          style={({ pressed }) => [
            styles.offerButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="pricetag-outline"
            size={18}
            color="#081006"
          />

          <Text style={styles.offerButtonText}>
            Make offer
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,

    flexDirection: 'row',
  },

  messageButton: {
    flex: 1,

    height: 52,

    paddingHorizontal: 15,

    borderRadius: 17,

    borderWidth: 1,

    borderColor:
      'rgba(255, 255, 255, 0.14)',

    backgroundColor:
      'rgba(255, 255, 255, 0.045)',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',
  },

  messageButtonText: {
    marginLeft: 7,

    color: colors.text,

    fontSize: 12,

    fontWeight: '900',
  },

  offerButton: {
    flex: 1,

    height: 52,

    marginLeft: 9,

    paddingHorizontal: 15,

    borderRadius: 17,

    backgroundColor: colors.primary,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',
  },

  offerButtonText: {
    marginLeft: 7,

    color: '#081006',

    fontSize: 12,

    fontWeight: '900',
  },

  pressed: {
    opacity: 0.74,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },
});