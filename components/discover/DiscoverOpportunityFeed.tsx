import {
  StyleSheet,
  View,
} from 'react-native';

import DiscoverJobsPreview, {
  type DiscoverJobsPreviewStatus,
} from '../DiscoverJobsPreview';
import DiscoverMarketPreview, {
  type DiscoverMarketPreviewStatus,
} from '../DiscoverMarketPreview';
import DGButton from '../DGButton';
import DGExpandableSection from '../DGExpandableSection';
import DGReveal from '../DGReveal';

import type { MarketFeedCardPresentation } from '../../services/market/marketFeedPresentation';
import type { Job, JobCoverPresentation } from '../../types/jobs';

import {
  spacing,
} from '../../theme/designSystem';

export type DiscoverSectionKey =
  | 'market'
  | 'auctions'
  | 'overview'
  | null;

type DiscoverOpportunityFeedProps = {
  marketStatus: DiscoverMarketPreviewStatus;
  marketCards: MarketFeedCardPresentation[];
  marketErrorMessage?: string | null;
  marketBadgeText?: string;
  onMarketRetry: () => void;

  jobsSectionExpanded: boolean;
  onJobsSectionChange: (expanded: boolean) => void;
  jobsStatus: DiscoverJobsPreviewStatus;
  jobs: Job[];
  jobCovers: Record<string, JobCoverPresentation>;
  jobsErrorMessage?: string | null;
  onJobsRetry: () => void;
  onJobPress: (jobId: string) => void;
  onBrowseJobsPress: () => void;
  jobsFilterActive?: boolean;

  marketFilterActive?: boolean;

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

  onMarketPress: () => void;

  onListingPress: (
    listingId: string,
  ) => void;
};

export default function DiscoverOpportunityFeed({
  marketStatus,
  marketCards,
  marketErrorMessage,
  marketBadgeText,
  onMarketRetry,

  jobsSectionExpanded,
  onJobsSectionChange,
  jobsStatus,
  jobs,
  jobCovers,
  jobsErrorMessage,
  onJobsRetry,
  onJobPress,
  onBrowseJobsPress,
  jobsFilterActive = false,

  marketFilterActive = false,

  expandedSection,
  onSectionChange,

  onMarketPress,
  onListingPress,
}: DiscoverOpportunityFeedProps) {
  return (
    <View style={styles.container}>
      <DGReveal
        delay={165}
        duration={430}
        distance={10}
      >
        <DGExpandableSection
          eyebrow="On the Market"
          title="Market opportunities"
          subtitle="Active listings you can open now."
          icon="storefront-outline"
          badgeText={marketBadgeText}
          expanded={
            expandedSection ===
            'market'
          }
          onExpandedChange={(
            expanded,
          ) => {
            onSectionChange(
              'market',
              expanded,
            );
          }}
          contentStyle={
            styles.marketContent
          }
        >
          <DiscoverMarketPreview
            status={marketStatus}
            cards={marketCards}
            errorMessage={marketErrorMessage}
            filterActive={marketFilterActive}
            onListingPress={onListingPress}
            onRetry={onMarketRetry}
          />

          <DGButton
            title="Browse the Market"
            icon="arrow-forward"
            iconPosition="right"
            variant="outline"
            fullWidth
            style={
              styles.sectionAction
            }
            onPress={
              onMarketPress
            }
          />
        </DGExpandableSection>
      </DGReveal>

      <DGReveal
        delay={190}
        duration={430}
        distance={10}
        style={
          styles.sectionSpacing
        }
      >
        <DGExpandableSection
          eyebrow="Work"
          title="Open jobs"
          subtitle="Jobs you can apply for now."
          icon="briefcase-outline"
          expanded={jobsSectionExpanded}
          onExpandedChange={onJobsSectionChange}
          contentStyle={
            styles.jobsContent
          }
        >
          <DiscoverJobsPreview
            status={jobsStatus}
            jobs={jobs}
            covers={jobCovers}
            errorMessage={jobsErrorMessage}
            filterActive={jobsFilterActive}
            onJobPress={onJobPress}
            onRetry={onJobsRetry}
          />

          <DGButton
            title="Find work"
            icon="arrow-forward"
            iconPosition="right"
            variant="outline"
            fullWidth
            style={
              styles.sectionAction
            }
            onPress={
              onBrowseJobsPress
            }
          />
        </DGExpandableSection>
      </DGReveal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: spacing.md,

    paddingHorizontal:
      spacing.lg,
  },

  sectionSpacing: {
    marginTop:
      spacing.md,
  },

  marketContent: {
    paddingHorizontal: 0,
  },

  jobsContent: {
    paddingHorizontal: 0,
  },

  sectionAction: {
    marginTop:
      spacing.sm,
  },
});
