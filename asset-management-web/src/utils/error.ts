/**
 * Mengekstrak pesan kesalahan utama atau kesalahan validasi dari respons Axios API.
 */
export const extractErrorMessage = (error: any): { message: string; traceId?: string; validationErrors?: Record<string, string[]> } => {
  if (error?.response?.data) {
    const data = error.response.data;
    return {
      message: data.message || 'Terjadi kesalahan pada sistem.',
      traceId: data.trace_id,
      validationErrors: data.errors
    };
  }
  return { message: error.message || 'Gagal terhubung ke server. Periksa koneksi Anda.' };
};
