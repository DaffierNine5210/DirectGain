import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../../theme/colors';

import DetailRow, {
  type DetailRowItem,
} from './DetailRow';

type Props = {
  category: string;
  subcategory: string;
  condition: string;

  pickupAvailable: boolean;
  deliveryAvailable: boolean;
};

export default function GeneralDetailsTab({
  category,
  subcategory,
  condition,
  pickupAvailable,
  deliveryAvailable,
}: Props) {
  const [
    expanded,
    setExpanded,
  ] = useState(false);

  const items: DetailRowItem[] = [
    {
      label: 'Category',
      value: category,
      icon: 'grid-outline',
    },

    {
      label: 'Type',
      value: subcategory,
      icon: 'pricetag-outline',
    },

    {
      label: 'Condition',
      value: condition,
      icon: 'sparkles-outline',
    },

    {
      label: 'Pickup',
      value: pickupAvailable
        ? 'Available'
        : 'Not available',
      icon: 'location-outline',
    },

    {
      label: 'Delivery',
      value: deliveryAvailable
        ? 'Available'
        : 'Not available',
      icon: 'car-outline',
    },
  ];

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          expanded
            ? 'Hide item details'
            : 'View item details'
        }
        accessibilityState={{
          expanded,
        }}
        onPress={() =>
          setExpanded(
            current => !current,
          )
        }
        style={({ pressed }) => [
          styles.tab,

          expanded &&
            styles.tabOpen,

          pressed &&
            styles.pressed,
        ]}
      >
        <View style={styles.icon}>
          <Ionicons
            name="information-circle-outline"
            size={23}
            color={colors.primary}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.eyebrow}>
            DETAILS
          </Text>

          <Text style={styles.title}>
            Item details
          </Text>

          <Text
            numberOfLines={1}
            style={styles.summary}
          >
            {subcategory}
            {'  •  '}
            {condition}
          </Text>
        </View>

        <View style={styles.action}>
          <Ionicons
            name={
              expanded
                ? 'chevron-up'
                : 'chevron-down'
            }
            size={20}
            color={colors.primary}
          />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.panel}>
          <View style={styles.list}>
            {items.map(
              (
                item,
                index,
              ) => (
                <DetailRow
                  key={item.label}
                  item={item}
                  showDivider={
                    index !==
                    items.length - 1
                  }
                />
              ),
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Collapse item details"
            onPress={() =>
              setExpanded(false)
            }
            style={({ pressed }) => [
              styles.collapseButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Text
              style={
                styles.collapseText
              }
            >
              Show less
            </Text>

            <Ionicons
              name="chevron-up"
              size={16}
              color={colors.primary}
            />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles =
  StyleSheet.create({
    tab: {
      minHeight: 108,

      padding: 15,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        'rgba(158, 246, 90, 0.16)',

      backgroundColor:
        'rgba(158, 246, 90, 0.035)',

      flexDirection: 'row',

      alignItems: 'center',
    },

    tabOpen: {
      borderColor:
        'rgba(158, 246, 90, 0.28)',

      backgroundColor:
        'rgba(158, 246, 90, 0.06)',
    },

    icon: {
      width: 48,
      height: 48,

      borderRadius: 15,

      backgroundColor:
        'rgba(158, 246, 90, 0.09)',

      alignItems: 'center',

      justifyContent: 'center',
    },

    content: {
      flex: 1,

      minWidth: 0,

      marginLeft: 13,

      marginRight: 9,
    },

    eyebrow: {
      color: colors.primary,

      fontSize: 8,

      lineHeight: 11,

      fontWeight: '900',

      letterSpacing: 1.5,
    },

    title: {
      marginTop: 3,

      color: colors.text,

      fontSize: 17,

      lineHeight: 22,

      fontWeight: '900',
    },

    summary: {
      marginTop: 5,

      color:
        colors.textMuted,

      fontSize: 9,

      lineHeight: 15,

      fontWeight: '700',
    },

    action: {
      width: 36,
      height: 36,

      borderRadius: 12,

      backgroundColor:
        'rgba(158, 246, 90, 0.07)',

      alignItems: 'center',

      justifyContent: 'center',
    },

    panel: {
      marginTop: 9,

      padding: 14,

      borderRadius: 19,

      borderWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.075)',

      backgroundColor:
        'rgba(255, 255, 255, 0.025)',
    },

    list: {
      width: '100%',
    },

    collapseButton: {
      height: 42,

      marginTop: 10,

      borderRadius: 13,

      borderWidth: 1,

      borderColor:
        'rgba(158, 246, 90, 0.14)',

      backgroundColor:
        'rgba(158, 246, 90, 0.04)',

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',
    },

    collapseText: {
      marginRight: 5,

      color: colors.primary,

      fontSize: 10,

      fontWeight: '900',
    },

    pressed: {
      opacity: 0.74,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },
  });