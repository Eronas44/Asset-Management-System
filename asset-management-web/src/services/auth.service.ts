import api from '../api/axios';
import type{ AuthResponse, UserProfileResponse, LoginCredentials } from '../types/auth';
import { setToken, removeToken } from '../utils/token';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<{ message: string; data: AuthResponse }>('/login', credentials);
    const authData = response.data.data;
    if (authData && authData.token) {
      setToken(authData.token);
    }
    return authData;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.warn('Gagal mencabut sesi token di server:', err);
    } finally {
      removeToken();
      window.location.href = '/login';
    }
  },

  // Perbarui tipe data respons agar mengembalikan data profil, role, dan permission lengkap
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await api.get<UserProfileResponse>('/me');
    return response.data;
  }
};
