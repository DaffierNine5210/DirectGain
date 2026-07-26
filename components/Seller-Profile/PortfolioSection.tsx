import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';
import type {
  SellerPortfolioItem,
  SellerProfile,
} from '../../types/SellerProfile';

type Props = {
  seller: SellerProfile;
  onPortfolioItemPress?: (
    item: SellerPortfolioItem,
  ) => void;
  onViewAllPress?: () => void;
};

type PortfolioCardProps = {
  item: SellerPortfolioItem;
  onPress?: () => void;
};

function PortfolioCard({
  item,
  onPress,
}: PortfolioCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open portfolio item ${item.title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.portfolioCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image
            source={item.image}
            style={styles.image}
          />
        ) : (
          <View style={styles.imageFallback}>
            <View style={styles.imageGlowLarge} />
            <View style={styles.imageGlowSmall} />

            <View style={styles.fallbackIcon}>
              <Ionicons
                name="images-outline"
                size={28}
                color={colors.primary}
              />
            </View>
          </View>
        )}

        <View style={styles.featuredBadge}>
          <Ionicons
            name="sparkles"
            size={12}
            color={colors.primary}
          />

          <Text style={styles.featuredText}>
            Featured
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text
          style={styles.cardTitle}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {item.description ? (
          <Text
            style={styles.cardDescription}
            numberOfLines={3}
          >
            {item.description}
          </Text>
        ) : (
          <Text style={styles.cardDescription}>
            Portfolio details will be added by this member.
          </Text>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.verifiedWork}>
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color={colors.primary}
            />

            <Text style={styles.verifiedWorkText}>
              Profile showcase
            </Text>
          </View>

          <Ionicons
            name="arrow-forward"
            size={17}
            color={colors.textMuted}
          />
        </View>
      </View>
    </Pressable>
  );
}

export default function PortfolioSection({
  seller,
  onPortfolioItemPress,
  onViewAllPress,
}: Props) {
  const visibleItems = seller.portfolio.slice(0, 4);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <Ionicons
            name="images-outline"
            size={21}
            color={colors.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.eyebrow}>
            WORK AND EXPERIENCE
          </Text>

          <Text style={styles.title}>
            Portfolio
          </Text>

          <Text style={styles.subtitle}>
            A visual record of this member’s completed work,
            successful sales and experience.
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countValue}>
            {seller.portfolio.length}
          </Text>

          <Text style={styles.countLabel}>
            projects
          </Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Ionicons
            name="ribbon-outline"
            size={22}
            color={colors.primary}
          />
        </View>

        <View style={styles.summaryContent}>
          <Text style={styles.summaryTitle}>
            Proven experience
          </Text>

          <Text style={styles.summaryText}>
            Portfolio items help members show their work,
            history and capabilities across Direct Gain.
          </Text>
        </View>
      </View>

      {visibleItems.length > 0 ? (
        <View style={styles.grid}>
          {visibleItems.map(item => (
            <PortfolioCard
              key={item.id}
              item={item}
              onPress={() =>
                onPortfolioItemPress?.(item)
              }
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="images-outline"
              size={25}
              color={colors.textMuted}
            />
          </View>

          <Text style={styles.emptyTitle}>
            No portfolio items yet
          </Text>

          <Text style={styles.emptyText}>
            Completed work, projects and successful sales
            will appear here when this member adds them.
          </Text>
        </View>
      )}

      {seller.portfolio.length > 4 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View complete portfolio"
          onPress={onViewAllPress}
          style={({ pressed }) => [
            styles.viewAllButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.viewAllText}>
            View complete portfolio
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
          name="information-circle-outline"
          size={15}
          color={colors.textMuted}
        />

        <Text style={styles.footerText}>
          Portfolio content is provided by the member.
          Verification badges identify information reviewed
          separately by Direct Gain.
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
    borderColor:
      'rgba(255, 255, 255, 0.08)',
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
    borderColor:
      'rgba(158, 246, 90, 0.18)',
    backgroundColor:
      'rgba(158, 246, 90, 0.08)',
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

  countBadge: {
    minWidth: 62,
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 15,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.20)',
    backgroundColor:
      'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
  },

  countValue: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '900',
  },

  countLabel: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '800',
  },

  summaryCard: {
    marginTop: 20,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.12)',
    backgroundColor:
      'rgba(158, 246, 90, 0.045)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryIcon: {
    width: 42,
    height: 42,
    marginRight: 11,
    borderRadius: 14,
    backgroundColor:
      'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryContent: {
    flex: 1,
  },

  summaryTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },

  summaryText: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '600',
  },

  grid: {
    marginTop: 18,
  },

  portfolioCard: {
    marginBottom: 14,
    overflow: 'hidden',
    borderRadius: 21,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
    backgroundColor:
      'rgba(255, 255, 255, 0.03)',
  },

  imageContainer: {
    height: 150,
    overflow: 'hidden',
    backgroundColor: '#172019',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  imageFallback: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121A13',
  },

  imageGlowLarge: {
    position: 'absolute',
    width: 190,
    height: 190,
    top: -95,
    right: -42,
    borderRadius: 95,
    backgroundColor:
      'rgba(158, 246, 90, 0.10)',
  },

  imageGlowSmall: {
    position: 'absolute',
    width: 110,
    height: 110,
    bottom: -60,
    left: 20,
    borderRadius: 55,
    backgroundColor:
      'rgba(158, 246, 90, 0.07)',
  },

  fallbackIcon: {
    width: 62,
    height: 62,
    borderRadius: 21,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.20)',
    backgroundColor:
      'rgba(158, 246, 90, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.17)',
    backgroundColor:
      'rgba(8, 11, 9, 0.88)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  featuredText: {
    marginLeft: 5,
    color: colors.text,
    fontSize: 9,
    fontWeight: '900',
  },

  cardContent: {
    padding: 15,
  },

  cardTitle: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },

  cardDescription: {
    marginTop: 7,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '600',
  },

  cardFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor:
      'rgba(255, 255, 255, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  verifiedWork: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  verifiedWorkText: {
    marginLeft: 6,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },

  emptyState: {
    marginTop: 20,
    paddingHorizontal: 22,
    paddingVertical: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.07)',
    backgroundColor:
      'rgba(255, 255, 255, 0.025)',
    alignItems: 'center',
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor:
      'rgba(255, 255, 255, 0.04)',
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
    marginTop: 4,
    paddingHorizontal: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.16)',
    backgroundColor:
      'rgba(158, 246, 90, 0.05)',
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
    borderTopColor:
      'rgba(255, 255, 255, 0.07)',
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