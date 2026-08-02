import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import type { OnboardingStackParamList } from '../../navigation/OnboardingStack';

type InterestsScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'Interests'
>;

type Interest = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const MINIMUM_INTERESTS = 3;
const MAXIMUM_INTERESTS = 8;

const interests: Interest[] = [
  {
    id: 'buying',
    label: 'Buying',
    icon: 'bag-handle-outline',
  },
  {
    id: 'selling',
    label: 'Selling',
    icon: 'pricetag-outline',
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: 'briefcase-outline',
  },
  {
    id: 'services',
    label: 'Services',
    icon: 'construct-outline',
  },
  {
    id: 'vehicles',
    label: 'Vehicles',
    icon: 'car-sport-outline',
  },
  {
    id: 'motorbikes',
    label: 'Motorbikes',
    icon: 'bicycle-outline',
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: 'hammer-outline',
  },
  {
    id: 'farming',
    label: 'Farming',
    icon: 'leaf-outline',
  },
  {
    id: 'fishing',
    label: 'Fishing',
    icon: 'fish-outline',
  },
  {
    id: 'camping',
    label: 'Camping',
    icon: 'bonfire-outline',
  },
  {
    id: 'electronics',
    label: 'Electronics',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'gaming',
    label: 'Gaming',
    icon: 'game-controller-outline',
  },
  {
    id: 'sport',
    label: 'Sport',
    icon: 'football-outline',
  },
  {
    id: 'community',
    label: 'Community',
    icon: 'people-outline',
  },
  {
    id: 'business',
    label: 'Business',
    icon: 'business-outline',
  },
  {
    id: 'property',
    label: 'Property',
    icon: 'home-outline',
  },
  {
    id: 'collectables',
    label: 'Collectables',
    icon: 'diamond-outline',
  },
  {
    id: 'pets',
    label: 'Pets',
    icon: 'paw-outline',
  },
];

export default function InterestsScreen({
  navigation,
  route,
}: InterestsScreenProps) {
  const profileDetails = route.params;

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const canContinue =
    selectedInterests.length >= MINIMUM_INTERESTS;

  const selectionMessage = useMemo(() => {
    if (selectedInterests.length === 0) {
      return `Choose at least ${MINIMUM_INTERESTS} interests.`;
    }

    if (selectedInterests.length < MINIMUM_INTERESTS) {
      const remaining =
        MINIMUM_INTERESTS - selectedInterests.length;

      return `Choose ${remaining} more ${
        remaining === 1 ? 'interest' : 'interests'
      }.`;
    }

    return `${selectedInterests.length} selected`;
  }, [selectedInterests]);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((currentInterests) => {
      const isSelected =
        currentInterests.includes(interestId);

      if (isSelected) {
        return currentInterests.filter(
          (currentId) => currentId !== interestId,
        );
      }

      if (
        currentInterests.length >= MAXIMUM_INTERESTS
      ) {
        return currentInterests;
      }

      return [...currentInterests, interestId];
    });
  };
const continueSetup = () => {
  console.log('Continue button pressed');

  if (!canContinue) {
    return;
  }

  navigation.navigate('TrustSafety', {
    ...profileDetails,
    interests: selectedInterests,
  });
};



  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={5}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.headingSection}>
        <Text style={styles.eyebrow}>
          PERSONALISE YOUR EXPERIENCE
        </Text>

        <Text style={styles.title}>
          What brings you to{'\n'}
          <Text style={styles.titleAccent}>
            Direct Gain?
          </Text>
        </Text>

        <Text style={styles.subtitle}>
          Choose the things you care about and we’ll
          personalise your local feed from day one.
        </Text>
      </View>

      <View style={styles.selectionSummary}>
        <View style={styles.selectionIcon}>
          <Ionicons
            name={
              canContinue
                ? 'checkmark-circle'
                : 'options-outline'
            }
            size={19}
            color="#9EF65A"
          />
        </View>

        <View style={styles.selectionTextContainer}>
          <Text style={styles.selectionTitle}>
            Choose 3 to 8 interests
          </Text>

          <Text style={styles.selectionText}>
            {selectionMessage}
          </Text>
        </View>

        <Text style={styles.selectionCount}>
          {selectedInterests.length}/{MAXIMUM_INTERESTS}
        </Text>
      </View>

      <View style={styles.interestsGrid}>
        {interests.map((interest) => {
          const isSelected =
            selectedInterests.includes(interest.id);

          return (
            <Pressable
              key={interest.id}
              accessibilityRole="checkbox"
              accessibilityLabel={interest.label}
              accessibilityState={{
                checked: isSelected
              }}
              onPress={() =>
                toggleInterest(interest.id)
              }
              style={({ pressed }) => [
                styles.interestCard,
                isSelected &&
                  styles.interestCardSelected,
                pressed &&
                  styles.interestCardPressed,
              ]}
            >
              <View
                style={[
                  styles.interestIcon,
                  isSelected &&
                    styles.interestIconSelected,
                ]}
              >
                <Ionicons
                  name={interest.icon}
                  size={22}
                  color={
                    isSelected
                      ? '#080B09'
                      : '#9EF65A'
                  }
                />
              </View>

              <Text
                style={[
                  styles.interestLabel,
                  isSelected &&
                    styles.interestLabelSelected,
                ]}
              >
                {interest.label}
              </Text>

              <View
                style={[
                  styles.selectionIndicator,
                  isSelected &&
                    styles.selectionIndicatorSelected,
                ]}
              >
                {isSelected ? (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color="#080B09"
                  />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.feedMessage}>
        <View style={styles.feedMessageIcon}>
          <Ionicons
            name="sparkles-outline"
            size={21}
            color="#9EF65A"
          />
        </View>

        <View style={styles.feedMessageContent}>
          <Text style={styles.feedMessageTitle}>
            Your feed will grow with you
          </Text>

          <Text style={styles.feedMessageText}>
            You can update these interests whenever you
            like from your profile settings.
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Continue to trust and safety"
        accessibilityState={{
          disabled: !canContinue,
        }}
        disabled={!canContinue}
        onPress={continueSetup}
        style={({ pressed }) => [
          styles.continueButton,
          !canContinue &&
            styles.continueButtonDisabled,
          pressed &&
            canContinue &&
            styles.continueButtonPressed,
        ]}
      >
        <View>
          <Text
            style={[
              styles.continueButtonText,
              !canContinue &&
                styles.continueButtonTextDisabled,
            ]}
          >
            Continue
          </Text>

          <Text
            style={[
              styles.continueButtonSubtext,
              !canContinue &&
                styles.continueButtonSubtextDisabled,
            ]}
          >
            Next: trust and safety
          </Text>
        </View>

        <View
          style={[
            styles.continueIcon,
            !canContinue &&
              styles.continueIconDisabled,
          ]}
        >
          <Ionicons
            name="arrow-forward"
            size={23}
            color={
              canContinue
                ? '#080B09'
                : '#59625C'
            }
          />
        </View>
      </Pressable>

      {!canContinue ? (
        <Text style={styles.requiredMessage}>
          {selectionMessage}
        </Text>
      ) : null}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  headingSection: {
    marginTop: 40,
  },

  eyebrow: {
    color: '#9EF65A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2.5,
  },

  title: {
    marginTop: 15,
    color: '#F7F9F7',
    fontSize: 42,
    lineHeight: 47,
    fontWeight: '900',
    letterSpacing: -1.4,
  },

  titleAccent: {
    color: '#9EF65A',
  },

  subtitle: {
    maxWidth: 390,
    marginTop: 18,
    color: '#9AA49D',
    fontSize: 16,
    lineHeight: 24,
  },

  selectionSummary: {
    minHeight: 78,
    marginTop: 31,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121914',
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.23)',
  },

  selectionIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(158, 246, 90, 0.1)',
  },

  selectionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  selectionTitle: {
    color: '#F3F6F3',
    fontSize: 14,
    fontWeight: '800',
  },

  selectionText: {
    marginTop: 4,
    color: '#818B84',
    fontSize: 11,
  },

  selectionCount: {
    color: '#9EF65A',
    fontSize: 13,
    fontWeight: '900',
  },

  interestsGrid: {
    marginTop: 25,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  interestCard: {
    position: 'relative',
    width: '48.5%',
    minHeight: 112,
    marginBottom: 12,
    padding: 14,
    borderRadius: 21,
    backgroundColor: '#111713',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  interestCardSelected: {
    backgroundColor: '#172117',
    borderColor: '#9EF65A',
  },

  interestCardPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },

  interestIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(158, 246, 90, 0.09)',
  },

  interestIconSelected: {
    backgroundColor: '#9EF65A',
  },

  interestLabel: {
    marginTop: 13,
    color: '#D6DDD8',
    fontSize: 14,
    fontWeight: '800',
  },

  interestLabelSelected: {
    color: '#FFFFFF',
  },

  selectionIndicator: {
    position: 'absolute',
    top: 13,
    right: 13,
    width: 22,
    height: 22,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#343D36',
  },

  selectionIndicatorSelected: {
    backgroundColor: '#9EF65A',
    borderColor: '#9EF65A',
  },

  feedMessage: {
    marginTop: 16,
    padding: 17,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111713',
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.15)',
  },

  feedMessageIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(158, 246, 90, 0.09)',
  },

  feedMessageContent: {
    flex: 1,
    marginLeft: 13,
  },

  feedMessageTitle: {
    color: '#EFF3EF',
    fontSize: 14,
    fontWeight: '800',
  },

  feedMessageText: {
    marginTop: 4,
    color: '#808A83',
    fontSize: 12,
    lineHeight: 18,
  },

  continueButton: {
    minHeight: 72,
    marginTop: 27,
    paddingLeft: 23,
    paddingRight: 10,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#9EF65A',
    borderWidth: 1,
    borderColor: '#D6FFC0',
  },

  continueButtonDisabled: {
    backgroundColor: '#171D18',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  continueButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },

  continueButtonText: {
    color: '#080B09',
    fontSize: 18,
    fontWeight: '900',
  },

  continueButtonTextDisabled: {
    color: '#626C65',
  },

  continueButtonSubtext: {
    marginTop: 3,
    color: 'rgba(8, 11, 9, 0.65)',
    fontSize: 11,
    fontWeight: '700',
  },

  continueButtonSubtextDisabled: {
    color: '#4F5852',
  },

  continueIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 11, 9, 0.1)',
  },

  continueIconDisabled: {
    backgroundColor: '#202721',
  },

  requiredMessage: {
    marginTop: 13,
    textAlign: 'center',
    color: '#707A73',
    fontSize: 11,
  },
});