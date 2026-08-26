import {
  StyleSheet,
} from 'react-native';

import DGHeader from '../DGHeader';
import DGHeroCard from '../DGHeroCard';
import DGReveal from '../DGReveal';

import {
  spacing,
} from '../../theme/designSystem';

type DiscoverTopSectionProps = {
  userName?: string;
  locationName: string;
  locationRadius: string;

  opportunityCount: number;
  listingCount: number;
  jobCount: number;
  auctionCount: number;

  notificationCount?: number;

  onLocationPress: () => void;
  onMessagesPress: () => void;
  onNotificationsPress: () => void;
  onExplorePress: () => void;
};

export default function DiscoverTopSection({
  userName = 'Liam',
  locationName,
  locationRadius,

  opportunityCount,
  listingCount,
  jobCount,
  auctionCount,

  notificationCount = 0,

  onLocationPress,
  onMessagesPress,
  onNotificationsPress,
  onExplorePress,
}: DiscoverTopSectionProps) {
  return (
    <>
      <DGReveal
        delay={0}
        duration={390}
        distance={8}
      >
        <DGHeader
          showBrand
          location={`${locationName} · ${locationRadius}`}
          onLocationPress={
            onLocationPress
          }
          secondaryAction={{
            icon:
              'chatbubble-ellipses-outline',

            accessibilityLabel:
              'Open messages',

            onPress:
              onMessagesPress,
          }}
          primaryAction={{
            icon:
              'notifications-outline',

            accessibilityLabel:
              'Open notifications',

            badgeCount:
              notificationCount,

            onPress:
              onNotificationsPress,
          }}
        />
      </DGReveal>

      <DGReveal
        delay={55}
        duration={420}
        distance={10}
        style={styles.heroWrapper}
      >
        <DGHeroCard
          greeting={getGreeting(
            userName,
          )}
          location={locationName}
          opportunities={
            opportunityCount
          }
          listings={listingCount}
          jobs={jobCount}
          auctions={auctionCount}
          onPress={onExplorePress}
        />
      </DGReveal>
    </>
  );
}

function getGreeting(
  userName: string,
) {
  const hour =
    new Date().getHours();

  if (hour < 12) {
    return `Good Morning, ${userName} 👋`;
  }

  if (hour < 17) {
    return `Good Afternoon, ${userName} 👋`;
  }

  return `Good Evening, ${userName} 👋`;
}

const styles = StyleSheet.create({
  heroWrapper: {
    width: '100%',

    marginTop:
      spacing.xs,

    paddingHorizontal:
      spacing.lg,
  },
});