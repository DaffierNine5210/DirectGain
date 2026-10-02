const MAX_OFFER_AMOUNT = 9_999_999_999.99;

export const MARKET_OFFER_MESSAGE_MAX_LENGTH = 500;

export function parseMarketOfferAmount(
  value: string,
):
  | { ok: true; amount: number }
  | { ok: false } {
  const trimmed = value.trim();

  if (!trimmed) {
    return { ok: false };
  }

  if (/[eE+\-,]/.test(trimmed)) {
    return { ok: false };
  }

  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return { ok: false };
  }

  const amount = Number(trimmed);

  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_OFFER_AMOUNT) {
    return { ok: false };
  }

  return { ok: true, amount };
}

export function formatMarketOfferAmount(
  amount: number,
  currency: 'AUD' = 'AUD',
): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function normaliseMarketOfferMessage(
  value: string,
):
  | { ok: true; message: string | null }
  | { ok: false } {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { ok: true, message: null };
  }

  if (trimmed.length > MARKET_OFFER_MESSAGE_MAX_LENGTH) {
    return { ok: false };
  }

  return { ok: true, message: trimmed };
}
