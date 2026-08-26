import type {
  DirectGainActivity,
} from '../types/DirectGainActivity';

import type {
  DirectGainAuction,
} from '../types/DirectGainAuction';

import type {
  DirectGainJob,
} from '../types/DirectGainJob';

import type {
  DirectGainListing,
} from '../types/DirectGainListing';

import type {
  DirectGainPost,
} from '../types/DirectGainPost';

import type {
  DirectGainReview,
} from '../types/DirectGainReview';

import type {
  DirectGainUser,
} from '../types/DirectGainUser';

export const demoUsers: DirectGainUser[] = [
  {
    id: 'user-liam',

    name: 'Liam Green',
    username: '@liamgreen',

    bio:
      'Local seller and business owner focused on reliable service, honest listings, and helping the Direct Gain community grow together.',

    suburb: 'Mackay',
    state: 'QLD',

    gainScore: 97,
    rating: 4.9,

    verification: [
      'identity',
      'business',
      'community',
    ],

    memberSince: 2022,

    responseTime:
      'Usually replies within 6 minutes',

    stats: {
      followers: 1840,
      following: 126,

      completedSales: 284,
      completedJobs: 37,
      completedAuctions: 18,

      reviewCount: 263,
    },

    isFollowing: false,
  },
];

export const demoPosts: DirectGainPost[] = [
  {
    id: 'post-liam-001',

    authorId: 'user-liam',

    type: 'text',

    text:
      'Busy week in Mackay. Thanks to everyone supporting the business and the local community.',

    likeCount: 42,
    commentCount: 8,
    shareCount: 3,

    isLiked: false,

    visibility: 'public',

    createdAt:
      '2026-08-06T10:30:00.000Z',
  },

  {
    id: 'post-liam-002',

    authorId: 'user-liam',

    type: 'listing',

    text:
      'New Hilux listing is now live.',

    listingId:
      'listing-hilux-001',

    likeCount: 31,
    commentCount: 11,
    shareCount: 5,

    isLiked: false,

    visibility: 'public',

    createdAt:
      '2026-08-05T08:15:00.000Z',
  },
];

export const demoListings: DirectGainListing[] = [
  {
    id: 'listing-hilux-001',

    sellerId: 'user-liam',

    title:
      '2022 Toyota Hilux SR5',

    description:
      'Excellent condition with full service history and local inspection available.',

    category: 'Vehicles',

    price: 48500,

    condition: 'excellent',

    suburb: 'Mackay',
    state: 'QLD',

    status: 'active',

    deliveryOptions: [
      'pickup',
    ],

    imageUris: [],

    viewCount: 420,
    saveCount: 37,

    isSaved: false,

    createdAt:
      '2026-08-05T08:00:00.000Z',

    updatedAt:
      '2026-08-05T08:00:00.000Z',
  },
];

export const demoJobs: DirectGainJob[] = [
  {
    id: 'job-fence-001',

    posterId: 'user-liam',

    title:
      'Fence Repair Needed',

    description:
      'Looking for someone to repair a timber boundary fence this weekend.',

    category: 'Landscaping',

    jobType: 'one-off',

    status: 'open',

    payType: 'fixed',

    payAmount: 850,

    suburb: 'Mackay',
    state: 'QLD',

    skills: [
      'Fence repair',
      'Carpentry',
    ],

    licences: [],

    applicantCount: 5,
    viewCount: 126,
    saveCount: 14,

    isSaved: false,

    createdAt:
      '2026-08-04T06:30:00.000Z',

    updatedAt:
      '2026-08-04T06:30:00.000Z',
  },
];

export const demoAuctions: DirectGainAuction[] = [
  {
    id: 'auction-makita-001',

    sellerId: 'user-liam',

    title:
      'Makita Tool Kit',

    description:
      'Quality Makita tool kit with auction ending soon.',

    category: 'Tools',

    startingBid: 100,
    currentBid: 180,

    suburb: 'Mackay',
    state: 'QLD',

    status: 'live',

    imageUris: [],

    bids: [
      {
        id: 'bid-001',

        bidderId:
          'demo-user-bidder',

        amount: 180,

        createdAt:
          '2026-08-06T08:20:00.000Z',
      },
    ],

    bidCount: 6,

    highestBidderId:
      'demo-user-bidder',

    viewCount: 98,
    watcherCount: 14,

    isWatching: false,

    createdAt:
      '2026-08-05T09:00:00.000Z',

    updatedAt:
      '2026-08-06T08:20:00.000Z',

    startsAt:
      '2026-08-05T09:00:00.000Z',

    endsAt:
      '2026-08-06T12:00:00.000Z',
  },
];

export const demoReviews: DirectGainReview[] = [
  {
    id: 'review-liam-001',

    reviewerId:
      'demo-user-sarah',

    recipientId:
      'user-liam',

    context: 'market',

    listingId:
      'listing-hilux-001',

    rating: 5,

    comment:
      'Fast response, honest description, and an easy pickup.',

    verifiedInteraction: true,

    status: 'published',

    helpfulCount: 12,

    isMarkedHelpful: false,

    createdAt:
      '2026-07-29T09:20:00.000Z',

    updatedAt:
      '2026-07-29T09:20:00.000Z',
  },
];

export const demoActivities: DirectGainActivity[] = [
  {
    id: 'activity-liam-001',

    userId: 'user-liam',

    type: 'post-created',

    postId: 'post-liam-001',

    title:
      'Shared a public post',

    description:
      'Busy week in Mackay.',

    visibility: 'public',

    createdAt:
      '2026-08-06T10:30:00.000Z',
  },

  {
    id: 'activity-liam-002',

    userId: 'user-liam',

    type: 'listing-created',

    listingId:
      'listing-hilux-001',

    title:
      'Listed a Toyota Hilux',

    description:
      '2022 Toyota Hilux SR5',

    amount: 48500,

    visibility: 'public',

    createdAt:
      '2026-08-05T08:15:00.000Z',
  },

  {
    id: 'activity-liam-003',

    userId: 'user-liam',

    type: 'job-created',

    jobId: 'job-fence-001',

    title:
      'Posted a local job',

    description:
      'Fence Repair Needed',

    amount: 850,

    visibility: 'public',

    createdAt:
      '2026-08-04T06:30:00.000Z',
  },

  {
    id: 'activity-liam-004',

    userId: 'user-liam',

    type: 'auction-created',

    auctionId:
      'auction-makita-001',

    title:
      'Started an auction',

    description:
      'Makita Tool Kit',

    amount: 180,

    visibility: 'public',

    createdAt:
      '2026-08-05T09:00:00.000Z',
  },

  {
    id: 'activity-liam-005',

    userId: 'user-liam',

    type: 'review-received',

    reviewId:
      'review-liam-001',

    relatedUserId:
      'demo-user-sarah',

    title:
      'Received a five-star review',

    description:
      'Verified Marketplace interaction.',

    visibility: 'public',

    createdAt:
      '2026-07-29T09:20:00.000Z',
  },
];