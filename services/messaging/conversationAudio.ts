import {
  AudioQuality,
  IOSOutputFormat,
  RecordingPresets,
  type RecordingOptions,
} from 'expo-audio';
import {
  File,
} from 'expo-file-system';

export const CONVERSATION_AUDIO_MIME_TYPE =
  'audio/mp4';

export const CONVERSATION_AUDIO_EXTENSION =
  'm4a';

export const MAX_CONVERSATION_AUDIO_DURATION_MS =
  5 * 60 * 1000;

export const MAX_CONVERSATION_AUDIO_BYTES =
  10 * 1024 * 1024;

export const MIN_CONVERSATION_AUDIO_DURATION_MS =
  400;

export const VOICE_RECORDING_OPTIONS:
  RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  extension:
    '.m4a',
  numberOfChannels:
    1,
  bitRate:
    64000,
  ios: {
    ...RecordingPresets.HIGH_QUALITY.ios,
    outputFormat:
      IOSOutputFormat.MPEG4AAC,
    audioQuality:
      AudioQuality.HIGH,
  },
    android: {
      ...RecordingPresets.HIGH_QUALITY.android,
      outputFormat:
        'mpeg4',
      audioEncoder:
        'aac',
      maxFileSize:
        MAX_CONVERSATION_AUDIO_BYTES,
    },
};

export type ConversationAudioMetadata = {
  client_message_id: string;
  mimeType:
    typeof CONVERSATION_AUDIO_MIME_TYPE;
  byteSize: number;
  durationMs: number;
  extension:
    typeof CONVERSATION_AUDIO_EXTENSION;
};

export function isAllowedAudioMimeType(
  mimeType: string,
): mimeType is typeof CONVERSATION_AUDIO_MIME_TYPE {
  return (
    mimeType.trim().toLowerCase() ===
    CONVERSATION_AUDIO_MIME_TYPE
  );
}

export function isValidAudioDurationMs(
  value: unknown,
): value is number {
  return (
    typeof value ===
      'number' &&
    Number.isFinite(
      value,
    ) &&
    value >=
      MIN_CONVERSATION_AUDIO_DURATION_MS &&
    value <=
      MAX_CONVERSATION_AUDIO_DURATION_MS
  );
}

export function isValidAudioByteSize(
  value: unknown,
): value is number {
  return (
    typeof value ===
      'number' &&
    Number.isFinite(
      value,
    ) &&
    value >
      0 &&
    value <=
      MAX_CONVERSATION_AUDIO_BYTES
  );
}

export function formatVoiceDuration(
  durationMs?:
    number,
): string {
  if (
    !durationMs ||
    !Number.isFinite(
      durationMs,
    ) ||
    durationMs <
      0
  ) {
    return '0:00';
  }

  const totalSeconds =
    Math.min(
      Math.round(
        durationMs /
          1000,
      ),
      Math.round(
        MAX_CONVERSATION_AUDIO_DURATION_MS /
          1000,
      ),
    );

  const minutes =
    Math.floor(
      totalSeconds /
        60,
    );

  const seconds =
    totalSeconds %
    60;

  return `${minutes}:${seconds
    .toString()
    .padStart(
      2,
      '0',
    )}`;
}

export function createValidatedAudioMetadata(
  metadata:
    Record<string, unknown> |
    undefined,
): ConversationAudioMetadata | null {
  const source =
    metadata ??
    {};

  const clientMessageId =
    readClientMessageId(
      source.client_message_id,
    );

  const mimeType =
    typeof source.mimeType ===
    'string'
      ? source.mimeType.trim().toLowerCase()
      : '';

  const extension =
    typeof source.extension ===
    'string'
      ? source.extension.replace('.', '').toLowerCase()
      : '';

  if (
    !clientMessageId ||
    !isAllowedAudioMimeType(
      mimeType,
    ) ||
    extension !==
      CONVERSATION_AUDIO_EXTENSION ||
    !isValidAudioByteSize(
      source.byteSize,
    ) ||
    !isValidAudioDurationMs(
      source.durationMs,
    )
  ) {
    return null;
  }

  return {
    client_message_id:
      clientMessageId,
    mimeType:
      CONVERSATION_AUDIO_MIME_TYPE,
    byteSize:
      source.byteSize,
    durationMs:
      source.durationMs,
    extension:
      CONVERSATION_AUDIO_EXTENSION,
  };
}

export function parseConversationAudioMetadata(
  metadata:
    Record<string, unknown> |
    undefined,
): {
  durationMs?: number;
  mimeType?: string;
  byteSize?: number;
  extension?: string;
} {
  const source =
    metadata ??
    {};

  const durationMs =
    typeof source.durationMs ===
      'number' &&
    Number.isFinite(
      source.durationMs,
    ) &&
    source.durationMs >=
      0
      ? Math.min(
          source.durationMs,
          MAX_CONVERSATION_AUDIO_DURATION_MS,
        )
      : undefined;

  const mimeType =
    typeof source.mimeType ===
    'string'
      ? source.mimeType.trim().toLowerCase()
      : undefined;

  const byteSize =
    typeof source.byteSize ===
      'number' &&
    Number.isFinite(
      source.byteSize,
    ) &&
    source.byteSize >=
      0
      ? source.byteSize
      : undefined;

  const extension =
    typeof source.extension ===
    'string'
      ? source.extension.replace('.', '').toLowerCase()
      : undefined;

  return {
    durationMs,
    mimeType:
      mimeType &&
      isAllowedAudioMimeType(
        mimeType,
      )
        ? mimeType
        : undefined,
    byteSize,
    extension:
      extension ===
      CONVERSATION_AUDIO_EXTENSION
        ? extension
        : undefined,
  };
}

export async function deleteLocalRecordingFile(
  uri?:
    string | null,
): Promise<void> {
  if (
    !uri
  ) {
    return;
  }

  try {
    const localFile =
      new File(
        uri,
      );

    if (
      localFile.exists
    ) {
      localFile.delete();
    }
  } catch (
    error
  ) {
    console.warn(
      '[Direct Gain] Unable to delete local voice recording:',
      error instanceof
        Error
        ? error.message
        : error,
    );
  }
}

function readClientMessageId(
  value: unknown,
): string | undefined {
  if (
    typeof value !==
    'string'
  ) {
    return undefined;
  }

  const trimmed =
    value.trim();

  if (
    trimmed.length ===
      0 ||
    trimmed.length >
      120 ||
    /[\u0000-\u001F\u007F]/.test(
      trimmed,
    )
  ) {
    return undefined;
  }

  return trimmed;
}
