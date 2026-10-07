import type { ImageSourcePropType } from 'react-native';
import { StyleSheet } from 'react-native';

import DGHeader from '../DGHeader';
import DGHeroCard from '../DGHeroCard';
import DGReveal from '../DGReveal';

import { spacing } from '../../theme/designSystem';

type DiscoverTopSectionProps = {
  greeting: string;
  locationLabel?: string | null;
  initials: string;
  avatarImage?: ImageSourcePropType;
  unreadMessageCount?: number;
  onMessagesPress: () => void;
  onExplorePress: () => void;
};

export default function DiscoverTopSection({
  greeting,
  locationLabel,
  initials,
  avatarImage,
  unreadMessageCount = 0,
  onMessagesPress,
  onExplorePress,
}: DiscoverTopSectionProps) {
  const area = locationLabel?.trim() || undefined;

  return (
    <>
      <DGReveal delay={0} duration={390} distance={8}>
        <DGHeader
          showBrand
          location={area}
          secondaryAction={{
            icon: 'chatbubble-ellipses-outline',
            accessibilityLabel: 'Open Direct Gain Inbox',
            onPress: onMessagesPress,
            badgeCount: unreadMessageCount,
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
          greeting={greeting}
          supportingCopy="Discover what's available across Direct Gain."
          initials={initials}
          avatarImage={avatarImage}
          ctaTitle="See what's on Direct Gain"
          onPress={onExplorePress}
        />
      </DGReveal>
    </>
  );
}

const styles = StyleSheet.create({
  heroWrapper: {
    width: '100%',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
});
