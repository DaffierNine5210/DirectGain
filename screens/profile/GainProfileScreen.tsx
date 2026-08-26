import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import DGScreen from '../../components/layout/DGScreen';

import DGProfileActivityFeed from '../../components/profile/DGProfileActivityFeed';
import DGProfileHeader from '../../components/profile/DGProfileHeader';
import DGProfileIdentityCard from '../../components/profile/DGProfileIdentityCard';
import DGProfileQuickStats from '../../components/profile/DGProfileQuickStats';
import DGProfileTabs, {
  ProfileTabKey,
} from '../../components/profile/DGProfileTabs';

import ActiveListingsSection from '../../components/seller-profile/ActiveListingsSection';
import GainJourneyTimeline from '../../components/seller-profile/GainJourneyTimeline';
import GainScoreCard from '../../components/seller-profile/GainScoreCard';
import PortfolioSection from '../../components/seller-profile/PortfolioSection';
import ReviewsSection from '../../components/seller-profile/ReviewsSection';
import VerificationHub from '../../components/seller-profile/VerificationHub';

import {
  getProfileActivities,
} from '../../data/profileActivities';

import {
  alpha,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

import type {
  Listing,
  VerificationType,
} from '../../types/Listing';

import type {
  SellerPortfolioItem,
  SellerProfile,
} from '../../types/SellerProfile';

type GainProfileScreenProps = {
  seller: SellerProfile;
  listings: Listing[];

  isFollowing: boolean;

  onBackPress: () => void;
  onFollowPress: () => void;
  onMessagePress: () => void;
  onSharePress: () => void;
  onMorePress: () => void;

  onListingPress: (
    listingId: string,
  ) => void;

  onVerificationPress: (
    verification: VerificationType,
  ) => void;

  onPortfolioItemPress: (
    item: SellerPortfolioItem,
  ) => void;

  onViewAllPortfolioPress: () => void;
  onViewAllReviewsPress: () => void;
};

export default function GainProfileScreen({
  seller,
  listings,

  isFollowing,

  onBackPress,
  onFollowPress,
  onMessagePress,
  onSharePress,
  onMorePress,

  onListingPress,
  onVerificationPress,

  onPortfolioItemPress,
  onViewAllPortfolioPress,
  onViewAllReviewsPress,
}: GainProfileScreenProps) {
  const [
    selectedTab,
    setSelectedTab,
  ] = useState<ProfileTabKey>(
    'overview',
  );

  const [
    showTrustDetails,
    setShowTrustDetails,
  ] = useState(false);

  const location =
    `${seller.suburb}, ${seller.state}`;

  const username =
    seller.username.replace(/^@/, '');

  const activeListings =
    listings.filter((listing) =>
      seller.activeListingIds.includes(
        listing.id,
      ),
    );

  const activities =
    getProfileActivities(seller.id);

  const verificationCount =
    seller.verification.length;

  function selectTab(
    tab: ProfileTabKey,
  ) {
    setSelectedTab(tab);

    if (tab !== 'overview') {
      setShowTrustDetails(false);
    }
  }

  function renderTabContent() {
    switch (selectedTab) {
      case 'market':
        return (
          <View style={styles.tabSection}>
            <SectionHeading
              eyebrow="MARKET"
              title="Listings"
              description="Items currently available from this member."
              icon="storefront-outline"
            />

            <ActiveListingsSection
              seller={seller}
              listings={listings}
              onListingPress={
                onListingPress
              }
            />
          </View>
        );

      case 'work':
        return (
          <View style={styles.tabSection}>
            <SectionHeading
              eyebrow="WORK"
              title="Skills and experience"
              description="Work history, skills and professional portfolio."
              icon="briefcase-outline"
            />

            <View style={styles.sectionStack}>
              <SkillsCard
                skills={seller.skills}
              />

              <PortfolioSection
                seller={seller}
                onPortfolioItemPress={
                  onPortfolioItemPress
                }
                onViewAllPress={
                  onViewAllPortfolioPress
                }
              />
            </View>
          </View>
        );

      case 'activity':
        return (
          <View style={styles.tabSection}>
            <View style={styles.activityHeading}>
              <View style={styles.activityHeadingCopy}>
                <Text style={styles.sectionEyebrow}>
                  PROFILE ACTIVITY
                </Text>

                <Text style={styles.sectionTitle}>
                  Activity
                </Text>

                <Text style={styles.sectionDescription}>
                  Recent public activity from this member.
                </Text>
              </View>

              <View style={styles.publicBadge}>
                <View style={styles.publicDot} />

                <Text style={styles.publicText}>
                  PUBLIC
                </Text>
              </View>
            </View>

            <View style={styles.activityFeed}>
              <DGProfileActivityFeed
                activities={activities}
                authorName={seller.name}
                authorInitials={getInitials(
                  seller.name,
                )}
                onActivityPress={activity => {
                  Alert.alert(
                    activity.title ??
                      'Activity',
                    'Open full activity view (coming soon).',
                  );
                }}
              />
            </View>
          </View>
        );

      case 'reviews':
        return (
          <View style={styles.tabSection}>
            <SectionHeading
              eyebrow="BUYER FEEDBACK"
              title="Reviews"
              description="Feedback from verified Direct Gain transactions."
              icon="star-outline"
            />

            <ReviewsSection
              seller={seller}
              onViewAllPress={
                onViewAllReviewsPress
              }
            />
          </View>
        );

      case 'overview':
      default:
        return (
          <View style={styles.tabSection}>
            <OverviewTrustCard
              seller={seller}
              verificationCount={
                verificationCount
              }
              expanded={
                showTrustDetails
              }
              onPress={() => {
                setShowTrustDetails(
                  current => !current,
                );
              }}
            />

            {showTrustDetails ? (
              <View
                style={
                  styles.trustDetails
                }
              >
                <GainScoreCard
                  seller={seller}
                />

                <VerificationHub
                  seller={seller}
                  onVerificationPress={
                    onVerificationPress
                  }
                />

                <GainJourneyTimeline
                  seller={seller}
                />
              </View>
            ) : null}

            <AboutOverviewCard
              seller={seller}
            />

            <OverviewActivityCard
              listingCount={
                activeListings.length
              }
              completedSales={
                seller.completedSales
              }
              completedJobs={
                seller.completedJobCount
              }
              onMarketPress={() => {
                selectTab('market');
              }}
              onWorkPress={() => {
                selectTab('work');
              }}
            />
          </View>
        );
    }
  }

  return (
    <DGScreen
      contentContainerStyle={
        styles.scrollContent
      }
      showBottomGlow={false}
    >
      <DGProfileHeader
        title="Gain Profile"
        onBackPress={onBackPress}
        secondaryAction={{
          icon: 'share-social-outline',
          accessibilityLabel:
            'Share profile',
          onPress: onSharePress,
        }}
        primaryAction={{
          icon: 'ellipsis-horizontal',
          accessibilityLabel:
            'More profile options',
          onPress: onMorePress,
        }}
      />

      <View style={styles.content}>
        <DGProfileIdentityCard
          name={seller.name}
          username={username}
          profession="Local seller and business owner"
          location={location}
          profileImage={
            seller.profileImage
          }
          coverImage={
            seller.coverImage
          }
          initials={getInitials(
            seller.name,
          )}
          bio={seller.bio}
          gainScore={
            seller.gainScore
          }
          trustLabel={
            getTrustLabel(
              seller.gainScore,
            )
          }
          rating={seller.rating}
          reviewCount={
            seller.reviewCount
          }
          badges={getProfileBadges(
            seller.verification,
          )}
          isFollowing={
            isFollowing
          }
          onFollowPress={
            onFollowPress
          }
          onMessagePress={
            onMessagePress
          }
          onGainScorePress={() => {
            selectTab('overview');
            setShowTrustDetails(true);
          }}
          onBadgePress={(badge) => {
            selectTab('overview');
            setShowTrustDetails(true);

            Alert.alert(
              badge.label,
              'Verification information is shown in Trust details.',
            );
          }}
        />

        <DGProfileQuickStats
          style={styles.quickStats}
          items={[
            {
              id: 'sales',
              label: 'Sales',
              value:
                seller.completedSales,
              icon:
                'bag-check-outline',
              onPress: () => {
                selectTab('market');
              },
            },
            {
              id: 'jobs',
              label: 'Jobs',
              value:
                seller.completedJobCount,
              icon:
                'briefcase-outline',
              onPress: () => {
                selectTab('work');
              },
            },
            {
              id: 'reviews',
              label: 'Reviews',
              value:
                seller.reviewCount,
              icon:
                'star-outline',
              onPress: () => {
                selectTab('reviews');
              },
            },
            {
              id: 'followers',
              label: 'Followers',
              value:
                formatCompactNumber(
                  seller.followers,
                ),
              icon:
                'people-outline',
              onPress: () => {
                selectTab('overview');
              },
            },
          ]}
        />

        <DGProfileTabs
          selectedTab={selectedTab}
          onSelect={selectTab}
          activeListingCount={
            activeListings.length
          }
          reviewCount={
            seller.reviewCount
          }
        />

        {renderTabContent()}
      </View>
    </DGScreen>
  );
}

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;

  icon: React.ComponentProps<
    typeof Ionicons
  >['name'];
};

function SectionHeading({
  eyebrow,
  title,
  description,
  icon,
}: SectionHeadingProps) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionIcon}>
        <Ionicons
          name={icon}
          size={20}
          color={textColor.secondary}
        />
      </View>

      <View style={styles.sectionHeadingCopy}>
        <Text style={styles.sectionEyebrow}>
          {eyebrow}
        </Text>

        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        <Text
          style={
            styles.sectionDescription
          }
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

type OverviewTrustCardProps = {
  seller: SellerProfile;
  verificationCount: number;
  expanded: boolean;
  onPress: () => void;
};

function OverviewTrustCard({
  seller,
  verificationCount,
  expanded,
  onPress,
}: OverviewTrustCardProps) {
  return (
    <View style={styles.overviewCard}>
      <View style={styles.overviewCardHeader}>
        <View style={styles.overviewIconAccent}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color="#95F24C"
          />
        </View>

        <View
          style={
            styles.overviewCardHeading
          }
        >
          <Text style={styles.overviewEyebrow}>
            TRUST
          </Text>

          <Text style={styles.overviewTitle}>
            Reputation
          </Text>
        </View>
      </View>

      <View style={styles.trustSummaryRow}>
        <View style={styles.gainScoreSummary}>
          <Text style={styles.gainScoreValue}>
            {seller.gainScore}
          </Text>

          <Text style={styles.gainScoreLabel}>
            Gain Score
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.trustStat}>
          <Text style={styles.trustStatValue}>
            {verificationCount}
          </Text>

          <Text style={styles.trustStatLabel}>
            Verified
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.trustStat}>
          <Text style={styles.trustStatValue}>
            {seller.rating.toFixed(1)}
          </Text>

          <Text style={styles.trustStatLabel}>
            Rating
          </Text>
        </View>
      </View>

      <Text style={styles.overviewDescription}>
        {getTrustLabel(
          seller.gainScore,
        )}
        . Identity, transaction history and community activity contribute to this profile's reputation.
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.detailsButton,
          pressed &&
            styles.pressed,
        ]}
      >
        <Text
          style={
            styles.detailsButtonText
          }
        >
          {expanded
            ? 'Hide trust details'
            : 'View trust details'}
        </Text>

        <Ionicons
          name={
            expanded
              ? 'chevron-up'
              : 'chevron-forward'
          }
          size={16}
          color="#95F24C"
        />
      </Pressable>
    </View>
  );
}

type AboutOverviewCardProps = {
  seller: SellerProfile;
};

function AboutOverviewCard({
  seller,
}: AboutOverviewCardProps) {
  return (
    <View style={styles.overviewCard}>
      <View style={styles.overviewCardHeader}>
        <View style={styles.overviewIcon}>
          <Ionicons
            name="person-outline"
            size={19}
            color={textColor.secondary}
          />
        </View>

        <View
          style={
            styles.overviewCardHeading
          }
        >
          <Text style={styles.overviewEyebrow}>
            ABOUT
          </Text>

          <Text style={styles.overviewTitle}>
            About {seller.name}
          </Text>
        </View>
      </View>

      <Text style={styles.aboutBio}>
        {seller.bio}
      </Text>

      <View style={styles.compactInfoRows}>
        <CompactInfoRow
          icon="location-outline"
          label={`${seller.suburb}, ${seller.state}`}
        />

        <CompactInfoRow
          icon="calendar-outline"
          label={`Member since ${seller.memberSince}`}
        />

        <CompactInfoRow
          icon="time-outline"
          label={seller.responseTime}
          last
        />
      </View>
    </View>
  );
}

type OverviewActivityCardProps = {
  listingCount: number;
  completedSales: number;
  completedJobs: number;

  onMarketPress: () => void;
  onWorkPress: () => void;
};

function OverviewActivityCard({
  listingCount,
  completedSales,
  completedJobs,
  onMarketPress,
  onWorkPress,
}: OverviewActivityCardProps) {
  return (
    <View style={styles.overviewCard}>
      <View style={styles.overviewCardHeader}>
        <View style={styles.overviewIcon}>
          <Ionicons
            name="apps-outline"
            size={19}
            color={textColor.secondary}
          />
        </View>

        <View
          style={
            styles.overviewCardHeading
          }
        >
          <Text style={styles.overviewEyebrow}>
            AT A GLANCE
          </Text>

          <Text style={styles.overviewTitle}>
            Current activity
          </Text>
        </View>
      </View>

      <View style={styles.overviewLinks}>
        <Pressable
          accessibilityRole="button"
          onPress={onMarketPress}
          style={({ pressed }) => [
            styles.overviewLink,
            pressed &&
              styles.pressed,
          ]}
        >
          <View style={styles.overviewLinkIcon}>
            <Ionicons
              name="storefront-outline"
              size={17}
              color="#95F24C"
            />
          </View>

          <View style={styles.overviewLinkCopy}>
            <Text
              style={
                styles.overviewLinkTitle
              }
            >
              Market
            </Text>

            <Text
              style={
                styles.overviewLinkDescription
              }
            >
              {listingCount} active · {completedSales} sales
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={16}
            color={textColor.muted}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onWorkPress}
          style={({ pressed }) => [
            styles.overviewLink,
            pressed &&
              styles.pressed,
          ]}
        >
          <View style={styles.overviewLinkIcon}>
            <Ionicons
              name="briefcase-outline"
              size={17}
              color="#95F24C"
            />
          </View>

          <View style={styles.overviewLinkCopy}>
            <Text
              style={
                styles.overviewLinkTitle
              }
            >
              Work
            </Text>

            <Text
              style={
                styles.overviewLinkDescription
              }
            >
              {completedJobs} jobs completed
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={16}
            color={textColor.muted}
          />
        </Pressable>
      </View>
    </View>
  );
}

type CompactInfoRowProps = {
  icon: React.ComponentProps<
    typeof Ionicons
  >['name'];

  label: string;
  last?: boolean;
};

function CompactInfoRow({
  icon,
  label,
  last = false,
}: CompactInfoRowProps) {
  return (
    <View
      style={[
        styles.compactInfoRow,
        last &&
          styles.compactInfoRowLast,
      ]}
    >
      <Ionicons
        name={icon}
        size={15}
        color={textColor.muted}
      />

      <Text
        numberOfLines={2}
        style={styles.compactInfoText}
      >
        {label}
      </Text>
    </View>
  );
}

type SkillsCardProps = {
  skills: SellerProfile['skills'];
};

function SkillsCard({
  skills,
}: SkillsCardProps) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>
        Skills
      </Text>

      <View style={styles.skills}>
        {skills.map(skill => (
          <View
            key={skill.id}
            style={styles.skill}
          >
            <Ionicons
              name={
                skill.verified
                  ? 'checkmark-circle'
                  : 'ellipse-outline'
              }
              size={14}
              color={
                skill.verified
                  ? '#95F24C'
                  : textColor.muted
              }
            />

            <Text style={styles.skillText}>
              {skill.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function getInitials(
  name: string,
) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

function getTrustLabel(
  gainScore: number,
) {
  if (gainScore >= 90) {
    return 'Excellent reputation';
  }

  if (gainScore >= 75) {
    return 'Trusted member';
  }

  if (gainScore >= 60) {
    return 'Established member';
  }

  return 'Building reputation';
}

function getProfileBadges(
  verification:
    VerificationType[],
) {
  return verification.map(type => {
    switch (type) {
      case 'identity':
        return {
          id: type,
          label:
            'Identity Verified',
          icon:
            'shield-checkmark-outline' as const,
        };

      case 'business':
        return {
          id: type,
          label:
            'Business Verified',
          icon:
            'briefcase-outline' as const,
        };

      case 'professional':
        return {
          id: type,
          label:
            'Professional Verified',
          icon:
            'ribbon-outline' as const,
        };

      case 'community':
        return {
          id: type,
          label:
            'Community Trusted',
          icon:
            'people-outline' as const,
        };
    }
  });
}

function formatCompactNumber(
  value: number,
) {
  if (value >= 1_000_000) {
    return `${(
      value / 1_000_000
    ).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(
      value / 1000
    ).toFixed(1)}K`;
  }

  return `${value}`;
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },

  content: {
    width: '100%',

    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },

  quickStats: {
    marginTop: spacing.md,
  },

  tabSection: {
    width: '100%',
    marginTop: spacing.md,
  },

  sectionHeading: {
    width: '100%',

    padding: spacing.md,

    borderRadius: radius.card,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardRaised,

    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionIcon: {
    width: 44,
    height: 44,

    marginRight: spacing.sm,

    borderRadius: radius.md,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardSoft,

    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionHeadingCopy: {
    flex: 1,
    minWidth: 0,
  },

  sectionEyebrow: {
    color: textColor.muted,

    fontSize: 9,
    lineHeight: 12,

    fontWeight: '900',

    letterSpacing: 1,
  },

  sectionTitle: {
    marginTop: 4,

    color: textColor.primary,

    fontSize: 19,
    lineHeight: 24,

    fontWeight: '900',

    letterSpacing: -0.35,
  },

  sectionDescription: {
    marginTop: 4,

    color: textColor.secondary,

    fontSize: 11,
    lineHeight: 17,

    fontWeight: '600',
  },

  sectionStack: {
    width: '100%',

    marginTop: spacing.md,

    gap: spacing.md,
  },

  overviewCard: {
    width: '100%',

    marginBottom: spacing.md,
    padding: spacing.md,

    borderRadius: radius.card,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardRaised,
  },

  overviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  overviewIcon: {
    width: 42,
    height: 42,

    marginRight: spacing.sm,

    borderRadius: radius.md,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardSoft,

    alignItems: 'center',
    justifyContent: 'center',
  },

  overviewIconAccent: {
    width: 42,
    height: 42,

    marginRight: spacing.sm,

    borderRadius: radius.md,

    borderWidth: 1,
    borderColor:
      'rgba(149, 242, 76, 0.22)',

    backgroundColor:
      'rgba(149, 242, 76, 0.07)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  overviewCardHeading: {
    flex: 1,
    minWidth: 0,
  },

  overviewEyebrow: {
    color: textColor.muted,

    fontSize: 8,
    lineHeight: 11,

    fontWeight: '900',

    letterSpacing: 1,
  },

  overviewTitle: {
    marginTop: 3,

    color: textColor.primary,

    fontSize: 16,
    lineHeight: 21,

    fontWeight: '900',
  },

  overviewDescription: {
    marginTop: spacing.sm,

    color: textColor.secondary,

    fontSize: 11,
    lineHeight: 17,

    fontWeight: '600',
  },

  trustSummaryRow: {
    width: '100%',

    minHeight: 78,

    marginTop: spacing.md,
    paddingVertical: spacing.sm,

    borderRadius: radius.lg,

    borderWidth: 1,
    borderColor:
      'rgba(149, 242, 76, 0.14)',

    backgroundColor:
      'rgba(149, 242, 76, 0.035)',

    flexDirection: 'row',
    alignItems: 'center',
  },

  gainScoreSummary: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  gainScoreValue: {
    color: '#95F24C',

    fontSize: 24,
    lineHeight: 28,

    fontWeight: '900',

    letterSpacing: -0.5,
  },

  gainScoreLabel: {
    marginTop: 3,

    color: textColor.muted,

    fontSize: 8,
    lineHeight: 11,

    fontWeight: '800',
  },

  summaryDivider: {
    width: 1,
    height: 36,

    backgroundColor:
      alpha.white08,
  },

  trustStat: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  trustStatValue: {
    color: textColor.primary,

    fontSize: 17,
    lineHeight: 21,

    fontWeight: '900',
  },

  trustStatLabel: {
    marginTop: 3,

    color: textColor.muted,

    fontSize: 8,
    lineHeight: 11,

    fontWeight: '800',
  },

  detailsButton: {
    minHeight: 44,

    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,

    borderRadius: radius.md,

    borderWidth: 1,
    borderColor:
      'rgba(149, 242, 76, 0.16)',

    backgroundColor:
      'rgba(149, 242, 76, 0.05)',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  detailsButtonText: {
    color: textColor.primary,

    fontSize: 10,
    lineHeight: 14,

    fontWeight: '900',
  },

  trustDetails: {
    width: '100%',

    marginBottom: spacing.md,

    gap: spacing.md,
  },

  aboutBio: {
    marginTop: spacing.md,

    color: textColor.secondary,

    fontSize: 11,
    lineHeight: 18,

    fontWeight: '600',
  },

  compactInfoRows: {
    marginTop: spacing.md,

    borderTopWidth: 1,
    borderTopColor: alpha.white08,
  },

  compactInfoRow: {
    minHeight: 42,

    borderBottomWidth: 1,
    borderBottomColor: alpha.white08,

    flexDirection: 'row',
    alignItems: 'center',
  },

  compactInfoRowLast: {
    borderBottomWidth: 0,
  },

  compactInfoText: {
    flex: 1,

    marginLeft: spacing.xs,

    color: textColor.secondary,

    fontSize: 10,
    lineHeight: 15,

    fontWeight: '700',
  },

  overviewLinks: {
    marginTop: spacing.md,

    gap: spacing.xs,
  },

  overviewLink: {
    minHeight: 60,

    paddingHorizontal: spacing.sm,

    borderRadius: radius.md,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardSoft,

    flexDirection: 'row',
    alignItems: 'center',
  },

  overviewLinkIcon: {
    width: 36,
    height: 36,

    marginRight: spacing.sm,

    borderRadius: radius.sm,

    backgroundColor:
      'rgba(149, 242, 76, 0.07)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  overviewLinkCopy: {
    flex: 1,
    minWidth: 0,
  },

  overviewLinkTitle: {
    color: textColor.primary,

    fontSize: 11,
    lineHeight: 15,

    fontWeight: '900',
  },

  overviewLinkDescription: {
    marginTop: 3,

    color: textColor.muted,

    fontSize: 9,
    lineHeight: 13,

    fontWeight: '700',
  },

  infoCard: {
    width: '100%',

    padding: spacing.md,

    borderRadius: radius.lg,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardSoft,
  },

  infoTitle: {
    color: textColor.primary,

    fontSize: 15,
    lineHeight: 20,

    fontWeight: '900',
  },

  skills: {
    marginTop: spacing.sm,

    gap: spacing.xs,
  },

  skill: {
    minHeight: 40,

    paddingHorizontal: spacing.sm,

    borderRadius: radius.md,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      'rgba(255, 255, 255, 0.025)',

    flexDirection: 'row',
    alignItems: 'center',
  },

  skillText: {
    flex: 1,

    marginLeft: spacing.xs,

    color: textColor.secondary,

    fontSize: 11,
    lineHeight: 16,

    fontWeight: '700',
  },

  activityHeading: {
    width: '100%',

    padding: spacing.md,

    borderRadius: radius.card,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardRaised,

    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  activityHeadingCopy: {
    flex: 1,
    minWidth: 0,
  },

  publicBadge: {
    minHeight: 28,

    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,

    borderRadius: radius.pill,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardSoft,

    flexDirection: 'row',
    alignItems: 'center',
  },

  publicDot: {
    width: 5,
    height: 5,

    marginRight: 6,

    borderRadius: 3,

    backgroundColor: '#95F24C',
  },

  publicText: {
    color: textColor.secondary,

    fontSize: 8,
    lineHeight: 11,

    fontWeight: '900',

    letterSpacing: 0.5,
  },

  activityFeed: {
    width: '100%',

    marginTop: spacing.md,
  },

  pressed: {
    opacity: 0.72,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },
});