import ProfileHero from './ProfileHero';
import { presentProfileHeroIdentity } from './profilePresentation';

import type { DirectGainProfile } from '../../types/profile';

type ProfileIdentityHeaderProps = {
  profile: DirectGainProfile;
  mode?: 'own' | 'public';
  avatarUrl?: string | null;
  avatarBusy?: boolean;
  avatarUnavailable?: boolean;
  onAvatarPress?: () => void;
};

export default function ProfileIdentityHeader({
  profile,
  mode = 'public',
  avatarUrl = null,
  avatarBusy = false,
  avatarUnavailable = false,
  onAvatarPress,
}: ProfileIdentityHeaderProps) {
  return (
    <ProfileHero
      identity={presentProfileHeroIdentity(profile)}
      mode={mode === 'own' ? 'owner' : 'public'}
      avatarUrl={avatarUrl}
      avatarBusy={avatarBusy}
      avatarUnavailable={avatarUnavailable}
      onAvatarPress={onAvatarPress}
    />
  );
}
