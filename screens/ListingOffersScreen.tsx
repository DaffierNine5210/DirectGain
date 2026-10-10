import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
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
import OwnerListingOfferRow from '../components/market/OwnerListingOfferRow';

import useTabBarVisibility from '../hooks/useTabBarVisibility';

import type { MarketStackParamList } from '../navigation/MarketStack';

import { listOffersForListing } from '../services/market/marketOffersRepository';
import { getOwnMarketListing } from '../services/market/marketListingsRepository';
import { getProfilesByIds } from '../services/profile/profileRepository';
import formatListingPrice from '../utils/listing/formatListingPrice';
import { formatMarketOfferAmount } from '../utils/market/parseMarketOfferAmount';

import type { MarketOfferLifecycleStatus, MarketOfferRecord } from '../types/MarketOffer';
import type { OwnMarketListing } from '../types/marketListing';

import {
  alpha,
  layout,
  palette,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../theme/designSystem';

type Props = NativeStackScreenProps<
  MarketStackParamList,
  'ListingOffers'
>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const FALLBACK_BUYER_NAME = 'Direct Gain member';

const PREVIOUS_STATUSES: ReadonlySet<MarketOfferLifecycleStatus> = new Set([
  'accepted',
  'declined',
  'withdrawn',
]);

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.toLowerCase());
}

function formatOfferTimestamp(iso: string): string {
  const parsed = Date.parse(iso);

  if (!Number.isFinite(parsed)) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(parsed));
}

function offerStatusLabel(status: MarketOfferLifecycleStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'accepted':
      return 'Accepted';
    case 'declined':
      return 'Declined';
    case 'withdrawn':
      return 'Withdrawn';
  }
}

function offerSortTime(offer: MarketOfferRecord): number {
  const iso =
    offer.status === 'pending'
      ? offer.createdAt
      : (offer.respondedAt ?? offer.createdAt);
  const parsed = Date.parse(iso);

  return Number.isFinite(parsed) ? parsed : 0;
}

function compareOffersNewestFirst(
  left: MarketOfferRecord,
  right: MarketOfferRecord,
): number {
  const delta = offerSortTime(right) - offerSortTime(left);

  if (delta !== 0) {
    return delta;
  }

  return right.id.localeCompare(left.id);
}

function listingStatusLabel(listing: OwnMarketListing): string {
  switch (listing.status) {
    case 'draft':
      return 'Draft';
    case 'active':
      return 'Active';
    case 'paused':
      return 'Paused';
    case 'reserved':
      return 'Reserved';
    case 'sold':
      return 'Sold';
    case 'removed':
      return 'Removed';
  }
}

function emptyOffersCopy(listing: OwnMarketListing): {
  title: string;
  body: string;
} {
  if (listing.price === 0 || !listing.allowsOffers) {
    return {
      title: 'No offers',
      body: 'This listing is not accepting offers.',
    };
  }

  return {
    title: 'No offers yet',
    body: 'Offers on this listing will appear here.',
  };
}

export default function ListingOffersScreen({
  navigation,
  route,
}: Props) {
  const { listingId } = route.params;
  const { showTabBar } = useTabBarVisibility();

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const loadRef = useRef<(showSpinner: boolean) => Promise<void>>(
    async () => {},
  );

  const [listing, setListing] = useState<OwnMarketListing | null>(null);
  const [offers, setOffers] = useState<MarketOfferRecord[]>([]);
  const [buyerNames, setBuyerNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (showSpinner: boolean) => {
    const requestId = ++requestIdRef.current;

    if (showSpinner) {
      setLoading(true);
    }

    const owned = await getOwnMarketListing(listingId);

    if (requestId !== requestIdRef.current || !mountedRef.current) {
      return;
    }

    if (owned.error || !owned.listing) {
      setLoading(false);
      setRefreshing(false);
      hasLoadedRef.current = true;
      setListing(null);
      setOffers([]);
      setBuyerNames({});
      setError(owned.error ?? "Couldn't load this listing.");
      return;
    }

    const ownedListing = owned.listing.listing;
    const listed = await listOffersForListing(ownedListing.id);

    if (requestId !== requestIdRef.current || !mountedRef.current) {
      return;
    }

    if (listed.error) {
      setLoading(false);
      setRefreshing(false);
      hasLoadedRef.current = true;
      setListing(ownedListing);
      setOffers([]);
      setBuyerNames({});
      setError(listed.error);
      return;
    }

    const ownedOffers = listed.offers.filter(
      (offer) =>
        offer.listingId === ownedListing.id &&
        offer.sellerId === ownedListing.sellerProfileId,
    );

    const buyerIds = ownedOffers.map((offer) => offer.buyerId);
    const profiles = await getProfilesByIds(buyerIds);

    if (requestId !== requestIdRef.current || !mountedRef.current) {
      return;
    }

    const names: Record<string, string> = {};

    if (!profiles.error) {
      for (const profile of profiles.profiles) {
        const name = profile.displayName.trim();

        if (name.length > 0) {
          names[profile.id.toLowerCase()] = name;
        }
      }
    }

    setListing(ownedListing);
    setOffers(ownedOffers);
    setBuyerNames(names);
    setError(null);
    setLoading(false);
    setRefreshing(false);
    hasLoadedRef.current = true;
  }, [listingId]);

  loadRef.current = loadPage;

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
    void loadPage(true);

    return () => {
      mountedRef.current = false;
    };
  }, [loadPage]);

  const pendingOffers = useMemo(
    () =>
      offers
        .filter((offer) => offer.status === 'pending')
        .sort(compareOffersNewestFirst),
    [offers],
  );

  const previousOffers = useMemo(
    () =>
      offers
        .filter((offer) => PREVIOUS_STATUSES.has(offer.status))
        .sort(compareOffersNewestFirst),
    [offers],
  );

  function openConversation(offer: MarketOfferRecord) {
    if (!isUuid(offer.conversationId) || !listing) {
      Alert.alert(
        'Conversation unavailable',
        "This offer's conversation couldn't be opened.",
      );
      return;
    }

    navigation.navigate('Conversation', {
      conversationId: offer.conversationId,
      listingId: listing.id,
    });
  }

  function buyerNameFor(offer: MarketOfferRecord): string {
    return buyerNames[offer.buyerId] ?? FALLBACK_BUYER_NAME;
  }

  function dateLabelFor(offer: MarketOfferRecord): string {
    const iso =
      offer.status === 'pending'
        ? offer.createdAt
        : (offer.respondedAt ?? offer.createdAt);

    return formatOfferTimestamp(iso);
  }

  const askingPrice = listing
    ? formatListingPrice(listing.price, listing.currency)
    : null;
  const emptyCopy = listing ? emptyOffersCopy(listing) : null;
  const offersReady = !loading && !error && listing !== null;
  const hasOffers = pendingOffers.length > 0 || previousOffers.length > 0;

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <DGHeader
        showBackButton
        title="Offers"
        subtitle={listing?.title}
        onBackPress={() => {
          navigation.goBack();
        }}
        style={styles.header}
        topRowStyle={styles.headerRow}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadPage(false);
            }}
            tintColor={palette.opportunityGreen}
          />
        }
      >
        {loading ? (
          <View style={styles.summaryCard}>
            <DGSkeleton width="42%" height={12} />
            <DGSkeleton width="68%" height={18} />
            <DGSkeleton width="36%" height={12} />
          </View>
        ) : error || !listing ? (
          <View style={styles.summaryCard}>
            <Text style={styles.emptyTitle}>
              Offers couldn't be loaded
            </Text>
            <Text style={styles.emptyBody}>
              {error ?? "Couldn't load this listing."}
            </Text>
            <Pressable
              onPress={() => {
                void loadPage(true);
              }}
              style={styles.retry}
              accessibilityRole="button"
              accessibilityLabel="Retry loading offers"
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              {askingPrice ? (
                <Text style={styles.askingPrice}>{askingPrice}</Text>
              ) : null}
              <Text style={styles.summaryMeta}>
                {listingStatusLabel(listing)}
                {' · '}
                {pendingOffers.length} pending
                {' · '}
                {previousOffers.length} previous
              </Text>
            </View>

            {offersReady && !hasOffers ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>{emptyCopy?.title}</Text>
                <Text style={styles.emptyBody}>{emptyCopy?.body}</Text>
              </View>
            ) : null}

            {pendingOffers.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>PENDING</Text>
                {pendingOffers.map((offer) => (
                  <OwnerListingOfferRow
                    key={offer.id}
                    buyerDisplayName={buyerNameFor(offer)}
                    amountLabel={formatMarketOfferAmount(
                      offer.amount,
                      offer.currency,
                    )}
                    statusLabel={offerStatusLabel(offer.status)}
                    dateLabel={dateLabelFor(offer)}
                    conversationAvailable={isUuid(offer.conversationId)}
                    onViewConversation={() => {
                      openConversation(offer);
                    }}
                  />
                ))}
              </View>
            ) : null}

            {previousOffers.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>PREVIOUS</Text>
                {previousOffers.map((offer) => (
                  <OwnerListingOfferRow
                    key={offer.id}
                    buyerDisplayName={buyerNameFor(offer)}
                    amountLabel={formatMarketOfferAmount(
                      offer.amount,
                      offer.currency,
                    )}
                    statusLabel={offerStatusLabel(offer.status)}
                    dateLabel={dateLabelFor(offer)}
                    conversationAvailable={isUuid(offer.conversationId)}
                    onViewConversation={() => {
                      openConversation(offer);
                    }}
                  />
                ))}
              </View>
            ) : null}
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

  header: {
    paddingTop: spacing.xxs,
    paddingBottom: 0,
  },

  headerRow: {
    minHeight: 46,
  },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: 0,
    paddingBottom: layout.bottomNavigationClearance,
    gap: spacing.sm,
  },

  summaryCard: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.card,
    gap: 4,
  },

  askingPrice: {
    color: palette.opportunityGreen,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },

  summaryMeta: {
    color: textColor.secondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  section: {
    gap: spacing.xs,
  },

  sectionLabel: {
    ...typography.eyebrow,
    color: textColor.muted,
    marginLeft: 2,
  },

  emptyCard: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.card,
    gap: 4,
  },

  emptyTitle: {
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },

  emptyBody: {
    color: textColor.secondary,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: typography.bodySmall.lineHeight,
    fontWeight: '500',
  },

  retry: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingVertical: 6,
  },

  retryText: {
    color: palette.opportunityGreen,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
});
