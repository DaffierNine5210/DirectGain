import { supabase } from '../../lib/supabase';

import { getAuthenticatedUserId } from './profileRepository';

import {
  DEFAULT_PROFILE_TEMPLATE,
  type ProfilePresentation,
  type ProfileTemplate,
} from '../../types/profile';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

type ProfilePresentationRow = {
  profile_id: string;
  active_template: string;
};

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.toLowerCase());
}

export function isProfileTemplate(
  value: unknown,
): value is ProfileTemplate {
  return (
    value === 'personal' ||
    value === 'professional' ||
    value === 'business'
  );
}

export function resolveProfileTemplate(
  value: unknown,
): ProfileTemplate {
  if (isProfileTemplate(value)) {
    return value;
  }

  return DEFAULT_PROFILE_TEMPLATE;
}

function isProfilePresentationRow(
  value: unknown,
): value is ProfilePresentationRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const row = value as ProfilePresentationRow;

  return (
    typeof row.profile_id === 'string' &&
    typeof row.active_template === 'string'
  );
}

function personalPresentation(
  profileId: string,
): ProfilePresentation {
  return {
    profileId,
    activeTemplate: DEFAULT_PROFILE_TEMPLATE,
  };
}

export async function getProfilePresentation(
  profileId: string,
): Promise<{
  presentation: ProfilePresentation;
  error: string | null;
}> {
  const id = profileId.trim().toLowerCase();
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      presentation: personalPresentation(id),
      error: 'Sign in to view this profile.',
    };
  }

  if (!isUuid(id)) {
    return {
      presentation: personalPresentation(id),
      error: 'This profile could not be found.',
    };
  }

  const result = await supabase
    .from('profile_presentation')
    .select('profile_id, active_template')
    .eq('profile_id', id)
    .maybeSingle();

  if (result.error) {
    return {
      presentation: personalPresentation(id),
      error:
        'Profile style could not be loaded. Try again.',
    };
  }

  if (!isProfilePresentationRow(result.data)) {
    return {
      presentation: personalPresentation(id),
      error: null,
    };
  }

  return {
    presentation: {
      profileId: result.data.profile_id.toLowerCase(),
      activeTemplate: resolveProfileTemplate(
        result.data.active_template,
      ),
    },
    error: null,
  };
}
