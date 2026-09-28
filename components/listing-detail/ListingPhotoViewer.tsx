import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ImageSourcePropType,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { palette } from '../../theme/designSystem';

const MIN_SCALE = 1;
const MAX_SCALE = 3.5;
const ZOOM_THRESHOLD = 1.02;
const PAGE_DISTANCE_RATIO = 0.22;
const PAGE_VELOCITY = 650;

type ListingPhotoViewerProps = {
  visible: boolean;
  photos: ImageSourcePropType[];
  initialIndex: number;
  onClose: () => void;
};

export default function ListingPhotoViewer({
  visible,
  photos,
  initialIndex,
  onClose,
}: ListingPhotoViewerProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const photoCount = photos.length;
  const boundedInitial = clampIndex(initialIndex, photoCount);

  const [currentIndex, setCurrentIndex] = useState(boundedInitial);

  const scale = useSharedValue(MIN_SCALE);
  const savedScale = useSharedValue(MIN_SCALE);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const pagerOffset = useSharedValue(-boundedInitial * width);
  const savedPagerOffset = useSharedValue(-boundedInitial * width);
  const indexValue = useSharedValue(boundedInitial);
  const startFocalX = useSharedValue(0);
  const startFocalY = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const nextIndex = clampIndex(initialIndex, photoCount);
    setCurrentIndex(nextIndex);
    indexValue.value = nextIndex;
    pagerOffset.value = -nextIndex * width;
    savedPagerOffset.value = -nextIndex * width;
    resetTransform();
  }, [
    visible,
    initialIndex,
    photoCount,
    width,
    indexValue,
    pagerOffset,
    savedPagerOffset,
  ]);

  function resetTransform() {
    scale.value = MIN_SCALE;
    savedScale.value = MIN_SCALE;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }

  function commitIndex(nextIndex: number) {
    const bounded = clampIndex(nextIndex, photoCount);
    setCurrentIndex(bounded);
  }

  const pinch = Gesture.Pinch()
    .onStart((event) => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      startFocalX.value = event.focalX;
      startFocalY.value = event.focalY;
      pagerOffset.value = -indexValue.value * width;
      savedPagerOffset.value = pagerOffset.value;
    })
    .onUpdate((event) => {
      const nextScale = clampScale(savedScale.value * event.scale);
      const scaleRatio = nextScale / savedScale.value;
      scale.value = nextScale;

      const focalShiftX = event.focalX - startFocalX.value;
      const focalShiftY = event.focalY - startFocalY.value;
      const originX = startFocalX.value - width / 2;
      const originY = startFocalY.value - height / 2;

      const nextX =
        savedTranslateX.value +
        focalShiftX +
        originX * (1 - scaleRatio);
      const nextY =
        savedTranslateY.value +
        focalShiftY +
        originY * (1 - scaleRatio);

      const bounded = clampTranslation(
        nextX,
        nextY,
        nextScale,
        width,
        height,
      );
      translateX.value = bounded.x;
      translateY.value = bounded.y;
    })
    .onEnd(() => {
      if (scale.value <= ZOOM_THRESHOLD) {
        scale.value = withTiming(MIN_SCALE);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedScale.value = MIN_SCALE;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        return;
      }

      savedScale.value = scale.value;
      const bounded = clampTranslation(
        translateX.value,
        translateY.value,
        scale.value,
        width,
        height,
      );
      translateX.value = withTiming(bounded.x);
      translateY.value = withTiming(bounded.y);
      savedTranslateX.value = bounded.x;
      savedTranslateY.value = bounded.y;
    });

  const pan = Gesture.Pan()
    .maxPointers(1)
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      savedPagerOffset.value = pagerOffset.value;
    })
    .onUpdate((event) => {
      if (scale.value > ZOOM_THRESHOLD) {
        const bounded = clampTranslation(
          savedTranslateX.value + event.translationX,
          savedTranslateY.value + event.translationY,
          scale.value,
          width,
          height,
        );
        translateX.value = bounded.x;
        translateY.value = bounded.y;
        return;
      }

      if (photoCount <= 1) {
        pagerOffset.value = 0;
        return;
      }

      pagerOffset.value = savedPagerOffset.value + event.translationX;
    })
    .onEnd((event) => {
      if (scale.value > ZOOM_THRESHOLD) {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
        return;
      }

      if (photoCount <= 1) {
        pagerOffset.value = withTiming(0);
        return;
      }

      let nextIndex = indexValue.value;

      if (
        event.translationX < -width * PAGE_DISTANCE_RATIO ||
        event.velocityX < -PAGE_VELOCITY
      ) {
        nextIndex += 1;
      } else if (
        event.translationX > width * PAGE_DISTANCE_RATIO ||
        event.velocityX > PAGE_VELOCITY
      ) {
        nextIndex -= 1;
      }

      nextIndex = clampIndex(nextIndex, photoCount);
      indexValue.value = nextIndex;
      pagerOffset.value = withTiming(-nextIndex * width);
      savedPagerOffset.value = -nextIndex * width;
      scale.value = MIN_SCALE;
      savedScale.value = MIN_SCALE;
      translateX.value = 0;
      translateY.value = 0;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
      runOnJS(commitIndex)(nextIndex);
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  const pagerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pagerOffset.value }],
  }));

  const zoomStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  if (photoCount === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={styles.root}>
        <View style={styles.background}>
          <GestureDetector gesture={composed}>
            <Animated.View
              style={[
                {
                  width: width * photoCount,
                  height,
                  flexDirection: 'row',
                },
                pagerStyle,
              ]}
            >
              {photos.map((photo, index) => (
                <Animated.View
                  key={`listing-photo-${index}`}
                  style={{ width, height }}
                >
                  <Animated.Image
                    source={photo}
                    resizeMode="contain"
                    accessibilityIgnoresInvertColors
                    style={[
                      {
                        width,
                        height,
                      },
                      index === currentIndex ? zoomStyle : null,
                    ]}
                  />
                </Animated.View>
              ))}
            </Animated.View>
          </GestureDetector>

          <View
            pointerEvents="box-none"
            style={[
              styles.chrome,
              {
                paddingTop: Math.max(insets.top, 12),
                paddingBottom: Math.max(insets.bottom, 12),
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close photos"
              hitSlop={8}
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="close"
                size={24}
                color={colors.text}
              />
            </Pressable>

            <View
              accessibilityLiveRegion="polite"
              style={styles.counter}
            >
              <Text style={styles.counterText}>
                {currentIndex + 1} / {photoCount}
              </Text>
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

function clampIndex(index: number, length: number) {
  'worklet';

  if (length <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(index, length - 1));
}

function clampScale(value: number) {
  'worklet';

  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
}

function clampTranslation(
  x: number,
  y: number,
  scale: number,
  width: number,
  height: number,
) {
  'worklet';

  const maxX = Math.max(0, (width * scale - width) / 2);
  const maxY = Math.max(0, (height * scale - height) / 2);

  return {
    x: Math.min(maxX, Math.max(-maxX, x)),
    y: Math.min(maxY, Math.max(-maxY, y)),
  };
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },

  background: {
    flex: 1,
    backgroundColor: '#000000',
  },

  chrome: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: 'rgba(8, 11, 9, 0.76)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  counter: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(158, 246, 90, 0.28)',
    backgroundColor: 'rgba(8, 11, 9, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  counterText: {
    color: palette.opportunityGreen,
    fontSize: 12,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
});
