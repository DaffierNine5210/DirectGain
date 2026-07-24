import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';
import type {
  SellerAchievement,
  SellerProfile,
} from '../../types/SellerProfile';

type Props = {
  seller: SellerProfile;
};

type JourneyItemProps = {
  achievement: SellerAchievement;
  isLast: boolean;
};

function JourneyItem({
  achievement,
  isLast,
}: JourneyItemProps) {
  return (
    <View style={styles.journeyItem}>
      <View style={styles.timelineColumn}>
        <View style={styles.iconOuter}>
          <View style={styles.iconInner}>
            <Ionicons
              name={achievement.icon}
              size={18}
              color={colors.primary}
            />
          </View>
        </View>

        {!isLast && <View style={styles.timelineLine} />}
      </View>

      <View
        style={[
          styles.achievementCard,
          isLast && styles.lastAchievementCard,
        ]}
      >
        <View style={styles.achievementHeader}>
          <Text style={styles.achievementTitle}>
            {achievement.title}
          </Text>

          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>
              {achievement.earnedAt}
            </Text>
          </View>
        </View>

        <Text style={styles.achievementDescription}>
          {achievement.description}
        </Text>
      </View>
    </View>
  );
}

export default function GainJourneyTimeline({
  seller,
}: Props) {
  const journeyItems: SellerAchievement[] = [
    {
      id: 'joined-direct-gain',
      title: 'Joined Direct Gain',
      description:
        'Began building a trusted reputation within the local community.',
      earnedAt: String(seller.memberSince),
      icon: 'trending-up-outline',
    },
    ...seller.achievements,
    {
      id: 'current-gain-score',
      title: `Reached Gain Score ${seller.gainScore}`,
      description:
        'Built through verified activity, successful transactions, reviews and strong community conduct.',
      earnedAt: 'Now',
      icon: 'star-outline',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons
            name="trail-sign-outline"
            size={20}
            color={colors.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.eyebrow}>
            REPUTATION HISTORY
          </Text>

          <Text style={styles.title}>
            Gain Journey
          </Text>

          <Text style={styles.subtitle}>
            A timeline of the milestones that helped build
            this member’s reputation.
          </Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {journeyItems.length}
          </Text>

          <Text style={styles.summaryLabel}>
            Milestones
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {seller.memberSince}
          </Text>

          <Text style={styles.summaryLabel}>
            Journey started
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {seller.gainScore}
          </Text>

          <Text style={styles.summaryLabel}>
            Gain Score
          </Text>
        </View>
      </View>

      <View style={styles.timeline}>
        {journeyItems.map((achievement, index) => (
          <JourneyItem
            key={achievement.id}
            achievement={achievement}
            isLast={index === journeyItems.length - 1}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Ionicons
          name="lock-closed-outline"
          size={15}
          color={colors.textMuted}
        />

        <Text style={styles.footerText}>
          Verified milestones are recorded by Direct Gain
          and cannot be manually added by members.
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

  header: {
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
    marginTop: 5,
    color: colors.text,
    fontSize: 21,
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

  summaryCard: {
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.12)',
    backgroundColor: 'rgba(158, 246, 90, 0.045)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },

  summaryLabel: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'center',
  },

  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  timeline: {
    marginTop: 24,
  },

  journeyItem: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  timelineColumn: {
    width: 42,
    alignItems: 'center',
  },

  iconOuter: {
    width: 38,
    height: 38,
    padding: 3,
    borderRadius: 14,
    backgroundColor: '#101511',
    zIndex: 2,
  },

  iconInner: {
    flex: 1,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.22)',
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  timelineLine: {
    flex: 1,
    width: 2,
    minHeight: 54,
    backgroundColor: 'rgba(158, 246, 90, 0.16)',
  },

  achievementCard: {
    flex: 1,
    marginLeft: 10,
    marginBottom: 16,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },

  lastAchievementCard: {
    marginBottom: 0,
    borderColor: 'rgba(158, 246, 90, 0.17)',
    backgroundColor: 'rgba(158, 246, 90, 0.055)',
  },

  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  achievementTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },

  dateBadge: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
  },

  dateText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },

  achievementDescription: {
    marginTop: 7,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '600',
  },

  footer: {
    marginTop: 20,
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
});