import { File } from 'expo-file-system';
import {
  ImageManipulator,
  SaveFormat,
} from 'expo-image-manipulator';

import {
  PROFILE_AVATAR_JPEG_MIME,
  PROFILE_AVATAR_MAX_BYTES,
  PROFILE_AVATAR_MAX_EDGE,
  PROFILE_AVATAR_TARGET_BYTES,
  type PendingProfileAvatar,
} from '../../types/profile';

const NORMALIZE_ATTEMPTS = [
  { compress: 0.82 },
  { compress: 0.7 },
  { compress: 0.55 },
  { compress: 0.4 },
] as const;

export type NormalizeProfileAvatarResult =
  | {
      ok: true;
      avatar: PendingProfileAvatar;
    }
  | {
      ok: false;
      error: string;
    };

function getLocalFileByteSize(
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

async function encodeSquareJpeg(
  sourceUri: string,
  compress: number,
): Promise<{ uri: string; byteSize: number } | null> {
  const sourceContext = ImageManipulator.manipulate(sourceUri);
  let image = await sourceContext.renderAsync();

  if (
    !Number.isFinite(image.width) ||
    !Number.isFinite(image.height) ||
    image.width < 1 ||
    image.height < 1
  ) {
    return null;
  }

  const side = Math.min(image.width, image.height);
  const originX = Math.floor((image.width - side) / 2);
  const originY = Math.floor((image.height - side) / 2);

  const cropContext = ImageManipulator.manipulate(image);
  cropContext.crop({
    originX,
    originY,
    width: side,
    height: side,
  });
  image = await cropContext.renderAsync();

  const target = Math.min(PROFILE_AVATAR_MAX_EDGE, image.width);

  if (target < image.width) {
    const resizeContext = ImageManipulator.manipulate(image);
    resizeContext.resize({
      width: target,
      height: target,
    });
    image = await resizeContext.renderAsync();
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

export async function normalizeProfileAvatar(
  sourceUri: string,
): Promise<NormalizeProfileAvatarResult> {
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
      const encoded = await encodeSquareJpeg(
        trimmed,
        attempt.compress,
      );

      if (!encoded) {
        continue;
      }

      lastByteSize = encoded.byteSize;

      if (encoded.byteSize > PROFILE_AVATAR_MAX_BYTES) {
        continue;
      }

      if (encoded.byteSize > PROFILE_AVATAR_TARGET_BYTES) {
        const isLastAttempt =
          attempt ===
          NORMALIZE_ATTEMPTS[NORMALIZE_ATTEMPTS.length - 1];

        if (!isLastAttempt) {
          continue;
        }
      }

      return {
        ok: true,
        avatar: {
          uri: encoded.uri,
          byteSize: encoded.byteSize,
        },
      };
    } catch (error) {
      console.warn(
        '[Direct Gain] Profile avatar could not be re-encoded.',
        error instanceof Error ? error.message : error,
      );
    }
  }

  if (
    lastByteSize != null &&
    lastByteSize > PROFILE_AVATAR_MAX_BYTES
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

export const PROFILE_AVATAR_ENCODED_MIME =
  PROFILE_AVATAR_JPEG_MIME;
