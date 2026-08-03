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

export type DGListingSkeletonLayout =
  | 'grid'
  | 'list';

type DGListingSkeletonProps = {
  layout?: DGListingSkeletonLayout;
};

export default function DGListingSkeleton({
  layout = 'grid',
}: DGListingSkeletonProps) {
  if (layout === 'list') {
    return <ListSkeleton />;
  }

  return <GridSkeleton />;
}

function GridSkeleton() {
  return (
    <View style={styles.gridCard}>
      <DGSkeleton
        variant="image"
        height={238}
        borderRadius={0}
      />

      <View style={styles.gridOverlay}>
        <DGSkeleton
          width="46%"
          height={22}
        />

        <DGSkeleton
          width="88%"
          height={13}
          style={styles.gridTitleLine}
        />

        <DGSkeleton
          width="68%"
          height={13}
          style={styles.gridTitleSecondLine}
        />

        <View style={styles.gridFooter}>
          <DGSkeleton
            width="42%"
            height={10}
          />

          <DGSkeleton
            width={42}
            height={20}
          />
        </View>
      </View>
    </View>
  );
}

function ListSkeleton() {
  return (
    <View style={styles.listCard}>
      <DGSkeleton
        variant="image"
        width={126}
        height={182}
        borderRadius={radius.lg}
      />

      <View style={styles.listContent}>
        <DGSkeleton
          width="42%"
          height={23}
        />

        <DGSkeleton
          width="94%"
          height={14}
          style={styles.listTitleLine}
        />

        <DGSkeleton
          width="72%"
          height={14}
          style={styles.listTitleSecondLine}
        />

        <View style={styles.metadataGroup}>
          <DGSkeleton
            width="82%"
            height={10}
          />

          <DGSkeleton
            width="54%"
            height={10}
            style={styles.metadataSecondLine}
          />
        </View>

        <View style={styles.sellerRow}>
          <DGSkeleton
            variant="circle"
            width={34}
            height={34}
          />

          <View style={styles.sellerCopy}>
            <DGSkeleton
              width="64%"
              height={11}
            />

            <DGSkeleton
              width="42%"
              height={9}
              style={styles.sellerSecondLine}
            />
          </View>

          <DGSkeleton
            width={44}
            height={28}
          />
        </View>

        <View style={styles.actions}>
          <DGSkeleton
            width="48%"
            height={36}
            borderRadius={radius.sm}
          />

          <DGSkeleton
            width="48%"
            height={36}
            borderRadius={radius.sm}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridCard: {
    position: 'relative',
    width: '100%',
    minHeight: 238,

    overflow: 'hidden',

    borderRadius: radius.lg,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardRaised,
  },

  gridOverlay: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    left: spacing.sm,
  },

  gridTitleLine: {
    marginTop: spacing.xs,
  },

  gridTitleSecondLine: {
    marginTop: 5,
  },

  gridFooter: {
    marginTop: spacing.sm,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  listCard: {
    width: '100%',

    padding: spacing.sm,

    borderRadius: radius.card,

    borderWidth: 1,
    borderColor: alpha.white08,

    backgroundColor:
      surface.cardRaised,

    flexDirection: 'row',

    overflow: 'hidden',
  },

  listContent: {
    flex: 1,
    minWidth: 0,

    paddingLeft: spacing.md,
  },

  listTitleLine: {
    marginTop: spacing.sm,
  },

  listTitleSecondLine: {
    marginTop: 6,
  },

  metadataGroup: {
    marginTop: spacing.md,
  },

  metadataSecondLine: {
    marginTop: 7,
  },

  sellerRow: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,

    borderTopWidth: 1,
    borderTopColor: alpha.white08,

    flexDirection: 'row',
    alignItems: 'center',
  },

  sellerCopy: {
    flex: 1,
    minWidth: 0,

    marginHorizontal: spacing.sm,
  },

  sellerSecondLine: {
    marginTop: 6,
  },

  actions: {
    marginTop: spacing.sm,

    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});