import { useEffect, useState } from 'react';

import { resolveProfileAvatarUrl } from '../services/profile/profileAvatarRepository';

export function useResolvedProfileAvatar(
  avatarPath: string | null | undefined,
) {
  const [imageUri, setImageUri] = useState<string | null>(
    null,
  );
  const [photoUnavailable, setPhotoUnavailable] =
    useState(false);

  const path = avatarPath?.trim() || null;

  useEffect(() => {
    let cancelled = false;

    if (!path) {
      setImageUri(null);
      setPhotoUnavailable(false);
      return;
    }

    setImageUri(null);
    setPhotoUnavailable(false);

    void (async () => {
      const url = await resolveProfileAvatarUrl(path);

      if (cancelled) {
        return;
      }

      setImageUri(url);
      setPhotoUnavailable(url == null);
    })();

    return () => {
      cancelled = true;
    };
  }, [path]);

  return {
    imageUri,
    photoUnavailable,
    hasStoredPhoto: Boolean(path),
  };
}
