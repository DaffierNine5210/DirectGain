import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../../../theme/colors';

import type {
  DealTransactionMethod,
} from '../../../types/DealAgreement';

export type DealAgreementFormValues = {
  agreedPrice: number;

  transactionMethod:
    DealTransactionMethod;

  locationName: string;

  scheduledAt: string;

  notes?: string;
};

type Props = {
  initialPrice?: number;

  onCancel: () => void;

  onSubmit: (
    values: DealAgreementFormValues,
  ) => void;
};

const transactionMethods: {
  value: DealTransactionMethod;
  label: string;
  icon:
    | 'people-outline'
    | 'home-outline'
    | 'car-outline'
    | 'ellipsis-horizontal-outline';
}[] = [
  {
    value: 'meetup',
    label: 'Meet up',
    icon: 'people-outline',
  },
  {
    value: 'pickup',
    label: 'Pickup',
    icon: 'home-outline',
  },
  {
    value: 'delivery',
    label: 'Delivery',
    icon: 'car-outline',
  },
  {
    value: 'other',
    label: 'Other',
    icon: 'ellipsis-horizontal-outline',
  },
];

export default function DealAgreementForm({
  initialPrice,
  onCancel,
  onSubmit,
}: Props) {
  const [price, setPrice] =
    useState(
      initialPrice !== undefined
        ? String(initialPrice)
        : '',
    );

  const [
    transactionMethod,
    setTransactionMethod,
  ] =
    useState<DealTransactionMethod>(
      'meetup',
    );

  const [
    locationName,
    setLocationName,
  ] = useState('');

  const [
    scheduledAt,
    setScheduledAt,
  ] = useState('');

  const [
    notes,
    setNotes,
  ] = useState('');

  const numericPrice =
    Number(
      price.replace(
        /[^0-9.]/g,
        '',
      ),
    );

  const canSubmit =
    Number.isFinite(
      numericPrice,
    ) &&
    numericPrice > 0 &&
    locationName.trim().length >
      0 &&
    scheduledAt.trim().length >
      0;

  function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    onSubmit({
      agreedPrice:
        numericPrice,

      transactionMethod,

      locationName:
        locationName.trim(),

      scheduledAt:
        scheduledAt.trim(),

      notes:
        notes.trim() ||
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
            name="shield-checkmark-outline"
            size={21}
            color={colors.primary}
          />
        </View>

        <View
          style={
            styles.headerContent
          }
        >
          <Text
            style={styles.eyebrow}
          >
            DIRECT GAIN DEAL
          </Text>

          <Text
            style={styles.title}
          >
            Create agreement
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Record the transaction
            details both people are
            agreeing to.
          </Text>
        </View>
      </View>

      <FieldLabel
        label="Agreed price"
      />

      <View
        style={
          styles.priceInput
        }
      >
        <Text
          style={
            styles.currency
          }
        >
          $
        </Text>

        <TextInput
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={
            colors.textMuted
          }
          style={
            styles.priceTextInput
          }
        />

        <Text
          style={
            styles.currencyCode
          }
        >
          AUD
        </Text>
      </View>

      <FieldLabel
        label="Transaction method"
      />

      <View
        style={
          styles.methodGrid
        }
      >
        {transactionMethods.map(
          method => {
            const selected =
              transactionMethod ===
              method.value;

            return (
              <Pressable
                key={
                  method.value
                }
                accessibilityRole="button"
                accessibilityState={{
                  selected,
                }}
                onPress={() =>
                  setTransactionMethod(
                    method.value,
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.methodButton,

                  selected &&
                    styles.methodButtonSelected,

                  pressed &&
                    styles.pressed,
                ]}
              >
                <Ionicons
                  name={
                    method.icon
                  }
                  size={17}
                  color={
                    selected
                      ? colors.primary
                      : colors.textMuted
                  }
                />

                <Text
                  style={[
                    styles.methodText,

                    selected &&
                      styles.methodTextSelected,
                  ]}
                >
                  {method.label}
                </Text>
              </Pressable>
            );
          },
        )}
      </View>

      <FieldLabel
        label="Transaction location"
      />

      <TextInput
        value={locationName}
        onChangeText={
          setLocationName
        }
        placeholder="e.g. Mackay CBD"
        placeholderTextColor={
          colors.textMuted
        }
        style={styles.input}
      />

      <FieldLabel
        label="Date and time"
      />

      <TextInput
        value={scheduledAt}
        onChangeText={
          setScheduledAt
        }
        placeholder="e.g. Saturday 10:30 am"
        placeholderTextColor={
          colors.textMuted
        }
        style={styles.input}
      />

      <FieldLabel
        label="Notes"
        optional
      />

      <TextInput
        value={notes}
        onChangeText={setNotes}
        multiline
        textAlignVertical="top"
        placeholder="Anything both people should know before the transaction."
        placeholderTextColor={
          colors.textMuted
        }
        style={[
          styles.input,
          styles.notesInput,
        ]}
      />

      <View
        style={
          styles.safetyNotice
        }
      >
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={colors.primary}
        />

        <Text
          style={
            styles.safetyText
          }
        >
          Both buyer and seller will
          need to confirm the same
          agreement before it becomes
          confirmed.
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
            name="arrow-forward"
            size={17}
            color="#081006"
          />

          <Text
            style={
              styles.submitText
            }
          >
            Review agreement
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

type FieldLabelProps = {
  label: string;
  optional?: boolean;
};

function FieldLabel({
  label,
  optional = false,
}: FieldLabelProps) {
  return (
    <View
      style={
        styles.fieldLabelRow
      }
    >
      <Text
        style={
          styles.fieldLabel
        }
      >
        {label}
      </Text>

      {optional ? (
        <Text
          style={
            styles.optional
          }
        >
          Optional
        </Text>
      ) : null}
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

      justifyContent:
        'center',
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

      color:
        colors.textMuted,

      fontSize: 10,

      lineHeight: 15,

      fontWeight: '600',
    },

    fieldLabelRow: {
      marginTop: 18,

      marginBottom: 7,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },

    fieldLabel: {
      color: colors.text,

      fontSize: 10,

      fontWeight: '900',
    },

    optional: {
      color:
        colors.textMuted,

      fontSize: 8,

      fontWeight: '700',
    },

    input: {
      minHeight: 48,

      paddingHorizontal: 13,

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.09)',

      backgroundColor:
        'rgba(255, 255, 255, 0.035)',

      color: colors.text,

      fontSize: 12,

      fontWeight: '700',
    },

    priceInput: {
      height: 54,

      paddingHorizontal: 14,

      borderRadius: 15,

      borderWidth: 1,

      borderColor:
        'rgba(158, 246, 90, 0.16)',

      backgroundColor:
        'rgba(158, 246, 90, 0.045)',

      flexDirection: 'row',

      alignItems: 'center',
    },

    currency: {
      color: colors.primary,

      fontSize: 20,

      fontWeight: '900',
    },

    priceTextInput: {
      flex: 1,

      marginLeft: 5,

      color: colors.text,

      fontSize: 20,

      fontWeight: '900',
    },

    currencyCode: {
      color:
        colors.textMuted,

      fontSize: 9,

      fontWeight: '900',
    },

    methodGrid: {
      marginHorizontal: -4,

      flexDirection: 'row',

      flexWrap: 'wrap',
    },

    methodButton: {
      width: '48%',

      height: 45,

      margin: '1%',

      borderRadius: 13,

      borderWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.08)',

      backgroundColor:
        'rgba(255, 255, 255, 0.025)',

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'center',
    },

    methodButtonSelected: {
      borderColor:
        'rgba(158, 246, 90, 0.22)',

      backgroundColor:
        'rgba(158, 246, 90, 0.07)',
    },

    methodText: {
      marginLeft: 6,

      color:
        colors.textMuted,

      fontSize: 9,

      fontWeight: '800',
    },

    methodTextSelected: {
      color: colors.primary,
    },

    notesInput: {
      minHeight: 86,

      paddingTop: 12,
    },

    safetyNotice: {
      marginTop: 16,

      padding: 11,

      borderRadius: 13,

      backgroundColor:
        'rgba(158, 246, 90, 0.045)',

      flexDirection: 'row',

      alignItems: 'flex-start',
    },

    safetyText: {
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
      color: colors.text,

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