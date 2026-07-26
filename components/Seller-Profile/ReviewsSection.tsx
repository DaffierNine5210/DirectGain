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
}: {
  rating: number;
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
          size={14}
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
      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <Ionicons
            name="star-outline"
            size={21}
            color={colors.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.eyebrow}>
            COMMUNITY FEEDBACK
          </Text>

          <Text style={styles.title}>
            Reviews
          </Text>

          <Text style={styles.subtitle}>
            Feedback from verified activity across Direct Gain.
          </Text>
        </View>

        <View style={styles.scoreBadge}>
          <Text style={styles.scoreValue}>
            {seller.rating.toFixed(1)}
          </Text>

          <View style={styles.scoreStars}>
            <Ionicons
              name="star"
              size={12}
              color={colors.primary}
            />

            <Text style={styles.scoreCount}>
              {seller.reviewCount}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryScore}>
          <Text style={styles.summaryValue}>
            {seller.rating.toFixed(1)}
          </Text>

          <ReviewStars rating={seller.rating} />

          <Text style={styles.summaryLabel}>
            Overall rating
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryDetails}>
          <View style={styles.summaryDetailRow}>
            <Text style={styles.summaryDetailLabel}>
              Total reviews
            </Text>

            <Text style={styles.summaryDetailValue}>
              {seller.reviewCount}
            </Text>
          </View>

          <View style={styles.summaryDetailRow}>
            <Text style={styles.summaryDetailLabel}>
              Successful sales
            </Text>

            <Text style={styles.summaryDetailValue}>
              {seller.completedSales}
            </Text>
          </View>

          <View style={styles.summaryDetailRow}>
            <Text style={styles.summaryDetailLabel}>
              Repeat customers
            </Text>

            <Text style={styles.summaryDetailValue}>
              {seller.repeatCustomerRate}%
            </Text>
          </View>
        </View>
      </View>

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
          <Text style={styles.viewAllText}>
            View all reviews
          </Text>

          <Ionicons
            name="chevron-forward"
            size={17}
            color={colors.primary}
          />
        </Pressable>
      )}

      <View style={styles.footer}>
        <Ionicons
          name="lock-closed-outline"
          size={15}
          color={colors.textMuted}
        />

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

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  headerIcon: {
    width: 44,
    height: 44,
    marginRight: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.18)',
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerContent: {
    flex: 1,
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  title: {
    marginTop: 4,
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  subtitle: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '600',
  },

  scoreBadge: {
    minWidth: 58,
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.20)',
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
  },

  scoreValue: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '900',
  },

  scoreStars: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },

  scoreCount: {
    marginLeft: 4,
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '800',
  },

  summaryCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.12)',
    backgroundColor: 'rgba(158, 246, 90, 0.04)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryScore: {
    width: 110,
    alignItems: 'center',
  },

  summaryValue: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1,
  },

  starsRow: {
    marginTop: 5,
    flexDirection: 'row',
  },

  ratingText: {
    marginLeft: 6,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },

  summaryLabel: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },

  summaryDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  summaryDetails: {
    flex: 1,
  },

  summaryDetailRow: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryDetailLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },

  summaryDetailValue: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },

  reviewList: {
    marginTop: 18,
  },

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
    marginTop: 20,
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
    height: 48,
    marginTop: 6,
    paddingHorizontal: 14,
    borderRadius: 15,
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

  footer: {
    marginTop: 8,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  footerText: {
    flex: 1,
    marginLeft: 8,
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