import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  UIManager,
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
  typography,
} from '../theme/designSystem';

import {
  selectionHaptic,
} from '../utils/haptics';

type DGExpandableSectionIcon =
  React.ComponentProps<
    typeof Ionicons
  >['name'];

export type DGExpandableSectionProps = {
  title: string;
  children: ReactNode;

  subtitle?: string;
  eyebrow?: string;
  icon?: DGExpandableSectionIcon;

  defaultExpanded?: boolean;
  expanded?: boolean;

  badgeText?: string;

  onExpandedChange?: (
    expanded: boolean,
  ) => void;

  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;

  accessibilityLabel?: string;
};

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(
    true,
  );
}

export default function DGExpandableSection({
  title,
  children,

  subtitle,
  eyebrow,
  icon,

  defaultExpanded = false,
  expanded,

  badgeText,

  onExpandedChange,

  style,
  contentStyle,

  accessibilityLabel,
}: DGExpandableSectionProps) {
  const [
    internalExpanded,
    setInternalExpanded,
  ] = useState(defaultExpanded);

  const contentOpacity = useRef(
    new Animated.Value(
      defaultExpanded ? 1 : 0,
    ),
  ).current;

  const contentTranslateY = useRef(
    new Animated.Value(
      defaultExpanded ? 0 : -10,
    ),
  ).current;

  const contentScale = useRef(
    new Animated.Value(
      defaultExpanded ? 1 : 0.985,
    ),
  ).current;

  const chevronScale = useRef(
    new Animated.Value(1),
  ).current;

  const isControlled =
    typeof expanded === 'boolean';

  const isExpanded = isControlled
    ? expanded
    : internalExpanded;

  useEffect(() => {
    contentOpacity.stopAnimation();
    contentTranslateY.stopAnimation();
    contentScale.stopAnimation();
    chevronScale.stopAnimation();

    Animated.parallel([
      Animated.timing(
        contentOpacity,
        {
          toValue:
            isExpanded ? 1 : 0,

          duration:
            isExpanded
              ? motion.standard + 80
              : motion.standard,

          easing: Easing.out(
            Easing.cubic,
          ),

          useNativeDriver: true,
        },
      ),

      Animated.timing(
        contentTranslateY,
        {
          toValue:
            isExpanded ? 0 : -10,

          duration:
            motion.standard + 80,

          easing: Easing.out(
            Easing.cubic,
          ),

          useNativeDriver: true,
        },
      ),

      Animated.timing(
        contentScale,
        {
          toValue:
            isExpanded
              ? 1
              : 0.985,

          duration:
            motion.standard + 80,

          easing: Easing.out(
            Easing.cubic,
          ),

          useNativeDriver: true,
        },
      ),

      Animated.sequence([
        Animated.timing(
          chevronScale,
          {
            toValue: 0.82,

            duration: 90,

            easing: Easing.out(
              Easing.quad,
            ),

            useNativeDriver: true,
          },
        ),

        Animated.spring(
          chevronScale,
          {
            toValue: 1,

            damping: 12,
            stiffness: 230,
            mass: 0.7,

            useNativeDriver: true,
          },
        ),
      ]),
    ]).start();
  }, [
    chevronScale,
    contentOpacity,
    contentScale,
    contentTranslateY,
    isExpanded,
  ]);

  function handleToggle() {
    const nextExpanded =
      !isExpanded;

    LayoutAnimation.configureNext({
      duration:
        motion.standard + 90,

      create: {
        type:
          LayoutAnimation.Types
            .easeInEaseOut,

        property:
          LayoutAnimation.Properties
            .opacity,
      },

      update: {
        type:
          LayoutAnimation.Types
            .easeInEaseOut,
      },

      delete: {
        type:
          LayoutAnimation.Types
            .easeInEaseOut,

        property:
          LayoutAnimation.Properties
            .opacity,
      },
    });

    void selectionHaptic();

    if (!isControlled) {
      setInternalExpanded(
        nextExpanded,
      );
    }

    onExpandedChange?.(
      nextExpanded,
    );
  }

  return (
    <View
      style={[
        styles.container,

        isExpanded &&
          styles.expandedContainer,

        style,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel ??
          `${title}. ${
            isExpanded
              ? 'Collapse section'
              : 'Expand section'
          }`
        }
        accessibilityState={{
          expanded: isExpanded,
        }}
        onPress={handleToggle}
        style={({ pressed }) => [
          styles.header,

          pressed &&
            styles.pressedHeader,
        ]}
      >
        {icon ? (
          <View
            style={[
              styles.iconContainer,

              isExpanded &&
                styles.iconContainerExpanded,
            ]}
          >
            <Ionicons
              name={icon}
              size={20}
              color={
                isExpanded
                  ? textColor.primary
                  : textColor.secondary
              }
            />

            <View
              style={[
                styles.statusDot,

                isExpanded &&
                  styles.statusDotActive,
              ]}
            />
          </View>
        ) : null}

        <View
          style={styles.headingArea}
        >
          {eyebrow ? (
            <Text
              numberOfLines={1}
              style={styles.eyebrow}
            >
              {eyebrow}
            </Text>
          ) : null}

          <View style={styles.titleRow}>
            <Text
              numberOfLines={1}
              style={styles.title}
            >
              {title}
            </Text>

            {badgeText ? (
              <View
                style={[
                  styles.badge,

                  isExpanded &&
                    styles.badgeExpanded,
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={styles.badgeText}
                >
                  {badgeText}
                </Text>
              </View>
            ) : null}
          </View>

          {subtitle ? (
            <Text
              numberOfLines={
                isExpanded ? 2 : 1
              }
              style={styles.subtitle}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <Animated.View
          style={[
            styles.chevronContainer,

            isExpanded &&
              styles.chevronContainerExpanded,

            {
              transform: [
                {
                  scale:
                    chevronScale,
                },
              ],
            },
          ]}
        >
          <Ionicons
            name={
              isExpanded
                ? 'chevron-up'
                : 'chevron-down'
            }
            size={19}
            color={
              isExpanded
                ? textColor.primary
                : textColor.muted
            }
          />
        </Animated.View>
      </Pressable>

      {isExpanded ? (
        <Animated.View
          style={[
            styles.content,

            {
              opacity:
                contentOpacity,

              transform: [
                {
                  translateY:
                    contentTranslateY,
                },
                {
                  scale:
                    contentScale,
                },
              ],
            },

            contentStyle,
          ]}
        >
          <View style={styles.divider} />

          {children}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',

    borderRadius:
      radius.card,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardRaised,

    overflow: 'hidden',

    shadowColor: '#000000',

    shadowOpacity: 0.1,

    shadowRadius: 11,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 2,
  },

  expandedContainer: {
    borderColor:
      'rgba(255, 255, 255, 0.11)',

    shadowOpacity: 0.16,

    shadowRadius: 16,

    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 4,
  },

  header: {
    minHeight: 86,

    paddingHorizontal:
      spacing.md,

    paddingVertical:
      spacing.md,

    flexDirection: 'row',

    alignItems: 'center',
  },

  pressedHeader: {
    opacity: 0.88,

    transform: [
      {
        scale:
          motion.pressedScale,
      },
    ],
  },

  iconContainer: {
    position: 'relative',

    width: 44,
    height: 44,

    marginRight:
      spacing.sm,

    borderRadius:
      radius.md,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardSoft,

    alignItems: 'center',

    justifyContent: 'center',
  },

  iconContainerExpanded: {
    borderColor:
      'rgba(255, 255, 255, 0.12)',

    backgroundColor:
      'rgba(255, 255, 255, 0.04)',
  },

  statusDot: {
    position: 'absolute',

    right: 6,
    bottom: 6,

    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor:
      'rgba(255, 255, 255, 0.18)',
  },

  statusDotActive: {
    backgroundColor:
      '#9EF65A',

    shadowColor:
      '#9EF65A',

    shadowOpacity: 0.32,

    shadowRadius: 4,

    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  headingArea: {
    flex: 1,

    minWidth: 0,
  },

  eyebrow: {
    marginBottom: 5,

    ...typography.eyebrow,

    color:
      textColor.muted,
  },

  titleRow: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  title: {
    flexShrink: 1,

    color:
      textColor.primary,

    fontSize: 16,

    lineHeight: 21,

    fontWeight: '900',

    letterSpacing: -0.25,
  },

  badge: {
    minHeight: 24,

    marginLeft:
      spacing.xs,

    paddingHorizontal:
      spacing.xs,

    borderRadius:
      radius.pill,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardSoft,

    justifyContent: 'center',
  },

  badgeExpanded: {
    borderColor:
      'rgba(158, 246, 90, 0.18)',
  },

  badgeText: {
    color:
      textColor.primary,

    fontSize: 9,

    lineHeight: 12,

    fontWeight: '900',

    letterSpacing: 0.25,
  },

  subtitle: {
    marginTop: 6,

    color:
      textColor.secondary,

    fontSize: 11,

    lineHeight: 16,

    fontWeight: '600',
  },

  chevronContainer: {
    width: 38,
    height: 38,

    marginLeft:
      spacing.sm,

    borderRadius:
      radius.sm,

    borderWidth: 1,

    borderColor:
      alpha.white04,

    backgroundColor:
      'rgba(255, 255, 255, 0.024)',

    alignItems: 'center',

    justifyContent: 'center',
  },

  chevronContainerExpanded: {
    borderColor:
      alpha.white08,

    backgroundColor:
      'rgba(255, 255, 255, 0.045)',
  },

  content: {
    paddingHorizontal:
      spacing.md,

    paddingBottom:
      spacing.md,
  },

  divider: {
    height: 1,

    marginBottom:
      spacing.md,

    backgroundColor:
      alpha.white08,
  },
});