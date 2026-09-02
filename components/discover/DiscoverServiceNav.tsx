import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  alpha,
  motion,
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

type DiscoverServiceNavProps = {
  onJobsPress: () => void;
};

export default function DiscoverServiceNav({
  onJobsPress,
}: DiscoverServiceNavProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Jobs, find work near you"
        onPress={onJobsPress}
        style={({ pressed }) => [
          styles.jobsAction,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.icon}>
          <Ionicons
            name="briefcase-outline"
            size={18}
            color={textColor.inverse}
          />
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>
            Jobs
          </Text>

          <Text
            numberOfLines={1}
            style={styles.subtitle}
          >
            Find work near you
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={16}
          color={textColor.muted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },

  jobsAction: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.green16,
    backgroundColor: surface.cardRaised,
  },

  pressed: {
    opacity: 0.86,
    transform: [
      {
        scale: motion.pressedScale,
      },
    ],
  },

  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: palette.opportunityGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },

  copy: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing.sm,
  },

  title: {
    color: textColor.primary,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
    letterSpacing: -0.2,
  },

  subtitle: {
    marginTop: 1,
    color: textColor.secondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
