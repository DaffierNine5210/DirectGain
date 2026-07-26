import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';

export type ConversationType =
  | 'market'
  | 'job'
  | 'auction'
  | 'support';

export type ConversationSummary = {
  id: string;
  participantName: string;
  participantImage?: ImageSourcePropType;
  title: string;
  lastMessage: string;
  lastMessageAt: string;
  gainScore?: number;
  unreadCount?: number;
  isOnline?: boolean;
  isVerified?: boolean;
  isTyping?: boolean;
  type: ConversationType;
  itemImage?: ImageSourcePropType;
  itemPrice?: number;
};

type Props = {
  conversation: ConversationSummary;
  onPress: (conversationId: string) => void;
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getConversationIcon(
  type: ConversationType,
):
  | 'storefront-outline'
  | 'briefcase-outline'
  | 'hammer-outline'
  | 'shield-checkmark-outline' {
  if (type === 'job') {
    return 'briefcase-outline';
  }

  if (type === 'auction') {
    return 'hammer-outline';
  }

  if (type === 'support') {
    return 'shield-checkmark-outline';
  }

  return 'storefront-outline';
}

function getConversationLabel(
  type: ConversationType,
): string {
  if (type === 'job') {
    return 'Job';
  }

  if (type === 'auction') {
    return 'Auction';
  }

  if (type === 'support') {
    return 'Support';
  }

  return 'Market';
}

function formatPrice(price?: number): string | null {
  if (price === undefined) {
    return null;
  }

  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ConversationCard({
  conversation,
  onPress,
}: Props) {
  const initials = getInitials(
    conversation.participantName,
  );

  const formattedPrice = formatPrice(
    conversation.itemPrice,
  );

  const hasUnreadMessages =
    (conversation.unreadCount ?? 0) > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open conversation with ${conversation.participantName}`}
      onPress={() => onPress(conversation.id)}
      style={({ pressed }) => [
        styles.container,
        hasUnreadMessages && styles.containerUnread,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.avatarArea}>
        <View style={styles.avatar}>
          {conversation.participantImage ? (
            <Image
              source={conversation.participantImage}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarInitials}>
              {initials}
            </Text>
          )}
        </View>

        {conversation.isOnline && (
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <View style={styles.nameArea}>
            <Text
              style={[
                styles.name,
                hasUnreadMessages &&
                  styles.unreadText,
              ]}
              numberOfLines={1}
            >
              {conversation.participantName}
            </Text>

            {conversation.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark"
                  size={11}
                  color="#080B09"
                />
              </View>
            )}
          </View>

          <Text
            style={[
              styles.time,
              hasUnreadMessages &&
                styles.timeUnread,
            ]}
          >
            {conversation.lastMessageAt}
          </Text>
        </View>

        <View style={styles.contextRow}>
          <View style={styles.typeBadge}>
            <Ionicons
              name={getConversationIcon(
                conversation.type,
              )}
              size={12}
              color={colors.primary}
            />

            <Text style={styles.typeText}>
              {getConversationLabel(
                conversation.type,
              )}
            </Text>
          </View>

          <Text
            style={styles.contextTitle}
            numberOfLines={1}
          >
            {conversation.title}
          </Text>

          {formattedPrice && (
            <Text style={styles.price}>
              {formattedPrice}
            </Text>
          )}
        </View>

        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              hasUnreadMessages &&
                styles.lastMessageUnread,
              conversation.isTyping &&
                styles.typingText,
            ]}
            numberOfLines={1}
          >
            {conversation.isTyping
              ? 'Typing...'
              : conversation.lastMessage}
          </Text>

          {hasUnreadMessages && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {Math.min(
                  conversation.unreadCount ?? 0,
                  99,
                )}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.trustRow}>
          {conversation.gainScore !== undefined && (
            <View style={styles.gainScoreBadge}>
              <Ionicons
                name="trending-up"
                size={12}
                color={colors.primary}
              />

              <Text style={styles.gainScoreText}>
                Gain Score {conversation.gainScore}
              </Text>
            </View>
          )}

          {conversation.isVerified && (
            <View style={styles.trustBadge}>
              <Ionicons
                name="shield-checkmark-outline"
                size={12}
                color={colors.primary}
              />

              <Text style={styles.trustText}>
                Verified
              </Text>
            </View>
          )}
        </View>
      </View>

      {conversation.itemImage && (
        <Image
          source={conversation.itemImage}
          style={styles.itemImage}
        />
      )}

      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 142,
    marginBottom: 12,
    padding: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#101511',
    flexDirection: 'row',
    alignItems: 'center',
  },

  containerUnread: {
    borderColor: 'rgba(158, 246, 90, 0.18)',
    backgroundColor: 'rgba(158, 246, 90, 0.045)',
  },

  avatarArea: {
    position: 'relative',
    marginRight: 12,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.18)',
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  avatarInitials: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },

  onlineIndicator: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 17,
    height: 17,
    padding: 3,
    borderRadius: 9,
    backgroundColor: '#101511',
  },

  onlineDot: {
    flex: 1,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  nameArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  name: {
    flexShrink: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },

  unreadText: {
    fontWeight: '900',
  },

  verifiedBadge: {
    width: 18,
    height: 18,
    marginLeft: 6,
    borderRadius: 7,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  time: {
    marginLeft: 8,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },

  timeUnread: {
    color: colors.primary,
    fontWeight: '900',
  },

  contextRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  typeBadge: {
    marginRight: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(158, 246, 90, 0.07)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  typeText: {
    marginLeft: 4,
    color: colors.text,
    fontSize: 8,
    fontWeight: '800',
  },

  contextTitle: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },

  price: {
    marginLeft: 7,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },

  messageRow: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  lastMessage: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },

  lastMessageUnread: {
    color: colors.text,
    fontWeight: '800',
  },

  typingText: {
    color: colors.primary,
    fontWeight: '800',
  },

  unreadBadge: {
    minWidth: 22,
    height: 22,
    marginLeft: 8,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  unreadCount: {
    color: '#080B09',
    fontSize: 9,
    fontWeight: '900',
  },

  trustRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  gainScoreBadge: {
    marginRight: 7,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.14)',
    backgroundColor: 'rgba(158, 246, 90, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  gainScoreText: {
    marginLeft: 5,
    color: colors.text,
    fontSize: 8,
    fontWeight: '800',
  },

  trustBadge: {
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  trustText: {
    marginLeft: 5,
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '700',
  },

  itemImage: {
    width: 54,
    height: 54,
    marginLeft: 10,
    marginRight: 8,
    borderRadius: 15,
    backgroundColor: '#182019',
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.985 }],
  },
});