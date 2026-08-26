import type { ImageSourcePropType } from 'react-native';

export type DirectGainPostType =
  | 'text'
  | 'photo'
  | 'listing'
  | 'job'
  | 'auction'
  | 'achievement';

export type DirectGainPostVisibility =
  | 'public'
  | 'followers'
  | 'private';

export type DirectGainPost = {
  id: string;

  // Who created the post
  authorId: string;

  // Post content
  type: DirectGainPostType;
  text?: string;
  image?: ImageSourcePropType;

  // Optional connections to other Direct Gain content
  listingId?: string;
  jobId?: string;
  auctionId?: string;

  // Social engagement
  likeCount: number;
  commentCount: number;
  shareCount: number;

  // Current user's interaction
  isLiked: boolean;

  // Privacy
  visibility: DirectGainPostVisibility;

  // Timing
  createdAt: string;
};