import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import GuidePage from '../pages/Guide/GuidePage';

// Mock scrollTo
window.scrollTo = vi.fn();

describe('Halaman Panduan Program (<GuidePage />) - Deteksi Otomatis', () => {
  it('harus merender tombol kembali ke dashboard dan judul panduan', () => {
    renderWithProviders(<GuidePage />);

    expect(screen.getByText(/Kembali ke Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Buku Panduan Operasional Program/i)).toBeInTheDocument();
  });

  it('harus mendeteksi peran otomatis dan TIDAK merender tombol pilihan peran manual', () => {
    renderWithProviders(<GuidePage />);

    // Memastikan tidak ada tombol tab pilih peran manual
    expect(screen.queryByRole('button', { name: /^Super User$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Admin$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^User \/ Staff$/i })).not.toBeInTheDocument();

    // Memastikan ada indikator teks peran terdeteksi otomatis
    expect(screen.getByText(/Panduan Peran Anda:/i)).toBeInTheDocument();
    expect(screen.getByText(/Otorisasi Aktif/i)).toBeInTheDocument();
  });

  it('harus menampilkan panduan yang relevan sesuai peran yang terdeteksi', () => {
    renderWithProviders(<GuidePage />);

    // Pada mock default (staff), panduan peminjaman atau pengenalan aset muncul
    expect(screen.getAllByText(/Pengenalan Sistem & Struktur Hak Akses/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/USER \/ STAFF/i).length).toBeGreaterThan(0);
  });

  it('harus dapat memfilter topik saat kata kunci dicari', () => {
    renderWithProviders(<GuidePage />);

    const searchInput = screen.getByPlaceholderText(/Cari kata kunci panduan.../i);
    fireEvent.change(searchInput, { target: { value: 'peminjaman' } });

    expect(screen.getAllByText(/Peminjaman/i).length).toBeGreaterThan(0);
  });
});
