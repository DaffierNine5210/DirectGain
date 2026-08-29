import { File } from 'expo-file-system';

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

export const MAX_CONVERSATION_DOCUMENT_BYTES =
  10 * 1024 * 1024;

const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

type AllowedDocumentMimeType =
  (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number];

const DOCUMENT_MIME_EXTENSIONS:
  Record<AllowedDocumentMimeType, string> = {
    'application/pdf':
      'pdf',
    'text/plain':
      'txt',
    'text/csv':
      'csv',
    'application/msword':
      'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'docx',
    'application/vnd.ms-excel':
      'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      'xlsx',
  };

const DOCUMENT_EXTENSION_MIME_TYPES:
  Record<string, AllowedDocumentMimeType> = {
    pdf: 'application/pdf',
    txt: 'text/plain',
    csv: 'text/csv',
    doc: 'application/msword',
    docx:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };

export const DOCUMENT_PICKER_MIME_TYPES:
  AllowedDocumentMimeType[] = [
    ...ALLOWED_DOCUMENT_MIME_TYPES,
  ];

export type ConversationDocumentUploadInput = {
  conversationId: string;
  userId: string;
  localUri: string;
  mimeType: string;
  originalFileName: string;
  byteSize?: number;
};

export type ConversationDocumentUploadResult = {
  objectPath: string;
  mimeType: AllowedDocumentMimeType;
  byteSize: number;
  fileName: string;
  extension: string;
};

export function isAllowedDocumentMimeType(
  mimeType: string,
): mimeType is AllowedDocumentMimeType {
  return (
    ALLOWED_DOCUMENT_MIME_TYPES as readonly string[]
  ).includes(
    mimeType.toLowerCase(),
  );
}

export function resolveDocumentMimeType({
  mimeType,
  originalFileName,
}: {
  mimeType?:
    string;
  originalFileName:
    string;
}): AllowedDocumentMimeType | null {
  const normalizedMime =
    mimeType
      ?.trim()
      .toLowerCase() ??
    '';

  if (
    normalizedMime.length >
    0
  ) {
    if (
      isAllowedDocumentMimeType(
        normalizedMime,
      )
    ) {
      return normalizedMime;
    }

    return null;
  }

  const extension =
    getDisplayFileExtension(
      originalFileName,
    );

  return (
    DOCUMENT_EXTENSION_MIME_TYPES[
      extension
    ] ??
    null
  );
}

export function getDocumentExtensionForMimeType(
  mimeType: AllowedDocumentMimeType,
): string {
  return DOCUMENT_MIME_EXTENSIONS[
    mimeType
  ];
}

export function getDocumentTypeLabel(
  mimeType?:
    string,
  extension?:
    string,
): string {
  const normalizedMime =
    mimeType
      ?.toLowerCase() ??
    '';

  if (
    isAllowedDocumentMimeType(
      normalizedMime,
    )
  ) {
    return getDocumentExtensionForMimeType(
      normalizedMime,
    ).toUpperCase();
  }

  const normalizedExtension =
    extension
      ?.replace('.', '')
      .toLowerCase() ??
    '';

  if (
    normalizedExtension in
    DOCUMENT_EXTENSION_MIME_TYPES
  ) {
    return normalizedExtension.toUpperCase();
  }

  return 'FILE';
}

export function formatAttachmentByteSize(
  byteSize?:
    number,
): string {
  if (
    !byteSize ||
    byteSize <=
      0
  ) {
    return '';
  }

  if (
    byteSize <
    1024
  ) {
    return `${byteSize} B`;
  }

  if (
    byteSize <
    1024 *
      1024
  ) {
    return `${Math.round(byteSize / 1024)} KB`;
  }

  return `${(byteSize / (1024 * 1024)).toFixed(1)} MB`;
}

export function sanitizeDisplayFileName(
  originalFileName: string,
): string {
  const decodedFileName =
    decodePercentEncodedFileName(
      originalFileName,
    );

  const withoutPath =
    decodedFileName
      .replace(
        /\\/g,
        '/',
      )
      .split(
        '/',
      )
      .pop() ??
    '';

  const withoutControl =
    withoutPath.replace(
      /[\u0000-\u001F\u007F]/g,
      '',
    );

  const withoutTraversal =
    withoutControl.replace(
      /\.\.+/g,
      '.',
    );

  const collapsed =
    withoutTraversal
      .replace(
        /\s+/g,
        ' ',
      )
      .trim();

  if (
    collapsed.length ===
      0 ||
    collapsed ===
      '.'
  ) {
    return 'Document';
  }

  return collapsed.slice(
    0,
    80,
  );
}

export async function uploadConversationDocument(
  input: ConversationDocumentUploadInput,
): Promise<ConversationDocumentUploadResult | null> {
  const mimeType =
    resolveDocumentMimeType({
      mimeType:
        input.mimeType,
      originalFileName:
        input.originalFileName,
    });

  if (!mimeType) {
    console.warn(
      '[Direct Gain] Document upload rejected: unsupported MIME type.',
    );

    return null;
  }

  if (
    !isSafeOriginalFileName(
      input.originalFileName,
    )
  ) {
    console.warn(
      '[Direct Gain] Document upload rejected: unsafe filename.',
    );

    return null;
  }

  if (
    !isSafeLocalAttachmentUri(
      input.localUri,
    )
  ) {
    console.warn(
      '[Direct Gain] Document upload rejected: unexpected file path.',
    );

    return null;
  }

  const fileName =
    sanitizeDisplayFileName(
      input.originalFileName,
    );

  let cachedFile:
    File;

  try {
    cachedFile =
      new File(
        input.localUri,
      );
  } catch (
    error
  ) {
    console.warn(
      '[Direct Gain] Document upload rejected: invalid local file.',
      error instanceof
        Error
        ? error.message
        : error,
    );

    return null;
  }

  if (
    !cachedFile.exists
  ) {
    console.warn(
      '[Direct Gain] Document upload rejected: cached file is missing.',
    );

    return null;
  }

  const byteSize =
    input.byteSize &&
    input.byteSize >
      0
      ? input.byteSize
      : cachedFile.size;

  if (
    byteSize >
    MAX_CONVERSATION_DOCUMENT_BYTES
  ) {
    console.warn(
      '[Direct Gain] Document upload rejected: file too large.',
    );

    return null;
  }

  const extension =
    getDocumentExtensionForMimeType(
      mimeType,
    );

  const objectPath =
    `${input.conversationId}/${input.userId}/${createAttachmentUniqueId()}.${extension}`;

  let fileBody:
    Uint8Array;

  try {
    fileBody =
      await cachedFile.bytes();
  } catch (
    error
  ) {
    console.warn(
      '[Direct Gain] Document upload rejected: unable to read file bytes.',
      error instanceof
        Error
        ? error.message
        : error,
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
      '[Direct Gain] Unable to upload conversation document:',
      error.message,
    );

    return null;
  }

  return {
    objectPath,
    mimeType,
    byteSize,
    fileName,
    extension,
  };
}

export const MAX_CONVERSATION_AUDIO_UPLOAD_BYTES =
  10 * 1024 * 1024;

export type ConversationAudioUploadInput = {
  conversationId: string;
  userId: string;
  localUri: string;
  mimeType: string;
  byteSize?: number;
  durationMs: number;
};

export type ConversationAudioUploadResult = {
  objectPath: string;
  mimeType: string;
  byteSize: number;
  durationMs: number;
  extension: string;
};

export async function uploadConversationAudio(
  input: ConversationAudioUploadInput,
): Promise<ConversationAudioUploadResult | null> {
  if (
    !isSafeLocalAttachmentUri(
      input.localUri,
    )
  ) {
    console.warn(
      '[Direct Gain] Audio upload rejected: unexpected file path.',
    );

    return null;
  }

  let cachedFile:
    File;

  try {
    cachedFile =
      new File(
        input.localUri,
      );
  } catch (
    error
  ) {
    console.warn(
      '[Direct Gain] Audio upload rejected: invalid local file.',
      error instanceof
        Error
        ? error.message
        : error,
    );

    return null;
  }

  if (
    !cachedFile.exists
  ) {
    console.warn(
      '[Direct Gain] Audio upload rejected: cached file is missing.',
    );

    return null;
  }

  const byteSize =
    input.byteSize &&
    input.byteSize >
      0
      ? input.byteSize
      : cachedFile.size;

  if (
    byteSize >
    MAX_CONVERSATION_AUDIO_UPLOAD_BYTES
  ) {
    console.warn(
      '[Direct Gain] Audio upload rejected: file too large.',
    );

    return null;
  }

  const mimeType =
    input.mimeType.trim().toLowerCase();

  if (
    mimeType !==
    'audio/mp4'
  ) {
    console.warn(
      '[Direct Gain] Audio upload rejected: unsupported MIME type.',
    );

    return null;
  }

  const objectPath =
    `${input.conversationId}/${input.userId}/${createAttachmentUniqueId()}.m4a`;

  let fileBody:
    Uint8Array;

  try {
    fileBody =
      await cachedFile.bytes();
  } catch (
    error
  ) {
    console.warn(
      '[Direct Gain] Audio upload rejected: unable to read file bytes.',
      error instanceof
        Error
        ? error.message
        : error,
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
      '[Direct Gain] Unable to upload conversation audio:',
      error.message,
    );

    return null;
  }

  return {
    objectPath,
    mimeType,
    byteSize,
    durationMs:
      input.durationMs,
    extension:
      'm4a',
  };
}

function decodePercentEncodedFileName(
  value: string,
): string {
  try {
    return decodeURIComponent(
      value,
    );
  } catch {
    return value;
  }
}

export function isSafeOriginalFileName(
  originalFileName: string,
): boolean {
  const decodedFileName =
    decodePercentEncodedFileName(
      originalFileName,
    );

  if (
    originalFileName.length ===
      0 ||
    originalFileName.length >
      255 ||
    decodedFileName.length ===
      0 ||
    decodedFileName.length >
      255
  ) {
    return false;
  }

  if (
    /[\u0000-\u001F\u007F]/.test(
      decodedFileName,
    )
  ) {
    return false;
  }

  const segments =
    decodedFileName
      .replace(
        /\\/g,
        '/',
      )
      .split(
        '/',
      );

  if (
    segments.some(
      segment =>
        segment ===
          '.' ||
        segment ===
          '..',
    )
  ) {
    return false;
  }

  const basename =
    segments[
      segments.length -
        1
    ]?.trim() ??
    '';

  return basename.length >
    0;
}

export function isSafeLocalAttachmentUri(
  uri: string,
): boolean {
  const trimmed =
    uri.trim();

  if (
    trimmed.length ===
      0 ||
    trimmed.includes(
      '..',
    ) ||
    /[\u0000-\u001F\u007F]/.test(
      trimmed,
    )
  ) {
    return false;
  }

  const schemeMatch =
    trimmed.match(
      /^([a-zA-Z][a-zA-Z0-9+.-]*):/,
    );

  if (
    !schemeMatch
  ) {
    return trimmed.startsWith(
      '/',
    );
  }

  const scheme =
    schemeMatch[1].toLowerCase();

  return (
    scheme ===
      'file' ||
    scheme ===
      'content'
  );
}

function getDisplayFileExtension(
  originalFileName: string,
): string {
  const sanitized =
    sanitizeDisplayFileName(
      originalFileName,
    );

  const parts =
    sanitized.split(
      '.',
    );

  if (
    parts.length <
    2
  ) {
    return '';
  }

  return parts[
    parts.length -
      1
  ]!.toLowerCase();
}

function createAttachmentUniqueId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
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
  return `${conversationId}/${userId}/${createAttachmentUniqueId()}.${getImageExtensionForMimeType(mimeType)}`;
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
