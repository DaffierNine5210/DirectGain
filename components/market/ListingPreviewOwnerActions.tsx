import { StyleSheet, Text, View } from 'react-native';

import DGButton from '../DGButton';

import {
  alpha,
  palette,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

type ListingPreviewOwnerActionsProps = {
  status: 'draft' | 'active';
  isPublishing: boolean;
  photoCount: number;
  onListItem: () => void;
  onDone: () => void;
};

export default function ListingPreviewOwnerActions({
  status,
  isPublishing,
  photoCount,
  onListItem,
  onDone,
}: ListingPreviewOwnerActionsProps) {
  if (status === 'active') {
    return (
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Listed</Text>
        <Text style={styles.title}>Your listing is active</Text>
        <Text style={styles.body}>
          Your listing has been published successfully. Direct
          Gain’s live Market feed will be connected in the next
          Market step.
        </Text>
        <DGButton
          title="Done"
          fullWidth
          onPress={onDone}
          accessibilityLabel="Done"
          accessibilityHint="Returns to Create."
        />
      </View>
    );
  }

  const photoHint =
    photoCount < 1
      ? 'Add at least one photo before listing.'
      : 'You will confirm before this listing becomes active.';

  const listEnabled = !isPublishing;

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Preview</Text>
      <Text style={styles.title}>This listing is not live yet</Text>
      <Text style={styles.body}>
        This is how your listing will appear. It is not on the Market.
      </Text>
      <DGButton
        title={isPublishing ? 'Listing…' : 'List item'}
        fullWidth
        disabled={!listEnabled}
        loading={isPublishing}
        onPress={listEnabled ? onListItem : undefined}
        accessibilityLabel="List item"
        accessibilityHint={photoHint}
      />
      <Text style={styles.hint}>{photoHint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    padding: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: alpha.green20,
    backgroundColor: surface.cardRaised,
    gap: spacing.sm,
  },

  eyebrow: {
    color: palette.opportunityGreen,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  title: {
    color: textColor.primary,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
  },

  body: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },

  hint: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
});
