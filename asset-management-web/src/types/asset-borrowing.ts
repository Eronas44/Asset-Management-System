import type{ Asset } from './asset';

export interface AssetBorrowing {
  id: number;
  borrower_name: string;
  borrowed_by_user_name?: string | null;
  borrowed_at: string;
  expected_return_at: string;
  returned_at: string | null;
  overdue_days?: number;
  notes: string | null;
  asset?: Asset;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetBorrowingPayload {
  asset_id: number;
  borrower_name: string;
  borrowed_at: string;
  expected_return_at: string;
  notes?: string;
}
