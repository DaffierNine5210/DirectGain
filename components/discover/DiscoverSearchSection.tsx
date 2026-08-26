import { Ionicons } from '@expo/vector-icons';
import {
  Keyboard,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import DGButton from '../DGButton';
import DGReveal from '../DGReveal';
import DGSearchBar from '../DGSearchBar';

import {
  alpha,
  palette,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../../theme/designSystem';

type DiscoverSearchSectionProps = {
  value: string;
  filterActive: boolean;

  locationName: string;
  locationRadius: string;

  onChangeText: (
    value: string,
  ) => void;

  onFilterPress: () => void;
  onClearFilter: () => void;

  onSubmit?: (
    query: string,
  ) => void;
};

export default function DiscoverSearchSection({
  value,
  filterActive,

  locationName,
  locationRadius,

  onChangeText,
  onFilterPress,
  onClearFilter,
  onSubmit,
}: DiscoverSearchSectionProps) {
  return (
    <DGReveal
      delay={110}
      duration={410}
      distance={10}
    >
      <View style={styles.container}>
        <DGSearchBar
          value={value}
          onChangeText={onChangeText}
          placeholder="Search listings, jobs or auctions"
          showFilter
          filterActive={
            filterActive
          }
          onFilterPress={
            onFilterPress
          }
          onSubmit={(query) => {
            Keyboard.dismiss();
            onSubmit?.(query);
          }}
        />

        {filterActive ? (
          <View
            style={
              styles.filterNotice
            }
          >
            <View
              style={
                styles.filterIcon
              }
            >
              <Ionicons
                name="options-outline"
                size={16}
                color={
                  palette.opportunityGreen
                }
              />
            </View>

            <View
              style={
                styles.filterCopy
              }
            >
              <Text
                style={
                  styles.filterTitle
                }
              >
                Local results
              </Text>

              <Text
                numberOfLines={1}
                style={
                  styles.filterDescription
                }
              >
                {locationName} ·{' '}
                {locationRadius}
              </Text>
            </View>

            <DGButton
              title="Clear"
              size="small"
              variant="ghost"
              onPress={
                onClearFilter
              }
            />
          </View>
        ) : null}

        <View
          style={styles.feedHeading}
        >
          <Text
            style={styles.feedEyebrow}
          >
            YOUR LOCAL FEED
          </Text>

          <Text
            style={styles.feedTitle}
          >
            Explore what matters to you.
          </Text>
        </View>
      </View>
    </DGReveal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',

    paddingHorizontal:
      spacing.lg,
  },

  filterNotice: {
    minHeight: 62,

    marginTop:
      spacing.sm,

    padding:
      spacing.sm,

    borderRadius:
      radius.md,

    borderWidth: 1,
    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardSoft,

    flexDirection: 'row',
    alignItems: 'center',
  },

  filterIcon: {
    width: 36,
    height: 36,

    borderRadius:
      radius.sm,

    backgroundColor:
      alpha.green06,

    alignItems: 'center',
    justifyContent: 'center',
  },

  filterCopy: {
    flex: 1,
    minWidth: 0,

    marginLeft:
      spacing.sm,
  },

  filterTitle: {
    color:
      textColor.primary,

    fontSize: 12,
    lineHeight: 16,

    fontWeight: '900',
  },

  filterDescription: {
    marginTop: 2,

    color:
      textColor.muted,

    fontSize: 10,
    lineHeight: 14,

    fontWeight: '600',
  },

  feedHeading: {
    marginTop:
      spacing.xl,

    marginBottom:
      spacing.xs,
  },

  feedEyebrow: {
    ...typography.eyebrow,

    color:
      palette.opportunityGreen,
  },

  feedTitle: {
    marginTop:
      spacing.xxs,

    color:
      textColor.primary,

    fontSize: 23,
    lineHeight: 29,

    fontWeight: '900',

    letterSpacing: -0.55,
  },
});