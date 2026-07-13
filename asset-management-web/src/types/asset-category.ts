export interface AssetCategory {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetCategoryPayload {
  name: string;
  description?: string;
}
