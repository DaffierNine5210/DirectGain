import type {
  ChatMessage,
} from '../../types/Messaging';

import {
  sanitizeDisplayFileName,
} from './conversationAttachmentStorage';

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
  const fileAttachment =
    getFileAttachmentMetadata(
      message,
    );

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

    fileName:
      fileAttachment.fileName,

    fileMimeType:
      fileAttachment.mimeType,

    fileByteSize:
      fileAttachment.byteSize,

    fileExtension:
      fileAttachment.extension,

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
      return 'file';

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

function getFileAttachmentMetadata(
  message: SupabaseMessageRecord,
): {
  fileName?: string;
  mimeType?: string;
  byteSize?: number;
  extension?: string;
} {
  if (
    message.message_type !==
    'file'
  ) {
    return {};
  }

  const metadata =
    message.metadata ??
    {};

  const fileName =
    readMetadataString(
      metadata,
      'fileName',
    );

  const mimeType =
    readMetadataString(
      metadata,
      'mimeType',
    );

  const extension =
    readMetadataString(
      metadata,
      'extension',
    );

  const byteSize =
    readMetadataNumber(
      metadata,
      'byteSize',
    );

  return {
    fileName:
      fileName
        ? sanitizeDisplayFileName(
            fileName,
          )
        : undefined,
    mimeType,
    byteSize,
    extension,
  };
}

function readMetadataString(
  metadata: Record<string, unknown>,
  key: string,
): string | undefined {
  const value =
    metadata[key];

  if (
    typeof value !==
    'string'
  ) {
    return undefined;
  }

  const trimmed =
    value.trim();

  return trimmed.length >
    0
    ? trimmed
    : undefined;
}

function readMetadataNumber(
  metadata: Record<string, unknown>,
  key: string,
): number | undefined {
  const value =
    metadata[key];

  if (
    typeof value ===
      'number' &&
    Number.isFinite(
      value,
    ) &&
    value >=
      0
  ) {
    return value;
  }

  return undefined;
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