import type{ AssetCategory } from './asset-category';
import type{ AssetLocation } from './asset-location';

export type AssetType = 'single' | 'bulk';

export type AssetStatus =
  | 'available'
  | 'borrowed'
  | 'maintenance'
  | 'retired'
  | 'tersedia'
  | 'rusak'
  | 'sedang diperbaiki'
  | 'hilang'
  | 'dibuang'
  | 'habis'
  | 'kadaluarsa';

export interface Asset {
  id: number;
  uuid: string;
  asset_code: string;
  name: string;
  type?: AssetType;
  quantity?: number;
  purchase_date: string;
  purchase_price: number;
  useful_life_years: number;   // Tambahkan ini
  residual_value: number;      // Tambahkan ini
  annual_depreciation: number;  // Tambahkan ini (dari API)
  current_book_value: number;   // Tambahkan ini (dari API)
  public_url?: string;
  qr_code_url?: string;
  status: AssetStatus;
  notes: string | null;
  asset_category_id?: number;
  asset_location_id?: number;
  category?: AssetCategory;
  location?: AssetLocation;
  created_at: string;
  updated_at: string;
  borrowing_history?: any[];
  activity_logs?: any[];
}

export interface CreateAssetPayload {
  asset_code: string;
  name: string;
  type: AssetType;
  quantity: number;
  asset_category_id: number;
  asset_location_id: number;
  purchase_date: string;
  purchase_price: number;
  useful_life_years: number;   // Tambahkan ini
  residual_value: number;      // Tambahkan ini
  status: AssetStatus;
  notes?: string;
}
