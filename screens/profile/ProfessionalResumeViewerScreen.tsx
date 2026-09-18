import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import DGHeader from '../../components/DGHeader';

import useTabBarVisibility from '../../hooks/useTabBarVisibility';

import type { MyGainStackParamList } from '../../navigation/MyGainStack';

import { isProfessionalResumeStoragePath } from '../../services/profile/professionalProfileAdapter';
import { getAuthenticatedUserId } from '../../services/profile/profileRepository';
import { createProfessionalResumeSignedUrl } from '../../services/profile/professionalResumeRepository';

import {
  alpha,
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

type Props = NativeStackScreenProps<
  MyGainStackParamList,
  'ProfessionalResumeViewer'
>;

function isPrivateResumeSignedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    return (
      parsed.protocol === 'https:' &&
      parsed.pathname.includes(
        '/storage/v1/object/sign/professional-resumes/',
      )
    );
  } catch {
    return false;
  }
}

export default function ProfessionalResumeViewerScreen({
  navigation,
  route,
}: Props) {
  const { hideTabBar } = useTabBarVisibility();
  const mountedRef = useRef(true);
  const { storagePath, originalFilename } = route.params;

  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filename =
    originalFilename.trim() || 'Professional résumé';

  const loadSignedUrl = useCallback(
    async (bypassCache: boolean) => {
      setLoading(true);
      setDocumentLoading(false);
      setError(null);
      setSignedUrl(null);

      const userId = await getAuthenticatedUserId();

      if (!mountedRef.current) {
        return;
      }

      if (
        !userId ||
        !isProfessionalResumeStoragePath(storagePath, userId)
      ) {
        setLoading(false);
        setError('Your résumé could not be opened. Try again.');
        return;
      }

      const nextUrl = await createProfessionalResumeSignedUrl(
        storagePath,
        { bypassCache },
      );

      if (!mountedRef.current) {
        return;
      }

      if (!nextUrl || !isPrivateResumeSignedUrl(nextUrl)) {
        setLoading(false);
        setError('Your résumé could not be opened. Try again.');
        return;
      }

      setSignedUrl(nextUrl);
      setDocumentLoading(true);
      setLoading(false);
    },
    [storagePath],
  );

  useFocusEffect(
    useCallback(() => {
      hideTabBar();
    }, [hideTabBar]),
  );

  useEffect(() => {
    mountedRef.current = true;
    void loadSignedUrl(false);

    return () => {
      mountedRef.current = false;
      setSignedUrl(null);
    };
  }, [loadSignedUrl]);

  const showLoadingOverlay = loading || documentLoading;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DGHeader
        showBackButton
        title="Résumé"
        onBackPress={() => {
          navigation.goBack();
        }}
      />

      <View style={styles.meta}>
        <Text style={styles.filename} numberOfLines={2}>
          {filename}
        </Text>
        <Text style={styles.privacy}>PDF · Private</Text>
      </View>

      <View style={styles.documentShell}>
        {error ? (
          <View style={styles.messageWrap}>
            <Text style={styles.errorTitle}>
              Résumé could not be shown
            </Text>
            <Text style={styles.errorBody}>{error}</Text>
            <Pressable
              onPress={() => {
                void loadSignedUrl(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Retry opening résumé"
              style={({ pressed }) => [
                styles.retry,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : signedUrl ? (
          <WebView
            source={{ uri: signedUrl }}
            style={styles.webview}
            originWhitelist={['https://*']}
            javaScriptEnabled={false}
            incognito
            setSupportMultipleWindows={false}
            startInLoadingState={false}
            onLoadEnd={() => {
              if (mountedRef.current) {
                setDocumentLoading(false);
              }
            }}
            onError={() => {
              if (!mountedRef.current) {
                return;
              }

              console.warn(
                '[Direct Gain] Résumé viewer could not display the document.',
              );
              setDocumentLoading(false);
              setSignedUrl(null);
              setError(
                'Your résumé could not be displayed. Try again.',
              );
            }}
            onHttpError={() => {
              if (!mountedRef.current) {
                return;
              }

              console.warn(
                '[Direct Gain] Résumé viewer received an HTTP error.',
              );
              setDocumentLoading(false);
              setSignedUrl(null);
              setError(
                'Your résumé could not be displayed. Try again.',
              );
            }}
            onShouldStartLoadWithRequest={request => {
              if (request.url === 'about:blank') {
                return true;
              }

              return isPrivateResumeSignedUrl(request.url);
            }}
          />
        ) : null}

        {showLoadingOverlay && !error ? (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator
              color={palette.opportunityGreen}
              size="large"
            />
            <Text style={styles.loadingLabel}>
              Preparing résumé…
            </Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: surface.page,
  },

  meta: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: 2,
  },

  filename: {
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },

  privacy: {
    color: textColor.muted,
    fontSize: 12,
    fontWeight: '600',
  },

  documentShell: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
  },

  webview: {
    flex: 1,
    backgroundColor: surface.cardRaised,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: surface.cardRaised,
  },

  loadingLabel: {
    color: textColor.secondary,
    fontSize: 13,
    fontWeight: '600',
  },

  messageWrap: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },

  errorTitle: {
    color: textColor.primary,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },

  errorBody: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
  },

  retry: {
    minHeight: 44,
    minWidth: 140,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: palette.opportunityGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },

  retryText: {
    color: textColor.inverse,
    fontSize: 13,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.88,
  },
});
