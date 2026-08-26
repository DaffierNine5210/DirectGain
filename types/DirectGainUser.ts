import type { ImageSourcePropType } from 'react-native';

export type DirectGainVerification =
  | 'identity'
  | 'business'
  | 'professional'
  | 'community';

export type DirectGainUserStats = {
  followers: number;
  following: number;
  completedSales: number;
  completedJobs: number;
  completedAuctions: number;
  reviewCount: number;
};

export type DirectGainUser = {
  id: string;

  // Identity
  name: string;
  username: string;
  bio: string;

  // Profile appearance
  profileImage?: ImageSourcePropType;
  coverImage?: ImageSourcePropType;

  // Location
  suburb: string;
  state: string;

  // Trust
  gainScore: number;
  rating: number;
  verification: DirectGainVerification[];

  // Account information
  memberSince: number;
  responseTime: string;

  // Platform activity
  stats: DirectGainUserStats;

  // Social
  isFollowing: boolean;
};