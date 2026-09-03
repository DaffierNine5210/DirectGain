import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGButton from '../../components/DGButton';
import DGHeader from '../../components/DGHeader';
import DGInput from '../../components/DGInput';

import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import type { DiscoverStackParamList } from '../../navigation/DiscoverStack';

import {
  createJobApplication,
  sanitiseApplicationMessage,
} from '../../services/jobs/jobApplicationRepository';

import {
  alpha,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

import { JOB_APPLICATION_MESSAGE_MAX } from '../../types/jobs';

type Props = NativeStackScreenProps<
  DiscoverStackParamList,
  'ApplyToJob'
>;

export default function ApplyToJobScreen({
  navigation,
  route,
}: Props) {
  const {
    hideTabBar,
    showTabBar,
  } = useTabBarVisibility();

  const jobId = route.params.jobId;
  const jobTitle = route.params.jobTitle;

  const mountedRef = useRef(true);
  const submittingRef = useRef(false);
  const allowLeaveAfterSubmitRef = useRef(false);

  const [
    message,
    setMessage,
  ] = useState('');

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    fieldError,
    setFieldError,
  ] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      hideTabBar();

      return () => {
        showTabBar();
      };
    }, [hideTabBar, showTabBar]),
  );

  useEffect(() => {
    mountedRef.current = true;

    const unsubscribe = navigation.addListener(
      'beforeRemove',
      (event) => {
        if (allowLeaveAfterSubmitRef.current) {
          return;
        }

        if (!submittingRef.current) {
          return;
        }

        event.preventDefault();
      },
    );

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [navigation]);

  async function handleSubmit() {
    if (submittingRef.current) {
      return;
    }

    Keyboard.dismiss();

    const sanitised = sanitiseApplicationMessage(
      message,
    );

    if (!sanitised.ok) {
      setFieldError(sanitised.error);
      setError(null);
      return;
    }

    submittingRef.current = true;
    navigation.setOptions({
      gestureEnabled: false,
    });
    setSubmitting(true);
    setError(null);
    setFieldError(null);

    const result = await createJobApplication({
      jobId,
      message: sanitised.message,
    });

    if (!mountedRef.current) {
      return;
    }

    if (result.error || !result.application) {
      submittingRef.current = false;
      navigation.setOptions({
        gestureEnabled: true,
      });
      setSubmitting(false);
      setError(
        result.error ??
          'This application could not be submitted. Try again.',
      );
      return;
    }

    allowLeaveAfterSubmitRef.current = true;
    navigation.goBack();
  }

  const messageLength = message.trim().length;

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <DGHeader
        showBackButton
        title="Apply"
        onBackPress={() => {
          if (submittingRef.current) {
            return;
          }

          navigation.goBack();
        }}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.intro}>
            Introduce yourself and explain why you are a good fit.
          </Text>

          <View style={styles.jobCard}>
            <Text style={styles.jobEyebrow}>
              Applying for
            </Text>
            <Text style={styles.jobTitle}>
              {jobTitle}
            </Text>
          </View>

          <DGInput
            label="Message"
            value={message}
            onChangeText={(value) => {
              setMessage(value);
              setFieldError(null);
            }}
            placeholder="Tell the poster why you're interested or suitable"
            maxLength={JOB_APPLICATION_MESSAGE_MAX}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            editable={!submitting}
            errorMessage={fieldError ?? undefined}
            helperText={
              fieldError
                ? undefined
                : `${messageLength}/${JOB_APPLICATION_MESSAGE_MAX}`
            }
            autoCapitalize="sentences"
            inputContainerStyle={styles.messageInput}
            inputStyle={styles.messageField}
          />

          {error ? (
            <Text style={styles.formError}>
              {error}
            </Text>
          ) : null}

          <DGButton
            title={
              submitting
                ? 'Submitting…'
                : 'Submit application'
            }
            fullWidth
            loading={submitting}
            disabled={submitting}
            onPress={() => {
              void handleSubmit();
            }}
            style={styles.submit}
            accessibilityLabel="Submit application"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#080B09',
  },

  flex: {
    flex: 1,
  },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.massive,
    gap: spacing.md,
  },

  intro: {
    color: textColor.secondary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },

  jobCard: {
    padding: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    gap: 4,
  },

  jobEyebrow: {
    ...typography.eyebrow,
    color: textColor.muted,
  },

  jobTitle: {
    color: textColor.primary,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },

  messageInput: {
    minHeight: 132,
    alignItems: 'flex-start',
  },

  messageField: {
    minHeight: 120,
  },

  formError: {
    color: '#E5484D',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },

  submit: {
    marginTop: spacing.sm,
  },
});
