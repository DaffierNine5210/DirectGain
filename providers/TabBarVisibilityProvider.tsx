import {
  createContext,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import {
  Animated,
} from 'react-native';

type TabBarVisibilityContextType = {
  translateY: Animated.Value;

  updateFromScroll: (
    offsetY: number,
  ) => void;

  showTabBar: () => void;

  hideTabBar: () => void;
};

export const TabBarVisibilityContext =
  createContext<
    TabBarVisibilityContextType | null
  >(
    null,
  );

const HIDE_THRESHOLD =
  10;

const SHOW_THRESHOLD =
  -7;

/*
 * Push the entire custom tab bar
 * completely below the screen.
 *
 * The tab bar itself is currently
 * approximately 94px high on iOS,
 * so 140 gives us a safe margin.
 */
const TAB_BAR_HIDDEN_POSITION =
  140;

export default function TabBarVisibilityProvider({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const translateY =
    useRef(
      new Animated.Value(
        0,
      ),
    ).current;

  const previousOffset =
    useRef(
      0,
    );

  const isHidden =
    useRef(
      false,
    );

  /*
   * Animate the tab bar to its
   * requested state.
   *
   * IMPORTANT:
   *
   * We deliberately stop any
   * animation already in progress.
   *
   * This fixes the case where:
   *
   * 1. A tab press calls showTabBar()
   * 2. ConversationScreen opens
   * 3. hideTabBar() runs immediately
   *
   * Previously the hide request was
   * ignored because the show animation
   * was still running.
   */
  const animateTo =
    useCallback(
      (
        value:
          number,

        hidden:
          boolean,
      ) => {
        /*
         * If we're already fully
         * targeting this state,
         * nothing needs to happen.
         */
        if (
          isHidden.current ===
          hidden
        ) {
          return;
        }

        /*
         * Cancel any previous
         * movement before starting
         * the new one.
         */
        translateY.stopAnimation();

        isHidden.current =
          hidden;

        Animated.timing(
          translateY,
          {
            toValue:
              value,

            duration:
              hidden
                ? 180
                : 170,

            useNativeDriver:
              true,
          },
        ).start();
      },

      [
        translateY,
      ],
    );

  const showTabBar =
    useCallback(
      () => {
        animateTo(
          0,
          false,
        );
      },

      [
        animateTo,
      ],
    );

  const hideTabBar =
    useCallback(
      () => {
        animateTo(
          TAB_BAR_HIDDEN_POSITION,
          true,
        );
      },

      [
        animateTo,
      ],
    );

  const updateFromScroll =
    useCallback(
      (
        offsetY:
          number,
      ) => {
        const safeOffset =
          Math.max(
            0,
            offsetY,
          );

        const difference =
          safeOffset -
          previousOffset.current;

        /*
         * Always show navigation
         * near the top of a screen.
         */
        if (
          safeOffset <=
          18
        ) {
          showTabBar();

          previousOffset.current =
            safeOffset;

          return;
        }

        /*
         * Scrolling downward hides
         * the navigation.
         */
        if (
          difference >
          HIDE_THRESHOLD
        ) {
          hideTabBar();
        }

        /*
         * Scrolling upward shows
         * the navigation.
         */
        if (
          difference <
          SHOW_THRESHOLD
        ) {
          showTabBar();
        }

        previousOffset.current =
          safeOffset;
      },

      [
        hideTabBar,
        showTabBar,
      ],
    );

  const value =
    useMemo(
      () => ({
        translateY,

        updateFromScroll,

        showTabBar,

        hideTabBar,
      }),

      [
        translateY,
        updateFromScroll,
        showTabBar,
        hideTabBar,
      ],
    );

  return (
    <TabBarVisibilityContext.Provider
      value={
        value
      }
    >
      {children}
    </TabBarVisibilityContext.Provider>
  );
}