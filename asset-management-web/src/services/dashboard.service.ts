import api from '../api/axios';
import type{ DashboardStats , DashboardAlerts } from '../types/dashboard';

export const dashboardService = {
  // Mengambil ringkasan data statistik dashboard
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  getAlerts: async (): Promise<DashboardAlerts> => {
    const response = await api.get<DashboardAlerts>('/dashboard/alerts');
    return response.data;
  }
};
