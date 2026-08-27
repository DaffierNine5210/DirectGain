import { supabase } from '../../lib/supabase';

import {
  getCurrentMessagingUser,
} from './currentMessagingUser';

export type MessageReadState = {
  conversation_id: string;

  user_id: string;

  last_read_at: string;

  created_at: string;

  updated_at: string;
};

export type MessageReceiptStatus =
  | 'delivered'
  | 'read';

/*
 * Mark the current user's position
 * in a conversation as read.
 *
 * One row is stored per user per
 * conversation. Each time they read
 * newer messages, last_read_at moves
 * forward.
 */
export async function markConversationRead(
  conversationId: string,
): Promise<boolean> {
  const currentUser =
    await getCurrentMessagingUser();

  if (!currentUser) {
    console.warn(
      '[Direct Gain] Cannot mark conversation read without an authenticated user.',
    );

    return false;
  }

  const now =
    new Date().toISOString();

  const {
    error,
  } = await supabase
    .from('message_reads')
    .upsert(
      {
        conversation_id:
          conversationId,

        user_id:
          currentUser.userId,

        last_read_at:
          now,

        updated_at:
          now,
      },
      {
        onConflict:
          'conversation_id,user_id',
      },
    );

  if (error) {
    console.warn(
      '[Direct Gain] Unable to mark conversation as read:',
      error.message,
    );

    return false;
  }

  return true;
}

/*
 * Load one participant's current
 * read position.
 */
export async function getConversationReadState(
  conversationId: string,
  userId: string,
): Promise<MessageReadState | null> {
  const {
    data,
    error,
  } = await supabase
    .from('message_reads')
    .select(
      `
        conversation_id,
        user_id,
        last_read_at,
        created_at,
        updated_at
      `,
    )
    .eq(
      'conversation_id',
      conversationId,
    )
    .eq(
      'user_id',
      userId,
    )
    .maybeSingle();

  if (error) {
    console.warn(
      '[Direct Gain] Unable to load message read state:',
      error.message,
    );

    return null;
  }

  return (
    data as MessageReadState | null
  );
}

/*
 * Load the read state belonging
 * to the person on the other side
 * of the conversation.
 */
export async function getOtherParticipantReadState(
  conversationId: string,
  otherUserId: string,
): Promise<MessageReadState | null> {
  return getConversationReadState(
    conversationId,
    otherUserId,
  );
}

/*
 * Decide whether one outgoing
 * message has been read by the
 * other participant.
 *
 * If their last_read_at timestamp
 * is equal to or later than the
 * message creation time, that
 * message has been read.
 */
export function hasMessageBeenRead({
  messageCreatedAt,
  otherParticipantReadState,
}: {
  messageCreatedAt: string;

  otherParticipantReadState:
    MessageReadState | null;
}): boolean {
  if (
    !otherParticipantReadState
  ) {
    return false;
  }

  const messageTime =
    new Date(
      messageCreatedAt,
    ).getTime();

  const readTime =
    new Date(
      otherParticipantReadState.last_read_at,
    ).getTime();

  if (
    Number.isNaN(
      messageTime,
    ) ||
    Number.isNaN(
      readTime,
    )
  ) {
    return false;
  }

  return (
    readTime >=
    messageTime
  );
}

/*
 * Convert the database read state
 * into the wording Direct Gain
 * displays beneath an outgoing
 * message.
 *
 * A message successfully stored
 * in Supabase is considered
 * Delivered.
 *
 * Once the other participant's
 * read position passes that
 * message, it becomes Read.
 */
export function getMessageReceiptStatus({
  messageCreatedAt,
  otherParticipantReadState,
}: {
  messageCreatedAt: string;

  otherParticipantReadState:
    MessageReadState | null;
}): MessageReceiptStatus {
  const isRead =
    hasMessageBeenRead({
      messageCreatedAt,
      otherParticipantReadState,
    });

  return isRead
    ? 'read'
    : 'delivered';
}

/*
 * Count incoming messages that
 * arrived after the current user's
 * last read position.
 *
 * This will later power:
 *
 * - inbox unread numbers
 * - Messages tab badges
 * - conversation unread badges
 * - notification behaviour
 */
export async function getUnreadMessageCount(
  conversationId: string,
): Promise<number> {
  const currentUser =
    await getCurrentMessagingUser();

  if (!currentUser) {
    return 0;
  }

  const readState =
    await getConversationReadState(
      conversationId,
      currentUser.userId,
    );

  let query =
    supabase
      .from('messages')
      .select(
        'id',
        {
          count:
            'exact',

          head:
            true,
        },
      )
      .eq(
        'conversation_id',
        conversationId,
      )
      .neq(
        'sender_id',
        currentUser.userId,
      )
      .is(
        'deleted_at',
        null,
      );

  if (
    readState?.last_read_at
  ) {
    query =
      query.gt(
        'created_at',
        readState.last_read_at,
      );
  }

  const {
    count,
    error,
  } =
    await query;

  if (error) {
    console.warn(
      '[Direct Gain] Unable to count unread messages:',
      error.message,
    );

    return 0;
  }

  return (
    count ??
    0
  );
}

/*
 * Load unread counts for a known
 * set of conversations.
 *
 * Each count uses the existing
 * getUnreadMessageCount() logic so
 * inbox cards and header totals
 * stay aligned.
 */
export async function getUnreadMessageCounts(
  conversationIds: string[],
): Promise<Record<string, number>> {
  const uniqueConversationIds =
    [
      ...new Set(
        conversationIds.filter(
          conversationId =>
            conversationId.length >
            0,
        ),
      ),
    ];

  const unreadEntries =
    await Promise.all(
      uniqueConversationIds.map(
        async conversationId => {
          const unreadCount =
            await getUnreadMessageCount(
              conversationId,
            );

          return [
            conversationId,
            unreadCount,
          ] as const;
        },
      ),
    );

  return Object.fromEntries(
    unreadEntries,
  );
}

/*
 * Sum unread incoming messages
 * across every conversation the
 * current user participates in.
 */
export async function getTotalUnreadMessageCount(): Promise<number> {
  const currentUser =
    await getCurrentMessagingUser();

  if (!currentUser) {
    return 0;
  }

  const {
    data,
    error,
  } = await supabase
    .from('conversation_participants')
    .select(
      'conversation_id',
    )
    .eq(
      'user_id',
      currentUser.userId,
    );

  if (error) {
    console.warn(
      '[Direct Gain] Unable to load conversations for unread totals:',
      error.message,
    );

    return 0;
  }

  const conversationIds =
    (
      data ??
      []
    ).map(
      row =>
        row.conversation_id as string,
    );

  const unreadCounts =
    await getUnreadMessageCounts(
      conversationIds,
    );

  return Object.values(
    unreadCounts,
  ).reduce(
    (
      total,
      unreadCount,
    ) =>
      total +
      unreadCount,
    0,
  );
}