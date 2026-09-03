import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGHeader from '../components/DGHeader';
import DGSkeleton from '../components/DGSkeleton';

import useTabBarVisibility from '../hooks/useTabBarVisibility';

import type { MyGainStackParamList } from '../navigation/MyGainStack';

import { posterInitials } from '../services/jobs/jobAdapter';
import { getOwnProfile } from '../services/profile/ownProfileRepository';

import {
  alpha,
  iconSize,
  layout,
  palette,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../theme/designSystem';

import type { OwnProfile } from '../types/profile';

type Props = NativeStackScreenProps<
  MyGainStackParamList,
  'MyGainHome'
>;

export default function MyGainScreen({
  navigation,
}: Props) {
  const { showTabBar } = useTabBarVisibility();
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const loadRef = useRef<
    (showSpinner: boolean) => Promise<void>
  >(async () => {});

  const [profile, setProfile] = useState<OwnProfile | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(
    async (showSpinner: boolean) => {
      const requestId = ++requestIdRef.current;

      if (showSpinner) {
        setLoading(true);
      }

      const result = await getOwnProfile();

      if (
        requestId !== requestIdRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      setLoading(false);
      setRefreshing(false);
      hasLoadedRef.current = true;

      if (result.error || !result.profile) {
        setProfile(null);
        setError(
          result.error ??
            'Your profile could not be loaded.',
        );
        return;
      }

      setError(null);
      setProfile(result.profile);
    },
    [],
  );

  loadRef.current = loadProfile;

  useFocusEffect(
    useCallback(() => {
      showTabBar();

      if (hasLoadedRef.current) {
        void loadRef.current(false);
      }
    }, [showTabBar]),
  );

  useEffect(() => {
    mountedRef.current = true;
    void loadProfile(true);

    return () => {
      mountedRef.current = false;
    };
  }, [loadProfile]);

  const location = [
    profile?.suburb,
    profile?.state,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <DGHeader title="My Gain" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadProfile(false);
            }}
            tintColor={palette.opportunityGreen}
          />
        }
      >
        {loading ? (
          <View style={styles.identity}>
            <DGSkeleton
              width={88}
              height={88}
              borderRadius={28}
            />
            <DGSkeleton
              width="48%"
              height={22}
              style={styles.skeleton}
            />
            <DGSkeleton width="32%" height={12} />
          </View>
        ) : error || !profile ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>
              Profile could not be loaded
            </Text>
            <Text style={styles.messageBody}>
              {error ?? 'Your profile is unavailable.'}
            </Text>
            <Pressable
              onPress={() => {
                void loadProfile(true);
              }}
              style={styles.retry}
              accessibilityRole="button"
              accessibilityLabel="Retry loading profile"
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View
              style={styles.identity}
              accessibilityLabel={`Your profile. ${profile.displayName}.`}
            >
              <View style={styles.avatarRing}>
                <View style={styles.avatar}>
                  <Text style={styles.initials}>
                    {posterInitials(profile.displayName)}
                  </Text>
                </View>
              </View>

              <Text
                style={styles.name}
                accessibilityRole="header"
              >
                {profile.displayName}
              </Text>

              <Text style={styles.meta}>
                {profile.accountType === 'business'
                  ? 'Business'
                  : 'Personal'}
              </Text>

              {location ? (
                <View style={styles.locationRow}>
                  <Ionicons
                    name="location-outline"
                    size={iconSize.sm}
                    color={textColor.muted}
                  />
                  <Text style={styles.location}>{location}</Text>
                </View>
              ) : null}
            </View>

            {profile.bio ? (
              <Text style={styles.bio}>{profile.bio}</Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Work. Manage jobs, applications and assigned work."
              onPress={() => {
                navigation.navigate('Work', {
                  screen: 'WorkHome',
                });
              }}
              style={({ pressed }) => [
                styles.workCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name="briefcase-outline"
                  size={iconSize.md}
                  color={textColor.primary}
                />
              </View>
              <View style={styles.copy}>
                <Text style={styles.workTitle}>Work</Text>
                <Text style={styles.workBody}>
                  Jobs, applications and assigned work
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={iconSize.sm}
                color={textColor.muted}
              />
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: surface.page,
  },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: layout.bottomNavigationClearance,
    gap: spacing.lg,
  },

  identity: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },

  avatarRing: {
    padding: 3,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: alpha.green20,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: alpha.green10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  initials: {
    color: palette.opportunityGreen,
    fontSize: 28,
    fontWeight: '800',
  },

  name: {
    color: textColor.primary,
    ...typography.headingLarge,
    textAlign: 'center',
  },

  meta: {
    color: textColor.muted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  location: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  bio: {
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    textAlign: 'center',
  },

  workCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.green16,
    backgroundColor: alpha.white03,
  },

  pressed: {
    opacity: 0.86,
  },

  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: alpha.green08,
    borderWidth: 1,
    borderColor: alpha.green16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },

  workTitle: {
    color: textColor.primary,
    ...typography.headingSmall,
  },

  workBody: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  skeleton: {
    marginTop: spacing.sm,
  },

  messageCard: {
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
  },

  messageTitle: {
    color: textColor.primary,
    ...typography.headingSmall,
  },

  messageBody: {
    marginTop: spacing.xs,
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
  },

  retry: {
    marginTop: spacing.md,
    minHeight: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.opportunityGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },

  retryText: {
    color: textColor.inverse,
    fontWeight: '800',
  },
});
