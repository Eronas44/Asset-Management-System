import type{ AssetBorrowing } from './asset-borrowing';

export interface DashboardStats {
  total_assets: number;
  available_assets: number;
  borrowed_assets: number;
  maintenance_assets: number;
  retired_assets: number;
  active_borrowings: number;
  total_book_value: number;
}

export interface DashboardAlerts {
  overdue_borrowings: number;
  overdue_assets: AssetBorrowing[];
}
