import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import ProfessionalExperience from './ProfessionalExperience';
import ProfessionalOverview from './ProfessionalOverview';
import ProfessionalPortfolio from './ProfessionalPortfolio';
import ProfessionalProfileActions from './ProfessionalProfileActions';
import ProfessionalProfileHero from './ProfessionalProfileHero';
import ProfessionalProfileTabs, {
  DEFAULT_PROFESSIONAL_TAB,
  type ProfessionalProfileTabKey,
} from './ProfessionalProfileTabs';
import ProfessionalReviews from './ProfessionalReviews';

import type { PresentedProfileReview } from '../profilePresentation';

import type { DirectGainProfile } from '../../../types/profile';
import type {
  ProfessionalCredential,
  ProfessionalExperience as ProfessionalExperienceEntry,
  ProfessionalPortfolioPresentedProject,
  ProfessionalProfileCore,
  ProfessionalResume,
} from '../../../types/professionalProfile';
import type { ProfileReviewStats } from '../../../types/reviews';

import { layout, spacing } from '../../../theme/designSystem';

type ProfessionalProfileViewProps = {
  profile: DirectGainProfile;
  professional: ProfessionalProfileCore | null;
  professionalError: string | null;
  onRetryProfessional: () => void;
  onEditProfessional: () => void;
  experiences: ProfessionalExperienceEntry[];
  credentials: ProfessionalCredential[];
  backgroundLoading: boolean;
  backgroundError: string | null;
  onRetryBackground: () => void;
  onEditBackground: () => void;
  portfolioProjects: ProfessionalPortfolioPresentedProject[];
  portfolioLoading: boolean;
  portfolioError: string | null;
  onRetryPortfolio: () => void;
  onEditPortfolio: () => void;
  resume: ProfessionalResume | null;
  resumeLoading?: boolean;
  resumeError?: string | null;
  resumeMutating?: boolean;
  onRetryResume?: () => void;
  onAddResume?: () => void;
  onViewResume?: () => void;
  onReplaceResume?: () => void;
  onRemoveResume?: () => void;
  avatarUrl?: string | null;
  avatarUnavailable?: boolean;
  reviews: PresentedProfileReview[];
  stats: ProfileReviewStats | null;
  statsError: string | null;
  statsLoading: boolean;
  completedJobsCount: number | null;
  completedJobsError: string | null;
  reviewsLoading: boolean;
  reviewsError: string | null;
  onRetryReviews: () => void;
  onPressReviewer: (profileId: string) => void;
  onMessage?: () => void;
  messageLoading?: boolean;
  identityVerified?: boolean;
  mode?: 'ownerPreview' | 'visitor';
  professionalIsLive?: boolean;
};

export default function ProfessionalProfileView({
  profile,
  professional,
  professionalError,
  onRetryProfessional,
  onEditProfessional,
  experiences,
  credentials,
  backgroundLoading,
  backgroundError,
  onRetryBackground,
  onEditBackground,
  portfolioProjects,
  portfolioLoading,
  portfolioError,
  onRetryPortfolio,
  onEditPortfolio,
  resume,
  resumeLoading = false,
  resumeError = null,
  resumeMutating = false,
  onRetryResume,
  onAddResume,
  onViewResume,
  onReplaceResume,
  onRemoveResume,
  avatarUrl = null,
  avatarUnavailable = false,
  reviews,
  stats,
  statsError,
  statsLoading,
  completedJobsCount,
  completedJobsError,
  reviewsLoading,
  reviewsError,
  onRetryReviews,
  onPressReviewer,
  onMessage,
  messageLoading = false,
  identityVerified = false,
  mode = 'ownerPreview',
  professionalIsLive = false,
}: ProfessionalProfileViewProps) {
  const [selectedTab, setSelectedTab] =
    useState<ProfessionalProfileTabKey>(
      DEFAULT_PROFESSIONAL_TAB,
    );

  const isOwnerPreview = mode === 'ownerPreview';
  const headline = professionalError
    ? null
    : professional?.headline ?? null;
  const serviceArea = professionalError
    ? null
    : professional?.serviceArea ?? null;
  const about = professionalError
    ? null
    : professional?.about ?? null;
  const skillsCount = professionalError
    ? null
    : professional?.skills.length ?? 0;

  return (
    <View style={styles.root}>
      <ProfessionalProfileHero
        displayName={profile.displayName}
        headline={headline}
        serviceArea={serviceArea}
        about={about}
        skillsCount={skillsCount}
        hasStoredPhoto={Boolean(profile.avatarPath)}
        avatarUrl={avatarUrl}
        avatarUnavailable={avatarUnavailable}
        stats={stats}
        statsError={statsError}
        statsLoading={statsLoading}
        completedJobsCount={completedJobsCount}
        completedJobsError={completedJobsError}
        identityVerified={identityVerified}
        audience={mode}
      />

      {(isOwnerPreview || onMessage) ? (
        <ProfessionalProfileActions
          onMessage={onMessage}
          loading={messageLoading}
          visitor={!isOwnerPreview}
          professionalIsLive={professionalIsLive}
        />
      ) : null}

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
            experiences={experiences}
            credentials={credentials}
            backgroundLoading={backgroundLoading}
            backgroundError={backgroundError}
            onRetryBackground={onRetryBackground}
            onEditBackground={onEditBackground}
            portfolioProjects={portfolioProjects}
            portfolioLoading={portfolioLoading}
            portfolioError={portfolioError}
            onRetryPortfolio={onRetryPortfolio}
            onEditPortfolio={onEditPortfolio}
            onViewPortfolio={() => {
              setSelectedTab('portfolio');
            }}
            onViewExperience={() => {
              setSelectedTab('experience');
            }}
            resume={resume}
            resumeLoading={resumeLoading}
            resumeError={resumeError}
            resumeMutating={resumeMutating}
            onRetryResume={onRetryResume}
            onAddResume={onAddResume}
            onViewResume={onViewResume}
            onReplaceResume={onReplaceResume}
            onRemoveResume={onRemoveResume}
            mode={mode}
            professionalIsLive={professionalIsLive}
          />
        ) : null}

        {selectedTab === 'portfolio' ? (
          <ProfessionalPortfolio
            loading={portfolioLoading}
            error={portfolioError}
            projects={portfolioProjects}
            onRetry={onRetryPortfolio}
            ownerPreview={isOwnerPreview}
            onEditPortfolio={
              isOwnerPreview ? onEditPortfolio : undefined
            }
          />
        ) : null}

        {selectedTab === 'experience' ? (
          <ProfessionalExperience
            loading={backgroundLoading}
            error={backgroundError}
            experiences={experiences}
            credentials={credentials}
            onRetry={onRetryBackground}
            ownerPreview={isOwnerPreview}
            onEditBackground={
              isOwnerPreview ? onEditBackground : undefined
            }
          />
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
