import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { BatchQrPrintModal } from '../components/Labels/BatchQrPrintModal';
import type { Asset } from '../types/asset';

const mockAssets: Asset[] = [
  {
    id: 1,
    uuid: '11111111-1111-1111-1111-111111111111',
    asset_code: 'AST-2026-0001',
    name: 'Laptop ThinkPad X1 Carbon Gen 11',
    notes: null,
    annual_depreciation: 4000000,
    current_book_value: 21000000,
    asset_category_id: 1,
    asset_location_id: 1,
    status: 'tersedia',
    purchase_date: '2026-01-15',
    purchase_price: 25000000,
    residual_value: 5000000,
    useful_life_years: 5,
    category: { id: 1, name: 'Elektronik & IT', description: '', created_at: '', updated_at: '' },
    location: { id: 1, name: 'Ruang Server Lantai 2', code: 'LOC-01', description: '', created_at: '', updated_at: '' },
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 2,
    uuid: '22222222-2222-2222-2222-222222222222',
    asset_code: 'AST-2026-0002',
    name: 'Monitor Dell UltraSharp 27 Inch 4K',
    notes: null,
    annual_depreciation: 2125000,
    current_book_value: 7375000,
    asset_category_id: 1,
    asset_location_id: 1,
    status: 'tersedia',
    purchase_date: '2026-02-10',
    purchase_price: 9500000,
    residual_value: 1000000,
    useful_life_years: 4,
    category: { id: 1, name: 'Elektronik & IT', description: '', created_at: '', updated_at: '' },
    location: { id: 1, name: 'Ruang Server Lantai 2', code: 'LOC-01', description: '', created_at: '', updated_at: '' },
    created_at: '2026-02-10T00:00:00Z',
    updated_at: '2026-02-10T00:00:00Z',
  }
];

describe('BatchQrPrintModal Unit Test', () => {
  it('harus merender modal dan menampilkan data aset serta tombol unduh PDF web', () => {
    const handleClose = vi.fn();

    renderWithProviders(
      <BatchQrPrintModal
        isOpen={true}
        onClose={handleClose}
        selectedAssets={mockAssets}
      />
    );

    // Verifikasi judul dan indikator pemrosesan web
    expect(screen.getByText(/Cetak & Unduh Label QR Aset Fisik/i)).toBeInTheDocument();
    expect(screen.getByText(/Diproses Langsung dari Web/i)).toBeInTheDocument();

    // Verifikasi tombol unduh PDF dan cetak
    expect(screen.getAllByText(/Unduh PDF Siap Cetak \(A4\)/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Cetak ke Printer/i)).toBeInTheDocument();
    expect(screen.getByText(/Preview PDF/i)).toBeInTheDocument();

    // Verifikasi data aset tampil pada lembar stiker
    expect(screen.getByText('AST-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('Laptop ThinkPad X1 Carbon Gen 11')).toBeInTheDocument();
    expect(screen.getByText('AST-2026-0002')).toBeInTheDocument();
  });

  it('dapat mengubah mode tata letak stiker (2 Kolom dan 3 Kolom)', () => {
    const handleClose = vi.fn();

    renderWithProviders(
      <BatchQrPrintModal
        isOpen={true}
        onClose={handleClose}
        selectedAssets={mockAssets}
      />
    );

    const btn3Col = screen.getByText(/3 Kolom \(18\/Hal\)/i);
    fireEvent.click(btn3Col);

    // Mode 3 kolom aktif
    expect(btn3Col).toHaveClass('bg-indigo-600');
  });

  it('tidak merender apapun ketika isOpen bernilai false', () => {
    const handleClose = vi.fn();

    renderWithProviders(
      <BatchQrPrintModal
        isOpen={false}
        onClose={handleClose}
        selectedAssets={mockAssets}
      />
    );

    expect(screen.queryByText(/Cetak & Unduh Label QR Aset Fisik/i)).not.toBeInTheDocument();
  });

  it('otomatis merender lembar kedua jika jumlah aset melebihi kapasitas stiker 1 kertas', () => {
    const handleClose = vi.fn();
    // Buat 12 aset dummy untuk melebihi kapasitas 10 stiker per lembar (mode 2-kolom)
    const twelveAssets: Asset[] = Array.from({ length: 12 }, (_, i) => ({
      ...mockAssets[0],
      id: i + 1,
      asset_code: `AST-MULTI-${i + 1}`,
      name: `Aset Multi Lembar ${i + 1}`
    }));

    renderWithProviders(
      <BatchQrPrintModal
        isOpen={true}
        onClose={handleClose}
        selectedAssets={twelveAssets}
      />
    );

    // Verifikasi kedua lembar kertas A4 otomatis muncul di layar secara bersamaan
    expect(screen.getByText(/LEMBAR KE-1 DARI 2/i)).toBeInTheDocument();
    expect(screen.getByText(/LEMBAR KE-2 DARI 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Otomatis 2 Lembar Kertas A4/i)).toBeInTheDocument();
  });
});
