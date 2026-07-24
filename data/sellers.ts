import type { SellerProfile } from '../types/SellerProfile';

export const sellers: SellerProfile[] = [
  {
    id: 'seller-001',

    name: 'Liam Green',

    username: '@liamgreen',

    bio:
      'Local seller and business owner focused on reliable service, honest listings, and helping the Direct Gain community grow together.',

    gainScore: 97,

    rating: 4.9,

    reviewCount: 263,

    responseTime: 'Usually replies within 6 minutes',

    completedSales: 284,

    memberSince: 2022,

    suburb: 'Mackay',

    state: 'QLD',

    followers: 1840,

    following: 126,

    responseRate: 98,

    repeatCustomerRate: 81,

    verification: [
      'identity',
      'business',
      'community',
    ],

    skills: [
      {
        id: 'skill-001',
        name: 'Vehicle sales',
        verified: true,
      },
      {
        id: 'skill-002',
        name: 'Customer service',
        verified: true,
      },
      {
        id: 'skill-003',
        name: 'Local delivery',
      },
    ],

    achievements: [
      {
        id: 'achievement-001',
        title: 'Identity Verified',
        description:
          'Identity successfully verified by Direct Gain.',
        earnedAt: '2022',
        icon: 'shield-checkmark-outline',
      },
      {
        id: 'achievement-002',
        title: 'First 100 Sales',
        description:
          'Completed more than 100 successful marketplace sales.',
        earnedAt: '2024',
        icon: 'trophy-outline',
      },
      {
        id: 'achievement-003',
        title: 'Community Trusted',
        description:
          'Earned through consistent reviews and positive community conduct.',
        earnedAt: '2026',
        icon: 'people-outline',
      },
    ],

    reviews: [
      {
        id: 'review-001',
        reviewerName: 'Sarah M.',
        rating: 5,
        comment:
          'Fast response, honest description, and an easy pickup.',
        createdAt: '2 weeks ago',
        transactionType: 'market',
      },
      {
        id: 'review-002',
        reviewerName: 'Daniel R.',
        rating: 5,
        comment:
          'Professional seller and exactly as advertised.',
        createdAt: '1 month ago',
        transactionType: 'market',
      },
      {
        id: 'review-003',
        reviewerName: 'Emily T.',
        rating: 4.8,
        comment:
          'Great communication and a smooth transaction.',
        createdAt: '2 months ago',
        transactionType: 'market',
      },
    ],

    portfolio: [
      {
        id: 'portfolio-001',
        title: 'Local vehicle sales',
        description:
          'A selection of successfully completed local vehicle transactions.',
      },
      {
        id: 'portfolio-002',
        title: 'Trusted seller history',
        description:
          'Consistent service, communication, and positive buyer outcomes.',
      },
    ],

    activeListingIds: [
      'hilux-001',
    ],

    completedJobCount: 37,

    completedAuctionCount: 18,

    isFollowing: false,
  },
];

export function getSellerById(
  sellerId: string,
): SellerProfile | undefined {
  return sellers.find(
    seller => seller.id === sellerId,
  );
}