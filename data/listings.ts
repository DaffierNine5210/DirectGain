import type { Listing } from '../types/Listing';

export const listings: Listing[] = [
  {
    id: 'hilux-001',

    title: '2022 Toyota Hilux SR5',

    price: 48500,

    currency: 'AUD',

    images: [
  require('../assets/icon.png'),

    ],

    category: 'Vehicles',

    condition: 'Excellent',

    description:
      'One owner vehicle with full service history. Recently serviced and in excellent condition. Registration included.',

    location: {
      suburb: 'Mackay',
      state: 'QLD',
      distanceKm: 4,
    },

    seller: {
      id: 'seller-001',

      name: 'Liam Green',

      gainScore: 97,

      rating: 4.9,

      reviewCount: 263,

      responseTime: 'Usually replies within 6 minutes',

      completedSales: 284,

      memberSince: 2022,

      verification: [
        'identity',
        'business',
      ],
    },

    createdAt: '2 hours ago',

    isFavourite: false,

    allowsOffers: true,

    deliveryAvailable: false,

    pickupAvailable: true,

    opportunityScore: 94,
  },
];