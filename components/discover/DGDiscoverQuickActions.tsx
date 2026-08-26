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

export type DiscoverQuickAction =
  | 'sell'
  | 'post'
  | 'auction'
  | 'job';

type ActionItem = {
  key: DiscoverQuickAction;

  title: string;

  icon: React.ComponentProps<
    typeof Ionicons
  >['name'];
};

const actions: ActionItem[] = [
  {
    key: 'sell',
    title: 'Sell',
    icon: 'storefront-outline',
  },
  {
    key: 'post',
    title: 'Post',
    icon: 'images-outline',
  },
  {
    key: 'auction',
    title: 'Auction',
    icon: 'hammer-outline',
  },
  {
    key: 'job',
    title: 'Job',
    icon: 'briefcase-outline',
  },
];

type Props = {
  onPress: (
    action: DiscoverQuickAction,
  ) => void;

  style?: StyleProp<ViewStyle>;
};

export default function DGDiscoverQuickActions({
  onPress,
  style,
}: Props) {
  return (
    <View style={[styles.container, style]}>
      {actions.map((action) => (
        <Pressable
          key={action.key}
          onPress={() =>
            onPress(action.key)
          }
          style={({ pressed }) => [
            styles.card,

            pressed &&
              styles.cardPressed,
          ]}
        >
          <View style={styles.icon}>
            <Ionicons
              name={action.icon}
              size={24}
              color="#9EF65A"
            />
          </View>

          <Text style={styles.title}>
            {action.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',

    flexDirection: 'row',

    justifyContent:
      'space-between',
  },

  card: {
    flex: 1,

    marginHorizontal: 4,

    minHeight: 94,

    borderRadius:
      radius.lg,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardRaised,

    alignItems: 'center',

    justifyContent: 'center',

    shadowColor: '#000',

    shadowOpacity: 0.08,

    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  cardPressed: {
    opacity: 0.82,

    transform: [
      {
        scale:
          motion.pressedScale,
      },
    ],
  },

  icon: {
    width: 50,
    height: 50,

    borderRadius: 18,

    backgroundColor:
      'rgba(158,246,90,0.08)',

    alignItems: 'center',

    justifyContent: 'center',
  },

  title: {
    marginTop: spacing.sm,

    color: textColor.primary,

    fontSize: 12,

    fontWeight: '800',
  },
});