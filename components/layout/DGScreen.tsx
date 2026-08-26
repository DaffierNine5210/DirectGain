import {
  ReactNode,
  useMemo,
} from 'react';
import {
  Keyboard,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  layout,
  spacing,
} from '../../theme/designSystem';

import {
  getDynamicLightingTheme,
} from '../../theme/dynamicLighting';

type DGScreenProps = {
  children: ReactNode;

  scrollable?: boolean;

  refreshing?: boolean;
  onRefresh?: () => void;

  onScroll?: (
    offsetY: number,
  ) => void;

  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;

  showTopGlow?: boolean;
  showBottomGlow?: boolean;
};

export default function DGScreen({
  children,

  scrollable = true,

  refreshing = false,
  onRefresh,

  onScroll,

  contentContainerStyle,
  style,

  showTopGlow = true,
  showBottomGlow = true,
}: DGScreenProps) {
  const lightingTheme = useMemo(
    () =>
      getDynamicLightingTheme(),
    [],
  );

  const background = (
    <View
      pointerEvents="none"
      style={styles.background}
    >
      {showTopGlow ? (
        <View
          style={[
            styles.topGlow,
            {
              backgroundColor:
                lightingTheme.topGlow,
            },
          ]}
        />
      ) : null}

      {showBottomGlow ? (
        <View
          style={[
            styles.bottomGlow,
            {
              backgroundColor:
                lightingTheme.bottomGlow,
            },
          ]}
        />
      ) : null}
    </View>
  );

  if (!scrollable) {
    return (
      <SafeAreaView
        edges={['top']}
        style={[
          styles.safeArea,
          {
            backgroundColor:
              lightingTheme.background,
          },
          style,
        ]}
      >
        <StatusBar
          barStyle={
            lightingTheme.statusBarStyle ===
            'dark'
              ? 'dark-content'
              : 'light-content'
          }
          backgroundColor={
            lightingTheme.background
          }
        />

        {background}

        <View
          style={styles.staticContent}
        >
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.safeArea,
        {
          backgroundColor:
            lightingTheme.background,
        },
        style,
      ]}
    >
      <StatusBar
        barStyle={
          lightingTheme.statusBarStyle ===
          'dark'
            ? 'dark-content'
            : 'light-content'
        }
        backgroundColor={
          lightingTheme.background
        }
      />

      {background}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          Keyboard.dismiss();
        }}
        onScroll={(event) => {
          onScroll?.(
            event.nativeEvent
              .contentOffset.y,
          );
        }}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                onRefresh
              }
              tintColor={
                lightingTheme.greenAccent
              }
              colors={[
                lightingTheme.greenAccent,
              ]}
              progressBackgroundColor={
                lightingTheme.elevatedBackground
              }
            />
          ) : undefined
        }
        contentContainerStyle={[
          styles.scrollContent,
          contentContainerStyle,
        ]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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

    top: -240,
    right: -185,

    width: 420,
    height: 420,

    borderRadius: 210,
  },

  bottomGlow: {
    position: 'absolute',

    bottom: -275,
    left: -205,

    width: 430,
    height: 430,

    borderRadius: 215,
  },

  scrollContent: {
    paddingBottom:
      layout.bottomNavigationClearance +
      spacing.xxxl,
  },

  staticContent: {
    flex: 1,
  },
});