import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';

import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import DGExpandableSection from '../DGExpandableSection';

import {
  alpha,
  radius,
  spacing,
  surface,
  textColor,
} from '../../theme/designSystem';

type ProfilePanelIcon =
  React.ComponentProps<typeof Ionicons>['name'];

export type ProfilePanelMetric = {
  id: string;
  label: string;
  value: string | number;
};

type DGProfilePanelProps = {
  title: string;
  children: ReactNode;

  subtitle?: string;
  eyebrow?: string;
  icon?: ProfilePanelIcon;
  badgeText?: string;

  metrics?: ProfilePanelMetric[];

  expanded?: boolean;
  defaultExpanded?: boolean;

  onExpandedChange?: (
    expanded: boolean,
  ) => void;

  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export default function DGProfilePanel({
  title,
  children,

  subtitle,
  eyebrow,
  icon,
  badgeText,

  metrics = [],

  expanded,
  defaultExpanded,

  onExpandedChange,

  style,
  contentStyle,
}: DGProfilePanelProps) {
  const visibleMetrics =
    metrics.slice(0, 3);

  return (
    <DGExpandableSection
      title={title}
      subtitle={subtitle}
      eyebrow={eyebrow}
      icon={icon}
      badgeText={badgeText}
      expanded={expanded}
      defaultExpanded={
        defaultExpanded
      }
      onExpandedChange={
        onExpandedChange
      }
      style={style}
      contentStyle={[
        styles.content,
        contentStyle,
      ]}
    >
      {visibleMetrics.length > 0 ? (
        <View
          style={styles.metrics}
        >
          {visibleMetrics.map(
            (metric, index) => (
              <View
                key={metric.id}
                style={styles.metricWrapper}
              >
                <View
                  style={styles.metric}
                >
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                    style={
                      styles.metricValue
                    }
                  >
                    {metric.value}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={
                      styles.metricLabel
                    }
                  >
                    {metric.label}
                  </Text>
                </View>

                {index <
                visibleMetrics.length -
                  1 ? (
                  <View
                    style={
                      styles.metricDivider
                    }
                  />
                ) : null}
              </View>
            ),
          )}
        </View>
      ) : null}

      <View
        style={[
          styles.body,
          visibleMetrics.length > 0 &&
            styles.bodyWithMetrics,
        ]}
      >
        {children}
      </View>
    </DGExpandableSection>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal:
      spacing.md,
  },

  metrics: {
    width: '100%',

    minHeight: 84,

    paddingVertical:
      spacing.sm,

    borderRadius:
      radius.lg,

    borderWidth: 1,

    borderColor:
      alpha.white08,

    backgroundColor:
      surface.cardSoft,

    flexDirection: 'row',
  },

  metricWrapper: {
    flex: 1,

    flexDirection: 'row',

    alignItems: 'center',
  },

  metric: {
    flex: 1,

    minWidth: 0,

    paddingHorizontal:
      spacing.xs,

    alignItems: 'center',

    justifyContent: 'center',
  },

  metricValue: {
    maxWidth: '100%',

    color:
      textColor.primary,

    fontSize: 16,

    lineHeight: 20,

    fontWeight: '900',

    letterSpacing: -0.25,

    textAlign: 'center',
  },

  metricLabel: {
    maxWidth: '100%',

    marginTop: 3,

    color:
      textColor.muted,

    fontSize: 9,

    lineHeight: 13,

    fontWeight: '700',

    textAlign: 'center',
  },

  metricDivider: {
    width: 1,
    height: 38,

    backgroundColor:
      alpha.white08,
  },

  body: {
    width: '100%',
  },

  bodyWithMetrics: {
    marginTop:
      spacing.md,
  },
});