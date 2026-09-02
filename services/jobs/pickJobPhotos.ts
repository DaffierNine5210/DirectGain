import * as ImagePicker from 'expo-image-picker';

import { MAX_JOB_PHOTOS, type PendingJobPhoto } from '../../types/jobs';

import { normalizeJobPhoto } from './jobPhotoNormalizer';

export type PickJobPhotosResult =
  | { kind: 'permission_denied' }
  | { kind: 'cancelled' }
  | { kind: 'unavailable'; message: string }
  | {
      kind: 'prepared';
      photos: PendingJobPhoto[];
      failedCount: number;
    };

function isLikelyVideoAsset(
  asset: ImagePicker.ImagePickerAsset,
): boolean {
  const mime = (asset.mimeType ?? '').toLowerCase();
  const type = (asset.type ?? '').toLowerCase();

  return (
    type === 'video' ||
    mime.startsWith('video/')
  );
}

export async function pickAndPrepareJobPhotos(
  remainingSlots: number,
): Promise<PickJobPhotosResult> {
  const slots = Math.min(
    MAX_JOB_PHOTOS,
    Math.max(0, remainingSlots),
  );

  if (slots <= 0) {
    return {
      kind: 'cancelled',
    };
  }

  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    return {
      kind: 'permission_denied',
    };
  }

  let pickerResult: ImagePicker.ImagePickerResult;

  try {
    pickerResult =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: slots,
        quality: 1,
        base64: false,
        exif: false,
      });
  } catch (error) {
    console.warn(
      '[Direct Gain] Job photo picker failed to open.',
      error instanceof Error ? error.message : error,
    );

    return {
      kind: 'unavailable',
      message:
        'Photos could not be opened. Please try again.',
    };
  }

  if (pickerResult.canceled) {
    return {
      kind: 'cancelled',
    };
  }

  const assets = (pickerResult.assets ?? []).slice(0, slots);

  if (assets.length === 0) {
    return {
      kind: 'cancelled',
    };
  }

  const photos: PendingJobPhoto[] = [];
  let failedCount = 0;

  for (const asset of assets) {
    if (!asset.uri || isLikelyVideoAsset(asset)) {
      failedCount += 1;
      continue;
    }

    const normalized = await normalizeJobPhoto(asset.uri);

    if (!normalized.ok) {
      failedCount += 1;
      continue;
    }

    photos.push(normalized.photo);
  }

  return {
    kind: 'prepared',
    photos,
    failedCount,
  };
}
