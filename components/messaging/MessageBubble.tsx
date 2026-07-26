import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';
import type { ChatMessage } from '../../types/Messaging';

type Props = {
  message: ChatMessage;
  onPress?: (message: ChatMessage) => void;
};

function getStatusIcon(
  status: ChatMessage['status'],
):
  | 'time-outline'
  | 'checkmark'
  | 'checkmark-done'
  | null {
  if (status === 'sending') {
    return 'time-outline';
  }

  if (status === 'sent') {
    return 'checkmark';
  }

  if (
    status === 'delivered' ||
    status === 'read'
  ) {
    return 'checkmark-done';
  }

  return null;
}

function getSystemIcon(
  kind: ChatMessage['kind'],
):
  | 'information-circle-outline'
  | 'location-outline'
  | 'image-outline'
  | 'cash-outline'
  | 'chatbubble-outline' {
  if (kind === 'location') {
    return 'location-outline';
  }

  if (kind === 'image') {
    return 'image-outline';
  }

  if (kind === 'offer') {
    return 'cash-outline';
  }

  if (kind === 'system') {
    return 'information-circle-outline';
  }

  return 'chatbubble-outline';
}

export default function MessageBubble({
  message,
  onPress,
}: Props) {
  const isCurrentUser =
    message.sender === 'current-user';

  const isSystem =
    message.sender === 'system' ||
    message.kind === 'system';

  const statusIcon = getStatusIcon(
    message.status,
  );

  if (isSystem) {
    return (
      <View style={styles.systemWrapper}>
        <View style={styles.systemBubble}>
          <Ionicons
            name={getSystemIcon(message.kind)}
            size={15}
            color={colors.primary}
          />

          <Text style={styles.systemText}>
            {message.text}
          </Text>
        </View>

        <Text style={styles.systemTime}>
          {message.createdAt}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.messageRow,
        isCurrentUser
          ? styles.currentUserRow
          : styles.participantRow,
      ]}
    >
      <View
        style={[
          styles.bubbleGroup,
          isCurrentUser
            ? styles.currentUserGroup
            : styles.participantGroup,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            message.text
              ? `Message: ${message.text}`
              : 'Open message'
          }
          onPress={() => onPress?.(message)}
          style={({ pressed }) => [
            styles.bubble,
            isCurrentUser
              ? styles.currentUserBubble
              : styles.participantBubble,
            pressed && styles.pressed,
          ]}
        >
          {message.kind === 'image' &&
            message.image && (
              <Image
                source={message.image!}
                style={styles.messageImage}
              />
            )}

          {message.kind === 'location' && (
            <View style={styles.specialHeader}>
              <View
                style={styles.specialIcon}
              >
                <Ionicons
                  name="location-outline"
                  size={17}
                  color={colors.primary}
                />
              </View>

              <Text
                style={styles.specialTitle}
              >
                Shared location
              </Text>
            </View>
          )}

          {message.kind === 'offer' && (
            <View style={styles.specialHeader}>
              <View
                style={styles.specialIcon}
              >
                <Ionicons
                  name="cash-outline"
                  size={17}
                  color={colors.primary}
                />
              </View>

              <Text
                style={styles.specialTitle}
              >
                Direct Gain offer
              </Text>
            </View>
          )}

          {message.text && (
            <Text
              style={[
                styles.messageText,
                isCurrentUser &&
                  styles.currentUserText,
              ]}
            >
              {message.text}
            </Text>
          )}
        </Pressable>

        <View
          style={[
            styles.metaRow,
            isCurrentUser
              ? styles.metaRowCurrentUser
              : styles.metaRowParticipant,
          ]}
        >
          {message.isEdited && (
            <Text style={styles.editedText}>
              Edited
            </Text>
          )}

          <Text style={styles.messageTime}>
            {message.createdAt}
          </Text>

          {isCurrentUser &&
            statusIcon && (
              <Ionicons
                name={statusIcon}
                size={14}
                color={
                  message.status === 'read'
                    ? colors.primary
                    : colors.textMuted
                }
                style={styles.statusIcon}
              />
            )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageRow: {
    width: '100%',
    marginBottom: 15,
  },

  currentUserRow: {
    alignItems: 'flex-end',
  },

  participantRow: {
    alignItems: 'flex-start',
  },

  bubbleGroup: {
    maxWidth: '82%',
  },

  currentUserGroup: {
    alignItems: 'flex-end',
  },

  participantGroup: {
    alignItems: 'flex-start',
  },

  bubble: {
    minWidth: 54,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 19,
    overflow: 'hidden',
  },

  currentUserBubble: {
    borderBottomRightRadius: 6,
    backgroundColor: colors.primary,
  },

  participantBubble: {
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#151A16',
  },

  messageText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },

  currentUserText: {
    color: '#080B09',
    fontWeight: '700',
  },

  messageImage: {
    width: 230,
    height: 170,
    marginHorizontal: -14,
    marginTop: -11,
    marginBottom: 10,
    backgroundColor: '#182019',
  },

  specialHeader: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  specialIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.16)',
    backgroundColor:
      'rgba(158, 246, 90, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  specialTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },

  metaRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaRowCurrentUser: {
    justifyContent: 'flex-end',
  },

  metaRowParticipant: {
    justifyContent: 'flex-start',
  },

  messageTime: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '700',
  },

  editedText: {
    marginRight: 6,
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '600',
  },

  statusIcon: {
    marginLeft: 5,
  },

  systemWrapper: {
    marginVertical: 11,
    alignItems: 'center',
  },

  systemBubble: {
    maxWidth: '88%',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 15,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.12)',
    backgroundColor:
      'rgba(158, 246, 90, 0.045)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  systemText: {
    flexShrink: 1,
    marginLeft: 7,
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '700',
    textAlign: 'center',
  },

  systemTime: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '600',
  },

  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.988 }],
  },
});