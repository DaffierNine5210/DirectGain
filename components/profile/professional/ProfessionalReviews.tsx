import ProfileReviewsSection from '../ProfileReviewsSection';

import type { PresentedProfileReview } from '../profilePresentation';
import type { ProfileReviewStats } from '../../../types/reviews';

type ProfessionalReviewsProps = {
  loading: boolean;
  error: string | null;
  reviews: PresentedProfileReview[];
  stats: ProfileReviewStats | null;
  statsError: string | null;
  statsLoading: boolean;
  onRetry: () => void;
  onPressReviewer: (profileId: string) => void;
};

export default function ProfessionalReviews({
  loading,
  error,
  reviews,
  stats,
  statsError,
  statsLoading,
  onRetry,
  onPressReviewer,
}: ProfessionalReviewsProps) {
  return (
    <ProfileReviewsSection
      mode="public"
      loading={loading}
      error={error}
      reviews={reviews}
      stats={stats}
      statsError={statsError}
      statsLoading={statsLoading}
      onRetry={onRetry}
      onPressReviewer={onPressReviewer}
    />
  );
}
