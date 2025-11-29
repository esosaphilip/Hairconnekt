export function formatMoneyCents(cents: number, currency: string = 'EUR') {
  if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(cents / 100);
  }
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function hhmm(time: string) {
  // Expect HH:mm:ss or HH:mm
  return time?.slice(0, 5) || '';
}