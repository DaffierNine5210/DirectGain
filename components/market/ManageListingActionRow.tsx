import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  alpha,
  iconSize,
  radius,
  spacing,
  textColor,
} from '../../theme/designSystem';

type ManageListingActionRowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  unavailable?: boolean;
  onPress?: () => void;
};

export default function ManageListingActionRow({
  icon,
  title,
  unavailable = false,
  onPress,
}: ManageListingActionRowProps) {
  const tappable = Boolean(onPress) && !unavailable;
  const accessibilityLabel = unavailable
    ? `${title}, unavailable`
    : title;

  const body = (
    <>
      <View
        style={[
          styles.iconWrap,
          unavailable && styles.iconWrapUnavailable,
        ]}
      >
        <Ionicons
          name={icon}
          size={iconSize.sm}
          color={
            unavailable
              ? textColor.secondary
              : textColor.primary
          }
        />
      </View>

      <Text
        style={[
          styles.title,
          unavailable && styles.titleUnavailable,
        ]}
      >
        {title}
      </Text>

      {tappable ? (
        <Ionicons
          name="chevron-forward"
          size={iconSize.sm}
          color={textColor.muted}
        />
      ) : null}
    </>
  );

  if (tappable) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          pressed && styles.pressed,
        ]}
      >
        {body}
      </Pressable>
    );
  }

  return (
    <View
      accessibilityRole="text"
      accessibilityState={{
        disabled: unavailable,
      }}
      accessibilityLabel={accessibilityLabel}
      style={styles.row}
    >
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },

  pressed: {
    opacity: 0.86,
  },

  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: alpha.white08,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconWrapUnavailable: {
    backgroundColor: alpha.white05,
  },

  title: {
    flex: 1,
    color: textColor.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },

  titleUnavailable: {
    color: textColor.secondary,
  },
});
