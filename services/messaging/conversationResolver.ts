import {
  conversations,
} from '../../data/conversations';

import type {
  Conversation,
} from '../../types/Messaging';

type FindMarketConversationOptions = {
  listingId?: string;

  sellerId?: string;
};

export function findMarketConversation({
  listingId,
  sellerId,
}: FindMarketConversationOptions):
  Conversation | undefined {
  return conversations.find(
    conversation => {
      if (
        conversation.context.type !==
        'market'
      ) {
        return false;
      }

      const matchesListing =
        listingId !== undefined &&
        conversation.context.itemId ===
          listingId;

      const matchesSeller =
        sellerId !== undefined &&
        conversation.participant.id ===
          sellerId;

      if (
        listingId !== undefined &&
        sellerId !== undefined
      ) {
        return (
          matchesListing ||
          matchesSeller
        );
      }

      if (
        listingId !== undefined
      ) {
        return matchesListing;
      }

      if (
        sellerId !== undefined
      ) {
        return matchesSeller;
      }

      return false;
    },
  );
}

export function getFallbackMarketConversation():
  Conversation | undefined {
  return conversations.find(
    conversation =>
      conversation.context.type ===
      'market',
  );
}

export function resolveMarketConversation(
  options: FindMarketConversationOptions,
):
  Conversation | undefined {
  return (
    findMarketConversation(
      options,
    ) ??
    getFallbackMarketConversation()
  );
}