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

export async function getOwnProfilePresentation(): Promise<{
  presentation: ProfilePresentation;
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      presentation: personalPresentation(''),
      error: 'Sign in to view your profile style.',
    };
  }

  return getProfilePresentation(userId);
}

export type ActivatableProfileTemplate =
  | 'personal'
  | 'professional';

function formatActivationError(
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
    message.includes('row-level security') ||
    message.includes('permission denied')
  ) {
    return 'You do not have permission to change your profile style.';
  }

  if (
    message.includes('signed in') ||
    message.includes('not authenticated')
  ) {
    return 'Sign in to continue.';
  }

  if (message.includes('headline')) {
    return 'Complete your Professional headline before making this profile live.';
  }

  if (message.includes('business')) {
    return 'Business profile is not available yet.';
  }

  if (
    message.includes('choose personal') ||
    message.includes('professional.')
  ) {
    return 'Choose Personal or Professional.';
  }

  if (message.includes('could not be found')) {
    return 'Your profile style could not be updated. Try again.';
  }

  return fallback;
}

export async function setOwnActiveProfileTemplate(
  template: ActivatableProfileTemplate,
): Promise<{
  activeTemplate: ProfileTemplate | null;
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      activeTemplate: null,
      error: 'Sign in to continue.',
    };
  }

  if (
    template !== 'personal' &&
    template !== 'professional'
  ) {
    return {
      activeTemplate: null,
      error: 'Choose Personal or Professional.',
    };
  }

  const rpcResult = await supabase.rpc(
    'set_own_active_profile_template',
    {
      p_template: template,
    },
  );

  if (rpcResult.error) {
    return {
      activeTemplate: null,
      error: formatActivationError(
        rpcResult.error,
        'Your profile style could not be updated. Try again.',
      ),
    };
  }

  if (
    rpcResult.data !== 'personal' &&
    rpcResult.data !== 'professional'
  ) {
    return {
      activeTemplate: null,
      error: 'Your profile style could not be updated. Try again.',
    };
  }

  return {
    activeTemplate: rpcResult.data,
    error: null,
  };
}

export function formatProfileTemplateLabel(
  template: ProfileTemplate,
): string {
  if (template === 'professional') {
    return 'Professional';
  }

  if (template === 'business') {
    return 'Business';
  }

  return 'Personal';
}
