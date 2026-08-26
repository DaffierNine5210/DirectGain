import type {
  DiscoverFeedItem,
} from '../types/DiscoverFeed';

export const discoverFeed: DiscoverFeedItem[] = [
  {
    id: 'feed-001',

    type: 'listing',

    author: {
      id: 'seller-001',
      name: 'Liam Green',
      username: '@liamgreen',
      gainScore: 97,
      verified: true,
    },

    createdAt: '2h',

    title: '2022 Toyota Hilux SR5',

    body:
      'Excellent condition with full service history. Available for inspection in Mackay.',

    price: '$48,500',

    location: 'Mackay, QLD',

    badge: 'MARKET',

    stats: {
      likes: 54,
      comments: 11,
      shares: 6,
    },
  },

  {
    id: 'feed-002',

    type: 'post',

    author: {
      id: 'seller-001',
      name: 'Liam Green',
      username: '@liamgreen',
      gainScore: 97,
      verified: true,
    },

    createdAt: '4h',

    title: 'Busy week!',

    body:
      'Thanks everyone for supporting the business this week. Plenty more projects coming soon!',

    stats: {
      likes: 89,
      comments: 23,
      shares: 8,
    },
  },

  {
    id: 'feed-003',

    type: 'auction',

    author: {
      id: 'seller-001',
      name: 'Liam Green',
      username: '@liamgreen',
      gainScore: 97,
      verified: true,
    },

    createdAt: '6h',

    title: 'Makita Tool Kit',

    body:
      'Auction ends tonight. Current highest bid shown below.',

    price: '$180',

    badge: 'LIVE AUCTION',

    stats: {
      likes: 28,
      comments: 16,
      shares: 3,
    },
  },

  {
    id: 'feed-004',

    type: 'job',

    author: {
      id: 'seller-001',
      name: 'Liam Green',
      username: '@liamgreen',
      gainScore: 97,
      verified: true,
    },

    createdAt: 'Yesterday',

    title: 'Fence Repair Needed',

    body:
      'Looking for someone to repair a timber boundary fence this weekend.',

    price: '$850',

    location: 'Mackay, QLD',

    badge: 'LOCAL JOB',

    stats: {
      likes: 12,
      comments: 7,
      shares: 2,
    },
  },
];