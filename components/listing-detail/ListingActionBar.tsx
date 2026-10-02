import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';

export type ListingOfferAction = {
  label: string;
  accessibilityLabel: string;
  disabled?: boolean;
};

type Props = {
  sellerName: string;
  showOfferAction: boolean;
  offerAction?: ListingOfferAction;

  onMessagePress: () => void;
  onOfferPress: () => void;
};

export default function ListingActionBar({
  sellerName,
  showOfferAction,
  offerAction,
  onMessagePress,
  onOfferPress,
}: Props) {
  const offerDisabled = offerAction?.disabled === true;

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

      {showOfferAction && offerAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={offerAction.accessibilityLabel}
          accessibilityState={{
            disabled: offerDisabled,
          }}
          disabled={offerDisabled}
          onPress={onOfferPress}
          style={({ pressed }) => [
            styles.offerButton,
            offerDisabled && styles.offerButtonDisabled,
            pressed && !offerDisabled && styles.pressed,
          ]}
        >
          <Ionicons
            name="pricetag-outline"
            size={18}
            color="#081006"
          />

          <Text style={styles.offerButtonText}>
            {offerAction.label}
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

  offerButtonDisabled: {
    opacity: 0.45,
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
