import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  type RenderItemParams,
} from 'react-native-draggable-flatlist';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { MARKET_LISTING_MEDIA_MAX } from '../../types/marketListing';

import {
  alpha,
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

export type CreateListingPhotoItem = {
  id: string;
  uri: string;
};

type CreateListingPhotosProps = {
  photos: CreateListingPhotoItem[];
  disabled: boolean;
  uploading: boolean;
  uploadProgress: { current: number; total: number } | null;
  loadError: string | null;
  onAdd: () => void;
  onRemove: (photo: CreateListingPhotoItem) => void;
  onReorder: (photos: CreateListingPhotoItem[]) => void;
  onRetryLoad: () => void;
  onDragSessionChange?: (active: boolean) => void;
};

export default function CreateListingPhotos({
  photos,
  disabled,
  uploading,
  uploadProgress,
  loadError,
  onAdd,
  onRemove,
  onReorder,
  onRetryLoad,
  onDragSessionChange,
}: CreateListingPhotosProps) {
  const remaining = MARKET_LISTING_MEDIA_MAX - photos.length;
  const canAdd =
    !disabled &&
    !uploading &&
    remaining > 0 &&
    !loadError;

  return (
    <View style={styles.wrap}>
      <View style={styles.headingRow}>
        <Text style={styles.section}>Photos</Text>
        <Text style={styles.count}>
          {photos.length} / {MARKET_LISTING_MEDIA_MAX}
        </Text>
      </View>

      <Text style={styles.hint}>Add up to 20 photos</Text>

      {loadError ? (
        <View style={styles.loadErrorCard}>
          <Text style={styles.loadErrorTitle}>
            Couldn't load photos
          </Text>
          <Text style={styles.loadErrorBody}>{loadError}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading photos"
            onPress={onRetryLoad}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.retryLabel}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {!loadError && photos.length === 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add photos"
          accessibilityHint="Choose up to 20 photos from your library."
          disabled={!canAdd}
          onPress={onAdd}
          style={({ pressed }) => [
            styles.addEmpty,
            pressed && canAdd && styles.pressed,
            !canAdd && styles.disabled,
          ]}
        >
          <Ionicons
            name="images-outline"
            size={18}
            color={
              canAdd
                ? palette.opportunityGreen
                : textColor.muted
            }
          />
          <View style={styles.addCopy}>
            <Text style={styles.addTitle}>Add photos</Text>
            <Text style={styles.addSubtitle}>
              First photo becomes the cover
            </Text>
          </View>
        </Pressable>
      ) : null}

      {!loadError && photos.length > 0 ? (
        <DraggableFlatList
          horizontal
          data={photos}
          keyExtractor={(item) => item.id}
          extraData={`${disabled}:${uploading}:${photos.length}`}
          autoscrollThreshold={48}
          autoscrollSpeed={80}
          dragItemOverflow
          onDragBegin={() => {
            onDragSessionChange?.(true);
          }}
          onRelease={() => {
            onDragSessionChange?.(false);
          }}
          onDragEnd={({ data }) => {
            onDragSessionChange?.(false);

            const unchanged = data.every(
              (item, index) => item.id === photos[index]?.id,
            );

            if (unchanged || disabled || uploading) {
              return;
            }

            onReorder(data);
          }}
          renderItem={({
            item,
            drag,
            isActive,
            getIndex,
          }: RenderItemParams<CreateListingPhotoItem>) => {
            const index = getIndex() ?? 0;
            const isCover = index === 0;
            const canDrag = !disabled && !uploading;

            return (
              <View style={styles.item}>
                <ScaleDecorator>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={
                      isCover
                        ? `Cover photo ${index + 1} of ${photos.length}. Press and hold to reorder.`
                        : `Listing photo ${index + 1} of ${photos.length}. Press and hold to reorder.`
                    }
                    accessibilityHint="Press and hold, then drag to change photo order."
                    activeOpacity={0.92}
                    delayLongPress={280}
                    disabled={!canDrag || isActive}
                    onLongPress={drag}
                    style={styles.frame}
                  >
                    <Image
                      source={{ uri: item.uri }}
                      style={[
                        styles.thumb,
                        isActive && styles.thumbActive,
                      ]}
                      resizeMode="cover"
                      accessibilityIgnoresInvertColors
                    />

                    {isCover ? (
                      <View style={styles.coverBadge} pointerEvents="none">
                        <Text style={styles.coverLabel}>Cover</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                </ScaleDecorator>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove photo ${index + 1}`}
                  disabled={disabled || uploading}
                  hitSlop={6}
                  onPress={() => {
                    onRemove(item);
                  }}
                  style={({ pressed }) => [
                    styles.remove,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="close"
                    size={14}
                    color={textColor.primary}
                  />
                </Pressable>
              </View>
            );
          }}
          ListFooterComponent={
            remaining > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add photos"
                disabled={!canAdd}
                onPress={onAdd}
                style={({ pressed }) => [
                  styles.addTile,
                  pressed && canAdd && styles.pressed,
                  !canAdd && styles.disabled,
                ]}
              >
                <Ionicons
                  name="add"
                  size={22}
                  color={
                    canAdd
                      ? palette.opportunityGreen
                      : textColor.muted
                  }
                />
                <Text style={styles.addTileLabel}>Add</Text>
              </Pressable>
            ) : null
          }
          ListFooterComponentStyle={styles.footer}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.strip}
          containerStyle={styles.listContainer}
          keyboardShouldPersistTaps="handled"
        />
      ) : null}

      {uploading && uploadProgress ? (
        <Text style={styles.progress}>
          {`Uploading ${uploadProgress.current} of ${uploadProgress.total}…`}
        </Text>
      ) : null}
    </View>
  );
}

const THUMB = 88;

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },

  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  section: {
    color: textColor.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  count: {
    color: textColor.secondary,
    fontSize: 12,
    fontWeight: '700',
  },

  hint: {
    color: textColor.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  lockedCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardSoft,
  },

  lockedIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: alpha.white08,
    alignItems: 'center',
    justifyContent: 'center',
  },

  lockedCopy: {
    flex: 1,
    minWidth: 0,
  },

  lockedTitle: {
    color: textColor.secondary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },

  lockedBody: {
    marginTop: 3,
    color: textColor.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  loadErrorCard: {
    padding: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    gap: spacing.xs,
  },

  loadErrorTitle: {
    color: textColor.primary,
    fontSize: 15,
    fontWeight: '800',
  },

  loadErrorBody: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  retryButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },

  retryLabel: {
    color: palette.opportunityGreen,
    fontSize: 14,
    fontWeight: '800',
  },

  addEmpty: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: alpha.green20,
    backgroundColor: surface.cardRaised,
  },

  addCopy: {
    flex: 1,
    gap: 1,
  },

  addTitle: {
    color: textColor.primary,
    fontSize: 15,
    fontWeight: '800',
  },

  addSubtitle: {
    color: textColor.muted,
    fontSize: 12,
    fontWeight: '600',
  },

  strip: {
    flexGrow: 0,
    alignItems: 'flex-start',
    paddingVertical: 6,
    paddingRight: spacing.sm,
  },

  listContainer: {
    flexGrow: 0,
    overflow: 'visible',
    height: THUMB + 12,
  },

  item: {
    width: THUMB,
    height: THUMB,
    marginRight: spacing.sm,
    flexGrow: 0,
    flexShrink: 0,
  },

  footer: {
    flexGrow: 0,
    flexShrink: 0,
  },

  frame: {
    width: THUMB,
    height: THUMB,
  },

  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: radius.md,
    backgroundColor: alpha.white05,
    borderWidth: 1,
    borderColor: alpha.white08,
  },

  thumbActive: {
    borderColor: palette.opportunityGreen,
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

  remove: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.black56,
  },

  addTile: {
    width: THUMB,
    height: THUMB,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha.green20,
    backgroundColor: surface.cardRaised,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  addTileLabel: {
    color: palette.opportunityGreen,
    fontSize: 12,
    fontWeight: '800',
  },

  progress: {
    color: palette.opportunityGreen,
    fontSize: 13,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.85,
  },

  disabled: {
    opacity: 0.55,
  },
});
