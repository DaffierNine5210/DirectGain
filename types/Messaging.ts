import type {
  ImageSourcePropType,
} from 'react-native';

import type {
  ConversationSummary,
  ConversationType,
} from '../components/messaging/ConversationCard';

export type MessageDeliveryStatus =
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read';

export type MessageSender =
  | 'current-user'
  | 'participant'
  | 'system';

export type MessageKind =
  | 'text'
  | 'image'
  | 'offer'
  | 'location'
  | 'system';

export type ConversationParticipant = {
  id: string;

  name: string;

  username?: string;

  profileImage?:
    ImageSourcePropType;

  gainScore?: number;

  rating?: number;

  reviewCount?: number;

  responseTime?: string;

  isOnline?: boolean;

  isVerified?: boolean;
};

export type ConversationContext = {
  type: ConversationType;

  title: string;

  itemId?: string;

  itemImage?:
    ImageSourcePropType;

  itemPrice?: number;

  location?: string;
};

export type ChatMessage = {
  id: string;

  conversationId: string;

  sender: MessageSender;

  kind: MessageKind;

  text?: string;

  image?:
    ImageSourcePropType;

  createdAt: string;

  status?:
    MessageDeliveryStatus;

  isEdited?: boolean;
};

export type Conversation = {
  id: string;

  participant:
    ConversationParticipant;

  context:
    ConversationContext;

  messages:
    ChatMessage[];

  unreadCount: number;

  isMuted?: boolean;

  isArchived?: boolean;

  isPinned?: boolean;
};

export function createConversationSummary(
  conversation: Conversation,
): ConversationSummary {
  const lastMessage =
    conversation.messages[
      conversation.messages.length - 1
    ];

  return {
    id:
      conversation.id,

    participantName:
      conversation.participant.name,

    participantImage:
      conversation.participant.profileImage,

    title:
      conversation.context.title,

    lastMessage:
      lastMessage?.text ??
      'No messages yet',

    lastMessageAt:
      lastMessage?.createdAt ??
      '',

    gainScore:
      conversation.participant.gainScore,

    unreadCount:
      conversation.unreadCount,

    isOnline:
      conversation.participant.isOnline,

    isVerified:
      conversation.participant.isVerified,

    type:
      conversation.context.type,

    itemImage:
      conversation.context.itemImage,

    itemPrice:
      conversation.context.itemPrice,
  };
}