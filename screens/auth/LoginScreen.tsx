import { Ionicons } from '@expo/vector-icons';
import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  useContext,
  useState,
} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  AuthContext,
} from '../../providers/AuthProvider';

import type {
  AuthStackParamList,
} from '../../navigation/AuthStack';

type Props =
  NativeStackScreenProps<
    AuthStackParamList,
    'Login'
  >;

export default function LoginScreen({
  navigation,
}: Props) {
  const {
    signIn,
  } = useContext(
    AuthContext,
  );

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  async function handleLogin() {
    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    if (
      normalizedEmail.length ===
      0
    ) {
      Alert.alert(
        'Email required',
        'Enter your email address.',
      );

      return;
    }

    if (
      password.length ===
      0
    ) {
      Alert.alert(
        'Password required',
        'Enter your password.',
      );

      return;
    }

    try {
      setIsSubmitting(
        true,
      );

      const {
        error,
      } = await signIn({
        email:
          normalizedEmail,

        password,
      });

      if (error) {
        Alert.alert(
          'Unable to sign in',
          error.message,
        );

        return;
      }

      /*
       * No manual navigation is needed here.
       *
       * AuthProvider receives the new
       * Supabase session and AppNavigator
       * should automatically move the user
       * into the authenticated app.
       */
    } catch (error) {
      console.warn(
        '[Direct Gain] Login failed:',
        error,
      );

      Alert.alert(
        'Unable to sign in',
        'Something went wrong. Please try again.',
      );
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }

  function handleForgotPassword() {
    navigation.navigate(
      'ForgotPassword',
    );
  }

  function handleCreateAccount() {
    navigation.navigate(
      'ChooseProfile',
    );
  }

  function handleBack() {
    navigation.goBack();
  }

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
    >
      <KeyboardAvoidingView
        style={
          styles.keyboardView
        }
        behavior={
          Platform.OS ===
          'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={
              styles.topBar
            }
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={
                handleBack
              }
              style={({
                pressed,
              }) => [
                styles.backButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={
                  24
                }
                color="#F5F8F5"
              />
            </Pressable>

            <View
              style={
                styles.brandMark
              }
            >
              <Text
                style={
                  styles.brandInitials
                }
              >
                DG
              </Text>
            </View>
          </View>

          <View
            style={
              styles.header
            }
          >
            <Text
              style={
                styles.eyebrow
              }
            >
              WELCOME BACK
            </Text>

            <Text
              style={
                styles.title
              }
            >
              Sign in to{'\n'}
              Direct Gain
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Access your Market,
              messages, opportunities,
              auctions and trusted
              Direct Gain profile.
            </Text>
          </View>

          <View
            style={
              styles.form
            }
          >
            <View>
              <Text
                style={
                  styles.label
                }
              >
                Email address
              </Text>

              <View
                style={
                  styles.inputContainer
                }
              >
                <Ionicons
                  name="mail-outline"
                  size={
                    20
                  }
                  color="#7C877F"
                />

                <TextInput
                  value={
                    email
                  }
                  onChangeText={
                    setEmail
                  }
                  placeholder="you@example.com"
                  placeholderTextColor="#657068"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={
                    false
                  }
                  textContentType="emailAddress"
                  returnKeyType="next"
                  style={
                    styles.input
                  }
                />
              </View>
            </View>

            <View
              style={
                styles.passwordSection
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                Password
              </Text>

              <View
                style={
                  styles.inputContainer
                }
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={
                    20
                  }
                  color="#7C877F"
                />

                <TextInput
                  value={
                    password
                  }
                  onChangeText={
                    setPassword
                  }
                  placeholder="Enter your password"
                  placeholderTextColor="#657068"
                  secureTextEntry={
                    !showPassword
                  }
                  autoCapitalize="none"
                  autoCorrect={
                    false
                  }
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={
                    handleLogin
                  }
                  style={
                    styles.input
                  }
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                  onPress={() =>
                    setShowPassword(
                      current =>
                        !current,
                    )
                  }
                  hitSlop={
                    10
                  }
                >
                  <Ionicons
                    name={
                      showPassword
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={
                      21
                    }
                    color="#8D9890"
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={
                handleForgotPassword
              }
              style={
                styles.forgotButton
              }
            >
              <Text
                style={
                  styles.forgotText
                }
              >
                Forgot password?
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={
                isSubmitting
              }
              onPress={
                handleLogin
              }
              style={({
                pressed,
              }) => [
                styles.signInButton,

                pressed &&
                  !isSubmitting &&
                  styles.signInButtonPressed,

                isSubmitting &&
                  styles.signInButtonDisabled,
              ]}
            >
              <Text
                style={
                  styles.signInText
                }
              >
                {isSubmitting
                  ? 'Signing in...'
                  : 'Sign in'}
              </Text>

              {!isSubmitting ? (
                <View
                  style={
                    styles.signInArrow
                  }
                >
                  <Ionicons
                    name="arrow-forward"
                    size={
                      22
                    }
                    color="#080B09"
                  />
                </View>
              ) : null}
            </Pressable>
          </View>

          <View
            style={
              styles.securityCard
            }
          >
            <View
              style={
                styles.securityIcon
              }
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={
                  21
                }
                color="#9EF65A"
              />
            </View>

            <View
              style={
                styles.securityCopy
              }
            >
              <Text
                style={
                  styles.securityTitle
                }
              >
                Your account stays protected
              </Text>

              <Text
                style={
                  styles.securityDescription
                }
              >
                Direct Gain uses secure
                authentication to protect
                your account and activity.
              </Text>
            </View>
          </View>

          <View
            style={
              styles.createAccount
            }
          >
            <Text
              style={
                styles.createQuestion
              }
            >
              New to Direct Gain?
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={
                handleCreateAccount
              }
              style={({
                pressed,
              }) => [
                styles.createButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.createText
                }
              >
                Create an account
              </Text>

              <Ionicons
                name="arrow-forward"
                size={
                  17
                }
                color="#9EF65A"
              />
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,

      backgroundColor:
        '#080B09',
    },

    keyboardView: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,

      paddingHorizontal:
        22,

      paddingTop:
        10,

      paddingBottom:
        34,
    },

    topBar: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    backButton: {
      width:
        48,

      height:
        48,

      borderRadius:
        16,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        '#111512',

      borderWidth:
        1,

      borderColor:
        'rgba(255,255,255,0.10)',
    },

    brandMark: {
      width:
        48,

      height:
        48,

      borderRadius:
        16,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        'rgba(158,246,90,0.08)',
    },

    brandInitials: {
      color:
        '#9EF65A',

      fontSize:
        16,

      fontWeight:
        '900',

      fontStyle:
        'italic',
    },

    header: {
      marginTop:
        52,
    },

    eyebrow: {
      color:
        '#9EF65A',

      fontSize:
        10,

      lineHeight:
        14,

      fontWeight:
        '900',

      letterSpacing:
        1.8,
    },

    title: {
      marginTop:
        9,

      color:
        '#F5F8F5',

      fontSize:
        39,

      lineHeight:
        44,

      fontWeight:
        '900',

      letterSpacing:
        -1.1,
    },

    subtitle: {
      marginTop:
        14,

      maxWidth:
        420,

      color:
        '#929C94',

      fontSize:
        14,

      lineHeight:
        22,

      fontWeight:
        '500',
    },

    form: {
      marginTop:
        38,
    },

    label: {
      marginBottom:
        9,

      color:
        '#E8ECE8',

      fontSize:
        12,

      fontWeight:
        '800',
    },

    inputContainer: {
      height:
        58,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal:
        16,

      borderRadius:
        18,

      borderWidth:
        1,

      borderColor:
        'rgba(255,255,255,0.10)',

      backgroundColor:
        '#111512',
    },

    input: {
      flex:
        1,

      height:
        '100%',

      marginLeft:
        11,

      color:
        '#F5F8F5',

      fontSize:
        15,

      fontWeight:
        '600',
    },

    passwordSection: {
      marginTop:
        19,
    },

    forgotButton: {
      alignSelf:
        'flex-end',

      marginTop:
        11,

      paddingVertical:
        5,
    },

    forgotText: {
      color:
        '#9EF65A',

      fontSize:
        12,

      fontWeight:
        '800',
    },

    signInButton: {
      height:
        64,

      marginTop:
        24,

      paddingLeft:
        23,

      paddingRight:
        9,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      borderRadius:
        21,

      backgroundColor:
        '#9EF65A',

      borderWidth:
        1,

      borderColor:
        '#D5FFB8',

      shadowColor:
        '#9EF65A',

      shadowOffset: {
        width:
          0,

        height:
          8,
      },

      shadowOpacity:
        0.25,

      shadowRadius:
        14,

      elevation:
        9,
    },

    signInButtonPressed: {
      opacity:
        0.82,

      transform: [
        {
          scale:
            0.985,
        },
      ],
    },

    signInButtonDisabled: {
      opacity:
        0.55,
    },

    signInText: {
      color:
        '#080B09',

      fontSize:
        17,

      fontWeight:
        '900',
    },

    signInArrow: {
      width:
        47,

      height:
        47,

      borderRadius:
        16,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        'rgba(8,11,9,0.10)',
    },

    securityCard: {
      marginTop:
        26,

      padding:
        16,

      flexDirection:
        'row',

      alignItems:
        'center',

      borderRadius:
        18,

      borderWidth:
        1,

      borderColor:
        'rgba(158,246,90,0.13)',

      backgroundColor:
        'rgba(158,246,90,0.04)',
    },

    securityIcon: {
      width:
        43,

      height:
        43,

      borderRadius:
        14,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        'rgba(158,246,90,0.08)',
    },

    securityCopy: {
      flex:
        1,

      marginLeft:
        12,
    },

    securityTitle: {
      color:
        '#E8EDE8',

      fontSize:
        12,

      fontWeight:
        '800',
    },

    securityDescription: {
      marginTop:
        4,

      color:
        '#7F8981',

      fontSize:
        10,

      lineHeight:
        15,

      fontWeight:
        '500',
    },

    createAccount: {
      marginTop:
        29,

      alignItems:
        'center',
    },

    createQuestion: {
      color:
        '#8D978F',

      fontSize:
        13,
    },

    createButton: {
      marginTop:
        7,

      paddingHorizontal:
        10,

      paddingVertical:
        6,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        7,
    },

    createText: {
      color:
        '#9EF65A',

      fontSize:
        14,

      fontWeight:
        '800',
    },

    pressed: {
      opacity:
        0.65,
    },
  });