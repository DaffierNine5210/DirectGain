import type {
  ChatMessage,
} from './Messaging';

export type ConversationTimelineMessage = {
  id: string;

  type: 'message';

  createdAt: string;

  message: ChatMessage;
};

export type ConversationTimelineItem =
  ConversationTimelineMessage;

export function createMessageTimelineItem(
  message: ChatMessage,
): ConversationTimelineMessage {
  return {
    id: `timeline-message-${message.id}`,

    type: 'message',

    createdAt:
      message.createdAt,

    message,
  };
}
