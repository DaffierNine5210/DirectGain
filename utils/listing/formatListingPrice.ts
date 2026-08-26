export default function formatListingPrice(
  price: number,
  currency: string,
) {
  return new Intl.NumberFormat(
    'en-AU',
    {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    },
  ).format(price);
}