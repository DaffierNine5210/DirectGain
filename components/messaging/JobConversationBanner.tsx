import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';

type Props = {
  title: string;
  payLabel?: string;
  statusLabel?: string;
  onViewJob?: () => void;
};

export default function JobConversationBanner({
  title,
  payLabel,
  statusLabel,
  onViewJob,
}: Props) {
  const meta = [payLabel, statusLabel]
    .filter((value): value is string => Boolean(value))
    .join(' · ');

  return (
    <Pressable
      accessibilityRole={onViewJob ? 'button' : undefined}
      accessibilityLabel={
        onViewJob
          ? `View job ${title}`
          : title
      }
      onPress={onViewJob}
      disabled={!onViewJob}
      style={({ pressed }) => [
        styles.container,
        onViewJob && pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons
          name="briefcase-outline"
          size={16}
          color={colors.primary}
        />
      </View>

      <View style={styles.copy}>
        <Text
          style={styles.title}
          numberOfLines={1}
        >
          {title}
        </Text>

        {meta ? (
          <Text
            style={styles.meta}
            numberOfLines={1}
          >
            {meta}
          </Text>
        ) : null}
      </View>

      {onViewJob ? (
        <Text style={styles.action}>
          View job
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.14)',
    backgroundColor: 'rgba(158, 246, 90, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconWrap: {
    width: 32,
    height: 32,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  copy: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },

  meta: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },

  action: {
    marginLeft: 8,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.78,
  },
});
