import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
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
import { conversations } from '../data/conversations';
import type { MessagesStackParamList } from '../navigation/MessagesStack';
import { colors } from '../theme/colors';
import {
  createConversationSummary,
  type Conversation,
} from '../types/Messaging';

type Props = NativeStackScreenProps<
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
  id: InboxFilter;
  label: string;
  icon:
    | 'chatbubbles-outline'
    | 'storefront-outline'
    | 'briefcase-outline'
    | 'hammer-outline'
    | 'shield-checkmark-outline';
};

const filterOptions: FilterOption[] = [
  {
    id: 'all',
    label: 'All',
    icon: 'chatbubbles-outline',
  },
  {
    id: 'market',
    label: 'Market',
    icon: 'storefront-outline',
  },
  {
    id: 'job',
    label: 'Jobs',
    icon: 'briefcase-outline',
  },
  {
    id: 'auction',
    label: 'Auctions',
    icon: 'hammer-outline',
  },
  {
    id: 'support',
    label: 'Support',
    icon: 'shield-checkmark-outline',
  },
];

function getLastMessageTime(
  conversation: Conversation,
): string {
  const lastMessage =
    conversation.messages[
      conversation.messages.length - 1
    ];

  return lastMessage?.createdAt ?? '';
}

export default function MessagesInboxScreen({
  navigation,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] =
    useState<InboxFilter>('all');

  const unreadTotal = useMemo(
    () =>
      conversations.reduce(
        (total, conversation) =>
          total + conversation.unreadCount,
        0,
      ),
    [],
  );

  const visibleConversations = useMemo(() => {
    const normalizedSearch = searchQuery
      .trim()
      .toLowerCase();

    return [...conversations]
      .filter(conversation => {
        const matchesFilter =
          activeFilter === 'all' ||
          conversation.context.type === activeFilter;

        const lastMessage =
          conversation.messages[
            conversation.messages.length - 1
          ];

        const searchableText = [
          conversation.participant.name,
          conversation.participant.username ?? '',
          conversation.context.title,
          conversation.context.location ?? '',
          lastMessage?.text ?? '',
        ]
          .join(' ')
          .toLowerCase();

        const matchesSearch =
          normalizedSearch.length === 0 ||
          searchableText.includes(normalizedSearch);

        return matchesFilter && matchesSearch;
      })
      .sort((first, second) => {
        if (first.isPinned && !second.isPinned) {
          return -1;
        }

        if (!first.isPinned && second.isPinned) {
          return 1;
        }

        if (
          first.unreadCount > 0 &&
          second.unreadCount === 0
        ) {
          return -1;
        }

        if (
          first.unreadCount === 0 &&
          second.unreadCount > 0
        ) {
          return 1;
        }

        return 0;
      });
  }, [activeFilter, searchQuery]);

  const handleConversationPress = (
    conversationId: string,
  ) => {
    navigation.navigate('Conversation', {
      conversationId,
    });
  };

  const handleComposePress = () => {
    Alert.alert(
      'New message',
      'Contact search and new conversation creation will be added later.',
    );
  };

  const handleMorePress = () => {
    Alert.alert(
      'Message options',
      'Archived conversations, requests and inbox settings will be added later.',
    );
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerTitleArea}>
            <View style={styles.logoMark}>
              <Ionicons
                name="chatbubbles-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <View style={styles.headerTextArea}>
              <Text style={styles.eyebrow}>
                DIRECT GAIN
              </Text>

              <View style={styles.titleRow}>
                <Text style={styles.title}>
                  Messages
                </Text>

                {unreadTotal > 0 && (
                  <View style={styles.headerUnreadBadge}>
                    <Text style={styles.headerUnreadText}>
                      {unreadTotal}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start a new message"
              onPress={handleComposePress}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color={colors.text}
              />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open message options"
              onPress={handleMorePress}
              style={({ pressed }) => [
                styles.headerButton,
                styles.lastHeaderButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={20}
                color={colors.text}
              />
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <View style={styles.introContent}>
              <Text style={styles.introTitle}>
                Message with confidence
              </Text>

              <Text style={styles.introText}>
                Gain Scores and verification details help
                you understand who you are speaking with.
              </Text>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={19}
              color={colors.textMuted}
            />

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search conversations"
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.primary}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              style={styles.searchInput}
            />

            {searchQuery.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                onPress={handleClearSearch}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="close-circle"
                  size={19}
                  color={colors.textMuted}
                />
              </Pressable>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {filterOptions.map(filter => {
              const isActive =
                activeFilter === filter.id;

              return (
                <Pressable
                  key={filter.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${filter.label} conversations`}
                  accessibilityState={{
                    selected: isActive,
                  }}
                  onPress={() =>
                    setActiveFilter(filter.id)
                  }
                  style={({ pressed }) => [
                    styles.filterChip,
                    isActive &&
                      styles.filterChipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={filter.icon}
                    size={15}
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
            })}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>
                YOUR INBOX
              </Text>

              <Text style={styles.sectionTitle}>
                Conversations
              </Text>
            </View>

            <Text style={styles.conversationCount}>
              {visibleConversations.length}{' '}
              {visibleConversations.length === 1
                ? 'conversation'
                : 'conversations'}
            </Text>
          </View>

          {visibleConversations.length > 0 ? (
            <View style={styles.conversationList}>
              {visibleConversations.map(
                conversation => (
                  <ConversationCard
                    key={conversation.id}
                    conversation={{
                      ...createConversationSummary(
                        conversation,
                      ),
                      lastMessageAt:
                        getLastMessageTime(
                          conversation,
                        ),
                    }}
                    onPress={
                      handleConversationPress
                    }
                  />
                ),
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={28}
                  color={colors.textMuted}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No conversations found
              </Text>

              <Text style={styles.emptyText}>
                Try another search or select a different
                conversation filter.
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear conversation filters"
                onPress={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                style={({ pressed }) => [
                  styles.resetButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.resetButtonText}>
                  Clear filters
                </Text>
              </Pressable>
            </View>
          )}

          <View style={styles.safetyFooter}>
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color={colors.textMuted}
            />

            <Text style={styles.safetyFooterText}>
              Keep conversations, offers and payments
              inside Direct Gain to help protect your
              account.
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080B09',
  },

  screen: {
    flex: 1,
    backgroundColor: '#080B09',
  },

  header: {
    minHeight: 72,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor:
      'rgba(255, 255, 255, 0.07)',
    backgroundColor: '#080B09',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitleArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoMark: {
    width: 46,
    height: 46,
    marginRight: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.20)',
    backgroundColor:
      'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTextArea: {
    flex: 1,
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
  },

  titleRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
  },

  headerUnreadBadge: {
    minWidth: 23,
    height: 23,
    marginLeft: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerUnreadText: {
    color: '#080B09',
    fontSize: 9,
    fontWeight: '900',
  },

  headerActions: {
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerButton: {
    width: 43,
    height: 43,
    marginRight: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.10)',
    backgroundColor:
      'rgba(255, 255, 255, 0.045)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  lastHeaderButton: {
    marginRight: 0,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 30,
  },

  introCard: {
    padding: 15,
    borderRadius: 21,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.13)',
    backgroundColor:
      'rgba(158, 246, 90, 0.045)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  introIcon: {
    width: 44,
    height: 44,
    marginRight: 12,
    borderRadius: 15,
    backgroundColor:
      'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  introContent: {
    flex: 1,
  },

  introTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },

  introText: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '600',
  },

  searchContainer: {
    height: 52,
    marginTop: 16,
    paddingHorizontal: 15,
    borderRadius: 17,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.09)',
    backgroundColor: '#101511',
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 10,
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },

  clearButton: {
    marginLeft: 8,
  },

  filtersContent: {
    paddingTop: 14,
    paddingRight: 12,
  },

  filterChip: {
    height: 39,
    marginRight: 8,
    paddingHorizontal: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
    backgroundColor:
      'rgba(255, 255, 255, 0.035)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  filterText: {
    marginLeft: 6,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },

  filterTextActive: {
    color: '#080B09',
    fontWeight: '900',
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  sectionEyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  sectionTitle: {
    marginTop: 4,
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },

  conversationCount: {
    marginLeft: 12,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },

  conversationList: {
    paddingBottom: 2,
  },

  emptyState: {
    marginTop: 4,
    paddingHorizontal: 24,
    paddingVertical: 34,
    borderRadius: 24,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.07)',
    backgroundColor: '#101511',
    alignItems: 'center',
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor:
      'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 15,
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },

  emptyText: {
    marginTop: 7,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  resetButton: {
    height: 42,
    marginTop: 17,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.17)',
    backgroundColor:
      'rgba(158, 246, 90, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resetButtonText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },

  safetyFooter: {
    marginTop: 8,
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.07)',
    backgroundColor:
      'rgba(255, 255, 255, 0.025)',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  safetyFooterText: {
    flex: 1,
    marginLeft: 9,
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '600',
  },

  bottomSpacer: {
    height: 24,
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.985 }],
  },
});