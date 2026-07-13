import api from '../api/axios';
import type{ AssetBorrowing, CreateAssetBorrowingPayload } from '../types/asset-borrowing';

export const assetBorrowingService = {
  // Mengambil seluruh daftar riwayat peminjaman
  getAll: async (): Promise<AssetBorrowing[]> => {
    const response = await api.get<{ data: AssetBorrowing[] }>('/asset-borrowings');
    return response.data.data;
  },

  // Membuat transaksi peminjaman baru
  create: async (payload: CreateAssetBorrowingPayload): Promise<void> => {
    await api.post('/asset-borrowings', payload);
  },

  markAsReturned: async (id: number): Promise<void> => {
    await api.patch(`/asset-borrowings/${id}/return`);
  }
};
