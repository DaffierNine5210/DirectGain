import { supabase } from '../../lib/supabase';

import {
  getCurrentMessagingUser,
} from './currentMessagingUser';
import { unreadIncomingOrFilter } from './messageKind';

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
      .or(
        unreadIncomingOrFilter(
          currentUser.userId,
        ),
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
 * Same rule as getUnreadMessageCount:
 *
 * Incoming messages at or before
 * last_read_at are read.
 * Messages after that point are
 * unread.
 *
 * If there is no read position,
 * every incoming message is unread.
 */
export function isIncomingMessageUnread({
  messageCreatedAt,
  lastReadAt,
}: {
  messageCreatedAt: string;

  lastReadAt:
    | string
    | null
    | undefined;
}): boolean {
  if (!lastReadAt) {
    return true;
  }

  const messageTime =
    new Date(
      messageCreatedAt,
    ).getTime();

  const readTime =
    new Date(
      lastReadAt,
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
    messageTime >
    readTime
  );
}

type IncomingUnreadRow = {
  conversation_id: string;

  created_at: string;
};

const UNREAD_PAGE_SIZE =
  1000;

/*
 * Load unread counts for a known
 * set of conversations.
 *
 * Uses one message_reads query for
 * the current user, then counts
 * incoming messages with the same
 * unread rule as getUnreadMessageCount.
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

  const emptyCounts:
    Record<string, number> =
      Object.fromEntries(
        uniqueConversationIds.map(
          conversationId =>
            [
              conversationId,
              0,
            ],
        ),
      );

  if (
    uniqueConversationIds.length ===
    0
  ) {
    return emptyCounts;
  }

  const currentUser =
    await getCurrentMessagingUser();

  if (!currentUser) {
    return emptyCounts;
  }

  const {
    data: readRows,
    error: readError,
  } = await supabase
    .from('message_reads')
    .select(
      'conversation_id, last_read_at',
    )
    .eq(
      'user_id',
      currentUser.userId,
    )
    .in(
      'conversation_id',
      uniqueConversationIds,
    );

  if (readError) {
    console.warn(
      '[Direct Gain] Unable to load inbox read positions:',
      readError.message,
    );
  }

  const lastReadByConversation =
    new Map<string, string>();

  for (const row of readRows ?? []) {
    lastReadByConversation.set(
      row.conversation_id as string,
      row.last_read_at as string,
    );
  }

  const incomingRows:
    IncomingUnreadRow[] =
      [];

  let pageStart =
    0;

  while (true) {
    const {
      data,
      error,
    } = await supabase
      .from('messages')
      .select(
        'conversation_id, created_at',
      )
      .in(
        'conversation_id',
        uniqueConversationIds,
      )
      .or(
        unreadIncomingOrFilter(
          currentUser.userId,
        ),
      )
      .is(
        'deleted_at',
        null,
      )
      .range(
        pageStart,
        pageStart +
          UNREAD_PAGE_SIZE -
          1,
      );

    if (error) {
      console.warn(
        '[Direct Gain] Unable to load inbox unread messages:',
        error.message,
      );

      return emptyCounts;
    }

    const page =
      (
        data as
          IncomingUnreadRow[] |
          null
      ) ??
      [];

    incomingRows.push(
      ...page,
    );

    if (
      page.length <
      UNREAD_PAGE_SIZE
    ) {
      break;
    }

    pageStart +=
      UNREAD_PAGE_SIZE;
  }

  const unreadCounts =
    {
      ...emptyCounts,
    };

  for (const message of incomingRows) {
    const isUnread =
      isIncomingMessageUnread({
        messageCreatedAt:
          message.created_at,

        lastReadAt:
          lastReadByConversation.get(
            message.conversation_id,
          ),
      });

    if (!isUnread) {
      continue;
    }

    unreadCounts[
      message.conversation_id
    ] =
      (
        unreadCounts[
          message.conversation_id
        ] ??
        0
      ) +
      1;
  }

  return unreadCounts;
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