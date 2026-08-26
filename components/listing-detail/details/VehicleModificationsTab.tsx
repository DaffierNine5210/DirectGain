import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../../theme/colors';

type Props = {
  modifications: string[];
};

export default function VehicleModificationsTab({
  modifications,
}: Props) {
  const [
    expanded,
    setExpanded,
  ] = useState(false);

  const preview =
    modifications
      .slice(0, 3)
      .join(' • ');

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          expanded
            ? 'Hide vehicle modifications'
            : 'View vehicle modifications'
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
            name="construct-outline"
            size={23}
            color={colors.primary}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.eyebrow}>
            4X4 SETUP
          </Text>

          <View style={styles.titleRow}>
            <Text style={styles.title}>
              Modifications
            </Text>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {modifications.length}
              </Text>
            </View>
          </View>

          <Text
            numberOfLines={1}
            style={styles.summary}
          >
            {preview}
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
          <Text style={styles.panelTitle}>
            Seller-listed upgrades
          </Text>

          <Text style={styles.panelText}>
            Review modifications carefully and confirm important upgrades with
            the seller.
          </Text>

          <View style={styles.list}>
            {modifications.map(
              (
                modification,
                index,
              ) => (
                <View
                  key={modification}
                  style={[
                    styles.row,

                    index !==
                      modifications.length - 1 &&
                      styles.divider,
                  ]}
                >
                  <View style={styles.check}>
                    <Ionicons
                      name="checkmark"
                      size={13}
                      color="#081006"
                    />
                  </View>

                  <Text style={styles.rowText}>
                    {modification}
                  </Text>
                </View>
              ),
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Collapse vehicle modifications"
            onPress={() =>
              setExpanded(false)
            }
            style={({ pressed }) => [
              styles.collapseButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Text style={styles.collapseText}>
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

    titleRow: {
      flexDirection: 'row',

      alignItems: 'center',
    },

    title: {
      marginTop: 3,

      color: colors.text,

      fontSize: 17,

      lineHeight: 22,

      fontWeight: '900',
    },

    countBadge: {
      minWidth: 27,

      height: 22,

      marginTop: 3,

      marginLeft: 8,

      paddingHorizontal: 7,

      borderRadius: 8,

      borderWidth: 1,

      borderColor:
        'rgba(158, 246, 90, 0.20)',

      backgroundColor:
        'rgba(158, 246, 90, 0.08)',

      alignItems: 'center',

      justifyContent: 'center',
    },

    countText: {
      color: colors.primary,

      fontSize: 9,

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

    panelTitle: {
      color: colors.text,

      fontSize: 13,

      lineHeight: 18,

      fontWeight: '900',
    },

    panelText: {
      marginTop: 4,

      color:
        colors.textMuted,

      fontSize: 9,

      lineHeight: 14,

      fontWeight: '600',
    },

    list: {
      marginTop: 11,
    },

    row: {
      minHeight: 47,

      flexDirection: 'row',

      alignItems: 'center',
    },

    divider: {
      borderBottomWidth: 1,

      borderBottomColor:
        'rgba(255, 255, 255, 0.06)',
    },

    check: {
      width: 24,
      height: 24,

      marginRight: 10,

      borderRadius: 8,

      backgroundColor:
        colors.primary,

      alignItems: 'center',

      justifyContent: 'center',
    },

    rowText: {
      flex: 1,

      color: colors.text,

      fontSize: 11,

      lineHeight: 16,

      fontWeight: '800',
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