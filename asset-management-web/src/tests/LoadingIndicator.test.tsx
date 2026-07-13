import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingIndicator } from '../components/Feedback/LoadingIndicator';

describe('Komponen <LoadingIndicator />', () => {
  it('harus merender teks indikator pemuatan bawaan secara benar', () => {
    render(<LoadingIndicator />);
    const element = screen.getByText(/Memuat data dari server.../i);
    expect(element).toBeInTheDocument();
  });

  it('harus mampu menampilkan teks kustom yang dikirim melalui props', () => {
    render(<LoadingIndicator message="Sedang memproses laporan keuangan..." />);
    const element = screen.getByText(/Sedang memproses laporan keuangan.../i);
    expect(element).toBeInTheDocument();
  });
});
