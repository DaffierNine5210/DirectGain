import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import DGButton from '../DGButton';
import DGCard from '../DGCard';
import DGReveal from '../DGReveal';

import {
  palette,
  radius,
  spacing,
  textColor,
  typography,
} from '../../theme/designSystem';

type DiscoverCreateSectionProps = {
  onPress: () => void;
};

export default function DiscoverCreateSection({
  onPress,
}: DiscoverCreateSectionProps) {
  return (
    <DGReveal
      delay={365}
      duration={470}
      distance={10}
      style={styles.container}
    >
      <DGCard
        variant="raised"
        contentStyle={styles.content}
      >
        <View style={styles.topRow}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="arrow-up"
              size={22}
              color={textColor.inverse}
            />
          </View>

          <View style={styles.copy}>
            <Text style={styles.eyebrow}>
              GROW TOGETHER
            </Text>

            <Text style={styles.title}>
              Create an opportunity
            </Text>
          </View>
        </View>

        <Text style={styles.description}>
          Sell an item, find work, start an auction or share locally.
        </Text>

        <DGButton
          title="Create"
          icon="add"
          fullWidth
          onPress={onPress}
        />
      </DGCard>
    </DGReveal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },

  content: {
    padding: spacing.lg,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: 48,
    height: 48,
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

  eyebrow: {
    ...typography.eyebrow,
    color: palette.opportunityGreen,
  },

  title: {
    marginTop: 3,
    color: textColor.primary,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900',
    letterSpacing: -0.35,
  },

  description: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
});