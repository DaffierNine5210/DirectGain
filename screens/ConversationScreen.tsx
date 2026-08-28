import { Ionicons } from '@expo/vector-icons';
import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ChatInput from '../components/messaging/ChatInput';
import ConversationHeader from '../components/messaging/ConversationHeader';
import MessageBubble from '../components/messaging/MessageBubble';

import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import CompletedDealAgreementCard from '../components/messaging/deals/CompletedDealAgreementCard';
import DealAgreementCard from '../components/messaging/deals/DealAgreementCard';

import DealAgreementForm, {
  type DealAgreementFormValues,
} from '../components/messaging/deals/DealAgreementForm';

import DealAgreementReview from '../components/messaging/deals/DealAgreementReview';

import OfferCard from '../components/messaging/offers/OfferCard';

import OfferComposer, {
  type OfferComposerValues,
} from '../components/messaging/offers/OfferComposer';

import {
  conversations,
} from '../data/conversations';

import {
  getListingById,
  listings,
} from '../data/listings';

import useTabBarVisibility from '../hooks/useTabBarVisibility';

import {
  supabase,
} from '../lib/supabase';

import {
  getCurrentUserConversationRole,
} from '../services/messaging/conversationRepository';

import {
  getCurrentMessagingUser,
} from '../services/messaging/currentMessagingUser';

import {
  supabaseMessageToChatMessage,
  supabaseMessagesToChatMessages,
} from '../services/messaging/messageAdapter';

import {
  getConversationMessages,
  sendConversationMessage,
} from '../services/messaging/messageRepository';

import {
  DOCUMENT_PICKER_MIME_TYPES,
  MAX_CONVERSATION_DOCUMENT_BYTES,
  MAX_CONVERSATION_IMAGE_BYTES,
  createConversationAttachmentSignedUrl,
  estimateBase64ByteSize,
  isAllowedImageMimeType,
  isSafeLocalAttachmentUri,
  isSafeOriginalFileName,
  resolveDocumentMimeType,
  sanitizeDisplayFileName,
  uploadConversationDocument,
  uploadConversationImage,
} from '../services/messaging/conversationAttachmentStorage';

import {
  getOtherParticipantReadState,
  markConversationRead,
  type MessageReadState,
} from '../services/messaging/messageReadRepository';

import {
  subscribeToConversationMessages,
  unsubscribeFromConversationMessages,
} from '../services/messaging/messageRealtime';

import {
  createConversationSession,
  getConversationSession,
  saveConversationDealAgreement,
  saveConversationTimeline,
} from '../stores/messaging/conversationSessionStore';

import {
  colors,
} from '../theme/colors';

import type {
  ConversationTimelineItem,
} from '../types/ConversationTimeline';

import {
  createMessageTimelineItem,
  createOfferTimelineItem,
} from '../types/ConversationTimeline';

import type {
  DealAgreement,
} from '../types/DealAgreement';

import type {
  MarketOffer,
} from '../types/MarketOffer';

import type {
  ChatMessage,
  Conversation,
} from '../types/Messaging';

type ConversationEntryIntent =
  | 'message'
  | 'offer';

type ConversationRole =
  | 'buyer'
  | 'seller';

type Props = {
  route?: {
    params?: {
      conversationId?: string;
      listingId?: string;
      intent?: ConversationEntryIntent;
    };
  };

  navigation?: {
    goBack: () => void;
  };
};

export default function ConversationScreen({
  route,
  navigation,
}: Props) {
  const {
  hideTabBar,
  showTabBar,
} =
  useTabBarVisibility();
 

  const scrollViewRef =
    useRef<ScrollView | null>(
      null,
    );

  const entryIntent =
    route?.params?.intent ??
    'message';

  const conversationId =
    route?.params?.conversationId ??
    conversations[0].id;

  const isSupabaseConversation =
    isUuid(
      conversationId,
    );

  const initialConversation =
    useMemo(
      () =>
        conversations.find(
          item =>
            item.id ===
            conversationId,
        ) ??
        conversations[0],

      [
        conversationId,
      ],
    );

  const initialSession =
    useMemo(
      () => {
        const existing =
          getConversationSession(
            conversationId,
          );

        if (
          existing
        ) {
          return existing;
        }

        return createConversationSession(
          conversationId,

          initialConversation
            .messages
            .map(
              createMessageTimelineItem,
            ),
        );
      },

      [
        conversationId,
        initialConversation,
      ],
    );

  const [
    conversation,
    setConversation,
  ] =
    useState<Conversation>(
      initialConversation,
    );

  const [
    timeline,
    setTimeline,
  ] =
    useState<
      ConversationTimelineItem[]
    >(
      initialSession.timeline,
    );

  const [
    dealAgreement,
    setDealAgreement,
  ] =
    useState<
      DealAgreement | null
    >(
      initialSession
        .dealAgreement,
    );

  const [
    currentRole,
    setCurrentRole,
  ] =
    useState<ConversationRole>(
      'buyer',
    );

  const [
    currentSupabaseUserId,
    setCurrentSupabaseUserId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    otherParticipantUserId,
    setOtherParticipantUserId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    showDealForm,
    setShowDealForm,
  ] =
    useState(
      false,
    );

  const [
    showDealReview,
    setShowDealReview,
  ] =
    useState(
      false,
    );

  const [
    showCompletedDeal,
    setShowCompletedDeal,
  ] =
    useState(
      false,
    );

  const [
    showOfferComposer,
    setShowOfferComposer,
  ] =
    useState(
      false,
    );

  const [
    counteringOffer,
    setCounteringOffer,
  ] =
    useState<
      MarketOffer | null
    >(
      null,
    );

  const isMarketConversation =
    conversation
      .context
      .type ===
    'market';

  const linkedListing =
    useMemo(
      () => {
        const requestedListingId =
          route?.params
            ?.listingId ??
          conversation
            .context
            .itemId;

        if (
          requestedListingId
        ) {
          const exactListing =
            getListingById(
              requestedListingId,
            );

          if (
            exactListing
          ) {
            return exactListing;
          }
        }

        return listings.find(
          listing =>
            listing.seller.id ===
            conversation
              .participant
              .id,
        );
      },

      [
        conversation
          .context
          .itemId,

        conversation
          .participant
          .id,

        route?.params
          ?.listingId,
      ],
    );

  const listingImage =
    linkedListing
      ?.images?.[0];

  /*
   * Check the other participant's
   * last_read_at position.
   *
   * Every outgoing message at or
   * before that point becomes Read.
   *
   * Everything newer remains
   * Delivered.
   */
  const applyReadReceipts =
    useCallback(
      async (
        currentUserId:
          string,

        otherUserId:
          string,
      ) => {
        const readState =
          await getOtherParticipantReadState(
            conversationId,
            otherUserId,
          );

        const readMessageIds =
          new Set<string>();

        if (
          readState
        ) {
          const {
            data,
            error,
          } =
            await supabase
              .from(
                'messages',
              )
              .select(
                'id',
              )
              .eq(
                'conversation_id',
                conversationId,
              )
              .eq(
                'sender_id',
                currentUserId,
              )
              .lte(
                'created_at',
                readState.last_read_at,
              );

          if (
            error
          ) {
            console.warn(
              '[Direct Gain] Unable to apply read receipts:',
              error.message,
            );
          } else {
            for (
              const row of
              data ?? []
            ) {
              readMessageIds.add(
                row.id as string,
              );
            }
          }
        }

        function updateStatus(
          message:
            ChatMessage,
        ): ChatMessage {
          if (
            message.sender !==
            'current-user'
          ) {
            return message;
          }

          if (
            message.status ===
            'sending'
          ) {
            return message;
          }

          return {
            ...message,

            status:
              readMessageIds.has(
                message.id,
              )
                ? 'read'
                : 'delivered',
          };
        }

        setConversation(
          current => ({
            ...current,

            messages:
              current.messages.map(
                updateStatus,
              ),
          }),
        );

        setTimeline(
          current =>
            current.map(
              item => {
                if (
                  item.type !==
                  'message'
                ) {
                  return item;
                }

                return {
                  ...item,

                  message:
                    updateStatus(
                      item.message,
                    ),
                };
              },
            ),
        );
      },

      [
        conversationId,
      ],
    );

 /*
 * Hide the bottom tab bar while the
 * conversation is open.
 *
 * Also mark the conversation as read
 * whenever the user focuses it.
 */
useFocusEffect(
  useCallback(
    () => {
      hideTabBar();

      if (
        isSupabaseConversation &&
        currentSupabaseUserId
      ) {
        void markConversationRead(
          conversationId,
        );

        if (
          otherParticipantUserId
        ) {
          void applyReadReceipts(
            currentSupabaseUserId,
            otherParticipantUserId,
          );
        }
      }

      return () => {
        showTabBar();
      };
    },
    [
      applyReadReceipts,
      conversationId,
      currentSupabaseUserId,
      hideTabBar,
      isSupabaseConversation,
      otherParticipantUserId,
      showTabBar,
    ],
  ),
);
  

  /*
   * Load the authenticated user,
   * their buyer/seller role and the
   * other participant's Supabase ID.
   */
  useEffect(
    () => {
      if (
        !isSupabaseConversation
      ) {
        setCurrentRole(
          'buyer',
        );

        return;
      }

      let active =
        true;

      async function loadIdentity() {
        const user =
          await getCurrentMessagingUser();

        if (
          !active ||
          !user
        ) {
          return;
        }

        setCurrentSupabaseUserId(
          user.userId,
        );

        const {
          data:
            participantRows,
          error:
            participantError,
        } =
          await supabase
            .from(
              'conversation_participants',
            )
            .select(
              'user_id',
            )
            .eq(
              'conversation_id',
              conversationId,
            )
            .neq(
              'user_id',
              user.userId,
            )
            .limit(
              1,
            );

        if (
          participantError
        ) {
          console.warn(
            '[Direct Gain] Unable to identify other conversation participant:',
            participantError.message,
          );
        }

        const otherUserId =
          participantRows?.[0]
            ?.user_id as
            | string
            | undefined;

        if (
          active
        ) {
          setOtherParticipantUserId(
            otherUserId ??
              null,
          );
        }

        const role =
          await getCurrentUserConversationRole(
            conversationId,
          );

        if (
          active &&
          role
        ) {
          setCurrentRole(
            role,
          );
        }
      }

      void loadIdentity();

      return () => {
        active =
          false;
      };
    },

    [
      conversationId,
      isSupabaseConversation,
    ],
  );

  /*
   * Load all stored messages for a
   * real Supabase conversation.
   *
   * Existing outgoing messages start
   * as Delivered. Read status is then
   * applied from message_reads.
   */
  useEffect(
    () => {
      if (
        !isSupabaseConversation
      ) {
        return;
      }

      let active =
        true;

      async function loadMessages() {
        const user =
          await getCurrentMessagingUser();

        if (
          !active ||
          !user
        ) {
          return;
        }

        const databaseMessages =
          await getConversationMessages(
            conversationId,
          );

        if (
          !active
        ) {
          return;
        }

        const chatMessages =
          supabaseMessagesToChatMessages(
            databaseMessages,

            {
              currentUserId:
                user.userId,
            },
          ).map(
            message => {
              if (
                message.sender !==
                'current-user'
              ) {
                return message;
              }

              return {
                ...message,

                status:
                  'delivered' as const,
              };
            },
          );

        setConversation(
          current => ({
            ...current,

            id:
              conversationId,

            messages:
              chatMessages,
          }),
        );

        setTimeline(
          chatMessages.map(
            createMessageTimelineItem,
          ),
        );

        requestAnimationFrame(
          () => {
            scrollViewRef
              .current
              ?.scrollToEnd({
                animated:
                  false,
              });
          },
        );
      }

      void loadMessages();

      return () => {
        active =
          false;
      };
    },

    [
      conversationId,
      isSupabaseConversation,
    ],
  );

  /*
   * Once both users are known:
   *
   * 1. Mark this conversation read.
   * 2. Check which of our outgoing
   *    messages they have already read.
   */
  useEffect(
    () => {
      if (
        !isSupabaseConversation ||
        !currentSupabaseUserId ||
        !otherParticipantUserId
      ) {
        return;
      }

      async function initialiseReadState() {
        await markConversationRead(
          conversationId,
        );

        await applyReadReceipts(
  currentSupabaseUserId!,
  otherParticipantUserId!,
);
      }

      void initialiseReadState();
    },

    [
      applyReadReceipts,
      conversationId,
      currentSupabaseUserId,
      isSupabaseConversation,
      otherParticipantUserId,
    ],
  );

  /*
   * REALTIME READ RECEIPTS
   *
   * When the other participant updates
   * their message_reads row, our screen
   * immediately recalculates:
   *
   * Delivered -> Read
   */
  useEffect(
    () => {
      if (
        !isSupabaseConversation ||
        !currentSupabaseUserId ||
        !otherParticipantUserId
      ) {
        return;
      }

      const channel =
        supabase
          .channel(
            `conversation-read-receipts:${conversationId}:${currentSupabaseUserId}`,
          )
          .on(
            'postgres_changes',

            {
              event:
                '*',

              schema:
                'public',

              table:
                'message_reads',

              filter:
                `conversation_id=eq.${conversationId}`,
            },

            payload => {
              const readState =
                payload.new as
                  MessageReadState;

              if (
                !readState ||
                readState.user_id !==
                  otherParticipantUserId
              ) {
                return;
              }

              void applyReadReceipts(
                currentSupabaseUserId,
                otherParticipantUserId,
              );
            },
          )
          .subscribe(
            status => {
              if (
                status ===
                'CHANNEL_ERROR'
              ) {
                console.warn(
                  '[Direct Gain] Unable to subscribe to read receipts.',
                );
              }

              if (
                status ===
                'TIMED_OUT'
              ) {
                console.warn(
                  '[Direct Gain] Read receipt subscription timed out.',
                );
              }
            },
          );

      return () => {
        void supabase.removeChannel(
          channel,
        );
      };
    },

    [
      applyReadReceipts,
      conversationId,
      currentSupabaseUserId,
      isSupabaseConversation,
      otherParticipantUserId,
    ],
  );

  /*
   * REALTIME MESSAGES
   */
  useEffect(
    () => {
      if (
        !isSupabaseConversation ||
        !currentSupabaseUserId
      ) {
        return;
      }

      const channel =
        subscribeToConversationMessages({
          conversationId,

          onMessage:
            realtimeMessage => {
              const adaptedMessage =
                supabaseMessageToChatMessage(
                  realtimeMessage,

                  {
                    currentUserId:
                      currentSupabaseUserId,
                  },
                );

              const newMessage:
                ChatMessage =
                adaptedMessage.sender ===
                'current-user'
                  ? {
                      ...adaptedMessage,

                      status:
                        'delivered',
                    }
                  : adaptedMessage;

              const rawClientMessageId =
                realtimeMessage
                  .metadata
                  ?.client_message_id;

              const clientMessageId =
                typeof rawClientMessageId ===
                'string'
                  ? rawClientMessageId
                  : null;

              /*
               * Update the normal
               * Conversation messages.
               */
              setConversation(
                current => {
                  if (
                    realtimeMessage
                      .sender_id ===
                      currentSupabaseUserId &&
                    clientMessageId
                  ) {
                    const optimisticExists =
                      current.messages.some(
                        message =>
                          message.id ===
                          clientMessageId,
                      );

                    if (
                      optimisticExists
                    ) {
                      return {
                        ...current,

                        messages:
                          current.messages.map(
                            message =>
                              message.id ===
                              clientMessageId
                                ? newMessage
                                : message,
                          ),
                      };
                    }
                  }

                  const alreadyExists =
                    current.messages.some(
                      message =>
                        message.id ===
                        newMessage.id,
                    );

                  if (
                    alreadyExists
                  ) {
                    return current;
                  }

                  return {
                    ...current,

                    messages: [
                      ...current.messages,
                      newMessage,
                    ],
                  };
                },
              );

              /*
               * Update the timeline.
               */
              setTimeline(
                current => {
                  if (
                    realtimeMessage
                      .sender_id ===
                      currentSupabaseUserId &&
                    clientMessageId
                  ) {
                    const optimisticExists =
                      current.some(
                        item =>
                          item.type ===
                            'message' &&
                          item.message.id ===
                            clientMessageId,
                      );

                    if (
                      optimisticExists
                    ) {
                      return current.map(
                        item => {
                          if (
                            item.type ===
                              'message' &&
                            item.message.id ===
                              clientMessageId
                          ) {
                            return createMessageTimelineItem(
                              newMessage,
                            );
                          }

                          return item;
                        },
                      );
                    }
                  }

                  const alreadyExists =
                    current.some(
                      item =>
                        item.type ===
                          'message' &&
                        item.message.id ===
                          newMessage.id,
                    );

                  if (
                    alreadyExists
                  ) {
                    return current;
                  }

                  return [
                    ...current,

                    createMessageTimelineItem(
                      newMessage,
                    ),
                  ];
                },
              );

              /*
               * If the incoming message
               * belongs to the other user,
               * the open conversation has
               * now displayed it.
               *
               * Move our read position
               * forward immediately.
               */
              if (
                realtimeMessage.sender_id !==
                currentSupabaseUserId
              ) {
                void markConversationRead(
                  conversationId,
                );
              }

              scrollToBottom();
            },

          onError:
            error => {
              console.warn(
                '[Direct Gain] Realtime messaging error:',
                error.message,
              );
            },
        });

      return () => {
        void unsubscribeFromConversationMessages(
          channel,
        );
      };
    },

    [
      conversationId,
      currentSupabaseUserId,
      isSupabaseConversation,
    ],
  );

  /*
   * Mock/local conversation persistence.
   */
  useEffect(
    () => {
      if (
        isSupabaseConversation
      ) {
        return;
      }

      saveConversationTimeline(
        conversationId,
        timeline,
      );
    },

    [
      conversationId,
      isSupabaseConversation,
      timeline,
    ],
  );

  useEffect(
    () => {
      saveConversationDealAgreement(
        conversationId,
        dealAgreement,
      );
    },

    [
      conversationId,
      dealAgreement,
    ],
  );

  /*
   * Opening from Make Offer
   * launches the offer composer.
   */
  useEffect(
    () => {
      if (
        entryIntent ===
          'offer' &&
        isMarketConversation
      ) {
        setShowOfferComposer(
          true,
        );
      }
    },

    [
      entryIntent,
      isMarketConversation,
    ],
  );

  function scrollToBottom() {
    requestAnimationFrame(
      () => {
        scrollViewRef
          .current
          ?.scrollToEnd({
            animated:
              true,
          });
      },
    );
  }

  /*
   * OPTIMISTIC MESSAGE SENDING
   *
   * Sending...
   *
   * then Supabase confirms:
   *
   * Delivered
   *
   * then other participant reads:
   *
   * Read
   */
  async function handleSend(
    text: string,
  ) {
    const cleanText =
      text.trim();

    if (
      cleanText.length ===
      0
    ) {
      return;
    }

    if (
      isSupabaseConversation
    ) {
      const userId =
        currentSupabaseUserId;

      if (
        !userId
      ) {
        Alert.alert(
          'Unable to send',
          'Your account session is still loading. Please try again.',
        );

        return;
      }

      const clientMessageId =
        `client-message-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

      const optimisticMessage:
        ChatMessage = {
        id:
          clientMessageId,

        conversationId,

        sender:
          'current-user',

        kind:
          'text',

        text:
          cleanText,

        createdAt:
          'Now',

        status:
          'sending',
      };

      /*
       * Show the bubble immediately.
       */
      setConversation(
        current => ({
          ...current,

          messages: [
            ...current.messages,
            optimisticMessage,
          ],
        }),
      );

      setTimeline(
        current => [
          ...current,

          createMessageTimelineItem(
            optimisticMessage,
          ),
        ],
      );

      scrollToBottom();

      /*
       * Save the actual database row.
       */
      const storedMessage =
        await sendConversationMessage({
          conversationId,

          body:
            cleanText,

          messageType:
            'text',

          metadata: {
            client_message_id:
              clientMessageId,
          },
        });

      if (
        !storedMessage
      ) {
        setConversation(
          current => ({
            ...current,

            messages:
              current.messages.filter(
                message =>
                  message.id !==
                  clientMessageId,
              ),
          }),
        );

        setTimeline(
          current =>
            current.filter(
              item =>
                !(
                  item.type ===
                    'message' &&
                  item.message.id ===
                    clientMessageId
                ),
            ),
        );

        Alert.alert(
          'Message not sent',
          'Your message could not be sent. Please try again.',
        );

        return;
      }

      /*
       * Supabase has now accepted the
       * message, so it is Delivered.
       */
      const confirmedMessage:
        ChatMessage = {
        ...supabaseMessageToChatMessage(
          storedMessage,

          {
            currentUserId:
              userId,
          },
        ),

        status:
          'delivered',
      };

      setConversation(
        current => {
          const realAlreadyExists =
            current.messages.some(
              message =>
                message.id ===
                confirmedMessage.id,
            );

          if (
            realAlreadyExists
          ) {
            return {
              ...current,

              messages:
                current.messages.filter(
                  message =>
                    message.id !==
                    clientMessageId,
                ),
            };
          }

          return {
            ...current,

            messages:
              current.messages.map(
                message =>
                  message.id ===
                  clientMessageId
                    ? confirmedMessage
                    : message,
              ),
          };
        },
      );

      setTimeline(
        current => {
          const realAlreadyExists =
            current.some(
              item =>
                item.type ===
                  'message' &&
                item.message.id ===
                  confirmedMessage.id,
            );

          if (
            realAlreadyExists
          ) {
            return current.filter(
              item =>
                !(
                  item.type ===
                    'message' &&
                  item.message.id ===
                    clientMessageId
                ),
            );
          }

          return current.map(
            item => {
              if (
                item.type ===
                  'message' &&
                item.message.id ===
                  clientMessageId
              ) {
                return createMessageTimelineItem(
                  confirmedMessage,
                );
              }

              return item;
            },
          );
        },
      );

      /*
       * In case the other user already
       * has the conversation open and
       * read this extremely quickly,
       * check their read state again.
       */
      if (
        otherParticipantUserId
      ) {
        void applyReadReceipts(
          userId,
          otherParticipantUserId,
        );
      }

      return;
    }

    /*
     * Existing mock/local messages.
     */
    const newMessage:
      ChatMessage = {
      id:
        `message-${Date.now()}`,

      conversationId:
        conversation.id,

      sender:
        'current-user',

      kind:
        'text',

      text:
        cleanText,

      createdAt:
        'Now',

      status:
        'sent',
    };

    setConversation(
      current => ({
        ...current,

        messages: [
          ...current.messages,
          newMessage,
        ],
      }),
    );

    setTimeline(
      current => [
        ...current,

        createMessageTimelineItem(
          newMessage,
        ),
      ],
    );

    scrollToBottom();
  }

  function handleBackPress() {
    navigation?.goBack();
  }

  function handleProfilePress() {
    Alert.alert(
      conversation
        .participant
        .name,

      'The participant profile will be connected later.',
    );
  }

  function handleCallPress() {
    Alert.alert(
      'Call',

      'Voice and video calling will be added later.',
    );
  }

  function handleMorePress() {
    Alert.alert(
      'Conversation options',

      'Mute, archive, block and report controls will be added later.',
    );
  }

  function handlePhotoPress() {
    void sendConversationPhoto();
  }

  async function sendConversationPhoto() {
    if (
      !isSupabaseConversation
    ) {
      Alert.alert(
        'Photo',
        'Photo sharing is available in live Direct Gain conversations.',
      );

      return;
    }

    const userId =
      currentSupabaseUserId;

    if (
      !userId
    ) {
      Alert.alert(
        'Unable to send',
        'Your account session is still loading. Please try again.',
      );

      return;
    }

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (
      !permission.granted
    ) {
      Alert.alert(
        'Photo access needed',
        'Direct Gain needs access to your photo library so you can send pictures in messages.',
      );

      return;
    }

    let pickerResult:
      ImagePicker.ImagePickerResult;

    try {
      pickerResult =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes:
            [
              'images',
            ],
          allowsMultipleSelection:
            false,
          quality:
            0.75,
          base64:
            true,
        });
    } catch (
      error
    ) {
      console.warn(
        '[Direct Gain] Unable to open the photo library:',
        error,
      );

      Alert.alert(
        'Unable to open photos',
        'Something went wrong while opening your photo library. Please try again.',
      );

      return;
    }

    if (
      pickerResult.canceled ||
      pickerResult.assets.length ===
        0
    ) {
      return;
    }

    const asset =
      pickerResult.assets[0];

    const mimeType =
      (
        asset.mimeType ??
        ''
      ).toLowerCase();

    if (
      !isAllowedImageMimeType(
        mimeType,
      )
    ) {
      Alert.alert(
        'Unsupported photo',
        'Direct Gain currently supports JPEG, PNG, WebP and HEIC photos.',
      );

      return;
    }

    if (
      !asset.base64
    ) {
      Alert.alert(
        'Unable to send photo',
        'Direct Gain could not read that photo. Please choose a different image.',
      );

      return;
    }

    const byteSize =
      asset.fileSize &&
      asset.fileSize >
        0
        ? asset.fileSize
        : estimateBase64ByteSize(
            asset.base64,
          );

    if (
      byteSize >
      MAX_CONVERSATION_IMAGE_BYTES
    ) {
      Alert.alert(
        'Photo too large',
        'Please choose a photo smaller than 5 MB.',
      );

      return;
    }

    const clientMessageId =
      `client-message-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

    const optimisticMessage:
      ChatMessage = {
      id:
        clientMessageId,

      conversationId,

      sender:
        'current-user',

      kind:
        'image',

      image: {
        uri:
          asset.uri,
      },

      createdAt:
        'Now',

      status:
        'sending',
    };

    setConversation(
      current => ({
        ...current,

        messages: [
          ...current.messages,
          optimisticMessage,
        ],
      }),
    );

    setTimeline(
      current => [
        ...current,

        createMessageTimelineItem(
          optimisticMessage,
        ),
      ],
    );

    scrollToBottom();

    const uploaded =
      await uploadConversationImage({
        conversationId,
        userId,
        base64:
          asset.base64,
        mimeType,
        byteSize,
      });

    if (
      !uploaded
    ) {
      removeOptimisticMessage(
        clientMessageId,
      );

      Alert.alert(
        'Photo not sent',
        'Direct Gain could not upload that photo. Please try again.',
      );

      return;
    }

    const storedMessage =
      await sendConversationMessage({
        conversationId,

        body:
          '',

        messageType:
          'image',

        attachmentUrl:
          uploaded.objectPath,

        metadata: {
          client_message_id:
            clientMessageId,

          mimeType:
            uploaded.mimeType,

          byteSize:
            uploaded.byteSize,

          width:
            asset.width,

          height:
            asset.height,
        },
      });

    if (
      !storedMessage
    ) {
      removeOptimisticMessage(
        clientMessageId,
      );

      Alert.alert(
        'Photo not sent',
        'The photo uploaded, but Direct Gain could not save the message. Please try again.',
      );

      return;
    }

    const confirmedMessage:
      ChatMessage = {
      ...supabaseMessageToChatMessage(
        storedMessage,
        {
          currentUserId:
            userId,
        },
      ),

      status:
        'delivered',

      image: {
        uri:
          asset.uri,
      },
    };

    setConversation(
      current => {
        const realAlreadyExists =
          current.messages.some(
            message =>
              message.id ===
              confirmedMessage.id,
          );

        if (
          realAlreadyExists
        ) {
          return {
            ...current,

            messages:
              current.messages.filter(
                message =>
                  message.id !==
                  clientMessageId,
              ),
          };
        }

        return {
          ...current,

          messages:
            current.messages.map(
              message =>
                message.id ===
                clientMessageId
                  ? confirmedMessage
                  : message,
            ),
        };
      },
    );

    setTimeline(
      current =>
        current.map(
          item => {
            if (
              item.type ===
                'message' &&
              item.message.id ===
                clientMessageId
            ) {
              return createMessageTimelineItem(
                confirmedMessage,
              );
            }

            return item;
          },
        ),
    );

    if (
      otherParticipantUserId
    ) {
      void applyReadReceipts(
        userId,
        otherParticipantUserId,
      );
    }
  }

  function removeOptimisticMessage(
    clientMessageId:
      string,
  ) {
    setConversation(
      current => ({
        ...current,

        messages:
          current.messages.filter(
            message =>
              message.id !==
              clientMessageId,
          ),
      }),
    );

    setTimeline(
      current =>
        current.filter(
          item =>
            !(
              item.type ===
                'message' &&
              item.message.id ===
                clientMessageId
            ),
        ),
    );
  }

  function handleAttachmentPress() {
    void sendConversationDocument();
  }

  async function sendConversationDocument() {
    if (
      !isSupabaseConversation
    ) {
      Alert.alert(
        'Attachment',
        'File sharing is available in live Direct Gain conversations.',
      );

      return;
    }

    const userId =
      currentSupabaseUserId;

    if (
      !userId
    ) {
      Alert.alert(
        'Unable to send',
        'Your account session is still loading. Please try again.',
      );

      return;
    }

    let pickerResult:
      DocumentPicker.DocumentPickerResult;

    try {
      pickerResult =
        await DocumentPicker.getDocumentAsync({
          type:
            DOCUMENT_PICKER_MIME_TYPES,
          copyToCacheDirectory:
            true,
          multiple:
            false,
        });
    } catch (
      error
    ) {
      console.warn(
        '[Direct Gain] Unable to open the document picker:',
        error,
      );

      Alert.alert(
        'Unable to open files',
        'Something went wrong while opening your files. Please try again.',
      );

      return;
    }

    if (
      pickerResult.canceled ||
      !pickerResult.assets ||
      pickerResult.assets.length ===
        0
    ) {
      return;
    }

    const asset =
      pickerResult.assets[0];

    const mimeType =
      resolveDocumentMimeType({
        mimeType:
          asset.mimeType,
        originalFileName:
          asset.name,
      });

    if (
      !mimeType
    ) {
      Alert.alert(
        'Unsupported file',
        'Direct Gain currently supports PDF, Word, Excel, CSV and plain text files.',
      );

      return;
    }

    if (
      !isSafeOriginalFileName(
        asset.name,
      ) ||
      !isSafeLocalAttachmentUri(
        asset.uri,
      )
    ) {
      Alert.alert(
        'Unable to send file',
        'That file could not be used. Please choose a different file.',
      );

      return;
    }

    const byteSize =
      asset.size &&
      asset.size >
        0
        ? asset.size
        : 0;

    if (
      byteSize >
      MAX_CONVERSATION_DOCUMENT_BYTES
    ) {
      Alert.alert(
        'File too large',
        'Please choose a file smaller than 10 MB.',
      );

      return;
    }

    const displayFileName =
      sanitizeDisplayFileName(
        asset.name,
      );

    const clientMessageId =
      `client-message-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

    const optimisticMessage:
      ChatMessage = {
      id:
        clientMessageId,

      conversationId,

      sender:
        'current-user',

      kind:
        'file',

      fileName:
        displayFileName,

      fileMimeType:
        mimeType,

      fileByteSize:
        byteSize ||
        undefined,

      createdAt:
        'Now',

      status:
        'sending',
    };

    setConversation(
      current => ({
        ...current,

        messages: [
          ...current.messages,
          optimisticMessage,
        ],
      }),
    );

    setTimeline(
      current => [
        ...current,

        createMessageTimelineItem(
          optimisticMessage,
        ),
      ],
    );

    scrollToBottom();

    const uploaded =
      await uploadConversationDocument({
        conversationId,
        userId,
        localUri:
          asset.uri,
        mimeType,
        originalFileName:
          asset.name,
        byteSize:
          byteSize ||
          undefined,
      });

    if (
      !uploaded
    ) {
      removeOptimisticMessage(
        clientMessageId,
      );

      Alert.alert(
        'File not sent',
        'Direct Gain could not upload that file. Please try again.',
      );

      return;
    }

    const storedMessage =
      await sendConversationMessage({
        conversationId,

        body:
          '',

        messageType:
          'file',

        attachmentUrl:
          uploaded.objectPath,

        metadata: {
          client_message_id:
            clientMessageId,

          fileName:
            uploaded.fileName,

          mimeType:
            uploaded.mimeType,

          byteSize:
            uploaded.byteSize,

          extension:
            uploaded.extension,
        },
      });

    if (
      !storedMessage
    ) {
      removeOptimisticMessage(
        clientMessageId,
      );

      Alert.alert(
        'File not sent',
        'The file uploaded, but Direct Gain could not save the message. Please try again.',
      );

      return;
    }

    const confirmedMessage:
      ChatMessage = {
      ...supabaseMessageToChatMessage(
        storedMessage,
        {
          currentUserId:
            userId,
        },
      ),

      status:
        'delivered',
    };

    setConversation(
      current => {
        const realAlreadyExists =
          current.messages.some(
            message =>
              message.id ===
              confirmedMessage.id,
          );

        if (
          realAlreadyExists
        ) {
          return {
            ...current,

            messages:
              current.messages.filter(
                message =>
                  message.id !==
                  clientMessageId,
              ),
          };
        }

        return {
          ...current,

          messages:
            current.messages.map(
              message =>
                message.id ===
                clientMessageId
                  ? confirmedMessage
                  : message,
            ),
        };
      },
    );

    setTimeline(
      current =>
        current.map(
          item => {
            if (
              item.type ===
                'message' &&
              item.message.id ===
                clientMessageId
            ) {
              return createMessageTimelineItem(
                confirmedMessage,
              );
            }

            return item;
          },
        ),
    );

    if (
      otherParticipantUserId
    ) {
      void applyReadReceipts(
        userId,
        otherParticipantUserId,
      );
    }
  }

  function handleLocationPress() {
    Alert.alert(
      'Location',

      'Secure location sharing will be connected later.',
    );
  }

  function handleMessagePress(
    message:
      ChatMessage,
  ) {
    if (
      message.kind ===
      'file'
    ) {
      void openConversationFile(
        message,
      );

      return;
    }

    Alert.alert(
      'Message options',

      message.text ??
        'Additional message actions will be added later.',
    );
  }

  async function openConversationFile(
    message:
      ChatMessage,
  ) {
    if (
      message.status ===
        'sending' ||
      !message.attachmentPath
    ) {
      return;
    }

    const signedUrl =
      await createConversationAttachmentSignedUrl(
        message.attachmentPath,
      );

    if (
      !signedUrl
    ) {
      Alert.alert(
        'Unable to open file',
        'Direct Gain could not prepare that file. Please try again.',
      );

      return;
    }

    try {
      const canOpen =
        await Linking.canOpenURL(
          signedUrl,
        );

      if (
        canOpen
      ) {
        await Linking.openURL(
          signedUrl,
        );

        return;
      }

      await Linking.openURL(
        signedUrl,
      );
    } catch (
      error
    ) {
      console.warn(
        '[Direct Gain] Unable to open conversation file:',
        error,
      );

      Alert.alert(
        'Unable to open file',
        'Something went wrong while opening that file.',
      );
    }
  }

  function handleOfferSubmit(
    values:
      OfferComposerValues,
  ) {
    const now =
      new Date()
        .toISOString();

    const listingId =
      linkedListing?.id ??
      route?.params
        ?.listingId ??
      conversation
        .context
        .itemId ??
      conversation
        .context
        .title;

    const newOffer:
      MarketOffer = {
      id:
        `offer-${Date.now()}`,

      conversationId:
        conversation.id,

      listingId,

      buyerId:
        currentRole ===
        'buyer'
          ? (
              currentSupabaseUserId ??
              'current-user'
            )
          : conversation
              .participant
              .id,

      sellerId:
        currentRole ===
        'seller'
          ? (
              currentSupabaseUserId ??
              conversation
                .participant
                .id
            )
          : conversation
              .participant
              .id,

      amount:
        values.amount,

      currency:
        'AUD',

      status:
        'pending',

      createdBy:
        counteringOffer
          ? currentRole
          : 'buyer',

      message:
        values.message,

      parentOfferId:
        counteringOffer?.id,

      createdAt:
        now,

      updatedAt:
        now,
    };

    if (
      counteringOffer
    ) {
      updateOfferStatus(
        counteringOffer.id,
        'countered',
      );
    }

    setTimeline(
      current => [
        ...current,

        createOfferTimelineItem(
          newOffer,
        ),
      ],
    );

    setCounteringOffer(
      null,
    );

    setShowOfferComposer(
      false,
    );

    scrollToBottom();
  }

  function updateOfferStatus(
    offerId:
      string,

    status:
      MarketOffer['status'],
  ) {
    const now =
      new Date()
        .toISOString();

    setTimeline(
      current =>
        current.map(
          item => {
            if (
              item.type !==
                'offer' ||
              item.offer.id !==
                offerId
            ) {
              return item;
            }

            return {
              ...item,

              offer: {
                ...item.offer,

                status,

                updatedAt:
                  now,

                respondedAt:
                  now,
              },
            };
          },
        ),
    );
  }

  function handleOfferAccept(
    offer:
      MarketOffer,
  ) {
    const now =
      new Date()
        .toISOString();

    updateOfferStatus(
      offer.id,
      'accepted',
    );

    const draftAgreement:
      DealAgreement = {
      id:
        `deal-${Date.now()}`,

      conversationId:
        conversation.id,

      listingId:
        offer.listingId,

      buyerId:
        offer.buyerId,

      sellerId:
        offer.sellerId,

      agreedPrice:
        offer.amount,

      currency:
        offer.currency,

      transactionMethod:
        'meetup',

      locationName:
        '',

      scheduledAt:
        '',

      status:
        'draft',

      buyerConfirmation: {
        userId:
          offer.buyerId,

        confirmed:
          false,
      },

      sellerConfirmation: {
        userId:
          offer.sellerId,

        confirmed:
          false,
      },

      createdAt:
        now,

      updatedAt:
        now,
    };

    setDealAgreement(
      draftAgreement,
    );

    setCounteringOffer(
      null,
    );

    scrollToBottom();
  }

  function handleOfferDecline(
    offerId:
      string,
  ) {
    updateOfferStatus(
      offerId,
      'declined',
    );
  }

  function handleOfferWithdraw(
    offerId:
      string,
  ) {
    updateOfferStatus(
      offerId,
      'withdrawn',
    );
  }

  function handleOfferCounter(
    offer:
      MarketOffer,
  ) {
    setCounteringOffer(
      offer,
    );

    setShowOfferComposer(
      true,
    );
  }

  function handleCompleteDealDetails() {
    if (
      currentRole !==
      'buyer'
    ) {
      return;
    }

    if (
      !dealAgreement
    ) {
      return;
    }

    setShowDealForm(
      true,
    );
  }

  function handleDealFormSubmit(
    values:
      DealAgreementFormValues,
  ) {
    const now =
      new Date()
        .toISOString();

    const agreement:
      DealAgreement = {
      id:
        dealAgreement?.id ??
        `deal-${Date.now()}`,

      conversationId:
        conversation.id,

      listingId:
        dealAgreement
          ?.listingId ??
        linkedListing?.id ??
        conversation
          .context
          .itemId ??
        conversation
          .context
          .title,

      buyerId:
        dealAgreement
          ?.buyerId ??
        currentSupabaseUserId ??
        'current-user',

      sellerId:
        dealAgreement
          ?.sellerId ??
        conversation
          .participant
          .id,

      agreedPrice:
        dealAgreement
          ?.agreedPrice ??
        values.agreedPrice,

      currency:
        'AUD',

      transactionMethod:
        values
          .transactionMethod,

      locationName:
        values
          .locationName,

      scheduledAt:
        values
          .scheduledAt,

      notes:
        values.notes,

      status:
        'pending',

      buyerConfirmation: {
        userId:
          dealAgreement
            ?.buyerId ??
          currentSupabaseUserId ??
          'current-user',

        confirmed:
          true,

        confirmedAt:
          now,
      },

      sellerConfirmation: {
        userId:
          dealAgreement
            ?.sellerId ??
          conversation
            .participant
            .id,

        confirmed:
          false,
      },

      createdAt:
        dealAgreement
          ?.createdAt ??
        now,

      updatedAt:
        now,
    };

    setDealAgreement(
      agreement,
    );

    setShowDealForm(
      false,
    );

    scrollToBottom();
  }

  function handleAgreementPress() {
    if (
      !dealAgreement
    ) {
      return;
    }

    if (
      dealAgreement.status ===
        'draft' &&
      currentRole ===
        'buyer'
    ) {
      setShowDealForm(
        true,
      );

      return;
    }

    if (
      dealAgreement.status ===
        'pending' &&
      currentRole ===
        'seller'
    ) {
      setShowDealReview(
        true,
      );
    }
  }

  function handleCompletedAgreementPress() {
    if (
      !dealAgreement
    ) {
      return;
    }

    setShowCompletedDeal(
      true,
    );
  }

  function handleRequestAgreementChanges() {
    if (
      !dealAgreement
    ) {
      return;
    }

    setShowDealReview(
      false,
    );

    const changeMessage:
      ChatMessage = {
      id:
        `message-${Date.now()}`,

      conversationId:
        conversation.id,

      sender:
        'participant',

      kind:
        'text',

      text:
        'I’d like to request changes to the deal agreement.',

      createdAt:
        'Now',

      status:
        'sent',
    };

    setTimeline(
      current => [
        ...current,

        createMessageTimelineItem(
          changeMessage,
        ),
      ],
    );

    scrollToBottom();
  }

  function confirmSellerAgreement() {
    if (
      !dealAgreement
    ) {
      return;
    }

    const now =
      new Date()
        .toISOString();

    setDealAgreement({
      ...dealAgreement,

      status:
        'confirmed',

      sellerConfirmation: {
        ...dealAgreement
          .sellerConfirmation,

        confirmed:
          true,

        confirmedAt:
          now,
      },

      updatedAt:
        now,
    });

    setShowDealReview(
      false,
    );

    scrollToBottom();
  }

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
    >
      <KeyboardAvoidingView
        style={
          styles.screen
        }
        behavior={
          Platform.OS ===
          'ios'
            ? 'padding'
            : undefined
        }
        keyboardVerticalOffset={
          0
        }
      >
        <ConversationHeader
          participant={
            conversation
              .participant
          }
          context={
            conversation
              .context
          }
          onBackPress={
            handleBackPress
          }
          onProfilePress={
            handleProfilePress
          }
          onCallPress={
            handleCallPress
          }
          onMorePress={
            handleMorePress
          }
        />

        {isMarketConversation ? (
          <View
            style={
              styles.contextCard
            }
          >
            {listingImage ? (
              <Image
                source={
                  listingImage
                }
                resizeMode="cover"
                style={
                  styles.listingImage
                }
              />
            ) : (
              <View
                style={
                  styles.listingImageFallback
                }
              >
                <Ionicons
                  name="image-outline"
                  size={
                    22
                  }
                  color={
                    colors.textMuted
                  }
                />
              </View>
            )}

            <View
              style={
                styles.contextContent
              }
            >
              <Text
                numberOfLines={
                  1
                }
                style={
                  styles.contextTitle
                }
              >
                {linkedListing
                  ?.title ??
                  conversation
                    .context
                    .title}
              </Text>

              <Text
                numberOfLines={
                  1
                }
                style={
                  styles.contextLocation
                }
              >
                {linkedListing
                  ? `${linkedListing.location.suburb}, ${linkedListing.location.state}`
                  : conversation
                      .context
                      .location}
              </Text>
            </View>

            <Text
              style={
                styles.contextPrice
              }
            >
              {formatCurrency(
                linkedListing
                  ?.price ??
                  conversation
                    .context
                    .itemPrice ??
                  0,
              )}
            </Text>
          </View>
        ) : null}

        <ScrollView
          ref={
            scrollViewRef
          }
          style={
            styles.messages
          }
          contentContainerStyle={
            styles.messagesContent
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={
              styles.safetyNotice
            }
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={
                16
              }
              color={
                colors.primary
              }
            />

            <Text
              style={
                styles.safetyText
              }
            >
              Keep messages, offers and payments inside Direct Gain for better account protection.
            </Text>
          </View>

          <View
            style={
              styles.dayDivider
            }
          >
            <View
              style={
                styles.dayLine
              }
            />

            <Text
              style={
                styles.dayText
              }
            >
              Today
            </Text>

            <View
              style={
                styles.dayLine
              }
            />
          </View>

          {timeline.map(
            item => {
              if (
                item.type ===
                'message'
              ) {
                return (
                  <MessageBubble
                    key={
                      item.id
                    }
                    message={
                      item.message
                    }
                    onPress={
                      handleMessagePress
                    }
                  />
                );
              }

              return (
                <View
                  key={
                    item.id
                  }
                  style={
                    styles.offerTimelineItem
                  }
                >
                  <OfferCard
                    offer={
                      item.offer
                    }
                    currentUserRole={
                      currentRole
                    }
                    onAccept={() =>
                      handleOfferAccept(
                        item.offer,
                      )
                    }
                    onCounter={() =>
                      handleOfferCounter(
                        item.offer,
                      )
                    }
                    onDecline={() =>
                      handleOfferDecline(
                        item.offer.id,
                      )
                    }
                    onWithdraw={() =>
                      handleOfferWithdraw(
                        item.offer.id,
                      )
                    }
                  />

                  <Text
                    style={
                      styles.offerTime
                    }
                  >
                    {formatTimelineTime(
                      item.offer
                        .createdAt,
                    )}
                  </Text>
                </View>
              );
            },
          )}

          {dealAgreement
            ?.status ===
            'draft' ? (
            <View
              style={
                styles.dealProgressWrapper
              }
            >
              {currentRole ===
              'buyer' ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={
                    handleCompleteDealDetails
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.dealProgressCard,

                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <View
                    style={
                      styles.dealProgressIcon
                    }
                  >
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={
                        22
                      }
                      color={
                        colors.primary
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.dealProgressCopy
                    }
                  >
                    <Text
                      style={
                        styles.dealProgressEyebrow
                      }
                    >
                      OFFER ACCEPTED
                    </Text>

                    <Text
                      style={
                        styles.dealProgressTitle
                      }
                    >
                      Complete deal details
                    </Text>

                    <Text
                      style={
                        styles.dealProgressDescription
                      }
                    >
                      Add the transaction method, location and time for the seller to review.
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={
                      20
                    }
                    color={
                      colors.primary
                    }
                  />
                </Pressable>
              ) : (
                <View
                  style={
                    styles.dealProgressCard
                  }
                >
                  <View
                    style={
                      styles.dealProgressIcon
                    }
                  >
                    <Ionicons
                      name="time-outline"
                      size={
                        22
                      }
                      color={
                        colors.primary
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.dealProgressCopy
                    }
                  >
                    <Text
                      style={
                        styles.dealProgressEyebrow
                      }
                    >
                      OFFER ACCEPTED
                    </Text>

                    <Text
                      style={
                        styles.dealProgressTitle
                      }
                    >
                      Waiting for buyer
                    </Text>

                    <Text
                      style={
                        styles.dealProgressDescription
                      }
                    >
                      The buyer is adding the transaction details for you to review.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ) : null}

          {dealAgreement
            ?.status ===
            'pending' ? (
            <View
              style={
                styles.dealCardWrapper
              }
            >
              <DealAgreementCard
                agreement={
                  dealAgreement
                }
                onPress={
                  handleAgreementPress
                }
              />
            </View>
          ) : null}

          {dealAgreement
            ?.status ===
            'confirmed' ? (
            <View
              style={
                styles.completedDealWrapper
              }
            >
              <CompletedDealAgreementCard
                agreement={
                  dealAgreement
                }
                onPress={
                  handleCompletedAgreementPress
                }
              />

              <Text
                style={
                  styles.completedDealTime
                }
              >
                {formatTimelineTime(
                  dealAgreement
                    .updatedAt,
                )}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View
          style={
            styles.composerDock
          }
        >
          <ChatInput
            onSend={
              handleSend
            }
            onPhotoPress={
              handlePhotoPress
            }
            onAttachmentPress={
              handleAttachmentPress
            }
            onLocationPress={
              handleLocationPress
            }
          />
        </View>

        <Modal
          visible={
            showOfferComposer
          }
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => {
            setShowOfferComposer(
              false,
            );

            setCounteringOffer(
              null,
            );
          }}
        >
          <SafeAreaView
            style={
              styles.modalSafeArea
            }
          >
            <ScrollView
              contentContainerStyle={
                styles.modalContent
              }
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
            >
              <OfferComposer
                listingPrice={
                  counteringOffer
                    ? counteringOffer
                        .amount
                    : linkedListing
                        ?.price ??
                      conversation
                        .context
                        .itemPrice
                }
                onCancel={() => {
                  setShowOfferComposer(
                    false,
                  );

                  setCounteringOffer(
                    null,
                  );
                }}
                onSubmit={
                  handleOfferSubmit
                }
              />
            </ScrollView>
          </SafeAreaView>
        </Modal>

        <Modal
          visible={
            showDealForm
          }
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() =>
            setShowDealForm(
              false,
            )
          }
        >
          <SafeAreaView
            style={
              styles.modalSafeArea
            }
          >
            <ScrollView
              contentContainerStyle={
                styles.modalContent
              }
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
            >
              <DealAgreementForm
                initialPrice={
                  dealAgreement
                    ?.agreedPrice ??
                  linkedListing
                    ?.price ??
                  conversation
                    .context
                    .itemPrice
                }
                onCancel={() =>
                  setShowDealForm(
                    false,
                  )
                }
                onSubmit={
                  handleDealFormSubmit
                }
              />
            </ScrollView>
          </SafeAreaView>
        </Modal>

        <Modal
          visible={
            showDealReview
          }
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() =>
            setShowDealReview(
              false,
            )
          }
        >
          <SafeAreaView
            style={
              styles.modalSafeArea
            }
          >
            <ScrollView
              contentContainerStyle={
                styles.modalContent
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              {dealAgreement ? (
                <DealAgreementReview
                  agreement={
                    dealAgreement
                  }
                  onConfirm={
                    confirmSellerAgreement
                  }
                  onRequestChanges={
                    handleRequestAgreementChanges
                  }
                  onClose={() =>
                    setShowDealReview(
                      false,
                    )
                  }
                />
              ) : null}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        <Modal
          visible={
            showCompletedDeal
          }
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() =>
            setShowCompletedDeal(
              false,
            )
          }
        >
          <SafeAreaView
            style={
              styles.modalSafeArea
            }
          >
            <ScrollView
              contentContainerStyle={
                styles.modalContent
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              {dealAgreement ? (
                <DealAgreementReview
                  agreement={
                    dealAgreement
                  }
                  readOnly
                  onClose={() =>
                    setShowCompletedDeal(
                      false,
                    )
                  }
                />
              ) : null}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function isUuid(
  value:
    string,
): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function formatCurrency(
  value:
    number,
) {
  return new Intl.NumberFormat(
    'en-AU',

    {
      style:
        'currency',

      currency:
        'AUD',

      maximumFractionDigits:
        0,
    },
  ).format(
    value,
  );
}

function formatTimelineTime(
  value:
    string,
) {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Now';
  }

  return date.toLocaleTimeString(
    'en-AU',

    {
      hour:
        'numeric',

      minute:
        '2-digit',
    },
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex:
        1,

      backgroundColor:
        '#080B09',
    },

    screen: {
      flex:
        1,

      backgroundColor:
        '#080B09',
    },

    contextCard: {
      marginHorizontal:
        14,

      marginTop:
        12,

      padding:
        10,

      minHeight:
        78,

      borderRadius:
        18,

      borderWidth:
        1,

      borderColor:
        'rgba(158, 246, 90, 0.14)',

      backgroundColor:
        'rgba(158, 246, 90, 0.035)',

      flexDirection:
        'row',

      alignItems:
        'center',
    },

    listingImage: {
      width:
        62,

      height:
        62,

      borderRadius:
        13,

      backgroundColor:
        '#111512',
    },

    listingImageFallback: {
      width:
        62,

      height:
        62,

      borderRadius:
        13,

      backgroundColor:
        'rgba(255, 255, 255, 0.04)',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    contextContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        11,

      marginRight:
        10,
    },

    contextTitle: {
      color:
        colors.text,

      fontSize:
        13,

      lineHeight:
        17,

      fontWeight:
        '900',
    },

    contextLocation: {
      marginTop:
        4,

      color:
        colors.textMuted,

      fontSize:
        9,

      fontWeight:
        '700',
    },

    contextPrice: {
      color:
        colors.primary,

      fontSize:
        14,

      fontWeight:
        '900',
    },

    messages: {
      flex:
        1,
    },

    messagesContent: {
      paddingHorizontal:
        14,

      paddingTop:
        14,

      paddingBottom:
        18,
    },

    safetyNotice: {
      paddingHorizontal:
        12,

      paddingVertical:
        10,

      borderRadius:
        15,

      borderWidth:
        1,

      borderColor:
        'rgba(158, 246, 90, 0.10)',

      backgroundColor:
        'rgba(158, 246, 90, 0.035)',

      flexDirection:
        'row',

      alignItems:
        'flex-start',
    },

    safetyText: {
      flex:
        1,

      marginLeft:
        8,

      color:
        colors.textMuted,

      fontSize:
        9,

      lineHeight:
        14,

      fontWeight:
        '600',
    },

    dayDivider: {
      marginVertical:
        18,

      flexDirection:
        'row',

      alignItems:
        'center',
    },

    dayLine: {
      flex:
        1,

      height:
        1,

      backgroundColor:
        'rgba(255, 255, 255, 0.06)',
    },

    dayText: {
      marginHorizontal:
        11,

      color:
        colors.textMuted,

      fontSize:
        8,

      fontWeight:
        '800',
    },

    offerTimelineItem: {
      marginTop:
        16,

      marginBottom:
        4,
    },

    offerTime: {
      marginTop:
        6,

      marginRight:
        5,

      color:
        colors.textMuted,

      fontSize:
        8,

      fontWeight:
        '700',

      textAlign:
        'right',
    },

    dealProgressWrapper: {
      marginTop:
        16,
    },

    dealProgressCard: {
      padding:
        14,

      borderRadius:
        18,

      borderWidth:
        1,

      borderColor:
        'rgba(158, 246, 90, 0.17)',

      backgroundColor:
        'rgba(158, 246, 90, 0.045)',

      flexDirection:
        'row',

      alignItems:
        'center',
    },

    dealProgressIcon: {
      width:
        44,

      height:
        44,

      borderRadius:
        14,

      backgroundColor:
        'rgba(158, 246, 90, 0.09)',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    dealProgressCopy: {
      flex:
        1,

      marginLeft:
        12,

      marginRight:
        10,
    },

    dealProgressEyebrow: {
      color:
        colors.primary,

      fontSize:
        8,

      fontWeight:
        '900',

      letterSpacing:
        1.2,
    },

    dealProgressTitle: {
      marginTop:
        3,

      color:
        colors.text,

      fontSize:
        14,

      fontWeight:
        '900',
    },

    dealProgressDescription: {
      marginTop:
        4,

      color:
        colors.textMuted,

      fontSize:
        9,

      lineHeight:
        14,

      fontWeight:
        '600',
    },

    dealCardWrapper: {
      marginTop:
        16,
    },

    completedDealWrapper: {
      marginTop:
        16,

      marginBottom:
        4,
    },

    completedDealTime: {
      marginTop:
        6,

      marginRight:
        5,

      color:
        colors.textMuted,

      fontSize:
        8,

      fontWeight:
        '700',

      textAlign:
        'right',
    },

    composerDock: {
      paddingTop:
        7,

      borderTopWidth:
        1,

      borderTopColor:
        'rgba(255, 255, 255, 0.05)',

      backgroundColor:
        '#080B09',
    },

    modalSafeArea: {
      flex:
        1,

      backgroundColor:
        '#080B09',
    },

    modalContent: {
      padding:
        16,

      paddingBottom:
        40,
    },

    pressed: {
      opacity:
        0.76,

      transform: [
        {
          scale:
            0.985,
        },
      ],
    },
  });