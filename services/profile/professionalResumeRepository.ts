import { File } from 'expo-file-system';

import { supabase } from '../../lib/supabase';

import { getAuthenticatedUserId } from './profileRepository';
import {
  isProfessionalResumeRow,
  isProfessionalResumeStoragePath,
  mapProfessionalResumeRow,
} from './professionalProfileAdapter';

import {
  PROFESSIONAL_RESUME_MAX_BYTES,
  PROFESSIONAL_RESUME_PDF_MIME,
  type ProfessionalResume,
} from '../../types/professionalProfile';

import type { PendingProfessionalResume } from './pickProfessionalResume';

export const PROFESSIONAL_RESUME_BUCKET = 'professional-resumes';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const PROFESSIONAL_RESUME_OBJECT_PATH =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/;

const RESUME_SELECT =
  'profile_id, storage_path, mime_type, byte_size, original_filename, created_at, updated_at';

const SIGNED_URL_TTL_SECONDS = 60 * 60;
const SIGNED_URL_REFRESH_MARGIN_MS = 5 * 60 * 1000;

type SignedUrlCacheEntry = {
  url: string;
  expiresAt: number;
};

const signedUrlCache = new Map<string, SignedUrlCacheEntry>();

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.toLowerCase());
}

function createResumeObjectId(): string {
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

  const hex = Array.from(bytes, byte =>
    byte.toString(16).padStart(2, '0'),
  ).join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function createProfessionalResumeStoragePath(
  profileId: string,
  objectId: string,
): string | null {
  const path =
    `${profileId.toLowerCase()}/${objectId.toLowerCase()}.pdf`;

  if (!isProfessionalResumeStoragePath(path, profileId)) {
    return null;
  }

  return path;
}

function formatResumeError(
  error: {
    message?: string;
    code?: string;
  } | null,
  fallback: string,
): string {
  if (!error?.message) {
    return fallback;
  }

  const message = error.message.toLowerCase();
  const code = error.code ?? '';

  if (
    code === '42501' ||
    message.includes('row-level security')
  ) {
    return 'You do not have permission to update this Professional résumé.';
  }

  if (
    message.includes('could not find the table') ||
    message.includes('does not exist') ||
    code === '42P01' ||
    code === 'PGRST205'
  ) {
    return 'Professional résumé is not available yet.';
  }

  if (
    message.includes('résumé') ||
    message.includes('resume') ||
    message.includes('pdf') ||
    message.includes('filename') ||
    message.includes('5 mb')
  ) {
    return error.message;
  }

  return fallback;
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

async function readPdfBytes(
  uri: string,
  expectedByteSize: number,
): Promise<{ bytes: Uint8Array; byteSize: number } | null> {
  if (!isSafeUploadUri(uri)) {
    console.warn(
      '[Direct Gain] Résumé upload rejected: unexpected local path.',
    );
    return null;
  }

  let file: File;

  try {
    file = new File(uri);
  } catch (error) {
    console.warn(
      '[Direct Gain] Résumé upload rejected: invalid local file.',
      error instanceof Error ? error.message : error,
    );
    return null;
  }

  if (!file.exists) {
    console.warn(
      '[Direct Gain] Résumé upload rejected: local file is missing.',
    );
    return null;
  }

  try {
    const bytes = await file.bytes();
    const byteSize = bytes.byteLength;

    if (byteSize <= 0 || byteSize > PROFESSIONAL_RESUME_MAX_BYTES) {
      console.warn(
        '[Direct Gain] Résumé upload rejected: file size is not allowed.',
      );
      return null;
    }

    const header = String.fromCharCode(
      bytes[0] ?? 0,
      bytes[1] ?? 0,
      bytes[2] ?? 0,
      bytes[3] ?? 0,
    );

    if (header !== '%PDF') {
      console.warn(
        '[Direct Gain] Résumé upload rejected: file is not a PDF.',
      );
      return null;
    }

    if (
      expectedByteSize > 0 &&
      expectedByteSize !== byteSize &&
      expectedByteSize > PROFESSIONAL_RESUME_MAX_BYTES
    ) {
      return null;
    }

    return { bytes, byteSize };
  } catch (error) {
    console.warn(
      '[Direct Gain] Résumé upload rejected: unable to read file bytes.',
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function deleteResumeObject(
  storagePath: string,
): Promise<boolean> {
  const path = storagePath.trim().toLowerCase();

  if (!PROFESSIONAL_RESUME_OBJECT_PATH.test(path)) {
    return false;
  }

  const { error } = await supabase.storage
    .from(PROFESSIONAL_RESUME_BUCKET)
    .remove([path]);

  if (error) {
    console.warn(
      '[Direct Gain] Résumé storage cleanup failed.',
      error.message,
    );
    return false;
  }

  signedUrlCache.delete(path);
  return true;
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

export async function getOwnProfessionalResume(): Promise<{
  resume: ProfessionalResume | null;
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      resume: null,
      error: 'Sign in to view your Professional résumé.',
    };
  }

  const result = await supabase
    .from('professional_resumes')
    .select(RESUME_SELECT)
    .eq('profile_id', userId)
    .maybeSingle();

  if (result.error) {
    return {
      resume: null,
      error: formatResumeError(
        result.error,
        'Your Professional résumé could not be loaded. Try again.',
      ),
    };
  }

  if (result.data == null) {
    return { resume: null, error: null };
  }

  if (!isProfessionalResumeRow(result.data)) {
    return {
      resume: null,
      error:
        'Your Professional résumé could not be loaded. Try again.',
    };
  }

  return {
    resume: mapProfessionalResumeRow(result.data),
    error: null,
  };
}

function mapSaveRpcRow(
  data: unknown,
): ProfessionalResume | null {
  const row = Array.isArray(data) ? data[0] : data;

  if (!isProfessionalResumeRow(row)) {
    return null;
  }

  return mapProfessionalResumeRow(row);
}

export async function saveOwnProfessionalResumeFile(
  pending: PendingProfessionalResume,
  current: ProfessionalResume | null,
): Promise<{
  resume: ProfessionalResume | null;
  error: string | null;
  cleanupWarning: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      resume: current,
      error: 'Sign in to update your Professional résumé.',
      cleanupWarning: null,
    };
  }

  const objectId = createResumeObjectId();
  const storagePath = createProfessionalResumeStoragePath(
    userId,
    objectId,
  );

  if (!storagePath) {
    return {
      resume: current,
      error: 'A résumé path could not be created. Try again.',
      cleanupWarning: null,
    };
  }

  const fileBody = await readPdfBytes(
    pending.uri,
    pending.byteSize,
  );

  if (!fileBody) {
    return {
      resume: current,
      error:
        'That PDF could not be prepared. Choose a PDF of 5 MB or less.',
      cleanupWarning: null,
    };
  }

  const uploaded = await supabase.storage
    .from(PROFESSIONAL_RESUME_BUCKET)
    .upload(storagePath, fileBody.bytes, {
      contentType: PROFESSIONAL_RESUME_PDF_MIME,
      upsert: false,
    });

  if (uploaded.error) {
    console.warn(
      '[Direct Gain] Résumé storage upload failed.',
      uploaded.error.message,
    );
    return {
      resume: current,
      error: 'Your résumé could not be uploaded. Try again.',
      cleanupWarning: null,
    };
  }

  const result = await supabase.rpc(
    'save_own_professional_resume',
    {
      p_storage_path: storagePath,
      p_mime_type: PROFESSIONAL_RESUME_PDF_MIME,
      p_byte_size: fileBody.byteSize,
      p_original_filename: pending.originalFilename,
    },
  );

  if (result.error) {
    await deleteResumeObject(storagePath);
    return {
      resume: current,
      error: formatResumeError(
        result.error,
        'Your Professional résumé could not be saved. Try again.',
      ),
      cleanupWarning: null,
    };
  }

  const saved = mapSaveRpcRow(result.data);

  if (!saved) {
    await deleteResumeObject(storagePath);
    return {
      resume: current,
      error:
        'Your Professional résumé could not be saved. Try again.',
      cleanupWarning: null,
    };
  }

  let cleanupWarning: string | null = null;

  if (
    current?.storagePath &&
    current.storagePath !== saved.storagePath
  ) {
    const cleaned = await deleteResumeObject(current.storagePath);

    if (!cleaned) {
      console.warn(
        '[Direct Gain] Previous résumé object may remain after replacement.',
        current.storagePath,
      );
      cleanupWarning =
        'Résumé updated, but the previous file could not be cleared from storage.';
    }
  }

  return {
    resume: saved,
    error: null,
    cleanupWarning,
  };
}

export async function removeOwnProfessionalResume(
  current: ProfessionalResume | null,
): Promise<{
  error: string | null;
  cleanupWarning: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      error: 'Sign in to remove your Professional résumé.',
      cleanupWarning: null,
    };
  }

  const result = await supabase.rpc(
    'remove_own_professional_resume',
  );

  if (result.error) {
    return {
      error: formatResumeError(
        result.error,
        'Your Professional résumé could not be removed. Try again.',
      ),
      cleanupWarning: null,
    };
  }

  const returnedPath =
    typeof result.data === 'string'
      ? result.data.trim().toLowerCase()
      : null;
  const pathToDelete =
    returnedPath && isUuid(returnedPath.split('/')[0] ?? '')
      ? returnedPath
      : current?.storagePath ?? null;

  if (
    pathToDelete &&
    PROFESSIONAL_RESUME_OBJECT_PATH.test(pathToDelete)
  ) {
    const cleaned = await deleteResumeObject(pathToDelete);

    if (!cleaned) {
      console.warn(
        '[Direct Gain] Résumé object may remain after metadata removal.',
        pathToDelete,
      );
      return {
        error: null,
        cleanupWarning:
          'Résumé was removed, but the file could not be cleared from storage.',
      };
    }
  }

  return { error: null, cleanupWarning: null };
}

export async function createProfessionalResumeSignedUrl(
  storagePath: string,
  options?: { bypassCache?: boolean },
): Promise<string | null> {
  const path = storagePath.trim().toLowerCase();
  const userId = await getAuthenticatedUserId();

  if (
    !userId ||
    !isProfessionalResumeStoragePath(path, userId)
  ) {
    return null;
  }

  if (options?.bypassCache) {
    signedUrlCache.delete(path);
  }

  const cached = cachedSignedUrl(path);

  if (cached) {
    return cached;
  }

  const signed = await supabase.storage
    .from(PROFESSIONAL_RESUME_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (signed.error || !signed.data?.signedUrl) {
    console.warn(
      '[Direct Gain] Résumé signed URL could not be created.',
      signed.error?.message,
    );
    return null;
  }

  signedUrlCache.set(path, {
    url: signed.data.signedUrl,
    expiresAt: Date.now() + SIGNED_URL_TTL_SECONDS * 1000,
  });

  return signed.data.signedUrl;
}
