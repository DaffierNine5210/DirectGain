import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGHeader from '../../components/DGHeader';
import DGSkeleton from '../../components/DGSkeleton';

import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import type { MyGainStackParamList } from '../../navigation/MyGainStack';

import { getOwnIdentityVerification } from '../../services/profile/identityVerificationRepository';

import type { OwnIdentityVerification } from '../../types/identityVerification';

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

type Props = NativeStackScreenProps<
  MyGainStackParamList,
  'IdentityVerification'
>;

type StatusTone = 'neutral' | 'pending' | 'verified' | 'rejected';

function statusTitle(
  state: OwnIdentityVerification,
): string {
  switch (state.kind) {
    case 'not_submitted':
      return 'Not submitted';
    case 'pending':
      return 'In review';
    case 'verified':
      return 'Identity verified';
    case 'rejected':
      return 'Not verified';
  }
}

function statusBody(
  state: OwnIdentityVerification,
): string {
  switch (state.kind) {
    case 'not_submitted':
      return "Identity verification isn't available to start yet. When Direct Gain's identity check is ready, you'll be able to begin here.";
    case 'pending':
      return 'Your identity verification is in review. Direct Gain has not confirmed this identity yet.';
    case 'verified':
      return 'Direct Gain has confirmed the identity of this account holder.';
    case 'rejected':
      return 'Direct Gain could not confirm this identity. You cannot currently resubmit through the app.';
  }
}

function statusPresentation(
  state: OwnIdentityVerification,
): {
  tone: StatusTone;
  icon: keyof typeof Ionicons.glyphMap;
} {
  switch (state.kind) {
    case 'not_submitted':
      return {
        tone: 'neutral',
        icon: 'shield-outline',
      };
    case 'pending':
      return {
        tone: 'pending',
        icon: 'time-outline',
      };
    case 'verified':
      return {
        tone: 'verified',
        icon: 'shield-checkmark',
      };
    case 'rejected':
      return {
        tone: 'rejected',
        icon: 'close-circle-outline',
      };
  }
}

export default function IdentityVerificationScreen({
  navigation,
}: Props) {
  const { hideTabBar } = useTabBarVisibility();
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] =
    useState<OwnIdentityVerification | null>(null);

  const loadState = useCallback(async (showSpinner: boolean) => {
    const requestId = ++requestIdRef.current;

    if (showSpinner) {
      setLoading(true);
    }

    const result = await getOwnIdentityVerification();

    if (
      requestId !== requestIdRef.current ||
      !mountedRef.current
    ) {
      return;
    }

    setLoading(false);

    if (result.error || !result.state) {
      setState(null);
      setError(
        result.error ??
          'Your identity verification could not be loaded. Try again.',
      );
      return;
    }

    setError(null);
    setState(result.state);
  }, []);

  useFocusEffect(
    useCallback(() => {
      hideTabBar();
      mountedRef.current = true;
      void loadState(true);

      return () => {
        mountedRef.current = false;
      };
    }, [hideTabBar, loadState]),
  );

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <DGHeader
        showBackButton
        title="Identity verification"
        onBackPress={() => {
          navigation.goBack();
        }}
      />

      {loading ? (
        <View style={styles.body}>
          <DGSkeleton width="28%" height={11} />
          <DGSkeleton
            width="100%"
            height={108}
            style={styles.skeleton}
          />
          <DGSkeleton
            width="52%"
            height={11}
            style={styles.sectionSkeleton}
          />
          <DGSkeleton width="100%" height={96} />
        </View>
      ) : error || !state ? (
        <View style={styles.body}>
          <Text style={styles.errorTitle}>
            Identity verification could not be loaded
          </Text>
          <Text style={styles.errorBody}>
            {error ??
              'Your identity verification could not be loaded. Try again.'}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading identity verification"
            onPress={() => {
              void loadState(true);
            }}
            style={styles.retry}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.sectionLabel}>STATUS</Text>
          <StatusCard state={state} />

          <Text style={styles.meaningLabel}>
            WHAT IDENTITY VERIFIED MEANS
          </Text>
          <View style={styles.card}>
            <Text style={styles.meaningCopy}>
              Identity Verified confirms that Direct Gain has
              verified who the account holder is.
            </Text>
            <Text style={styles.meaningCopy}>
              It does not verify their skills, licences, work
              quality or professional status.
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function StatusCard({
  state,
}: {
  state: OwnIdentityVerification;
}) {
  const { tone, icon } = statusPresentation(state);
  const iconColor =
    tone === 'verified'
      ? palette.opportunityGreen
      : tone === 'pending'
        ? palette.warning
        : tone === 'rejected'
          ? palette.danger
          : textColor.muted;
  const titleColor =
    tone === 'verified'
      ? palette.opportunityGreen
      : textColor.primary;

  return (
    <View
      style={[
        styles.card,
        tone === 'verified' ? styles.verifiedCard : null,
      ]}
    >
      <View style={styles.statusHeader}>
        <View
          style={[
            styles.iconWrap,
            tone === 'verified'
              ? styles.iconWrapVerified
              : null,
          ]}
        >
          <Ionicons
            name={icon}
            size={iconSize.md}
            color={iconColor}
          />
        </View>
        <Text
          style={[styles.statusTitle, { color: titleColor }]}
        >
          {statusTitle(state)}
        </Text>
      </View>
      <Text style={styles.statusBody}>
        {statusBody(state)}
      </Text>
      {state.kind === 'rejected' ? (
        <View style={styles.reasonBlock}>
          <Text style={styles.reasonLabel}>REASON</Text>
          <Text style={styles.reasonBody}>
            {state.rejectionReason}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: surface.page,
  },

  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.massive,
    gap: spacing.sm,
  },

  skeleton: {
    marginTop: spacing.xxs,
  },

  sectionSkeleton: {
    marginTop: spacing.md,
  },

  sectionLabel: {
    color: textColor.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  meaningLabel: {
    color: textColor.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: spacing.sm,
  },

  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    gap: spacing.sm,
  },

  verifiedCard: {
    borderColor: alpha.green16,
    backgroundColor: surface.cardRaised,
  },

  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.white05,
    borderWidth: 1,
    borderColor: alpha.white08,
  },

  iconWrapVerified: {
    backgroundColor: alpha.green08,
    borderColor: alpha.green16,
  },

  statusTitle: {
    flex: 1,
    color: textColor.primary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },

  statusBody: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },

  reasonBlock: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: alpha.white08,
    gap: spacing.xxs,
  },

  reasonLabel: {
    color: textColor.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  reasonBody: {
    color: textColor.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  meaningCopy: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },

  errorTitle: {
    color: textColor.primary,
    ...typography.headingSmall,
  },

  errorBody: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
  },

  retry: {
    marginTop: spacing.sm,
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
