import { File } from 'expo-file-system';
import {
  ImageManipulator,
  SaveFormat,
} from 'expo-image-manipulator';

import {
  JOB_MEDIA_MAX_BYTES,
  JOB_MEDIA_TARGET_BYTES,
  type PendingJobPhoto,
} from '../../types/jobs';

const JPEG_MIME = 'image/jpeg';

const NORMALIZE_ATTEMPTS = [
  { maxEdge: 1600, compress: 0.78 },
  { maxEdge: 1600, compress: 0.62 },
  { maxEdge: 1280, compress: 0.52 },
  { maxEdge: 1024, compress: 0.42 },
  { maxEdge: 800, compress: 0.32 },
] as const;

export type NormalizeJobPhotoResult =
  | {
      ok: true;
      photo: PendingJobPhoto;
    }
  | {
      ok: false;
      error: string;
    };

function createLocalPhotoId(): string {
  const cryptoObj = globalThis.crypto;

  if (typeof cryptoObj?.randomUUID === 'function') {
    return cryptoObj.randomUUID().toLowerCase();
  }

  return `local-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

export function getLocalFileByteSize(
  uri: string,
): number | null {
  try {
    const file = new File(uri);

    if (!file.exists) {
      return null;
    }

    const size = file.size;

    if (!Number.isFinite(size) || size <= 0) {
      return null;
    }

    return size;
  } catch {
    return null;
  }
}

function scaledSize(
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } | null {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width < 1 ||
    height < 1
  ) {
    return null;
  }

  const longest = Math.max(width, height);

  if (longest <= maxEdge) {
    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  const scale = maxEdge / longest;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function encodeJpegAttempt(
  sourceUri: string,
  maxEdge: number,
  compress: number,
): Promise<{ uri: string; byteSize: number } | null> {
  const sourceContext = ImageManipulator.manipulate(sourceUri);
  let image = await sourceContext.renderAsync();
  const nextSize = scaledSize(
    image.width,
    image.height,
    maxEdge,
  );

  if (!nextSize) {
    return null;
  }

  const longest = Math.max(image.width, image.height);

  if (longest > maxEdge) {
    const resizedContext = ImageManipulator.manipulate(image);
    resizedContext.resize({
      width: nextSize.width,
      height: nextSize.height,
    });
    image = await resizedContext.renderAsync();
  }

  const saved = await image.saveAsync({
    format: SaveFormat.JPEG,
    compress,
  });

  if (!saved.uri) {
    return null;
  }

  const byteSize = getLocalFileByteSize(saved.uri);

  if (byteSize == null) {
    return null;
  }

  return {
    uri: saved.uri,
    byteSize,
  };
}

export async function normalizeJobPhoto(
  sourceUri: string,
): Promise<NormalizeJobPhotoResult> {
  const trimmed = sourceUri.trim();

  if (!trimmed) {
    return {
      ok: false,
      error:
        'That photo could not be prepared. Please choose a different image.',
    };
  }

  let lastByteSize: number | null = null;

  for (const attempt of NORMALIZE_ATTEMPTS) {
    try {
      const encoded = await encodeJpegAttempt(
        trimmed,
        attempt.maxEdge,
        attempt.compress,
      );

      if (!encoded) {
        continue;
      }

      lastByteSize = encoded.byteSize;

      if (encoded.byteSize > JOB_MEDIA_MAX_BYTES) {
        continue;
      }

      if (encoded.byteSize > JOB_MEDIA_TARGET_BYTES) {
        const isLastAttempt =
          attempt ===
          NORMALIZE_ATTEMPTS[NORMALIZE_ATTEMPTS.length - 1];

        if (!isLastAttempt) {
          continue;
        }
      }

      return {
        ok: true,
        photo: {
          localId: createLocalPhotoId(),
          uri: encoded.uri,
          byteSize: encoded.byteSize,
        },
      };
    } catch (error) {
      console.warn(
        '[Direct Gain] Job photo could not be re-encoded.',
        error instanceof Error ? error.message : error,
      );
    }
  }

  if (
    lastByteSize != null &&
    lastByteSize > JOB_MEDIA_MAX_BYTES
  ) {
    return {
      ok: false,
      error:
        'That photo is still too large after optimization. Please choose a smaller image.',
    };
  }

  return {
    ok: false,
    error:
      'That photo could not be prepared. Please choose a different image.',
  };
}

export const JOB_PHOTO_JPEG_MIME = JPEG_MIME;
