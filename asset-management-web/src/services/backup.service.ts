import api from '../api/axios';
import type{ BackupFile } from '../types/backup';

export const backupService = {
  // Mengambil seluruh daftar file backup yang tersedia
  getAll: async (): Promise<{ data: BackupFile[] }> => {
    const response = await api.get<{ data: BackupFile[] }>('/backups');
    return response.data;
  },

  // Memicu pembuatan file backup database baru di server
  create: async (): Promise<void> => {
    await api.post('/backups');
  },

  // Mengunduh file SQL backup database berbasis Blob biner
  download: async (filename: string): Promise<Blob> => {
    const response = await api.get(`/backups/${filename}/download`, {
      responseType: 'blob', // Menginstruksikan Axios memproses response sebagai file mentah
    });
    return response.data;
  },

  // Memulihkan (Restore) database berdasarkan nama file pilihan
  restore: async (filename: string): Promise<void> => {
    await api.post(`/backups/${filename}/restore`);
  }
};
