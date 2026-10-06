import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type {
  MarketListingStatus,
  OwnMarketListingFeedItem,
} from '../../types/marketListing';

import {
  alpha,
  iconSize,
  palette,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

type OwnMarketListingRowProps = {
  item: OwnMarketListingFeedItem;
  title: string;
  priceLabel: string;
  statusLabel: string;
  locationLabel: string;
  dateLabel: string;
  onPress?: () => void;
};

function statusTone(
  status: MarketListingStatus,
): {
  color: string;
  backgroundColor: string;
  borderColor: string;
} {
  if (status === 'active') {
    return {
      color: palette.opportunityGreen,
      backgroundColor: alpha.green08,
      borderColor: alpha.green20,
    };
  }

  if (status === 'paused') {
    return {
      color: textColor.muted,
      backgroundColor: alpha.white05,
      borderColor: alpha.white10,
    };
  }

  if (status === 'sold') {
    return {
      color: textColor.secondary,
      backgroundColor: alpha.white04,
      borderColor: alpha.white08,
    };
  }

  if (status === 'reserved') {
    return {
      color: palette.warning,
      backgroundColor: alpha.white05,
      borderColor: alpha.white10,
    };
  }

  if (status === 'removed') {
    return {
      color: textColor.muted,
      backgroundColor: alpha.white03,
      borderColor: alpha.white08,
    };
  }

  return {
    color: textColor.secondary,
    backgroundColor: alpha.white04,
    borderColor: alpha.white08,
  };
}

function CoverImage({
  uri,
  accessibilityLabel,
}: {
  uri: string;
  accessibilityLabel: string;
}) {
  const [phase, setPhase] = useState<
    'loading' | 'ready' | 'failed'
  >('loading');

  useEffect(() => {
    setPhase('loading');
  }, [uri]);

  return (
    <View style={styles.thumb}>
      {phase === 'failed' ? (
        <View style={styles.thumbFallback}>
          <Ionicons
            name="image-outline"
            size={22}
            color={textColor.muted}
          />
        </View>
      ) : (
        <Image
          accessibilityLabel={accessibilityLabel}
          source={{ uri }}
          resizeMode="cover"
          onLoad={() => {
            setPhase('ready');
          }}
          onError={() => {
            setPhase('failed');
          }}
          style={[
            styles.thumbImage,
            phase !== 'ready' && styles.thumbHidden,
          ]}
        />
      )}

      {phase === 'loading' ? (
        <View
          pointerEvents="none"
          style={styles.thumbLoading}
        />
      ) : null}
    </View>
  );
}

export default function OwnMarketListingRow({
  item,
  title,
  priceLabel,
  statusLabel,
  locationLabel,
  dateLabel,
  onPress,
}: OwnMarketListingRowProps) {
  const cover = item.coverSignedUrl?.trim() ?? '';
  const tone = statusTone(item.listing.status);
  const accessibilityLabel = [
    title,
    statusLabel,
    priceLabel,
    locationLabel,
    dateLabel,
  ]
    .filter(Boolean)
    .join('. ');

  const body = (
    <>
      {cover ? (
        <CoverImage
          uri={cover}
          accessibilityLabel={`${title} photo`}
        />
      ) : (
        <View
          accessibilityLabel={`${title}. No photo`}
          style={styles.thumb}
        >
          <View style={styles.thumbFallback}>
            <Ionicons
              name="image-outline"
              size={22}
              color={textColor.muted}
            />
          </View>
        </View>
      )}

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text
            numberOfLines={2}
            style={styles.title}
          >
            {title}
          </Text>

          <View
            style={[
              styles.pill,
              {
                backgroundColor: tone.backgroundColor,
                borderColor: tone.borderColor,
              },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                { color: tone.color },
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        </View>

        <Text style={styles.price}>{priceLabel}</Text>

        {locationLabel ? (
          <Text
            numberOfLines={1}
            style={styles.meta}
          >
            {locationLabel}
          </Text>
        ) : null}

        {dateLabel ? (
          <Text
            numberOfLines={1}
            style={styles.date}
          >
            {dateLabel}
          </Text>
        ) : null}
      </View>

      {onPress ? (
        <View style={styles.chevron}>
          <Ionicons
            name="chevron-forward"
            size={iconSize.sm}
            color={textColor.muted}
          />
        </View>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.pressed,
        ]}
      >
        {body}
      </Pressable>
    );
  }

  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={accessibilityLabel}
      style={styles.card}
    >
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.card,
  },

  pressed: {
    opacity: 0.9,
  },

  thumb: {
    width: 92,
    height: 92,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: surface.cardSoft,
  },

  thumbImage: {
    width: '100%',
    height: '100%',
  },

  thumbHidden: {
    opacity: 0,
  },

  thumbLoading: {
    ...StyleSheet.absoluteFill,
    backgroundColor: alpha.white05,
  },

  thumbFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 2,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },

  title: {
    flex: 1,
    color: textColor.primary,
    fontSize: typography.headingSmall.fontSize,
    lineHeight: 23,
    fontWeight: typography.headingSmall.fontWeight,
    letterSpacing: typography.headingSmall.letterSpacing,
  },

  pill: {
    marginTop: 2,
    flexShrink: 0,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },

  pillText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  price: {
    marginTop: 1,
    color: palette.opportunityGreen,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
    letterSpacing: -0.2,
  },

  meta: {
    color: textColor.secondary,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: 16,
    fontWeight: '600',
  },

  date: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '600',
  },

  chevron: {
    width: 18,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
