import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';
import type {
  SellerProfile,
  SellerReview,
} from '../../types/SellerProfile';

type Props = {
  seller: SellerProfile;
  onViewAllPress?: () => void;
};

type ReviewCardProps = {
  review: SellerReview;
};

function getTransactionLabel(
  transactionType: SellerReview['transactionType'],
): string {
  if (transactionType === 'job') {
    return 'Job';
  }

  if (transactionType === 'auction') {
    return 'Auction';
  }

  return 'Market';
}

function getTransactionIcon(
  transactionType: SellerReview['transactionType'],
):
  | 'storefront-outline'
  | 'briefcase-outline'
  | 'hammer-outline' {
  if (transactionType === 'job') {
    return 'briefcase-outline';
  }

  if (transactionType === 'auction') {
    return 'hammer-outline';
  }

  return 'storefront-outline';
}

function ReviewStars({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) {
  const roundedRating = Math.round(rating);

  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map(star => (
        <Ionicons
          key={star}
          name={
            star <= roundedRating
              ? 'star'
              : 'star-outline'
          }
          size={size}
          color={
            star <= roundedRating
              ? colors.primary
              : colors.textMuted
          }
        />
      ))}
    </View>
  );
}

function ReviewCard({
  review,
}: ReviewCardProps) {
  const initials = review.reviewerName
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initials}
          </Text>
        </View>

        <View style={styles.reviewerContent}>
          <Text style={styles.reviewerName}>
            {review.reviewerName}
          </Text>

          <View style={styles.reviewMetaRow}>
            <ReviewStars rating={review.rating} />

            <Text style={styles.ratingText}>
              {review.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        <Text style={styles.reviewDate}>
          {review.createdAt}
        </Text>
      </View>

      <Text style={styles.comment}>
        “{review.comment}”
      </Text>

      <View style={styles.reviewFooter}>
        <View style={styles.transactionBadge}>
          <Ionicons
            name={getTransactionIcon(
              review.transactionType,
            )}
            size={13}
            color={colors.primary}
          />

          <Text style={styles.transactionText}>
            {getTransactionLabel(
              review.transactionType,
            )}
          </Text>
        </View>

        <View style={styles.verifiedBadge}>
          <Ionicons
            name="shield-checkmark-outline"
            size={13}
            color={colors.primary}
          />

          <Text style={styles.verifiedText}>
            Verified transaction
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function ReviewsSection({
  seller,
  onViewAllPress,
}: Props) {
  const visibleReviews = seller.reviews.slice(0, 3);

  return (
    <View style={styles.container}>
      <View style={styles.ratingSummary}>
        <View style={styles.ratingMain}>
          <View style={styles.ratingIcon}>
            <Ionicons
              name="star"
              size={22}
              color={colors.primary}
            />
          </View>

          <Text style={styles.ratingValue}>
            {seller.rating.toFixed(1)}
          </Text>

          <ReviewStars
            rating={seller.rating}
            size={18}
          />

          <Text style={styles.ratingLabel}>
            Overall rating
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryStats}>
          <View style={styles.statRow}>
            <View style={styles.statLabelRow}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={14}
                color={colors.primary}
              />

              <Text style={styles.statLabel}>
                Reviews
              </Text>
            </View>

            <Text style={styles.statValue}>
              {seller.reviewCount}
            </Text>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statLabelRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={14}
                color={colors.primary}
              />

              <Text style={styles.statLabel}>
                Successful sales
              </Text>
            </View>

            <Text style={styles.statValue}>
              {seller.completedSales}
            </Text>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statLabelRow}>
              <Ionicons
                name="refresh-outline"
                size={14}
                color={colors.primary}
              />

              <Text style={styles.statLabel}>
                Repeat customers
              </Text>
            </View>

            <Text style={styles.statValue}>
              {seller.repeatCustomerRate}%
            </Text>
          </View>
        </View>
      </View>

      {seller.reviews.length > 0 && (
        <View style={styles.feedbackHeader}>
          <View>
            <Text style={styles.feedbackEyebrow}>
              VERIFIED FEEDBACK
            </Text>

            <Text style={styles.feedbackTitle}>
              Recent reviews
            </Text>
          </View>

          <View style={styles.feedbackCount}>
            <Text style={styles.feedbackCountText}>
              {seller.reviewCount}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.reviewList}>
        {visibleReviews.map(review => (
          <ReviewCard
            key={review.id}
            review={review}
          />
        ))}
      </View>

      {seller.reviews.length === 0 && (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color={colors.textMuted}
            />
          </View>

          <Text style={styles.emptyTitle}>
            No reviews yet
          </Text>

          <Text style={styles.emptyText}>
            Reviews will appear after verified transactions
            are completed.
          </Text>
        </View>
      )}

      {seller.reviews.length > 3 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View all reviews"
          onPress={onViewAllPress}
          style={({ pressed }) => [
            styles.viewAllButton,
            pressed && styles.pressed,
          ]}
        >
          <View>
            <Text style={styles.viewAllText}>
              View all reviews
            </Text>

            <Text style={styles.viewAllSubtext}>
              See all {seller.reviewCount} buyer reviews
            </Text>
          </View>

          <View style={styles.viewAllIcon}>
            <Ionicons
              name="chevron-forward"
              size={17}
              color={colors.primary}
            />
          </View>
        </Pressable>
      )}

      <View style={styles.footer}>
        <View style={styles.footerIcon}>
          <Ionicons
            name="lock-closed-outline"
            size={14}
            color={colors.textMuted}
          />
        </View>

        <Text style={styles.footerText}>
          Reviews can only be submitted after verified
          Direct Gain transactions.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#101511',
  },

  ratingSummary: {
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.14)',
    backgroundColor: 'rgba(158, 246, 90, 0.035)',
  },

  ratingMain: {
    alignItems: 'center',
  },

  ratingIcon: {
    width: 44,
    height: 44,
    marginBottom: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.18)',
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  ratingValue: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1.2,
  },

  starsRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingLabel: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },

  summaryDivider: {
    height: 1,
    marginVertical: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },

  summaryStats: {
    gap: 12,
  },

  statRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statLabelRow: {
    flex: 1,
    minWidth: 0,
    marginRight: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  statLabel: {
    flex: 1,
    marginLeft: 8,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '700',
  },

  statValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },

  feedbackHeader: {
    marginTop: 22,
    marginBottom: 12,
    paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  feedbackEyebrow: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.05,
  },

  feedbackTitle: {
    marginTop: 4,
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2,
  },

  feedbackCount: {
    minWidth: 38,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.14)',
    backgroundColor: 'rgba(158, 246, 90, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  feedbackCountText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },

  reviewList: {},

  reviewCard: {
    marginBottom: 12,
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },

  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 42,
    height: 42,
    marginRight: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.18)',
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },

  reviewerContent: {
    flex: 1,
    minWidth: 0,
  },

  reviewerName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },

  reviewMetaRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingText: {
    marginLeft: 6,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },

  reviewDate: {
    marginLeft: 10,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },

  comment: {
    marginTop: 13,
    color: colors.text,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: '600',
  },

  reviewFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  transactionBadge: {
    marginRight: 8,
    marginBottom: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(158, 246, 90, 0.07)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  transactionText: {
    marginLeft: 5,
    color: colors.text,
    fontSize: 9,
    fontWeight: '800',
  },

  verifiedBadge: {
    marginBottom: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  verifiedText: {
    marginLeft: 5,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },

  emptyState: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    alignItems: 'center',
  },

  emptyIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 13,
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },

  emptyText: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  viewAllButton: {
    minHeight: 58,
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.16)',
    backgroundColor: 'rgba(158, 246, 90, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  viewAllText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },

  viewAllSubtext: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
  },

  viewAllIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(158, 246, 90, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  footerIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '600',
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.985 }],
  },
});