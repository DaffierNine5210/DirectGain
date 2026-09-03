export type ProfileAccountType =
  | 'personal'
  | 'business';

export const PROFILE_DISPLAY_NAME_MIN = 1;
export const PROFILE_DISPLAY_NAME_MAX = 80;
export const PROFILE_BIO_MAX = 160;
export const PROFILE_SUBURB_MAX = 60;
export const PROFILE_STATE_MAX = 40;

export type DirectGainProfile = {
  id: string;
  displayName: string;
  bio: string | null;
  avatarPath: string | null;
  suburb: string | null;
  state: string | null;
  accountType: ProfileAccountType;
};

export type UpdateOwnProfileInput = {
  displayName: string;
  bio: string;
  suburb: string;
  state: string;
};
