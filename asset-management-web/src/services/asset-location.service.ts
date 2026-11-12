import api from '../api/axios';
import type{ AssetLocation, CreateAssetLocationPayload } from '../types/asset-location';

export const assetLocationService = {
  // Mengambil seluruh daftar lokasi aset
  getAll: async (): Promise<AssetLocation[]> => {
    const response = await api.get<{ data: AssetLocation[] }>('/asset-locations');
    return response.data.data;
  },

  // Menambahkan lokasi aset baru
  create: async (payload: CreateAssetLocationPayload): Promise<void> => {
    await api.post('/asset-locations', payload);
  },

  // Memperbarui lokasi aset
  update: async (id: number, payload: Partial<CreateAssetLocationPayload>): Promise<AssetLocation> => {
    const response = await api.put<{ data: AssetLocation }>(`/asset-locations/${id}`, payload);
    return response.data.data;
  },

  // Menghapus lokasi aset (Soft delete)
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/asset-locations/${id}`);
    return response.data;
  }
};
