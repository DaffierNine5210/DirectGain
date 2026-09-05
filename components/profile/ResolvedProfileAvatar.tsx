import ProfileAvatar, {
  type ProfileAvatarSize,
} from './ProfileAvatar';

import { useResolvedProfileAvatar } from '../../hooks/useResolvedProfileAvatar';

type ResolvedProfileAvatarProps = {
  displayName: string;
  avatarPath?: string | null;
  size?: ProfileAvatarSize;
};

export default function ResolvedProfileAvatar({
  displayName,
  avatarPath = null,
  size = 'md',
}: ResolvedProfileAvatarProps) {
  const {
    imageUri,
    photoUnavailable,
    hasStoredPhoto,
  } = useResolvedProfileAvatar(avatarPath);

  return (
    <ProfileAvatar
      displayName={displayName}
      imageUri={imageUri}
      hasStoredPhoto={hasStoredPhoto}
      photoUnavailable={photoUnavailable}
      size={size}
    />
  );
}
