import { supabase } from '../../lib/supabase';

import {
  adaptProfileRow,
  isProfileRow,
  sanitiseOwnProfileInput,
} from './profileAdapter';

import type {
  DirectGainProfile,
  UpdateOwnProfileInput,
} from '../../types/profile';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const PROFILE_SELECT =
  'id, display_name, bio, avatar_path, suburb, state, account_type';

const OWN_AVATAR_PATH =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/;

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.toLowerCase());
}

export async function getAuthenticatedUserId(): Promise<
  string | null
> {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (!userId || !isUuid(userId)) {
    return null;
  }

  return userId.toLowerCase();
}

function formatProfileError(
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
    return 'You do not have permission to update this profile.';
  }

  if (message.includes('profiles_display_name_length')) {
    return 'Display name must be between 1 and 80 characters.';
  }

  if (message.includes('profiles_bio_length')) {
    return 'Keep your bio to 160 characters or fewer.';
  }

  if (message.includes('profiles_suburb_length')) {
    return 'Check the suburb, then try again.';
  }

  if (message.includes('profiles_state_length')) {
    return 'Check the state, then try again.';
  }

  if (message.includes('avatar path must belong')) {
    return 'Your profile photo could not be updated.';
  }

  if (message.includes('only the profile owner can set an avatar')) {
    return 'You do not have permission to update this profile.';
  }

  return fallback;
}

async function readProfileById(
  profileId: string,
): Promise<{
  profile: DirectGainProfile | null;
  error: string | null;
}> {
  const result = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', profileId)
    .maybeSingle();

  if (result.error) {
    return {
      profile: null,
      error: 'This profile could not be loaded. Try again.',
    };
  }

  if (!isProfileRow(result.data)) {
    return {
      profile: null,
      error: 'This profile could not be found.',
    };
  }

  return {
    profile: adaptProfileRow(result.data),
    error: null,
  };
}

export async function getOwnProfile(): Promise<{
  profile: DirectGainProfile | null;
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      profile: null,
      error: 'Sign in to view your profile.',
    };
  }

  const result = await readProfileById(userId);

  if (result.error && result.error.includes('could not be found')) {
    return {
      profile: null,
      error: 'Your profile could not be found.',
    };
  }

  if (result.error) {
    return {
      profile: null,
      error: 'Your profile could not be loaded. Try again.',
    };
  }

  return result;
}

export async function getProfileById(
  profileId: string,
): Promise<{
  profile: DirectGainProfile | null;
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      profile: null,
      error: 'Sign in to view this profile.',
    };
  }

  const id = profileId.trim().toLowerCase();

  if (!isUuid(id)) {
    return {
      profile: null,
      error: 'This profile could not be found.',
    };
  }

  return readProfileById(id);
}

export async function updateOwnProfile(
  input: UpdateOwnProfileInput,
): Promise<{
  profile: DirectGainProfile | null;
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      profile: null,
      error: 'Sign in to update your profile.',
    };
  }

  const sanitised = sanitiseOwnProfileInput(input);

  if (!sanitised.ok) {
    return {
      profile: null,
      error: sanitised.error,
    };
  }

  const updated = await supabase
    .from('profiles')
    .update({
      display_name: sanitised.displayName,
      bio: sanitised.bio,
      suburb: sanitised.suburb,
      state: sanitised.state,
    })
    .eq('id', userId)
    .select(PROFILE_SELECT)
    .maybeSingle();

  if (updated.error) {
    return {
      profile: null,
      error: formatProfileError(
        updated.error,
        'Your profile could not be saved. Try again.',
      ),
    };
  }

  if (!isProfileRow(updated.data)) {
    return {
      profile: null,
      error: 'Your profile could not be saved. Try again.',
    };
  }

  return {
    profile: adaptProfileRow(updated.data),
    error: null,
  };
}

export async function updateOwnAvatarPath(
  avatarPath: string | null,
): Promise<{
  profile: DirectGainProfile | null;
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      profile: null,
      error: 'Sign in to update your profile photo.',
    };
  }

  let nextPath: string | null = null;

  if (avatarPath !== null) {
    const path = avatarPath.trim().toLowerCase();
    const owner = path.split('/')[0];

    if (!OWN_AVATAR_PATH.test(path) || owner !== userId) {
      return {
        profile: null,
        error: 'Your profile photo could not be updated.',
      };
    }

    nextPath = path;
  }

  const updated = await supabase
    .from('profiles')
    .update({
      avatar_path: nextPath,
    })
    .eq('id', userId)
    .select(PROFILE_SELECT)
    .maybeSingle();

  if (updated.error) {
    return {
      profile: null,
      error: formatProfileError(
        updated.error,
        'Your profile photo could not be updated. Try again.',
      ),
    };
  }

  if (!isProfileRow(updated.data)) {
    return {
      profile: null,
      error: 'Your profile photo could not be updated. Try again.',
    };
  }

  return {
    profile: adaptProfileRow(updated.data),
    error: null,
  };
}
