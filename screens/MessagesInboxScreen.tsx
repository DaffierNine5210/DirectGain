import { Ionicons } from '@expo/vector-icons';
import {
  useFocusEffect,
} from '@react-navigation/native';
import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import ConversationCard from '../components/messaging/ConversationCard';

import {
  listings,
} from '../data/listings';

import type {
  MessagesStackParamList,
} from '../navigation/MessagesStack';

import {
  supabase,
} from '../lib/supabase';

import {
  getCurrentMessagingUser,
} from '../services/messaging/currentMessagingUser';

import {
  getUnreadMessageCounts,
} from '../services/messaging/messageReadRepository';

import {
  subscribeToIncomingMessages,
  unsubscribeFromIncomingMessages,
} from '../services/messaging/messageRealtime';

import {
  colors,
} from '../theme/colors';

import type {
  ConversationSummary,
  ConversationType,
} from '../components/messaging/ConversationCard';

type Props =
  NativeStackScreenProps<
    MessagesStackParamList,
    'Inbox'
  >;

type InboxFilter =
  | 'all'
  | 'market'
  | 'job'
  | 'auction'
  | 'support';

type FilterOption = {
  id:
    InboxFilter;

  label:
    string;

  icon:
    | 'chatbubbles-outline'
    | 'storefront-outline'
    | 'briefcase-outline'
    | 'hammer-outline'
    | 'shield-checkmark-outline';
};

type ConversationRow = {
  id:
    string;

  context_type:
    string;

  context_id:
    string | null;

  title:
    string | null;

  created_at:
    string;
};

type ParticipantRow = {
  conversation_id:
    string;

  user_id:
    string;

  role:
    string;
};

type MessageRow = {
  id:
    string;

  conversation_id:
    string;

  sender_id:
    string;

  body:
    string | null;

  created_at:
    string;
};

type RealInboxConversation = {
  id:
    string;

  contextType:
    ConversationType;

  contextId?:
    string;

  title:
    string;

  participantId:
    string;

  participantName:
    string;

  participantGainScore?:
    number;

  participantVerified:
    boolean;

  lastMessage:
    string;

  lastMessageAt:
    string;

  unreadCount:
    number;

  itemPrice?:
    number;

  itemImage?:
    any;
};

const filterOptions:
  FilterOption[] = [
    {
      id:
        'all',

      label:
        'All',

      icon:
        'chatbubbles-outline',
    },

    {
      id:
        'market',

      label:
        'Market',

      icon:
        'storefront-outline',
    },

    {
      id:
        'job',

      label:
        'Jobs',

      icon:
        'briefcase-outline',
    },

    {
      id:
        'auction',

      label:
        'Auctions',

      icon:
        'hammer-outline',
    },

    {
      id:
        'support',

      label:
        'Support',

      icon:
        'shield-checkmark-outline',
    },
  ];

export default function MessagesInboxScreen({
  navigation,
}: Props) {
  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState('');

  const [
    activeFilter,
    setActiveFilter,
  ] =
    useState<InboxFilter>(
      'all',
    );

  const [
    conversations,
    setConversations,
  ] =
    useState<
      RealInboxConversation[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(
      false,
    );

  /*
   * Reload the inbox every time
   * the Messages screen becomes
   * active.
   *
   * This means a newly-created
   * Supabase conversation will
   * immediately become visible
   * when the seller opens Messages.
   */
  useFocusEffect(
    useCallback(
      () => {
        let active =
          true;

        async function load() {
          await loadInbox(
            active,
          );
        }

        void load();

        const channel =
          subscribeToIncomingMessages({
            onMessage:
              () => {
                void loadInbox(
                  active,
                );
              },

            onError:
              error => {
                console.warn(
                  '[Direct Gain] Inbox unread subscription error:',
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

  async function loadInbox(
    active = true,
  ) {
    try {
      const currentUser =
        await getCurrentMessagingUser();

      if (
        !currentUser
      ) {
        if (
          active
        ) {
          setConversations(
            [],
          );

          setLoading(
            false,
          );
        }

        return;
      }

      /*
       * STEP 1
       *
       * Find every conversation
       * the current authenticated
       * user participates in.
       */
      const {
        data:
          ownParticipantRows,
        error:
          ownParticipantError,
      } =
        await supabase
          .from(
            'conversation_participants',
          )
          .select(
            `
              conversation_id,
              user_id,
              role
            `,
          )
          .eq(
            'user_id',
            currentUser.userId,
          );

      if (
        ownParticipantError
      ) {
        console.warn(
          '[Direct Gain] Unable to load inbox participation:',
          ownParticipantError.message,
        );

        if (
          active
        ) {
          setConversations(
            [],
          );

          setLoading(
            false,
          );
        }

        return;
      }

      const ownParticipants =
        (
          ownParticipantRows as
            ParticipantRow[] |
            null
        ) ??
        [];

      const conversationIds =
        ownParticipants.map(
          row =>
            row.conversation_id,
        );

      if (
        conversationIds.length ===
        0
      ) {
        if (
          active
        ) {
          setConversations(
            [],
          );

          setLoading(
            false,
          );
        }

        return;
      }

      /*
       * STEP 2
       *
       * Load conversation metadata.
       */
      const {
        data:
          conversationRows,
        error:
          conversationError,
      } =
        await supabase
          .from(
            'conversations',
          )
          .select(
            `
              id,
              context_type,
              context_id,
              title,
              created_at
            `,
          )
          .in(
            'id',
            conversationIds,
          )
          .order(
            'created_at',
            {
              ascending:
                false,
            },
          );

      if (
        conversationError
      ) {
        console.warn(
          '[Direct Gain] Unable to load inbox conversations:',
          conversationError.message,
        );

        if (
          active
        ) {
          setLoading(
            false,
          );
        }

        return;
      }

      const databaseConversations =
        (
          conversationRows as
            ConversationRow[] |
            null
        ) ??
        [];

      /*
       * STEP 3
       *
       * Load all participants so
       * we can identify the other
       * person in each conversation.
       */
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
            `
              conversation_id,
              user_id,
              role
            `,
          )
          .in(
            'conversation_id',
            conversationIds,
          );

      if (
        participantError
      ) {
        console.warn(
          '[Direct Gain] Unable to load inbox participants:',
          participantError.message,
        );
      }

      const allParticipants =
        (
          participantRows as
            ParticipantRow[] |
            null
        ) ??
        [];

      /*
       * STEP 4
       *
       * Load messages so every
       * inbox card can show the
       * latest real Supabase
       * message.
       */
      const {
        data:
          messageRows,
        error:
          messageError,
      } =
        await supabase
          .from(
            'messages',
          )
          .select(
            `
              id,
              conversation_id,
              sender_id,
              body,
              created_at
            `,
          )
          .in(
            'conversation_id',
            conversationIds,
          )
          .is(
            'deleted_at',
            null,
          )
          .order(
            'created_at',
            {
              ascending:
                false,
            },
          );

      if (
        messageError
      ) {
        console.warn(
          '[Direct Gain] Unable to load inbox messages:',
          messageError.message,
        );
      }

      const allMessages =
        (
          messageRows as
            MessageRow[] |
            null
        ) ??
        [];

      const unreadCounts =
        await getUnreadMessageCounts(
          conversationIds,
        );

      /*
       * Convert Supabase database
       * rows into the data needed
       * by Direct Gain's existing
       * ConversationCard.
       */
      const mapped =
        databaseConversations.map(
          databaseConversation => {
            const otherParticipant =
              allParticipants.find(
                participant =>
                  participant
                    .conversation_id ===
                    databaseConversation.id &&
                  participant
                    .user_id !==
                    currentUser.userId,
              );

            const linkedListing =
              databaseConversation
                .context_type ===
                'market'
                ? listings.find(
                    listing =>
                      listing.id ===
                      databaseConversation
                        .context_id,
                  )
                : undefined;

            /*
             * For Market conversations,
             * our existing listing data
             * already knows the seller's
             * trusted profile information.
             */
            const participantIsSeller =
              otherParticipant?.role ===
              'seller';

            const participantName =
              participantIsSeller &&
              linkedListing
                ? linkedListing
                    .seller
                    .name
                : otherParticipant
                  ? 'Direct Gain Buyer'
                  : 'Direct Gain Member';

            const participantGainScore =
              participantIsSeller &&
              linkedListing
                ? linkedListing
                    .seller
                    .gainScore
                : undefined;

            const participantVerified =
              participantIsSeller &&
              linkedListing
                ? linkedListing
                    .seller
                    .verification
                    .includes(
                      'identity',
                    )
                : false;

            const latestMessage =
              allMessages.find(
                message =>
                  message
                    .conversation_id ===
                  databaseConversation.id,
              );

            return {
              id:
                databaseConversation.id,

              contextType:
                mapConversationType(
                  databaseConversation
                    .context_type,
                ),

              contextId:
                databaseConversation
                  .context_id ??
                undefined,

              title:
                linkedListing
                  ?.title ??
                databaseConversation
                  .title ??
                'Direct Gain conversation',

              participantId:
                otherParticipant
                  ?.user_id ??
                '',

              participantName,

              participantGainScore,

              participantVerified,

              lastMessage:
                latestMessage
                  ?.body ??
                'No messages yet',

              lastMessageAt:
                latestMessage
                  ?.created_at ??
                databaseConversation
                  .created_at,

              unreadCount:
                unreadCounts[
                  databaseConversation
                    .id
                ] ??
                0,

              itemPrice:
                linkedListing
                  ?.price,

              itemImage:
                linkedListing
                  ?.images?.[0],
            } satisfies RealInboxConversation;
          },
        );

      /*
       * Sort newest activity first.
       */
      mapped.sort(
        (
          first,
          second,
        ) => {
          const firstTime =
            new Date(
              first
                .lastMessageAt,
            ).getTime();

          const secondTime =
            new Date(
              second
                .lastMessageAt,
            ).getTime();

          return (
            secondTime -
            firstTime
          );
        },
      );

      if (
        active
      ) {
        setConversations(
          mapped,
        );

        setLoading(
          false,
        );
      }
    } catch (
      error
    ) {
      console.warn(
        '[Direct Gain] Unexpected inbox error:',
        error,
      );

      if (
        active
      ) {
        setLoading(
          false,
        );
      }
    }
  }

  const unreadTotal =
    useMemo(
      () =>
        conversations.reduce(
          (
            total,
            conversation,
          ) =>
            total +
            conversation
              .unreadCount,

          0,
        ),

      [
        conversations,
      ],
    );

  const visibleConversations =
    useMemo(
      () => {
        const normalizedSearch =
          searchQuery
            .trim()
            .toLowerCase();

        return conversations.filter(
          conversation => {
            const matchesFilter =
              activeFilter ===
                'all' ||
              conversation
                .contextType ===
                activeFilter;

            const searchableText = [
              conversation
                .participantName,

              conversation
                .title,

              conversation
                .lastMessage,
            ]
              .join(
                ' ',
              )
              .toLowerCase();

            const matchesSearch =
              normalizedSearch
                .length ===
                0 ||
              searchableText.includes(
                normalizedSearch,
              );

            return (
              matchesFilter &&
              matchesSearch
            );
          },
        );
      },

      [
        activeFilter,
        conversations,
        searchQuery,
      ],
    );

  function handleConversationPress(
    conversation:
      RealInboxConversation,
  ) {
    navigation.navigate(
      'Conversation',

      {
        conversationId:
          conversation.id,
      },
    );
  }

  async function handleRefreshPress() {
    if (
      refreshing
    ) {
      return;
    }

    setRefreshing(
      true,
    );

    await loadInbox(
      true,
    );

    setRefreshing(
      false,
    );
  }

  function handleComposePress() {
    Alert.alert(
      'New message',
      'Contact search and new conversation creation will be added later.',
    );
  }

  function handleMorePress() {
    Alert.alert(
      'Message options',
      'Archived conversations, requests and inbox settings will be added later.',
    );
  }

  function handleClearSearch() {
    setSearchQuery(
      '',
    );
  }

  function createSummary(
    conversation:
      RealInboxConversation,
  ): ConversationSummary {
    return {
      id:
        conversation.id,

      participantName:
        conversation
          .participantName,

      title:
        conversation.title,

      lastMessage:
        conversation
          .lastMessage,

      lastMessageAt:
        formatInboxTime(
          conversation
            .lastMessageAt,
        ),

      gainScore:
        conversation
          .participantGainScore,

      unreadCount:
        conversation
          .unreadCount,

      isOnline:
        false,

      isVerified:
        conversation
          .participantVerified,

      type:
        conversation
          .contextType,

      itemImage:
        conversation
          .itemImage,

      itemPrice:
        conversation
          .itemPrice,
    };
  }

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
    >
      <View
        style={
          styles.screen
        }
      >
        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.headerTitleArea
            }
          >
            <View
              style={
                styles.logoMark
              }
            >
              <Ionicons
                name="chatbubbles-outline"
                size={
                  20
                }
                color={
                  colors.primary
                }
              />
            </View>

            <View
              style={
                styles.headerTextArea
              }
            >
              <Text
                style={
                  styles.eyebrow
                }
              >
                DIRECT GAIN
              </Text>

              <View
                style={
                  styles.titleRow
                }
              >
                <Text
                  style={
                    styles.title
                  }
                >
                  Messages
                </Text>

                {unreadTotal >
                0 ? (
                  <View
                    style={
                      styles.headerUnreadBadge
                    }
                  >
                    <Text
                      style={
                        styles.headerUnreadText
                      }
                    >
                      {unreadTotal}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View
            style={
              styles.headerActions
            }
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Refresh messages"
              onPress={
                handleRefreshPress
              }
              style={({
                pressed,
              }) => [
                styles.headerButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              {refreshing ? (
                <ActivityIndicator
                  size="small"
                  color={
                    colors.primary
                  }
                />
              ) : (
                <Ionicons
                  name="refresh"
                  size={
                    20
                  }
                  color={
                    colors.text
                  }
                />
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start a new message"
              onPress={
                handleComposePress
              }
              style={({
                pressed,
              }) => [
                styles.headerButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="create-outline"
                size={
                  20
                }
                color={
                  colors.text
                }
              />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open message options"
              onPress={
                handleMorePress
              }
              style={({
                pressed,
              }) => [
                styles.headerButton,

                styles.lastHeaderButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={
                  20
                }
                color={
                  colors.text
                }
              />
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={
              styles.introCard
            }
          >
            <View
              style={
                styles.introIcon
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
                styles.introContent
              }
            >
              <Text
                style={
                  styles.introTitle
                }
              >
                Message with confidence
              </Text>

              <Text
                style={
                  styles.introText
                }
              >
                Gain Scores and verification details help you understand who you are speaking with.
              </Text>
            </View>
          </View>

          <View
            style={
              styles.searchContainer
            }
          >
            <Ionicons
              name="search-outline"
              size={
                19
              }
              color={
                colors.textMuted
              }
            />

            <TextInput
              value={
                searchQuery
              }
              onChangeText={
                setSearchQuery
              }
              placeholder="Search conversations"
              placeholderTextColor={
                colors.textMuted
              }
              selectionColor={
                colors.primary
              }
              autoCapitalize="none"
              autoCorrect={
                false
              }
              returnKeyType="search"
              style={
                styles.searchInput
              }
            />

            {searchQuery
              .length >
            0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                onPress={
                  handleClearSearch
                }
                hitSlop={
                  8
                }
                style={({
                  pressed,
                }) => [
                  styles.clearButton,

                  pressed &&
                    styles.pressed,
                ]}
              >
                <Ionicons
                  name="close-circle"
                  size={
                    19
                  }
                  color={
                    colors.textMuted
                  }
                />
              </Pressable>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.filtersContent
            }
          >
            {filterOptions.map(
              filter => {
                const isActive =
                  activeFilter ===
                  filter.id;

                return (
                  <Pressable
                    key={
                      filter.id
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Show ${filter.label} conversations`}
                    accessibilityState={{
                      selected:
                        isActive,
                    }}
                    onPress={() =>
                      setActiveFilter(
                        filter.id,
                      )
                    }
                    style={({
                      pressed,
                    }) => [
                      styles.filterChip,

                      isActive &&
                        styles.filterChipActive,

                      pressed &&
                        styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name={
                        filter.icon
                      }
                      size={
                        15
                      }
                      color={
                        isActive
                          ? '#080B09'
                          : colors.textMuted
                      }
                    />

                    <Text
                      style={[
                        styles.filterText,

                        isActive &&
                          styles.filterTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              },
            )}
          </ScrollView>

          <View
            style={
              styles.sectionHeader
            }
          >
            <View>
              <Text
                style={
                  styles.sectionEyebrow
                }
              >
                YOUR INBOX
              </Text>

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Conversations
              </Text>
            </View>

            {!loading ? (
              <Text
                style={
                  styles.conversationCount
                }
              >
                {
                  visibleConversations.length
                }{' '}
                {visibleConversations
                  .length ===
                1
                  ? 'conversation'
                  : 'conversations'}
              </Text>
            ) : null}
          </View>

          {loading ? (
            <View
              style={
                styles.loadingState
              }
            >
              <ActivityIndicator
                size="large"
                color={
                  colors.primary
                }
              />

              <Text
                style={
                  styles.loadingText
                }
              >
                Loading conversations...
              </Text>
            </View>
          ) : visibleConversations
              .length >
            0 ? (
            <View
              style={
                styles.conversationList
              }
            >
              {visibleConversations.map(
                conversation => (
                  <ConversationCard
                    key={
                      conversation.id
                    }
                    conversation={
                      createSummary(
                        conversation,
                      )
                    }
                    onPress={() =>
                      handleConversationPress(
                        conversation,
                      )
                    }
                  />
                ),
              )}
            </View>
          ) : (
            <View
              style={
                styles.emptyState
              }
            >
              <View
                style={
                  styles.emptyIcon
                }
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={
                    28
                  }
                  color={
                    colors.textMuted
                  }
                />
              </View>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No conversations yet
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                Conversations will appear here when you message another Direct Gain member.
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Refresh conversations"
                onPress={
                  handleRefreshPress
                }
                style={({
                  pressed,
                }) => [
                  styles.resetButton,

                  pressed &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={
                    styles.resetButtonText
                  }
                >
                  Refresh inbox
                </Text>
              </Pressable>
            </View>
          )}

          <View
            style={
              styles.safetyFooter
            }
          >
            <Ionicons
              name="lock-closed-outline"
              size={
                16
              }
              color={
                colors.textMuted
              }
            />

            <Text
              style={
                styles.safetyFooterText
              }
            >
              Keep conversations, offers and payments inside Direct Gain to help protect your account.
            </Text>
          </View>

          <View
            style={
              styles.bottomSpacer
            }
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function mapConversationType(
  value:
    string,
): ConversationType {
  switch (
    value
  ) {
    case 'market':
      return 'market';

    case 'job':
      return 'job';

    case 'auction':
      return 'auction';

    case 'support':
      return 'support';

    default:
      return 'market';
  }
}

function formatInboxTime(
  value:
    string,
): string {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '';
  }

  const now =
    new Date();

  const sameDay =
    date.getFullYear() ===
      now.getFullYear() &&
    date.getMonth() ===
      now.getMonth() &&
    date.getDate() ===
      now.getDate();

  if (
    sameDay
  ) {
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

  return date.toLocaleDateString(
    'en-AU',

    {
      day:
        'numeric',

      month:
        'short',
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

    header: {
      minHeight:
        72,

      paddingHorizontal:
        18,

      paddingVertical:
        12,

      borderBottomWidth:
        1,

      borderBottomColor:
        'rgba(255, 255, 255, 0.07)',

      backgroundColor:
        '#080B09',

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    headerTitleArea: {
      flex:
        1,

      flexDirection:
        'row',

      alignItems:
        'center',
    },

    logoMark: {
      width:
        46,

      height:
        46,

      marginRight:
        12,

      borderRadius:
        16,

      borderWidth:
        1,

      borderColor:
        'rgba(158, 246, 90, 0.20)',

      backgroundColor:
        'rgba(158, 246, 90, 0.08)',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    headerTextArea: {
      flex:
        1,
    },

    eyebrow: {
      color:
        colors.primary,

      fontSize:
        9,

      fontWeight:
        '900',

      letterSpacing:
        1.3,
    },

    titleRow: {
      marginTop:
        3,

      flexDirection:
        'row',

      alignItems:
        'center',
    },

    title: {
      color:
        colors.text,

      fontSize:
        22,

      fontWeight:
        '900',

      letterSpacing:
        -0.4,
    },

    headerUnreadBadge: {
      minWidth:
        23,

      height:
        23,

      marginLeft:
        8,

      paddingHorizontal:
        6,

      borderRadius:
        12,

      backgroundColor:
        colors.primary,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    headerUnreadText: {
      color:
        '#080B09',

      fontSize:
        9,

      fontWeight:
        '900',
    },

    headerActions: {
      marginLeft:
        12,

      flexDirection:
        'row',

      alignItems:
        'center',
    },

    headerButton: {
      width:
        43,

      height:
        43,

      marginRight:
        8,

      borderRadius:
        14,

      borderWidth:
        1,

      borderColor:
        'rgba(255, 255, 255, 0.10)',

      backgroundColor:
        'rgba(255, 255, 255, 0.045)',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    lastHeaderButton: {
      marginRight:
        0,
    },

    scrollContent: {
      paddingHorizontal:
        18,

      paddingTop:
        18,

      paddingBottom:
        30,
    },

    introCard: {
      padding:
        15,

      borderRadius:
        21,

      borderWidth:
        1,

      borderColor:
        'rgba(158, 246, 90, 0.13)',

      backgroundColor:
        'rgba(158, 246, 90, 0.045)',

      flexDirection:
        'row',

      alignItems:
        'center',
    },

    introIcon: {
      width:
        44,

      height:
        44,

      marginRight:
        12,

      borderRadius:
        15,

      backgroundColor:
        'rgba(158, 246, 90, 0.08)',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    introContent: {
      flex:
        1,
    },

    introTitle: {
      color:
        colors.text,

      fontSize:
        13,

      fontWeight:
        '900',
    },

    introText: {
      marginTop:
        4,

      color:
        colors.textMuted,

      fontSize:
        10,

      lineHeight:
        16,

      fontWeight:
        '600',
    },

    searchContainer: {
      height:
        52,

      marginTop:
        16,

      paddingHorizontal:
        15,

      borderRadius:
        17,

      borderWidth:
        1,

      borderColor:
        'rgba(255, 255, 255, 0.09)',

      backgroundColor:
        '#101511',

      flexDirection:
        'row',

      alignItems:
        'center',
    },

    searchInput: {
      flex:
        1,

      height:
        '100%',

      marginLeft:
        10,

      color:
        colors.text,

      fontSize:
        13,

      fontWeight:
        '700',
    },

    clearButton: {
      marginLeft:
        8,
    },

    filtersContent: {
      paddingTop:
        14,

      paddingRight:
        12,
    },

    filterChip: {
      height:
        39,

      marginRight:
        8,

      paddingHorizontal:
        13,

      borderRadius:
        13,

      borderWidth:
        1,

      borderColor:
        'rgba(255, 255, 255, 0.08)',

      backgroundColor:
        'rgba(255, 255, 255, 0.035)',

      flexDirection:
        'row',

      alignItems:
        'center',
    },

    filterChipActive: {
      borderColor:
        colors.primary,

      backgroundColor:
        colors.primary,
    },

    filterText: {
      marginLeft:
        6,

      color:
        colors.textMuted,

      fontSize:
        10,

      fontWeight:
        '800',
    },

    filterTextActive: {
      color:
        '#080B09',

      fontWeight:
        '900',
    },

    sectionHeader: {
      marginTop:
        24,

      marginBottom:
        13,

      flexDirection:
        'row',

      alignItems:
        'flex-end',

      justifyContent:
        'space-between',
    },

    sectionEyebrow: {
      color:
        colors.primary,

      fontSize:
        9,

      fontWeight:
        '900',

      letterSpacing:
        1.2,
    },

    sectionTitle: {
      marginTop:
        4,

      color:
        colors.text,

      fontSize:
        20,

      fontWeight:
        '900',
    },

    conversationCount: {
      marginLeft:
        12,

      color:
        colors.textMuted,

      fontSize:
        9,

      fontWeight:
        '700',
    },

    conversationList: {
      paddingBottom:
        2,
    },

    loadingState: {
      marginTop:
        4,

      paddingVertical:
        42,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    loadingText: {
      marginTop:
        12,

      color:
        colors.textMuted,

      fontSize:
        10,

      fontWeight:
        '700',
    },

    emptyState: {
      marginTop:
        4,

      paddingHorizontal:
        24,

      paddingVertical:
        34,

      borderRadius:
        24,

      borderWidth:
        1,

      borderColor:
        'rgba(255, 255, 255, 0.07)',

      backgroundColor:
        '#101511',

      alignItems:
        'center',
    },

    emptyIcon: {
      width:
        58,

      height:
        58,

      borderRadius:
        20,

      backgroundColor:
        'rgba(255, 255, 255, 0.04)',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    emptyTitle: {
      marginTop:
        15,

      color:
        colors.text,

      fontSize:
        15,

      fontWeight:
        '900',
    },

    emptyText: {
      marginTop:
        7,

      color:
        colors.textMuted,

      fontSize:
        10,

      lineHeight:
        16,

      fontWeight:
        '600',

      textAlign:
        'center',
    },

    resetButton: {
      height:
        42,

      marginTop:
        17,

      paddingHorizontal:
        18,

      borderRadius:
        14,

      borderWidth:
        1,

      borderColor:
        'rgba(158, 246, 90, 0.17)',

      backgroundColor:
        'rgba(158, 246, 90, 0.06)',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    resetButtonText: {
      color:
        colors.primary,

      fontSize:
        10,

      fontWeight:
        '900',
    },

    safetyFooter: {
      marginTop:
        8,

      padding:
        15,

      borderRadius:
        18,

      borderWidth:
        1,

      borderColor:
        'rgba(255, 255, 255, 0.07)',

      backgroundColor:
        'rgba(255, 255, 255, 0.025)',

      flexDirection:
        'row',

      alignItems:
        'flex-start',
    },

    safetyFooterText: {
      flex:
        1,

      marginLeft:
        9,

      color:
        colors.textMuted,

      fontSize:
        9,

      lineHeight:
        14,

      fontWeight:
        '600',
    },

    bottomSpacer: {
      height:
        24,
    },

    pressed: {
      opacity:
        0.72,

      transform: [
        {
          scale:
            0.985,
        },
      ],
    },
  });