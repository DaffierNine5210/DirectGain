import type {
  ConversationTimelineItem,
} from '../../types/ConversationTimeline';

import type {
  DealAgreement,
} from '../../types/DealAgreement';

type ConversationSession = {
  timeline:
    ConversationTimelineItem[];

  dealAgreement:
    DealAgreement | null;
};

const sessions =
  new Map<
    string,
    ConversationSession
  >();

export function getConversationSession(
  conversationId: string,
):
  | ConversationSession
  | undefined {
  return sessions.get(
    conversationId,
  );
}

export function createConversationSession(
  conversationId: string,
  initialTimeline:
    ConversationTimelineItem[],
): ConversationSession {
  const existing =
    sessions.get(
      conversationId,
    );

  if (existing) {
    return existing;
  }

  const session:
    ConversationSession = {
    timeline:
      initialTimeline,

    dealAgreement: null,
  };

  sessions.set(
    conversationId,
    session,
  );

  return session;
}

export function saveConversationTimeline(
  conversationId: string,
  timeline:
    ConversationTimelineItem[],
) {
  const current =
    sessions.get(
      conversationId,
    );

  if (!current) {
    sessions.set(
      conversationId,
      {
        timeline,
        dealAgreement:
          null,
      },
    );

    return;
  }

  sessions.set(
    conversationId,
    {
      ...current,
      timeline,
    },
  );
}

export function saveConversationDealAgreement(
  conversationId: string,
  dealAgreement:
    DealAgreement | null,
) {
  const current =
    sessions.get(
      conversationId,
    );

  if (!current) {
    sessions.set(
      conversationId,
      {
        timeline: [],
        dealAgreement,
      },
    );

    return;
  }

  sessions.set(
    conversationId,
    {
      ...current,
      dealAgreement,
    },
  );
}

export function clearConversationSession(
  conversationId: string,
) {
  sessions.delete(
    conversationId,
  );
}