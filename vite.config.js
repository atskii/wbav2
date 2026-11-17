import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const localGeminiApiPlugin = () => ({
  name: 'local-gemini-api',
  configureServer(server) {
    server.middlewares.use('/api/gemini', async (req, res) => {
      if (req.method === 'POST' && !req.body) {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString('utf8');
        try {
          req.body = raw ? JSON.parse(raw) : {};
        } catch {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid JSON body' }));
          return;
        }
      }
      if (!res.status) {
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
      }
      if (!res.json) {
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };
      }
      const { default: handler } = await import('./api/gemini.js');
      return handler(req, res);
    });
  }
});

try {
  const uploadedPath = 'C:/Users/aleki/.gemini/antigravity/brain/e3448b0d-6e06-48f6-8c14-5c57b09972a9/media__1785190931893.png';
  if (fs.existsSync(uploadedPath)) {
    fs.copyFileSync(uploadedPath, path.resolve(__dirname, 'public/icons/flame.png'));
  }
} catch (e) {}

export default defineConfig({
  plugins: [react(), localGeminiApiPlugin()],
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
