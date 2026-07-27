import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false
  },
  build: {
    // A02:2025 — Disable source maps in production to prevent source code exposure
    sourcemap: false,
    rollupOptions: {
      input: {
        main: 'index.html',
        analytics: 'analytics.html'
      }
    }
  },
});
