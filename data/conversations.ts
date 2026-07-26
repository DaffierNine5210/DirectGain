import { Conversation } from '../types/Messaging';

export const conversations: Conversation[] = [
  {
    id: 'market-hilux',
    participant: {
      id: 'seller-1',
      name: 'Liam Green',
      username: '@liamgreen',
      gainScore: 97,
      rating: 4.9,
      reviewCount: 263,
      responseTime: 'Usually replies in 6 min',
      isOnline: true,
      isVerified: true,
    },

    context: {
      type: 'market',
      title: '2022 Toyota Hilux SR5',
      itemPrice: 48500,
      location: 'Mackay, QLD',
    },

    unreadCount: 2,

    messages: [
      {
        id: 'm1',
        conversationId: 'market-hilux',
        sender: 'current-user',
        kind: 'text',
        text: 'Hi Liam, is the Hilux still available?',
        createdAt: '9:05 AM',
        status: 'read',
      },

      {
        id: 'm2',
        conversationId: 'market-hilux',
        sender: 'participant',
        kind: 'text',
        text: 'Yes mate, still available.',
        createdAt: '9:06 AM',
      },

      {
        id: 'm3',
        conversationId: 'market-hilux',
        sender: 'participant',
        kind: 'text',
        text: 'Would you like to inspect it tomorrow?',
        createdAt: '9:08 AM',
      },
    ],
  },

  {
    id: 'job-builder',

    participant: {
      id: 'builder-1',
      name: 'Sarah Mitchell',
      username: '@sarahbuilds',
      gainScore: 99,
      rating: 5,
      reviewCount: 118,
      responseTime: 'Usually replies in 3 min',
      isVerified: true,
    },

    context: {
      type: 'job',
      title: 'Kitchen Renovation',
    },

    unreadCount: 0,

    messages: [
      {
        id: 'j1',
        conversationId: 'job-builder',
        sender: 'participant',
        kind: 'text',
        text: 'Thanks for your enquiry. I can provide a quote tomorrow.',
        createdAt: 'Yesterday',
      },
    ],
  },

  {
    id: 'auction-bike',

    participant: {
      id: 'auction-1',
      name: 'Daniel Ross',
      gainScore: 94,
      rating: 4.8,
      reviewCount: 73,
      isVerified: true,
    },

    context: {
      type: 'auction',
      title: 'Yamaha WR450',
    },

    unreadCount: 1,

    messages: [
      {
        id: 'a1',
        conversationId: 'auction-bike',
        sender: 'participant',
        kind: 'text',
        text: "You've been outbid.",
        createdAt: '2 min ago',
      },
    ],
  },

  {
    id: 'support',

    participant: {
      id: 'support',
      name: 'Direct Gain Support',
      gainScore: 100,
      isVerified: true,
    },

    context: {
      type: 'support',
      title: 'Support',
    },

    unreadCount: 0,

    messages: [
      {
        id: 's1',
        conversationId: 'support',
        sender: 'system',
        kind: 'system',
        text: 'Welcome to Direct Gain.',
        createdAt: 'Monday',
      },
    ],
  },
];