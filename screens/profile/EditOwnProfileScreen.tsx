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
import DGSkeleton from '../../components/DGSkeleton';

import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import type { MyGainStackParamList } from '../../navigation/MyGainStack';

import { sanitiseOwnProfileInput } from '../../services/profile/profileAdapter';
import {
  getOwnProfile,
  updateOwnProfile,
} from '../../services/profile/profileRepository';

import {
  palette,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

import {
  PROFILE_BIO_MAX,
  PROFILE_DISPLAY_NAME_MAX,
  PROFILE_STATE_MAX,
  PROFILE_SUBURB_MAX,
} from '../../types/profile';

type Props = NativeStackScreenProps<
  MyGainStackParamList,
  'EditProfile'
>;

type FieldKey =
  | 'displayName'
  | 'bio'
  | 'suburb'
  | 'state';

export default function EditOwnProfileScreen({
  navigation,
}: Props) {
  const {
    hideTabBar,
    showTabBar,
  } = useTabBarVisibility();

  const mountedRef = useRef(true);
  const savingRef = useRef(false);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [suburb, setSuburb] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(
    null,
  );
  const [saveError, setSaveError] = useState<string | null>(
    null,
  );
  const [fieldError, setFieldError] = useState<{
    field: FieldKey;
    message: string;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      hideTabBar();

      return () => {
        showTabBar();
      };
    }, [hideTabBar, showTabBar]),
  );

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const result = await getOwnProfile();

    if (!mountedRef.current) {
      return;
    }

    setLoading(false);

    if (result.error || !result.profile) {
      setLoadError(
        result.error ?? 'Your profile could not be loaded.',
      );
      return;
    }

    setDisplayName(result.profile.displayName);
    setBio(result.profile.bio ?? '');
    setSuburb(result.profile.suburb ?? '');
    setState(result.profile.state ?? '');
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadProfile();

    return () => {
      mountedRef.current = false;
    };
  }, [loadProfile]);

  async function handleSave() {
    if (savingRef.current || loading) {
      return;
    }

    Keyboard.dismiss();
    setSaveError(null);

    const sanitised = sanitiseOwnProfileInput({
      displayName,
      bio,
      suburb,
      state,
    });

    if (!sanitised.ok) {
      setFieldError({
        field: sanitised.field,
        message: sanitised.error,
      });
      return;
    }

    setFieldError(null);
    savingRef.current = true;
    setSaving(true);

    const result = await updateOwnProfile({
      displayName,
      bio,
      suburb,
      state,
    });

    if (!mountedRef.current) {
      return;
    }

    savingRef.current = false;
    setSaving(false);

    if (result.error || !result.profile) {
      setSaveError(
        result.error ??
          'Your profile could not be saved. Try again.',
      );
      return;
    }

    navigation.goBack();
  }

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <DGHeader
        showBackButton
        title="Edit profile"
        onBackPress={() => {
          if (savingRef.current) {
            return;
          }

          navigation.goBack();
        }}
      />

      {loading ? (
        <View style={styles.body}>
          <DGSkeleton width="28%" height={12} />
          <DGSkeleton
            width="100%"
            height={48}
            style={styles.skeleton}
          />
          <DGSkeleton width="18%" height={12} />
          <DGSkeleton
            width="100%"
            height={88}
            style={styles.skeleton}
          />
        </View>
      ) : loadError ? (
        <View style={styles.body}>
          <Text style={styles.errorTitle}>
            Profile could not be loaded
          </Text>
          <Text style={styles.errorBody}>{loadError}</Text>
          <DGButton
            title="Retry"
            fullWidth
            onPress={() => {
              void loadProfile();
            }}
            accessibilityLabel="Retry loading profile"
          />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS === 'ios' ? 'padding' : undefined
          }
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <DGInput
              label="Display name"
              value={displayName}
              onChangeText={(value) => {
                setDisplayName(value);
                setFieldError(null);
              }}
              maxLength={PROFILE_DISPLAY_NAME_MAX}
              autoCapitalize="words"
              editable={!saving}
              errorMessage={
                fieldError?.field === 'displayName'
                  ? fieldError.message
                  : undefined
              }
              helperText={`${displayName.trim().length}/${PROFILE_DISPLAY_NAME_MAX}`}
              accessibilityLabel="Display name"
            />

            <DGInput
              label="Bio"
              value={bio}
              onChangeText={(value) => {
                setBio(value);
                setFieldError(null);
              }}
              maxLength={PROFILE_BIO_MAX}
              multiline
              editable={!saving}
              errorMessage={
                fieldError?.field === 'bio'
                  ? fieldError.message
                  : undefined
              }
              helperText={`${bio.trim().length}/${PROFILE_BIO_MAX}`}
              accessibilityLabel="Bio"
            />

            <DGInput
              label="Suburb"
              value={suburb}
              onChangeText={(value) => {
                setSuburb(value);
                setFieldError(null);
              }}
              maxLength={PROFILE_SUBURB_MAX}
              autoCapitalize="words"
              editable={!saving}
              errorMessage={
                fieldError?.field === 'suburb'
                  ? fieldError.message
                  : undefined
              }
              accessibilityLabel="Suburb"
            />

            <DGInput
              label="State"
              value={state}
              onChangeText={(value) => {
                setState(value);
                setFieldError(null);
              }}
              maxLength={PROFILE_STATE_MAX}
              autoCapitalize="words"
              editable={!saving}
              errorMessage={
                fieldError?.field === 'state'
                  ? fieldError.message
                  : undefined
              }
              accessibilityLabel="State"
            />

            {saveError ? (
              <Text style={styles.saveError}>{saveError}</Text>
            ) : null}

            <DGButton
              title={saving ? 'Saving…' : 'Save'}
              fullWidth
              loading={saving}
              disabled={saving}
              onPress={() => {
                void handleSave();
              }}
              accessibilityLabel="Save profile"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: surface.page,
  },

  flex: {
    flex: 1,
  },

  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.massive,
    gap: spacing.md,
  },

  skeleton: {
    marginTop: spacing.sm,
  },

  errorTitle: {
    color: textColor.primary,
    ...typography.headingSmall,
  },

  errorBody: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
  },

  saveError: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
});
