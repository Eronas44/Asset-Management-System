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
  }
};
