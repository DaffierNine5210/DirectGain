import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';

type Props = {
  placeholder?: string;
  onSend: (text: string) => void;
  onPhotoPress?: () => void;
  onAttachmentPress?: () => void;
  onLocationPress?: () => void;
};

export default function ChatInput({
  placeholder = 'Message...',
  onSend,
  onPhotoPress,
  onAttachmentPress,
  onLocationPress,
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

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
});