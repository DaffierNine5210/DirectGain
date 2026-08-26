import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import DGAvatar from './DGAvatar';
import DGButton from './DGButton';
import DGCard from './DGCard';

import {
  alpha,
  layout,
  palette,
  radius,
  spacing,
  textColor,
  typography,
} from '../theme/designSystem';

type DGHeroCardProps = {
  greeting: string;
  location: string;

  opportunities: number;
  listings: number;
  jobs: number;
  auctions: number;

  onPress?: () => void;
};

export default function DGHeroCard({
  greeting,
  location,

  opportunities,
  listings,
  jobs,
  auctions,

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
            initials="LG"
            size="lg"
            verified
            gainScore={94}
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
              

            <View style={styles.trustRow}>
              <Text style={styles.trustLabel}>
                Gain Score
              </Text>

              <Text style={styles.trustScore}>
                94
              </Text>

              <View style={styles.trustDivider} />

              <Text
                numberOfLines={1}
                style={styles.trustStatus}
              >
                Trusted Member
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.opportunityBlock}>
          <Text style={styles.opportunityNumber}>
            {opportunities}
          </Text>

          <Text style={styles.opportunityLabel}>
            opportunities nearby today
          </Text>
        </View>

        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={15}
            color={textColor.muted}
          />

          <Text
            numberOfLines={1}
            style={styles.location}
          >
            {location}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stats}>
          <HeroStat
            icon="storefront-outline"
            value={listings}
            label="Listings"
          />

          <View style={styles.statDivider} />

          <HeroStat
            icon="briefcase-outline"
            value={jobs}
            label="Jobs"
          />

          <View style={styles.statDivider} />

          <HeroStat
            icon="hammer-outline"
            value={auctions}
            label="Auctions"
          />
        </View>

        <DGButton
          title="Explore Opportunities"
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

type HeroStatProps = {
  icon: React.ComponentProps<
    typeof Ionicons
  >['name'];

  value: number;
  label: string;
};

function HeroStat({
  icon,
  value,
  label,
}: HeroStatProps) {
  return (
    <View style={styles.stat}>
      <View style={styles.statIcon}>
        <Ionicons
          name={icon}
          size={17}
          color={textColor.secondary}
        />
      </View>

      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
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

    backgroundColor:
      'rgba(255, 255, 255, 0.018)',
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

    fontSize: 20,
    lineHeight: 24,

    fontWeight: '900',

    letterSpacing: -0.45,
  },

  trustRow: {
    minHeight: 20,

    marginTop: spacing.xs,

    flexDirection: 'row',
    alignItems: 'center',

    flexWrap: 'wrap',
  },

  trustLabel: {
    color: textColor.secondary,

    fontSize: 11,
    lineHeight: 15,

    fontWeight: '700',
  },

  trustScore: {
    marginLeft: 5,

    color: palette.opportunityGreen,

    fontSize: 12,
    lineHeight: 16,

    fontWeight: '900',
  },

  trustDivider: {
    width: 3,
    height: 3,

    marginHorizontal: 8,

    borderRadius: 2,

    backgroundColor:
      alpha.white08,
  },

  trustStatus: {
    flexShrink: 1,

    color: textColor.muted,

    fontSize: 11,
    lineHeight: 15,

    fontWeight: '600',
  },

  opportunityBlock: {
    marginTop: spacing.xl,
  },

  opportunityNumber: {
    color: palette.opportunityGreen,

    fontSize: 34,
    lineHeight: 38,

    fontWeight: '900',

    letterSpacing: -1,
  },

  opportunityLabel: {
    marginTop: 2,

    color: textColor.primary,

    fontSize: 17,
    lineHeight: 22,

    fontWeight: '800',

    letterSpacing: -0.25,
  },

  locationRow: {
    marginTop: spacing.sm,

    flexDirection: 'row',
    alignItems: 'center',
  },

  location: {
    flexShrink: 1,

    marginLeft: spacing.xs,

    color: textColor.muted,

    ...typography.bodySmall,
  },

  divider: {
    height: 1,

    marginVertical:
      layout.componentGap,

    backgroundColor:
      alpha.white08,
  },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stat: {
    flex: 1,

    alignItems: 'center',
  },

  statDivider: {
    width: 1,
    height: 54,

    backgroundColor:
      alpha.white08,
  },

  statIcon: {
    width: 34,
    height: 34,

    borderRadius: radius.sm,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      'rgba(255, 255, 255, 0.025)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    marginTop: spacing.xs,

    color: textColor.primary,

    fontSize: 19,
    lineHeight: 23,

    fontWeight: '900',

    letterSpacing: -0.35,
  },

  statLabel: {
    marginTop: 2,

    color: textColor.muted,

    fontSize: 10,
    lineHeight: 14,

    fontWeight: '700',
  },

  button: {
    marginTop:
      layout.componentGap,
  },
});