import type {
  DirectGainActivity,
} from '../types/DirectGainActivity';

import {
  demoActivities,
  demoAuctions,
  demoJobs,
  demoListings,
  demoPosts,
  demoReviews,
  demoUsers,
} from './directGainDemoData';

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

export type DirectGainStore = {
  users: DirectGainUser[];
  posts: DirectGainPost[];
  listings: DirectGainListing[];
  jobs: DirectGainJob[];
  auctions: DirectGainAuction[];
  reviews: DirectGainReview[];
  activities: DirectGainActivity[];
};

export const directGainStore: DirectGainStore = {
  users: demoUsers,

  posts: demoPosts,

  listings: demoListings,

  jobs: demoJobs,

  auctions: demoAuctions,

  reviews: demoReviews,

  activities: demoActivities,
};

export function getDirectGainUserById(
  userId: string,
): DirectGainUser | undefined {
  return directGainStore.users.find(
    (user) => user.id === userId,
  );
}

export function getDirectGainPostsByUserId(
  userId: string,
): DirectGainPost[] {
  return directGainStore.posts.filter(
    (post) => post.authorId === userId,
  );
}

export function getDirectGainListingsByUserId(
  userId: string,
): DirectGainListing[] {
  return directGainStore.listings.filter(
    (listing) =>
      listing.sellerId === userId,
  );
}

export function getDirectGainJobsByUserId(
  userId: string,
): DirectGainJob[] {
  return directGainStore.jobs.filter(
    (job) => job.posterId === userId,
  );
}

export function getDirectGainAuctionsByUserId(
  userId: string,
): DirectGainAuction[] {
  return directGainStore.auctions.filter(
    (auction) =>
      auction.sellerId === userId,
  );
}

export function getDirectGainReviewsForUserId(
  userId: string,
): DirectGainReview[] {
  return directGainStore.reviews.filter(
    (review) =>
      review.recipientId === userId,
  );
}

export function getDirectGainActivityByUserId(
  userId: string,
): DirectGainActivity[] {
  return directGainStore.activities
    .filter(
      (activity) =>
        activity.userId === userId,
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