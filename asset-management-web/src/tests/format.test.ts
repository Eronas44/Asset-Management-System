import { describe, it, expect } from 'vitest';
import { formatRupiah } from '../utils/format';

describe('Utility formatRupiah()', () => {
  it('harus memformat angka menjadi string mata uang Rupiah yang valid', () => {
    expect(formatRupiah(1000000)).toContain('Rp');
    expect(formatRupiah(1000000)).toContain('1.000.000');
  });

  it('harus mengembalikan tanda strip jika nilai yang dimasukkan kosong atau null', () => {
    expect(formatRupiah(null)).toBe('-');
    expect(formatRupiah(undefined)).toBe('-');
  });
});
