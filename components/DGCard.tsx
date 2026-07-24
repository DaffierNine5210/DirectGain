import { ReactNode } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { colors } from '../theme/colors';

type DGCardVariant = 'default' | 'raised' | 'outlined' | 'soft';

type DGCardProps = {
  children: ReactNode;
  variant?: DGCardVariant;
  pressable?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

export default function DGCard({
  children,
  variant = 'default',
  pressable = false,
  disabled = false,
  onPress,
  style,
  contentStyle,
  testID,
}: DGCardProps) {
  const cardStyles = [
    styles.card,
    variant === 'default' && styles.defaultCard,
    variant === 'raised' && styles.raisedCard,
    variant === 'outlined' && styles.outlinedCard,
    variant === 'soft' && styles.softCard,
    disabled && styles.disabledCard,
    style,
  ];

  const content = (
    <View style={[styles.content, contentStyle]}>
      {children}
    </View>
  );

  if (pressable || onPress) {
    return (
      <Pressable
        testID={testID}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          cardStyles,
          pressed && !disabled && styles.pressedCard,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View testID={testID} style={cardStyles}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },

  content: {
    width: '100%',
    padding: 18,
  },

  defaultCard: {
    backgroundColor: colors.cardRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },

  raisedCard: {
    backgroundColor: colors.cardRaised,
    borderWidth: 1,
    borderColor: colors.border,

    shadowColor: colors.cardShadow,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 8,
  },

  outlinedCard: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },

  softCard: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  pressedCard: {
    opacity: 0.92,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  disabledCard: {
    opacity: 0.5,
  },
});