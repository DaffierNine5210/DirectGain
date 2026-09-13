import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import ProfessionalExperience from './ProfessionalExperience';
import ProfessionalOverview from './ProfessionalOverview';
import ProfessionalPortfolio from './ProfessionalPortfolio';
import ProfessionalProfileHero from './ProfessionalProfileHero';
import ProfessionalProfileTabs, {
  DEFAULT_PROFESSIONAL_TAB,
  type ProfessionalProfileTabKey,
} from './ProfessionalProfileTabs';
import ProfessionalReviews from './ProfessionalReviews';

import type { PresentedProfileReview } from '../profilePresentation';

import type { DirectGainProfile } from '../../../types/profile';
import type { ProfessionalProfileCore } from '../../../types/professionalProfile';
import type { ProfileReviewStats } from '../../../types/reviews';

import { layout, spacing } from '../../../theme/designSystem';

type ProfessionalProfileViewProps = {
  profile: DirectGainProfile;
  professional: ProfessionalProfileCore | null;
  professionalError: string | null;
  onRetryProfessional: () => void;
  onEditProfessional: () => void;
  avatarUrl?: string | null;
  avatarUnavailable?: boolean;
  reviews: PresentedProfileReview[];
  stats: ProfileReviewStats | null;
  statsError: string | null;
  statsLoading: boolean;
  reviewsLoading: boolean;
  reviewsError: string | null;
  onRetryReviews: () => void;
  onPressReviewer: (profileId: string) => void;
};

export default function ProfessionalProfileView({
  profile,
  professional,
  professionalError,
  onRetryProfessional,
  onEditProfessional,
  avatarUrl = null,
  avatarUnavailable = false,
  reviews,
  stats,
  statsError,
  statsLoading,
  reviewsLoading,
  reviewsError,
  onRetryReviews,
  onPressReviewer,
}: ProfessionalProfileViewProps) {
  const [selectedTab, setSelectedTab] =
    useState<ProfessionalProfileTabKey>(
      DEFAULT_PROFESSIONAL_TAB,
    );

  const headline = professionalError
    ? null
    : professional?.headline ?? null;
  const serviceArea = professionalError
    ? null
    : professional?.serviceArea ?? null;

  return (
    <View style={styles.root}>
      <ProfessionalProfileHero
        displayName={profile.displayName}
        headline={headline}
        serviceArea={serviceArea}
        hasStoredPhoto={Boolean(profile.avatarPath)}
        avatarUrl={avatarUrl}
        avatarUnavailable={avatarUnavailable}
        stats={stats}
      />

      <ProfessionalProfileTabs
        selectedTab={selectedTab}
        onSelectTab={setSelectedTab}
      />

      <View style={styles.panel}>
        {selectedTab === 'overview' ? (
          <ProfessionalOverview
            professional={professional}
            professionalError={professionalError}
            onRetryProfessional={onRetryProfessional}
            onEditProfessional={onEditProfessional}
            reviews={reviews}
            onPressReviewer={onPressReviewer}
          />
        ) : null}

        {selectedTab === 'portfolio' ? (
          <ProfessionalPortfolio />
        ) : null}

        {selectedTab === 'experience' ? (
          <ProfessionalExperience />
        ) : null}

        {selectedTab === 'reviews' ? (
          <ProfessionalReviews
            loading={reviewsLoading}
            error={reviewsError}
            reviews={reviews}
            stats={stats}
            statsError={statsError}
            statsLoading={statsLoading}
            onRetry={onRetryReviews}
            onPressReviewer={onPressReviewer}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    maxWidth: layout.maximumContentWidth,
    alignSelf: 'center',
  },

  panel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});
