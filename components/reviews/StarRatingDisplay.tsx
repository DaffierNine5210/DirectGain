import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import {
  iconSize,
  palette,
  textColor,
} from '../../theme/designSystem';

type StarRatingDisplaySize = 'sm' | 'md';

type StarRatingDisplayProps = {
  rating: number;
  size?: StarRatingDisplaySize;
};

const STAR_SIZES: Record<StarRatingDisplaySize, number> = {
  sm: iconSize.sm,
  md: iconSize.md,
};

function clampRating(rating: number): number {
  if (!Number.isFinite(rating)) {
    return 1;
  }

  return Math.min(5, Math.max(1, Math.round(rating)));
}

export default function StarRatingDisplay({
  rating,
  size = 'md',
}: StarRatingDisplayProps) {
  const filled = clampRating(rating);
  const iconDimension = STAR_SIZES[size];

  return (
    <View
      style={styles.row}
      accessibilityRole="image"
      accessibilityLabel={`${filled} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map(star => (
        <Ionicons
          key={star}
          name={star <= filled ? 'star' : 'star-outline'}
          size={iconDimension}
          color={
            star <= filled
              ? palette.opportunityGreen
              : textColor.muted
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
