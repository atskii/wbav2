import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // A02:2025 — Disable source maps in production to prevent source code exposure
    sourcemap: false,
  },
});
