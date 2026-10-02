import { supabase } from '../../lib/supabase';

import type { ConversationActivityRecord } from '../../types/ConversationActivity';
import { isMarketOfferActivityEventType } from '../../types/ConversationActivity';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const MAX_AMOUNT = 9_999_999_999.99;

const ACTIVITY_SELECT =
  'id, conversation_id, source_kind, source_id, event_type, actor_id, amount, currency, created_at';

type ActivityRow = {
  id: unknown;
  conversation_id: unknown;
  source_kind: unknown;
  source_id: unknown;
  event_type: unknown;
  actor_id: unknown;
  amount: unknown;
  currency: unknown;
  created_at: unknown;
};

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.trim().toLowerCase());
}

function asUuid(value: unknown): string | null {
  if (typeof value !== 'string' || !isUuid(value)) {
    return null;
  }

  return value.trim().toLowerCase();
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

function adaptActivityRow(row: ActivityRow): ConversationActivityRecord | null {
  const id = asUuid(row.id);
  const conversationId = asUuid(row.conversation_id);
  const sourceId = asUuid(row.source_id);
  const actorId = asUuid(row.actor_id);
  const createdAt = asIsoTimestamp(row.created_at);
  const amount = asAmount(row.amount);

  if (
    !id ||
    !conversationId ||
    !sourceId ||
    !actorId ||
    !createdAt ||
    amount === null
  ) {
    return null;
  }

  if (row.source_kind !== 'market_offer' || row.currency !== 'AUD') {
    return null;
  }

  if (
    typeof row.event_type !== 'string' ||
    !isMarketOfferActivityEventType(row.event_type)
  ) {
    return null;
  }

  return {
    id,
    conversationId,
    sourceKind: 'market_offer',
    sourceId,
    eventType: row.event_type,
    actorId,
    amount,
    currency: 'AUD',
    createdAt,
  };
}

function uniqueConversationIds(conversationIds: string[]): string[] {
  return [
    ...new Set(
      conversationIds
        .map((conversationId) => conversationId.trim().toLowerCase())
        .filter((conversationId) => isUuid(conversationId)),
    ),
  ];
}

async function loadVisibleActivityRows(
  conversationIds: string[],
): Promise<{
  rows: ConversationActivityRecord[];
  error: string | null;
}> {
  const ids = uniqueConversationIds(conversationIds);

  if (ids.length === 0) {
    return {
      rows: [],
      error: null,
    };
  }

  const loaded = await supabase
    .from('conversation_activity')
    .select(ACTIVITY_SELECT)
    .eq('source_kind', 'market_offer')
    .in('conversation_id', ids)
    .order('created_at', { ascending: false });

  if (loaded.error) {
    return {
      rows: [],
      error: loaded.error.message,
    };
  }

  const rows: ConversationActivityRecord[] = [];

  for (const raw of loaded.data ?? []) {
    const adapted = adaptActivityRow(raw as ActivityRow);

    if (!adapted) {
      continue;
    }

    rows.push(adapted);
  }

  return {
    rows,
    error: null,
  };
}

export async function listLatestActivityForConversations(
  conversationIds: string[],
): Promise<{
  latestByConversation: Record<string, ConversationActivityRecord>;
  error: string | null;
}> {
  const loaded = await loadVisibleActivityRows(conversationIds);

  if (loaded.error) {
    console.warn(
      '[Direct Gain] Unable to load conversation activity for inbox:',
      loaded.error,
    );

    return {
      latestByConversation: {},
      error: loaded.error,
    };
  }

  const latestByConversation: Record<string, ConversationActivityRecord> = {};

  for (const row of loaded.rows) {
    if (latestByConversation[row.conversationId]) {
      continue;
    }

    latestByConversation[row.conversationId] = row;
  }

  return {
    latestByConversation,
    error: null,
  };
}

export async function getLatestActivityCreatedAt(
  conversationId: string,
): Promise<string | null> {
  const id = asUuid(conversationId);

  if (!id) {
    return null;
  }

  const loaded = await supabase
    .from('conversation_activity')
    .select('created_at')
    .eq('conversation_id', id)
    .eq('source_kind', 'market_offer')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (loaded.error) {
    console.warn(
      '[Direct Gain] Unable to load latest conversation activity time:',
      loaded.error.message,
    );

    return null;
  }

  return asIsoTimestamp(loaded.data?.created_at);
}

export async function countUnreadOfferActivity(input: {
  conversationIds: string[];
  viewerId: string;
  lastReadByConversation: Map<string, string>;
}): Promise<Record<string, number>> {
  const originalIds = [
    ...new Set(
      input.conversationIds.filter((conversationId) =>
        isUuid(conversationId.trim().toLowerCase()),
      ),
    ),
  ];
  const empty = Object.fromEntries(originalIds.map((id) => [id, 0]));

  if (originalIds.length === 0 || !isUuid(input.viewerId)) {
    return empty;
  }

  const keyByLower = new Map(
    originalIds.map((id) => [id.trim().toLowerCase(), id]),
  );
  const loaded = await loadVisibleActivityRows(originalIds);

  if (loaded.error) {
    return empty;
  }

  const counts = { ...empty };
  const viewerId = input.viewerId.trim().toLowerCase();

  for (const row of loaded.rows) {
    if (row.actorId === viewerId) {
      continue;
    }

    const conversationKey =
      keyByLower.get(row.conversationId) ?? row.conversationId;
    const lastReadAt =
      input.lastReadByConversation.get(conversationKey) ??
      input.lastReadByConversation.get(row.conversationId);

    if (lastReadAt) {
      const activityTime = Date.parse(row.createdAt);
      const readTime = Date.parse(lastReadAt);

      if (
        !Number.isFinite(activityTime) ||
        !Number.isFinite(readTime) ||
        activityTime <= readTime
      ) {
        continue;
      }
    }

    counts[conversationKey] = (counts[conversationKey] ?? 0) + 1;
  }

  return counts;
}
