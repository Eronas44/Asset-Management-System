export interface ActivityLog {
  id: number;
  action: string;
  description: string;
  properties: any | null;
  operator: string;
  created_at: string;
}

export interface ActivityLogFilterParams {
  action?: string;
  user_id?: number | '';
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface PaginatedActivityLogResponse {
  data: ActivityLog[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
