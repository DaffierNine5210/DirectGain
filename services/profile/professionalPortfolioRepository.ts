import { File } from 'expo-file-system';

import { supabase } from '../../lib/supabase';

import { getAuthenticatedUserId } from './profileRepository';
import {
  isProfessionalPortfolioMediaRow,
  isProfessionalPortfolioProjectRow,
  isProfessionalPortfolioStoragePath,
  mapProfessionalPortfolioProjectRow,
  sanitiseOwnProfessionalPortfolio,
  toOwnProfessionalPortfolioRpcEntry,
  validateProfessionalPortfolioDrafts,
} from './professionalProfileAdapter';

import {
  PROFESSIONAL_PORTFOLIO_JPEG_MIME,
  PROFESSIONAL_PORTFOLIO_MEDIA_MAX_BYTES,
  type ProfessionalPortfolioDraftMedia,
  type ProfessionalPortfolioDraftProject,
  type ProfessionalPortfolioPresentedMedia,
  type ProfessionalPortfolioPresentedProject,
  type ProfessionalPortfolioProject,
} from '../../types/professionalProfile';

export const PROFESSIONAL_PORTFOLIO_BUCKET =
  'professional-portfolio';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const PROFESSIONAL_PORTFOLIO_OBJECT_PATH =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/;

const PROJECT_SELECT =
  'id, profile_id, title, description, position, created_at, updated_at';

const MEDIA_SELECT =
  'id, project_id, profile_id, storage_path, position, media_type, mime_type, byte_size, created_at';

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

export function createProfessionalPortfolioObjectId(): string {
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

export function createProfessionalPortfolioStoragePath(
  profileId: string,
  projectId: string,
  objectId: string,
): string | null {
  const path =
    `${profileId.toLowerCase()}/${projectId.toLowerCase()}/${objectId.toLowerCase()}.jpg`;

  if (
    !isProfessionalPortfolioStoragePath(
      path,
      profileId,
      projectId,
    )
  ) {
    return null;
  }

  return path;
}

function formatPortfolioError(
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
    return 'You do not have permission to update this Professional portfolio.';
  }

  if (
    message.includes('could not find the table') ||
    message.includes('does not exist') ||
    code === '42P01' ||
    code === 'PGRST205'
  ) {
    return 'Professional portfolio is not available yet.';
  }

  if (
    message.includes('portfolio') ||
    message.includes('photo') ||
    message.includes('title') ||
    message.includes('description') ||
    message.includes('jpeg') ||
    message.includes('2 mb')
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

async function readJpegBytes(
  uri: string,
): Promise<{ bytes: Uint8Array; byteSize: number } | null> {
  if (!isSafeUploadUri(uri)) {
    console.warn(
      '[Direct Gain] Portfolio photo upload rejected: unexpected local path.',
    );
    return null;
  }

  let file: File;

  try {
    file = new File(uri);
  } catch (error) {
    console.warn(
      '[Direct Gain] Portfolio photo upload rejected: invalid local file.',
      error instanceof Error ? error.message : error,
    );
    return null;
  }

  if (!file.exists) {
    console.warn(
      '[Direct Gain] Portfolio photo upload rejected: local file is missing.',
    );
    return null;
  }

  try {
    const bytes = await file.bytes();
    const byteSize = bytes.byteLength;

    if (
      byteSize <= 0 ||
      byteSize > PROFESSIONAL_PORTFOLIO_MEDIA_MAX_BYTES
    ) {
      console.warn(
        '[Direct Gain] Portfolio photo upload rejected: file size is not allowed.',
      );
      return null;
    }

    return { bytes, byteSize };
  } catch (error) {
    console.warn(
      '[Direct Gain] Portfolio photo upload rejected: unable to read file bytes.',
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function deletePortfolioObjects(
  storagePaths: readonly string[],
): Promise<{ deleted: string[]; failed: string[] }> {
  const unique = [
    ...new Set(
      storagePaths
        .map(path => path.trim().toLowerCase())
        .filter(path =>
          PROFESSIONAL_PORTFOLIO_OBJECT_PATH.test(path),
        ),
    ),
  ];

  if (unique.length === 0) {
    return { deleted: [], failed: [] };
  }

  const { error } = await supabase.storage
    .from(PROFESSIONAL_PORTFOLIO_BUCKET)
    .remove(unique);

  if (error) {
    console.warn(
      '[Direct Gain] Portfolio storage cleanup failed.',
      error.message,
    );
    return { deleted: [], failed: unique };
  }

  for (const path of unique) {
    signedUrlCache.delete(path);
  }

  return { deleted: unique, failed: [] };
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

async function createPortfolioSignedUrls(
  storagePaths: readonly string[],
): Promise<Map<string, string>> {
  const urls = new Map<string, string>();
  const pending: string[] = [];

  for (const path of storagePaths) {
    if (!PROFESSIONAL_PORTFOLIO_OBJECT_PATH.test(path)) {
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
    .from(PROFESSIONAL_PORTFOLIO_BUCKET)
    .createSignedUrls(pending, SIGNED_URL_TTL_SECONDS);

  if (signed.error) {
    console.warn(
      '[Direct Gain] Portfolio signed URLs could not be created.',
      signed.error.message,
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
      !PROFESSIONAL_PORTFOLIO_OBJECT_PATH.test(path)
    ) {
      continue;
    }

    rememberSignedUrl(path, url);
    urls.set(path, url);
  }

  return urls;
}

function withDisplayUrls(
  projects: ProfessionalPortfolioProject[],
  urls: Map<string, string>,
): ProfessionalPortfolioPresentedProject[] {
  return projects.map(project => ({
    ...project,
    media: project.media.map(
      (item): ProfessionalPortfolioPresentedMedia => ({
        ...item,
        displayUrl: urls.get(item.storagePath) ?? null,
      }),
    ),
  }));
}

async function loadOwnPortfolioMetadata(): Promise<{
  projects: ProfessionalPortfolioProject[];
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      projects: [],
      error: 'Sign in to view your Professional portfolio.',
    };
  }

  const projectResult = await supabase
    .from('professional_portfolio_projects')
    .select(PROJECT_SELECT)
    .eq('profile_id', userId)
    .order('position', { ascending: true });

  if (projectResult.error) {
    return {
      projects: [],
      error: formatPortfolioError(
        projectResult.error,
        'Professional portfolio could not be loaded. Try again.',
      ),
    };
  }

  const projectRows = (projectResult.data ?? []).filter(
    isProfessionalPortfolioProjectRow,
  );

  if (projectRows.length !== (projectResult.data ?? []).length) {
    return {
      projects: [],
      error:
        'Professional portfolio could not be loaded. Try again.',
    };
  }

  if (projectRows.length === 0) {
    return { projects: [], error: null };
  }

  const projectIds = projectRows.map(row => row.id);

  const mediaResult = await supabase
    .from('professional_portfolio_media')
    .select(MEDIA_SELECT)
    .eq('profile_id', userId)
    .in('project_id', projectIds)
    .order('position', { ascending: true });

  if (mediaResult.error) {
    return {
      projects: [],
      error: formatPortfolioError(
        mediaResult.error,
        'Professional portfolio photos could not be loaded. Try again.',
      ),
    };
  }

  const mediaRows = (mediaResult.data ?? []).filter(
    isProfessionalPortfolioMediaRow,
  );

  if (mediaRows.length !== (mediaResult.data ?? []).length) {
    return {
      projects: [],
      error:
        'Professional portfolio photos could not be loaded. Try again.',
    };
  }

  const projects = projectRows.map(row =>
    mapProfessionalPortfolioProjectRow(row, mediaRows),
  );

  if (projects.some(project => project.media.length < 1)) {
    return {
      projects: [],
      error:
        'Professional portfolio could not be loaded. Try again.',
    };
  }

  return { projects, error: null };
}

export async function getOwnProfessionalPortfolio(): Promise<{
  projects: ProfessionalPortfolioPresentedProject[];
  error: string | null;
}> {
  const loaded = await loadOwnPortfolioMetadata();

  if (loaded.error) {
    return { projects: [], error: loaded.error };
  }

  const urls = await createPortfolioSignedUrls(
    loaded.projects.flatMap(project =>
      project.media.map(item => item.storagePath),
    ),
  );

  return {
    projects: withDisplayUrls(loaded.projects, urls),
    error: null,
  };
}

export function presentedPortfolioToDrafts(
  projects: ProfessionalPortfolioPresentedProject[],
): ProfessionalPortfolioDraftProject[] {
  return projects.map(project => ({
    id: project.id,
    persisted: true,
    title: project.title,
    description: project.description ?? '',
    media: project.media.map(
      (item): ProfessionalPortfolioDraftMedia => ({
        draftKey: item.id,
        persistedId: item.id,
        storagePath: item.storagePath,
        byteSize: item.byteSize,
        localPreviewUri: null,
        displayUrl: item.displayUrl,
      }),
    ),
  }));
}

export async function saveOwnProfessionalPortfolio(
  drafts: ProfessionalPortfolioDraftProject[],
  previouslyPersisted: ProfessionalPortfolioProject[],
): Promise<{
  projects: ProfessionalPortfolioPresentedProject[];
  error: string | null;
  cleanupWarning: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      projects: [],
      error: 'Sign in to update your Professional portfolio.',
      cleanupWarning: null,
    };
  }

  const validated = validateProfessionalPortfolioDrafts(drafts);

  if (!validated.ok) {
    return {
      projects: [],
      error: validated.error,
      cleanupWarning: null,
    };
  }

  const uploadedThisAttempt: string[] = [];
  const nextDrafts: ProfessionalPortfolioDraftProject[] = [];

  for (const project of drafts) {
    const nextMedia: ProfessionalPortfolioDraftMedia[] = [];

    for (const item of project.media) {
      if (item.persistedId && item.storagePath) {
        nextMedia.push(item);
        continue;
      }

      const objectId = createProfessionalPortfolioObjectId();
      const storagePath = createProfessionalPortfolioStoragePath(
        userId,
        project.id,
        objectId,
      );

      if (!storagePath) {
        await deletePortfolioObjects(uploadedThisAttempt);
        return {
          projects: [],
          error:
            'A portfolio photo path could not be created. Try again.',
          cleanupWarning: null,
        };
      }

      const localUri = item.localPreviewUri?.trim() ?? '';
      const fileBody = await readJpegBytes(localUri);

      if (!fileBody) {
        await deletePortfolioObjects(uploadedThisAttempt);
        return {
          projects: [],
          error:
            'A portfolio photo could not be read for upload. Try again.',
          cleanupWarning: null,
        };
      }

      const uploaded = await supabase.storage
        .from(PROFESSIONAL_PORTFOLIO_BUCKET)
        .upload(storagePath, fileBody.bytes, {
          contentType: PROFESSIONAL_PORTFOLIO_JPEG_MIME,
          upsert: false,
        });

      if (uploaded.error) {
        console.warn(
          '[Direct Gain] Portfolio photo storage upload failed.',
          uploaded.error.message,
        );
        await deletePortfolioObjects(uploadedThisAttempt);
        return {
          projects: [],
          error:
            'A portfolio photo could not be uploaded. Try again.',
          cleanupWarning: null,
        };
      }

      uploadedThisAttempt.push(storagePath);
      nextMedia.push({
        ...item,
        storagePath,
        byteSize: fileBody.byteSize,
        persistedId: null,
      });
    }

    nextDrafts.push({
      ...project,
      media: nextMedia,
    });
  }

  const sanitised = sanitiseOwnProfessionalPortfolio(nextDrafts);

  if (!sanitised.ok) {
    await deletePortfolioObjects(uploadedThisAttempt);
    return {
      projects: [],
      error: sanitised.error,
      cleanupWarning: null,
    };
  }

  const previousPaths = new Set(
    previouslyPersisted.flatMap(project =>
      project.media.map(item => item.storagePath),
    ),
  );
  const nextPaths = new Set(
    sanitised.entries.flatMap(entry =>
      entry.media.map(item => item.storagePath.toLowerCase()),
    ),
  );
  const removedPersistedPaths = [...previousPaths].filter(
    path => !nextPaths.has(path),
  );

  const result = await supabase.rpc(
    'save_own_professional_portfolio',
    {
      p_entries: sanitised.entries.map(
        toOwnProfessionalPortfolioRpcEntry,
      ),
    },
  );

  if (result.error) {
    await deletePortfolioObjects(uploadedThisAttempt);
    return {
      projects: [],
      error: formatPortfolioError(
        result.error,
        'Your Professional portfolio could not be saved. Try again.',
      ),
      cleanupWarning: null,
    };
  }

  if (result.data == null || !Array.isArray(result.data)) {
    await deletePortfolioObjects(uploadedThisAttempt);
    return {
      projects: [],
      error:
        'Your Professional portfolio could not be saved. Try again.',
      cleanupWarning: null,
    };
  }

  const cleanup = await deletePortfolioObjects(
    removedPersistedPaths,
  );

  const loaded = await getOwnProfessionalPortfolio();

  if (loaded.error) {
    return {
      projects: [],
      error: loaded.error,
      cleanupWarning:
        cleanup.failed.length > 0
          ? 'Portfolio was saved, but some removed photos could not be cleared from storage.'
          : null,
    };
  }

  return {
    projects: loaded.projects,
    error: null,
    cleanupWarning:
      cleanup.failed.length > 0
        ? 'Portfolio was saved, but some removed photos could not be cleared from storage.'
        : null,
  };
}
