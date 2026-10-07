import type { ConversationEntryIntent } from './MessagesStack';
import type { PublicProfileParamList } from './publicProfile';

export type MarketListingFlowParamList = {
  ListingDetail: {
    listingId: string;
  };

  Conversation: {
    conversationId: string;

    listingId?: string;

    intent?: ConversationEntryIntent;
  };
} & PublicProfileParamList;
