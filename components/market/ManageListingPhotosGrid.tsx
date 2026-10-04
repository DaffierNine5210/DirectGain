import { Ionicons } from '@expo/vector-icons';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type AccessibilityActionEvent,
  type LayoutChangeEvent,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import type { MarketListingMediaPresentation } from '../../types/marketListing';

import {
  alpha,
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

export const MANAGE_PHOTOS_GRID_COLUMNS = 3;
const GRID_GAP = spacing.xs;
const LONG_PRESS_MS = 280;
const SHIFT_MS = 180;
const LIFT_SCALE = 1.05;

type ManageListingPhotosGridProps = {
  photos: MarketListingMediaPresentation[];
  selectedId: string | null;
  busy: boolean;
  canAdd: boolean;
  onSelect: (photo: MarketListingMediaPresentation) => void;
  onAdd: () => void;
  onReorder: (photos: MarketListingMediaPresentation[]) => void;
  onDragSessionChange?: (active: boolean) => void;
};

function visualIndex(
  origin: number,
  from: number,
  to: number,
): number {
  'worklet';

  if (from < 0 || from === to) {
    return origin;
  }

  if (origin === from) {
    return to;
  }

  if (from < to) {
    if (origin > from && origin <= to) {
      return origin - 1;
    }

    return origin;
  }

  if (origin >= to && origin < from) {
    return origin + 1;
  }

  return origin;
}

function slotX(
  index: number,
  tileSize: number,
  gap: number,
  columns: number,
): number {
  'worklet';

  return (index % columns) * (tileSize + gap);
}

function slotY(
  index: number,
  tileSize: number,
  gap: number,
  columns: number,
): number {
  'worklet';

  return Math.floor(index / columns) * (tileSize + gap);
}

function clampSlotIndex(
  centerX: number,
  centerY: number,
  tileSize: number,
  gap: number,
  columns: number,
  count: number,
): number {
  'worklet';

  const stride = tileSize + gap;

  if (stride <= 0 || count <= 0) {
    return 0;
  }

  const maxIndex = count - 1;
  const maxRow = Math.floor(maxIndex / columns);
  let col = Math.floor(centerX / stride);
  let row = Math.floor(centerY / stride);

  if (col < 0) {
    col = 0;
  } else if (col > columns - 1) {
    col = columns - 1;
  }

  if (row < 0) {
    row = 0;
  } else if (row > maxRow) {
    row = maxRow;
  }

  let next = row * columns + col;

  if (next > maxIndex) {
    next = maxIndex;
  }

  if (next < 0) {
    next = 0;
  }

  return next;
}

function movePhoto(
  photos: MarketListingMediaPresentation[],
  from: number,
  to: number,
): MarketListingMediaPresentation[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= photos.length ||
    to >= photos.length
  ) {
    return photos;
  }

  const next = [...photos];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

const GridPhoto = memo(function GridPhoto({
  photo,
  index,
  count,
  selected,
  busy,
  dragEnabled,
  tileSize,
  columns,
  draggingSv,
  dragFromSv,
  hoverSv,
  transX,
  transY,
  tileSizeSv,
  gapSv,
  countSv,
  onSelect,
  onReorder,
  onDragSessionChange,
  photosRef,
}: {
  photo: MarketListingMediaPresentation;
  index: number;
  count: number;
  selected: boolean;
  busy: boolean;
  dragEnabled: boolean;
  tileSize: number;
  columns: number;
  draggingSv: SharedValue<number>;
  dragFromSv: SharedValue<number>;
  hoverSv: SharedValue<number>;
  transX: SharedValue<number>;
  transY: SharedValue<number>;
  tileSizeSv: SharedValue<number>;
  gapSv: SharedValue<number>;
  countSv: SharedValue<number>;
  onSelect: (photo: MarketListingMediaPresentation) => void;
  onReorder: (photos: MarketListingMediaPresentation[]) => void;
  onDragSessionChange?: (active: boolean) => void;
  photosRef: React.MutableRefObject<MarketListingMediaPresentation[]>;
}) {
  const [failed, setFailed] = useState(false);
  const posX = useSharedValue(slotX(index, tileSize, GRID_GAP, columns));
  const posY = useSharedValue(slotY(index, tileSize, GRID_GAP, columns));
  const callbacksRef = useRef({
    onSelect,
    onReorder,
    onDragSessionChange,
    photo,
  });
  callbacksRef.current = {
    onSelect,
    onReorder,
    onDragSessionChange,
    photo,
  };

  useEffect(() => {
    posX.value = slotX(index, tileSize, GRID_GAP, columns);
    posY.value = slotY(index, tileSize, GRID_GAP, columns);
  }, [columns, index, posX, posY, tileSize]);

  useAnimatedReaction(
    () => ({
      dragging: draggingSv.value,
      from: dragFromSv.value,
      to: hoverSv.value,
      tile: tileSizeSv.value,
      gap: gapSv.value,
    }),
    (curr) => {
      if (curr.tile <= 0) {
        return;
      }

      const from = curr.dragging === 1 ? curr.from : -1;
      const vis = visualIndex(index, from, curr.to);

      if (curr.dragging === 1 && index === curr.from) {
        return;
      }

      posX.value = withTiming(slotX(vis, curr.tile, curr.gap, columns), {
        duration: SHIFT_MS,
      });
      posY.value = withTiming(slotY(vis, curr.tile, curr.gap, columns), {
        duration: SHIFT_MS,
      });
    },
    [columns, index],
  );

  const animatedStyle = useAnimatedStyle(() => {
    const dragged =
      draggingSv.value === 1 && dragFromSv.value === index;

    return {
      zIndex: dragged ? 40 : 1,
      transform: [
        {
          translateX: posX.value + (dragged ? transX.value : 0),
        },
        {
          translateY: posY.value + (dragged ? transY.value : 0),
        },
        {
          scale: dragged ? LIFT_SCALE : 1,
        },
      ],
    };
  });

  const coverStyle = useAnimatedStyle(() => {
    const from = draggingSv.value === 1 ? dragFromSv.value : -1;
    const vis = visualIndex(index, from, hoverSv.value);

    return {
      opacity: vis === 0 ? 1 : 0,
    };
  });

  const beginDrag = () => {
    const current = callbacksRef.current;
    current.onSelect(current.photo);
    current.onDragSessionChange?.(true);
  };

  const finishDrag = (from: number, to: number) => {
    const current = callbacksRef.current;
    current.onDragSessionChange?.(false);

    if (from === to) {
      return;
    }

    const next = movePhoto(photosRef.current, from, to);

    if (next === photosRef.current) {
      return;
    }

    current.onReorder(next);
  };

  const cancelDrag = () => {
    callbacksRef.current.onDragSessionChange?.(false);
  };

  const selectPhoto = () => {
    const current = callbacksRef.current;
    current.onSelect(current.photo);
  };

  const composed = useMemo(() => {
    const tap = Gesture.Tap().onEnd(() => {
      runOnJS(selectPhoto)();
    });

    const pan = Gesture.Pan()
      .enabled(dragEnabled)
      .maxPointers(1)
      .activateAfterLongPress(LONG_PRESS_MS)
      .onStart(() => {
        dragFromSv.value = index;
        hoverSv.value = index;
        transX.value = 0;
        transY.value = 0;
        draggingSv.value = 1;
        runOnJS(beginDrag)();
      })
      .onUpdate((event) => {
        transX.value = event.translationX;
        transY.value = event.translationY;

        const tile = tileSizeSv.value;
        const gap = gapSv.value;
        const originX = slotX(index, tile, gap, columns);
        const originY = slotY(index, tile, gap, columns);

        hoverSv.value = clampSlotIndex(
          originX + tile / 2 + event.translationX,
          originY + tile / 2 + event.translationY,
          tile,
          gap,
          columns,
          countSv.value,
        );
      })
      .onEnd(() => {
        const from = dragFromSv.value;
        const to = hoverSv.value;
        transX.value = 0;
        transY.value = 0;
        draggingSv.value = 0;
        dragFromSv.value = -1;
        hoverSv.value = -1;
        runOnJS(finishDrag)(from, to);
      })
      .onFinalize((_event, success) => {
        if (draggingSv.value !== 1) {
          return;
        }

        transX.value = 0;
        transY.value = 0;
        draggingSv.value = 0;
        dragFromSv.value = -1;
        hoverSv.value = -1;

        if (!success) {
          runOnJS(cancelDrag)();
        }
      });

    return Gesture.Exclusive(pan, tap);
  }, [
    columns,
    countSv,
    dragEnabled,
    dragFromSv,
    draggingSv,
    gapSv,
    hoverSv,
    index,
    tileSizeSv,
    transX,
    transY,
  ]);
  const label = `Listing photo ${index + 1} of ${count}`;
  const accessibilityActions = useMemo(() => {
    const actions: { name: string; label: string }[] = [];

    if (!dragEnabled || busy) {
      return actions;
    }

    if (index > 0) {
      actions.push({
        name: 'makeCover',
        label: 'Make cover',
      });
      actions.push({
        name: 'moveEarlier',
        label: 'Move earlier',
      });
    }

    if (index < count - 1) {
      actions.push({
        name: 'moveLater',
        label: 'Move later',
      });
    }

    return actions;
  }, [busy, count, dragEnabled, index]);

  const handleAccessibilityAction = (
    event: AccessibilityActionEvent,
  ) => {
    if (busy || !dragEnabled) {
      return;
    }

    const action = event.nativeEvent.actionName;
    let to = index;

    if (action === 'makeCover') {
      to = 0;
    } else if (action === 'moveEarlier') {
      to = index - 1;
    } else if (action === 'moveLater') {
      to = index + 1;
    } else {
      return;
    }

    const next = movePhoto(photosRef.current, index, to);

    if (next === photosRef.current) {
      return;
    }

    onSelect(photo);
    onReorder(next);
  };

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        accessible
        accessibilityRole="button"
        accessibilityLabel={
          selected ? `${label}, selected` : label
        }
        accessibilityHint="Double tap to select. Hold and drag to reorder. Use accessibility actions to make cover or move this photo."
        accessibilityState={{
          selected,
          disabled: busy,
        }}
        accessibilityActions={accessibilityActions}
        onAccessibilityAction={handleAccessibilityAction}
        style={[
          styles.tile,
          selected && styles.tileSelected,
          {
            width: tileSize,
            height: tileSize,
          },
          animatedStyle,
        ]}
      >
        {failed ? (
          <View style={styles.fallback}>
            <Ionicons
              name="image-outline"
              size={22}
              color={textColor.muted}
            />
          </View>
        ) : (
          <Image
            source={{ uri: photo.signedUrl }}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
            onError={() => {
              setFailed(true);
            }}
            style={styles.image}
          />
        )}

        <Animated.View
          pointerEvents="none"
          style={[styles.coverBadge, coverStyle]}
        >
          <Text style={styles.coverLabel}>Cover</Text>
        </Animated.View>

        {selected ? (
          <View
            pointerEvents="none"
            style={styles.selectedMark}
          >
            <Ionicons
              name="checkmark"
              size={11}
              color={textColor.inverse}
            />
          </View>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
});

export default function ManageListingPhotosGrid({
  photos,
  selectedId,
  busy,
  canAdd,
  onSelect,
  onAdd,
  onReorder,
  onDragSessionChange,
}: ManageListingPhotosGridProps) {
  const photosRef = useRef(photos);
  photosRef.current = photos;

  const [gridWidth, setGridWidth] = useState(0);

  const draggingSv = useSharedValue(0);
  const dragFromSv = useSharedValue(-1);
  const hoverSv = useSharedValue(-1);
  const transX = useSharedValue(0);
  const transY = useSharedValue(0);
  const tileSizeSv = useSharedValue(0);
  const gapSv = useSharedValue<number>(GRID_GAP);
  const countSv = useSharedValue(photos.length);

  const tileSize =
    gridWidth > 0
      ? Math.floor(
          (gridWidth -
            GRID_GAP * (MANAGE_PHOTOS_GRID_COLUMNS - 1)) /
            MANAGE_PHOTOS_GRID_COLUMNS,
        )
      : 0;

  useEffect(() => {
    countSv.value = photos.length;
  }, [countSv, photos.length]);

  useEffect(() => {
    tileSizeSv.value = tileSize;
    gapSv.value = GRID_GAP;
  }, [gapSv, tileSize, tileSizeSv]);

  const cellCount = photos.length + (canAdd ? 1 : 0);
  const rows = Math.max(
    1,
    Math.ceil(cellCount / MANAGE_PHOTOS_GRID_COLUMNS),
  );
  const gridHeight =
    tileSize > 0
      ? rows * tileSize + GRID_GAP * Math.max(0, rows - 1)
      : 0;
  const dragEnabled = !busy && photos.length > 1;
  const addIndex = photos.length;

  const onGridLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.floor(event.nativeEvent.layout.width);

    if (nextWidth > 0 && nextWidth !== gridWidth) {
      setGridWidth(nextWidth);
    }
  };

  return (
    <View
      onLayout={onGridLayout}
      style={[
        styles.grid,
        gridHeight > 0 ? { height: gridHeight } : null,
      ]}
    >
      {tileSize > 0
        ? photos.map((photo, index) => (
            <GridPhoto
              key={photo.id}
              photo={photo}
              index={index}
              count={photos.length}
              selected={photo.id === selectedId}
              busy={busy}
              dragEnabled={dragEnabled}
              tileSize={tileSize}
              columns={MANAGE_PHOTOS_GRID_COLUMNS}
              draggingSv={draggingSv}
              dragFromSv={dragFromSv}
              hoverSv={hoverSv}
              transX={transX}
              transY={transY}
              tileSizeSv={tileSizeSv}
              gapSv={gapSv}
              countSv={countSv}
              onSelect={onSelect}
              onReorder={onReorder}
              onDragSessionChange={onDragSessionChange}
              photosRef={photosRef}
            />
          ))
        : null}

      {canAdd && tileSize > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add photos"
          accessibilityHint="Choose photos from your library. Remaining slots are limited to 20."
          disabled={busy}
          onPress={onAdd}
          style={({ pressed }) => [
            styles.addTile,
            {
              width: tileSize,
              height: tileSize,
              left: slotX(
                addIndex,
                tileSize,
                GRID_GAP,
                MANAGE_PHOTOS_GRID_COLUMNS,
              ),
              top: slotY(
                addIndex,
                tileSize,
                GRID_GAP,
                MANAGE_PHOTOS_GRID_COLUMNS,
              ),
            },
            pressed && !busy && styles.pressed,
            busy && styles.disabled,
          ]}
        >
          <Ionicons
            name="add"
            size={22}
            color={
              busy
                ? textColor.muted
                : palette.opportunityGreen
            }
          />
          <Text
            style={[
              styles.addLabel,
              busy && styles.addLabelBusy,
            ]}
          >
            Add
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    position: 'relative',
    width: '100%',
  },

  tile: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: alpha.white08,
    backgroundColor: surface.cardSoft,
  },

  tileSelected: {
    borderColor: palette.opportunityGreen,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: surface.cardSoft,
  },

  coverBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: alpha.black56,
    borderWidth: 1,
    borderColor: alpha.green28,
  },

  coverLabel: {
    color: palette.opportunityGreen,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  selectedMark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.opportunityGreen,
    borderWidth: 1,
    borderColor: alpha.black56,
  },

  addTile: {
    position: 'absolute',
    zIndex: 0,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha.green20,
    backgroundColor: surface.cardRaised,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  addLabel: {
    color: palette.opportunityGreen,
    fontSize: 12,
    fontWeight: '800',
  },

  addLabelBusy: {
    color: textColor.muted,
  },

  pressed: {
    opacity: 0.88,
  },

  disabled: {
    opacity: 0.55,
  },
});
