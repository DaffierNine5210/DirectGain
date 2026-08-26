import { supabase } from '../../lib/supabase';
import { getCurrentMessagingUser } from './currentMessagingUser';

export type ConversationParticipantRole =
  | 'buyer'
  | 'seller';

export type ConversationRecord = {
  id: string;
  listing_id: string | null;
  created_at: string;
  updated_at: string;
};

type ConversationParticipantRecord = {
  conversation_id: string;
  user_id: string;
  role: ConversationParticipantRole;
};

export async function getCurrentUserConversationRole(
  conversationId: string,
): Promise<ConversationParticipantRole | null> {
  const currentUser =
    await getCurrentMessagingUser();

  if (!currentUser) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from('conversation_participants')
    .select('role')
    .eq(
      'conversation_id',
      conversationId,
    )
    .eq(
      'user_id',
      currentUser.userId,
    )
    .maybeSingle();

  if (error) {
    console.warn(
      '[Direct Gain] Unable to determine conversation role:',
      error.message,
    );

    return null;
  }

  if (!data) {
    return null;
  }

  return data.role as ConversationParticipantRole;
}

export async function getConversationById(
  conversationId: string,
): Promise<ConversationRecord | null> {
  const {
    data,
    error,
  } = await supabase
    .from('conversations')
    .select('*')
    .eq(
      'id',
      conversationId,
    )
    .maybeSingle();

  if (error) {
    console.warn(
      '[Direct Gain] Unable to load conversation:',
      error.message,
    );

    return null;
  }

  return data as ConversationRecord | null;
}

export async function getConversationParticipants(
  conversationId: string,
): Promise<ConversationParticipantRecord[]> {
  const {
    data,
    error,
  } = await supabase
    .from('conversation_participants')
    .select(
      'conversation_id, user_id, role',
    )
    .eq(
      'conversation_id',
      conversationId,
    );

  if (error) {
    console.warn(
      '[Direct Gain] Unable to load conversation participants:',
      error.message,
    );

    return [];
  }

  return (
    data as ConversationParticipantRecord[]
  ) ?? [];
}