import api from '../api/axios';
import type { Asset, CreateAssetPayload } from '../types/asset';

// Buat interface untuk parameter filter sesuai petunjuk arsitektur
export interface AssetFilterParams {
  search?: string;
  status?: string;
  asset_category_id?: number | '';
  asset_location_id?: number | '';
  page?: number;
  per_page?: number;
}

// Buat interface untuk bungkus respons paginasi dari Laravel
export interface PaginatedAssetResponse {
  data: Asset[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const assetService = {
  // Mengambil daftar aset dengan query parameter filter & paginasi
  getAll: async (params?: AssetFilterParams): Promise<PaginatedAssetResponse> => {
    const response = await api.get<PaginatedAssetResponse>('/assets', { params });
    return response.data;
  },

  // Menambahkan entitas aset baru
  create: async (payload: CreateAssetPayload): Promise<void> => {
    await api.post('/assets', payload);
  },

  // Tambahkan fungsi baru ini ke dalam objek assetService di src/services/asset.service.ts

  // Ekspor laporan aset ke file CSV dengan filter yang aktif
  exportCsv: async (params?: AssetFilterParams): Promise<Blob> => {
    const response = await api.get('/reports/assets/export/csv', {
      params,
      responseType: 'blob' // Krusial untuk menangani file biner
    });
    return response.data;
  },

  // Ekspor laporan aset ke file PDF dengan filter yang aktif
  exportPdf: async (params?: AssetFilterParams): Promise<Blob> => {
    const response = await api.get('/reports/assets/export/pdf', {
      params,
      responseType: 'blob' // Krusial untuk menangani file biner
    });
    return response.data;
  },

  // Tambahkan fungsi baru ini ke dalam objek assetService di src/services/asset.service.ts

  // Mengambil detail lengkap satu aset berdasarkan ID numerik
  getById: async (id: number): Promise<{ data: Asset }> => {
    const response = await api.get<{ data: Asset }>(`/assets/${id}`);
    return response.data;
  },

  // Memperbarui aset yang sudah ada
  update: async (id: number, payload: Partial<CreateAssetPayload>): Promise<{ message: string; data: Asset }> => {
    const response = await api.put<{ message: string; data: Asset }>(`/assets/${id}`, payload);
    return response.data;
  },

  // Menghapus aset (Soft delete)
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/assets/${id}`);
    return response.data;
  }
};
