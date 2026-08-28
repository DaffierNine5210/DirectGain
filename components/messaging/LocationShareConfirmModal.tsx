import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';

type LocationShareStep =
  | 'choose'
  | 'loading'
  | 'confirm';

type Props = {
  visible: boolean;
  step: LocationShareStep;
  label?: string;
  address?: string;
  onShareCurrent: () => void;
  onSend: () => void;
  onCancel: () => void;
};

export default function LocationShareConfirmModal({
  visible,
  step,
  label,
  address,
  onShareCurrent,
  onSend,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.iconWrap}>
            <Ionicons
              name="location-outline"
              size={28}
              color={colors.primary}
            />
          </View>

          <Text style={styles.title}>
            {step === 'confirm'
              ? 'Send this location?'
              : 'Share location'}
          </Text>

          <Text style={styles.body}>
            {step === 'confirm'
              ? 'This is a one-time location share for pickup, meetup or work. Direct Gain will not track you after you send it.'
              : 'Share your current location once in this conversation. Direct Gain will only use location when you choose to send it.'}
          </Text>

          {step === 'loading' ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator
                color={colors.primary}
              />
              <Text style={styles.loadingText}>
                Finding your current location…
              </Text>
            </View>
          ) : null}

          {step === 'confirm' ? (
            <View style={styles.preview}>
              <Text style={styles.previewLabel}>
                {label ?? 'Current location'}
              </Text>
              {address ? (
                <Text style={styles.previewAddress}>
                  {address}
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.actions}>
            {step === 'choose' ? (
              <Pressable
                onPress={onShareCurrent}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  Share current location
                </Text>
              </Pressable>
            ) : null}

            {step === 'confirm' ? (
              <Pressable
                onPress={onSend}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  Send location
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080B09',
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
  },

  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.18)',
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
  },

  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },

  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },

  loadingRow: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  loadingText: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: '700',
  },

  preview: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#111411',
  },

  previewLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },

  previewAddress: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },

  actions: {
    marginTop: 'auto',
    paddingBottom: 24,
    gap: 10,
  },

  primaryButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  primaryButtonText: {
    color: '#080B09',
    fontSize: 16,
    fontWeight: '800',
  },

  cancelButton: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.8,
  },
});
