type DatabaseMessageIdentity = {
  message_type: string;
  sender_id: string | null;
};

export function isDatabaseSystemMessage(
  message: DatabaseMessageIdentity,
): boolean {
  return message.message_type === 'system';
}

export function isInvalidUserMessage(
  message: DatabaseMessageIdentity,
): boolean {
  return (
    message.message_type !== 'system' &&
    !message.sender_id
  );
}

/*
 * Incoming unread: another participant's
 * user message, or a system event.
 * Own user messages and corrupt
 * non-system rows with no sender are not
 * unread.
 */
export function isUnreadEligibleIncomingMessage(
  message: DatabaseMessageIdentity,
  currentUserId: string,
): boolean {
  if (isDatabaseSystemMessage(message)) {
    return true;
  }

  if (!message.sender_id) {
    return false;
  }

  return message.sender_id !== currentUserId;
}

export function isOwnUserMessage(
  message: DatabaseMessageIdentity,
  currentUserId: string,
): boolean {
  if (isDatabaseSystemMessage(message)) {
    return false;
  }

  return (
    Boolean(message.sender_id) &&
    message.sender_id === currentUserId
  );
}

export function unreadIncomingOrFilter(
  currentUserId: string,
): string {
  return (
    `message_type.eq.system,` +
    `and(sender_id.neq.${currentUserId},sender_id.not.is.null)`
  );
}
