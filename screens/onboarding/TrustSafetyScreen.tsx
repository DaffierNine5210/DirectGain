import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import type { OnboardingStackParamList } from '../../navigation/OnboardingStack';

type TrustSafetyScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'TrustSafety'
>;

type TrustFeature = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const trustFeatures: TrustFeature[] = [
  {
    id: 'identity',
    title: 'Identity verification',
    description:
      'Optional verification helps people recognise trusted members.',
    icon: 'shield-checkmark-outline',
  },
  {
    id: 'gain-score',
    title: 'Gain Score',
    description:
      'Build your reputation through positive activity and reliable interactions.',
    icon: 'trending-up-outline',
  },
  {
    id: 'messaging',
    title: 'Safer messaging',
    description:
      'Trust signals help you make better decisions before meeting or trading.',
    icon: 'chatbubble-ellipses-outline',
  },
  {
    id: 'reputation',
    title: 'Community reputation',
    description:
      'Reviews and successful activity create a history people can trust.',
    icon: 'people-outline',
  },
  {
    id: 'protection',
    title: 'Scam protection',
    description:
      'Reporting tools and safety systems help identify suspicious activity.',
    icon: 'warning-outline',
  },
  {
    id: 'privacy',
    title: 'Privacy controls',
    description:
      'You decide what information is public and what remains private.',
    icon: 'lock-closed-outline',
  },
];

export default function TrustSafetyScreen({
  navigation,
  route,
}: TrustSafetyScreenProps) {
  const onboardingDetails = route.params;

  const continueSetup = () => {
  navigation.navigate(
    'OnboardingWelcome',
    onboardingDetails,
  );
};


  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={5}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.headingSection}>
        <Text style={styles.eyebrow}>
          TRUST STARTS HERE
        </Text>

        <Text style={styles.title}>
          A safer way to{'\n'}
          <Text style={styles.titleAccent}>
            grow together.
          </Text>
        </Text>

        <Text style={styles.subtitle}>
          Direct Gain is designed around reputation,
          accountability and safer local connections.
        </Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroGlow} />

        <View style={styles.heroIconOuter}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="shield-checkmark"
              size={43}
              color="#080B09"
            />
          </View>
        </View>

        <View style={styles.heroContent}>
          <Text style={styles.heroEyebrow}>
            YOUR DIRECT GAIN TRUST
          </Text>

          <Text style={styles.heroTitle}>
            Build trust from your first interaction
          </Text>

          <Text style={styles.heroDescription}>
            Every successful transaction, completed job,
            positive review and respectful interaction
            strengthens your reputation.
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>
          HOW DIRECT GAIN PROTECTS YOU
        </Text>

        <Text style={styles.sectionCounter}>
          6 SAFETY FEATURES
        </Text>
      </View>

      <View style={styles.featureList}>
        {trustFeatures.map((feature) => (
          <View
            key={feature.id}
            style={styles.featureCard}
          >
            <View style={styles.featureIcon}>
              <Ionicons
                name={feature.icon}
                size={23}
                color="#9EF65A"
              />
            </View>

            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>
                {feature.title}
              </Text>

              <Text style={styles.featureDescription}>
                {feature.description}
              </Text>
            </View>

            <View style={styles.featureCheck}>
              <Ionicons
                name="checkmark"
                size={14}
                color="#080B09"
              />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.reminderCard}>
        <View style={styles.reminderIcon}>
          <Ionicons
            name="information-circle-outline"
            size={23}
            color="#9EF65A"
          />
        </View>

        <View style={styles.reminderContent}>
          <Text style={styles.reminderTitle}>
            Always use good judgement
          </Text>

          <Text style={styles.reminderText}>
            Review profiles, protect personal information
            and report anything that feels suspicious.
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Continue to welcome screen"
        onPress={continueSetup}
        style={({ pressed }) => [
          styles.continueButton,
          pressed && styles.continueButtonPressed,
        ]}
      >
        <View>
          <Text style={styles.continueButtonText}>
            Continue
          </Text>

          <Text style={styles.continueButtonSubtext}>
            Next: welcome to Direct Gain
          </Text>
        </View>

        <View style={styles.continueIcon}>
          <Ionicons
            name="arrow-forward"
            size={23}
            color="#080B09"
          />
        </View>
      </Pressable>

      <View style={styles.securityMessage}>
        <Ionicons
          name="lock-closed-outline"
          size={14}
          color="#9EF65A"
        />

        <Text style={styles.securityMessageText}>
          Your privacy and safety come first.
        </Text>
      </View>
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
    letterSpacing: 2.6,
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

  heroCard: {
    position: 'relative',
    overflow: 'hidden',
    marginTop: 31,
    padding: 20,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B15',
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.32)',
  },

  heroGlow: {
    position: 'absolute',
    top: -80,
    right: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(158, 246, 90, 0.07)',
  },

  heroIconOuter: {
    width: 76,
    height: 76,
    borderRadius: 25,
    padding: 5,
    backgroundColor: 'rgba(158, 246, 90, 0.12)',
  },

  heroIcon: {
    flex: 1,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9EF65A',
  },

  heroContent: {
    flex: 1,
    marginLeft: 16,
  },

  heroEyebrow: {
    color: '#9EF65A',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },

  heroTitle: {
    marginTop: 7,
    color: '#F5F8F5',
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
  },

  heroDescription: {
    marginTop: 8,
    color: '#8E9991',
    fontSize: 12,
    lineHeight: 18,
  },

  sectionHeading: {
    marginTop: 31,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: '#A5AFA7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  sectionCounter: {
    color: '#667169',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  featureList: {
    gap: 11,
  },

  featureCard: {
    minHeight: 96,
    padding: 15,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111713',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(158, 246, 90, 0.09)',
  },

  featureContent: {
    flex: 1,
    marginLeft: 13,
    paddingRight: 8,
  },

  featureTitle: {
    color: '#F0F4F0',
    fontSize: 14,
    fontWeight: '800',
  },

  featureDescription: {
    marginTop: 5,
    color: '#7F8982',
    fontSize: 12,
    lineHeight: 17,
  },

  featureCheck: {
    width: 25,
    height: 25,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9EF65A',
  },

  reminderCard: {
    marginTop: 20,
    padding: 17,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111713',
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.16)',
  },

  reminderIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(158, 246, 90, 0.09)',
  },

  reminderContent: {
    flex: 1,
    marginLeft: 13,
  },

  reminderTitle: {
    color: '#EFF3EF',
    fontSize: 14,
    fontWeight: '800',
  },

  reminderText: {
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

  continueButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },

  continueButtonText: {
    color: '#080B09',
    fontSize: 18,
    fontWeight: '900',
  },

  continueButtonSubtext: {
    marginTop: 3,
    color: 'rgba(8, 11, 9, 0.65)',
    fontSize: 11,
    fontWeight: '700',
  },

  continueIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 11, 9, 0.1)',
  },

  securityMessage: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  securityMessageText: {
    marginLeft: 7,
    color: '#737D76',
    fontSize: 11,
  },
});