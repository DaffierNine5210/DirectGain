import type {
  MarketListingCategory,
  MarketListingCondition,
} from '../../types/marketListing';

export const LISTING_FORM_MAX_TITLE = 120;
export const LISTING_FORM_MAX_DESCRIPTION = 4000;
export const LISTING_FORM_MAX_SUBCATEGORY = 80;
export const LISTING_FORM_MAX_SUBURB = 60;
export const LISTING_FORM_MAX_STATE = 40;
export const LISTING_FORM_MAX_PRICE = 9_999_999_999.99;

export type ListingFormErrors = {
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  condition?: string;
  price?: string;
  suburb?: string;
  state?: string;
  fulfilment?: string;
  form?: string;
};

export type ListingFormSnapshot = {
  title: string;
  description: string;
  category: MarketListingCategory | null;
  subcategory: string;
  condition: MarketListingCondition | null;
  priceText: string;
  suburb: string;
  state: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  allowsOffers: boolean;
};

export type ListingFormValues = {
  title: string;
  description: string;
  category: MarketListingCategory;
  subcategory: string;
  condition: MarketListingCondition;
  price: number;
  suburb: string;
  state: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  allowsOffers: boolean;
};

export function emptyListingFormSnapshot(): ListingFormSnapshot {
  return {
    title: '',
    description: '',
    category: null,
    subcategory: '',
    condition: null,
    priceText: '',
    suburb: '',
    state: '',
    pickupAvailable: true,
    deliveryAvailable: false,
    allowsOffers: true,
  };
}

export function listingFormSnapshotFromValues(
  listing: ListingFormValues,
): ListingFormSnapshot {
  return {
    title: listing.title,
    description: listing.description,
    category: listing.category,
    subcategory: listing.subcategory,
    condition: listing.condition,
    priceText: formatListingPriceText(listing.price),
    suburb: listing.suburb,
    state: listing.state,
    pickupAvailable: listing.pickupAvailable,
    deliveryAvailable: listing.deliveryAvailable,
    allowsOffers: listing.price > 0 && listing.allowsOffers,
  };
}

export function listingFormSnapshotsEqual(
  left: ListingFormSnapshot,
  right: ListingFormSnapshot,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function formatListingPriceText(price: number): string {
  return price.toFixed(2).replace(/\.00$/, '');
}

export function sanitizeListingPriceInput(value: string): string {
  const stripped = value.replace(/[$,\s]/g, '');
  const match = stripped.match(/^\d*(?:\.\d{0,2})?/);
  return match?.[0] ?? '';
}

export function parseListingPrice(
  value: string,
):
  | { ok: true; amount: number }
  | { ok: false; error: string } {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      ok: false,
      error: 'Enter a price.',
    };
  }

  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return {
      ok: false,
      error:
        'Enter a valid price with up to two decimal places.',
    };
  }

  const amount = Number(trimmed);

  if (!Number.isFinite(amount)) {
    return {
      ok: false,
      error:
        'Enter a valid price with up to two decimal places.',
    };
  }

  if (amount < 0) {
    return {
      ok: false,
      error: 'Price cannot be negative.',
    };
  }

  if (amount > LISTING_FORM_MAX_PRICE) {
    return {
      ok: false,
      error: 'That price is too large.',
    };
  }

  return {
    ok: true,
    amount: Number(amount.toFixed(2)),
  };
}

export function validateListingForm(
  snapshot: ListingFormSnapshot,
): ListingFormErrors | null {
  const next: ListingFormErrors = {};

  if (!snapshot.title.trim()) {
    next.title = 'Enter a title.';
  }

  if (!snapshot.description.trim()) {
    next.description = 'Enter a description.';
  }

  if (!snapshot.category) {
    next.category = 'Choose a category.';
  }

  if (!snapshot.subcategory.trim()) {
    next.subcategory = 'Enter the item type.';
  }

  if (!snapshot.condition) {
    next.condition = 'Choose a condition.';
  }

  const parsed = parseListingPrice(snapshot.priceText);

  if (!parsed.ok) {
    next.price = parsed.error;
  }

  if (!snapshot.suburb.trim()) {
    next.suburb = 'Enter a suburb.';
  }

  if (!snapshot.state.trim()) {
    next.state = 'Enter a state.';
  }

  if (!snapshot.pickupAvailable && !snapshot.deliveryAvailable) {
    next.fulfilment = 'Choose pickup, delivery, or both.';
  }

  return Object.keys(next).length > 0 ? next : null;
}
