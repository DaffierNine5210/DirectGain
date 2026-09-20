import { supabase } from '../../lib/supabase';

import { getAuthenticatedUserId } from '../profile/profileRepository';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export type OpenGeneralConversationResult = {
  conversationId: string | null;
  error: string | null;
};

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.toLowerCase());
}

function formatGeneralConversationError(
  error: {
    message?: string;
    code?: string;
  } | null,
  fallback: string,
): string {
  if (!error?.message) {
    return fallback;
  }

  const message = error.message.toLowerCase();
  const code = error.code ?? '';

  if (
    code === '42501' ||
    message.includes('row-level security') ||
    message.includes('permission denied')
  ) {
    return 'You do not have permission to start that conversation.';
  }

  if (
    message.includes('signed in') ||
    message.includes('not authenticated')
  ) {
    return 'Sign in to continue.';
  }

  if (message.includes('yourself')) {
    return 'You cannot message yourself.';
  }

  if (
    message.includes('profile could not be found') ||
    message.includes('could not be found')
  ) {
    return 'This profile could not be found.';
  }

  return fallback;
}

export async function openGeneralConversation(
  targetProfileId: string,
): Promise<OpenGeneralConversationResult> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      conversationId: null,
      error: 'Sign in to continue.',
    };
  }

  const targetId = targetProfileId.trim().toLowerCase();

  if (!isUuid(targetId)) {
    return {
      conversationId: null,
      error: 'This profile could not be found.',
    };
  }

  if (userId === targetId) {
    return {
      conversationId: null,
      error: 'You cannot message yourself.',
    };
  }

  const rpcResult = await supabase.rpc(
    'get_or_create_general_conversation',
    {
      p_target_profile_id: targetId,
    },
  );

  if (rpcResult.error) {
    return {
      conversationId: null,
      error: formatGeneralConversationError(
        rpcResult.error,
        'A conversation could not be opened. Try again.',
      ),
    };
  }

  if (
    typeof rpcResult.data !== 'string' ||
    !isUuid(rpcResult.data)
  ) {
    return {
      conversationId: null,
      error: 'A conversation could not be opened. Try again.',
    };
  }

  return {
    conversationId: rpcResult.data.toLowerCase(),
    error: null,
  };
}
