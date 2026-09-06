import {
  useCallback,
  useState,
} from 'react';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  getCurrentMessagingUser,
} from '../services/messaging/currentMessagingUser';

import {
  getTotalUnreadMessageCount,
} from '../services/messaging/messageReadRepository';

import {
  subscribeToIncomingMessages,
  subscribeToOwnMessageReads,
  unsubscribeFromIncomingMessages,
} from '../services/messaging/messageRealtime';

/*
 * Header badge total for Discover
 * and Market.
 *
 * Loads from message_reads while
 * the screen is focused and
 * refreshes when a new message
 * arrives or the current user's
 * read state changes.
 */
export default function useFocusedUnreadTotal(): number {
  const [
    unreadTotal,
    setUnreadTotal,
  ] =
    useState(
      0,
    );

  useFocusEffect(
    useCallback(
      () => {
        let active =
          true;

        async function loadTotal() {
          const total =
            await getTotalUnreadMessageCount();

          if (
            active
          ) {
            setUnreadTotal(
              total,
            );
          }
        }

        void loadTotal();

        const incomingChannel =
          subscribeToIncomingMessages({
            onMessage:
              () => {
                void loadTotal();
              },

            onError:
              error => {
                console.warn(
                  '[Direct Gain] Unread badge subscription error:',
                  error.message,
                );
              },
          });

        let readChannel:
          ReturnType<
            typeof subscribeToOwnMessageReads
          > | null =
          null;

        void (async () => {
          const user =
            await getCurrentMessagingUser();

          if (
            !active ||
            !user
          ) {
            return;
          }

          readChannel =
            subscribeToOwnMessageReads({
              userId:
                user.userId,

              onChange:
                () => {
                  void loadTotal();
                },

              onError:
                error => {
                  console.warn(
                    '[Direct Gain] Unread badge read-state subscription error:',
                    error.message,
                  );
                },
            });
        })();

        return () => {
          active =
            false;

          void unsubscribeFromIncomingMessages(
            incomingChannel,
          );

          void unsubscribeFromIncomingMessages(
            readChannel,
          );
        };
      },

      [],
    ),
  );

  return unreadTotal;
}
