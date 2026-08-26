import {
  StyleSheet,
  View,
} from 'react-native';

import DGSkeleton from './DGSkeleton';

import {
  alpha,
  radius,
  spacing,
  surface,
} from '../theme/designSystem';

export default function DGDiscoverSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <DGSkeleton
            variant="circle"
            width={58}
            height={58}
          />

          <View style={styles.brandCopy}>
            <DGSkeleton
              width="72%"
              height={20}
            />

            <DGSkeleton
              width="48%"
              height={12}
              style={styles.smallGap}
            />
          </View>
        </View>

        <View style={styles.headerActions}>
          <DGSkeleton
            width={46}
            height={46}
            borderRadius={16}
          />

          <DGSkeleton
            width={46}
            height={46}
            borderRadius={16}
            style={styles.actionGap}
          />
        </View>
      </View>

      <DGSkeleton
        width="70%"
        height={40}
        borderRadius={20}
        style={styles.location}
      />

      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <DGSkeleton
            variant="circle"
            width={74}
            height={74}
          />

          <View style={styles.heroCopy}>
            <DGSkeleton
              width="92%"
              height={24}
            />

            <DGSkeleton
              width="68%"
              height={13}
              style={styles.smallGap}
            />
          </View>
        </View>

        <DGSkeleton
          width="86%"
          height={18}
          style={styles.heroLine}
        />

        <DGSkeleton
          width="48%"
          height={15}
          style={styles.mediumGap}
        />

        <View style={styles.divider} />

        <View style={styles.statsRow}>
          <DiscoverStatSkeleton />

          <DiscoverStatSkeleton />

          <DiscoverStatSkeleton />
        </View>

        <DGSkeleton
          width="100%"
          height={56}
          borderRadius={18}
          style={styles.heroButton}
        />
      </View>

      <View style={styles.searchRow}>
        <DGSkeleton
          width="82%"
          height={54}
          borderRadius={20}
        />

        <DGSkeleton
          width={54}
          height={54}
          borderRadius={20}
        />
      </View>

      <View style={styles.sectionHeading}>
        <View style={styles.sectionCopy}>
          <DGSkeleton
            width="48%"
            height={11}
          />

          <DGSkeleton
            width="76%"
            height={22}
            style={styles.smallGap}
          />
        </View>

        <DGSkeleton
          width={84}
          height={38}
          borderRadius={19}
        />
      </View>

      <View style={styles.horizontalCards}>
        <View style={styles.featureCard}>
          <DGSkeleton
            variant="image"
            height={164}
            borderRadius={0}
          />

          <View style={styles.cardCopy}>
            <DGSkeleton
              width="90%"
              height={16}
            />

            <DGSkeleton
              width="42%"
              height={20}
              style={styles.smallGap}
            />

            <DGSkeleton
              width="76%"
              height={11}
              style={styles.mediumGap}
            />
          </View>
        </View>

        <View style={styles.featureCard}>
          <DGSkeleton
            variant="image"
            height={164}
            borderRadius={0}
          />

          <View style={styles.cardCopy}>
            <DGSkeleton
              width="84%"
              height={16}
            />

            <DGSkeleton
              width="38%"
              height={20}
              style={styles.smallGap}
            />

            <DGSkeleton
              width="68%"
              height={11}
              style={styles.mediumGap}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function DiscoverStatSkeleton() {
  return (
    <View style={styles.stat}>
      <DGSkeleton
        width={40}
        height={40}
        borderRadius={14}
      />

      <DGSkeleton
        width={54}
        height={22}
        style={styles.statValue}
      />

      <DGSkeleton
        width={64}
        height={10}
        style={styles.smallGap}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brandRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing.sm,
  },

  headerActions: {
    marginLeft: spacing.sm,
    flexDirection: 'row',
  },

  actionGap: {
    marginLeft: spacing.xs,
  },

  location: {
    marginTop: spacing.md,
  },

  heroCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing.md,
  },

  heroLine: {
    marginTop: spacing.lg,
  },

  mediumGap: {
    marginTop: spacing.sm,
  },

  smallGap: {
    marginTop: 6,
  },

  divider: {
    height: 1,
    marginVertical: spacing.lg,
    backgroundColor: alpha.white08,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  stat: {
    width: '30%',
    alignItems: 'center',
  },

  statValue: {
    marginTop: spacing.sm,
  },

  heroButton: {
    marginTop: spacing.lg,
  },

  searchRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionHeading: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionCopy: {
    width: '64%',
  },

  horizontalCards: {
    marginTop: spacing.md,
    flexDirection: 'row',
  },

  featureCard: {
    width: '76%',
    marginRight: spacing.md,
    overflow: 'hidden',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
  },

  cardCopy: {
    padding: spacing.md,
  },
});