import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import DGScreen from '../../components/layout/DGScreen';

import DGDiscoverFeed from '../../components/discover/DGDiscoverFeed';

import {
  getDiscoverFeed,
} from '../../data/selectors/getDiscoverFeed';

import DGDiscoverHeader from '../../components/discover/DGDiscoverHeader';
import DGDiscoverSearchBar from '../../components/discover/DGDiscoverSearchBar';
import DGDiscoverQuickActions, {
  DiscoverQuickAction,
} from '../../components/discover/DGDiscoverQuickActions';

import DGDiscoverFeedTabs, {
  DiscoverFeedTab,
} from '../../components/discover/DGDiscoverFeedTabs';

import { spacing } from '../../theme/designSystem';

export default function DiscoverScreen() {
  const [selectedTab, setSelectedTab] =
    useState<DiscoverFeedTab>('for-you');
const feedItems =
  getDiscoverFeed(selectedTab);
  function handleQuickAction(
    action: DiscoverQuickAction,
  ) {
    Alert.alert(
      action,
      'Coming soon.',
    );
  }

  return (
    <DGScreen>
      <DGDiscoverHeader
        greeting="Good Evening, Liam 👋"
        location="Mackay, QLD"
        onLocationPress={() =>
          Alert.alert(
            'Location',
            'Location selector coming soon.',
          )
        }
        onNotificationsPress={() =>
          Alert.alert(
            'Notifications',
            'Notifications coming soon.',
          )
        }
      />

      <View style={styles.content}>

        <DGDiscoverSearchBar
          onPress={() =>
            Alert.alert(
              'Search',
              'Universal search coming soon.',
            )
          }
        />

        <DGDiscoverQuickActions
          style={styles.quickActions}
          onPress={handleQuickAction}
        />

        <DGDiscoverFeedTabs
          style={styles.tabs}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        />
<View style={styles.feed}>
  <DGDiscoverFeed
    items={feedItems}
    onItemPress={(item) => {
      Alert.alert(
        item.title ?? 'Direct Gain',
        `Open ${item.type} coming next.`,
      );
    }}
    onAuthorPress={(authorId) => {
      Alert.alert(
        'Profile',
        `Open profile: ${authorId}`,
      );
    }}
    onLikePress={(item) => {
      Alert.alert(
        'Like',
        `Liked ${item.title ?? 'this post'}.`,
      );
    }}
    onCommentPress={(item) => {
      Alert.alert(
        'Comments',
        `Comments for ${item.title ?? 'this post'} coming next.`,
      );
    }}
    onSharePress={(item) => {
      Alert.alert(
        'Share',
        `Share ${item.title ?? 'this post'}.`,
      );
    }}
  />
</View>
      </View>
    </DGScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
  },

  quickActions: {
    marginTop: spacing.lg,
  },

  tabs: {
    marginTop: spacing.lg,
  },
  feed: {
  
  marginTop: spacing.lg,
},
});