import {
  useEffect,
  useRef,
} from 'react';
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import {
  alpha,
  radius,
  surface,
} from '../theme/designSystem';

type DGSkeletonVariant =
  | 'line'
  | 'circle'
  | 'card'
  | 'image';

type DGSkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  variant?: DGSkeletonVariant;
  style?: StyleProp<ViewStyle>;
};

export default function DGSkeleton({
  width = '100%',
  height,
  borderRadius,
  variant = 'line',
  style,
}: DGSkeletonProps) {
  const shimmerAnimation = useRef(
    new Animated.Value(0),
  ).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(
        shimmerAnimation,
        {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(
            Easing.ease,
          ),
          useNativeDriver: true,
        },
      ),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [shimmerAnimation]);

  const resolvedHeight =
    height ??
    getDefaultHeight(variant);

  const resolvedRadius =
    borderRadius ??
    getDefaultRadius(
      variant,
      resolvedHeight,
    );

  const translateX =
    shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-220, 220],
    });

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.skeleton,
        {
          width,
          height: resolvedHeight,
          borderRadius:
            resolvedRadius,
        },
        style,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.shimmer,
          {
            transform: [
              {
                translateX,
              },
              {
                rotate: '12deg',
              },
            ],
          },
        ]}
      />
    </Animated.View>
  );
}

function getDefaultHeight(
  variant: DGSkeletonVariant,
) {
  switch (variant) {
    case 'circle':
      return 48;

    case 'card':
      return 170;

    case 'image':
      return 190;

    case 'line':
    default:
      return 14;
  }
}

function getDefaultRadius(
  variant: DGSkeletonVariant,
  height: number,
) {
  switch (variant) {
    case 'circle':
      return height / 2;

    case 'card':
      return radius.card;

    case 'image':
      return radius.lg;

    case 'line':
    default:
      return radius.pill;
  }
}

const styles = StyleSheet.create({
  skeleton: {
    position: 'relative',
    overflow: 'hidden',

    backgroundColor:
      surface.cardSoft,

    borderWidth: 1,
    borderColor:
      alpha.white04,
  },

  shimmer: {
    position: 'absolute',

    top: -40,
    bottom: -40,

    width: 95,

    backgroundColor:
      'rgba(255, 255, 255, 0.055)',
  },
});