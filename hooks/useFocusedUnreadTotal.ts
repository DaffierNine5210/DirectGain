import {
  useCallback,
  useState,
} from 'react';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  getTotalUnreadMessageCount,
} from '../services/messaging/messageReadRepository';

import {
  subscribeToIncomingMessages,
  unsubscribeFromIncomingMessages,
} from '../services/messaging/messageRealtime';

/*
 * Header badge total for Discover
 * and Market.
 *
 * Loads from message_reads while
 * the screen is focused and
 * refreshes when a new message
 * arrives. The subscription is
 * removed on blur.
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

        const channel =
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

        return () => {
          active =
            false;

          void unsubscribeFromIncomingMessages(
            channel,
          );
        };
      },

      [],
    ),
  );

  return unreadTotal;
}
