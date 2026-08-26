import type {
  ProfileActivityItem,
} from '../types/ProfileActivity';

export const profileActivities:
  ProfileActivityItem[] = [
    {
      id: 'activity-001',

      sellerId: 'seller-001',

      type: 'post',

      createdAt:
        '2026-08-06T10:30:00.000Z',

      createdAtLabel:
        '2 hours ago',

      title:
        'Busy week in Mackay',

      body:
        'Thanks to everyone who supported the business this week. Plenty more local opportunities coming soon.',

      likeCount: 42,
      commentCount: 8,
      shareCount: 3,

      likedByCurrentUser: false,
    },

    {
      id: 'activity-002',

      sellerId: 'seller-001',

      type: 'listing',

      createdAt:
        '2026-08-05T08:15:00.000Z',

      createdAtLabel:
        'Yesterday',

      title:
        '2022 Toyota Hilux SR5',

      body:
        'Excellent condition with a strong service history and local pickup available.',

      price: '$48,500',

      location: 'Mackay, QLD',

      likeCount: 31,
      commentCount: 11,
      shareCount: 5,

      badgeText: 'FOR SALE',

      action: {
        label: 'View listing',
        routeId: 'hilux-001',
      },
    },

    {
      id: 'activity-003',

      sellerId: 'seller-001',

      type: 'job-completed',

      createdAt:
        '2026-08-02T06:45:00.000Z',

      createdAtLabel:
        '4 days ago',

      title:
        'Local delivery completed',

      body:
        'Another smooth delivery completed for a local customer.',

      likeCount: 18,
      commentCount: 2,
      shareCount: 0,

      badgeText: 'JOB COMPLETED',
    },

    {
      id: 'activity-004',

      sellerId: 'seller-001',

      type: 'review-received',

      createdAt:
        '2026-07-29T09:20:00.000Z',

      createdAtLabel:
        '1 week ago',

      title:
        'New five-star review',

      body:
        'Fast response, honest description and an easy pickup.',

      rating: 5,

      reviewerName:
        'Sarah M.',

      likeCount: 12,
      commentCount: 1,
      shareCount: 0,

      badgeText: 'NEW REVIEW',
    },

    {
      id: 'activity-005',

      sellerId: 'seller-001',

      type: 'milestone',

      createdAt:
        '2026-07-20T11:00:00.000Z',

      createdAtLabel:
        '2 weeks ago',

      title:
        'Reached Gain Score 97',

      body:
        'Built through verified activity, successful transactions, strong reviews and positive community conduct.',

      likeCount: 67,
      commentCount: 14,
      shareCount: 6,

      badgeText: 'MILESTONE',
    },
  ];

export function getProfileActivities(
  sellerId: string,
): ProfileActivityItem[] {
  return profileActivities
    .filter(
      (activity) =>
        activity.sellerId ===
        sellerId,
    )
    .sort(
      (first, second) =>
        new Date(
          second.createdAt,
        ).getTime() -
        new Date(
          first.createdAt,
        ).getTime(),
    );
}