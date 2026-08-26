import type {
  ImageSourcePropType,
} from 'react-native';

export type DiscoverFeedType =
  | 'post'
  | 'listing'
  | 'auction'
  | 'job';

export type DiscoverFeedAuthor = {
  id: string;

  name: string;

  username: string;

  profileImage?: ImageSourcePropType;

  verified?: boolean;

  gainScore: number;
};

export type DiscoverFeedMedia = {
  id: string;

  image?: ImageSourcePropType;

  accessibilityLabel?: string;
};

export type DiscoverFeedStats = {
  likes: number;

  comments: number;

  shares: number;
};

export type DiscoverFeedItem = {
  id: string;

  type: DiscoverFeedType;

  author: DiscoverFeedAuthor;

  createdAt: string;

  title?: string;

  body?: string;

  media?: DiscoverFeedMedia[];

  price?: string;

  location?: string;

  badge?: string;

  stats: DiscoverFeedStats;
};