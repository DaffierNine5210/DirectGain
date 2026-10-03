import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

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
};

export default function ManageListingActionRow({
  icon,
  title,
  unavailable = false,
}: ManageListingActionRowProps) {
  return (
    <View
      accessibilityRole="text"
      accessibilityState={{
        disabled: unavailable,
      }}
      accessibilityLabel={
        unavailable ? `${title}, unavailable` : title
      }
      style={styles.row}
    >
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
