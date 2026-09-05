import * as ImagePicker from 'expo-image-picker';

import { normalizeProfileAvatar } from './profileAvatarNormalizer';

import type { PendingProfileAvatar } from '../../types/profile';

export type PickProfileAvatarResult =
  | { kind: 'permission_denied'; source: 'library' | 'camera' }
  | { kind: 'cancelled' }
  | { kind: 'unavailable'; message: string }
  | { kind: 'prepared'; avatar: PendingProfileAvatar };

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

async function prepareAsset(
  asset: ImagePicker.ImagePickerAsset | undefined,
): Promise<PickProfileAvatarResult> {
  if (!asset?.uri || isLikelyVideoAsset(asset)) {
    return {
      kind: 'unavailable',
      message:
        'That photo could not be prepared. Please choose a different image.',
    };
  }

  const normalized = await normalizeProfileAvatar(asset.uri);

  if (!normalized.ok) {
    return {
      kind: 'unavailable',
      message: normalized.error,
    };
  }

  return {
    kind: 'prepared',
    avatar: normalized.avatar,
  };
}

export async function pickProfileAvatarFromLibrary(): Promise<
  PickProfileAvatarResult
> {
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    return {
      kind: 'permission_denied',
      source: 'library',
    };
  }

  let pickerResult: ImagePicker.ImagePickerResult;

  try {
    pickerResult =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: false,
        exif: false,
      });
  } catch (error) {
    console.warn(
      '[Direct Gain] Profile photo picker failed to open.',
      error instanceof Error ? error.message : error,
    );

    return {
      kind: 'unavailable',
      message:
        'Photos could not be opened. Please try again.',
    };
  }

  if (pickerResult.canceled) {
    return { kind: 'cancelled' };
  }

  return prepareAsset(pickerResult.assets?.[0]);
}

export async function captureProfileAvatar(): Promise<
  PickProfileAvatarResult
> {
  const permission =
    await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    return {
      kind: 'permission_denied',
      source: 'camera',
    };
  }

  let pickerResult: ImagePicker.ImagePickerResult;

  try {
    pickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: false,
      exif: false,
    });
  } catch (error) {
    console.warn(
      '[Direct Gain] Profile camera failed to open.',
      error instanceof Error ? error.message : error,
    );

    return {
      kind: 'unavailable',
      message:
        'The camera could not be opened. Please try again.',
    };
  }

  if (pickerResult.canceled) {
    return { kind: 'cancelled' };
  }

  return prepareAsset(pickerResult.assets?.[0]);
}
