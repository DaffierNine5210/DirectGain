import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type OnboardingLayoutProps = {
  children: ReactNode;
  currentStep: number;
  totalSteps?: number;
  onBack?: () => void;
  showBackButton?: boolean;
  scrollEnabled?: boolean;
};

export default function OnboardingLayout({
  children,
  currentStep,
  totalSteps = 5,
  onBack,
  showBackButton = true,
  scrollEnabled = true,
}: OnboardingLayoutProps) {
  const safeCurrentStep = Math.min(
    Math.max(currentStep, 1),
    totalSteps,
  );

  const progressPercentage =
    `${(safeCurrentStep / totalSteps) * 100}%` as `${number}%`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#080B09"
      />

      <View
        pointerEvents="none"
        style={styles.background}
      >
        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />

        <Ionicons
          name="arrow-up"
          size={320}
          color="rgba(158, 246, 90, 0.025)"
          style={styles.backgroundArrow}
        />
      </View>

      <ScrollView
        scrollEnabled={scrollEnabled}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          {showBackButton ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              disabled={!onBack}
              onPress={onBack}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
                !onBack && styles.backButtonDisabled,
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={23}
                color="#F5F8F5"
              />
            </Pressable>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              STEP {safeCurrentStep} OF {totalSteps}
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: progressPercentage,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080B09',
  },

  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },

  topGlow: {
    position: 'absolute',
    top: -160,
    right: -120,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(158, 246, 90, 0.06)',
  },

  bottomGlow: {
    position: 'absolute',
    bottom: -190,
    left: -140,
    width: 370,
    height: 370,
    borderRadius: 185,
    backgroundColor: 'rgba(158, 246, 90, 0.05)',
  },

  backgroundArrow: {
    position: 'absolute',
    top: 220,
    right: -120,
    transform: [{ rotate: '32deg' }],
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 42,
  },

  topBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121713',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  backButtonPressed: {
    opacity: 0.68,
    transform: [{ scale: 0.97 }],
  },

  backButtonDisabled: {
    opacity: 0.45,
  },

  backButtonPlaceholder: {
    width: 48,
    height: 48,
  },

  progressContainer: {
    alignItems: 'flex-end',
  },

  progressText: {
    color: '#8D978F',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
  },

  progressTrack: {
    width: 110,
    height: 4,
    marginTop: 8,
    borderRadius: 2,
    backgroundColor: '#202621',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#9EF65A',
  },
});