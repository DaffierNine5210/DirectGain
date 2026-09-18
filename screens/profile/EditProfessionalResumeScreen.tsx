import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGHeader from '../../components/DGHeader';
import ProfessionalResumeCard from '../../components/profile/professional/ProfessionalResumeCard';

import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import type { MyGainStackParamList } from '../../navigation/MyGainStack';

import { pickProfessionalResumePdf } from '../../services/profile/pickProfessionalResume';
import {
  getOwnProfessionalResume,
  removeOwnProfessionalResume,
  saveOwnProfessionalResumeFile,
} from '../../services/profile/professionalResumeRepository';

import {
  spacing,
  surface,
  textColor,
  palette,
} from '../../theme/designSystem';

import type { ProfessionalResume } from '../../types/professionalProfile';

type Props = NativeStackScreenProps<
  MyGainStackParamList,
  'EditProfessionalResume'
>;

export default function EditProfessionalResumeScreen({
  navigation,
}: Props) {
  const { hideTabBar } = useTabBarVisibility();
  const mountedRef = useRef(true);
  const mutatingRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(
    null,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [resume, setResume] = useState<ProfessionalResume | null>(
    null,
  );

  const loadResume = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const result = await getOwnProfessionalResume();

    if (!mountedRef.current) {
      return;
    }

    setLoading(false);

    if (result.error) {
      setLoadError(result.error);
      return;
    }

    setResume(result.resume);
  }, []);

  useFocusEffect(
    useCallback(() => {
      hideTabBar();
    }, [hideTabBar]),
  );

  useEffect(() => {
    mountedRef.current = true;
    void loadResume();

    return () => {
      mountedRef.current = false;
    };
  }, [loadResume]);

  async function handlePickAndSave() {
    if (mutatingRef.current || loading) {
      return;
    }

    setActionError(null);
    setNotice(null);

    const picked = await pickProfessionalResumePdf();

    if (!mountedRef.current) {
      return;
    }

    if (picked.kind === 'cancelled') {
      return;
    }

    if (picked.kind === 'unavailable') {
      setActionError(picked.message);
      return;
    }

    if (picked.kind === 'invalid') {
      setActionError(picked.error);
      return;
    }

    mutatingRef.current = true;
    setMutating(true);

    const saved = await saveOwnProfessionalResumeFile(
      picked.resume,
      resume,
    );

    if (!mountedRef.current) {
      return;
    }

    mutatingRef.current = false;
    setMutating(false);

    if (saved.error) {
      setActionError(saved.error);
      return;
    }

    setResume(saved.resume);
    setNotice(
      saved.cleanupWarning ?? 'Your résumé has been saved.',
    );
  }

  function confirmRemove() {
    if (mutatingRef.current || loading || !resume) {
      return;
    }

    Alert.alert(
      'Remove this résumé?',
      'It will be removed from your Professional preview. Direct Gain will not keep a copy in your profile.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            void handleRemove();
          },
        },
      ],
    );
  }

  async function handleRemove() {
    if (mutatingRef.current || !resume) {
      return;
    }

    setActionError(null);
    setNotice(null);
    mutatingRef.current = true;
    setMutating(true);

    const removed = await removeOwnProfessionalResume(resume);

    if (!mountedRef.current) {
      return;
    }

    mutatingRef.current = false;
    setMutating(false);

    if (removed.error) {
      setActionError(removed.error);
      return;
    }

    setResume(null);
    setNotice(
      removed.cleanupWarning ?? 'Your résumé has been removed.',
    );
  }

  function handleView() {
    if (!resume || mutatingRef.current) {
      return;
    }

    setActionError(null);
    navigation.navigate('ProfessionalResumeViewer', {
      storagePath: resume.storagePath,
      originalFilename: resume.originalFilename,
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DGHeader
        showBackButton
        title="Résumé"
        onBackPress={() => {
          if (mutatingRef.current) {
            return;
          }

          navigation.goBack();
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.intro}>
          Attach one PDF résumé to your Professional profile.
          It is private while Professional is preview-only.
        </Text>

        <ProfessionalResumeCard
          loading={loading}
          error={loadError}
          resume={resume}
          mutating={mutating}
          onRetry={() => {
            void loadResume();
          }}
          onAdd={() => {
            void handlePickAndSave();
          }}
          onView={handleView}
          onReplace={() => {
            void handlePickAndSave();
          }}
          onRemove={confirmRemove}
        />

        {mutating ? (
          <Text style={styles.status}>Updating résumé…</Text>
        ) : null}

        {notice ? (
          <Text style={styles.notice}>{notice}</Text>
        ) : null}

        {actionError ? (
          <Text style={styles.error}>{actionError}</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: surface.page,
  },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.massive,
    gap: spacing.md,
  },

  intro: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },

  status: {
    color: textColor.muted,
    fontSize: 13,
    fontWeight: '600',
  },

  notice: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  error: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
});
