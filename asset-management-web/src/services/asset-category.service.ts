import api from '../api/axios';
import type{ AssetCategory, CreateAssetCategoryPayload } from '../types/asset-category';

export const assetCategoryService = {
  // Mengambil seluruh daftar kategori aset
  getAll: async (): Promise<AssetCategory[]> => {
    // Laravel API Resource mengembalikan data di dalam objek 'data'
    const response = await api.get<{ data: AssetCategory[] }>('/asset-categories');
    return response.data.data;
  },

  // Menambahkan kategori aset baru
  create: async (payload: CreateAssetCategoryPayload): Promise<void> => {
    await api.post('/asset-categories', payload);
  },

  // Memperbarui kategori aset
  update: async (id: number, payload: Partial<CreateAssetCategoryPayload>): Promise<AssetCategory> => {
    const response = await api.put<{ data: AssetCategory }>(`/asset-categories/${id}`, payload);
    return response.data.data;
  },

  // Menghapus kategori aset (Soft delete)
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/asset-categories/${id}`);
    return response.data;
  }
};
