import { supabase } from '../../lib/supabase';

import {
  getCurrentMessagingUser,
} from './currentMessagingUser';

export type OpenMarketConversationInput = {
  listingId: string;

  listingTitle: string;

  sellerId: string;
};

export type OpenMarketConversationResult = {
  conversationId: string;

  currentUserRole:
    | 'buyer'
    | 'seller';

  created: boolean;
};

export async function openMarketConversation(
  input: OpenMarketConversationInput,
): Promise<OpenMarketConversationResult | null> {
  console.log(
    '[Direct Gain] Opening market conversation...',
    {
      listingId:
        input.listingId,

      listingTitle:
        input.listingTitle,

      sellerId:
        input.sellerId,
    },
  );

  const currentUser =
    await getCurrentMessagingUser();

  if (!currentUser) {
    console.warn(
      '[Direct Gain] STEP 1 FAILED: No authenticated messaging user.',
    );

    return null;
  }

  const currentUserId =
    currentUser.userId;

  console.log(
    '[Direct Gain] STEP 1 OK: Current user:',
    currentUserId,
  );

  console.log(
    '[Direct Gain] Seller ID:',
    input.sellerId,
  );

  const currentUserRole:
    | 'buyer'
    | 'seller' =
    currentUserId ===
    input.sellerId
      ? 'seller'
      : 'buyer';

  console.log(
    '[Direct Gain] Current user role:',
    currentUserRole,
  );

  if (
    currentUserRole ===
    'seller'
  ) {
    console.warn(
      '[Direct Gain] STEP 2 FAILED: Current user is the seller of this listing.',
    );

    return null;
  }

  console.log(
    '[Direct Gain] STEP 2: Searching for existing conversation...',
  );

  const existingConversation =
    await findExistingMarketConversation({
      listingId:
        input.listingId,

      buyerId:
        currentUserId,

      sellerId:
        input.sellerId,
    });

  if (existingConversation) {
    console.log(
      '[Direct Gain] STEP 2 OK: Existing conversation found:',
      existingConversation.id,
    );

    return {
      conversationId:
        existingConversation.id,

      currentUserRole:
        'buyer',

      created: false,
    };
  }

  console.log(
    '[Direct Gain] STEP 2: No existing conversation found.',
  );

  console.log(
    '[Direct Gain] STEP 3: Creating conversation...',
  );

  const {
    data: conversation,
    error:
      conversationError,
  } = await supabase
    .from(
      'conversations',
    )
    .insert({
      context_type:
        'market',

      context_id:
        input.listingId,

      title:
        input.listingTitle,

      created_by:
        currentUserId,
    })
    .select(
      'id',
    )
    .single();

  if (conversationError) {
    console.warn(
      '[Direct Gain] STEP 3 FAILED: Unable to create conversation.',
      {
        message:
          conversationError.message,

        code:
          conversationError.code,

        details:
          conversationError.details,

        hint:
          conversationError.hint,
      },
    );

    return null;
  }

  if (!conversation) {
    console.warn(
      '[Direct Gain] STEP 3 FAILED: Supabase returned no conversation.',
    );

    return null;
  }

  console.log(
    '[Direct Gain] STEP 3 OK: Conversation created:',
    conversation.id,
  );

  const participants = [
    {
      conversation_id:
        conversation.id,

      user_id:
        currentUserId,

      role:
        'buyer',
    },

    {
      conversation_id:
        conversation.id,

      user_id:
        input.sellerId,

      role:
        'seller',
    },
  ];

  console.log(
    '[Direct Gain] STEP 4: Creating participants...',
    participants,
  );

  const {
    error:
      participantError,
  } = await supabase
    .from(
      'conversation_participants',
    )
    .insert(
      participants,
    );

  if (participantError) {
    console.warn(
      '[Direct Gain] STEP 4 FAILED: Unable to create participants.',
      {
        message:
          participantError.message,

        code:
          participantError.code,

        details:
          participantError.details,

        hint:
          participantError.hint,
      },
    );

    console.log(
      '[Direct Gain] Removing incomplete conversation:',
      conversation.id,
    );

    const {
      error:
        cleanupError,
    } = await supabase
      .from(
        'conversations',
      )
      .delete()
      .eq(
        'id',
        conversation.id,
      );

    if (cleanupError) {
      console.warn(
        '[Direct Gain] Cleanup failed:',
        cleanupError.message,
      );
    }

    return null;
  }

  console.log(
    '[Direct Gain] STEP 4 OK: Participants created.',
  );

  console.log(
    '[Direct Gain] MARKET CONVERSATION READY:',
    conversation.id,
  );

  return {
    conversationId:
      conversation.id,

    currentUserRole:
      'buyer',

    created: true,
  };
}

type ExistingConversationInput = {
  listingId: string;

  buyerId: string;

  sellerId: string;
};

async function findExistingMarketConversation(
  input: ExistingConversationInput,
): Promise<{
  id: string;
} | null> {
  console.log(
    '[Direct Gain] Searching buyer conversations...',
  );

  const {
    data:
      buyerParticipants,
    error:
      buyerError,
  } = await supabase
    .from(
      'conversation_participants',
    )
    .select(
      'conversation_id',
    )
    .eq(
      'user_id',
      input.buyerId,
    )
    .eq(
      'role',
      'buyer',
    );

  if (buyerError) {
    console.warn(
      '[Direct Gain] Existing conversation buyer search failed:',
      {
        message:
          buyerError.message,

        code:
          buyerError.code,

        details:
          buyerError.details,

        hint:
          buyerError.hint,
      },
    );

    return null;
  }

  const conversationIds =
    buyerParticipants?.map(
      item =>
        item.conversation_id,
    ) ?? [];

  console.log(
    '[Direct Gain] Buyer conversation IDs:',
    conversationIds,
  );

  if (
    conversationIds.length ===
    0
  ) {
    return null;
  }

  console.log(
    '[Direct Gain] Searching seller participation...',
  );

  const {
    data:
      sellerParticipants,
    error:
      sellerError,
  } = await supabase
    .from(
      'conversation_participants',
    )
    .select(
      'conversation_id',
    )
    .eq(
      'user_id',
      input.sellerId,
    )
    .eq(
      'role',
      'seller',
    )
    .in(
      'conversation_id',
      conversationIds,
    );

  if (sellerError) {
    console.warn(
      '[Direct Gain] Existing conversation seller search failed:',
      {
        message:
          sellerError.message,

        code:
          sellerError.code,

        details:
          sellerError.details,

        hint:
          sellerError.hint,
      },
    );

    return null;
  }

  const sharedConversationIds =
    sellerParticipants?.map(
      item =>
        item.conversation_id,
    ) ?? [];

  console.log(
    '[Direct Gain] Shared conversation IDs:',
    sharedConversationIds,
  );

  if (
    sharedConversationIds.length ===
    0
  ) {
    return null;
  }

  const {
    data:
      conversation,
    error:
      conversationError,
  } = await supabase
    .from(
      'conversations',
    )
    .select(
      'id',
    )
    .eq(
      'context_type',
      'market',
    )
    .eq(
      'context_id',
      input.listingId,
    )
    .in(
      'id',
      sharedConversationIds,
    )
    .order(
      'created_at',
      {
        ascending: true,
      },
    )
    .limit(
      1,
    )
    .maybeSingle();

  if (conversationError) {
    console.warn(
      '[Direct Gain] Existing conversation lookup failed:',
      {
        message:
          conversationError.message,

        code:
          conversationError.code,

        details:
          conversationError.details,

        hint:
          conversationError.hint,
      },
    );

    return null;
  }

  return conversation;
}