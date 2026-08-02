import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import type { OnboardingStackParamList } from '../../navigation/OnboardingStack';

type ProfileDetailsScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'ProfileDetails'
>;

const BIO_LIMIT = 160;
const USERNAME_LIMIT = 24;

export default function ProfileDetailsScreen({
  navigation,
  route,
}: ProfileDetailsScreenProps) {
  const { photoUri } = route.params;

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

  const usernamePreview = username
    ? `@${username}`
    : '@yourusername';

  const profileName = displayName.trim() || 'Your name';

  const profileBio =
    bio.trim() ||
    'Tell the Direct Gain community a little about yourself.';

  const profileLocation =
    location.trim() || 'Your suburb or city';

  const canContinue = useMemo(() => {
    return (
      displayName.trim().length >= 2 &&
      username.trim().length >= 3 &&
      location.trim().length >= 2
    );
  }, [displayName, username, location]);

  const handleUsernameChange = (value: string) => {
    const formattedUsername = value
      .toLowerCase()
      .replace(/^@/, '')
      .replace(/[^a-z0-9._]/g, '')
      .slice(0, USERNAME_LIMIT);

    setUsername(formattedUsername);
  };

  const continueSetup = () => {
  if (!canContinue) {
    return;
  }

  navigation.navigate('Interests', {
    photoUri,
    displayName: displayName.trim(),
    username: username.trim(),
    bio: bio.trim(),
    location: location.trim(),
  });


    const profileDetails = {
      photoUri,
      displayName: displayName.trim(),
      username: username.trim(),
      bio: bio.trim(),
      location: location.trim(),
    };

    // The Interests screen will be connected in the next milestone.
    console.log('Profile details complete:', profileDetails);
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={5}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.headingSection}>
        <Text style={styles.eyebrow}>
          YOUR IDENTITY
        </Text>

        <Text style={styles.title}>
          Make your profile{'\n'}
          <Text style={styles.titleAccent}>
            feel like you.
          </Text>
        </Text>

        <Text style={styles.subtitle}>
          Add the details people will see when they discover,
          message, hire, buy from, or sell to you.
        </Text>
      </View>

      <View style={styles.previewSection}>
        <View style={styles.previewLabelRow}>
          <View style={styles.previewLabelIcon}>
            <Ionicons
              name="eye-outline"
              size={16}
              color="#9EF65A"
            />
          </View>

          <Text style={styles.previewLabel}>
            LIVE PROFILE PREVIEW
          </Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileCardGlow} />

          <View style={styles.profileHeader}>
            <View style={styles.avatarOuter}>
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons
                    name="person"
                    size={35}
                    color="#9EF65A"
                  />
                </View>
              )}

              <View style={styles.onlineIndicator} />
            </View>

            <View style={styles.profileIdentity}>
              <View style={styles.nameRow}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.profileName,
                    !displayName.trim() &&
                      styles.previewPlaceholderText,
                  ]}
                >
                  {profileName}
                </Text>

                <Ionicons
                  name="shield-checkmark"
                  size={17}
                  color="#9EF65A"
                  style={styles.profileBadge}
                />
              </View>

              <Text
                numberOfLines={1}
                style={[
                  styles.profileUsername,
                  !username && styles.previewPlaceholderText,
                ]}
              >
                {usernamePreview}
              </Text>
            </View>

            <View style={styles.gainScore}>
              <Ionicons
                name="trending-up"
                size={14}
                color="#080B09"
              />

              <Text style={styles.gainScoreText}>
                NEW
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.profileBio,
              !bio.trim() && styles.previewPlaceholderText,
            ]}
          >
            {profileBio}
          </Text>

          <View style={styles.profileFooter}>
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={17}
                color="#9EF65A"
              />

              <Text
                numberOfLines={1}
                style={[
                  styles.profileLocation,
                  !location.trim() &&
                    styles.previewPlaceholderText,
                ]}
              >
                {profileLocation}
              </Text>
            </View>

            <View style={styles.profileType}>
              <Ionicons
                name="person-outline"
                size={14}
                color="#A5AEA7"
              />

              <Text style={styles.profileTypeText}>
                Personal
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            DISPLAY NAME
          </Text>

          <View
            style={[
              styles.inputContainer,
              displayName.trim() && styles.inputContainerActive,
            ]}
          >
            <Ionicons
              name="person-outline"
              size={21}
              color={
                displayName.trim()
                  ? '#9EF65A'
                  : '#758078'
              }
            />

            <TextInput
              accessibilityLabel="Display name"
              autoCapitalize="words"
              autoComplete="name"
              maxLength={50}
              onChangeText={setDisplayName}
              placeholder="Your full name"
              placeholderTextColor="#59625C"
              returnKeyType="next"
              selectionColor="#9EF65A"
              style={styles.textInput}
              value={displayName}
            />
          </View>

          <Text style={styles.helperText}>
            This is the name people will recognise you by.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>
              USERNAME
            </Text>

            <Text style={styles.characterCount}>
              {username.length}/{USERNAME_LIMIT}
            </Text>
          </View>

          <View
            style={[
              styles.inputContainer,
              username && styles.inputContainerActive,
            ]}
          >
            <Text
              style={[
                styles.usernamePrefix,
                username && styles.usernamePrefixActive,
              ]}
            >
              @
            </Text>

            <TextInput
              accessibilityLabel="Username"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={USERNAME_LIMIT}
              onChangeText={handleUsernameChange}
              placeholder="yourusername"
              placeholderTextColor="#59625C"
              returnKeyType="next"
              selectionColor="#9EF65A"
              style={styles.textInput}
              value={username}
            />
          </View>

          <View style={styles.usernameHint}>
            <Ionicons
              name="information-circle-outline"
              size={15}
              color="#747E77"
            />

            <Text style={styles.usernameHintText}>
              Letters, numbers, full stops and underscores only.
            </Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>
              BIO
            </Text>

            <Text style={styles.characterCount}>
              {bio.length}/{BIO_LIMIT}
            </Text>
          </View>

          <View
            style={[
              styles.bioContainer,
              bio.trim() && styles.inputContainerActive,
            ]}
          >
            <TextInput
              accessibilityLabel="Profile bio"
              maxLength={BIO_LIMIT}
              multiline
              onChangeText={setBio}
              placeholder="Share what you do, what you enjoy or what brings you to Direct Gain..."
              placeholderTextColor="#59625C"
              selectionColor="#9EF65A"
              style={styles.bioInput}
              textAlignVertical="top"
              value={bio}
            />
          </View>

          <Text style={styles.optionalText}>
            Optional, but recommended.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            SUBURB OR CITY
          </Text>

          <View
            style={[
              styles.inputContainer,
              location.trim() && styles.inputContainerActive,
            ]}
          >
            <Ionicons
              name="location-outline"
              size={21}
              color={
                location.trim()
                  ? '#9EF65A'
                  : '#758078'
              }
            />

            <TextInput
              accessibilityLabel="Suburb or city"
              autoCapitalize="words"
              maxLength={60}
              onChangeText={setLocation}
              placeholder="For example, Mackay QLD"
              placeholderTextColor="#59625C"
              returnKeyType="done"
              selectionColor="#9EF65A"
              style={styles.textInput}
              value={location}
            />
          </View>

          <View style={styles.locationPrivacy}>
            <Ionicons
              name="lock-closed-outline"
              size={14}
              color="#9EF65A"
            />

            <Text style={styles.locationPrivacyText}>
              Your exact address is never shown publicly.
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Continue to interests"
        accessibilityState={{
          disabled: !canContinue,
        }}
        disabled={!canContinue}
        onPress={continueSetup}
        style={({ pressed }) => [
          styles.continueButton,
          !canContinue && styles.continueButtonDisabled,
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
            Next: choose your interests
          </Text>
        </View>

        <View
          style={[
            styles.continueIcon,
            !canContinue && styles.continueIconDisabled,
          ]}
        >
          <Ionicons
            name="arrow-forward"
            size={23}
            color={canContinue ? '#080B09' : '#59625C'}
          />
        </View>
      </Pressable>

      {!canContinue && (
        <Text style={styles.requiredMessage}>
          Add your name, username and location to continue.
        </Text>
      )}
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

  previewSection: {
    marginTop: 34,
  },

  previewLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  previewLabelIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(158, 246, 90, 0.09)',
  },

  previewLabel: {
    marginLeft: 9,
    color: '#8F9992',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.7,
  },

  profileCard: {
    position: 'relative',
    overflow: 'hidden',
    padding: 19,
    borderRadius: 25,
    backgroundColor: '#121914',
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.25)',
    shadowColor: '#9EF65A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },

  profileCardGlow: {
    position: 'absolute',
    top: -80,
    right: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(158, 246, 90, 0.055)',
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarOuter: {
    position: 'relative',
    width: 64,
    height: 64,
    borderRadius: 22,
    padding: 3,
    backgroundColor: '#1B241D',
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.35)',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },

  avatarPlaceholder: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
  },

  onlineIndicator: {
    position: 'absolute',
    right: -2,
    bottom: 1,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#9EF65A',
    borderWidth: 3,
    borderColor: '#121914',
  },

  profileIdentity: {
    flex: 1,
    marginLeft: 13,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileName: {
    flexShrink: 1,
    color: '#F5F8F5',
    fontSize: 18,
    fontWeight: '900',
  },

  profileBadge: {
    marginLeft: 6,
  },

  profileUsername: {
    marginTop: 4,
    color: '#9EF65A',
    fontSize: 13,
    fontWeight: '700',
  },

  previewPlaceholderText: {
    color: '#6E7871',
  },

  gainScore: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9EF65A',
  },

  gainScoreText: {
    marginLeft: 4,
    color: '#080B09',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  profileBio: {
    marginTop: 17,
    color: '#C7CEC9',
    fontSize: 14,
    lineHeight: 21,
  },

  profileFooter: {
    marginTop: 17,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  locationRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileLocation: {
    flex: 1,
    marginLeft: 6,
    color: '#A7B0A9',
    fontSize: 12,
    fontWeight: '700',
  },

  profileType: {
    marginLeft: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A211C',
  },

  profileTypeText: {
    marginLeft: 4,
    color: '#A5AEA7',
    fontSize: 10,
    fontWeight: '700',
  },

  formSection: {
    marginTop: 31,
  },

  inputGroup: {
    marginBottom: 23,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  inputLabel: {
    marginBottom: 10,
    color: '#A3ADA5',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  characterCount: {
    marginBottom: 10,
    color: '#677169',
    fontSize: 10,
    fontWeight: '700',
  },

  inputContainer: {
    height: 61,
    paddingHorizontal: 17,
    borderRadius: 19,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111713',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },

  inputContainerActive: {
    borderColor: 'rgba(158, 246, 90, 0.38)',
    backgroundColor: '#121A14',
  },

  textInput: {
    flex: 1,
    height: '100%',
    marginLeft: 12,
    color: '#F5F8F5',
    fontSize: 16,
    fontWeight: '600',
  },

  usernamePrefix: {
    color: '#758078',
    fontSize: 17,
    fontWeight: '800',
  },

  usernamePrefixActive: {
    color: '#9EF65A',
  },

  helperText: {
    marginTop: 8,
    marginLeft: 4,
    color: '#68726B',
    fontSize: 11,
    lineHeight: 16,
  },

  usernameHint: {
    marginTop: 8,
    marginLeft: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },

  usernameHintText: {
    marginLeft: 5,
    color: '#68726B',
    fontSize: 11,
  },

  bioContainer: {
    minHeight: 132,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 19,
    backgroundColor: '#111713',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },

  bioInput: {
    minHeight: 101,
    color: '#F5F8F5',
    fontSize: 15,
    lineHeight: 22,
  },

  optionalText: {
    marginTop: 8,
    marginLeft: 4,
    color: '#68726B',
    fontSize: 11,
  },

  locationPrivacy: {
    marginTop: 9,
    marginLeft: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationPrivacyText: {
    marginLeft: 6,
    color: '#68726B',
    fontSize: 11,
  },

  continueButton: {
    minHeight: 72,
    marginTop: 5,
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