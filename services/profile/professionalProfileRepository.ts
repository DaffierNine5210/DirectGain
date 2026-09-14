import { supabase } from '../../lib/supabase';

import { getAuthenticatedUserId } from './profileRepository';
import {
  adaptProfessionalProfile,
  isProfessionalCredentialRow,
  isProfessionalCredentialRpcRow,
  isProfessionalExperienceRow,
  isProfessionalExperienceRpcRow,
  isProfessionalProfileRow,
  isProfessionalSkillRow,
  mapProfessionalCredentialRow,
  mapProfessionalCredentialRpcRow,
  mapProfessionalExperienceRow,
  mapProfessionalExperienceRpcRow,
  sanitiseOwnProfessionalProfileInput,
  toOwnProfessionalCredentialRpcEntry,
  toOwnProfessionalExperienceRpcEntry,
} from './professionalProfileAdapter';

import type {
  ProfessionalCredential,
  ProfessionalCredentialSaveInput,
  ProfessionalExperience,
  ProfessionalExperienceSaveInput,
  ProfessionalProfileCore,
  SaveOwnProfessionalProfileInput,
} from '../../types/professionalProfile';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const PROFESSIONAL_PROFILE_SELECT =
  'profile_id, professional_headline, professional_about, availability, service_area, work_preference';

const PROFESSIONAL_SKILL_SELECT =
  'id, profile_id, name, position';

const PROFESSIONAL_EXPERIENCE_SELECT =
  'id, profile_id, title, organisation, start_year, start_month, end_year, end_month, is_current, description, position, created_at, updated_at';

const PROFESSIONAL_CREDENTIAL_SELECT =
  'id, profile_id, credential_type, name, issuer, issued_year, issued_month, expires_year, expires_month, does_not_expire, position, created_at, updated_at';

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.toLowerCase());
}

function formatProfessionalError(
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
    return 'You do not have permission to update this Professional profile.';
  }

  if (
    message.includes('could not find the table') ||
    message.includes('does not exist') ||
    code === '42P01' ||
    code === 'PGRST205'
  ) {
    return 'Professional profile is not available yet.';
  }

  if (
    message.includes('headline') ||
    message.includes('about') ||
    message.includes('service area') ||
    message.includes('availability') ||
    message.includes('work preference') ||
    message.includes('skill') ||
    message.includes('experience') ||
    message.includes('credential') ||
    message.includes('organisation') ||
    message.includes('issuer')
  ) {
    return error.message;
  }

  return fallback;
}

export async function getProfessionalProfile(
  profileId: string,
): Promise<{
  profile: ProfessionalProfileCore | null;
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      profile: null,
      error: 'Sign in to view this Professional profile.',
    };
  }

  const id = profileId.trim().toLowerCase();

  if (!isUuid(id)) {
    return {
      profile: null,
      error: 'This Professional profile could not be found.',
    };
  }

  const [coreResult, skillsResult] = await Promise.all([
    supabase
      .from('professional_profiles')
      .select(PROFESSIONAL_PROFILE_SELECT)
      .eq('profile_id', id)
      .maybeSingle(),
    supabase
      .from('professional_skills')
      .select(PROFESSIONAL_SKILL_SELECT)
      .eq('profile_id', id)
      .order('position', { ascending: true }),
  ]);

  if (coreResult.error) {
    return {
      profile: null,
      error: formatProfessionalError(
        coreResult.error,
        'This Professional profile could not be loaded. Try again.',
      ),
    };
  }

  if (skillsResult.error) {
    return {
      profile: null,
      error: formatProfessionalError(
        skillsResult.error,
        'Professional skills could not be loaded. Try again.',
      ),
    };
  }

  if (!isProfessionalProfileRow(coreResult.data)) {
    return {
      profile: null,
      error: null,
    };
  }

  const skillRows = (skillsResult.data ?? []).filter(
    isProfessionalSkillRow,
  );

  return {
    profile: adaptProfessionalProfile(
      coreResult.data,
      skillRows,
    ),
    error: null,
  };
}

export async function getOwnProfessionalProfile(): Promise<{
  profile: ProfessionalProfileCore | null;
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      profile: null,
      error: 'Sign in to view your Professional profile.',
    };
  }

  return getProfessionalProfile(userId);
}

export async function saveOwnProfessionalProfile(
  input: SaveOwnProfessionalProfileInput,
): Promise<{
  profileId: string | null;
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      profileId: null,
      error:
        'Sign in to update your Professional profile.',
    };
  }

  const sanitised = sanitiseOwnProfessionalProfileInput(
    input,
  );

  if (!sanitised.ok) {
    return {
      profileId: null,
      error: sanitised.error,
    };
  }

  const result = await supabase.rpc(
    'save_own_professional_profile',
    {
      p_headline: sanitised.headline,
      p_about: sanitised.about,
      p_availability: sanitised.availability,
      p_service_area: sanitised.serviceArea,
      p_work_preference: sanitised.workPreference,
      p_skills: sanitised.skills,
    },
  );

  if (result.error) {
    return {
      profileId: null,
      error: formatProfessionalError(
        result.error,
        'Your Professional profile could not be saved. Try again.',
      ),
    };
  }

  if (typeof result.data !== 'string' || !isUuid(result.data)) {
    return {
      profileId: null,
      error:
        'Your Professional profile could not be saved. Try again.',
    };
  }

  return {
    profileId: result.data.toLowerCase(),
    error: null,
  };
}

export async function getProfessionalExperiences(
  profileId: string,
): Promise<{
  experiences: ProfessionalExperience[];
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      experiences: [],
      error: 'Sign in to view this Professional experience.',
    };
  }

  const id = profileId.trim().toLowerCase();

  if (!isUuid(id)) {
    return {
      experiences: [],
      error:
        'This Professional experience could not be found.',
    };
  }

  const result = await supabase
    .from('professional_experiences')
    .select(PROFESSIONAL_EXPERIENCE_SELECT)
    .eq('profile_id', id)
    .order('position', { ascending: true });

  if (result.error) {
    return {
      experiences: [],
      error: formatProfessionalError(
        result.error,
        'Professional experience could not be loaded. Try again.',
      ),
    };
  }

  if (result.data == null) {
    return {
      experiences: [],
      error:
        'Professional experience could not be loaded. Try again.',
    };
  }

  const rows = result.data.filter(isProfessionalExperienceRow);

  if (rows.length !== result.data.length) {
    return {
      experiences: [],
      error:
        'Professional experience could not be loaded. Try again.',
    };
  }

  return {
    experiences: rows.map(mapProfessionalExperienceRow),
    error: null,
  };
}

export async function getOwnProfessionalExperiences(): Promise<{
  experiences: ProfessionalExperience[];
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      experiences: [],
      error:
        'Sign in to view your Professional experience.',
    };
  }

  return getProfessionalExperiences(userId);
}

export async function getProfessionalCredentials(
  profileId: string,
): Promise<{
  credentials: ProfessionalCredential[];
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      credentials: [],
      error:
        'Sign in to view these Professional credentials.',
    };
  }

  const id = profileId.trim().toLowerCase();

  if (!isUuid(id)) {
    return {
      credentials: [],
      error:
        'These Professional credentials could not be found.',
    };
  }

  const result = await supabase
    .from('professional_credentials')
    .select(PROFESSIONAL_CREDENTIAL_SELECT)
    .eq('profile_id', id)
    .order('position', { ascending: true });

  if (result.error) {
    return {
      credentials: [],
      error: formatProfessionalError(
        result.error,
        'Professional credentials could not be loaded. Try again.',
      ),
    };
  }

  if (result.data == null) {
    return {
      credentials: [],
      error:
        'Professional credentials could not be loaded. Try again.',
    };
  }

  const rows = result.data.filter(isProfessionalCredentialRow);

  if (rows.length !== result.data.length) {
    return {
      credentials: [],
      error:
        'Professional credentials could not be loaded. Try again.',
    };
  }

  return {
    credentials: rows.map(mapProfessionalCredentialRow),
    error: null,
  };
}

export async function getOwnProfessionalCredentials(): Promise<{
  credentials: ProfessionalCredential[];
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      credentials: [],
      error:
        'Sign in to view your Professional credentials.',
    };
  }

  return getProfessionalCredentials(userId);
}

export async function saveOwnProfessionalExperiences(
  entries: ProfessionalExperienceSaveInput[],
): Promise<{
  experiences: ProfessionalExperience[];
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      experiences: [],
      error:
        'Sign in to update your Professional experience.',
    };
  }

  const result = await supabase.rpc(
    'save_own_professional_experiences',
    {
      p_entries: entries.map(
        toOwnProfessionalExperienceRpcEntry,
      ),
    },
  );

  if (result.error) {
    return {
      experiences: [],
      error: formatProfessionalError(
        result.error,
        'Your Professional experience could not be saved. Try again.',
      ),
    };
  }

  if (result.data == null) {
    return {
      experiences: [],
      error:
        'Your Professional experience could not be saved. Try again.',
    };
  }

  if (!Array.isArray(result.data)) {
    return {
      experiences: [],
      error:
        'Your Professional experience could not be saved. Try again.',
    };
  }

  const rows = result.data.filter(
    isProfessionalExperienceRpcRow,
  );

  if (rows.length !== result.data.length) {
    return {
      experiences: [],
      error:
        'Your Professional experience could not be saved. Try again.',
    };
  }

  return {
    experiences: rows.map(mapProfessionalExperienceRpcRow),
    error: null,
  };
}

export async function saveOwnProfessionalCredentials(
  entries: ProfessionalCredentialSaveInput[],
): Promise<{
  credentials: ProfessionalCredential[];
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      credentials: [],
      error:
        'Sign in to update your Professional credentials.',
    };
  }

  const result = await supabase.rpc(
    'save_own_professional_credentials',
    {
      p_entries: entries.map(
        toOwnProfessionalCredentialRpcEntry,
      ),
    },
  );

  if (result.error) {
    return {
      credentials: [],
      error: formatProfessionalError(
        result.error,
        'Your Professional credentials could not be saved. Try again.',
      ),
    };
  }

  if (result.data == null) {
    return {
      credentials: [],
      error:
        'Your Professional credentials could not be saved. Try again.',
    };
  }

  if (!Array.isArray(result.data)) {
    return {
      credentials: [],
      error:
        'Your Professional credentials could not be saved. Try again.',
    };
  }

  const rows = result.data.filter(
    isProfessionalCredentialRpcRow,
  );

  if (rows.length !== result.data.length) {
    return {
      credentials: [],
      error:
        'Your Professional credentials could not be saved. Try again.',
    };
  }

  return {
    credentials: rows.map(mapProfessionalCredentialRpcRow),
    error: null,
  };
}
