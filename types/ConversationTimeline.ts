import type {
  ChatMessage,
} from './Messaging';

import type {
  MarketOffer,
} from './MarketOffer';

export type ConversationTimelineMessage = {
  id: string;

  type: 'message';

  createdAt: string;

  message: ChatMessage;
};

export type ConversationTimelineOffer = {
  id: string;

  type: 'offer';

  createdAt: string;

  offer: MarketOffer;
};

export type ConversationTimelineItem =
  | ConversationTimelineMessage
  | ConversationTimelineOffer;

export function createMessageTimelineItem(
  message: ChatMessage,
): ConversationTimelineMessage {
  return {
    id: `timeline-message-${message.id}`,

    type: 'message',

    createdAt:
      message.createdAt,

    message,
  };
}

export function createOfferTimelineItem(
  offer: MarketOffer,
): ConversationTimelineOffer {
  return {
    id: `timeline-offer-${offer.id}`,

    type: 'offer',

    createdAt:
      offer.createdAt,

    offer,
  };
}