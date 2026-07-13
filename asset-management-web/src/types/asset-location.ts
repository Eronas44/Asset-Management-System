export interface AssetLocation {
  id: number;
  name: string;
  code: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetLocationPayload {
  name: string;
  code: string;
  description?: string;
}
