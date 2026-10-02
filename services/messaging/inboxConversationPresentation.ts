import type {
  ImageSourcePropType,
} from 'react-native';

import { listings } from '../../data/listings';

import type {
  ConversationType,
} from '../../components/messaging/ConversationCard';

import { formatJobStatus } from '../jobs/jobAdapter';
import { listJobsByIds } from '../jobs/jobRepository';
import { getProfilesByIds } from '../profile/profileRepository';

import { getInboxMessagePreview } from './messageAdapter';
import {
  getInboxActivityPreview,
  laterTimestamp,
} from './conversationActivityPreview';

import type { ConversationActivityRecord } from '../../types/ConversationActivity';

import type { InboxLatestMessage } from './messageRepository';

const FALLBACK_MEMBER_NAME =
  'Direct Gain member';

export type InboxJobContext = {
  jobId: string;
  title: string;
  payLabel?: string;
  statusLabel?: string;
};

export type InboxConversationRow = {
  id: string;
  contextType: ConversationType;
  contextId?: string;
  title: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  otherParticipantId: string | null;
  otherParticipantName: string;
  otherParticipantAvatarPath: string | null;
  otherParticipantRole?: string;
  jobContext?: InboxJobContext;
  itemPrice?: number;
  itemImage?: ImageSourcePropType;
};

type ConversationRow = {
  id: string;
  context_type: string;
  context_id: string | null;
  title: string | null;
  created_at: string;
  last_activity_at?: string | null;
};

type ParticipantRow = {
  conversation_id: string;
  user_id: string;
  role: string;
};

export function mapConversationType(
  value: string,
): ConversationType {
  switch (value) {
    case 'market':
      return 'market';
    case 'job':
      return 'job';
    case 'auction':
      return 'auction';
    case 'support':
      return 'support';
    case 'general':
      return 'general';
    default:
      return 'market';
  }
}

export async function presentInboxConversations({
  currentUserId,
  conversations,
  participants,
  latestMessages,
  latestActivity,
  unreadCounts,
}: {
  currentUserId: string;
  conversations: ConversationRow[];
  participants: ParticipantRow[];
  latestMessages: Record<string, InboxLatestMessage | undefined>;
  latestActivity: Record<string, ConversationActivityRecord | undefined>;
  unreadCounts: Record<string, number>;
}): Promise<InboxConversationRow[]> {
  const otherParticipantIds = conversations.flatMap(
    conversation => {
      const other = findOtherParticipant(
        participants,
        conversation.id,
        currentUserId,
      );

      return other?.user_id ? [other.user_id] : [];
    },
  );

  const jobIds = conversations.flatMap(conversation => {
    if (conversation.context_type !== 'job') {
      return [];
    }

    const contextId = conversation.context_id?.trim();
    return contextId ? [contextId] : [];
  });

  const [
    profilesResult,
    jobsResult,
  ] = await Promise.all([
    getProfilesByIds(otherParticipantIds),
    listJobsByIds(jobIds),
  ]);

  if (profilesResult.error) {
    console.warn(
      '[Direct Gain] Inbox profile lookup failed:',
      profilesResult.error,
    );
  }

  if (jobsResult.error) {
    console.warn(
      '[Direct Gain] Inbox job context lookup failed:',
      jobsResult.error,
    );
  }

  const profilesById = new Map(
    profilesResult.profiles.map(profile => [
      profile.id,
      profile,
    ]),
  );

  const jobsById = new Map(
    jobsResult.jobs.map(job => [job.id, job]),
  );

  return conversations.map(databaseConversation => {
    const otherParticipant = findOtherParticipant(
      participants,
      databaseConversation.id,
      currentUserId,
    );

    const profile = otherParticipant
      ? profilesById.get(otherParticipant.user_id)
      : undefined;

    const linkedListing =
      databaseConversation.context_type === 'market'
        ? listings.find(
            listing =>
              listing.id === databaseConversation.context_id,
          )
        : undefined;

    const job =
      databaseConversation.context_type === 'job' &&
      databaseConversation.context_id
        ? jobsById.get(
            databaseConversation.context_id.trim().toLowerCase(),
          )
        : undefined;

    const jobContext = buildJobContext(
      databaseConversation,
      job
        ? {
            id: job.id,
            title: job.title,
            payLabel: job.payLabel,
            status: job.status,
          }
        : null,
    );

    const isGeneralConversation =
      databaseConversation.context_type === 'general';

    const title = isGeneralConversation
      ? ''
      : jobContext?.title ??
        linkedListing?.title ??
        databaseConversation.title?.trim() ??
        'Direct Gain conversation';

    const latestMessage =
      latestMessages[databaseConversation.id];
    const latestVisibleActivity =
      latestActivity[databaseConversation.id];
    const activityIsLatest = isActivityPreviewLatest(
      latestMessage?.created_at,
      latestVisibleActivity?.createdAt,
    );
    const lastMessage = activityIsLatest && latestVisibleActivity
      ? getInboxActivityPreview(
          latestVisibleActivity,
          currentUserId,
        )
      : getInboxMessagePreview(latestMessage);
    const lastMessageAt =
      databaseConversation.last_activity_at ??
      laterTimestamp(
        latestMessage?.created_at,
        latestVisibleActivity?.createdAt,
      ) ??
      databaseConversation.created_at;

    const sellerFromListing =
      otherParticipant?.role === 'seller' && linkedListing
        ? linkedListing.seller
        : undefined;

    return {
      id: databaseConversation.id,
      contextType: mapConversationType(
        databaseConversation.context_type,
      ),
      contextId: databaseConversation.context_id ?? undefined,
      title,
      lastMessage,
      lastMessageAt,
      unreadCount:
        unreadCounts[databaseConversation.id] ?? 0,
      otherParticipantId: otherParticipant?.user_id ?? null,
      otherParticipantName:
        profile?.displayName?.trim() ||
        sellerFromListing?.name ||
        FALLBACK_MEMBER_NAME,
      otherParticipantAvatarPath: profile?.avatarPath ?? null,
      otherParticipantRole: otherParticipant?.role,
      jobContext,
      itemPrice: linkedListing?.price,
      itemImage: linkedListing?.images?.[0],
    };
  });
}

function isActivityPreviewLatest(
  messageCreatedAt: string | undefined,
  activityCreatedAt: string | undefined,
): boolean {
  if (!activityCreatedAt) {
    return false;
  }

  if (!messageCreatedAt) {
    return true;
  }

  const activityTime = Date.parse(activityCreatedAt);
  const messageTime = Date.parse(messageCreatedAt);

  if (!Number.isFinite(activityTime)) {
    return false;
  }

  if (!Number.isFinite(messageTime)) {
    return true;
  }

  return activityTime >= messageTime;
}

function findOtherParticipant(
  participants: ParticipantRow[],
  conversationId: string,
  currentUserId: string,
): ParticipantRow | undefined {
  return participants.find(
    participant =>
      participant.conversation_id === conversationId &&
      participant.user_id !== currentUserId,
  );
}

function buildJobContext(
  conversation: ConversationRow,
  job: {
    id: string;
    title: string;
    payLabel: string;
    status: Parameters<typeof formatJobStatus>[0];
  } | null,
): InboxJobContext | undefined {
  if (conversation.context_type !== 'job') {
    return undefined;
  }

  const jobId =
    job?.id ??
    conversation.context_id?.trim() ??
    '';

  if (!jobId) {
    return {
      jobId: '',
      title:
        conversation.title?.trim() ||
        'Job conversation',
    };
  }

  return {
    jobId,
    title:
      job?.title.trim() ||
      conversation.title?.trim() ||
      'Job conversation',
    payLabel: job?.payLabel,
    statusLabel: job
      ? formatJobStatus(job.status)
      : undefined,
  };
}
