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

import DealStatusBadge from './DealStatusBadge';

type Props = {
  agreement: DealAgreement;

  onPress?: () => void;
};

export default function DealAgreementCard({
  agreement,
  onPress,
}: Props) {
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

  const formattedDate =
    formatScheduledDate(
      agreement.scheduledAt,
    );

  const transactionLabel =
    getTransactionLabel(
      agreement.transactionMethod,
    );

  const bothConfirmed =
    agreement
      .buyerConfirmation
      .confirmed &&
    agreement
      .sellerConfirmation
      .confirmed;

  return (
    <Pressable
      accessibilityRole={
        onPress
          ? 'button'
          : undefined
      }
      accessibilityLabel={
        onPress
          ? 'Open deal agreement'
          : undefined
      }
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,

        pressed &&
          onPress &&
          styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <View
          style={
            styles.headerIcon
          }
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={colors.primary}
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
            DIRECT GAIN DEAL
          </Text>

          <Text
            style={
              styles.title
            }
          >
            Deal Agreement
          </Text>
        </View>

        {onPress ? (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={
              colors.textMuted
            }
          />
        ) : null}
      </View>

      <View
        style={
          styles.statusRow
        }
      >
        <DealStatusBadge
          status={
            agreement.status
          }
        />

        {bothConfirmed ? (
          <View
            style={
              styles.confirmedBadge
            }
          >
            <Ionicons
              name="people-outline"
              size={12}
              color={
                colors.primary
              }
            />

            <Text
              style={
                styles.confirmedText
              }
            >
              Both confirmed
            </Text>
          </View>
        ) : null}
      </View>

      <View
        style={
          styles.priceSection
        }
      >
        <Text
          style={
            styles.priceLabel
          }
        >
          AGREED PRICE
        </Text>

        <Text
          style={styles.price}
        >
          {formattedPrice}
        </Text>
      </View>

      <View style={styles.details}>
        <AgreementRow
          icon="swap-horizontal-outline"
          label="Transaction"
          value={
            transactionLabel
          }
        />

        <AgreementRow
          icon="location-outline"
          label="Location"
          value={
            agreement.locationName
          }
        />

        <AgreementRow
          icon="calendar-outline"
          label="When"
          value={formattedDate}
        />
      </View>

      <View
        style={
          styles.confirmations
        }
      >
        <ConfirmationItem
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

        <ConfirmationItem
          label="Seller"
          confirmed={
            agreement
              .sellerConfirmation
              .confirmed
          }
        />
      </View>

      {agreement.notes ? (
        <View
          style={
            styles.notes
          }
        >
          <Text
            style={
              styles.notesLabel
            }
          >
            NOTE
          </Text>

          <Text
            style={
              styles.notesText
            }
          >
            {agreement.notes}
          </Text>
        </View>
      ) : null}

      <View
        style={
          styles.footer
        }
      >
        <Ionicons
          name="information-circle-outline"
          size={14}
          color={
            colors.textMuted
          }
        />

        <Text
          style={
            styles.footerText
          }
        >
          Confirm the details before
          completing the transaction.
        </Text>
      </View>
    </Pressable>
  );
}

type AgreementRowProps = {
  icon:
    | 'swap-horizontal-outline'
    | 'location-outline'
    | 'calendar-outline';

  label: string;

  value: string;
};

function AgreementRow({
  icon,
  label,
  value,
}: AgreementRowProps) {
  return (
    <View style={styles.row}>
      <View
        style={
          styles.rowIcon
        }
      >
        <Ionicons
          name={icon}
          size={15}
          color={
            colors.primary
          }
        />
      </View>

      <View
        style={
          styles.rowContent
        }
      >
        <Text
          style={
            styles.rowLabel
          }
        >
          {label}
        </Text>

        <Text
          numberOfLines={2}
          style={
            styles.rowValue
          }
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

type ConfirmationItemProps = {
  label: string;

  confirmed: boolean;
};

function ConfirmationItem({
  label,
  confirmed,
}: ConfirmationItemProps) {
  return (
    <View
      style={
        styles.confirmationItem
      }
    >
      <View
        style={[
          styles.confirmationIcon,

          confirmed
            ? styles.confirmationIconActive
            : styles.confirmationIconPending,
        ]}
      >
        <Ionicons
          name={
            confirmed
              ? 'checkmark'
              : 'time-outline'
          }
          size={13}
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
            styles.confirmationStatus,

            confirmed &&
              styles.confirmationStatusActive,
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

function getTransactionLabel(
  method:
    DealAgreement['transactionMethod'],
) {
  switch (method) {
    case 'meetup':
      return 'Meet in person';

    case 'pickup':
      return 'Buyer pickup';

    case 'delivery':
      return 'Delivery';

    case 'other':
      return 'Other arrangement';
  }
}

function formatScheduledDate(
  scheduledAt: string,
) {
  const date =
    new Date(scheduledAt);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return scheduledAt;
  }

  return new Intl.DateTimeFormat(
    'en-AU',
    {
      weekday: 'short',

      day: 'numeric',

      month: 'short',

      hour: 'numeric',

      minute: '2-digit',
    },
  ).format(date);
}

const styles =
  StyleSheet.create({
    card: {
      width: '100%',

      padding: 15,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        'rgba(158, 246, 90, 0.16)',

      backgroundColor:
        'rgba(158, 246, 90, 0.035)',
    },

    header: {
      flexDirection: 'row',

      alignItems: 'center',
    },

    headerIcon: {
      width: 42,
      height: 42,

      borderRadius: 14,

      backgroundColor:
        'rgba(158, 246, 90, 0.09)',

      alignItems: 'center',

      justifyContent: 'center',
    },

    headerContent: {
      flex: 1,

      marginLeft: 11,
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

      fontSize: 15,

      fontWeight: '900',
    },

    statusRow: {
      marginTop: 13,

      flexDirection: 'row',

      flexWrap: 'wrap',

      alignItems: 'center',
    },

    confirmedBadge: {
      minHeight: 28,

      marginLeft: 7,

      paddingHorizontal: 9,

      borderRadius: 10,

      borderWidth: 1,

      borderColor:
        'rgba(158, 246, 90, 0.15)',

      backgroundColor:
        'rgba(158, 246, 90, 0.05)',

      flexDirection: 'row',

      alignItems: 'center',
    },

    confirmedText: {
      marginLeft: 5,

      color: colors.primary,

      fontSize: 9,

      fontWeight: '900',
    },

    priceSection: {
      marginTop: 15,

      paddingVertical: 13,

      borderTopWidth: 1,

      borderBottomWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.065)',
    },

    priceLabel: {
      color:
        colors.textMuted,

      fontSize: 8,

      fontWeight: '900',

      letterSpacing: 1.2,
    },

    price: {
      marginTop: 4,

      color: colors.primary,

      fontSize: 25,

      fontWeight: '900',
    },

    details: {
      paddingVertical: 6,
    },

    row: {
      minHeight: 49,

      flexDirection: 'row',

      alignItems: 'center',
    },

    rowIcon: {
      width: 30,
      height: 30,

      borderRadius: 10,

      backgroundColor:
        'rgba(158, 246, 90, 0.07)',

      alignItems: 'center',

      justifyContent: 'center',
    },

    rowContent: {
      flex: 1,

      marginLeft: 10,
    },

    rowLabel: {
      color:
        colors.textMuted,

      fontSize: 8,

      fontWeight: '800',
    },

    rowValue: {
      marginTop: 2,

      color: colors.text,

      fontSize: 11,

      lineHeight: 16,

      fontWeight: '800',
    },

    confirmations: {
      minHeight: 58,

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

      paddingHorizontal: 11,

      flexDirection: 'row',

      alignItems: 'center',
    },

    confirmationDivider: {
      width: 1,

      height: 31,

      backgroundColor:
        'rgba(255, 255, 255, 0.07)',
    },

    confirmationIcon: {
      width: 27,
      height: 27,

      marginRight: 8,

      borderRadius: 9,

      alignItems: 'center',

      justifyContent: 'center',
    },

    confirmationIconActive: {
      backgroundColor:
        colors.primary,
    },

    confirmationIconPending: {
      borderWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.10)',

      backgroundColor:
        'rgba(255, 255, 255, 0.035)',
    },

    confirmationLabel: {
      color:
        colors.textMuted,

      fontSize: 8,

      fontWeight: '800',
    },

    confirmationStatus: {
      marginTop: 2,

      color:
        colors.textMuted,

      fontSize: 9,

      fontWeight: '900',
    },

    confirmationStatusActive: {
      color: colors.primary,
    },

    notes: {
      marginTop: 12,

      padding: 11,

      borderRadius: 13,

      backgroundColor:
        'rgba(255, 255, 255, 0.025)',
    },

    notesLabel: {
      color:
        colors.textMuted,

      fontSize: 8,

      fontWeight: '900',

      letterSpacing: 1,
    },

    notesText: {
      marginTop: 4,

      color: colors.text,

      fontSize: 10,

      lineHeight: 15,

      fontWeight: '700',
    },

    footer: {
      marginTop: 12,

      flexDirection: 'row',

      alignItems: 'flex-start',
    },

    footerText: {
      flex: 1,

      marginLeft: 6,

      color:
        colors.textMuted,

      fontSize: 8,

      lineHeight: 13,

      fontWeight: '600',
    },

    pressed: {
      opacity: 0.78,

      transform: [
        {
          scale: 0.99,
        },
      ],
    },
  });