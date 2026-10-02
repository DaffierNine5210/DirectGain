import { formatMarketOfferAmount } from '../../utils/market/parseMarketOfferAmount';

import type { ConversationActivityRecord } from '../../types/ConversationActivity';

export function getInboxActivityPreview(
  activity: ConversationActivityRecord,
  viewerId: string,
): string {
  const amount = formatMarketOfferAmount(
    activity.amount,
    activity.currency,
  );
  const actorIsViewer =
    activity.actorId.toLowerCase() === viewerId.toLowerCase();

  switch (activity.eventType) {
    case 'offer_created':
      return actorIsViewer
        ? `You made an offer of ${amount}`
        : `New offer: ${amount}`;
    case 'offer_accepted':
      return actorIsViewer
        ? `You accepted an offer of ${amount}`
        : `Your offer of ${amount} was accepted`;
    case 'offer_declined':
      return actorIsViewer
        ? `You declined an offer of ${amount}`
        : `Your offer of ${amount} was declined`;
    case 'offer_withdrawn':
      return actorIsViewer
        ? `You withdrew an offer of ${amount}`
        : `Offer withdrawn: ${amount}`;
  }
}

export function laterTimestamp(
  first: string | null | undefined,
  second: string | null | undefined,
): string | null {
  const firstMs = first ? Date.parse(first) : Number.NaN;
  const secondMs = second ? Date.parse(second) : Number.NaN;
  const firstOk = Number.isFinite(firstMs);
  const secondOk = Number.isFinite(secondMs);

  if (firstOk && secondOk) {
    return firstMs >= secondMs ? first ?? null : second ?? null;
  }

  if (firstOk) {
    return first ?? null;
  }

  if (secondOk) {
    return second ?? null;
  }

  return null;
}
