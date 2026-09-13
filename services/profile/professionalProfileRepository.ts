import { supabase } from '../../lib/supabase';

import { getAuthenticatedUserId } from './profileRepository';
import {
  adaptProfessionalProfile,
  isProfessionalProfileRow,
  isProfessionalSkillRow,
  sanitiseOwnProfessionalProfileInput,
} from './professionalProfileAdapter';

import type {
  ProfessionalProfileCore,
  SaveOwnProfessionalProfileInput,
} from '../../types/professionalProfile';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const PROFESSIONAL_PROFILE_SELECT =
  'profile_id, professional_headline, professional_about, availability, service_area, work_preference';

const PROFESSIONAL_SKILL_SELECT =
  'id, profile_id, name, position';

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
    message.includes('skill')
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
