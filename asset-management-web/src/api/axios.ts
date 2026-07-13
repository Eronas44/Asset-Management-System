import axios from 'axios';
import { getToken, removeToken } from '../utils/token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
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
          // Skenario 401: Sesi habis / tidak sah, hapus token dan tendang ke login
          removeToken();
          window.location.href = '/login';
          break;
        case 403:
          // Skenario 403: Akses ditolak, alihkan ke halaman forbidden
          window.location.href = '/forbidden';
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
