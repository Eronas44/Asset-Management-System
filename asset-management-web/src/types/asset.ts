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

export interface AssetBorrowingHistoryItem {
  id: number;
  borrower_name: string;
  borrowed_by_user_name?: string | null;
  borrowed_at: string;
  expected_return_at: string;
  returned_at: string | null;
  is_returned: boolean;
  notes: string | null;
}

export interface AssetActivityLogItem {
  id: number;
  action: string;
  description: string;
  operator: string;
  created_at: string;
}

export interface Asset {
  id: number;
  uuid: string;
  asset_code: string;
  name: string;
  type?: AssetType;
  quantity?: number;
  purchase_date: string;
  purchase_price: number;
  useful_life_years: number;   // Parameter Depresiasi
  residual_value: number;      // Nilai Residu
  annual_depreciation: number;  // Depresiasi Tahunan (dari API)
  current_book_value: number;   // Nilai Buku Terkini (dari API)
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
  borrowing_history?: AssetBorrowingHistoryItem[];
  activity_logs?: AssetActivityLogItem[];
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
