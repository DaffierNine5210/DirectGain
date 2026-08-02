import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { OnboardingStackParamList } from '../../navigation/OnboardingStack';
import { AuthContext } from '../../providers/AuthProvider';

type OnboardingWelcomeScreenProps =
  NativeStackScreenProps<
    OnboardingStackParamList,
    'OnboardingWelcome'
  >;

type SuccessItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  delay: number;
};

function SuccessItem({
  icon,
  label,
  delay,
}: SuccessItemProps) {
  const entrance =
    useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 430,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay, entrance]);

  return (
    <Animated.View
      style={[
        styles.successItem,
        {
          opacity: entrance,

          transform: [
            {
              translateY:
                entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [14, 0],
                }),
            },
          ],
        },
      ]}
    >
      <View style={styles.successIcon}>
        <Ionicons
          name={icon}
          size={18}
          color="#080B09"
        />
      </View>

      <Text style={styles.successLabel}>
        {label}
      </Text>

      <Ionicons
        name="checkmark-circle"
        size={21}
        color="#9EF65A"
      />
    </Animated.View>
  );
}

export default function OnboardingWelcomeScreen({
  route,
}: OnboardingWelcomeScreenProps) {
  const {
    session,
    completeOnboarding,
  } = useContext(AuthContext);

  const { displayName } = route.params;

  const [isEnteringApp, setIsEnteringApp] =
    useState(false);

  const [entryError, setEntryError] =
    useState<string | null>(null);

  const logoEntrance =
    useRef(new Animated.Value(0)).current;

  const logoGlow =
    useRef(new Animated.Value(0)).current;

  const contentEntrance =
    useRef(new Animated.Value(0)).current;

  const buttonEntrance =
    useRef(new Animated.Value(0)).current;

  const buttonScale =
    useRef(new Animated.Value(1)).current;

  const firstName =
    displayName.trim().split(/\s+/)[0] ||
    'there';

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoEntrance, {
        toValue: 1,
        speed: 9,
        bounciness: 7,
        useNativeDriver: true,
      }),

      Animated.parallel([
        Animated.timing(
          contentEntrance,
          {
            toValue: 1,
            duration: 520,
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          buttonEntrance,
          {
            toValue: 1,
            duration: 480,
            delay: 220,
            useNativeDriver: true,
          },
        ),
      ]),
    ]).start();

    const glowAnimation =
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoGlow, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),

          Animated.timing(logoGlow, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      );

    glowAnimation.start();

    return () => {
      glowAnimation.stop();
    };
  }, [
    buttonEntrance,
    contentEntrance,
    logoEntrance,
    logoGlow,
  ]);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.98,
      speed: 30,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      speed: 24,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  const enterDirectGain = () => {
    if (isEnteringApp) {
      return;
    }

    setEntryError(null);

    if (!session) {
      setEntryError(
        'Your account session is not active. Please return to sign in and try again.',
      );

      return;
    }

    setIsEnteringApp(true);

    Animated.parallel([
      Animated.timing(
        contentEntrance,
        {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        },
      ),

      Animated.timing(
        buttonEntrance,
        {
          toValue: 0,
          duration: 210,
          useNativeDriver: true,
        },
      ),

      Animated.timing(
        logoEntrance,
        {
          toValue: 0.86,
          duration: 260,
          useNativeDriver: true,
        },
      ),
    ]).start(() => {
      completeOnboarding();
    });
  };

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
          size={430}
          color="rgba(158, 246, 90, 0.026)"
          style={styles.backgroundArrow}
        />

        <View style={styles.energyLineOne} />
        <View style={styles.energyLineTwo} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: logoEntrance,

              transform: [
                {
                  scale:
                    logoEntrance.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.75, 1],
                    }),
                },

                {
                  translateY:
                    logoEntrance.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.logoGlow,
              {
                opacity:
                  logoGlow.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, 0.65],
                  }),

                transform: [
                  {
                    scale:
                      logoGlow.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.94, 1.08],
                      }),
                  },
                ],
              },
            ]}
          />

          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/direct-gain-logo.png')}
              resizeMode="contain"
              style={styles.logo}
            />
          </View>

          <Text style={styles.brandName}>
            DIRECT GAIN
          </Text>

          <Text style={styles.slogan}>
            Grow Together
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.welcomeContent,
            {
              opacity: contentEntrance,

              transform: [
                {
                  translateY:
                    contentEntrance.interpolate({
                      inputRange: [0, 1],
                      outputRange: [22, 0],
                    }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.eyebrow}>
            YOU’RE READY
          </Text>

          <Text style={styles.title}>
            Welcome, {firstName}.{'\n'}

            <Text style={styles.titleAccent}>
              Your journey starts here.
            </Text>
          </Text>

          <Text style={styles.subtitle}>
            Your profile is ready and your
            Direct Gain experience has been
            personalised for you.
          </Text>

          <View style={styles.successPanel}>
            <View
              style={styles.successPanelHeader}
            >
              <View
                style={styles.successPanelIcon}
              >
                <Ionicons
                  name="sparkles"
                  size={20}
                  color="#080B09"
                />
              </View>

              <View
                style={
                  styles.successPanelHeaderText
                }
              >
                <Text
                  style={
                    styles.successPanelTitle
                  }
                >
                  Setup complete
                </Text>

                <Text
                  style={
                    styles.successPanelSubtitle
                  }
                >
                  Everything is ready to go
                </Text>
              </View>
            </View>

            <SuccessItem
              icon="person-outline"
              label="Profile created"
              delay={500}
            />

            <SuccessItem
              icon="options-outline"
              label="Interests personalised"
              delay={630}
            />

            <SuccessItem
              icon="shield-checkmark-outline"
              label="Trust and safety introduced"
              delay={760}
            />

            <SuccessItem
              icon="rocket-outline"
              label="Ready to explore"
              delay={890}
            />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.actionSection,
            {
              opacity: buttonEntrance,

              transform: [
                {
                  translateY:
                    buttonEntrance.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                },

                {
                  scale: buttonScale,
                },
              ],
            },
          ]}
        >
          {entryError ? (
            <View style={styles.errorCard}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color="#FF7777"
              />

              <Text style={styles.errorText}>
                {entryError}
              </Text>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enter Direct Gain"
            disabled={isEnteringApp}
            onPress={enterDirectGain}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={({ pressed }) => [
              styles.enterButton,
              pressed &&
                styles.enterButtonPressed,
              isEnteringApp &&
                styles.enterButtonDisabled,
            ]}
          >
            <View style={styles.enterButtonCopy}>
              <Text
                style={styles.enterButtonText}
              >
                {isEnteringApp
                  ? 'Entering Direct Gain...'
                  : 'Enter Direct Gain'}
              </Text>

              <Text
                style={styles.enterButtonSubtext}
              >
                Your marketplace. Your
                opportunities.
              </Text>
            </View>

            <View style={styles.enterButtonIcon}>
              {isEnteringApp ? (
                <ActivityIndicator
                  size="small"
                  color="#080B09"
                />
              ) : (
                <Ionicons
                  name="arrow-forward"
                  size={25}
                  color="#080B09"
                />
              )}
            </View>
          </Pressable>

          <View
            style={styles.communityMessage}
          >
            <Ionicons
              name="people-outline"
              size={15}
              color="#9EF65A"
            />

            <Text
              style={
                styles.communityMessageText
              }
            >
              Welcome to the Direct Gain
              community.
            </Text>
          </View>
        </Animated.View>
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
    top: -190,
    right: -130,
    width: 430,
    height: 430,
    borderRadius: 215,
    backgroundColor:
      'rgba(158, 246, 90, 0.075)',
  },

  bottomGlow: {
    position: 'absolute',
    bottom: -210,
    left: -170,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor:
      'rgba(158, 246, 90, 0.065)',
  },

  backgroundArrow: {
    position: 'absolute',
    top: 260,
    right: -170,
    transform: [{ rotate: '32deg' }],
  },

  energyLineOne: {
    position: 'absolute',
    bottom: 120,
    left: -110,
    width: 420,
    height: 1,
    backgroundColor:
      'rgba(158, 246, 90, 0.09)',
    transform: [{ rotate: '-34deg' }],
  },

  energyLineTwo: {
    position: 'absolute',
    bottom: 215,
    right: -170,
    width: 440,
    height: 1,
    backgroundColor:
      'rgba(158, 246, 90, 0.06)',
    transform: [{ rotate: '-34deg' }],
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 42,
  },

  logoSection: {
    alignItems: 'center',
  },

  logoGlow: {
    position: 'absolute',
    top: -7,
    width: 174,
    height: 174,
    borderRadius: 87,
    backgroundColor:
      'rgba(158, 246, 90, 0.16)',
  },

  logoContainer: {
    width: 160,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: '100%',
    height: '100%',
  },

  brandName: {
    marginTop: 12,
    color: '#F5F8F5',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4.2,
  },

  slogan: {
    marginTop: 7,
    color: '#9EF65A',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  welcomeContent: {
    marginTop: 29,
  },

  eyebrow: {
    color: '#9EF65A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.5,
    textAlign: 'center',
  },

  title: {
    marginTop: 12,
    color: '#F7F9F7',
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900',
    letterSpacing: -1,
    textAlign: 'center',
  },

  titleAccent: {
    color: '#9EF65A',
  },

  subtitle: {
    maxWidth: 390,
    alignSelf: 'center',
    marginTop: 14,
    color: '#949E97',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },

  successPanel: {
    marginTop: 24,
    padding: 17,
    borderRadius: 24,
    backgroundColor: '#111713',
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.22)',
  },

  successPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor:
      'rgba(255, 255, 255, 0.07)',
  },

  successPanelIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9EF65A',
  },

  successPanelHeaderText: {
    flex: 1,
    marginLeft: 12,
  },

  successPanelTitle: {
    color: '#F4F7F4',
    fontSize: 15,
    fontWeight: '900',
  },

  successPanelSubtitle: {
    marginTop: 3,
    color: '#7F8982',
    fontSize: 11,
  },

  successItem: {
    minHeight: 49,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },

  successIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9EF65A',
  },

  successLabel: {
    flex: 1,
    marginLeft: 11,
    color: '#DDE3DE',
    fontSize: 13,
    fontWeight: '700',
  },

  actionSection: {
    marginTop: 24,
  },

  errorCard: {
    marginBottom: 14,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      'rgba(255, 119, 119, 0.08)',
    borderWidth: 1,
    borderColor:
      'rgba(255, 119, 119, 0.3)',
  },

  errorText: {
    flex: 1,
    marginLeft: 9,
    color: '#FF8D8D',
    fontSize: 12,
    lineHeight: 18,
  },

  enterButton: {
    minHeight: 76,
    paddingLeft: 23,
    paddingRight: 10,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#9EF65A',
    borderWidth: 1,
    borderColor: '#D6FFC0',
    shadowColor: '#9EF65A',
    shadowOffset: {
      width: 0,
      height: 11,
    },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 10,
  },

  enterButtonPressed: {
    opacity: 0.88,
  },

  enterButtonDisabled: {
    opacity: 0.78,
  },

  enterButtonCopy: {
    flex: 1,
    paddingRight: 10,
  },

  enterButtonText: {
    color: '#080B09',
    fontSize: 18,
    fontWeight: '900',
  },

  enterButtonSubtext: {
    marginTop: 4,
    color: 'rgba(8, 11, 9, 0.65)',
    fontSize: 11,
    fontWeight: '700',
  },

  enterButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(8, 11, 9, 0.1)',
    borderWidth: 1,
    borderColor:
      'rgba(8, 11, 9, 0.14)',
  },

  communityMessage: {
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  communityMessageText: {
    marginLeft: 7,
    color: '#78827B',
    fontSize: 11,
  },
});