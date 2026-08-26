import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import {
  alpha,
  motion,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

import {
  selectionHaptic,
} from '../../utils/haptics';

type QuickStatIcon =
  React.ComponentProps<typeof Ionicons>['name'];

export type DGProfileQuickStat = {
  id: string;
  label: string;
  value: string | number;
  icon: QuickStatIcon;
  accessibilityLabel?: string;
  onPress?: () => void;
};

type DGProfileQuickStatsProps = {
  items: DGProfileQuickStat[];
  style?: StyleProp<ViewStyle>;
};

export default function DGProfileQuickStats({
  items,
  style,
}: DGProfileQuickStatsProps) {
  const visibleItems = items.slice(0, 4);

  return (
    <View
      style={[
        styles.container,
        style,
      ]}
    >
      {visibleItems.map(
        (item, index) => (
          <View
            key={item.id}
            style={styles.itemWrapper}
          >
            <StatItem item={item} />

            {index <
            visibleItems.length - 1 ? (
              <View
                style={styles.divider}
              />
            ) : null}
          </View>
        ),
      )}
    </View>
  );
}

type StatItemProps = {
  item: DGProfileQuickStat;
};

function StatItem({
  item,
}: StatItemProps) {
  async function handlePress() {
    if (!item.onPress) {
      return;
    }

    await selectionHaptic();
    item.onPress();
  }

  const content = (
    <>
      <View style={styles.iconContainer}>
        <Ionicons
          name={item.icon}
          size={17}
          color={textColor.secondary}
        />
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.78}
        style={styles.value}
      >
        {item.value}
      </Text>

      <Text
        numberOfLines={1}
        style={styles.label}
      >
        {item.label}
      </Text>
    </>
  );

  if (!item.onPress) {
    return (
      <View style={styles.item}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        item.accessibilityLabel ??
        `${item.value} ${item.label}`
      }
      onPress={handlePress}
      style={({ pressed }) => [
        styles.item,
        pressed && styles.pressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',

    minHeight: 112,

    paddingVertical:
      spacing.sm,

    borderRadius:
      radius.card,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardRaised,

    flexDirection: 'row',

    shadowColor: '#000000',

    shadowOpacity: 0.1,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 2,
  },

  itemWrapper: {
    flex: 1,

    flexDirection: 'row',

    alignItems: 'center',
  },

  item: {
    flex: 1,

    minWidth: 0,

    paddingHorizontal:
      spacing.xs,

    alignItems: 'center',

    justifyContent: 'center',
  },

  iconContainer: {
    width: 32,
    height: 32,

    borderRadius:
      radius.sm,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      'rgba(255, 255, 255, 0.025)',

    alignItems: 'center',

    justifyContent: 'center',
  },

  value: {
    maxWidth: '100%',

    marginTop:
      spacing.xs,

    color:
      textColor.primary,

    fontSize: 17,

    lineHeight: 21,

    fontWeight: '900',

    letterSpacing: -0.3,

    textAlign: 'center',
  },

  label: {
    maxWidth: '100%',

    marginTop: 2,

    color:
      textColor.muted,

    fontSize: 9,

    lineHeight: 13,

    fontWeight: '700',

    textAlign: 'center',
  },

  divider: {
    width: 1,
    height: 58,

    backgroundColor:
      alpha.white08,
  },

  pressed: {
    opacity: 0.78,

    transform: [
      {
        scale:
          motion.pressedScale,
      },
    ],
  },
});