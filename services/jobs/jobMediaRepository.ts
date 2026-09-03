import { File } from 'expo-file-system';

import { supabase } from '../../lib/supabase';

import {
  JOB_MEDIA_MAX_BYTES,
  MAX_JOB_PHOTOS,
  type JobCoverPresentation,
  type JobMediaInsert,
  type JobMediaRecord,
  type JobPhotoAttachResult,
  type PendingJobPhoto,
  type ResolvedJobPhoto,
} from '../../types/jobs';

import { JOB_PHOTO_JPEG_MIME } from './jobPhotoNormalizer';

export const JOB_MEDIA_BUCKET = 'job-media';

const UUID_PATH =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const JOB_MEDIA_OBJECT_PATH =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/;

export type AttachJobPhotosProgress = {
  current: number;
  total: number;
};

function isUuid(value: string): boolean {
  return UUID_PATH.test(value.toLowerCase());
}

function createJobMediaObjectId(): string {
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

export function createJobMediaStoragePath(
  jobId: string,
  uploaderId: string,
  objectId: string,
): string | null {
  const path =
    `${jobId.toLowerCase()}/${uploaderId.toLowerCase()}/${objectId.toLowerCase()}.jpg`;

  if (!JOB_MEDIA_OBJECT_PATH.test(path)) {
    return null;
  }

  if (
    path.split('/')[0] !== jobId.toLowerCase() ||
    path.split('/')[1] !== uploaderId.toLowerCase()
  ) {
    return null;
  }

  return path;
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
      '[Direct Gain] Job photo upload rejected: unexpected local path.',
    );
    return null;
  }

  let file: File;

  try {
    file = new File(uri);
  } catch (error) {
    console.warn(
      '[Direct Gain] Job photo upload rejected: invalid local file.',
      error instanceof Error ? error.message : error,
    );
    return null;
  }

  if (!file.exists) {
    console.warn(
      '[Direct Gain] Job photo upload rejected: local file is missing.',
    );
    return null;
  }

  try {
    const bytes = await file.bytes();
    const byteSize = bytes.byteLength;

    if (byteSize <= 0 || byteSize > JOB_MEDIA_MAX_BYTES) {
      console.warn(
        '[Direct Gain] Job photo upload rejected: file size is not allowed.',
      );
      return null;
    }

    return {
      bytes,
      byteSize,
    };
  } catch (error) {
    console.warn(
      '[Direct Gain] Job photo upload rejected: unable to read file bytes.',
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function deleteJobMediaObject(
  storagePath: string,
): Promise<boolean> {
  const { error } = await supabase.storage
    .from(JOB_MEDIA_BUCKET)
    .remove([storagePath]);

  if (error) {
    console.warn(
      '[Direct Gain] Job media object cleanup failed.',
      error.message,
    );
    return false;
  }

  return true;
}

async function uploadOneJobPhoto(input: {
  jobId: string;
  uploaderId: string;
  photo: PendingJobPhoto;
  position: number;
}): Promise<{ ok: true } | { ok: false }> {
  const objectId = createJobMediaObjectId();
  const storagePath = createJobMediaStoragePath(
    input.jobId,
    input.uploaderId,
    objectId,
  );

  if (!storagePath) {
    console.warn(
      '[Direct Gain] Job photo upload rejected: invalid storage path.',
    );
    return { ok: false };
  }

  const fileBody = await readJpegBytes(input.photo.uri);

  if (!fileBody) {
    return { ok: false };
  }

  const uploaded = await supabase.storage
    .from(JOB_MEDIA_BUCKET)
    .upload(storagePath, fileBody.bytes, {
      contentType: JOB_PHOTO_JPEG_MIME,
      upsert: false,
    });

  if (uploaded.error) {
    console.warn(
      '[Direct Gain] Job photo storage upload failed.',
      uploaded.error.message,
    );
    return { ok: false };
  }

  const row: JobMediaInsert = {
    job_id: input.jobId,
    uploader_id: input.uploaderId,
    storage_path: storagePath,
    position: input.position,
    media_type: 'photo',
    mime_type: JOB_PHOTO_JPEG_MIME,
    byte_size: fileBody.byteSize,
  };

  const inserted = await supabase.from('job_media').insert(row);

  if (inserted.error) {
    console.warn(
      '[Direct Gain] Job media metadata insert failed.',
      inserted.error.message,
    );

    const cleaned = await deleteJobMediaObject(storagePath);

    if (!cleaned) {
      console.warn(
        '[Direct Gain] Orphan job-media object may remain after metadata failure.',
        storagePath,
      );
    }

    return { ok: false };
  }

  return { ok: true };
}

function userFacingAttachMessage(
  uploaded: number,
  failed: number,
): string {
  if (uploaded === 0) {
    return failed === 1
      ? 'Your job was posted, but the photo could not be uploaded.'
      : 'Your job was posted, but the photos could not be uploaded.';
  }

  if (failed === 1) {
    return 'Your job is live, but 1 photo could not be uploaded.';
  }

  return `Your job is live, but ${failed} photos could not be uploaded.`;
}

export async function attachJobPhotos(
  jobId: string,
  photos: readonly PendingJobPhoto[],
  onProgress?: (progress: AttachJobPhotosProgress) => void,
): Promise<JobPhotoAttachResult> {
  if (photos.length === 0) {
    return { status: 'skipped' };
  }

  const {
    data: userData,
  } = await supabase.auth.getUser();

  const uploaderId = userData.user?.id;

  if (!uploaderId || !isUuid(uploaderId) || !isUuid(jobId)) {
    return {
      status: 'complete_failure',
      failed: photos.length,
      message:
        'Your job was posted, but photos could not be uploaded. Sign in again and try adding photos later.',
    };
  }

  const queued = photos.slice(0, MAX_JOB_PHOTOS);
  let uploaded = 0;
  let failed = 0;
  let nextPosition = 0;

  for (let index = 0; index < queued.length; index += 1) {
    onProgress?.({
      current: index + 1,
      total: queued.length,
    });

    if (nextPosition > 4) {
      failed += queued.length - index;
      break;
    }

    const result = await uploadOneJobPhoto({
      jobId: jobId.toLowerCase(),
      uploaderId: uploaderId.toLowerCase(),
      photo: queued[index],
      position: nextPosition,
    });

    if (result.ok) {
      uploaded += 1;
      nextPosition += 1;
    } else {
      failed += 1;
    }
  }

  if (failed === 0) {
    return {
      status: 'full_success',
      uploaded,
    };
  }

  if (uploaded === 0) {
    return {
      status: 'complete_failure',
      failed,
      message: userFacingAttachMessage(uploaded, failed),
    };
  }

  return {
    status: 'partial_failure',
    uploaded,
    failed,
    message: userFacingAttachMessage(uploaded, failed),
  };
}

const JOB_MEDIA_SELECT_COLUMNS =
  'id, job_id, storage_path, position, media_type, mime_type, byte_size, created_at';

const SIGNED_URL_TTL_SECONDS = 60 * 60;

const SIGNED_URL_REFRESH_MARGIN_MS =
  5 * 60 * 1000;

type SignedUrlCacheEntry = {
  url: string;
  expiresAt: number;
};

const signedUrlCache = new Map<
  string,
  SignedUrlCacheEntry
>();

type JobMediaRow = {
  id: string;
  job_id: string;
  storage_path: string;
  position: number;
  media_type: string;
  mime_type: string;
  byte_size: number;
  created_at: string;
};

function uniqueJobIds(
  jobIds: readonly string[],
): string[] {
  const seen = new Set<string>();
  const next: string[] = [];

  for (const value of jobIds) {
    const id = value.trim().toLowerCase();

    if (!isUuid(id) || seen.has(id)) {
      continue;
    }

    seen.add(id);
    next.push(id);
  }

  return next;
}

function isJobMediaRow(
  value: unknown,
): value is JobMediaRow {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return false;
  }

  const row = value as JobMediaRow;

  return (
    typeof row.id === 'string' &&
    isUuid(row.id) &&
    typeof row.job_id === 'string' &&
    isUuid(row.job_id) &&
    typeof row.storage_path === 'string' &&
    typeof row.position === 'number' &&
    row.position >= 0 &&
    row.position <= 4 &&
    row.media_type === 'photo' &&
    typeof row.mime_type === 'string' &&
    typeof row.byte_size === 'number' &&
    typeof row.created_at === 'string' &&
    JOB_MEDIA_OBJECT_PATH.test(row.storage_path) &&
    row.storage_path.split('/')[0] ===
      row.job_id.toLowerCase()
  );
}

function adaptJobMediaRow(
  row: JobMediaRow,
): JobMediaRecord {
  return {
    id: row.id,
    jobId: row.job_id.toLowerCase(),
    storagePath: row.storage_path,
    position: row.position,
    mediaType: 'photo',
    mimeType: row.mime_type,
    byteSize: row.byte_size,
    createdAt: row.created_at,
  };
}

function cachedSignedUrl(
  storagePath: string,
): string | null {
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

function rememberSignedUrl(
  storagePath: string,
  url: string,
) {
  signedUrlCache.set(storagePath, {
    url,
    expiresAt:
      Date.now() + SIGNED_URL_TTL_SECONDS * 1000,
  });
}

async function createJobMediaSignedUrls(
  storagePaths: readonly string[],
): Promise<Map<string, string>> {
  const urls = new Map<string, string>();
  const pending: string[] = [];

  for (const path of storagePaths) {
    if (!JOB_MEDIA_OBJECT_PATH.test(path)) {
      continue;
    }

    const cached = cachedSignedUrl(path);

    if (cached) {
      urls.set(path, cached);
      continue;
    }

    pending.push(path);
  }

  if (pending.length === 0) {
    return urls;
  }

  const signed = await supabase.storage
    .from(JOB_MEDIA_BUCKET)
    .createSignedUrls(pending, SIGNED_URL_TTL_SECONDS);

  if (signed.error) {
    console.warn(
      '[Direct Gain] Job media signed URLs could not be created.',
    );
    return urls;
  }

  for (const item of signed.data ?? []) {
    const path = item.path;
    const url = item.signedUrl;

    if (
      !path ||
      !url ||
      item.error ||
      !JOB_MEDIA_OBJECT_PATH.test(path)
    ) {
      continue;
    }

    rememberSignedUrl(path, url);
    urls.set(path, url);
  }

  return urls;
}

export async function listJobMedia(
  jobId: string,
): Promise<JobMediaRecord[]> {
  const id = jobId.trim().toLowerCase();

  if (!isUuid(id)) {
    return [];
  }

  const result = await supabase
    .from('job_media')
    .select(JOB_MEDIA_SELECT_COLUMNS)
    .eq('job_id', id)
    .order('position', { ascending: true })
    .limit(MAX_JOB_PHOTOS);

  if (result.error) {
    console.warn(
      '[Direct Gain] Job media metadata could not be loaded.',
    );
    return [];
  }

  return (result.data ?? [])
    .filter(isJobMediaRow)
    .map(adaptJobMediaRow);
}

export async function listJobMediaForJobs(
  jobIds: readonly string[],
): Promise<JobMediaRecord[]> {
  const ids = uniqueJobIds(jobIds);

  if (ids.length === 0) {
    return [];
  }

  const result = await supabase
    .from('job_media')
    .select(JOB_MEDIA_SELECT_COLUMNS)
    .in('job_id', ids)
    .order('position', { ascending: true })
    .limit(ids.length * MAX_JOB_PHOTOS);

  if (result.error) {
    console.warn(
      '[Direct Gain] Job media metadata could not be loaded.',
    );
    return [];
  }

  return (result.data ?? [])
    .filter(isJobMediaRow)
    .filter((row) => ids.includes(row.job_id.toLowerCase()))
    .map(adaptJobMediaRow);
}

export async function listResolvedJobPhotos(
  jobId: string,
): Promise<ResolvedJobPhoto[]> {
  const records = await listJobMedia(jobId);

  if (records.length === 0) {
    return [];
  }

  const urls = await createJobMediaSignedUrls(
    records.map((record) => record.storagePath),
  );

  const photos: ResolvedJobPhoto[] = [];

  for (const record of records) {
    const signedUrl = urls.get(record.storagePath);

    if (!signedUrl) {
      continue;
    }

    photos.push({
      id: record.id,
      position: record.position,
      signedUrl,
    });
  }

  return photos;
}

export async function resolveJobCoverPhotos(
  jobIds: readonly string[],
): Promise<Record<string, JobCoverPresentation>> {
  const records = await listJobMediaForJobs(jobIds);
  const byJobId = new Map<string, JobMediaRecord[]>();

  for (const record of records) {
    const current = byJobId.get(record.jobId) ?? [];
    current.push(record);
    byJobId.set(record.jobId, current);
  }

  const coversToSign: JobMediaRecord[] = [];
  const presentations: Record<string, JobCoverPresentation> =
    {};

  for (const [jobId, jobRecords] of byJobId) {
    const ordered = [...jobRecords].sort(
      (left, right) => left.position - right.position,
    );
    const cover = ordered.find(
      (record) => record.position === 0,
    );

    if (!cover) {
      continue;
    }

    const cached = cachedSignedUrl(cover.storagePath);

    if (cached) {
      presentations[jobId] = {
        url: cached,
        photoCount: ordered.length,
      };
      continue;
    }

    coversToSign.push(cover);
  }

  if (coversToSign.length === 0) {
    return presentations;
  }

  const urls = await createJobMediaSignedUrls(
    coversToSign.map((record) => record.storagePath),
  );

  for (const cover of coversToSign) {
    const signedUrl = urls.get(cover.storagePath);

    if (!signedUrl) {
      continue;
    }

    const photoCount =
      byJobId.get(cover.jobId)?.length ?? 1;

    presentations[cover.jobId] = {
      url: signedUrl,
      photoCount,
    };
  }

  return presentations;
}
