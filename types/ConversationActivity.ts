export const MARKET_OFFER_ACTIVITY_EVENT_TYPES = [
  'offer_created',
  'offer_accepted',
  'offer_declined',
  'offer_withdrawn',
] as const;

export type MarketOfferActivityEventType =
  (typeof MARKET_OFFER_ACTIVITY_EVENT_TYPES)[number];

/**
 * Visible Migration 028 conversation_activity row.
 * Market v1: source_kind market_offer only.
 */
export type ConversationActivityRecord = {
  id: string;
  conversationId: string;
  sourceKind: 'market_offer';
  sourceId: string;
  eventType: MarketOfferActivityEventType;
  actorId: string;
  amount: number;
  currency: 'AUD';
  createdAt: string;
};

export function isMarketOfferActivityEventType(
  value: string,
): value is MarketOfferActivityEventType {
  return (
    value === 'offer_created' ||
    value === 'offer_accepted' ||
    value === 'offer_declined' ||
    value === 'offer_withdrawn'
  );
}
