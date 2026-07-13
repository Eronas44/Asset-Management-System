import api from '../api/axios';
import type{ CreateUserPayload, PaginatedUserResponse } from '../types/user';

export const userService = {
  // Mengambil daftar pengguna dengan paginasi
  getAll: async (page = 1): Promise<PaginatedUserResponse> => {
    const response = await api.get<PaginatedUserResponse>('/users', { params: { page } });
    return response.data;
  },

  // Mendaftarkan akun pengguna baru
  create: async (payload: CreateUserPayload): Promise<void> => {
    await api.post('/users', payload);
  },

  // Mengubah peran (role) pengguna secara dinamis
  updateRole: async (id: number, role: string): Promise<void> => {
    await api.patch(`/users/${id}/role`, { role });
  }
};
