export default function formatListingPrice(
  price: number,
  currency: string,
) {
  if (!Number.isFinite(price) || price < 0) {
    return 'Price unavailable';
  }

  if (price === 0) {
    return 'FREE';
  }

  return new Intl.NumberFormat(
    'en-AU',
    {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    },
  ).format(price);
}
