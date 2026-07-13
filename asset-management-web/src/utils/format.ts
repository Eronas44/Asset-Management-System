/**
 * Format angka menjadi representasi mata uang Rupiah (IDR)
 */
export const formatRupiah = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};
