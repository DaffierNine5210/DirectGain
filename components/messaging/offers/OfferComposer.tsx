import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../../../theme/colors';

export type OfferComposerValues = {
  amount: number;
  message?: string;
};

type Props = {
  listingPrice?: number;

  currency?: 'AUD';

  onCancel: () => void;

  onSubmit: (
    values: OfferComposerValues,
  ) => void;
};

export default function OfferComposer({
  listingPrice,
  currency = 'AUD',
  onCancel,
  onSubmit,
}: Props) {
  const [
    amountText,
    setAmountText,
  ] = useState(
    listingPrice !== undefined
      ? String(listingPrice)
      : '',
  );

  const [
    message,
    setMessage,
  ] = useState('');

  const amount = useMemo(() => {
    const cleaned =
      amountText.replace(
        /[^0-9.]/g,
        '',
      );

    const parsed =
      Number(cleaned);

    if (
      !Number.isFinite(
        parsed,
      )
    ) {
      return 0;
    }

    return parsed;
  }, [amountText]);

  const canSubmit =
    amount > 0;

  const formattedListingPrice =
    listingPrice !== undefined
      ? new Intl.NumberFormat(
          'en-AU',
          {
            style: 'currency',
            currency,
            maximumFractionDigits: 0,
          },
        ).format(
          listingPrice,
        )
      : undefined;

  function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    onSubmit({
      amount,

      message:
        message.trim() ||
        undefined,
    });
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View
          style={
            styles.headerIcon
          }
        >
          <Ionicons
            name="pricetag-outline"
            size={21}
            color={
              colors.primary
            }
          />
        </View>

        <View
          style={
            styles.headerContent
          }
        >
          <Text
            style={
              styles.eyebrow
            }
          >
            MARKET OFFER
          </Text>

          <Text
            style={
              styles.title
            }
          >
            Make an offer
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Send the seller a clear
            offer before creating a
            Deal Agreement.
          </Text>
        </View>
      </View>

      {formattedListingPrice ? (
        <View
          style={
            styles.listingPriceRow
          }
        >
          <Text
            style={
              styles.listingPriceLabel
            }
          >
            ASKING PRICE
          </Text>

          <Text
            style={
              styles.listingPriceValue
            }
          >
            {formattedListingPrice}
          </Text>
        </View>
      ) : null}

      <Text
        style={
          styles.fieldLabel
        }
      >
        Your offer
      </Text>

      <View
        style={
          styles.amountInput
        }
      >
        <Text
          style={
            styles.currencySymbol
          }
        >
          $
        </Text>

        <TextInput
          value={amountText}
          onChangeText={
            setAmountText
          }
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={
            colors.textMuted
          }
          selectionColor={
            colors.primary
          }
          style={
            styles.amountTextInput
          }
        />

        <Text
          style={
            styles.currencyCode
          }
        >
          {currency}
        </Text>
      </View>

      <View
        style={
          styles.fieldHeader
        }
      >
        <Text
          style={
            styles.fieldLabelCompact
          }
        >
          Message
        </Text>

        <Text
          style={
            styles.optional
          }
        >
          Optional
        </Text>
      </View>

      <TextInput
        value={message}
        onChangeText={
          setMessage
        }
        multiline
        textAlignVertical="top"
        placeholder="Add a short message to the seller."
        placeholderTextColor={
          colors.textMuted
        }
        selectionColor={
          colors.primary
        }
        maxLength={240}
        style={
          styles.messageInput
        }
      />

      <View
        style={
          styles.infoCard
        }
      >
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={
            colors.primary
          }
        />

        <Text
          style={
            styles.infoText
          }
        >
          This is only an offer.
          Nothing is final until both
          buyer and seller agree to
          the transaction details.
        </Text>
      </View>

      <View
        style={
          styles.actions
        }
      >
        <Pressable
          accessibilityRole="button"
          onPress={onCancel}
          style={({
            pressed,
          }) => [
            styles.cancelButton,

            pressed &&
              styles.pressed,
          ]}
        >
          <Text
            style={
              styles.cancelText
            }
          >
            Cancel
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{
            disabled:
              !canSubmit,
          }}
          disabled={!canSubmit}
          onPress={
            handleSubmit
          }
          style={({
            pressed,
          }) => [
            styles.submitButton,

            !canSubmit &&
              styles.submitButtonDisabled,

            pressed &&
              canSubmit &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="send"
            size={17}
            color="#081006"
          />

          <Text
            style={
              styles.submitText
            }
          >
            Send offer
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      padding: 17,

      borderRadius: 22,

      borderWidth: 1,

      borderColor:
        'rgba(158, 246, 90, 0.16)',

      backgroundColor:
        '#0D110E',
    },

    header: {
      flexDirection: 'row',

      alignItems: 'flex-start',
    },

    headerIcon: {
      width: 44,
      height: 44,

      borderRadius: 14,

      backgroundColor:
        'rgba(158, 246, 90, 0.09)',

      alignItems: 'center',

      justifyContent: 'center',
    },

    headerContent: {
      flex: 1,

      marginLeft: 12,
    },

    eyebrow: {
      color:
        colors.primary,

      fontSize: 8,

      fontWeight: '900',

      letterSpacing: 1.3,
    },

    title: {
      marginTop: 3,

      color:
        colors.text,

      fontSize: 18,

      fontWeight: '900',
    },

    subtitle: {
      marginTop: 5,

      color:
        colors.textMuted,

      fontSize: 10,

      lineHeight: 15,

      fontWeight: '600',
    },

    listingPriceRow: {
      marginTop: 17,

      paddingVertical: 11,

      paddingHorizontal: 12,

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.07)',

      backgroundColor:
        'rgba(255, 255, 255, 0.025)',

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },

    listingPriceLabel: {
      color:
        colors.textMuted,

      fontSize: 8,

      fontWeight: '900',

      letterSpacing: 1,
    },

    listingPriceValue: {
      color:
        colors.text,

      fontSize: 12,

      fontWeight: '900',
    },

    fieldLabel: {
      marginTop: 18,

      marginBottom: 7,

      color:
        colors.text,

      fontSize: 10,

      fontWeight: '900',
    },

    amountInput: {
      height: 58,

      paddingHorizontal: 14,

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        'rgba(158, 246, 90, 0.22)',

      backgroundColor:
        'rgba(158, 246, 90, 0.05)',

      flexDirection: 'row',

      alignItems: 'center',
    },

    currencySymbol: {
      color:
        colors.primary,

      fontSize: 22,

      fontWeight: '900',
    },

    amountTextInput: {
      flex: 1,

      marginLeft: 5,

      color:
        colors.text,

      fontSize: 22,

      fontWeight: '900',
    },

    currencyCode: {
      color:
        colors.textMuted,

      fontSize: 9,

      fontWeight: '900',
    },

    fieldHeader: {
      marginTop: 18,

      marginBottom: 7,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },

    fieldLabelCompact: {
      color:
        colors.text,

      fontSize: 10,

      fontWeight: '900',
    },

    optional: {
      color:
        colors.textMuted,

      fontSize: 8,

      fontWeight: '700',
    },

    messageInput: {
      minHeight: 92,

      paddingHorizontal: 13,

      paddingTop: 12,

      paddingBottom: 12,

      borderRadius: 15,

      borderWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.09)',

      backgroundColor:
        'rgba(255, 255, 255, 0.035)',

      color:
        colors.text,

      fontSize: 11,

      lineHeight: 16,

      fontWeight: '700',
    },

    infoCard: {
      marginTop: 16,

      padding: 11,

      borderRadius: 13,

      backgroundColor:
        'rgba(158, 246, 90, 0.045)',

      flexDirection: 'row',

      alignItems: 'flex-start',
    },

    infoText: {
      flex: 1,

      marginLeft: 7,

      color:
        colors.textMuted,

      fontSize: 9,

      lineHeight: 14,

      fontWeight: '600',
    },

    actions: {
      marginTop: 18,

      flexDirection: 'row',
    },

    cancelButton: {
      height: 50,

      paddingHorizontal: 18,

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.10)',

      backgroundColor:
        'rgba(255, 255, 255, 0.035)',

      alignItems: 'center',

      justifyContent:
        'center',
    },

    cancelText: {
      color:
        colors.text,

      fontSize: 11,

      fontWeight: '900',
    },

    submitButton: {
      flex: 1,

      height: 50,

      marginLeft: 9,

      borderRadius: 16,

      backgroundColor:
        colors.primary,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'center',
    },

    submitButtonDisabled: {
      opacity: 0.35,
    },

    submitText: {
      marginLeft: 7,

      color: '#081006',

      fontSize: 11,

      fontWeight: '900',
    },

    pressed: {
      opacity: 0.76,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },
  });