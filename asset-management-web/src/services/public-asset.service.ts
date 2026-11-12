import api from '../api/axios';

export interface PublicAssetData {
  asset_code: string;
  name: string;
  category: string;
  location: string;
  status: string;
}

export const publicAssetService = {
  // Mengambil informasi ringkas aset berdasarkan UUID secara publik
  getByUuid: async (uuid: string): Promise<PublicAssetData> => {
    const response = await api.get<PublicAssetData>(`/public/assets/${uuid}`);
    return response.data;
  }
};
