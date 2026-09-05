import { File } from 'expo-file-system';

import { supabase } from '../../lib/supabase';

import { updateOwnAvatarPath } from './profileRepository';
import { PROFILE_AVATAR_ENCODED_MIME } from './profileAvatarNormalizer';

import type {
  DirectGainProfile,
  PendingProfileAvatar,
} from '../../types/profile';

import { PROFILE_AVATAR_MAX_BYTES } from '../../types/profile';

export const PROFILE_AVATAR_BUCKET = 'profile-avatars';

const UUID_PATH =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const PROFILE_AVATAR_OBJECT_PATH =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/;

const SIGNED_URL_TTL_SECONDS = 60 * 60;
const SIGNED_URL_REFRESH_MARGIN_MS = 5 * 60 * 1000;

type SignedUrlCacheEntry = {
  url: string;
  expiresAt: number;
};

const signedUrlCache = new Map<string, SignedUrlCacheEntry>();

function isUuid(value: string): boolean {
  return UUID_PATH.test(value.toLowerCase());
}

async function getSessionUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (!userId || !isUuid(userId)) {
    return null;
  }

  return userId.toLowerCase();
}

function createObjectId(): string {
  const cryptoObj = globalThis.crypto;

  if (typeof cryptoObj?.randomUUID === 'function') {
    return cryptoObj.randomUUID().toLowerCase();
  }

  const bytes = new Uint8Array(16);

  if (typeof cryptoObj?.getRandomValues === 'function') {
    cryptoObj.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function createProfileAvatarStoragePath(
  ownerId: string,
  objectId: string,
): string | null {
  const path =
    `${ownerId.toLowerCase()}/${objectId.toLowerCase()}.jpg`;

  if (!PROFILE_AVATAR_OBJECT_PATH.test(path)) {
    return null;
  }

  if (path.split('/')[0] !== ownerId.toLowerCase()) {
    return null;
  }

  return path;
}

function forgetSignedUrl(storagePath: string) {
  signedUrlCache.delete(storagePath);
}

function cachedSignedUrl(storagePath: string): string | null {
  const entry = signedUrlCache.get(storagePath);

  if (!entry) {
    return null;
  }

  if (
    entry.expiresAt - Date.now() <=
    SIGNED_URL_REFRESH_MARGIN_MS
  ) {
    signedUrlCache.delete(storagePath);
    return null;
  }

  return entry.url;
}

function rememberSignedUrl(storagePath: string, url: string) {
  signedUrlCache.set(storagePath, {
    url,
    expiresAt: Date.now() + SIGNED_URL_TTL_SECONDS * 1000,
  });
}

function isSafeUploadUri(uri: string): boolean {
  const trimmed = uri.trim();

  if (
    trimmed.length === 0 ||
    trimmed.includes('..') ||
    /[\u0000-\u001F\u007F]/.test(trimmed)
  ) {
    return false;
  }

  const schemeMatch = trimmed.match(
    /^([a-zA-Z][a-zA-Z0-9+.-]*):/,
  );

  if (!schemeMatch) {
    return trimmed.startsWith('/');
  }

  const scheme = schemeMatch[1].toLowerCase();

  return scheme === 'file' || scheme === 'content';
}

async function readJpegBytes(
  uri: string,
): Promise<{ bytes: Uint8Array; byteSize: number } | null> {
  if (!isSafeUploadUri(uri)) {
    console.warn(
      '[Direct Gain] Profile avatar upload rejected: unexpected local path.',
    );
    return null;
  }

  let file: File;

  try {
    file = new File(uri);
  } catch (error) {
    console.warn(
      '[Direct Gain] Profile avatar upload rejected: invalid local file.',
      error instanceof Error ? error.message : error,
    );
    return null;
  }

  if (!file.exists) {
    console.warn(
      '[Direct Gain] Profile avatar upload rejected: local file is missing.',
    );
    return null;
  }

  try {
    const bytes = await file.bytes();
    const byteSize = bytes.byteLength;

    if (byteSize <= 0 || byteSize > PROFILE_AVATAR_MAX_BYTES) {
      console.warn(
        '[Direct Gain] Profile avatar upload rejected: file size is not allowed.',
      );
      return null;
    }

    return {
      bytes,
      byteSize,
    };
  } catch (error) {
    console.warn(
      '[Direct Gain] Profile avatar upload rejected: unable to read file bytes.',
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function deleteAvatarObject(
  storagePath: string,
): Promise<boolean> {
  if (!PROFILE_AVATAR_OBJECT_PATH.test(storagePath)) {
    return false;
  }

  const { error } = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .remove([storagePath]);

  if (error) {
    console.warn(
      '[Direct Gain] Profile avatar object cleanup failed.',
    );
    return false;
  }

  forgetSignedUrl(storagePath);
  return true;
}

export async function resolveProfileAvatarUrl(
  avatarPath: string | null,
): Promise<string | null> {
  if (!avatarPath || !PROFILE_AVATAR_OBJECT_PATH.test(avatarPath)) {
    return null;
  }

  const cached = cachedSignedUrl(avatarPath);

  if (cached) {
    return cached;
  }

  const signed = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .createSignedUrl(avatarPath, SIGNED_URL_TTL_SECONDS);

  if (signed.error || !signed.data?.signedUrl) {
    console.warn(
      '[Direct Gain] Profile avatar signed URL could not be created.',
    );
    return null;
  }

  rememberSignedUrl(avatarPath, signed.data.signedUrl);
  return signed.data.signedUrl;
}

export async function uploadOwnProfileAvatar(
  avatar: PendingProfileAvatar,
): Promise<{
  profile: DirectGainProfile | null;
  error: string | null;
}> {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      profile: null,
      error: 'Sign in to update your profile photo.',
    };
  }

  const current = await supabase
    .from('profiles')
    .select('avatar_path')
    .eq('id', userId)
    .maybeSingle();

  if (current.error) {
    return {
      profile: null,
      error: 'Your profile photo could not be updated. Try again.',
    };
  }

  const previousPath =
    typeof current.data?.avatar_path === 'string' &&
    PROFILE_AVATAR_OBJECT_PATH.test(current.data.avatar_path)
      ? current.data.avatar_path
      : null;

  const storagePath = createProfileAvatarStoragePath(
    userId,
    createObjectId(),
  );

  if (!storagePath) {
    return {
      profile: null,
      error: 'Your profile photo could not be updated. Try again.',
    };
  }

  const fileBody = await readJpegBytes(avatar.uri);

  if (!fileBody) {
    return {
      profile: null,
      error:
        'That photo could not be prepared. Please choose a different image.',
    };
  }

  const uploaded = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .upload(storagePath, fileBody.bytes, {
      contentType: PROFILE_AVATAR_ENCODED_MIME,
      upsert: false,
    });

  if (uploaded.error) {
    console.warn(
      '[Direct Gain] Profile avatar storage upload failed.',
    );
    return {
      profile: null,
      error: 'Your profile photo could not be uploaded. Try again.',
    };
  }

  const updated = await updateOwnAvatarPath(storagePath);

  if (updated.error || !updated.profile) {
    const cleaned = await deleteAvatarObject(storagePath);

    if (!cleaned) {
      console.warn(
        '[Direct Gain] New profile avatar may remain after a profile update failure.',
      );
    }

    return {
      profile: null,
      error:
        updated.error ??
        'Your profile photo could not be updated. Try again.',
    };
  }

  if (previousPath && previousPath !== storagePath) {
    const cleaned = await deleteAvatarObject(previousPath);

    if (!cleaned) {
      console.warn(
        '[Direct Gain] Previous profile avatar could not be removed after replacement.',
      );
    }
  }

  return {
    profile: updated.profile,
    error: null,
  };
}

export async function removeOwnProfileAvatar(): Promise<{
  profile: DirectGainProfile | null;
  error: string | null;
}> {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      profile: null,
      error: 'Sign in to update your profile photo.',
    };
  }

  const current = await supabase
    .from('profiles')
    .select('avatar_path')
    .eq('id', userId)
    .maybeSingle();

  if (current.error) {
    return {
      profile: null,
      error: 'Your profile photo could not be removed. Try again.',
    };
  }

  const previousPath =
    typeof current.data?.avatar_path === 'string' &&
    PROFILE_AVATAR_OBJECT_PATH.test(current.data.avatar_path)
      ? current.data.avatar_path
      : null;

  const updated = await updateOwnAvatarPath(null);

  if (updated.error || !updated.profile) {
    return {
      profile: null,
      error:
        updated.error ??
        'Your profile photo could not be removed. Try again.',
    };
  }

  if (previousPath) {
    const cleaned = await deleteAvatarObject(previousPath);

    if (!cleaned) {
      console.warn(
        '[Direct Gain] Removed profile avatar object cleanup failed.',
      );
    }
  }

  return {
    profile: updated.profile,
    error: null,
  };
}
