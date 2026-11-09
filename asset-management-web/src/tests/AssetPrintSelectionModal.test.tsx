import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { AssetPrintSelectionModal } from '../components/Labels/AssetPrintSelectionModal';
import { assetService } from '../services/asset.service';
import type { Asset } from '../types/asset';

const mockAssets: Asset[] = [
  {
    id: 101,
    uuid: 'aaaa-1111',
    asset_code: 'AST-TEST-001',
    name: 'MacBook Pro M2 Max',
    notes: null,
    annual_depreciation: 5000000,
    current_book_value: 25000000,
    asset_category_id: 1,
    asset_location_id: 1,
    status: 'tersedia',
    purchase_date: '2026-01-01',
    purchase_price: 30000000,
    residual_value: 5000000,
    useful_life_years: 5,
    category: { id: 1, name: 'Elektronik & IT', description: '', created_at: '', updated_at: '' },
    location: { id: 1, name: 'Ruang Server', code: 'LOC-01', description: '', created_at: '', updated_at: '' },
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 102,
    uuid: 'bbbb-2222',
    asset_code: 'AST-TEST-002',
    name: 'Kursi Kerja Ergonomis Herman Miller',
    notes: null,
    annual_depreciation: 1500000,
    current_book_value: 12000000,
    asset_category_id: 2,
    asset_location_id: 2,
    status: 'tersedia',
    purchase_date: '2026-02-01',
    purchase_price: 15000000,
    residual_value: 3000000,
    useful_life_years: 8,
    category: { id: 2, name: 'Perabot Kantor', description: '', created_at: '', updated_at: '' },
    location: { id: 2, name: 'Ruang Rapat', code: 'LOC-02', description: '', created_at: '', updated_at: '' },
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
  }
];

describe('AssetPrintSelectionModal Unit Test', () => {
  beforeEach(() => {
    vi.spyOn(assetService, 'getAll').mockResolvedValue({
      data: mockAssets,
      meta: { current_page: 1, last_page: 1, per_page: 50, total: 2 }
    });
  });

  it('tidak merender apapun ketika isOpen bernilai false', () => {
    const handleClose = vi.fn();
    const handleProceed = vi.fn();

    renderWithProviders(
      <AssetPrintSelectionModal
        isOpen={false}
        onClose={handleClose}
        onProceedToPrint={handleProceed}
        initialAssets={mockAssets}
      />
    );

    expect(screen.queryByText(/Pilih Aset untuk Cetak Label QR/i)).not.toBeInTheDocument();
  });

  it('merender modal dengan benar dan menampilkan daftar aset awal', async () => {
    const handleClose = vi.fn();
    const handleProceed = vi.fn();

    renderWithProviders(
      <AssetPrintSelectionModal
        isOpen={true}
        onClose={handleClose}
        onProceedToPrint={handleProceed}
        initialAssets={mockAssets}
      />
    );

    expect(screen.getByText(/Pilih Aset untuk Cetak Label QR/i)).toBeInTheDocument();
    expect(await screen.findByText('MacBook Pro M2 Max')).toBeInTheDocument();
    expect(screen.getByText('AST-TEST-001')).toBeInTheDocument();
    expect(screen.getByText('Kursi Kerja Ergonomis Herman Miller')).toBeInTheDocument();
  });

  it('dapat memilih aset dan memanggil onProceedToPrint saat tombol cetak ditekan', async () => {
    const handleClose = vi.fn();
    const handleProceed = vi.fn();

    renderWithProviders(
      <AssetPrintSelectionModal
        isOpen={true}
        onClose={handleClose}
        onProceedToPrint={handleProceed}
        initialAssets={mockAssets}
      />
    );

    // Tunggu render data aset
    const macbookRow = await screen.findByText('MacBook Pro M2 Max');
    fireEvent.click(macbookRow);

    // Verifikasi counter terupdate menjadi 1 Terpilih
    await waitFor(() => {
      expect(screen.getAllByText(/1 Terpilih/i).length).toBeGreaterThan(0);
    });

    // Klik tombol Cetak Label QR (1)
    const proceedBtn = screen.getByRole('button', { name: /Cetak Label QR \(1\)/i });
    expect(proceedBtn).not.toBeDisabled();
    fireEvent.click(proceedBtn);

    expect(handleProceed).toHaveBeenCalledTimes(1);
    expect(handleProceed).toHaveBeenCalledWith([expect.objectContaining({ id: 101, asset_code: 'AST-TEST-001' })]);
  });
});
