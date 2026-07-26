import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ChatInput from '../components/messaging/ChatInput';
import ConversationHeader from '../components/messaging/ConversationHeader';
import MessageBubble from '../components/messaging/MessageBubble';
import { conversations } from '../data/conversations';
import { colors } from '../theme/colors';
import type {
  ChatMessage,
  Conversation,
} from '../types/Messaging';

type Props = {
  route?: {
    params?: {
      conversationId?: string;
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
  const conversationId =
    route?.params?.conversationId ??
    conversations[0].id;

  const initialConversation = useMemo(
    () =>
      conversations.find(
        conversation =>
          conversation.id === conversationId,
      ) ?? conversations[0],
    [conversationId],
  );

  const [conversation, setConversation] =
    useState<Conversation>(
      initialConversation,
    );

  const handleSend = (text: string) => {
    const newMessage: ChatMessage = {
      id: `message-${Date.now()}`,
      conversationId: conversation.id,
      sender: 'current-user',
      kind: 'text',
      text,
      createdAt: 'Now',
      status: 'sent',
    };

    setConversation(current => ({
      ...current,
      messages: [
        ...current.messages,
        newMessage,
      ],
    }));
  };

  const handleBackPress = () => {
    navigation?.goBack();
  };

  const handleProfilePress = () => {
    Alert.alert(
      conversation.participant.name,
      'The participant profile will be connected later.',
    );
  };

  const handleCallPress = () => {
    Alert.alert(
      'Call',
      'Voice and video calling will be added later.',
    );
  };

  const handleMorePress = () => {
    Alert.alert(
      'Conversation options',
      'Mute, archive, block and report controls will be added later.',
    );
  };

  const handlePhotoPress = () => {
    Alert.alert(
      'Photo',
      'Photo sharing will be connected later.',
    );
  };

  const handleAttachmentPress = () => {
    Alert.alert(
      'Attachment',
      'File and document sharing will be connected later.',
    );
  };

  const handleLocationPress = () => {
    Alert.alert(
      'Location',
      'Secure location sharing will be connected later.',
    );
  };

  const handleMessagePress = (
    message: ChatMessage,
  ) => {
    Alert.alert(
      'Message options',
      message.text ??
        'Additional message actions will be added later.',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
        keyboardVerticalOffset={0}
      >
        <ConversationHeader
          participant={conversation.participant}
          context={conversation.context}
          onBackPress={handleBackPress}
          onProfilePress={handleProfilePress}
          onCallPress={handleCallPress}
          onMorePress={handleMorePress}
        />

        <View style={styles.contextCard}>
          <View style={styles.contextIcon}>
            <Ionicons
              name={
                conversation.context.type === 'job'
                  ? 'briefcase-outline'
                  : conversation.context.type ===
                      'auction'
                    ? 'hammer-outline'
                    : conversation.context.type ===
                        'support'
                      ? 'shield-checkmark-outline'
                      : 'storefront-outline'
              }
              size={19}
              color={colors.primary}
            />
          </View>

          <View style={styles.contextContent}>
            <Text style={styles.contextEyebrow}>
              CONVERSATION CONTEXT
            </Text>

            <Text
              style={styles.contextTitle}
              numberOfLines={1}
            >
              {conversation.context.title}
            </Text>

            {conversation.context.location && (
              <Text
                style={styles.contextLocation}
                numberOfLines={1}
              >
                {conversation.context.location}
              </Text>
            )}
          </View>

          {conversation.context.itemPrice !==
            undefined && (
            <Text style={styles.contextPrice}>
              {new Intl.NumberFormat('en-AU', {
                style: 'currency',
                currency: 'AUD',
                maximumFractionDigits: 0,
              }).format(
                conversation.context.itemPrice,
              )}
            </Text>
          )}
        </View>

        <ScrollView
          style={styles.messages}
          contentContainerStyle={
            styles.messagesContent
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.safetyNotice}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={colors.primary}
            />

            <Text style={styles.safetyText}>
              Keep messages, offers and payments
              inside Direct Gain for better account
              protection.
            </Text>
          </View>

          <View style={styles.dayDivider}>
            <View style={styles.dayLine} />

            <Text style={styles.dayText}>
              Today
            </Text>

            <View style={styles.dayLine} />
          </View>

          {conversation.messages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              onPress={handleMessagePress}
            />
          ))}
        </ScrollView>

        <ChatInput
          onSend={handleSend}
          onPhotoPress={handlePhotoPress}
          onAttachmentPress={
            handleAttachmentPress
          }
          onLocationPress={
            handleLocationPress
          }
        />
      </KeyboardAvoidingView>
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

  contextCard: {
    marginHorizontal: 14,
    marginTop: 12,
    padding: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.13)',
    backgroundColor:
      'rgba(158, 246, 90, 0.045)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  contextIcon: {
    width: 40,
    height: 40,
    marginRight: 11,
    borderRadius: 13,
    backgroundColor:
      'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  contextContent: {
    flex: 1,
    minWidth: 0,
  },

  contextEyebrow: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  contextTitle: {
    marginTop: 4,
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },

  contextLocation: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },

  contextPrice: {
    marginLeft: 10,
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },

  messages: {
    flex: 1,
  },

  messagesContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 20,
  },

  safetyNotice: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.10)',
    backgroundColor:
      'rgba(158, 246, 90, 0.035)',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  safetyText: {
    flex: 1,
    marginLeft: 8,
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '600',
  },

  dayDivider: {
    marginVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dayLine: {
    flex: 1,
    height: 1,
    backgroundColor:
      'rgba(255, 255, 255, 0.06)',
  },

  dayText: {
    marginHorizontal: 11,
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '800',
  },
});