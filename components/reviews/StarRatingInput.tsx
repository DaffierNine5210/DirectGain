import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { selectionHaptic } from '../../utils/haptics';

import {
  alpha,
  iconSize,
  palette,
  radius,
  spacing,
  textColor,
} from '../../theme/designSystem';

const RATINGS = [1, 2, 3, 4, 5] as const;

type StarRatingInputProps = {
  value: number | null;
  onChange: (rating: number) => void;
  disabled?: boolean;
};

function ratingLabel(rating: number): string {
  return rating === 1 ? '1 star' : `${rating} stars`;
}

export default function StarRatingInput({
  value,
  onChange,
  disabled = false,
}: StarRatingInputProps) {
  return (
    <View>
      <View
        style={styles.row}
        accessibilityRole="adjustable"
        accessibilityLabel="Rating"
        accessibilityValue={{
          text: value ? ratingLabel(value) : 'No rating selected',
        }}
      >
        {RATINGS.map(rating => {
          const selected = value != null && rating <= value;
          const current = value === rating;

          return (
            <Pressable
              key={rating}
              disabled={disabled}
              onPress={() => {
                void selectionHaptic();
                onChange(rating);
              }}
              style={({ pressed }) => [
                styles.starButton,
                pressed && !disabled && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={ratingLabel(rating)}
              accessibilityState={{
                selected: current,
                disabled,
              }}
              accessibilityHint="Sets your review rating"
            >
              <Ionicons
                name={selected ? 'star' : 'star-outline'}
                size={iconSize.xl}
                color={
                  selected
                    ? palette.opportunityGreen
                    : textColor.muted
                }
              />
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.valueLabel}>
        {value ? ratingLabel(value) : 'Select a rating'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },

  starButton: {
    flex: 1,
    minHeight: 48,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: alpha.white04,
  },

  pressed: {
    opacity: 0.8,
  },

  valueLabel: {
    marginTop: spacing.sm,
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});
