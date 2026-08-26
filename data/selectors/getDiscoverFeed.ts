import type {
  DiscoverFeedItem,
} from '../../types/DiscoverFeed';

import type {
  DirectGainJob,
} from '../../types/DirectGainJob';

import type {
  DirectGainPostType,
} from '../../types/DirectGainPost';

import {
  directGainStore,
  getDirectGainUserById,
} from '../directGainStore';

export function getDiscoverFeed(
  tab: 'for-you' | 'following' | 'nearby',
): DiscoverFeedItem[] {
  const postItems =
    directGainStore.posts.map(
      (
        post,
      ): DiscoverFeedItem | null => {
        const author =
          getDirectGainUserById(
            post.authorId,
          );

        if (!author) {
          return null;
        }

        return {
          id: `post-${post.id}`,

          type: 'post',

          author: {
            id: author.id,

            name: author.name,

            username:
              author.username,

            profileImage:
              author.profileImage,

            verified:
              author.verification.length >
              0,

            gainScore:
              author.gainScore,
          },

          createdAt:
            post.createdAt,

          title:
            post.type === 'text'
              ? undefined
              : getPostTitle(
                  post.type,
                ),

          body: post.text,

          media: post.image
            ? [
                {
                  id: `${post.id}-image`,

                  image:
                    post.image,

                  accessibilityLabel:
                    `${author.name}'s post image`,
                },
              ]
            : undefined,

          badge:
            getPostBadge(
              post.type,
            ),

          stats: {
            likes:
              post.likeCount,

            comments:
              post.commentCount,

            shares:
              post.shareCount,
          },
        };
      },
    );

  const listingItems =
    directGainStore.listings.map(
      (
        listing,
      ): DiscoverFeedItem | null => {
        const author =
          getDirectGainUserById(
            listing.sellerId,
          );

        if (!author) {
          return null;
        }

        return {
          id:
            `listing-${listing.id}`,

          type: 'listing',

          author: {
            id: author.id,

            name: author.name,

            username:
              author.username,

            profileImage:
              author.profileImage,

            verified:
              author.verification.length >
              0,

            gainScore:
              author.gainScore,
          },

          createdAt:
            listing.createdAt,

          title:
            listing.title,

          body:
            listing.description,

          price:
            formatCurrency(
              listing.price,
            ),

          location:
            `${listing.suburb}, ${listing.state}`,

          badge: 'MARKET',

          stats: {
            likes:
              listing.saveCount,

            comments: 0,

            shares: 0,
          },
        };
      },
    );

  const jobItems =
    directGainStore.jobs.map(
      (
        job,
      ): DiscoverFeedItem | null => {
        const author =
          getDirectGainUserById(
            job.posterId,
          );

        if (!author) {
          return null;
        }

        return {
          id: `job-${job.id}`,

          type: 'job',

          author: {
            id: author.id,

            name: author.name,

            username:
              author.username,

            profileImage:
              author.profileImage,

            verified:
              author.verification.length >
              0,

            gainScore:
              author.gainScore,
          },

          createdAt:
            job.createdAt,

          title:
            job.title,

          body:
            job.description,

          price:
            formatJobPay(
              job,
            ),

          location:
            `${job.suburb}, ${job.state}`,

          badge:
            'LOCAL JOB',

          stats: {
            likes:
              job.saveCount,

            comments:
              job.applicantCount,

            shares: 0,
          },
        };
      },
    );

  const auctionItems =
    directGainStore.auctions.map(
      (
        auction,
      ): DiscoverFeedItem | null => {
        const author =
          getDirectGainUserById(
            auction.sellerId,
          );

        if (!author) {
          return null;
        }

        return {
          id:
            `auction-${auction.id}`,

          type: 'auction',

          author: {
            id: author.id,

            name: author.name,

            username:
              author.username,

            profileImage:
              author.profileImage,

            verified:
              author.verification.length >
              0,

            gainScore:
              author.gainScore,
          },

          createdAt:
            auction.createdAt,

          title:
            auction.title,

          body:
            auction.description,

          price:
            formatCurrency(
              auction.currentBid,
            ),

          location:
            `${auction.suburb}, ${auction.state}`,

          badge:
            auction.status === 'live'
              ? 'LIVE AUCTION'
              : 'AUCTION',

          stats: {
            likes:
              auction.watcherCount,

            comments:
              auction.bidCount,

            shares: 0,
          },
        };
      },
    );

  const allItems = [
    ...postItems,
    ...listingItems,
    ...jobItems,
    ...auctionItems,
  ]
    .filter(
      (
        item,
      ): item is DiscoverFeedItem =>
        item !== null,
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

  if (tab === 'following') {
    return allItems.filter(
      (item) => {
        const author =
          getDirectGainUserById(
            item.author.id,
          );

        return (
          author?.isFollowing === true
        );
      },
    );
  }

  if (tab === 'nearby') {
    return allItems.filter(
      (item) =>
        item.location?.includes(
          'Mackay',
        ) ?? false,
    );
  }

  return allItems;
}

function getPostTitle(
  type: DirectGainPostType,
): string | undefined {
  switch (type) {
    case 'photo':
      return 'Shared a photo';

    case 'listing':
      return 'Shared a listing';

    case 'job':
      return 'Shared a job';

    case 'auction':
      return 'Shared an auction';

    case 'achievement':
      return 'Shared an achievement';

    case 'text':
    default:
      return undefined;
  }
}

function getPostBadge(
  type: DirectGainPostType,
): string {
  switch (type) {
    case 'photo':
      return 'PHOTO';

    case 'listing':
      return 'MARKET';

    case 'job':
      return 'JOB';

    case 'auction':
      return 'AUCTION';

    case 'achievement':
      return 'MILESTONE';

    case 'text':
    default:
      return 'POST';
  }
}

function formatCurrency(
  value: number,
) {
  return `$${value.toLocaleString(
    'en-AU',
  )}`;
}

function formatJobPay(
  job: DirectGainJob,
) {
  if (
    typeof job.payAmount ===
    'number'
  ) {
    return formatCurrency(
      job.payAmount,
    );
  }

  if (
    typeof job.payMin ===
      'number' &&
    typeof job.payMax ===
      'number'
  ) {
    return `${formatCurrency(
      job.payMin,
    )}–${formatCurrency(
      job.payMax,
    )}`;
  }

  return 'Negotiable';
}