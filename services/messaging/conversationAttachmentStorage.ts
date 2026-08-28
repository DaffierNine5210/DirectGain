import { supabase } from '../../lib/supabase';

export const CONVERSATION_ATTACHMENTS_BUCKET =
  'conversation-attachments';

export const MAX_CONVERSATION_IMAGE_BYTES =
  5 * 1024 * 1024;

const SIGNED_URL_TTL_SECONDS =
  60 * 60;

const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

type AllowedImageMimeType =
  (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

const MIME_EXTENSIONS:
  Record<AllowedImageMimeType, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };

export type ConversationImageUploadInput = {
  conversationId: string;
  userId: string;
  base64: string;
  mimeType: string;
  byteSize?: number;
};

export type ConversationImageUploadResult = {
  objectPath: string;
  mimeType: AllowedImageMimeType;
  byteSize: number;
};

export function isAllowedImageMimeType(
  mimeType: string,
): mimeType is AllowedImageMimeType {
  const normalized =
    mimeType.toLowerCase();

  return (
    ALLOWED_IMAGE_MIME_TYPES as readonly string[]
  ).includes(
    normalized,
  );
}

export function getImageExtensionForMimeType(
  mimeType: AllowedImageMimeType,
): string {
  return MIME_EXTENSIONS[mimeType];
}

export function estimateBase64ByteSize(
  base64: string,
): number {
  const normalized =
    stripBase64Prefix(base64);

  const padding =
    normalized.endsWith('==')
      ? 2
      : normalized.endsWith('=')
        ? 1
        : 0;

  return Math.max(
    0,
    Math.floor(
      (normalized.length * 3) / 4,
    ) - padding,
  );
}

export function isValidConversationAttachmentPath({
  objectPath,
  conversationId,
  userId,
}: {
  objectPath: string;
  conversationId: string;
  userId: string;
}): boolean {
  const expectedPrefix =
    `${conversationId}/${userId}/`;

  if (
    !objectPath.startsWith(
      expectedPrefix,
    )
  ) {
    return false;
  }

  if (
    objectPath.includes('..') ||
    objectPath.includes('//')
  ) {
    return false;
  }

  const segments =
    objectPath.split('/');

  if (segments.length !== 3) {
    return false;
  }

  const fileName =
    segments[2];

  return (
    fileName.length > 0 &&
    fileName.includes('.')
  );
}

export function createConversationImageObjectPath({
  conversationId,
  userId,
  mimeType,
}: {
  conversationId: string;
  userId: string;
  mimeType: AllowedImageMimeType;
}): string {
  const uniqueId =
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

  return `${conversationId}/${userId}/${uniqueId}.${getImageExtensionForMimeType(mimeType)}`;
}

export async function uploadConversationImage(
  input: ConversationImageUploadInput,
): Promise<ConversationImageUploadResult | null> {
  const mimeType =
    input.mimeType.toLowerCase();

  if (
    !isAllowedImageMimeType(
      mimeType,
    )
  ) {
    console.warn(
      '[Direct Gain] Image upload rejected: unsupported MIME type.',
    );

    return null;
  }

  const byteSize =
    input.byteSize &&
    input.byteSize > 0
      ? input.byteSize
      : estimateBase64ByteSize(
          input.base64,
        );

  if (
    byteSize >
    MAX_CONVERSATION_IMAGE_BYTES
  ) {
    console.warn(
      '[Direct Gain] Image upload rejected: file too large.',
    );

    return null;
  }

  const objectPath =
    createConversationImageObjectPath({
      conversationId:
        input.conversationId,
      userId:
        input.userId,
        mimeType,
      });

  const fileBody =
    decodeBase64ToUint8Array(
      input.base64,
    );

  if (!fileBody) {
    console.warn(
      '[Direct Gain] Image upload rejected: unable to decode photo data.',
    );

    return null;
  }

  const {
    error,
  } = await supabase.storage
    .from(
      CONVERSATION_ATTACHMENTS_BUCKET,
    )
    .upload(
      objectPath,
      fileBody,
      {
        contentType:
          mimeType,
        upsert:
          false,
        cacheControl:
          '3600',
      },
    );

  if (error) {
    console.warn(
      '[Direct Gain] Unable to upload conversation image:',
      error.message,
    );

    return null;
  }

  return {
    objectPath,
    mimeType,
    byteSize,
  };
}

export async function createConversationAttachmentSignedUrl(
  objectPath: string,
): Promise<string | null> {
  if (
    objectPath.length ===
    0
  ) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase.storage
    .from(
      CONVERSATION_ATTACHMENTS_BUCKET,
    )
    .createSignedUrl(
      objectPath,
      SIGNED_URL_TTL_SECONDS,
    );

  if (
    error ||
    !data?.signedUrl
  ) {
    console.warn(
      '[Direct Gain] Unable to create attachment signed URL:',
      error?.message,
    );

    return null;
  }

  return data.signedUrl;
}

function stripBase64Prefix(
  value: string,
): string {
  const separatorIndex =
    value.indexOf(',');

  if (
    value.startsWith('data:') &&
    separatorIndex >=
      0
  ) {
    return value.slice(
      separatorIndex + 1,
    );
  }

  return value;
}

function decodeBase64ToUint8Array(
  value: string,
): Uint8Array | null {
  const normalized =
    stripBase64Prefix(value);

  if (
    typeof globalThis.atob !==
    'function'
  ) {
    console.warn(
      '[Direct Gain] Unable to decode photo data: atob is unavailable.',
    );

    return null;
  }

  try {
    const binary =
      globalThis.atob(
        normalized,
      );

    const bytes =
      new Uint8Array(
        binary.length,
      );

    for (
      let index = 0;
      index < binary.length;
      index += 1
    ) {
      bytes[index] =
        binary.charCodeAt(
          index,
        );
    }

    return bytes;
  } catch (error) {
    console.warn(
      '[Direct Gain] Unable to decode photo data:',
      error instanceof Error
        ? error.message
        : error,
    );

    return null;
  }
}
