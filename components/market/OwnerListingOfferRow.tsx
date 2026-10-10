import { StyleSheet, Text, View } from 'react-native';

import DGButton from '../DGButton';

import {
  alpha,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

type OwnerListingOfferRowProps = {
  buyerDisplayName: string;
  amountLabel: string;
  statusLabel: string;
  dateLabel: string;
  conversationAvailable: boolean;
  onViewConversation: () => void;
};

export default function OwnerListingOfferRow({
  buyerDisplayName,
  amountLabel,
  statusLabel,
  dateLabel,
  conversationAvailable,
  onViewConversation,
}: OwnerListingOfferRowProps) {
  return (
    <View
      accessibilityLabel={`${buyerDisplayName}, ${amountLabel}, ${statusLabel}, ${dateLabel}`}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <Text
          numberOfLines={1}
          style={styles.name}
        >
          {buyerDisplayName}
        </Text>
        <Text style={styles.status}>{statusLabel}</Text>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.amount}>{amountLabel}</Text>
        <Text style={styles.date}>{dateLabel}</Text>
      </View>

      {conversationAvailable ? (
        <DGButton
          title="View conversation"
          variant="outline"
          size="small"
          fullWidth
          onPress={onViewConversation}
          accessibilityLabel={`View conversation with ${buyerDisplayName}`}
        />
      ) : (
        <Text style={styles.unavailable}>
          Conversation unavailable
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.card,
    gap: spacing.xs,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  name: {
    flex: 1,
    color: textColor.primary,
    fontSize: typography.bodyMedium.fontSize,
    lineHeight: 20,
    fontWeight: '700',
  },

  status: {
    color: textColor.secondary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },

  amount: {
    flex: 1,
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },

  date: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  unavailable: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
