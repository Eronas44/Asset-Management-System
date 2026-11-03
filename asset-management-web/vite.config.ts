import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['eronas.me'],
    hmr: {
      host: 'localhost',
      port: 2000,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
});
