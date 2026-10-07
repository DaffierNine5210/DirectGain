import type { MarketListingStatus } from '../../types/marketListing';

import {
  alpha,
  palette,
  textColor,
} from '../../theme/designSystem';

export type OwnListingStatusTone = {
  color: string;
  backgroundColor: string;
  borderColor: string;
};

export function ownListingStatusTone(
  status: MarketListingStatus,
): OwnListingStatusTone {
  if (status === 'active') {
    return {
      color: palette.opportunityGreen,
      backgroundColor: alpha.green08,
      borderColor: alpha.green20,
    };
  }

  if (status === 'paused') {
    return {
      color: textColor.muted,
      backgroundColor: alpha.white05,
      borderColor: alpha.white10,
    };
  }

  if (status === 'sold') {
    return {
      color: textColor.danger,
      backgroundColor: alpha.danger08,
      borderColor: alpha.danger20,
    };
  }

  if (status === 'reserved') {
    return {
      color: palette.warning,
      backgroundColor: alpha.white05,
      borderColor: alpha.white10,
    };
  }

  if (status === 'removed') {
    return {
      color: textColor.muted,
      backgroundColor: alpha.white03,
      borderColor: alpha.white08,
    };
  }

  return {
    color: textColor.secondary,
    backgroundColor: alpha.white04,
    borderColor: alpha.white08,
  };
}
