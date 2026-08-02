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
    <DGCard variant="raised">
      <View style={styles.container}>
        <View style={styles.glow} />

        <View style={styles.heroTopRow}>
          <DGAvatar
            initials="LG"
            size="lg"
            verified
            gainScore={94}
          />

          <View style={styles.heroUserInfo}>
            <Text style={styles.greeting}>
              {greeting}
            </Text>

            <Text style={styles.heroSubtitle}>
              Gain Score 94 • Trusted Member
            </Text>
          </View>
        </View>

        <Text style={styles.opportunities}>
          {opportunities} opportunities nearby today
        </Text>

        <View style={styles.locationRow}>
          <Ionicons
            name="location"
            size={16}
            color={palette.opportunityGreen}
          />

          <Text style={styles.location}>
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

        <View style={styles.button}>
          <DGButton
            title="Explore Opportunities"
            icon="arrow-forward"
            iconPosition="right"
            fullWidth
            onPress={onPress}
          />
        </View>
      </View>
    </DGCard>
  );
}

type HeroStatProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
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
          size={18}
          color={palette.opportunityGreen}
        />
      </View>

      <Text style={styles.value}>
        {value}
      </Text>

      <Text style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },

  glow: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: alpha.green06,
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  heroUserInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing.md,
  },

  greeting: {
    ...typography.headingMedium,
    color: textColor.primary,
  },

  heroSubtitle: {
    marginTop: spacing.xxs,
    color: palette.opportunityGreen,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },

  opportunities: {
    ...typography.bodyLarge,
    color: palette.opportunityGreen,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },

  location: {
    marginLeft: spacing.xs,
    color: textColor.secondary,
    ...typography.bodyMedium,
  },

  divider: {
    marginVertical: layout.componentGap,
    height: 1,
    backgroundColor: alpha.white08,
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
    height: 58,
    backgroundColor: alpha.white08,
  },

  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.green08,
  },

  value: {
    marginTop: spacing.xs,
    ...typography.headingMedium,
    color: textColor.primary,
  },

  label: {
    marginTop: 2,
    ...typography.labelMedium,
    color: textColor.secondary,
  },

  button: {
    marginTop: layout.componentGap,
  },
});