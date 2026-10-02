import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../../../theme/colors';
import formatListingPrice from '../../../utils/listing/formatListingPrice';
import {
  MARKET_OFFER_MESSAGE_MAX_LENGTH,
  normaliseMarketOfferMessage,
  parseMarketOfferAmount,
} from '../../../utils/market/parseMarketOfferAmount';

export type OfferComposerValues = {
  amount: number;
  message?: string;
};

type Props = {
  listingTitle?: string;
  listingPrice?: number;
  currency?: 'AUD';
  submitting?: boolean;
  error?: string | null;
  onCancel: () => void;
  onSubmit: (values: OfferComposerValues) => void;
};

export default function OfferComposer({
  listingTitle,
  listingPrice,
  currency = 'AUD',
  submitting = false,
  error = null,
  onCancel,
  onSubmit,
}: Props) {
  const [amountText, setAmountText] = useState(
    listingPrice !== undefined ? String(listingPrice) : '',
  );
  const [message, setMessage] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const parsedAmount = useMemo(
    () => parseMarketOfferAmount(amountText),
    [amountText],
  );

  const parsedMessage = useMemo(
    () => normaliseMarketOfferMessage(message),
    [message],
  );

  const canSubmit =
    !submitting && parsedAmount.ok && parsedMessage.ok;

  const formattedListingPrice =
    listingPrice !== undefined
      ? formatListingPrice(listingPrice, currency)
      : undefined;

  const visibleError = localError ?? error;

  function handleSubmit() {
    if (submitting) {
      return;
    }

    const amountResult = parseMarketOfferAmount(amountText);
    const messageResult = normaliseMarketOfferMessage(message);

    if (!amountResult.ok) {
      setLocalError('Enter a valid offer amount.');
      return;
    }

    if (!messageResult.ok) {
      setLocalError('Keep your message to 500 characters or fewer.');
      return;
    }

    setLocalError(null);

    onSubmit({
      amount: amountResult.amount,
      message: messageResult.message ?? undefined,
    });
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons
            name="pricetag-outline"
            size={21}
            color={colors.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.eyebrow}>MARKET OFFER</Text>

          <Text style={styles.title}>Make an offer</Text>

          <Text style={styles.subtitle}>
            Propose a price to the seller.
          </Text>
        </View>
      </View>

      {listingTitle ? (
        <Text
          style={styles.listingTitle}
          accessibilityRole="text"
        >
          {listingTitle}
        </Text>
      ) : null}

      {formattedListingPrice ? (
        <View style={styles.listingPriceRow}>
          <Text style={styles.listingPriceLabel}>ASKING PRICE</Text>

          <Text style={styles.listingPriceValue}>
            {formattedListingPrice}
          </Text>
        </View>
      ) : null}

      <Text style={styles.fieldLabel}>Your offer</Text>

      <View style={styles.amountInput}>
        <Text style={styles.currencySymbol}>$</Text>

        <TextInput
          value={amountText}
          onChangeText={(next) => {
            setAmountText(next);
            setLocalError(null);
          }}
          editable={!submitting}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          accessibilityLabel="Offer amount in Australian dollars"
          style={styles.amountTextInput}
        />

        <Text style={styles.currencyCode}>{currency}</Text>
      </View>

      <View style={styles.fieldHeader}>
        <Text style={styles.fieldLabelCompact}>Message</Text>

        <Text style={styles.optional}>Optional</Text>
      </View>

      <TextInput
        value={message}
        onChangeText={(next) => {
          setMessage(next);
          setLocalError(null);
        }}
        editable={!submitting}
        multiline
        textAlignVertical="top"
        placeholder="Add a short message to the seller."
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        maxLength={MARKET_OFFER_MESSAGE_MAX_LENGTH}
        accessibilityLabel="Optional message to the seller"
        style={styles.messageInput}
      />

      <Text style={styles.characterCount}>
        {`${message.length}/${MARKET_OFFER_MESSAGE_MAX_LENGTH}`}
      </Text>

      <View style={styles.infoCard}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={colors.primary}
        />

        <Text style={styles.infoText}>
          This proposes a price. It does not complete a sale or create a
          payment.
        </Text>
      </View>

      {visibleError ? (
        <Text
          style={styles.errorText}
          accessibilityRole="alert"
        >
          {visibleError}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel offer"
          disabled={submitting}
          onPress={onCancel}
          style={({ pressed }) => [
            styles.cancelButton,
            submitting && styles.cancelButtonDisabled,
            pressed && !submitting && styles.pressed,
          ]}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            submitting ? 'Sending offer' : 'Send offer'
          }
          accessibilityState={{
            disabled: !canSubmit,
            busy: submitting,
          }}
          disabled={!canSubmit}
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submitButton,
            !canSubmit && styles.submitButtonDisabled,
            pressed && canSubmit && styles.pressed,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#081006" />
          ) : (
            <Ionicons
              name="send"
              size={17}
              color="#081006"
            />
          )}

          <Text style={styles.submitText}>
            {submitting ? 'Sending…' : 'Send offer'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 17,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.16)',
    backgroundColor: '#0D110E',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(158, 246, 90, 0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerContent: {
    flex: 1,
    marginLeft: 12,
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.3,
  },

  title: {
    marginTop: 3,
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },

  subtitle: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '600',
  },

  listingTitle: {
    marginTop: 16,
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },

  listingPriceRow: {
    marginTop: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  listingPriceLabel: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  listingPriceValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },

  fieldLabel: {
    marginTop: 18,
    marginBottom: 7,
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
  },

  amountInput: {
    height: 58,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.22)',
    backgroundColor: 'rgba(158, 246, 90, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  currencySymbol: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '900',
  },

  amountTextInput: {
    flex: 1,
    marginLeft: 5,
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },

  currencyCode: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
  },

  fieldHeader: {
    marginTop: 18,
    marginBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  fieldLabelCompact: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
  },

  optional: {
    color: colors.textMuted,
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
    borderColor: 'rgba(255, 255, 255, 0.09)',
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },

  characterCount: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'right',
  },

  infoCard: {
    marginTop: 16,
    padding: 11,
    borderRadius: 13,
    backgroundColor: 'rgba(158, 246, 90, 0.045)',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  infoText: {
    flex: 1,
    marginLeft: 7,
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '600',
  },

  errorText: {
    marginTop: 12,
    color: '#F3B4B4',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
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
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonDisabled: {
    opacity: 0.45,
  },

  cancelText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },

  submitButton: {
    flex: 1,
    height: 50,
    marginLeft: 9,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
