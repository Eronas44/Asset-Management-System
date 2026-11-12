import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import api from '../api/axios';
import { setupAxiosMocks, mockDashboardStats } from './mocks';

describe('Integration Test — Halaman Dashboard Utama', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupAxiosMocks(api); // Suntikkan fungsi mock API sebelum setiap tes berjalan
  });

  it('harus memunculkan indikator loading state saat pertama kali memuat halaman', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText(/Memperbarui matriks statistik/i)).toBeInTheDocument();
  });

  it('harus sukses menampilkan data statistik dari mock API ke dalam kartu visual', async () => {
    renderWithProviders(<DashboardPage />);

    // Tunggu hingga loading state hilang dan data selesai dirender
    await waitFor(() => {
      expect(screen.queryByText(/Memperbarui matriks statistik/i)).not.toBeInTheDocument();
    });

    // Verifikasi nilai total aset dan unit tersedia tampil akurat di layar browser simulasi
    expect(screen.getByText(mockDashboardStats.total_assets.toString())).toBeInTheDocument();
    expect(screen.getByText(/Unit Tersedia/i)).toBeInTheDocument();
  });

  it('harus memunculkan komponen ErrorMessage jika salah satu request API gagal', async () => {
    // Paksa Axios get khusus statistik agar melempar error status 500
    vi.spyOn(api, 'get').mockImplementationOnce(() => 
      Promise.reject({ response: { data: { message: 'Server Database Down', trace_id: 'ERR-102' } } })
    );

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Kendala Pemrosesan Permintaan/i)).toBeInTheDocument();
      expect(screen.getByText(/Server Database Down/i)).toBeInTheDocument();
      expect(screen.getByText(/Trace ID Pelacakan: ERR-102/i)).toBeInTheDocument();
    });
  });
});
