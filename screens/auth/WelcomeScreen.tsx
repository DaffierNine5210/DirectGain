import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type FeatureCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  delay: number;
};

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: FeatureCardProps) {
  const entrance = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 550,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay, entrance]);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.975,
      speed: 30,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      speed: 24,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.featureEntrance,
        {
          opacity: entrance,
          transform: [
            {
              translateY: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
            { scale: pressScale },
          ],
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${description}`}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.featureCard}
      >
        <View style={styles.cardTopHighlight} />

        <View style={styles.iconPlatformOuter}>
          <View style={styles.iconPlatform}>
            <View style={styles.iconGlow} />
            <Ionicons name={icon} size={29} color="#9EF65A" />
          </View>
        </View>

        <View style={styles.featureText}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDescription}>{description}</Text>
        </View>

        <View style={styles.arrowPlatform}>
          <Ionicons name="arrow-forward" size={22} color="#9EF65A" />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();

  const headerEntrance = useRef(new Animated.Value(0)).current;
  const heroEntrance = useRef(new Animated.Value(0)).current;
  const actionEntrance = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const buttonGlow = useRef(new Animated.Value(0)).current;
  const arrowMovement = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(130, [
      Animated.timing(headerEntrance, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(heroEntrance, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(actionEntrance, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
    ]).start();

    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: 1,
          duration: 2100,
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 0,
          duration: 2100,
          useNativeDriver: true,
        }),
      ]),
    );

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonGlow, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(buttonGlow, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    );

    const arrowAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(arrowMovement, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(arrowMovement, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.delay(900),
      ]),
    );

    floatingAnimation.start();
    glowAnimation.start();
    arrowAnimation.start();

    return () => {
      floatingAnimation.stop();
      glowAnimation.stop();
      arrowAnimation.stop();
    };
  }, [arrowMovement, buttonGlow, logoFloat]);

  const handleContinuePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      speed: 35,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleContinuePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      speed: 26,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  const openRegister = () => {
  navigation.navigate('ChooseProfile');
};

  const openLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#080B09" />

      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.topAmbientGlow} />
        <View style={styles.middleAmbientGlow} />
        <View style={styles.bottomAmbientGlow} />

        <Ionicons
          name="arrow-up"
          size={290}
          color="rgba(158, 246, 90, 0.025)"
          style={styles.backgroundArrow}
        />

        <View style={styles.backgroundLineOne} />
        <View style={styles.backgroundLineTwo} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces
        >
          <Animated.View
            style={[
              styles.header,
              {
                opacity: headerEntrance,
                transform: [
                  {
                    translateY: headerEntrance.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.logoTile,
                {
                  transform: [
                    {
                      translateY: logoFloat.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -5],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.logoTileHighlight} />

              <Image
                source={require('../../assets/direct-gain-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>

            <View style={styles.brandTextContainer}>
              <Text style={styles.brandName}>DIRECT GAIN</Text>
              <Text style={styles.brandSlogan}>GROW TOGETHER</Text>
            </View>

            <View style={styles.trustBadge}>
              <View style={styles.trustIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color="#9EF65A"
                />
              </View>

              <View style={styles.trustTextContainer}>
                <Text style={styles.trustTitle}>TRUST-FIRST</Text>
                <Text style={styles.trustSubtitle}>VERIFIED PLATFORM</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: heroEntrance,
                transform: [
                  {
                    translateY: heroEntrance.interpolate({
                      inputRange: [0, 1],
                      outputRange: [24, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.heroTitle}>
              Everything you{'\n'}
              need to{'\n'}
              <Text style={styles.heroAccent}>move forward.</Text>
            </Text>

            <Text style={styles.heroDescription}>
              Buy and sell locally, find work, join live auctions and build a
              trusted reputation—all within one connected community.
            </Text>

            <View style={styles.locationMessage}>
              <View style={styles.locationIconPlatform}>
                <Ionicons name="location" size={18} color="#9EF65A" />
              </View>

              <View style={styles.locationText}>
                <Text style={styles.locationTitle}>
                  Connecting local opportunities
                </Text>
                <Text style={styles.locationSubtitle}>
                  Trusted by communities across Australia
                </Text>
              </View>
            </View>
          </Animated.View>

          <View style={styles.features}>
            <FeatureCard
              icon="cart"
              title="Market"
              description="Buy and sell nearby"
              delay={370}
            />

            <FeatureCard
              icon="briefcase"
              title="Work"
              description="Find local opportunities"
              delay={470}
            />

            <FeatureCard
              icon="hammer"
              title="Auctions"
              description="Bid live with confidence"
              delay={570}
            />

            <FeatureCard
              icon="people"
              title="Community"
              description="Grow your reputation"
              delay={670}
            />
          </View>

          <Animated.View
            style={[
              styles.actions,
              {
                opacity: actionEntrance,
                transform: [
                  {
                    translateY: actionEntrance.interpolate({
                      inputRange: [0, 1],
                      outputRange: [26, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                styles.buttonGlow,
                {
                  opacity: buttonGlow.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.26, 0.58],
                  }),
                  transform: [
                    {
                      scale: buttonGlow.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.98, 1.025],
                      }),
                    },
                  ],
                },
              ]}
            />

            <Animated.View
              style={[
                styles.continueButtonWrapper,
                {
                  transform: [{ scale: buttonScale }],
                },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue and create an account"
                onPress={openRegister}
                onPressIn={handleContinuePressIn}
                onPressOut={handleContinuePressOut}
                style={styles.continueButton}
              >
                <View style={styles.continueTopHighlight} />

                <Text style={styles.continueText}>Continue</Text>

                <Animated.View
                  style={[
                    styles.continueArrow,
                    {
                      transform: [
                        {
                          translateX: arrowMovement.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 5],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Ionicons name="arrow-forward" size={25} color="#080B09" />
                </Animated.View>
              </Pressable>
            </Animated.View>

            <View style={styles.signInPanel}>
              <Text style={styles.signInQuestion}>
                Already part of Direct Gain?
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign in to Direct Gain"
                onPress={openLogin}
                style={({ pressed }) => [
                  styles.signInButton,
                  pressed && styles.signInButtonPressed,
                ]}
              >
                <Text style={styles.signInText}>Sign in</Text>
                <Ionicons name="arrow-forward" size={18} color="#9EF65A" />
              </Pressable>
            </View>

            <View style={styles.securityMessage}>
              <Ionicons
                name="lock-closed-outline"
                size={14}
                color="#9EF65A"
              />
              <Text style={styles.securityText}>
                Your privacy and security come first.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#080B09',
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 34,
  },

  topAmbientGlow: {
    position: 'absolute',
    top: -130,
    left: -90,
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: 'rgba(93, 168, 48, 0.095)',
  },

  middleAmbientGlow: {
    position: 'absolute',
    top: 330,
    right: -170,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(158, 246, 90, 0.045)',
  },

  bottomAmbientGlow: {
    position: 'absolute',
    bottom: -170,
    left: -130,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(158, 246, 90, 0.09)',
  },

  backgroundArrow: {
    position: 'absolute',
    top: 195,
    right: -75,
    transform: [{ rotate: '33deg' }],
  },

  backgroundLineOne: {
    position: 'absolute',
    top: 260,
    right: -80,
    width: 310,
    height: 1,
    backgroundColor: 'rgba(158, 246, 90, 0.055)',
    transform: [{ rotate: '-35deg' }],
  },

  backgroundLineTwo: {
    position: 'absolute',
    top: 410,
    left: -100,
    width: 290,
    height: 1,
    backgroundColor: 'rgba(158, 246, 90, 0.035)',
    transform: [{ rotate: '28deg' }],
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoTile: {
    width: 76,
    height: 76,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111713',
    borderWidth: 1,
    borderColor: 'rgba(214, 255, 192, 0.55)',
    shadowColor: '#9EF65A',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
    overflow: 'hidden',
  },

  logoTileHighlight: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },

  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
  },

  brandTextContainer: {
    flex: 1,
    marginLeft: 15,
  },

  brandName: {
    color: '#FFFFFF',
    fontSize: SCREEN_WIDTH < 380 ? 18 : 20,
    fontWeight: '800',
    letterSpacing: 2.2,
  },

  brandSlogan: {
    color: '#9EF65A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3.2,
    marginTop: 7,
  },

  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 16,
    backgroundColor: 'rgba(17, 24, 19, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.35)',
    shadowColor: '#9EF65A',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 6,
  },

  trustIcon: {
    marginRight: 6,
  },

  trustTextContainer: {
    maxWidth: 72,
  },

  trustTitle: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  trustSubtitle: {
    color: '#8E9991',
    fontSize: 6,
    fontWeight: '700',
    marginTop: 2,
  },

  heroSection: {
    marginTop: 45,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: SCREEN_WIDTH < 380 ? 43 : 49,
    lineHeight: SCREEN_WIDTH < 380 ? 48 : 54,
    letterSpacing: -1.8,
    fontWeight: '800',
  },

  heroAccent: {
    color: '#9EF65A',
    textShadowColor: 'rgba(158, 246, 90, 0.38)',
    textShadowOffset: {
      width: 0,
      height: 3,
    },
    textShadowRadius: 12,
  },

  heroDescription: {
    color: '#A7B1AA',
    fontSize: 16,
    lineHeight: 25,
    marginTop: 23,
    maxWidth: 500,
  },

  locationMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },

  locationIconPlatform: {
    width: 35,
    height: 35,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(158, 246, 90, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.22)',
  },

  locationText: {
    marginLeft: 11,
    flex: 1,
  },

  locationTitle: {
    color: '#9EF65A',
    fontSize: 14,
    fontWeight: '600',
  },

  locationSubtitle: {
    color: '#8A958D',
    fontSize: 12,
    marginTop: 4,
  },

  features: {
    marginTop: 31,
    gap: 12,
  },

  featureEntrance: {
    width: '100%',
  },

  featureCard: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 24,
    backgroundColor: 'rgba(21, 28, 23, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(182, 204, 188, 0.24)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.36,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },

  cardTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 28,
    right: 28,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },

  iconPlatformOuter: {
    width: 67,
    height: 67,
    borderRadius: 34,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.19)',
    shadowColor: '#9EF65A',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.22,
    shadowRadius: 11,
    elevation: 10,
  },

  iconPlatform: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#172019',
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.24)',
    overflow: 'hidden',
  },

  iconGlow: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: 'rgba(158, 246, 90, 0.14)',
  },

  featureText: {
    flex: 1,
    marginLeft: 18,
  },

  featureTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  featureDescription: {
    color: '#9EA8A1',
    fontSize: 14,
    lineHeight: 19,
    marginTop: 5,
    maxWidth: 170,
  },

  arrowPlatform: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A221C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 6,
  },

  actions: {
    marginTop: 22,
  },

  buttonGlow: {
    position: 'absolute',
    top: 7,
    left: 10,
    right: 10,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#9EF65A',
  },

  continueButtonWrapper: {
    shadowColor: '#9EF65A',
    shadowOffset: {
      width: 0,
      height: 11,
    },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 13,
  },

  continueButton: {
    height: 74,
    borderRadius: 28,
    backgroundColor: '#9EF65A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 28,
    paddingRight: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D6FFC0',
  },

  continueTopHighlight: {
    position: 'absolute',
    top: 1,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },

  continueText: {
    color: '#080B09',
    fontSize: 20,
    fontWeight: '800',
  },

  continueArrow: {
    width: 55,
    height: 55,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 11, 9, 0.11)',
    borderWidth: 1,
    borderColor: 'rgba(8, 11, 9, 0.2)',
  },

  signInPanel: {
    marginTop: 18,
    paddingVertical: 17,
    paddingHorizontal: 20,
    borderRadius: 23,
    alignItems: 'center',
    backgroundColor: 'rgba(14, 19, 16, 0.91)',
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.19)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },

  signInQuestion: {
    color: '#9FA9A2',
    fontSize: 15,
  },

  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  signInButtonPressed: {
    opacity: 0.65,
  },

  signInText: {
    color: '#9EF65A',
    fontSize: 17,
    fontWeight: '700',
    marginRight: 8,
  },

  securityMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 21,
  },

  securityText: {
    color: '#7E8981',
    fontSize: 12,
    marginLeft: 7,
  },
});