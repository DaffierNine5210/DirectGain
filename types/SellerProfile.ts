import type {
  ImageSourcePropType,
} from 'react-native';

import type {
  ListingSeller,
  VerificationType,
} from './Listing';

export type SellerProfileSection =
  | 'market'
  | 'jobs'
  | 'auctions'
  | 'reviews'
  | 'portfolio';

export type SellerSkill = {
  id: string;
  name: string;
  verified?: boolean;
};

export type SellerAchievement = {
  id: string;
  title: string;
  description: string;
  earnedAt: string;
  icon:
  | 'trophy-outline'
  | 'shield-checkmark-outline'
  | 'star-outline'
  | 'briefcase-outline'
  | 'people-outline'
  | 'trending-up-outline';
};

export type SellerReview = {
  id: string;
  reviewerName: string;
  reviewerImage?: ImageSourcePropType;
  rating: number;
  comment: string;
  createdAt: string;
  transactionType:
    | 'market'
    | 'job'
    | 'auction';
};

export type SellerPortfolioItem = {
  id: string;
  title: string;
  description?: string;
  image?: ImageSourcePropType;
};

export type SellerProfile = ListingSeller & {
  username: string;
  bio: string;
  profileImage?: ImageSourcePropType;
  coverImage?: ImageSourcePropType;

  suburb: string;
  state: string;

  followers: number;
  following: number;

  responseRate: number;
  repeatCustomerRate: number;

  verification: VerificationType[];
  skills: SellerSkill[];
  achievements: SellerAchievement[];
  reviews: SellerReview[];
  portfolio: SellerPortfolioItem[];

  activeListingIds: string[];
  completedJobCount: number;
  completedAuctionCount: number;

  isFollowing: boolean;
};