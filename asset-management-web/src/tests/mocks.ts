import { vi } from 'vitest';

// Mock data statistik untuk halaman dashboard
export const mockDashboardStats = {
  total_assets: 10,
  available_assets: 7,
  borrowed_assets: 3,
  maintenance_assets: 0,
  retired_assets: 0,
  active_borrowings: 3,
  total_book_value: 150000000
};

// Mock data notifikasi keterlambatan
export const mockDashboardAlerts = {
  overdue_borrowings: 0,
  overdue_assets: []
};

// Fungsi pembantu untuk menyuntikkan mock ke Axios Instance terpusat
export const setupAxiosMocks = (apiInstance: any) => {
  vi.spyOn(apiInstance, 'get').mockImplementation((url: any) => {
    if (url === '/dashboard/stats') {
      return Promise.resolve({ data: mockDashboardStats });
    }
    if (url === '/dashboard/alerts') {
      return Promise.resolve({ data: mockDashboardAlerts });
    }
    return Promise.reject(new Error('URL tidak di-mock'));
  });
};
