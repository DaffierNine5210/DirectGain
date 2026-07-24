import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { colors } from '../theme/colors';

type DGSectionProps = {
  title: string;
  children: ReactNode;

  subtitle?: string;
  eyebrow?: string;

  actionLabel?: string;
  onActionPress?: () => void;

  contentSpacing?: number;
  style?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export default function DGSection({
  title,
  children,

  subtitle,
  eyebrow,

  actionLabel,
  onActionPress,

  contentSpacing = 14,
  style,
  headerStyle,
  contentStyle,
}: DGSectionProps) {
  const showAction = Boolean(actionLabel && onActionPress);

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.header, headerStyle]}>
        <View style={styles.titleArea}>
          {eyebrow ? (
            <Text
              numberOfLines={1}
              style={styles.eyebrow}
            >
              {eyebrow}
            </Text>
          ) : null}

          <Text
            numberOfLines={1}
            style={styles.title}
          >
            {title}
          </Text>

          {subtitle ? (
            <Text
              numberOfLines={2}
              style={styles.subtitle}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {showAction ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${actionLabel} for ${title}`}
            hitSlop={8}
            onPress={onActionPress}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
            ]}
          >
            <Text
              numberOfLines={1}
              style={styles.actionLabel}
            >
              {actionLabel}
            </Text>

            <Ionicons
              name="chevron-forward"
              size={15}
              color={colors.primary}
            />
          </Pressable>
        ) : null}
      </View>

      <View
        style={[
          styles.content,
          {
            marginTop: contentSpacing,
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  header: {
    width: '100%',
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  titleArea: {
    flex: 1,
    minWidth: 0,
    paddingRight: 14,
  },

  eyebrow: {
    marginBottom: 4,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  title: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.45,
  },

  subtitle: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },

  actionButton: {
    minHeight: 36,
    maxWidth: 120,
    paddingHorizontal: 11,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionLabel: {
    maxWidth: 82,
    marginRight: 3,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },

  content: {
    width: '100%',
  },

  pressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },
});