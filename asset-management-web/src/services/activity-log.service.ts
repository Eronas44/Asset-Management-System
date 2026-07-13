import api from '../api/axios';
import type{ ActivityLogFilterParams, PaginatedActivityLogResponse } from '../types/activity-log';

export const activityLogService = {
  // Mengambil daftar log riwayat aktivitas dengan filter & paginasi
  getAll: async (params?: ActivityLogFilterParams): Promise<PaginatedActivityLogResponse> => {
    const response = await api.get<PaginatedActivityLogResponse>('/activity-logs', { params });
    return response.data;
  }
};
