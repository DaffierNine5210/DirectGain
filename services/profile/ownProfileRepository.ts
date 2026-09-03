import { supabase } from '../../lib/supabase';

import type {
  OwnProfile,
  ProfileAccountType,
} from '../../types/profile';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const OWN_PROFILE_SELECT =
  'display_name, bio, suburb, state, account_type';

type OwnProfileRow = {
  display_name: string;
  bio: string | null;
  suburb: string | null;
  state: string | null;
  account_type: string;
};

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.toLowerCase());
}

async function getSessionUserId(): Promise<
  string | null
> {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (!userId || !isUuid(userId)) {
    return null;
  }

  return userId.toLowerCase();
}

function optionalText(
  value: string | null,
): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed ? trimmed : null;
}

function adaptOwnProfile(
  row: OwnProfileRow,
): OwnProfile {
  const accountType: ProfileAccountType =
    row.account_type === 'business'
      ? 'business'
      : 'personal';

  return {
    displayName:
      row.display_name.trim() ||
      'Direct Gain member',
    bio: optionalText(row.bio),
    suburb: optionalText(row.suburb),
    state: optionalText(row.state),
    accountType,
  };
}

export async function getOwnProfile(): Promise<{
  profile: OwnProfile | null;
  error: string | null;
}> {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      profile: null,
      error: 'Sign in to view your profile.',
    };
  }

  const result = await supabase
    .from('profiles')
    .select(OWN_PROFILE_SELECT)
    .eq('id', userId)
    .maybeSingle();

  if (result.error) {
    return {
      profile: null,
      error: 'Your profile could not be loaded. Try again.',
    };
  }

  if (
    !result.data ||
    typeof result.data.display_name !== 'string'
  ) {
    return {
      profile: null,
      error: 'Your profile could not be found.',
    };
  }

  return {
    profile: adaptOwnProfile(result.data as OwnProfileRow),
    error: null,
  };
}
