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
  updateFromScroll: (offsetY: number) => void;
  showTabBar: () => void;
  hideTabBar: () => void;
};

export const TabBarVisibilityContext =
  createContext<TabBarVisibilityContextType | null>(
    null,
  );

const HIDE_THRESHOLD = 10;
const SHOW_THRESHOLD = -7;
const TAB_BAR_HIDDEN_POSITION = 130;

export default function TabBarVisibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const translateY =
    useRef(new Animated.Value(0)).current;

  const previousOffset = useRef(0);
  const isHidden = useRef(false);
  const animationRunning = useRef(false);

  const animateTo = useCallback(
    (value: number, hidden: boolean) => {
      if (
        isHidden.current === hidden ||
        animationRunning.current
      ) {
        return;
      }

      animationRunning.current = true;
      isHidden.current = hidden;

      Animated.timing(translateY, {
        toValue: value,
        duration: hidden ? 220 : 190,
        useNativeDriver: true,
      }).start(() => {
        animationRunning.current = false;
      });
    },
    [translateY],
  );

  const showTabBar = useCallback(() => {
    animateTo(0, false);
  }, [animateTo]);

  const hideTabBar = useCallback(() => {
    animateTo(
      TAB_BAR_HIDDEN_POSITION,
      true,
    );
  }, [animateTo]);

  const updateFromScroll = useCallback(
    (offsetY: number) => {
      const safeOffset = Math.max(0, offsetY);
      const difference =
        safeOffset - previousOffset.current;

      /*
       * Always show the navigation when the user
       * returns close to the top of the page.
       */
      if (safeOffset <= 18) {
        showTabBar();
        previousOffset.current = safeOffset;
        return;
      }

      /*
       * Scrolling downward hides the navigation.
       */
      if (difference > HIDE_THRESHOLD) {
        hideTabBar();
      }

      /*
       * Scrolling upward reveals the navigation.
       */
      if (difference < SHOW_THRESHOLD) {
        showTabBar();
      }

      previousOffset.current = safeOffset;
    },
    [hideTabBar, showTabBar],
  );

  const value = useMemo(
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
      value={value}
    >
      {children}
    </TabBarVisibilityContext.Provider>
  );
}