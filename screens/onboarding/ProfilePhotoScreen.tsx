import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import type { OnboardingStackParamList } from '../../navigation/OnboardingStack';

type ProfilePhotoScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'ProfilePhoto'
>;

export default function ProfilePhotoScreen({
  navigation,
}: ProfilePhotoScreenProps) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const choosePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Photo access needed',
          'Direct Gain needs permission to access your photos so you can choose a profile picture.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Unable to choose profile photo:', error);

      Alert.alert(
        'Unable to open photos',
        'Something went wrong while opening your photo library. Please try again.',
      );
    }
  };

  const removePhoto = () => {
    setPhotoUri(null);
  };

  
    const continueSetup = () => {
  navigation.navigate('ProfileDetails', {
    photoUri,
  });

  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={5}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.headingSection}>
        <Text style={styles.eyebrow}>
          BUILD YOUR PROFILE
        </Text>

        <Text style={styles.title}>
          Put a face to{'\n'}
          <Text style={styles.titleAccent}>
            your reputation.
          </Text>
        </Text>

        <Text style={styles.subtitle}>
          A profile photo helps people recognise you and makes every
          interaction feel more trustworthy.
        </Text>
      </View>

      <View style={styles.photoSection}>
        <View style={styles.photoGlow} />

        <View style={styles.photoOuter}>
          <View style={styles.photoContainer}>
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={styles.profilePhoto}
              />
            ) : (
              <>
                <View style={styles.placeholderIcon}>
                  <Ionicons
                    name="person"
                    size={74}
                    color="#9EF65A"
                  />
                </View>

                <Text style={styles.placeholderText}>
                  Your photo
                </Text>
              </>
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose profile photo"
            onPress={choosePhoto}
            style={({ pressed }) => [
              styles.cameraButton,
              pressed && styles.cameraButtonPressed,
            ]}
          >
            <Ionicons
              name="camera"
              size={23}
              color="#080B09"
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.trustCard}>
        <View style={styles.trustIcon}>
          <Ionicons
            name="shield-checkmark"
            size={25}
            color="#9EF65A"
          />
        </View>

        <View style={styles.trustText}>
          <Text style={styles.trustTitle}>
            Build trust from day one
          </Text>

          <Text style={styles.trustDescription}>
            Profiles with clear photos feel more genuine and help
            create safer local connections.
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          photoUri
            ? 'Change profile photo'
            : 'Add profile photo'
        }
        onPress={choosePhoto}
        style={({ pressed }) => [
          styles.photoButton,
          pressed && styles.photoButtonPressed,
        ]}
      >
        <Ionicons
          name={
            photoUri
              ? 'image-outline'
              : 'add-circle-outline'
          }
          size={22}
          color="#080B09"
        />

        <Text style={styles.photoButtonText}>
          {photoUri
            ? 'Change photo'
            : 'Add profile photo'}
        </Text>
      </Pressable>

      {photoUri && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remove profile photo"
          onPress={removePhoto}
          style={({ pressed }) => [
            styles.removeButton,
            pressed && styles.removeButtonPressed,
          ]}
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color="#FF9292"
          />

          <Text style={styles.removeButtonText}>
            Remove photo
          </Text>
        </Pressable>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Continue profile setup"
        onPress={continueSetup}
        style={({ pressed }) => [
          styles.continueButton,
          pressed && styles.continueButtonPressed,
        ]}
      >
        <Text style={styles.continueButtonText}>
          Continue
        </Text>

        <View style={styles.continueIcon}>
          <Ionicons
            name="arrow-forward"
            size={23}
            color="#080B09"
          />
        </View>
      </Pressable>

      {!photoUri && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip profile photo for now"
          onPress={continueSetup}
          style={({ pressed }) => [
            styles.skipButton,
            pressed && styles.skipButtonPressed,
          ]}
        >
          <Text style={styles.skipButtonText}>
            Skip for now
          </Text>
        </Pressable>
      )}

      <View style={styles.privacyMessage}>
        <Ionicons
          name="lock-closed-outline"
          size={14}
          color="#9EF65A"
        />

        <Text style={styles.privacyText}>
          You can change your photo at any time.
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

  photoSection: {
    marginTop: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoGlow: {
    position: 'absolute',
    width: 235,
    height: 235,
    borderRadius: 118,
    backgroundColor: 'rgba(158, 246, 90, 0.12)',
  },

  photoOuter: {
    width: 210,
    height: 210,
    borderRadius: 105,
    padding: 6,
    backgroundColor: '#182019',
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.45)',
    shadowColor: '#9EF65A',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 12,
  },

  photoContainer: {
    flex: 1,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111713',
    overflow: 'hidden',
  },

  profilePhoto: {
    width: '100%',
    height: '100%',
  },

  placeholderIcon: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(158, 246, 90, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.22)',
  },

  placeholderText: {
    marginTop: 12,
    color: '#8D978F',
    fontSize: 13,
    fontWeight: '700',
  },

  cameraButton: {
    position: 'absolute',
    right: 5,
    bottom: 13,
    width: 54,
    height: 54,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9EF65A',
    borderWidth: 3,
    borderColor: '#080B09',
  },

  cameraButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },

  trustCard: {
    marginTop: 35,
    padding: 17,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121914',
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.2)',
  },

  trustIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(158, 246, 90, 0.09)',
  },

  trustText: {
    flex: 1,
    marginLeft: 14,
  },

  trustTitle: {
    color: '#F5F8F5',
    fontSize: 16,
    fontWeight: '800',
  },

  trustDescription: {
    marginTop: 5,
    color: '#8F9992',
    fontSize: 13,
    lineHeight: 19,
  },

  photoButton: {
    height: 64,
    marginTop: 25,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9EF65A',
    borderWidth: 1,
    borderColor: '#D6FFC0',
  },

  photoButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },

  photoButtonText: {
    marginLeft: 9,
    color: '#080B09',
    fontSize: 17,
    fontWeight: '900',
  },

  removeButton: {
    height: 48,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  removeButtonPressed: {
    opacity: 0.6,
  },

  removeButtonText: {
    marginLeft: 7,
    color: '#FF9292',
    fontSize: 14,
    fontWeight: '700',
  },

  continueButton: {
    height: 70,
    marginTop: 18,
    paddingLeft: 25,
    paddingRight: 9,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F8F5',
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

  continueIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 11, 9, 0.1)',
  },

  skipButton: {
    alignSelf: 'center',
    marginTop: 13,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  skipButtonPressed: {
    opacity: 0.6,
  },

  skipButtonText: {
    color: '#929C95',
    fontSize: 14,
    fontWeight: '700',
  },

  privacyMessage: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  privacyText: {
    marginLeft: 7,
    color: '#737D76',
    fontSize: 11,
  },
});