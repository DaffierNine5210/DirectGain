import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  formatProfileTemplateLabel,
} from '../../services/profile/profilePresentationRepository';

import type { ProfileTemplate } from '../../types/profile';

import {
  alpha,
  iconSize,
  palette,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

type ProfileStyleOptionCardProps = {
  template: ProfileTemplate;
  current: boolean;
  comingSoon?: boolean;
  focused?: boolean;
  onPress: () => void;
};

const COPY: Record<
  ProfileTemplate,
  {
    purpose: string;
    supporting: string;
  }
> = {
  personal: {
    purpose: 'Share who you are.',
    supporting: 'Social • Content • Community',
  },
  professional: {
    purpose: 'Show what you can do.',
    supporting: 'Work • Skills • Opportunities',
  },
  business: {
    purpose: 'Present what your business offers.',
    supporting: 'Services • Customers • Growth',
  },
};

const PERSONAL_TABS = ['Posts', 'Work', 'Reviews', 'About'];
const PROFESSIONAL_TABS = [
  'Overview',
  'Portfolio',
  'Experience',
  'Reviews',
];
const BUSINESS_TABS = ['Home', 'Services', 'Work', 'Reviews'];

export default function ProfileStyleOptionCard({
  template,
  current,
  comingSoon = false,
  focused = false,
  onPress,
}: ProfileStyleOptionCardProps) {
  const label = formatProfileTemplateLabel(template);
  const copy = COPY[template];
  const highlighted = current || focused;

  const accessibilityHint = comingSoon
    ? `${label} preview is coming soon. This does not change your profile.`
    : `Opens a preview of your ${label} profile. This does not change your saved style.`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label} profile style. ${copy.purpose}${
        current ? '. Current style' : ''
      }${comingSoon ? '. Coming soon' : ''}`}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        selected: current || focused,
      }}
      style={({ pressed }) => [
        styles.card,
        highlighted && styles.cardHighlighted,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>
            {template.toUpperCase()}
          </Text>
          <Text style={styles.title}>{label}</Text>
        </View>

        {current ? (
          <View
            style={styles.currentBadge}
            accessibilityElementsHidden
          >
            <Ionicons
              name="checkmark"
              size={iconSize.xs}
              color={palette.opportunityGreen}
            />
            <Text style={styles.currentLabel}>Current</Text>
          </View>
        ) : comingSoon ? (
          <View
            style={styles.soonBadge}
            accessibilityElementsHidden
          >
            <Text style={styles.soonLabel}>Coming soon</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.purpose}>{copy.purpose}</Text>
      <Text style={styles.supporting}>{copy.supporting}</Text>

      <View
        style={styles.preview}
        importantForAccessibility="no-hide-descendants"
      >
        {template === 'personal' ? (
          <PersonalIllustration />
        ) : null}
        {template === 'professional' ? (
          <ProfessionalIllustration />
        ) : null}
        {template === 'business' ? (
          <BusinessIllustration />
        ) : null}
      </View>

      {comingSoon && focused ? (
        <Text style={styles.soonNote}>
          {label} preview coming next. Your saved style is
          unchanged.
        </Text>
      ) : null}
    </Pressable>
  );
}

function TabStrip({ labels }: { labels: string[] }) {
  return (
    <View style={styles.tabs}>
      {labels.map((tab, index) => (
        <Text
          key={tab}
          style={[
            styles.tab,
            index === 0 && styles.tabActive,
          ]}
        >
          {tab}
        </Text>
      ))}
    </View>
  );
}

function PersonalIllustration() {
  return (
    <View style={styles.illustration}>
      <View style={styles.identityRow}>
        <View style={styles.avatar} />
        <View style={styles.identityCopy}>
          <View style={[styles.bar, styles.barName]} />
          <View style={[styles.bar, styles.barMeta]} />
          <View style={[styles.bar, styles.barBio]} />
        </View>
      </View>
      <TabStrip labels={PERSONAL_TABS} />
      <View style={styles.mediaRow}>
        <View style={styles.mediaTile} />
        <View style={styles.mediaTile} />
        <View style={styles.mediaTile} />
      </View>
    </View>
  );
}

function ProfessionalIllustration() {
  return (
    <View style={styles.illustration}>
      <View style={styles.identityRow}>
        <View style={[styles.avatar, styles.avatarCompact]} />
        <View style={styles.identityCopy}>
          <View style={[styles.bar, styles.barName]} />
          <View style={[styles.bar, styles.barHeadline]} />
          <View style={[styles.bar, styles.barMeta]} />
        </View>
      </View>
      <TabStrip labels={PROFESSIONAL_TABS} />
      <View style={styles.projectRow}>
        <View style={styles.projectCard} />
        <View style={styles.projectCard} />
      </View>
    </View>
  );
}

function BusinessIllustration() {
  return (
    <View style={styles.illustration}>
      <View style={styles.cover} />
      <View style={styles.businessIdentity}>
        <View style={styles.logo} />
        <View style={styles.identityCopy}>
          <View style={[styles.bar, styles.barName]} />
          <View style={[styles.bar, styles.barMeta]} />
        </View>
      </View>
      <TabStrip labels={BUSINESS_TABS} />
      <View style={styles.serviceRow}>
        <View style={styles.serviceCard} />
        <View style={styles.serviceCard} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    gap: spacing.xs,
  },

  cardHighlighted: {
    borderColor: alpha.green16,
    backgroundColor: alpha.green04,
  },

  pressed: {
    opacity: 0.92,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  kicker: {
    color: textColor.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  title: {
    color: textColor.primary,
    ...typography.headingSmall,
  },

  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 28,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: alpha.green16,
    backgroundColor: alpha.green08,
  },

  currentLabel: {
    color: palette.opportunityGreen,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  soonBadge: {
    minHeight: 28,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: alpha.white03,
  },

  soonLabel: {
    color: textColor.secondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  purpose: {
    color: textColor.primary,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },

  supporting: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  preview: {
    marginTop: spacing.xs,
  },

  soonNote: {
    marginTop: spacing.xxs,
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  illustration: {
    overflow: 'hidden',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.page,
    padding: spacing.sm,
    gap: spacing.sm,
  },

  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: alpha.green12,
    borderWidth: 1,
    borderColor: alpha.green16,
  },

  avatarCompact: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  identityCopy: {
    flex: 1,
    gap: 6,
    paddingTop: 2,
  },

  bar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: alpha.white08,
  },

  barName: {
    width: '42%',
    backgroundColor: alpha.white14,
  },

  barHeadline: {
    width: '58%',
  },

  barMeta: {
    width: '34%',
  },

  barBio: {
    width: '72%',
  },

  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: alpha.white08,
    paddingBottom: 6,
  },

  tab: {
    color: textColor.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  tabActive: {
    color: palette.opportunityGreen,
  },

  mediaRow: {
    flexDirection: 'row',
    gap: 6,
  },

  mediaTile: {
    flex: 1,
    height: 36,
    borderRadius: 6,
    backgroundColor: alpha.white05,
  },

  projectRow: {
    flexDirection: 'row',
    gap: 6,
  },

  projectCard: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: alpha.white05,
  },

  cover: {
    height: 28,
    marginHorizontal: -spacing.sm,
    marginTop: -spacing.sm,
    backgroundColor: alpha.green08,
  },

  businessIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: -18,
  },

  logo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: alpha.green16,
    borderWidth: 1,
    borderColor: alpha.green20,
  },

  serviceRow: {
    flexDirection: 'row',
    gap: 6,
  },

  serviceCard: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: alpha.white05,
  },
});
