import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';
import {
  formatVoiceDuration,
} from '../../services/messaging/conversationAudio';

export type VoiceComposerMode =
  | 'compose'
  | 'recording'
  | 'preview';

type Props = {
  placeholder?: string;
  onSend: (text: string) => void;
  onPhotoPress?: () => void;
  onAttachmentPress?: () => void;
  onLocationPress?: () => void;
  onVoicePress?: () => void;
  voiceMode?: VoiceComposerMode;
  voiceElapsedMs?: number;
  voicePreviewDurationMs?: number;
  isVoicePreviewPlaying?: boolean;
  onStopVoiceRecording?: () => void;
  onCancelVoice?: () => void;
  onPreviewVoice?: () => void;
  onSendVoice?: () => void;
};

export default function ChatInput({
  placeholder = 'Message...',
  onSend,
  onPhotoPress,
  onAttachmentPress,
  onLocationPress,
  onVoicePress,
  voiceMode = 'compose',
  voiceElapsedMs = 0,
  voicePreviewDurationMs = 0,
  isVoicePreviewPlaying = false,
  onStopVoiceRecording,
  onCancelVoice,
  onPreviewVoice,
  onSendVoice,
}: Props) {
  const [message, setMessage] = useState('');

  function handleSend() {
    const text = message.trim();

    if (!text) {
      return;
    }

    onSend(text);
    setMessage('');
  }

  if (voiceMode === 'recording') {
    return (
      <View style={styles.container}>
        <View style={styles.voiceBar}>
          <View style={styles.recordingDot} />
          <Text style={styles.voiceTitle}>
            Recording
          </Text>
          <Text style={styles.voiceTime}>
            {formatVoiceDuration(voiceElapsedMs)}
          </Text>
          <Pressable
            onPress={onCancelVoice}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="close"
              size={22}
              color={colors.textMuted}
            />
          </Pressable>
          <Pressable
            onPress={onStopVoiceRecording}
            style={({ pressed }) => [
              styles.sendButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="stop"
              size={18}
              color="#080B09"
            />
          </Pressable>
        </View>
      </View>
    );
  }

  if (voiceMode === 'preview') {
    return (
      <View style={styles.container}>
        <View style={styles.voiceBar}>
          <Pressable
            onPress={onPreviewVoice}
            style={({ pressed }) => [
              styles.playButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={isVoicePreviewPlaying ? 'pause' : 'play'}
              size={18}
              color="#080B09"
            />
          </Pressable>
          <View style={styles.voiceCopy}>
            <Text style={styles.voiceTitle}>
              Voice message
            </Text>
            <Text style={styles.voiceMeta}>
              {formatVoiceDuration(voicePreviewDurationMs)} · Review before sending
            </Text>
          </View>
          <Pressable
            onPress={onCancelVoice}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
          <Pressable
            onPress={onSendVoice}
            style={({ pressed }) => [
              styles.sendButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="send"
              size={18}
              color="#080B09"
            />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Pressable
          onPress={onAttachmentPress}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="attach"
            size={20}
            color={colors.primary}
          />
        </Pressable>

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline
          style={styles.input}
        />

        <Pressable
          onPress={onPhotoPress}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="camera-outline"
            size={20}
            color={colors.primary}
          />
        </Pressable>

        <Pressable
          onPress={onLocationPress}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="location-outline"
            size={20}
            color={colors.primary}
          />
        </Pressable>

        <Pressable
          onPress={onVoicePress}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="mic-outline"
            size={20}
            color={colors.primary}
          />
        </Pressable>

        <Pressable
          onPress={handleSend}
          style={({ pressed }) => [
            styles.sendButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="send"
            size={20}
            color="#080B09"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#080B09',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#111411',
  },

  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginLeft: 4,
  },

  playButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  voiceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.18)',
    backgroundColor: '#111411',
    gap: 8,
  },

  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
    marginLeft: 6,
  },

  voiceCopy: {
    flex: 1,
    minWidth: 0,
  },

  voiceTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },

  voiceTime: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },

  voiceMeta: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
});
