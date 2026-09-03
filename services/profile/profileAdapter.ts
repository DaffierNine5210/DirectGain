import type {
  DirectGainProfile,
  ProfileAccountType,
  UpdateOwnProfileInput,
} from '../../types/profile';

import {
  PROFILE_BIO_MAX,
  PROFILE_DISPLAY_NAME_MAX,
  PROFILE_DISPLAY_NAME_MIN,
  PROFILE_STATE_MAX,
  PROFILE_SUBURB_MAX,
} from '../../types/profile';

export type ProfileRow = {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_path: string | null;
  suburb: string | null;
  state: string | null;
  account_type: string;
};

export function optionalProfileText(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed ? trimmed : null;
}

export function mapAccountType(
  value: string,
): ProfileAccountType {
  return value === 'business' ? 'business' : 'personal';
}

export function profileInitials(
  displayName: string,
): string {
  const parts = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'DG';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`
    .toUpperCase();
}

export function formatProfileLocation(
  suburb: string | null,
  state: string | null,
): string | null {
  const parts = [suburb, state].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

export function formatAccountTypeLabel(
  accountType: ProfileAccountType,
): string {
  return accountType === 'business' ? 'Business' : 'Personal';
}

export function isProfileRow(
  value: unknown,
): value is ProfileRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const row = value as ProfileRow;

  return (
    typeof row.id === 'string' &&
    typeof row.display_name === 'string' &&
    (row.bio === null || typeof row.bio === 'string') &&
    (row.avatar_path === null || typeof row.avatar_path === 'string') &&
    (row.suburb === null || typeof row.suburb === 'string') &&
    (row.state === null || typeof row.state === 'string') &&
    typeof row.account_type === 'string'
  );
}

export function adaptProfileRow(
  row: ProfileRow,
): DirectGainProfile {
  return {
    id: row.id,
    displayName:
      row.display_name.trim() || 'Direct Gain member',
    bio: optionalProfileText(row.bio),
    avatarPath: optionalProfileText(row.avatar_path),
    suburb: optionalProfileText(row.suburb),
    state: optionalProfileText(row.state),
    accountType: mapAccountType(row.account_type),
  };
}

export function sanitiseOwnProfileInput(
  input: UpdateOwnProfileInput,
):
  | {
      ok: true;
      displayName: string;
      bio: string | null;
      suburb: string | null;
      state: string | null;
    }
  | {
      ok: false;
      error: string;
      field:
        | 'displayName'
        | 'bio'
        | 'suburb'
        | 'state';
    } {
  const displayName = input.displayName.trim();
  const bio = optionalProfileText(input.bio);
  const suburb = optionalProfileText(input.suburb);
  const state = optionalProfileText(input.state);

  if (
    displayName.length < PROFILE_DISPLAY_NAME_MIN ||
    displayName.length > PROFILE_DISPLAY_NAME_MAX
  ) {
    return {
      ok: false,
      field: 'displayName',
      error:
        'Display name must be between 1 and 80 characters.',
    };
  }

  if (bio && bio.length > PROFILE_BIO_MAX) {
    return {
      ok: false,
      field: 'bio',
      error: 'Keep your bio to 160 characters or fewer.',
    };
  }

  if (suburb && suburb.length > PROFILE_SUBURB_MAX) {
    return {
      ok: false,
      field: 'suburb',
      error: 'Suburb must be 60 characters or fewer.',
    };
  }

  if (state && state.length > PROFILE_STATE_MAX) {
    return {
      ok: false,
      field: 'state',
      error: 'State must be 40 characters or fewer.',
    };
  }

  return {
    ok: true,
    displayName,
    bio,
    suburb,
    state,
  };
}
