import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import type { ResolvedJobPhoto } from '../../types/jobs';

import {
  alpha,
  palette,
  radius,
  spacing,
} from '../../theme/designSystem';

type JobMediaGalleryProps = {
  photos: ResolvedJobPhoto[];
};

export default function JobMediaGallery({
  photos,
}: JobMediaGalleryProps) {
  const [
    selectedId,
    setSelectedId,
  ] = useState(photos[0]?.id ?? null);

  const [
    failedIds,
    setFailedIds,
  ] = useState<string[]>([]);

  useEffect(() => {
    setFailedIds([]);
    setSelectedId(photos[0]?.id ?? null);
  }, [photos]);

  const visible = photos.filter(
    (photo) => !failedIds.includes(photo.id),
  );

  if (visible.length === 0) {
    return null;
  }

  const selected =
    visible.find((photo) => photo.id === selectedId) ??
    visible[0];

  const selectedIndex = visible.findIndex(
    (photo) => photo.id === selected.id,
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <Image
          source={{ uri: selected.signedUrl }}
          style={styles.heroImage}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          accessibilityLabel={
            visible.length === 1
              ? 'Job photo'
              : `Photo ${selectedIndex + 1} of ${visible.length}`
          }
          onError={() => {
            setFailedIds((current) =>
              current.includes(selected.id)
                ? current
                : [...current, selected.id],
            );
          }}
        />
      </View>

      {visible.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbs}
        >
          {visible.map((photo, index) => {
            const isSelected = photo.id === selected.id;

            return (
              <Pressable
                key={photo.id}
                accessibilityRole="button"
                accessibilityLabel={`Show photo ${index + 1} of ${visible.length}`}
                accessibilityState={{
                  selected: isSelected,
                }}
                onPress={() => {
                  setSelectedId(photo.id);
                }}
                style={[
                  styles.thumbButton,
                  isSelected && styles.thumbSelected,
                ]}
              >
                <Image
                  source={{ uri: photo.signedUrl }}
                  style={styles.thumb}
                  resizeMode="cover"
                  accessibilityElementsHidden
                  onError={() => {
                    setFailedIds((current) =>
                      current.includes(photo.id)
                        ? current
                        : [...current, photo.id],
                    );
                  }}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

const THUMB = 56;

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },

  hero: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: alpha.white05,
    borderWidth: 1,
    borderColor: alpha.white08,
  },

  heroImage: {
    width: '100%',
    height: '100%',
  },

  thumbs: {
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },

  thumbButton: {
    width: THUMB,
    height: THUMB,
    borderRadius: radius.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: alpha.white08,
  },

  thumbSelected: {
    borderColor: palette.opportunityGreen,
  },

  thumb: {
    width: '100%',
    height: '100%',
  },
});
