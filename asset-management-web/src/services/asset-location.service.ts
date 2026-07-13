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
  }
};
