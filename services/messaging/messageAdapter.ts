import type {
  ChatMessage,
} from '../../types/Messaging';

import type {
  SupabaseMessageRecord,
} from './messageRepository';

type MessageAdapterOptions = {
  currentUserId: string;
};

export function supabaseMessageToChatMessage(
  message: SupabaseMessageRecord,
  options: MessageAdapterOptions,
): ChatMessage {
  return {
    id:
      message.id,

    conversationId:
      message.conversation_id,

    sender:
      message.sender_id ===
      options.currentUserId
        ? 'current-user'
        : 'participant',

    kind:
      mapMessageType(
        message.message_type,
      ),

    text:
      message.body ??
      undefined,

    attachmentPath:
      message.attachment_url ??
      undefined,

    createdAt:
      formatMessageTime(
        message.created_at,
      ),

    status:
      'sent',

    isEdited:
      Boolean(
        message.edited_at,
      ),
  };
}

export function supabaseMessagesToChatMessages(
  messages:
    SupabaseMessageRecord[],
  options:
    MessageAdapterOptions,
): ChatMessage[] {
  return messages.map(
    message =>
      supabaseMessageToChatMessage(
        message,
        options,
      ),
  );
}

function mapMessageType(
  type:
    SupabaseMessageRecord['message_type'],
): ChatMessage['kind'] {
  switch (type) {
    case 'image':
      return 'image';

    case 'location':
      return 'location';

    case 'system':
      return 'system';

    case 'file':
      return 'system';

    case 'text':
    default:
      return 'text';
  }
}

type InboxPreviewMessage = {
  body:
    | string
    | null;

  message_type:
    string;

  metadata?:
    Record<string, unknown>;
};

export function getInboxMessagePreview(
  message:
    InboxPreviewMessage |
    null |
    undefined,
): string {
  if (!message) {
    return 'No messages yet';
  }

  const text =
    message.body
      ?.trim() ??
    '';

  if (text.length > 0) {
    return text;
  }

  const metadataKind =
    getMetadataPreviewKind(
      message.metadata,
    );

  if (
    metadataKind ===
    'offer'
  ) {
    return 'Offer';
  }

  switch (
    message.message_type
  ) {
    case 'image':
      return 'Photo';

    case 'file':
      return 'Attachment';

    case 'location':
      return 'Location';

    case 'system':
      return 'Deal update';

    default:
      return 'New message';
  }
}

function getMetadataPreviewKind(
  metadata:
    Record<string, unknown> |
    undefined,
): string | null {
  if (!metadata) {
    return null;
  }

  const kind =
    metadata.kind ??
    metadata.type;

  if (
    typeof kind !==
    'string'
  ) {
    return null;
  }

  return kind;
}

function formatMessageTime(
  value: string,
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Now';
  }

  return date.toLocaleTimeString(
    'en-AU',
    {
      hour: 'numeric',
      minute: '2-digit',
    },
  );
}