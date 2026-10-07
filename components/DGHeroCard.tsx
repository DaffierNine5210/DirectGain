import {
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import DGAvatar from './DGAvatar';
import DGButton from './DGButton';
import DGCard from './DGCard';

import {
  layout,
  spacing,
  textColor,
} from '../theme/designSystem';

type DGHeroCardProps = {
  greeting: string;
  supportingCopy: string;
  initials: string;
  avatarImage?: ImageSourcePropType;
  ctaTitle: string;
  onPress?: () => void;
};

export default function DGHeroCard({
  greeting,
  supportingCopy,
  initials,
  avatarImage,
  ctaTitle,
  onPress,
}: DGHeroCardProps) {
  return (
    <DGCard
      variant="raised"
      contentStyle={styles.cardContent}
    >
      <View style={styles.container}>
        <View
          pointerEvents="none"
          style={styles.ambientGlow}
        />

        <View style={styles.identityRow}>
          <DGAvatar
            image={avatarImage}
            initials={initials}
            size="lg"
          />

          <View style={styles.identityCopy}>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              numberOfLines={1}
              style={styles.greeting}
            >
              {greeting}
            </Text>
          </View>
        </View>

        <Text style={styles.supportingCopy}>
          {supportingCopy}
        </Text>

        <DGButton
          title={ctaTitle}
          icon="arrow-forward"
          iconPosition="right"
          fullWidth
          style={styles.button}
          onPress={onPress}
        />
      </View>
    </DGCard>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    padding: 0,
  },

  container: {
    position: 'relative',
    padding: spacing.lg,
    overflow: 'hidden',
  },

  ambientGlow: {
    position: 'absolute',
    top: -110,
    right: -90,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(255, 255, 255, 0.018)',
  },

  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  identityCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing.md,
    paddingRight: spacing.xs,
  },

  greeting: {
    color: textColor.primary,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    letterSpacing: -0.45,
  },

  supportingCopy: {
    marginTop: spacing.lg,
    color: textColor.secondary,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },

  button: {
    marginTop: layout.componentGap,
  },
});
