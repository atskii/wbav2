import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

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

const serveAnalyticsHtml = () => {
  return {
    name: 'serve-analytics-html',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/') {
          req.url = '/analytics.html';
        }
        next();
      });
    }
  };
};

export default defineConfig({
  plugins: [react(), localGeminiApiPlugin(), serveAnalyticsHtml()],
  server: {
    port: 5175,
    strictPort: true,
    open: false
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      input: 'analytics.html'
    }
  }
});
