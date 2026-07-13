import { defineConfig } from 'vitest/config'; // Perbaikan: Import dari vitest/config
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
  server: {
    host: true, // Ini setelan --host yang Anda nyalakan tadi
    allowedHosts: ['eronas.me'] // <-- Tambahkan baris ini wajib!
  }
});
