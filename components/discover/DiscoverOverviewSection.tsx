import {
  StyleSheet,
  View,
} from 'react-native';

import DGExpandableSection from '../DGExpandableSection';
import DGReveal from '../DGReveal';
import RegionSummaryCard from '../RegionSummaryCard';
import TrustCard from '../TrustCard';

import type {
  RegionSummaryItem,
} from '../../data/discoverMockData';

import {
  spacing,
} from '../../theme/designSystem';

import type {
  DiscoverSectionKey,
} from './DiscoverOpportunityFeed';

type DiscoverOverviewSectionProps = {
  regionName: string;

  items:
    RegionSummaryItem[];

  gainScore: number;

  identityVerified?: boolean;
  professionalVerified?: boolean;
  communityTrusted?: boolean;

  expandedSection:
    DiscoverSectionKey;

  onSectionChange: (
    section:
      Exclude<
        DiscoverSectionKey,
        null
      >,
    expanded: boolean,
  ) => void;
};

export default function DiscoverOverviewSection({
  regionName,

  items,

  gainScore,

  identityVerified = false,
  professionalVerified = false,
  communityTrusted = false,

  expandedSection,
  onSectionChange,
}: DiscoverOverviewSectionProps) {
  return (
    <DGReveal
      delay={315}
      duration={460}
      distance={10}
      style={styles.container}
    >
      <DGExpandableSection
        eyebrow="Your region"
        title="Local overview"
        subtitle="Regional activity and your current trust standing."
        icon="location-outline"
        badgeText={
          regionName.toUpperCase()
        }
        expanded={
          expandedSection ===
          'overview'
        }
        onExpandedChange={(
          expanded,
        ) => {
          onSectionChange(
            'overview',
            expanded,
          );
        }}
      >
        <View
          style={styles.content}
        >
          <RegionSummaryCard
            regionName={
              regionName
            }
            items={items}
          />

          <TrustCard
            gainScore={
              gainScore
            }
            identityVerified={
              identityVerified
            }
            professionalVerified={
              professionalVerified
            }
            communityTrusted={
              communityTrusted
            }
          />
        </View>
      </DGExpandableSection>
    </DGReveal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',

    marginTop:
      spacing.md,

    paddingHorizontal:
      spacing.lg,
  },

  content: {
    width: '100%',

    gap:
      spacing.sm,
  },
});