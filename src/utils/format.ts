export function formatCurrencyIDR(n: number): string {
  return `Rp${n.toLocaleString('id-ID')}`;
}

export function km(n?: number): string {
  if (typeof n === 'number') {
    return `${n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
  }
  return '';
}
