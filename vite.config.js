import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

try {
  const uploadedPath = 'C:/Users/aleki/.gemini/antigravity/brain/e3448b0d-6e06-48f6-8c14-5c57b09972a9/media__1785190931893.png';
  if (fs.existsSync(uploadedPath)) {
    fs.copyFileSync(uploadedPath, path.resolve(__dirname, 'public/icons/flame.png'));
  }
} catch (e) {}

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
