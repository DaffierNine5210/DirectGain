import { supabase } from '../../lib/supabase';

import type {
  MarketOfferLifecycleStatus,
  MarketOfferRecord,
  MarketOfferRole,
} from '../../types/MarketOffer';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const MARKET_OFFER_SELECT =
  'id, conversation_id, listing_id, buyer_id, seller_id, amount, currency, status, created_by_role, message, parent_offer_id, created_at, updated_at, responded_at';

const MAX_AMOUNT = 9_999_999_999.99;

const LIFECYCLE_STATUSES: readonly MarketOfferLifecycleStatus[] = [
  'pending',
  'accepted',
  'declined',
  'withdrawn',
];

type MarketOfferRow = {
  id: unknown;
  conversation_id: unknown;
  listing_id: unknown;
  buyer_id: unknown;
  seller_id: unknown;
  amount: unknown;
  currency: unknown;
  status: unknown;
  created_by_role?: unknown;
  message?: unknown;
  parent_offer_id?: unknown;
  created_at: unknown;
  updated_at?: unknown;
  responded_at?: unknown;
};

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.toLowerCase());
}

function asUuid(value: unknown): string | null {
  if (typeof value !== 'string' || !isUuid(value)) {
    return null;
  }

  return value.toLowerCase();
}

function asIsoTimestamp(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const parsed = Date.parse(value);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return value;
}

function asAmount(value: unknown): number | null {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0 || value > MAX_AMOUNT) {
      return null;
    }

    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > MAX_AMOUNT) {
      return null;
    }

    return parsed;
  }

  return null;
}

function asLifecycleStatus(
  value: unknown,
): MarketOfferLifecycleStatus | null {
  if (
    value === 'pending' ||
    value === 'accepted' ||
    value === 'declined' ||
    value === 'withdrawn'
  ) {
    return value;
  }

  return null;
}

function asRole(value: unknown): MarketOfferRole | null {
  if (value === 'buyer' || value === 'seller') {
    return value;
  }

  return null;
}

function asOptionalText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length === 0 ? null : trimmed;
}

function adaptMarketOfferRow(
  value: unknown,
  options: {
    requireCreatedByRole: boolean;
  },
): MarketOfferRecord | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const row = value as MarketOfferRow;

  const id = asUuid(row.id);
  const conversationId = asUuid(row.conversation_id);
  const listingId = asUuid(row.listing_id);
  const buyerId = asUuid(row.buyer_id);
  const sellerId = asUuid(row.seller_id);
  const amount = asAmount(row.amount);
  const createdAt = asIsoTimestamp(row.created_at);
  const status = asLifecycleStatus(row.status);

  if (
    !id ||
    !conversationId ||
    !listingId ||
    !buyerId ||
    !sellerId ||
    amount === null ||
    !createdAt ||
    !status
  ) {
    return null;
  }

  if (row.currency !== 'AUD') {
    return null;
  }

  if (
    row.status === 'countered' ||
    row.status === 'expired'
  ) {
    return null;
  }

  if (!LIFECYCLE_STATUSES.includes(status)) {
    return null;
  }

  let createdByRole: MarketOfferRole | null = null;

  if ('created_by_role' in row && row.created_by_role != null) {
    createdByRole = asRole(row.created_by_role);

    if (!createdByRole) {
      return null;
    }
  } else if (options.requireCreatedByRole) {
    return null;
  }

  const parentOfferId =
    row.parent_offer_id === null || row.parent_offer_id === undefined
      ? null
      : asUuid(row.parent_offer_id);

  if (
    row.parent_offer_id !== null &&
    row.parent_offer_id !== undefined &&
    parentOfferId === null
  ) {
    return null;
  }

  const updatedAt =
    row.updated_at === null || row.updated_at === undefined
      ? null
      : asIsoTimestamp(row.updated_at);

  if (
    row.updated_at !== null &&
    row.updated_at !== undefined &&
    updatedAt === null
  ) {
    return null;
  }

  const respondedAt =
    row.responded_at === null || row.responded_at === undefined
      ? null
      : asIsoTimestamp(row.responded_at);

  if (
    row.responded_at !== null &&
    row.responded_at !== undefined &&
    respondedAt === null
  ) {
    return null;
  }

  if (row.message !== null && row.message !== undefined && typeof row.message !== 'string') {
    return null;
  }

  return {
    id,
    conversationId,
    listingId,
    buyerId,
    sellerId,
    amount,
    currency: 'AUD',
    status,
    createdByRole,
    message: asOptionalText(row.message),
    parentOfferId,
    createdAt,
    respondedAt,
    updatedAt,
  };
}

function firstRpcPayload(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data[0] ?? null;
  }

  return data;
}

function formatOfferError(
  error: {
    message?: string;
    code?: string;
  } | null,
  fallback: string,
): string {
  if (!error?.message) {
    return fallback;
  }

  const message = error.message.trim();
  const lowered = message.toLowerCase();
  const firstLine = message.split('\n')[0]?.trim() ?? '';

  if (
    error.code === '42501' ||
    lowered.includes('row-level security') ||
    lowered.includes('permission denied')
  ) {
    return 'You do not have permission to do that.';
  }

  if (lowered.includes('network')) {
    return 'Check your connection and try again.';
  }

  if (lowered.includes('you must be signed in')) {
    return 'Sign in to continue.';
  }

  if (lowered.includes('you cannot make an offer on your own listing')) {
    return 'You cannot make an offer on your own listing.';
  }

  if (lowered.includes('not accepting new offers')) {
    return 'This listing is not accepting new offers.';
  }

  if (lowered.includes('not accepting offers')) {
    return 'This listing is not accepting offers.';
  }

  if (lowered.includes('this listing is not available')) {
    return 'This listing is not available.';
  }

  if (lowered.includes('no longer pending')) {
    return 'This offer is no longer pending.';
  }

  if (lowered.includes('this offer could not be updated')) {
    return 'This offer could not be updated.';
  }

  if (lowered.includes('two decimal')) {
    return 'Enter an amount with at most two decimal places.';
  }

  if (lowered.includes('enter a valid amount')) {
    return 'Enter a valid amount.';
  }

  if (lowered.includes('offer message is too long')) {
    return 'Offer message is too long.';
  }

  if (
    lowered.includes('postgres') ||
    lowered.includes('function') ||
    lowered.includes('sql') ||
    lowered.includes('schema') ||
    lowered.includes('jwt') ||
    lowered.includes('token')
  ) {
    return fallback;
  }

  if (firstLine.length > 0 && firstLine.length <= 160) {
    return firstLine;
  }

  return fallback;
}

function warnSkippedOffer(reason: string) {
  if (__DEV__) {
    console.warn(
      '[Direct Gain] Skipped a market offer row:',
      reason,
    );
  }
}

async function invokeOfferRpc(
  rpcName:
    | 'create_market_offer'
    | 'accept_market_offer'
    | 'decline_market_offer'
    | 'withdraw_market_offer',
  args: Record<string, unknown>,
  fallback: string,
): Promise<{
  offer: MarketOfferRecord | null;
  error: string | null;
}> {
  const result = await supabase.rpc(rpcName, args);

  if (result.error) {
    return {
      offer: null,
      error: formatOfferError(result.error, fallback),
    };
  }

  const adapted = adaptMarketOfferRow(firstRpcPayload(result.data), {
    requireCreatedByRole: false,
  });

  if (!adapted) {
    return {
      offer: null,
      error: fallback,
    };
  }

  return {
    offer: {
      ...adapted,
      createdByRole: adapted.createdByRole ?? 'buyer',
    },
    error: null,
  };
}

export async function createMarketOffer(input: {
  listingId: string;
  amount: number;
  message?: string | null;
}): Promise<{
  offer: MarketOfferRecord | null;
  error: string | null;
}> {
  const listingId = input.listingId.trim().toLowerCase();

  if (!isUuid(listingId)) {
    return {
      offer: null,
      error: 'This listing is not available.',
    };
  }

  const message =
    typeof input.message === 'string'
      ? input.message.trim() || null
      : null;

  return invokeOfferRpc(
    'create_market_offer',
    {
      p_listing_id: listingId,
      p_amount: input.amount,
      p_message: message,
    },
    'This offer could not be created.',
  );
}

export async function listOffersForConversation(
  conversationId: string,
): Promise<{
  offers: MarketOfferRecord[];
  error: string | null;
}> {
  const id = conversationId.trim().toLowerCase();

  if (!isUuid(id)) {
    return {
      offers: [],
      error: 'This conversation could not be loaded.',
    };
  }

  const loaded = await supabase
    .from('market_offers')
    .select(MARKET_OFFER_SELECT)
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true });

  if (loaded.error) {
    return {
      offers: [],
      error: formatOfferError(
        loaded.error,
        'Offers could not be loaded.',
      ),
    };
  }

  const offers: MarketOfferRecord[] = [];

  for (const row of loaded.data ?? []) {
    const adapted = adaptMarketOfferRow(row, {
      requireCreatedByRole: true,
    });

    if (!adapted) {
      warnSkippedOffer('unsupported or invalid row');
      continue;
    }

    offers.push(adapted);
  }

  return {
    offers,
    error: null,
  };
}

export async function listOffersForListing(
  listingId: string,
): Promise<{
  offers: MarketOfferRecord[];
  error: string | null;
}> {
  const id = listingId.trim().toLowerCase();

  if (!isUuid(id)) {
    return {
      offers: [],
      error: 'This listing is not available.',
    };
  }

  const loaded = await supabase
    .from('market_offers')
    .select(MARKET_OFFER_SELECT)
    .eq('listing_id', id)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true });

  if (loaded.error) {
    return {
      offers: [],
      error: formatOfferError(
        loaded.error,
        'Offers could not be loaded.',
      ),
    };
  }

  const offers: MarketOfferRecord[] = [];

  for (const row of loaded.data ?? []) {
    const adapted = adaptMarketOfferRow(row, {
      requireCreatedByRole: true,
    });

    if (!adapted) {
      warnSkippedOffer('unsupported or invalid row');
      continue;
    }

    offers.push(adapted);
  }

  return {
    offers,
    error: null,
  };
}

export async function acceptMarketOffer(
  offerId: string,
): Promise<{
  offer: MarketOfferRecord | null;
  error: string | null;
}> {
  const id = offerId.trim().toLowerCase();

  if (!isUuid(id)) {
    return {
      offer: null,
      error: 'This offer could not be updated.',
    };
  }

  return invokeOfferRpc(
    'accept_market_offer',
    { p_offer_id: id },
    'This offer could not be updated.',
  );
}

export async function declineMarketOffer(
  offerId: string,
): Promise<{
  offer: MarketOfferRecord | null;
  error: string | null;
}> {
  const id = offerId.trim().toLowerCase();

  if (!isUuid(id)) {
    return {
      offer: null,
      error: 'This offer could not be updated.',
    };
  }

  return invokeOfferRpc(
    'decline_market_offer',
    { p_offer_id: id },
    'This offer could not be updated.',
  );
}

export async function withdrawMarketOffer(
  offerId: string,
): Promise<{
  offer: MarketOfferRecord | null;
  error: string | null;
}> {
  const id = offerId.trim().toLowerCase();

  if (!isUuid(id)) {
    return {
      offer: null,
      error: 'This offer could not be updated.',
    };
  }

  return invokeOfferRpc(
    'withdraw_market_offer',
    { p_offer_id: id },
    'This offer could not be updated.',
  );
}
