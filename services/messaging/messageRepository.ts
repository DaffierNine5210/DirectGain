import { supabase } from '../../lib/supabase';

import {
  getCurrentMessagingUser,
} from './currentMessagingUser';

import {
  isValidConversationAttachmentPath,
} from './conversationAttachmentStorage';

import {
  createValidatedLocationMetadata,
} from './conversationLocation';

import {
  createValidatedAudioMetadata,
} from './conversationAudio';

export type SupabaseMessageType =
  | 'text'
  | 'image'
  | 'file'
  | 'location'
  | 'audio'
  | 'system';

export type SupabaseMessageRecord = {
  id: string;

  conversation_id: string;

  sender_id: string | null;

  message_type:
    SupabaseMessageType;

  body:
    | string
    | null;

  attachment_url:
    | string
    | null;

  metadata:
    Record<string, unknown>;

  created_at: string;

  edited_at:
    | string
    | null;

  deleted_at:
    | string
    | null;
};

export type SendMessageInput = {
  conversationId: string;

  body: string;

  messageType?:
    SupabaseMessageType;

  attachmentUrl?:
    | string
    | null;

  metadata?:
    Record<string, unknown>;
};

const SEND_TIMEOUT_MS =
  15000;

function createTimeoutPromise<T>(
  milliseconds: number,
  message: string,
): Promise<T> {
  return new Promise<T>(
    (
      _resolve,
      reject,
    ) => {
      setTimeout(
        () => {
          reject(
            new Error(
              message,
            ),
          );
        },
        milliseconds,
      );
    },
  );
}

/*
 * Load every non-deleted message
 * belonging to a conversation.
 */
export async function getConversationMessages(
  conversationId: string,
): Promise<SupabaseMessageRecord[]> {
  console.log(
    '[Direct Gain] MESSAGE LOAD 1: Starting message load.',
    {
      conversationId,
    },
  );

  const {
    data,
    error,
  } =
    await supabase
      .from(
        'messages',
      )
      .select(
        `
          id,
          conversation_id,
          sender_id,
          message_type,
          body,
          attachment_url,
          metadata,
          created_at,
          edited_at,
          deleted_at
        `,
      )
      .eq(
        'conversation_id',
        conversationId,
      )
      .is(
        'deleted_at',
        null,
      )
      .order(
        'created_at',
        {
          ascending:
            true,
        },
      );

  if (
    error
  ) {
    console.warn(
      '[Direct Gain] MESSAGE LOAD FAILED:',
      {
        message:
          error.message,

        code:
          error.code,

        details:
          error.details,

        hint:
          error.hint,
      },
    );

    return [];
  }

  console.log(
    '[Direct Gain] MESSAGE LOAD OK:',
    {
      conversationId,

      messageCount:
        data?.length ??
        0,
    },
  );

  return (
    data as
      SupabaseMessageRecord[]
  ) ?? [];
}

export type InboxLatestMessage = {
  id: string;

  conversation_id: string;

  sender_id: string | null;

  message_type:
    SupabaseMessageType;

  body:
    | string
    | null;

  metadata:
    Record<string, unknown>;

  created_at: string;
};

/*
 * Latest non-deleted message per
 * conversation.
 *
 * Each conversation uses a single
 * newest-row query so the inbox
 * does not download full history.
 *
 * A conversations.last_message_at
 * column would replace these
 * per-thread lookups later.
 */
export async function getLatestMessagesForConversations(
  conversationIds: string[],
): Promise<
  Record<string, InboxLatestMessage>
> {
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

  if (
    uniqueConversationIds.length ===
    0
  ) {
    return {};
  }

  const latestRows =
    await Promise.all(
      uniqueConversationIds.map(
        async conversationId => {
          const {
            data,
            error,
          } =
            await supabase
              .from(
                'messages',
              )
              .select(
                `
                  id,
                  conversation_id,
                  sender_id,
                  message_type,
                  body,
                  metadata,
                  created_at
                `,
              )
              .eq(
                'conversation_id',
                conversationId,
              )
              .is(
                'deleted_at',
                null,
              )
              .order(
                'created_at',
                {
                  ascending:
                    false,
                },
              )
              .limit(
                1,
              )
              .maybeSingle();

          if (error) {
            console.warn(
              '[Direct Gain] Unable to load latest inbox message:',
              error.message,
            );

            return null;
          }

          return data as
            InboxLatestMessage |
            null;
        },
      ),
    );

  const latestByConversation:
    Record<string, InboxLatestMessage> =
      {};

  for (const row of latestRows) {
    if (!row) {
      continue;
    }

    latestByConversation[
      row.conversation_id
    ] =
      row;
  }

  return latestByConversation;
}

/*
 * Store a new message using the
 * currently authenticated Supabase user.
 *
 * Logging is intentionally detailed
 * while we diagnose the current
 * Sending -> Delivered issue.
 */
export async function sendConversationMessage(
  input:
    SendMessageInput,
): Promise<SupabaseMessageRecord | null> {
  console.log(
    '[Direct Gain] SEND STEP 1: sendConversationMessage called.',
    {
      conversationId:
        input.conversationId,

      messageType:
        input.messageType ??
        'text',

      bodyLength:
        input.body.length,

      hasMetadata:
        Boolean(
          input.metadata,
        ),
    },
  );

  /*
   * STEP 2
   *
   * Resolve the current authenticated
   * Supabase user.
   */
  console.log(
    '[Direct Gain] SEND STEP 2: Loading authenticated user...',
  );

  let currentUser:
    Awaited<
      ReturnType<
        typeof getCurrentMessagingUser
      >
    >;

  try {
    currentUser =
      await Promise.race([
        getCurrentMessagingUser(),

        createTimeoutPromise<
          Awaited<
            ReturnType<
              typeof getCurrentMessagingUser
            >
          >
        >(
          SEND_TIMEOUT_MS,

          'Timed out while loading the authenticated messaging user.',
        ),
      ]);
  } catch (
    error
  ) {
    console.warn(
      '[Direct Gain] SEND STEP 2 FAILED:',
      error instanceof
        Error
        ? error.message
        : error,
    );

    return null;
  }

  if (
    !currentUser
  ) {
    console.warn(
      '[Direct Gain] SEND STEP 2 FAILED: No authenticated messaging user.',
    );

    return null;
  }

  console.log(
    '[Direct Gain] SEND STEP 2 OK: Authenticated user loaded.',
    {
      userId:
        currentUser.userId,

      email:
        currentUser.email,
    },
  );

  /*
   * STEP 3
   *
   * Validate the message.
   *
   * Text still requires a body.
   * Image messages may have an
   * empty caption but must include
   * a Storage object path.
   */
  const cleanBody =
    input.body.trim();

  const messageType =
    input.messageType ??
    'text';

  if (
    messageType ===
    'system'
  ) {
    console.warn(
      '[Direct Gain] SEND STEP 3 FAILED: System messages cannot be sent by the client.',
    );

    return null;
  }

  const validatedLocationMetadata =
    messageType ===
    'location'
      ? createValidatedLocationMetadata(
          input.metadata,
        )
      : null;

  const validatedAudioMetadata =
    messageType ===
    'audio'
      ? createValidatedAudioMetadata(
          input.metadata,
        )
      : null;

  if (
    messageType ===
      'image' ||
    messageType ===
      'file' ||
    messageType ===
      'audio'
  ) {
    const objectPath =
      input.attachmentUrl
        ?.trim() ??
      '';

    if (
      !isValidConversationAttachmentPath({
        objectPath,
        conversationId:
          input.conversationId,
        userId:
          currentUser.userId,
      })
    ) {
      console.warn(
        '[Direct Gain] SEND STEP 3 FAILED: Attachment Storage path is not valid for this sender.',
      );

      return null;
    }

    if (
      messageType ===
        'audio' &&
      !validatedAudioMetadata
    ) {
      console.warn(
        '[Direct Gain] SEND STEP 3 FAILED: Audio metadata is not valid.',
      );

      return null;
    }
  } else if (
    messageType ===
    'location'
  ) {
    if (
      !validatedLocationMetadata
    ) {
      console.warn(
        '[Direct Gain] SEND STEP 3 FAILED: Location metadata is not valid.',
      );

      return null;
    }
  } else if (
    cleanBody.length ===
    0
  ) {
    console.warn(
      '[Direct Gain] SEND STEP 3 FAILED: Empty text message.',
    );

    return null;
  }

  console.log(
    '[Direct Gain] SEND STEP 3 OK: Message validated.',
    {
      cleanBodyLength:
        cleanBody.length,
    },
  );

  /*
   * STEP 4
   *
   * Build the exact database row.
   */
  const insertPayload = {
    conversation_id:
      input.conversationId,

    sender_id:
      currentUser.userId,

    message_type:
      messageType,

    body:
      messageType ===
        'location' ||
      messageType ===
        'audio'
        ? null
        : cleanBody.length >
            0
          ? cleanBody
          : null,

    attachment_url:
      messageType ===
      'location'
        ? null
        : input.attachmentUrl ??
          null,

    metadata:
      validatedLocationMetadata ??
      validatedAudioMetadata ??
      input.metadata ??
      {},
  };

  console.log(
    '[Direct Gain] SEND STEP 4 OK: Insert payload prepared.',
    {
      conversationId:
        insertPayload
          .conversation_id,

      senderId:
        insertPayload
          .sender_id,

      messageType:
        insertPayload
          .message_type,

      metadata:
        insertPayload
          .metadata,
    },
  );

  /*
   * STEP 5
   *
   * Send the insert to Supabase.
   */
  console.log(
    '[Direct Gain] SEND STEP 5: Starting Supabase messages insert...',
  );

  try {
    const insertPromise =
      supabase
        .from(
          'messages',
        )
        .insert(
          insertPayload,
        )
        .select(
          `
            id,
            conversation_id,
            sender_id,
            message_type,
            body,
            attachment_url,
            metadata,
            created_at,
            edited_at,
            deleted_at
          `,
        )
        .single();

    const result =
      await Promise.race([
        insertPromise,

        createTimeoutPromise<
          {
            data:
              any;

            error:
              any;
          }
        >(
          SEND_TIMEOUT_MS,

          'Supabase message insert timed out after 15 seconds.',
        ),
      ]);

    const {
      data,
      error,
    } =
      result;

    /*
     * STEP 6
     *
     * Inspect the Supabase response.
     */
    if (
      error
    ) {
      console.warn(
        '[Direct Gain] SEND STEP 6 FAILED: Supabase returned an error.',
        {
          message:
            error.message,

          code:
            error.code,

          details:
            error.details,

          hint:
            error.hint,
        },
      );

      return null;
    }

    if (
      !data
    ) {
      console.warn(
        '[Direct Gain] SEND STEP 6 FAILED: Supabase returned no message row.',
      );

      return null;
    }

    console.log(
      '[Direct Gain] SEND STEP 6 OK: Message stored successfully.',
      {
        messageId:
          data.id,

        conversationId:
          data.conversation_id,

        senderId:
          data.sender_id,

        createdAt:
          data.created_at,
      },
    );

    /*
     * STEP 7
     *
     * Return the confirmed database row
     * to ConversationScreen.
     *
     * ConversationScreen should now
     * change:
     *
     * Sending...
     *
     * to:
     *
     * Delivered
     */
    console.log(
      '[Direct Gain] SEND STEP 7: Returning confirmed message to ConversationScreen.',
    );

    return data as
      SupabaseMessageRecord;
  } catch (
    error
  ) {
    console.warn(
      '[Direct Gain] SEND STEP 5/6 EXCEPTION:',
      error instanceof
        Error
        ? error.message
        : error,
    );

    return null;
  }
}

/*
 * Soft-delete a message.
 *
 * We preserve the database record rather
 * than physically deleting it. This is
 * safer for moderation, disputes and
 * future transaction protection systems.
 */
export async function deleteConversationMessage(
  messageId:
    string,
): Promise<boolean> {
  const currentUser =
    await getCurrentMessagingUser();

  if (
    !currentUser
  ) {
    console.warn(
      '[Direct Gain] Cannot delete message without an authenticated user.',
    );

    return false;
  }

  const {
    error,
  } =
    await supabase
      .from(
        'messages',
      )
      .update({
        deleted_at:
          new Date()
            .toISOString(),
      })
      .eq(
        'id',
        messageId,
      )
      .eq(
        'sender_id',
        currentUser.userId,
      );

  if (
    error
  ) {
    console.warn(
      '[Direct Gain] Unable to delete conversation message:',
      {
        message:
          error.message,

        code:
          error.code,

        details:
          error.details,

        hint:
          error.hint,
      },
    );

    return false;
  }

  return true;
}

/*
 * Update a text message owned by the
 * signed-in user.
 */
export async function editConversationMessage(
  messageId:
    string,

  body:
    string,
): Promise<SupabaseMessageRecord | null> {
  const currentUser =
    await getCurrentMessagingUser();

  if (
    !currentUser
  ) {
    console.warn(
      '[Direct Gain] Cannot edit message without an authenticated user.',
    );

    return null;
  }

  const cleanBody =
    body.trim();

  if (
    cleanBody.length ===
    0
  ) {
    return null;
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        'messages',
      )
      .update({
        body:
          cleanBody,

        edited_at:
          new Date()
            .toISOString(),
      })
      .eq(
        'id',
        messageId,
      )
      .eq(
        'sender_id',
        currentUser.userId,
      )
      .select(
        `
          id,
          conversation_id,
          sender_id,
          message_type,
          body,
          attachment_url,
          metadata,
          created_at,
          edited_at,
          deleted_at
        `,
      )
      .maybeSingle();

  if (
    error
  ) {
    console.warn(
      '[Direct Gain] Unable to edit conversation message:',
      {
        message:
          error.message,

        code:
          error.code,

        details:
          error.details,

        hint:
          error.hint,
      },
    );

    return null;
  }

  return (
    data as
      SupabaseMessageRecord |
      null
  );
}