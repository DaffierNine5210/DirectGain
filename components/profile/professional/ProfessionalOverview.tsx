import { StyleSheet, Text, View } from 'react-native';

import ProfileReviewCard from '../ProfileReviewCard';
import ProfessionalSetupModule from './ProfessionalSetupModule';

import type { PresentedProfileReview } from '../profilePresentation';

import {
  spacing,
  textColor,
} from '../../../theme/designSystem';

type ProfessionalOverviewProps = {
  location: string | null;
  bio: string | null;
  reviews: PresentedProfileReview[];
  onPressReviewer: (profileId: string) => void;
};

export default function ProfessionalOverview({
  location,
  bio,
  reviews,
  onPressReviewer,
}: ProfessionalOverviewProps) {
  const recentReviews = reviews.slice(0, 2);

  return (
    <View style={styles.root}>
      {bio || location ? (
        <View style={styles.about}>
          {bio ? (
            <View style={styles.block}>
              <Text style={styles.label}>About</Text>
              <Text style={styles.value}>{bio}</Text>
            </View>
          ) : null}
          {location ? (
            <View style={styles.block}>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>{location}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <ProfessionalSetupModule />

      {recentReviews.length > 0 ? (
        <View style={styles.recent}>
          <Text style={styles.sectionTitle}>
            Recent reviews
          </Text>
          {recentReviews.map(review => (
            <ProfileReviewCard
              key={review.cardKey}
              review={review}
              onPressReviewer={onPressReviewer}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },

  about: {
    gap: spacing.sm,
  },

  block: {
    gap: 4,
  },

  label: {
    color: textColor.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  value: {
    color: textColor.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },

  recent: {
    gap: spacing.sm,
  },

  sectionTitle: {
    color: textColor.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },
});
