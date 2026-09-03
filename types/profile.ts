export type ProfileAccountType =
  | 'personal'
  | 'business';

export type OwnProfile = {
  displayName: string;
  bio: string | null;
  suburb: string | null;
  state: string | null;
  accountType: ProfileAccountType;
};
