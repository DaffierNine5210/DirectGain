import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type {
  AccountType,
  AuthStackParamList,
} from '../../navigation/AuthStack';

type RegisterScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'Register'
>;

type InputFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?:
    | 'email'
    | 'name'
    | 'new-password'
    | 'off';
  keyboardType?: 'default' | 'email-address';
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  passwordVisible?: boolean;
  onTogglePassword?: () => void;
  onChangeText: (value: string) => void;
};

function InputField({
  label,
  value,
  placeholder,
  icon,
  autoCapitalize = 'none',
  autoComplete = 'off',
  keyboardType = 'default',
  secureTextEntry = false,
  showPasswordToggle = false,
  passwordVisible = false,
  onTogglePassword,
  onChangeText,
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
        ]}
      >
        <View style={styles.inputIcon}>
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? '#9EF65A' : '#7F8A82'}
          />
        </View>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#626C65"
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !passwordVisible}
          selectionColor="#9EF65A"
          cursorColor="#9EF65A"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={styles.textInput}
        />

        {showPasswordToggle && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              passwordVisible ? 'Hide password' : 'Show password'
            }
            hitSlop={12}
            onPress={onTogglePassword}
            style={({ pressed }) => [
              styles.passwordButton,
              pressed && styles.passwordButtonPressed,
            ]}
          >
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={21}
              color="#8F9992"
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function RegisterScreen({
  navigation,
  route,
}: RegisterScreenProps) {
  const accountType: AccountType =
    route.params?.accountType ?? 'personal';

  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] =
    useState(false);

  const accountDetails = useMemo(() => {
    if (accountType === 'business') {
      return {
        eyebrow: 'BUSINESS OR PROFESSIONAL',
        title: 'Business account',
        description:
          'Promote your services, connect with clients and grow your trusted presence.',
        icon: 'briefcase' as const,
      };
    }

    return {
      eyebrow: 'FOR EVERYDAY USERS',
      title: 'Personal account',
      description:
        'Buy, sell, find opportunities and build your reputation in the community.',
      icon: 'person' as const,
    };
  }, [accountType]);

  const isFormComplete =
    fullName.trim().length > 1 &&
    emailAddress.trim().length > 3 &&
    password.length >= 8 &&
    confirmPassword.length >= 8;

  const passwordsMatch =
    confirmPassword.length === 0 || password === confirmPassword;

  const canSubmit = isFormComplete && passwordsMatch;

  const handleCreateAccount = () => {
    if (!canSubmit) {
      return;
    }

    // Account creation will be connected to authentication later.
    console.log('Create account', {
      accountType,
      fullName,
      emailAddress,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#080B09"
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View pointerEvents="none" style={styles.background}>
          <View style={styles.topGlow} />
          <View style={styles.bottomGlow} />

          <Ionicons
            name="arrow-up"
            size={300}
            color="rgba(158, 246, 90, 0.025)"
            style={styles.backgroundArrow}
          />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.topBar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={23}
                color="#F5F8F5"
              />
            </Pressable>

            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>STEP 2 OF 3</Text>

              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
            </View>
          </View>

          <View style={styles.headingSection}>
            <Text style={styles.eyebrow}>CREATE YOUR PROFILE</Text>

            <Text style={styles.title}>
              Create your{'\n'}
              <Text style={styles.titleAccent}>Direct Gain account.</Text>
            </Text>

            <Text style={styles.subtitle}>
              Start building your profile, reputation and local network.
            </Text>
          </View>

          <View style={styles.accountCard}>
            <View style={styles.accountCardHighlight} />

            <View style={styles.accountIconOuter}>
              <View style={styles.accountIcon}>
                <Ionicons
                  name={accountDetails.icon}
                  size={25}
                  color="#080B09"
                />
              </View>
            </View>

            <View style={styles.accountText}>
              <Text style={styles.accountEyebrow}>
                {accountDetails.eyebrow}
              </Text>

              <Text style={styles.accountTitle}>
                {accountDetails.title}
              </Text>

              <Text style={styles.accountDescription}>
                {accountDetails.description}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change account type"
              onPress={() => navigation.navigate('ChooseProfile')}
              style={({ pressed }) => [
                styles.changeButton,
                pressed && styles.changeButtonPressed,
              ]}
            >
              <Text style={styles.changeButtonText}>Change</Text>
            </Pressable>
          </View>

          <View style={styles.formSection}>
            <InputField
              label={
                accountType === 'business'
                  ? 'Your full name'
                  : 'Full name'
              }
              value={fullName}
              placeholder="Enter your full name"
              icon="person-outline"
              autoCapitalize="words"
              autoComplete="name"
              onChangeText={setFullName}
            />

            <InputField
              label="Email address"
              value={emailAddress}
              placeholder="Enter your email address"
              icon="mail-outline"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmailAddress}
            />

            <InputField
              label="Password"
              value={password}
              placeholder="Create a password"
              icon="lock-closed-outline"
              autoComplete="new-password"
              secureTextEntry
              showPasswordToggle
              passwordVisible={passwordVisible}
              onTogglePassword={() =>
                setPasswordVisible((current) => !current)
              }
              onChangeText={setPassword}
            />

            <View style={styles.passwordHint}>
              <Ionicons
                name="shield-checkmark-outline"
                size={15}
                color="#9EF65A"
              />
              <Text style={styles.passwordHintText}>
                Use at least 8 characters.
              </Text>
            </View>

            <InputField
              label="Confirm password"
              value={confirmPassword}
              placeholder="Re-enter your password"
              icon="lock-closed-outline"
              autoComplete="new-password"
              secureTextEntry
              showPasswordToggle
              passwordVisible={confirmPasswordVisible}
              onTogglePassword={() =>
                setConfirmPasswordVisible(
                  (current) => !current,
                )
              }
              onChangeText={setConfirmPassword}
            />

            {!passwordsMatch && (
              <View style={styles.errorMessage}>
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color="#FF7777"
                />
                <Text style={styles.errorText}>
                  Your passwords do not match.
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.termsText}>
            By creating an account, you agree to the{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create Direct Gain account"
            disabled={!canSubmit}
            onPress={handleCreateAccount}
            style={({ pressed }) => [
              styles.createButton,
              !canSubmit && styles.createButtonDisabled,
              pressed && canSubmit && styles.createButtonPressed,
            ]}
          >
            <Text
              style={[
                styles.createButtonText,
                !canSubmit && styles.createButtonTextDisabled,
              ]}
            >
              Create account
            </Text>

            <View
              style={[
                styles.createButtonIcon,
                !canSubmit && styles.createButtonIconDisabled,
              ]}
            >
              <Ionicons
                name="arrow-forward"
                size={23}
                color={canSubmit ? '#080B09' : '#687168'}
              />
            </View>
          </Pressable>

          <View style={styles.signInPanel}>
            <Text style={styles.signInQuestion}>
              Already have an account?
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign in to Direct Gain"
              onPress={() => navigation.navigate('Login')}
              style={({ pressed }) => [
                styles.signInButton,
                pressed && styles.signInButtonPressed,
              ]}
            >
              <Text style={styles.signInText}>Sign in</Text>
              <Ionicons
                name="arrow-forward"
                size={17}
                color="#9EF65A"
              />
            </Pressable>
          </View>

          <View style={styles.securityMessage}>
            <Ionicons
              name="lock-closed-outline"
              size={14}
              color="#9EF65A"
            />

            <Text style={styles.securityText}>
              Your information is protected and kept private.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080B09',
  },

  keyboardView: {
    flex: 1,
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
    top: -170,
    right: -130,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(158, 246, 90, 0.055)',
  },

  bottomGlow: {
    position: 'absolute',
    bottom: -180,
    left: -140,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(158, 246, 90, 0.045)',
  },

  backgroundArrow: {
    position: 'absolute',
    top: 180,
    right: -105,
    transform: [{ rotate: '32deg' }],
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 42,
  },

  topBar: {
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
    width: 92,
    height: 4,
    marginTop: 8,
    borderRadius: 2,
    backgroundColor: '#202621',
    overflow: 'hidden',
  },

  progressFill: {
    width: '66%',
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#9EF65A',
  },

  headingSection: {
    marginTop: 40,
  },

  eyebrow: {
    color: '#9EF65A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2.7,
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
    maxWidth: 360,
    marginTop: 18,
    color: '#9AA49D',
    fontSize: 16,
    lineHeight: 24,
  },

  accountCard: {
    minHeight: 136,
    marginTop: 31,
    padding: 17,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131A15',
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.38)',
    overflow: 'hidden',
  },

  accountCardHighlight: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },

  accountIconOuter: {
    width: 58,
    height: 58,
    borderRadius: 20,
    padding: 4,
    backgroundColor: 'rgba(158, 246, 90, 0.12)',
  },

  accountIcon: {
    flex: 1,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9EF65A',
  },

  accountText: {
    flex: 1,
    marginLeft: 14,
    paddingRight: 8,
  },

  accountEyebrow: {
    color: '#9EF65A',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },

  accountTitle: {
    marginTop: 5,
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },

  accountDescription: {
    marginTop: 5,
    color: '#909A93',
    fontSize: 12,
    lineHeight: 17,
  },

  changeButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(158, 246, 90, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.22)',
  },

  changeButtonPressed: {
    opacity: 0.65,
  },

  changeButtonText: {
    color: '#9EF65A',
    fontSize: 11,
    fontWeight: '800',
  },

  formSection: {
    marginTop: 32,
  },

  inputGroup: {
    marginBottom: 19,
  },

  inputLabel: {
    marginBottom: 9,
    color: '#DDE2DE',
    fontSize: 14,
    fontWeight: '700',
  },

  inputContainer: {
    height: 62,
    paddingHorizontal: 14,
    borderRadius: 19,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121713',
    borderWidth: 1,
    borderColor: 'rgba(183, 198, 187, 0.18)',
  },

  inputContainerFocused: {
    borderColor: '#9EF65A',
    backgroundColor: '#151D17',
  },

  inputIcon: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  textInput: {
    flex: 1,
    height: '100%',
    color: '#F7F9F7',
    fontSize: 16,
    fontWeight: '500',
  },

  passwordButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  passwordButtonPressed: {
    opacity: 0.58,
  },

  passwordHint: {
    marginTop: -9,
    marginBottom: 19,
    marginLeft: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },

  passwordHintText: {
    marginLeft: 7,
    color: '#818B84',
    fontSize: 12,
  },

  errorMessage: {
    marginTop: -8,
    marginBottom: 18,
    marginLeft: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },

  errorText: {
    marginLeft: 7,
    color: '#FF8D8D',
    fontSize: 12,
  },

  termsText: {
    color: '#7F8982',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 12,
  },

  termsLink: {
    color: '#B7C2BA',
    fontWeight: '700',
  },

  createButton: {
    height: 70,
    marginTop: 23,
    paddingLeft: 25,
    paddingRight: 9,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#9EF65A',
    borderWidth: 1,
    borderColor: '#D6FFC0',
    shadowColor: '#9EF65A',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.28,
    shadowRadius: 17,
    elevation: 10,
  },

  createButtonDisabled: {
    backgroundColor: '#1B211C',
    borderColor: '#2B332D',
    shadowOpacity: 0,
    elevation: 0,
  },

  createButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },

  createButtonText: {
    color: '#080B09',
    fontSize: 18,
    fontWeight: '900',
  },

  createButtonTextDisabled: {
    color: '#687168',
  },

  createButtonIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 11, 9, 0.11)',
    borderWidth: 1,
    borderColor: 'rgba(8, 11, 9, 0.16)',
  },

  createButtonIconDisabled: {
    backgroundColor: '#222A24',
    borderColor: '#303932',
  },

  signInPanel: {
    marginTop: 18,
    paddingVertical: 17,
    paddingHorizontal: 20,
    borderRadius: 21,
    alignItems: 'center',
    backgroundColor: 'rgba(14, 19, 16, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.16)',
  },

  signInQuestion: {
    color: '#929C95',
    fontSize: 14,
  },

  signInButton: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  signInButtonPressed: {
    opacity: 0.62,
  },

  signInText: {
    marginRight: 7,
    color: '#9EF65A',
    fontSize: 16,
    fontWeight: '800',
  },

  securityMessage: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  securityText: {
    marginLeft: 7,
    color: '#737D76',
    fontSize: 11,
  },
});