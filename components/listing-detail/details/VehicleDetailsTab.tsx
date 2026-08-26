import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../../theme/colors';
import type {
  VehicleDetails,
} from '../../../types/Listing';
import getVehicleSummary from '../../../utils/listing/getVehicleSummary';

import DetailRow, {
  type DetailRowItem,
} from './DetailRow';

type Props = {
  details: VehicleDetails;
};

export default function VehicleDetailsTab({
  details,
}: Props) {
  const [
    expanded,
    setExpanded,
  ] = useState(false);

  const detailItems: DetailRowItem[] = [
    {
      label: 'Year',
      value: String(details.year),
      icon: 'calendar-outline',
    },

    {
      label: 'Make',
      value: details.make,
      icon: 'car-sport-outline',
    },

    {
      label: 'Model',
      value: details.variant
        ? `${details.model} ${details.variant}`
        : details.model,
      icon: 'car-outline',
    },

    details.bodyType
      ? {
          label: 'Body',
          value: details.bodyType,
          icon: 'car-outline',
        }
      : null,

    details.kilometres !== undefined
      ? {
          label: 'Kilometres',
          value: `${details.kilometres.toLocaleString(
            'en-AU',
          )} km`,
          icon: 'speedometer-outline',
        }
      : null,

    details.transmission
      ? {
          label: 'Transmission',
          value: details.transmission,
          icon: 'settings-outline',
        }
      : null,

    details.fuelType
      ? {
          label: 'Fuel',
          value: details.fuelType,
          icon: 'water-outline',
        }
      : null,

    details.drivetrain
      ? {
          label: 'Drivetrain',
          value: details.drivetrain,
          icon: 'trail-sign-outline',
        }
      : null,

    details.engine
      ? {
          label: 'Engine',
          value: details.engine,
          icon: 'speedometer-outline',
        }
      : null,

    details.colour
      ? {
          label: 'Colour',
          value: details.colour,
          icon: 'color-palette-outline',
        }
      : null,

    details.registration
      ? {
          label: 'Registration',
          value: details.registration,
          icon: 'document-text-outline',
        }
      : null,
  ].filter(
    (
      item,
    ): item is DetailRowItem =>
      item !== null,
  );

  const summary =
    getVehicleSummary(details);

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          expanded
            ? 'Hide vehicle details'
            : 'View vehicle details'
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
            name="car-sport-outline"
            size={23}
            color={colors.primary}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.eyebrow}>
            VEHICLE
          </Text>

          <Text style={styles.title}>
            Vehicle details
          </Text>

          <Text
            numberOfLines={2}
            style={styles.summary}
          >
            {summary.join(
              '  •  ',
            )}
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
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Full specifications
            </Text>

            <Text style={styles.headerText}>
              Vehicle information supplied with this listing.
            </Text>
          </View>

          <View style={styles.list}>
            {detailItems.map(
              (
                item,
                index,
              ) => (
                <DetailRow
                  key={item.label}
                  item={item}
                  showDivider={
                    index !==
                    detailItems.length - 1
                  }
                />
              ),
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Collapse vehicle details"
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
                styles.collapseButtonText
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

    header: {
      paddingBottom: 10,
    },

    headerTitle: {
      color: colors.text,

      fontSize: 13,

      lineHeight: 18,

      fontWeight: '900',
    },

    headerText: {
      marginTop: 4,

      color:
        colors.textMuted,

      fontSize: 9,

      lineHeight: 14,

      fontWeight: '600',
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

    collapseButtonText: {
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