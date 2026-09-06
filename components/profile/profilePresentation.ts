import {
  formatAccountTypeLabel,
  formatProfileLocation,
  optionalProfileText,
} from '../../services/profile/profileAdapter';

import type { DirectGainProfile } from '../../types/profile';

export type ProfileHeroMode = 'owner' | 'public';

export type ProfileHeroIdentity = {
  displayName: string;
  accountTypeLabel: string;
  location: string | null;
  bio: string | null;
  hasStoredPhoto: boolean;
};

export function presentProfileHeroIdentity(
  profile: DirectGainProfile,
): ProfileHeroIdentity {
  return {
    displayName: profile.displayName,
    accountTypeLabel: formatAccountTypeLabel(
      profile.accountType,
    ),
    location: formatProfileLocation(
      profile.suburb,
      profile.state,
    ),
    bio: optionalProfileText(profile.bio),
    hasStoredPhoto: Boolean(profile.avatarPath),
  };
}
