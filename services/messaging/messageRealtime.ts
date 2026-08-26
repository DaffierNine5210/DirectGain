import type {
  RealtimeChannel,
} from '@supabase/supabase-js';

import { supabase } from '../../lib/supabase';

import type {
  SupabaseMessageRecord,
} from './messageRepository';

type SubscribeToConversationMessagesInput = {
  conversationId: string;

  onMessage: (
    message: SupabaseMessageRecord,
  ) => void;

  onError?: (
    error: Error,
  ) => void;
};

export function subscribeToConversationMessages({
  conversationId,
  onMessage,
  onError,
}: SubscribeToConversationMessagesInput): RealtimeChannel {
  const channel =
    supabase.channel(
      `conversation-messages:${conversationId}`,
    );

  channel
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter:
          `conversation_id=eq.${conversationId}`,
      },
      payload => {
        const message =
          payload.new as SupabaseMessageRecord;

        onMessage(
          message,
        );
      },
    )
    .subscribe(status => {
      if (
        status ===
        'CHANNEL_ERROR'
      ) {
        onError?.(
          new Error(
            'Unable to subscribe to conversation messages.',
          ),
        );
      }

      if (
        status ===
        'TIMED_OUT'
      ) {
        onError?.(
          new Error(
            'Realtime message subscription timed out.',
          ),
        );
      }
    });

  return channel;
}

export async function unsubscribeFromConversationMessages(
  channel:
    RealtimeChannel | null,
): Promise<void> {
  if (!channel) {
    return;
  }

  await supabase.removeChannel(
    channel,
  );
}