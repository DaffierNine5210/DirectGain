import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { MAX_JOB_PHOTOS, type PendingJobPhoto } from '../../types/jobs';

import {
  alpha,
  palette,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

type CreateJobPhotosProps = {
  photos: PendingJobPhoto[];
  disabled: boolean;
  preparing: boolean;
  onAdd: () => void;
  onRemove: (localId: string) => void;
  onMoveLeft: (localId: string) => void;
  onMoveRight: (localId: string) => void;
};

export default function CreateJobPhotos({
  photos,
  disabled,
  preparing,
  onAdd,
  onRemove,
  onMoveLeft,
  onMoveRight,
}: CreateJobPhotosProps) {
  const canAdd =
    !disabled &&
    !preparing &&
    photos.length < MAX_JOB_PHOTOS;

  return (
    <View style={styles.wrap}>
      <View style={styles.headingRow}>
        <Text style={styles.section}>Photos</Text>
        {photos.length > 0 ? (
          <Text style={styles.count}>
            {photos.length}/{MAX_JOB_PHOTOS}
          </Text>
        ) : null}
      </View>

      <Text style={styles.hint}>
        Add up to 5 photos to show the work, site or workplace.
      </Text>

      {photos.length === 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add photos"
          accessibilityHint="Optional. Choose up to five photos from your library."
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
            <Text style={styles.addOptional}>Optional</Text>
          </View>
        </Pressable>
      ) : (
        <View style={styles.list}>
          {photos.map((photo, index) => {
            const isCover = index === 0;
            const canMoveLeft = index > 0 && !disabled;
            const canMoveRight =
              index < photos.length - 1 && !disabled;

            return (
              <View
                key={photo.localId}
                style={styles.item}
              >
                <View style={styles.frame}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.thumb}
                    resizeMode="cover"
                    accessibilityIgnoresInvertColors
                    accessibilityLabel={
                      isCover
                        ? `Cover photo ${index + 1} of ${photos.length}`
                        : `Photo ${index + 1} of ${photos.length}`
                    }
                  />

                  {isCover ? (
                    <View style={styles.coverBadge}>
                      <Text style={styles.coverLabel}>Cover</Text>
                    </View>
                  ) : null}

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove photo ${index + 1}`}
                    disabled={disabled}
                    hitSlop={8}
                    onPress={() => {
                      onRemove(photo.localId);
                    }}
                    style={({ pressed }) => [
                      styles.remove,
                      pressed && !disabled && styles.pressed,
                      disabled && styles.disabled,
                    ]}
                  >
                    <Ionicons
                      name="close"
                      size={14}
                      color={textColor.primary}
                    />
                  </Pressable>
                </View>

                <View style={styles.reorder}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Move photo ${index + 1} left`}
                    disabled={!canMoveLeft}
                    hitSlop={6}
                    onPress={() => {
                      onMoveLeft(photo.localId);
                    }}
                    style={({ pressed }) => [
                      styles.reorderButton,
                      pressed && canMoveLeft && styles.pressed,
                      !canMoveLeft && styles.disabled,
                    ]}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={16}
                      color={
                        canMoveLeft
                          ? textColor.primary
                          : textColor.muted
                      }
                    />
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Move photo ${index + 1} right`}
                    disabled={!canMoveRight}
                    hitSlop={6}
                    onPress={() => {
                      onMoveRight(photo.localId);
                    }}
                    style={({ pressed }) => [
                      styles.reorderButton,
                      pressed && canMoveRight && styles.pressed,
                      !canMoveRight && styles.disabled,
                    ]}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={
                        canMoveRight
                          ? textColor.primary
                          : textColor.muted
                      }
                    />
                  </Pressable>
                </View>
              </View>
            );
          })}

          {photos.length < MAX_JOB_PHOTOS ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add another photo"
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
          ) : null}
        </View>
      )}

      {preparing ? (
        <Text style={styles.preparing}>Preparing photos…</Text>
      ) : null}
    </View>
  );
}

const THUMB = 76;

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

  addEmpty: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: alpha.white08,
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

  addOptional: {
    color: textColor.muted,
    fontSize: 12,
    fontWeight: '600',
  },

  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  item: {
    width: THUMB,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.black56,
  },

  reorder: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },

  reorderButton: {
    flex: 1,
    minHeight: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.white05,
    borderWidth: 1,
    borderColor: alpha.white08,
  },

  addTile: {
    width: THUMB,
    height: THUMB,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
  },

  addTileLabel: {
    color: textColor.muted,
    fontSize: 11,
    fontWeight: '700',
  },

  preparing: {
    color: textColor.secondary,
    fontSize: 12,
    fontWeight: '600',
  },

  pressed: {
    opacity: 0.78,
  },

  disabled: {
    opacity: 0.55,
  },
});
