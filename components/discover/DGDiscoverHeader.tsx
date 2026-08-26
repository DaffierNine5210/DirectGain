import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  alpha,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

type Props = {
  greeting: string;
  location: string;

  onLocationPress?: () => void;
  onNotificationsPress?: () => void;
};

export default function DGDiscoverHeader({
  greeting,
  location,
  onLocationPress,
  onNotificationsPress,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>
            {greeting}
          </Text>

          <Text style={styles.subtitle}>
            Discover opportunities near you.
          </Text>
        </View>

        <Pressable
          onPress={onNotificationsPress}
          style={styles.notificationButton}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={textColor.primary}
          />
        </Pressable>
      </View>

      <Pressable
        onPress={onLocationPress}
        style={styles.location}
      >
        <Ionicons
          name="location"
          size={16}
          color="#9EF65A"
        />

        <Text style={styles.locationText}>
          {location}
        </Text>

        <Ionicons
          name="chevron-down"
          size={14}
          color={textColor.muted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  greeting: {
    color: textColor.primary,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 4,
    color: textColor.secondary,
    fontSize: 14,
    fontWeight: '600',
  },

  notificationButton: {
    width: 48,
    height: 48,

    borderRadius: radius.md,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor: surface.cardSoft,

    alignItems: 'center',
    justifyContent: 'center',
  },

  location: {
    marginTop: spacing.md,

    alignSelf: 'flex-start',

    minHeight: 38,

    paddingHorizontal: spacing.md,

    borderRadius: radius.pill,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor: surface.cardSoft,

    flexDirection: 'row',
    alignItems: 'center',
  },

  locationText: {
    marginHorizontal: 8,

    color: textColor.secondary,

    fontSize: 13,
    fontWeight: '700',
  },
});