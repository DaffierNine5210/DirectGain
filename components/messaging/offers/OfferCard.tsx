import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../../theme/colors';

import { formatMarketOfferAmount } from '../../../utils/market/parseMarketOfferAmount';

import type {
  MarketOfferLifecycleStatus,
  MarketOfferRecord,
} from '../../../types/MarketOffer';

export { formatMarketOfferAmount };

type Props = {
  offer: MarketOfferRecord;
  viewerId: string | null;
  busy?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onWithdraw?: () => void;
};

export default function OfferCard({
  offer,
  viewerId,
  busy = false,
  onAccept,
  onDecline,
  onWithdraw,
}: Props) {
  const formattedAmount = formatMarketOfferAmount(
    offer.amount,
    offer.currency,
  );

  const isPending = offer.status === 'pending';
  const isSeller = viewerId !== null && viewerId === offer.sellerId;
  const isBuyer = viewerId !== null && viewerId === offer.buyerId;
  const showSellerActions = isPending && isSeller;
  const showBuyerActions = isPending && isBuyer;
  const status = getStatusConfig(offer.status);
  const statusCopy = getStatusCopy(offer.status);

  return (
    <View
      style={styles.card}
      accessibilityLabel={`Market offer ${formattedAmount}, ${status.label}`}
    >
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons
            name="pricetag-outline"
            size={20}
            color={colors.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.eyebrow}>MARKET OFFER</Text>

          <Text style={styles.title}>Proposed price</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              borderColor: status.borderColor,
              backgroundColor: status.backgroundColor,
            },
          ]}
        >
          <Ionicons
            name={status.icon}
            size={12}
            color={status.color}
          />

          <Text
            style={[
              styles.statusText,
              {
                color: status.color,
              },
            ]}
          >
            {status.label}
          </Text>
        </View>
      </View>

      <View style={styles.amountSection}>
        <Text style={styles.amountLabel}>OFFER AMOUNT</Text>

        <Text style={styles.amount}>{formattedAmount}</Text>
      </View>

      {offer.message ? (
        <View style={styles.messageCard}>
          <Ionicons
            name="chatbubble-outline"
            size={15}
            color={colors.textMuted}
          />

          <Text style={styles.messageText}>{offer.message}</Text>
        </View>
      ) : null}

      {statusCopy ? (
        <Text style={styles.statusCopy}>{statusCopy}</Text>
      ) : null}

      {showSellerActions ? (
        <View style={styles.sellerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Decline offer"
            accessibilityState={{ disabled: busy }}
            disabled={busy}
            onPress={onDecline}
            style={({ pressed }) => [
              styles.secondaryButton,
              busy && styles.disabled,
              pressed && !busy && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryText}>Decline</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Accept offer"
            accessibilityState={{ disabled: busy, busy }}
            disabled={busy}
            onPress={onAccept}
            style={({ pressed }) => [
              styles.acceptButton,
              busy && styles.disabled,
              pressed && !busy && styles.pressed,
            ]}
          >
            {busy ? (
              <ActivityIndicator color="#081006" />
            ) : (
              <Ionicons
                name="checkmark"
                size={16}
                color="#081006"
              />
            )}

            <Text style={styles.acceptText}>Accept</Text>
          </Pressable>
        </View>
      ) : null}

      {showBuyerActions ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Withdraw offer"
          accessibilityState={{ disabled: busy }}
          disabled={busy}
          onPress={onWithdraw}
          style={({ pressed }) => [
            styles.withdrawButton,
            busy && styles.disabled,
            pressed && !busy && styles.pressed,
          ]}
        >
          <Ionicons
            name="close-circle-outline"
            size={15}
            color={colors.textMuted}
          />

          <Text style={styles.withdrawText}>Withdraw offer</Text>
        </Pressable>
      ) : null}

      <View style={styles.footer}>
        <Ionicons
          name="shield-checkmark-outline"
          size={13}
          color={colors.textMuted}
        />

        <Text style={styles.footerText}>
          This records a proposed price. It does not process payment or
          complete a sale.
        </Text>
      </View>
    </View>
  );
}

function getStatusCopy(
  status: MarketOfferLifecycleStatus,
): string | null {
  switch (status) {
    case 'accepted':
      return 'Seller accepted this proposed price.';
    case 'declined':
      return 'The seller declined this proposed price.';
    case 'withdrawn':
      return 'The buyer withdrew this proposed price.';
    default:
      return null;
  }
}

function getStatusConfig(
  status: MarketOfferLifecycleStatus,
) {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
        icon: 'time-outline' as const,
        color: '#E8C95D',
        borderColor: 'rgba(232, 201, 93, 0.18)',
        backgroundColor: 'rgba(232, 201, 93, 0.07)',
      };

    case 'accepted':
      return {
        label: 'Accepted',
        icon: 'checkmark-circle-outline' as const,
        color: colors.primary,
        borderColor: 'rgba(158, 246, 90, 0.20)',
        backgroundColor: 'rgba(158, 246, 90, 0.07)',
      };

    case 'declined':
      return {
        label: 'Declined',
        icon: 'close-circle-outline' as const,
        color: '#E48787',
        borderColor: 'rgba(228, 135, 135, 0.18)',
        backgroundColor: 'rgba(228, 135, 135, 0.06)',
      };

    case 'withdrawn':
      return {
        label: 'Withdrawn',
        icon: 'remove-circle-outline' as const,
        color: colors.textMuted,
        borderColor: 'rgba(255, 255, 255, 0.09)',
        backgroundColor: 'rgba(255, 255, 255, 0.035)',
      };
  }
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.16)',
    backgroundColor: 'rgba(158, 246, 90, 0.035)',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerContent: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  title: {
    marginTop: 3,
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },

  statusBadge: {
    minHeight: 27,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusText: {
    marginLeft: 4,
    fontSize: 8,
    fontWeight: '900',
  },

  amountSection: {
    marginTop: 15,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.065)',
  },

  amountLabel: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  amount: {
    marginTop: 4,
    color: colors.primary,
    fontSize: 27,
    fontWeight: '900',
  },

  messageCard: {
    marginTop: 13,
    padding: 11,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  messageText: {
    flex: 1,
    marginLeft: 8,
    color: colors.text,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '700',
  },

  statusCopy: {
    marginTop: 12,
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },

  sellerActions: {
    marginTop: 14,
    flexDirection: 'row',
  },

  secondaryButton: {
    flex: 1,
    height: 44,
    marginRight: 7,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
  },

  acceptButton: {
    flex: 1.15,
    height: 44,
    borderRadius: 13,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  acceptText: {
    marginLeft: 5,
    color: '#081006',
    fontSize: 9,
    fontWeight: '900',
  },

  withdrawButton: {
    height: 44,
    marginTop: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  withdrawText: {
    marginLeft: 6,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
  },

  footer: {
    marginTop: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  footerText: {
    flex: 1,
    marginLeft: 6,
    color: colors.textMuted,
    fontSize: 8,
    lineHeight: 13,
    fontWeight: '600',
  },

  disabled: {
    opacity: 0.45,
  },

  pressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },
});
