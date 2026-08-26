import type {
  ImageSourcePropType,
} from 'react-native';

export type ProfileActivityType =
  | 'post'
  | 'listing'
  | 'sold'
  | 'auction-created'
  | 'auction-won'
  | 'job-completed'
  | 'review-received'
  | 'milestone';

export type ProfileActivityMedia = {
  id: string;
  image?: ImageSourcePropType;
  accessibilityLabel?: string;
};

export type ProfileActivityAction = {
  label: string;
  routeId?: string;
};

export type ProfileActivityItem = {
  id: string;

  sellerId: string;

  type: ProfileActivityType;

  createdAt: string;
  createdAtLabel: string;

  title?: string;
  body?: string;

  media?: ProfileActivityMedia[];

  price?: string;
  location?: string;

  rating?: number;
  reviewerName?: string;

  likeCount?: number;
  commentCount?: number;
  shareCount?: number;

  likedByCurrentUser?: boolean;

  badgeText?: string;

  action?: ProfileActivityAction;
};