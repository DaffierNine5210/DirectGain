import {
  ReactNode,
  useEffect,
  useRef,
} from 'react';
import {
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
} from 'react-native';

type DGRevealProps = {
  children: ReactNode;

  delay?: number;
  duration?: number;
  distance?: number;

  style?: StyleProp<ViewStyle>;
};

export default function DGReveal({
  children,

  delay = 0,
  duration = 420,
  distance = 16,

  style,
}: DGRevealProps) {
  const opacity = useRef(
    new Animated.Value(0),
  ).current;

  const translateY = useRef(
    new Animated.Value(distance),
  ).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(
          Easing.cubic,
        ),
        useNativeDriver: true,
      }),

      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(
          Easing.cubic,
        ),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [
    delay,
    distance,
    duration,
    opacity,
    translateY,
  ]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,

          transform: [
            {
              translateY,
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}