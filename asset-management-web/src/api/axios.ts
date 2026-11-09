import axios from 'axios';
import { getToken, removeToken } from '../utils/token';

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    // Jika diakses dari HP atau device jaringan lokal via IP (bukan localhost/127.0.0.1)
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${window.location.protocol}//${hostname}:2020/api`;
    }
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:2020/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor Global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    const traceId = response?.data?.trace_id || 'N/A';

    if (response) {
      switch (response.status) {
        case 401:
          // Skenario 401: Sesi habis / tidak sah, hapus token dan tendang ke login jika tidak sedang di halaman login
          removeToken();
          if (typeof window !== 'undefined' && window.location && window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Skenario 403: Akses aksi ditolak, biarkan komponen menampilkan pesan error / toast tanpa merusak sesi halaman
          console.warn(`[403 Forbidden] Akses ditolak. Trace ID: ${traceId}`);
          break;
        case 404:
          console.warn(`[404 Not Found] Trace ID: ${traceId}`);
          break;
        case 422:
          console.warn(`[422 Validation Error] Trace ID: ${traceId}`, response.data.errors);
          break;
        case 500:
          console.error(`[500 Internal Server Error] Trace ID: ${traceId}`);
          break;
        default:
          console.error(`[API Error] Status: ${response.status}, Trace ID: ${traceId}`);
      }
    } else {
      console.error('[API Network Error] Gagal terhubung ke server.');
    }

    return Promise.reject(error);
  }
);

export default api;
