import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import GainJourneyTimeline from '../components/Seller-Profile/GainJourneyTimeline';
import GainScoreCard from '../components/Seller-Profile/GainScoreCard';
import SellerProfileHeader from '../components/Seller-Profile/SellerProfileHeader';
import { sellers } from '../data/sellers';
import { colors } from '../theme/colors';

export default function SellerProfileScreen() {
  const seller = sellers[0];

  const [isFollowing, setIsFollowing] = useState(
    seller.isFollowing,
  );

  const handleFollowPress = () => {
    setIsFollowing(current => !current);
  };

  const handleMessagePress = () => {
    Alert.alert(
      `Message ${seller.name}`,
      'Direct messaging will be connected after the profile navigation is complete.',
    );
  };

  const handleSharePress = () => {
    Alert.alert(
      'Share profile',
      'Profile sharing will be connected in a later stage.',
    );
  };

  const handleMorePress = () => {
    Alert.alert(
      'Profile options',
      'Reporting, blocking and additional profile options will be added later.',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.topBar}>
            <View style={styles.topBarTitleArea}>
              <View style={styles.logoMark}>
                <Ionicons
                  name="trending-up"
                  size={18}
                  color={colors.primary}
                />
              </View>

              <View>
                <Text style={styles.topBarEyebrow}>
                  DIRECT GAIN
                </Text>

                <Text style={styles.topBarTitle}>
                  Seller Profile
                </Text>
              </View>
            </View>

            <View style={styles.topBarActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share profile"
                onPress={handleSharePress}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="share-social-outline"
                  size={19}
                  color={colors.text}
                />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="More profile options"
                onPress={handleMorePress}
                style={({ pressed }) => [
                  styles.iconButton,
                  styles.lastIconButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={20}
                  color={colors.text}
                />
              </Pressable>
            </View>
          </View>

          <SellerProfileHeader
            seller={seller}
            isFollowing={isFollowing}
            onFollowPress={handleFollowPress}
            onMessagePress={handleMessagePress}
          />

          <View style={styles.sectionDivider} />

          <GainScoreCard seller={seller} />

          <GainJourneyTimeline seller={seller} />

          <View style={styles.activitySummary}>
            <View style={styles.activityHeader}>
              <View style={styles.activityIcon}>
                <Ionicons
                  name="analytics-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>

              <View style={styles.activityHeading}>
                <Text style={styles.activityEyebrow}>
                  DIRECT GAIN ACTIVITY
                </Text>

                <Text style={styles.activityTitle}>
                  Across the platform
                </Text>
              </View>
            </View>

            <Text style={styles.activityDescription}>
              This profile connects the seller’s reputation
              across Market, Jobs and Auctions.
            </Text>

            <View style={styles.activityGrid}>
              <View style={styles.activityItem}>
                <View style={styles.activityItemIcon}>
                  <Ionicons
                    name="storefront-outline"
                    size={19}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.activityValue}>
                  {seller.activeListingIds.length}
                </Text>

                <Text style={styles.activityLabel}>
                  Active listings
                </Text>
              </View>

              <View style={styles.activityItem}>
                <View style={styles.activityItemIcon}>
                  <Ionicons
                    name="briefcase-outline"
                    size={19}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.activityValue}>
                  {seller.completedJobCount}
                </Text>

                <Text style={styles.activityLabel}>
                  Jobs completed
                </Text>
              </View>

              <View style={styles.activityItem}>
                <View style={styles.activityItemIcon}>
                  <Ionicons
                    name="hammer-outline"
                    size={19}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.activityValue}>
                  {seller.completedAuctionCount}
                </Text>

                <Text style={styles.activityLabel}>
                  Auctions completed
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.comingNextCard}>
            <View style={styles.comingNextIcon}>
              <Ionicons
                name="layers-outline"
                size={21}
                color={colors.primary}
              />
            </View>

            <View style={styles.comingNextContent}>
              <Text style={styles.comingNextTitle}>
                More profile sections are coming
              </Text>

              <Text style={styles.comingNextText}>
                Skills, portfolio work, reviews and active
                listings will be added as reusable profile
                components next.
              </Text>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080B09',
  },

  screen: {
    flex: 1,
    backgroundColor: '#080B09',
  },

  scrollContent: {
    paddingBottom: 32,
  },

  topBar: {
    minHeight: 68,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.07)',
    backgroundColor: '#080B09',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  topBarTitleArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoMark: {
    width: 42,
    height: 42,
    marginRight: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.20)',
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  topBarEyebrow: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  topBarTitle: {
    marginTop: 3,
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },

  topBarActions: {
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconButton: {
    width: 42,
    height: 42,
    marginRight: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  lastIconButton: {
    marginRight: 0,
  },

  sectionDivider: {
    height: 1,
    marginHorizontal: 20,
    marginBottom: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },

  activitySummary: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#101511',
  },

  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  activityIcon: {
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

  activityHeading: {
    flex: 1,
  },

  activityEyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  activityTitle: {
    marginTop: 4,
    color: colors.text,
    fontSize: 19,
    fontWeight: '900',
  },

  activityDescription: {
    marginTop: 14,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '600',
  },

  activityGrid: {
    marginTop: 18,
    flexDirection: 'row',
  },

  activityItem: {
    flex: 1,
    minHeight: 126,
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activityItemIcon: {
    width: 38,
    height: 38,
    marginBottom: 9,
    borderRadius: 13,
    backgroundColor: 'rgba(158, 246, 90, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activityValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },

  activityLabel: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 8,
    lineHeight: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  comingNextCard: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 16,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.13)',
    backgroundColor: 'rgba(158, 246, 90, 0.045)',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  comingNextIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  comingNextContent: {
    flex: 1,
    marginLeft: 12,
  },

  comingNextTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },

  comingNextText: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '600',
  },

  bottomSpacer: {
    height: 24,
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
});