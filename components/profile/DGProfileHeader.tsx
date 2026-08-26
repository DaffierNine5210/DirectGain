import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import {
  alpha,
  iconSize,
  motion,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

type HeaderIconName =
  React.ComponentProps<typeof Ionicons>['name'];

type ProfileHeaderAction = {
  icon: HeaderIconName;
  accessibilityLabel: string;
  onPress: () => void;
};

type DGProfileHeaderProps = {
  title?: string;
  eyebrow?: string;

  onBackPress: () => void;

  primaryAction?: ProfileHeaderAction;
  secondaryAction?: ProfileHeaderAction;

  style?: StyleProp<ViewStyle>;
};

export default function DGProfileHeader({
  title = 'Gain Profile',
  eyebrow = 'DIRECT GAIN',

  onBackPress,

  primaryAction,
  secondaryAction,

  style,
}: DGProfileHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftSection}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          onPress={onBackPress}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={iconSize.lg}
            color={textColor.primary}
          />
        </Pressable>

        <View style={styles.brandMark}>
          <Ionicons
            name="trending-up"
            size={19}
            color={textColor.secondary}
          />

          <View style={styles.brandStatusDot} />
        </View>

        <View style={styles.titleArea}>
          <Text
            numberOfLines={1}
            style={styles.eyebrow}
          >
            {eyebrow}
          </Text>

          <Text
            numberOfLines={1}
            style={styles.title}
          >
            {title}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {secondaryAction ? (
          <HeaderActionButton
            action={secondaryAction}
          />
        ) : null}

        {primaryAction ? (
          <HeaderActionButton
            action={primaryAction}
          />
        ) : null}
      </View>
    </View>
  );
}

type HeaderActionButtonProps = {
  action: ProfileHeaderAction;
};

function HeaderActionButton({
  action,
}: HeaderActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        action.accessibilityLabel
      }
      hitSlop={8}
      onPress={action.onPress}
      style={({ pressed }) => [
        styles.iconButton,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={action.icon}
        size={20}
        color={textColor.primary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',

    minHeight: 72,

    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,

    borderBottomWidth: 1,
    borderBottomColor: alpha.white08,

    backgroundColor:
      'rgba(5, 8, 6, 0.96)',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  leftSection: {
    flex: 1,
    minWidth: 0,

    flexDirection: 'row',
    alignItems: 'center',
  },

  iconButton: {
    width: 44,
    height: 44,

    borderRadius: radius.md,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor: surface.cardSoft,

    alignItems: 'center',
    justifyContent: 'center',
  },

  brandMark: {
    position: 'relative',

    width: 44,
    height: 44,

    marginLeft: spacing.xs,
    marginRight: spacing.sm,

    borderRadius: radius.md,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      'rgba(255, 255, 255, 0.025)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  brandStatusDot: {
    position: 'absolute',

    right: 6,
    bottom: 6,

    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: '#9EF65A',

    shadowColor: '#9EF65A',
    shadowOpacity: 0.32,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  titleArea: {
    flex: 1,
    minWidth: 0,
  },

  eyebrow: {
    ...typography.eyebrow,

    color: textColor.muted,
  },

  title: {
    marginTop: 3,

    color: textColor.primary,

    fontSize: 18,
    lineHeight: 23,

    fontWeight: '900',

    letterSpacing: -0.35,
  },

  actions: {
    marginLeft: spacing.sm,

    flexDirection: 'row',
    alignItems: 'center',

    gap: spacing.xs,
  },

  pressed: {
    opacity: 0.78,

    transform: [
      {
        scale: motion.iconPressedScale,
      },
    ],
  },
});