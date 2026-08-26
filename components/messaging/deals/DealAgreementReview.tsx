import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../../theme/colors';

import type {
  DealAgreement,
} from '../../../types/DealAgreement';

type Props = {
  agreement: DealAgreement;

  readOnly?: boolean;

  onConfirm?: () => void;

  onRequestChanges?: () => void;

  onClose: () => void;
};

export default function DealAgreementReview({
  agreement,
  readOnly = false,
  onConfirm,
  onRequestChanges,
  onClose,
}: Props) {
  const isConfirmed =
    agreement.status === 'confirmed';

  const formattedPrice =
    new Intl.NumberFormat(
      'en-AU',
      {
        style: 'currency',

        currency:
          agreement.currency,

        maximumFractionDigits: 0,
      },
    ).format(
      agreement.agreedPrice,
    );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons
            name={
              isConfirmed
                ? 'checkmark-circle-outline'
                : 'shield-checkmark-outline'
            }
            size={23}
            color={colors.primary}
          />
        </View>

        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>
            DIRECT GAIN DEAL
          </Text>

          <Text style={styles.title}>
            {isConfirmed
              ? 'Deal Agreement'
              : 'Review agreement'}
          </Text>

          <Text style={styles.subtitle}>
            {isConfirmed
              ? 'Both parties have confirmed this agreement.'
              : 'Make sure the transaction details are correct before confirming.'}
          </Text>
        </View>
      </View>

      {isConfirmed ? (
        <View style={styles.confirmedBanner}>
          <Ionicons
            name="shield-checkmark"
            size={17}
            color={colors.primary}
          />

          <View style={styles.confirmedCopy}>
            <Text style={styles.confirmedTitle}>
              Agreement confirmed
            </Text>

            <Text style={styles.confirmedSubtitle}>
              Buyer and seller both confirmed these transaction details.
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.priceCard}>
        <Text style={styles.priceLabel}>
          AGREED PRICE
        </Text>

        <Text style={styles.price}>
          {formattedPrice}
        </Text>
      </View>

      <View style={styles.detailsCard}>
        <DetailRow
          icon="swap-horizontal-outline"
          label="Transaction"
          value={formatTransactionMethod(
            agreement.transactionMethod,
          )}
        />

        <View style={styles.divider} />

        <DetailRow
          icon="location-outline"
          label="Location"
          value={
            agreement.locationName ||
            'Not supplied'
          }
        />

        <View style={styles.divider} />

        <DetailRow
          icon="calendar-outline"
          label="Date and time"
          value={
            agreement.scheduledAt ||
            'Not supplied'
          }
        />

        {agreement.notes ? (
          <>
            <View style={styles.divider} />

            <DetailRow
              icon="document-text-outline"
              label="Notes"
              value={agreement.notes}
            />
          </>
        ) : null}
      </View>

      <View style={styles.confirmationCard}>
        <ConfirmationStatus
          label="Buyer"
          confirmed={
            agreement
              .buyerConfirmation
              .confirmed
          }
        />

        <View
          style={
            styles.confirmationDivider
          }
        />

        <ConfirmationStatus
          label="Seller"
          confirmed={
            agreement
              .sellerConfirmation
              .confirmed
          }
        />
      </View>

      {!readOnly ? (
        <>
          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={colors.primary}
            />

            <Text style={styles.infoText}>
              Confirming means you agree to the details shown above. You can request changes before confirming.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onConfirm}
            disabled={!onConfirm}
            style={({ pressed }) => [
              styles.confirmButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color="#081006"
            />

            <Text style={styles.confirmText}>
              Confirm agreement
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={
              onRequestChanges
            }
            disabled={
              !onRequestChanges
            }
            style={({ pressed }) => [
              styles.changeButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="create-outline"
              size={17}
              color={colors.primary}
            />

            <Text style={styles.changeText}>
              Request changes
            </Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.readOnlyNotice}>
          <Ionicons
            name="lock-closed-outline"
            size={15}
            color={colors.textMuted}
          />

          <Text style={styles.readOnlyText}>
            This agreement is complete and can no longer be changed.
          </Text>
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={onClose}
        style={({ pressed }) => [
          styles.closeButton,

          pressed &&
            styles.pressed,
        ]}
      >
        <Text style={styles.closeText}>
          Close
        </Text>
      </Pressable>
    </View>
  );
}

type DetailRowProps = {
  icon: React.ComponentProps<
    typeof Ionicons
  >['name'];

  label: string;

  value: string;
};

function DetailRow({
  icon,
  label,
  value,
}: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons
          name={icon}
          size={17}
          color={colors.primary}
        />
      </View>

      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>
          {label}
        </Text>

        <Text style={styles.detailValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

type ConfirmationStatusProps = {
  label: string;

  confirmed: boolean;
};

function ConfirmationStatus({
  label,
  confirmed,
}: ConfirmationStatusProps) {
  return (
    <View style={styles.confirmationItem}>
      <View
        style={[
          styles.confirmationIcon,

          confirmed &&
            styles.confirmationIconConfirmed,
        ]}
      >
        <Ionicons
          name={
            confirmed
              ? 'checkmark'
              : 'time-outline'
          }
          size={15}
          color={
            confirmed
              ? '#081006'
              : colors.textMuted
          }
        />
      </View>

      <View>
        <Text
          style={
            styles.confirmationLabel
          }
        >
          {label}
        </Text>

        <Text
          style={[
            styles.confirmationValue,

            confirmed &&
              styles.confirmationValueConfirmed,
          ]}
        >
          {confirmed
            ? 'Confirmed'
            : 'Waiting'}
        </Text>
      </View>
    </View>
  );
}

function formatTransactionMethod(
  method:
    DealAgreement['transactionMethod'],
) {
  switch (method) {
    case 'meetup':
      return 'Meet in person';

    case 'pickup':
      return 'Pickup';

    case 'delivery':
      return 'Delivery';

    case 'other':
      return 'Other';

    default:
      return 'Transaction';
  }
}

const styles =
  StyleSheet.create({
    card: {
      padding: 18,

      borderRadius: 24,

      borderWidth: 1,

      borderColor:
        'rgba(158, 246, 90, 0.18)',

      backgroundColor:
        '#0D110E',
    },

    header: {
      flexDirection: 'row',

      alignItems: 'flex-start',
    },

    headerIcon: {
      width: 48,
      height: 48,

      borderRadius: 15,

      backgroundColor:
        'rgba(158, 246, 90, 0.09)',

      alignItems: 'center',

      justifyContent: 'center',
    },

    headerCopy: {
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

      fontSize: 20,

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

    confirmedBanner: {
      marginTop: 17,

      padding: 12,

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        'rgba(158, 246, 90, 0.15)',

      backgroundColor:
        'rgba(158, 246, 90, 0.055)',

      flexDirection: 'row',

      alignItems: 'center',
    },

    confirmedCopy: {
      flex: 1,

      marginLeft: 9,
    },

    confirmedTitle: {
      color:
        colors.primary,

      fontSize: 10,

      fontWeight: '900',
    },

    confirmedSubtitle: {
      marginTop: 2,

      color:
        colors.textMuted,

      fontSize: 8,

      lineHeight: 12,

      fontWeight: '600',
    },

    priceCard: {
      marginTop: 18,

      padding: 15,

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        'rgba(158, 246, 90, 0.18)',

      backgroundColor:
        'rgba(158, 246, 90, 0.05)',
    },

    priceLabel: {
      color:
        colors.textMuted,

      fontSize: 8,

      fontWeight: '900',

      letterSpacing: 1.1,
    },

    price: {
      marginTop: 4,

      color:
        colors.primary,

      fontSize: 28,

      fontWeight: '900',
    },

    detailsCard: {
      marginTop: 15,

      paddingHorizontal: 13,

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.07)',

      backgroundColor:
        'rgba(255, 255, 255, 0.025)',
    },

    detailRow: {
      paddingVertical: 13,

      flexDirection: 'row',

      alignItems: 'center',
    },

    detailIcon: {
      width: 36,
      height: 36,

      borderRadius: 11,

      backgroundColor:
        'rgba(158, 246, 90, 0.07)',

      alignItems: 'center',

      justifyContent: 'center',
    },

    detailCopy: {
      flex: 1,

      marginLeft: 10,
    },

    detailLabel: {
      color:
        colors.textMuted,

      fontSize: 8,

      fontWeight: '800',
    },

    detailValue: {
      marginTop: 3,

      color:
        colors.text,

      fontSize: 11,

      lineHeight: 15,

      fontWeight: '800',
    },

    divider: {
      height: 1,

      backgroundColor:
        'rgba(255, 255, 255, 0.06)',
    },

    confirmationCard: {
      marginTop: 15,

      padding: 12,

      borderRadius: 15,

      borderWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.07)',

      backgroundColor:
        'rgba(255, 255, 255, 0.025)',

      flexDirection: 'row',

      alignItems: 'center',
    },

    confirmationItem: {
      flex: 1,

      flexDirection: 'row',

      alignItems: 'center',
    },

    confirmationDivider: {
      width: 1,

      height: 40,

      marginHorizontal: 12,

      backgroundColor:
        'rgba(255, 255, 255, 0.07)',
    },

    confirmationIcon: {
      width: 34,
      height: 34,

      marginRight: 8,

      borderRadius: 11,

      borderWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.08)',

      alignItems: 'center',

      justifyContent: 'center',
    },

    confirmationIconConfirmed: {
      borderColor:
        colors.primary,

      backgroundColor:
        colors.primary,
    },

    confirmationLabel: {
      color:
        colors.textMuted,

      fontSize: 8,

      fontWeight: '800',
    },

    confirmationValue: {
      marginTop: 2,

      color:
        colors.textMuted,

      fontSize: 9,

      fontWeight: '900',
    },

    confirmationValueConfirmed: {
      color:
        colors.primary,
    },

    infoCard: {
      marginTop: 15,

      padding: 12,

      borderRadius: 14,

      backgroundColor:
        'rgba(158, 246, 90, 0.045)',

      flexDirection: 'row',

      alignItems: 'flex-start',
    },

    infoText: {
      flex: 1,

      marginLeft: 8,

      color:
        colors.textMuted,

      fontSize: 9,

      lineHeight: 14,

      fontWeight: '600',
    },

    confirmButton: {
      height: 52,

      marginTop: 18,

      borderRadius: 16,

      backgroundColor:
        colors.primary,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',
    },

    confirmText: {
      marginLeft: 7,

      color: '#081006',

      fontSize: 11,

      fontWeight: '900',
    },

    changeButton: {
      height: 48,

      marginTop: 9,

      borderRadius: 15,

      borderWidth: 1,

      borderColor:
        'rgba(158, 246, 90, 0.16)',

      backgroundColor:
        'rgba(158, 246, 90, 0.04)',

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',
    },

    changeText: {
      marginLeft: 7,

      color:
        colors.primary,

      fontSize: 10,

      fontWeight: '900',
    },

    readOnlyNotice: {
      marginTop: 15,

      padding: 11,

      borderRadius: 13,

      backgroundColor:
        'rgba(255, 255, 255, 0.025)',

      flexDirection: 'row',

      alignItems: 'center',
    },

    readOnlyText: {
      flex: 1,

      marginLeft: 7,

      color:
        colors.textMuted,

      fontSize: 8,

      lineHeight: 13,

      fontWeight: '600',
    },

    closeButton: {
      height: 44,

      marginTop: 8,

      alignItems: 'center',

      justifyContent: 'center',
    },

    closeText: {
      color:
        colors.textMuted,

      fontSize: 9,

      fontWeight: '800',
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